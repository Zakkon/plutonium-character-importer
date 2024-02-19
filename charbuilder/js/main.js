document.addEventListener('DOMContentLoaded', function () {
    JqueryUtil.initEnhancements();
});
window.addEventListener('load', function () {
   
    handleInit().then(() => handleReady().then(() => 
    //SourceManager.defaultStart({actor:null})
    {const charSelect = new CharacterSelectScreen(); charSelect.render();}
    ));
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
  console.log("Init complete");
}
async function handleReady(){
  await Config.pInit(); //Important
  //Prepare indexes of homebrew content
  await Vetools.pDoPreload();
  SideDataInterfaces.init(); //Important
  //Hide rollbox ui
  Renderer.dice._$minRoll.hideVe();
  Renderer.dice._$wrpRoll.hideVe();
  console.log("Ready complete");
}

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
  static async defaultStart({ actor: actor, cookieIx }) {

    //Try to load source ids from localstorage
    let sourceIds = await this._loadSourceIdsFromStorage({actor});
    //If that failed, load default source ids
    if(!sourceIds){sourceIds = await this._getDefaultSourceIds({actor});}

    const fileMetas = JSON.parse(localStorage.getItem("uploadedFileMetas"));
    const customUrls = JSON.parse(localStorage.getItem("customUrls"));

    //Cache which sources we chose, and let them process the source ids into ready data entries (classes, races, etc)
    const data = await SourceManager._loadSources({sourceIds: sourceIds, uploadedFileMetas: fileMetas, customUrls: customUrls});

    //Create the character builder UI for the first time
    const window = new CharacterBuilder(data, cookieIx);
    this._curWindow = window;
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
      });
      const isIgnoredLookup = await convSubclFeature.pGetClassSubclassFeatureIgnoredLookup({ data: data });
      */

      const isIgnoredLookup = await DataConverterClassSubclassFeature.pGetClassSubclassFeatureIgnoredLookup({ data: data });
      const postLoadedData = await PageFilterClassesFoundry.pPostLoad({
        class: data.class,
        subclass: data.subclass,
        classFeature: data.classFeature,
        subclassFeature: data.subclassFeature
      }, {
        actor: null,
        isIgnoredLookup: isIgnoredLookup
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
  /**
   * @param {any} sourceIds
   */
  static async _setUsedSourceIds(sourceIds){
    SourceManager._testLoadedSources = sourceIds;
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

      /* const allBrews = await Vetools.pGetBrewSources(...SourceManager._BREW_DIRS);

      const chosenBrewSourceUrl = new UtilDataSource.DataSourceUrl(chosenBrew.name, chosenBrew.url,{
        pPostLoad: this._pPostLoad.bind(this, { isBrew: true, actor: actor }),
        filterTypes: [UtilDataSource.SOURCE_TYP_BREW],
        abbreviations: chosenBrew.abbreviations,
        brewUtil: BrewUtil2,
      }); */

      return [officialSources];
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
class SETTINGS{
    static FILTERS = true;
    static PARENTLESS_MODE = true;
    static DO_RENDER_DICE = false;
    static USE_EXISTING = false;
    static LOCK_EXISTING_CHOICES = false;
    /**This boolean toggles loading from a cookie save file */
    static USE_EXISTING_WEB = true;
    static LOCALPATH_REDIRECT = true;
    static USE_FVTT = false;
    /**Should changing class/race that transfer the already set choices (for like proficiencies?), so if both the new and the old race could pick Perception as a proficiency, and the old one did, make sure the new one also has that choice set */
    static TRANSFER_CHOICES = false;
    static DICE_TOMESSAGE = false;
    //By default, this is off. This means that loading in a high level character, they dont get to pick any spells that they would have gained at earlier levels
    //Turning this to true fixes that, and lets us pick spells from lower levels
    static GET_CASTERPROG_UP_TO_CURLEVEL = true;
    static GET_FEATOPTSEL_UP_TO_CURLEVEL = true;
    static SPECIFIED_ABILITY_SAVE = false;
}
class CharacterBuilder {
    tabButtonParent;
    tabClass;
    tabRace;
    tabAbilities;
    tabBackground;
    tabSpells;
    tabEquipment;
    tabShop;
    tabFeats;
    tabSheet;
    compClass;
    compRace;
    compAbility;
    compBackground;
    compEquipment;
    compSpell;
    compFeat;
    compSheet;
    tabs;
    _featureSourceTracker;
    
    /**
     * @param {{class:{}[], background:{}[], classFeature:{}[], race:{}[], monster:{}[], item:{}[]
   * , spell:{}[], subclassFeature:{}[], feat:{}[], optionalFeature:{}[], foundryClass:{}[]}} data
     * @returns {CharacterBuilder}
     */
    constructor(data, cookieIx){

      this.parent = this;
      this.createTabs(); //Create the small tab buttons
      this.createPanels(); //Create the panels that hold components

      this._data = data;

      
      let cachedStr = cookieIx? CookieManager.getCharacterInfo(cookieIx).data : null;
      if(!!cachedStr){
        let json = JSON.parse(cachedStr);
        if(!!json){
          this.actor = json.character;
        }
      }

      //Create a feature source tracker (this one gets used alot by the components)
      this._featureSourceTracker = new Charactermancer_FeatureSourceTracker();

      //Create components
      this.compClass = new ActorCharactermancerClass(this);
      this.compRace = new ActorCharactermancerRace(this);
      this.compAbility = new ActorCharactermancerAbility(this);
      this.compBackground = new ActorCharactermancerBackground(this);
      this.compEquipment = new ActorCharactermancerEquipment(this);
      this.compSpell = new ActorCharactermancerSpell(this);
      this.compFeat = new ActorCharactermancerFeat(this);
      this.compSheet = new ActorCharactermancerSheet(this);

      //Configure the export button
      const exportBtn = $("#btn_export");
      exportBtn.click(() => {
          CharacterExportFvtt.exportCharacter(this);
      });
      const sourcesBtn = $("#btn_sources");
      sourcesBtn.click(async() => { await this.e_changeSourcesDialog(); });
      const exportfvttBtn = $("#btn_exportfvtt");
      exportfvttBtn.click(async() => { CharacterExportFvtt.exportCharacterFvtt(this); });
      
      //This is a test to only have certain sources selected as active in the filter
      //Note that this does not delete the sources, and they can still be toggled on again via the filter
      const DEFAULT_SOURCES = [Parser.SRC_PHB, Parser.SRC_DMG, Parser.SRC_XGE, Parser.SRC_VGM, Parser.SRC_MPMM];
      const testApplyDefaultSources = () => {
          //HelperFunctions.setModalFilterSourcesStrings(this.compBackground.modalFilterBackgrounds, DEFAULT_SOURCES);
          HelperFunctions.setModalFilterSourcesStrings(this.compRace.modalFilterRaces, DEFAULT_SOURCES);

          //This is a simple way to toggle on homebrew sources
          this.compClass.modalFilterClasses.pageFilter.sourceFilter._doSetPinsHomebrew({isAdditive:true});
          this.compClass.modalFilterClasses.pageFilter.filterBox.fireChangeEvent();

      }
      
      //Call this to let the components load some content before we start using them
      this.pLoad()
      .then(() => this.renderComponents()) //Then render the components
      .then(() => testApplyDefaultSources()) //Use our test function to set only certain sources as active in the filter
      .then(() => this.e_switchTab("class")); //Then switch to the tab we want to start off with
    }

    createTabs(){
        const _root = $("#window-root");
        const tabHolder = $$`<div class="w-100 no-shrink ui-tab__wrp-tab-heads--border tab_button_holder"></div>`.appendTo(_root);
        const createTabBtn = (label) => {
            return $$`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">${label}</button>`.appendTo(tabHolder);
        }

        //Create the tabs
        createTabBtn("Class").click(()=>{ this.e_switchTab("class"); }).addClass("active"); //Set class button as active
        createTabBtn("Race").click(()=>{ this.e_switchTab("race"); });
        createTabBtn("Abilities").click(()=>{ this.e_switchTab("abilities"); });
        createTabBtn("Background").click(()=>{ this.e_switchTab("background"); });
        createTabBtn("Starting Equipment").click(()=>{ this.e_switchTab("startingEquipment"); });
        createTabBtn("Equipment Shop").click(()=>{ this.e_switchTab("shop"); });
        createTabBtn("Spells").click(()=>{ this.e_switchTab("spells"); });
        createTabBtn("Feats").click(()=>{ this.e_switchTab("feats"); });
        createTabBtn("Sheet").click(()=>{ this.e_switchTab("sheet"); });
        
        this.tabButtonParent = tabHolder;
    }
    createPanels(){

        const _root = $("#window-root");
        const newPanel = () => {return new CharacterBuilderPanel($(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root)); }

        this.tabClass = newPanel();
        this.tabRace = newPanel();
        this.tabAbilities = newPanel();
        this.tabBackground = newPanel();
        this.tabEquipment = newPanel();
        this.tabShop = newPanel();
        this.tabSpells = newPanel();
        this.tabFeats = newPanel();
        this.tabSheet = newPanel();
    }
    async pLoad(){
        if(!SETTINGS.FILTERS){return;}
        await this.compRace.pLoad();
        await this.compBackground.pLoad();
        //This sets state based on what is in the savefile (if USE_EXISTING_WEB) is true
        //Only handles class, subclass, level and isPrimary
        await this.compClass.pLoad();
        await this.compSpell.pLoad();
        await this.compFeat.pLoad();
    }
    renderComponents(){
        //this.compClass.render(); //Goes on for quite long, and will trigger hooks for many ms after
        const doLoad = SETTINGS.USE_EXISTING_WEB && !!this.actor;

        this.compClass.render().then(() => {

          this.compRace.render();
          if(doLoad){this.compRace.setStateFromSaveFile(this.actor);}
          this.compAbility.render();
          

          this.compBackground.render();
          

          this.compEquipment.pRenderStarting().then(() => this.compEquipment.pRenderShop())
            .then(() => {if(doLoad){this.compEquipment.setStateFromSaveFile(this.actor)}});
          
          this.compSpell.pRender().then(() => {if(doLoad){this.compSpell.setStateFromSaveFile(this.actor);}});
          this.compFeat.render();
        

          if(doLoad){this.compAbility.setStateFromSaveFile(this.actor);}
          if(doLoad){this.compBackground.setStateFromSaveFile(this.actor);}
      }).then(()=> {this.compSheet.render();});
    }

    //#region Events
    e_switchTab(tabName){
        //TODO: improve this
        let newActivePanel = null;
        let tabIx = 0;
        this.tabButtonParent.children().each(function() {$(this).removeClass("active");});
        this.setActive(this.tabClass.$wrpTab, false);
        this.setActive(this.tabRace.$wrpTab, false);
        this.setActive(this.tabAbilities.$wrpTab, false);
        this.setActive(this.tabBackground.$wrpTab, false);
        this.setActive(this.tabEquipment.$wrpTab, false);
        this.setActive(this.tabShop.$wrpTab, false);
        this.setActive(this.tabSpells.$wrpTab, false);
        this.setActive(this.tabFeats.$wrpTab, false);
        this.setActive(this.tabSheet.$wrpTab, false);

        switch(tabName){
            case "class": newActivePanel = this.tabClass; tabIx = 0; break;
            case "race": newActivePanel = this.tabRace; tabIx = 1; break;
            case "abilities": newActivePanel = this.tabAbilities; tabIx = 2; break;
            case "background": newActivePanel = this.tabBackground; tabIx = 3; break;
            case "startingEquipment": newActivePanel = this.tabEquipment; tabIx = 4; break;
            case "shop": newActivePanel = this.tabShop; tabIx = 5; break;
            case "spells": newActivePanel = this.tabSpells; tabIx = 6; break;
            case "feats": newActivePanel = this.tabFeats; tabIx = 7; break;
            case "sheet": newActivePanel = this.tabSheet; tabIx = 8; break;
        }
        const pressedBtn = this.tabButtonParent.children().eq(tabIx);
        pressedBtn.addClass("active");
        this.setActive(newActivePanel.$wrpTab, true);
    }
    async e_changeSourcesDialog(){
      //Get all available sources
      const allSources = await SourceManager._pGetSources({actor: this.actor});
      //Get the names of the sources we already have set as enabled
      const preEnabledSources = SourceManager._testLoadedSources;
      const sourceSelector = new ActorCharactermancerSourceSelector({
        title: "Select Sources",
        filterNamespace: 'ActorCharactermancerSourceSelector_filter',
        savedSelectionKey: "ActorCharactermancerSourceSelector_savedSelection",
        sourcesToDisplay: allSources,
        preEnabledSources: preEnabledSources
      });
      const result = await sourceSelector.pWaitForUserInput();
      //if (result == null || result.sourceIds == null) { return; }
      //Write the new sourceIds to localstorage, so next time website refreshes, they will be auto-enabled
      SourceManager.saveSourceIdsToStorage(result.sourceIds);
      //temp
      localStorage.setItem("uploadedFileMetas", JSON.stringify(result.uploadedFileMetas));
      localStorage.setItem("customUrls", JSON.stringify(result.customUrls));

      //Then tell SourceManager that we have these new sourceIds, and let them take it from here
      SourceManager.onUserChangedSources(result);
    }
    //#endregion
    //#region Getters
    /**
     * @returns {{class:{}[], background:{}[], classFeature:{}[], race:{}[], monster:{}[], item:{}[]
   * , spell:{}[], subclassFeature:{}[], feat:{}[], optionalFeature:{}[], foundryClass:{}[]}}
     */
    get data(){
      return this._data;
    }
    get featureSourceTracker_() {
        return this._featureSourceTracker;
    }
    //#endregion
    
    setActive($tab, active){
        const hi = "ve-hidden";
        if(!$tab){return;}
        if(active && $tab.hasClass(hi)){$tab.removeClass(hi);}
        else if(!active && !$tab.hasClass(hi)){$tab.addClass(hi);}
    }
    teardown(){
      $(`#window-root`).empty();
    }
}
/**A wrapper for a div that contains components. Only used by CharacterBuilder */
class CharacterBuilderPanel {
    $wrpTab;
    constructor(parentDiv){
        this.$wrpTab = parentDiv;
    }
    
}
class CookieManager {
  static getNumCharacters(){
    const registry = this.getCharacterRegistry();
    return registry?.uids?.length || 0;
  }
  static getState(){
    const foundState = localStorage.getItem("lastState"); //may be null
    return foundState;
  }
  static getCharacterInfo(uid){
    const character = localStorage.getItem(`"char_"${uid}`);
    return {data: character, uid:uid};
  }
  static getAllCharacterInfos(){
    const registry = this.getCharacterRegistry();
    if(!registry || !registry.uids){return [];}
    let output = [];
    for(let i = 0; i < registry.uids.length; ++i){
      output.push(this.getCharacterInfo(registry.uids[i]));
    }
    return output;
  }

  static setState(state){
    localStorage.setItem("lastState", state);
  }
  static saveCharacterInfo(character, uid){
    const str = JSON.stringify(character);
    localStorage.setItem(`"char_"${uid}`, str);
  }
  static saveNewCharacter(character){
    const uid = this.createUid();
    this.addCharacterToRegistry(uid);
    this.saveCharacterInfo(character, uid);
  }
  static addCharacterToRegistry(uid){
    const existingRegistry = this.getCharacterRegistry();
    if(!existingRegistry){
      const newRegistry = {uids:[uid]};
      this.setCharacterRegistry(newRegistry);
      return;
    }
    existingRegistry.uids.push(uid);
    this.setCharacterRegistry(existingRegistry);
  }
  static setCharacterRegistry(registry){
    const str = JSON.stringify(registry);
    localStorage.setItem("character_registry", str);
  }
  static getCharacterRegistry(){
    const str = localStorage.getItem("character_registry");
    if(!str){return null;}
    return JSON.parse(str);
  }
  static createUid(){
    const generateUid = () => {
      return "id" + Math.random().toString(16).slice(2);
    }
    const registry = this.getCharacterRegistry();
    if(!registry || !registry.uids.length){
      return generateUid();
    }
    const MAX_ATTEMPTS = 256;
    for(let i = 0; i < MAX_ATTEMPTS; ++i){
      const id = generateUid();
      if(!registry.uids.includes(id)){return id;}
    }
    throw new Error("Failed to generate a unique ID for character!");
  }
  static deleteCharacter(uid){
    const existingRegistry = this.getCharacterRegistry();
    if(existingRegistry){
      const ix = existingRegistry.uids.indexOf(uid);
      existingRegistry.uids.splice(ix, 1);
    }
    localStorage.removeItem(`"char_"${uid}`);
  }
}