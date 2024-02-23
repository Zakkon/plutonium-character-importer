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
        let importer = new CharacterImporter(sheet.actor);
        await importer.init();
        const importedCharacter = await importer.showPastePopup();
        await importer.loadSources();
        importer.createState(importedCharacter);
        importer.startImport();
      },
      label: "Import"
  });
}

class CharacterImporter{
  myActor;
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
   */
  constructor(actor){
    this._actor = actor;
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
  async showPastePopup(){
    //new MyFormApplication('example').render(true);
    const dialogContent = `<form><textarea name="text" placeholder="Paste your json here..." style="height:300px; width:500px"></textarea></form>`;
    const result = await new Promise((resolve, reject) => {
      const dialog = new Dialog({
        title: "Import Character JSON",
        content: dialogContent,
        buttons:{
          submit: {label: "Submit", callback: (html) => {
            const formData = new FormDataExtended(html[0].querySelector('form')).object;
            resolve(formData);
          }},
        },
        close: () => {reject('User closed dialog without making a selection')},
      });
      dialog.render(true);
    });

    console.log("RESULT:", result);

    return JSON.parse(result.text);

    return result.text;
  }
  async loadSources(){
    //How do we load sources?
    //TODO: load custom sources?
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
  createState(fromJson){

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

    this.json = fromJson;
    
    console.log("JSON:", this.json);
  }
  getClassByUid_({ix, propIxClass, classUid}){
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
  getSubclassByUid_({cls, propIxSubclass, ix, subclassUid}){
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

    if(!this.json.classes){return;}
    //for(let ix = 0; ix < this.ActorCharactermancerClass.state.class_ixMax + 1; ++ix) //state, not _state
    //Probably going through each class on the character
    for(let i = 0; i < this.json.classes.length; ++i){
      const _clsInfo = this.json.classes[i];
      const myClass = _clsInfo.classEntity; //this.getClassByUid_({classUid:_clsInfo.classUid});
      for(let f of myClass.classFeatures){
        if (typeof f !== "object") {console.error("class features not set up correctly");}
      }
      if(!myClass){continue;} //This should be an entire class object, all features and everything, up to lvl 20. its the same as the class json

      //Try to get the subclass obj
      const mySubclass = _clsInfo.subclassEntity;
      //_clsInfo.subclassUid? this.getSubclassByUid_({cls:myClass, subclassUid:_clsInfo.subclassUid}) : null;

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

    if(!this.json?.race?.raceEntity){return;}
    const raceStub = this.json.race.raceEntity;
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
        forms: this.json.race.langProfs,
        toObj: raceData,
        path: ['languageProficiencies']
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        forms: this.json.race.expertises,
        toObj: raceData,
        path: ["expertise"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        forms: this.json.race.armorProfs,
        toObj: raceData,
        path: ["armorProficiencies"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        forms: this.json.race.weaponProfs,
        toObj: raceData,
        path: ["weaponProficiencies"]
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        forms: this.json.race.dmgImmunities,
        toObj: raceData,
        path: ["immune"],
        isLegacy: true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        forms: this.json.race.dmgResistances,
        toObj: raceData,
        path: ["resist"],
        isLegacy: true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        forms: this.json.race.dmgVulnerabilities,
        toObj: raceData,
        path: ['vulnerable'],
        isLegacy: true
      });
      await this._pHandleSaveClick_pDoApplyTraitLike({
        forms: this.json.race.conImmunities,
        toObj: raceData,
        path: ["conditionImmune"],
        isLegacy: true
      });
      await importList.pImportEntry(raceData, {
        isCharactermancer: true,
        taskRunner: taskRunner
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
        form.data.spells[i].spell = obj.spellEntity;//getSpellFromData(obj.spellId);
      }
      return form;
    }

    const spellsBySource = this.json.spells.spellsBySource;
    console.log("JSON", this.json);
    for(let i = 0; i < spellsBySource.length; ++i){
      const source = spellsBySource[i];
      const { propIxClass: propIxClass, propIxSubclass: propIxSubclass } = MancerBaseComponent.class_getProps(i);
      const cls = this.json.classes[i].classEntity; //this.getClassByUid_({ propIxClass: propIxClass });
      if (!cls) { continue; }
      const sc = this.json.classes[i].subclassEntity;//this.getSubclassByUid_({ cls: cls, propIxSubclass: propIxSubclass });
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
    if(!bk?.backgroundUid){return;}
    const background = bk.backgroundEntity;
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

class MyFormApplication extends FormApplication {
  constructor(exampleOption) {
    super();
    this.exampleOption = exampleOption;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      template: `/modules/plutonium-character-importer/plutonium-importer/myFormApplication.html`,
      id: 'my-form-application',
      title: 'My FormApplication',
    });
  }

  getData() {
    // Send data to the template
    return {
      msg: this.exampleOption,
      color: 'red',
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  async _updateObject(event, formData) {
    console.log(formData.exampleInput);
  }
}
window.MyFormApplication = MyFormApplication;
