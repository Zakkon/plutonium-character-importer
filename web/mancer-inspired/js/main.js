document.addEventListener('DOMContentLoaded', function () {
    JqueryUtil.initEnhancements();
});
window.addEventListener('load', function () {
   
    handleInit().then(() => handleReady()).then(() => test_nativeImportContent());

    //prepare export button
    

    //console.log(Vetools._getMaybeLocalUrl("data/class/index.json"));
    //test_loadJSON().then(() => {console.log("Done pinging");});

    //Test using 5etools import
    test_nativeImportContent();
    
    //test_AddClassPage();
});
async function handleInit(){
    Config.prePreInit();
}
async function handleReady(){
 //mimics 'handleReady()' function

 SideDataInterfaces.init();
}
async function test_nativeImportContent(){
    const content = await SourceSelectorTest.getOutputEntities();
    ContentGetter._cachedData = content;
    await ContentGetter.cookClassFeatures(content); //unfortunately this function pulls from _cachedData, so we need to set it before that (i know, needs fixing)
    
    let window = new CharacterBuilder(ContentGetter._cachedData);
}
class SourceSelectorTest {
    static async getOutputEntities() {

        const officialSources = new UtilDataSource.DataSourceSpecial("SRD", this._pLoadVetoolsSource.bind(this), {
            'cacheKey': '5etools-charactermancer',
            'filterTypes': [UtilDataSource.SOURCE_TYP_OFFICIAL_ALL],
            'isDefault': true,
            //'pPostLoad': this._pPostLoad.bind(this, {'actor': _0x2344b6 })
        });
        const sources = [officialSources];

        //Should contain all spells, classes, etc from every source we provide
        const allContentMeta = await UtilDataSource.pGetAllContent({
			sources,
			/* uploadedFileMetas: this.uploadedFileMetas,
			customUrls: this.getCustomUrls(),
			isBackground,

			page: this._page,

			isDedupable: this._isDedupable,
			fnGetDedupedData: this._fnGetDedupedData,

			fnGetBlocklistFilteredData: this._fnGetBlocklistFilteredData,

			isAutoSelectAll, */
		});

        const out = allContentMeta.dedupedAllContentMerged;
        //spells have their classes set already, thankfully
        //however class feature's loadeds are not set
        console.log("loaded content", out);
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
      /* static async _pPostLoad(_0x4e0586) {
        if (isBrewOrPrerelease) {
          const {
            isPrerelease: _0xd968a5,
            isBrew: _0xbba490
          } = UtilDataSource.getSourceType(_0x4e0586, {
            'isErrorOnMultiple': true
          });
          _0xd968a5;
          isBrew = _0xbba490;
        }
        _0x4e0586 = await UtilDataSource.pPostLoadGeneric({
          'isBrew': isBrew,
          'isPrerelease': _0xd968a5
        }, _0x4e0586);
        if (_0x4e0586["class"] || _0x4e0586.subclass) {
          const {
            DataConverterClassSubclassFeature: _0x1311c6
          } = await Promise.resolve().then(function () {
            return DataConverterClassSubclassFeature$1;
          });
          const _0x2f74ed = await _0x1311c6.pGetClassSubclassFeatureIgnoredLookup({
            'data': _0x4e0586
          });
          const _0x15dc0a = await PageFilterClassesFoundry.pPostLoad({
            'class': _0x4e0586["class"],
            'subclass': _0x4e0586.subclass,
            'classFeature': _0x4e0586.classFeature,
            'subclassFeature': _0x4e0586.subclassFeature
          }, {
            'actor': _0x5d48db,
            'isIgnoredLookup': _0x2f74ed
          });
          Object.assign(_0x4e0586, _0x15dc0a);
          if (_0x4e0586["class"]) {
            _0x4e0586["class"].forEach(_0x4b57f1 => PageFilterClasses.mutateForFilters(_0x4b57f1));
          }
        }
        if (_0x4e0586.feat) {
          _0x4e0586.feat = MiscUtil.copy(_0x4e0586.feat);
        }
        if (_0x4e0586.optionalfeature) {
          _0x4e0586.optionalfeature = MiscUtil.copy(_0x4e0586.optionalfeature);
        }
        return _0x4e0586;
      } */
}
class SETTINGS{
    static FILTERS = true;
    static PARENTLESS_MODE = true;
    static DO_RENDER_DICE = false;
    static USE_EXISTING = false;
    static LOCALPATH_REDIRECT = true;
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
    
    constructor(data){

        this.parent = this;
        this.createTabs(); //Create the small tab buttons
        this.createPanels(); //Create the panels that hold components

        this.data = data;

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
            this.compSheet.test_gatherExportInfo();
        });
        
        //This is a test to only have certain sources selected as active in the filter
        //Note that this does not delete the sources, and they can still be toggled on again via the filter
        const DEFAULT_SOURCES = [Parser.SRC_PHB, Parser.SRC_DMG, Parser.SRC_XGE, Parser.SRC_VGM, Parser.SRC_MPMM];
        const testApplyDefaultSources = () => {
            HelperFunctions.setModalFilterSourcesStrings(this.compBackground.modalFilterBackgrounds, DEFAULT_SOURCES);
            HelperFunctions.setModalFilterSourcesStrings(this.compRace.modalFilterRaces, DEFAULT_SOURCES);
        }
        
        //Call this to let the components load some content before we start using them
        this.pLoad()
        .then(() => this.renderComponents()) //Then render the components
        .then(() => testApplyDefaultSources()) //Use our test function to set only certain sources as active in the filter
        .then(() => this.e_switchTab("class")); //Then switch to the tab we want to start off with
    }

    createTabs(){
        const tabHolder = $(`.tab_button_holder`);
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
        await this.compClass.pLoad();
        await this.compSpell.pLoad();
        await this.compFeat.pLoad();
    }
    renderComponents(){
        this.compClass.render();
        this.compRace.render();
        this.compAbility.render();
        this.compBackground.render();
        this.compEquipment.pRenderStarting();
        this.compEquipment.pRenderShop();
        this.compSpell.pRender();
        this.compFeat.render();
        this.compSheet.render();
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
    //#endregion
    //#region Getters
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

}
/**A wrapper for a div that contains components. Only used by CharacterBuilder */
class CharacterBuilderPanel {
    $wrpTab;
    constructor(parentDiv){
        this.$wrpTab = parentDiv;
    }
    
}