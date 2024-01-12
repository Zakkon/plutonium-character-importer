document.addEventListener('DOMContentLoaded', function () {
    JqueryUtil.initEnhancements();
});
window.addEventListener('load', function () {
   
    initializeAll();

    //prepare export button
    

    //console.log(Vetools._getMaybeLocalUrl("data/class/index.json"));
    //test_loadJSON().then(() => {console.log("Done pinging");});

    //Test using 5etools import
    test_nativeImportContent();
    
    //test_AddClassPage();
});
async function initializeAll(){
    //mimics 'handleReady()' function

    SideDataInterfaces.init();
}
async function test_nativeImportContent(){
    const content = await SourceSelectorTest.getOutputEntities();
    ContentGetter._cachedData = content;
    await ContentGetter.cookClassFeatures(content); //unfortunately this function pulls from _cachedData, so we need to set it before that (i know, needs fixing)
    
    let window = new ParentWindow(ContentGetter._cachedData);
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
class ParentWindow {
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
    
    constructor(data){

        this.parent = this;
        this.createTabs();

        const _root = $("#window-root");
        const $tabClass = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabClass = new WindowTab($tabClass);
        const $tabRace = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabRace = new WindowTab($tabRace);
        const $tabAbilities = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabAbilities = new WindowTab($tabAbilities);
        const $tabBackground = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabBackground = new WindowTab($tabBackground);
        const $tabEquipment = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabEquipment = new WindowTab($tabEquipment);
        const $tabShop = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabShop = new WindowTab($tabShop);
        const $tabSpells = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabSpells = new WindowTab($tabSpells);
        const $tabFeats = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabFeats = new WindowTab($tabFeats);
        const $tabSheet = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(_root);
        this.tabSheet = new WindowTab($tabSheet);

        const DEFAULT_SOURCES = [Parser.SRC_PHB, Parser.SRC_DMG, Parser.SRC_XGE, Parser.SRC_VGM, Parser.SRC_MPMM];

        this.data = data;

        this._featureSourceTracker = new Charactermancer_FeatureSourceTracker();

        this.compClass = new ActorCharactermancerClass(this);
        this.compRace = new ActorCharactermancerRace(this);
        this.compAbility = new ActorCharactermancerAbility(this);
        this.compBackground = new ActorCharactermancerBackground(this);
        this.compEquipment = new ActorCharactermancerEquipment(this);
        this.compSpell = new ActorCharactermancerSpell(this);
        this.compFeat = new ActorCharactermancerFeat(this);
        this.compSheet = new ActorCharactermancerSheet(this);

        const exportBtn = $("#btn_export");
        exportBtn.click(() => {
            this.compSheet.test_gatherExportInfo();
        });
        

        const testApplyDefaultSources = () => {
            HelperFunctions.setModalFilterSourcesStrings(this.compBackground.modalFilterBackgrounds, DEFAULT_SOURCES);
            HelperFunctions.setModalFilterSourcesStrings(this.compRace.modalFilterRaces, DEFAULT_SOURCES);
        }
        

        this.pLoad().then(() => this.renderComponents()).then(() => testApplyDefaultSources()).then(() => this.e_switchTab("class"));
    }

    _createTabWrapper(name, rootDiv){
        const el = $(`<div class="ui-tab__wrp-tab-body ve-flex-col ui-tab__wrp-tab-body--border"></div>`).appendTo(rootDiv);
        this[name] = new WindowTab(el);
    }
    createTabs(){
        const tabHolder = $(`.tab_button_holder`);
        //Create the tabs

        //Class tab (mark as active)
        const clsBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Class</button>`).click(()=>{
            this.e_switchTab("class");
        }).appendTo(tabHolder);
        const raceBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Race</button>`).click(()=>{
            this.e_switchTab("race");
        }).appendTo(tabHolder);
        const ablBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Abilities</button>`).click(()=>{
            this.e_switchTab("abilities");
        }).appendTo(tabHolder);
        const bckBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Background</button>`).click(()=>{
            this.e_switchTab("background");
        }).appendTo(tabHolder);
        const startEqBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Starting Equipment</button>`).click(()=>{
            this.e_switchTab("startingEquipment");
        }).appendTo(tabHolder);
        const eqShopBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Equipment Shop</button>`).click(()=>{
            this.e_switchTab("shop");
        }).appendTo(tabHolder);
        const spellsBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Spells</button>`).click(()=>{
            this.e_switchTab("spells");
        }).appendTo(tabHolder);

        const featsBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Feats</button>`).click(()=>{
            this.e_switchTab("feats");
        }).appendTo(tabHolder); 
        const shtBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Sheet</button>`).click(()=>{
            this.e_switchTab("sheet");
        }).appendTo(tabHolder);
        

        this.tabButtonParent = tabHolder;
        clsBtn.addClass("active");
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
/**Don't think of this as a tab button, but more as a tab screen */
class WindowTab {
    $wrpTab;
    constructor(parentDiv){
        this.$wrpTab = parentDiv;
    }
    
}