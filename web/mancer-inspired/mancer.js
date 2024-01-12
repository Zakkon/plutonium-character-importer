
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
async function test_loadJSON(){
    const localClassIndexUrl = "data/class/index.json";
    const classIndex = await DataUtil.loadRawJSON(localClassIndexUrl);
    let classDatas = [];
    let addresses = [];
    Object.keys(classIndex).forEach((k,v) => {
        const name = classIndex[k]; addresses.push(name);
    });
    for(let a of addresses){
        let path = "data/class/" + a;
        let result = await DataUtil.loadRawJSON(path);
        if(result){classDatas.push(result);}
    }

    console.log(classDatas);
    //console.log("num classes: ", Object.keys(classIndex).length);

}
async function test_AddClassPage(){

    //Let's grab all the data we can
    let allData = await loadContentData();
    let window = new ParentWindow(allData);
    //Any content we pass on will be enabled by the filter by default
    //It will toggle all the sources as active
    //So we need to find a way to toggle all non-PHB sources as disabled, as a test

    
    
    //Lets try to add it to our DOM
    //comp.render();
}
async function loadContentData(){
    let allData = await ContentGetter._getBase();
    await ContentGetter._cookData(allData);
    return allData;
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
    tabFeats;
    tabSheet;
    compClass;
    compRace;
    compAbility;
    compBackground;
    compStartingEquipment;
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
        this.compStartingEquipment = new ActorCharactermancerEquipment(this);
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
        /*
        const eqShopBtn = $(`<button class="btn btn-default ui-tab__btn-tab-head btn-sm">Equipment Shop</button>`).click(()=>{

        }).appendTo(tabHolder);*/
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
        this.compStartingEquipment.pRenderStarting();
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
        this.setActive(this.tabSpells.$wrpTab, false);
        this.setActive(this.tabFeats.$wrpTab, false);
        this.setActive(this.tabSheet.$wrpTab, false);

        switch(tabName){
            case "class": newActivePanel = this.tabClass; tabIx = 0; break;
            case "race": newActivePanel = this.tabRace; tabIx = 1; break;
            case "abilities": newActivePanel = this.tabAbilities; tabIx = 2; break;
            case "background": newActivePanel = this.tabBackground; tabIx = 3; break;
            case "startingEquipment": newActivePanel = this.tabEquipment; tabIx = 4; break;
            case "spells": newActivePanel = this.tabSpells; tabIx = 5; break;
            case "feats": newActivePanel = this.tabFeats; tabIx = 6; break;
            case "sheet": newActivePanel = this.tabSheet; tabIx = 7; break;
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

//#region UTILITIES 1
//#region Parser
globalThis.Parser = {};
Parser._parse_aToB = function(abMap, a, fallback) {
    if (a === undefined || a === null)
        throw new TypeError("undefined or null object passed to parser");
    if (typeof a === "string")
        a = a.trim();
    if (abMap[a] !== undefined)
        return abMap[a];
    return fallback !== undefined ? fallback : a;
}
;

Parser._parse_bToA = function(abMap, b, fallback) {
    if (b === undefined || b === null)
        throw new TypeError("undefined or null object passed to parser");
    if (typeof b === "string")
        b = b.trim();
    for (const v in abMap) {
        if (!abMap.hasOwnProperty(v))
            continue;
        if (abMap[v] === b)
            return v;
    }
    return fallback !== undefined ? fallback : b;
}
;

Parser.attrChooseToFull = function(attList) {
    if (attList.length === 1)
        return `${Parser.attAbvToFull(attList[0])} modifier`;
    else {
        const attsTemp = [];
        for (let i = 0; i < attList.length; ++i) {
            attsTemp.push(Parser.attAbvToFull(attList[i]));
        }
        return `${attsTemp.join(" or ")} modifier (your choice)`;
    }
}
;

Parser.numberToText = function(number) {
    if (number == null)
        throw new TypeError(`undefined or null object passed to parser`);
    if (Math.abs(number) >= 100)
        return `${number}`;

    return `${number < 0 ? "negative " : ""}${Parser.numberToText._getPositiveNumberAsText(Math.abs(number))}`;
}
;

Parser.numberToText._getPositiveNumberAsText = num=>{
    const [preDotRaw,postDotRaw] = `${num}`.split(".");

    if (!postDotRaw)
        return Parser.numberToText._getPositiveIntegerAsText(num);

    let preDot = preDotRaw === "0" ? "" : `${Parser.numberToText._getPositiveIntegerAsText(Math.trunc(num))} and `;

    switch (postDotRaw) {
    case "125":
        return `${preDot}one-eighth`;
    case "2":
        return `${preDot}one-fifth`;
    case "25":
        return `${preDot}one-quarter`;
    case "375":
        return `${preDot}three-eighths`;
    case "4":
        return `${preDot}two-fifths`;
    case "5":
        return `${preDot}one-half`;
    case "6":
        return `${preDot}three-fifths`;
    case "625":
        return `${preDot}five-eighths`;
    case "75":
        return `${preDot}three-quarters`;
    case "8":
        return `${preDot}four-fifths`;
    case "875":
        return `${preDot}seven-eighths`;

    default:
        {
            const asNum = Number(`0.${postDotRaw}`);

            if (asNum.toFixed(2) === (1 / 3).toFixed(2))
                return `${preDot}one-third`;
            if (asNum.toFixed(2) === (2 / 3).toFixed(2))
                return `${preDot}two-thirds`;

            if (asNum.toFixed(2) === (1 / 6).toFixed(2))
                return `${preDot}one-sixth`;
            if (asNum.toFixed(2) === (5 / 6).toFixed(2))
                return `${preDot}five-sixths`;
        }
    }
}
;

Parser.numberToText._getPositiveIntegerAsText = num=>{
    switch (num) {
    case 0:
        return "zero";
    case 1:
        return "one";
    case 2:
        return "two";
    case 3:
        return "three";
    case 4:
        return "four";
    case 5:
        return "five";
    case 6:
        return "six";
    case 7:
        return "seven";
    case 8:
        return "eight";
    case 9:
        return "nine";
    case 10:
        return "ten";
    case 11:
        return "eleven";
    case 12:
        return "twelve";
    case 13:
        return "thirteen";
    case 14:
        return "fourteen";
    case 15:
        return "fifteen";
    case 16:
        return "sixteen";
    case 17:
        return "seventeen";
    case 18:
        return "eighteen";
    case 19:
        return "nineteen";
    case 20:
        return "twenty";
    case 30:
        return "thirty";
    case 40:
        return "forty";
    case 50:
        return "fifty";
    case 60:
        return "sixty";
    case 70:
        return "seventy";
    case 80:
        return "eighty";
    case 90:
        return "ninety";
    default:
        {
            const str = String(num);
            return `${Parser.numberToText._getPositiveIntegerAsText(Number(`${str[0]}0`))}-${Parser.numberToText._getPositiveIntegerAsText(Number(str[1]))}`;
        }
    }
}
;

Parser.textToNumber = function(str) {
    str = str.trim().toLowerCase();
    if (!isNaN(str))
        return Number(str);
    switch (str) {
    case "zero":
        return 0;
    case "one":
    case "a":
    case "an":
        return 1;
    case "two":
    case "double":
        return 2;
    case "three":
    case "triple":
        return 3;
    case "four":
    case "quadruple":
        return 4;
    case "five":
        return 5;
    case "six":
        return 6;
    case "seven":
        return 7;
    case "eight":
        return 8;
    case "nine":
        return 9;
    case "ten":
        return 10;
    case "eleven":
        return 11;
    case "twelve":
        return 12;
    case "thirteen":
        return 13;
    case "fourteen":
        return 14;
    case "fifteen":
        return 15;
    case "sixteen":
        return 16;
    case "seventeen":
        return 17;
    case "eighteen":
        return 18;
    case "nineteen":
        return 19;
    case "twenty":
        return 20;
    case "thirty":
        return 30;
    case "forty":
        return 40;
    case "fifty":
        return 50;
    case "sixty":
        return 60;
    case "seventy":
        return 70;
    case "eighty":
        return 80;
    case "ninety":
        return 90;
    }
    return NaN;
}
;

Parser.numberToVulgar = function(number, {isFallbackOnFractional=true}={}) {
    const isNeg = number < 0;
    const spl = `${number}`.replace(/^-/, "").split(".");
    if (spl.length === 1)
        return number;

    let preDot = spl[0] === "0" ? "" : spl[0];
    if (isNeg)
        preDot = `-${preDot}`;

    switch (spl[1]) {
    case "125":
        return `${preDot}⅛`;
    case "2":
        return `${preDot}⅕`;
    case "25":
        return `${preDot}¼`;
    case "375":
        return `${preDot}⅜`;
    case "4":
        return `${preDot}⅖`;
    case "5":
        return `${preDot}½`;
    case "6":
        return `${preDot}⅗`;
    case "625":
        return `${preDot}⅝`;
    case "75":
        return `${preDot}¾`;
    case "8":
        return `${preDot}⅘`;
    case "875":
        return `${preDot}⅞`;

    default:
        {
            const asNum = Number(`0.${spl[1]}`);

            if (asNum.toFixed(2) === (1 / 3).toFixed(2))
                return `${preDot}⅓`;
            if (asNum.toFixed(2) === (2 / 3).toFixed(2))
                return `${preDot}⅔`;

            if (asNum.toFixed(2) === (1 / 6).toFixed(2))
                return `${preDot}⅙`;
            if (asNum.toFixed(2) === (5 / 6).toFixed(2))
                return `${preDot}⅚`;
        }
    }

    return isFallbackOnFractional ? Parser.numberToFractional(number) : null;
}
;

Parser.vulgarToNumber = function(str) {
    const [,leading="0",vulgar=""] = /^(\d+)?([⅛¼⅜½⅝¾⅞⅓⅔⅙⅚])?$/.exec(str) || [];
    let out = Number(leading);
    switch (vulgar) {
    case "⅛":
        out += 0.125;
        break;
    case "¼":
        out += 0.25;
        break;
    case "⅜":
        out += 0.375;
        break;
    case "½":
        out += 0.5;
        break;
    case "⅝":
        out += 0.625;
        break;
    case "¾":
        out += 0.75;
        break;
    case "⅞":
        out += 0.875;
        break;
    case "⅓":
        out += 1 / 3;
        break;
    case "⅔":
        out += 2 / 3;
        break;
    case "⅙":
        out += 1 / 6;
        break;
    case "⅚":
        out += 5 / 6;
        break;
    case "":
        break;
    default:
        throw new Error(`Unhandled vulgar part "${vulgar}"`);
    }
    return out;
}
;

Parser.numberToSuperscript = function(number) {
    return `${number}`.split("").map(c=>isNaN(c) ? c : Parser._NUMBERS_SUPERSCRIPT[Number(c)]).join("");
}
;
Parser._NUMBERS_SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

Parser.numberToSubscript = function(number) {
    return `${number}`.split("").map(c=>isNaN(c) ? c : Parser._NUMBERS_SUBSCRIPT[Number(c)]).join("");
}
;
Parser._NUMBERS_SUBSCRIPT = "₀₁₂₃₄₅₆₇₈₉";

Parser._greatestCommonDivisor = function(a, b) {
    if (b < Number.EPSILON)
        return a;
    return Parser._greatestCommonDivisor(b, Math.floor(a % b));
}
;
Parser.numberToFractional = function(number) {
    const len = number.toString().length - 2;
    let denominator = 10 ** len;
    let numerator = number * denominator;
    const divisor = Parser._greatestCommonDivisor(numerator, denominator);
    numerator = Math.floor(numerator / divisor);
    denominator = Math.floor(denominator / divisor);

    return denominator === 1 ? String(numerator) : `${Math.floor(numerator)}/${Math.floor(denominator)}`;
}
;

Parser.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

Parser.attAbvToFull = function(abv) {
    return Parser._parse_aToB(Parser.ATB_ABV_TO_FULL, abv);
}
;

Parser.attFullToAbv = function(full) {
    return Parser._parse_bToA(Parser.ATB_ABV_TO_FULL, full);
}
;

Parser.sizeAbvToFull = function(abv) {
    return Parser._parse_aToB(Parser.SIZE_ABV_TO_FULL, abv);
}
;

Parser.getAbilityModNumber = function(abilityScore) {
    return Math.floor((abilityScore - 10) / 2);
}
;

Parser.getAbilityModifier = function(abilityScore) {
    let modifier = Parser.getAbilityModNumber(abilityScore);
    if (modifier >= 0)
        modifier = `+${modifier}`;
    return `${modifier}`;
}
;

Parser.getSpeedString = (ent,{isMetric=false, isSkipZeroWalk=false}={})=>{
    if (ent.speed == null)
        return "\u2014";

    const unit = isMetric ? Parser.metric.getMetricUnit({
        originalUnit: "ft.",
        isShortForm: true
    }) : "ft.";
    if (typeof ent.speed === "object") {
        const stack = [];
        let joiner = ", ";

        Parser.SPEED_MODES.filter(mode=>!ent.speed.hidden?.includes(mode)).forEach(mode=>Parser._getSpeedString_addSpeedMode({
            ent,
            prop: mode,
            stack,
            isMetric,
            isSkipZeroWalk,
            unit
        }));

        if (ent.speed.choose && !ent.speed.hidden?.includes("choose")) {
            joiner = "; ";
            stack.push(`${ent.speed.choose.from.sort().joinConjunct(", ", " or ")} ${ent.speed.choose.amount} ${unit}${ent.speed.choose.note ? ` ${ent.speed.choose.note}` : ""}`);
        }

        return stack.join(joiner) + (ent.speed.note ? ` ${ent.speed.note}` : "");
    }

    return (isMetric ? Parser.metric.getMetricNumber({
        originalValue: ent.speed,
        originalUnit: Parser.UNT_FEET
    }) : ent.speed) + (ent.speed === "Varies" ? "" : ` ${unit} `);
}
;
Parser._getSpeedString_addSpeedMode = ({ent, prop, stack, isMetric, isSkipZeroWalk, unit})=>{
    if (ent.speed[prop] || (!isSkipZeroWalk && prop === "walk"))
        Parser._getSpeedString_addSpeed({
            prop,
            speed: ent.speed[prop] || 0,
            isMetric,
            unit,
            stack
        });
    if (ent.speed.alternate && ent.speed.alternate[prop])
        ent.speed.alternate[prop].forEach(speed=>Parser._getSpeedString_addSpeed({
            prop,
            speed,
            isMetric,
            unit,
            stack
        }));
}
;
Parser._getSpeedString_addSpeed = ({prop, speed, isMetric, unit, stack})=>{
    const ptName = prop === "walk" ? "" : `${prop} `;
    const ptValue = Parser._getSpeedString_getVal({
        prop,
        speed,
        isMetric
    });
    const ptUnit = speed === true ? "" : ` ${unit}`;
    const ptCondition = Parser._getSpeedString_getCondition({
        speed
    });
    stack.push([ptName, ptValue, ptUnit, ptCondition].join(""));
}
;
Parser._getSpeedString_getVal = ({prop, speed, isMetric})=>{
    if (speed === true && prop !== "walk")
        return "equal to your walking speed";

    const num = speed === true ? 0 : speed.number != null ? speed.number : speed;

    return isMetric ? Parser.metric.getMetricNumber({
        originalValue: num,
        originalUnit: Parser.UNT_FEET
    }) : num;
}
;
Parser._getSpeedString_getCondition = ({speed})=>speed.condition ? ` ${Renderer.get().render(speed.condition)}` : "";

Parser.SPEED_MODES = ["walk", "burrow", "climb", "fly", "swim"];

Parser.SPEED_TO_PROGRESSIVE = {
    "walk": "walking",
    "burrow": "burrowing",
    "climb": "climbing",
    "fly": "flying",
    "swim": "swimming",
};

Parser.speedToProgressive = function(prop) {
    return Parser._parse_aToB(Parser.SPEED_TO_PROGRESSIVE, prop);
}
;

Parser._addCommas = function(intNum) {
    return `${intNum}`.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
}
;

Parser.raceCreatureTypesToFull = function(creatureTypes) {
    const hasSubOptions = creatureTypes.some(it=>it.choose);
    return creatureTypes.map(it=>{
        if (!it.choose)
            return Parser.monTypeToFullObj(it).asText;
        return [...it.choose].sort(SortUtil.ascSortLower).map(sub=>Parser.monTypeToFullObj(sub).asText).joinConjunct(", ", " or ");
    }
    ).joinConjunct(hasSubOptions ? "; " : ", ", " and ");
}
;

Parser.crToXp = function(cr, {isDouble=false}={}) {
    if (cr != null && cr.xp)
        return Parser._addCommas(`${isDouble ? cr.xp * 2 : cr.xp}`);

    const toConvert = cr ? (cr.cr || cr) : null;
    if (toConvert === "Unknown" || toConvert == null || !Parser.XP_CHART_ALT[toConvert])
        return "Unknown";
    if (toConvert === "0")
        return "10";
    const xp = Parser.XP_CHART_ALT[toConvert];
    return Parser._addCommas(`${isDouble ? 2 * xp : xp}`);
}
;

Parser.crToXpNumber = function(cr) {
    if (cr != null && cr.xp)
        return cr.xp;
    const toConvert = cr ? (cr.cr || cr) : cr;
    if (toConvert === "Unknown" || toConvert == null)
        return null;
    return Parser.XP_CHART_ALT[toConvert] ?? null;
}
;

Parser.LEVEL_TO_XP_EASY = [0, 25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800];
Parser.LEVEL_TO_XP_MEDIUM = [0, 50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4100, 4900, 5700];
Parser.LEVEL_TO_XP_HARD = [0, 75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500];
Parser.LEVEL_TO_XP_DEADLY = [0, 100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700];
Parser.LEVEL_TO_XP_DAILY = [0, 300, 600, 1200, 1700, 3500, 4000, 5000, 6000, 7500, 9000, 10500, 11500, 13500, 15000, 18000, 20000, 25000, 27000, 30000, 40000];

Parser.LEVEL_XP_REQUIRED = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

Parser.CRS = ["0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];

Parser.levelToXpThreshold = function(level) {
    return [Parser.LEVEL_TO_XP_EASY[level], Parser.LEVEL_TO_XP_MEDIUM[level], Parser.LEVEL_TO_XP_HARD[level], Parser.LEVEL_TO_XP_DEADLY[level]];
}
;

Parser.isValidCr = function(cr) {
    return Parser.CRS.includes(cr);
}
;

Parser.crToNumber = function(cr, opts={}) {
    const {isDefaultNull=false} = opts;

    if (cr === "Unknown" || cr === "\u2014" || cr == null)
        return isDefaultNull ? null : VeCt.CR_UNKNOWN;
    if (cr.cr)
        return Parser.crToNumber(cr.cr, opts);

    const parts = cr.trim().split("/");
    if (!parts.length || parts.length >= 3)
        return isDefaultNull ? null : VeCt.CR_CUSTOM;
    if (isNaN(parts[0]))
        return isDefaultNull ? null : VeCt.CR_CUSTOM;

    if (parts.length === 2) {
        if (isNaN(Number(parts[1])))
            return isDefaultNull ? null : VeCt.CR_CUSTOM;
        return Number(parts[0]) / Number(parts[1]);
    }

    return Number(parts[0]);
}
;

Parser.numberToCr = function(number, safe) {
    if (safe && typeof number === "string" && Parser.CRS.includes(number))
        return number;

    if (number == null)
        return "Unknown";

    return Parser.numberToFractional(number);
}
;

Parser.crToPb = function(cr) {
    if (cr === "Unknown" || cr == null)
        return 0;
    cr = cr.cr || cr;
    if (Parser.crToNumber(cr) < 5)
        return 2;
    return Math.ceil(cr / 4) + 1;
}
;

Parser.levelToPb = function(level) {
    if (!level)
        return 2;
    return Math.ceil(level / 4) + 1;
}
;
Parser.SKILL_TO_ATB_ABV = {
    "athletics": "str",
    "acrobatics": "dex",
    "sleight of hand": "dex",
    "stealth": "dex",
    "arcana": "int",
    "history": "int",
    "investigation": "int",
    "nature": "int",
    "religion": "int",
    "animal handling": "wis",
    "insight": "wis",
    "medicine": "wis",
    "perception": "wis",
    "survival": "wis",
    "deception": "cha",
    "intimidation": "cha",
    "performance": "cha",
    "persuasion": "cha",
};


Parser.skillToAbilityAbv = function(skill) {
    return Parser._parse_aToB(Parser.SKILL_TO_ATB_ABV, skill);
}
;

Parser.SKILL_TO_SHORT = {
    "athletics": "ath",
    "acrobatics": "acro",
    "sleight of hand": "soh",
    "stealth": "slth",
    "arcana": "arc",
    "history": "hist",
    "investigation": "invn",
    "nature": "natr",
    "religion": "reli",
    "animal handling": "hndl",
    "insight": "ins",
    "medicine": "med",
    "perception": "perp",
    "survival": "surv",
    "deception": "decp",
    "intimidation": "intm",
    "performance": "perf",
    "persuasion": "pers",
};

Parser.skillToShort = function(skill) {
    return Parser._parse_aToB(Parser.SKILL_TO_SHORT, skill);
}
;

Parser.LANGUAGES_STANDARD = ["Common", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Orc", ];

Parser.LANGUAGES_EXOTIC = ["Abyssal", "Aquan", "Auran", "Celestial", "Draconic", "Deep Speech", "Ignan", "Infernal", "Primordial", "Sylvan", "Terran", "Undercommon", ];

Parser.LANGUAGES_SECRET = ["Druidic", "Thieves' cant", ];

Parser.LANGUAGES_ALL = [...Parser.LANGUAGES_STANDARD, ...Parser.LANGUAGES_EXOTIC, ...Parser.LANGUAGES_SECRET, ].sort();

Parser.acToFull = function(ac, renderer) {
    if (typeof ac === "string")
        return ac;
    renderer = renderer || Renderer.get();

    let stack = "";
    let inBraces = false;
    for (let i = 0; i < ac.length; ++i) {
        const cur = ac[i];
        const nxt = ac[i + 1];

        if (cur.special != null) {
            if (inBraces)
                inBraces = false;

            stack += cur.special;
        } else if (cur.ac) {
            const isNxtBraces = nxt && nxt.braces;

            if (!inBraces && cur.braces) {
                stack += "(";
                inBraces = true;
            }

            stack += cur.ac;

            if (cur.from) {
                if (cur.braces) {
                    stack += " (";
                } else {
                    stack += inBraces ? "; " : " (";
                }

                inBraces = true;

                stack += cur.from.map(it=>renderer.render(it)).join(", ");

                if (cur.braces) {
                    stack += ")";
                } else if (!isNxtBraces) {
                    stack += ")";
                    inBraces = false;
                }
            }

            if (cur.condition)
                stack += ` ${renderer.render(cur.condition)}`;

            if (inBraces && !isNxtBraces) {
                stack += ")";
                inBraces = false;
            }
        } else {
            stack += cur;
        }

        if (nxt) {
            if (nxt.braces) {
                stack += inBraces ? "; " : " (";
                inBraces = true;
            } else
                stack += ", ";
        }
    }
    if (inBraces)
        stack += ")";

    return stack.trim();
}
;

Parser.MONSTER_COUNT_TO_XP_MULTIPLIER = [1, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5, 2.5, 3, 3, 3, 3, 4];
Parser.numMonstersToXpMult = function(num, playerCount=3) {
    const baseVal = (()=>{
        if (num >= Parser.MONSTER_COUNT_TO_XP_MULTIPLIER.length)
            return 4;
        return Parser.MONSTER_COUNT_TO_XP_MULTIPLIER[num - 1];
    }
    )();

    if (playerCount < 3)
        return baseVal >= 3 ? baseVal + 1 : baseVal + 0.5;
    else if (playerCount > 5) {
        return baseVal === 4 ? 3 : baseVal - 0.5;
    } else
        return baseVal;
}
;

Parser.armorFullToAbv = function(armor) {
    return Parser._parse_bToA(Parser.ARMOR_ABV_TO_FULL, armor);
}
;

Parser.weaponFullToAbv = function(weapon) {
    return Parser._parse_bToA(Parser.WEAPON_ABV_TO_FULL, weapon);
}
;

Parser._getSourceStringFromSource = function(source) {
    if (source && source.source)
        return source.source;
    return source;
}
;
Parser._buildSourceCache = function(dict) {
    const out = {};
    Object.entries(dict).forEach(([k,v])=>out[k.toLowerCase()] = v);
    return out;
}
;
Parser._sourceJsonCache = null;
Parser.hasSourceJson = function(source) {
    Parser._sourceJsonCache = Parser._sourceJsonCache || Parser._buildSourceCache(Object.keys(Parser.SOURCE_JSON_TO_FULL).mergeMap(k=>({
        [k]: k
    })));
    return !!Parser._sourceJsonCache[source.toLowerCase()];
}
;
Parser._sourceFullCache = null;
Parser.hasSourceFull = function(source) {
    Parser._sourceFullCache = Parser._sourceFullCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_FULL);
    return !!Parser._sourceFullCache[source.toLowerCase()];
}
;
Parser._sourceAbvCache = null;
Parser.hasSourceAbv = function(source) {
    Parser._sourceAbvCache = Parser._sourceAbvCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_ABV);
    return !!Parser._sourceAbvCache[source.toLowerCase()];
}
;
Parser._sourceDateCache = null;
Parser.hasSourceDate = function(source) {
    Parser._sourceDateCache = Parser._sourceDateCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_DATE);
    return !!Parser._sourceDateCache[source.toLowerCase()];
}
;
Parser.sourceJsonToJson = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceJson(source))
        return Parser._sourceJsonCache[source.toLowerCase()];
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToSource(source).json;
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToSource(source).json;
    return source;
}
;
Parser.sourceJsonToFull = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceFull(source))
        return Parser._sourceFullCache[source.toLowerCase()].replace(/'/g, "\u2019");
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToFull(source).replace(/'/g, "\u2019");
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToFull(source).replace(/'/g, "\u2019");
    return Parser._parse_aToB(Parser.SOURCE_JSON_TO_FULL, source).replace(/'/g, "\u2019");
}
;
Parser.sourceJsonToFullCompactPrefix = function(source) {
    return Parser.sourceJsonToFull(source).replace(Parser.UA_PREFIX, Parser.UA_PREFIX_SHORT).replace(/^Unearthed Arcana (\d+): /, "UA$1: ").replace(Parser.AL_PREFIX, Parser.AL_PREFIX_SHORT).replace(Parser.PS_PREFIX, Parser.PS_PREFIX_SHORT);
}
;
Parser.sourceJsonToAbv = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceAbv(source))
        return Parser._sourceAbvCache[source.toLowerCase()];
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToAbv(source);
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToAbv(source);
    return Parser._parse_aToB(Parser.SOURCE_JSON_TO_ABV, source);
}
;
Parser.sourceJsonToDate = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceDate(source))
        return Parser._sourceDateCache[source.toLowerCase()];
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToDate(source);
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToDate(source);
    return Parser._parse_aToB(Parser.SOURCE_JSON_TO_DATE, source, null);
}
;

Parser.sourceJsonToColor = function(source) {
    return `source${Parser.sourceJsonToAbv(source)}`;
}
;

Parser.sourceJsonToStyle = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceJson(source))
        return "";
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToStyle(source);
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToStyle(source);
    return "";
}
;

Parser.sourceJsonToStylePart = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceJson(source))
        return "";
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToStylePart(source);
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToStylePart(source);
    return "";
}
;

Parser.stringToSlug = function(str) {
    return str.trim().toLowerCase().toAscii().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
}
;

Parser.stringToCasedSlug = function(str) {
    return str.toAscii().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
}
;

Parser.ITEM_SPELLCASTING_FOCUS_CLASSES = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"];

Parser.itemValueToFull = function(item, opts={
    isShortForm: false,
    isSmallUnits: false
}) {
    return Parser._moneyToFull(item, "value", "valueMult", opts);
}
;

Parser.itemValueToFullMultiCurrency = function(item, opts={
    isShortForm: false,
    isSmallUnits: false
}) {
    return Parser._moneyToFullMultiCurrency(item, "value", "valueMult", opts);
}
;

Parser.itemVehicleCostsToFull = function(item, isShortForm) {
    return {
        travelCostFull: Parser._moneyToFull(item, "travelCost", "travelCostMult", {
            isShortForm
        }),
        shippingCostFull: Parser._moneyToFull(item, "shippingCost", "shippingCostMult", {
            isShortForm
        }),
    };
}
;

Parser.spellComponentCostToFull = function(item, isShortForm) {
    return Parser._moneyToFull(item, "cost", "costMult", {
        isShortForm
    });
}
;

Parser.vehicleCostToFull = function(item, isShortForm) {
    return Parser._moneyToFull(item, "cost", "costMult", {
        isShortForm
    });
}
;

Parser._moneyToFull = function(it, prop, propMult, opts={
    isShortForm: false,
    isSmallUnits: false
}) {
    if (it[prop] == null && it[propMult] == null)
        return "";
    if (it[prop] != null) {
        const {coin, mult} = Parser.getCurrencyAndMultiplier(it[prop], it.currencyConversion);
        return `${(it[prop] * mult).toLocaleString(undefined, {
            maximumFractionDigits: 5
        })}${opts.isSmallUnits ? `<span class="small ml-1">${coin}</span>` : ` ${coin}`}`;
    } else if (it[propMult] != null)
        return opts.isShortForm ? `×${it[propMult]}` : `base value ×${it[propMult]}`;
    return "";
}
;

Parser._moneyToFullMultiCurrency = function(it, prop, propMult, {isShortForm, multiplier}={}) {
    if (it[prop]) {
        const conversionTable = Parser.getCurrencyConversionTable(it.currencyConversion);

        const simplified = it.currencyConversion ? CurrencyUtil.doSimplifyCoins({
            [conversionTable[0]?.coin || "cp"]: it[prop] * (multiplier ?? conversionTable[0]?.mult ?? 1),
        }, {
            currencyConversionId: it.currencyConversion,
        }, ) : CurrencyUtil.doSimplifyCoins({
            cp: it[prop] * (multiplier ?? 1),
        });

        return [...conversionTable].reverse().filter(meta=>simplified[meta.coin]).map(meta=>`${simplified[meta.coin].toLocaleString(undefined, {
            maximumFractionDigits: 5
        })} ${meta.coin}`).join(", ");
    }

    if (it[propMult])
        return isShortForm ? `×${it[propMult]}` : `base value ×${it[propMult]}`;

    return "";
}
;

Parser.DEFAULT_CURRENCY_CONVERSION_TABLE = [{
    coin: "cp",
    mult: 1,
}, {
    coin: "sp",
    mult: 0.1,
}, {
    coin: "gp",
    mult: 0.01,
    isFallback: true,
}, ];
Parser.FULL_CURRENCY_CONVERSION_TABLE = [{
    coin: "cp",
    mult: 1,
}, {
    coin: "sp",
    mult: 0.1,
}, {
    coin: "ep",
    mult: 0.02,
}, {
    coin: "gp",
    mult: 0.01,
    isFallback: true,
}, {
    coin: "pp",
    mult: 0.001,
}, ];
Parser.getCurrencyConversionTable = function(currencyConversionId) {
    const fromPrerelease = currencyConversionId ? PrereleaseUtil.getMetaLookup("currencyConversions")?.[currencyConversionId] : null;
    const fromBrew = currencyConversionId ? BrewUtil2.getMetaLookup("currencyConversions")?.[currencyConversionId] : null;
    const conversionTable = fromPrerelease?.length ? fromPrerelease : fromBrew?.length ? fromBrew : Parser.DEFAULT_CURRENCY_CONVERSION_TABLE;
    if (conversionTable !== Parser.DEFAULT_CURRENCY_CONVERSION_TABLE)
        conversionTable.sort((a,b)=>SortUtil.ascSort(b.mult, a.mult));
    return conversionTable;
}
;
Parser.getCurrencyAndMultiplier = function(value, currencyConversionId) {
    const conversionTable = Parser.getCurrencyConversionTable(currencyConversionId);

    if (!value)
        return conversionTable.find(it=>it.isFallback) || conversionTable[0];
    if (conversionTable.length === 1)
        return conversionTable[0];
    if (!Number.isInteger(value) && value < conversionTable[0].mult)
        return conversionTable[0];

    for (let i = conversionTable.length - 1; i >= 0; --i) {
        if (Number.isInteger(value * conversionTable[i].mult))
            return conversionTable[i];
    }

    return conversionTable.last();
}
;

Parser.COIN_ABVS = ["cp", "sp", "ep", "gp", "pp"];
Parser.COIN_ABV_TO_FULL = {
    "cp": "copper pieces",
    "sp": "silver pieces",
    "ep": "electrum pieces",
    "gp": "gold pieces",
    "pp": "platinum pieces",
};
Parser.COIN_CONVERSIONS = [1, 10, 50, 100, 1000];

Parser.coinAbvToFull = function(coin) {
    return Parser._parse_aToB(Parser.COIN_ABV_TO_FULL, coin);
}
;

Parser.getDisplayCurrency = function(currency, {isDisplayEmpty=false}={}) {
    return [...Parser.COIN_ABVS].reverse().filter(abv=>isDisplayEmpty ? currency[abv] != null : currency[abv]).map(abv=>`${currency[abv].toLocaleString()} ${abv}`).join(", ");
}
;

Parser.itemWeightToFull = function(item, isShortForm) {
    if (item.weight) {
        if (Math.round(item.weight) === item.weight)
            return `${item.weight} lb.${(item.weightNote ? ` ${item.weightNote}` : "")}`;

        const integerPart = Math.floor(item.weight);

        const vulgarGlyph = Parser.numberToVulgar(item.weight - integerPart, {
            isFallbackOnFractional: false
        });
        if (vulgarGlyph)
            return `${integerPart || ""}${vulgarGlyph} lb.${(item.weightNote ? ` ${item.weightNote}` : "")}`;

        return `${(item.weight < 1 ? item.weight * 16 : item.weight).toLocaleString(undefined, {
            maximumFractionDigits: 5
        })} ${item.weight < 1 ? "oz" : "lb"}.${(item.weightNote ? ` ${item.weightNote}` : "")}`;
    }
    if (item.weightMult)
        return isShortForm ? `×${item.weightMult}` : `base weight ×${item.weightMult}`;
    return "";
}
;

Parser.ITEM_RECHARGE_TO_FULL = {
    round: "Every Round",
    restShort: "Short Rest",
    restLong: "Long Rest",
    dawn: "Dawn",
    dusk: "Dusk",
    midnight: "Midnight",
    week: "Week",
    month: "Month",
    year: "Year",
    decade: "Decade",
    century: "Century",
    special: "Special",
};
Parser.itemRechargeToFull = function(recharge) {
    return Parser._parse_aToB(Parser.ITEM_RECHARGE_TO_FULL, recharge);
}
;

Parser.ITEM_MISC_TAG_TO_FULL = {
    "CF/W": "Creates Food/Water",
    "TT": "Trinket Table",
};
Parser.itemMiscTagToFull = function(type) {
    return Parser._parse_aToB(Parser.ITEM_MISC_TAG_TO_FULL, type);
}
;

Parser._decimalSeparator = (0.1).toLocaleString().substring(1, 2);
Parser._numberCleanRegexp = Parser._decimalSeparator === "." ? new RegExp(/[\s,]*/g,"g") : new RegExp(/[\s.]*/g,"g");
Parser._costSplitRegexp = Parser._decimalSeparator === "." ? new RegExp(/(\d+(\.\d+)?)([csegp]p)/) : new RegExp(/(\d+(,\d+)?)([csegp]p)/);

Parser.coinValueToNumber = function(value) {
    if (!value)
        return 0;
    if (value === "Varies")
        return 0;

    value = value.replace(/\s*/, "").replace(Parser._numberCleanRegexp, "").toLowerCase();
    const m = Parser._costSplitRegexp.exec(value);
    if (!m)
        throw new Error(`Badly formatted value "${value}"`);
    const ixCoin = Parser.COIN_ABVS.indexOf(m[3]);
    if (!~ixCoin)
        throw new Error(`Unknown coin type "${m[3]}"`);
    return Number(m[1]) * Parser.COIN_CONVERSIONS[ixCoin];
}
;

Parser.weightValueToNumber = function(value) {
    if (!value)
        return 0;

    if (Number(value))
        return Number(value);
    else
        throw new Error(`Badly formatted value ${value}`);
}
;

Parser.dmgTypeToFull = function(dmgType) {
    return Parser._parse_aToB(Parser.DMGTYPE_JSON_TO_FULL, dmgType);
}
;

Parser.skillProficienciesToFull = function(skillProficiencies) {
    function renderSingle(skProf) {
        if (skProf.any) {
            skProf = MiscUtil.copyFast(skProf);
            skProf.choose = {
                "from": Object.keys(Parser.SKILL_TO_ATB_ABV),
                "count": skProf.any
            };
            delete skProf.any;
        }

        const keys = Object.keys(skProf).sort(SortUtil.ascSortLower);

        const ixChoose = keys.indexOf("choose");
        if (~ixChoose)
            keys.splice(ixChoose, 1);

        const baseStack = [];
        keys.filter(k=>skProf[k]).forEach(k=>baseStack.push(Renderer.get().render(`{@skill ${k.toTitleCase()}}`)));

        const chooseStack = [];
        if (~ixChoose) {
            const chObj = skProf.choose;
            if (chObj.from.length === 18) {
                chooseStack.push(`choose any ${!chObj.count || chObj.count === 1 ? "skill" : chObj.count}`);
            } else {
                chooseStack.push(`choose ${chObj.count || 1} from ${chObj.from.map(it=>Renderer.get().render(`{@skill ${it.toTitleCase()}}`)).joinConjunct(", ", " and ")}`);
            }
        }

        const base = baseStack.joinConjunct(", ", " and ");
        const choose = chooseStack.join("");
        if (baseStack.length && chooseStack.length)
            return `${base}; and ${choose}`;
        else if (baseStack.length)
            return base;
        else if (chooseStack.length)
            return choose;
    }

    return skillProficiencies.map(renderSingle).join(" <i>or</i> ");
}
;

Parser.spSchoolAndSubschoolsAbvsToFull = function(school, subschools) {
    if (!subschools || !subschools.length)
        return Parser.spSchoolAbvToFull(school);
    else
        return `${Parser.spSchoolAbvToFull(school)} (${subschools.map(sub=>Parser.spSchoolAbvToFull(sub)).join(", ")})`;
}
;

Parser.spSchoolAbvToFull = function(schoolOrSubschool) {
    const out = Parser._parse_aToB(Parser.SP_SCHOOL_ABV_TO_FULL, schoolOrSubschool);
    if (Parser.SP_SCHOOL_ABV_TO_FULL[schoolOrSubschool])
        return out;
    if (PrereleaseUtil.getMetaLookup("spellSchools")?.[schoolOrSubschool])
        return PrereleaseUtil.getMetaLookup("spellSchools")?.[schoolOrSubschool].full;
    if (BrewUtil2.getMetaLookup("spellSchools")?.[schoolOrSubschool])
        return BrewUtil2.getMetaLookup("spellSchools")?.[schoolOrSubschool].full;
    return out;
}
;

Parser.spSchoolAndSubschoolsAbvsShort = function(school, subschools) {
    if (!subschools || !subschools.length)
        return Parser.spSchoolAbvToShort(school);
    else
        return `${Parser.spSchoolAbvToShort(school)} (${subschools.map(sub=>Parser.spSchoolAbvToShort(sub)).join(", ")})`;
}
;

Parser.spSchoolAbvToShort = function(school) {
    const out = Parser._parse_aToB(Parser.SP_SCHOOL_ABV_TO_SHORT, school);
    if (Parser.SP_SCHOOL_ABV_TO_SHORT[school])
        return out;
    if (PrereleaseUtil.getMetaLookup("spellSchools")?.[school])
        return PrereleaseUtil.getMetaLookup("spellSchools")?.[school].short;
    if (BrewUtil2.getMetaLookup("spellSchools")?.[school])
        return BrewUtil2.getMetaLookup("spellSchools")?.[school].short;
    if (out.length <= 4)
        return out;
    return `${out.slice(0, 3)}.`;
}
;

Parser.spSchoolAbvToStyle = function(school) {
    const stylePart = Parser.spSchoolAbvToStylePart(school);
    if (!stylePart)
        return stylePart;
    return `style="${stylePart}"`;
}
;

Parser.spSchoolAbvToStylePart = function(school) {
    return Parser._spSchoolAbvToStylePart_prereleaseBrew({
        school,
        brewUtil: PrereleaseUtil
    }) || Parser._spSchoolAbvToStylePart_prereleaseBrew({
        school,
        brewUtil: BrewUtil2
    }) || "";
}
;

Parser._spSchoolAbvToStylePart_prereleaseBrew = function({school, brewUtil}) {
    const rawColor = brewUtil.getMetaLookup("spellSchools")?.[school]?.color;
    if (!rawColor || !rawColor.trim())
        return "";
    const validColor = BrewUtilShared.getValidColor(rawColor);
    if (validColor.length)
        return `color: #${validColor};`;
}
;

Parser.getOrdinalForm = function(i) {
    i = Number(i);
    if (isNaN(i))
        return "";
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11)
        return `${i}st`;
    if (j === 2 && k !== 12)
        return `${i}nd`;
    if (j === 3 && k !== 13)
        return `${i}rd`;
    return `${i}th`;
}
;

Parser.spLevelToFull = function(level) {
    if (level === 0)
        return "Cantrip";
    else
        return Parser.getOrdinalForm(level);
}
;

Parser.getArticle = function(str) {
    str = `${str}`;
    str = str.replace(/\d+/g, (...m)=>Parser.numberToText(m[0]));
    return /^[aeiou]/i.test(str) ? "an" : "a";
}
;

Parser.spLevelToFullLevelText = function(level, {isDash=false, isPluralCantrips=true}={}) {
    return `${Parser.spLevelToFull(level)}${(level === 0 ? (isPluralCantrips ? "s" : "") : `${isDash ? "-" : " "}level`)}`;
}
;

Parser.spLevelToSpellPoints = function(lvl) {
    lvl = Number(lvl);
    if (isNaN(lvl) || lvl === 0)
        return 0;
    return Math.ceil(1.34 * lvl);
}
;

Parser.spMetaToArr = function(meta) {
    if (!meta)
        return [];
    return Object.entries(meta).filter(([_,v])=>v).sort(SortUtil.ascSort).map(([k])=>k);
}
;

Parser.spMetaToFull = function(meta) {
    if (!meta)
        return "";
    const metaTags = Parser.spMetaToArr(meta);
    if (metaTags.length)
        return ` (${metaTags.join(", ")})`;
    return "";
}
;

Parser.spLevelSchoolMetaToFull = function(level, school, meta, subschools) {
    const levelPart = level === 0 ? Parser.spLevelToFull(level).toLowerCase() : `${Parser.spLevelToFull(level)}-level`;
    const levelSchoolStr = level === 0 ? `${Parser.spSchoolAbvToFull(school)} ${levelPart}` : `${levelPart} ${Parser.spSchoolAbvToFull(school).toLowerCase()}`;

    const metaArr = Parser.spMetaToArr(meta);
    if (metaArr.length || (subschools && subschools.length)) {
        const metaAndSubschoolPart = [(subschools || []).map(sub=>Parser.spSchoolAbvToFull(sub)).join(", "), metaArr.join(", "), ].filter(Boolean).join("; ").toLowerCase();
        return `${levelSchoolStr} (${metaAndSubschoolPart})`;
    }
    return levelSchoolStr;
}
;

Parser.spTimeListToFull = function(times, isStripTags) {
    return times.map(t=>`${Parser.getTimeToFull(t)}${t.condition ? `, ${isStripTags ? Renderer.stripTags(t.condition) : Renderer.get().render(t.condition)}` : ""}`).join(" or ");
}
;

Parser.getTimeToFull = function(time) {
    return `${time.number ? `${time.number} ` : ""}${time.unit === "bonus" ? "bonus action" : time.unit}${time.number > 1 ? "s" : ""}`;
}
;

Parser.getMinutesToFull = function(mins) {
    const days = Math.floor(mins / (24 * 60));
    mins = mins % (24 * 60);

    const hours = Math.floor(mins / 60);
    mins = mins % 60;

    return [days ? `${days} day${days > 1 ? "s" : ""}` : null, hours ? `${hours} hour${hours > 1 ? "s" : ""}` : null, mins ? `${mins} minute${mins > 1 ? "s" : ""}` : null, ].filter(Boolean).join(" ");
}
;

Parser.RNG_SPECIAL = "special";
Parser.RNG_POINT = "point";
Parser.RNG_LINE = "line";
Parser.RNG_CUBE = "cube";
Parser.RNG_CONE = "cone";
Parser.RNG_RADIUS = "radius";
Parser.RNG_SPHERE = "sphere";
Parser.RNG_HEMISPHERE = "hemisphere";
Parser.RNG_CYLINDER = "cylinder";
Parser.RNG_SELF = "self";
Parser.RNG_SIGHT = "sight";
Parser.RNG_UNLIMITED = "unlimited";
Parser.RNG_UNLIMITED_SAME_PLANE = "plane";
Parser.RNG_TOUCH = "touch";
Parser.SP_RANGE_TYPE_TO_FULL = {
    [Parser.RNG_SPECIAL]: "Special",
    [Parser.RNG_POINT]: "Point",
    [Parser.RNG_LINE]: "Line",
    [Parser.RNG_CUBE]: "Cube",
    [Parser.RNG_CONE]: "Cone",
    [Parser.RNG_RADIUS]: "Radius",
    [Parser.RNG_SPHERE]: "Sphere",
    [Parser.RNG_HEMISPHERE]: "Hemisphere",
    [Parser.RNG_CYLINDER]: "Cylinder",
    [Parser.RNG_SELF]: "Self",
    [Parser.RNG_SIGHT]: "Sight",
    [Parser.RNG_UNLIMITED]: "Unlimited",
    [Parser.RNG_UNLIMITED_SAME_PLANE]: "Unlimited on the same plane",
    [Parser.RNG_TOUCH]: "Touch",
};

Parser.spRangeTypeToFull = function(range) {
    return Parser._parse_aToB(Parser.SP_RANGE_TYPE_TO_FULL, range);
}
;

Parser.UNT_FEET = "feet";
Parser.UNT_YARDS = "yards";
Parser.UNT_MILES = "miles";
Parser.SP_DIST_TYPE_TO_FULL = {
    [Parser.UNT_FEET]: "Feet",
    [Parser.UNT_YARDS]: "Yards",
    [Parser.UNT_MILES]: "Miles",
    [Parser.RNG_SELF]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_SELF],
    [Parser.RNG_TOUCH]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_TOUCH],
    [Parser.RNG_SIGHT]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_SIGHT],
    [Parser.RNG_UNLIMITED]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_UNLIMITED],
    [Parser.RNG_UNLIMITED_SAME_PLANE]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_UNLIMITED_SAME_PLANE],
};

Parser.spDistanceTypeToFull = function(range) {
    return Parser._parse_aToB(Parser.SP_DIST_TYPE_TO_FULL, range);
}
;

Parser.SP_RANGE_TO_ICON = {
    [Parser.RNG_SPECIAL]: "fa-star",
    [Parser.RNG_POINT]: "",
    [Parser.RNG_LINE]: "fa-grip-lines-vertical",
    [Parser.RNG_CUBE]: "fa-cube",
    [Parser.RNG_CONE]: "fa-traffic-cone",
    [Parser.RNG_RADIUS]: "fa-hockey-puck",
    [Parser.RNG_SPHERE]: "fa-globe",
    [Parser.RNG_HEMISPHERE]: "fa-globe",
    [Parser.RNG_CYLINDER]: "fa-database",
    [Parser.RNG_SELF]: "fa-street-view",
    [Parser.RNG_SIGHT]: "fa-eye",
    [Parser.RNG_UNLIMITED_SAME_PLANE]: "fa-globe-americas",
    [Parser.RNG_UNLIMITED]: "fa-infinity",
    [Parser.RNG_TOUCH]: "fa-hand-paper",
};

Parser.spRangeTypeToIcon = function(range) {
    return Parser._parse_aToB(Parser.SP_RANGE_TO_ICON, range);
}
;

Parser.spRangeToShortHtml = function(range) {
    switch (range.type) {
    case Parser.RNG_SPECIAL:
        return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(range.type)} help-subtle" title="Special"></span>`;
    case Parser.RNG_POINT:
        return Parser.spRangeToShortHtml._renderPoint(range);
    case Parser.RNG_LINE:
    case Parser.RNG_CUBE:
    case Parser.RNG_CONE:
    case Parser.RNG_RADIUS:
    case Parser.RNG_SPHERE:
    case Parser.RNG_HEMISPHERE:
    case Parser.RNG_CYLINDER:
        return Parser.spRangeToShortHtml._renderArea(range);
    }
}
;
Parser.spRangeToShortHtml._renderPoint = function(range) {
    const dist = range.distance;
    switch (dist.type) {
    case Parser.RNG_SELF:
    case Parser.RNG_SIGHT:
    case Parser.RNG_UNLIMITED:
    case Parser.RNG_UNLIMITED_SAME_PLANE:
    case Parser.RNG_SPECIAL:
    case Parser.RNG_TOUCH:
        return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(dist.type)} help-subtle" title="${Parser.spRangeTypeToFull(dist.type)}"></span>`;
    case Parser.UNT_FEET:
    case Parser.UNT_YARDS:
    case Parser.UNT_MILES:
    default:
        return `${dist.amount} <span class="ve-small">${Parser.getSingletonUnit(dist.type, true)}</span>`;
    }
}
;
Parser.spRangeToShortHtml._renderArea = function(range) {
    const size = range.distance;
    return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(Parser.RNG_SELF)} help-subtle" title="Self"></span> ${size.amount}<span class="ve-small">-${Parser.getSingletonUnit(size.type, true)}</span> ${Parser.spRangeToShortHtml._getAreaStyleString(range)}`;
}
;
Parser.spRangeToShortHtml._getAreaStyleString = function(range) {
    return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(range.type)} help-subtle" title="${Parser.spRangeTypeToFull(range.type)}"></span>`;
}
;

Parser.spRangeToFull = function(range) {
    switch (range.type) {
    case Parser.RNG_SPECIAL:
        return Parser.spRangeTypeToFull(range.type);
    case Parser.RNG_POINT:
        return Parser.spRangeToFull._renderPoint(range);
    case Parser.RNG_LINE:
    case Parser.RNG_CUBE:
    case Parser.RNG_CONE:
    case Parser.RNG_RADIUS:
    case Parser.RNG_SPHERE:
    case Parser.RNG_HEMISPHERE:
    case Parser.RNG_CYLINDER:
        return Parser.spRangeToFull._renderArea(range);
    }
}
;
Parser.spRangeToFull._renderPoint = function(range) {
    const dist = range.distance;
    switch (dist.type) {
    case Parser.RNG_SELF:
    case Parser.RNG_SIGHT:
    case Parser.RNG_UNLIMITED:
    case Parser.RNG_UNLIMITED_SAME_PLANE:
    case Parser.RNG_SPECIAL:
    case Parser.RNG_TOUCH:
        return Parser.spRangeTypeToFull(dist.type);
    case Parser.UNT_FEET:
    case Parser.UNT_YARDS:
    case Parser.UNT_MILES:
    default:
        return `${dist.amount} ${dist.amount === 1 ? Parser.getSingletonUnit(dist.type) : dist.type}`;
    }
}
;
Parser.spRangeToFull._renderArea = function(range) {
    const size = range.distance;
    return `Self (${size.amount}-${Parser.getSingletonUnit(size.type)}${Parser.spRangeToFull._getAreaStyleString(range)}${range.type === Parser.RNG_CYLINDER ? `${size.amountSecondary != null && size.typeSecondary != null ? `, ${size.amountSecondary}-${Parser.getSingletonUnit(size.typeSecondary)}-high` : ""} cylinder` : ""})`;
}
;
Parser.spRangeToFull._getAreaStyleString = function(range) {
    switch (range.type) {
    case Parser.RNG_SPHERE:
        return " radius";
    case Parser.RNG_HEMISPHERE:
        return `-radius ${range.type}`;
    case Parser.RNG_CYLINDER:
        return "-radius";
    default:
        return ` ${range.type}`;
    }
}
;

Parser.getSingletonUnit = function(unit, isShort) {
    switch (unit) {
    case Parser.UNT_FEET:
        return isShort ? "ft." : "foot";
    case Parser.UNT_YARDS:
        return isShort ? "yd." : "yard";
    case Parser.UNT_MILES:
        return isShort ? "mi." : "mile";
    default:
        {
            const fromPrerelease = Parser._getSingletonUnit_prereleaseBrew({
                unit,
                isShort,
                brewUtil: PrereleaseUtil
            });
            if (fromPrerelease)
                return fromPrerelease;

            const fromBrew = Parser._getSingletonUnit_prereleaseBrew({
                unit,
                isShort,
                brewUtil: BrewUtil2
            });
            if (fromBrew)
                return fromBrew;

            if (unit.charAt(unit.length - 1) === "s")
                return unit.slice(0, -1);
            return unit;
        }
    }
}
;

Parser._getSingletonUnit_prereleaseBrew = function({unit, isShort, brewUtil}) {
    const fromBrew = brewUtil.getMetaLookup("spellDistanceUnits")?.[unit]?.["singular"];
    if (fromBrew)
        return fromBrew;
}
;

Parser.RANGE_TYPES = [{
    type: Parser.RNG_POINT,
    hasDistance: true,
    isRequireAmount: false
},
{
    type: Parser.RNG_LINE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_CUBE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_CONE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_RADIUS,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_SPHERE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_HEMISPHERE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_CYLINDER,
    hasDistance: true,
    isRequireAmount: true
},
{
    type: Parser.RNG_SPECIAL,
    hasDistance: false,
    isRequireAmount: false
}, ];

Parser.DIST_TYPES = [{
    type: Parser.RNG_SELF,
    hasAmount: false
}, {
    type: Parser.RNG_TOUCH,
    hasAmount: false
},
{
    type: Parser.UNT_FEET,
    hasAmount: true
}, {
    type: Parser.UNT_YARDS,
    hasAmount: true
}, {
    type: Parser.UNT_MILES,
    hasAmount: true
},
{
    type: Parser.RNG_SIGHT,
    hasAmount: false
}, {
    type: Parser.RNG_UNLIMITED_SAME_PLANE,
    hasAmount: false
}, {
    type: Parser.RNG_UNLIMITED,
    hasAmount: false
}, ];

Parser.spComponentsToFull = function(comp, level, {isPlainText=false}={}) {
    if (!comp)
        return "None";
    const out = [];
    if (comp.v)
        out.push("V");
    if (comp.s)
        out.push("S");
    if (comp.m != null) {
        const fnRender = isPlainText ? Renderer.stripTags.bind(Renderer) : Renderer.get().render.bind(Renderer.get());
        out.push(`M${comp.m !== true ? ` (${fnRender(comp.m.text != null ? comp.m.text : comp.m)})` : ""}`);
    }
    if (comp.r)
        out.push(`R (${level} gp)`);
    return out.join(", ") || "None";
}
;

Parser.SP_END_TYPE_TO_FULL = {
    "dispel": "dispelled",
    "trigger": "triggered",
    "discharge": "discharged",
};
Parser.spEndTypeToFull = function(type) {
    return Parser._parse_aToB(Parser.SP_END_TYPE_TO_FULL, type);
}
;

Parser.spDurationToFull = function(dur) {
    let hasSubOr = false;
    const outParts = dur.map(d=>{
        switch (d.type) {
        case "special":
            return "Special";
        case "instant":
            return `Instantaneous${d.condition ? ` (${d.condition})` : ""}`;
        case "timed":
            return `${d.concentration ? "Concentration, " : ""}${d.concentration ? "u" : d.duration.upTo ? "U" : ""}${d.concentration || d.duration.upTo ? "p to " : ""}${d.duration.amount} ${d.duration.amount === 1 ? d.duration.type : `${d.duration.type}s`}`;
        case "permanent":
            {
                if (d.ends) {
                    const endsToJoin = d.ends.map(m=>Parser.spEndTypeToFull(m));
                    hasSubOr = hasSubOr || endsToJoin.length > 1;
                    return `Until ${endsToJoin.joinConjunct(", ", " or ")}`;
                } else {
                    return "Permanent";
                }
            }
        }
    }
    );
    return `${outParts.joinConjunct(hasSubOr ? "; " : ", ", " or ")}${dur.length > 1 ? " (see below)" : ""}`;
}
;

Parser.DURATION_TYPES = [{
    type: "instant",
    full: "Instantaneous"
}, {
    type: "timed",
    hasAmount: true
}, {
    type: "permanent",
    hasEnds: true
}, {
    type: "special"
}, ];

Parser.DURATION_AMOUNT_TYPES = ["turn", "round", "minute", "hour", "day", "week", "year", ];

Parser.spClassesToFull = function(sp, {isTextOnly=false, subclassLookup={}}={}) {
    const fromSubclassList = Renderer.spell.getCombinedClasses(sp, "fromSubclass");
    const fromSubclasses = Parser.spSubclassesToFull(fromSubclassList, { isTextOnly, subclassLookup });
    const fromClassList = Renderer.spell.getCombinedClasses(sp, "fromClassList");
    return `${Parser.spMainClassesToFull(fromClassList, { isTextOnly })}${fromSubclasses ? `, ${fromSubclasses}` : ""}`;
};

Parser.spMainClassesToFull = function(fromClassList, {isTextOnly=false}={}) {
    return fromClassList.map(c=>({
        hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](c),
        c
    })).filter(it=>!ExcludeUtil.isInitialised || !ExcludeUtil.isExcluded(it.hash, "class", it.c.source)).sort((a,b)=>SortUtil.ascSort(a.c.name, b.c.name)).map(it=>{
        if (isTextOnly)
            return it.c.name;

        return `<span title="${it.c.definedInSource ? `Class source` : "Source"}: ${Parser.sourceJsonToFull(it.c.source)}${it.c.definedInSource ? `. Spell list defined in: ${Parser.sourceJsonToFull(it.c.definedInSource)}.` : ""}">${Renderer.get().render(`{@class ${it.c.name}|${it.c.source}}`)}</span>`;
    }
    ).join(", ") || "";
}
;

Parser.spSubclassesToFull = function(fromSubclassList, {isTextOnly=false, subclassLookup={}}={}) {
    return fromSubclassList.filter(mt=>{
        if (!ExcludeUtil.isInitialised)
            return true;
        const excludeClass = ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](mt.class), "class", mt.class.source);
        if (excludeClass)
            return false;

        return !ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER["subclass"]({
            shortName: mt.subclass.name,
            source: mt.subclass.source,
            className: mt.class.name,
            classSource: mt.class.source,
        }), "subclass", mt.subclass.source, {
            isNoCount: true
        }, );
    }
    ).sort((a,b)=>{
        const byName = SortUtil.ascSort(a.class.name, b.class.name);
        return byName || SortUtil.ascSort(a.subclass.name, b.subclass.name);
    }
    ).map(c=>Parser._spSubclassItem({
        fromSubclass: c,
        isTextOnly
    })).join(", ") || "";
}
;

Parser._spSubclassItem = function({fromSubclass, isTextOnly}) {
    const c = fromSubclass.class;
    const sc = fromSubclass.subclass;
    const text = `${sc.shortName}${sc.subSubclass ? ` (${sc.subSubclass})` : ""}`;
    if (isTextOnly)
        return text;

    const classPart = `<span title="Source: ${Parser.sourceJsonToFull(c.source)}${c.definedInSource ? ` From a class spell list defined in: ${Parser.sourceJsonToFull(c.definedInSource)}` : ""}">${Renderer.get().render(`{@class ${c.name}|${c.source}}`)}</span>`;

    return `<span class="italic" title="Source: ${Parser.sourceJsonToFull(fromSubclass.subclass.source)}">${Renderer.get().render(`{@class ${c.name}|${c.source}|${text}|${sc.shortName}|${sc.source}}`)}</span> ${classPart}`;
}
;

Parser.SPELL_ATTACK_TYPE_TO_FULL = {};
Parser.SPELL_ATTACK_TYPE_TO_FULL["M"] = "Melee";
Parser.SPELL_ATTACK_TYPE_TO_FULL["R"] = "Ranged";
Parser.SPELL_ATTACK_TYPE_TO_FULL["O"] = "Other/Unknown";

Parser.spAttackTypeToFull = function(type) {
    return Parser._parse_aToB(Parser.SPELL_ATTACK_TYPE_TO_FULL, type);
}
;

Parser.SPELL_AREA_TYPE_TO_FULL = {
    ST: "Single Target",
    MT: "Multiple Targets",
    C: "Cube",
    N: "Cone",
    Y: "Cylinder",
    S: "Sphere",
    R: "Circle",
    Q: "Square",
    L: "Line",
    H: "Hemisphere",
    W: "Wall",
};
Parser.spAreaTypeToFull = function(type) {
    return Parser._parse_aToB(Parser.SPELL_AREA_TYPE_TO_FULL, type);
}
;

Parser.SP_MISC_TAG_TO_FULL = {
    HL: "Healing",
    THP: "Grants Temporary Hit Points",
    SGT: "Requires Sight",
    PRM: "Permanent Effects",
    SCL: "Scaling Effects",
    SMN: "Summons Creature",
    MAC: "Modifies AC",
    TP: "Teleportation",
    FMV: "Forced Movement",
    RO: "Rollable Effects",
    LGTS: "Creates Sunlight",
    LGT: "Creates Light",
    UBA: "Uses Bonus Action",
    PS: "Plane Shifting",
    OBS: "Obscures Vision",
    DFT: "Difficult Terrain",
    AAD: "Additional Attack Damage",
    OBJ: "Affects Objects",
    ADV: "Grants Advantage",
};
Parser.spMiscTagToFull = function(type) {
    return Parser._parse_aToB(Parser.SP_MISC_TAG_TO_FULL, type);
}
;

Parser.SP_CASTER_PROGRESSION_TO_FULL = {
    full: "Full",
    "1/2": "Half",
    "1/3": "One-Third",
    "pact": "Pact Magic",
};
Parser.spCasterProgressionToFull = function(type) {
    return Parser._parse_aToB(Parser.SP_CASTER_PROGRESSION_TO_FULL, type);
}
;

Parser.monTypeToFullObj = function(type) {
    const out = {
        types: [],
        tags: [],
        asText: "",
        asTextShort: "",

        typeSidekick: null,
        tagsSidekick: [],
        asTextSidekick: null,
    };

    if (typeof type === "string") {
        out.types = [type];
        out.asText = type.toTitleCase();
        out.asTextShort = out.asText;
        return out;
    }

    if (type.type?.choose) {
        out.types = type.type.choose;
    } else {
        out.types = [type.type];
    }

    if (type.swarmSize) {
        out.tags.push("swarm");
        out.asText = `swarm of ${Parser.sizeAbvToFull(type.swarmSize)} ${out.types.map(typ=>Parser.monTypeToPlural(typ).toTitleCase()).joinConjunct(", ", " or ")}`;
        out.asTextShort = out.asText;
        out.swarmSize = type.swarmSize;
    } else {
        out.asText = out.types.map(typ=>typ.toTitleCase()).joinConjunct(", ", " or ");
        out.asTextShort = out.asText;
    }

    const tagMetas = Parser.monTypeToFullObj._getTagMetas(type.tags);
    if (tagMetas.length) {
        out.tags.push(...tagMetas.map(({filterTag})=>filterTag));
        const ptTags = ` (${tagMetas.map(({displayTag})=>displayTag).join(", ")})`;
        out.asText += ptTags;
        out.asTextShort += ptTags;
    }

    if (type.note)
        out.asText += ` ${type.note}`;

    if (type.sidekickType) {
        out.typeSidekick = type.sidekickType;
        if (!type.sidekickHidden)
            out.asTextSidekick = `${type.sidekickType}`;

        const tagMetas = Parser.monTypeToFullObj._getTagMetas(type.sidekickTags);
        if (tagMetas.length) {
            out.tagsSidekick.push(...tagMetas.map(({filterTag})=>filterTag));
            if (!type.sidekickHidden)
                out.asTextSidekick += ` (${tagMetas.map(({displayTag})=>displayTag).join(", ")})`;
        }
    }

    return out;
}
;

Parser.monTypeToFullObj._getTagMetas = (tags)=>{
    return tags ? tags.map(tag=>{
        if (typeof tag === "string") {
            return {
                filterTag: tag.toLowerCase(),
                displayTag: tag.toTitleCase(),
            };
        } else {
            return {
                filterTag: tag.tag.toLowerCase(),
                displayTag: `${tag.prefix} ${tag.tag}`.toTitleCase(),
            };
        }
    }
    ) : [];
}
;

Parser.monTypeToPlural = function(type) {
    return Parser._parse_aToB(Parser.MON_TYPE_TO_PLURAL, type);
}
;

Parser.monTypeFromPlural = function(type) {
    return Parser._parse_bToA(Parser.MON_TYPE_TO_PLURAL, type);
}
;

Parser.monCrToFull = function(cr, {xp=null, isMythic=false}={}) {
    if (cr == null)
        return "";

    if (typeof cr === "string") {
        if (Parser.crToNumber(cr) >= VeCt.CR_CUSTOM)
            return `${cr}${xp != null ? ` (${xp} XP)` : ""}`;

        xp = xp != null ? Parser._addCommas(xp) : Parser.crToXp(cr);
        return `${cr} (${xp} XP${isMythic ? `, or ${Parser.crToXp(cr, {
            isDouble: true
        })} XP as a mythic encounter` : ""})`;
    } else {
        const stack = [Parser.monCrToFull(cr.cr, {
            xp: cr.xp,
            isMythic
        })];
        if (cr.lair)
            stack.push(`${Parser.monCrToFull(cr.lair)} when encountered in lair`);
        if (cr.coven)
            stack.push(`${Parser.monCrToFull(cr.coven)} when part of a coven`);
        return stack.joinConjunct(", ", " or ");
    }
}
;

Parser.getFullImmRes = function(toParse) {
    if (!toParse?.length)
        return "";

    let maxDepth = 0;

    function toString(it, depth=0) {
        maxDepth = Math.max(maxDepth, depth);
        if (typeof it === "string") {
            return it;
        } else if (it.special) {
            return it.special;
        } else {
            const stack = [];

            if (it.preNote)
                stack.push(it.preNote);

            const prop = it.immune ? "immune" : it.resist ? "resist" : it.vulnerable ? "vulnerable" : null;
            if (prop) {
                const toJoin = it[prop].length === Parser.DMG_TYPES.length && CollectionUtil.deepEquals(Parser.DMG_TYPES, it[prop]) ? ["all damage"] : it[prop].map(nxt=>toString(nxt, depth + 1));
                stack.push(depth ? toJoin.join(maxDepth ? "; " : ", ") : toJoin.joinConjunct(", ", " and "));
            }

            if (it.note)
                stack.push(it.note);

            return stack.join(" ");
        }
    }

    const arr = toParse.map(it=>toString(it));

    if (arr.length <= 1)
        return arr.join("");

    let out = "";
    for (let i = 0; i < arr.length - 1; ++i) {
        const it = arr[i];
        const nxt = arr[i + 1];

        const orig = toParse[i];
        const origNxt = toParse[i + 1];

        out += it;
        out += (it.includes(",") || nxt.includes(",") || (orig && orig.cond) || (origNxt && origNxt.cond)) ? "; " : ", ";
    }
    out += arr.last();
    return out;
}
;

Parser.getFullCondImm = function(condImm, {isPlainText=false, isEntry=false}={}) {
    if (isPlainText && isEntry)
        throw new Error(`Options "isPlainText" and "isEntry" are mutually exclusive!`);

    if (!condImm?.length)
        return "";

    const render = condition=>{
        if (isPlainText)
            return condition;
        const ent = `{@condition ${condition}}`;
        if (isEntry)
            return ent;
        return Renderer.get().render(ent);
    }
    ;

    return condImm.map(it=>{
        if (it.special)
            return it.special;
        if (it.conditionImmune)
            return `${it.preNote ? `${it.preNote} ` : ""}${it.conditionImmune.map(render).join(", ")}${it.note ? ` ${it.note}` : ""}`;
        return render(it);
    }
    ).sort(SortUtil.ascSortLower).join(", ");
}
;

Parser.MON_SENSE_TAG_TO_FULL = {
    "B": "blindsight",
    "D": "darkvision",
    "SD": "superior darkvision",
    "T": "tremorsense",
    "U": "truesight",
};
Parser.monSenseTagToFull = function(tag) {
    return Parser._parse_aToB(Parser.MON_SENSE_TAG_TO_FULL, tag);
}
;

Parser.MON_SPELLCASTING_TAG_TO_FULL = {
    "P": "Psionics",
    "I": "Innate",
    "F": "Form Only",
    "S": "Shared",
    "O": "Other",
    "CA": "Class, Artificer",
    "CB": "Class, Bard",
    "CC": "Class, Cleric",
    "CD": "Class, Druid",
    "CP": "Class, Paladin",
    "CR": "Class, Ranger",
    "CS": "Class, Sorcerer",
    "CL": "Class, Warlock",
    "CW": "Class, Wizard",
};
Parser.monSpellcastingTagToFull = function(tag) {
    return Parser._parse_aToB(Parser.MON_SPELLCASTING_TAG_TO_FULL, tag);
}
;

Parser.MON_MISC_TAG_TO_FULL = {
    "AOE": "Has Areas of Effect",
    "HPR": "Has HP Reduction",
    "MW": "Has Weapon Attacks, Melee",
    "RW": "Has Weapon Attacks, Ranged",
    "MLW": "Has Melee Weapons",
    "RNG": "Has Ranged Weapons",
    "RCH": "Has Reach Attacks",
    "THW": "Has Thrown Weapons",
};
Parser.monMiscTagToFull = function(tag) {
    return Parser._parse_aToB(Parser.MON_MISC_TAG_TO_FULL, tag);
}
;

Parser.MON_LANGUAGE_TAG_TO_FULL = {
    "AB": "Abyssal",
    "AQ": "Aquan",
    "AU": "Auran",
    "C": "Common",
    "CE": "Celestial",
    "CS": "Can't Speak Known Languages",
    "D": "Dwarvish",
    "DR": "Draconic",
    "DS": "Deep Speech",
    "DU": "Druidic",
    "E": "Elvish",
    "G": "Gnomish",
    "GI": "Giant",
    "GO": "Goblin",
    "GTH": "Gith",
    "H": "Halfling",
    "I": "Infernal",
    "IG": "Ignan",
    "LF": "Languages Known in Life",
    "O": "Orc",
    "OTH": "Other",
    "P": "Primordial",
    "S": "Sylvan",
    "T": "Terran",
    "TC": "Thieves' cant",
    "TP": "Telepathy",
    "U": "Undercommon",
    "X": "Any (Choose)",
    "XX": "All",
};
Parser.monLanguageTagToFull = function(tag) {
    return Parser._parse_aToB(Parser.MON_LANGUAGE_TAG_TO_FULL, tag);
}
;

Parser.ENVIRONMENTS = ["arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain", "swamp", "underdark", "underwater", "urban"];

Parser.PSI_ABV_TYPE_TALENT = "T";
Parser.PSI_ABV_TYPE_DISCIPLINE = "D";
Parser.PSI_ORDER_NONE = "None";
Parser.psiTypeToFull = type=>Parser.psiTypeToMeta(type).full;

Parser.psiTypeToMeta = type=>{
    let out = {};
    if (type === Parser.PSI_ABV_TYPE_TALENT)
        out = {
            hasOrder: false,
            full: "Talent"
        };
    else if (type === Parser.PSI_ABV_TYPE_DISCIPLINE)
        out = {
            hasOrder: true,
            full: "Discipline"
        };
    else if (PrereleaseUtil.getMetaLookup("psionicTypes")?.[type])
        out = MiscUtil.copyFast(PrereleaseUtil.getMetaLookup("psionicTypes")[type]);
    else if (BrewUtil2.getMetaLookup("psionicTypes")?.[type])
        out = MiscUtil.copyFast(BrewUtil2.getMetaLookup("psionicTypes")[type]);
    out.full = out.full || "Unknown";
    out.short = out.short || out.full;
    return out;
}
;

Parser.psiOrderToFull = (order)=>{
    return order === undefined ? Parser.PSI_ORDER_NONE : order;
}
;

Parser.prereqSpellToFull = function(spell, {isTextOnly=false}={}) {
    if (spell) {
        const [text,suffix] = spell.split("#");
        if (!suffix)
            return isTextOnly ? spell : Renderer.get().render(`{@spell ${spell}}`);
        else if (suffix === "c")
            return (isTextOnly ? Renderer.stripTags : Renderer.get().render.bind(Renderer.get()))(`{@spell ${text}} cantrip`);
        else if (suffix === "x")
            return (isTextOnly ? Renderer.stripTags : Renderer.get().render.bind(Renderer.get()))("{@spell hex} spell or a warlock feature that curses");
    } else
        return VeCt.STR_NONE;
}
;

Parser.prereqPactToFull = function(pact) {
    if (pact === "Chain")
        return "Pact of the Chain";
    if (pact === "Tome")
        return "Pact of the Tome";
    if (pact === "Blade")
        return "Pact of the Blade";
    if (pact === "Talisman")
        return "Pact of the Talisman";
    return pact;
}
;

Parser.prereqPatronToShort = function(patron) {
    if (patron === "Any")
        return patron;
    const mThe = /^The (.*?)$/.exec(patron);
    if (mThe)
        return mThe[1];
    return patron;
}
;

Parser.OPT_FEATURE_TYPE_TO_FULL = {
    AI: "Artificer Infusion",
    ED: "Elemental Discipline",
    EI: "Eldritch Invocation",
    MM: "Metamagic",
    "MV": "Maneuver",
    "MV:B": "Maneuver, Battle Master",
    "MV:C2-UA": "Maneuver, Cavalier V2 (UA)",
    "AS:V1-UA": "Arcane Shot, V1 (UA)",
    "AS:V2-UA": "Arcane Shot, V2 (UA)",
    "AS": "Arcane Shot",
    OTH: "Other",
    "FS:F": "Fighting Style; Fighter",
    "FS:B": "Fighting Style; Bard",
    "FS:P": "Fighting Style; Paladin",
    "FS:R": "Fighting Style; Ranger",
    "PB": "Pact Boon",
    "OR": "Onomancy Resonant",
    "RN": "Rune Knight Rune",
    "AF": "Alchemical Formula",
};

Parser.optFeatureTypeToFull = function(type) {
    if (Parser.OPT_FEATURE_TYPE_TO_FULL[type])
        return Parser.OPT_FEATURE_TYPE_TO_FULL[type];
    if (PrereleaseUtil.getMetaLookup("optionalFeatureTypes")?.[type])
        return PrereleaseUtil.getMetaLookup("optionalFeatureTypes")[type];
    if (BrewUtil2.getMetaLookup("optionalFeatureTypes")?.[type])
        return BrewUtil2.getMetaLookup("optionalFeatureTypes")[type];
    return type;
}
;

Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL = {
    "SG": "Supernatural Gift",
    "OF": "Optional Feature",
    "DG": "Dark Gift",
    "RF:B": "Replacement Feature: Background",
    "CS": "Character Secret",
};

Parser.charCreationOptionTypeToFull = function(type) {
    if (Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL[type])
        return Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL[type];
    if (PrereleaseUtil.getMetaLookup("charOption")?.[type])
        return PrereleaseUtil.getMetaLookup("charOption")[type];
    if (BrewUtil2.getMetaLookup("charOption")?.[type])
        return BrewUtil2.getMetaLookup("charOption")[type];
    return type;
}
;

Parser.alignmentAbvToFull = function(alignment) {
    if (!alignment)
        return null;
    if (typeof alignment === "object") {
        if (alignment.special != null) {
            return alignment.special;
        } else {
            return `${alignment.alignment.map(a=>Parser.alignmentAbvToFull(a)).join(" ")}${alignment.chance ? ` (${alignment.chance}%)` : ""}${alignment.note ? ` (${alignment.note})` : ""}`;
        }
    } else {
        alignment = alignment.toUpperCase();
        switch (alignment) {
        case "L":
            return "lawful";
        case "N":
            return "neutral";
        case "NX":
            return "neutral (law/chaos axis)";
        case "NY":
            return "neutral (good/evil axis)";
        case "C":
            return "chaotic";
        case "G":
            return "good";
        case "E":
            return "evil";
        case "U":
            return "unaligned";
        case "A":
            return "any alignment";
        }
        return alignment;
    }
}
;

Parser.alignmentListToFull = function(alignList) {
    if (!alignList)
        return "";
    if (alignList.some(it=>typeof it !== "string")) {
        if (alignList.some(it=>typeof it === "string"))
            throw new Error(`Mixed alignment types: ${JSON.stringify(alignList)}`);
        alignList = alignList.filter(it=>it.alignment === undefined || it.alignment != null);
        return alignList.map(it=>it.special != null || it.chance != null || it.note != null ? Parser.alignmentAbvToFull(it) : Parser.alignmentListToFull(it.alignment)).join(" or ");
    } else {
        if (alignList.length === 1)
            return Parser.alignmentAbvToFull(alignList[0]);
        if (alignList.length === 2) {
            return alignList.map(a=>Parser.alignmentAbvToFull(a)).join(" ");
        }
        if (alignList.length === 3) {
            if (alignList.includes("NX") && alignList.includes("NY") && alignList.includes("N"))
                return "any neutral alignment";
        }
        if (alignList.length === 5) {
            if (!alignList.includes("G"))
                return "any non-good alignment";
            if (!alignList.includes("E"))
                return "any non-evil alignment";
            if (!alignList.includes("L"))
                return "any non-lawful alignment";
            if (!alignList.includes("C"))
                return "any non-chaotic alignment";
        }
        if (alignList.length === 4) {
            if (!alignList.includes("L") && !alignList.includes("NX"))
                return "any chaotic alignment";
            if (!alignList.includes("G") && !alignList.includes("NY"))
                return "any evil alignment";
            if (!alignList.includes("C") && !alignList.includes("NX"))
                return "any lawful alignment";
            if (!alignList.includes("E") && !alignList.includes("NY"))
                return "any good alignment";
        }
        throw new Error(`Unmapped alignment: ${JSON.stringify(alignList)}`);
    }
}
;

Parser.weightToFull = function(lbs, isSmallUnit) {
    const tons = Math.floor(lbs / 2000);
    lbs = lbs - (2000 * tons);
    return [tons ? `${tons}${isSmallUnit ? `<span class="ve-small ml-1">` : " "}ton${tons === 1 ? "" : "s"}${isSmallUnit ? `</span>` : ""}` : null, lbs ? `${lbs}${isSmallUnit ? `<span class="ve-small ml-1">` : " "}lb.${isSmallUnit ? `</span>` : ""}` : null, ].filter(Boolean).join(", ");
}
;

Parser.RARITIES = ["common", "uncommon", "rare", "very rare", "legendary", "artifact"];
Parser.ITEM_RARITIES = ["none", ...Parser.RARITIES, "unknown", "unknown (magic)", "other"];

Parser.CAT_ID_CREATURE = 1;
Parser.CAT_ID_SPELL = 2;
Parser.CAT_ID_BACKGROUND = 3;
Parser.CAT_ID_ITEM = 4;
Parser.CAT_ID_CLASS = 5;
Parser.CAT_ID_CONDITION = 6;
Parser.CAT_ID_FEAT = 7;
Parser.CAT_ID_ELDRITCH_INVOCATION = 8;
Parser.CAT_ID_PSIONIC = 9;
Parser.CAT_ID_RACE = 10;
Parser.CAT_ID_OTHER_REWARD = 11;
Parser.CAT_ID_VARIANT_OPTIONAL_RULE = 12;
Parser.CAT_ID_ADVENTURE = 13;
Parser.CAT_ID_DEITY = 14;
Parser.CAT_ID_OBJECT = 15;
Parser.CAT_ID_TRAP = 16;
Parser.CAT_ID_HAZARD = 17;
Parser.CAT_ID_QUICKREF = 18;
Parser.CAT_ID_CULT = 19;
Parser.CAT_ID_BOON = 20;
Parser.CAT_ID_DISEASE = 21;
Parser.CAT_ID_METAMAGIC = 22;
Parser.CAT_ID_MANEUVER_BATTLEMASTER = 23;
Parser.CAT_ID_TABLE = 24;
Parser.CAT_ID_TABLE_GROUP = 25;
Parser.CAT_ID_MANEUVER_CAVALIER = 26;
Parser.CAT_ID_ARCANE_SHOT = 27;
Parser.CAT_ID_OPTIONAL_FEATURE_OTHER = 28;
Parser.CAT_ID_FIGHTING_STYLE = 29;
Parser.CAT_ID_CLASS_FEATURE = 30;
Parser.CAT_ID_VEHICLE = 31;
Parser.CAT_ID_PACT_BOON = 32;
Parser.CAT_ID_ELEMENTAL_DISCIPLINE = 33;
Parser.CAT_ID_ARTIFICER_INFUSION = 34;
Parser.CAT_ID_SHIP_UPGRADE = 35;
Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE = 36;
Parser.CAT_ID_ONOMANCY_RESONANT = 37;
Parser.CAT_ID_RUNE_KNIGHT_RUNE = 37;
Parser.CAT_ID_ALCHEMICAL_FORMULA = 38;
Parser.CAT_ID_MANEUVER = 39;
Parser.CAT_ID_SUBCLASS = 40;
Parser.CAT_ID_SUBCLASS_FEATURE = 41;
Parser.CAT_ID_ACTION = 42;
Parser.CAT_ID_LANGUAGE = 43;
Parser.CAT_ID_BOOK = 44;
Parser.CAT_ID_PAGE = 45;
Parser.CAT_ID_LEGENDARY_GROUP = 46;
Parser.CAT_ID_CHAR_CREATION_OPTIONS = 47;
Parser.CAT_ID_RECIPES = 48;
Parser.CAT_ID_STATUS = 49;
Parser.CAT_ID_SKILLS = 50;
Parser.CAT_ID_SENSES = 51;
Parser.CAT_ID_DECK = 52;
Parser.CAT_ID_CARD = 53;

Parser.CAT_ID_TO_FULL = {};
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CREATURE] = "Bestiary";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SPELL] = "Spell";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BACKGROUND] = "Background";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ITEM] = "Item";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS] = "Class";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CONDITION] = "Condition";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FEAT] = "Feat";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ELDRITCH_INVOCATION] = "Eldritch Invocation";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PSIONIC] = "Psionic";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RACE] = "Race";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OTHER_REWARD] = "Other Reward";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = "Variant/Optional Rule";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ADVENTURE] = "Adventure";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DEITY] = "Deity";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OBJECT] = "Object";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TRAP] = "Trap";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_HAZARD] = "Hazard";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_QUICKREF] = "Quick Reference";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CULT] = "Cult";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BOON] = "Boon";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DISEASE] = "Disease";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_METAMAGIC] = "Metamagic";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = "Maneuver; Battlemaster";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE] = "Table";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE_GROUP] = "Table";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER_CAVALIER] = "Maneuver; Cavalier";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARCANE_SHOT] = "Arcane Shot";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = "Optional Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FIGHTING_STYLE] = "Fighting Style";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS_FEATURE] = "Class Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VEHICLE] = "Vehicle";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PACT_BOON] = "Pact Boon";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = "Elemental Discipline";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARTIFICER_INFUSION] = "Infusion";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SHIP_UPGRADE] = "Ship Upgrade";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] = "Infernal War Machine Upgrade";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ONOMANCY_RESONANT] = "Onomancy Resonant";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = "Rune Knight Rune";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ALCHEMICAL_FORMULA] = "Alchemical Formula";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER] = "Maneuver";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS] = "Subclass";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS_FEATURE] = "Subclass Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ACTION] = "Action";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_LANGUAGE] = "Language";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BOOK] = "Book";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PAGE] = "Page";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_LEGENDARY_GROUP] = "Legendary Group";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CHAR_CREATION_OPTIONS] = "Character Creation Option";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RECIPES] = "Recipe";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_STATUS] = "Status";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DECK] = "Deck";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CARD] = "Card";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SKILLS] = "Skill";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SENSES] = "Sense";

Parser.pageCategoryToFull = function(catId) {
    return Parser._parse_aToB(Parser.CAT_ID_TO_FULL, catId);
}
;

Parser.CAT_ID_TO_PROP = {};
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CREATURE] = "monster";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SPELL] = "spell";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BACKGROUND] = "background";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ITEM] = "item";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS] = "class";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CONDITION] = "condition";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FEAT] = "feat";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PSIONIC] = "psionic";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RACE] = "race";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OTHER_REWARD] = "reward";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = "variantrule";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ADVENTURE] = "adventure";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DEITY] = "deity";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OBJECT] = "object";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TRAP] = "trap";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_HAZARD] = "hazard";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CULT] = "cult";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BOON] = "boon";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DISEASE] = "condition";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE] = "table";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE_GROUP] = "tableGroup";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VEHICLE] = "vehicle";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ELDRITCH_INVOCATION] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER_CAVALIER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARCANE_SHOT] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FIGHTING_STYLE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_METAMAGIC] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PACT_BOON] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARTIFICER_INFUSION] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SHIP_UPGRADE] = "vehicleUpgrade";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] = "vehicleUpgrade";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ONOMANCY_RESONANT] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ALCHEMICAL_FORMULA] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_QUICKREF] = null;
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS_FEATURE] = "classFeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS] = "subclass";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS_FEATURE] = "subclassFeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ACTION] = "action";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_LANGUAGE] = "language";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BOOK] = "book";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PAGE] = null;
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_LEGENDARY_GROUP] = "legendaryGroup";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CHAR_CREATION_OPTIONS] = "charoption";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RECIPES] = "recipe";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_STATUS] = "status";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DECK] = "deck";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CARD] = "card";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SKILLS] = "skill";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SENSES] = "sense";

Parser.pageCategoryToProp = function(catId) {
    return Parser._parse_aToB(Parser.CAT_ID_TO_PROP, catId);
}
;

Parser.ABIL_ABVS = ["str", "dex", "con", "int", "wis", "cha"];

Parser.spClassesToCurrentAndLegacy = function(fromClassList) {
    const current = [];
    const legacy = [];
    fromClassList.forEach(cls=>{
        if ((cls.name === "Artificer" && cls.source === "UAArtificer") || (cls.name === "Artificer (Revisited)" && cls.source === "UAArtificerRevisited"))
            legacy.push(cls);
        else
            current.push(cls);
    }
    );
    return [current, legacy];
}
;

Parser.spSubclassesToCurrentAndLegacyFull = function(sp, subclassLookup) {
    return Parser._spSubclassesToCurrentAndLegacyFull({
        sp,
        subclassLookup,
        prop: "fromSubclass"
    });
}
;

Parser.spVariantSubclassesToCurrentAndLegacyFull = function(sp, subclassLookup) {
    return Parser._spSubclassesToCurrentAndLegacyFull({
        sp,
        subclassLookup,
        prop: "fromSubclassVariant"
    });
}
;

Parser._spSubclassesToCurrentAndLegacyFull = ({sp, subclassLookup, prop})=>{
    const fromSubclass = Renderer.spell.getCombinedClasses(sp, prop);
    if (!fromSubclass.length)
        return ["", ""];

    const current = [];
    const legacy = [];
    const curNames = new Set();
    const toCheck = [];
    fromSubclass.filter(c=>{
        const excludeClass = ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({
            name: c.class.name,
            source: c.class.source
        }), "class", c.class.source, {
            isNoCount: true
        }, );
        if (excludeClass)
            return false;

        const excludeSubclass = ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER["subclass"]({
            shortName: c.subclass.shortName,
            source: c.subclass.source,
            className: c.class.name,
            classSource: c.class.source,
        }), "subclass", c.subclass.source, {
            isNoCount: true
        }, );
        if (excludeSubclass)
            return false;

        return !Renderer.spell.isExcludedSubclassVariantSource({
            classDefinedInSource: c.class.definedInSource
        });
    }
    ).sort((a,b)=>{
        const byName = SortUtil.ascSort(a.subclass.name, b.subclass.name);
        return byName || SortUtil.ascSort(a.class.name, b.class.name);
    }
    ).forEach(c=>{
        const nm = c.subclass.name;
        const src = c.subclass.source;

        const toAdd = Parser._spSubclassItem({
            fromSubclass: c,
            isTextOnly: false
        });

        const fromLookup = MiscUtil.get(subclassLookup, c.class.source, c.class.name, c.subclass.source, c.subclass.name, );

        if (fromLookup && fromLookup.isReprinted) {
            legacy.push(toAdd);
        } else if (SourceUtil.isNonstandardSource(src)) {
            const cleanName = Parser._spSubclassesToCurrentAndLegacyFull.mapClassShortNameToMostRecent(nm.split("(")[0].trim().split(/v\d+/)[0].trim(), );
            toCheck.push({
                "name": cleanName,
                "ele": toAdd
            });
        } else {
            current.push(toAdd);
            curNames.add(nm);
        }
    }
    );

    toCheck.forEach(n=>{
        if (curNames.has(n.name)) {
            legacy.push(n.ele);
        } else {
            current.push(n.ele);
        }
    }
    );

    return [current.join(", "), legacy.join(", ")];
}
;

Parser._spSubclassesToCurrentAndLegacyFull.mapClassShortNameToMostRecent = (shortName)=>{
    switch (shortName) {
    case "Favored Soul":
        return "Divine Soul";
    case "Undying Light":
        return "Celestial";
    case "Deep Stalker":
        return "Gloom Stalker";
    }
    return shortName;
}
;

Parser.spVariantClassesToCurrentAndLegacy = function(fromVariantClassList) {
    const current = [];
    const legacy = [];
    fromVariantClassList.forEach(cls=>{
        if (SourceUtil.isPrereleaseSource(cls.definedInSource))
            legacy.push(cls);
        else
            current.push(cls);
    }
    );
    return [current, legacy];
}
;

Parser.attackTypeToFull = function(attackType) {
    return Parser._parse_aToB(Parser.ATK_TYPE_TO_FULL, attackType);
}
;

Parser.trapHazTypeToFull = function(type) {
    return Parser._parse_aToB(Parser.TRAP_HAZARD_TYPE_TO_FULL, type);
}
;

Parser.TRAP_HAZARD_TYPE_TO_FULL = {
    MECH: "Mechanical Trap",
    MAG: "Magical Trap",
    SMPL: "Simple Trap",
    CMPX: "Complex Trap",
    HAZ: "Hazard",
    WTH: "Weather",
    ENV: "Environmental Hazard",
    WLD: "Wilderness Hazard",
    GEN: "Generic",
    EST: "Eldritch Storm",
};

Parser.tierToFullLevel = function(tier) {
    return Parser._parse_aToB(Parser.TIER_TO_FULL_LEVEL, tier);
}
;

Parser.TIER_TO_FULL_LEVEL = {};
Parser.TIER_TO_FULL_LEVEL[1] = "1st\u20134th Level";
Parser.TIER_TO_FULL_LEVEL[2] = "5th\u201310th Level";
Parser.TIER_TO_FULL_LEVEL[3] = "11th\u201316th Level";
Parser.TIER_TO_FULL_LEVEL[4] = "17th\u201320th Level";

Parser.trapInitToFull = function(init) {
    return Parser._parse_aToB(Parser.TRAP_INIT_TO_FULL, init);
}
;

Parser.TRAP_INIT_TO_FULL = {};
Parser.TRAP_INIT_TO_FULL[1] = "initiative count 10";
Parser.TRAP_INIT_TO_FULL[2] = "initiative count 20";
Parser.TRAP_INIT_TO_FULL[3] = "initiative count 20 and initiative count 10";

Parser.ATK_TYPE_TO_FULL = {};
Parser.ATK_TYPE_TO_FULL["MW"] = "Melee Weapon Attack";
Parser.ATK_TYPE_TO_FULL["RW"] = "Ranged Weapon Attack";

Parser.bookOrdinalToAbv = (ordinal,preNoSuff)=>{
    if (ordinal === undefined)
        return "";
    switch (ordinal.type) {
    case "part":
        return `${preNoSuff ? " " : ""}Part ${ordinal.identifier}${preNoSuff ? "" : " \u2014 "}`;
    case "chapter":
        return `${preNoSuff ? " " : ""}Ch. ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
    case "episode":
        return `${preNoSuff ? " " : ""}Ep. ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
    case "appendix":
        return `${preNoSuff ? " " : ""}App.${ordinal.identifier != null ? ` ${ordinal.identifier}` : ""}${preNoSuff ? "" : ": "}`;
    case "level":
        return `${preNoSuff ? " " : ""}Level ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
    default:
        throw new Error(`Unhandled ordinal type "${ordinal.type}"`);
    }
}
;

Parser.IMAGE_TYPE_TO_FULL = {
    "map": "Map",
    "mapPlayer": "Map (Player)",
};
Parser.imageTypeToFull = function(imageType) {
    return Parser._parse_aToB(Parser.IMAGE_TYPE_TO_FULL, imageType, "Other");
}
;

Parser.nameToTokenName = function(name) {
    return name.toAscii().replace(/"/g, "");
}
;

Parser.bytesToHumanReadable = function(bytes, {fixedDigits=2}={}) {
    if (bytes == null)
        return "";
    if (!bytes)
        return "0 B";
    const e = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, e)).toFixed(fixedDigits)} ${`\u200bKMGTP`.charAt(e)}B`;
}
;

Parser.SKL_ABV_ABJ = "A";
Parser.SKL_ABV_EVO = "V";
Parser.SKL_ABV_ENC = "E";
Parser.SKL_ABV_ILL = "I";
Parser.SKL_ABV_DIV = "D";
Parser.SKL_ABV_NEC = "N";
Parser.SKL_ABV_TRA = "T";
Parser.SKL_ABV_CON = "C";
Parser.SKL_ABV_PSI = "P";
Parser.SKL_ABVS = [Parser.SKL_ABV_ABJ, Parser.SKL_ABV_CON, Parser.SKL_ABV_DIV, Parser.SKL_ABV_ENC, Parser.SKL_ABV_EVO, Parser.SKL_ABV_ILL, Parser.SKL_ABV_NEC, Parser.SKL_ABV_PSI, Parser.SKL_ABV_TRA, ];

Parser.SP_TM_ACTION = "action";
Parser.SP_TM_B_ACTION = "bonus";
Parser.SP_TM_REACTION = "reaction";
Parser.SP_TM_ROUND = "round";
Parser.SP_TM_MINS = "minute";
Parser.SP_TM_HRS = "hour";
Parser.SP_TIME_SINGLETONS = [Parser.SP_TM_ACTION, Parser.SP_TM_B_ACTION, Parser.SP_TM_REACTION, Parser.SP_TM_ROUND];
Parser.SP_TIME_TO_FULL = {
    [Parser.SP_TM_ACTION]: "Action",
    [Parser.SP_TM_B_ACTION]: "Bonus Action",
    [Parser.SP_TM_REACTION]: "Reaction",
    [Parser.SP_TM_ROUND]: "Rounds",
    [Parser.SP_TM_MINS]: "Minutes",
    [Parser.SP_TM_HRS]: "Hours",
};
Parser.spTimeUnitToFull = function(timeUnit) {
    return Parser._parse_aToB(Parser.SP_TIME_TO_FULL, timeUnit);
}
;

Parser.SP_TIME_TO_SHORT = {
    [Parser.SP_TM_ROUND]: "Rnd.",
    [Parser.SP_TM_MINS]: "Min.",
    [Parser.SP_TM_HRS]: "Hr.",
};
Parser.spTimeUnitToShort = function(timeUnit) {
    return Parser._parse_aToB(Parser.SP_TIME_TO_SHORT, timeUnit);
}
;

Parser.SP_TIME_TO_ABV = {
    [Parser.SP_TM_ACTION]: "A",
    [Parser.SP_TM_B_ACTION]: "BA",
    [Parser.SP_TM_REACTION]: "R",
    [Parser.SP_TM_ROUND]: "rnd",
    [Parser.SP_TM_MINS]: "min",
    [Parser.SP_TM_HRS]: "hr",
};
Parser.spTimeUnitToAbv = function(timeUnit) {
    return Parser._parse_aToB(Parser.SP_TIME_TO_ABV, timeUnit);
}
;

Parser.spTimeToShort = function(time, isHtml) {
    if (!time)
        return "";
    return (time.number === 1 && Parser.SP_TIME_SINGLETONS.includes(time.unit)) ? `${Parser.spTimeUnitToAbv(time.unit).uppercaseFirst()}${time.condition ? "*" : ""}` : `${time.number} ${isHtml ? `<span class="ve-small">` : ""}${Parser.spTimeUnitToAbv(time.unit)}${isHtml ? `</span>` : ""}${time.condition ? "*" : ""}`;
}
;

Parser.SKL_ABJ = "Abjuration";
Parser.SKL_EVO = "Evocation";
Parser.SKL_ENC = "Enchantment";
Parser.SKL_ILL = "Illusion";
Parser.SKL_DIV = "Divination";
Parser.SKL_NEC = "Necromancy";
Parser.SKL_TRA = "Transmutation";
Parser.SKL_CON = "Conjuration";
Parser.SKL_PSI = "Psionic";

Parser.SP_SCHOOL_ABV_TO_FULL = {};
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ABJ] = Parser.SKL_ABJ;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_EVO] = Parser.SKL_EVO;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ENC] = Parser.SKL_ENC;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ILL] = Parser.SKL_ILL;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_DIV] = Parser.SKL_DIV;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_NEC] = Parser.SKL_NEC;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_TRA] = Parser.SKL_TRA;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_CON] = Parser.SKL_CON;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_PSI] = Parser.SKL_PSI;

Parser.SP_SCHOOL_ABV_TO_SHORT = {};
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ABJ] = "Abj.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_EVO] = "Evoc.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ENC] = "Ench.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ILL] = "Illu.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_DIV] = "Divin.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_NEC] = "Necro.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_TRA] = "Trans.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_CON] = "Conj.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_PSI] = "Psi.";

Parser.ATB_ABV_TO_FULL = {
    "str": "Strength",
    "dex": "Dexterity",
    "con": "Constitution",
    "int": "Intelligence",
    "wis": "Wisdom",
    "cha": "Charisma",
};

Parser.TP_ABERRATION = "aberration";
Parser.TP_BEAST = "beast";
Parser.TP_CELESTIAL = "celestial";
Parser.TP_CONSTRUCT = "construct";
Parser.TP_DRAGON = "dragon";
Parser.TP_ELEMENTAL = "elemental";
Parser.TP_FEY = "fey";
Parser.TP_FIEND = "fiend";
Parser.TP_GIANT = "giant";
Parser.TP_HUMANOID = "humanoid";
Parser.TP_MONSTROSITY = "monstrosity";
Parser.TP_OOZE = "ooze";
Parser.TP_PLANT = "plant";
Parser.TP_UNDEAD = "undead";
Parser.MON_TYPES = [Parser.TP_ABERRATION, Parser.TP_BEAST, Parser.TP_CELESTIAL, Parser.TP_CONSTRUCT, Parser.TP_DRAGON, Parser.TP_ELEMENTAL, Parser.TP_FEY, Parser.TP_FIEND, Parser.TP_GIANT, Parser.TP_HUMANOID, Parser.TP_MONSTROSITY, Parser.TP_OOZE, Parser.TP_PLANT, Parser.TP_UNDEAD];
Parser.MON_TYPE_TO_PLURAL = {};
Parser.MON_TYPE_TO_PLURAL[Parser.TP_ABERRATION] = "aberrations";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_BEAST] = "beasts";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_CELESTIAL] = "celestials";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_CONSTRUCT] = "constructs";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_DRAGON] = "dragons";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_ELEMENTAL] = "elementals";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_FEY] = "fey";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_FIEND] = "fiends";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_GIANT] = "giants";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_HUMANOID] = "humanoids";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_MONSTROSITY] = "monstrosities";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_OOZE] = "oozes";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_PLANT] = "plants";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_UNDEAD] = "undead";

Parser.SZ_FINE = "F";
Parser.SZ_DIMINUTIVE = "D";
Parser.SZ_TINY = "T";
Parser.SZ_SMALL = "S";
Parser.SZ_MEDIUM = "M";
Parser.SZ_LARGE = "L";
Parser.SZ_HUGE = "H";
Parser.SZ_GARGANTUAN = "G";
Parser.SZ_COLOSSAL = "C";
Parser.SZ_VARIES = "V";
Parser.SIZE_ABVS = [Parser.SZ_TINY, Parser.SZ_SMALL, Parser.SZ_MEDIUM, Parser.SZ_LARGE, Parser.SZ_HUGE, Parser.SZ_GARGANTUAN, Parser.SZ_VARIES];
Parser.SIZE_ABV_TO_FULL = {};
Parser.SIZE_ABV_TO_FULL[Parser.SZ_FINE] = "Fine";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_DIMINUTIVE] = "Diminutive";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_TINY] = "Tiny";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_SMALL] = "Small";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_MEDIUM] = "Medium";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_LARGE] = "Large";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_HUGE] = "Huge";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_GARGANTUAN] = "Gargantuan";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_COLOSSAL] = "Colossal";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_VARIES] = "Varies";

Parser.XP_CHART_ALT = {
    "0": 10,
    "1/8": 25,
    "1/4": 50,
    "1/2": 100,
    "1": 200,
    "2": 450,
    "3": 700,
    "4": 1100,
    "5": 1800,
    "6": 2300,
    "7": 2900,
    "8": 3900,
    "9": 5000,
    "10": 5900,
    "11": 7200,
    "12": 8400,
    "13": 10000,
    "14": 11500,
    "15": 13000,
    "16": 15000,
    "17": 18000,
    "18": 20000,
    "19": 22000,
    "20": 25000,
    "21": 33000,
    "22": 41000,
    "23": 50000,
    "24": 62000,
    "25": 75000,
    "26": 90000,
    "27": 105000,
    "28": 120000,
    "29": 135000,
    "30": 155000,
};

Parser.ARMOR_ABV_TO_FULL = {
    "l.": "light",
    "m.": "medium",
    "h.": "heavy",
};

Parser.WEAPON_ABV_TO_FULL = {
    "s.": "simple",
    "m.": "martial",
};

Parser.CONDITION_TO_COLOR = {
    "Blinded": "#525252",
    "Charmed": "#f01789",
    "Deafened": "#ababab",
    "Exhausted": "#947a47",
    "Frightened": "#c9ca18",
    "Grappled": "#8784a0",
    "Incapacitated": "#3165a0",
    "Invisible": "#7ad2d6",
    "Paralyzed": "#c00900",
    "Petrified": "#a0a0a0",
    "Poisoned": "#4dc200",
    "Prone": "#5e60a0",
    "Restrained": "#d98000",
    "Stunned": "#a23bcb",
    "Unconscious": "#3a40ad",

    "Concentration": "#009f7a",
};

Parser.RULE_TYPE_TO_FULL = {
    "O": "Optional",
    "P": "Prerelease",
    "V": "Variant",
    "VO": "Variant Optional",
    "VV": "Variant Variant",
    "U": "Unknown",
};

Parser.ruleTypeToFull = function(ruleType) {
    return Parser._parse_aToB(Parser.RULE_TYPE_TO_FULL, ruleType);
}
;

Parser.VEHICLE_TYPE_TO_FULL = {
    "SHIP": "Ship",
    "SPELLJAMMER": "Spelljammer Ship",
    "INFWAR": "Infernal War Machine",
    "CREATURE": "Creature",
    "OBJECT": "Object",
    "SHP:H": "Ship Upgrade, Hull",
    "SHP:M": "Ship Upgrade, Movement",
    "SHP:W": "Ship Upgrade, Weapon",
    "SHP:F": "Ship Upgrade, Figurehead",
    "SHP:O": "Ship Upgrade, Miscellaneous",
    "IWM:W": "Infernal War Machine Variant, Weapon",
    "IWM:A": "Infernal War Machine Upgrade, Armor",
    "IWM:G": "Infernal War Machine Upgrade, Gadget",
};

Parser.vehicleTypeToFull = function(vehicleType) {
    return Parser._parse_aToB(Parser.VEHICLE_TYPE_TO_FULL, vehicleType);
}
;

Parser.SRC_5ETOOLS_TMP = "Parser.SRC_5ETOOLS_TMP";
Parser.SRC_CoS = "CoS";
Parser.SRC_DMG = "DMG";
Parser.SRC_EEPC = "EEPC";
Parser.SRC_EET = "EET";
Parser.SRC_HotDQ = "HotDQ";
Parser.SRC_LMoP = "LMoP";
Parser.SRC_MM = "MM";
Parser.SRC_OotA = "OotA";
Parser.SRC_PHB = "PHB";
Parser.SRC_PotA = "PotA";
Parser.SRC_RoT = "RoT";
Parser.SRC_RoTOS = "RoTOS";
Parser.SRC_SCAG = "SCAG";
Parser.SRC_SKT = "SKT";
Parser.SRC_ToA = "ToA";
Parser.SRC_TLK = "TLK";
Parser.SRC_ToD = "ToD";
Parser.SRC_TTP = "TTP";
Parser.SRC_TYP = "TftYP";
Parser.SRC_TYP_AtG = "TftYP-AtG";
Parser.SRC_TYP_DiT = "TftYP-DiT";
Parser.SRC_TYP_TFoF = "TftYP-TFoF";
Parser.SRC_TYP_THSoT = "TftYP-THSoT";
Parser.SRC_TYP_TSC = "TftYP-TSC";
Parser.SRC_TYP_ToH = "TftYP-ToH";
Parser.SRC_TYP_WPM = "TftYP-WPM";
Parser.SRC_VGM = "VGM";
Parser.SRC_XGE = "XGE";
Parser.SRC_OGA = "OGA";
Parser.SRC_MTF = "MTF";
Parser.SRC_WDH = "WDH";
Parser.SRC_WDMM = "WDMM";
Parser.SRC_GGR = "GGR";
Parser.SRC_KKW = "KKW";
Parser.SRC_LLK = "LLK";
Parser.SRC_AZfyT = "AZfyT";
Parser.SRC_GoS = "GoS";
Parser.SRC_AI = "AI";
Parser.SRC_OoW = "OoW";
Parser.SRC_ESK = "ESK";
Parser.SRC_DIP = "DIP";
Parser.SRC_HftT = "HftT";
Parser.SRC_DC = "DC";
Parser.SRC_SLW = "SLW";
Parser.SRC_SDW = "SDW";
Parser.SRC_BGDIA = "BGDIA";
Parser.SRC_LR = "LR";
Parser.SRC_AL = "AL";
Parser.SRC_SAC = "SAC";
Parser.SRC_ERLW = "ERLW";
Parser.SRC_EFR = "EFR";
Parser.SRC_RMBRE = "RMBRE";
Parser.SRC_RMR = "RMR";
Parser.SRC_MFF = "MFF";
Parser.SRC_AWM = "AWM";
Parser.SRC_IMR = "IMR";
Parser.SRC_SADS = "SADS";
Parser.SRC_EGW = "EGW";
Parser.SRC_EGW_ToR = "ToR";
Parser.SRC_EGW_DD = "DD";
Parser.SRC_EGW_FS = "FS";
Parser.SRC_EGW_US = "US";
Parser.SRC_MOT = "MOT";
Parser.SRC_IDRotF = "IDRotF";
Parser.SRC_TCE = "TCE";
Parser.SRC_VRGR = "VRGR";
Parser.SRC_HoL = "HoL";
Parser.SRC_XMtS = "XMtS";
Parser.SRC_RtG = "RtG";
Parser.SRC_AitFR = "AitFR";
Parser.SRC_AitFR_ISF = "AitFR-ISF";
Parser.SRC_AitFR_THP = "AitFR-THP";
Parser.SRC_AitFR_AVT = "AitFR-AVT";
Parser.SRC_AitFR_DN = "AitFR-DN";
Parser.SRC_AitFR_FCD = "AitFR-FCD";
Parser.SRC_WBtW = "WBtW";
Parser.SRC_DoD = "DoD";
Parser.SRC_MaBJoV = "MaBJoV";
Parser.SRC_FTD = "FTD";
Parser.SRC_SCC = "SCC";
Parser.SRC_SCC_CK = "SCC-CK";
Parser.SRC_SCC_HfMT = "SCC-HfMT";
Parser.SRC_SCC_TMM = "SCC-TMM";
Parser.SRC_SCC_ARiR = "SCC-ARiR";
Parser.SRC_MPMM = "MPMM";
Parser.SRC_CRCotN = "CRCotN";
Parser.SRC_JttRC = "JttRC";
Parser.SRC_SAiS = "SAiS";
Parser.SRC_AAG = "AAG";
Parser.SRC_BAM = "BAM";
Parser.SRC_LoX = "LoX";
Parser.SRC_DoSI = "DoSI";
Parser.SRC_DSotDQ = "DSotDQ";
Parser.SRC_KftGV = "KftGV";
Parser.SRC_BGG = "BGG";
Parser.SRC_TDCSR = "TDCSR";
Parser.SRC_PaBTSO = "PaBTSO";
Parser.SRC_PAitM = "PAitM";
Parser.SRC_SatO = "SatO";
Parser.SRC_ToFW = "ToFW";
Parser.SRC_MPP = "MPP";
Parser.SRC_BMT = "BMT";
Parser.SRC_GHLoE = "GHLoE";
Parser.SRC_DoDk = "DoDk";
Parser.SRC_SCREEN = "Screen";
Parser.SRC_SCREEN_WILDERNESS_KIT = "ScreenWildernessKit";
Parser.SRC_SCREEN_DUNGEON_KIT = "ScreenDungeonKit";
Parser.SRC_SCREEN_SPELLJAMMER = "ScreenSpelljammer";
Parser.SRC_HF = "HF";
Parser.SRC_HFFotM = "HFFotM";
Parser.SRC_HFStCM = "HFStCM";
Parser.SRC_CM = "CM";
Parser.SRC_NRH = "NRH";
Parser.SRC_NRH_TCMC = "NRH-TCMC";
Parser.SRC_NRH_AVitW = "NRH-AVitW";
Parser.SRC_NRH_ASS = "NRH-ASS";
Parser.SRC_NRH_CoI = "NRH-CoI";
Parser.SRC_NRH_TLT = "NRH-TLT";
Parser.SRC_NRH_AWoL = "NRH-AWoL";
Parser.SRC_NRH_AT = "NRH-AT";
Parser.SRC_MGELFT = "MGELFT";
Parser.SRC_VD = "VD";
Parser.SRC_SjA = "SjA";
Parser.SRC_HAT_TG = "HAT-TG";
Parser.SRC_HAT_LMI = "HAT-LMI";
Parser.SRC_GotSF = "GotSF";
Parser.SRC_LK = "LK";
Parser.SRC_CoA = "CoA";
Parser.SRC_PiP = "PiP";

Parser.SRC_AL_PREFIX = "AL";

Parser.SRC_ALCoS = `${Parser.SRC_AL_PREFIX}CurseOfStrahd`;
Parser.SRC_ALEE = `${Parser.SRC_AL_PREFIX}ElementalEvil`;
Parser.SRC_ALRoD = `${Parser.SRC_AL_PREFIX}RageOfDemons`;

Parser.SRC_PS_PREFIX = "PS";

Parser.SRC_PSA = `${Parser.SRC_PS_PREFIX}A`;
Parser.SRC_PSI = `${Parser.SRC_PS_PREFIX}I`;
Parser.SRC_PSK = `${Parser.SRC_PS_PREFIX}K`;
Parser.SRC_PSZ = `${Parser.SRC_PS_PREFIX}Z`;
Parser.SRC_PSX = `${Parser.SRC_PS_PREFIX}X`;
Parser.SRC_PSD = `${Parser.SRC_PS_PREFIX}D`;

Parser.SRC_UA_PREFIX = "UA";
Parser.SRC_UA_ONE_PREFIX = "XUA";
Parser.SRC_MCVX_PREFIX = "MCV";
Parser.SRC_MisMVX_PREFIX = "MisMV";
Parser.SRC_AA_PREFIX = "AA";

Parser.SRC_UATMC = `${Parser.SRC_UA_PREFIX}TheMysticClass`;
Parser.SRC_MCV1SC = `${Parser.SRC_MCVX_PREFIX}1SC`;
Parser.SRC_MCV2DC = `${Parser.SRC_MCVX_PREFIX}2DC`;
Parser.SRC_MCV3MC = `${Parser.SRC_MCVX_PREFIX}3MC`;
Parser.SRC_MCV4EC = `${Parser.SRC_MCVX_PREFIX}4EC`;
Parser.SRC_MisMV1 = `${Parser.SRC_MisMVX_PREFIX}1`;
Parser.SRC_AATM = `${Parser.SRC_AA_PREFIX}TM`;

Parser.AL_PREFIX = "Adventurers League: ";
Parser.AL_PREFIX_SHORT = "AL: ";
Parser.PS_PREFIX = "Plane Shift: ";
Parser.PS_PREFIX_SHORT = "PS: ";
Parser.UA_PREFIX = "Unearthed Arcana: ";
Parser.UA_PREFIX_SHORT = "UA: ";
Parser.TftYP_NAME = "Tales from the Yawning Portal";
Parser.AitFR_NAME = "Adventures in the Forgotten Realms";
Parser.NRH_NAME = "NERDS Restoring Harmony";
Parser.MCVX_PREFIX = "Monstrous Compendium Volume ";
Parser.MisMVX_PREFIX = "Misplaced Monsters: Volume ";
Parser.AA_PREFIX = "Adventure Atlas: ";

Parser.SOURCE_JSON_TO_FULL = {};
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CoS] = "Curse of Strahd";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DMG] = "Dungeon Master's Guide";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EEPC] = "Elemental Evil Player's Companion";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EET] = "Elemental Evil: Trinkets";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HotDQ] = "Hoard of the Dragon Queen";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LMoP] = "Lost Mine of Phandelver";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MM] = "Monster Manual";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OotA] = "Out of the Abyss";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PHB] = "Player's Handbook";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PotA] = "Princes of the Apocalypse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RoT] = "The Rise of Tiamat";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RoTOS] = "The Rise of Tiamat Online Supplement";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCAG] = "Sword Coast Adventurer's Guide";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SKT] = "Storm King's Thunder";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToA] = "Tomb of Annihilation";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TLK] = "The Lost Kenku";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToD] = "Tyranny of Dragons";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TTP] = "The Tortle Package";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP] = Parser.TftYP_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_AtG] = `${Parser.TftYP_NAME}: Against the Giants`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_DiT] = `${Parser.TftYP_NAME}: Dead in Thay`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_TFoF] = `${Parser.TftYP_NAME}: The Forge of Fury`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_THSoT] = `${Parser.TftYP_NAME}: The Hidden Shrine of Tamoachan`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_TSC] = `${Parser.TftYP_NAME}: The Sunless Citadel`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_ToH] = `${Parser.TftYP_NAME}: Tomb of Horrors`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_WPM] = `${Parser.TftYP_NAME}: White Plume Mountain`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VGM] = "Volo's Guide to Monsters";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XGE] = "Xanathar's Guide to Everything";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OGA] = "One Grung Above";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MTF] = "Mordenkainen's Tome of Foes";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WDH] = "Waterdeep: Dragon Heist";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WDMM] = "Waterdeep: Dungeon of the Mad Mage";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GGR] = "Guildmasters' Guide to Ravnica";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_KKW] = "Krenko's Way";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LLK] = "Lost Laboratory of Kwalish";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AZfyT] = "A Zib for your Thoughts";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GoS] = "Ghosts of Saltmarsh";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AI] = "Acquisitions Incorporated";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OoW] = "The Orrery of the Wanderer";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ESK] = "Essentials Kit";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DIP] = "Dragon of Icespire Peak";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HftT] = "Hunt for the Thessalhydra";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DC] = "Divine Contention";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SLW] = "Storm Lord's Wrath";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SDW] = "Sleeping Dragon's Wake";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BGDIA] = "Baldur's Gate: Descent Into Avernus";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LR] = "Locathah Rising";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AL] = "Adventurers' League";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SAC] = "Sage Advice Compendium";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ERLW] = "Eberron: Rising from the Last War";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EFR] = "Eberron: Forgotten Relics";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RMBRE] = "The Lost Dungeon of Rickedness: Big Rick Energy";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RMR] = "Dungeons & Dragons vs. Rick and Morty: Basic Rules";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MFF] = "Mordenkainen's Fiendish Folio";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AWM] = "Adventure with Muk";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_IMR] = "Infernal Machine Rebuild";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SADS] = "Sapphire Anniversary Dice Set";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW] = "Explorer's Guide to Wildemount";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_ToR] = "Tide of Retribution";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_DD] = "Dangerous Designs";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_FS] = "Frozen Sick";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_US] = "Unwelcome Spirits";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MOT] = "Mythic Odysseys of Theros";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_IDRotF] = "Icewind Dale: Rime of the Frostmaiden";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TCE] = "Tasha's Cauldron of Everything";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VRGR] = "Van Richten's Guide to Ravenloft";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HoL] = "The House of Lament";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RtG] = "Return to Glory";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR] = Parser.AitFR_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_ISF] = `${Parser.AitFR_NAME}: In Scarlet Flames`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_THP] = `${Parser.AitFR_NAME}: The Hidden Page`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_AVT] = `${Parser.AitFR_NAME}: A Verdant Tomb`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_DN] = `${Parser.AitFR_NAME}: Deepest Night`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_FCD] = `${Parser.AitFR_NAME}: From Cyan Depths`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WBtW] = "The Wild Beyond the Witchlight";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoD] = "Domains of Delight";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MaBJoV] = "Minsc and Boo's Journal of Villainy";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_FTD] = "Fizban's Treasury of Dragons";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC] = "Strixhaven: A Curriculum of Chaos";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_CK] = "Campus Kerfuffle";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_HfMT] = "Hunt for Mage Tower";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_TMM] = "The Magister's Masquerade";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_ARiR] = "A Reckoning in Ruins";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MPMM] = "Mordenkainen Presents: Monsters of the Multiverse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CRCotN] = "Critical Role: Call of the Netherdeep";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_JttRC] = "Journeys through the Radiant Citadel";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SAiS] = "Spelljammer: Adventures in Space";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AAG] = "Astral Adventurer's Guide";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BAM] = "Boo's Astral Menagerie";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LoX] = "Light of Xaryxis";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoSI] = "Dragons of Stormwreck Isle";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DSotDQ] = "Dragonlance: Shadow of the Dragon Queen";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_KftGV] = "Keys from the Golden Vault";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BGG] = "Bigby Presents: Glory of the Giants";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TDCSR] = "Tal'Dorei Campaign Setting Reborn";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PaBTSO] = "Phandelver and Below: The Shattered Obelisk";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PAitM] = "Planescape: Adventures in the Multiverse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SatO] = "Sigil and the Outlands";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToFW] = "Turn of Fortune's Wheel";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MPP] = "Morte's Planar Parade";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BMT] = "The Book of Many Things";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GHLoE] = "Grim Hollow: Lairs of Etharis";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoDk] = "Dungeons of Drakkenheim";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN] = "Dungeon Master's Screen";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_WILDERNESS_KIT] = "Dungeon Master's Screen: Wilderness Kit";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_DUNGEON_KIT] = "Dungeon Master's Screen: Dungeon Kit";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_SPELLJAMMER] = "Dungeon Master's Screen: Spelljammer";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HF] = "Heroes' Feast";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HFFotM] = "Heroes' Feast: Flavors of the Multiverse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HFStCM] = "Heroes' Feast: Saving the Childrens Menu";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CM] = "Candlekeep Mysteries";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH] = Parser.NRH_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_TCMC] = `${Parser.NRH_NAME}: The Candy Mountain Caper`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AVitW] = `${Parser.NRH_NAME}: A Voice in the Wilderness`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_ASS] = `${Parser.NRH_NAME}: A Sticky Situation`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_CoI] = `${Parser.NRH_NAME}: Circus of Illusions`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_TLT] = `${Parser.NRH_NAME}: The Lost Tomb`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AWoL] = `${Parser.NRH_NAME}: A Web of Lies`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AT] = `${Parser.NRH_NAME}: Adventure Together`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MGELFT] = "Muk's Guide To Everything He Learned From Tasha";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VD] = "Vecna Dossier";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SjA] = "Spelljammer Academy";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HAT_TG] = "Honor Among Thieves: Thieves' Gallery";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HAT_LMI] = "Honor Among Thieves: Legendary Magic Items";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GotSF] = "Giants of the Star Forge";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LK] = "Lightning Keep";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CoA] = "Chains of Asmodeus";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PiP] = "Peril in Pinebrook";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALCoS] = `${Parser.AL_PREFIX}Curse of Strahd`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALEE] = `${Parser.AL_PREFIX}Elemental Evil`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALRoD] = `${Parser.AL_PREFIX}Rage of Demons`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSA] = `${Parser.PS_PREFIX}Amonkhet`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSI] = `${Parser.PS_PREFIX}Innistrad`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSK] = `${Parser.PS_PREFIX}Kaladesh`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSZ] = `${Parser.PS_PREFIX}Zendikar`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSX] = `${Parser.PS_PREFIX}Ixalan`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSD] = `${Parser.PS_PREFIX}Dominaria`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XMtS] = `X Marks the Spot`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_UATMC] = `${Parser.UA_PREFIX}The Mystic Class`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV1SC] = `${Parser.MCVX_PREFIX}1: Spelljammer Creatures`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV2DC] = `${Parser.MCVX_PREFIX}2: Dragonlance Creatures`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV3MC] = `${Parser.MCVX_PREFIX}3: Minecraft Creatures`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV4EC] = `${Parser.MCVX_PREFIX}4: Eldraine Creatures`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MisMV1] = `${Parser.MisMVX_PREFIX}1`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AATM] = `${Parser.AA_PREFIX}The Mortuary`;

Parser.SOURCE_JSON_TO_ABV = {};
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CoS] = "CoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DMG] = "DMG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EEPC] = "EEPC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EET] = "EET";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HotDQ] = "HotDQ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LMoP] = "LMoP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MM] = "MM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OotA] = "OotA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PHB] = "PHB";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PotA] = "PotA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RoT] = "RoT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RoTOS] = "RoTOS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCAG] = "SCAG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SKT] = "SKT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToA] = "ToA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TLK] = "TLK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToD] = "ToD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TTP] = "TTP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_AtG] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_DiT] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_TFoF] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_THSoT] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_TSC] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_ToH] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_WPM] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VGM] = "VGM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XGE] = "XGE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OGA] = "OGA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MTF] = "MTF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WDH] = "WDH";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WDMM] = "WDMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GGR] = "GGR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_KKW] = "KKW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LLK] = "LLK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AZfyT] = "AZfyT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GoS] = "GoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AI] = "AI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OoW] = "OoW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ESK] = "ESK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DIP] = "DIP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HftT] = "HftT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DC] = "DC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SLW] = "SLW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SDW] = "SDW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BGDIA] = "BGDIA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LR] = "LR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AL] = "AL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SAC] = "SAC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ERLW] = "ERLW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EFR] = "EFR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RMBRE] = "RMBRE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RMR] = "RMR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MFF] = "MFF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AWM] = "AWM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_IMR] = "IMR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SADS] = "SADS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW] = "EGW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_ToR] = "ToR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_DD] = "DD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_FS] = "FS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_US] = "US";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MOT] = "MOT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_IDRotF] = "IDRotF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TCE] = "TCE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VRGR] = "VRGR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HoL] = "HoL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RtG] = "RtG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR] = "AitFR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_ISF] = "AitFR-ISF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_THP] = "AitFR-THP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_AVT] = "AitFR-AVT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_DN] = "AitFR-DN";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_FCD] = "AitFR-FCD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WBtW] = "WBtW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoD] = "DoD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MaBJoV] = "MaBJoV";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_FTD] = "FTD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC] = "SCC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_CK] = "SCC-CK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_HfMT] = "SCC-HfMT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_TMM] = "SCC-TMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_ARiR] = "SCC-ARiR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MPMM] = "MPMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CRCotN] = "CRCotN";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_JttRC] = "JttRC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SAiS] = "SAiS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AAG] = "AAG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BAM] = "BAM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LoX] = "LoX";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoSI] = "DoSI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DSotDQ] = "DSotDQ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_KftGV] = "KftGV";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BGG] = "BGG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TDCSR] = "TDCSR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PaBTSO] = "PaBTSO";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PAitM] = "PAitM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SatO] = "SatO";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToFW] = "ToFW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MPP] = "MPP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BMT] = "BMT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GHLoE] = "GHLoE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoDk] = "DoDk";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN] = "Screen";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_WILDERNESS_KIT] = "ScWild";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_DUNGEON_KIT] = "ScDun";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_SPELLJAMMER] = "ScSJ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HF] = "HF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HFFotM] = "HFFotM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HFStCM] = "HFStCM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CM] = "CM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH] = "NRH";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_TCMC] = "NRH-TCMC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AVitW] = "NRH-AVitW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_ASS] = "NRH-ASS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_CoI] = "NRH-CoI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_TLT] = "NRH-TLT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AWoL] = "NRH-AWoL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AT] = "NRH-AT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MGELFT] = "MGELFT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VD] = "VD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SjA] = "SjA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HAT_TG] = "HAT-TG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HAT_LMI] = "HAT-LMI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GotSF] = "GotSF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LK] = "LK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CoA] = "CoA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PiP] = "PiP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALCoS] = "ALCoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALEE] = "ALEE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALRoD] = "ALRoD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSA] = "PSA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSI] = "PSI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSK] = "PSK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSZ] = "PSZ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSX] = "PSX";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSD] = "PSD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XMtS] = "XMtS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_UATMC] = "UAMy";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV1SC] = "MCV1SC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV2DC] = "MCV2DC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV3MC] = "MCV3MC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV4EC] = "MCV4EC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MisMV1] = "MisMV1";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AATM] = "AATM";

Parser.SOURCE_JSON_TO_DATE = {};
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CoS] = "2016-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DMG] = "2014-12-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EEPC] = "2015-03-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EET] = "2015-03-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HotDQ] = "2014-08-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LMoP] = "2014-07-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MM] = "2014-09-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OotA] = "2015-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PHB] = "2014-08-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PotA] = "2015-04-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RoT] = "2014-11-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RoTOS] = "2014-11-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCAG] = "2015-11-03";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SKT] = "2016-09-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToA] = "2017-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TLK] = "2017-11-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToD] = "2019-10-22";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TTP] = "2017-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_AtG] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_DiT] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_TFoF] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_THSoT] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_TSC] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_ToH] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_WPM] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VGM] = "2016-11-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XGE] = "2017-11-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OGA] = "2017-10-11";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MTF] = "2018-05-29";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WDH] = "2018-09-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WDMM] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GGR] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_KKW] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LLK] = "2018-11-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AZfyT] = "2019-03-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GoS] = "2019-05-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AI] = "2019-06-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OoW] = "2019-06-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ESK] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DIP] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HftT] = "2019-05-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DC] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SLW] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SDW] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BGDIA] = "2019-09-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LR] = "2019-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SAC] = "2019-01-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ERLW] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EFR] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RMBRE] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RMR] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MFF] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AWM] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_IMR] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SADS] = "2019-12-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_ToR] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_DD] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_FS] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_US] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MOT] = "2020-06-02";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_IDRotF] = "2020-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TCE] = "2020-11-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VRGR] = "2021-05-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HoL] = "2021-05-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RtG] = "2021-05-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR] = "2021-06-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_ISF] = "2021-06-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_THP] = "2021-07-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_AVT] = "2021-07-14";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_DN] = "2021-07-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_FCD] = "2021-07-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WBtW] = "2021-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoD] = "2021-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MaBJoV] = "2021-10-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_FTD] = "2021-11-26";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_CK] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_HfMT] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_TMM] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_ARiR] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MPMM] = "2022-01-25";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CRCotN] = "2022-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_JttRC] = "2022-07-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SAiS] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AAG] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BAM] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LoX] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoSI] = "2022-07-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DSotDQ] = "2022-11-22";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_KftGV] = "2023-02-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BGG] = "2023-08-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TDCSR] = "2022-01-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PaBTSO] = "2023-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PAitM] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SatO] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToFW] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MPP] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BMT] = "2023-11-14";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GHLoE] = "2023-11-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoDk] = "2023-12-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN] = "2015-01-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_WILDERNESS_KIT] = "2020-11-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_DUNGEON_KIT] = "2020-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_SPELLJAMMER] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HF] = "2020-10-27";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HFFotM] = "2023-11-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HFStCM] = "2023-11-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CM] = "2021-03-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_TCMC] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AVitW] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_ASS] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_CoI] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_TLT] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AWoL] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AT] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MGELFT] = "2020-12-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VD] = "2022-06-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SjA] = "2022-07-11";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HAT_TG] = "2023-03-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HAT_LMI] = "2023-03-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GotSF] = "2023-08-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LK] = "2023-09-26";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CoA] = "2023-10-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PiP] = "2023-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALCoS] = "2016-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALEE] = "2015-04-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALRoD] = "2015-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSA] = "2017-07-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSI] = "2016-07-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSK] = "2017-02-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSZ] = "2016-04-27";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSX] = "2018-01-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSD] = "2018-07-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XMtS] = "2017-12-11";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_UATMC] = "2017-03-13";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV1SC] = "2022-04-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV2DC] = "2022-12-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV3MC] = "2023-03-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV4EC] = "2023-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MisMV1] = "2023-05-03";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AATM] = "2023-10-17";

Parser.SOURCES_ADVENTURES = new Set([Parser.SRC_LMoP, Parser.SRC_HotDQ, Parser.SRC_RoT, Parser.SRC_RoTOS, Parser.SRC_PotA,
    Parser.SRC_OotA, Parser.SRC_CoS, Parser.SRC_SKT, Parser.SRC_TYP, Parser.SRC_TYP_AtG,Parser.SRC_TYP_DiT,
    Parser.SRC_TYP_TFoF, Parser.SRC_TYP_THSoT, Parser.SRC_TYP_TSC, Parser.SRC_TYP_ToH, Parser.SRC_TYP_WPM, Parser.SRC_ToA,
    Parser.SRC_TLK, Parser.SRC_TTP, Parser.SRC_WDH, Parser.SRC_LLK, Parser.SRC_WDMM, Parser.SRC_KKW, Parser.SRC_AZfyT,
    Parser.SRC_GoS, Parser.SRC_HftT, Parser.SRC_OoW, Parser.SRC_DIP, Parser.SRC_SLW, Parser.SRC_SDW, Parser.SRC_DC,
    Parser.SRC_BGDIA, Parser.SRC_LR, Parser.SRC_EFR, Parser.SRC_RMBRE, Parser.SRC_IMR, Parser.SRC_EGW_ToR, Parser.SRC_EGW_DD,
    Parser.SRC_EGW_FS, Parser.SRC_EGW_US, Parser.SRC_IDRotF, Parser.SRC_CM, Parser.SRC_HoL, Parser.SRC_XMtS, Parser.SRC_RtG,
    Parser.SRC_AitFR, Parser.SRC_AitFR_ISF, Parser.SRC_AitFR_THP, Parser.SRC_AitFR_AVT, Parser.SRC_AitFR_DN, Parser.SRC_AitFR_FCD,
    Parser.SRC_WBtW, Parser.SRC_NRH, Parser.SRC_NRH_TCMC, Parser.SRC_NRH_AVitW, Parser.SRC_NRH_ASS, Parser.SRC_NRH_CoI, Parser.SRC_NRH_TLT,
    Parser.SRC_NRH_AWoL, Parser.SRC_NRH_AT, Parser.SRC_SCC, Parser.SRC_SCC_CK, Parser.SRC_SCC_HfMT, Parser.SRC_SCC_TMM, Parser.SRC_SCC_ARiR,
    Parser.SRC_CRCotN, Parser.SRC_JttRC, Parser.SRC_SjA, Parser.SRC_LoX, Parser.SRC_DoSI, Parser.SRC_DSotDQ, Parser.SRC_KftGV,
    Parser.SRC_GotSF, Parser.SRC_PaBTSO, Parser.SRC_LK, Parser.SRC_CoA, Parser.SRC_PiP, Parser.SRC_HFStCM, Parser.SRC_GHLoE,
    Parser.SRC_DoDk,
Parser.SRC_AWM, ]);
Parser.SOURCES_CORE_SUPPLEMENTS = new Set(Object.keys(Parser.SOURCE_JSON_TO_FULL).filter(it=>!Parser.SOURCES_ADVENTURES.has(it)));
Parser.SOURCES_NON_STANDARD_WOTC = new Set([Parser.SRC_OGA, Parser.SRC_LLK, Parser.SRC_AZfyT, Parser.SRC_LR,
    Parser.SRC_TLK, Parser.SRC_TTP, Parser.SRC_AWM, Parser.SRC_IMR, Parser.SRC_SADS, Parser.SRC_MFF,
    Parser.SRC_XMtS, Parser.SRC_RtG, Parser.SRC_AitFR, Parser.SRC_AitFR_ISF, Parser.SRC_AitFR_THP,
    Parser.SRC_AitFR_AVT, Parser.SRC_AitFR_DN, Parser.SRC_AitFR_FCD, Parser.SRC_DoD, Parser.SRC_MaBJoV,
    Parser.SRC_NRH, Parser.SRC_NRH_TCMC, Parser.SRC_NRH_AVitW, Parser.SRC_NRH_ASS, Parser.SRC_NRH_CoI,
    Parser.SRC_NRH_TLT, Parser.SRC_NRH_AWoL, Parser.SRC_NRH_AT, Parser.SRC_MGELFT, Parser.SRC_VD,
    Parser.SRC_SjA, Parser.SRC_HAT_TG, Parser.SRC_HAT_LMI, Parser.SRC_GotSF, Parser.SRC_MCV3MC,
    Parser.SRC_MCV4EC, Parser.SRC_MisMV1, Parser.SRC_LK, Parser.SRC_AATM, Parser.SRC_CoA, Parser.SRC_PiP,
    Parser.SRC_HFStCM, ]);
Parser.SOURCES_PARTNERED_WOTC = new Set([Parser.SRC_RMBRE, Parser.SRC_RMR, Parser.SRC_EGW, Parser.SRC_EGW_ToR,
    Parser.SRC_EGW_DD, Parser.SRC_EGW_FS, Parser.SRC_EGW_US, Parser.SRC_CRCotN, Parser.SRC_TDCSR,
    Parser.SRC_HftT, Parser.SRC_GHLoE, Parser.SRC_DoDk, ]);

Parser.SOURCES_VANILLA = new Set([Parser.SRC_DMG, Parser.SRC_MM, Parser.SRC_PHB, Parser.SRC_SCAG,
    Parser.SRC_XGE, Parser.SRC_SAC, Parser.SRC_MFF, Parser.SRC_SADS, Parser.SRC_TCE, Parser.SRC_FTD,
    Parser.SRC_MPMM, Parser.SRC_SCREEN, Parser.SRC_SCREEN_WILDERNESS_KIT, Parser.SRC_SCREEN_DUNGEON_KIT,
    Parser.SRC_VD, Parser.SRC_GotSF, Parser.SRC_BGG, Parser.SRC_MaBJoV, Parser.SRC_CoA, Parser.SRC_BMT, ]);

Parser.SOURCES_COMEDY = new Set([Parser.SRC_AI, Parser.SRC_OoW, Parser.SRC_RMR, Parser.SRC_RMBRE, Parser.SRC_HftT, Parser.SRC_AWM, Parser.SRC_MGELFT, Parser.SRC_HAT_TG, Parser.SRC_HAT_LMI, Parser.SRC_MCV3MC, Parser.SRC_MisMV1, Parser.SRC_LK, Parser.SRC_PiP, ]);

Parser.SOURCES_NON_FR = new Set([Parser.SRC_GGR, Parser.SRC_KKW, Parser.SRC_ERLW, Parser.SRC_EFR,
    Parser.SRC_EGW, Parser.SRC_EGW_ToR, Parser.SRC_EGW_DD, Parser.SRC_EGW_FS, Parser.SRC_EGW_US,
    Parser.SRC_MOT, Parser.SRC_XMtS, Parser.SRC_AZfyT, Parser.SRC_SCC, Parser.SRC_SCC_CK,
    Parser.SRC_SCC_HfMT, Parser.SRC_SCC_TMM, Parser.SRC_SCC_ARiR, Parser.SRC_CRCotN, Parser.SRC_SjA,
    Parser.SRC_SAiS, Parser.SRC_AAG, Parser.SRC_BAM, Parser.SRC_LoX, Parser.SRC_DSotDQ, Parser.SRC_TDCSR,
    Parser.SRC_PAitM, Parser.SRC_SatO, Parser.SRC_ToFW, Parser.SRC_MPP, Parser.SRC_MCV4EC, Parser.SRC_LK,
    Parser.SRC_GHLoE, Parser.SRC_DoDk, ]);

Parser.SOURCES_AVAILABLE_DOCS_BOOK = {};
[Parser.SRC_PHB, Parser.SRC_MM, Parser.SRC_DMG, Parser.SRC_SCAG, Parser.SRC_VGM, Parser.SRC_OGA, Parser.SRC_XGE, Parser.SRC_MTF, Parser.SRC_GGR, Parser.SRC_AI, Parser.SRC_ERLW, Parser.SRC_RMR, Parser.SRC_EGW, Parser.SRC_MOT, Parser.SRC_TCE, Parser.SRC_VRGR, Parser.SRC_DoD, Parser.SRC_MaBJoV, Parser.SRC_FTD, Parser.SRC_SCC, Parser.SRC_MPMM, Parser.SRC_AAG, Parser.SRC_BAM, Parser.SRC_HAT_TG, Parser.SRC_SCREEN, Parser.SRC_SCREEN_WILDERNESS_KIT, Parser.SRC_SCREEN_DUNGEON_KIT, Parser.SRC_SCREEN_SPELLJAMMER, Parser.SRC_BGG, Parser.SRC_TDCSR, Parser.SRC_SatO, Parser.SRC_MPP, Parser.SRC_HF, Parser.SRC_HFFotM, Parser.SRC_BMT, ].forEach(src=>{
    Parser.SOURCES_AVAILABLE_DOCS_BOOK[src] = src;
    Parser.SOURCES_AVAILABLE_DOCS_BOOK[src.toLowerCase()] = src;
}
);
[{
    src: Parser.SRC_PSA,
    id: "PS-A"
}, {
    src: Parser.SRC_PSI,
    id: "PS-I"
}, {
    src: Parser.SRC_PSK,
    id: "PS-K"
}, {
    src: Parser.SRC_PSZ,
    id: "PS-Z"
}, {
    src: Parser.SRC_PSX,
    id: "PS-X"
}, {
    src: Parser.SRC_PSD,
    id: "PS-D"
}, ].forEach(({src, id})=>{
    Parser.SOURCES_AVAILABLE_DOCS_BOOK[src] = id;
    Parser.SOURCES_AVAILABLE_DOCS_BOOK[src.toLowerCase()] = id;
}
);
Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE = {};
[Parser.SRC_LMoP, Parser.SRC_HotDQ, Parser.SRC_RoT, Parser.SRC_PotA, Parser.SRC_OotA,
    Parser.SRC_CoS, Parser.SRC_SKT, Parser.SRC_TYP_AtG, Parser.SRC_TYP_DiT, Parser.SRC_TYP_TFoF,
    Parser.SRC_TYP_THSoT, Parser.SRC_TYP_TSC, Parser.SRC_TYP_ToH, Parser.SRC_TYP_WPM, Parser.SRC_ToA,
    Parser.SRC_TLK, Parser.SRC_TTP, Parser.SRC_WDH, Parser.SRC_LLK, Parser.SRC_WDMM, Parser.SRC_KKW,
    Parser.SRC_AZfyT, Parser.SRC_GoS, Parser.SRC_HftT, Parser.SRC_OoW, Parser.SRC_DIP, Parser.SRC_SLW,
    Parser.SRC_SDW, Parser.SRC_DC, Parser.SRC_BGDIA, Parser.SRC_LR, Parser.SRC_EFR, Parser.SRC_RMBRE,
    Parser.SRC_IMR, Parser.SRC_EGW_ToR, Parser.SRC_EGW_DD, Parser.SRC_EGW_FS, Parser.SRC_EGW_US,
    Parser.SRC_IDRotF, Parser.SRC_CM, Parser.SRC_HoL, Parser.SRC_XMtS, Parser.SRC_RtG, Parser.SRC_AitFR_ISF,
    Parser.SRC_AitFR_THP, Parser.SRC_AitFR_AVT, Parser.SRC_AitFR_DN, Parser.SRC_AitFR_FCD, Parser.SRC_WBtW,
    Parser.SRC_NRH, Parser.SRC_NRH_TCMC, Parser.SRC_NRH_AVitW, Parser.SRC_NRH_ASS, Parser.SRC_NRH_CoI,
    Parser.SRC_NRH_TLT, Parser.SRC_NRH_AWoL, Parser.SRC_NRH_AT, Parser.SRC_SCC_CK, Parser.SRC_SCC_HfMT,
    Parser.SRC_SCC_TMM, Parser.SRC_SCC_ARiR, Parser.SRC_CRCotN, Parser.SRC_JttRC, Parser.SRC_LoX, Parser.SRC_DoSI,
    Parser.SRC_DSotDQ, Parser.SRC_KftGV, Parser.SRC_GotSF, Parser.SRC_PaBTSO, Parser.SRC_ToFW, Parser.SRC_LK,
    Parser.SRC_CoA, Parser.SRC_PiP, Parser.SRC_HFStCM, Parser.SRC_GHLoE, Parser.SRC_DoDk, ].forEach(src=>{
    Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[src] = src;
    Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[src.toLowerCase()] = src;
}
);

Parser.getTagSource = function(tag, source) {
    if (source && source.trim())
        return source;

    tag = tag.trim();

    const tagMeta = Renderer.tag.TAG_LOOKUP[tag];

    if (!tagMeta)
        throw new Error(`Unhandled tag "${tag}"`);
    return tagMeta.defaultSource;
}
;

Parser.PROP_TO_TAG = {
    "monster": "creature",
    "optionalfeature": "optfeature",
    "tableGroup": "table",
    "vehicleUpgrade": "vehupgrade",
    "baseitem": "item",
    "itemGroup": "item",
    "magicvariant": "item",
};
Parser.getPropTag = function(prop) {
    if (Parser.PROP_TO_TAG[prop])
        return Parser.PROP_TO_TAG[prop];
    return prop;
}
;

Parser.PROP_TO_DISPLAY_NAME = {
    "variantrule": "Variant Rule",
    "optionalfeature": "Option/Feature",
    "magicvariant": "Magic Item Variant",
    "baseitem": "Item (Base)",
    "item": "Item",
    "adventure": "Adventure",
    "adventureData": "Adventure Text",
    "book": "Book",
    "bookData": "Book Text",
    "makebrewCreatureTrait": "Homebrew Builder Creature Trait",
    "charoption": "Other Character Creation Option",

    "bonus": "Bonus Action",
    "legendary": "Legendary Action",
    "mythic": "Mythic Action",
    "lairActions": "Lair Action",
    "regionalEffects": "Regional Effect",
};
Parser.getPropDisplayName = function(prop, {suffix=""}={}) {
    if (Parser.PROP_TO_DISPLAY_NAME[prop])
        return `${Parser.PROP_TO_DISPLAY_NAME[prop]}${suffix}`;

    const mFluff = /Fluff$/.exec(prop);
    if (mFluff)
        return Parser.getPropDisplayName(prop.slice(0, -mFluff[0].length), {
            suffix: " Fluff"
        });

    const mFoundry = /^foundry(?<prop>[A-Z].*)$/.exec(prop);
    if (mFoundry)
        return Parser.getPropDisplayName(mFoundry.groups.prop.lowercaseFirst(), {
            suffix: " Foundry Data"
        });

    return `${prop.split(/([A-Z][a-z]+)/g).filter(Boolean).join(" ").uppercaseFirst()}${suffix}`;
}
;

Parser.ITEM_TYPE_JSON_TO_ABV = {
    "A": "ammunition",
    "AF": "ammunition",
    "AT": "artisan's tools",
    "EM": "eldritch machine",
    "EXP": "explosive",
    "FD": "food and drink",
    "G": "adventuring gear",
    "GS": "gaming set",
    "HA": "heavy armor",
    "IDG": "illegal drug",
    "INS": "instrument",
    "LA": "light armor",
    "M": "melee weapon",
    "MA": "medium armor",
    "MNT": "mount",
    "MR": "master rune",
    "GV": "generic variant",
    "P": "potion",
    "R": "ranged weapon",
    "RD": "rod",
    "RG": "ring",
    "S": "shield",
    "SC": "scroll",
    "SCF": "spellcasting focus",
    "OTH": "other",
    "T": "tools",
    "TAH": "tack and harness",
    "TG": "trade good",
    "$": "treasure",
    "VEH": "vehicle (land)",
    "SHP": "vehicle (water)",
    "AIR": "vehicle (air)",
    "SPC": "vehicle (space)",
    "WD": "wand",
};

Parser.DMGTYPE_JSON_TO_FULL = {
    "A": "acid",
    "B": "bludgeoning",
    "C": "cold",
    "F": "fire",
    "O": "force",
    "L": "lightning",
    "N": "necrotic",
    "P": "piercing",
    "I": "poison",
    "Y": "psychic",
    "R": "radiant",
    "S": "slashing",
    "T": "thunder",
};

Parser.DMG_TYPES = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
Parser.CONDITIONS = ["blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"];

Parser.SENSES = [{
    "name": "blindsight",
    "source": Parser.SRC_PHB
}, {
    "name": "darkvision",
    "source": Parser.SRC_PHB
}, {
    "name": "tremorsense",
    "source": Parser.SRC_MM
}, {
    "name": "truesight",
    "source": Parser.SRC_PHB
}, ];

Parser.NUMBERS_ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
Parser.NUMBERS_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
Parser.NUMBERS_TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];

Parser.metric = {
    MILES_TO_KILOMETRES: 1.6,
    FEET_TO_METRES: 0.3,
    YARDS_TO_METRES: 0.9,
    POUNDS_TO_KILOGRAMS: 0.5,
    getMetricNumber({originalValue, originalUnit, toFixed=null}) {
        if (originalValue == null || isNaN(originalValue))
            return originalValue;

        originalValue = Number(originalValue);
        if (!originalValue)
            return originalValue;

        let out = null;
        switch (originalUnit) {
        case "ft.":
        case "ft":
        case Parser.UNT_FEET:
            out = originalValue * Parser.metric.FEET_TO_METRES;
            break;
        case "yd.":
        case "yd":
        case Parser.UNT_YARDS:
            out = originalValue * Parser.metric.YARDS_TO_METRES;
            break;
        case "mi.":
        case "mi":
        case Parser.UNT_MILES:
            out = originalValue * Parser.metric.MILES_TO_KILOMETRES;
            break;
        case "lb.":
        case "lb":
        case "lbs":
            out = originalValue * Parser.metric.POUNDS_TO_KILOGRAMS;
            break;
        default:
            return originalValue;
        }
        if (toFixed != null)
            return NumberUtil.toFixedNumber(out, toFixed);
        return out;
    },

    getMetricUnit({originalUnit, isShortForm=false, isPlural=true}) {
        switch (originalUnit) {
        case "ft.":
        case "ft":
        case Parser.UNT_FEET:
            return isShortForm ? "m" : `meter`[isPlural ? "toPlural" : "toString"]();
        case "yd.":
        case "yd":
        case Parser.UNT_YARDS:
            return isShortForm ? "m" : `meter`[isPlural ? "toPlural" : "toString"]();
        case "mi.":
        case "mi":
        case Parser.UNT_MILES:
            return isShortForm ? "km" : `kilometre`[isPlural ? "toPlural" : "toString"]();
        case "lb.":
        case "lb":
        case "lbs":
            return isShortForm ? "kg" : `kilogram`[isPlural ? "toPlural" : "toString"]();
        default:
            return originalUnit;
        }
    },
};

Parser.MAP_GRID_TYPE_TO_FULL = {};
Parser.MAP_GRID_TYPE_TO_FULL["none"] = "None";
Parser.MAP_GRID_TYPE_TO_FULL["square"] = "Square";
Parser.MAP_GRID_TYPE_TO_FULL["hexRowsOdd"] = "Hex Rows (Odd)";
Parser.MAP_GRID_TYPE_TO_FULL["hexRowsEven"] = "Hex Rows (Even)";
Parser.MAP_GRID_TYPE_TO_FULL["hexColsOdd"] = "Hex Columns (Odd)";
Parser.MAP_GRID_TYPE_TO_FULL["hexColsEven"] = "Hex Columns (Even)";

Parser.mapGridTypeToFull = function(gridType) {
    return Parser._parse_aToB(Parser.MAP_GRID_TYPE_TO_FULL, gridType);
}
;
//#endregion
//#region StorageUtil
function StorageUtilBase() {
    this._META_KEY = "_STORAGE_META_STORAGE";

    this._fakeStorageBacking = {};
    this._fakeStorageBackingAsync = {};

    this._getFakeStorageSync = function() {
        return {
            isSyncFake: true,
            getItem: k=>this._fakeStorageBacking[k],
            removeItem: k=>delete this._fakeStorageBacking[k],
            setItem: (k,v)=>this._fakeStorageBacking[k] = v,
        };
    }
    ;

    this._getFakeStorageAsync = function() {
        return {
            pIsAsyncFake: true,
            setItem: async(k,v)=>this._fakeStorageBackingAsync[k] = v,
            getItem: async(k)=>this._fakeStorageBackingAsync[k],
            removeItem: async(k)=>delete this._fakeStorageBackingAsync[k],
        };
    }
    ;

    this._getSyncStorage = function() {
        throw new Error(`Unimplemented!`);
    }
    ;
    this._getAsyncStorage = async function() {
        throw new Error(`Unimplemented!`);
    }
    ;

    this.getPageKey = function(key, page) {
        return `${key}_${page || UrlUtil.getCurrentPage()}`;
    }
    ;

    this.syncGet = function(key) {
        const rawOut = this._getSyncStorage().getItem(key);
        if (rawOut && rawOut !== "undefined" && rawOut !== "null")
            return JSON.parse(rawOut);
        return null;
    }
    ;

    this.syncSet = function(key, value) {
        this._getSyncStorage().setItem(key, JSON.stringify(value));
        this._syncTrackKey(key);
    }
    ;

    this.syncRemove = function(key) {
        this._getSyncStorage().removeItem(key);
        this._syncTrackKey(key, true);
    }
    ;

    this.syncGetForPage = function(key) {
        return this.syncGet(`${key}_${UrlUtil.getCurrentPage()}`);
    }
    ;
    this.syncSetForPage = function(key, value) {
        this.syncSet(`${key}_${UrlUtil.getCurrentPage()}`, value);
    }
    ;

    this.isSyncFake = function() {
        return !!this._getSyncStorage().isSyncFake;
    }
    ;

    this._syncTrackKey = function(key, isRemove) {
        const meta = this.syncGet(this._META_KEY) || {};
        if (isRemove)
            delete meta[key];
        else
            meta[key] = 1;
        this._getSyncStorage().setItem(this._META_KEY, JSON.stringify(meta));
    }
    ;

    this.syncGetDump = function() {
        const out = {};
        this._syncGetPresentKeys().forEach(key=>out[key] = this.syncGet(key));
        return out;
    }
    ;

    this._syncGetPresentKeys = function() {
        const meta = this.syncGet(this._META_KEY) || {};
        return Object.entries(meta).filter(([,isPresent])=>isPresent).map(([key])=>key);
    }
    ;

    this.syncSetFromDump = function(dump) {
        const keysToRemove = new Set(this._syncGetPresentKeys());
        Object.entries(dump).map(([k,v])=>{
            keysToRemove.delete(k);
            return this.syncSet(k, v);
        }
        );
        [...keysToRemove].map(k=>this.syncRemove(k));
    }
    ;

    this.pIsAsyncFake = async function() {
        const storage = await this._getAsyncStorage();
        return !!storage.pIsAsyncFake;
    }
    ;

    this.pSet = async function(key, value) {
        this._pTrackKey(key).then(null);
        const storage = await this._getAsyncStorage();
        return storage.setItem(key, value);
    }
    ;

    this.pGet = async function(key) {
        const storage = await this._getAsyncStorage();
        return storage.getItem(key);
    }
    ;

    this.pRemove = async function(key) {
        this._pTrackKey(key, true).then(null);
        const storage = await this._getAsyncStorage();
        return storage.removeItem(key);
    }
    ;

    this.pGetForPage = async function(key, {page=null}={}) {
        return this.pGet(this.getPageKey(key, page));
    }
    ;
    this.pSetForPage = async function(key, value, {page=null}={}) {
        return this.pSet(this.getPageKey(key, page), value);
    }
    ;
    this.pRemoveForPage = async function(key, {page=null}={}) {
        return this.pRemove(this.getPageKey(key, page));
    }
    ;

    this._pTrackKey = async function(key, isRemove) {
        const storage = await this._getAsyncStorage();
        const meta = (await this.pGet(this._META_KEY)) || {};
        if (isRemove)
            delete meta[key];
        else
            meta[key] = 1;
        return storage.setItem(this._META_KEY, meta);
    }
    ;

    this.pGetDump = async function() {
        const out = {};
        await Promise.all((await this._pGetPresentKeys()).map(async(key)=>out[key] = await this.pGet(key)), );
        return out;
    }
    ;

    this._pGetPresentKeys = async function() {
        const meta = (await this.pGet(this._META_KEY)) || {};
        return Object.entries(meta).filter(([,isPresent])=>isPresent).map(([key])=>key);
    }
    ;

    this.pSetFromDump = async function(dump) {
        const keysToRemove = new Set(await this._pGetPresentKeys());
        await Promise.all(Object.entries(dump).map(([k,v])=>{
            keysToRemove.delete(k);
            return this.pSet(k, v);
        }
        ), );
        await Promise.all([...keysToRemove].map(k=>this.pRemove(k)), );
    }
    ;
}

function StorageUtilMemory$1() {
    StorageUtilBase.call(this);

    this._fakeStorage = null;
    this._fakeStorageAsync = null;

    this._getSyncStorage = function() {
        this._fakeStorage = this._fakeStorage || this._getFakeStorageSync();
        return this._fakeStorage;
    }
    ;

    this._getAsyncStorage = async function() {
        this._fakeStorageAsync = this._fakeStorageAsync || this._getFakeStorageAsync();
        return this._fakeStorageAsync;
    }
    ;
}

globalThis.StorageUtilMemory = StorageUtilMemory$1;

function StorageUtilBacked() {
    StorageUtilBase.call(this);

    this._isInit = false;
    this._isInitAsync = false;
    this._fakeStorage = null;
    this._fakeStorageAsync = null;

    this._initSyncStorage = function() {
        if (this._isInit)
            return;

        if (typeof window === "undefined") {
            this._fakeStorage = this._getFakeStorageSync();
            this._isInit = true;
            return;
        }

        try {
            window.localStorage.setItem("_test_storage", true);
        } catch (e) {
            this._fakeStorage = this._getFakeStorageSync();
        }

        this._isInit = true;
    }
    ;

    this._getSyncStorage = function() {
        this._initSyncStorage();
        if (this._fakeStorage)
            return this._fakeStorage;
        return window.localStorage;
    }
    ;

    this._initAsyncStorage = async function() {
        if (this._isInitAsync)
            return;

        if (typeof window === "undefined") {
            this._fakeStorageAsync = this._getFakeStorageAsync();
            this._isInitAsync = true;
            return;
        }

        try {
            await new Promise((resolve,reject)=>{
                const request = window.indexedDB.open("_test_db", 1);
                request.onerror = reject;
                request.onsuccess = resolve;
            }
            );
            await localforage.setItem("_storage_check", true);
        } catch (e) {
            this._fakeStorageAsync = this._getFakeStorageAsync();
        }

        this._isInitAsync = true;
    }
    ;

    this._getAsyncStorage = async function() {
        await this._initAsyncStorage();
        if (this._fakeStorageAsync)
            return this._fakeStorageAsync;
        else
            return localforage;
    }
    ;
}

globalThis.StorageUtil = new StorageUtilBacked();

//#endregion
//#region MiscUtil
globalThis.MiscUtil = {
    COLOR_HEALTHY: "#00bb20",
    COLOR_HURT: "#c5ca00",
    COLOR_BLOODIED: "#f7a100",
    COLOR_DEFEATED: "#cc0000",

    copy(obj, {isSafe=false, isPreserveUndefinedValueKeys=false}={}) {
        if (isSafe && obj === undefined)
            return undefined;
        return JSON.parse(JSON.stringify(obj));
    },

    copyFast(obj) {
        if ((typeof obj !== "object") || obj == null)
            return obj;

        if (obj instanceof Array)
            return obj.map(MiscUtil.copyFast);

        const cpy = {};
        for (const k of Object.keys(obj))
            cpy[k] = MiscUtil.copyFast(obj[k]);
        return cpy;
    },

    async pCopyTextToClipboard(text) {
        function doCompatibilityCopy() {
            const $iptTemp = $(`<textarea class="clp__wrp-temp"></textarea>`).appendTo(document.body).val(text).select();
            document.execCommand("Copy");
            $iptTemp.remove();
        }

        if (navigator && navigator.permissions) {
            try {
                const access = await navigator.permissions.query({
                    name: "clipboard-write"
                });
                if (access.state === "granted" || access.state === "prompt") {
                    await navigator.clipboard.writeText(text);
                } else
                    doCompatibilityCopy();
            } catch (e) {
                doCompatibilityCopy();
            }
        } else
            doCompatibilityCopy();
    },

    checkProperty(object, ...path) {
        for (let i = 0; i < path.length; ++i) {
            object = object[path[i]];
            if (object == null)
                return false;
        }
        return true;
    },

    get(object, ...path) {
        if (object == null)
            return null;
        for (let i = 0; i < path.length; ++i) {
            object = object[path[i]];
            if (object == null)
                return object;
        }
        return object;
    },

    set(object, ...pathAndVal) {
        if (object == null)
            return null;

        const val = pathAndVal.pop();
        if (!pathAndVal.length)
            return null;

        const len = pathAndVal.length;
        for (let i = 0; i < len; ++i) {
            const pathPart = pathAndVal[i];
            if (i === len - 1)
                object[pathPart] = val;
            else
                object = (object[pathPart] = object[pathPart] || {});
        }

        return val;
    },

    getOrSet(object, ...pathAndVal) {
        if (pathAndVal.length < 2)
            return null;
        const existing = MiscUtil.get(object, ...pathAndVal.slice(0, -1));
        if (existing != null)
            return existing;
        return MiscUtil.set(object, ...pathAndVal);
    },

    getThenSetCopy(object1, object2, ...path) {
        const val = MiscUtil.get(object1, ...path);
        return MiscUtil.set(object2, ...path, MiscUtil.copyFast(val, {
            isSafe: true
        }));
    },

    delete(object, ...path) {
        if (object == null)
            return object;
        for (let i = 0; i < path.length - 1; ++i) {
            object = object[path[i]];
            if (object == null)
                return object;
        }
        return delete object[path.last()];
    },

    deleteObjectPath(object, ...path) {
        const stack = [object];

        if (object == null)
            return object;
        for (let i = 0; i < path.length - 1; ++i) {
            object = object[path[i]];
            stack.push(object);
            if (object === undefined)
                return object;
        }
        const out = delete object[path.last()];

        for (let i = path.length - 1; i > 0; --i) {
            if (!Object.keys(stack[i]).length)
                delete stack[i - 1][path[i - 1]];
        }

        return out;
    },

    merge(obj1, obj2) {
        obj2 = MiscUtil.copyFast(obj2);

        Object.entries(obj2).forEach(([k,v])=>{
            if (obj1[k] == null) {
                obj1[k] = v;
                return;
            }

            if (typeof obj1[k] === "object" && typeof v === "object" && !(obj1[k]instanceof Array) && !(v instanceof Array)) {
                MiscUtil.merge(obj1[k], v);
                return;
            }

            obj1[k] = v;
        }
        );

        return obj1;
    },

    mix: (superclass)=>new MiscUtil._MixinBuilder(superclass),
    _MixinBuilder: function(superclass) {
        this.superclass = superclass;

        this.with = function(...mixins) {
            return mixins.reduce((c,mixin)=>mixin(c), this.superclass);
        }
        ;
    },

    clearSelection() {
        if (document.getSelection) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(document.createRange());
        } else if (window.getSelection) {
            if (window.getSelection().removeAllRanges) {
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(document.createRange());
            } else if (window.getSelection().empty) {
                window.getSelection().empty();
            }
        } else if (document.selection) {
            document.selection.empty();
        }
    },

    randomColor() {
        let r;
        let g;
        let b;
        const h = RollerUtil.randomise(30, 0) / 30;
        const i = ~~(h * 6);
        const f = h * 6 - i;
        const q = 1 - f;
        switch (i % 6) {
        case 0:
            r = 1;
            g = f;
            b = 0;
            break;
        case 1:
            r = q;
            g = 1;
            b = 0;
            break;
        case 2:
            r = 0;
            g = 1;
            b = f;
            break;
        case 3:
            r = 0;
            g = q;
            b = 1;
            break;
        case 4:
            r = f;
            g = 0;
            b = 1;
            break;
        case 5:
            r = 1;
            g = 0;
            b = q;
            break;
        }
        return `#${`00${(~~(r * 255)).toString(16)}`.slice(-2)}${`00${(~~(g * 255)).toString(16)}`.slice(-2)}${`00${(~~(b * 255)).toString(16)}`.slice(-2)}`;
    },

    invertColor(hex, opts) {
        opts = opts || {};

        hex = hex.slice(1);
        let r = parseInt(hex.slice(0, 2), 16);
        let g = parseInt(hex.slice(2, 4), 16);
        let b = parseInt(hex.slice(4, 6), 16);

        const isDark = (r * 0.299 + g * 0.587 + b * 0.114) > 186;
        if (opts.dark && opts.light)
            return isDark ? opts.dark : opts.light;
        else if (opts.bw)
            return isDark ? "#000000" : "#FFFFFF";

        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        return `#${[r, g, b].map(it=>it.padStart(2, "0")).join("")}`;
    },

    scrollPageTop() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    },

    expEval(str) {
        return new Function(`return ${str.replace(/[^-()\d/*+.]/g, "")}`)();
    },

    parseNumberRange(input, min=Number.MIN_SAFE_INTEGER, max=Number.MAX_SAFE_INTEGER) {
        if (!input || !input.trim())
            return null;

        const errInvalid = input=>{
            throw new Error(`Could not parse range input "${input}"`);
        }
        ;

        const errOutOfRange = ()=>{
            throw new Error(`Number was out of range! Range was ${min}-${max} (inclusive).`);
        }
        ;

        const isOutOfRange = (num)=>num < min || num > max;

        const addToRangeVal = (range,num)=>range.add(num);

        const addToRangeLoHi = (range,lo,hi)=>{
            for (let i = lo; i <= hi; ++i)
                range.add(i);
        }
        ;

        const clean = input.replace(/\s*/g, "");
        if (!/^((\d+-\d+|\d+),)*(\d+-\d+|\d+)$/.exec(clean))
            errInvalid();

        const parts = clean.split(",");
        const out = new Set();

        for (const part of parts) {
            if (part.includes("-")) {
                const spl = part.split("-");
                const numLo = Number(spl[0]);
                const numHi = Number(spl[1]);

                if (isNaN(numLo) || isNaN(numHi) || numLo === 0 || numHi === 0 || numLo > numHi)
                    errInvalid();

                if (isOutOfRange(numLo) || isOutOfRange(numHi))
                    errOutOfRange();

                if (numLo === numHi)
                    addToRangeVal(out, numLo);
                else
                    addToRangeLoHi(out, numLo, numHi);
                continue;
            }

            const num = Number(part);
            if (isNaN(num) || num === 0)
                errInvalid();

            if (isOutOfRange(num))
                errOutOfRange();
            addToRangeVal(out, num);
        }

        return out;
    },

    findCommonPrefix(strArr, {isRespectWordBoundaries}={}) {
        if (isRespectWordBoundaries) {
            return MiscUtil._findCommonPrefixSuffixWords({
                strArr
            });
        }

        let prefix = null;
        strArr.forEach(s=>{
            if (prefix == null) {
                prefix = s;
                return;
            }

            const minLen = Math.min(s.length, prefix.length);
            for (let i = 0; i < minLen; ++i) {
                const cp = prefix[i];
                const cs = s[i];
                if (cp !== cs) {
                    prefix = prefix.substring(0, i);
                    break;
                }
            }
        }
        );
        return prefix;
    },

    findCommonSuffix(strArr, {isRespectWordBoundaries}={}) {
        if (!isRespectWordBoundaries)
            throw new Error(`Unimplemented!`);

        return MiscUtil._findCommonPrefixSuffixWords({
            strArr,
            isSuffix: true
        });
    },

    _findCommonPrefixSuffixWords({strArr, isSuffix}) {
        let prefixTks = null;
        let lenMax = -1;

        strArr.map(str=>{
            lenMax = Math.max(lenMax, str.length);
            return str.split(" ");
        }
        ).forEach(tks=>{
            if (isSuffix)
                tks.reverse();

            if (prefixTks == null)
                return prefixTks = [...tks];

            const minLen = Math.min(tks.length, prefixTks.length);
            while (prefixTks.length > minLen)
                prefixTks.pop();

            for (let i = 0; i < minLen; ++i) {
                const cp = prefixTks[i];
                const cs = tks[i];
                if (cp !== cs) {
                    prefixTks = prefixTks.slice(0, i);
                    break;
                }
            }
        }
        );

        if (isSuffix)
            prefixTks.reverse();

        if (!prefixTks.length)
            return "";

        const out = prefixTks.join(" ");
        if (out.length === lenMax)
            return out;

        return isSuffix ? ` ${prefixTks.join(" ")}` : `${prefixTks.join(" ")} `;
    },

    calculateBlendedColor(fgHexTarget, fgOpacity, bgHex) {
        const fgDcTarget = CryptUtil.hex2Dec(fgHexTarget);
        const bgDc = CryptUtil.hex2Dec(bgHex);
        return ((fgDcTarget - ((1 - fgOpacity) * bgDc)) / fgOpacity).toString(16);
    },

    debounce(func, wait, options) {
        let lastArgs;
        let lastThis;
        let maxWait;
        let result;
        let timerId;
        let lastCallTime;
        let lastInvokeTime = 0;
        let leading = false;
        let maxing = false;
        let trailing = true;

        wait = Number(wait) || 0;
        if (typeof options === "object") {
            leading = !!options.leading;
            maxing = "maxWait"in options;
            maxWait = maxing ? Math.max(Number(options.maxWait) || 0, wait) : maxWait;
            trailing = "trailing"in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
            let args = lastArgs;
            let thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function leadingEdge(time) {
            lastInvokeTime = time;
            timerId = setTimeout(timerExpired, wait);
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
            let timeSinceLastCall = time - lastCallTime;
            let timeSinceLastInvoke = time - lastInvokeTime;
            let result = wait - timeSinceLastCall;
            return maxing ? Math.min(result, maxWait - timeSinceLastInvoke) : result;
        }

        function shouldInvoke(time) {
            let timeSinceLastCall = time - lastCallTime;
            let timeSinceLastInvoke = time - lastInvokeTime;

            return (lastCallTime === undefined || (timeSinceLastCall >= wait) || (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
            const time = Date.now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timerId = undefined;

            if (trailing && lastArgs)
                return invokeFunc(time);
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel() {
            if (timerId !== undefined)
                clearTimeout(timerId);
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
            return timerId === undefined ? result : trailingEdge(Date.now());
        }

        function debounced() {
            let time = Date.now();
            let isInvoking = shouldInvoke(time);
            lastArgs = arguments;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking) {
                if (timerId === undefined)
                    return leadingEdge(lastCallTime);
                if (maxing) {
                    timerId = setTimeout(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined)
                timerId = setTimeout(timerExpired, wait);
            return result;
        }

        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
    },

    throttle(func, wait, options) {
        let leading = true;
        let trailing = true;

        if (typeof options === "object") {
            leading = "leading"in options ? !!options.leading : leading;
            trailing = "trailing"in options ? !!options.trailing : trailing;
        }

        return this.debounce(func, wait, {
            leading,
            maxWait: wait,
            trailing
        });
    },

    pDelay(msecs, resolveAs) {
        return new Promise(resolve=>setTimeout(()=>resolve(resolveAs), msecs));
    },

    GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST: new Set(["caption", "type", "colLabels", "colLabelGroups", "name", "colStyles", "style", "shortName", "subclassShortName", "id", "path"]),

    getWalker(opts) {
        opts = opts || {};

        if (opts.isBreakOnReturn && !opts.isNoModification)
            throw new Error(`"isBreakOnReturn" may only be used in "isNoModification" mode!`);

        const keyBlocklist = opts.keyBlocklist || new Set();

        const getMappedPrimitive = (obj,primitiveHandlers,lastKey,stack,prop,propPre,propPost)=>{
            if (primitiveHandlers[propPre])
                MiscUtil._getWalker_runHandlers({
                    handlers: primitiveHandlers[propPre],
                    obj,
                    lastKey,
                    stack
                });
            if (primitiveHandlers[prop]) {
                const out = MiscUtil._getWalker_applyHandlers({
                    opts,
                    handlers: primitiveHandlers[prop],
                    obj,
                    lastKey,
                    stack
                });
                if (out === VeCt.SYM_WALKER_BREAK)
                    return out;
                if (!opts.isNoModification)
                    obj = out;
            }
            if (primitiveHandlers[propPost])
                MiscUtil._getWalker_runHandlers({
                    handlers: primitiveHandlers[propPost],
                    obj,
                    lastKey,
                    stack
                });
            return obj;
        }
        ;

        const doObjectRecurse = (obj,primitiveHandlers,stack)=>{
            for (const k of Object.keys(obj)) {
                if (keyBlocklist.has(k))
                    continue;

                const out = fn(obj[k], primitiveHandlers, k, stack);
                if (out === VeCt.SYM_WALKER_BREAK)
                    return VeCt.SYM_WALKER_BREAK;
                if (!opts.isNoModification)
                    obj[k] = out;
            }
        }
        ;

        const fn = (obj,primitiveHandlers,lastKey,stack)=>{
            if (obj === null)
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "null", "preNull", "postNull");

            switch (typeof obj) {
            case "undefined":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "undefined", "preUndefined", "postUndefined");
            case "boolean":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "boolean", "preBoolean", "postBoolean");
            case "number":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "number", "preNumber", "postNumber");
            case "string":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "string", "preString", "postString");
            case "object":
                {
                    if (obj instanceof Array) {
                        if (primitiveHandlers.preArray)
                            MiscUtil._getWalker_runHandlers({
                                handlers: primitiveHandlers.preArray,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            const out = new Array(obj.length);
                            for (let i = 0, len = out.length; i < len; ++i) {
                                out[i] = fn(obj[i], primitiveHandlers, lastKey, stack);
                                if (out[i] === VeCt.SYM_WALKER_BREAK)
                                    return out[i];
                            }
                            if (!opts.isNoModification)
                                obj = out;
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.array) {
                                const out = MiscUtil._getWalker_applyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (out === VeCt.SYM_WALKER_BREAK)
                                    return out;
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.array) {
                                const out = MiscUtil._getWalker_applyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (out === VeCt.SYM_WALKER_BREAK)
                                    return out;
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj != null) {
                                const out = new Array(obj.length);
                                for (let i = 0, len = out.length; i < len; ++i) {
                                    if (stack)
                                        stack.push(obj);
                                    out[i] = fn(obj[i], primitiveHandlers, lastKey, stack);
                                    if (stack)
                                        stack.pop();
                                    if (out[i] === VeCt.SYM_WALKER_BREAK)
                                        return out[i];
                                }
                                if (!opts.isNoModification)
                                    obj = out;
                            } else {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        }
                        if (primitiveHandlers.postArray)
                            MiscUtil._getWalker_runHandlers({
                                handlers: primitiveHandlers.postArray,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    }

                    if (primitiveHandlers.preObject)
                        MiscUtil._getWalker_runHandlers({
                            handlers: primitiveHandlers.preObject,
                            obj,
                            lastKey,
                            stack
                        });
                    if (opts.isDepthFirst) {
                        if (stack)
                            stack.push(obj);
                        const flag = doObjectRecurse(obj, primitiveHandlers, stack);
                        if (stack)
                            stack.pop();
                        if (flag === VeCt.SYM_WALKER_BREAK)
                            return flag;

                        if (primitiveHandlers.object) {
                            const out = MiscUtil._getWalker_applyHandlers({
                                opts,
                                handlers: primitiveHandlers.object,
                                obj,
                                lastKey,
                                stack
                            });
                            if (out === VeCt.SYM_WALKER_BREAK)
                                return out;
                            if (!opts.isNoModification)
                                obj = out;
                        }
                        if (obj == null) {
                            if (!opts.isAllowDeleteObjects)
                                throw new Error(`Object handler(s) returned null!`);
                        }
                    } else {
                        if (primitiveHandlers.object) {
                            const out = MiscUtil._getWalker_applyHandlers({
                                opts,
                                handlers: primitiveHandlers.object,
                                obj,
                                lastKey,
                                stack
                            });
                            if (out === VeCt.SYM_WALKER_BREAK)
                                return out;
                            if (!opts.isNoModification)
                                obj = out;
                        }
                        if (obj == null) {
                            if (!opts.isAllowDeleteObjects)
                                throw new Error(`Object handler(s) returned null!`);
                        } else {
                            if (stack)
                                stack.push(obj);
                            const flag = doObjectRecurse(obj, primitiveHandlers, stack);
                            if (stack)
                                stack.pop();
                            if (flag === VeCt.SYM_WALKER_BREAK)
                                return flag;
                        }
                    }
                    if (primitiveHandlers.postObject)
                        MiscUtil._getWalker_runHandlers({
                            handlers: primitiveHandlers.postObject,
                            obj,
                            lastKey,
                            stack
                        });
                    return obj;
                }
            default:
                throw new Error(`Unhandled type "${typeof obj}"`);
            }
        }
        ;

        return {
            walk: fn
        };
    },

    _getWalker_applyHandlers({opts, handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        const didBreak = handlers.some(h=>{
            const out = h(obj, lastKey, stack);
            if (opts.isBreakOnReturn && out)
                return true;
            if (!opts.isNoModification)
                obj = out;
        }
        );
        if (didBreak)
            return VeCt.SYM_WALKER_BREAK;
        return obj;
    },

    _getWalker_runHandlers({handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        handlers.forEach(h=>h(obj, lastKey, stack));
    },

    getAsyncWalker(opts) {
        opts = opts || {};
        const keyBlocklist = opts.keyBlocklist || new Set();

        const pFn = async(obj,primitiveHandlers,lastKey,stack)=>{
            if (obj == null) {
                if (primitiveHandlers.null)
                    return MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.null,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            }

            const pDoObjectRecurse = async()=>{
                await Object.keys(obj).pSerialAwaitMap(async k=>{
                    const v = obj[k];
                    if (keyBlocklist.has(k))
                        return;
                    const out = await pFn(v, primitiveHandlers, k, stack);
                    if (!opts.isNoModification)
                        obj[k] = out;
                }
                );
            }
            ;

            const to = typeof obj;
            switch (to) {
            case undefined:
                if (primitiveHandlers.preUndefined)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preUndefined,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.undefined) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.undefined,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postUndefined)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postUndefined,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "boolean":
                if (primitiveHandlers.preBoolean)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preBoolean,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.boolean) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.boolean,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postBoolean)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postBoolean,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "number":
                if (primitiveHandlers.preNumber)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preNumber,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.number) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.number,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postNumber)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postNumber,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "string":
                if (primitiveHandlers.preString)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preString,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.string) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.string,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postString)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postString,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "object":
                {
                    if (obj instanceof Array) {
                        if (primitiveHandlers.preArray)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.preArray,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            const out = await obj.pSerialAwaitMap(it=>pFn(it, primitiveHandlers, lastKey, stack));
                            if (!opts.isNoModification)
                                obj = out;
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.array) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.array) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj != null) {
                                const out = await obj.pSerialAwaitMap(it=>pFn(it, primitiveHandlers, lastKey, stack));
                                if (!opts.isNoModification)
                                    obj = out;
                            } else {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        }
                        if (primitiveHandlers.postArray)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.postArray,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    } else {
                        if (primitiveHandlers.preObject)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.preObject,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            await pDoObjectRecurse();
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.object) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.object,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteObjects)
                                    throw new Error(`Object handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.object) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.object,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteObjects)
                                    throw new Error(`Object handler(s) returned null!`);
                            } else {
                                await pDoObjectRecurse();
                            }
                        }
                        if (primitiveHandlers.postObject)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.postObject,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    }
                }
            default:
                throw new Error(`Unhandled type "${to}"`);
            }
        }
        ;

        return {
            pWalk: pFn
        };
    },

    async _getAsyncWalker_pApplyHandlers({opts, handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        await handlers.pSerialAwaitMap(async pH=>{
            const out = await pH(obj, lastKey, stack);
            if (!opts.isNoModification)
                obj = out;
        }
        );
        return obj;
    },

    async _getAsyncWalker_pRunHandlers({handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        await handlers.pSerialAwaitMap(pH=>pH(obj, lastKey, stack));
    },

    pDefer(fn) {
        return (async()=>fn())();
    },
};
//#endregion
//#region SortUtil
globalThis.SortUtil = {
    ascSort: (a,b)=>{
        if (typeof FilterItem !== "undefined") {
            if (a instanceof FilterItem)
                a = a.item;
            if (b instanceof FilterItem)
                b = b.item;
        }

        return SortUtil._ascSort(a, b);
    }
    ,

    ascSortProp: (prop,a,b)=>{
        return SortUtil.ascSort(a[prop], b[prop]);
    }
    ,

    ascSortLower: (a,b)=>{
        if (typeof FilterItem !== "undefined") {
            if (a instanceof FilterItem)
                a = a.item;
            if (b instanceof FilterItem)
                b = b.item;
        }

        a = a ? a.toLowerCase() : a;
        b = b ? b.toLowerCase() : b;

        return SortUtil._ascSort(a, b);
    }
    ,

    ascSortLowerProp: (prop,a,b)=>{
        return SortUtil.ascSortLower(a[prop], b[prop]);
    }
    ,

    ascSortNumericalSuffix(a, b) {
        if (typeof FilterItem !== "undefined") {
            if (a instanceof FilterItem)
                a = a.item;
            if (b instanceof FilterItem)
                b = b.item;
        }

        function popEndNumber(str) {
            const spl = str.split(" ");
            return spl.last().isNumeric() ? [spl.slice(0, -1).join(" "), Number(spl.last().replace(Parser._numberCleanRegexp, ""))] : [spl.join(" "), 0];
        }

        const [aStr,aNum] = popEndNumber(a.item || a);
        const [bStr,bNum] = popEndNumber(b.item || b);
        const initialSort = SortUtil.ascSort(aStr, bStr);
        if (initialSort)
            return initialSort;
        return SortUtil.ascSort(aNum, bNum);
    },

    _ascSort: (a,b)=>{
        if (b === a)
            return 0;
        return b < a ? 1 : -1;
    }
    ,

    ascSortDate(a, b) {
        return b.getTime() - a.getTime();
    },

    ascSortDateString(a, b) {
        return SortUtil.ascSortDate(new Date(a || "1970-01-0"), new Date(b || "1970-01-0"));
    },

    compareListNames(a, b) {
        return SortUtil._ascSort(a.name.toLowerCase(), b.name.toLowerCase());
    },

    listSort(a, b, opts) {
        opts = opts || {
            sortBy: "name"
        };
        if (opts.sortBy === "name")
            return SortUtil.compareListNames(a, b);
        else
            return SortUtil._compareByOrDefault_compareByOrDefault(a, b, opts.sortBy);
    },

    _listSort_compareBy(a, b, sortBy) {
        const aValue = typeof a.values[sortBy] === "string" ? a.values[sortBy].toLowerCase() : a.values[sortBy];
        const bValue = typeof b.values[sortBy] === "string" ? b.values[sortBy].toLowerCase() : b.values[sortBy];

        return SortUtil._ascSort(aValue, bValue);
    },

    _compareByOrDefault_compareByOrDefault(a, b, sortBy) {
        return SortUtil._listSort_compareBy(a, b, sortBy) || SortUtil.compareListNames(a, b);
    },

    _MON_TRAIT_ORDER: ["special equipment", "shapechanger", ],
    monTraitSort: (a,b)=>{
        if (a.sort != null && b.sort != null)
            return a.sort - b.sort;
        if (a.sort != null && b.sort == null)
            return -1;
        if (a.sort == null && b.sort != null)
            return 1;

        if (!a.name && !b.name)
            return 0;
        const aClean = Renderer.stripTags(a.name).toLowerCase().trim();
        const bClean = Renderer.stripTags(b.name).toLowerCase().trim();

        const isOnlyA = a.name.endsWith(" Only)");
        const isOnlyB = b.name.endsWith(" Only)");
        if (!isOnlyA && isOnlyB)
            return -1;
        if (isOnlyA && !isOnlyB)
            return 1;

        const ixA = SortUtil._MON_TRAIT_ORDER.indexOf(aClean);
        const ixB = SortUtil._MON_TRAIT_ORDER.indexOf(bClean);
        if (~ixA && ~ixB)
            return ixA - ixB;
        else if (~ixA)
            return -1;
        else if (~ixB)
            return 1;
        else
            return SortUtil.ascSort(aClean, bClean);
    }
    ,

    _alignFirst: ["L", "C"],
    _alignSecond: ["G", "E"],
    alignmentSort: (a,b)=>{
        if (a === b)
            return 0;
        if (SortUtil._alignFirst.includes(a))
            return -1;
        if (SortUtil._alignSecond.includes(a))
            return 1;
        if (SortUtil._alignFirst.includes(b))
            return 1;
        if (SortUtil._alignSecond.includes(b))
            return -1;
        return 0;
    }
    ,

    ascSortCr(a, b) {
        if (typeof FilterItem !== "undefined") {
            if (a instanceof FilterItem)
                a = a.item;
            if (b instanceof FilterItem)
                b = b.item;
        }
        if (a === "Unknown")
            a = "998";
        if (b === "Unknown")
            b = "998";
        if (a === "\u2014" || a == null)
            a = "999";
        if (b === "\u2014" || b == null)
            b = "999";
        return SortUtil.ascSort(Parser.crToNumber(a), Parser.crToNumber(b));
    },

    ascSortAtts(a, b) {
        const aSpecial = a === "special";
        const bSpecial = b === "special";
        return aSpecial && bSpecial ? 0 : aSpecial ? 1 : bSpecial ? -1 : Parser.ABIL_ABVS.indexOf(a) - Parser.ABIL_ABVS.indexOf(b);
    },

    ascSortSize(a, b) {
        return Parser.SIZE_ABVS.indexOf(a) - Parser.SIZE_ABVS.indexOf(b);
    },

    initBtnSortHandlers($wrpBtnsSort, list) {
        let dispCaretInitial = null;

        const dispCarets = [...$wrpBtnsSort[0].querySelectorAll(`[data-sort]`)].map(btnSort=>{
            const dispCaret = e_({
                tag: "span",
                clazz: "lst__caret",
            }).appendTo(btnSort);

            const btnSortField = btnSort.dataset.sort;

            if (btnSortField === list.sortBy)
                dispCaretInitial = dispCaret;

            e_({
                ele: btnSort,
                click: evt=>{
                    evt.stopPropagation();
                    const direction = list.sortDir === "asc" ? "desc" : "asc";
                    SortUtil._initBtnSortHandlers_showCaret({
                        dispCarets,
                        dispCaret,
                        direction
                    });
                    list.sort(btnSortField, direction);
                }
                ,
            });

            return dispCaret;
        }
        );

        dispCaretInitial = dispCaretInitial || dispCarets[0];
        SortUtil._initBtnSortHandlers_showCaret({
            dispCaret: dispCaretInitial,
            dispCarets,
            direction: list.sortDir
        });
    },

    _initBtnSortHandlers_showCaret({dispCaret, dispCarets, direction, }, ) {
        dispCarets.forEach($it=>$it.removeClass("lst__caret--active"));
        dispCaret.addClass("lst__caret--active").toggleClass("lst__caret--reverse", direction === "asc");
    },

    initBtnSortHandlersAdditional($wrpBtnsSort, list) {
        [...$wrpBtnsSort[0].querySelectorAll(".sort")].map(btnSort=>{
            const btnSortField = btnSort.dataset.sort;

            e_({
                ele: btnSort,
                click: evt=>{
                    evt.stopPropagation();
                    const direction = list.sortDir === "asc" ? "desc" : "asc";
                    list.sort(btnSortField, direction);
                }
                ,
            });
        }
        );
    },

    ascSortSourceGroup(a, b) {
        const grpA = a.group || "other";
        const grpB = b.group || "other";
        const ixA = SourceUtil.ADV_BOOK_GROUPS.findIndex(it=>it.group === grpA);
        const ixB = SourceUtil.ADV_BOOK_GROUPS.findIndex(it=>it.group === grpB);
        return SortUtil.ascSort(ixA, ixB);
    },

    ascSortAdventure(a, b) {
        return SortUtil.ascSortDateString(b.published, a.published) || SortUtil.ascSortLower(a.parentSource || "", b.parentSource || "") || SortUtil.ascSort(a.publishedOrder ?? 0, b.publishedOrder ?? 0) || SortUtil.ascSortLower(a.storyline, b.storyline) || SortUtil.ascSort(a.level?.start ?? 20, b.level?.start ?? 20) || SortUtil.ascSortLower(a.name, b.name);
    },

    ascSortBook(a, b) {
        return SortUtil.ascSortDateString(b.published, a.published) || SortUtil.ascSortLower(a.parentSource || "", b.parentSource || "") || SortUtil.ascSortLower(a.name, b.name);
    },

    ascSortBookData(a, b) {
        return SortUtil.ascSortLower(a.id || "", b.id || "");
    },

    ascSortGenericEntity(a, b) {
        return SortUtil.ascSortLower(a.name, b.name) || SortUtil.ascSortLower(a.source, b.source);
    },

    ascSortDeity(a, b) {
        return SortUtil.ascSortLower(a.name, b.name) || SortUtil.ascSortLower(a.source, b.source) || SortUtil.ascSortLower(a.pantheon, b.pantheon);
    },

    ascSortCard(a, b) {
        return SortUtil.ascSortLower(a.set, b.set) || SortUtil.ascSortLower(a.source, b.source) || SortUtil.ascSortLower(a.name, b.name);
    },

    ascSortEncounter(a, b) {
        return SortUtil.ascSortLower(a.name, b.name) || SortUtil.ascSortLower(a.caption || "", b.caption || "") || SortUtil.ascSort(a.minlvl || 0, b.minlvl || 0) || SortUtil.ascSort(a.maxlvl || Number.MAX_SAFE_INTEGER, b.maxlvl || Number.MAX_SAFE_INTEGER);
    },

    _ITEM_RARITY_ORDER: ["none", "common", "uncommon", "rare", "very rare", "legendary", "artifact", "varies", "unknown (magic)", "unknown"],
    ascSortItemRarity(a, b) {
        const ixA = SortUtil._ITEM_RARITY_ORDER.indexOf(a);
        const ixB = SortUtil._ITEM_RARITY_ORDER.indexOf(b);
        return (~ixA ? ixA : Number.MAX_SAFE_INTEGER) - (~ixB ? ixB : Number.MAX_SAFE_INTEGER);
    },
};
//#endregion
//#region UtilActors

//#endregion
//#region VeCt
globalThis.IS_DEPLOYED = undefined;
globalThis.VERSION_NUMBER = "1.197.0";
globalThis.DEPLOYED_STATIC_ROOT = "";
globalThis.DEPLOYED_IMG_ROOT = undefined;
globalThis.IS_VTT = false;

globalThis.IMGUR_CLIENT_ID = `abdea4de492d3b0`;

globalThis.HASH_PART_SEP = ",";
globalThis.HASH_LIST_SEP = "_";
globalThis.HASH_SUB_LIST_SEP = "~";
globalThis.HASH_SUB_KV_SEP = ":";
globalThis.HASH_BLANK = "blankhash";
globalThis.HASH_SUB_NONE = "null";
globalThis.VeCt = {
    STR_NONE: "None",
    STR_SEE_CONSOLE: "See the console (CTRL+SHIFT+J) for details.",

    HASH_SCALED: "scaled",
    HASH_SCALED_SPELL_SUMMON: "scaledspellsummon",
    HASH_SCALED_CLASS_SUMMON: "scaledclasssummon",

    FILTER_BOX_SUB_HASH_SEARCH_PREFIX: "fbsr",

    JSON_PRERELEASE_INDEX: `prerelease/index.json`,
    JSON_BREW_INDEX: `homebrew/index.json`,

    STORAGE_HOMEBREW: "HOMEBREW_STORAGE",
    STORAGE_HOMEBREW_META: "HOMEBREW_META_STORAGE",
    STORAGE_EXCLUDES: "EXCLUDES_STORAGE",
    STORAGE_DMSCREEN: "DMSCREEN_STORAGE",
    STORAGE_DMSCREEN_TEMP_SUBLIST: "DMSCREEN_TEMP_SUBLIST",
    STORAGE_ROLLER_MACRO: "ROLLER_MACRO_STORAGE",
    STORAGE_ENCOUNTER: "ENCOUNTER_STORAGE",
    STORAGE_POINTBUY: "POINTBUY_STORAGE",
    STORAGE_GLOBAL_COMPONENT_STATE: "GLOBAL_COMPONENT_STATE",

    DUR_INLINE_NOTIFY: 500,

    PG_NONE: "NO_PAGE",
    STR_GENERIC: "Generic",

    SYM_UI_SKIP: Symbol("uiSkip"),

    SYM_WALKER_BREAK: Symbol("walkerBreak"),

    SYM_UTIL_TIMEOUT: Symbol("timeout"),

    LOC_ORIGIN_CANCER: "https://5e.tools",

    URL_BREW: `https://github.com/TheGiddyLimit/homebrew`,
    URL_ROOT_BREW: `https://raw.githubusercontent.com/TheGiddyLimit/homebrew/master/`,
    URL_PRERELEASE: `https://github.com/TheGiddyLimit/unearthed-arcana`,
    URL_ROOT_PRERELEASE: `https://raw.githubusercontent.com/TheGiddyLimit/unearthed-arcana/master/`,
    STR_NO_ATTUNEMENT: "No Attunement Required",

    CR_UNKNOWN: 100001,
    CR_CUSTOM: 100000,

    SPELL_LEVEL_MAX: 9,
    LEVEL_MAX: 20,

    ENTDATA_TABLE_INCLUDE: "tableInclude",
    ENTDATA_ITEM_MERGED_ENTRY_TAG: "item__mergedEntryTag",

    DRAG_TYPE_IMPORT: "ve-Import",
    DRAG_TYPE_LOOT: "ve-Loot",

    Z_INDEX_BENEATH_HOVER: 199,
};
//#endregion
//#region UrlUtil
globalThis.UrlUtil = {
    encodeForHash(toEncode) {
        if (toEncode instanceof Array)
            return toEncode.map(it=>`${it}`.toUrlified()).join(HASH_LIST_SEP);
        else
            return `${toEncode}`.toUrlified();
    },

    encodeArrayForHash(...toEncodes) {
        return toEncodes.map(UrlUtil.encodeForHash).join(HASH_LIST_SEP);
    },

    autoEncodeHash(obj) {
        const curPage = UrlUtil.getCurrentPage();
        const encoder = UrlUtil.URL_TO_HASH_BUILDER[curPage];
        if (!encoder)
            throw new Error(`No encoder found for page ${curPage}`);
        return encoder(obj);
    },

    decodeHash(hash) {
        return hash.split(HASH_LIST_SEP).map(it=>decodeURIComponent(it));
    },

    getSluggedHash(hash) {
        return Parser.stringToSlug(decodeURIComponent(hash)).replace(/_/g, "-");
    },

    getCurrentPage() {
        if (typeof window === "undefined")
            return VeCt.PG_NONE;
        const pSplit = window.location.pathname.split("/");
        let out = pSplit[pSplit.length - 1];
        if (!out.toLowerCase().endsWith(".html"))
            out += ".html";
        return out;
    },

    link(href, {isBustCache=false}={}) {
        if (isBustCache)
            return UrlUtil._link_getWithParam(href, {
                param: `t=${Date.now()}`
            });
        return href;
    },

    _link_getWithParam(href, {param=`v=${VERSION_NUMBER}`}={}) {
        if (href.includes("?"))
            return `${href}&${param}`;
        return `${href}?${param}`;
    },

    unpackSubHash(subHash, unencode) {
        if (subHash.includes(HASH_SUB_KV_SEP)) {
            const keyValArr = subHash.split(HASH_SUB_KV_SEP).map(s=>s.trim());
            const out = {};
            let k = keyValArr[0].toLowerCase();
            if (unencode)
                k = decodeURIComponent(k);
            let v = keyValArr[1].toLowerCase();
            if (unencode)
                v = decodeURIComponent(v);
            out[k] = v.split(HASH_SUB_LIST_SEP).map(s=>s.trim());
            if (out[k].length === 1 && out[k] === HASH_SUB_NONE)
                out[k] = [];
            return out;
        } else {
            throw new Error(`Badly formatted subhash ${subHash}`);
        }
    },

    packSubHash(key, values, opts) {
        opts = opts || {};
        if (opts.isEncodeBoth || opts.isEncodeKey)
            key = key.toUrlified();
        if (opts.isEncodeBoth || opts.isEncodeValues)
            values = values.map(it=>it.toUrlified());
        return `${key}${HASH_SUB_KV_SEP}${values.join(HASH_SUB_LIST_SEP)}`;
    },

    categoryToPage(category) {
        return UrlUtil.CAT_TO_PAGE[category];
    },
    categoryToHoverPage(category) {
        return UrlUtil.CAT_TO_HOVER_PAGE[category] || UrlUtil.categoryToPage(category);
    },

    pageToDisplayPage(page) {
        return UrlUtil.PG_TO_NAME[page] || page;
    },

    getFilename(url) {
        return url.slice(url.lastIndexOf("/") + 1);
    },

    isFullUrl(url) {
        return url && /^.*?:\/\//.test(url);
    },

    mini: {
        compress(primitive) {
            const type = typeof primitive;
            if (primitive === undefined)
                return "u";
            if (primitive === null)
                return "x";
            switch (type) {
            case "boolean":
                return `b${Number(primitive)}`;
            case "number":
                return `n${primitive}`;
            case "string":
                return `s${primitive.toUrlified()}`;
            default:
                throw new Error(`Unhandled type "${type}"`);
            }
        },

        decompress(raw) {
            const [type,data] = [raw.slice(0, 1), raw.slice(1)];
            switch (type) {
            case "u":
                return undefined;
            case "x":
                return null;
            case "b":
                return !!Number(data);
            case "n":
                return Number(data);
            case "s":
                return decodeURIComponent(String(data));
            default:
                throw new Error(`Unhandled type "${type}"`);
            }
        },
    },

    class: {
        getIndexedClassEntries(cls) {
            const out = [];

            (cls.classFeatures || []).forEach((lvlFeatureList,ixLvl)=>{
                lvlFeatureList.filter(feature=>(!feature.gainSubclassFeature || feature.gainSubclassFeatureHasContent) && feature.name !== "Ability Score Improvement" && feature.name !== "Proficiency Versatility").forEach((feature,ixFeature)=>{
                    const name = Renderer.findName(feature);
                    if (!name) {
                        if (BrewUtil2.hasSourceJson(cls.source))
                            return;
                        else
                            throw new Error("Class feature had no name!");
                    }
                    out.push({
                        _type: "classFeature",
                        source: cls.source.source || cls.source,
                        name,
                        hash: `${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](cls)}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
                            feature: {
                                ixLevel: ixLvl,
                                ixFeature: ixFeature
                            }
                        })}`,
                        entry: feature,
                        level: ixLvl + 1,
                    });
                }
                );
            }
            );

            return out;
        },

        getIndexedSubclassEntries(sc) {
            const out = [];

            const lvlFeatures = sc.subclassFeatures || [];
            sc.source = sc.source || sc.classSource;
            lvlFeatures.forEach(lvlFeature=>{
                lvlFeature.forEach((feature,ixFeature)=>{
                    const subclassFeatureHash = `${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({
                        name: sc.className,
                        source: sc.classSource
                    })}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
                        subclass: sc,
                        feature: {
                            ixLevel: feature.level - 1,
                            ixFeature: ixFeature
                        }
                    })}`;

                    const name = Renderer.findName(feature);
                    if (!name) {
                        if (BrewUtil2.hasSourceJson(sc.source))
                            return;
                        else
                            throw new Error("Subclass feature had no name!");
                    }
                    out.push({
                        _type: "subclassFeature",
                        name,
                        subclassName: sc.name,
                        subclassShortName: sc.shortName,
                        source: sc.source.source || sc.source,
                        hash: subclassFeatureHash,
                        entry: feature,
                        level: feature.level,
                    });

                    if (feature.entries) {
                        const namedFeatureParts = feature.entries.filter(it=>it.name);
                        namedFeatureParts.forEach(it=>{
                            if (out.find(existing=>it.name === existing.name && feature.level === existing.level))
                                return;
                            out.push({
                                _type: "subclassFeaturePart",
                                name: it.name,
                                subclassName: sc.name,
                                subclassShortName: sc.shortName,
                                source: sc.source.source || sc.source,
                                hash: subclassFeatureHash,
                                entry: feature,
                                level: feature.level,
                            });
                        }
                        );
                    }
                }
                );
            }
            );

            return out;
        },
    },

    getStateKeySubclass(sc) {
        return Parser.stringToSlug(`sub ${sc.shortName || sc.name} ${sc.source}`);
    },

    getClassesPageStatePart(opts) {
        if (!opts.subclass && !opts.feature)
            return "";

        if (!opts.feature)
            return UrlUtil.packSubHash("state", [UrlUtil._getClassesPageStatePart_subclass(opts.subclass)]);
        if (!opts.subclass)
            return UrlUtil.packSubHash("state", [UrlUtil._getClassesPageStatePart_feature(opts.feature)]);

        return UrlUtil.packSubHash("state", [UrlUtil._getClassesPageStatePart_subclass(opts.subclass), UrlUtil._getClassesPageStatePart_feature(opts.feature), ], );
    },

    _getClassesPageStatePart_subclass(sc) {
        return `${UrlUtil.getStateKeySubclass(sc)}=${UrlUtil.mini.compress(true)}`;
    },
    _getClassesPageStatePart_feature(feature) {
        return `feature=${UrlUtil.mini.compress(`${feature.ixLevel}-${feature.ixFeature}`)}`;
    },
};

UrlUtil.PG_BESTIARY = "bestiary.html";
UrlUtil.PG_SPELLS = "spells.html";
UrlUtil.PG_BACKGROUNDS = "backgrounds.html";
UrlUtil.PG_ITEMS = "items.html";
UrlUtil.PG_CLASSES = "classes.html";
UrlUtil.PG_CONDITIONS_DISEASES = "conditionsdiseases.html";
UrlUtil.PG_FEATS = "feats.html";
UrlUtil.PG_OPT_FEATURES = "optionalfeatures.html";
UrlUtil.PG_PSIONICS = "psionics.html";
UrlUtil.PG_RACES = "races.html";
UrlUtil.PG_REWARDS = "rewards.html";
UrlUtil.PG_VARIANTRULES = "variantrules.html";
UrlUtil.PG_ADVENTURE = "adventure.html";
UrlUtil.PG_ADVENTURES = "adventures.html";
UrlUtil.PG_BOOK = "book.html";
UrlUtil.PG_BOOKS = "books.html";
UrlUtil.PG_DEITIES = "deities.html";
UrlUtil.PG_CULTS_BOONS = "cultsboons.html";
UrlUtil.PG_OBJECTS = "objects.html";
UrlUtil.PG_TRAPS_HAZARDS = "trapshazards.html";
UrlUtil.PG_QUICKREF = "quickreference.html";
UrlUtil.PG_MANAGE_BREW = "managebrew.html";
UrlUtil.PG_MANAGE_PRERELEASE = "manageprerelease.html";
UrlUtil.PG_MAKE_BREW = "makebrew.html";
UrlUtil.PG_DEMO_RENDER = "renderdemo.html";
UrlUtil.PG_TABLES = "tables.html";
UrlUtil.PG_VEHICLES = "vehicles.html";
UrlUtil.PG_CHARACTERS = "characters.html";
UrlUtil.PG_ACTIONS = "actions.html";
UrlUtil.PG_LANGUAGES = "languages.html";
UrlUtil.PG_STATGEN = "statgen.html";
UrlUtil.PG_LIFEGEN = "lifegen.html";
UrlUtil.PG_NAMES = "names.html";
UrlUtil.PG_DM_SCREEN = "dmscreen.html";
UrlUtil.PG_CR_CALCULATOR = "crcalculator.html";
UrlUtil.PG_ENCOUNTERGEN = "encountergen.html";
UrlUtil.PG_LOOTGEN = "lootgen.html";
UrlUtil.PG_TEXT_CONVERTER = "converter.html";
UrlUtil.PG_CHANGELOG = "changelog.html";
UrlUtil.PG_CHAR_CREATION_OPTIONS = "charcreationoptions.html";
UrlUtil.PG_RECIPES = "recipes.html";
UrlUtil.PG_CLASS_SUBCLASS_FEATURES = "classfeatures.html";
UrlUtil.PG_CREATURE_FEATURES = "creaturefeatures.html";
UrlUtil.PG_VEHICLE_FEATURES = "vehiclefeatures.html";
UrlUtil.PG_OBJECT_FEATURES = "objectfeatures.html";
UrlUtil.PG_TRAP_FEATURES = "trapfeatures.html";
UrlUtil.PG_MAPS = "maps.html";
UrlUtil.PG_SEARCH = "search.html";
UrlUtil.PG_DECKS = "decks.html";

UrlUtil.URL_TO_HASH_GENERIC = (it)=>UrlUtil.encodeArrayForHash(it.name, it.source);

UrlUtil.URL_TO_HASH_BUILDER = {};
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BESTIARY] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BACKGROUNDS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_FEATS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_PSIONICS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RACES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_REWARDS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VARIANTRULES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURE] = (it)=>UrlUtil.encodeForHash(it.id);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURES] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURE];
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOK] = (it)=>UrlUtil.encodeForHash(it.id);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOKS] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOK];
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DEITIES] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.pantheon, it.source);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CULTS_BOONS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OBJECTS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAPS_HAZARDS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TABLES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ACTIONS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_LANGUAGES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CHAR_CREATION_OPTIONS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RECIPES] = (it)=>`${UrlUtil.encodeArrayForHash(it.name, it.source)}${it._scaleFactor ? `${HASH_PART_SEP}${VeCt.HASH_SCALED}${HASH_SUB_KV_SEP}${it._scaleFactor}` : ""}`;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DECKS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASS_SUBCLASS_FEATURES] = (it)=>(it.__prop === "subclassFeature" || it.subclassSource) ? UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"](it) : UrlUtil.URL_TO_HASH_BUILDER["classFeature"](it);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CREATURE_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLE_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OBJECT_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAP_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_QUICKREF] = ({name, ixChapter, ixHeader})=>{
    const hashParts = ["bookref-quick", ixChapter, UrlUtil.encodeForHash(name.toLowerCase())];
    if (ixHeader)
        hashParts.push(ixHeader);
    return hashParts.join(HASH_PART_SEP);
}
;

UrlUtil.URL_TO_HASH_BUILDER["monster"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BESTIARY];
UrlUtil.URL_TO_HASH_BUILDER["spell"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS];
UrlUtil.URL_TO_HASH_BUILDER["background"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BACKGROUNDS];
UrlUtil.URL_TO_HASH_BUILDER["item"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS];
UrlUtil.URL_TO_HASH_BUILDER["itemGroup"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS];
UrlUtil.URL_TO_HASH_BUILDER["baseitem"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS];
UrlUtil.URL_TO_HASH_BUILDER["magicvariant"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS];
UrlUtil.URL_TO_HASH_BUILDER["class"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES];
UrlUtil.URL_TO_HASH_BUILDER["condition"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES];
UrlUtil.URL_TO_HASH_BUILDER["disease"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES];
UrlUtil.URL_TO_HASH_BUILDER["status"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES];
UrlUtil.URL_TO_HASH_BUILDER["feat"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_FEATS];
UrlUtil.URL_TO_HASH_BUILDER["optionalfeature"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES];
UrlUtil.URL_TO_HASH_BUILDER["psionic"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_PSIONICS];
UrlUtil.URL_TO_HASH_BUILDER["race"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RACES];
UrlUtil.URL_TO_HASH_BUILDER["subrace"] = (it)=>UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RACES]({
    name: `${it.name} (${it.raceName})`,
    source: it.source
});
UrlUtil.URL_TO_HASH_BUILDER["reward"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_REWARDS];
UrlUtil.URL_TO_HASH_BUILDER["variantrule"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VARIANTRULES];
UrlUtil.URL_TO_HASH_BUILDER["adventure"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURES];
UrlUtil.URL_TO_HASH_BUILDER["adventureData"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURES];
UrlUtil.URL_TO_HASH_BUILDER["book"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOKS];
UrlUtil.URL_TO_HASH_BUILDER["bookData"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOKS];
UrlUtil.URL_TO_HASH_BUILDER["deity"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DEITIES];
UrlUtil.URL_TO_HASH_BUILDER["cult"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CULTS_BOONS];
UrlUtil.URL_TO_HASH_BUILDER["boon"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CULTS_BOONS];
UrlUtil.URL_TO_HASH_BUILDER["object"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OBJECTS];
UrlUtil.URL_TO_HASH_BUILDER["trap"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAPS_HAZARDS];
UrlUtil.URL_TO_HASH_BUILDER["hazard"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAPS_HAZARDS];
UrlUtil.URL_TO_HASH_BUILDER["table"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TABLES];
UrlUtil.URL_TO_HASH_BUILDER["tableGroup"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TABLES];
UrlUtil.URL_TO_HASH_BUILDER["vehicle"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLES];
UrlUtil.URL_TO_HASH_BUILDER["vehicleUpgrade"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLES];
UrlUtil.URL_TO_HASH_BUILDER["action"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ACTIONS];
UrlUtil.URL_TO_HASH_BUILDER["language"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_LANGUAGES];
UrlUtil.URL_TO_HASH_BUILDER["charoption"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CHAR_CREATION_OPTIONS];
UrlUtil.URL_TO_HASH_BUILDER["recipe"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RECIPES];
UrlUtil.URL_TO_HASH_BUILDER["deck"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DECKS];

UrlUtil.URL_TO_HASH_BUILDER["subclass"] = it=>{
    return Hist.util.getCleanHash(`${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({
        name: it.className,
        source: it.classSource
    })}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
        subclass: it
    })}`, );
}
;
UrlUtil.URL_TO_HASH_BUILDER["classFeature"] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.className, it.classSource, it.level, it.source);
UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.className, it.classSource, it.subclassShortName, it.subclassSource, it.level, it.source);
UrlUtil.URL_TO_HASH_BUILDER["card"] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.set, it.source);
UrlUtil.URL_TO_HASH_BUILDER["legendaryGroup"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["itemEntry"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["itemProperty"] = (it)=>UrlUtil.encodeArrayForHash(it.abbreviation, it.source);
UrlUtil.URL_TO_HASH_BUILDER["itemType"] = (it)=>UrlUtil.encodeArrayForHash(it.abbreviation, it.source);
UrlUtil.URL_TO_HASH_BUILDER["itemTypeAdditionalEntries"] = (it)=>UrlUtil.encodeArrayForHash(it.appliesTo, it.source);
UrlUtil.URL_TO_HASH_BUILDER["itemMastery"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["skill"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["sense"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["raceFeature"] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.raceName, it.raceSource, it.source);
UrlUtil.URL_TO_HASH_BUILDER["citation"] = UrlUtil.URL_TO_HASH_GENERIC;

Object.keys(UrlUtil.URL_TO_HASH_BUILDER).filter(k=>!k.endsWith(".html") && k.toLowerCase() !== k).forEach(k=>UrlUtil.URL_TO_HASH_BUILDER[k.toLowerCase()] = UrlUtil.URL_TO_HASH_BUILDER[k]);

Object.keys(UrlUtil.URL_TO_HASH_BUILDER).filter(k=>!k.endsWith(".html")).forEach(k=>UrlUtil.URL_TO_HASH_BUILDER[`raw_${k}`] = UrlUtil.URL_TO_HASH_BUILDER[k]);

Object.keys(UrlUtil.URL_TO_HASH_BUILDER).filter(k=>!k.endsWith(".html")).forEach(k=>{
    UrlUtil.URL_TO_HASH_BUILDER[`${k}Fluff`] = UrlUtil.URL_TO_HASH_BUILDER[k];
    UrlUtil.URL_TO_HASH_BUILDER[`${k}Template`] = UrlUtil.URL_TO_HASH_BUILDER[k];
}
);

UrlUtil.PG_TO_NAME = {};
UrlUtil.PG_TO_NAME[UrlUtil.PG_BESTIARY] = "Bestiary";
UrlUtil.PG_TO_NAME[UrlUtil.PG_SPELLS] = "Spells";
UrlUtil.PG_TO_NAME[UrlUtil.PG_BACKGROUNDS] = "Backgrounds";
UrlUtil.PG_TO_NAME[UrlUtil.PG_ITEMS] = "Items";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CLASSES] = "Classes";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CONDITIONS_DISEASES] = "Conditions & Diseases";
UrlUtil.PG_TO_NAME[UrlUtil.PG_FEATS] = "Feats";
UrlUtil.PG_TO_NAME[UrlUtil.PG_OPT_FEATURES] = "Other Options and Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_PSIONICS] = "Psionics";
UrlUtil.PG_TO_NAME[UrlUtil.PG_RACES] = "Races";
UrlUtil.PG_TO_NAME[UrlUtil.PG_REWARDS] = "Supernatural Gifts & Rewards";
UrlUtil.PG_TO_NAME[UrlUtil.PG_VARIANTRULES] = "Optional, Variant, and Expanded Rules";
UrlUtil.PG_TO_NAME[UrlUtil.PG_ADVENTURES] = "Adventures";
UrlUtil.PG_TO_NAME[UrlUtil.PG_BOOKS] = "Books";
UrlUtil.PG_TO_NAME[UrlUtil.PG_DEITIES] = "Deities";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CULTS_BOONS] = "Cults & Supernatural Boons";
UrlUtil.PG_TO_NAME[UrlUtil.PG_OBJECTS] = "Objects";
UrlUtil.PG_TO_NAME[UrlUtil.PG_TRAPS_HAZARDS] = "Traps & Hazards";
UrlUtil.PG_TO_NAME[UrlUtil.PG_QUICKREF] = "Quick Reference";
UrlUtil.PG_TO_NAME[UrlUtil.PG_MANAGE_BREW] = "Homebrew Manager";
UrlUtil.PG_TO_NAME[UrlUtil.PG_MANAGE_PRERELEASE] = "Prerelease Content Manager";
UrlUtil.PG_TO_NAME[UrlUtil.PG_MAKE_BREW] = "Homebrew Builder";
UrlUtil.PG_TO_NAME[UrlUtil.PG_DEMO_RENDER] = "Renderer Demo";
UrlUtil.PG_TO_NAME[UrlUtil.PG_TABLES] = "Tables";
UrlUtil.PG_TO_NAME[UrlUtil.PG_VEHICLES] = "Vehicles";
UrlUtil.PG_TO_NAME[UrlUtil.PG_ACTIONS] = "Actions";
UrlUtil.PG_TO_NAME[UrlUtil.PG_LANGUAGES] = "Languages";
UrlUtil.PG_TO_NAME[UrlUtil.PG_STATGEN] = "Stat Generator";
UrlUtil.PG_TO_NAME[UrlUtil.PG_LIFEGEN] = "This Is Your Life";
UrlUtil.PG_TO_NAME[UrlUtil.PG_NAMES] = "Names";
UrlUtil.PG_TO_NAME[UrlUtil.PG_DM_SCREEN] = "DM Screen";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CR_CALCULATOR] = "CR Calculator";
UrlUtil.PG_TO_NAME[UrlUtil.PG_ENCOUNTERGEN] = "Encounter Generator";
UrlUtil.PG_TO_NAME[UrlUtil.PG_LOOTGEN] = "Loot Generator";
UrlUtil.PG_TO_NAME[UrlUtil.PG_TEXT_CONVERTER] = "Text Converter";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CHANGELOG] = "Changelog";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CHAR_CREATION_OPTIONS] = "Other Character Creation Options";
UrlUtil.PG_TO_NAME[UrlUtil.PG_RECIPES] = "Recipes";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CREATURE_FEATURES] = "Creature Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_VEHICLE_FEATURES] = "Vehicle Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_OBJECT_FEATURES] = "Object Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_TRAP_FEATURES] = "Trap Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_MAPS] = "Maps";
UrlUtil.PG_TO_NAME[UrlUtil.PG_DECKS] = "Decks";

UrlUtil.CAT_TO_PAGE = {};
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CREATURE] = UrlUtil.PG_BESTIARY;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SPELL] = UrlUtil.PG_SPELLS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_BACKGROUND] = UrlUtil.PG_BACKGROUNDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ITEM] = UrlUtil.PG_ITEMS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CLASS] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CLASS_FEATURE] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SUBCLASS] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SUBCLASS_FEATURE] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CONDITION] = UrlUtil.PG_CONDITIONS_DISEASES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_FEAT] = UrlUtil.PG_FEATS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ELDRITCH_INVOCATION] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_METAMAGIC] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER_CAVALIER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ARCANE_SHOT] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_FIGHTING_STYLE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_PSIONIC] = UrlUtil.PG_PSIONICS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_RACE] = UrlUtil.PG_RACES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OTHER_REWARD] = UrlUtil.PG_REWARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = UrlUtil.PG_VARIANTRULES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ADVENTURE] = UrlUtil.PG_ADVENTURE;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_DEITY] = UrlUtil.PG_DEITIES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OBJECT] = UrlUtil.PG_OBJECTS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TRAP] = UrlUtil.PG_TRAPS_HAZARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_HAZARD] = UrlUtil.PG_TRAPS_HAZARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_QUICKREF] = UrlUtil.PG_QUICKREF;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CULT] = UrlUtil.PG_CULTS_BOONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_BOON] = UrlUtil.PG_CULTS_BOONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_DISEASE] = UrlUtil.PG_CONDITIONS_DISEASES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TABLE] = UrlUtil.PG_TABLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TABLE_GROUP] = UrlUtil.PG_TABLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_VEHICLE] = UrlUtil.PG_VEHICLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_PACT_BOON] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ARTIFICER_INFUSION] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SHIP_UPGRADE] = UrlUtil.PG_VEHICLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] = UrlUtil.PG_VEHICLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ONOMANCY_RESONANT] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ALCHEMICAL_FORMULA] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ACTION] = UrlUtil.PG_ACTIONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_LANGUAGE] = UrlUtil.PG_LANGUAGES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_BOOK] = UrlUtil.PG_BOOK;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_PAGE] = null;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_LEGENDARY_GROUP] = null;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CHAR_CREATION_OPTIONS] = UrlUtil.PG_CHAR_CREATION_OPTIONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_RECIPES] = UrlUtil.PG_RECIPES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_STATUS] = UrlUtil.PG_CONDITIONS_DISEASES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_DECK] = UrlUtil.PG_DECKS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CARD] = "card";
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SKILLS] = "skill";
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SENSES] = "sense";
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_LEGENDARY_GROUP] = "legendaryGroup";

UrlUtil.CAT_TO_HOVER_PAGE = {};
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_CLASS_FEATURE] = "classfeature";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_SUBCLASS_FEATURE] = "subclassfeature";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_CARD] = "card";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_SKILLS] = "skill";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_SENSES] = "sense";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_LEGENDARY_GROUP] = "legendaryGroup";

/* UrlUtil.HASH_START_CREATURE_SCALED = `${VeCt.HASH_SCALED}${HASH_SUB_KV_SEP}`;
UrlUtil.HASH_START_CREATURE_SCALED_SPELL_SUMMON = `${VeCt.HASH_SCALED_SPELL_SUMMON}${HASH_SUB_KV_SEP}`;
UrlUtil.HASH_START_CREATURE_SCALED_CLASS_SUMMON = `${VeCt.HASH_SCALED_CLASS_SUMMON}${HASH_SUB_KV_SEP}`; */

UrlUtil.SUBLIST_PAGES = {
    [UrlUtil.PG_BESTIARY]: true,
    [UrlUtil.PG_SPELLS]: true,
    [UrlUtil.PG_BACKGROUNDS]: true,
    [UrlUtil.PG_ITEMS]: true,
    [UrlUtil.PG_CONDITIONS_DISEASES]: true,
    [UrlUtil.PG_FEATS]: true,
    [UrlUtil.PG_OPT_FEATURES]: true,
    [UrlUtil.PG_PSIONICS]: true,
    [UrlUtil.PG_RACES]: true,
    [UrlUtil.PG_REWARDS]: true,
    [UrlUtil.PG_VARIANTRULES]: true,
    [UrlUtil.PG_DEITIES]: true,
    [UrlUtil.PG_CULTS_BOONS]: true,
    [UrlUtil.PG_OBJECTS]: true,
    [UrlUtil.PG_TRAPS_HAZARDS]: true,
    [UrlUtil.PG_TABLES]: true,
    [UrlUtil.PG_VEHICLES]: true,
    [UrlUtil.PG_ACTIONS]: true,
    [UrlUtil.PG_LANGUAGES]: true,
    [UrlUtil.PG_CHAR_CREATION_OPTIONS]: true,
    [UrlUtil.PG_RECIPES]: true,
    [UrlUtil.PG_DECKS]: true,
};

UrlUtil.PAGE_TO_PROPS = {};
UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_SPELLS] = ["spell"];
UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_ITEMS] = ["item", "itemGroup", "itemType", "itemEntry", "itemProperty", "itemTypeAdditionalEntries", "itemMastery", "baseitem", "magicvariant"];
UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_RACES] = ["race", "subrace"];
//#endregion
//#endregion






Charactermancer_StartingEquipment._EQUIPMENT_SET_NAMES = {
    weaponAny: "Weapon",
    weaponSimple: "Simple Weapon",
    weaponSimpleMelee: "Simple Melee Weapon",
    weaponSimpleRanged: "Simple Ranged Weapon",
    weaponMartial: "Martial Weapon",
    weaponMartialMelee: "Martial Melee Weapon",
    weaponMartialRanged: "Martial Ranged Weapon",
    instrumentMusical: "Musical Instrument",
    armorLight: "Light Armor",
    armorMedium: "Medium Armor",
    armorHeavy: "Heavy Armor",
    weaponMelee: "Melee Weapon",
    weaponRanged: "Ranged Weapon",
    focusSpellcasting: "Spellcasting Focus",
    setGaming: "Gaming Set",
    toolArtisan: "Artisan's Tool",
};
Charactermancer_StartingEquipment._EQUIPMENT_SETS = {
    weapon: [...UtilDataConverter.WEAPONS_SIMPLE, ...UtilDataConverter.WEAPONS_MARTIAL, ],
    weaponSimple: [...UtilDataConverter.WEAPONS_SIMPLE, ],
    weaponSimpleMelee: ["club|phb", "dagger|phb", "greatclub|phb", "handaxe|phb", "javelin|phb", "light hammer|phb", "mace|phb", "quarterstaff|phb", "sickle|phb", "spear|phb", ],
    weaponSimpleRanged: ["light crossbow|phb", "shortbow|phb", ],
    weaponMartial: [...UtilDataConverter.WEAPONS_MARTIAL, ],
    weaponMartialMelee: ["battleaxe|phb", "flail|phb", "glaive|phb", "greataxe|phb", "greatsword|phb", "halberd|phb", "lance|phb", "longsword|phb", "maul|phb", "morningstar|phb", "pike|phb", "rapier|phb", "scimitar|phb", "shortsword|phb", "trident|phb", "war pick|phb", "warhammer|phb", "whip|phb", ],
    weaponMartialRanged: ["blowgun|phb", "hand crossbow|phb", "heavy crossbow|phb", "longbow|phb", ],
    instrumentMusical: ["bagpipes|phb", "drum|phb", "dulcimer|phb", "flute|phb", "horn|phb", "lute|phb", "lyre|phb", "pan flute|phb", "shawm|phb", "viol|phb", ],
    armorLight: ["leather armor|phb", "padded armor|phb", "studded leather armor|phb", ],
    armorMedium: ["hide armor|phb", "chain shirt|phb", "scale mail|phb", "breastplate|phb", "half plate armor|phb", ],
    armorHeavy: ["ring mail|phb", "chain mail|phb", "splint armor|phb", "plate armor|phb", ],
    weaponMelee: ["battleaxe|phb", "club|phb", "dagger|phb", "flail|phb", "glaive|phb", "greataxe|phb", "greatclub|phb", "greatsword|phb", "halberd|phb", "handaxe|phb", "javelin|phb", "lance|phb", "light hammer|phb", "longsword|phb", "mace|phb", "maul|phb", "morningstar|phb", "pike|phb", "quarterstaff|phb", "rapier|phb", "scimitar|phb", "shortsword|phb", "sickle|phb", "spear|phb", "staff|phb", "trident|phb", "war pick|phb", "warhammer|phb", "whip|phb", ],
    weaponRanged: ["blowgun|phb", "dart|phb", "hand crossbow|phb", "heavy crossbow|phb", "light crossbow|phb", "longbow|phb", "net|phb", "shortbow|phb", "sling|phb", ],
    focusSpellcasting: ["crystal|phb", "orb|phb", "rod|phb", "staff|phb", "wand|phb", ],
    setGaming: ["dice set|phb", "dragonchess set|phb", "playing card set|phb", "three-dragon ante set|phb", ],
    toolArtisan: ["alchemist's supplies|phb", "brewer's supplies|phb", "calligrapher's supplies|phb", "carpenter's tools|phb", "cartographer's tools|phb", "cobbler's tools|phb", "cook's utensils|phb", "glassblower's tools|phb", "jeweler's tools|phb", "leatherworker's tools|phb", "mason's tools|phb", "painter's supplies|phb", "potter's tools|phb", "smith's tools|phb", "tinker's tools|phb", "weaver's tools|phb", "woodcarver's tools|phb", ],
};

let Hist = class Hist {
    static hashChange({isForceLoad, isBlankFilterLoad=false}={}) {
        if (Hist.isHistorySuppressed) {
            Hist.setSuppressHistory(false);
            return;
        }

        const [link,...sub] = Hist.getHashParts();

        if (link !== Hist.lastLoadedLink || sub.length === 0 || isForceLoad) {
            Hist.lastLoadedLink = link;
            if (link === HASH_BLANK) {
                isBlankFilterLoad = true;
            } else {
                const listItem = Hist.getActiveListItem(link);

                if (listItem == null) {
                    if (typeof pHandleUnknownHash === "function" && window.location.hash.length && Hist._lastUnknownLink !== link) {
                        Hist._lastUnknownLink = link;
                        pHandleUnknownHash(link, sub);
                        return;
                    } else {
                        Hist._freshLoad();
                        return;
                    }
                }

                const toLoad = listItem.ix;
                if (toLoad === undefined)
                    Hist._freshLoad();
                else {
                    Hist.lastLoadedId = listItem.ix;
                    loadHash(listItem.ix);
                    document.title = `${listItem.name ? `${listItem.name} - ` : ""}5etools`;
                }
            }
        }

        if (typeof loadSubHash === "function" && (sub.length > 0 || isForceLoad))
            loadSubHash(sub);
        if (isBlankFilterLoad)
            Hist._freshLoad();
    }

    static init(initialLoadComplete) {
        window.onhashchange = ()=>Hist.hashChange({
            isForceLoad: true
        });
        if (window.location.hash.length) {
            Hist.hashChange();
        } else {
            Hist._freshLoad();
        }
        if (initialLoadComplete)
            Hist.initialLoad = false;
    }

    static setSuppressHistory(val) {
        Hist.isHistorySuppressed = val;
    }

    static _listPage = null;

    static setListPage(listPage) {
        this._listPage = listPage;
    }

    static getSelectedListItem() {
        const [link] = Hist.getHashParts();
        return Hist.getActiveListItem(link);
    }

    static getSelectedListElementWithLocation() {
        const [link] = Hist.getHashParts();
        return Hist.getActiveListItem(link, true);
    }

    static getHashParts() {
        return Hist.util.getHashParts(window.location.hash);
    }

    static getActiveListItem(link, getIndex) {
        const primaryLists = this._listPage.primaryLists;
        if (primaryLists && primaryLists.length) {
            for (let x = 0; x < primaryLists.length; ++x) {
                const list = primaryLists[x];

                const foundItemIx = list.items.findIndex(it=>it.values.hash === link);
                if (~foundItemIx) {
                    if (getIndex)
                        return {
                            item: list.items[foundItemIx],
                            x: x,
                            y: foundItemIx,
                            list
                        };
                    return list.items[foundItemIx];
                }
            }
        }
    }

    static _freshLoad() {
        setTimeout(()=>{
            const goTo = $("#listcontainer").find(".list a").attr("href");
            if (goTo) {
                const parts = location.hash.split(HASH_PART_SEP);
                const fullHash = `${goTo}${parts.length > 1 ? `${HASH_PART_SEP}${parts.slice(1).join(HASH_PART_SEP)}` : ""}`;
                location.replace(fullHash);
            }
        }
        , 1);
    }

    static cleanSetHash(toSet) {
        window.location.hash = Hist.util.getCleanHash(toSet);
    }

    static getHashSource() {
        const [link] = Hist.getHashParts();
        return link ? link.split(HASH_LIST_SEP).last() : null;
    }

    static getSubHash(key) {
        return Hist.util.getSubHash(window.location.hash, key);
    }

    static setSubhash(key, val) {
        const nxtHash = Hist.util.setSubhash(window.location.hash, key, val);
        Hist.cleanSetHash(nxtHash);
    }

    static setMainHash(hash) {
        const subHashPart = Hist.util.getHashParts(window.location.hash, key, val).slice(1).join(HASH_PART_SEP);
        Hist.cleanSetHash([hash, subHashPart].filter(Boolean).join(HASH_PART_SEP));
    }

    static replaceHistoryHash(hash) {
        window.history.replaceState({}, document.title, `${location.origin}${location.pathname}${hash ? `#${hash}` : ""}`, );
    }
}
;
Hist.lastLoadedLink = null;
Hist._lastUnknownLink = null;
Hist.lastLoadedId = null;
Hist.initialLoad = true;
Hist.isHistorySuppressed = false;

Hist.util = class {
    static getCleanHash(hash) {
        return hash.replace(/,+/g, ",").replace(/,$/, "").toLowerCase();
    }

    static _SYMS_NO_ENCODE = [/(,)/g, /(:)/g, /(=)/g];

    static getHashParts(location, {isReturnEncoded=false}={}) {
        if (location[0] === "#")
            location = location.slice(1);

        if (location === "google_vignette")
            location = "";

        if (isReturnEncoded) {
            return location.split(HASH_PART_SEP);
        }

        let pts = [location];
        this._SYMS_NO_ENCODE.forEach(re=>{
            pts = pts.map(pt=>pt.split(re)).flat();
        }
        );
        pts = pts.map(pt=>{
            if (this._SYMS_NO_ENCODE.some(re=>re.test(pt)))
                return pt;
            return decodeURIComponent(pt).toUrlified();
        }
        );
        location = pts.join("");

        return location.split(HASH_PART_SEP);
    }

    static getSubHash(location, key) {
        const [link,...sub] = Hist.util.getHashParts(location);
        const hKey = `${key}${HASH_SUB_KV_SEP}`;
        const part = sub.find(it=>it.startsWith(hKey));
        if (part)
            return part.slice(hKey.length);
        return null;
    }

    static setSubhash(location, key, val) {
        if (key.endsWith(HASH_SUB_KV_SEP))
            key = key.slice(0, -1);

        const [link,...sub] = Hist.util.getHashParts(location);
        if (!link)
            return "";

        const hKey = `${key}${HASH_SUB_KV_SEP}`;
        const out = [link];
        if (sub.length)
            sub.filter(it=>!it.startsWith(hKey)).forEach(it=>out.push(it));
        if (val != null)
            out.push(`${hKey}${val}`);

        return Hist.util.getCleanHash(out.join(HASH_PART_SEP));
    }
};

