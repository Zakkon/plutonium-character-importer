import { SharedConsts } from "./config.js";
//#region PageFilters
class PageFilter {
    
    constructor(opts) {
        opts = opts || {};
        this._sourceFilter = new SourceFilter(opts.sourceFilterOpts);
        this._filterBox = null;
    }

    get filterBox() { return this._filterBox; }
    get sourceFilter() { return this._sourceFilter; }

    mutateAndAddToFilters(entity, isExcluded, opts) {
        this.constructor.mutateForFilters(entity, opts);
        this.addToFilters(entity, isExcluded, opts);
    }

    static mutateForFilters(entity, opts) {
        throw new Error("Unimplemented!");
    }
    addToFilters(entity, isExcluded, opts) {
        throw new Error("Unimplemented!");
    }
    toDisplay(values, entity) {
        throw new Error("Unimplemented!");
    }
    async _pPopulateBoxOptions() {
        throw new Error("Unimplemented!");
    }

    async pInitFilterBox(opts) {
        opts = opts || {};
        await this._pPopulateBoxOptions(opts);
        this._filterBox = new FilterBox(opts);
        await this._filterBox.pDoLoadState();
        return this._filterBox;
    }

    trimState() {
        return this._filterBox.trimState_();
    }

    static _getClassFilterItem({className, classSource, isVariantClass, definedInSource}) {
        const nm = className.split("(")[0].trim();
        const variantSuffix = isVariantClass ? ` [${definedInSource ? Parser.sourceJsonToAbv(definedInSource) : "Unknown"}]` : "";
        const sourceSuffix = (SourceUtil.isNonstandardSource(classSource || Parser.SRC_PHB) || (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(classSource || Parser.SRC_PHB)) || (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(classSource || Parser.SRC_PHB))) ? ` (${Parser.sourceJsonToAbv(classSource)})` : "";
        const name = `${nm}${variantSuffix}${sourceSuffix}`;

        const opts = {
            item: name,
            userData: {
                group: SourceUtil.getFilterGroup(classSource || Parser.SRC_PHB),
            },
        };

        if (isVariantClass) {
            opts.nest = definedInSource ? Parser.sourceJsonToFull(definedInSource) : "Unknown";
            opts.userData.equivalentClassName = `${nm}${sourceSuffix}`;
            opts.userData.definedInSource = definedInSource;
        }

        return new FilterItem$1(opts);
    }

    static _getSubclassFilterItem({className, classSource, subclassShortName, subclassName, subclassSource, subSubclassName, isVariantClass, definedInSource}) {
        const group = SourceUtil.isSubclassReprinted(className, classSource, subclassShortName, subclassSource) || Parser.sourceJsonToFull(subclassSource).startsWith(Parser.UA_PREFIX) || Parser.sourceJsonToFull(subclassSource).startsWith(Parser.PS_PREFIX);

        const classFilterItem = this._getClassFilterItem({
            className: subclassShortName || subclassName,
            classSource: subclassSource,
        });

        return new FilterItem$1({
            item: `${className}: ${classFilterItem.item}${subSubclassName ? `, ${subSubclassName}` : ""}`,
            nest: className,
            userData: {
                group,
            },
        });
    }

    static _isReprinted({reprintedAs, tag, page, prop}) {
        return reprintedAs?.length && reprintedAs.some(it=>{
            const {name, source} = DataUtil.generic.unpackUid(it?.uid ?? it, tag);
            const hash = UrlUtil.URL_TO_HASH_BUILDER[page]({
                name,
                source
            });
            return !ExcludeUtil.isExcluded(hash, prop, source, {
                isNoCount: true
            });
        }
        );
    }

    static getListAliases(ent) {
        return (ent.alias || []).map(it=>`"${it}"`).join(",");
    }

    static defaultSourceSelFn(val) {
        return SourceUtil.getFilterGroup(val) === SourceUtil.FILTER_GROUP_STANDARD;
    }
};

//#region PageFilterClasses
class PageFilterClassesBase extends PageFilter {
    constructor() {
        super();

        this._miscFilter = new Filter({
            header: "Miscellaneous",
            items: ["Reprinted", "Sidekick", "SRD", "Basic Rules"],
            deselFn: (it)=>{
                return it === "Reprinted" || it === "Sidekick";
            }
            ,
            displayFnMini: it=>it === "Reprinted" ? "Repr." : it,
            displayFnTitle: it=>it === "Reprinted" ? it : "",
            isMiscFilter: true,
        });

        this._optionsFilter = new OptionsFilter({
            header: "Other/Text Options",
            defaultState: {
                isDisplayClassIfSubclassActive: false,
                isClassFeatureVariant: true,
            },
            displayFn: k=>{
                switch (k) {
                case "isClassFeatureVariant":
                    return "Class Feature Options/Variants";
                case "isDisplayClassIfSubclassActive":
                    return "Display Class if Any Subclass is Visible";
                default:
                    throw new Error(`Unhandled key "${k}"`);
                }
            }
            ,
            displayFnMini: k=>{
                switch (k) {
                case "isClassFeatureVariant":
                    return "C.F.O/V.";
                case "isDisplayClassIfSubclassActive":
                    return "Sc>C";
                default:
                    throw new Error(`Unhandled key "${k}"`);
                }
            }
            ,
        });
    }

    get optionsFilter() {
        return this._optionsFilter;
    }

    static mutateForFilters(cls) {
        cls.source = cls.source || Parser.SRC_PHB;
        cls.subclasses = cls.subclasses || [];

        cls._fSources = SourceFilter.getCompleteFilterSources(cls);

        cls._fSourceSubclass = [...new Set([cls.source, ...cls.subclasses.map(it=>[it.source, ...(it.otherSources || []).map(it=>it.source)]).flat(), ]), ];

        cls._fMisc = [];
        if (cls.isReprinted)
            cls._fMisc.push("Reprinted");
        if (cls.srd)
            cls._fMisc.push("SRD");
        if (cls.basicRules)
            cls._fMisc.push("Basic Rules");
        if (cls.isSidekick)
            cls._fMisc.push("Sidekick");

        cls.subclasses.forEach(sc=>{
            sc.source = sc.source || cls.source;
            sc.shortName = sc.shortName || sc.name;
            sc._fMisc = [];
            if (sc.srd)
                sc._fMisc.push("SRD");
            if (sc.basicRules)
                sc._fMisc.push("Basic Rules");
            if (sc.isReprinted)
                sc._fMisc.push("Reprinted");
        }
        );
    }

    _addEntrySourcesToFilter(entry) {
        this._addEntrySourcesToFilter_walk(entry);
    }

    _addEntrySourcesToFilter_walk = (obj)=>{
        if ((typeof obj !== "object") || obj == null)
            return;

        if (obj instanceof Array)
            return obj.forEach(this._addEntrySourcesToFilter_walk.bind(this));

        if (obj.source)
            this._sourceFilter.addItem(obj.source);
        if (obj.entries)
            this._addEntrySourcesToFilter_walk(obj.entries);
    }
    ;

    addToFilters(cls, isExcluded, opts) {
        if (isExcluded)
            return;
        opts = opts || {};
        const subclassExclusions = opts.subclassExclusions || {};

        this._sourceFilter.addItem(cls.source);

        if (cls.fluff)
            cls.fluff.forEach(it=>this._addEntrySourcesToFilter(it));
        cls.classFeatures.forEach(lvlFeatures=>lvlFeatures.forEach(feature=>this._addEntrySourcesToFilter(feature)));

        cls.subclasses.forEach(sc=>{
            const isScExcluded = (subclassExclusions[sc.source] || {})[sc.name] || false;
            if (!isScExcluded) {
                this._sourceFilter.addItem(sc.source);
                sc.subclassFeatures.forEach(lvlFeatures=>lvlFeatures.forEach(feature=>this._addEntrySourcesToFilter(feature)));
            }
        }
        );
    }

    async _pPopulateBoxOptions(opts) {
        opts.filters = [this._sourceFilter, this._miscFilter, this._optionsFilter, ];
        opts.isCompact = true;
    }

    isClassNaturallyDisplayed(values, cls) {
        return this._filterBox.toDisplay(values, ...this.constructor._getIsClassNaturallyDisplayedToDisplayParams(cls), );
    }

    static _getIsClassNaturallyDisplayedToDisplayParams(cls) {
        return [cls._fSources, cls._fMisc];
    }

    isAnySubclassDisplayed(values, cls) {
        return values[this._optionsFilter.header].isDisplayClassIfSubclassActive && (cls.subclasses || []).some(sc=>{
            if (this._filterBox.toDisplay(values, ...this.constructor._getIsSubclassDisplayedToDisplayParams(cls, sc), ))
                return true;

            return sc.otherSources?.length && sc.otherSources.some(src=>this._filterBox.toDisplay(values, ...this.constructor._getIsSubclassDisplayedToDisplayParams(cls, sc, src), ));
        }
        );
    }

    static _getIsSubclassDisplayedToDisplayParams(cls, sc, otherSourcesSource) {
        return [otherSourcesSource || sc.source, sc._fMisc, null, ];
    }

    isSubclassVisible(f, cls, sc) {
        if (this.filterBox.toDisplay(f, ...this.constructor._getIsSubclassVisibleToDisplayParams(cls, sc), ))
            return true;

        if (!sc.otherSources?.length)
            return false;

        return sc.otherSources.some(src=>this.filterBox.toDisplay(f, ...this.constructor._getIsSubclassVisibleToDisplayParams(cls, sc, src.source), ));
    }

    static _getIsSubclassVisibleToDisplayParams(cls, sc, otherSourcesSource) {
        return [otherSourcesSource || sc.source, sc._fMisc, null, ];
    }

    getActiveSource(values) {
        const sourceFilterValues = values[this._sourceFilter.header];
        if (!sourceFilterValues)
            return null;
        return Object.keys(sourceFilterValues).find(it=>this._sourceFilter.toDisplay(values, it));
    }

    toDisplay(values, it) {
        return this._filterBox.toDisplay(values, ...this._getToDisplayParams(values, it), );
    }

    _getToDisplayParams(values, cls) {
        return [this.isAnySubclassDisplayed(values, cls) ? cls._fSourceSubclass : (cls._fSources ?? cls.source), cls._fMisc, null, ];
    }
};

class PageFilterClasses extends PageFilterClassesBase {
    static _getClassSubclassLevelArray(it) {
        return it.classFeatures.map((_,i)=>i + 1);
    }

    constructor() {
        super();

        this._levelFilter = new RangeFilter({
            header: "Feature Level",
            min: 1,
            max: 20,
        });
    }

    get levelFilter() {
        return this._levelFilter;
    }

    static mutateForFilters(cls) {
        super.mutateForFilters(cls);

        cls._fLevelRange = this._getClassSubclassLevelArray(cls);
    }

    addToFilters(cls, isExcluded, opts) {
        super.addToFilters(cls, isExcluded, opts);

        if (isExcluded)
            return;

        this._levelFilter.addItem(cls._fLevelRange);
    }

    async _pPopulateBoxOptions(opts) {
        await super._pPopulateBoxOptions(opts);

        opts.filters = [this._sourceFilter, this._miscFilter, this._levelFilter, this._optionsFilter, ];
    }

    static _getIsClassNaturallyDisplayedToDisplayParams(cls) {
        return [cls._fSources, cls._fMisc, cls._fLevelRange];
    }

    static _getIsSubclassDisplayedToDisplayParams(cls, sc, otherSourcesSource) {
        return [otherSourcesSource || sc.source, sc._fMisc, cls._fLevelRange];
    }

    static _getIsSubclassVisibleToDisplayParams(cls, sc, otherSourcesSource) {
        return [otherSourcesSource || sc.source, sc._fMisc, cls._fLevelRange, null];
    }

    _getToDisplayParams(values, cls) {
        return [this.isAnySubclassDisplayed(values, cls) ? cls._fSourceSubclass : (cls._fSources ?? cls.source), cls._fMisc, cls._fLevelRange, ];
    }
};

class PageFilterClassesRaw extends PageFilterClassesBase {
    static _WALKER = null;
    static _IMPLS_SIDE_DATA = {};

    async _pPopulateBoxOptions(opts) {
        await super._pPopulateBoxOptions(opts);
        opts.isCompact = false;
    }


    /**
     * Add a class (and any attached class features and subclasses) to the filter
     * @param {Object} cls - the class object
     * @param {any} isExcluded - will return if true
     * @param {any} opts - only opts.subclassExclusions matters
     */
    addToFilters(cls, isExcluded, opts) {
        if (isExcluded)
            return;
        opts = opts || {};
        const subclassExclusions = opts.subclassExclusions || {};

        this._sourceFilter.addItem(cls.source);

        if (cls.fluff)
            cls.fluff.forEach(it=>this._addEntrySourcesToFilter(it));

        cls.classFeatures.forEach(feature=>feature.loadeds.forEach(ent=>this._addEntrySourcesToFilter(ent.entity)));

        cls.subclasses.forEach(sc=>{
            const isScExcluded = (subclassExclusions[sc.source] || {})[sc.name] || false;
            if (!isScExcluded) {
                this._sourceFilter.addItem(sc.source);
                sc.subclassFeatures.forEach(feature=> {
                    if(!feature.loadeds){console.error("Subclassfeature is lacking loadeds", feature);}
                    feature.loadeds.forEach(ent=>this._addEntrySourcesToFilter(ent.entity))
                });
            }
        }
        );
    }

    static async _pGetParentClass(sc) {
        let baseClass = (await DataUtil.class.loadRawJSON()).class.find(bc=>bc.name.toLowerCase() === sc.className.toLowerCase() && (bc.source.toLowerCase() || Parser.SRC_PHB) === sc.classSource.toLowerCase());

        baseClass = baseClass || await this._pGetParentClass_pPrerelease({sc});
        baseClass = baseClass || await this._pGetParentClass_pBrew({sc});

        return baseClass;
    }

    static async _pGetParentClass_pPrerelease({sc}) {
        await this._pGetParentClass_pPrereleaseBrew({
            sc,
            brewUtil: PrereleaseUtil
        });
    }

    static async _pGetParentClass_pBrew({sc}) {
        await this._pGetParentClass_pPrereleaseBrew({
            sc,
            brewUtil: BrewUtil2
        });
    }

    static async _pGetParentClass_pPrereleaseBrew({sc, brewUtil}) {
        const brew = await brewUtil.pGetBrewProcessed();
        return (brew.class || []).find(bc=>bc.name.toLowerCase() === sc.className.toLowerCase() && (bc.source.toLowerCase() || Parser.SRC_PHB) === sc.classSource.toLowerCase());
    }


    /**
     * Postload classes and subclasses. Matches subclasses to classes (and nests them inside, instead of letting them live in data.subclass)
     * Also sanity checks classes to make sure their properties are in order and that they are sorted by name.
     * Also adds 'loadeds' to class features and subclass features
     * @param {{class:any[], subclass:any[]}} data
     * @param {any} {...opts}={}
     * @returns {any} returns the data
     */
    static async pPostLoad(data, {...opts}={}) {
        data = MiscUtil.copy(data);

        await PrereleaseUtil.pGetBrewProcessed();
        await BrewUtil2.pGetBrewProcessed();

        if (!data.class) { data.class = []; } //Make sure this property is initalized

        //If data has subclasses listed, go through them and match each subclass to the corresponding class
        //We only want subclasses to exist nested within their parent classes
        if (data.subclass) {
            for (const sc of data.subclass) {
                if (!sc.className) { continue; } //The subclass must have a className listed
                sc.classSource = sc.classSource || Parser.SRC_PHB; //Default to PHB source if none is provided

                //Lets try to find a class that matches this subclass
                let cls = data.class.find(it=>
                    (it.name || "").toLowerCase() === sc.className.toLowerCase() //class name must match
                && (it.source || Parser.SRC_PHB).toLowerCase() === sc.classSource.toLowerCase()); //class source must match

                if (!cls) { //If we failed to get a match
                    cls = await this._pGetParentClass(sc); //Try to get a match another way
                    if (cls) {
                        cls = MiscUtil.copy(cls);
                        cls.subclasses = [];
                        data.class.push(cls);
                    }
                    else {
                        //Just create a stub class for now
                        cls = { name: sc.className, source: sc.classSource };
                        data.class.push(cls); //And add it to the data, why not
                    }
                }

                //Then push the subclass to the class's 'subclasses array', which we initialize here if it doesnt already exist
                (cls.subclasses = cls.subclasses || []).push(sc);
            }

            delete data.subclass; //When done, we also want to sipe data.subclass so that subclasses only exist nested inside their parent classes
        }

        //Make sure each class their properties sanity checked and in order
        data.class.forEach(cls=>{
            cls.source = cls.source || Parser.SRC_PHB;

            cls.subclasses = cls.subclasses || [];

            cls.subclasses.forEach(sc=>{
                sc.name = sc.name || "(Unnamed subclass)";
                sc.source = sc.source || cls.source;
                sc.className = sc.className || cls.name;
                sc.classSource = sc.classSource || cls.source || Parser.SRC_PHB;
            }
            );

            cls.subclasses.sort((a,b)=>SortUtil.ascSortLower(a.name, b.name) || SortUtil.ascSortLower(a.source || cls.source, b.source || cls.source));

            cls._cntStartingSkillChoices = (MiscUtil.get(cls, "startingProficiencies", "skills") || []).map(it=>it.choose ? (it.choose.count || 1) : 0).reduce((a,b)=>a + b, 0);

            cls._cntStartingSkillChoicesMutliclass = (MiscUtil.get(cls, "multiclassing", "proficienciesGained", "skills") || []).map(it=>it.choose ? (it.choose.count || 1) : 0).reduce((a,b)=>a + b, 0);
        }
        );
        //Then sort all the classes by name
        data.class.sort((a,b)=>SortUtil.ascSortLower(a.name, b.name) || SortUtil.ascSortLower(a.source, b.source));

        data.class.forEach(cls=>{
            cls.classFeatures = (cls.classFeatures || []).map(cf=>typeof cf === "string" ? { classFeature: cf } : cf);

            (cls.subclasses || []).forEach(sc=>{
                sc.subclassFeatures = (sc.subclassFeatures || []).map(cf=>typeof cf === "string" ? {
                    subclassFeature: cf
                } : cf);
            });
        });

        await this._pPreloadSideData();

        for (const cls of data.class) {
            //Load the 'loadeds' of all the class features
            await (cls.classFeatures || []).pSerialAwaitMap(cf=>this.pInitClassFeatureLoadeds({
                ...opts,
                classFeature: cf,
                className: cls.name
            }));

            //Then filter away all ignored class features
            if (cls.classFeatures) {cls.classFeatures = cls.classFeatures.filter(it=>!it.isIgnored);}

            //Moving on to subclasses, we will repeat the procedure for each subclass feature
            for (const sc of cls.subclasses || []) {
                await (sc.subclassFeatures || []).pSerialAwaitMap(scf=>this.pInitSubclassFeatureLoadeds({
                    ...opts,
                    subclassFeature: scf,
                    className: cls.name,
                    subclassName: sc.name
                }));

                if (sc.subclassFeatures)
                    sc.subclassFeatures = sc.subclassFeatures.filter(it=>!it.isIgnored);
            }
        }

        return data;
    }

    /**
     * Sets the 'loadeds' property of a classFeature, which contains information about choices that the class feature can make (expertise, etc)
     * Normally this information is not stored in the same .json as the classfeature itself, but is stored in some external .json file
     * @param {{classFeature:string}} classFeature
     * @param {string} className
     * @param {any} opts
     */
    static async pInitClassFeatureLoadeds({classFeature, className, ...opts}) {
        if (typeof classFeature !== "object")
            throw new Error(`Expected an object of the form {classFeature: "<UID>"}`);

        //Unpack the UID to get some strings
        const unpacked = DataUtil.class.unpackUidClassFeature(classFeature.classFeature);

        classFeature.hash = UrlUtil.URL_TO_HASH_BUILDER["classFeature"](unpacked);

        const {name, level, source} = unpacked;
        classFeature.name = name;
        classFeature.level = level;
        classFeature.source = source;

        //Now, the information about the class feature choices is usually stored in some other place, not within the classFeature itself
        //So we have to get that information from somewhere

        //Ask the cache to get us a raw classfeature from our source, and with our hash
        const entityRoot = await DataLoader.pCacheAndGet("raw_classFeature", classFeature.source, classFeature.hash, {
            isCopy: true //And make it a copy
        });

        const loadedRoot = {
            type: "classFeature",
            entity: entityRoot,
            page: "classFeature",
            source: classFeature.source,
            hash: classFeature.hash,
            className,
        };

        //Check if this class feature is on the ignore list
        const isIgnored = await this._pGetIgnoredAndApplySideData(entityRoot, "classFeature");
        if (isIgnored) {
            classFeature.isIgnored = true;
            return;
        }

        const {entityRoot: entityRootNxt, subLoadeds} = await this._pLoadSubEntries(this._getPostLoadWalker(), entityRoot, {
            ...opts,
            ancestorType: "classFeature",
            ancestorMeta: { _ancestorClassName: className, },
        }, );
        loadedRoot.entity = entityRootNxt;

        //Finally, set the loadeds
        classFeature.loadeds = [loadedRoot, ...subLoadeds];
    }

    static async pInitSubclassFeatureLoadeds({subclassFeature, className, subclassName, ...opts}) {
        if (typeof subclassFeature !== "object")
            throw new Error(`Expected an object of the form {subclassFeature: "<UID>"}`);

        const unpacked = DataUtil.class.unpackUidSubclassFeature(subclassFeature.subclassFeature);

        subclassFeature.hash = UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"](unpacked);

        const {name, level, source} = unpacked;
        subclassFeature.name = name;
        subclassFeature.level = level;
        subclassFeature.source = source;

        const entityRoot = await DataLoader.pCacheAndGet("raw_subclassFeature", subclassFeature.source, subclassFeature.hash, {
            isCopy: true
        });
        const loadedRoot = {
            type: "subclassFeature",
            entity: entityRoot,
            page: "subclassFeature",
            source: subclassFeature.source,
            hash: subclassFeature.hash,
            className,
            subclassName,
        };

        const isIgnored = await this._pGetIgnoredAndApplySideData(entityRoot, "subclassFeature");
        if (isIgnored) {
            subclassFeature.isIgnored = true;
            return;
        }

        if (entityRoot.isGainAtNextFeatureLevel) {
            subclassFeature.isGainAtNextFeatureLevel = true;
        }

        const {entityRoot: entityRootNxt, subLoadeds} = await this._pLoadSubEntries(this._getPostLoadWalker(), entityRoot, {
            ...opts,
            ancestorType: "subclassFeature",
            ancestorMeta: {
                _ancestorClassName: className,
                _ancestorSubclassName: subclassName,
            },
        }, );
        loadedRoot.entity = entityRootNxt;

        subclassFeature.loadeds = [loadedRoot, ...subLoadeds];
    }

    static async pInitFeatLoadeds({feat, raw, ...opts}) {
        return this._pInitGenericLoadeds({
            ...opts,
            ent: feat,
            prop: "feat",
            page: UrlUtil.PG_FEATS,
            propAncestorName: "_ancestorFeatName",
            raw,
        });
    }

    static async pInitOptionalFeatureLoadeds({optionalfeature, raw, ...opts}) {
        return this._pInitGenericLoadeds({
            ...opts,
            ent: optionalfeature,
            prop: "optionalfeature",
            page: UrlUtil.PG_OPT_FEATURES,
            propAncestorName: "_ancestorOptionalfeatureName",
            raw,
        });
    }

    static async pInitRewardLoadeds({reward, raw, ...opts}) {
        return this._pInitGenericLoadeds({
            ...opts,
            ent: reward,
            prop: "reward",
            page: UrlUtil.PG_REWARDS,
            propAncestorName: "_ancestorRewardName",
            raw,
        });
    }

    static async pInitCharCreationOptionLoadeds({charoption, raw, ...opts}) {
        return this._pInitGenericLoadeds({
            ...opts,
            ent: charoption,
            prop: "charoption",
            page: UrlUtil.PG_CHAR_CREATION_OPTIONS,
            propAncestorName: "_ancestorCharoptionName",
            raw,
        });
    }

    static async pInitVehicleUpgradeLoadeds({vehicleUpgrade, raw, ...opts}) {
        return this._pInitGenericLoadeds({
            ...opts,
            ent: vehicleUpgrade,
            prop: "vehicleUpgrade",
            page: UrlUtil.PG_VEHICLES,
            propAncestorName: "_ancestorVehicleUpgradeName",
            raw,
        });
    }

    static async _pInitGenericLoadeds({ent, prop, page, propAncestorName, raw, ...opts}) {
        if (typeof ent !== "object")
            throw new Error(`Expected an object of the form {${prop}: "<UID>"}`);

        const unpacked = DataUtil.generic.unpackUid(ent[prop]);

        ent.hash = UrlUtil.URL_TO_HASH_BUILDER[page](unpacked);

        const {name, source} = unpacked;
        ent.name = name;
        ent.source = source;

        const entityRoot = raw != null ? MiscUtil.copy(raw) : await DataLoader.pCacheAndGet(`raw_${prop}`, ent.source, ent.hash, {
            isCopy: true
        });
        const loadedRoot = {
            type: prop,
            entity: entityRoot,
            page,
            source: ent.source,
            hash: ent.hash,
        };

        const isIgnored = await this._pGetIgnoredAndApplySideData(entityRoot, prop);
        if (isIgnored) {
            ent.isIgnored = true;
            return;
        }

        const {entityRoot: entityRootNxt, subLoadeds} = await this._pLoadSubEntries(this._getPostLoadWalker(), entityRoot, {
            ...opts,
            ancestorType: prop,
            ancestorMeta: {
                [propAncestorName]: entityRoot.name,
            },
        }, );
        loadedRoot.entity = entityRootNxt;

        ent.loadeds = [loadedRoot, ...subLoadeds];
    }

    static async _pPreloadSideData() {
        await Promise.all(Object.values(PageFilterClassesRaw._IMPLS_SIDE_DATA).map(Impl=>Impl.pPreloadSideData()));
    }

    /**
     * @param {any} entity
     * @param {string} type
     * @returns {boolean}
     */
    static async _pGetIgnoredAndApplySideData(entity, type) {
        if (!PageFilterClassesRaw._IMPLS_SIDE_DATA[type])
            throw new Error(`Unhandled type "${type}"`);

        const sideData = await PageFilterClassesRaw._IMPLS_SIDE_DATA[type].pGetSideLoaded(entity, { isSilent: true });

        if (!sideData)
            return false;
        if (sideData.isIgnored)
            return true;

        if (sideData.entries)
            entity.entries = MiscUtil.copy(sideData.entries);
        if (sideData.entryData)
            entity.entryData = MiscUtil.copy(sideData.entryData);

        return false;
    }

    static async _pLoadSubEntries(walker, entityRoot, {ancestorType, ancestorMeta, ...opts}) {
        const out = [];

        const pRecurse = async(parent,toWalk)=>{
            const references = [];
            const path = [];

            toWalk = walker.walk(toWalk, {
                array: (arr)=>{
                    arr = arr.map(it=>this._pLoadSubEntries_getMappedWalkerArrayEntry({
                        ...opts,
                        it,
                        path,
                        references
                    })).filter(Boolean);
                    return arr;
                }
                ,
                preObject: (obj)=>{
                    if (obj.type === "options") {
                        const parentName = (path.last() || {}).name ?? parent.name;

                        if (obj.count != null) {
                            const optionSetId = CryptUtil.uid();
                            obj.entries.forEach(ent=>{
                                ent._optionsMeta = {
                                    setId: optionSetId,
                                    count: obj.count,
                                    name: parentName,
                                };
                            }
                            );
                        }

                        if (parentName) {
                            obj.entries.forEach(ent=>{
                                if (typeof ent !== "object")
                                    return;
                                ent._displayNamePrefix = `${parentName}: `;
                            }
                            );
                        }
                    }

                    if (obj.name)
                        path.push(obj);
                }
                ,
                postObject: (obj)=>{
                    if (obj.name)
                        path.pop();
                }
                ,
            }, );

            for (const ent of references) {
                const isRequiredOption = !!MiscUtil.get(ent, "data", "isRequiredOption");
                switch (ent.type) {
                case "refClassFeature":
                    {
                        const unpacked = DataUtil.class.unpackUidClassFeature(ent.classFeature);
                        const {source} = unpacked;
                        const hash = UrlUtil.URL_TO_HASH_BUILDER["classFeature"](unpacked);

                        let entity = await DataLoader.pCacheAndGet("raw_classFeature", source, hash, {
                            isCopy: true
                        });

                        if (!entity) {
                            this._handleReferenceError(`Failed to load "classFeature" reference "${ent.classFeature}" (not found)`);
                            continue;
                        }

                        if (toWalk.__prop === entity.__prop && UrlUtil.URL_TO_HASH_BUILDER["classFeature"](toWalk) === hash) {
                            this._handleReferenceError(`Failed to load "classFeature" reference "${ent.classFeature}" (circular reference)`);
                            continue;
                        }

                        const isIgnored = await this._pGetIgnoredAndApplySideData(entity, "classFeature");
                        if (isIgnored)
                            continue;

                        this.populateEntityTempData({
                            entity,
                            displayName: ent._displayNamePrefix ? `${ent._displayNamePrefix}${entity.name}` : null,
                            ...ancestorMeta,
                        });

                        out.push({
                            type: "classFeature",
                            entry: `{@classFeature ${ent.classFeature}}`,
                            entity,
                            optionsMeta: ent._optionsMeta,
                            page: "classFeature",
                            source,
                            hash,
                            isRequiredOption,
                        });

                        entity = await pRecurse(entity, entity.entries);

                        break;
                    }
                case "refSubclassFeature":
                    {
                        const unpacked = DataUtil.class.unpackUidSubclassFeature(ent.subclassFeature);
                        const {source} = unpacked;
                        const hash = UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"](unpacked);

                        let entity = await DataLoader.pCacheAndGet("raw_subclassFeature", source, hash, {
                            isCopy: true
                        });

                        if (!entity) {
                            this._handleReferenceError(`Failed to load "subclassFeature" reference "${ent.subclassFeature}" (not found)`);
                            continue;
                        }

                        if (toWalk.__prop === entity.__prop && UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"](toWalk) === hash) {
                            this._handleReferenceError(`Failed to load "subclassFeature" reference "${ent.subclassFeature}" (circular reference)`);
                            continue;
                        }

                        const isIgnored = await this._pGetIgnoredAndApplySideData(entity, "subclassFeature");
                        if (isIgnored)
                            continue;

                        this.populateEntityTempData({
                            entity,
                            displayName: ent._displayNamePrefix ? `${ent._displayNamePrefix}${entity.name}` : null,
                            ...ancestorMeta,
                        });

                        out.push({
                            type: "subclassFeature",
                            entry: `{@subclassFeature ${ent.subclassFeature}}`,
                            entity,
                            optionsMeta: ent._optionsMeta,
                            page: "subclassFeature",
                            source,
                            hash,
                            isRequiredOption,
                        });

                        entity = await pRecurse(entity, entity.entries);

                        break;
                    }
                case "refOptionalfeature":
                    {
                        const unpacked = DataUtil.generic.unpackUid(ent.optionalfeature, "optfeature");
                        const page = UrlUtil.PG_OPT_FEATURES;
                        const {source} = unpacked;
                        const hash = UrlUtil.URL_TO_HASH_BUILDER[page](unpacked);

                        const entity = await DataLoader.pCacheAndGet(page, source, hash, {
                            isCopy: true
                        });

                        if (!entity) {
                            this._handleReferenceError(`Failed to load "optfeature" reference "${ent.optionalfeature}" (not found)`);
                            continue;
                        }

                        if (toWalk.__prop === entity.__prop && UrlUtil.URL_TO_HASH_BUILDER[page](toWalk) === hash) {
                            this._handleReferenceError(`Failed to load "optfeature" reference "${ent.optionalfeature}" (circular reference)`);
                            continue;
                        }

                        const isIgnored = await this._pGetIgnoredAndApplySideData(entity, "optionalfeature");
                        if (isIgnored)
                            continue;

                        this.populateEntityTempData({
                            entity,
                            ancestorType,
                            displayName: ent._displayNamePrefix ? `${ent._displayNamePrefix}${entity.name}` : null,
                            ...ancestorMeta,
                            foundrySystem: {
                                requirements: entityRoot.className ? `${entityRoot.className} ${entityRoot.level}${entityRoot.subclassShortName ? ` (${entityRoot.subclassShortName})` : ""}` : null,
                            },
                        });

                        out.push({
                            type: "optionalfeature",
                            entry: `{@optfeature ${ent.optionalfeature}}`,
                            entity,
                            optionsMeta: ent._optionsMeta,
                            page,
                            source,
                            hash,
                            isRequiredOption,
                        });

                        break;
                    }
                default:
                    throw new Error(`Unhandled type "${ent.type}"`);
                }
            }

            return toWalk;
        }
        ;

        if (entityRoot.entries) //entityRoot.entryData is already set by this point
            entityRoot.entries = await pRecurse(entityRoot, entityRoot.entries);

        return {
            entityRoot,
            subLoadeds: out
        };
    }

    static _pLoadSubEntries_getMappedWalkerArrayEntry({it, path, references, ...opts}) {
        if (it.type !== "refClassFeature" && it.type !== "refSubclassFeature" && it.type !== "refOptionalfeature")
            return it;

        it.parentName = (path.last() || {}).name;
        references.push(it);

        return null;
    }

    static populateEntityTempData({entity, ancestorType, displayName, foundrySystem, ...others}, ) {
        if (ancestorType)
            entity._ancestorType = ancestorType;
        if (displayName)
            entity._displayName = displayName;
        if (foundrySystem)
            entity._foundrySystem = foundrySystem;
        Object.assign(entity, {
            ...others
        });
    }

    static _handleReferenceError(msg) {
        JqueryUtil.doToast({
            type: "danger",
            content: msg
        });
    }

    static _getPostLoadWalker() {
        PageFilterClassesRaw._WALKER = PageFilterClassesRaw._WALKER || MiscUtil.getWalker({
            keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
            isDepthFirst: true,
        });
        return PageFilterClassesRaw._WALKER;
    }

    static setImplSideData(prop, Impl) {
        PageFilterClassesRaw._IMPLS_SIDE_DATA[prop] = Impl;
    }
};

class PageFilterClassesFoundry extends PageFilterClassesRaw {
    static _handleReferenceError(msg) {
        console.error(...LGT, msg);
        ui.notifications.error(msg);
    }

    static _pLoadSubEntries_getMappedWalkerArrayEntry({it, path, references, actor, isIgnoredLookup, ...opts}) {
        const out = super._pLoadSubEntries_getMappedWalkerArrayEntry({
            it,
            path,
            references,
            actor,
            ...opts
        });
        if (out != null)
            return out;

        const isIgnored = this._pLoadSubEntries_getMappedWalkerArrayEntry_isIgnored({
            it,
            isIgnoredLookup
        });
        if (isIgnored)
            return null;

        const meta = this._pLoadSubEntries_getMappedWalkerArrayEntry_getMeta({
            it
        });
        const {name, source} = meta;

        const ident = this._pLoadSubEntries_getMappedWalkerArrayEntry_getPageSourceHash({
            it
        });
        const b64Ident = btoa(encodeURIComponent(JSON.stringify(ident)));

        return {
            type: "wrapper",
            wrapped: actor ? `@UUID[Actor.${actor.id}.Item.temp-${SharedConsts.MODULE_ID_FAKE}-${b64Ident}]{${name}}` : `@UUID[Item.temp-${SharedConsts.MODULE_ID_FAKE}-${b64Ident}]{${name}}`,
            source,
            data: {
                isFvttSyntheticFeatureLink: true,
            },
        };
    }

    static _pLoadSubEntries_getMappedWalkerArrayEntry_getMeta({it}) {
        switch (it.type) {
        case "refClassFeature":
            return DataUtil.class.unpackUidClassFeature(it.classFeature);
        case "refSubclassFeature":
            return DataUtil.class.unpackUidSubclassFeature(it.subclassFeature);
        case "refOptionalfeature":
            return DataUtil.proxy.unpackUid("optionalfeature", it.optionalfeature, "optfeature");
        default:
            throw new Error(`Unhandled reference type "${it.type}"`);
        }
    }

    static _pLoadSubEntries_getMappedWalkerArrayEntry_getPageSourceHash({it}) {
        let page;
        let source;
        let hash;
        switch (it.type) {
        case "refClassFeature":
            {
                const meta = DataUtil.class.unpackUidClassFeature(it.classFeature);
                page = "classFeature";
                hash = UrlUtil.URL_TO_HASH_BUILDER[page](meta);
                source = meta.source;
                break;
            }

        case "refSubclassFeature":
            {
                const meta = DataUtil.class.unpackUidSubclassFeature(it.subclassFeature);
                page = "subclassFeature";
                hash = UrlUtil.URL_TO_HASH_BUILDER[page](meta);
                source = meta.source;
                break;
            }

        case "refOptionalfeature":
            {
                const meta = DataUtil.proxy.unpackUid("optionalfeature", it.optionalfeature, "optfeature");
                page = UrlUtil.PG_OPT_FEATURES;
                hash = UrlUtil.URL_TO_HASH_BUILDER[page](meta);
                source = meta.source;
                break;
            }

        default:
            throw new Error(`Unhandled reference type "${it.type}"`);
        }

        return {
            page,
            source,
            hash
        };
    }

    static _pLoadSubEntries_getMappedWalkerArrayEntry_isIgnored({it, isIgnoredLookup}) {
        if (!isIgnoredLookup)
            return false;

        switch (it.type) {
        case "refClassFeature":
            return isIgnoredLookup[(it.classFeature || "").toLowerCase()];
        case "refSubclassFeature":
            return isIgnoredLookup[(it.subclassFeature || "").toLowerCase()];
        default:
            return false;
        }
    }
}
//#endregion

//#region PageFilterRaces
class PageFilterRaces extends PageFilter {
    

    constructor() {
        super();

        //Create sub-filters
        //sourcefilter is created by super

        this._sizeFilter = new Filter({
            header: "Size",
            displayFn: Parser.sizeAbvToFull,
            itemSortFn: PageFilterRaces.filterAscSortSize
        });
        this._asiFilter = new AbilityScoreFilter({
            header: "Ability Scores (Including Subrace)"
        });
        this._baseRaceFilter = new Filter({
            header: "Base Race"
        });
        this._speedFilter = new Filter({
            header: "Speed",
            items: ["Climb", "Fly", "Swim", "Walk (Fast)", "Walk", "Walk (Slow)"]
        });
        this._traitFilter = new Filter({
            header: "Traits",
            items: ["Amphibious", "Armor Proficiency", "Blindsight", "Darkvision", "Superior Darkvision", "Dragonmark", "Feat", "Improved Resting", "Monstrous Race", "Natural Armor", "Natural Weapon", "NPC Race", "Powerful Build", "Skill Proficiency", "Spellcasting", "Sunlight Sensitivity", "Tool Proficiency", "Uncommon Race", "Weapon Proficiency", ],
            deselFn: (it)=>{
                return it === "NPC Race";
            }
            ,
        });
        this._vulnerableFilter = FilterCommon.getDamageVulnerableFilter();
        this._resistFilter = FilterCommon.getDamageResistFilter();
        this._immuneFilter = FilterCommon.getDamageImmuneFilter();
        this._defenceFilter = new MultiFilter({
            header: "Damage",
            filters: [this._vulnerableFilter, this._resistFilter, this._immuneFilter]
        });
        this._conditionImmuneFilter = FilterCommon.getConditionImmuneFilter();
        this._languageFilter = new Filter({
            header: "Languages",
            items: ["Abyssal", "Celestial", "Choose", "Common", "Draconic", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Infernal", "Orc", "Other", "Primordial", "Sylvan", "Undercommon", ],
            umbrellaItems: ["Choose"],
        });
        this._creatureTypeFilter = new Filter({
            header: "Creature Type",
            items: Parser.MON_TYPES,
            displayFn: StrUtil.toTitleCase,
            itemSortFn: SortUtil.ascSortLower,
        });
        this._ageFilter = new RangeFilter({
            header: "Adult Age",
            isRequireFullRangeMatch: true,
            isSparse: true,
            displayFn: it=>`${it} y.o.`,
            displayFnTooltip: it=>`${it} year${it === 1 ? "" : "s"} old`,
        });
        this._miscFilter = new Filter({
            header: "Miscellaneous",
            items: ["Base Race", "Key Race", "Lineage", "Modified Copy", "Reprinted", "SRD", "Basic Rules", "Has Images", "Has Info"],
            isMiscFilter: true,
        });
    }

    static mutateForFilters(r) {
        r._fSize = r.size ? [...r.size] : [];
        if (r._fSize.length > 1)
            r._fSize.push("V");
        r._fSpeed = r.speed ? r.speed.walk ? [r.speed.climb ? "Climb" : null, r.speed.fly ? "Fly" : null, r.speed.swim ? "Swim" : null, PageFilterRaces.getSpeedRating(r.speed.walk)].filter(it=>it) : [PageFilterRaces.getSpeedRating(r.speed)] : [];
        r._fTraits = [r.darkvision === 120 ? "Superior Darkvision" : r.darkvision ? "Darkvision" : null, r.blindsight ? "Blindsight" : null, r.skillProficiencies ? "Skill Proficiency" : null, r.toolProficiencies ? "Tool Proficiency" : null, r.feats ? "Feat" : null, r.additionalSpells ? "Spellcasting" : null, r.armorProficiencies ? "Armor Proficiency" : null, r.weaponProficiencies ? "Weapon Proficiency" : null, ].filter(it=>it);
        r._fTraits.push(...(r.traitTags || []));
        r._fSources = SourceFilter.getCompleteFilterSources(r);
        r._fLangs = PageFilterRaces.getLanguageProficiencyTags(r.languageProficiencies);
        r._fCreatureTypes = r.creatureTypes ? r.creatureTypes.map(it=>it.choose || it).flat() : ["humanoid"];
        r._fMisc = [];
        if (r._isBaseRace)
            r._fMisc.push("Base Race");
        if (r._isBaseRace || !r._isSubRace)
            r._fMisc.push("Key Race");
        if (r._isCopy)
            r._fMisc.push("Modified Copy");
        if (r.srd)
            r._fMisc.push("SRD");
        if (r.basicRules)
            r._fMisc.push("Basic Rules");
        if (r.hasFluff || r.fluff?.entries)
            r._fMisc.push("Has Info");
        if (r.hasFluffImages || r.fluff?.images)
            r._fMisc.push("Has Images");
        if (r.lineage)
            r._fMisc.push("Lineage");
        if (this._isReprinted({
            reprintedAs: r.reprintedAs,
            tag: "race",
            prop: "race",
            page: UrlUtil.PG_RACES
        }))
            r._fMisc.push("Reprinted");

        const ability = r.ability ? Renderer.getAbilityData(r.ability, {
            isOnlyShort: true,
            isCurrentLineage: r.lineage === "VRGR"
        }) : {
            asTextShort: "None"
        };
        r._slAbility = ability.asTextShort;

        if (r.age?.mature != null && r.age?.max != null)
            r._fAge = [r.age.mature, r.age.max];
        else if (r.age?.mature != null)
            r._fAge = r.age.mature;
        else if (r.age?.max != null)
            r._fAge = r.age.max;

        FilterCommon.mutateForFilters_damageVulnResImmune_player(r);
        FilterCommon.mutateForFilters_conditionImmune_player(r);
    }

    /**
     * Add an race's filterable tags to the sub-filters (source filter, size filter, language filter, etc)
     * @param {any} r A race object
     * @param {Boolean} isExcluded if this is true, we return immediately
     */
    addToFilters(r, isExcluded) {
        if (isExcluded)
            return;

        this._sourceFilter.addItem(r._fSources);
        this._sizeFilter.addItem(r._fSize);
        this._asiFilter.addItem(r.ability);
        this._baseRaceFilter.addItem(r._baseName);
        this._creatureTypeFilter.addItem(r._fCreatureTypes);
        this._traitFilter.addItem(r._fTraits);
        this._vulnerableFilter.addItem(r._fVuln);
        this._resistFilter.addItem(r._fRes);
        this._immuneFilter.addItem(r._fImm);
        this._conditionImmuneFilter.addItem(r._fCondImm);
        this._ageFilter.addItem(r._fAge);
        this._languageFilter.addItem(r._fLangs);
    }

    async _pPopulateBoxOptions(opts) {
        opts.filters = [this._sourceFilter, this._asiFilter, this._sizeFilter, this._speedFilter, this._traitFilter, this._defenceFilter, this._conditionImmuneFilter, this._languageFilter, this._baseRaceFilter, this._creatureTypeFilter, this._miscFilter, this._ageFilter, ];
    }

    toDisplay(values, r) {
        return this._filterBox.toDisplay(values, r._fSources, r.ability, r._fSize, r._fSpeed, r._fTraits, [r._fVuln, r._fRes, r._fImm, ], r._fCondImm, r._fLangs, r._baseName, r._fCreatureTypes, r._fMisc, r._fAge, );
    }

    static getListAliases(race) {
        return (race.alias || []).map(it=>{
            const invertedName = PageFilterRaces.getInvertedName(it);
            return [`"${it}"`, invertedName ? `"${invertedName}"` : false].filter(Boolean);
        }
        ).flat().join(",");
    }

    static getInvertedName(name) {
        const bracketMatch = /^(.*?) \((.*?)\)$/.exec(name);
        return bracketMatch ? `${bracketMatch[2]} ${bracketMatch[1]}` : null;
    }

    static getLanguageProficiencyTags(lProfs) {
        if (!lProfs)
            return [];

        const outSet = new Set();
        lProfs.forEach(lProfGroup=>{
            Object.keys(lProfGroup).forEach(k=>{
                if (!["choose", "any", "anyStandard", "anyExotic"].includes(k))
                    outSet.add(k.toTitleCase());
                else
                    outSet.add("Choose");
            }
            );
        }
        );

        return [...outSet];
    }

    static getSpeedRating(speed) {
        return speed > 30 ? "Walk (Fast)" : speed < 30 ? "Walk (Slow)" : "Walk";
    }

    static filterAscSortSize(a, b) {
        a = a.item;
        b = b.item;

        return SortUtil.ascSort(toNum(a), toNum(b));

        function toNum(size) {
            switch (size) {
            case "M":
                return 0;
            case "S":
                return -1;
            case "V":
                return 1;
            }
        }
    }
};
//#endregion

//#region PageFilterBackgrounds
let PageFilterBackgrounds$1 = class PageFilterBackgrounds extends PageFilter {
    static _getToolDisplayText(tool) {
        if (tool === "anyTool")
            return "Any Tool";
        if (tool === "anyArtisansTool")
            return "Any Artisan's Tool";
        if (tool === "anyMusicalInstrument")
            return "Any Musical Instrument";
        return tool.toTitleCase();
    }

    constructor() {
        super();

        this._skillFilter = new Filter({
            header: "Skill Proficiencies",
            displayFn: StrUtil.toTitleCase
        });
        this._toolFilter = new Filter({
            header: "Tool Proficiencies",
            displayFn: PageFilterBackgrounds$1._getToolDisplayText.bind(PageFilterBackgrounds$1)
        });
        this._languageFilter = new Filter({
            header: "Language Proficiencies",
            displayFn: it=>it === "anyStandard" ? "Any Standard" : it === "anyExotic" ? "Any Exotic" : StrUtil.toTitleCase(it),
        });
        this._asiFilter = new AbilityScoreFilter({
            header: "Ability Scores"
        });
        this._otherBenefitsFilter = new Filter({
            header: "Other Benefits"
        });
        this._miscFilter = new Filter({
            header: "Miscellaneous",
            items: ["Has Info", "Has Images", "SRD", "Basic Rules"],
            isMiscFilter: true
        });
    }

    static mutateForFilters(bg) {
        bg._fSources = SourceFilter.getCompleteFilterSources(bg);

        const {summary: skillDisplay, collection: skills} = Renderer.generic.getSkillSummary({
            skillProfs: bg.skillProficiencies,
            skillToolLanguageProfs: bg.skillToolLanguageProficiencies,
            isShort: true,
        });
        bg._fSkills = skills;

        const {collection: tools} = Renderer.generic.getToolSummary({
            toolProfs: bg.toolProficiencies,
            skillToolLanguageProfs: bg.skillToolLanguageProficiencies,
            isShort: true,
        });
        bg._fTools = tools;

        const {collection: languages} = Renderer.generic.getLanguageSummary({
            languageProfs: bg.languageProficiencies,
            skillToolLanguageProfs: bg.skillToolLanguageProficiencies,
            isShort: true,
        });
        bg._fLangs = languages;

        bg._fMisc = [];
        if (bg.srd)
            bg._fMisc.push("SRD");
        if (bg.basicRules)
            bg._fMisc.push("Basic Rules");
        if (bg.hasFluff || bg.fluff?.entries)
            bg._fMisc.push("Has Info");
        if (bg.hasFluffImages || bg.fluff?.images)
            bg._fMisc.push("Has Images");
        bg._fOtherBenifits = [];
        if (bg.feats)
            bg._fOtherBenifits.push("Feat");
        if (bg.additionalSpells)
            bg._fOtherBenifits.push("Additional Spells");
        if (bg.armorProficiencies)
            bg._fOtherBenifits.push("Armor Proficiencies");
        if (bg.weaponProficiencies)
            bg._fOtherBenifits.push("Weapon Proficiencies");
        bg._skillDisplay = skillDisplay;
    }

    addToFilters(bg, isExcluded) {
        if (isExcluded)
            return;

        this._sourceFilter.addItem(bg._fSources);
        this._skillFilter.addItem(bg._fSkills);
        this._toolFilter.addItem(bg._fTools);
        this._languageFilter.addItem(bg._fLangs);
        this._asiFilter.addItem(bg.ability);
        this._otherBenefitsFilter.addItem(bg._fOtherBenifits);
    }

    async _pPopulateBoxOptions(opts) {
        opts.filters = [this._sourceFilter, this._skillFilter, this._toolFilter, this._languageFilter, this._asiFilter, this._otherBenefitsFilter, this._miscFilter, ];
    }

    toDisplay(values, bg) {
        return this._filterBox.toDisplay(values, bg._fSources, bg._fSkills, bg._fTools, bg._fLangs, bg.ability, bg._fOtherBenifits, bg._fMisc, );
    }
}
;
//#endregion

//#region PageFilterSpells
class PageFilterSpells extends PageFilter {
    static _META_ADD_CONC = "Concentration";
    static _META_ADD_V = "Verbal";
    static _META_ADD_S = "Somatic";
    static _META_ADD_M = "Material";
    static _META_ADD_R = "Royalty";
    static _META_ADD_M_COST = "Material with Cost";
    static _META_ADD_M_CONSUMED = "Material is Consumed";
    static _META_ADD_M_CONSUMED_OPTIONAL = "Material is Optionally Consumed";

    static F_RNG_POINT = "Point";
    static F_RNG_SELF_AREA = "Self (Area)";
    static F_RNG_SELF = "Self";
    static F_RNG_TOUCH = "Touch";
    static F_RNG_SPECIAL = "Special";

    static _META_FILTER_BASE_ITEMS = [this._META_ADD_CONC, this._META_ADD_V, this._META_ADD_S, this._META_ADD_M, this._META_ADD_R, this._META_ADD_M_COST, this._META_ADD_M_CONSUMED, this._META_ADD_M_CONSUMED_OPTIONAL, ...Object.keys(Parser.SP_MISC_TAG_TO_FULL), ];

    static INCHES_PER_FOOT = 12;
    static FEET_PER_YARD = 3;
    static FEET_PER_MILE = 5280;

    static sortSpells(a, b, o) {
        switch (o.sortBy) {
        case "name":
            return SortUtil.compareListNames(a, b);
        case "source":
        case "level":
        case "school":
        case "concentration":
        case "ritual":
            return SortUtil.ascSort(a.values[o.sortBy], b.values[o.sortBy]) || SortUtil.compareListNames(a, b);
        case "time":
            return SortUtil.ascSort(a.values.normalisedTime, b.values.normalisedTime) || SortUtil.compareListNames(a, b);
        case "range":
            return SortUtil.ascSort(a.values.normalisedRange, b.values.normalisedRange) || SortUtil.compareListNames(a, b);
        }
    }

    static sortMetaFilter(a, b) {
        const ixA = PageFilterSpells._META_FILTER_BASE_ITEMS.indexOf(a.item);
        const ixB = PageFilterSpells._META_FILTER_BASE_ITEMS.indexOf(b.item);

        if (~ixA && ~ixB)
            return ixA - ixB;
        if (~ixA)
            return -1;
        if (~ixB)
            return 1;
        return SortUtil.ascSortLower(a, b);
    }

    static getFilterAbilitySave(ability) {
        return `${ability.uppercaseFirst()} Save`;
    }
    static getFilterAbilityCheck(ability) {
        return `${ability.uppercaseFirst()} Check`;
    }

    static getMetaFilterObj(s) {
        const out = [];
        if (s.meta) {
            Object.entries(s.meta).filter(([_,v])=>v).sort(SortUtil.ascSort).forEach(([k])=>out.push(k.toTitleCase()));
        }
        if (s.duration.filter(d=>d.concentration).length) {
            out.push(PageFilterSpells._META_ADD_CONC);
            s._isConc = true;
        } else
            s._isConc = false;
        if (s.components && s.components.v)
            out.push(PageFilterSpells._META_ADD_V);
        if (s.components && s.components.s)
            out.push(PageFilterSpells._META_ADD_S);
        if (s.components && s.components.m)
            out.push(PageFilterSpells._META_ADD_M);
        if (s.components && s.components.r)
            out.push(PageFilterSpells._META_ADD_R);
        if (s.components && s.components.m && s.components.m.cost)
            out.push(PageFilterSpells._META_ADD_M_COST);
        if (s.components && s.components.m && s.components.m.consume) {
            if (s.components.m.consume === "optional")
                out.push(PageFilterSpells._META_ADD_M_CONSUMED_OPTIONAL);
            else
                out.push(PageFilterSpells._META_ADD_M_CONSUMED);
        }
        if (s.miscTags)
            out.push(...s.miscTags);
        if ((!s.miscTags || (s.miscTags && !s.miscTags.includes("PRM"))) && s.duration.filter(it=>it.type === "permanent").length)
            out.push("PRM");
        if ((!s.miscTags || (s.miscTags && !s.miscTags.includes("SCL"))) && s.entriesHigherLevel)
            out.push("SCL");
        if (s.srd)
            out.push("SRD");
        if (s.basicRules)
            out.push("Basic Rules");
        if (s.hasFluff || s.fluff?.entries)
            out.push("Has Info");
        if (s.hasFluffImages || s.fluff?.images)
            out.push("Has Images");
        return out;
    }

    static getFilterDuration(spell) {
        const fDur = spell.duration[0] || {
            type: "special"
        };
        switch (fDur.type) {
        case "instant":
            return "Instant";
        case "timed":
            {
                if (!fDur.duration)
                    return "Special";
                switch (fDur.duration.type) {
                case "turn":
                case "round":
                    return "1 Round";

                case "minute":
                    {
                        const amt = fDur.duration.amount || 0;
                        if (amt <= 1)
                            return "1 Minute";
                        if (amt <= 10)
                            return "10 Minutes";
                        if (amt <= 60)
                            return "1 Hour";
                        if (amt <= 8 * 60)
                            return "8 Hours";
                        return "24+ Hours";
                    }

                case "hour":
                    {
                        const amt = fDur.duration.amount || 0;
                        if (amt <= 1)
                            return "1 Hour";
                        if (amt <= 8)
                            return "8 Hours";
                        return "24+ Hours";
                    }

                case "week":
                case "day":
                case "year":
                    return "24+ Hours";
                default:
                    return "Special";
                }
            }
        case "permanent":
            return "Permanent";
        case "special":
        default:
            return "Special";
        }
    }

    static getNormalisedTime(time) {
        const firstTime = time[0];
        let multiplier = 1;
        let offset = 0;
        switch (firstTime.unit) {
        case Parser.SP_TM_B_ACTION:
            offset = 1;
            break;
        case Parser.SP_TM_REACTION:
            offset = 2;
            break;
        case Parser.SP_TM_ROUND:
            multiplier = 6;
            break;
        case Parser.SP_TM_MINS:
            multiplier = 60;
            break;
        case Parser.SP_TM_HRS:
            multiplier = 3600;
            break;
        }
        if (time.length > 1)
            offset += 0.5;
        return (multiplier * firstTime.number) + offset;
    }

    static getNormalisedRange(range) {
        const state = {
            multiplier: 1,
            distance: 0,
            offset: 0,
        };

        switch (range.type) {
        case Parser.RNG_SPECIAL:
            return 1000000000;
        case Parser.RNG_POINT:
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_LINE:
            state.offset = 1;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_CONE:
            state.offset = 2;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_RADIUS:
            state.offset = 3;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_HEMISPHERE:
            state.offset = 4;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_SPHERE:
            state.offset = 5;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_CYLINDER:
            state.offset = 6;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_CUBE:
            state.offset = 7;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        }

        return (state.multiplier * state.distance) + state.offset;
    }

    static _getNormalisedRange_getAdjustedForDistance({range, state}) {
        const dist = range.distance;
        switch (dist.type) {
        case Parser.UNT_FEET:
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT;
            state.distance = dist.amount;
            break;
        case Parser.UNT_YARDS:
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT * PageFilterSpells.FEET_PER_YARD;
            state.distance = dist.amount;
            break;
        case Parser.UNT_MILES:
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT * PageFilterSpells.FEET_PER_MILE;
            state.distance = dist.amount;
            break;
        case Parser.RNG_SELF:
            state.distance = 0;
            break;
        case Parser.RNG_TOUCH:
            state.distance = 1;
            break;
        case Parser.RNG_SIGHT:
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT * PageFilterSpells.FEET_PER_MILE;
            state.distance = 12;
            break;
        case Parser.RNG_UNLIMITED_SAME_PLANE:
            state.distance = 900000000;
            break;
        case Parser.RNG_UNLIMITED:
            state.distance = 900000001;
            break;
        default:
            {
                this._getNormalisedRange_getAdjustedForDistance_prereleaseBrew({
                    range,
                    state,
                    brewUtil: PrereleaseUtil
                }) || this._getNormalisedRange_getAdjustedForDistance_prereleaseBrew({
                    range,
                    state,
                    brewUtil: BrewUtil2
                });
            }
        }
    }

    static _getNormalisedRange_getAdjustedForDistance_prereleaseBrew({range, state, brewUtil}) {
        const dist = range.distance;
        const fromBrew = brewUtil.getMetaLookup("spellDistanceUnits")?.[dist.type];
        if (!fromBrew)
            return false;

        const ftPerUnit = fromBrew.feetPerUnit;
        if (ftPerUnit != null) {
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT * ftPerUnit;
            state.distance = dist.amount;
        } else {
            state.distance = 910000000;
        }

        return true;
    }

    static getRangeType(range) {
        switch (range.type) {
        case Parser.RNG_SPECIAL:
            return PageFilterSpells.F_RNG_SPECIAL;
        case Parser.RNG_POINT:
            switch (range.distance.type) {
            case Parser.RNG_SELF:
                return PageFilterSpells.F_RNG_SELF;
            case Parser.RNG_TOUCH:
                return PageFilterSpells.F_RNG_TOUCH;
            default:
                return PageFilterSpells.F_RNG_POINT;
            }
        case Parser.RNG_LINE:
        case Parser.RNG_CONE:
        case Parser.RNG_RADIUS:
        case Parser.RNG_HEMISPHERE:
        case Parser.RNG_SPHERE:
        case Parser.RNG_CYLINDER:
        case Parser.RNG_CUBE:
            return PageFilterSpells.F_RNG_SELF_AREA;
        }
    }

    static getTblTimeStr(time) {
        return (time.number === 1 && Parser.SP_TIME_SINGLETONS.includes(time.unit)) ? `${time.unit.uppercaseFirst()}` : `${time.number ? `${time.number} ` : ""}${Parser.spTimeUnitToShort(time.unit).uppercaseFirst()}`;
    }

    static getTblLevelStr(spell) {
        return `${Parser.spLevelToFull(spell.level)}${spell.meta && spell.meta.ritual ? " (rit.)" : ""}${spell.meta && spell.meta.technomagic ? " (tec.)" : ""}`;
    }

    static getRaceFilterItem(r) {
        const addSuffix = (r.source === Parser.SRC_DMG || SourceUtil.isNonstandardSource(r.source || Parser.SRC_PHB) || (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(r.source || Parser.SRC_PHB)) || (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(r.source || Parser.SRC_PHB))) && !r.name.includes(Parser.sourceJsonToAbv(r.source));
        const name = `${r.name}${addSuffix ? ` (${Parser.sourceJsonToAbv(r.source)})` : ""}`;
        const opts = {
            item: name,
            userData: {
                group: SourceUtil.getFilterGroup(r.source || Parser.SRC_PHB),
            },
        };
        if (r.baseName)
            opts.nest = r.baseName;
        else
            opts.nest = "(No Subraces)";
        return new FilterItem(opts);
    }

    constructor() {
        super();

        this._classFilter = new Filter({
            header: "Class",
            groupFn: it=>it.userData.group,
        });
        this._subclassFilter = new Filter({
            header: "Subclass",
            nests: {},
            groupFn: it=>it.userData.group,
        });
        this._levelFilter = new Filter({
            header: "Level",
            items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ],
            displayFn: (lvl)=>Parser.spLevelToFullLevelText(lvl, {
                isPluralCantrips: false
            }),
        });
        this._variantClassFilter = new VariantClassFilter();
        this._classAndSubclassFilter = new MultiFilterClasses({
            classFilter: this._classFilter,
            subclassFilter: this._subclassFilter,
            variantClassFilter: this._variantClassFilter,
        });
        this._raceFilter = new Filter({
            header: "Race",
            nests: {},
            groupFn: it=>it.userData.group,
        });
        this._backgroundFilter = new SearchableFilter({
            header: "Background"
        });
        this._featFilter = new SearchableFilter({
            header: "Feat"
        });
        this._optionalfeaturesFilter = new SearchableFilter({
            header: "Other Option/Feature"
        });
        this._metaFilter = new Filter({
            header: "Components & Miscellaneous",
            items: [...PageFilterSpells._META_FILTER_BASE_ITEMS, "Ritual", "SRD", "Basic Rules", "Has Images", "Has Token"],
            itemSortFn: PageFilterSpells.sortMetaFilter,
            isMiscFilter: true,
            displayFn: it=>Parser.spMiscTagToFull(it),
        });
        this._groupFilter = new Filter({
            header: "Group"
        });
        this._schoolFilter = new Filter({
            header: "School",
            items: [...Parser.SKL_ABVS],
            displayFn: Parser.spSchoolAbvToFull,
            itemSortFn: (a,b)=>SortUtil.ascSortLower(Parser.spSchoolAbvToFull(a.item), Parser.spSchoolAbvToFull(b.item)),
        });
        this._subSchoolFilter = new Filter({
            header: "Subschool",
            items: [],
            displayFn: it=>Parser.spSchoolAbvToFull(it).toTitleCase(),
            itemSortFn: (a,b)=>SortUtil.ascSortLower(Parser.spSchoolAbvToFull(a.item), Parser.spSchoolAbvToFull(b.item)),
        });
        this._damageFilter = new Filter({
            header: "Damage Type",
            items: MiscUtil.copy(Parser.DMG_TYPES),
            displayFn: StrUtil.uppercaseFirst,
        });
        this._conditionFilter = new Filter({
            header: "Conditions Inflicted",
            items: [...Parser.CONDITIONS],
            displayFn: uid=>uid.split("|")[0].toTitleCase(),
        });
        this._spellAttackFilter = new Filter({
            header: "Spell Attack",
            items: ["M", "R", "O"],
            displayFn: Parser.spAttackTypeToFull,
            itemSortFn: null,
        });
        this._saveFilter = new Filter({
            header: "Saving Throw",
            items: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
            displayFn: PageFilterSpells.getFilterAbilitySave,
            itemSortFn: null,
        });
        this._checkFilter = new Filter({
            header: "Ability Check",
            items: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
            displayFn: PageFilterSpells.getFilterAbilityCheck,
            itemSortFn: null,
        });
        this._timeFilter = new Filter({
            header: "Cast Time",
            items: [Parser.SP_TM_ACTION, Parser.SP_TM_B_ACTION, Parser.SP_TM_REACTION, Parser.SP_TM_ROUND, Parser.SP_TM_MINS, Parser.SP_TM_HRS, ],
            displayFn: Parser.spTimeUnitToFull,
            itemSortFn: null,
        });
        this._durationFilter = new RangeFilter({
            header: "Duration",
            isLabelled: true,
            labelSortFn: null,
            labels: ["Instant", "1 Round", "1 Minute", "10 Minutes", "1 Hour", "8 Hours", "24+ Hours", "Permanent", "Special"],
        });
        this._rangeFilter = new Filter({
            header: "Range",
            items: [PageFilterSpells.F_RNG_SELF, PageFilterSpells.F_RNG_TOUCH, PageFilterSpells.F_RNG_POINT, PageFilterSpells.F_RNG_SELF_AREA, PageFilterSpells.F_RNG_SPECIAL, ],
            itemSortFn: null,
        });
        this._areaTypeFilter = new Filter({
            header: "Area Style",
            items: ["ST", "MT", "R", "N", "C", "Y", "H", "L", "S", "Q", "W"],
            displayFn: Parser.spAreaTypeToFull,
            itemSortFn: null,
        });
        this._affectsCreatureTypeFilter = new Filter({
            header: "Affects Creature Types",
            items: [...Parser.MON_TYPES],
            displayFn: StrUtil.toTitleCase,
        });
    }

    static mutateForFilters(s) {
        Renderer.spell.initBrewSources(s);

        s._normalisedTime = PageFilterSpells.getNormalisedTime(s.time);
        s._normalisedRange = PageFilterSpells.getNormalisedRange(s.range);

        s._fSources = SourceFilter.getCompleteFilterSources(s);
        s._fMeta = PageFilterSpells.getMetaFilterObj(s);
        s._fClasses = Renderer.spell.getCombinedClasses(s, "fromClassList").map(c=>{
            return this._getClassFilterItem({
                className: c.name,
                definedInSource: c.definedInSource,
                classSource: c.source,
                isVariantClass: false,
            });
        }
        );
        s._fSubclasses = Renderer.spell.getCombinedClasses(s, "fromSubclass").map(c=>{
            return this._getSubclassFilterItem({
                className: c.class.name,
                classSource: c.class.source,
                subclassName: c.subclass.name,
                subclassShortName: c.subclass.shortName,
                subclassSource: c.subclass.source,
                subSubclassName: c.subclass.subSubclass,
            });
        }
        );
        s._fVariantClasses = Renderer.spell.getCombinedClasses(s, "fromClassListVariant").map(c=>{
            return this._getClassFilterItem({
                className: c.name,
                definedInSource: c.definedInSource,
                classSource: c.source,
                isVariantClass: true,
            });
        }
        );
        s._fClassesAndVariantClasses = [...s._fClasses, ...s._fVariantClasses.map(it=>(it.userData.definedInSource && !SourceUtil.isNonstandardSource(it.userData.definedInSource)) ? new FilterItem({
            item: it.userData.equivalentClassName
        }) : null).filter(Boolean).filter(it=>!s._fClasses.some(itCls=>itCls.item === it.item)), ];
        s._fRaces = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "races",
            prop: "race"
        }).map(PageFilterSpells.getRaceFilterItem);
        s._fBackgrounds = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "backgrounds",
            prop: "background"
        }).map(it=>it.name);
        s._fFeats = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "feats",
            prop: "feat"
        }).map(it=>it.name);
        s._fOptionalfeatures = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "optionalfeatures",
            prop: "optionalfeature"
        }).map(it=>it.name);
        s._fGroups = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "groups"
        }).map(it=>it.name);
        s._fTimeType = s.time.map(t=>t.unit);
        s._fDurationType = PageFilterSpells.getFilterDuration(s);
        s._fRangeType = PageFilterSpells.getRangeType(s.range);

        s._fAreaTags = [...(s.areaTags || [])];
        if (s.range.type === "line" && !s._fAreaTags.includes("L"))
            s._fAreaTags.push("L");

        s._fAffectsCreatureType = s.affectsCreatureType || [...Parser.MON_TYPES];
    }

    static unmutateForFilters(s) {
        Renderer.spell.uninitBrewSources(s);

        delete s._normalisedTime;
        delete s._normalisedRange;

        Object.keys(s).filter(it=>it.startsWith("_f")).forEach(it=>delete s[it]);
    }

    addToFilters(s, isExcluded) {
        if (isExcluded)
            return;

        if (s.level > 9)
            this._levelFilter.addItem(s.level);
        this._groupFilter.addItem(s._fGroups);
        this._schoolFilter.addItem(s.school);
        this._sourceFilter.addItem(s._fSources);
        this._metaFilter.addItem(s._fMeta);
        this._backgroundFilter.addItem(s._fBackgrounds);
        this._featFilter.addItem(s._fFeats);
        this._optionalfeaturesFilter.addItem(s._fOptionalfeatures);
        s._fClasses.forEach(c=>this._classFilter.addItem(c));
        s._fSubclasses.forEach(sc=>{
            this._subclassFilter.addNest(sc.nest, {
                isHidden: true
            });
            this._subclassFilter.addItem(sc);
        }
        );
        s._fRaces.forEach(r=>{
            if (r.nest)
                this._raceFilter.addNest(r.nest, {
                    isHidden: true
                });
            this._raceFilter.addItem(r);
        }
        );
        s._fVariantClasses.forEach(c=>{
            this._variantClassFilter.addNest(c.nest, {
                isHidden: true
            });
            this._variantClassFilter.addItem(c);
        }
        );
        this._subSchoolFilter.addItem(s.subschools);
        this._conditionFilter.addItem(s.conditionInflict);
        this._affectsCreatureTypeFilter.addItem(s.affectsCreatureType);
    }

    async _pPopulateBoxOptions(opts) {
        await SourceUtil.pInitSubclassReprintLookup();

        opts.filters = [this._sourceFilter, this._levelFilter, this._classAndSubclassFilter, this._raceFilter, this._backgroundFilter, this._featFilter, this._optionalfeaturesFilter, this._metaFilter, this._groupFilter, this._schoolFilter, this._subSchoolFilter, this._damageFilter, this._conditionFilter, this._spellAttackFilter, this._saveFilter, this._checkFilter, this._timeFilter, this._durationFilter, this._rangeFilter, this._areaTypeFilter, this._affectsCreatureTypeFilter, ];
    }

    toDisplay(values, s) {
        return this._filterBox.toDisplay(values, s._fSources, s.level, [this._classAndSubclassFilter.isVariantSplit ? s._fClasses : s._fClassesAndVariantClasses, s._fSubclasses, this._classAndSubclassFilter.isVariantSplit ? s._fVariantClasses : null, ], s._fRaces, s._fBackgrounds, s._fFeats, s._fOptionalfeatures, s._fMeta, s._fGroups, s.school, s.subschools, s.damageInflict, s.conditionInflict, s.spellAttack, s.savingThrow, s.abilityCheck, s._fTimeType, s._fDurationType, s._fRangeType, s._fAreaTags, s._fAffectsCreatureType, );
    }
}
//#endregion

//#region PageFilterFeats
let PageFilterFeats$1 = class PageFilterFeats extends PageFilter {
    static _PREREQ_KEY_TO_FULL = {
        "other": "Special",
        "spellcasting2020": "Spellcasting",
        "spellcastingFeature": "Spellcasting",
        "spellcastingPrepared": "Spellcasting",
    };

    constructor() {
        super();

        this._asiFilter = new Filter({
            header: "Ability Bonus",
            items: ["str", "dex", "con", "int", "wis", "cha", ],
            displayFn: Parser.attAbvToFull,
            itemSortFn: null,
        });
        this._categoryFilter = new Filter({
            header: "Category",
            displayFn: StrUtil.toTitleCase,
        });
        this._otherPrereqFilter = new Filter({
            header: "Other",
            items: ["Ability", "Race", "Psionics", "Proficiency", "Special", "Spellcasting"],
        });
        this._levelFilter = new Filter({
            header: "Level",
            itemSortFn: SortUtil.ascSortNumericalSuffix,
        });
        this._prerequisiteFilter = new MultiFilter({
            header: "Prerequisite",
            filters: [this._otherPrereqFilter, this._levelFilter]
        });
        this._benefitsFilter = new Filter({
            header: "Benefits",
            items: ["Armor Proficiency", "Language Proficiency", "Skill Proficiency", "Spellcasting", "Tool Proficiency", "Weapon Proficiency", ],
        });
        this._vulnerableFilter = FilterCommon.getDamageVulnerableFilter();
        this._resistFilter = FilterCommon.getDamageResistFilter();
        this._immuneFilter = FilterCommon.getDamageImmuneFilter();
        this._defenceFilter = new MultiFilter({
            header: "Damage",
            filters: [this._vulnerableFilter, this._resistFilter, this._immuneFilter]
        });
        this._conditionImmuneFilter = FilterCommon.getConditionImmuneFilter();
        this._miscFilter = new Filter({
            header: "Miscellaneous",
            items: ["Has Info", "Has Images", "SRD", "Basic Rules"],
            isMiscFilter: true
        });
    }

    static mutateForFilters(feat) {
        const ability = Renderer.getAbilityData(feat.ability);
        feat._fAbility = ability.asCollection.filter(a=>!ability.areNegative.includes(a));
        const prereqText = Renderer.utils.prerequisite.getHtml(feat.prerequisite, {
            isListMode: true
        }) || VeCt.STR_NONE;

        feat._fPrereqOther = [...new Set((feat.prerequisite || []).flatMap(it=>Object.keys(it)))].map(it=>(this._PREREQ_KEY_TO_FULL[it] || it).uppercaseFirst());
        if (feat.prerequisite)
            feat._fPrereqLevel = feat.prerequisite.filter(it=>it.level != null).map(it=>`Level ${it.level.level ?? it.level}`);
        feat._fBenifits = [feat.resist ? "Damage Resistance" : null, feat.immune ? "Damage Immunity" : null, feat.conditionImmune ? "Condition Immunity" : null, feat.skillProficiencies ? "Skill Proficiency" : null, feat.additionalSpells ? "Spellcasting" : null, feat.armorProficiencies ? "Armor Proficiency" : null, feat.weaponProficiencies ? "Weapon Proficiency" : null, feat.toolProficiencies ? "Tool Proficiency" : null, feat.languageProficiencies ? "Language Proficiency" : null, ].filter(it=>it);
        if (feat.skillToolLanguageProficiencies?.length) {
            if (feat.skillToolLanguageProficiencies.some(it=>(it.choose || []).some(x=>x.from || [].includes("anySkill"))))
                feat._fBenifits.push("Skill Proficiency");
            if (feat.skillToolLanguageProficiencies.some(it=>(it.choose || []).some(x=>x.from || [].includes("anyTool"))))
                feat._fBenifits.push("Tool Proficiency");
            if (feat.skillToolLanguageProficiencies.some(it=>(it.choose || []).some(x=>x.from || [].includes("anyLanguage"))))
                feat._fBenifits.push("Language Proficiency");
        }
        feat._fMisc = feat.srd ? ["SRD"] : [];
        if (feat.basicRules)
            feat._fMisc.push("Basic Rules");
        if (feat.hasFluff || feat.fluff?.entries)
            feat._fMisc.push("Has Info");
        if (feat.hasFluffImages || feat.fluff?.images)
            feat._fMisc.push("Has Images");
        if (feat.repeatable != null)
            feat._fMisc.push(feat.repeatable ? "Repeatable" : "Not Repeatable");

        feat._slAbility = ability.asText || VeCt.STR_NONE;
        feat._slPrereq = prereqText;

        FilterCommon.mutateForFilters_damageVulnResImmune_player(feat);
        FilterCommon.mutateForFilters_conditionImmune_player(feat);
    }

    addToFilters(feat, isExcluded) {
        if (isExcluded)
            return;

        this._sourceFilter.addItem(feat.source);
        this._categoryFilter.addItem(feat.category);
        if (feat.prerequisite)
            this._levelFilter.addItem(feat._fPrereqLevel);
        this._vulnerableFilter.addItem(feat._fVuln);
        this._resistFilter.addItem(feat._fRes);
        this._immuneFilter.addItem(feat._fImm);
        this._conditionImmuneFilter.addItem(feat._fCondImm);
        this._benefitsFilter.addItem(feat._fBenifits);
        this._miscFilter.addItem(feat._fMisc);
    }

    async _pPopulateBoxOptions(opts) {
        opts.filters = [this._sourceFilter, this._asiFilter, this._categoryFilter, this._prerequisiteFilter, this._benefitsFilter, this._defenceFilter, this._conditionImmuneFilter, this._miscFilter, ];
    }

    toDisplay(values, ft) {
        return this._filterBox.toDisplay(values, ft.source, ft._fAbility, ft.category, [ft._fPrereqOther, ft._fPrereqLevel, ], ft._fBenifits, [ft._fVuln, ft._fRes, ft._fImm, ], ft._fCondImm, ft._fMisc, );
    }
}
;
//#endregion

//#region PageFilterEquipment
class PageFilterEquipment extends PageFilter {
    static _MISC_FILTER_ITEMS = ["Item Group", "Bundle", "SRD", "Basic Rules", "Has Images", "Has Info", "Reprinted", ];

    static _RE_FOUNDRY_ATTR = /(?:[-+*/]\s*)?@[a-z0-9.]+/gi;
    static _RE_DAMAGE_DICE_JUNK = /[^-+*/0-9d]/gi;
    static _RE_DAMAGE_DICE_D = /d/gi;

    static _getSortableDamageTerm(t) {
        try {
            return eval(`${t}`.replace(this._RE_FOUNDRY_ATTR, "").replace(this._RE_DAMAGE_DICE_JUNK, "").replace(this._RE_DAMAGE_DICE_D, "*"), );
        } catch (ignored) {
            return Number.MAX_SAFE_INTEGER;
        }
    }

    static _sortDamageDice(a, b) {
        return this._getSortableDamageTerm(a.item) - this._getSortableDamageTerm(b.item);
    }

    static _getMasteryDisplay(mastery) {
        const {name, source} = DataUtil.proxy.unpackUid("itemMastery", mastery, "itemMastery");
        if (SourceUtil.isSiteSource(source))
            return name.toTitleCase();
        return `${name.toTitleCase()} (${Parser.sourceJsonToAbv(source)})`;
    }

    constructor({filterOpts=null}={}) {
        super();

        this._typeFilter = new Filter({
            header: "Type",
            deselFn: (it)=>PageFilterItems$1._DEFAULT_HIDDEN_TYPES.has(it),
            displayFn: StrUtil.toTitleCase,
        });
        this._propertyFilter = new Filter({
            header: "Property",
            displayFn: StrUtil.toTitleCase
        });
        this._categoryFilter = new Filter({
            header: "Category",
            items: ["Basic", "Generic Variant", "Specific Variant", "Other"],
            deselFn: (it)=>it === "Specific Variant",
            itemSortFn: null,
            ...(filterOpts?.["Category"] || {}),
        });
        this._costFilter = new RangeFilter({
            header: "Cost",
            isLabelled: true,
            isAllowGreater: true,
            labelSortFn: null,
            labels: [0, ...[...new Array(9)].map((_,i)=>i + 1), ...[...new Array(9)].map((_,i)=>10 * (i + 1)), ...[...new Array(100)].map((_,i)=>100 * (i + 1)), ],
            labelDisplayFn: it=>!it ? "None" : Parser.getDisplayCurrency(CurrencyUtil.doSimplifyCoins({
                cp: it
            })),
        });
        this._weightFilter = new RangeFilter({
            header: "Weight",
            min: 0,
            max: 100,
            isAllowGreater: true,
            suffix: " lb."
        });
        this._focusFilter = new Filter({
            header: "Spellcasting Focus",
            items: [...Parser.ITEM_SPELLCASTING_FOCUS_CLASSES]
        });
        this._damageTypeFilter = new Filter({
            header: "Weapon Damage Type",
            displayFn: it=>Parser.dmgTypeToFull(it).uppercaseFirst(),
            itemSortFn: (a,b)=>SortUtil.ascSortLower(Parser.dmgTypeToFull(a), Parser.dmgTypeToFull(b))
        });
        this._damageDiceFilter = new Filter({
            header: "Weapon Damage Dice",
            items: ["1", "1d4", "1d6", "1d8", "1d10", "1d12", "2d6"],
            itemSortFn: (a,b)=>PageFilterEquipment._sortDamageDice(a, b)
        });
        this._miscFilter = new Filter({
            header: "Miscellaneous",
            items: [...PageFilterEquipment._MISC_FILTER_ITEMS, ...Object.values(Parser.ITEM_MISC_TAG_TO_FULL)],
            isMiscFilter: true,
        });
        this._poisonTypeFilter = new Filter({
            header: "Poison Type",
            items: ["ingested", "injury", "inhaled", "contact"],
            displayFn: StrUtil.toTitleCase
        });
        this._masteryFilter = new Filter({
            header: "Mastery",
            displayFn: this.constructor._getMasteryDisplay.bind(this)
        });
    }

    static mutateForFilters(item) {
        item._fSources = SourceFilter.getCompleteFilterSources(item);

        item._fProperties = item.property ? item.property.map(p=>Renderer.item.getProperty(p).name).filter(n=>n) : [];

        item._fMisc = [];
        if (item._isItemGroup)
            item._fMisc.push("Item Group");
        if (item.packContents)
            item._fMisc.push("Bundle");
        if (item.srd)
            item._fMisc.push("SRD");
        if (item.basicRules)
            item._fMisc.push("Basic Rules");
        if (item.hasFluff || item.fluff?.entries)
            item._fMisc.push("Has Info");
        if (item.hasFluffImages || item.fluff?.images)
            item._fMisc.push("Has Images");
        if (item.miscTags)
            item._fMisc.push(...item.miscTags.map(Parser.itemMiscTagToFull));
        if (this._isReprinted({
            reprintedAs: item.reprintedAs,
            tag: "item",
            prop: "item",
            page: UrlUtil.PG_ITEMS
        }))
            item._fMisc.push("Reprinted");

        if (item.focus || item.name === "Thieves' Tools" || item.type === "INS" || item.type === "SCF" || item.type === "AT") {
            item._fFocus = item.focus ? item.focus === true ? [...Parser.ITEM_SPELLCASTING_FOCUS_CLASSES] : [...item.focus] : [];
            if ((item.name === "Thieves' Tools" || item.type === "AT") && !item._fFocus.includes("Artificer"))
                item._fFocus.push("Artificer");
            if (item.type === "INS" && !item._fFocus.includes("Bard"))
                item._fFocus.push("Bard");
            if (item.type === "SCF") {
                switch (item.scfType) {
                case "arcane":
                    {
                        if (!item._fFocus.includes("Sorcerer"))
                            item._fFocus.push("Sorcerer");
                        if (!item._fFocus.includes("Warlock"))
                            item._fFocus.push("Warlock");
                        if (!item._fFocus.includes("Wizard"))
                            item._fFocus.push("Wizard");
                        break;
                    }
                case "druid":
                    {
                        if (!item._fFocus.includes("Druid"))
                            item._fFocus.push("Druid");
                        break;
                    }
                case "holy":
                    if (!item._fFocus.includes("Cleric"))
                        item._fFocus.push("Cleric");
                    if (!item._fFocus.includes("Paladin"))
                        item._fFocus.push("Paladin");
                    break;
                }
            }
        }

        item._fValue = Math.round(item.value || 0);

        item._fDamageDice = [];
        if (item.dmg1)
            item._fDamageDice.push(item.dmg1);
        if (item.dmg2)
            item._fDamageDice.push(item.dmg2);

        item._fMastery = item.mastery ? item.mastery.map(it=>{
            const {name, source} = DataUtil.proxy.unpackUid("itemMastery", it, "itemMastery", {
                isLower: true
            });
            return [name, source].join("|");
        }
        ) : null;
    }

    addToFilters(item, isExcluded) {
        if (isExcluded)
            return;

        this._sourceFilter.addItem(item._fSources);
        this._typeFilter.addItem(item._typeListText);
        this._propertyFilter.addItem(item._fProperties);
        this._damageTypeFilter.addItem(item.dmgType);
        this._damageDiceFilter.addItem(item._fDamageDice);
        this._poisonTypeFilter.addItem(item.poisonTypes);
        this._miscFilter.addItem(item._fMisc);
        this._masteryFilter.addItem(item._fMastery);
    }

    async _pPopulateBoxOptions(opts) {
        opts.filters = [this._sourceFilter, this._typeFilter, this._propertyFilter, this._categoryFilter, this._costFilter, this._weightFilter, this._focusFilter, this._damageTypeFilter, this._damageDiceFilter, this._miscFilter, this._poisonTypeFilter, this._masteryFilter, ];
    }

    toDisplay(values, it) {
        return this._filterBox.toDisplay(values, it._fSources, it._typeListText, it._fProperties, it._category, it._fValue, it.weight, it._fFocus, it.dmgType, it._fDamageDice, it._fMisc, it.poisonTypes, it._fMastery, );
    }
};
//#endregion

//#region PageFilterItems
let PageFilterItems$1 = class PageFilterItems extends PageFilterEquipment {
    static _DEFAULT_HIDDEN_TYPES = new Set(["treasure", "futuristic", "modern", "renaissance"]);
    static _FILTER_BASE_ITEMS_ATTUNEMENT = ["Requires Attunement", "Requires Attunement By...", "Attunement Optional", VeCt.STR_NO_ATTUNEMENT];

    static sortItems(a, b, o) {
        if (o.sortBy === "name")
            return SortUtil.compareListNames(a, b);
        else if (o.sortBy === "type")
            return SortUtil.ascSortLower(a.values.type, b.values.type) || SortUtil.compareListNames(a, b);
        else if (o.sortBy === "source")
            return SortUtil.ascSortLower(a.values.source, b.values.source) || SortUtil.compareListNames(a, b);
        else if (o.sortBy === "rarity")
            return SortUtil.ascSortItemRarity(a.values.rarity, b.values.rarity) || SortUtil.compareListNames(a, b);
        else if (o.sortBy === "attunement")
            return SortUtil.ascSort(a.values.attunement, b.values.attunement) || SortUtil.compareListNames(a, b);
        else if (o.sortBy === "count")
            return SortUtil.ascSort(a.data.count, b.data.count) || SortUtil.compareListNames(a, b);
        else if (o.sortBy === "weight")
            return SortUtil.ascSort(a.values.weight, b.values.weight) || SortUtil.compareListNames(a, b);
        else if (o.sortBy === "cost")
            return SortUtil.ascSort(a.values.cost, b.values.cost) || SortUtil.compareListNames(a, b);
        else
            return 0;
    }

    static _getBaseItemDisplay(baseItem) {
        if (!baseItem)
            return null;
        let[name,source] = baseItem.split("__");
        name = name.toTitleCase();
        source = source || Parser.SRC_DMG;
        if (source.toLowerCase() === Parser.SRC_PHB.toLowerCase())
            return name;
        return `${name} (${Parser.sourceJsonToAbv(source)})`;
    }

    static _sortAttunementFilter(a, b) {
        const ixA = PageFilterItems$1._FILTER_BASE_ITEMS_ATTUNEMENT.indexOf(a.item);
        const ixB = PageFilterItems$1._FILTER_BASE_ITEMS_ATTUNEMENT.indexOf(b.item);

        if (~ixA && ~ixB)
            return ixA - ixB;
        if (~ixA)
            return -1;
        if (~ixB)
            return 1;
        return SortUtil.ascSortLower(a, b);
    }

    static _getAttunementFilterItems(item) {
        const out = item._attunementCategory ? [item._attunementCategory] : [];

        if (!item.reqAttuneTags && !item.reqAttuneAltTags)
            return out;

        [...item.reqAttuneTags || [], ...item.reqAttuneAltTags || []].forEach(tagSet=>{
            Object.entries(tagSet).forEach(([prop,val])=>{
                switch (prop) {
                case "background":
                    out.push(`Background: ${val.split("|")[0].toTitleCase()}`);
                    break;
                case "languageProficiency":
                    out.push(`Language Proficiency: ${val.toTitleCase()}`);
                    break;
                case "skillProficiency":
                    out.push(`Skill Proficiency: ${val.toTitleCase()}`);
                    break;
                case "race":
                    out.push(`Race: ${val.split("|")[0].toTitleCase()}`);
                    break;
                case "creatureType":
                    out.push(`Creature Type: ${val.toTitleCase()}`);
                    break;
                case "size":
                    out.push(`Size: ${Parser.sizeAbvToFull(val)}`.toTitleCase());
                    break;
                case "class":
                    out.push(`Class: ${val.split("|")[0].toTitleCase()}`);
                    break;
                case "alignment":
                    out.push(`Alignment: ${Parser.alignmentListToFull(val).toTitleCase()}`);
                    break;

                case "str":
                case "dex":
                case "con":
                case "int":
                case "wis":
                case "cha":
                    out.push(`${Parser.attAbvToFull(prop)}: ${val} or Higher`);
                    break;

                case "spellcasting":
                    out.push("Spellcaster");
                    break;
                case "psionics":
                    out.push("Psionics");
                    break;
                }
            }
            );
        }
        );

        return out;
    }

    constructor(opts) {
        super(opts);

        this._tierFilter = new Filter({
            header: "Tier",
            items: ["none", "minor", "major"],
            itemSortFn: null,
            displayFn: StrUtil.toTitleCase
        });
        this._attachedSpellsFilter = new SearchableFilter({
            header: "Attached Spells",
            displayFn: (it)=>it.split("|")[0].toTitleCase(),
            itemSortFn: SortUtil.ascSortLower
        });
        this._lootTableFilter = new Filter({
            header: "Found On",
            items: ["Magic Item Table A", "Magic Item Table B", "Magic Item Table C", "Magic Item Table D", "Magic Item Table E", "Magic Item Table F", "Magic Item Table G", "Magic Item Table H", "Magic Item Table I"],
            displayFn: it=>{
                const [name,sourceJson] = it.split("|");
                return `${name}${sourceJson ? ` (${Parser.sourceJsonToAbv(sourceJson)})` : ""}`;
            }
            ,
        });
        this._rarityFilter = new Filter({
            header: "Rarity",
            items: [...Parser.ITEM_RARITIES],
            itemSortFn: null,
            displayFn: StrUtil.toTitleCase,
        });
        this._attunementFilter = new Filter({
            header: "Attunement",
            items: [...PageFilterItems$1._FILTER_BASE_ITEMS_ATTUNEMENT],
            itemSortFn: PageFilterItems$1._sortAttunementFilter
        });
        this._bonusFilter = new Filter({
            header: "Bonus",
            items: ["Armor Class", "Proficiency Bonus", "Spell Attacks", "Spell Save DC", "Saving Throws", ...([...new Array(4)]).map((_,i)=>`Weapon Attack and Damage Rolls${i ? ` (+${i})` : ""}`), ...([...new Array(4)]).map((_,i)=>`Weapon Attack Rolls${i ? ` (+${i})` : ""}`), ...([...new Array(4)]).map((_,i)=>`Weapon Damage Rolls${i ? ` (+${i})` : ""}`), ],
            itemSortFn: null,
        });
        this._rechargeTypeFilter = new Filter({
            header: "Recharge Type",
            displayFn: Parser.itemRechargeToFull
        });
        this._miscFilter = new Filter({
            header: "Miscellaneous",
            items: ["Ability Score Adjustment", "Charges", "Cursed", "Grants Language", "Grants Proficiency", "Magic", "Mundane", "Sentient", "Speed Adjustment", ...PageFilterEquipment._MISC_FILTER_ITEMS],
            isMiscFilter: true
        });
        this._baseSourceFilter = new SourceFilter({
            header: "Base Source",
            selFn: null
        });
        this._baseItemFilter = new Filter({
            header: "Base Item",
            displayFn: this.constructor._getBaseItemDisplay.bind(this.constructor)
        });
        this._optionalfeaturesFilter = new Filter({
            header: "Feature",
            displayFn: (it)=>{
                const [name,source] = it.split("|");
                if (!source)
                    return name.toTitleCase();
                const sourceJson = Parser.sourceJsonToJson(source);
                if (!SourceUtil.isNonstandardSourceWotc(sourceJson))
                    return name.toTitleCase();
                return `${name.toTitleCase()} (${Parser.sourceJsonToAbv(sourceJson)})`;
            }
            ,
            itemSortFn: SortUtil.ascSortLower,
        });
    }

    static mutateForFilters(item) {
        super.mutateForFilters(item);

        item._fTier = [item.tier ? item.tier : "none"];

        if (item.curse)
            item._fMisc.push("Cursed");
        const isMundane = Renderer.item.isMundane(item);
        item._fMisc.push(isMundane ? "Mundane" : "Magic");
        item._fIsMundane = isMundane;
        if (item.ability)
            item._fMisc.push("Ability Score Adjustment");
        if (item.modifySpeed)
            item._fMisc.push("Speed Adjustment");
        if (item.charges)
            item._fMisc.push("Charges");
        if (item.sentient)
            item._fMisc.push("Sentient");
        if (item.grantsProficiency)
            item._fMisc.push("Grants Proficiency");
        if (item.grantsLanguage)
            item._fMisc.push("Grants Language");
        if (item.critThreshold)
            item._fMisc.push("Expanded Critical Range");

        const fBaseItemSelf = item._isBaseItem ? `${item.name}__${item.source}`.toLowerCase() : null;
        item._fBaseItem = [item.baseItem ? (item.baseItem.includes("|") ? item.baseItem.replace("|", "__") : `${item.baseItem}__${Parser.SRC_DMG}`).toLowerCase() : null, item._baseName ? `${item._baseName}__${item._baseSource || item.source}`.toLowerCase() : null, ].filter(Boolean);
        item._fBaseItemAll = fBaseItemSelf ? [fBaseItemSelf, ...item._fBaseItem] : item._fBaseItem;

        item._fBonus = [];
        if (item.bonusAc)
            item._fBonus.push("Armor Class");
        this._mutateForFilters_bonusWeapon({
            prop: "bonusWeapon",
            item,
            text: "Weapon Attack and Damage Rolls"
        });
        this._mutateForFilters_bonusWeapon({
            prop: "bonusWeaponAttack",
            item,
            text: "Weapon Attack Rolls"
        });
        this._mutateForFilters_bonusWeapon({
            prop: "bonusWeaponDamage",
            item,
            text: "Weapon Damage Rolls"
        });
        if (item.bonusWeaponCritDamage)
            item._fBonus.push("Weapon Critical Damage");
        if (item.bonusSpellAttack)
            item._fBonus.push("Spell Attacks");
        if (item.bonusSpellSaveDc)
            item._fBonus.push("Spell Save DC");
        if (item.bonusSavingThrow)
            item._fBonus.push("Saving Throws");
        if (item.bonusProficiencyBonus)
            item._fBonus.push("Proficiency Bonus");

        item._fAttunement = this._getAttunementFilterItems(item);
    }

    static _mutateForFilters_bonusWeapon({prop, item, text}) {
        if (!item[prop])
            return;
        item._fBonus.push(text);
        switch (item[prop]) {
        case "+1":
        case "+2":
        case "+3":
            item._fBonus.push(`${text} (${item[prop]})`);
            break;
        }
    }

    addToFilters(item, isExcluded) {
        if (isExcluded)
            return;

        super.addToFilters(item, isExcluded);

        this._sourceFilter.addItem(item.source);
        this._tierFilter.addItem(item._fTier);
        this._attachedSpellsFilter.addItem(item.attachedSpells);
        this._lootTableFilter.addItem(item.lootTables);
        this._baseItemFilter.addItem(item._fBaseItem);
        this._baseSourceFilter.addItem(item._baseSource);
        this._attunementFilter.addItem(item._fAttunement);
        this._rechargeTypeFilter.addItem(item.recharge);
        this._optionalfeaturesFilter.addItem(item.optionalfeatures);
    }

    async _pPopulateBoxOptions(opts) {
        await super._pPopulateBoxOptions(opts);

        opts.filters = [this._sourceFilter, this._typeFilter, this._tierFilter, this._rarityFilter, this._propertyFilter, this._attunementFilter, this._categoryFilter, this._costFilter, this._weightFilter, this._focusFilter, this._damageTypeFilter, this._damageDiceFilter, this._bonusFilter, this._miscFilter, this._rechargeTypeFilter, this._poisonTypeFilter, this._masteryFilter, this._lootTableFilter, this._baseItemFilter, this._baseSourceFilter, this._optionalfeaturesFilter, this._attachedSpellsFilter, ];
    }

    toDisplay(values, it) {
        return this._filterBox.toDisplay(values, it._fSources, it._typeListText, it._fTier, it.rarity, it._fProperties, it._fAttunement, it._category, it._fValue, it.weight, it._fFocus, it.dmgType, it._fDamageDice, it._fBonus, it._fMisc, it.recharge, it.poisonTypes, it._fMastery, it.lootTables, it._fBaseItemAll, it._baseSource, it.optionalfeatures, it.attachedSpells, );
    }
}
;
//#endregion

class VariantClassFilter extends Filter {
    constructor(opts) {
        super({
            header: "Optional/Variant Class",
            nests: {},
            groupFn: it=>it.userData.group,
            ...opts,
        });

        this._parent = null;
    }

    set parent(multiFilterClasses) {
        this._parent = multiFilterClasses;
    }

    handleVariantSplit(isVariantSplit) {
        this.__$wrpFilter.toggleVe(isVariantSplit);
    }
}
class MultiFilterClasses extends MultiFilter {
    constructor(opts) {
        super({
            header: "Classes",
            mode: "or",
            filters: [opts.classFilter, opts.subclassFilter, opts.variantClassFilter],
            ...opts
        });

        this._classFilter = opts.classFilter;
        this._subclassFilter = opts.subclassFilter;
        this._variantClassFilter = opts.variantClassFilter;

        this._variantClassFilter.parent = this;
    }

    get classFilter_() {
        return this._classFilter;
    }
    get isVariantSplit() {
        return this._meta.isVariantSplit;
    }

    $render(opts) {
        const $out = super.$render(opts);

        const hkVariantSplit = ()=>this._variantClassFilter.handleVariantSplit(this._meta.isVariantSplit);
        this._addHook("meta", "isVariantSplit", hkVariantSplit);
        hkVariantSplit();

        return $out;
    }

    _getHeaderControls_addExtraStateBtns(opts, wrpStateBtnsOuter) {
        const btnToggleVariantSplit = ComponentUiUtil.getBtnBool(this, "isVariantSplit", {
            ele: e_({
                tag: "button",
                clazz: "btn btn-default btn-xs",
                text: "Include Variants"
            }),
            isInverted: true,
            stateName: "meta",
            stateProp: "_meta",
            title: `If "Optional/Variant Class" spell lists should be treated as part of the "Class" filter.`,
        }, );

        e_({
            tag: "div",
            clazz: `btn-group w-100 ve-flex-v-center mobile__m-1 mobile__mb-2`,
            children: [btnToggleVariantSplit, ],
        }).prependTo(wrpStateBtnsOuter);
    }

    getDefaultMeta() {
        return {
            ...MultiFilterClasses._DEFAULT_META,
            ...super.getDefaultMeta()
        };
    }
}
MultiFilterClasses._DEFAULT_META = {
    isVariantSplit: false,
};
class SearchableFilter extends Filter {
    constructor(opts) {
        super(opts);

        this._compSearch = BaseComponent.fromObject({
            search: "",
            searchTermParent: "",
        });
    }

    handleSearch(searchTerm) {
        const out = super.handleSearch(searchTerm);

        this._compSearch._state.searchTermParent = searchTerm;

        return out;
    }

    _getPill(item) {
        const btnPill = super._getPill(item);

        const hkIsVisible = ()=>{
            if (this._compSearch._state.searchTermParent)
                return btnPill.toggleClass("fltr__hidden--inactive", false);

            btnPill.toggleClass("fltr__hidden--inactive", this._state[item.item] === 0);
        }
        ;
        this._addHook("state", item.item, hkIsVisible);
        this._compSearch._addHookBase("searchTermParent", hkIsVisible);
        hkIsVisible();

        return btnPill;
    }

    _getPill_handleClick({evt, item}) {
        if (this._compSearch._state.searchTermParent)
            return super._getPill_handleClick({
                evt,
                item
            });

        this._state[item.item] = 0;
    }

    _getPill_handleContextmenu({evt, item}) {
        if (this._compSearch._state.searchTermParent)
            return super._getPill_handleContextmenu({
                evt,
                item
            });

        evt.preventDefault();
        this._state[item.item] = 0;
    }

    _$render_getRowBtn({fnsCleanup, $iptSearch, item, subtype, state}) {
        const handleClick = evt=>{
            evt.stopPropagation();
            evt.preventDefault();

            $iptSearch.focus();

            if (evt.shiftKey) {
                this._doSetPillsClear();
            }

            if (this._state[item.item] === state)
                this._state[item.item] = 0;
            else
                this._state[item.item] = state;
        }
        ;

        const btn = e_({
            tag: "div",
            clazz: `no-shrink clickable fltr-search__btn-activate fltr-search__btn-activate--${subtype} ve-flex-vh-center`,
            click: evt=>handleClick(evt),
            contextmenu: evt=>handleClick(evt),
            mousedown: evt=>{
                evt.stopPropagation();
                evt.preventDefault();
            }
            ,
        });

        const hkIsActive = ()=>{
            btn.innerText = this._state[item.item] === state ? "×" : "";
        }
        ;
        this._addHookBase(item.item, hkIsActive);
        hkIsActive();
        fnsCleanup.push(()=>this._removeHookBase(item.item, hkIsActive));

        return btn;
    }

    $render(opts) {
        const $out = super.$render(opts);

        const $iptSearch = ComponentUiUtil.$getIptStr(this._compSearch, "search", {
            html: `<input class="form-control form-control--minimal input-xs" placeholder="Search...">`,
        }, );

        const wrpValues = e_({
            tag: "div",
            clazz: "overflow-y-auto bt-0 absolute fltr-search__wrp-values",
        });

        const fnsCleanup = [];
        const rowMetas = [];

        this._$render_bindSearchHandler_keydown({
            $iptSearch,
            fnsCleanup,
            rowMetas
        });
        this._$render_bindSearchHandler_focus({
            $iptSearch,
            fnsCleanup,
            rowMetas,
            wrpValues
        });
        this._$render_bindSearchHandler_blur({
            $iptSearch
        });

        const $wrp = $$`<div class="fltr-search__wrp-search ve-flex-col relative mt-1 mx-2p mb-1">
			${$iptSearch}
			${wrpValues}
		</div>`.prependTo(this.__wrpPills);

        const hkParentSearch = ()=>{
            $wrp.toggleVe(!this._compSearch._state.searchTermParent);
        }
        ;
        this._compSearch._addHookBase("searchTermParent", hkParentSearch);
        hkParentSearch();

        return $out;
    }

    _$render_bindSearchHandler_keydown({$iptSearch, rowMetas}) {
        $iptSearch.on("keydown", evt=>{
            switch (evt.key) {
            case "Escape":
                evt.stopPropagation();
                return $iptSearch.blur();

            case "ArrowDown":
                {
                    evt.preventDefault();
                    const visibleRowMetas = rowMetas.filter(it=>it.isVisible);
                    if (!visibleRowMetas.length)
                        return;
                    visibleRowMetas[0].row.focus();
                    break;
                }

            case "Enter":
                {
                    const visibleRowMetas = rowMetas.filter(it=>it.isVisible);
                    if (!visibleRowMetas.length)
                        return;
                    if (evt.shiftKey)
                        this._doSetPillsClear();
                    this._state[visibleRowMetas[0].item.item] = (EventUtil.isCtrlMetaKey(evt)) ? 2 : 1;
                    $iptSearch.blur();
                    break;
                }
            }
        }
        );
    }

    _$render_bindSearchHandler_focus({$iptSearch, fnsCleanup, rowMetas, wrpValues}) {
        $iptSearch.on("focus", ()=>{
            fnsCleanup.splice(0, fnsCleanup.length).forEach(fn=>fn());

            rowMetas.splice(0, rowMetas.length);

            wrpValues.innerHTML = "";

            rowMetas.push(...this._items.map(item=>this._$render_bindSearchHandler_focus_getRowMeta({
                $iptSearch,
                fnsCleanup,
                rowMetas,
                wrpValues,
                item
            })), );

            this._$render_bindSearchHandler_focus_addHookSearch({
                rowMetas,
                fnsCleanup
            });

            wrpValues.scrollIntoView({
                block: "nearest",
                inline: "nearest"
            });
        }
        );
    }

    _$render_bindSearchHandler_focus_getRowMeta({$iptSearch, fnsCleanup, rowMetas, wrpValues, item}) {
        const dispName = this._getDisplayText(item);

        const eleName = e_({
            tag: "div",
            clazz: "fltr-search__disp-name ml-2",
        });

        const btnBlue = this._$render_getRowBtn({
            fnsCleanup,
            $iptSearch,
            item,
            subtype: "yes",
            state: 1,
        });
        btnBlue.addClass("br-0");
        btnBlue.addClass("btr-0");
        btnBlue.addClass("bbr-0");

        const btnRed = this._$render_getRowBtn({
            fnsCleanup,
            $iptSearch,
            item,
            subtype: "no",
            state: 2,
        });
        btnRed.addClass("bl-0");
        btnRed.addClass("btl-0");
        btnRed.addClass("bbl-0");

        const row = e_({
            tag: "div",
            clazz: "py-1p px-2 ve-flex-v-center fltr-search__wrp-row",
            children: [btnBlue, btnRed, eleName, ],
            attrs: {
                tabindex: "0",
            },
            keydown: evt=>{
                switch (evt.key) {
                case "Escape":
                    evt.stopPropagation();
                    return row.blur();

                case "ArrowDown":
                    {
                        evt.preventDefault();
                        const visibleRowMetas = rowMetas.filter(it=>it.isVisible);
                        if (!visibleRowMetas.length)
                            return;
                        const ixCur = visibleRowMetas.indexOf(out);
                        const nxt = visibleRowMetas[ixCur + 1];
                        if (nxt)
                            nxt.row.focus();
                        break;
                    }

                case "ArrowUp":
                    {
                        evt.preventDefault();
                        const visibleRowMetas = rowMetas.filter(it=>it.isVisible);
                        if (!visibleRowMetas.length)
                            return;
                        const ixCur = visibleRowMetas.indexOf(out);
                        const prev = visibleRowMetas[ixCur - 1];
                        if (prev)
                            return prev.row.focus();
                        $iptSearch.focus();
                        break;
                    }

                case "Enter":
                    {
                        if (evt.shiftKey)
                            this._doSetPillsClear();
                        this._state[item.item] = (EventUtil.isCtrlMetaKey(evt)) ? 2 : 1;
                        row.blur();
                        break;
                    }
                }
            }
            ,
        });

        wrpValues.appendChild(row);

        const out = {
            isVisible: true,
            item,
            row,
            dispName,
            eleName,
        };

        return out;
    }

    _$render_bindSearchHandler_focus_addHookSearch({rowMetas, fnsCleanup}) {
        const hkSearch = ()=>{
            const searchTerm = this._compSearch._state.search.toLowerCase();

            rowMetas.forEach(({item, row})=>{
                row.isVisible = item.searchText.includes(searchTerm);
                row.toggleVe(row.isVisible);
            }
            );

            if (!this._compSearch._state.search) {
                rowMetas.forEach(({dispName, eleName})=>eleName.textContent = dispName);
                return;
            }

            const re = new RegExp(this._compSearch._state.search.qq().escapeRegexp(),"gi");

            rowMetas.forEach(({dispName, eleName})=>{
                eleName.innerHTML = dispName.qq().replace(re, (...m)=>`<u>${m[0]}</u>`);
            }
            );
        }
        ;
        this._compSearch._addHookBase("search", hkSearch);
        hkSearch();
        fnsCleanup.push(()=>this._compSearch._removeHookBase("search", hkSearch));
    }

    _$render_bindSearchHandler_blur({$iptSearch}) {
        $iptSearch.on("blur", ()=>{
            this._compSearch._state.search = "";
        }
        );
    }
}

//#endregion
export {PageFilterClassesFoundry}