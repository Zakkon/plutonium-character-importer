import Charactermancer_Util from './test_util.js'
import {Config} from './veTools/config.js'
import Vetools from './veTools/vetools.js'
import UtilDataSource from './veTools/utilDataSource.js'
import { DataConverterClassSubclassFeature, SideDataInterfaces } from './veTools/dataloader.js'
import { PageFilterClassesFoundry } from './veTools/pagefilters.js'
import ImportListClass from './veTools/importlist.js'
import { Charactermancer_Class_Util, Charactermancer_Feature_Util } from './mancer/charactermancer.js'
const NAME = "dnd5e-zakkons-helpers";

//Runs on foundry init
Hooks.on('init', function () {

  console.log("INIT OF STUFF PLUT");
  handleInit().then(() => handleReady()); //.then(() => SourceManager._pOpen({actor:null})));

  
});
async function handleInit(){
  //UtilGameSettings.prePreInit();
  //Vetools.doMonkeyPatchPreConfig();
  Config.prePreInit(); //Important
  Vetools.doMonkeyPatchPostConfig(); //Makes roll buttons work

  //We need this to be true, since BrewUtil freaks out otherwise and tries to grab json from a url that is 404
  Object.defineProperty(globalThis, "IS_DEPLOYED", {
    get() { return true; },
    set(val) {},
  });
  console.log('Plutonium Character Builder is initialized.');
}
async function handleReady(){
  await Config.pInit(); //Important
  await Vetools.pDoPreload(); //Important
  SideDataInterfaces.init(); //Important
  console.log('Plutonium Character Builder is ready.');
}
async function getActorHeaderButtons(sheet, buttons) {

  if (!sheet.object.canUserModify(game.user)) return;

  console.log("UTIL", Charactermancer_Util);

  // Push a new button to the front of the list
  buttons.unshift({
      class: "configure-intelligent-npc",
      icon: "fas fa-person",
      onclick: async(event) => {
        let importer = new CharacterImporter(sheet.actor, true, false, true);
        await importer.init();
        await importer.loadSources();
        //await importer.createData();
        importer.createState();
        importer.startImport();
      },
      label: "Import"
  });
}

class CharacterImporter{
  myActor;
  doAbilities;
  doRace;
  doClass;
  _state;
  _data;
  _isLevelUp;
  _conInitialWithModifiers;
  _conFinalWithModifiers
  static AppTaskRunner;
  static TaskClosure;
  static Charactermancer_Class_ProficiencyImportModeSelect;
  static Charactermancer_FeatureOptionsSelect;
  static Charactermancer_Class_Util;
  static DataUtil;
  static api;

  /**
   * @param {any} actor
   * @param {boolean} doAbilities
   * @param {boolean} doRace
   * @param {boolean} doClass
   */
  constructor(actor, doAbilities, doRace, doClass){
    this._actor = actor;
    this.doAbilities = doAbilities;
    this.doRace = doRace;
    this.doClass = doClass;
    this._isLevelUp = false;
  }

  
  /**
   * Initialize the importer
   */
  async init(){
    let pl = await game.modules.get("plutonium");
    if(!pl){console.error("Could not find Plutonium"); return;}
    console.log("PLUTONIUM:", pl);
    CharacterImporter.api = pl.api;
  }
  async loadSources(){
    //How do we load sources?
    this._data = await SourceManager._pOpen(this._actor);
  }
  async createData(){
    let data = {class: [], subclass:[], classFeature:[], subclassFeature:[]};
    //json files were here
    let jsons = [];
    for(let str of jsons){
        let parsed = JSON.parse(str);
        data.class = data.class.concat(parsed.class);
        data.subclass = data.subclass.concat(parsed.subclass);
        data.classFeature = data.classFeature.concat(parsed.classFeature);
        data.subclassFeature = data.subclassFeature.concat(parsed.subclassFeature);
    }
    this._data = data;
    console.log("Data fetched");
    console.log(this._data);

    //Prep class feature info
    const isIgnoredLookup = {
      "elemental disciplines|monk||four elements||3":true,
      "fighting style|bard||swords|xge|3":true,
      "infusions known|artificer|tce|2":true,
      "maneuver options|fighter||battle master||3|tce":true,
      "maneuvers|fighter||battle master||3":true
    };
    const opts = {actor: this._actor, isIgnoredLookup: isIgnoredLookup};
    for(let j = 0; j < this._data.class.length; ++j)
    {
      let cls = this._data.class[j];
      //Make sure the classFeatures aren't just strings, look like this:
      //{classFeature: "string"}
      for(let i = 0; i < cls.classFeatures.length; ++i){
        let f = cls.classFeatures[i];
        if (typeof f !== "object") {cls.classFeatures[i] = {classFeature: f};}
      }

      //Now we need to flesh out some more data about the class features, using just the UID we can get a lot of such info.
      await (cls.classFeatures || []).pSerialAwaitMap(cf =>
        CharacterImporter.api.util.apps.PageFilterClassesRaw.pInitClassFeatureLoadeds({...opts, classFeature: cf, className: cls.name}));

      if (cls.classFeatures) {cls.classFeatures = cls.classFeatures.filter(it => !it.isIgnored);}
      this._data.class[j] = cls;

      /* for (const sc of cls.subclasses || []) {
      await (sc.subclassFeatures || []).pSerialAwaitMap(scf => this.pInitSubclassFeatureLoadeds({...opts, subclassFeature: scf, className: cls.name, subclassName: sc.name}));

      if (sc.subclassFeatures) sc.subclassFeatures = sc.subclassFeatures.filter(it => !it.isIgnored);
    } */
    }
    console.log(this._data);
  }
  createState(){

    const importstring = "sorcerer|phb";
    const parts = importstring.toLowerCase().split("|");
    const className = parts[0], classSource = parts[1];
    const classMatch = this._data.class.filter(cls => cls.name.toLowerCase() == className && cls.source.toLowerCase() == classSource)[0];
    const classIx = this._data.class.indexOf(classMatch);

    //_state is the object which contains all the choices we have made during the character creation process
    this._state = {
      class_0_cntAsi: 0, //How many ability score improvements are we going past?
      class_0_curLevel:0, //starting level
      class_0_ixClass:classIx, //index of the class in the dropdown menu
      class_0_targetLevel:1, //target level of the class
      class_ixMax: 0, //count of how many classes we are using
      class_ixPrimaryClass:0, //index of the primary class (in relation to how many classes we have)
      class_pulseChange:true, //not sure
      class_totalLevels: 1, //how many level ups
    }

    /* this.json = JSON.parse(`{"character":{"race":null,"classes":[{"name":"Sorcerer","source":"PHB","hash":"sorcerer_phb","srd":true,"level":1,"isPrimary":true,"skillProficiencies":
    {"isFormComplete":false,"data":{}},"featureOptSel":[]}],"abilities":{"state":{"common_cntFeatsCustom":0,"common_raceChoiceMetasFrom":[],"common_raceChoiceMetasWeighted":[]},
    "stateAsi":{"common_additionalFeats_race_ixSel":0,"common_additionalFeats_background_ixSel":0},"mode":0},"equipment":{"stateDefault":{"std__choice__0":0,"std__choice__1":0,
    "std__choice__2":0,"std__choice__3":0},"cpRolled":null,"boughtItems":[]},"spellsBySource":[{"className":"Sorcerer","classSource":"PHB","spellsByLvl":[[{"name":"Acid Splash",
    "source":"PHB","isLearned":true,"isPrepared":true},{"name":"Blade Ward","source":"PHB","isLearned":true,"isPrepared":true},{"name":"Chill Touch","source":"PHB","isLearned":true,
    "isPrepared":true},{"name":"Booming Blade","source":"TCE","isLearned":true,"isPrepared":true}],[{"name":"Burning Hands","source":"PHB","isLearned":true,"isPrepared":false},
    {"name":"Absorb Elements","source":"XGE","isLearned":true,"isPrepared":false}],[],[],[],[],[],[],[],[]]}]},"_meta":{"fileSourcesUsed":[],"brewSourcesUsed":[],"enabledBrew":[]}}`); */

    this.json = JSON.parse(String.raw`{"abilities":{"totals":{"mode":"array","totals":{"rolled":{"str":2,"dex":0,"con":2,"int":0,"wis":0,"cha":2},"array":{"str":17,"dex":12,"con":15,"int":10,"wis":14,"cha":10},"pointbuy":{"str":10,"dex":8,"con":10,"int":8,"wis":8,"cha":10},"manual":{"str":2,"dex":0,"con":2,"int":0,"wis":0,"cha":2}}}},"classes":[{"classUid":"Sorcerer|PHB","targetLevel":4,"isPrimary":true,"subclassUid":"Draconic Bloodline|PHB","hpMode":0,"hpCustomFormula":"(2 * @hd.number)d(@hd.faces / 2)","featureOptSel":[{"isFormComplete":true,"data":{"features":[{"type":"classFeature","entity":{"name":"Spellcasting","source":"PHB","page":99,"srd":true,"className":"Sorcerer","classSource":"PHB","level":1,"entries":["An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. This font of magic, whatever its origin, fuels your spells. See {@book chapter 10|PHB|10} for the general rules of spellcasting and {@book chapter 11|PHB|11} for the {@filter sorcerer spell list|spells|class=sorcerer}.",{"type":"entries","name":"Cantrips","entries":["At 1st level, you know four cantrips of your choice from the sorcerer spell list. You learn an additional sorcerer cantrip of your choice at 4th level and another at 10th level."]},{"type":"entries","name":"Spell Slots","entries":["The Sorcerer table shows how many spell slots you have to cast your {@filter sorcerer spells|spells|class=sorcerer} of 1st level and higher. To cast one of these sorcerer spells, you must expend a slot of the spell's level or higher. You regain all expended spell slots when you finish a long rest.","For example, if you know the 1st-level spell {@spell burning hands} and have a 1st-level and a 2nd-level spell slot available, you can cast {@spell burning hands} using either slot."]},{"type":"entries","name":"Spells Known of 1st Level and Higher","entries":["You know two 1st-level spells of your choice from the sorcerer spell list.","You learn an additional sorcerer spell of your choice at each level except 12th, 14th, 16th, 18th, 19th, and 20th. Each of these spells must be of a level for which you have spell slots. For instance, when you reach 3rd level in this class, you can learn one new spell of 1st or 2nd level.","Additionally, when you gain a level in this class, you can choose one of the sorcerer spells you know and replace it with another spell from the sorcerer spell list, which also must be of a level for which you have spell slots."]},{"type":"entries","name":"Spellcasting Ability","entries":["Charisma is your spellcasting ability for your sorcerer spells, since the power of your magic relies on your ability to project your will into the world. You use your Charisma whenever a spell refers to your spellcasting ability. In addition, you use your Charisma modifier when setting the saving throw DC for a sorcerer spell you cast and when making an attack roll with one.",{"type":"abilityDc","name":"Spell","attributes":["cha"]},{"type":"abilityAttackMod","name":"Spell","attributes":["cha"]}]},{"type":"entries","name":"Spellcasting Focus","entries":["You can use an {@item arcane focus|phb} as a spellcasting focus for your sorcerer spells."]}],"__prop":"classFeature"},"page":"classFeature","source":"PHB","hash":"spellcasting_sorcerer_phb_1_phb","className":"Sorcerer"}]}},{"isFormComplete":true,"data":{"features":[{"type":"subclassFeature","entity":{"name":"Draconic Bloodline","source":"PHB","page":102,"srd":true,"className":"Sorcerer","classSource":"PHB","subclassShortName":"Draconic","subclassSource":"PHB","level":1,"entries":["Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors. Most often, sorcerers with this origin trace their descent back to a mighty sorcerer of ancient times who made a bargain with a dragon or who might even have claimed a dragon parent. Some of these bloodlines are well established in the world, but most are obscure. Any given sorcerer could be the first of a new bloodline, as a result of a pact or some other exceptional circumstance.",{"type":"wrapper","wrapped":"@UUID[Item.temp-srd5e-JTdCJTIycGFnZSUyMiUzQSUyMnN1YmNsYXNzRmVhdHVyZSUyMiUyQyUyMnNvdXJjZSUyMiUzQSUyMlBIQiUyMiUyQyUyMmhhc2glMjIlM0ElMjJkcmFnb24lMjUyMGFuY2VzdG9yX3NvcmNlcmVyX3BoYl9kcmFjb25pY19waGJfMV9waGIlMjIlN0Q=]{Dragon Ancestor}","source":"PHB","data":{"isFvttSyntheticFeatureLink":true}},{"type":"wrapper","wrapped":"@UUID[Item.temp-srd5e-JTdCJTIycGFnZSUyMiUzQSUyMnN1YmNsYXNzRmVhdHVyZSUyMiUyQyUyMnNvdXJjZSUyMiUzQSUyMlBIQiUyMiUyQyUyMmhhc2glMjIlM0ElMjJkcmFjb25pYyUyNTIwcmVzaWxpZW5jZV9zb3JjZXJlcl9waGJfZHJhY29uaWNfcGhiXzFfcGhiJTIyJTdE]{Draconic Resilience}","source":"PHB","data":{"isFvttSyntheticFeatureLink":true}}],"__prop":"subclassFeature"},"page":"subclassFeature","source":"PHB","hash":"draconic%20bloodline_sorcerer_phb_draconic_phb_1_phb","className":"Sorcerer","subclassName":"Draconic Bloodline"},{"type":"subclassFeature","entry":"{@subclassFeature Dragon Ancestor|Sorcerer||Draconic||1}","entity":{"name":"Dragon Ancestor","source":"PHB","page":102,"srd":true,"className":"Sorcerer","classSource":"PHB","subclassShortName":"Draconic","subclassSource":"PHB","level":1,"header":1,"entries":["At 1st level, you choose one type of dragon as your ancestor. The damage type associated with each dragon is used by features you gain later.",{"type":"table","caption":"Draconic Ancestry","colLabels":["Dragon","Damage Type"],"colStyles":["col-6 text-center","col-6 text-center"],"rows":[["Black","{@filter Acid|spells|damage type=acid|class=sorcerer}"],["Blue","{@filter Lightning|spells|damage type=lightning|class=sorcerer}"],["Brass","{@filter Fire|spells|damage type=fire|class=sorcerer}"],["Bronze","{@filter Lightning|spells|damage type=lightning|class=sorcerer}"],["Copper","{@filter Acid|spells|damage type=acid|class=sorcerer}"],["Gold","{@filter Fire|spells|damage type=fire|class=sorcerer}"],["Green","{@filter Poison|spells|damage type=poison|class=sorcerer}"],["Red","{@filter Fire|spells|damage type=fire|class=sorcerer}"],["Silver","{@filter Cold|spells|damage type=cold|class=sorcerer}"],["White","{@filter Cold|spells|damage type=cold|class=sorcerer}"]]},"You can speak, read, and write {@language Draconic}. Additionally, whenever you make a Charisma check when interacting with dragons, your proficiency bonus is doubled if it applies to the check."],"__prop":"subclassFeature","entryData":{"languageProficiencies":[{"draconic":true}]},"_ancestorClassName":"Sorcerer","_ancestorSubclassName":"Draconic Bloodline"},"page":"subclassFeature","source":"PHB","hash":"dragon%20ancestor_sorcerer_phb_draconic_phb_1_phb","isRequiredOption":false},{"type":"subclassFeature","entry":"{@subclassFeature Draconic Resilience|Sorcerer||Draconic||1}","entity":{"name":"Draconic Resilience","source":"PHB","page":102,"srd":true,"className":"Sorcerer","classSource":"PHB","subclassShortName":"Draconic","subclassSource":"PHB","level":1,"header":1,"entries":["As magic flows through your body, it causes physical traits of your dragon ancestors to emerge. At 1st level, your hit point maximum increases by 1 and increases by 1 again whenever you gain a level in this class.","Additionally, parts of your skin are covered by a thin sheen of dragon-like scales. When you aren't wearing armor, your AC equals 13 + your Dexterity modifier."],"__prop":"subclassFeature","_ancestorClassName":"Sorcerer","_ancestorSubclassName":"Draconic Bloodline","effectsRaw":[{"name":"Natural Armor","transfer":true,"changes":[{"key":"data.attributes.ac.calc","mode":"OVERRIDE","value":"draconic"}]},{"name":"HP Increase","transfer":true,"changes":[{"key":"data.attributes.hp.max","mode":"ADD","value":"+ @classes.sorcerer.levels"}]}]},"page":"subclassFeature","source":"PHB","hash":"draconic%20resilience_sorcerer_phb_draconic_phb_1_phb","isRequiredOption":false}],"formDatasSkillToolLanguageProficiencies":[],"formDatasSkillProficiencies":[],"formDatasLanguageProficiencies":[{"isFormComplete":true,"data":{"languageProficiencies":{"draconic":1}}}],"formDatasToolProficiencies":[],"formDatasWeaponProficiencies":[],"formDatasArmorProficiencies":[],"formDatasSavingThrowProficiencies":[],"formDatasDamageImmunities":[],"formDatasDamageResistances":[],"formDatasDamageVulnerabilities":[],"formDatasConditionImmunities":[],"formDatasExpertise":[],"formDatasResources":[],"formDatasSenses":[],"formDatasAdditionalSpells":[]}},{"isFormComplete":true,"data":{"features":[{"type":"classFeature","entity":{"name":"Font of Magic","source":"PHB","page":99,"srd":true,"className":"Sorcerer","classSource":"PHB","level":2,"entries":["At 2nd level, you tap into a deep wellspring of magic within yourself. This wellspring is represented by sorcery points, which allow you to create a variety of magical effects.",{"type":"wrapper","wrapped":"@UUID[Item.temp-srd5e-JTdCJTIycGFnZSUyMiUzQSUyMmNsYXNzRmVhdHVyZSUyMiUyQyUyMnNvdXJjZSUyMiUzQSUyMlBIQiUyMiUyQyUyMmhhc2glMjIlM0ElMjJzb3JjZXJ5JTI1MjBwb2ludHNfc29yY2VyZXJfcGhiXzJfcGhiJTIyJTdE]{Sorcery Points}","source":"PHB","data":{"isFvttSyntheticFeatureLink":true}},{"type":"wrapper","wrapped":"@UUID[Item.temp-srd5e-JTdCJTIycGFnZSUyMiUzQSUyMmNsYXNzRmVhdHVyZSUyMiUyQyUyMnNvdXJjZSUyMiUzQSUyMlBIQiUyMiUyQyUyMmhhc2glMjIlM0ElMjJmbGV4aWJsZSUyNTIwY2FzdGluZ19zb3JjZXJlcl9waGJfMl9waGIlMjIlN0Q=]{Flexible Casting}","source":"PHB","data":{"isFvttSyntheticFeatureLink":true}}],"__prop":"classFeature"},"page":"classFeature","source":"PHB","hash":"font%20of%20magic_sorcerer_phb_2_phb","className":"Sorcerer"},{"type":"classFeature","entry":"{@classFeature Sorcery Points|Sorcerer||2}","entity":{"name":"Sorcery Points","source":"PHB","page":99,"srd":true,"className":"Sorcerer","classSource":"PHB","level":2,"header":1,"entries":["You have 2 sorcery points, and you gain one additional point every time you level up, to a maximum of 20 at level 20. You can never have more sorcery points than shown on the table for your level. You regain all spent sorcery points when you finish a long rest."],"__prop":"classFeature","_ancestorClassName":"Sorcerer"},"page":"classFeature","source":"PHB","hash":"sorcery%20points_sorcerer_phb_2_phb","isRequiredOption":false},{"type":"classFeature","entry":"{@classFeature Flexible Casting|Sorcerer||2}","entity":{"name":"Flexible Casting","source":"PHB","page":99,"srd":true,"className":"Sorcerer","classSource":"PHB","level":2,"header":1,"entries":["You can use your sorcery points to gain additional spell slots, or sacrifice spell slots to gain additional sorcery points. You learn other ways to use your sorcery points as you reach higher levels.",{"type":"entries","name":"Creating Spell Slots","entries":["You can transform unexpended sorcery points into one spell slot as a bonus action on your turn. The created spell slots vanish at the end of a long rest. The Creating Spell Slots table shows the cost of creating a spell slot of a given level. You can create spell slots no higher in level than 5th.",{"type":"table","caption":"Creating Spell Slots","colLabels":["Spell Slot Level","Sorcery Point Cost"],"colStyles":["col-6 text-center","col-6 text-center"],"rows":[["1st","2"],["2nd","3"],["3rd","5"],["4th","6"],["5th","7"]]}]},{"type":"entries","name":"Converting a Spell Slot to Sorcery Points","entries":["As a bonus action on your turn, you can expend one spell slot and gain a number of sorcery points equal to the slot's level."]}],"__prop":"classFeature","_ancestorClassName":"Sorcerer"},"page":"classFeature","source":"PHB","hash":"flexible%20casting_sorcerer_phb_2_phb","isRequiredOption":false}]}},{"isFormComplete":true,"data":{"features":[{"type":"classFeature","entity":{"name":"Metamagic","source":"PHB","page":99,"srd":true,"className":"Sorcerer","classSource":"PHB","level":3,"entries":["At 3rd level, you gain the ability to twist your spells to suit your needs. You gain two Metamagic options of your choice. You gain another one at 10th and 17th level.","You can use only one Metamagic option on a spell when you cast it, unless otherwise noted."],"__prop":"classFeature"},"page":"classFeature","source":"PHB","hash":"metamagic_sorcerer_phb_3_phb","className":"Sorcerer"}]}},{"isFormComplete":true,"data":{"features":[{"type":"optionalfeature","entry":"{@optfeature Heightened Spell|PHB}","entity":{"name":"Heightened Spell","source":"PHB","page":102,"srd":true,"featureType":["MM"],"consumes":{"name":"Sorcery Point","amount":3},"entries":["When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 3 sorcery points to give one target of the spell disadvantage on its first saving throw made against the spell."],"__prop":"optionalfeature","_ancestorType":"optionalfeature","_displayName":"Metamagic: Heightened Spell","_foundrySystem":{"requirements":"Sorcerer 3"},"ancestorClassName":"Sorcerer","level":3},"optionsMeta":{"setId":"652370fb-fd47-4f8d-af8b-58d7207bc0aa","name":"Metamagic","count":2},"page":"optionalfeatures.html","source":"PHB","hash":"heightened%20spell_phb","isRequiredOption":false},{"type":"optionalfeature","entry":"{@optfeature Subtle Spell|PHB}","entity":{"name":"Subtle Spell","source":"PHB","page":102,"srd":true,"featureType":["MM"],"consumes":{"name":"Sorcery Point"},"entries":["When you cast a spell, you can spend 1 sorcery point to cast it without any somatic or verbal components."],"__prop":"optionalfeature","_ancestorType":"optionalfeature","_displayName":"Metamagic: Subtle Spell","_foundrySystem":{"requirements":"Sorcerer 3"},"ancestorClassName":"Sorcerer","level":3},"optionsMeta":{"setId":"652370fb-fd47-4f8d-af8b-58d7207bc0aa","name":"Metamagic","count":2},"page":"optionalfeatures.html","source":"PHB","hash":"subtle%20spell_phb","isRequiredOption":false}],"formDatasSkillToolLanguageProficiencies":[],"formDatasSkillProficiencies":[],"formDatasLanguageProficiencies":[],"formDatasToolProficiencies":[],"formDatasWeaponProficiencies":[],"formDatasArmorProficiencies":[],"formDatasSavingThrowProficiencies":[],"formDatasDamageImmunities":[],"formDatasDamageResistances":[],"formDatasDamageVulnerabilities":[],"formDatasConditionImmunities":[],"formDatasExpertise":[],"formDatasResources":[],"formDatasSenses":[],"formDatasAdditionalSpells":[]}},{"isFormComplete":true,"data":{"features":[{"type":"classFeature","entity":{"name":"Sorcerous Versatility","source":"TCE","page":65,"className":"Sorcerer","classSource":"PHB","level":4,"isClassFeatureVariant":true,"entries":["{@i 4th-level sorcerer {@variantrule optional class features|tce|optional feature}}","Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can do one of the following, representing the magic within you flowing in new ways:",{"type":"list","items":["Replace one of the options you chose for the Metamagic feature with a different {@filter Metamagic option|optionalfeatures|Feature Type=MM} available to you.","Replace one cantrip you learned from this class's Spellcasting feature with another cantrip from the {@filter sorcerer spell list|spells|level=0|class=Sorcerer}."]}],"__prop":"classFeature"},"page":"classFeature","source":"TCE","hash":"sorcerous%20versatility_sorcerer_phb_4_tce","className":"Sorcerer"}]}}],"skillProfs":[{"isFormComplete":true,"data":{"skillProficiencies":{"arcana":1,"deception":1}}}],"toolProfs":[],"spellSlotLevelSelection":{"1_generic_0_spellLevel":1,"1_generic_1_spellLevel":1,"2_generic_0_spellLevel":1,"3_generic_0_spellLevel":2,"4_generic_0_spellLevel":2}}],"race":{"race":{"name":"Dwarf (Mountain)","source":"PHB","page":20,"size":["M"],"speed":25,"ability":[{"con":2,"str":2}],"age":{"mature":20,"max":350},"darkvision":60,"traitTags":["Tool Proficiency"],"languageProficiencies":[{"common":true,"dwarvish":true}],"weaponProficiencies":[{"battleaxe|phb":true,"handaxe|phb":true,"light hammer|phb":true,"warhammer|phb":true}],"resist":["poison"],"soundClip":{"type":"internal","path":"races/dwarf.mp3"},"entries":[{"name":"Age","type":"entries","entries":["Dwarves mature at the same rate as humans, but they're considered young until they reach the age of 50. On average, they live about 350 years."]},{"type":"entries","name":"Size","entries":["Dwarves stand between 4 and 5 feet tall and average about 150 pounds. Your size is Medium."]},{"name":"Speed","entries":["Your speed is not reduced by wearing heavy armor."],"type":"entries"},{"name":"Darkvision","entries":["Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray."],"type":"entries"},{"name":"Dwarven Resilience","entries":["You have advantage on saving throws against poison, and you have resistance against poison damage."],"type":"entries"},{"name":"Dwarven Combat Training","entries":["You have proficiency with the {@item battleaxe|phb}, {@item handaxe|phb}, {@item light hammer|phb}, and {@item warhammer|phb}."],"type":"entries"},{"name":"Tool Proficiency","entries":["You gain proficiency with the artisan's tools of your choice: {@item Smith's tools|phb}, {@item brewer's supplies|phb}, or {@item mason's tools|phb}."],"type":"entries"},{"name":"Stonecunning","entries":["Whenever you make an Intelligence ({@skill History}) check related to the origin of stonework, you are considered proficient in the {@skill History} skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus."],"type":"entries"},{"name":"Languages","entries":["You can speak, read, and write Common and Dwarvish. Dwarvish is full of hard consonants and guttural sounds, and those characteristics spill over into whatever other language a dwarf might speak."],"type":"entries"},{"name":"Dwarven Armor Training","entries":["You have proficiency with light and medium armor."],"type":"entries"}],"__prop":"race","_baseName":"Dwarf","_baseSource":"PHB","_baseSrd":true,"_baseBasicRules":true,"_subraceName":"Mountain","raceName":"Dwarf","raceSource":"PHB","basicRules":true,"heightAndWeight":{"baseHeight":48,"heightMod":"2d4","baseWeight":130,"weightMod":"2d6"},"armorProficiencies":[{"light":true,"medium":true}],"hasFluff":true,"hasFluffImages":true,"_isSubRace":true,"_fSize":["M"],"_fSpeed":["Walk (Slow)"],"_fTraits":["Darkvision","Armor Proficiency","Weapon Proficiency","Tool Proficiency"],"_fSources":"PHB","_fLangs":["Common","Dwarvish"],"_fCreatureTypes":["humanoid"],"_fMisc":["Basic Rules","Has Info","Has Images"],"_slAbility":"Str +2; Con +2","_fAge":[20,350],"_fRes":["poison"]},"size":["M"],"skillProfs":[],"toolProfs":[],"langProfs":[],"expertises":[],"armorProfs":[],"weaponProfs":[],"dmgImmunities":[],"dmgResistances":[],"dmgVulnerabilities":[],"conImmunities":[]},"background":{"backgroundUid":"Folk Hero|PHB","features":[{"isFormComplete":true,"data":{"entries":[{"name":"Echoes of Victory","type":"entries","entries":["You have attracted admiration among spectators, fellow athletes, and trainers in the region that hosted your past athletic victories. When visiting any settlement within 100 miles of where you grew up, there is a {@chance 50|50 percent} chance you can find someone there who admires you and is willing to provide information or temporary shelter.","Between adventures, you might compete in athletic events sufficient enough to maintain a comfortable lifestyle, as per the \"{@book Practicing a Profession|PHB|8|Practicing a Profession}\" downtime activity in chapter 8 of the {@book Player's Handbook|PHB}."],"data":{"isFeature":true},"source":"MOT","backgroundName":"Athlete","backgroundSource":"MOT","srd":false,"basicRules":false,"page":31,"__prop":"backgroundFeature"}],"isCustomize":true,"background":{"name":"Folk Hero","source":"PHB","page":131,"basicRules":true,"skillProficiencies":[{"animal handling":true,"survival":true}],"toolProficiencies":[{"anyArtisansTool":1,"vehicles (land)":true}],"startingEquipment":[{"_":[{"equipmentType":"toolArtisan"},"shovel|phb","iron pot|phb","common clothes|phb",{"item":"pouch|phb","containsValue":1000}]}],"entries":[{"type":"list","style":"list-hang-notitle","items":[{"type":"item","name":"Skill Proficiencies:","entry":"{@skill Animal Handling}, {@skill Survival}"},{"type":"item","name":"Tool Proficiencies:","entry":"One type of {@filter artisan's tools|items|source=phb|miscellaneous=mundane|type=artisan's tools}, {@filter vehicles (land)|items|source=phb;dmg|miscellaneous=mundane|type=vehicle (land)}"},{"type":"item","name":"Equipment:","entry":"A set of {@filter artisan's tools|items|source=phb|miscellaneous=mundane|type=artisan's tools} (one of your choice), a {@item shovel|phb}, an {@item iron pot|phb}, a set of {@item common clothes|phb}, and a belt {@item pouch|phb} containing 10 gp"}]},{"name":"Feature: Rustic Hospitality","type":"entries","entries":["Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have shown yourself to be a danger to them. They will shield you from the law or anyone else searching for you, though they will not risk their lives for you."],"data":{"isFeature":true}},{"name":"Specialty","type":"entries","entries":["You previously pursued a simple profession among the peasantry, perhaps as a farmer, miner, servant, shepherd, woodcutter, or gravedigger. But something happened that set you on a different path and marked you for greater things. Choose or randomly determine a defining event that marked you as a hero of the people.",{"type":"table","colLabels":["d10","Defining Event"],"colStyles":["col-1 text-center","col-11"],"rows":[["1","I stood up to a tyrant's agents."],["2","I saved people during a natural disaster."],["3","I stood alone against a terrible monster."],["4","I stole from a corrupt merchant to help the poor."],["5","I led a militia to fight off an invading army."],["6","I broke into a tyrant's castle and stole weapons to arm the people."],["7","I trained the peasantry to use farming implements as weapons against a tyrant's soldiers."],["8","A lord rescinded an unpopular decree after I led a symbolic act of protest against it."],["9","A celestial, fey, or similar creature gave me a blessing or revealed my secret origin."],["10","Recruited into a lord's army, I rose to leadership and was commended for my heroism."]]}]},{"name":"Suggested Characteristics","type":"entries","entries":["A folk hero is one of the common people, for better or for worse. Most folk heroes look on their humble origins as a virtue, not a shortcoming, and their home communities remain very important to them.",{"type":"table","colLabels":["d8","Personality Trait"],"colStyles":["col-1 text-center","col-11"],"rows":[["1","I judge people by their actions, not their words."],["2","If someone is in trouble, I'm always ready to lend help."],["3","When I set my mind to something, I follow through no matter what gets in my way."],["4","I have a strong sense of fair play and always try to find the most equitable solution to arguments."],["5","I'm confident in my own abilities and do what I can to instill confidence in others."],["6","Thinking is for other people. I prefer action."],["7","I misuse long words in an attempt to sound smarter."],["8","I get bored easily. When am I going to get on with my destiny?"]]},{"type":"table","colLabels":["d6","Ideal"],"colStyles":["col-1 text-center","col-11"],"rows":[["1","Respect. People deserve to be treated with dignity and respect. (Good)"],["2","Fairness. No one should get preferential treatment before the law, and no one is above the law. (Lawful)"],["3","Freedom. Tyrants must not be allowed to oppress the people. (Chaotic)"],["4","Might. If I become strong, I can take what I want—what I deserve. (Evil)"],["5","Sincerity. There's no good in pretending to be something I'm not. (Neutral)"],["6","Destiny. Nothing and no one can steer me away from my higher calling. (Any)"]]},{"type":"table","colLabels":["d6","Bond"],"colStyles":["col-1 text-center","col-11"],"rows":[["1","I have a family, but I have no idea where they are. One day, I hope to see them again."],["2","I worked the land, I love the land, and I will protect the land."],["3","A proud noble once gave me a horrible beating, and I will take my revenge on any bully I encounter."],["4","My tools are symbols of my past life, and I carry them so that I will never forget my roots."],["5","I protect those who cannot protect themselves."],["6","I wish my childhood sweetheart had come with me to pursue my destiny."]]},{"type":"table","colLabels":["d6","Flaw"],"colStyles":["col-1 text-center","col-11"],"rows":[["1","The tyrant who rules my land will stop at nothing to see me killed."],["2","I'm convinced of the significance of my destiny, and blind to my shortcomings and the risk of failure."],["3","The people who knew me when I was young know my shameful secret, so I can never go home again."],["4","I have a weakness for the vices of the city, especially hard drink."],["5","Secretly, I believe that things would be better if I were a tyrant lording over the land."],["6","I have trouble trusting in my allies."]]}]}],"hasFluff":true,"__prop":"background","_fSources":"PHB","_fSkills":["animal handling","survival"],"_fTools":["anyArtisansTool","vehicles (land)"],"_fLangs":[],"_fMisc":["Basic Rules","Has Info"],"_fOtherBenifits":[],"_skillDisplay":"Animal Handling, Survival"}}}],"skillProfs":[{"isFormComplete":true,"data":{"skillProficiencies":{"animal handling":1,"survival":1}}}],"toolProfs":[{"isFormComplete":true,"data":{"toolProficiencies":{"vehicles (land)":1,"brewer's supplies":1}}}],"langProfs":[],"expertises":[],"armorProfs":[],"weaponProfs":[],"dmgImmunities":[],"dmgResistances":[],"dmgVulnerabilities":[],"conImmunities":[],"characteristics":[{"isFormComplete":false,"data":{"personalitytrait_0_value":"","personalitytrait_1_value":"","ideal_0_value":"","bond_0_value":"","flaw_0_value":""}}]},"feats":{},"spells":{"spellsBySource":[{"spells":{"isFormComplete":0,"data":{"spells":[{"ix":62,"isPrepared":true,"isLearned":true,"isUpdateOnly":false,"preparationMode":"always","spellId":"Acid Splash|PHB"},{"ix":94,"isPrepared":true,"isLearned":true,"isUpdateOnly":false,"preparationMode":"always","spellId":"Blade Ward|PHB"},{"ix":107,"isPrepared":true,"isLearned":true,"isUpdateOnly":false,"preparationMode":"always","spellId":"Chill Touch|PHB"},{"ix":431,"isPrepared":true,"isLearned":true,"isUpdateOnly":false,"preparationMode":"always","spellId":"Booming Blade|TCE"},{"ix":102,"isPrepared":false,"isLearned":true,"isUpdateOnly":false,"preparationMode":"always","spellId":"Burning Hands|PHB"},{"ix":454,"isPrepared":false,"isLearned":true,"isUpdateOnly":false,"preparationMode":"always","spellId":"Absorb Elements|XGE"}]}}}]},"equipment":{"currency":{"isFormComplete":true,"data":{"currency":{"gp":10,"cp":0,"sp":0,"ep":0,"pp":0}}},"starting":{"isFormComplete":false,"messageInvalid":"You have not made all available choices. Are you sure you want to continue?","data":{"equipmentItemEntries":[{"item":{"name":"Common Clothes","source":"PHB","page":150,"srd":true,"basicRules":true,"type":"G","rarity":"none","weight":3,"value":50,"__prop":"item","_isEnhanced":true,"_category":"Other","entries":[],"_typeListText":["adventuring gear"],"_typeHtml":"adventuring gear","_subTypeHtml":"","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":1},{"item":{"name":"Component Pouch","source":"PHB","page":151,"srd":true,"basicRules":true,"type":"G","rarity":"none","weight":2,"value":2500,"entries":["A component pouch is a small, watertight leather belt pouch that has compartments to hold all the material components and other special items you need to cast your spells, except for those components that have a specific cost (as indicated in a spell's description)."],"__prop":"item","_isEnhanced":true,"_category":"Other","_typeListText":["adventuring gear"],"_typeHtml":"adventuring gear","_subTypeHtml":"","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":1},{"item":{"name":"Crossbow Bolts (20)","source":"PHB","page":150,"srd":true,"basicRules":true,"type":"A","rarity":"none","weight":1.5,"value":100,"bolt":true,"packContents":[{"item":"crossbow bolt|phb","quantity":20}],"__prop":"baseitem","_isBaseItem":true,"_category":"Basic","entries":[],"_isEnhanced":true,"_typeListText":["ammunition"],"_typeHtml":"ammunition","_subTypeHtml":"","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":1},{"item":{"name":"Dagger","source":"PHB","page":149,"srd":true,"basicRules":true,"type":"M","rarity":"none","weight":1,"value":200,"weaponCategory":"simple","property":["F","L","T"],"range":"20/60","dmg1":"1d4","dmgType":"P","dagger":true,"weapon":true,"__prop":"baseitem","_isBaseItem":true,"_category":"Basic","entries":[],"_isEnhanced":true,"_fullEntries":[{"type":"wrapper","wrapped":{"type":"entries","name":"Finesse","entries":["When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls."]},"data":{"item__mergedEntryTag":"property"}},{"type":"wrapper","wrapped":{"type":"entries","name":"Light","entries":["A light weapon is small and easy to handle, making it ideal for use when fighting with two weapons."]},"data":{"item__mergedEntryTag":"property"}},{"type":"wrapper","wrapped":{"type":"entries","name":"Thrown","entries":["If a weapon has the thrown property, you can throw the weapon to make a ranged attack. If the weapon is a melee weapon, you use the same ability modifier for that attack roll and damage roll that you would use for a melee attack with the weapon. For example, if you throw a handaxe, you use your Strength, but if you throw a dagger, you can use either your Strength or your Dexterity, since the dagger has the finesse property."]},"data":{"item__mergedEntryTag":"property"}}],"_typeListText":["simple weapon","melee weapon"],"_typeHtml":"weapon","_subTypeHtml":"simple weapon, melee weapon","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":2},{"item":{"name":"Dungeoneer's Pack","source":"PHB","page":151,"srd":true,"basicRules":true,"type":"G","rarity":"none","weight":61.5,"value":1200,"entries":["Includes:",{"type":"list","items":["a {@item backpack|phb}","a {@item crowbar|phb}","a {@item hammer|phb}","10 {@item piton|phb|pitons}","10 {@item torch|phb|torches}","a {@item tinderbox|phb}","10 days of {@item Rations (1 day)|phb|rations}","a {@item waterskin|phb}","{@item Hempen Rope (50 feet)|phb|50 feet of hempen rope}"]}],"packContents":["backpack|phb","crowbar|phb","hammer|phb",{"item":"piton|phb","quantity":10},{"item":"torch|phb","quantity":10},"tinderbox|phb",{"item":"rations (1 day)|phb","quantity":10},"waterskin|phb","hempen rope (50 feet)|phb"],"__prop":"item","_isEnhanced":true,"_category":"Other","_typeListText":["adventuring gear"],"_typeHtml":"adventuring gear","_subTypeHtml":"","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":1},{"item":{"name":"Iron Pot","source":"PHB","page":153,"srd":true,"basicRules":true,"type":"G","rarity":"none","weight":10,"value":200,"entries":["An iron pot holds 1 gallon of liquid."],"__prop":"item","_isEnhanced":true,"_category":"Other","_typeListText":["adventuring gear"],"_typeHtml":"adventuring gear","_subTypeHtml":"","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":1},{"item":{"name":"Pouch","source":"PHB","page":153,"srd":true,"basicRules":true,"type":"G","rarity":"none","weight":1,"value":50,"entries":["A cloth or leather pouch can hold up to 20 {@item sling bullet|phb|sling bullets} or 50 {@item blowgun needle|phb|blowgun needles}, among other things. A compartmentalized pouch for holding spell components is called a {@item component pouch|phb}. A pouch can hold up to ⅕ cubic foot or 6 pounds of gear."],"containerCapacity":{"weight":[6],"item":[{"sling bullet|phb":20,"blowgun needle|phb":50}]},"__prop":"item","_isEnhanced":true,"_category":"Other","_typeListText":["adventuring gear"],"_typeHtml":"adventuring gear","_subTypeHtml":"","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":1},{"item":{"name":"Shovel","source":"PHB","page":150,"srd":true,"basicRules":true,"type":"G","rarity":"none","weight":5,"value":200,"__prop":"item","_isEnhanced":true,"_category":"Other","entries":[],"_typeListText":["adventuring gear"],"_typeHtml":"adventuring gear","_subTypeHtml":"","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":1},{"item":{"name":"Light Crossbow","source":"PHB","page":149,"srd":true,"basicRules":true,"type":"R","rarity":"none","weight":5,"value":2500,"weaponCategory":"simple","property":["A","LD","2H"],"range":"80/320","dmg1":"1d8","dmgType":"P","crossbow":true,"weapon":true,"ammoType":"crossbow bolt|phb","__prop":"baseitem","_isBaseItem":true,"_category":"Basic","entries":[],"_isEnhanced":true,"_fullEntries":[{"type":"wrapper","wrapped":{"type":"entries","name":"Range","entries":["A weapon that can be used to make a ranged attack has a range shown in parentheses after the ammunition or thrown property. The range lists two numbers. The first is the weapon's normal range in feet, and the second indicates the weapon's maximum range. When attacking a target beyond normal range, you have disadvantage on the attack roll. You can't attack a target beyond the weapon's long range."]},"data":{"item__mergedEntryTag":"type"}},{"type":"wrapper","wrapped":{"type":"entries","name":"Ammunition","entries":["You can use a weapon that has the ammunition property to make a ranged attack only if you have ammunition to fire from the weapon. Each time you attack with the weapon, you expend one piece of ammunition. Drawing the ammunition from a quiver, case, or other container is part of the attack. Loading a one-handed weapon requires a free hand. At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield.","If you use a weapon that has the ammunition property to make a melee attack, you treat the weapon as an improvised weapon. A sling must be loaded to deal any damage when used in this way."]},"data":{"item__mergedEntryTag":"property"}},{"type":"wrapper","wrapped":{"type":"entries","name":"Loading","entries":["Because of the time required to load this weapon, you can fire only one piece of ammunition from it when you use an action, bonus action, or reaction to fire it, regardless of the number of attacks you can normally make."]},"data":{"item__mergedEntryTag":"property"}},{"type":"wrapper","wrapped":{"type":"entries","name":"Two-Handed","entries":["This weapon requires two hands to use. This property is relevant only when you attack with the weapon, not when you simply hold it."]},"data":{"item__mergedEntryTag":"property"}}],"_typeListText":["simple weapon","ranged weapon"],"_typeHtml":"weapon","_subTypeHtml":"simple weapon, ranged weapon","_attunement":null,"_attunementCategory":"No Attunement Required"},"quantity":1}]}},"shop":{"isFormComplete":true,"messageInvalid":null,"data":{"equipmentItemEntries":[]}}}}`);

    console.log("JSON:", this.json);
  }
  
  //TIP: this is getClass_
  //Think of propIxClass as the 1st key. this(ActorCharactermancer) has a object called _state, wherein there is a property with that 1st key's identical name.
  //this property ("class_0_ixClass", most of the time) contains the index of the class we chose as our 0th's class, in relation to full list of class options. It's our 2nd key
  //that full list is under this._data.class. It's going to have tons of classes, but if we use the 2nd key as an index, we get the class we chose
  //this class object should be the exact same as the json of the class. full stop.
  getClass_({ix, propIxClass, classUid}){
    console.log("CharBuilder Data", this._data);
    if(!!classUid){
      const parts = classUid.split("|");
      const name = parts[0], source = parts[1];
      return this._data.class.filter(c => c.name == name && c.source == source)[0];
    }
    if(ix==null&&propIxClass==null)throw new Error("Unable to fetch class, no index given");
    if(propIxClass!=null){
      if(this._state[propIxClass]==null){return null;}
      //bitwise NOT operation (google it). havent seen it trigger yet
      if(!~this._state[propIxClass]){console.warn("getClassStub"); return DataConverterClass.getClassStub();}
      return this._data.class[this._state[propIxClass]];
    }
    if(ix!=null&&~ix){return this._data.class[ix];}
    console.warn("getClassStub");
    return DataConverterClass.getClassStub();
  }
  _getSubclass({cls, propIxSubclass, ix, subclassUid}){
    if(!!subclassUid){
      const parts = subclassUid.split("|");
      const name = parts[0], source = parts[1];
      console.log("DATA", this._data, cls.subclasses);
      return cls.subclasses.filter(sc => sc.name == name && sc.source == source)[0];
    }
    if(ix==null&&propIxSubclass==null)throw new Error("Unable to fetch subclass, no index given");
    if(!cls)return null;
    if(propIxSubclass!=null){
      if(this._state[propIxSubclass]==null)return null;
      if(!~this._state[propIxSubclass])return DataConverterClass.getSubclassStub({'cls':cls});
      if(!cls.subclasses?.length)return DataConverterClass.getSubclassStub({'cls':cls}); //c.subclasses?.
      return cls.subclasses[this._state[propIxSubclass]];
    }
    if(ix!=null&&~ix)return cls.subclasses[ix];
    return DataConverterClass.getSubclassStub({cls:cls});
  }
  getClassFeatures(_class, level){
    let output = [];
    const maxLvl = level[level.length-1]+1;
    console.log("Get Class Features of " + _class.name + " up to level " + maxLvl);
    //Note: we do not handle subclass features yet
    const allClassFeatures = this._data.classFeature.filter(f => f.source === _class.source && f.className === _class.name && f.level <= maxLvl);
    console.log(allClassFeatures);
    return allClassFeatures;
  }
  
  async _class_pRenderFeatureOptionsSelects_({ix: _0x4ba617, propCntAsi: _0x5c4b09, filteredFeatures: _0xcaac0c, $stgFeatureOptions: _0x15b372}) {
    const _0x18cef0 = _0x1467c8,
    //Grab our existing feature options. We need to figure out how this works!
    //Somewhere, Charactermancer_FeatureOptionsSelect objects must be created.
    _0x4b61c1_existingFeatures = this['_compsClassFeatureOptionsSelect'][_0x4ba617] || [];
    //Unregister them all from our parent's featureSourceTracker
    _0x4b61c1_existingFeatures.forEach(_0x5ddd00=>this['_parent']['featureSourceTracker_']['unregister'](_0x5ddd00)),
    _0x15b372.empty();

    //Prepare the existing feature checker, if possible. Todo: check if this ever gets set to anything not null
    //We will need access to Plutonium's API to get the Charactermancer_Class_Util
    const _0x4548cc_exstFeatureChk = this['_existingClassMetas'][_0x4ba617] ? new CharacterImporter.api.charactermancer.charactermancer.Charactermancer_Class_Util['ExistingFeatureChecker'](this._actor) : null
    //filteredFeatures is just all the features for our class, there are some rare cases when we don't want to import certain features
      , _0x336be4 = Charactermancer_Util.getImportableFeatures(_0xcaac0c)
      , _0x117b40 = MiscUtil.copy(_0x336be4); //Create a copy of it as well

      //Temporarily commenting this out
      /* Charactermancer_Util['doApplyFilterToFeatureEntries_bySource'](_0x117b40, this['_modalFilterClasses']['pageFilter'],
      this['_modalFilterClasses']['pageFilter']['filterBox']['getValues']()); //Get our filters (by source or other things) */

    //Somehow group features by options set
    const _0x21ae90 = Charactermancer_Util.getFeaturesGroupedByOptionsSet(_0x117b40)
      , {lvlMin: _0x1dec8f, lvlMax: _0x38b4f6} = await this._class_pGetMinMaxLevel(_0x4ba617);

    //TODO: Uncomment this, its original stuff!
    //this['_class_unregisterFeatureSourceTrackingFeatureComps'](_0x4ba617);

    let _0x585d43 = 0;
    for (const _0x54d088 of _0x21ae90) { //For each group
      //Get optionSets from this group
        const {topLevelFeature: _0x40205c, optionsSets: _0x23331a} = _0x54d088;
        if (_0x40205c[_0x18cef0(0x157)] < _0x1dec8f || _0x40205c[_0x18cef0(0x157)] > _0x38b4f6)
            continue;
        const _0x2dedef = _0x40205c[_0x18cef0(0x160)][_0x18cef0(0x108)]();
        if (_0x2dedef === _0x18cef0(0xf5)) {
            _0x585d43++;
            continue;
        }
        //Loop through the optionSets
        for (const _0x3d4985 of _0x23331a) {
          //Create a new Charactermancer_FeatureOptionsSelect for the optionsset
            const _0x4fef4c = new Charactermancer_FeatureOptionsSelect({ //Here is one of only 2 places where these are created. (other is _feat_pRenderFeatureOptionsSelects_)
                //keep in mind 'this' is supposed to refer to a ActorCharactermancerClass. the parent is an ActorCharactermancer type object
                'featureSourceTracker': this._parent['featureSourceTracker_'], //what is parent? what is point of this tracker?
                'existingFeatureChecker': _0x4548cc_exstFeatureChk, //what is this and what is the point of it?
                'actor': this._actor, //obvious
                'optionsSet': _0x3d4985, //what this is all about
                'level': _0x40205c.level,
                'modalFilterSpells': this._parent['compSpell']['modalFilterSpells']
            });
            this['_compsClassFeatureOptionsSelect'][_0x4ba617]['push'](_0x4fef4c),
            _0x4fef4c['findAndCopyStateFrom'](_0x4b61c1_existingFeatures);
        }
    }
    this['_state'][_0x5c4b09] = _0x585d43,
    await this['_class_pRenderFeatureComps'](_0x4ba617, {
        '$stgFeatureOptions': _0x15b372
    });
  }
  

  async startImport(){
    //Time to call the Plutonium API
    console.log("Starting Import...");
    //let api = await game.modules.get("plutonium").api;
    let pl = await game.modules.get("plutonium");
    if (pl) {
      //await pl.api.util.documents.pUpdateDocument(this.actor, {system: {abilities: {str: {value: 12}}}}, {isRender:true});
      await this.createTaskRunner(pl);
      //await this.tryGetFeatureFormData();
      //TestClass.funFunction();

    }
    //UtilDocuments.pUpdateDocument(this.actor, {system: {abilities: {str: {value: 12}}}}, {isRender: false});
  }

  async createTaskRunner(){
    await new CharacterImporter.api.util.apps.AppTaskRunner({
      tasks: [
        //This task will set class stuff
        this._pHandleSaveClick_getClosure({
          pFn: this._pHandleSaveClick_abilities.bind(this),
          msgStart: "Importing ability scores...",
          msgComplete: "Imported ability scores."
          }),
        this._pHandleSaveClick_getClosure({
          pFn: this._pHandleSaveClick_race.bind(this),
          msgStart: "Importing race...",
          msgComplete: "Imported race."
          }),
        this._pHandleSaveClick_getClosure({ //This is called when the task is complete
          pFn: this._pHandleSaveClick_class.bind(this), //This is the main function of the task
          msgStart: "Setting class stuff...",
          msgComplete: "Class stuff set."
          }),
        this._pHandleSaveClick_getClosure({
          pFn: this._pHandleSaveClick_background.bind(this),
          msgStart: "Importing background...",
          msgComplete: "Imported background."
          }),
        this._pHandleSaveClick_getClosure({
          pFn: this._pHandleSaveClick_feats.bind(this),
          msgStart: "Importing feats...",
          msgComplete: "Imported feats."
          }),
        this._pHandleSaveClick_getClosure({
          pFn: this._pHandleSaveClick_spells.bind(this),
          msgStart: "Importing spells...",
          msgComplete: "Imported spells."
          }),
        this._pHandleSaveClick_getClosure({
          pFn: this._pHandleSaveClick_equipment.bind(this),
          msgStart: "Importing equipment...",
          msgComplete: "Imported equipment."
          }),
        ]
        .filter(Boolean),
        titleInitial: 'Building...',
        titleComplete: "Build Complete",
        isStopOnError: !![]
    }).pRun();
  }
  async _testTask({taskRunner:myRunner}){
    console.log("Task completed!"); return true;
  }
  _pHandleSaveClick_getClosure({pFn: func, msgStart: _mStart, msgComplete: _mComp}) {
    return new CharacterImporter.api.util.apps.TaskClosure({
        fnGetPromise: async({taskRunner: r})=>{
            const lineMeta = r['addLogLine'](_mStart);
            r['pushDepth']();
            try {
                await func({'taskRunner': r}),
                this._pHandleSaveClick_getClosure_handleSuccess({
                    taskRunner: r,
                    taskRunnerLineMeta: lineMeta,
                    msgComplete: _mComp
                });
            } catch (err) {
                this._pHandleSaveClick_getClosure_handleFailure({
                    taskRunner: r,
                    taskRunnerLineMeta: lineMeta
                });
                throw err;
            }
        }
    });
  }
  _pHandleSaveClick_getClosure_handleSuccess({taskRunner: runner, taskRunnerLineMeta: lineMeta, msgComplete: msgComp}) {
    runner['popDepth'](),
    runner.addLogLine(msgComp, {linkedLogLineMeta: lineMeta});
  }
  _pHandleSaveClick_getClosure_handleFailure({taskRunner: runner, taskRunnerLineMeta: lineMeta}) {
    runner['popDepth'](),
    runner.addLogLine('Build failed! See the console!', {
        isError: !![],
        linkedLogLineMeta: lineMeta
    });
  }

  async _pHandleSaveClick_class({taskRunner:myRunner}){
    const myClasses=[]; //Array of objects, each obj contains full class and full subclass data, along with bool if primary
    //----Lets start populating this array----

    //for(let ix = 0; ix < this.ActorCharactermancerClass.state.class_ixMax + 1; ++ix) //state, not _state
    //Probably going through each class on the character
    for(let i = 0; i < this.json.classes.length; ++i){
      const _clsInfo = this.json.classes[i];
      const myClass = this.getClass_({classUid:_clsInfo.classUid});
      for(let f of myClass.classFeatures){
        if (typeof f !== "object") {console.error("class features not set up correctly");}
      }
      if(!myClass){continue;} //This should be an entire class object, all features and everything, up to lvl 20. its the same as the class json

      //Try to get the subclass obj
      const mySubclass = _clsInfo.subclassUid? this._getSubclass({cls:myClass, subclassUid:_clsInfo.subclassUid}) : null;

      myClasses.push({
        ix:i, //index of class (in relation to how many we have on us)
        cls:myClass, //full class object
        sc:mySubclass, //full subclass object (or null) (chosen subclass)
        isPrimary: !!_clsInfo.isPrimary
      });
    }
     //----Array is now populated----

    //For the next part to continue, we need to have at least one class in the array
    if(myClasses.length){
      //Sort the classes (i guess primary goes first?)
      /* myClasses.sort((_0x49bcf2, _0x2531e5)=>SortUtil['ascSort'](Number(_0x2531e5.isPrimary),
        Number(_0x49bcf2.isPrimary))||SortUtil['ascSort'](_0x49bcf2[_0x3b80b4(0x151)][_0x3b80b4(0x1cc)],_0x2531e5[_0x3b80b4(0x151)].name)); */

      
      //We now need to access Plutonium's ImportListClass, which has to be accessible through their API
      const importList = new CharacterImporter.api.importer.ImportListClass({actor:this._actor});
      await importList.pInit();
      
      //this._compClass.modalFilterClasses.pageFilter.filterBox.getValues(); //this obj basically contains info about what sources were toggled on during creation
      //modalFilterClasses is what handles the filtering when you press on the filter button
      const _0x37641b=//this['_compClass'][_0x3b80b4(0x12d)][_0x3b80b4(0x16e)][_0x3b80b4(0x23b)]['getValues']();
      //This is a mimickry of what it is supposed to output:
      {Source:{PHB: 1, SCAG: 1, XGE: 1, TCE: 1, DMG: 1,
        _combineBlue: "or",
        _combineRed: "or",
        _isActive:true,
        _totals:{ignored: 0, no:0, yes:5},
        },
        "Other/Text Options": {isClassFeatureVariant: true,
          isDisplayClassIfSubclassActive: false,
          _isActive:  false,
        },
        Miscellaneous: {"Basic Rules": 0, Reprinted: 2,SRD: 0,Sidekick: 2,_combineBlue: "or",_combineRed: "or",_isActive: true,
          _totals: {yes: 0, no: 2, ignored: 2}
        },
      };

      //We are now going to create copies of the class and subclass objects
      for(let i = 0; i < myClasses.length; ++i){ //standard for loop. go through all of them (_0xaf846e_ourClasses.length)

        const _clsInfo = this.json.classes[i]; //be aware, this wont work if we've sorted the classes already
        //Now we are looking at a single class, and perhaps a subclass attached to it. Lets copy them
        //grab the ix, cls, sc and isPrimary from the iterated object, but give them new names
        const { ix:ix, cls, sc, isPrimary } = myClasses[i],
        classData = MiscUtil.copy(cls), //MiscUtil.copy(class object)
        subclassData = sc?MiscUtil.copy(sc) : null; //MiscUtil.copy(subclass object)

        //Tweak the copies a little
        if(subclassData)delete subclassData.additionalSpells; //if we have chosen a subclass, delete the additionalSpells part of it (its a copy anyway)
        if(subclassData)classData.subclasses = [subclassData]; //if we have chosen a subclass, make class.subclasses just be an array of our 1 subclass object
        else classData.subclasses = []; //or just wipe class.subclasses array if we didn't have a subclass selected


        //#region LEVELS
        //Let's create an array of ints to tell foundry what levels we need
        let lvlar = [];
        const targetLvl = _clsInfo.targetLevel;
        for(let lvl = 0; lvl < targetLvl; ++lvl){
          lvlar.push(lvl);
        }
        classData._foundrySelectedLevelIndices = lvlar;
        if(!classData._foundrySelectedLevelIndices.length){continue;} //if no .length, continue. That must be a bug, because we should have at least one level (index 0, which is lvl1)
        //#endregion

        //How we calculate starting proficiencies from a class differs depending if its our primary class, or a multiclass option
        classData._foundryStartingProficiencyMode = isPrimary?
          CharacterImporter.api.charactermancer.Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY:
          CharacterImporter.api.charactermancer.Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS; //Say if we are singleclass or multiclass mode
        
        //Check if the hp increase mode is anything other than 0. 0=average, 1=min value, 2=max value, 3=roll, 4=roll(custom formula), 5=donotincreasehp
        classData._foundryHpIncreaseMode = _clsInfo.hpMode,
        classData._foundryHpIncreaseCustomFormula = _clsInfo.hpCustomFormula;

        classData._foundryAllFeatures=[];
        for (const fosForm of _clsInfo.featureOptSel) {
          const actorUpdate = { system: {} };
          await CharacterImporter.api.charactermancer.Charactermancer_FeatureOptionsSelect.pDoApplyResourcesFormDataToActor({
            actor: this._actor,
            formData: fosForm
          });
          await CharacterImporter.api.charactermancer.Charactermancer_FeatureOptionsSelect.pDoApplySensesFormDataToActor({
            actor: this._actor,
            actorUpdate: actorUpdate,
            formData: fosForm,
            configGroup: 'importClassSubclassFeature'
          });
          if (fosForm?.data?.features?.length) {
            classData._foundryAllFeatures.push(...fosForm.data.features);
          }
          await CharacterImporter.api.charactermancer.Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(this._actor, actorUpdate, fosForm);
          if (Object.keys(actorUpdate.system).length || Object.keys(actorUpdate.prototypeToken || {}).length) {
            await CharacterImporter.api.util.apps.UtilDocuments.pUpdateDocument(this._actor, actorUpdate, { isRender: false });
          }
        }

        //Delete additionalSpells
        delete classData.additionalSpells,
        classData._foundryAllFeatures.forEach(feature=>delete feature?.entity?.additionalSpells);


        this._isLevelUp &&(classData._foundryConInitial = this._conInitialWithModifiers,
          classData._foundryConFinal = this._conFinalWithModifiers);

        
        classData._foundryIsSkipImportPreparedSpells = !![];
        classData._foundryIsSkipImportCantrips = !![];
        await this._pHandleSaveClick_pDoApplySkills(_clsInfo.skillProfs, classData, [...(isPrimary ? ["startingProficiencies", "skills"] : ["multiclassing", 'proficienciesGained', 'skills'])]);
        await this._pHandleSaveClick_pDoApplyTools(_clsInfo.toolProfs, classData, ...(isPrimary ? [["startingProficiencies", "toolProficiencies"], ["startingProficiencies", "tools"]] : [["multiclassing", "proficienciesGained", "toolProficiencies"], ["multiclassing", "proficienciesGained", "tools"]]));
        delete classData.startingEquipment;

        console.log("pImportClass time!");
        await importList.pImportClass(classData, {
          filterValues:_0x37641b,
          isCharactermancer:true,
          spellSlotLevelSelection: _clsInfo.spellSlotLevelSelection,
          taskRunner:myRunner
        });

        for (const form of _clsInfo.featureOptSel) {
          await CharacterImporter.api.charactermancer.Charactermancer_FeatureOptionsSelect.pDoApplyAdditionalSpellsFormDataToActor({
            actor: this._actor,
            formData: form,
            abilityAbv: sc?.spellcastingAbility || cls.spellcastingAbility,
            taskRunner: myRunner
          });
        }
      }
    }
  }
  async _pHandleSaveClick_race({ taskRunner }) {

    const raceStub = this.json.race.race;
    if (raceStub) {
      const importList = new CharacterImporter.api.importer.ImportListRace({ actor: this._actor });
      await importList.pInit();
      const raceData = MiscUtil.copy(raceStub);
      delete raceData.ability;
      delete raceData.feats;
      delete raceData._versions;
      delete raceData.additionalSpells;
      if (this.json.race.size) {
        raceData.size = this.json.race.size;
      }
      else { delete raceData.size; }
      await this._pHandleSaveClick_pDoApplySkills(this.json.race.skillProfs, raceData, ["skillProficiencies"]);
      await this._pHandleSaveClick_pDoApplyTools(this.json.race.toolProfs, raceData, ["toolProficiencies"]);
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': this.json.race.langProfs,
        'toObj': raceData,
        'path': ['languageProficiencies']
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': this.json.race.expertises,
        'toObj': raceData,
        'path': ["expertise"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': this.json.race.armorProfs,
        'toObj': raceData,
        'path': ["armorProficiencies"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': this.json.race.weaponProfs,
        'toObj': raceData,
        'path': ["weaponProficiencies"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': this.json.race.dmgImmunities,
        'toObj': raceData,
        'path': ["immune"],
        'isLegacy': true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': this.json.race.dmgResistances,
        'toObj': raceData,
        'path': ["resist"],
        'isLegacy': true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': this.json.race.dmgVulnerabilities,
        'toObj': raceData,
        'path': ['vulnerable'],
        'isLegacy': true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': this.json.race.conImmunities,
        'toObj': raceData,
        'path': ["conditionImmune"],
        'isLegacy': true
      });
      await importList.pImportEntry(raceData, {
        'isCharactermancer': true,
        'taskRunner': taskRunner
      });
    }
  }
  async _pHandleSaveClick_spells({ taskRunner }) {

    const getSpellFromData = (spellId) => {
      const parts = spellId.split("|");
      const name = parts[0], source = parts[1];
      return this._data.spell.filter(sp => sp.name == name && sp.source == source)[0];
    }
    const loadSpellsIntoForm = (form) => {
      for(let i = 0; i < form.data.spells.length; ++i){
        const obj = form.data.spells[i];
        //Get the spell from _data.spells
        form.data.spells[i].spell = getSpellFromData(obj.spellId);
      }
      return form;
    }

    const spellsBySource = this.json.spells.spellsBySource;
    console.log("JSON", this.json);
    for(let i = 0; i < spellsBySource.length; ++i){
      const source = spellsBySource[i];
      const { propIxClass: propIxClass, propIxSubclass: propIxSubclass } = MancerBaseComponent.class_getProps(i);
      const cls = this.getClass_({ propIxClass: propIxClass });
      if (!cls) { continue; }
      const sc = this._getSubclass({ cls: cls, propIxSubclass: propIxSubclass });
      try{
        const normalSpellsForm = loadSpellsIntoForm(source.spells);
          await //Charactermancer_Spell
          CharacterImporter.api.charactermancer.Charactermancer_Spell.pApplyFormDataToActor(this._actor, normalSpellsForm, {
            cls: cls,
            sc: sc,
            taskRunner: taskRunner
          });
      }
      catch(e){
        console.error(`Failed to apply class spells`);
        throw e;
      }
      try{
        if(source.additionalSpells){
          const additionalSpellsForm = loadSpellsIntoForm(source.additionalSpells);
          await this._pHandleSaveClick_pDoImportAdditionalSpells({formData: additionalSpellsForm,
            abilityAbv: cls.spellcastingAbility,
            taskRunner: taskRunner});
        }
      }
      catch(e){
        console.error(`Failed to apply additional spells`);
        throw e;
      }
      if (!sc) { continue; }
      try{
        if(source.additionalSpellsSubclass){
          const additionalSpellsSubclassForm = loadSpellsIntoForm(source.additionalSpellsSubclass);
          await this._pHandleSaveClick_pDoImportAdditionalSpells({formData: additionalSpellsSubclassForm,
            abilityAbv: sc?.spellcastingAbility || cls.spellcastingAbility,
            taskRunner: taskRunner});
        }
      }
      catch(e){
        console.error(`Failed to apply additional spells from subclass`);
        throw e;
      }
    }
    //TODO: race and background spells
    return;

    const _0x24c0ab = this._compSpell.filterValuesSpellsCache || this._compSpell.filterBoxSpells.getValues();
    for (let ix = 0; ix < this._compClass.state.class_ixMax + 1; ++ix) {
      const { propIxClass: propIxClass, propIxSubclass: propIxSubclass } = ActorCharactermancerBaseComponent.class_getProps(ix);
      const cls = this._compClass.getClass_({ propIxClass: propIxClass });
      if (!cls) { continue; }
      const sc = this._compClass.getSubclass_({ cls: cls, propIxSubclass: propIxSubclass });
      if (this._compSpell.compsSpellSpells[ix]) {
        const formData = await this._compSpell.compsSpellSpells[ix].pGetFormData(_0x24c0ab);
        await Charactermancer_Spell.pApplyFormDataToActor(this._actor, formData, {
          cls: cls,
          sc: sc,
          taskRunner: taskRunner
        });
      }
      if (this._compSpell.compsSpellAdditionalSpellClass[ix]) {
        const formData = await this._compSpell.compsSpellAdditionalSpellClass[ix].pGetFormData();
        await this._pHandleSaveClick_pDoImportAdditionalSpells({
          formData: formData,
          abilityAbv: cls.spellcastingAbility,
          taskRunner: taskRunner
        });
      }
      if (!sc) { continue; }
      if (this._compSpell.compsSpellAdditionalSpellSubclass[ix]) {
        const formData = await this._compSpell.compsSpellAdditionalSpellSubclass[ix].pGetFormData();
        await this._pHandleSaveClick_pDoImportAdditionalSpells({
          formData: formData,
          abilityAbv: sc?.spellcastingAbility || cls.spellcastingAbility,
          taskRunner: taskRunner
        });
      }
    }
    const comps = [this._compSpell.compSpellAdditionalSpellRace, this._compSpell.compSpellAdditionalSpellBackground];
    for (const comp of comps) {
      if (!comp) { continue; }
      const formData = await comp.pGetFormData();
      await this._pHandleSaveClick_pDoImportAdditionalSpells({ formData: formData, taskRunner: taskRunner });
    }
  }
  async _pHandleSaveClick_pDoImportAdditionalSpells({ formData, abilityAbv, parentAbilityAbv, taskRunner }) {
    await CharacterImporter.api.charactermancer.Charactermancer_AdditionalSpellsSelect.pApplyFormDataToActor(this._actor, formData, {
      abilityAbv: abilityAbv,
      parentAbilityAbv: parentAbilityAbv,
      taskRunner: taskRunner
    });
  }
  async _pHandleSaveClick_pDoApplySkills(forms, toObj, ...paths) {
    return this._pHandleSaveClick_pDoApplySkillsTools({
      forms: forms,
      toObj: toObj,
      paths: paths,
      validProficiencies: new Set(Object.keys(Parser.SKILL_TO_ATB_ABV)),
      propFormData: "skillProficiencies"
    });
  }
  async _pHandleSaveClick_pDoApplyTools(forms, toObj, ...paths) {
    return this._pHandleSaveClick_pDoApplySkillsTools({
      forms: forms,
      toObj: toObj,
      paths: paths,
      validProficiencies: new Set(Object.values(CharacterImporter.api.util.apps.UtilActors.TOOL_ABV_TO_FULL)),
      propFormData: 'toolProficiencies'
    });
  }
  async _pHandleSaveClick_pDoApplySkillsTools({
    forms: forms,
    toObj: toObj,
    paths: paths,
    validProficiencies: validProficiencies,
    propFormData: propFormData
  }) {
    for (const path of paths) MiscUtil.delete(toObj, ...path);
    forms = (forms || []).filter(Boolean);
    if (!forms.length) { return; }
    const output = {};
    for (const form of forms) {
      Object.keys(form.data?.[propFormData] || {}).filter(obj => validProficiencies.has(obj)).forEach(prof => output[prof] = true);
    }
    if (!Object.keys(output).length) { return; }
    const path = paths[0];
    MiscUtil.set(toObj, ...path, [output]);
  }
  async _pHandleSaveClick_pDoApplyTraitLike({ forms, toObj, path, isLegacy = false }) {
    const lastPath = path.last();
    MiscUtil.delete(toObj, ...path);
    forms = forms.filter(Boolean);
    if (!forms.length) { return; }
    const filteredForms = await forms.map(form => form?.data?.[lastPath]).filter(Boolean);
    if (isLegacy) {
      const legacyTraits = filteredForms.map(e => Object.keys(e));
      if (legacyTraits.length) {
        MiscUtil.set(toObj, ...path, legacyTraits);
      }
    }
    else {
      const traits = filteredForms.mergeMap(e => e);
      if (Object.keys(traits).length) {
        MiscUtil.set(toObj, ...path, [traits]);
      }
    }
  }
  async _pHandleSaveClick_background({ taskRunner }) {
    const bk = this.json.background;
    const parts = bk.backgroundUid.split("|");
    const name = parts[0], source = parts[1];
    const background = this._data.background.filter(b => b.name == name && b.source == source)[0];
    const bkFeatures = bk.features? (bk.features.constructor === Array? bk.features[0] : bk.features) : null; //Assume bk.features is a 1 length line array
    if (bk.features) {
      const outBk = bkFeatures?.data?.background ?? MiscUtil.copy(background);
      
      delete outBk.ability;
      delete outBk.skillProficiencies;
      delete outBk.toolProficiencies;
      delete outBk.languageProficiencies;
      delete outBk.skillToolLanguageProficiencies;
      
      const importList = new CharacterImporter.api.importer.ImportListBackground({ actor: this._actor });
      await importList.pInit();
      if (bkFeatures) { outBk._foundryFormDataFeatures = bkFeatures; }
      else {
        outBk._foundryFormDataFeatures = { isFormComplete: true };
      }
      outBk._foundryIsSkipCustomizeSkills = true;
      outBk._foundryIsSkipCustomizeLanguagesTools = true;
      await this._pHandleSaveClick_pDoApplySkills(bk.skillProfs, outBk, ["skillProficiencies"]);
      await this._pHandleSaveClick_pDoApplyTools(bk.toolProfs, outBk, ["toolProficiencies"]);
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': bk.langProfs,
        'toObj': outBk,
        'path': ["languageProficiencies"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': bk.expertises,
        'toObj': outBk,
        'path': ["expertise"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': bk.armorProfs,
        'toObj': outBk,
        'path': ['armorProficiencies']
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': bk.weaponProfs,
        'toObj': outBk,
        'path': ["weaponProficiencies"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': bk.dmgImmunities,
        'toObj': outBk,
        'path': ['immune'],
        'isLegacy': true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': bk.dmgResistances,
        'toObj': outBk,
        'path': ["resist"],
        'isLegacy': true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': bk.dmgVulnerabilities,
        'toObj': outBk,
        'path': ["vulnerable"],
        'isLegacy': true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        'forms': bk.conImmunities,
        'toObj': outBk,
        'path': ["conditionImmune"],
        'isLegacy': true
      });
      if (bk.characteristics) {
        if(bk.characteristics.constructor === Array){bk.characteristics = bk.characteristics[0];}
        outBk._foundryFormDataCharacteristics = bk.characteristics;
      } else {
        outBk._foundryIsSkipImportCharacteristics = true;
      }
      delete outBk.startingEquipment;
      delete outBk.additionalSpells;
      delete outBk.feats;

      console.log("OUTBK", outBk);

      await importList.pImportEntry(outBk, { isCharactermancer: true, taskRunner: taskRunner });
    }
  }
  async _pHandleSaveClick_feats({ taskRunner }) {
    const feats = this.json.feats;
    const additionalFeats = feats.additionalFeats;
    if (feats?.asi) {
      const asi = feats.asi;
      const importList = new CharacterImporter.api.importer.ImportListFeat({ actor: this._actor });
      await importList.pInit();
      for (const prop of ["ability", "race", "background", "custom"]) {
        if (!additionalFeats?.[prop]) { continue; }
        for (const {
          feat: feat,
          formDatasFeatureOptionsSelect: fosForm,
          ix: ix
        } of additionalFeats[prop].data) {
          if (!feat) { continue; }
          if (asi.feats[prop]?.[ix]) {
            const asiOrFeatChoice = asi.feats[prop]?.[ix];
            feat.ability = [asiOrFeatChoice.abilityChosen].filter(Boolean);
            if (!feat.ability.length) { delete feat.ability; }
            feat._foundryChosenAbilityScoreIncrease = feat?.ability?.[0] || {};
            delete feat._fullEntries;
            Renderer.feat.initFullEntries(feat);
          }
          for (const form of fosForm) {
            const actorUpdate = { system: {} };
            await Charactermancer_FeatureOptionsSelect.pDoApplyResourcesFormDataToActor({
              'actor': this._actor,
              'formData': form
            });
            await Charactermancer_FeatureOptionsSelect.pDoApplySensesFormDataToActor({
              'actor': this._actor,
              'actorUpdate': actorUpdate,
              'formData': form,
              'configGroup': "importFeat"
            });
            await Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(this._actor, actorUpdate, form);
            if (Object.keys(actorUpdate.system).length) {
              await UtilDocuments.pUpdateDocument(this._actor, actorUpdate, {
                'isRender': false
              });
            }
            let abilitiesChosen = null;
            if (asi.feats[prop]?.[ix]) {
              const asiOrFeatChoice = asi.feats[prop]?.[ix];
              abilitiesChosen = Object.keys(asiOrFeatChoice.abilityChosen || {})[0];
            }
            await Charactermancer_FeatureOptionsSelect.pDoApplyAdditionalSpellsFormDataToActor({
              'actor': this._actor,
              'formData': form,
              'parentAbilityAbv': abilitiesChosen,
              'taskRunner': taskRunner
            });
            if (form?.data?.features?.length) {
              for (let i = 0; i < form.data.features.length; ++i) {
                const feature = form.data.features[i];
                const featureData = feature.type === "feat" && i === 0 ? MiscUtil.copy(feat) : MiscUtil.copy(feature.entity);
                delete featureData.ability;
                delete featureData.skillProficiencies;
                delete featureData.languageProficiencies;
                delete featureData.toolProficiencies;
                delete featureData.weaponProficiencies;
                delete featureData.armorProficiencies;
                delete featureData.savingThrowProficiencies;
                delete featureData.immune;
                delete featureData.resist;
                delete featureData.vulnerable;
                delete featureData.conditionImmune;
                delete featureData.expertise;
                delete featureData.resources;
                delete featureData.senses;
                delete featureData.additionalSpells;
                await importList.pImportEntry(featureData, {
                  'isCharactermancer': true,
                  'isLeaf': true,
                  'taskRunner': taskRunner
                });
              }
            }
          }
        }
      }
    }
  }
  async _pHandleSaveClick_abilities() {
    const totals = this.json.abilities.totals;
    if (totals.mode !== StatGenUi.MODE_NONE) {
      const actorUpdate = {
        system: {
          abilities: {
            ...Parser.ABIL_ABVS.mergeMap(abv => ({
              [abv]: {
                value: totals?.totals?.[totals.mode]?.[abv] || 0
              }
            }))
          }
        }
      };
      await CharacterImporter.api.util.apps.UtilDocuments.pUpdateDocument(this._actor, actorUpdate, { isRender: false });
    }
  }
  async _pHandleSaveClick_equipment({ taskRunner }) {
    const equipment = this.json.equipment;
    const currency = equipment.currency;
    const starting = equipment.starting;
    const shop = equipment.shop;
    if (currency?.data?.currency) {
      await CharacterImporter.api.charactermancer.Charactermancer_StartingEquipment.pUpdateActorCurrency(this._actor, currency);
    }
    if (starting?.data?.equipmentItemEntries) {
      await CharacterImporter.api.charactermancer.Charactermancer_StartingEquipment.pImportEquipmentItemEntries(this._actor, starting, {
        taskRunner: taskRunner
      });
    }
    if (shop?.data?.equipmentItemEntries) {
      await CharacterImporter.api.charactermancer.Charactermancer_StartingEquipment.pImportEquipmentItemEntries(this._actor, shop, {
        taskRunner: taskRunner
      });
    }
  }

  /**Returns an array of formData. Converts classFeature objects into formDatas that FoundryVTT can import to actors, and beautifies the 'entries' string array. Requires the classFeature objects to be prepared with the 'loadeds' property. */
  async _getFeatureFormData(features, targetLevel){
    if(features.length && features[0].loadeds == null){console.error("Given features were not sufficiently prepared");}
    //We dont have that yet, so we need to figure out a way to create them.
    //when new Charactermancer_Class_LevelSelect is called, they don't have the entity property yet
    //its not changed in the constructor either
    //But when a Charactermancer_FeatureOptionsSelect is created, then the entity IS set
    //THe difference seems to be that a Charactermancer_Class_LevelSelect is created with a 'feature'
    //while Charactermancer_FeatureOptionsSelect is created with an 'optionsSet' which is similar but a bit different
    //this entire conversion is done in Charactermancer_Util.getFeaturesGroupedByOptionsSet

    //Send the features (they shouldn't have an 'entity' property yet). This function will create the 'entity' property, then pass it along and create optionSets from them.
    let featuresGroupedByOptionsSet = await this._createFeatureOptionSets({filteredFeatures: features});
    //Wow that we have the optionsSet, we can create a Charactermancer_FeatureOptionsSelect, which we can later use to grab the formData

    let counter = 0;
    let featOptSelects = [];
    for (const obj of featuresGroupedByOptionsSet) { //For each group
      //Get optionSets from this group
        const {topLevelFeature: topL, optionsSets: optSets} = obj;
        console.log("input optionSets:", optSets);
        if (/* topL.level < _0x1dec8f || */ topL.level > targetLevel) { continue; } //we are not going to bother with the level of the feature for now
        if (topL.name.toLowerCase() === 'ability score improvement') {counter++; continue; }
        //Loop through the optionSets
        for (const set of optSets) {
          //Create a new Charactermancer_FeatureOptionsSelect for the optionsset
            const feOptSel = new CharacterImporter.api.charactermancer.Charactermancer_FeatureOptionsSelect({ //Here is one of only 2 places where these are created. (other is _feat_pRenderFeatureOptionsSelects_)
                //keep in mind 'this' is supposed to refer to a ActorCharactermancerClass. the parent is an ActorCharactermancer type object
                featureSourceTracker: null,//this._parent['featureSourceTracker_'], //what is parent? what is point of this tracker?
                existingFeatureChecker: null,//_0x4548cc_exstFeatureChk, //what is this and what is the point of it?
                actor: this._actor, //obvious
                optionsSet: set, //what this is all about
                level: topL.level,
                modalFilterSpells: null,//this._parent['compSpell']['modalFilterSpells']
            });
            featOptSelects.push(feOptSel); //Debug
            /* this['_compsClassFeatureOptionsSelect'][_0x4ba617]['push'](feOptSel),
            feOptSel['findAndCopyStateFrom'](_0x4b61c1_existingFeatures); */
        }
    }
    //this['_state'][_0x5c4b09] = counter
    /* ,await this['_class_pRenderFeatureComps'](_0x4ba617, {
        '$stgFeatureOptions': _0x15b372
    }) */
    //;
    
    console.log(featOptSelects);
    let output = [];
    for(let i = 0; i < featOptSelects.length; ++i){
      output.push(await featOptSelects[i].pGetFormData())
    }
    return output;
  }
  /** Used by _getFeatureFormData to create option sets. Only worry about the filteredFeatures input parameter for now.*/
  async _createFeatureOptionSets({ix: _0x4ba617, propCntAsi: _0x5c4b09, filteredFeatures: inputFeatures, $stgFeatureOptions: _0x15b372}){
    //this function mimics _class_pRenderFeatureOptionsSelects_
    const //_0x4548cc_exstFeatureChk = this['_existingClassMetas'][_0x4ba617] ? new CharacterImporter.Charactermancer_Class_Util['ExistingFeatureChecker'](this['_actor']) : null,
    //filteredFeatures is just all the features for our class, there are some rare cases when we don't want to import certain features
      //_0x336be4 = Charactermancer_Util.getImportableFeatures(inputFeatures),
      _0x117b40 = MiscUtil.copy(inputFeatures);//_0x336be4); //Create a copy of it as well
    
    //Create groups of optionsets
    const optionSets = Charactermancer_Util.getFeaturesGroupedByOptionsSet(_0x117b40)
      //, {lvlMin: _0x1dec8f, lvlMax: _0x38b4f6} = await this._class_pGetMinMaxLevel(_0x4ba617)
      ;

    /* console.log("lvlMin: " + lvlMin);
    console.log("lvlMax: " + lvlMax); */
    console.log(optionSets);
    return optionSets;
  }
  /**Unstable. Tries to gather which levels you actually need to pull data for, based on UI. Intended for use with UI. */
  async _class_pGetMinMaxLevel(classIndex){
    //you can call it like this: const {lvlMin: min, lvlMax: max} = await this._class_pGetMinMaxLevel(classIx);
    //based on async[_0x1467c8(0xa8)]
    let min=0, max=0;
    if(this['_compsClassLevelSelect'][classIndex]){ //Just make sure we actually have the class matching the index cached
      const data=await this['_compsClassLevelSelect'][classIndex]['pGetFormData']()['data'];
      min=Math.min(...data)+1,max=Math.max(...data)+1;
    }
    return {'lvlMin':min,'lvlMax':max};
  }
  /**Imports features, skills, class, etc to the actor. The things imported depend on what is listed in the _class object. */
  async _importApplyClassToActor(_class, importList, taskRunner, filterValues){
    return await importList.pImportClass(_class,{
      filterValues:filterValues,
      isCharactermancer:!![],
      spellSlotLevelSelection:null, //_0x2c5e9a?.['isAnyChoice']()?_0x2c5e9a['getFlagsChoicesState']():null,
      taskRunner:taskRunner
    });
  }
}

class MancerBaseComponent{
  static class_getProps(ix) {
    return {
        'propPrefixClass': 'class_' + ix + '_',
        'propIxClass': "class_" + ix + "_ixClass",
        'propPrefixSubclass': "class_" + ix + "_subclass_",
        'propIxSubclass': "class_" + ix + "_subclass_ixSubclass",
        'propCntAsi': "class_" + ix + "_cntAsi",
        'propCurLevel': "class_" + ix + "_curLevel",
        'propTargetLevel': "class_" + ix + "_targetLevel"
    };
  }
}
class ImporterUtils {

  static unpackUidClassFeature (uid, opts) {
    //uid should look like Rage|Barbarian|PHB|1
    opts = opts || {};
    if (opts.isLower) uid = uid.toLowerCase();
    let [name, className, classSource, level, source, displayText] = uid.split("|").map(it => it.trim());
    classSource = classSource || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
    source = source || classSource;
    level = Number(level);
    return {
      name,
      className,
      classSource,
      level,
      source,
      displayText,
    };
  }
}
Array.prototype.pSerialAwaitMap || Object.defineProperty(Array.prototype, "pSerialAwaitMap", {
	enumerable: false,
	writable: true,
	value: async function (fnMap) {
		const out = [];
		for (let i = 0, len = this.length; i < len; ++i) out.push(await fnMap(this[i], i, this));
		return out;
	},
});

class SourceManager {
  static _BREW_DIRS = ["class", 'subclass', "race", "subrace", "background",
    "item", 'baseitem', "magicvariant", "spell", "feat", "optionalfeature"];
  static _DATA_PROPS_EXPECTED = ['class', "subclass", 'classFeature', "subclassFeature",
    "race", "background", "item", "spell", "feat", 'optionalfeature'];
  static cacheKey = "sourceIds";
  static _curWindow;

  /**
   * Starting function for the whole program. Loads source ids from local storage (or default ones as fallback),
   * and creates a character builder window that can play around with those sources
   * @param {any} actor Can just be left as null, not used at the moment
   */
  static async _pOpen({ actor: actor }) {

    //Try to load source ids from localstorage
    let sourceIds = null; //await this._loadSourceIdsFromStorage({actor});
    //If that failed, load default source ids
    if(!sourceIds){sourceIds = await this._getDefaultSourceIds({actor});}

    const fileMetas = null;//JSON.parse(localStorage.getItem("uploadedFileMetas"));
    const customUrls = null;//JSON.parse(localStorage.getItem("customUrls"));

    //Cache which sources we chose, and let them process the source ids into ready data entries (classes, races, etc)
    const data = await SourceManager._loadSources({sourceIds: sourceIds, uploadedFileMetas: fileMetas, customUrls: customUrls});

    console.log("DATA", data, sourceIds);
    return data;
  }
  /**
   * Perform some post-processing on entities extracted from sources
   * @param {{class:{}[], background:{}[], classFeature:{}[], race:{}[], monster:{}[], item:{}[]
   * , spell:{}[], subclass:{}[], subclassFeature:{}[], feat:{}[], optionalFeature:{}[], foundryClass:{}[]}} data
   * @returns {{class:{}[], background:{}[], classFeature:{}[], race:{}[], monster:{}[], item:{}[]
   * , spell:{}[], subclassFeature:{}[], feat:{}[], optionalFeature:{}[], foundryClass:{}[]}}
   */
  static _postProcessAllSelectedData(data) {

    data = ImportListClass.Utils.getDedupedData({allContentMerged: data});

    data = ImportListClass.Utils.getBlocklistFilteredData({dedupedAllContentMerged: data});

    delete data.subclass;
    Charactermancer_Feature_Util.addFauxOptionalFeatureEntries(data, data.optionalfeature);

    Charactermancer_Class_Util.addFauxOptionalFeatureFeatures(data.class, data.optionalfeature);
    return data;
  }

  /**
   * Get objects containing information about sources, such as urls, abbreviations and names. Doesn't include any game content itself
   * @param {any} actor
   * @returns {{name:string, isDefault:boolean, cacheKey:string}[]}
   */
  static async _pGetSources({ actor: actor }) {

    const isStreamerMode = true;//Config.get('ui', 'isStreamerMode');

    return [new UtilDataSource.DataSourceSpecial(isStreamerMode ? "SRD" : "5etools", SourceManager._pLoadVetoolsSource.bind(this), {
      cacheKey: '5etools-charactermancer',
      filterTypes: [UtilDataSource.SOURCE_TYP_OFFICIAL_ALL],
      isDefault: true,
      pPostLoad: SourceManager._pPostLoad.bind(this, {
        actor: actor
      })
    }), ...UtilDataSource.getSourcesCustomUrl({
      pPostLoad: SourceManager._pPostLoad.bind(this, {
        isBrewOrPrerelease: true,
        actor: actor
      })
    }), ...UtilDataSource.getSourcesUploadFile({
      pPostLoad: SourceManager._pPostLoad.bind(this, {
        isBrewOrPrerelease: true,
        actor: actor
      })
    }), ...(await UtilDataSource.pGetSourcesPrerelease(ActorCharactermancerSourceSelector._BREW_DIRS, {
      pPostLoad: SourceManager._pPostLoad.bind(this, { isPrerelease: true, actor: actor })
    })), ...(await UtilDataSource.pGetSourcesBrew(ActorCharactermancerSourceSelector._BREW_DIRS, {
      pPostLoad: SourceManager._pPostLoad.bind(this, { isBrew: true, actor: actor })
    }))].filter(dataSource => !UtilWorldDataSourceSelector.isFiltered(dataSource));
  }

  
  static async _getDefaultSourceIds({actor}){
    const isStreamerMode = true;
      //Create a source obj that contains all the official sources (PHB, XGE, TCE, etc)
      //This object will have the 'isDefault' property set to true
      const officialSources = new UtilDataSource.DataSourceSpecial(
        isStreamerMode? "SRD" : "5etools", this._pLoadVetoolsSource.bind(this),
        {
          cacheKey: '5etools-charactermancer',
          filterTypes: [UtilDataSource.SOURCE_TYP_OFFICIAL_ALL],
          isDefault: true,
          pPostLoad: this._pPostLoad.bind(this, { actor: actor })
      });

      const allBrews = await Vetools.pGetBrewSources(...SourceManager._BREW_DIRS);
      console.log("Allbrews", allBrews);
      const chosenBrew = allBrews[202];
      console.log("Adding brew ", chosenBrew);

      const chosenBrewSourceUrl = new UtilDataSource.DataSourceUrl(chosenBrew.name, chosenBrew.url,{
        pPostLoad: this._pPostLoad.bind(this, { isBrew: true, actor: actor }),
        filterTypes: [UtilDataSource.SOURCE_TYP_BREW],
        abbreviations: chosenBrew.abbreviations,
        brewUtil: BrewUtil2,
      });

      return [officialSources, chosenBrewSourceUrl];
  }

  /**
   * Extracts entities such as classes, subclasses, races and backgrounds out of an array of sources
   * @param {{name:string, isDefault:boolean, cacheKey:string}[]} sourceIds
   * @param {any} uploadedFileMetas
   * @param {any} customUrls
   * @returns {{class:{}[], background:{}[], classFeature:{}[], race:{}[], monster:{}[], item:{}[]
   * , spell:{}[], subclass:{}[], subclassFeature:{}[], feat:{}[], optionalFeature:{}[], foundryClass:{}[]}}
   */
  static async _getOutputEntities(sourceIds, uploadedFileMetas, customUrls, getDeduped=false) {

    //Should contain all spells, classes, etc from every source we provide
    const allContentMeta = await UtilDataSource.pGetAllContent({
    sources: sourceIds,
    uploadedFileMetas: uploadedFileMetas,
    customUrls: customUrls,/*
    isBackground,

    page: this._page,

    isDedupable: this._isDedupable,
    fnGetDedupedData: this._fnGetDedupedData,

    fnGetBlocklistFilteredData: this._fnGetBlocklistFilteredData,

    isAutoSelectAll, */
    });

    const out = getDeduped? allContentMeta.dedupedAllContentMerged : allContentMeta;

    //TEMPFIX
    /*  Renderer.spell.populatePrereleaseLookup(await PrereleaseUtil.pGetBrewProcessed(), {isForce: true});
Renderer.spell.populateBrewLookup(await BrewUtil2.pGetBrewProcessed(), {isForce: true});

(out.spell || []).forEach(sp => { Renderer.spell.uninitBrewSources(sp); Renderer.spell.initBrewSources(sp); }); */

    return out;
  }
  static async _pLoadVetoolsSource() {
      const combinedSource = {};
      const [classResult, raceResult, backgroundResult, itemResults, spellResults, featResults, optionalFeatureResults]
      = await Promise.all([Vetools.pGetClasses(), Vetools.pGetRaces(), DataUtil.loadJSON(Vetools.DATA_URL_BACKGROUNDS),
          Vetools.pGetItems(), Vetools.pGetAllSpells(), DataUtil.loadJSON(Vetools.DATA_URL_FEATS), DataUtil.loadJSON(Vetools.DATA_URL_OPTIONALFEATURES)]);
      Object.assign(combinedSource, classResult);
      combinedSource.race = raceResult.race;
      combinedSource.background = backgroundResult.background;
      combinedSource.item = itemResults.item;
      combinedSource.spell = spellResults.spell;
      combinedSource.feat = featResults.feat;
      combinedSource.optionalfeature = optionalFeatureResults.optionalfeature;
      return combinedSource;
  }
  /**
   * Called when a source has been loaded
   * @param {any} data
   * @param {{actor:any, isBrewOrPrerelease:boolean}} opts
   * @returns {any} data
   */
  static async _pPostLoad(opts, data) {
    let isBrew = false; let isPrerelease = false;
    const isBrewOrPrerelease = opts.isBrewOrPrerelease || false;
    if (isBrewOrPrerelease) {
      const { isPrerelease: _isPre, isBrew: _isBrew } =
      UtilDataSource.getSourceType(data, { isErrorOnMultiple: true });
      isPrerelease = _isPre;
      isBrew = _isBrew;
    }

    //Load the actual content
    data = await UtilDataSource.pPostLoadGeneric({ isBrew: isBrew, isPrerelease: isPrerelease }, data);


    if (data.class || data.subclass) {
      //TEMPFIX
      /* const { DataConverterClassSubclassFeature: convSubclFeature  } = await Promise.resolve().then(function () {
        return DataConverterClassSubclassFeature;
      }); */

      const isIgnoredLookup = await DataConverterClassSubclassFeature/*convSubclFeature*/.pGetClassSubclassFeatureIgnoredLookup({ data: data });
      const postLoadedData = await PageFilterClassesFoundry.pPostLoad({
        'class': data.class,
        'subclass': data.subclass,
        'classFeature': data.classFeature,
        'subclassFeature': data.subclassFeature
      }, {
        //'actor': _0x5d48db,
        'isIgnoredLookup': isIgnoredLookup
      });
      Object.assign(data, postLoadedData);
      if (data.class) {
        data.class.forEach(cls => PageFilterClasses.mutateForFilters(cls));
      }
    }
    if (data.feat) { data.feat = MiscUtil.copy(data.feat); }
    if (data.optionalfeature) {
      data.optionalfeature = MiscUtil.copy(data.optionalfeature);
    }
    return data;
  }

  /**
   * @param {any} sourceIds
   */
  static async _setUsedSourceIds(sourceIds){
    SourceManager._testLoadedSources = sourceIds;
  }
  /**
   * @param {{sourceIds:any[], uploadedFileMetas:any, customUrls:any}} sourceInfo
   * @returns {{class:{}[], background:{}[], classFeature:{}[], race:{}[], monster:{}[], item:{}[]
   * , spell:{}[], subclassFeature:{}[], feat:{}[], optionalFeature:{}[], foundryClass:{}[]}}
   */
  static async _loadSources(sourceInfo){
    //Process and post-process the data
    //Get entities such as classes, races, backgrounds using the source ids
    const content = await SourceManager._getOutputEntities(sourceInfo.sourceIds, sourceInfo.uploadedFileMetas, sourceInfo.customUrls, true);
    //Then perform some post processing
    const postProcessedData = SourceManager._postProcessAllSelectedData(content);
    const mergedData = postProcessedData;
    //Make sure that the data always has an array for classes, races, feats, etc, even if none were provided by the sources
    SourceManager._DATA_PROPS_EXPECTED.forEach(propExpected => mergedData[propExpected] = mergedData[propExpected] || []);
    SourceManager._setUsedSourceIds(sourceInfo.sourceIds);
    SourceManager._testUploadedFileMetas = sourceInfo.uploadedFileMetas;

    return mergedData;
  }
  /**
   * Apply new source IDs, and fetch entities from them. Completely reloads the entire character builder.
   * @param {{sourceIds:any[], uploadedFileMetas:any, customUrls:any}} sourceInfo
   */
  static async onUserChangedSources(sourceInfo){
    console.log("We are asked to change to these sources:", sourceInfo);
    //Cache which sources we chose, and let them process the source ids into ready data entries (classes, races, etc)
    const data = await SourceManager._loadSources(sourceInfo);
    //Tear down the existing window
    this._curWindow.teardown();
    //Create a new window
    const window = new CharacterBuilder(data);
    this._curWindow = window;
  }
  static saveSourceIdsToStorage(sourceIds){
    //First, we need to compress the sourceIds into the minimal used information
    const min = sourceIds;//.map(s => {})
    localStorage.setItem(SourceManager.cacheKey, JSON.stringify(min));
  }
  /**
   * @param {any} {actor}
   * @returns {{name:string, isDefault:boolean, cacheKey:string}[]}
   */
  static async _loadSourceIdsFromStorage({actor}){
    //Try to load from localstorage safely
    let sourceIdsMin = [];
    try {
      const str = localStorage.getItem(SourceManager.cacheKey);
      if(!str){return null;}
      const out = JSON.parse(str);
      sourceIdsMin = out;
    }
    catch(e){
      console.error("Failed to parse saved source ids!");
      throw e;
    }
    //Assume something is wrong if no source id is in the array
    //TODO: there is a strange but rare usecase where user wants it this way?
    if(sourceIdsMin.length < 1){return null;}
    //Get all sources. These contain more info than is in the minified version
    const allSources = await this._pGetSources({actor});
    console.log("LOADED SOURCE IDS", sourceIdsMin);

    //Match the full sources to the minified sources we pulled from localstorage
    //Then return the full sources that were matched
    return allSources.filter(src => {
      let match = false; //loop will stop when match is made
      for(let i = 0; !match && i < sourceIdsMin.length; ++i){
        match = sourceIdsMin[i].name == src.name; //Simple name match for now
      }
      return match;
    });
  }
  static minifySourceId(sourceId){
    let out = {name:sourceId.name};
    if(!!sourceId.isDefault){out.isDefault = sourceId.isDefault;}
    //if(!!s._isAutoDetectPrereleaseBrew){out._isAutoDetectPrereleaseBrew = s._isAutoDetectPrereleaseBrew;}
    //if(!!s._isExistingPrereleaseBrew){out._isExistingPrereleaseBrew = s._isExistingPrereleaseBrew;}
    //if(!!sourceId.cacheKey){out.cacheKey = sourceId.cacheKey;}
    return out;
  }
}

Hooks.on("getActorSheetHeaderButtons", getActorHeaderButtons);
