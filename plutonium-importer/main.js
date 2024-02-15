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
        await importer.createData();
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
    CharacterImporter.AppTaskRunner = pl.api.util.apps.AppTaskRunner;
    CharacterImporter.TaskClosure = pl.api.util.apps.TaskClosure;
    CharacterImporter.Charactermancer_Class_ProficiencyImportModeSelect = pl.api.charactermancer.Charactermancer_Class_ProficiencyImportModeSelect;
    CharacterImporter.Charactermancer_FeatureOptionsSelect = pl.api.charactermancer.Charactermancer_FeatureOptionsSelect;
    CharacterImporter.Charactermancer_Class_Util = pl.api.charactermancer.Charactermancer_Class_Util;
    CharacterImporter.DataUtil = pl.api.util.apps.DataUtil;
    CharacterImporter.api = pl.api;
  }
  async loadSources(){
    //How do we load sources?
    await SourceManager._pOpen(this._actor);
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
    //_state is the object which contains all the choices we have made during the character creation process
    this._state = {
      class_0_cntAsi: 0, //How many ability score improvements are we going past?
      class_0_curLevel:0, //starting level
      class_0_ixClass:0, //index of the class in the dropdown menu
      class_0_targetLevel:1, //target level of the class
      class_ixMax: 0, //count of how many classes we are using
      class_ixPrimaryClass:0, //index of the primary class (in relation to how many classes we have)
      class_pulseChange:true, //not sure
      class_totalLevels: 1, //how many level ups
    }
  }
  
  //TIP: this is getClass_
  //Think of propIxClass as the 1st key. this(ActorCharactermancer) has a object called _state, wherein there is a property with that 1st key's identical name.
  //this property ("class_0_ixClass", most of the time) contains the index of the class we chose as our 0th's class, in relation to full list of class options. It's our 2nd key
  //that full list is under this._data.class. It's going to have tons of classes, but if we use the 2nd key as an index, we get the class we chose
  //this class object should be the exact same as the json of the class. full stop.
  getClass_({ix:i,propIxClass:pi}){
    if(i==null&&pi==null)throw new Error("Unable to fetch class, no index given");
    if(pi!=null){
      if(this._state[pi]==null){return null;} //if this_state[_0x21ca68] (2nd input parameter) == null
      //bitwise NOT operation (google it). havent seen it trigger yet
      if(!~this._state[pi]){console.warn("getClassStub"); return DataConverterClass.getClassStub();} //this._state[_0x21ca68]) return DataConverterClass["getClassStub"]
      return this._data.class[this._state[pi]]; //return this._data.class.[this._state[_0x21ca68]]
    }
    if(i!=null&&~i){return this._data.class[i];}
    console.warn("getClassStub");
    return DataConverterClass.getClassStub();
  }
  _getSubclass({cls:c,propIxSubclass:pi,ix:i}){
    if(i==null&&pi==null)throw new Error("Unable to fetch subclass, no index given");
    if(!c)return null;
    if(pi!=null){
      if(this._state[pi]==null)return null;
      if(!~this._state[pi])return DataConverterClass.getSubclassStub({'cls':c});
      if(!c.subclasses?.length)return DataConverterClass.getSubclassStub({'cls':c}); //c.subclasses?.
      return c.subclasses[this._state[pi]];
    }
    if(i!=null&&~i)return c.subclasses[i];
    return DataConverterClass.getSubclassStub({'cls':c});
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
    const _0x4548cc_exstFeatureChk = this['_existingClassMetas'][_0x4ba617] ? new CharacterImporter.Charactermancer_Class_Util['ExistingFeatureChecker'](this['_actor']) : null
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
    await new CharacterImporter.AppTaskRunner({
      tasks: [
        //This task will set class stuff
        this._pHandleSaveClick_getClosure({ //This is called when the task is complete
          pFn: this._pHandleSaveClick_class.bind(this), //This is the main function of the task
          msgStart: "Setting class stuff...",
          msgComplete: "Class stuff set."
          }),
        ]
        .filter(Boolean),
        'titleInitial': 'Building...',
        'titleComplete': "Build Complete",
        'isStopOnError': !![]
    }).pRun();
  }
  async _testTask({taskRunner:myRunner}){
    console.log("Task completed!"); return true;
  }
  _pHandleSaveClick_getClosure({pFn: func, msgStart: _mStart, msgComplete: _mComp}) {
    return new CharacterImporter.TaskClosure({
        'fnGetPromise': async({taskRunner: r})=>{
            const lineMeta = r['addLogLine'](_mStart);
            r['pushDepth']();
            try {
                await func({'taskRunner': r}),
                this._pHandleSaveClick_getClosure_handleSuccess({
                    'taskRunner': r,
                    'taskRunnerLineMeta': lineMeta,
                    'msgComplete': _mComp
                });
            } catch (err) {
                this._pHandleSaveClick_getClosure_handleFailure({
                    'taskRunner': r,
                    'taskRunnerLineMeta': lineMeta
                });
                throw err;
            }
        }
    });
  }
  _pHandleSaveClick_getClosure_handleSuccess({taskRunner: runner, taskRunnerLineMeta: lineMeta, msgComplete: msgComp}) {
    runner['popDepth'](),
    runner.addLogLine(msgComp, {'linkedLogLineMeta': lineMeta});
  }
  _pHandleSaveClick_getClosure_handleFailure({taskRunner: runner, taskRunnerLineMeta: lineMeta}) {
    runner['popDepth'](),
    runner.addLogLine('Build failed! See the console!', {
        'isError': !![],
        'linkedLogLineMeta': lineMeta
    });
  }

  async _pHandleSaveClick_class({taskRunner:myRunner}){ //_pHandleSaveClick_class function
    const myClasses=[]; //Array of objects, each obj contains full class and full subclass data, along with bool if primary
    //----Lets start populating this array----

    //for(let ix = 0; ix < this.ActorCharactermancerClass.state.class_ixMax + 1; ++ix) //state, not _state
    //Probably going through each class on the character
    for(let ix1 = 0; ix1 < this._state['class_ixMax']+1; ++ix1){
      //propIxClass = class_0_ixClass
      //propIxSubclass = class_0_subclass_ixSubclass
      const {propIxClass, propIxSubclass} = MancerBaseComponent.class_getProps(ix1);
      const myClass = this.getClass_({propIxClass:propIxClass});
      console.log("CLASS IX", propIxClass, ix1);
      console.log("data", this._data);
      console.log(myClass);
      for(let f of myClass.classFeatures){
        if (typeof f !== "object") {console.error("class features not set up correctly");}
      }
      if(!myClass){continue;} //This should be an entire class object, all features and everything, up to lvl 20. its the same as the class json

      //Try to get the subclass obj
      const mySubclass = this._getSubclass({cls:myClass, propIxSubclass:propIxSubclass});

      myClasses.push({
        ix:ix1, //index of class (in relation to how many we have on us)
        cls:myClass, //full class object
        sc:mySubclass, //full subclass object (or null) (chosen subclass)
        isPrimary:this._state['class_ixPrimaryClass']===ix1 //says if this is primary true/false
      });
    }
     //----Array is now populated----

    //For the next part to continue, we need to have at least one class in the array
    if(myClasses['length']){
      //Sort the classes (i guess primary goes first?)
      myClasses['sort']((_0x49bcf2,_0x2531e5)=>SortUtil['ascSort'](Number(_0x2531e5['isPrimary']),
        Number(_0x49bcf2['isPrimary']))||SortUtil['ascSort'](_0x49bcf2[_0x3b80b4(0x151)][_0x3b80b4(0x1cc)],_0x2531e5[_0x3b80b4(0x151)]['name']));

      //Not sure what an imporlistclass is yet
      //which has a PageFilterClassesRaw
      const _0x53be9f_impl=new CharacterImporter.api.importer.ImportListClass({'actor':this._actor}); //actor is of course this._actor
      await _0x53be9f_impl.pInit(); //importListClassObj.pInit();
      
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
      for(let ix2=0x0;ix2<myClasses['length'];++ix2){ //standard for loop. go through all of them (_0xaf846e_ourClasses.length)

        //Now we are looking at a single class, and perhaps a subclass attached to it. Lets copy them
        //grab the ix, cls, sc and isPrimary from the iterated object, but give them new names
        const {ix:_0x3b89aa_ix,cls:_0xc6a512_cls,sc:_0x471f46_sc,isPrimary:_0x4f8858_isPrim}=myClasses[ix2],
        _0x49f53d_cls_copy=MiscUtil['copy'](_0xc6a512_cls), //MiscUtil.copy(class object)
        _0x32e5ba_sc_copy=_0x471f46_sc?MiscUtil['copy'](_0x471f46_sc):null; //MiscUtil.copy(subclass object)

        //Tweak the copies a little
        if(_0x32e5ba_sc_copy)delete _0x32e5ba_sc_copy['additionalSpells']; //if we have chosen a subclass, delete the additionalSpells part of it (its a copy anyway)
        if(_0x32e5ba_sc_copy)_0x49f53d_cls_copy['subclasses']=[_0x32e5ba_sc_copy]; //if we have chosen a subclass, make class.subclasses just be an array of our 1 subclass object
        else _0x49f53d_cls_copy['subclasses']=[]; //or just wipe class.subclasses array if we didn't have a subclass selected


        //classObj._foundrySelectedLevelIndices = await this._compClass.compsClassLevelSelect[_0x3b89aa_ix].pGetFormData().data;
        //So we are asking the UI object responsible for letting us choose classes (Charactermancer_Class_LevelSelect) to use their custom version of pGetFormData
        //that function is going to check which level we selected (feels sort of like a repeat but ok)
        //it then adds up all the levels under and including the level we chose, and returns them as an array called 'data'. check isFormComplete if you are unsure if it was succesful
        //_0x49f53d_cls_copy['_foundrySelectedLevelIndices']=await this[_0x3b80b4(0x123)][_0x3b80b4(0x139)][_0x3b89aa_ix][_0x3b80b4(0x194)]()[_0x3b80b4(0x1b7)];
        //Let's create a mockup of that the output is supposed to be
        let lvlar = []; for(let i = 0; i < this._state["class_0_targetLevel"]; ++i){lvlar.push(i);} _0x49f53d_cls_copy['_foundrySelectedLevelIndices'] = lvlar;
        console.log(lvlar);
        if(!_0x49f53d_cls_copy['_foundrySelectedLevelIndices']['length'])continue; //if no .length, continue. That must be a bug, because we should have at least one level (index 0, which is lvl1)
        



        //Get the highest level of all the levels in that array, and add a 1 to it so it's base 1, not base 0
        const _0x2315d7=Math['max'](..._0x49f53d_cls_copy['_foundrySelectedLevelIndices'])+1; //_foundrySelectedLevelIndices+1?
  
        //How we calculate starting proficiencies from a class differs depending if its our primary class, or a multiclass option
        //So we need to make sure that _foundryStartingProficiencyMode is set to the right mode
        _0x49f53d_cls_copy['_foundryStartingProficiencyMode']=_0x4f8858_isPrim? //_foundryStartingProficiencyMode = isPrimary? primary mode. else, multiclass mode
          CharacterImporter.Charactermancer_Class_ProficiencyImportModeSelect['MODE_PRIMARY']:
          CharacterImporter.Charactermancer_Class_ProficiencyImportModeSelect['MODE_MULTICLASS']; //Say if we are singleclass or multiclass mode
        
        //Check if the hp increase mode is anything other than 0. 0=average, 1=min value, 2=max value, 3=roll, 4=roll(custom formula), 5=donotincreasehp
        const HP_INCREASE_MODE = 0;
        if(//this['_compClass']['compsClassHpIncreaseMode'][_0x3b89aa_ix]
        HP_INCREASE_MODE
        ){
          //Ask the UI what mode and formula we set for the hp increase
          const {mode:_0x37ccf8,customFormula:_0x30c459}=(await this['_compClass']['compsClassHpIncreaseMode'][_0x3b89aa_ix]['pGetFormData']())['data'];
          //Then make sure our class uses the same mode and formula
          _0x49f53d_cls_copy['_foundryHpIncreaseMode']=_0x37ccf8,
          _0x49f53d_cls_copy['_foundryHpIncreaseCustomFormula']=_0x30c459;
        }

        _0x49f53d_cls_copy['_foundryAllFeatures']=[];
        //Debug, circumvent the whole UI and just create formDatas using the features we have on hand
        let formDatas = await this._getFeatureFormData(_0x49f53d_cls_copy.classFeatures);
        console.log(formDatas);
        for(let fd of formDatas){
          if(fd?.data?.features?.length) //If our class gave us at least 1 feature
            _0x49f53d_cls_copy['_foundryAllFeatures'].push(...fd.data.features);
        }
        console.log("foundryAllFeatures");
        console.log(_0x49f53d_cls_copy._foundryAllFeatures);

        //Again ask the UI, this time for our class's FeatureOption's select
        //I think this list contains all the 'Features' (Spellcasting, Rage, Unarmored Defence, etc) that we're given by our class up to our level
        
        //We need to get the feature OptionSets
        //this creates a Charactermancer_FeatureOptionsSelect object which contains a lot more info than just the feature
        //These objects are normally created during runtime when settings are tweaked in the character creator UI.
        
        let _features = []; //DEBUG TO AVOID LOOP
        for(const _0x1862c4_ftoptsel of //this['_compClass']['compsClassFeatureOptionsSelect'][_0x3b89aa_ix]
          _features
        )
        {
          //by converting it into a formdata, we get a lot of improvements. in all, it makes the feature readable and usable by foundry
          const _0x195903_ftoform=await _0x1862c4_ftoptsel['pGetFormData']() //Then get the formData from that (see Charactermancer_FeatureOptionsSelect.pGetFormData)
          //formData = {isFormComplete:true, data: {feature...}}
          //lets try that mockup
          //{isFormComplete:true, data: {feature...}}
          ,
          _0x237cd5={'system':{}};

          //I suspect this has something to do with formdata.data, maybe it gets double layered as data sometimes. either way, sometimes this does nothing
          //OH! i think this might be rage, ki points etc
          //it aborts if formData.data.formDatasResources is null or length of 0
          //---APPLY RESOURCES---
          //await CharacterImporter.Charactermancer_FeatureOptionsSelect['pDoApplyResourcesFormDataToActor']({'actor':this._actor,'formData':_0x195903_ftoform }),
          
          //---APPLY SENSES---
          //I suspect this has something to do with extra senses being granted by a feature, like blindsight
          //it aborts if formData.data.formDatasSenses is null or length of 0 
          /* await CharacterImporter.Charactermancer_FeatureOptionsSelect['pDoApplySensesFormDataToActor']({
            'actor':this._actor,
            'actorUpdate':_0x237cd5,
            'formData':_0x195903_ftoform,
            'configGroup':'importClassSubclassFeature'
          }); */

          //Now it gets interesting. We're finally pushing the features to the _foundryAllFeatures array.
          if(_0x195903_ftoform?.data?.features?.length) //If our class gave us at least 1 feature
            _0x49f53d_cls_copy['_foundryAllFeatures'].push(..._0x195903_ftoform.data.features); //push them to the _foundryAllFeatures array

          //Now its time to get a lot of stuff, like language, tool, weapon, armor, saves, condition and skill proficiencies, damage vulnerabilities, etc etc 
          //await Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(this._actor, _0x237cd5,_0x195903_ftoform)
          //---APPLY PROFICIENCIES---
          await CharacterImporter.Charactermancer_FeatureOptionsSelect['pDoApplyProficiencyFormDataToActorUpdate'](this._actor,_0x237cd5,_0x195903_ftoform),
            (Object['keys'](_0x237cd5['system'])['length']||Object['keys'](_0x237cd5['prototypeToken']||
            //Here I think we update the document with that info!
            {})['length'])&&await UtilDocuments['pUpdateDocument'](this._actor,_0x237cd5,{'isRender':![]});
        }



        //Delete additionalSpells
        delete _0x49f53d_cls_copy['additionalSpells'],
        _0x49f53d_cls_copy['_foundryAllFeatures']['forEach'](_0x20b3a5=>delete _0x20b3a5?.['entity']?.['additionalSpells']);


        this['_isLevelUp']&&(_0x49f53d_cls_copy['_foundryConInitial']=this['_conInitialWithModifiers'],
          _0x49f53d_cls_copy['_foundryConFinal']=this['_conFinalWithModifiers']);

        
        _0x49f53d_cls_copy['_foundryIsSkipImportPreparedSpells']=!![], _0x49f53d_cls_copy['_foundryIsSkipImportCantrips']=!![],
          //--APPLY SKILL PROFICIENCIES--
          /* await this['_pHandleSaveClick_pDoApplySkills']([this['_compClass']['compsClassSkillProficiencies'][_0x3b89aa_ix]],_0x49f53d_cls_copy,
            [..._0x4f8858_isPrim?['startingProficiencies','skills']:['multiclassing','proficienciesGained','skills']]), */
            //--APPLY TOOL PROFICIENCIES--
          /* await this['_pHandleSaveClick_pDoApplyTools']([this['_compClass']['compsClassToolProficiencies'][_0x3b89aa_ix]],
            _0x49f53d_cls_copy,..._0x4f8858_isPrim?[['startingProficiencies','toolProficiencies'],['startingProficiencies','tools']]:[['multiclassing',
            'proficienciesGained','toolProficiencies'],['multiclassing','proficienciesGained','tools']]) */
          delete _0x49f53d_cls_copy['startingEquipment'];

        //const _0x2c5e9a=this['_compSpell']['compsSpellSpellSlotLevelSelect'][_0x3b89aa_ix];

        //TEST
        //Right now as we import the class, its asking us to make choices like hit dice, skills, etc
        //A way to avoid these choices is to remove them from the class obj copy
        delete _0x49f53d_cls_copy.hd;
        delete _0x49f53d_cls_copy.startingProficiencies;
        //Let's double check if our class obj has classFeatures correctly set up
        
        //END TEST

        console.log("pImportClass time!");
        await this._importApplyClassToActor(_0x49f53d_cls_copy, _0x53be9f_impl, myRunner, _0x37641b);

        /* for(const _0x1cafa7 of this['_compClass']['compsClassFeatureOptionsSelect'][_0x3b89aa_ix]){
          const _0x454e55=await _0x1cafa7['pGetFormData']();
          await Charactermancer_FeatureOptionsSelect['pDoApplyAdditionalSpellsFormDataToActor']({
            'actor':this['_actor'],
            'formData':_0x454e55,
            'abilityAbv':_0x471f46_sc?.['spellcastingAbility']||_0xc6a512_cls['spellcastingAbility'],
            'taskRunner':myRunner
          });
        } */
      }
    }
  }

  /**Returns an array of formData. Converts classFeature objects into formDatas that FoundryVTT can import to actors, and beautifies the 'entries' string array. Requires the classFeature objects to be prepared with the 'loadeds' property. */
  async _getFeatureFormData(features){
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
        console.log("input optionSets:"); console.log(optSets);
        //if (topL.level < _0x1dec8f || topL.level > _0x38b4f6) { continue; } //we are not going to bother with the level of the feature for now
        if (topL.name.toLowerCase() === 'ability score improvement') {counter++; continue; }
        //Loop through the optionSets
        for (const set of optSets) {
          //Create a new Charactermancer_FeatureOptionsSelect for the optionsset
            const feOptSel = new CharacterImporter.api.charactermancer.Charactermancer_FeatureOptionsSelect({ //Here is one of only 2 places where these are created. (other is _feat_pRenderFeatureOptionsSelects_)
                //keep in mind 'this' is supposed to refer to a ActorCharactermancerClass. the parent is an ActorCharactermancer type object
                'featureSourceTracker': null,//this._parent['featureSourceTracker_'], //what is parent? what is point of this tracker?
                'existingFeatureChecker': null,//_0x4548cc_exstFeatureChk, //what is this and what is the point of it?
                'actor': this._actor, //obvious
                'optionsSet': set, //what this is all about
                'level': topL.level,
                'modalFilterSpells': null,//this._parent['compSpell']['modalFilterSpells']
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
      'filterValues':filterValues,
      'isCharactermancer':!![],
      'spellSlotLevelSelection':null,//_0x2c5e9a?.['isAnyChoice']()?_0x2c5e9a['getFlagsChoicesState']():null,
      'taskRunner':taskRunner
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
