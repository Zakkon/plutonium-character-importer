import { PageFilterClassesFoundry } from "./pagefilters.js";
import {Charactermancer_Class_Util} from "../mancer/charactermancer.js";
import { UtilEntityClassSubclassFeature } from "./utilentity.js";
import Vetools from "./vetools.js";

//#region DATALOADER
class _DataLoaderConst {
    static SOURCE_SITE_ALL = Symbol("SOURCE_SITE_ALL");
    static SOURCE_PRERELEASE_ALL_CURRENT = Symbol("SOURCE_PRERELEASE_ALL_CURRENT");
    static SOURCE_BREW_ALL_CURRENT = Symbol("SOURCE_BREW_ALL_CURRENT");

    static ENTITY_NULL = Symbol("ENTITY_NULL");
}

class _DataLoaderInternalUtil {
    static getCleanPageSourceHash({page, source, hash}) {
        return {
            page: this.getCleanPage({
                page
            }),
            source: this.getCleanSource({
                source
            }),
            hash: this.getCleanHash({
                hash
            }),
        };
    }

    static getCleanPage({page}) {
        return page.toLowerCase();
    }
    static getCleanSource({source}) {
        return source.toLowerCase();
    }
    static getCleanHash({hash}) {
        return hash.toLowerCase();
    }

    static getCleanPageFluff({page}) {
        return `${this.getCleanPage({
            page
        })}fluff`;
    }

    static _NOTIFIED_FAILED_DEREFERENCES = new Set();

    static doNotifyFailedDereferences({missingRefSets, diagnostics}) {
        const missingRefSetsUnseen = Object.entries(missingRefSets).mergeMap(([prop,set])=>({
            [prop]: new Set([...set].filter(ref=>{
                const refLower = ref.toLowerCase();
                const out = !this._NOTIFIED_FAILED_DEREFERENCES.has(refLower);
                this._NOTIFIED_FAILED_DEREFERENCES.add(refLower);
                return out;
            }
            ),),
        }));

        const cntMissingRefs = Object.values(missingRefSetsUnseen).map(({size})=>size).sum();
        if (!cntMissingRefs)
            return;

        const notificationRefs = Object.entries(missingRefSetsUnseen).map(([k,v])=>`${k}: ${[...v].sort(SortUtil.ascSortLower).join(", ")}`).join("; ");

        const ptDiagnostics = DataLoader.getDiagnosticsSummary(diagnostics);
        const msgStart = `Failed to load references for ${cntMissingRefs} entr${cntMissingRefs === 1 ? "y" : "ies"}!`;

        JqueryUtil.doToast({
            type: "danger",
            content: `${msgStart} Reference types and values were: ${[notificationRefs, ptDiagnostics].join(" ")}`,
            isAutoHide: false,
        });

        const cnslRefs = [...Object.entries(missingRefSetsUnseen).map(([k,v])=>`${k}:\n\t${[...v].sort(SortUtil.ascSortLower).join("\n\t")}`), ptDiagnostics, ].filter(Boolean).join("\n");

        setTimeout(()=>{
            throw new Error(`${msgStart}\nReference types and values were:\n${cnslRefs}`);
        }
        );
    }
}

class _DataLoaderDereferencerBase {
    static _DereferenceMeta = class {
        constructor({cntReplaces=0, offsetIx=0}) {
            this.cntReplaces = cntReplaces;
            this.offsetIx = offsetIx;
        }
    }
    ;

    static _WALKER_MOD = MiscUtil.getWalker({
        keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
    });

    _pPreloadingRefContentSite = null;
    _pPreloadingRefContentPrerelease = null;
    _pPreloadingRefContentBrew = null;

    _preloadingPrereleaseLastIdent = null;
    _preloadingBrewLastIdent = null;

    async pPreloadRefContent() {
        await (this._pPreloadingRefContentSite = this._pPreloadingRefContentSite || this._pPreloadRefContentSite());

        if (typeof PrereleaseUtil !== "undefined") {
            const identPrerelease = PrereleaseUtil.getCacheIteration();
            if (identPrerelease !== this._preloadingPrereleaseLastIdent)
                this._pPreloadingRefContentPrerelease = null;
            this._preloadingPrereleaseLastIdent = identPrerelease;
            await (this._pPreloadingRefContentPrerelease = this._pPreloadingRefContentPrerelease || this._pPreloadRefContentPrerelease());
        }

        if (typeof BrewUtil2 !== "undefined") {
            const identBrew = BrewUtil2.getCacheIteration();
            if (identBrew !== this._preloadingBrewLastIdent)
                this._pPreloadingRefContentBrew = null;
            this._preloadingBrewLastIdent = identBrew;
            await (this._pPreloadingRefContentBrew = this._pPreloadingRefContentBrew || this._pPreloadRefContentBrew());
        }
    }

    async _pPreloadRefContentSite() {}
    async _pPreloadRefContentPrerelease() {}
    async _pPreloadRefContentBrew() {}

    dereference({ent, entriesWithoutRefs, toReplaceMeta, ixReplace}) {
        throw new Error("Unimplemented!");
    }

    _getCopyFromCache({page, entriesWithoutRefs, refUnpacked, refHash}) {
        if (page.toLowerCase().endsWith(".html"))
            throw new Error(`Could not dereference "${page}" content. Dereferencing is only supported for props!`);

        return entriesWithoutRefs[page]?.[refHash] ? MiscUtil.copyFast(entriesWithoutRefs[page]?.[refHash]) : DataLoader.getFromCache(page, refUnpacked.source, refHash, {
            isCopy: true
        });
    }
}

class _DataLoaderDereferencerClassSubclassFeatures extends _DataLoaderDereferencerBase {
    dereference({ent, entriesWithoutRefs, toReplaceMeta, ixReplace}) {
        const prop = toReplaceMeta.type === "refClassFeature" ? "classFeature" : "subclassFeature";
        const refUnpacked = toReplaceMeta.type === "refClassFeature" ? DataUtil.class.unpackUidClassFeature(toReplaceMeta.classFeature) : DataUtil.class.unpackUidSubclassFeature(toReplaceMeta.subclassFeature);
        const refHash = UrlUtil.URL_TO_HASH_BUILDER[prop](refUnpacked);

        if (ExcludeUtil.isInitialised && ExcludeUtil.isExcluded(refHash, prop, refUnpacked.source, {
            isNoCount: true
        })) {
            toReplaceMeta.array[toReplaceMeta.ix] = {};
            return new this.constructor._DereferenceMeta({
                cntReplaces: 1
            });
        }

        const cpy = this._getCopyFromCache({
            page: prop,
            entriesWithoutRefs,
            refUnpacked,
            refHash
        });
        if (!cpy)
            return new this.constructor._DereferenceMeta({
                cntReplaces: 0
            });

        delete cpy.header;
        if (toReplaceMeta.name)
            cpy.name = toReplaceMeta.name;
        toReplaceMeta.array[toReplaceMeta.ix] = cpy;
        return new this.constructor._DereferenceMeta({
            cntReplaces: 1
        });
    }
}

class _DataLoaderDereferencerOptionalfeatures extends _DataLoaderDereferencerBase {
    async _pPreloadRefContentSite() {
        await DataLoader.pCacheAndGetAllSite(UrlUtil.PG_OPT_FEATURES);
    }
    async _pPreloadRefContentPrerelease() {
        await DataLoader.pCacheAndGetAllPrerelease(UrlUtil.PG_OPT_FEATURES);
    }
    async _pPreloadRefContentBrew() {
        await DataLoader.pCacheAndGetAllBrew(UrlUtil.PG_OPT_FEATURES);
    }

    dereference({ent, entriesWithoutRefs, toReplaceMeta, ixReplace}) {
        const refUnpacked = DataUtil.generic.unpackUid(toReplaceMeta.optionalfeature, "optfeature");
        const refHash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES](refUnpacked);

        if (ExcludeUtil.isInitialised && ExcludeUtil.isExcluded(refHash, "optionalfeature", refUnpacked.source, {
            isNoCount: true
        })) {
            toReplaceMeta.array[toReplaceMeta.ix] = {};
            return new this.constructor._DereferenceMeta({
                cntReplaces: 1
            });
        }

        const cpy = this._getCopyFromCache({
            page: "optionalfeature",
            entriesWithoutRefs,
            refUnpacked,
            refHash
        });
        if (!cpy)
            return new this.constructor._DereferenceMeta({
                cntReplaces: 0
            });

        delete cpy.featureType;
        delete cpy.prerequisite;
        if (toReplaceMeta.name)
            cpy.name = toReplaceMeta.name;
        toReplaceMeta.array[toReplaceMeta.ix] = cpy;

        return new this.constructor._DereferenceMeta({
            cntReplaces: 1
        });
    }
}

class _DataLoaderDereferencerItemEntries extends _DataLoaderDereferencerBase {
    async _pPreloadRefContentSite() {
        await DataLoader.pCacheAndGetAllSite(UrlUtil.PG_ITEMS);
    }
    async _pPreloadRefContentPrerelease() {
        await DataLoader.pCacheAndGetAllPrerelease(UrlUtil.PG_ITEMS);
    }
    async _pPreloadRefContentBrew() {
        await DataLoader.pCacheAndGetAllBrew(UrlUtil.PG_ITEMS);
    }

    dereference({ent, entriesWithoutRefs, toReplaceMeta, ixReplace}) {
        const refUnpacked = DataUtil.generic.unpackUid(toReplaceMeta.itemEntry, "itemEntry");
        const refHash = UrlUtil.URL_TO_HASH_BUILDER["itemEntry"](refUnpacked);

        const cpy = this._getCopyFromCache({
            page: "itemEntry",
            entriesWithoutRefs,
            refUnpacked,
            refHash
        });
        if (!cpy)
            return new this.constructor._DereferenceMeta({
                cntReplaces: 0
            });

        cpy.entriesTemplate = this.constructor._WALKER_MOD.walk(cpy.entriesTemplate, {
            string: (str)=>{
                return Renderer.utils.applyTemplate(ent, str, );
            }
            ,
        }, );

        toReplaceMeta.array.splice(toReplaceMeta.ix, 1, ...cpy.entriesTemplate);

        return new this.constructor._DereferenceMeta({
            cntReplaces: 1,
            offsetIx: cpy.entriesTemplate.length - 1,
        });
    }
}

class _DataLoaderDereferencer {
    static _REF_TYPE_TO_DEREFERENCER = {};

    static _init() {
        this._REF_TYPE_TO_DEREFERENCER["refClassFeature"] = this._REF_TYPE_TO_DEREFERENCER["refSubclassFeature"] = new _DataLoaderDereferencerClassSubclassFeatures();

        this._REF_TYPE_TO_DEREFERENCER["refOptionalfeature"] = new _DataLoaderDereferencerOptionalfeatures();

        this._REF_TYPE_TO_DEREFERENCER["refItemEntry"] = new _DataLoaderDereferencerItemEntries();

        return null;
    }

    static _ = this._init();

    static _WALKER_READ = MiscUtil.getWalker({
        keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
        isNoModification: true,
        isBreakOnReturn: true,
    });

    static async pGetDereferenced(entities, page, {propEntries="entries", propIsRef=null, }={}, ) {
        if (page.toLowerCase().endsWith(".html"))
            throw new Error(`Could not dereference "${page}" content. Dereferencing is only supported for props!`);

        if (!entities || !entities.length)
            return {};

        const out = {};
        const entriesWithRefs = {};
        const entriesWithoutRefs = {};

        this._pGetDereferenced_doSegregateWithWithoutRefs({
            entities,
            page,
            propEntries,
            propIsRef,
            entriesWithRefs,
            entriesWithoutRefs,
        });

        await this._pGetDereferenced_pDoDereference({
            propEntries,
            entriesWithRefs,
            entriesWithoutRefs
        });
        this._pGetDereferenced_doNotifyFailed({
            entriesWithRefs,
            entities
        });
        this._pGetDereferenced_doPopulateOutput({
            page,
            out,
            entriesWithoutRefs,
            entriesWithRefs
        });

        return out;
    }

    static _pGetDereferenced_doSegregateWithWithoutRefs({entities, page, propEntries, propIsRef, entriesWithRefs, entriesWithoutRefs}) {
        const hashBuilder = UrlUtil.URL_TO_HASH_BUILDER[page];
        entities.forEach(ent=>{
            const hash = hashBuilder(ent);
            const hasRefs = this._pGetDereferenced_hasRefs({
                ent,
                propEntries,
                propIsRef
            });

            ((hasRefs ? entriesWithRefs : entriesWithoutRefs)[page] = (hasRefs ? entriesWithRefs : entriesWithoutRefs)[page] || {})[hash] = hasRefs ? MiscUtil.copyFast(ent) : ent;
        }
        );
    }

    static _pGetDereferenced_hasRefs({ent, propEntries, propIsRef}) {
        if (propIsRef != null)
            return !!ent[propIsRef];

        const ptrHasRef = {
            _: false
        };
        this._WALKER_READ.walk(ent[propEntries], this._pGetDereferenced_doPopulateRaw_getHandlers({
            ptrHasRef
        }));
        return ptrHasRef._;
    }

    static _pGetDereferenced_doPopulateRaw_getHandlers({ptrHasRef}) {
        return {
            object: (obj)=>{
                if (this._REF_TYPE_TO_DEREFERENCER[obj.type])
                    return ptrHasRef._ = true;
            }
            ,
            string: (str)=>{
                if (str.startsWith("{#") && str.endsWith("}"))
                    return ptrHasRef._ = true;
            }
            ,
        };
    }

    static _MAX_DEREFERENCE_LOOPS = 25;
    static async _pGetDereferenced_pDoDereference({propEntries, entriesWithRefs, entriesWithoutRefs}) {
        for (let i = 0; i < this._MAX_DEREFERENCE_LOOPS; ++i) {
            if (!Object.keys(entriesWithRefs).length)
                break;

            for (const [page,pageEntries] of Object.entries(entriesWithRefs)) {
                for (const [hash,ent] of Object.entries(pageEntries)) {
                    const toReplaceMetas = [];
                    this._WALKER_READ.walk(ent[propEntries], this._pGetDereferenced_doDereference_getHandlers({
                        toReplaceMetas
                    }), );

                    for (const {type} of toReplaceMetas) {
                        if (!this._REF_TYPE_TO_DEREFERENCER[type])
                            continue;
                        await this._REF_TYPE_TO_DEREFERENCER[type].pPreloadRefContent();
                    }

                    let cntReplaces = 0;
                    for (let ixReplace = 0; ixReplace < toReplaceMetas.length; ++ixReplace) {
                        const toReplaceMeta = this._pGetDereferenced_doDereference_getToReplaceMeta(toReplaceMetas[ixReplace]);

                        const derefMeta = this._REF_TYPE_TO_DEREFERENCER[toReplaceMeta.type].dereference({
                            ent,
                            entriesWithoutRefs,
                            toReplaceMeta,
                            ixReplace,
                        });
                        cntReplaces += derefMeta.cntReplaces;

                        if (!derefMeta.offsetIx)
                            continue;

                        toReplaceMetas.slice(ixReplace + 1).forEach(it=>it.ix += derefMeta.offsetIx);
                    }

                    if (cntReplaces === toReplaceMetas.length) {
                        delete pageEntries[hash];
                        (entriesWithoutRefs[page] = entriesWithoutRefs[page] || {})[hash] = ent;
                    }
                }

                if (!Object.keys(pageEntries).length)
                    delete entriesWithRefs[page];
            }
        }
    }

    static _pGetDereferenced_doDereference_getHandlers({toReplaceMetas}) {
        return {
            array: (arr)=>{
                arr.forEach((it,i)=>{
                    if (this._REF_TYPE_TO_DEREFERENCER[it.type]) {
                        toReplaceMetas.push({
                            ...it,
                            array: arr,
                            ix: i,
                        });
                        return;
                    }

                    if (typeof it === "string" && it.startsWith("{#") && it.endsWith("}")) {
                        toReplaceMetas.push({
                            string: it,
                            array: arr,
                            ix: i,
                        });
                    }
                }
                );
            }
            ,
        };
    }

    static _pGetDereferenced_doDereference_getToReplaceMeta(toReplaceMetaRaw) {
        if (toReplaceMetaRaw.string == null)
            return toReplaceMetaRaw;

        const str = toReplaceMetaRaw.string;
        delete toReplaceMetaRaw.string;
        return {
            ...toReplaceMetaRaw,
            ...Renderer.hover.getRefMetaFromTag(str)
        };
    }

    static _pGetDereferenced_doNotifyFailed({entriesWithRefs, entities}) {
        const entriesWithRefsVals = Object.values(entriesWithRefs).map(hashToEntry=>Object.values(hashToEntry)).flat();

        if (!entriesWithRefsVals.length)
            return;

        const missingRefSets = {};
        this._WALKER_READ.walk(entriesWithRefsVals, {
            object: (obj)=>{
                switch (obj.type) {
                case "refClassFeature":
                    (missingRefSets["classFeature"] = missingRefSets["classFeature"] || new Set()).add(obj.classFeature);
                    break;
                case "refSubclassFeature":
                    (missingRefSets["subclassFeature"] = missingRefSets["subclassFeature"] || new Set()).add(obj.subclassFeature);
                    break;
                case "refOptionalfeature":
                    (missingRefSets["optionalfeature"] = missingRefSets["optionalfeature"] || new Set()).add(obj.optionalfeature);
                    break;
                case "refItemEntry":
                    (missingRefSets["itemEntry"] = missingRefSets["itemEntry"] || new Set()).add(obj.itemEntry);
                    break;
                }
            }
            ,
        }, );

        _DataLoaderInternalUtil.doNotifyFailedDereferences({
            missingRefSets,
            diagnostics: entities.map(ent=>ent.__diagnostic).filter(Boolean),
        });
    }

    static _pGetDereferenced_doPopulateOutput({isOverwrite, out, entriesWithoutRefs, entriesWithRefs}) {
        [...Object.entries(entriesWithoutRefs), ...Object.entries(entriesWithRefs), ].forEach(([page,hashToEnt])=>{
            Object.entries(hashToEnt).forEach(([hash,ent])=>{
                if (!isOverwrite && DataLoader.getFromCache(page, ent.source, hash))
                    return;
                (out[page] = out[page] || []).push(ent);
            }
            );
        }
        );
    }
}

class _DataLoaderCache {
    static _PARTITION_UNKNOWN = 0;
    static _PARTITION_SITE = 1;
    static _PARTITION_PRERELEASE = 2;
    static _PARTITION_BREW = 3;

    _cache = {};
    _cacheSiteLists = {};
    _cachePrereleaseLists = {};
    _cacheBrewLists = {};

    get(pageClean, sourceClean, hashClean) {
        return this._cache[pageClean]?.[sourceClean]?.[hashClean];
    }

    getAllSite(pageClean) {
        return Object.values(this._cacheSiteLists[pageClean] || {});
    }

    getAllPrerelease(pageClean) {
        return Object.values(this._cachePrereleaseLists[pageClean] || {});
    }

    getAllBrew(pageClean) {
        return Object.values(this._cacheBrewLists[pageClean] || {});
    }

    set(pageClean, sourceClean, hashClean, ent) {
        let pageCache = this._cache[pageClean];
        if (!pageCache) {
            pageCache = {};
            this._cache[pageClean] = pageCache;
        }

        let sourceCache = pageCache[sourceClean];
        if (!sourceCache) {
            sourceCache = {};
            pageCache[sourceClean] = sourceCache;
        }

        sourceCache[hashClean] = ent;

        if (ent === _DataLoaderConst.ENTITY_NULL)
            return;

        switch (this._set_getPartition(ent)) {
        case this.constructor._PARTITION_SITE:
            {
                return this._set_addToPartition({
                    cache: this._cacheSiteLists,
                    pageClean,
                    hashClean,
                    ent,
                });
            }

        case this.constructor._PARTITION_PRERELEASE:
            {
                return this._set_addToPartition({
                    cache: this._cachePrereleaseLists,
                    pageClean,
                    hashClean,
                    ent,
                });
            }

        case this.constructor._PARTITION_BREW:
            {
                return this._set_addToPartition({
                    cache: this._cacheBrewLists,
                    pageClean,
                    hashClean,
                    ent,
                });
            }

        }
    }

    _set_getPartition(ent) {
        if (ent.adventure)
            return this._set_getPartition_fromSource(SourceUtil.getEntitySource(ent.adventure));
        if (ent.book)
            return this._set_getPartition_fromSource(SourceUtil.getEntitySource(ent.book));

        if (ent.__prop !== "item" || ent._category !== "Specific Variant")
            return this._set_getPartition_fromSource(SourceUtil.getEntitySource(ent));

        const entitySource = SourceUtil.getEntitySource(ent);
        const partitionBaseitem = this._set_getPartition_fromSource(entitySource);
        const partitionMagicvariant = this._set_getPartition_fromSource(ent._baseSource ?? entitySource);

        if (partitionBaseitem === partitionMagicvariant && partitionBaseitem === this.constructor._PARTITION_SITE)
            return this.constructor._PARTITION_SITE;
        if (partitionBaseitem === this.constructor._PARTITION_BREW || partitionMagicvariant === this.constructor._PARTITION_BREW)
            return this.constructor._PARTITION_BREW;
        return this.constructor._PARTITION_PRERELEASE;
    }

    _set_getPartition_fromSource(partitionSource) {
        if (SourceUtil.isSiteSource(partitionSource))
            return this.constructor._PARTITION_SITE;
        if (PrereleaseUtil.hasSourceJson(partitionSource))
            return this.constructor._PARTITION_PRERELEASE;
        if (BrewUtil2.hasSourceJson(partitionSource))
            return this.constructor._PARTITION_BREW;
        return this.constructor._PARTITION_UNKNOWN;
    }

    _set_addToPartition({cache, pageClean, hashClean, ent}) {
        let siteListCache = cache[pageClean];
        if (!siteListCache) {
            siteListCache = {};
            cache[pageClean] = siteListCache;
        }
        siteListCache[hashClean] = ent;
    }
}

class _DataTypeLoader {
    static PROPS = [];
    static PAGE = null;
    static IS_FLUFF = false;

    static register({fnRegister}) {
        fnRegister({
            loader: new this(),
            props: this.PROPS,
            page: this.PAGE,
            isFluff: this.IS_FLUFF,
        });
    }

    static _getAsRawPrefixed(json, {propsRaw}) {
        return {
            ...propsRaw.mergeMap(prop=>({
                [`raw_${prop}`]: json[prop]
            })),
        };
    }

    phase1CachePropAllowlist;

    phase2CachePropAllowlist;

    hasPhase2Cache = false;

    _cache_pSiteData = {};
    _cache_pPostCaches = {};

    _getSiteIdent({pageClean, sourceClean}) {
        throw new Error("Unimplemented!");
    }

    _isPrereleaseAvailable() {
        return typeof PrereleaseUtil !== "undefined";
    }

    _isBrewAvailable() {
        return typeof BrewUtil2 !== "undefined";
    }

    async _pPrePopulate({data, isPrerelease, isBrew}) {}

    async pGetSiteData({pageClean, sourceClean}) {
        const propCache = this._getSiteIdent({
            pageClean,
            sourceClean
        });
        this._cache_pSiteData[propCache] = this._cache_pSiteData[propCache] || this._pGetSiteData({
            pageClean,
            sourceClean
        });
        return this._cache_pSiteData[propCache];
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        throw new Error("Unimplemented!");
    }

    async pGetStoredPrereleaseData() {
        if (!this._isPrereleaseAvailable())
            return {};
        return this._pGetStoredPrereleaseData();
    }

    async pGetStoredBrewData() {
        if (!this._isBrewAvailable())
            return {};
        return this._pGetStoredBrewData();
    }

    async _pGetStoredPrereleaseData() {
        return this._pGetStoredPrereleaseBrewData({
            brewUtil: PrereleaseUtil,
            isPrerelease: true
        });
    }

    async _pGetStoredBrewData() {
        return this._pGetStoredPrereleaseBrewData({
            brewUtil: BrewUtil2,
            isBrew: true
        });
    }

    async _pGetStoredPrereleaseBrewData({brewUtil, isPrerelease, isBrew}) {
        const prereleaseBrewData = await brewUtil.pGetBrewProcessed();
        await this._pPrePopulate({
            data: prereleaseBrewData,
            isPrerelease,
            isBrew
        });
        return prereleaseBrewData;
    }

    async pGetPostCacheData({siteData=null, prereleaseData=null, brewData=null, lockToken2}) {}

    async _pGetPostCacheData_obj_withCache({obj, propCache, lockToken2}) {
        this._cache_pPostCaches[propCache] = this._cache_pPostCaches[propCache] || this._pGetPostCacheData_obj({
            obj,
            lockToken2
        });
        return this._cache_pPostCaches[propCache];
    }

    async _pGetPostCacheData_obj({obj, lockToken2}) {
        throw new Error("Unimplemented!");
    }

    hasCustomCacheStrategy({obj}) {
        return false;
    }

    addToCacheCustom({cache, obj}) {}
}

class _DataTypeLoaderSingleSource extends _DataTypeLoader {
    _filename;

    _getSiteIdent({pageClean, sourceClean}) {
        return this._filename;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        return DataUtil.loadJSON(`${Renderer.get().baseUrl}data/${this._filename}`);
    }
}

class _DataTypeLoaderBackground extends _DataTypeLoaderSingleSource {
    static PROPS = ["background"];
    static PAGE = UrlUtil.PG_BACKGROUNDS;

    _filename = "backgrounds.json";
}

class _DataTypeLoaderPsionic extends _DataTypeLoaderSingleSource {
    static PROPS = ["psionic"];
    static PAGE = UrlUtil.PG_PSIONICS;

    _filename = "psionics.json";
}

class _DataTypeLoaderObject extends _DataTypeLoaderSingleSource {
    static PROPS = ["object"];
    static PAGE = UrlUtil.PG_OBJECTS;

    _filename = "objects.json";
}

class _DataTypeLoaderAction extends _DataTypeLoaderSingleSource {
    static PROPS = ["action"];
    static PAGE = UrlUtil.PG_ACTIONS;

    _filename = "actions.json";
}

class _DataTypeLoaderFeat extends _DataTypeLoaderSingleSource {
    static PROPS = ["feat"];
    static PAGE = UrlUtil.PG_FEATS;

    _filename = "feats.json";
}

class _DataTypeLoaderOptionalfeature extends _DataTypeLoaderSingleSource {
    static PROPS = ["optionalfeature"];
    static PAGE = UrlUtil.PG_OPT_FEATURES;

    _filename = "optionalfeatures.json";
}

class _DataTypeLoaderReward extends _DataTypeLoaderSingleSource {
    static PROPS = ["reward"];
    static PAGE = UrlUtil.PG_REWARDS;

    _filename = "rewards.json";
}

class _DataTypeLoaderCharoption extends _DataTypeLoaderSingleSource {
    static PROPS = ["charoption"];
    static PAGE = UrlUtil.PG_CHAR_CREATION_OPTIONS;

    _filename = "charcreationoptions.json";
}

class _DataTypeLoaderTrapHazard extends _DataTypeLoaderSingleSource {
    static PROPS = ["trap", "hazard"];
    static PAGE = UrlUtil.PG_TRAPS_HAZARDS;

    _filename = "trapshazards.json";
}

class _DataTypeLoaderCultBoon extends _DataTypeLoaderSingleSource {
    static PROPS = ["cult", "boon"];
    static PAGE = UrlUtil.PG_CULTS_BOONS;

    _filename = "cultsboons.json";
}

class _DataTypeLoaderVehicle extends _DataTypeLoaderSingleSource {
    static PROPS = ["vehicle", "vehicleUpgrade"];
    static PAGE = UrlUtil.PG_VEHICLES;

    _filename = "vehicles.json";
}

class _DataTypeLoaderConditionDisease extends _DataTypeLoaderSingleSource {
    static PROPS = ["condition", "disease", "status"];
    static PAGE = UrlUtil.PG_CONDITIONS_DISEASES;

    _filename = "conditionsdiseases.json";
}

class _DataTypeLoaderSkill extends _DataTypeLoaderSingleSource {
    static PROPS = ["skill"];

    _filename = "skills.json";
}

class _DataTypeLoaderSense extends _DataTypeLoaderSingleSource {
    static PROPS = ["sense"];

    _filename = "senses.json";
}

class _DataTypeLoaderLegendaryGroup extends _DataTypeLoaderSingleSource {
    static PROPS = ["legendaryGroup"];

    _filename = "bestiary/legendarygroups.json";
}

class _DataTypeLoaderItemEntry extends _DataTypeLoaderSingleSource {
    static PROPS = ["itemEntry"];

    _filename = "items-base.json";
}

class _DataTypeLoaderItemMastery extends _DataTypeLoaderSingleSource {
    static PROPS = ["itemMastery"];

    _filename = "items-base.json";

    async _pPrePopulate({data, isPrerelease, isBrew}) {
        await Renderer.item.pGetSiteUnresolvedRefItems();
        Renderer.item.addPrereleaseBrewPropertiesAndTypesFrom({
            data
        });
    }
}

class _DataTypeLoaderBackgroundFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["backgroundFluff"];
    static PAGE = UrlUtil.PG_BACKGROUNDS;
    static IS_FLUFF = true;

    _filename = "fluff-backgrounds.json";
}

class _DataTypeLoaderFeatFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["featFluff"];
    static PAGE = UrlUtil.PG_FEATS;
    static IS_FLUFF = true;

    _filename = "fluff-feats.json";
}

class _DataTypeLoaderItemFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["itemFluff"];
    static PAGE = UrlUtil.PG_ITEMS;
    static IS_FLUFF = true;

    _filename = "fluff-items.json";
}

class _DataTypeLoaderRaceFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["raceFluff"];
    static PAGE = UrlUtil.PG_RACES;
    static IS_FLUFF = true;

    _filename = "fluff-races.json";
}

class _DataTypeLoaderLanguageFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["languageFluff"];
    static PAGE = UrlUtil.PG_LANGUAGES;
    static IS_FLUFF = true;

    _filename = "fluff-languages.json";
}

class _DataTypeLoaderVehicleFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["vehicleFluff"];
    static PAGE = UrlUtil.PG_VEHICLES;
    static IS_FLUFF = true;

    _filename = "fluff-vehicles.json";
}

class _DataTypeLoaderObjectFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["objectFluff"];
    static PAGE = UrlUtil.PG_OBJECTS;
    static IS_FLUFF = true;

    _filename = "fluff-objects.json";
}

class _DataTypeLoaderCharoptionFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["charoptionFluff"];
    static PAGE = UrlUtil.PG_CHAR_CREATION_OPTIONS;
    static IS_FLUFF = true;

    _filename = "fluff-charcreationoptions.json";
}

class _DataTypeLoaderRecipeFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["recipeFluff"];
    static PAGE = UrlUtil.PG_RECIPES;
    static IS_FLUFF = true;

    _filename = "fluff-recipes.json";
}

class _DataTypeLoaderConditionDiseaseFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["conditionFluff", "diseaseFluff", "statusFluff"];
    static PAGE = UrlUtil.PG_CONDITIONS_DISEASES;
    static IS_FLUFF = true;

    _filename = "fluff-conditionsdiseases.json";
}

class _DataTypeLoaderTrapHazardFluff extends _DataTypeLoaderSingleSource {
    static PROPS = ["trapFluff", "hazardFluff"];
    static PAGE = UrlUtil.PG_TRAPS_HAZARDS;
    static IS_FLUFF = true;

    _filename = "fluff-trapshazards.json";
}

class _DataTypeLoaderPredefined extends _DataTypeLoader {
    _loader;
    _loadJsonArgs = null;
    _loadPrereleaseArgs = null;
    _loadBrewArgs = null;

    _getSiteIdent({pageClean, sourceClean}) {
        return this._loader;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        return DataUtil[this._loader].loadJSON(this._loadJsonArgs);
    }

    async _pGetStoredPrereleaseData() {
        if (!DataUtil[this._loader].loadPrerelease)
            return super._pGetStoredPrereleaseData();
        return DataUtil[this._loader].loadPrerelease(this._loadPrereleaseArgs);
    }

    async _pGetStoredBrewData() {
        if (!DataUtil[this._loader].loadBrew)
            return super._pGetStoredBrewData();
        return DataUtil[this._loader].loadBrew(this._loadBrewArgs);
    }
}

class _DataTypeLoaderRace extends _DataTypeLoaderPredefined {
    static PROPS = [...UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_RACES]];
    static PAGE = UrlUtil.PG_RACES;

    _loader = "race";
    _loadJsonArgs = {
        isAddBaseRaces: true
    };
    _loadPrereleaseArgs = {
        isAddBaseRaces: true
    };
    _loadBrewArgs = {
        isAddBaseRaces: true
    };
}

class _DataTypeLoaderDeity extends _DataTypeLoaderPredefined {
    static PROPS = ["deity"];
    static PAGE = UrlUtil.PG_DEITIES;

    _loader = "deity";
}

class _DataTypeLoaderVariantrule extends _DataTypeLoaderPredefined {
    static PROPS = ["variantrule"];
    static PAGE = UrlUtil.PG_VARIANTRULES;

    _loader = "variantrule";
}

class _DataTypeLoaderTable extends _DataTypeLoaderPredefined {
    static PROPS = ["table", "tableGroup"];
    static PAGE = UrlUtil.PG_TABLES;

    _loader = "table";
}

class _DataTypeLoaderLanguage extends _DataTypeLoaderPredefined {
    static PROPS = ["language"];
    static PAGE = UrlUtil.PG_LANGUAGES;

    _loader = "language";
}

class _DataTypeLoaderRecipe extends _DataTypeLoaderPredefined {
    static PROPS = ["recipe"];
    static PAGE = UrlUtil.PG_RECIPES;

    _loader = "recipe";
}

class _DataTypeLoaderMultiSource extends _DataTypeLoader {
    _prop;

    _getSiteIdent({pageClean, sourceClean}) {
        return `${this._prop}__${sourceClean.toString()}`;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        const data = await this._pGetSiteData_data({
            sourceClean
        });

        if (data == null)
            return {};

        await this._pPrePopulate({
            data
        });

        return data;
    }

    async _pGetSiteData_data({sourceClean}) {
        if (sourceClean === _DataLoaderConst.SOURCE_SITE_ALL)
            return this._pGetSiteDataAll();

        const source = Parser.sourceJsonToJson(sourceClean);
        return DataUtil[this._prop].pLoadSingleSource(source);
    }

    async _pGetSiteDataAll() {
        return DataUtil[this._prop].loadJSON();
    }
}

class _DataTypeLoaderCustomMonster extends _DataTypeLoaderMultiSource {
    static PROPS = ["monster"];
    static PAGE = UrlUtil.PG_BESTIARY;

    _prop = "monster";

    async _pGetSiteData({pageClean, sourceClean}) {
        await DataUtil.monster.pPreloadMeta();
        return super._pGetSiteData({
            pageClean,
            sourceClean
        });
    }

    async _pPrePopulate({data, isPrerelease, isBrew}) {
        DataUtil.monster.populateMetaReference(data);
    }
}

class _DataTypeLoaderCustomMonsterFluff extends _DataTypeLoaderMultiSource {
    static PROPS = ["monsterFluff"];
    static PAGE = UrlUtil.PG_BESTIARY;
    static IS_FLUFF = true;

    _prop = "monsterFluff";
}

class _DataTypeLoaderCustomSpell extends _DataTypeLoaderMultiSource {
    static PROPS = [...UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_SPELLS]];
    static PAGE = UrlUtil.PG_SPELLS;

    _prop = "spell";

    async _pPrePopulate({data, isPrerelease, isBrew}) {
        Renderer.spell.prePopulateHover(data);
        if (isPrerelease)
            Renderer.spell.prePopulateHoverPrerelease(data);
        if (isBrew)
            Renderer.spell.prePopulateHoverBrew(data);
    }
}

class _DataTypeLoaderCustomSpellFluff extends _DataTypeLoaderMultiSource {
    static PROPS = ["spellFluff"];
    static PAGE = UrlUtil.PG_SPELLS;
    static IS_FLUFF = true;

    _prop = "spellFluff";
}

class _DataTypeLoaderCustomRawable extends _DataTypeLoader {
    static _PROPS_RAWABLE;

    hasPhase2Cache = true;

    _getSiteIdent({pageClean, sourceClean}) {
        return `${pageClean}__${this.constructor.name}`;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        const json = await this._pGetRawSiteData();
        return this.constructor._getAsRawPrefixed(json, {
            propsRaw: this.constructor._PROPS_RAWABLE
        });
    }

    async _pGetRawSiteData() {
        throw new Error("Unimplemented!");
    }

    async _pGetStoredPrereleaseBrewData({brewUtil, isPrerelease, isBrew}) {
        const prereleaseBrew = await brewUtil.pGetBrewProcessed();
        return this.constructor._getAsRawPrefixed(prereleaseBrew, {
            propsRaw: this.constructor._PROPS_RAWABLE
        });
    }

    static _pGetDereferencedData_doNotifyFailed({ent, uids, prop}) {
        const missingRefSets = {
            [prop]: new Set(uids),
        };

        _DataLoaderInternalUtil.doNotifyFailedDereferences({
            missingRefSets,
            diagnostics: [ent.__diagnostic].filter(Boolean),
        });
    }
}

class _DataTypeLoaderCustomClassesSubclass extends _DataTypeLoaderCustomRawable {
    static PROPS = ["raw_class", "raw_subclass", "class", "subclass"];
    static PAGE = UrlUtil.PG_CLASSES;

    static _PROPS_RAWABLE = ["class", "subclass"];

    async _pGetRawSiteData() {
        return DataUtil.class.loadRawJSON();
    }

    async _pGetPostCacheData_obj({obj, lockToken2}) {
        if (!obj)
            return null;

        const out = {};

        if (obj.raw_class?.length)
            out.class = await obj.raw_class.pSerialAwaitMap(cls=>this.constructor._pGetDereferencedClassData(cls, {
                lockToken2
            }));
        if (obj.raw_subclass?.length)
            out.subclass = await obj.raw_subclass.pSerialAwaitMap(sc=>this.constructor._pGetDereferencedSubclassData(sc, {
                lockToken2
            }));

        return out;
    }

    static _mutEntryNestLevel(feature) {
        const depth = (feature.header == null ? 1 : feature.header) - 1;
        for (let i = 0; i < depth; ++i) {
            const nxt = MiscUtil.copyFast(feature);
            feature.entries = [nxt];
            delete feature.name;
            delete feature.page;
            delete feature.source;
        }
    }

    static async _pGetDereferencedClassData(cls, {lockToken2}) {
        if (cls.classFeatures && cls.classFeatures.every(it=>typeof it !== "string" && !it.classFeature))
            return cls;

        cls = MiscUtil.copyFast(cls);

        const byLevel = await this._pGetDereferencedClassSubclassData(cls, {
            lockToken2,
            propFeatures: "classFeatures",
            propFeature: "classFeature",
            fnUnpackUid: DataUtil.class.unpackUidClassFeature.bind(DataUtil.class),
            fnIsInvalidUnpackedUid: ({name, className, level})=>!name || !className || !level || isNaN(level),
        }, );

        cls.classFeatures = [...new Array(Math.max(0, ...Object.keys(byLevel).map(Number)))].map((_,i)=>byLevel[i + 1] || []);

        return cls;
    }

    static async _pGetDereferencedSubclassData(sc, {lockToken2}) {
        if (sc.subclassFeatures && sc.subclassFeatures.every(it=>typeof it !== "string" && !it.subclassFeature))
            return sc;

        sc = MiscUtil.copyFast(sc);

        const byLevel = await this._pGetDereferencedClassSubclassData(sc, {
            lockToken2,
            propFeatures: "subclassFeatures",
            propFeature: "subclassFeature",
            fnUnpackUid: DataUtil.class.unpackUidSubclassFeature.bind(DataUtil.class),
            fnIsInvalidUnpackedUid: ({name, className, subclassShortName, level})=>!name || !className || !subclassShortName || !level || isNaN(level),
        }, );

        sc.subclassFeatures = Object.keys(byLevel).map(Number).sort(SortUtil.ascSort).map(k=>byLevel[k]);

        return sc;
    }

    static async _pGetDereferencedClassSubclassData(clsOrSc, {lockToken2, propFeatures, propFeature, fnUnpackUid, fnIsInvalidUnpackedUid, }, ) {
        if (clsOrSc[propFeatures] && clsOrSc[propFeatures].every(it=>typeof it !== "string" && !it[propFeature]))
            return clsOrSc;

        clsOrSc = MiscUtil.copyFast(clsOrSc);

        const byLevel = {};
        const notFoundUids = [];

        await (clsOrSc[propFeatures] || []).pSerialAwaitMap(async featureRef=>{
            const uid = featureRef[propFeature] ? featureRef[propFeature] : featureRef;
            const unpackedUid = fnUnpackUid(uid);
            const {source, displayText} = unpackedUid;

            if (fnIsInvalidUnpackedUid(unpackedUid))
                return;

            if (source === Parser.SRC_5ETOOLS_TMP)
                return;

            const hash = UrlUtil.URL_TO_HASH_BUILDER[propFeature](unpackedUid);

            if (ExcludeUtil.isInitialised && ExcludeUtil.isExcluded(hash, propFeature, source, {
                isNoCount: true
            }))
                return;

            const feature = await DataLoader.pCacheAndGet(propFeature, source, hash, {
                isCopy: true,
                lockToken2
            });
            if (!feature)
                return notFoundUids.push(uid);

            if (displayText)
                feature._displayName = displayText;
            if (featureRef.tableDisplayName)
                feature._displayNameTable = featureRef.tableDisplayName;

            if (featureRef.gainSubclassFeature)
                feature.gainSubclassFeature = true;
            if (featureRef.gainSubclassFeatureHasContent)
                feature.gainSubclassFeatureHasContent = true;

            if (clsOrSc.otherSources && clsOrSc.source === feature.source)
                feature.otherSources = MiscUtil.copyFast(clsOrSc.otherSources);

            this._mutEntryNestLevel(feature);

            (byLevel[feature.level || 1] = byLevel[feature.level || 1] || []).push(feature);
        }
        );

        this._pGetDereferencedData_doNotifyFailed({
            ent: clsOrSc,
            uids: notFoundUids,
            prop: propFeature
        });

        return byLevel;
    }

    async pGetPostCacheData({siteData=null, prereleaseData=null, brewData=null, lockToken2}) {
        return {
            siteDataPostCache: await this._pGetPostCacheData_obj_withCache({
                obj: siteData,
                lockToken2,
                propCache: "site"
            }),
            prereleaseDataPostCache: await this._pGetPostCacheData_obj({
                obj: prereleaseData,
                lockToken2
            }),
            brewDataPostCache: await this._pGetPostCacheData_obj({
                obj: brewData,
                lockToken2
            }),
        };
    }
}

class _DataTypeLoaderCustomClassSubclassFeature extends _DataTypeLoader {
    static PROPS = ["raw_classFeature", "raw_subclassFeature", "classFeature", "subclassFeature"];
    static PAGE = UrlUtil.PG_CLASS_SUBCLASS_FEATURES;

    static _PROPS_RAWABLE = ["classFeature", "subclassFeature"];

    hasPhase2Cache = true;

    _getSiteIdent({pageClean, sourceClean}) {
        return `${pageClean}__${this.constructor.name}`;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        const json = await DataUtil.class.loadRawJSON();
        return this.constructor._getAsRawPrefixed(json, {
            propsRaw: this.constructor._PROPS_RAWABLE
        });
    }

    async _pGetStoredPrereleaseBrewData({brewUtil, isPrerelease, isBrew}) {
        const prereleaseBrew = await brewUtil.pGetBrewProcessed();
        return this.constructor._getAsRawPrefixed(prereleaseBrew, {
            propsRaw: this.constructor._PROPS_RAWABLE
        });
    }

    async _pGetPostCacheData_obj({obj, lockToken2}) {
        if (!obj)
            return null;

        const out = {};

        if (obj.raw_classFeature?.length)
            out.classFeature = (await _DataLoaderDereferencer.pGetDereferenced(obj.raw_classFeature, "classFeature"))?.classFeature || [];
        if (obj.raw_subclassFeature?.length)
            out.subclassFeature = (await _DataLoaderDereferencer.pGetDereferenced(obj.raw_subclassFeature, "subclassFeature"))?.subclassFeature || [];

        return out;
    }

    async pGetPostCacheData({siteData=null, prereleaseData=null, brewData=null, lockToken2}) {
        return {
            siteDataPostCache: await this._pGetPostCacheData_obj_withCache({
                obj: siteData,
                lockToken2,
                propCache: "site"
            }),
            prereleaseDataPostCache: await this._pGetPostCacheData_obj({
                obj: prereleaseData,
                lockToken2
            }),
            brewDataPostCache: await this._pGetPostCacheData_obj({
                obj: brewData,
                lockToken2
            }),
        };
    }
}

class _DataTypeLoaderCustomItem extends _DataTypeLoader {
    static PROPS = [...UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_ITEMS]];
    static PAGE = UrlUtil.PG_ITEMS;

    phase1CachePropAllowlist = new Set(["itemEntry"]);

    hasPhase2Cache = true;

    _getSiteIdent({pageClean, sourceClean}) {
        return this.constructor.name;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        return Renderer.item.pGetSiteUnresolvedRefItems();
    }

    async _pGetStoredPrereleaseBrewData({brewUtil, isPrerelease, isBrew}) {
        const prereleaseBrewData = await brewUtil.pGetBrewProcessed();
        await this._pPrePopulate({
            data: prereleaseBrewData,
            isPrerelease,
            isBrew
        });
        return {
            item: await Renderer.item.pGetSiteUnresolvedRefItemsFromPrereleaseBrew({
                brewUtil,
                brew: prereleaseBrewData
            }),
            itemEntry: prereleaseBrewData.itemEntry || [],
        };
    }

    async _pPrePopulate({data, isPrerelease, isBrew}) {
        Renderer.item.addPrereleaseBrewPropertiesAndTypesFrom({
            data
        });
    }

    async _pGetPostCacheData_obj({siteData, obj, lockToken2}) {
        if (!obj)
            return null;

        const out = {};

        if (obj.item?.length) {
            out.item = (await _DataLoaderDereferencer.pGetDereferenced(obj.item, "item", {
                propEntries: "entries",
                propIsRef: "hasRefs"
            }))?.item || [];
            out.item = (await _DataLoaderDereferencer.pGetDereferenced(out.item, "item", {
                propEntries: "_fullEntries",
                propIsRef: "hasRefs"
            }))?.item || [];
        }

        return out;
    }

    async pGetPostCacheData({siteData=null, prereleaseData=null, brewData=null, lockToken2}) {
        return {
            siteDataPostCache: await this._pGetPostCacheData_obj_withCache({
                obj: siteData,
                lockToken2,
                propCache: "site"
            }),
            prereleaseDataPostCache: await this._pGetPostCacheData_obj({
                obj: prereleaseData,
                lockToken2
            }),
            brewDataPostCache: await this._pGetPostCacheData_obj({
                obj: brewData,
                lockToken2
            }),
        };
    }
}

class _DataTypeLoaderCustomCard extends _DataTypeLoader {
    static PROPS = ["card"];
    static PAGE = UrlUtil.PG_DECKS;

    _getSiteIdent({pageClean, sourceClean}) {
        return `${pageClean}__${this.constructor.name}`;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        const json = await DataUtil.deck.loadRawJSON();
        return {
            card: json.card
        };
    }
}

class _DataTypeLoaderCustomDeck extends _DataTypeLoaderCustomRawable {
    static PROPS = ["raw_deck", "deck"];
    static PAGE = UrlUtil.PG_DECKS;

    static _PROPS_RAWABLE = ["deck"];

    async _pGetRawSiteData() {
        return DataUtil.deck.loadRawJSON();
    }

    async _pGetPostCacheData_obj({obj, lockToken2}) {
        if (!obj)
            return null;

        const out = {};

        if (obj.raw_deck?.length)
            out.deck = await obj.raw_deck.pSerialAwaitMap(ent=>this.constructor._pGetDereferencedDeckData(ent, {
                lockToken2
            }));

        return out;
    }

    static async _pGetDereferencedDeckData(deck, {lockToken2}) {
        deck = MiscUtil.copyFast(deck);

        deck.cards = await this._pGetDereferencedCardData(deck, {
            lockToken2
        });

        return deck;
    }

    static async _pGetDereferencedCardData(deck, {lockToken2}) {
        const notFoundUids = [];

        const out = (await (deck.cards || []).pSerialAwaitMap(async cardMeta=>{
            const uid = typeof cardMeta === "string" ? cardMeta : cardMeta.uid;
            const count = typeof cardMeta === "string" ? 1 : cardMeta.count ?? 1;
            const isReplacement = typeof cardMeta === "string" ? false : cardMeta.replacement ?? false;

            const unpackedUid = DataUtil.deck.unpackUidCard(uid);
            const {source} = unpackedUid;

            if (unpackedUid.name == null || unpackedUid.set == null || unpackedUid.source == null)
                return;

            const hash = UrlUtil.URL_TO_HASH_BUILDER["card"](unpackedUid);

            if (ExcludeUtil.isInitialised && ExcludeUtil.isExcluded(hash, "card", source, {
                isNoCount: true
            }))
                return;

            const card = await DataLoader.pCacheAndGet("card", source, hash, {
                isCopy: true,
                lockToken2
            });
            if (!card)
                return notFoundUids.push(uid);

            if (deck.otherSources && deck.source === card.source)
                card.otherSources = MiscUtil.copyFast(deck.otherSources);
            if (isReplacement)
                card._isReplacement = true;

            return [...new Array(count)].map(()=>MiscUtil.copyFast(card));
        }
        )).flat().filter(Boolean);

        this._pGetDereferencedData_doNotifyFailed({
            ent: deck,
            uids: notFoundUids,
            prop: "card"
        });

        return out;
    }

    async pGetPostCacheData({siteData=null, prereleaseData=null, brewData=null, lockToken2}) {
        return {
            siteDataPostCache: await this._pGetPostCacheData_obj_withCache({
                obj: siteData,
                lockToken2,
                propCache: "site"
            }),
            prereleaseDataPostCache: await this._pGetPostCacheData_obj({
                obj: prereleaseData,
                lockToken2
            }),
            brewDataPostCache: await this._pGetPostCacheData_obj({
                obj: brewData,
                lockToken2
            }),
        };
    }
}

class _DataTypeLoaderCustomQuickref extends _DataTypeLoader {
    static PROPS = ["reference", "referenceData"];
    static PAGE = UrlUtil.PG_QUICKREF;

    _getSiteIdent({pageClean, sourceClean}) {
        return this.constructor.name;
    }

    _isPrereleaseAvailable() {
        return false;
    }

    _isBrewAvailable() {
        return false;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        const json = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/generated/bookref-quick.json`);
        return {
            reference: json.reference["bookref-quick"],
            referenceData: json.data["bookref-quick"],
        };
    }

    hasCustomCacheStrategy({obj}) {
        return this.constructor.PROPS.some(prop=>obj[prop]?.length);
    }

    addToCacheCustom({cache, obj}) {
        obj.referenceData.forEach((chapter,ixChapter)=>this._addToCacheCustom_chapter({
            cache,
            chapter,
            ixChapter
        }));
        return [...this.constructor.PROPS];
    }

    _addToCacheCustom_chapter({cache, chapter, ixChapter}) {
        const metas = IndexableFileQuickReference.getChapterNameMetas(chapter, {
            isRequireQuickrefFlag: false
        });

        metas.forEach(nameMeta=>{
            const hashParts = ["bookref-quick", ixChapter, UrlUtil.encodeForHash(nameMeta.name.toLowerCase()), ];
            if (nameMeta.ixBook)
                hashParts.push(nameMeta.ixBook);

            const hash = hashParts.join(HASH_PART_SEP);

            const {page: pageClean, source: sourceClean, hash: hashClean} = _DataLoaderInternalUtil.getCleanPageSourceHash({
                page: UrlUtil.PG_QUICKREF,
                source: nameMeta.source,
                hash,
            });
            cache.set(pageClean, sourceClean, hashClean, nameMeta.entry);

            if (nameMeta.ixBook)
                return;

            hashParts.push(nameMeta.ixBook);
            const hashAlt = hashParts.join(HASH_PART_SEP);
            const hashAltClean = _DataLoaderInternalUtil.getCleanHash({
                hash: hashAlt
            });
            cache.set(pageClean, sourceClean, hashAltClean, nameMeta.entry);
        }
        );
    }
}

class _DataTypeLoaderCustomAdventureBook extends _DataTypeLoader {
    _filename;

    _getSiteIdent({pageClean, sourceClean}) {
        return `${pageClean}__${sourceClean}`;
    }

    hasCustomCacheStrategy({obj}) {
        return this.constructor.PROPS.some(prop=>obj[prop]?.length);
    }

    addToCacheCustom({cache, obj}) {
        const [prop,propData] = this.constructor.PROPS;

        const dataIds = (obj[propData] || []).filter(it=>it.id).map(it=>it.id);
        const contentsIds = new Set((obj[prop] || []).filter(it=>it.id).map(it=>it.id));
        const matchingIds = dataIds.filter(id=>contentsIds.has(id));

        matchingIds.forEach(id=>{
            const data = (obj[propData] || []).find(it=>it.id === id);
            const contents = (obj[prop] || []).find(it=>it.id === id);

            const hash = UrlUtil.URL_TO_HASH_BUILDER[this.constructor.PAGE](contents);
            this._addImageBackReferences(data, this.constructor.PAGE, contents.source, hash);

            const {page: pageClean, source: sourceClean, hash: hashClean} = _DataLoaderInternalUtil.getCleanPageSourceHash({
                page: this.constructor.PAGE,
                source: contents.source,
                hash,
            });

            const pack = {
                [prop]: contents,
                [propData]: data,
            };

            cache.set(pageClean, sourceClean, hashClean, pack);
        }
        );

        return [prop, propData];
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        const [prop,propData] = this.constructor.PROPS;

        const index = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/${this._filename}`);
        const contents = index[prop].find(contents=>_DataLoaderInternalUtil.getCleanSource({
            source: contents.source
        }) === sourceClean);

        if (!contents)
            return {};

        const json = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/${prop}/${prop}-${UrlUtil.encodeForHash(contents.id.toLowerCase())}.json`);

        return {
            [prop]: [contents],
            [propData]: [{
                source: contents.source,
                id: contents.id,
                ...json,
            }, ],
        };
    }

    _addImageBackReferences(json, page, source, hash) {
        if (!json)
            return;

        const walker = MiscUtil.getWalker({
            keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
            isNoModification: true
        });
        walker.walk(json, {
            object: (obj)=>{
                if (obj.type === "image" && obj.mapRegions) {
                    obj.page = obj.page || page;
                    obj.source = obj.source || source;
                    obj.hash = obj.hash || hash;
                }
            }
            ,
        }, );
    }
}

class _DataTypeLoaderCustomAdventure extends _DataTypeLoaderCustomAdventureBook {
    static PROPS = ["adventure", "adventureData"];
    static PAGE = UrlUtil.PG_ADVENTURE;

    _filename = "adventures.json";
}

class _DataTypeLoaderCustomBook extends _DataTypeLoaderCustomAdventureBook {
    static PROPS = ["book", "bookData"];
    static PAGE = UrlUtil.PG_BOOK;

    _filename = "books.json";
}

class _DataTypeLoaderCitation extends _DataTypeLoader {
    static PROPS = ["citation"];

    _getSiteIdent({pageClean, sourceClean}) {
        return this.constructor.name;
    }

    async _pGetSiteData({pageClean, sourceClean}) {
        return {
            citation: []
        };
    }
}

class DataLoader {
    static _PROP_TO_HASH_PAGE = {
        "monster": UrlUtil.PG_BESTIARY,
        "spell": UrlUtil.PG_SPELLS,
        "class": UrlUtil.PG_CLASSES,
        "subclass": UrlUtil.PG_CLASSES,
        "item": UrlUtil.PG_ITEMS,
        "background": UrlUtil.PG_BACKGROUNDS,
        "psionic": UrlUtil.PG_PSIONICS,
        "object": UrlUtil.PG_OBJECTS,
        "action": UrlUtil.PG_ACTIONS,
        "trap": UrlUtil.PG_TRAPS_HAZARDS,
        "hazard": UrlUtil.PG_TRAPS_HAZARDS,
        "cult": UrlUtil.PG_CULTS_BOONS,
        "boon": UrlUtil.PG_CULTS_BOONS,
        "condition": UrlUtil.PG_CONDITIONS_DISEASES,
        "deck": UrlUtil.PG_DECKS,
        "disease": UrlUtil.PG_CONDITIONS_DISEASES,
        "status": UrlUtil.PG_CONDITIONS_DISEASES,
        "vehicle": UrlUtil.PG_VEHICLES,
        "vehicleUpgrade": UrlUtil.PG_VEHICLES,
        "feat": UrlUtil.PG_FEATS,
        "optionalfeature": UrlUtil.PG_OPT_FEATURES,
        "reward": UrlUtil.PG_REWARDS,
        "charoption": UrlUtil.PG_CHAR_CREATION_OPTIONS,
        "race": UrlUtil.PG_RACES,
        "subrace": UrlUtil.PG_RACES,
        "deity": UrlUtil.PG_DEITIES,
        "variantrule": UrlUtil.PG_VARIANTRULES,
        "table": UrlUtil.PG_TABLES,
        "tableGroup": UrlUtil.PG_TABLES,
        "language": UrlUtil.PG_LANGUAGES,
        "recipe": UrlUtil.PG_RECIPES,
        "classFeature": UrlUtil.PG_CLASS_SUBCLASS_FEATURES,
        "subclassFeature": UrlUtil.PG_CLASS_SUBCLASS_FEATURES,
        "reference": UrlUtil.PG_QUICKREF,
        "referenceData": UrlUtil.PG_QUICKREF,
        "adventure": UrlUtil.PG_ADVENTURE,
        "adventureData": UrlUtil.PG_ADVENTURE,
        "book": UrlUtil.PG_BOOK,
        "bookData": UrlUtil.PG_BOOK,
    };

    static _DATA_TYPE_LOADERS = {};
    static _DATA_TYPE_LOADER_LIST = [];

    static _init() {
        this._registerPropToHashPages();
        this._registerDataTypeLoaders();
        return null;
    }

    static _registerPropToHashPages() {
        Object.entries(this._PROP_TO_HASH_PAGE).forEach(([k,v])=>this._PROP_TO_HASH_PAGE[`${k}Fluff`] = _DataLoaderInternalUtil.getCleanPageFluff({
            page: v
        }));
    }

    static _registerDataTypeLoader({loader, props, page, isFluff}) {
        this._DATA_TYPE_LOADER_LIST.push(loader);

        if (!props?.length)
            throw new Error(`No "props" specified for loader "${loader.constructor.name}"!`);

        props.forEach(prop=>this._DATA_TYPE_LOADERS[_DataLoaderInternalUtil.getCleanPage({
            page: prop
        })] = loader);

        if (!page)
            return;

        this._DATA_TYPE_LOADERS[isFluff ? _DataLoaderInternalUtil.getCleanPageFluff({
            page
        }) : _DataLoaderInternalUtil.getCleanPage({
            page
        })] = loader;
    }

    static _registerDataTypeLoaders() {
        const fnRegister = this._registerDataTypeLoader.bind(this);

        _DataTypeLoaderCustomMonster.register({
            fnRegister
        });
        _DataTypeLoaderCustomMonsterFluff.register({
            fnRegister
        });
        _DataTypeLoaderCustomSpell.register({
            fnRegister
        });
        _DataTypeLoaderCustomSpellFluff.register({
            fnRegister
        });

        _DataTypeLoaderRace.register({
            fnRegister
        });
        _DataTypeLoaderDeity.register({
            fnRegister
        });
        _DataTypeLoaderVariantrule.register({
            fnRegister
        });
        _DataTypeLoaderTable.register({
            fnRegister
        });
        _DataTypeLoaderLanguage.register({
            fnRegister
        });
        _DataTypeLoaderRecipe.register({
            fnRegister
        });

        _DataTypeLoaderCustomClassesSubclass.register({
            fnRegister
        });
        _DataTypeLoaderCustomClassSubclassFeature.register({
            fnRegister
        });
        _DataTypeLoaderCustomItem.register({
            fnRegister
        });
        _DataTypeLoaderCustomCard.register({
            fnRegister
        });
        _DataTypeLoaderCustomDeck.register({
            fnRegister
        });
        _DataTypeLoaderCustomQuickref.register({
            fnRegister
        });
        _DataTypeLoaderCustomAdventure.register({
            fnRegister
        });
        _DataTypeLoaderCustomBook.register({
            fnRegister
        });

        _DataTypeLoaderBackground.register({
            fnRegister
        });
        _DataTypeLoaderPsionic.register({
            fnRegister
        });
        _DataTypeLoaderObject.register({
            fnRegister
        });
        _DataTypeLoaderAction.register({
            fnRegister
        });
        _DataTypeLoaderFeat.register({
            fnRegister
        });
        _DataTypeLoaderOptionalfeature.register({
            fnRegister
        });
        _DataTypeLoaderReward.register({
            fnRegister
        });
        _DataTypeLoaderCharoption.register({
            fnRegister
        });

        _DataTypeLoaderTrapHazard.register({
            fnRegister
        });
        _DataTypeLoaderCultBoon.register({
            fnRegister
        });
        _DataTypeLoaderVehicle.register({
            fnRegister
        });

        _DataTypeLoaderConditionDisease.register({
            fnRegister
        });

        _DataTypeLoaderSkill.register({
            fnRegister
        });
        _DataTypeLoaderSense.register({
            fnRegister
        });
        _DataTypeLoaderLegendaryGroup.register({
            fnRegister
        });
        _DataTypeLoaderItemEntry.register({
            fnRegister
        });
        _DataTypeLoaderItemMastery.register({
            fnRegister
        });
        _DataTypeLoaderCitation.register({
            fnRegister
        });

        _DataTypeLoaderBackgroundFluff.register({
            fnRegister
        });
        _DataTypeLoaderFeatFluff.register({
            fnRegister
        });
        _DataTypeLoaderItemFluff.register({
            fnRegister
        });
        _DataTypeLoaderRaceFluff.register({
            fnRegister
        });
        _DataTypeLoaderLanguageFluff.register({
            fnRegister
        });
        _DataTypeLoaderVehicleFluff.register({
            fnRegister
        });
        _DataTypeLoaderObjectFluff.register({
            fnRegister
        });
        _DataTypeLoaderCharoptionFluff.register({
            fnRegister
        });
        _DataTypeLoaderRecipeFluff.register({
            fnRegister
        });

        _DataTypeLoaderConditionDiseaseFluff.register({
            fnRegister
        });
        _DataTypeLoaderTrapHazardFluff.register({
            fnRegister
        });
    }

    static _ = this._init();

    static _CACHE = new _DataLoaderCache();
    static _LOCK_1 = new VeLock({
        isDbg: false,
        name: "loader-lock-1"
    });
    static _LOCK_2 = new VeLock({
        isDbg: false,
        name: "loader-lock-2"
    });

    static getFromCache(page, source, hash, {isCopy=false, isRequired=false, _isReturnSentinel=false, _isInsertSentinelOnMiss=false, }={}, ) {
        const {page: pageClean, source: sourceClean, hash: hashClean} = _DataLoaderInternalUtil.getCleanPageSourceHash({
            page,
            source,
            hash
        });
        const ent = this._getFromCache({
            pageClean,
            sourceClean,
            hashClean,
            isCopy,
            _isReturnSentinel,
            _isInsertSentinelOnMiss
        });
        return this._getVerifiedRequiredEntity({
            pageClean,
            sourceClean,
            hashClean,
            ent,
            isRequired
        });
    }

    static _getFromCache({pageClean, sourceClean, hashClean, isCopy=false, _isInsertSentinelOnMiss=false, _isReturnSentinel=false, }, ) {
        const out = this._CACHE.get(pageClean, sourceClean, hashClean);

        if (out === _DataLoaderConst.ENTITY_NULL) {
            if (_isReturnSentinel)
                return out;
            if (!_isReturnSentinel)
                return null;
        }

        if (out == null && _isInsertSentinelOnMiss) {
            this._CACHE.set(pageClean, sourceClean, hashClean, _DataLoaderConst.ENTITY_NULL);
        }

        if (!isCopy || out == null)
            return out;
        return MiscUtil.copyFast(out);
    }

    static _getVerifiedRequiredEntity({pageClean, sourceClean, hashClean, ent, isRequired}) {
        if (ent || !isRequired)
            return ent;
        throw new Error(`Could not find entity for page/prop "${pageClean}" with source "${sourceClean}" and hash "${hashClean}"`);
    }

    static async pCacheAndGetAllSite(page, {isSilent=false}={}) {
        const pageClean = _DataLoaderInternalUtil.getCleanPage({
            page
        });

        if (this._PAGES_NO_CONTENT.has(pageClean))
            return null;

        const dataLoader = this._pCache_getDataTypeLoader({
            pageClean,
            isSilent
        });
        if (!dataLoader)
            return null;

        const {siteData} = await this._pCacheAndGet_getCacheMeta({
            pageClean,
            sourceClean: _DataLoaderConst.SOURCE_SITE_ALL,
            dataLoader
        });
        await this._pCacheAndGet_processCacheMeta({
            dataLoader,
            siteData
        });

        return this._CACHE.getAllSite(pageClean);
    }

    static async pCacheAndGetAllPrerelease(page, {isSilent=false}={}) {
        return this._CacheAndGetAllPrerelease.pCacheAndGetAll({
            parent: this,
            page,
            isSilent
        });
    }

    static async pCacheAndGetAllBrew(page, {isSilent=false}={}) {
        return this._CacheAndGetAllBrew.pCacheAndGetAll({
            parent: this,
            page,
            isSilent
        });
    }

    static _CacheAndGetAllPrereleaseBrew = class {
        static _SOURCE_ALL;
        static _PROP_DATA;

        static async pCacheAndGetAll({parent, page, isSilent, }, ) {
            const pageClean = _DataLoaderInternalUtil.getCleanPage({
                page
            });

            if (parent._PAGES_NO_CONTENT.has(pageClean))
                return null;

            const dataLoader = parent._pCache_getDataTypeLoader({
                pageClean,
                isSilent
            });
            if (!dataLoader)
                return null;

            const cacheMeta = await parent._pCacheAndGet_getCacheMeta({
                pageClean,
                sourceClean: this._SOURCE_ALL,
                dataLoader
            });
            await parent._pCacheAndGet_processCacheMeta({
                dataLoader,
                [this._PROP_DATA]: cacheMeta[this._PROP_DATA]
            });

            return this._getAllCached({
                parent,
                pageClean
            });
        }

        static _getAllCached({parent, pageClean}) {
            throw new Error("Unimplemented!");
        }
    }
    ;

    static _CacheAndGetAllPrerelease = class extends this._CacheAndGetAllPrereleaseBrew {
        static _SOURCE_ALL = _DataLoaderConst.SOURCE_PRERELEASE_ALL_CURRENT;
        static _PROP_DATA = "prereleaseData";

        static _getAllCached({parent, pageClean}) {
            return parent._CACHE.getAllPrerelease(pageClean);
        }
    }
    ;

    static _CacheAndGetAllBrew = class extends this._CacheAndGetAllPrereleaseBrew {
        static _SOURCE_ALL = _DataLoaderConst.SOURCE_BREW_ALL_CURRENT;
        static _PROP_DATA = "brewData";

        static _getAllCached({parent, pageClean}) {
            return parent._CACHE.getAllBrew(pageClean);
        }
    }
    ;

    static _PAGES_NO_CONTENT = new Set([_DataLoaderInternalUtil.getCleanPage({
        page: "generic"
    }), _DataLoaderInternalUtil.getCleanPage({
        page: "hover"
    }), ]);

    /**
	 * @param page
	 * @param source
	 * @param hash
	 * @param [isCopy] If a copy, rather than the original entity, should be returned.
	 * @param [isRequired] If an error should be thrown on a missing entity.
	 * @param [isSilent] If errors should not be thrown on a missing implementation.
	 * @param [lockToken2] Post-process lock token for recursive calls.
	 */
    static async pCacheAndGet(page, source, hash, {isCopy=false, isRequired=false, isSilent=false, lockToken2}={}) {
        const fromCache = this.getFromCache(page, source, hash, {
            isCopy,
            _isReturnSentinel: true
        });
        if (fromCache === _DataLoaderConst.ENTITY_NULL)
            return null;
        if (fromCache)
            return fromCache;

        const {page: pageClean, source: sourceClean, hash: hashClean} = _DataLoaderInternalUtil.getCleanPageSourceHash({
            page,
            source,
            hash
        });

        if (this._PAGES_NO_CONTENT.has(pageClean))
            return this._getVerifiedRequiredEntity({
                pageClean,
                sourceClean,
                hashClean,
                ent: null,
                isRequired
            });

        const dataLoader = this._pCache_getDataTypeLoader({ pageClean, isSilent });
        if (!dataLoader)
            return this._getVerifiedRequiredEntity({
                pageClean,
                sourceClean,
                hashClean,
                ent: null,
                isRequired
            });

        const isUnavailablePrerelease = await this._PrereleasePreloader._pPreloadMissing({ parent: this,  sourceClean });
        if (isUnavailablePrerelease)
            return this._getVerifiedRequiredEntity({
                pageClean,
                sourceClean,
                hashClean,
                ent: null,
                isRequired
            });

        const isUnavailableBrew = await this._BrewPreloader._pPreloadMissing({ parent: this, sourceClean });
        if (isUnavailableBrew)
            return this._getVerifiedRequiredEntity({
                pageClean,
                sourceClean,
                hashClean,
                ent: null,
                isRequired
            });

        const {siteData=null, prereleaseData=null, brewData=null}
        = await this._pCacheAndGet_getCacheMeta({ pageClean, sourceClean, dataLoader });

        await this._pCacheAndGet_processCacheMeta({ dataLoader, siteData, prereleaseData, brewData, lockToken2 });

        return this.getFromCache(page, source, hash, { isCopy, _isInsertSentinelOnMiss: true });
    }

    static async pCacheAndGetHash(page, hash, opts) {
        const source = UrlUtil.decodeHash(hash).last();
        return DataLoader.pCacheAndGet(page, source, hash, opts);
    }

    static _PrereleaseBrewPreloader = class {
        static _LOCK_0;
        static _SOURCES_ATTEMPTED;
        static _CACHE_SOURCE_CLEAN_TO_URL;
        static _SOURCE_ALL;

        static async pPreloadMissing({parent, sourceClean}) {
            try {
                await this._LOCK_0.pLock();
                return (await this._pPreloadMissing({
                    parent,
                    sourceClean
                }));
            } finally {
                this._LOCK_0.unlock();
            }
        }

        static async _pPreloadMissing({parent, sourceClean}) {
            if (this._isExistingMiss({
                parent,
                sourceClean
            }))
                return true;

            if (!this._isPossibleSource({
                parent,
                sourceClean
            }))
                return false;
            if (sourceClean === this._SOURCE_ALL)
                return false;

            const brewUtil = this._getBrewUtil();
            if (!brewUtil) {
                this._setExistingMiss({
                    parent,
                    sourceClean
                });
                return true;
            }

            if (brewUtil.hasSourceJson(sourceClean))
                return false;

            const urlBrew = await this._pGetSourceUrl({
                parent,
                sourceClean
            });
            if (!urlBrew) {
                this._setExistingMiss({
                    parent,
                    sourceClean
                });
                return true;
            }

            await brewUtil.pAddBrewFromUrl(urlBrew);
            return false;
        }

        static _isExistingMiss({sourceClean}) {
            return this._SOURCES_ATTEMPTED.has(sourceClean);
        }

        static _setExistingMiss({sourceClean}) {
            this._SOURCES_ATTEMPTED.add(sourceClean);
        }

        static async _pInitCacheSourceToUrl() {
            if (this._CACHE_SOURCE_CLEAN_TO_URL)
                return;

            const index = await this._pGetUrlIndex();
            if (!index)
                return this._CACHE_SOURCE_CLEAN_TO_URL = {};

            const brewUtil = this._getBrewUtil();
            const urlRoot = await brewUtil.pGetCustomUrl();

            this._CACHE_SOURCE_CLEAN_TO_URL = Object.entries(index).mergeMap(([src,url])=>({
                [_DataLoaderInternalUtil.getCleanSource({
                    source: src
                })]: brewUtil.getFileUrl(url, urlRoot)
            }));
        }

        static async _pGetUrlIndex() {
            try {
                return (await this._pGetSourceIndex());
            } catch (e) {
                setTimeout(()=>{
                    throw e;
                }
                );
                return null;
            }
        }

        static async _pGetSourceUrl({sourceClean}) {
            await this._pInitCacheSourceToUrl();
            return this._CACHE_SOURCE_CLEAN_TO_URL[sourceClean];
        }

        static _isPossibleSource({parent, sourceClean}) {
            throw new Error("Unimplemented!");
        }
        static _getBrewUtil() {
            throw new Error("Unimplemented!");
        }
        static _pGetSourceIndex() {
            throw new Error("Unimplemented!");
        }
    }
    ;

    static _PrereleasePreloader = class extends this._PrereleaseBrewPreloader {
        static _LOCK_0 = new VeLock({
            isDbg: false,
            name: "loader-lock-0--prerelease"
        });
        static _SOURCE_ALL = _DataLoaderConst.SOURCE_BREW_ALL_CURRENT;
        static _SOURCES_ATTEMPTED = new Set();
        static _CACHE_SOURCE_CLEAN_TO_URL = null;

        static _isPossibleSource({parent, sourceClean}) {
            return parent._isPrereleaseSource({
                sourceClean
            }) && !Parser.SOURCE_JSON_TO_FULL[Parser.sourceJsonToJson(sourceClean)];
        }
        static _getBrewUtil() {
            return typeof PrereleaseUtil !== "undefined" ? PrereleaseUtil : null;
        }
        static _pGetSourceIndex() {
            return DataUtil.prerelease.pLoadSourceIndex();
        }
    }
    ;

    static _BrewPreloader = class extends this._PrereleaseBrewPreloader {
        static _LOCK_0 = new VeLock({
            isDbg: false,
            name: "loader-lock-0--brew"
        });
        static _SOURCE_ALL = _DataLoaderConst.SOURCE_PRERELEASE_ALL_CURRENT;
        static _SOURCES_ATTEMPTED = new Set();
        static _CACHE_SOURCE_CLEAN_TO_URL = null;

        static _isPossibleSource({parent, sourceClean}) {
            return !parent._isSiteSource({
                sourceClean
            }) && !parent._isPrereleaseSource({
                sourceClean
            });
        }
        static _getBrewUtil() {
            return typeof BrewUtil2 !== "undefined" ? BrewUtil2 : null;
        }
        static _pGetSourceIndex() {
            return DataUtil.brew.pLoadSourceIndex();
        }
    }
    ;

    static async _pCacheAndGet_getCacheMeta({pageClean, sourceClean, dataLoader}) {
        try {
            await this._LOCK_1.pLock();
            return (await this._pCache({ pageClean, sourceClean, dataLoader }));
        }
        finally { this._LOCK_1.unlock(); }
    }

    static async _pCache({pageClean, sourceClean, dataLoader}) {
        //#region Fetch from site data
        const siteData = await dataLoader.pGetSiteData({ pageClean, sourceClean });
        this._pCache_addToCache({ allDataMerged: siteData, propAllowlist: dataLoader.phase1CachePropAllowlist || new Set(dataLoader.constructor.PROPS) });
        // Always early-exit, regardless of whether the entity was found in the cache, if we know this is a site source
        if (this._isSiteSource({ sourceClean })) return { siteData };
        //#endregion

        const out = { siteData };

        //As we have preloaded missing prerelease/brew earlier in the flow, we know that a prerelease/brew is either
		//present, or unavailable
        if (typeof PrereleaseUtil !== "undefined") {
            const prereleaseData = await dataLoader.pGetStoredPrereleaseData();
            this._pCache_addToCache({
                allDataMerged: prereleaseData,
                propAllowlist: dataLoader.phase1CachePropAllowlist || new Set(dataLoader.constructor.PROPS)
            });
            out.prereleaseData = prereleaseData;
        }

        if (typeof BrewUtil2 !== "undefined") {
            const brewData = await dataLoader.pGetStoredBrewData();
            this._pCache_addToCache({
                allDataMerged: brewData,
                propAllowlist: dataLoader.phase1CachePropAllowlist || new Set(dataLoader.constructor.PROPS)
            });
            out.brewData = brewData;
        }

        return out;
    }

    static async _pCacheAndGet_processCacheMeta({dataLoader, siteData=null, prereleaseData=null, brewData=null, lockToken2=null}) {
        if (!dataLoader.hasPhase2Cache){return;}

        try {
            lockToken2 = await this._LOCK_2.pLock({ token: lockToken2 });
            await this._pCacheAndGet_processCacheMeta_({ dataLoader, siteData, prereleaseData, brewData, lockToken2 });
        }
        finally { this._LOCK_2.unlock(); }
    }

    static async _pCacheAndGet_processCacheMeta_({dataLoader, siteData=null, prereleaseData=null, brewData=null, lockToken2=null}) {
        const {siteDataPostCache, prereleaseDataPostCache, brewDataPostCache} = await dataLoader.pGetPostCacheData({
            siteData,
            prereleaseData,
            brewData,
            lockToken2
        });

        this._pCache_addToCache({
            allDataMerged: siteDataPostCache,
            propAllowlist: dataLoader.phase2CachePropAllowlist || new Set(dataLoader.constructor.PROPS)
        });
        this._pCache_addToCache({
            allDataMerged: prereleaseDataPostCache,
            propAllowlist: dataLoader.phase2CachePropAllowlist || new Set(dataLoader.constructor.PROPS)
        });
        this._pCache_addToCache({
            allDataMerged: brewDataPostCache,
            propAllowlist: dataLoader.phase2CachePropAllowlist || new Set(dataLoader.constructor.PROPS)
        });
    }

    static _pCache_getDataTypeLoader({pageClean, isSilent}) {
        const dataLoader = this._DATA_TYPE_LOADERS[pageClean];
        if (!dataLoader && !isSilent)
            throw new Error(`No loading strategy found for page "${pageClean}"!`);
        return dataLoader;
    }

    static _pCache_addToCache({allDataMerged, propAllowlist}) {
        if (!allDataMerged)
            return;

        allDataMerged = {
            ...allDataMerged
        };

        this._DATA_TYPE_LOADER_LIST.filter(loader=>loader.hasCustomCacheStrategy({
            obj: allDataMerged
        })).forEach(loader=>{
            const propsToRemove = loader.addToCacheCustom({
                cache: this._CACHE,
                obj: allDataMerged
            });
            propsToRemove.forEach(prop=>delete allDataMerged[prop]);
        }
        );

        Object.keys(allDataMerged).forEach(prop=>{
            if (!propAllowlist.has(prop))
                return;

            const arr = allDataMerged[prop];
            if (!arr?.length || !(arr instanceof Array))
                return;

            const hashBuilder = UrlUtil.URL_TO_HASH_BUILDER[prop];
            if (!hashBuilder)
                return;

            arr.forEach(ent=>{
                this._pCache_addEntityToCache({
                    prop,
                    hashBuilder,
                    ent
                });
                DataUtil.proxy.getVersions(prop, ent).forEach(entVer=>this._pCache_addEntityToCache({
                    prop,
                    hashBuilder,
                    ent: entVer
                }));
            }
            );
        }
        );
    }

    static _pCache_addEntityToCache({prop, hashBuilder, ent}) {
        ent.__prop = ent.__prop || prop;

        const page = this._PROP_TO_HASH_PAGE[prop];
        const source = SourceUtil.getEntitySource(ent);
        const hash = hashBuilder(ent);

        const {page: propClean, source: sourceClean, hash: hashClean} = _DataLoaderInternalUtil.getCleanPageSourceHash({
            page: prop,
            source,
            hash
        });
        const pageClean = page ? _DataLoaderInternalUtil.getCleanPage({
            page
        }) : null;

        this._CACHE.set(propClean, sourceClean, hashClean, ent);
        if (pageClean)
            this._CACHE.set(pageClean, sourceClean, hashClean, ent);
    }

    static _CACHE_SITE_SOURCE_CLEAN = null;

    static _doBuildSourceCaches() {
        this._CACHE_SITE_SOURCE_CLEAN = this._CACHE_SITE_SOURCE_CLEAN || new Set(Object.keys(Parser.SOURCE_JSON_TO_FULL).map(src=>_DataLoaderInternalUtil.getCleanSource({
            source: src
        })));
    }

    static _isSiteSource({sourceClean}) {
        if (sourceClean === _DataLoaderConst.SOURCE_SITE_ALL)
            return true;
        if (sourceClean === _DataLoaderConst.SOURCE_BREW_ALL_CURRENT)
            return false;
        if (sourceClean === _DataLoaderConst.SOURCE_PRERELEASE_ALL_CURRENT)
            return false;

        this._doBuildSourceCaches();

        return this._CACHE_SITE_SOURCE_CLEAN.has(sourceClean);
    }

    static _isPrereleaseSource({sourceClean}) {
        if (sourceClean === _DataLoaderConst.SOURCE_SITE_ALL)
            return false;
        if (sourceClean === _DataLoaderConst.SOURCE_BREW_ALL_CURRENT)
            return false;
        if (sourceClean === _DataLoaderConst.SOURCE_PRERELEASE_ALL_CURRENT)
            return true;

        this._doBuildSourceCaches();

        return sourceClean.startsWith(_DataLoaderInternalUtil.getCleanSource({
            source: Parser.SRC_UA_PREFIX
        })) || sourceClean.startsWith(_DataLoaderInternalUtil.getCleanSource({
            source: Parser.SRC_UA_ONE_PREFIX
        }));
    }

    static getDiagnosticsSummary(diagnostics) {
        diagnostics = diagnostics.filter(Boolean);
        if (!diagnostics.length)
            return "";

        const filenames = diagnostics.map(it=>it.filename).filter(Boolean).unique().sort(SortUtil.ascSortLower);

        if (!filenames.length)
            return "";

        return `Filename${filenames.length === 1 ? " was" : "s were"}: ${filenames.map(it=>`"${it}"`).join("; ")}.`;
    }
};
//#endregion

//#region SideLoadData
class SideDataInterfaceBase {
    static _SIDE_DATA = null;

    static async pPreloadSideData() {
        this._SIDE_DATA = await this._pGetPreloadSideData();
        return this._SIDE_DATA;
    }

    static async _pGetPreloadSideData() {
        throw new Error("Unimplemented!");
    }

    static init() {}

    /**
     * @param {{name: string, className: string, classSource: string, level: number, source: string, displayText: string}} ent
     * @returns {any}
     */
    static _getSideLoadOpts(ent) {
        return null;
    }

    static _SIDE_LOAD_OPTS = null;

    /**
     * @param {{ent: {name: string, className: string, classSource: string, level: number, source: string, displayText: string}, propOpts:string}}
     * @returns {any}
     */
    static _getResolvedOpts({ent, propOpts="_SIDE_LOAD_OPTS"}={}) {
        const out = this._getSideLoadOpts(ent) || this[propOpts];
        if (out.propsMatch)
            return out;
        return {
            ...out,
            propsMatch: ["source", "name"],
        };
    }

    static async pGetRoot(ent, {propOpts="_SIDE_LOAD_OPTS", actorType=undefined}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;

        const {propBrew, fnLoadJson, propJson, propsMatch} = opts;
        return this._pGetStarSideLoaded(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propFromEntity: "foundryRoot",
            propFromSideLoaded: "root",
            actorType
        });
    }

    static async pGetDataSideLoaded(ent, {propOpts="_SIDE_LOAD_OPTS", systemBase=undefined, actorType=undefined}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;

        const {propBrew, fnLoadJson, propJson, propsMatch} = opts;
        return this._pGetStarSideLoaded(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propFromEntity: "foundrySystem",
            propFromSideLoaded: "system",
            base: systemBase,
            actorType
        });
    }

    static async pGetFlagsSideLoaded(ent, {propOpts="_SIDE_LOAD_OPTS", actorType=undefined}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;

        const {propBrew, fnLoadJson, propJson, propsMatch} = opts;
        return this._pGetStarSideLoaded(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propFromEntity: "foundryFlags",
            propFromSideLoaded: "flags",
            actorType
        });
    }

    static async _pGetAdvancementSideLoaded(ent, {propOpts="_SIDE_LOAD_OPTS", actorType=undefined}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;

        const {propBrew, fnLoadJson, propJson, propsMatch} = opts;
        return this._pGetStarSideLoaded(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propFromEntity: "foundryAdvancement",
            propFromSideLoaded: "advancement",
            actorType
        });
    }

    static async pGetImgSideLoaded(ent, {propOpts="_SIDE_LOAD_OPTS", actorType=undefined}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;

        const {propBrew, fnLoadJson, propJson, propsMatch} = opts;
        return this._pGetStarSideLoaded(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propFromEntity: "foundryImg",
            propFromSideLoaded: "img",
            actorType
        });
    }

    /**
     * @param {{name: string, className: string, classSource: string, level: number, source: string, displayText: string}} ent
     * @param {any} propOpts
     * @param {any} actorType
     * @returns {any}
     */
    static async pGetIsIgnoredSideLoaded(ent, {propOpts="_SIDE_LOAD_OPTS", actorType=undefined}={}) {
        const opts = this._getResolvedOpts({ ent, propOpts });
        if (!opts)
            return null;

        const {propBrew, fnLoadJson, propJson, propsMatch} = opts;
        return this._pGetStarSideLoaded(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propFromEntity: "foundryIsIgnored",
            propFromSideLoaded: "isIgnored",
            actorType
        });
    }

    static async pIsIgnoreSrdEffectsSideLoaded(ent, {propOpts="_SIDE_LOAD_OPTS", actorType=undefined}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;
        return this._pGetStarSideLoaded(ent, {
            ...opts,
            propFromEntity: "foundryIgnoreSrdEffects",
            propFromSideLoaded: "ignoreSrdEffects",
            actorType
        });
    }

    static async pGetEffectsRawSideLoaded(ent, {propOpts="_SIDE_LOAD_OPTS", actorType=undefined}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;

        const {propBrew, fnLoadJson, propJson, propsMatch} = opts;
        const out = await this._pGetStarSideLoaded(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propFromEntity: "foundryEffects",
            propFromSideLoaded: "effects",
            actorType
        });

        if (!out?.length)
            return out;

        return out.filter(it=>{
            if (!it)
                return false;
            if (!it.requires)
                return true;

            return Object.keys(it.requires).every(k=>UtilCompat.isModuleActive(k));
        }
        );
    }

    static async pGetEffectsSideLoadedTuples({ent, actor=null, sheetItem=null, additionalData=null, img=null}, {propOpts="_SIDE_LOAD_OPTS"}={}) {
        const outRaw = await this.pGetEffectsRawSideLoaded(ent, {
            propOpts
        });
        if (!outRaw?.length)
            return [];

        return UtilActiveEffects.getExpandedEffects(outRaw, {
            actor,
            sheetItem,
            parentName: UtilEntityGeneric.getName(ent),
            img,
        }, {
            isTuples: true,
        }, );
    }

    static async pGetSideLoaded(ent, {propOpts="_SIDE_LOAD_OPTS", actorType=undefined, isSilent=false}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;
        return this._pGetSideLoadedMatch(ent, {
            ...opts,
            actorType,
            isSilent
        });
    }

    static async pGetSideLoadedType(ent, {propOpts="_SIDE_LOAD_OPTS", validTypes, actorType=undefined}={}) {
        const opts = this._getResolvedOpts({
            ent,
            propOpts
        });
        if (!opts)
            return null;

        const {propBrew, fnLoadJson, propJson, propsMatch} = opts;

        let out = await this._pGetStarSideLoaded(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propFromEntity: "foundryType",
            propFromSideLoaded: "type",
            actorType
        });
        if (!out)
            return out;
        out = out.toLowerCase().trim();
        if (validTypes && !validTypes.has(out))
            return null;
        return out;
    }

    static async _pGetStarSideLoaded(ent, {propBrew, fnLoadJson, propJson, propsMatch, propFromEntity, propFromSideLoaded, base=undefined, actorType=undefined, }, ) {
        const found = await this._pGetSideLoadedMatch(ent, {
            propBrew,
            fnLoadJson,
            propJson,
            propsMatch,
            propBase: propFromSideLoaded,
            base,
            actorType
        });
        return this._pGetStarSideLoaded_found(ent, {
            propFromEntity,
            propFromSideLoaded,
            found
        });
    }

    static async _pGetStarSideLoaded_found(ent, {propFromEntity, propFromSideLoaded, found}) {
        const fromEntity = ent[propFromEntity];

        if ((!found || !found[propFromSideLoaded]) && !fromEntity)
            return null;

        const out = MiscUtil.copy(found?.[propFromSideLoaded] ? found[propFromSideLoaded] : fromEntity);
        if (found?.[propFromSideLoaded] && fromEntity) {
            if (out instanceof Array)
                out.push(...MiscUtil.copy(fromEntity));
            else
                Object.assign(out, MiscUtil.copy(fromEntity));
        }

        return out;
    }

    static async _pGetSideLoadedMatch(ent, {propBrew, fnLoadJson, propJson, propsMatch, propBase, base=undefined, actorType=undefined, isSilent=false}={}) {
        const founds = [];

        //TEMPFIX
        /* if (UtilCompat.isPlutoniumAddonAutomationActive()) {
            const valsLookup = propsMatch.map(prop=>ent[prop]).filter(Boolean);
            const found = await UtilCompat.getApi(UtilCompat.MODULE_PLUTONIUM_ADDON_AUTOMATION).pGetExpandedAddonData({
                propJson,
                path: valsLookup,
                fnMatch: this._pGetAdditional_fnMatch.bind(this, propsMatch, ent),
                ent,
                propBase,
                base,
                actorType,
                isSilent,
            });
            if (found)
                founds.push(found);
        } */

        if (propBrew) {
            const prerelease = await PrereleaseUtil.pGetBrewProcessed();
            const foundPrerelease = (MiscUtil.get(prerelease, propBrew) || []).find(it=>this._pGetAdditional_fnMatch(propsMatch, ent, it));
            if (foundPrerelease)
                founds.push(foundPrerelease);

            const brew = await BrewUtil2.pGetBrewProcessed();
            const foundBrew = (MiscUtil.get(brew, propBrew) || []).find(it=>this._pGetAdditional_fnMatch(propsMatch, ent, it));
            if (foundBrew)
                founds.push(foundBrew);
        }

        if (fnLoadJson && propJson) {
            const sideJson = await fnLoadJson();
            const found = (sideJson[propJson] || []).find(it=>this._pGetAdditional_fnMatch(propsMatch, ent, it));
            if (found)
                founds.push(found);
        }

        if (!founds.length)
            return null;
        if (founds.length === 1)
            return founds[0];

        const out = MiscUtil.copy(founds[0]);
        this._pGetSideLoaded_match_mutMigrateData(out);
        delete out._merge;

        founds.slice(1).forEach((found,i)=>{
            this._pGetSideLoaded_match_mutMigrateData(found);

            Object.entries(found).filter(([prop])=>prop !== "_merge").forEach(([prop,v])=>{
                if (out[prop] === undefined)
                    return out[prop] = v;

                const prevFounds = founds.slice(0, i + 1);
                if (!prevFounds.every(foundPrev=>foundPrev[prop] === undefined || foundPrev._merge?.[prop]))
                    return;

                if (out[prop] == null)
                    return out[prop] = v;
                if (typeof out[prop] !== "object")
                    return out[prop] = v;

                if (out[prop]instanceof Array) {
                    if (!(v instanceof Array))
                        throw new Error(`Could not _merge array and non-array`);
                    return out[prop] = [...out[prop], ...v];
                }

                out[prop] = foundry.utils.mergeObject(v, out[prop]);
            }
            );
        }
        );

        return out;
    }

    static _pGetSideLoaded_match_mutMigrateData(found) {
        if (!found)
            return;
        return found;
    }

    static _pGetAdditional_fnMatch(propsMatch, entity, additionalDataEntity) {
        return propsMatch.every(prop=>{
            if (typeof entity[prop] === "number" || typeof additionalDataEntity[prop] === "number")
                return Number(entity[prop]) === Number(additionalDataEntity[prop]);
            return `${(entity[prop] || "")}`.toLowerCase() === `${(additionalDataEntity[prop] || "").toLowerCase()}`;
        }
        );
    }
}

class SideDataInterfaceClass extends SideDataInterfaceBase {
    static _SIDE_LOAD_OPTS = {
        propBrew: "foundryClass",
        fnLoadJson: async()=>this.pPreloadSideData(),
        propJson: "class",
    };

    static _SIDE_LOAD_OPTS_SUBCLASS = {
        propBrew: "foundrySubclass",
        fnLoadJson: async()=>this.pPreloadSideData(),
        propJson: "subclass",
        propsMatch: ["classSource", "className", "source", "name"],
    };

    static async pPreloadSideData() {
        return Vetools.pGetClassSubclassSideData();
    }

    static init() {
        PageFilterClassesFoundry.setImplSideData("class", this);
        PageFilterClassesFoundry.setImplSideData("subclass", this);
    }
}
class SideDataInterfaceClassSubclassFeature extends SideDataInterfaceBase {
     /**
     * @param {{name: string, className: string, classSource: string, level: number, source: string, displayText: string}} feature
     * @returns {any}
     */
    static _getSideLoadOpts(feature) {
        return {
            propBrew: UtilEntityClassSubclassFeature.getBrewProp(feature),
            fnLoadJson: async()=>this.pPreloadSideData(),
            propJson: UtilEntityClassSubclassFeature.getEntityType(feature),
            propsMatch: ["classSource", "className", "subclassSource", "subclassShortName", "level", "source", "name"],
        };
    }

    static async _pGetPreloadSideData() {
        return Vetools.pGetClassSubclassSideData();
    }

    static init() {
        PageFilterClassesFoundry.setImplSideData("classFeature", this);
        PageFilterClassesFoundry.setImplSideData("subclassFeature", this);
    }
}
class SideDataInterfaceFeat extends SideDataInterfaceBase {
    static _SIDE_LOAD_OPTS = {
        propBrew: "foundryFeat",
        fnLoadJson: async()=>this.pPreloadSideData(),
        propJson: "feat",
    };

    static async _pGetPreloadSideData() {
        return Vetools.pGetFeatSideData();
    }

    static init() {
        PageFilterClassesFoundry.setImplSideData("feat", this);
    }
}
class SideDataInterfaceOptionalfeature extends SideDataInterfaceBase {
    static _SIDE_LOAD_OPTS = {
        propBrew: "foundryOptionalfeature",
        fnLoadJson: async()=>this.pPreloadSideData(),
        propJson: "optionalfeature",
    };

    static async _pGetPreloadSideData() {
        return Vetools.pGetOptionalFeatureSideData();
    }

    static init() {
        PageFilterClassesFoundry.setImplSideData("optionalfeature", this);
    }
}
class SideDataInterfaceReward extends SideDataInterfaceBase {
    static _SIDE_LOAD_OPTS = {
        propBrew: "foundryReward",
        fnLoadJson: async()=>this.pPreloadSideData(),
        propJson: "reward",
    };

    static async _pGetPreloadSideData() {
        return Vetools.pGetRewardSideData();
    }

    static init() {
        PageFilterClassesFoundry.setImplSideData("reward", this);
    }
}
class SideDataInterfaceCharCreationOption extends SideDataInterfaceBase {
    static _SIDE_LOAD_OPTS = {
        propBrew: "foundryCharoption",
        fnLoadJson: async()=>this.pPreloadSideData(),
        propJson: "charoption",
    };

    static async _pGetPreloadSideData() {
        return Vetools.pGetCharCreationOptionSideData();
    }

    static init() {
        PageFilterClassesFoundry.setImplSideData("charoption", this);
    }
}
class SideDataInterfaceVehicleUpgrade extends SideDataInterfaceBase {
    static _SIDE_LOAD_OPTS = {
        propBrew: "foundryVehicleUpgrade",
        fnLoadJson: async()=>this.pPreloadSideData(),
        propJson: "vehicleUpgrade",
    };

    static async _pGetPreloadSideData() {
        return Vetools.pGetVehicleUpgradeSideData();
    }

    static init() {
        PageFilterClassesFoundry.setImplSideData("vehicleUpgrade", this);
    }
}

class SideDataInterfaces {
    static init() {
        SideDataInterfaceClass.init();
        SideDataInterfaceClassSubclassFeature.init();
        SideDataInterfaceOptionalfeature.init();
        SideDataInterfaceFeat.init();
        SideDataInterfaceReward.init();
        SideDataInterfaceCharCreationOption.init();
        SideDataInterfaceVehicleUpgrade.init();
    }
}
//#endregion


//#region Image Fetcher
/* class ImageFetcherClassSubclassFeature extends ImageFetcherBase {
    static _SideDataInterface = SideDataInterfaceClassSubclassFeature;
    static _UtilEntity = UtilEntityClassSubclassFeature;
    static _IMG_FALLBACK = `modules/${SharedConsts.MODULE_ID}/media/icon/mighty-force.svg`;
} */

//#endregion

//#region UtilDataConverter
class UtilDataConverter {
    static getNameWithSourcePart(ent, {displayName=null, isActorItem=false}={}) {
        return `${displayName || `${ent.type === "variant" ? "Variant: " : ""}${Renderer.stripTags(UtilEntityGeneric.getName(ent))}`}${!isActorItem && ent.source && Config.get("import", "isAddSourceToName") ? ` (${Parser.sourceJsonToAbv(ent.source)})` : ""}`;
    }

    static async pGetItemWeaponType(uid) {
        uid = uid.toLowerCase().trim();

        if (UtilDataConverter.WEAPONS_MARTIAL.includes(uid)){return "martial";}
        if (UtilDataConverter.WEAPONS_SIMPLE.includes(uid)){return "simple";}

        let[name,source] = Renderer.splitTagByPipe(uid);
        source = source || "phb";
        const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS]({name, source});

        //TEMPFIX
        return null;
        const found = await DataLoader.pCacheAndGet(UrlUtil.PG_ITEMS, source, hash);
        return found?.weaponCategory;
    }

    static async _pGetClassSubclass_pInitCache({cache}) {
        cache = cache || {};
        if (!cache._allClasses && !cache._allSubclasses) {
            const classData = await DataUtil.class.loadJSON();
            const prerelease = await PrereleaseUtil.pGetBrewProcessed();
            const brew = await BrewUtil2.pGetBrewProcessed();

            cache._allClasses = [...(classData.class || []), ...(prerelease?.class || []), ...(brew?.class || []), ];

            cache._allSubclasses = [...(classData.subclass || []), ...(prerelease?.subclass || []), ...(brew?.subclass || []), ];
        }
        return cache;
    }

    static async pGetClassItemClassAndSubclass({sheetItem, subclassSheetItems, cache=null}={}) {
        cache = await this._pGetClassSubclass_pInitCache({
            cache
        });

        const nameLowerClean = sheetItem.name.toLowerCase().trim();
        const sourceLowerClean = (UtilDocumentSource.getDocumentSource(sheetItem).source || "").toLowerCase();

        const matchingClasses = cache._allClasses.filter(cls=>cls.name.toLowerCase() === nameLowerClean && (!Config.get("import", "isStrictMatching") || sourceLowerClean === Parser.sourceJsonToAbv(cls.source).toLowerCase()), );
        if (!matchingClasses.length)
            return {
                matchingClasses: [],
                matchingSubclasses: [],
                sheetItem
            };

        if (!subclassSheetItems?.length)
            return {
                matchingClasses,
                matchingSubclasses: [],
                sheetItem
            };

        const matchingSubclasses = matchingClasses.map(cls=>{
            const classSubclassSheetItems = subclassSheetItems.filter(scItem=>scItem.system.classIdentifier === sheetItem.system.identifier);
            return cache._allSubclasses.filter(sc=>{
                if (sc.className !== cls.name || sc.classSource !== cls.source)
                    return false;

                return classSubclassSheetItems.some(scItem=>sc.name.toLowerCase() === scItem.name.toLowerCase().trim() && (!Config.get("import", "isStrictMatching") || (UtilDocumentSource.getDocumentSource(scItem).source || "").toLowerCase() === Parser.sourceJsonToAbv(sc.source).toLowerCase()), );
            }
            );
        }
        ).flat();

        return {
            matchingClasses,
            matchingSubclasses,
            sheetItem
        };
    }

    static getSpellPointTotal({totalSpellcastingLevels}) {
        if (!totalSpellcastingLevels)
            return 0;

        const spellSlotCounts = UtilDataConverter.CASTER_TYPE_TO_PROGRESSION.full[totalSpellcastingLevels - 1] || UtilDataConverter.CASTER_TYPE_TO_PROGRESSION.full[0];

        return spellSlotCounts.map((countSlots,ix)=>{
            const spellLevel = ix + 1;
            return Parser.spLevelToSpellPoints(spellLevel) * countSlots;
        }
        ).sum();
    }

    static getPsiPointTotal({totalMysticLevels}) {
        if (!totalMysticLevels || isNaN(totalMysticLevels) || totalMysticLevels < 0)
            return 0;

        totalMysticLevels = Math.round(Math.min(totalMysticLevels, Consts.CHAR_MAX_LEVEL));

        return [4, 6, 14, 17, 27, 32, 38, 44, 57, 64, 64, 64, 64, 64, 64, 64, 64, 71, 71, 71][totalMysticLevels - 1];
    }

    static async pGetWithDescriptionPlugins(pFn, {actorId=null, tagHashItemIdMap=null}={}) {
        const hkLink = (entry,procHash)=>this._pGetWithDescriptionPlugins_fnPlugin(entry, procHash);

        const hkStr = (tag,text)=>{
            const inn = `{${tag} ${text}}`;
            const itemId = this._pGetWithDescriptionPlugins_getTagItemId({
                tag,
                text,
                tagHashItemIdMap
            });
            const out = this._getConvertedTagLinkString(inn, {
                actorId,
                itemId
            });
            if (inn === out)
                return null;
            return out;
        }
        ;

        const hkStrFont = (tag,text)=>{
            if (!game.user.isGM)
                return;

            const [,fontFamily] = Renderer.splitTagByPipe(text);

            if (UtilDataConverter._DESCRIPTION_FONTS_TRACKED[fontFamily])
                return;
            UtilDataConverter._DESCRIPTION_FONTS_TRACKED[fontFamily] = true;

            if (FontConfig.getAvailableFontChoices()[fontFamily])
                return;

            if (!Config.get("import", "isAutoAddAdditionalFonts")) {
                ui.notifications.warn(`The "${fontFamily}" font, used by recently-rendered content, is not available in your game. You may need to manually add it via the "Additional Fonts" setting, or text using the "${fontFamily}" font may not display correctly.`);
            }

            const url = BrewUtil2.getMetaLookup("fonts")?.[fontFamily] || PrereleaseUtil.getMetaLookup("fonts")?.[fontFamily];

            if (!url)
                return void ui.notifications.warn(`Failed to load font "${fontFamily}". You may need to manually add it via the "Additional Fonts" setting, or text using the "${fontFamily}" font may not display correctly.`);

            this._pDoLoadAdditionalFont(fontFamily, url).then(null);
        }
        ;

        const hkImg = (entry,url)=>{
            const out = Vetools.getImageSavedToServerUrl({
                originalUrl: url
            });
            Vetools.pSaveImageToServerAndGetUrl({
                originalUrl: url,
                force: true
            }).then(null).catch(()=>{}
            );
            return out;
        }
        ;

        Renderer.get().addPlugin("link_attributesHover", hkLink);
        Renderer.get().addPlugin("string_@font", hkStrFont);
        if (Config.get("import", "isRenderLinksAsTags"))
            Renderer.get().addPlugin("string_tag", hkStr);
        if (Config.get("import", "isSaveImagesToServer")) {
            Renderer.get().addPlugin("image_urlPostProcess", hkImg);
            Renderer.get().addPlugin("image_urlThumbnailPostProcess", hkImg);
        }

        let out;
        try {
            out = await pFn();
        } finally {
            Renderer.get().removePlugin("link_attributesHover", hkLink);
            Renderer.get().removePlugin("string_@font", hkStrFont);
            Renderer.get().removePlugin("string_tag", hkStr);
            Renderer.get().removePlugin("image_urlPostProcess", hkImg);
            Renderer.get().removePlugin("image_urlThumbnailPostProcess", hkImg);
        }

        return out;
    }

    static _DESCRIPTION_FONTS_TRACKED = {};
    static _HAS_NOTIFIED_FONTS_RELOAD = false;

    static async _pDoLoadAdditionalFont(family, url) {
        const hasNotified = this._HAS_NOTIFIED_FONTS_RELOAD;
        this._HAS_NOTIFIED_FONTS_RELOAD = true;

        const definitions = game.settings.get("core", FontConfig.SETTING);
        definitions[family] ??= {
            editor: true,
            fonts: []
        };
        const definition = definitions[family];
        definition.fonts.push({
            urls: [url],
            weight: 400,
            style: "normal"
        });
        await game.settings.set("core", FontConfig.SETTING, definitions);
        await FontConfig.loadFont(family, definition);

        if (hasNotified)
            return;

        ChatNotificationHandlers.getHandler("ReloadFonts").pDoPostChatMessage();
    }

    static _pGetWithDescriptionPlugins_getTagItemId({tag, text, tagHashItemIdMap}) {
        const tagName = tag.slice(1);
        if (!tagHashItemIdMap?.[tagName])
            return null;
        const defaultSource = Renderer.tag.TAG_LOOKUP[tagName]?.defaultSource;
        if (!defaultSource)
            return null;
        const page = Renderer.tag.getPage(tagName);
        if (!page)
            return null;
        const hashBuilder = UrlUtil.URL_TO_HASH_BUILDER[page];
        if (!hashBuilder)
            return null;
        let[name,source] = text.split("|");
        source = source || defaultSource;
        const hash = hashBuilder({
            name,
            source
        });
        return tagHashItemIdMap?.[tagName]?.[hash];
    }

    static _pGetWithDescriptionPlugins_fnPlugin(entry, procHash) {
        const page = entry.href.hover.page;
        const source = entry.href.hover.source;
        const hash = procHash;
        const preloadId = entry.href.hover.preloadId;
        return {
            attributesHoverReplace: [`data-plut-hover="${true}" data-plut-hover-page="${page.qq()}" data-plut-hover-source="${source.qq()}" data-plut-hover-hash="${hash.qq()}" ${preloadId ? `data-plut-hover-preload-id="${preloadId.qq()}"` : ""}`, ],
        };
    }

    static _getConvertedTagLinkString(str, {actorId, itemId}={}) {
        this._getConvertedTagLinkString_initLinkTagMetas();
        for (const {tag, re} of this._LINK_TAG_METAS_REPLACE)
            str = str.replace(re, (...m)=>this._replaceEntityLinks_getReplacement({
                tag,
                text: m.last().text,
                actorId,
                itemId
            }));
        for (const {tag, re} of this._LINK_TAG_METAS_REMOVE)
            str = str.replace(re, (...m)=>this._replaceEntityLinks_getRemoved({
                tag,
                text: m.last().text
            }));
        return str;
    }

    static _LINK_TAGS_TO_REMOVE = new Set(["quickref", ]);
    static _LINK_TAG_METAS_REPLACE = null;
    static _LINK_TAG_METAS_REMOVE = null;

    static _getConvertedTagLinkString_initLinkTagMetas() {
        if (!this._LINK_TAG_METAS_REPLACE) {
            this._LINK_TAG_METAS_REPLACE = Renderer.tag.TAGS.filter(it=>it.defaultSource).map(it=>it.tagName).filter(tag=>!this._LINK_TAGS_TO_REMOVE.has(tag)).map(tag=>({
                tag,
                re: this._getConvertedTagLinkString_getRegex({
                    tag
                })
            }));
        }

        if (!this._LINK_TAG_METAS_REMOVE) {
            this._LINK_TAG_METAS_REMOVE = Renderer.tag.TAGS.filter(it=>it.defaultSource).map(it=>it.tagName).filter(tag=>this._LINK_TAGS_TO_REMOVE.has(tag)).map(tag=>({
                tag,
                re: this._getConvertedTagLinkString_getRegex({
                    tag
                })
            }));
        }
    }

    static _getConvertedTagLinkString_getRegex({tag}) {
        return RegExp(`^{@${tag} (?<text>[^}]+)}$`, "g");
    }

    static getConvertedTagLinkEntries(entries) {
        if (!entries)
            return entries;

        return UtilDataConverter.WALKER_GENERIC.walk(MiscUtil.copy(entries), {
            string: str=>{
                const textStack = [""];
                this._getConvertedTagLinkEntries_recurse(str, textStack);
                return textStack.join("");
            }
            ,
        }, );
    }

    static _getConvertedTagLinkEntries_recurse(str, textStack) {
        const tagSplit = Renderer.splitByTags(str);
        const len = tagSplit.length;
        for (let i = 0; i < len; ++i) {
            const s = tagSplit[i];
            if (!s)
                continue;

            if (s.startsWith("{@")) {
                const converted = this._getConvertedTagLinkString(s);

                if (converted !== s) {
                    textStack[0] += (converted);
                    continue;
                }

                textStack[0] += s.slice(0, 1);
                this._getConvertedTagLinkEntries_recurse(s.slice(1, -1), textStack);
                textStack[0] += s.slice(-1);

                continue;
            }

            textStack[0] += s;
        }
    }

    static _replaceEntityLinks_getReplacement({tag, text, actorId, itemId}) {
        if (actorId && itemId) {
            const [,,displayText] = text.split("|");
            return `@UUID[Actor.${actorId}.Item.${itemId}]${displayText ? `{${displayText}}` : ""}`;
        }
        return `@${tag}[${text}]`;
    }

    static _replaceEntityLinks_getRemoved({tag, text}) {
        return Renderer.stripTags(`{@${tag} ${text}}`);
    }

    static async _pReplaceEntityLinks_pReplace({str, re, tag}) {
        let m;
        while ((m = re.exec(str))) {
            const prefix = str.slice(0, m.index);
            const suffix = str.slice(re.lastIndex);
            const replacement = this._replaceEntityLinks_getReplacement({
                tag,
                m
            });
            str = `${prefix}${replacement}${suffix}`;
            re.lastIndex = prefix.length + replacement.length;
        }
        return str;
    }

    static _RECHARGE_TYPES = {
        "round": null,
        "restShort": "sr",
        "restLong": "lr",
        "dawn": "dawn",
        "dusk": "dusk",
        "midnight": "day",

        "special": null,

        "week": null,
        "month": null,
        "year": null,
        "decade": null,
        "century": null,
    };

    static getFvttUsesPer(it, {isStrict=true}={}) {
        if (isStrict && !this._RECHARGE_TYPES[it])
            return null;
        return Parser._parse_aToB(this._RECHARGE_TYPES, it);
    }

    static getTempDocumentDefaultOwnership({documentType}) {
        if (game.user.isGM)
            return undefined;

        const clazz = CONFIG[documentType].documentClass;

        if (game.user.can(clazz.metadata.permissions.create))
            return undefined;

        return CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    }
}
UtilDataConverter.WALKER_READONLY_GENERIC = MiscUtil.getWalker({
    isNoModification: true,
    keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST
});
UtilDataConverter.WALKER_GENERIC = MiscUtil.getWalker({
    keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST
});

UtilDataConverter.WEAPONS_MARTIAL = ["battleaxe|phb", "blowgun|phb", "flail|phb", "glaive|phb", "greataxe|phb", "greatsword|phb", "halberd|phb", "hand crossbow|phb", "heavy crossbow|phb", "lance|phb", "longbow|phb", "longsword|phb", "maul|phb", "morningstar|phb", "net|phb", "pike|phb", "rapier|phb", "scimitar|phb", "shortsword|phb", "trident|phb", "war pick|phb", "warhammer|phb", "whip|phb", ];
UtilDataConverter.WEAPONS_SIMPLE = ["club|phb", "dagger|phb", "dart|phb", "greatclub|phb", "handaxe|phb", "javelin|phb", "light crossbow|phb", "light hammer|phb", "mace|phb", "quarterstaff|phb", "shortbow|phb", "sickle|phb", "sling|phb", "spear|phb", ];

UtilDataConverter.CASTER_TYPE_TO_PROGRESSION = {
    "full": [[2, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0], [4, 2, 0, 0, 0, 0, 0, 0, 0], [4, 3, 0, 0, 0, 0, 0, 0, 0], [4, 3, 2, 0, 0, 0, 0, 0, 0], [4, 3, 3, 0, 0, 0, 0, 0, 0], [4, 3, 3, 1, 0, 0, 0, 0, 0], [4, 3, 3, 2, 0, 0, 0, 0, 0], [4, 3, 3, 3, 1, 0, 0, 0, 0], [4, 3, 3, 3, 2, 0, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0], [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1], ],
    "artificer": [[2, 0, 0, 0, 0], [2, 0, 0, 0, 0], [3, 0, 0, 0, 0], [3, 0, 0, 0, 0], [4, 2, 0, 0, 0], [4, 2, 0, 0, 0], [4, 3, 0, 0, 0], [4, 3, 0, 0, 0], [4, 3, 2, 0, 0], [4, 3, 2, 0, 0], [4, 3, 3, 0, 0], [4, 3, 3, 0, 0], [4, 3, 3, 1, 0], [4, 3, 3, 1, 0], [4, 3, 3, 2, 0], [4, 3, 3, 2, 0], [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2], ],
    "1/2": [[0, 0, 0, 0, 0], [2, 0, 0, 0, 0], [3, 0, 0, 0, 0], [3, 0, 0, 0, 0], [4, 2, 0, 0, 0], [4, 2, 0, 0, 0], [4, 3, 0, 0, 0], [4, 3, 0, 0, 0], [4, 3, 2, 0, 0], [4, 3, 2, 0, 0], [4, 3, 3, 0, 0], [4, 3, 3, 0, 0], [4, 3, 3, 1, 0], [4, 3, 3, 1, 0], [4, 3, 3, 2, 0], [4, 3, 3, 2, 0], [4, 3, 3, 3, 1], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2], ],
    "1/3": [[0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [3, 0, 0, 0], [3, 0, 0, 0], [3, 0, 0, 0], [4, 2, 0, 0], [4, 2, 0, 0], [4, 2, 0, 0], [4, 3, 0, 0], [4, 3, 0, 0], [4, 3, 0, 0], [4, 3, 2, 0], [4, 3, 2, 0], [4, 3, 2, 0], [4, 3, 3, 0], [4, 3, 3, 0], [4, 3, 3, 0], [4, 3, 3, 1], [4, 3, 3, 1], ],
    "pact": [[1, 0, 0, 0, 0], [2, 0, 0, 0, 0], [0, 2, 0, 0, 0], [0, 2, 0, 0, 0], [0, 0, 2, 0, 0], [0, 0, 2, 0, 0], [0, 0, 0, 2, 0], [0, 0, 0, 2, 0], [0, 0, 0, 0, 2], [0, 0, 0, 0, 2], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 3], [0, 0, 0, 0, 4], [0, 0, 0, 0, 4], [0, 0, 0, 0, 4], [0, 0, 0, 0, 4], ],
};
//#endregion
//#region DataConverter
class DataConverter {
    static _configGroup;

    static _SideDataInterface;
    static _ImageFetcher;

    static async pGetDocumentJson(ent, opts) {
        throw new Error("Unimplemented!");
    }

    static isStubEntity(ent) {
        return false;
    }

    static getTagUids(tag, str) {
        const re = new RegExp(`{@${tag} ([^}]+)}`,"gi");
        const out = [];
        str.replace(re, (...m)=>out.push(m[1]));
        return out;
    }

    static getCombinedFoundrySystem(foundrySystem, _foundryData) {
        if (!_foundryData && !foundrySystem)
            return {};

        const combinedFoundrySystem = MiscUtil.copy(_foundryData || {});
        Object.assign(combinedFoundrySystem, MiscUtil.copy(foundrySystem || {}));

        return combinedFoundrySystem;
    }

    static getCombinedFoundryFlags(foundryFlags, _foundryFlags) {
        if (!foundryFlags && !_foundryFlags)
            return {};

        const combinedFoundryFlags = MiscUtil.copy(_foundryFlags || {});

        Object.entries(MiscUtil.copy(foundryFlags || {})).forEach(([flagNamespace,flagData])=>{
            if (!combinedFoundryFlags[flagNamespace])
                return combinedFoundryFlags[flagNamespace] = flagData;
            Object.assign(combinedFoundryFlags[flagNamespace], flagData);
        }
        );

        return combinedFoundryFlags;
    }

    static async pGetEntryDescription(entry, opts) {
        opts = opts || {};
        opts.prop = opts.prop || "entries";

        Renderer.get().setFirstSection(true).resetHeaderIndex();

        let description = "";
        if (entry[opts.prop]) {
            let cpyEntries = MiscUtil.copy(entry[opts.prop]);

            cpyEntries = UtilDataConverter.WALKER_GENERIC.walk(cpyEntries, {
                string: (str)=>{
                    return str.replace(/{@hitYourSpellAttack}/gi, ()=>`{@dice 1d20 + @${SharedConsts.MODULE_ID_FAKE}.userchar.spellAttackRanged|your spell attack modifier}`).replace(/{(@dice|@damage|@scaledice|@scaledamage|@hit) ([^}]+)}/gi, (...m)=>{
                        const [,tag,text] = m;
                        let[rollText,displayText,name,...others] = Renderer.splitTagByPipe(text);
                        const originalRollText = rollText;

                        rollText = this._pGetEntryDescription_getCleanDicePart(rollText, opts);
                        displayText = this._pGetEntryDescription_getCleanDisplayPart({
                            displayText,
                            originalText: originalRollText,
                            text: rollText
                        });

                        return `{${tag} ${[rollText, displayText || "", name || "", ...others].join("|")}}`;
                    }
                    ).replace(/{(@dc) ([^}]+)}/gi, (...m)=>{
                        const [,tag,text] = m;
                        let[dcText,displayText] = Renderer.splitTagByPipe(text);
                        const originalDcText = dcText;

                        dcText = this._pGetEntryDescription_getCleanDicePart(dcText, opts);
                        displayText = this._pGetEntryDescription_getCleanDisplayPart({
                            displayText,
                            originalText: originalDcText,
                            text: dcText
                        });

                        return `{${tag} ${[dcText, displayText || ""].join("|")}}`;
                    }
                    );
                }
                ,
            }, );

            description = await UtilDataConverter.pGetWithDescriptionPlugins(()=>Renderer.get().setFirstSection(true).render({
                type: "entries",
                entries: cpyEntries,
            }, opts.depth != null ? opts.depth : 2, ), );
        }

        return description;
    }

    static _pGetEntryDescription_getCleanDicePart(str, opts) {
        return str.replace(/\bPB\b/gi, `@${SharedConsts.MODULE_ID_FAKE}.userchar.pb`).replace(/\bsummonSpellLevel\b/gi, `${opts.summonSpellLevel ?? 0}`);
    }

    static _pGetEntryDescription_getCleanDisplayPart({displayText, originalText, text}) {
        if (!displayText && originalText !== text) {
            displayText = originalText.replace(/\bsummonSpellLevel\b/gi, `the spell's level`);
        }
        return displayText;
    }

    static mutActorUpdate(actor, actorUpdate, entry, opts) {
        opts = opts || {};

        this._mutActorUpdate_mutFromSideDataMod(actor, actorUpdate, opts);
        this._mutActorUpdate_mutFromSideTokenMod(actor, actorUpdate, opts);
    }

    static _mutActorUpdate_mutFromSideDataMod(actor, actorUpdate, opts) {
        return this._mutActorUpdate_mutFromSideMod(actor, actorUpdate, opts, "actorDataMod", "data");
    }

    static _mutActorUpdate_mutFromSideTokenMod(actor, actorUpdate, opts) {
        return this._mutActorUpdate_mutFromSideMod(actor, actorUpdate, opts, "actorTokenMod", "token");
    }

    static _mutActorUpdate_mutFromSideMod(actor, actorUpdate, opts, sideProp, actorProp) {
        if (!opts.sideData || !opts.sideData[sideProp])
            return;

        Object.entries(opts.sideData[sideProp]).forEach(([path,modMetas])=>this._mutActorUpdate_mutFromSideMod_handleProp(actor, actorUpdate, opts, sideProp, actorProp, path, modMetas));
    }

    static _mutActorUpdate_mutFromSideMod_handleProp(actor, actorUpdate, opts, sideProp, actorProp, path, modMetas) {
        const pathParts = path.split(".");

        if (path === "_") {
            modMetas.forEach(modMeta=>{
                switch (modMeta.mode) {
                case "conditionals":
                    {
                        for (const cond of modMeta.conditionals) {

                            window.PLUT_CONTEXT = {
                                actor
                            };

                            if (cond.condition && !eval(cond.condition))
                                continue;

                            Object.entries(cond.mod).forEach(([path,modMetas])=>this._mutActorUpdate_mutFromSideMod_handleProp(actor, actorUpdate, opts, sideProp, actorProp, path, modMetas));

                            break;
                        }

                        break;
                    }

                default:
                    throw new Error(`Unhandled mode "${modMeta.mode}"`);
                }
            }
            );
            return;
        }

        const fromActor = MiscUtil.get(actor, "system", actorProp, ...pathParts);
        const fromUpdate = MiscUtil.get(actorUpdate, actorProp, ...pathParts);
        const existing = fromUpdate || fromActor;

        modMetas.forEach(modMeta=>{
            switch (modMeta.mode) {
            case "appendStr":
                {
                    const existing = MiscUtil.get(actorUpdate, actorProp, ...pathParts);
                    const next = existing ? `${existing}${modMeta.joiner || ""}${modMeta.str}` : modMeta.str;
                    MiscUtil.set(actorUpdate, actorProp, ...pathParts, next);
                    break;
                }

            case "appendIfNotExistsArr":
                {
                    const existingArr = MiscUtil.copy(existing || []);
                    const out = [...existingArr];
                    out.push(...modMeta.items.filter(it=>!existingArr.some(x=>CollectionUtil.deepEquals(it, x))));
                    MiscUtil.set(actorUpdate, actorProp, ...pathParts, out);
                    break;
                }

            case "scalarAdd":
                {
                    MiscUtil.set(actorUpdate, actorProp, ...pathParts, modMeta.scalar + existing || 0);
                    break;
                }

            case "scalarAddUnit":
                {
                    const existingLower = `${existing || 0}`.toLowerCase();

                    const handle = (toFind)=>{
                        const ix = existingLower.indexOf(toFind.toLowerCase());
                        let numPart = existing.slice(0, ix);
                        const rest = existing.slice(ix);
                        const isSep = numPart.endsWith(" ");
                        numPart = numPart.trim();

                        if (!isNaN(numPart)) {
                            const out = `${modMeta.scalar + Number(numPart)}${isSep ? " " : ""}${rest}`;
                            MiscUtil.set(actorUpdate, actorProp, ...pathParts, out);
                        }
                    }
                    ;

                    if (!existing)
                        MiscUtil.set(actorUpdate, actorProp, ...pathParts, `${modMeta.scalar} ${modMeta.unitShort || modMeta.unit}`);
                    else if (modMeta.unit && existingLower.includes(modMeta.unit.toLowerCase())) {
                        handle(modMeta.unit);
                    } else if (modMeta.unitShort && existingLower.includes(modMeta.unitShort.toLowerCase())) {
                        handle(modMeta.unitShort);
                    }
                    break;
                }

            case "setMax":
                {
                    const existingLower = `${existing || 0}`.toLowerCase();
                    let asNum = Number(existingLower);
                    if (isNaN(asNum))
                        asNum = 0;
                    const maxValue = Math.max(asNum, modMeta.value);
                    MiscUtil.set(actorUpdate, actorProp, ...pathParts, maxValue);
                    break;
                }

            case "set":
                {
                    MiscUtil.set(actorUpdate, actorProp, ...pathParts, MiscUtil.copy(modMeta.value));
                    break;
                }

            default:
                throw new Error(`Unhandled mode "${modMeta.mode}"`);
            }
        }
        );
    }

    static _getProfBonusExpressionParts(str) {
        const parts = str.split(/([-+]\s*[^-+]+)/g).map(it=>it.trim().replace(/\s*/g, "")).filter(Boolean);

        const [partsNumerical,partsNonNumerical] = parts.segregate(it=>!isNaN(it));

        const totalNumerical = partsNumerical.map(it=>Number(it)).sum();

        return {
            partsNumerical,
            partsNonNumerical,
            totalNumerical
        };
    }

    static _PassiveEntryParseState = class {
        constructor({entry, img, name}, opts) {
            this._entry = entry;
            this._opts = opts;

            this.name = name;
            this.img = img;

            let {id,
            description,
            activationType, activationCost, activationCondition,
            saveAbility, saveDc, saveScaling,
            damageParts,
            attackBonus,
            requirements,
            actionType,
            durationValue, durationUnits,
            consumeType, consumeTarget, consumeAmount, consumeScale,
            formula,
            targetValue, targetUnits, targetType, targetPrompt,
            rangeShort, rangeLong, rangeUnits,
            ability,
            usesValue, usesMax, usesPer,
            rechargeValue,
            isProficient,
            typeType, typeSubtype,
            foundrySystem, _foundryData, foundryFlags, _foundryFlags, } = opts;

            this.combinedFoundrySystem = DataConverter.getCombinedFoundrySystem(foundrySystem, _foundryData);
            this.combinedFoundryFlags = DataConverter.getCombinedFoundryFlags(foundryFlags, _foundryFlags);

            if (entry._foundryId && id && entry._foundryId !== id)
                throw new Error(`Item given two different IDs (${this.id} and ${id})! This is a bug!`);

            this.id = entry._foundryId || id;

            this.description = description;

            this.activationType = activationType;
            this.activationCost = activationCost;
            this.activationCondition = activationCondition;

            this.saveAbility = saveAbility;
            this.saveDc = saveDc;
            this.saveScaling = saveScaling;

            this.damageParts = damageParts;

            this.attackBonus = attackBonus;

            this.requirements = requirements;

            this.actionType = actionType;

            this.durationValue = durationValue;
            this.durationUnits = durationUnits;

            this.consumeType = consumeType;
            this.consumeTarget = consumeTarget;
            this.consumeAmount = consumeAmount;
            this.consumeScale = consumeScale;

            this.formula = formula;

            this.targetValue = targetValue;
            this.targetUnits = targetUnits;
            this.targetType = targetType;
            this.targetPrompt = targetPrompt;

            this.rangeShort = rangeShort;
            this.rangeLong = rangeLong;
            this.rangeUnits = rangeUnits;

            this.ability = ability;

            this.usesValue = usesValue;
            this.usesMax = usesMax;
            this.usesPer = usesPer;

            this.rechargeValue = rechargeValue;

            this.isProficient = isProficient;

            this.typeType = typeType;
            this.typeSubtype = typeSubtype;

            this.effectsParsed = [];

            this.flagsParsed = {};
        }

        async pInit({isSkipDescription=false, isSkipImg=false}={}) {
            if (!isSkipDescription && !this.description && !this._opts.isSkipDescription) {
                this.description = await DataConverter.pGetEntryDescription(this._entry, {
                    depth: this._opts.renderDepth,
                    summonSpellLevel: this._opts.summonSpellLevel
                });
            }

            if (!isSkipImg && this._opts.img) {
                this.img = await Vetools.pOptionallySaveImageToServerAndGetUrl(this._opts.img);
            }
        }
    }
    ;

    static async _pGetItemActorPassive(entry, opts) {
        opts = opts || {};

        Renderer.get().setFirstSection(true).resetHeaderIndex();

        opts.modeOptions = opts.modeOptions || {};

        if (opts.mode === "object")
            opts.mode = "creature";

        const state = new this._PassiveEntryParseState({
            entry,
            name: UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(entry, {
                displayName: opts.displayName,
                isActorItem: opts.isActorItem ?? true
            })),
        },opts,);
        await state.pInit();

        const strEntries = entry.entries ? JSON.stringify(entry.entries) : null;

        this._pGetItemActorPassive_mutRecharge({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutActivation({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutUses({
            entry,
            opts,
            strEntries,
            state
        });
        this._pGetItemActorPassive_mutSave({
            entry,
            opts,
            strEntries,
            state
        });
        this._pGetItemActorPassive_mutDuration({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutDamageAndFormula({
            entry,
            opts,
            strEntries,
            state
        });
        this._pGetItemActorPassive_mutTarget({
            entry,
            opts,
            strEntries,
            state
        });
        this._pGetItemActorPassive_mutActionType({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutEffects({
            entry,
            opts,
            state
        });

        try {
            state.activationCondition = Renderer.stripTags(state.activationCondition);
        } catch (e) {
            console.error(...LGT, e);
        }

        if ((state.consumeType || state.usesPer || opts.additionalData?.["consume.type"] || opts.additionalData?.consume?.type || opts.additionalData?.["uses.per"] || opts.additionalData?.uses?.per) && !state.activationType)
            state.activationType = "special";

        state.name = state.name.trim().replace(/\s+/g, " ");
        if (!state.name)
            state.name = "(Unnamed)";
        const fauxEntrySourcePage = {
            ...entry
        };
        if (opts.source != null)
            fauxEntrySourcePage.source = opts.source;
        if (opts.page != null)
            fauxEntrySourcePage.page = opts.page;

        this._pGetItemActorPassive_mutFlags({
            entry,
            opts,
            state
        });

        const {name: translatedName, description: translatedDescription, flags: translatedFlags} = this._getTranslationMeta({
            translationData: opts.translationData,
            name: state.name,
            description: state.description,
        });

        return {
            ...this._getIdObj({
                id: state.id
            }),
            name: translatedName,
            type: opts.fvttType || "feat",
            system: {
                source: opts.fvttSource !== undefined ? opts.fvttSource : UtilDocumentSource.getSourceObjectFromEntity(fauxEntrySourcePage),
                description: {
                    value: translatedDescription,
                    chat: "",
                    unidentified: ""
                },

                damage: {
                    parts: state.damageParts ?? [],
                    versatile: "",
                },
                duration: {
                    value: state.durationValue,
                    units: state.durationUnits,
                },
                range: {
                    value: state.rangeShort,
                    long: state.rangeLong,
                    units: state.rangeUnits || ((state.rangeShort != null || state.rangeLong != null) ? "ft" : ""),
                },
                proficient: state.isProficient,
                requirements: state.requirements,

                save: {
                    ability: state.saveAbility,
                    dc: state.saveDc,
                    scaling: state.saveScaling || "flat",
                },

                activation: {
                    type: state.activationType,
                    cost: state.activationCost,
                    condition: state.activationCondition,
                },

                target: {
                    value: state.targetValue,
                    units: state.targetUnits,
                    type: state.targetType,
                    prompt: state.targetPrompt,
                },

                uses: {
                    value: state.usesValue,
                    max: state.usesMax,
                    per: state.usesPer,
                },
                ability: state.ability,
                actionType: state.actionType,
                attackBonus: state.attackBonus,
                chatFlavor: "",
                critical: {
                    threshold: null,
                    damage: ""
                },

                formula: state.formula,

                recharge: {
                    value: state.rechargeValue,
                    charged: state.rechargeValue != null,
                },

                consume: {
                    type: state.consumeType,
                    target: state.consumeTarget,
                    amount: state.consumeAmount,
                    scale: state.consumeScale,
                },

                type: {
                    value: state.typeType,
                    subtype: state.typeSubtype,
                },

                ...(state.combinedFoundrySystem || {}),
                ...(opts.additionalData || {}),
            },
            ownership: {
                default: 0
            },
            img: state.img,
            flags: {
                ...translatedFlags,
                ...state.flagsParsed,
                ...(UtilCompat.getFeatureFlags({
                    isReaction: ["reaction", "reactiondamage", "reactionmanual"].includes(state.activationType)
                })),
                ...(state.combinedFoundryFlags || {}),
                ...opts.additionalFlags,
            },
            effects: DataConverter.getEffectsMutDedupeId([...(opts.effects || []), ...state.effectsParsed, ]),
        };
    }

    static _pGetItemActorPassive_mutRecharge({entry, opts, state}) {
        if (!state.name)
            return;

        const rechargeMeta = UtilEntityGeneric.getRechargeMeta(state.name);
        if (rechargeMeta == null)
            return;

        state.name = rechargeMeta.name;
        if (state.rechargeValue === undefined && rechargeMeta.rechargeValue != null)
            state.rechargeValue = rechargeMeta.rechargeValue;
    }

    static _pGetItemActorPassive_mutActivation({entry, opts, state}) {
        this._pGetItemActorPassive_mutActivation_player({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutActivation_creature({
            entry,
            opts,
            state
        });
    }

    static _pGetItemActorPassive_mutActivation_player({entry, opts, state}) {
        if (opts.mode !== "player" || !entry.entries?.length)
            return;

        if (state.activationType || state.activationCost) {
            this._pGetItemActorPassive_mutActivation_playerCompat({
                entry,
                opts,
                state
            });
            return;
        }

        let isAction = false;
        let isBonusAction = false;
        let isReaction = false;

        UtilDataConverter.WALKER_READONLY_GENERIC.walk(entry.entries, {
            string: (str)=>{
                if (state.activationType)
                    return str;

                const sentences = Util.getSentences(str);
                for (const sentence of sentences) {
                    if (/\b(?:as an action|can take an action|can use your action)\b/i.test(sentence)) {
                        isAction = true;
                        break;
                    }

                    if (/\bbonus action\b/i.test(sentence)) {
                        isBonusAction = true;
                        break;
                    }

                    const mReact = /\b(?:your reaction|this special reaction|as a reaction)\b/i.exec(sentence);
                    if (mReact) {
                        isReaction = true;

                        let preceding = sentence.slice(0, mReact.index).trim().replace(/,$/, "");
                        const mCondition = /(^|\W)(?:if|when)(?:|\W)/i.exec(preceding);
                        if (mCondition) {
                            preceding = preceding.slice(mCondition.index + mCondition[1].length).trim();
                            state.activationCondition = state.activationCondition || preceding;
                        }

                        break;
                    }
                }
            }
            ,
        }, );

        if (isAction)
            state.activationType = "action";
        else if (isBonusAction)
            state.activationType = "bonus";
        else if (isReaction)
            state.activationType = "reaction";

        if (state.activationType)
            state.activationCost = 1;

        if (!state.activationType) {
            UtilDataConverter.WALKER_READONLY_GENERIC.walk(entry.entries, {
                string: (str)=>{
                    if (state.activationType)
                        return str;

                    const sentences = Util.getSentences(str);

                    for (const sentence of sentences) {
                        if (/you can't use this feature again|once you use this feature/i.test(sentence))
                            state.activationType = "special";
                    }
                }
                ,
            }, );
        }

        this._pGetItemActorPassive_mutActivation_playerCompat({
            entry,
            opts,
            state
        });
    }

    static _pGetItemActorPassive_mutActivation_creature({entry, opts, state}) {
        if (opts.mode !== "creature" || !entry.entries?.length || !entry.name) {
            this._pGetItemActorPassive_mutActivation_creature_enableOtherFields({
                entry,
                opts,
                state
            });
            return;
        }

        if (state.activationType || state.activationCost) {
            this._pGetItemActorPassive_mutActivation_creatureCompat({
                entry,
                opts,
                state
            });
            this._pGetItemActorPassive_mutActivation_creature_enableOtherFields({
                entry,
                opts,
                state
            });
            return;
        }

        MiscUtil.getWalker({
            isNoModification: true,
            keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
            isBreakOnReturn: true,
        }).walk(entry.entries, {
            string: str=>{
                if (/\bbonus action\b/i.test(str)) {
                    state.activationType = "bonus";
                    state.activationCost = 1;
                    return true;
                }
            }
            ,
        }, );

        if (/^legendary resistance/i.test(entry.name)) {
            state.activationType = "special";
        }

        this._pGetItemActorPassive_mutActivation_creature_enableOtherFields({
            entry,
            opts,
            state
        });

        this._pGetItemActorPassive_mutActivation_creatureCompat({
            entry,
            opts,
            state
        });
    }

    static _pGetItemActorPassive_mutActivation_creature_enableOtherFields({entry, opts, state}) {
        if (state.rechargeValue !== undefined) {
            if (state.activationType == null)
                state.activationType = "special";
        }
    }

    static _pGetItemActorPassive_mutActivation_playerCompat({entry, opts, state}) {
        if (!UtilCompat.isMidiQolActive() || state.activationType !== "reaction")
            return null;

    }

    static _pGetItemActorPassive_mutActivation_creatureCompat({entry, opts, state}) {
        if (!UtilCompat.isMidiQolActive() || state.activationType !== "reaction")
            return;

        state.activationType = "reactionmanual";

        let firstEntry = entry.entries[0];
        if (typeof firstEntry !== "string")
            return;

        firstEntry.replace(/\bcauses the attack to miss\b/i, ()=>{
            state.activationType = "reaction";
            return "";
        }
        )
        .replace(/\badds? (?<ac>\d+) to (its|their|his|her) AC\b/i, (...m)=>{
            const argsDuration = UtilCompat.isDaeActive() ? {
                flags: {
                    [UtilCompat.MODULE_DAE]: {
                        specialDuration: ["1Reaction"]
                    }
                }
            } : {
                durationTurns: 1
            };

            state.effectsParsed.push(UtilActiveEffects.getGenericEffect({
                ...argsDuration,
                key: `system.attributes.ac.bonus`,
                value: UiUtil.intToBonus(Number(m.last().ac)),
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                name: `${entry.name}`,
                icon: state.img,
                disabled: false,
                transfer: false,
                priority: UtilActiveEffects.PRIORITY_BONUS,
            }));

            state.targetType = state.targetType || "self";

            return "";
        }
        )
        .replace(/\battack that would (?:hit|miss) (?:it|them|him|her|or miss)\b/i, ()=>{
            state.activationType = "reaction";
            return "";
        }
        ).replace(/\bin response to being (?:hit|missed)\b/i, ()=>{
            state.activationType = "reaction";
            return "";
        }
        )
        .replace(/\bafter taking damage from\b/i, ()=>{
            state.activationType = "reactiondamage";
            return "";
        }
        ).replace(/\bIf [^.!?:]+ takes damage(?:,| while it)\b/i, ()=>{
            state.activationType = "reactiondamage";
            return "";
        }
        ).replace(/\bIn response to taking damage\b/i, ()=>{
            state.activationType = "reactiondamage";
            return "";
        }
        );
    }

    static _pGetItemActorPassive_mutSave({entry, opts, strEntries, state}) {
        this._pGetItemActorPassive_mutSave_player({
            entry,
            opts,
            strEntries,
            state
        });
        this._pGetItemActorPassive_mutSave_creature({
            entry,
            opts,
            strEntries,
            state
        });
    }

    static _pGetItemActorPassive_mutSave_player({entry, opts, strEntries, state}) {
        if (opts.mode !== "player" || !entry.entries?.length)
            return;

        UtilDataConverter.WALKER_READONLY_GENERIC.walk(entry.entries, {
            object: (obj)=>{
                if (obj.type !== "abilityDc")
                    return obj;

                if (state.actionType && state.saveScaling)
                    return obj;

                state.actionType = state.actionType || "save";
                state.saveScaling = obj.attributes[0];
                return obj;
            }
            ,
            string: (str)=>{
                if (state.actionType && state.saveAbility && state.saveScaling)
                    return str;

                str.replace(/8\s*\+\s*your proficiency bonus\s*\+\s*your (.*?) modifier/i, (...m)=>{
                    const customAbilities = [];
                    m[1].replace(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)/i, (...m2)=>{
                        customAbilities.push(m2[1].toLowerCase().slice(0, 3));
                    }
                    );
                    if (!customAbilities.length)
                        return;

                    state.actionType = state.actionType || "save";
                    state.saveScaling = customAbilities[0];
                }
                );

                str.replace(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw against your (.*? )spell save DC/i, (...m)=>{
                    state.actionType = state.actionType || "save";
                    state.saveAbility = state.saveAbility || m[1].toLowerCase().slice(0, 3);
                    state.saveScaling = state.saveScaling || "spell";
                }
                );

                str.replace(/(?:make a|succeed on a) (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/gi, (...m)=>{
                    state.actionType = state.actionType || "save";
                    state.saveAbility = state.saveAbility || m[1].toLowerCase().slice(0, 3);
                    state.saveScaling = state.saveScaling || "spell";
                }
                );

                return str;
            }
            ,
        }, );
    }

    static _pGetItemActorPassive_mutSave_creature({entry, opts, strEntries, state}) {
        if (opts.mode !== "creature" || !entry.entries?.length)
            return;

        const m = /{@dc (?<save>[^|}]+)(?:\|[^}]+)?}\s+(?<abil>Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)/i.exec(strEntries);
        if (!m)
            return;

        const {partsNonNumerical, totalNumerical} = this._getProfBonusExpressionParts(m.groups.save);

        state.actionType = state.actionType === undefined ? "save" : state.actionType;
        state.saveAbility = state.saveAbility === undefined ? m.groups.abil.toLowerCase().slice(0, 3) : state.saveAbility;
        state.saveDc = state.saveDc === undefined ? totalNumerical : state.saveDc;

        if (partsNonNumerical.length || opts.pb == null || ((opts.entity == null || Parser.ABIL_ABVS.some(ab=>opts.entity[ab] == null || typeof opts.entity[ab] !== "number")) && (opts.entity != null || Parser.ABIL_ABVS.some(ab=>{
            const abNamespaced = UtilEntityCreatureFeature.getNamespacedProp(ab);
            return entry[abNamespaced] == null || typeof entry[abNamespaced] !== "number";
        }
        )))) {
            state.saveScaling = state.saveScaling === undefined ? "flat" : state.saveScaling;
            return;
        }

        if (state.saveScaling)
            return;

        const fromAbil = state.saveDc - opts.pb - 8;
        const abilToBonus = Parser.ABIL_ABVS.map(ab=>({
            ability: ab,
            bonus: Parser.getAbilityModNumber(opts.entity != null ? Renderer.monster.getSafeAbilityScore(opts.entity, ab, {
                isDefaultTen: true
            }) : Renderer.monster.getSafeAbilityScore(entry, UtilEntityCreatureFeature.getNamespacedProp(ab), {
                isDefaultTen: true
            }), ),
        }));
        const matchingAbils = abilToBonus.filter(it=>it.bonus === fromAbil);

        if (matchingAbils.length === 1)
            state.saveScaling = state.saveScaling || matchingAbils[0].ability;
        else
            state.saveScaling = "flat";
    }

    static _pGetItemActorPassive_mutUses({entry, opts, strEntries, state}) {
        this._pGetItemActorPassive_mutUses_creature({
            entry,
            opts,
            strEntries,
            state
        });
        this._pGetItemActorPassive_mutUses_player({
            entry,
            opts,
            strEntries,
            state
        });
    }

    static _pGetItemActorPassive_mutUses_creature({entry, opts, strEntries, state}) {
        if (opts.mode !== "creature" || !entry.name)
            return;

        const isLegendary = /legendary resistance/gi.test(state.name);

        let isFound = false;

        state.name = state.name.replace(/\(Recharges after a (?<restPart>[^)]+)\)/i, (...m)=>{
            isFound = true;

            if (isLegendary)
                return "";

            if (state.usesValue === undefined)
                state.usesValue = 1;
            if (state.usesMax === undefined)
                state.usesMax = `${state.usesValue}`;

            const restPartClean = m.last().restPart.toLowerCase();
            if (/\bshort\b/.test(restPartClean)) {
                if (state.usesPer === undefined)
                    state.usesPer = "sr";
            } else if (/\blong\b/.test(restPartClean)) {
                if (state.usesPer === undefined)
                    state.usesPer = "lr";
            }

            return "";
        }
        );

        if (state.usesPer === undefined) {
            state.name = state.name.replace(/\(\s*(\d+)\s*\/\s*(Day|Short Rest|Long Rest)\s*\)/i, (...m)=>{
                isFound = true;

                if (isLegendary)
                    return "";

                if (state.usesValue === undefined)
                    state.usesValue = Number(m[1]);
                if (state.usesMax === undefined)
                    state.usesMax = `${state.usesValue}`;

                if (state.usesPer === undefined) {
                    const cleanTime = m[2].trim().toLowerCase();
                    switch (cleanTime) {
                    case "day":
                        state.usesPer = "day";
                        break;
                    case "short rest":
                        state.usesPer = "sr";
                        break;
                    case "long rest":
                        state.usesPer = "lr";
                        break;
                    }
                }

                return "";
            }
            );
        }

        if (state.usesPer === undefined) {
            state.name = state.name.replace(/\(\s*(\d+)\s+Charges\s*\)/i, (...m)=>{
                isFound = true;

                if (isLegendary)
                    return "";

                if (state.usesValue === undefined)
                    state.usesValue = Number(m[1]);
                if (state.usesMax === undefined)
                    state.usesMax = `${state.usesValue}`;
                if (state.usesPer === undefined)
                    state.usesPer = "charges";

                return "";
            }
            );
        }

        if (!isFound)
            return;

        state.name = state.name.trim().replace(/ +/g, " ");

        if (state.activationType === undefined)
            state.activationType = state.activationType || "none";

        if (entry.entries && typeof entry.entries[0] === "string" && /^(?:If |When )/i.test(entry.entries[0].trim())) {
            if (state.activationCondition === undefined)
                state.activationCondition = entry.entries[0].trim();
        }
    }

    static _pGetItemActorPassive_mutUses_player({entry, opts, strEntries, state}) {
        if (opts.mode !== "player" || !entry.entries)
            return;

        if (state.consumeType === "charges")
            return;

        const isShortRest = /\b(?:finish|complete) a short rest\b/.test(strEntries) || /\b(?:finish|complete) a short or long rest\b/.test(strEntries) || /\b(?:finish|complete) a short rest or a long rest\b/.test(strEntries) || /\b(?:finish|complete) a short or long rest\b/.test(strEntries);
        const isLongRest = !isShortRest && /\b(?:finish|complete) a long rest\b/.test(strEntries);

        if (state.usesPer === undefined) {
            if (isShortRest)
                state.usesPer = "sr";
            else if (isLongRest)
                state.usesPer = "lr";
        }

        const mAbilModifier = new RegExp(`a number of times equal to(?: (${Consts.TERMS_COUNT.map(it=>it.tokens.join("")).join("|")}))? your (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) modifier(?: \\(minimum of (${Consts.TERMS_COUNT.map(it=>it.tokens.join("")).join("|")})\\))?`,"i").exec(strEntries);
        if (mAbilModifier && opts.actor) {
            const abv = mAbilModifier[2].slice(0, 3).toLowerCase();
            const abilScore = MiscUtil.get(opts.actor, "system", "abilities", abv, "value");
            if (abilScore != null) {
                let mod = Parser.getAbilityModNumber(abilScore);
                let modFormula = `floor((@abilities.${abv}.value - 10) / 2)`;

                if (mAbilModifier[1]) {
                    const multiplier = (Consts.TERMS_COUNT.find(it=>it.tokens.join(" ") === mAbilModifier[1].trim().toLowerCase()) || {}).count || 1;
                    mod = mod * multiplier;
                    modFormula = `${modFormula} * ${multiplier}`;
                }

                if (mAbilModifier[3]) {
                    const min = (Consts.TERMS_COUNT.find(it=>it.tokens.join("") === mAbilModifier[3].trim().toLowerCase()) || {}).count || 1;
                    mod = Math.max(min, mod);
                    modFormula = `max(${min}, ${modFormula})`;
                }

                if (state.usesValue === undefined)
                    state.usesValue = mod;
                if (state.usesMax === undefined)
                    state.usesMax = modFormula;
            }
        }

        strEntries.replace(/(you can ([^.!?]+)) a number of times equal to(?<mult> twice)? your proficiency bonus/i, (...m)=>{
            const mult = m.last().mult ? (Consts.TERMS_COUNT.find(meta=>CollectionUtil.deepEquals(meta.tokens, m.last().mult.trim().toLowerCase().split(/( )/g)))?.count || 1) : 1;
            if (state.usesValue === undefined)
                state.usesValue = opts.actor ? (UtilActors.getProficiencyBonusNumber({
                    actor: opts.actor
                }) * mult) : null;
            if (state.usesMax === undefined)
                state.usesMax = `@prof${mult > 1 ? ` * ${mult}` : ""}`;
        }
        );

        strEntries.replace(/you can use this (?:feature|ability) (?<mult>once|twice|[a-zA-Z]+ times)/i, (...m)=>{
            const mult = (Consts.TERMS_COUNT.find(meta=>CollectionUtil.deepEquals(meta.tokens, m.last().mult.trim().toLowerCase().split(/( )/g)))?.count || 1);
            if (state.usesValue === undefined)
                state.usesValue = mult;
            if (state.usesMax === undefined)
                state.usesMax = mult;
        }
        );

        if (state.usesPer && !state.usesValue && (!state.usesMax || state.usesMax === "0")) {
            if (state.usesValue === undefined)
                state.usesValue = 1;
            if (state.usesMax === undefined)
                state.usesMax = `${state.usesValue}`;
        }
    }

    static _pGetItemActorPassive_mutDuration({entry, opts, state}) {
        this._pGetItemActorPassive_mutDuration_creature({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutDuration_player({
            entry,
            opts,
            state
        });
    }

    static _pGetItemActorPassive_mutDuration_creature({entry, opts, state}) {
        if (opts.mode !== "creature" || !entry.entries)
            return;

        return "stubbed";
    }

    static _pGetItemActorPassive_mutDuration_player({entry, opts, state}) {
        if (opts.mode !== "player" || !entry.entries)
            return;

        UtilDataConverter.WALKER_READONLY_GENERIC.walk(entry.entries, {
            string: (str)=>{
                if (state.durationValue || state.durationUnits)
                    return;

                str.replace(/(?:^|\W)lasts for (\d+) (minute|hour|day|month|year|turn|round)s?(?:\W|$)/gi, (...m)=>{
                    state.durationValue = Number(m[1]);
                    state.durationUnits = m[2].toLowerCase();
                }
                );

                str.replace(/(?:^|\W)for the next (\d+) (minute|hour|day|month|year|turn|round)s?(?:\W|$)/gi, (...m)=>{
                    state.durationValue = Number(m[1]);
                    state.durationUnits = m[2].toLowerCase();
                }
                );

                str.replace(/(?:^|\W)turned for (\d+) (minute|hour|day|month|year|turn|round)s?(?:\W|$)/gi, (...m)=>{
                    state.durationValue = Number(m[1]);
                    state.durationUnits = m[2].toLowerCase();
                }
                );

                str.replace(/(?:^|\W)this effect lasts for (\d+) (minute|hour|day|month|year|turn|round)s?(?:\W|$)/gi, (...m)=>{
                    state.durationValue = Number(m[1]);
                    state.durationUnits = m[2].toLowerCase();
                }
                );

                str.replace(/(?:^|\W)until the end of your next turn(?:\W|$)/gi, ()=>{
                    state.durationValue = 1;
                    state.durationUnits = "turn";
                }
                );

                Renderer.stripTags(str).replace(/(?:^|\W)is \w+ by you for (\d+) (minute|hour|day|month|year|turn|round)s(?:\W|$)/gi, (...m)=>{
                    state.durationValue = Number(m[1]);
                    state.durationUnits = m[2].toLowerCase();
                }
                );
            }
            ,
        }, );
    }

    static _pGetItemActorPassive_getTargetMeta(strEntries) {
        let targetValue, targetUnits, targetType;
        let found = false;

        let tmpEntries = strEntries.replace(/exhales [^.]*a (?<size>\d+)-foot[- ](?<shape>cone|line)/, (...m)=>{
            targetValue = Number(m.last().size);
            targetUnits = "ft";
            targetType = m.last().shape;
            found = true;

            return "";
        }
        );

        if (found)
            return this._pGetItemActorPassive_getTargetMetricAdjusted({
                targetValue,
                targetUnits,
                targetType
            });

        tmpEntries = tmpEntries.replace(/(?<size>\d+)-foot-radius,? \d+-foot-tall cylinder/, (...m)=>{
            targetValue = Number(m.last().size);
            targetUnits = "ft";
            targetType = "cylinder";

            found = true;
            return "";
        }
        );

        if (found)
            return this._pGetItemActorPassive_getTargetMetricAdjusted({
                targetValue,
                targetUnits,
                targetType
            });

        tmpEntries = tmpEntries.replace(/(?<size>\d+)-foot[- ]radius(?<ptSphere> sphere)?/, (...m)=>{
            targetValue = Number(m.last().size);
            targetUnits = "ft";
            targetType = (m.last().ptSphere ? "sphere" : "radius");

            found = true;
            return "";
        }
        );

        if (found)
            return this._pGetItemActorPassive_getTargetMetricAdjusted({
                targetValue,
                targetUnits,
                targetType
            });

        tmpEntries = tmpEntries.replace(/(?<size>\d+)-foot[- ]cube/, (...m)=>{
            targetValue = Number(m.last().size);
            targetUnits = "ft";
            targetType = "cube";

            found = true;
            return "";
        }
        );

        if (found)
            return this._pGetItemActorPassive_getTargetMetricAdjusted({
                targetValue,
                targetUnits,
                targetType
            });

        tmpEntries = tmpEntries.replace(/(?<size>\d+)-foot[- ]square/, (...m)=>{
            targetValue = Number(m.last().size);
            targetUnits = "ft";
            targetType = "square";

            found = true;
            return "";
        }
        );

        if (found)
            return this._pGetItemActorPassive_getTargetMetricAdjusted({
                targetValue,
                targetUnits,
                targetType
            });

        tmpEntries = tmpEntries.replace(/(?<size>\d+)-foot line/, (...m)=>{
            targetValue = Number(m.last().size);
            targetUnits = "ft";
            targetType = "line";

            found = true;
            return "";
        }
        );

        tmpEntries = tmpEntries.replace(/(?<size>\d+)-foot cone/, (...m)=>{
            targetValue = Number(m.last().size);
            targetUnits = "ft";
            targetType = "cone";

            found = true;
            return "";
        }
        );

        if (found)
            return this._pGetItemActorPassive_getTargetMetricAdjusted({
                targetValue,
                targetUnits,
                targetType
            });

        return {};
    }

    static _pGetItemActorPassive_getTargetMetricAdjusted({targetValue, targetUnits, targetType}) {
        targetValue = Config.getMetricNumberDistance({
            configGroup: this._configGroup,
            originalValue: targetValue,
            originalUnit: "feet"
        });
        if (targetUnits)
            targetUnits = Config.getMetricUnitDistance({
                configGroup: this._configGroup,
                originalUnit: targetUnits
            });

        return {
            targetValue,
            targetUnits,
            targetType
        };
    }

    static _pGetItemActorPassive_mutDamageAndFormula({entry, opts, strEntries, state}) {
        this._pGetItemActorPassive_mutDamageAndFormula_playerOrVehicle({
            entry,
            opts,
            strEntries,
            state
        });
        this._pGetItemActorPassive_mutDamageAndFormula_creature({
            entry,
            opts,
            strEntries,
            state
        });
    }

    static _pGetItemActorPassive_mutDamageAndFormula_playerOrVehicle({entry, opts, state, strEntries}) {
        if (opts.mode !== "player" && opts.mode !== "vehicle")
            return;
        if (!entry.entries)
            return;

        let strEntriesNoDamageDice = strEntries;
        if (!state.damageParts?.length) {
            const {str, damageTupleMetas} = this._getDamageTupleMetas(strEntries, {
                summonSpellLevel: opts.summonSpellLevel
            });
            strEntriesNoDamageDice = str;

            const {damageParts: damageParts_, formula: formula_} = this._getDamagePartsAndOtherFormula(damageTupleMetas);

            state.damageParts = damageParts_;
            state.formula = state.formula ?? formula_;
        }

        if (state.formula == null) {
            strEntriesNoDamageDice.replace(/{(?:@dice|@scaledice) ([^|}]+)(?:\|[^}]+)?}/i, (...m)=>{
                const [dice] = m[1].split("|");
                state.formula = dice;
            }
            );
        }
    }

    static _pGetItemActorPassive_mutDamageAndFormula_creature({entry, opts, strEntries, state}) {
        if (opts.mode !== "creature")
            return;
        if (!entry.entries?.length)
            return;

        if (!state.damageParts?.length && state.formula == null) {
            const str = entry.entries[0];
            if (typeof str !== "string")
                return;

            const {damageTupleMetas} = this._getDamageTupleMetas(str);
            const {damageParts, formula} = this._getDamagePartsAndOtherFormula(damageTupleMetas);

            state.damageParts = damageParts;
            state.formula = formula;
        }
    }

    static _pGetItemActorPassive_mutTarget({entry, opts, strEntries, state}) {
        this._pGetItemActorPassive_mutTarget_player({
            entry,
            opts,
            strEntries,
            state
        });
        this._pGetItemActorPassive_mutTarget_creature({
            entry,
            opts,
            strEntries,
            state
        });
    }

    static _pGetItemActorPassive_mutTarget_player({entry, opts, strEntries, state}) {
        if (opts.mode !== "player")
            return;

        if (state.targetPrompt === undefined)
            state.targetPrompt = Config.getSafe(this._configGroup, "isTargetTemplatePrompt");
    }

    static _pGetItemActorPassive_mutTarget_creature({entry, opts, strEntries, state}) {
        if (opts.mode !== "creature")
            return;
        if (!strEntries)
            return;

        if (!state.targetValue && !state.targetUnits && !state.targetType) {
            const targetMeta = this._pGetItemActorPassive_getTargetMeta(strEntries);
            state.targetValue = targetMeta.targetValue || state.targetValue;
            state.targetUnits = targetMeta.targetUnits || state.targetUnits;
            state.targetType = targetMeta.targetType || state.targetType;
        }

        if (state.targetPrompt === undefined)
            state.targetPrompt = Config.getSafe(this._configGroup, "isTargetTemplatePrompt");
    }

    static _pGetItemActorPassive_mutActionType({entry, opts, state}) {
        this._pGetItemActorPassive_mutActionType_player({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutActionType_creature({
            entry,
            opts,
            state
        });
    }

    static _pGetItemActorPassive_mutActionType_player({entry, opts, state}) {
        if (state.actionType || opts.mode !== "player" || !entry.entries?.length)
            return;

        const walker = MiscUtil.getWalker({
            keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
            isNoModification: true,
            isBreakOnReturn: true
        });
        walker.walk(entry.entries, {
            string: str=>{
                const mMeleeRangedWeaponAttack = /you\b[^.!?]*\bmake a (?<type>melee|ranged) weapon attack/i.exec(str);
                if (mMeleeRangedWeaponAttack) {
                    state.actionType = mMeleeRangedWeaponAttack.groups.type.toLowerCase() === "melee" ? "mwak" : "rwak";
                    return true;
                }

                const mMeleeRangedSpellAttack = /you\b[^.!?]*\bmake a (?<type>melee|ranged) spell attack/i.exec(str);
                if (mMeleeRangedSpellAttack) {
                    state.actionType = mMeleeRangedSpellAttack.groups.type.toLowerCase() === "melee" ? "msak" : "rsak";
                    return true;
                }

                const mHeal = /creature\b[^.!?]*\bregains\b[^.!?]*\bhit points?/i.exec(str);
                if (mHeal) {
                    state.actionType = "heal";
                    return true;
                }
            }
            ,
        }, );

        state.actionType = state.actionType || "other";
    }

    static _pGetItemActorPassive_mutActionType_creature({entry, opts, state}) {
        if (state.actionType || opts.mode !== "creature" || !entry.entries?.length)
            return;

        state.actionType = "other";
    }

    static _pGetItemActorPassive_mutEffects({entry, opts, state}) {
        this._pGetItemActorPassive_mutEffects_player({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutEffects_creature({
            entry,
            opts,
            state
        });
    }

    static _pGetItemActorPassive_mutEffects_player({entry, opts, state}) {
        if (opts.mode !== "player" || !entry.entries?.length)
            return;

        void 0;
    }

    static _pGetItemActorPassive_mutEffects_creature({entry, opts, state}) {
        if (opts.mode !== "creature" || !entry.entries?.length)
            return;

        if (!UtilCompat.isPlutoniumAddonAutomationActive())
            return;

        const effects = UtilAutomation.getCreatureFeatureEffects({
            entry,
            img: state.img
        });
        if (effects.length)
            state.effectsParsed.push(...effects);
    }

    static _pGetItemActorPassive_mutFlags({entry, opts, state}) {
        this._pGetItemActorPassive_mutFlags_player({
            entry,
            opts,
            state
        });
        this._pGetItemActorPassive_mutFlags_creature({
            entry,
            opts,
            state
        });
    }

    static _pGetItemActorPassive_mutFlags_player({entry, opts, state}) {
        if (opts.mode !== "player" || !entry.entries?.length)
            return;

        void 0;
    }

    static _pGetItemActorPassive_mutFlags_creature({entry, opts, state}) {
        if (opts.mode !== "creature" || !entry.entries?.length)
            return;

        if (!UtilCompat.isPlutoniumAddonAutomationActive())
            return;

        const flags = UtilAutomation.getCreatureFeatureFlags({
            entry,
            hasDamageParts: !!state.damageParts?.length,
            hasSavingThrow: !!state.saveDc,
        });

        foundry.utils.mergeObject(state.flagsParsed, flags);
    }

    static _DEFAULT_SAVING_THROW_DATA = {
        saveAbility: undefined,
        saveScaling: undefined,
        saveDc: undefined,
    };

    static getSavingThrowData(entries) {
        if (!entries?.length)
            return MiscUtil.copy(this._DEFAULT_SAVING_THROW_DATA);

        let isFoundParse = false;
        let {saveAbility, saveScaling, saveDc, } = MiscUtil.copy(this._DEFAULT_SAVING_THROW_DATA);

        const walker = MiscUtil.getWalker({
            keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
            isNoModification: true,
            isBreakOnReturn: true
        });
        const reDc = /(?:{@dc (?<dc>\d+)}|DC\s*(?<dcAlt>\d+))\s*(?<ability>Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)/i;

        walker.walk(entries, {
            string: (str)=>{
                const mDc = reDc.exec(str);
                if (!mDc)
                    return;

                saveDc = Number(mDc.groups.dc || mDc.groups.dcAlt);
                saveAbility = mDc.groups.ability.toLowerCase().substring(0, 3);
                saveScaling = "flat";
                isFoundParse = true;

                return true;
            }
            ,
        }, );

        return {
            saveAbility,
            saveScaling,
            saveDc,
            isFoundParse
        };
    }

    static getMaxCasterProgression(...casterProgressions) {
        casterProgressions = casterProgressions.filter(Boolean);
        const ixs = casterProgressions.map(it=>this._CASTER_PROGRESSIONS.indexOf(it)).filter(ix=>~ix);
        if (!ixs.length){return null;}
        return this._CASTER_PROGRESSIONS[Math.min(...ixs)];
    }

    static getMaxCantripProgression(...casterProgressions) {
        const out = [];
        casterProgressions.filter(Boolean).forEach(progression=>{
            progression.forEach((cnt,i)=>{
                if (out[i] == null)
                    return out[i] = cnt;
                out[i] = Math.max(out[i], cnt);
            });
        });
        return out;
    }

    static async pFillActorSkillToolLanguageData({existingProficienciesSkills, existingProficienciesTools, existingProficienciesLanguages, skillProficiencies, languageProficiencies, toolProficiencies, skillToolLanguageProficiencies, actorData, importOpts, titlePrefix, }, ) {
        skillToolLanguageProficiencies = this._pFillActorSkillToolLanguageData_getMergedProfs({
            skillProficiencies,
            languageProficiencies,
            toolProficiencies,
            skillToolLanguageProficiencies,
        });

        const formData = await Charactermancer_OtherProficiencySelect.pGetUserInput({
            titlePrefix,
            existingFvtt: {
                skillProficiencies: existingProficienciesSkills,
                toolProficiencies: existingProficienciesTools,
                languageProficiencies: existingProficienciesLanguages,
            },
            available: skillToolLanguageProficiencies,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplySkillFormDataToActorUpdate({
            existingProfsActor: existingProficienciesSkills,
            formData,
            actorData,
        });

        this.doApplyOtherProficienciesFormData({
            existingProfsActor: existingProficienciesLanguages,
            formData,
            formDataProp: "languageProficiencies",
            actorData,
            opts: {
                fnGetMappedItem: it=>UtilActors.getMappedLanguage(it),
                fnGetMappedCustomItem: it=>Renderer.splitTagByPipe(it)[0].toTitleCase(),
                actorTraitProp: "languages",
            },
        });

        this.doApplyToolFormDataToActorUpdate({
            existingProfsActor: existingProficienciesTools,
            formData,
            actorData,
        });
    }

    static _pFillActorSkillToolLanguageData_getMergedProfs({skillProficiencies, languageProficiencies, toolProficiencies, skillToolLanguageProficiencies, }, ) {
        const hasAnySingles = skillProficiencies?.length || languageProficiencies?.length || toolProficiencies?.length;
        if (!hasAnySingles)
            return skillToolLanguageProficiencies;

        if (!skillToolLanguageProficiencies?.length) {
            const out = [];
            this._pFillActorSkillToolLanguageData_doMergeToSingleArray({
                targetArray: out,
                skillProficiencies,
                languageProficiencies,
                toolProficiencies,
            });
            return out;
        }

        if (skillToolLanguageProficiencies?.length && hasAnySingles)
            console.warn(...LGT, `Founds individual skill/language/tool proficiencies alongside combined skill/language/tool; these will be merged together.`);

        const out = MiscUtil.copy(skillToolLanguageProficiencies || []);
        this._pFillActorSkillToolLanguageData_doMergeToSingleArray({
            targetArray: out,
            skillProficiencies,
            languageProficiencies,
            toolProficiencies,
        });
        return out;
    }

    static _pFillActorSkillToolLanguageData_doMergeToSingleArray({targetArray, skillProficiencies, languageProficiencies, toolProficiencies, }, ) {
        const maxLen = Math.max(targetArray?.length || 0, skillProficiencies?.length || 0, languageProficiencies?.length || 0, toolProficiencies?.length || 0, );
        for (let i = 0; i < maxLen; ++i) {
            const tgt = (targetArray[i] = {});

            const skillProfSet = skillProficiencies?.[i];
            const langProfSet = languageProficiencies?.[i];
            const toolProfSet = toolProficiencies?.[i];

            if (skillProfSet) {
                this._pFillActorSkillToolLanguageData_doAddProfType({
                    targetObject: tgt,
                    profSet: skillProfSet,
                    validKeySet: new Set(Object.keys(Parser.SKILL_TO_ATB_ABV)),
                    anyKeySet: new Set(["any"]),
                    anyKeySuffix: "Skill",
                });
            }

            if (langProfSet) {
                this._pFillActorSkillToolLanguageData_doAddProfType({
                    targetObject: tgt,
                    profSet: langProfSet,
                    anyKeySet: new Set(["any", "anyStandard", "anyExotic"]),
                    anyKeySuffix: "Language",
                });
            }

            if (toolProfSet) {
                this._pFillActorSkillToolLanguageData_doAddProfType({
                    targetObject: tgt,
                    profSet: toolProfSet,
                    anyKeySet: new Set(["any"]),
                    anyKeySuffix: "Tool",
                });
            }
        }
    }

    static _pFillActorSkillToolLanguageData_doAddProfType({targetObject, profSet, validKeySet, anyKeySet, anyKeySuffix, }, ) {
        Object.entries(profSet).forEach(([k,v])=>{
            switch (k) {
            case "choose":
                {
                    if (v?.from?.length) {
                        const choose = MiscUtil.copy(v);
                        choose.from = choose.from.filter(kFrom=>!validKeySet || validKeySet.has(kFrom));
                        if (choose.from.length) {
                            const tgtChoose = (targetObject.choose = targetObject.choose || []);
                            tgtChoose.push(choose);
                        }
                    }
                    break;
                }

            default:
                {
                    if (anyKeySet && anyKeySet.has(k)) {
                        targetObject[`${k}${anyKeySuffix}`] = MiscUtil.copy(v);
                        break;
                    }

                    if (!validKeySet || validKeySet.has(k))
                        targetObject[k] = MiscUtil.copy(v);
                }
            }
        }
        );
    }

    static async pFillActorSkillData(existingProfsActor, skillProficiencies, actorData, dataBuilderOpts, opts) {
        return this._pFillActorSkillToolData({
            existingProfsActor,
            proficiencies: skillProficiencies,
            actorData,
            dataBuilderOpts,
            opts,
            fnGetMapped: Charactermancer_OtherProficiencySelect.getMappedSkillProficiencies.bind(Charactermancer_OtherProficiencySelect),
            propProficiencies: "skillProficiencies",
            pFnApplyToActorUpdate: this.doApplySkillFormDataToActorUpdate.bind(this),
        });
    }

    static async pFillActorToolData(existingProfsActor, toolProficiencies, actorData, dataBuilderOpts, opts) {
        return this._pFillActorSkillToolData({
            existingProfsActor,
            proficiencies: toolProficiencies,
            actorData,
            dataBuilderOpts,
            opts,
            fnGetMapped: Charactermancer_OtherProficiencySelect.getMappedToolProficiencies.bind(Charactermancer_OtherProficiencySelect),
            propProficiencies: "toolProficiencies",
            pFnApplyToActorUpdate: this.doApplyToolFormDataToActorUpdate.bind(this),
        });
    }

    static async _pFillActorSkillToolData({existingProfsActor, proficiencies, actorData, dataBuilderOpts, opts, fnGetMapped, propProficiencies, pFnApplyToActorUpdate, }, ) {
        opts = opts || {};

        if (!proficiencies)
            return {};
        proficiencies = fnGetMapped(proficiencies);

        const formData = await Charactermancer_OtherProficiencySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                [propProficiencies]: existingProfsActor,
            },
            available: proficiencies,
        });
        if (!formData)
            return dataBuilderOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        return pFnApplyToActorUpdate({
            existingProfsActor,
            formData,
            actorData
        });
    }

    static doApplySkillFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        return this._doApplySkillToolFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData,
            mapAbvToFull: UtilActors.SKILL_ABV_TO_FULL,
            propFormData: "skillProficiencies",
            propActorData: "skills",
        }, );
    }

    static doApplyToolFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        return this._doApplySkillToolFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData,
            mapAbvToFull: UtilActors.TOOL_ABV_TO_FULL,
            propFormData: "toolProficiencies",
            propActorData: "tools",
        }, );
    }

    static _doApplySkillToolFormDataToActorUpdate({existingProfsActor, formData, actorData, mapAbvToFull, propFormData, propActorData}) {
        if (!formData?.data?.[propFormData])
            return;

        const out = {};

        actorData[propActorData] = actorData[propActorData] || {};
        Object.entries(mapAbvToFull).filter(([_,name])=>formData.data[propFormData][name]).forEach(([abv,name])=>{
            out[abv] = formData.data[propFormData][name];

            const maxValue = Math.max((existingProfsActor[abv] || {}).value || 0, formData.data[propFormData][name] != null ? Number(formData.data[propFormData][name]) : 0, (actorData[propActorData][abv] || {}).value || 0, );

            const isUpdate = maxValue > (MiscUtil.get(actorData[propActorData], abv, "value") || 0);
            if (isUpdate)
                (actorData[propActorData][abv] = actorData[propActorData][abv] || {}).value = maxValue;
        }
        );

        return out;
    }

    static async pFillActorLanguageData(existingProfsActor, importingProfs, data, importOpts, opts) {
        opts = opts || {};

        if (!importingProfs)
            return;
        importingProfs = Charactermancer_OtherProficiencySelect.getMappedLanguageProficiencies(importingProfs);

        const formData = await Charactermancer_OtherProficiencySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                languageProficiencies: existingProfsActor,
            },
            available: importingProfs,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyLanguageProficienciesFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData: data
        });
    }

    static doApplyLanguageProficienciesFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplyOtherProficienciesFormData({
            existingProfsActor,
            formData,
            formDataProp: "languageProficiencies",
            actorData,
            opts: {
                fnGetMappedItem: it=>UtilActors.getMappedLanguage(it),
                fnGetMappedCustomItem: it=>Renderer.splitTagByPipe(it)[0].toTitleCase(),
                actorTraitProp: "languages",
            },
        });
    }

    static async pFillActorToolProfData(existingProfsActor, importingProfs, data, dataBuilderOpts, opts) {
        opts = opts || {};

        if (!importingProfs)
            return;
        importingProfs = Charactermancer_OtherProficiencySelect.getMappedToolProficiencies(importingProfs);

        const formData = await Charactermancer_OtherProficiencySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                toolProficiencies: existingProfsActor,
            },
            available: importingProfs,
        });
        if (!formData)
            return dataBuilderOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyToolProficienciesFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData: data
        });
    }

    static doApplyToolProficienciesFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplyToolFormDataToActorUpdate({
            existingProfsActor: existingProfsActor,
            formData,
            actorData,
        });
    }

    static async pFillActorLanguageOrToolData(existingProfsLanguages, existingProfsTools, importingProfs, actorData, importOpts, opts) {
        opts = opts || {};

        if (!importingProfs)
            return;
        importingProfs = Charactermancer_OtherProficiencySelect.getMappedLanguageProficiencies(importingProfs);
        importingProfs = Charactermancer_OtherProficiencySelect.getMappedToolProficiencies(importingProfs);

        const formData = await Charactermancer_OtherProficiencySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                languageProficiencies: existingProfsLanguages,
                toolProficiencies: existingProfsTools,
            },
            available: importingProfs,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyOtherProficienciesFormData({
            existingProfsActor: existingProfsLanguages,
            formData,
            formDataProp: "languageProficiencies",
            actorData,
            opts: {
                fnGetMappedItem: it=>UtilActors.getMappedLanguage(it),
                fnGetMappedCustomItem: it=>Renderer.splitTagByPipe(it)[0].toTitleCase(),
                actorTraitProp: "languages",
            },
        });

        this.doApplyToolFormDataToActorUpdate({
            existingProfsActor: existingProfsTools,
            formData,
            actorData,
        });
    }

    static async pFillActorArmorProfData(existingProfsActor, importingProfs, data, importOpts, opts) {
        opts = opts || {};

        if (!importingProfs)
            return;
        importingProfs = Charactermancer_OtherProficiencySelect.getMappedArmorProficiencies(importingProfs);

        const formData = await Charactermancer_OtherProficiencySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                armorProficiencies: existingProfsActor,
            },
            available: importingProfs,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyArmorProficienciesFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData: data
        });
    }

    static doApplyArmorProficienciesFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplyOtherProficienciesFormData({
            existingProfsActor,
            formData,
            formDataProp: "armorProficiencies",
            actorData,
            opts: {
                fnGetMappedItem: it=>UtilActors.getMappedArmorProficiency(it),
                fnGetMappedCustomItem: it=>Renderer.splitTagByPipe(it)[0].toTitleCase(),
                actorTraitProp: "armorProf",
            },
        });
    }

    static async pFillActorWeaponProfData(existingProfsActor, importingProfs, data, importOpts, opts) {
        opts = opts || {};

        if (!importingProfs)
            return;
        importingProfs = Charactermancer_OtherProficiencySelect.getMappedWeaponProficiencies(importingProfs);

        const formData = await Charactermancer_OtherProficiencySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                weaponProficiencies: existingProfsActor,
            },
            available: importingProfs,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyWeaponProficienciesFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData: data
        });
    }

    static doApplyWeaponProficienciesFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplyOtherProficienciesFormData({
            existingProfsActor,
            formData,
            formDataProp: "weaponProficiencies",
            actorData,
            opts: {
                fnGetMappedItem: it=>UtilActors.getMappedWeaponProficiency(it),
                fnGetMappedCustomItem: it=>Renderer.splitTagByPipe(it)[0].toTitleCase(),
                actorTraitProp: "weaponProf",
            },
        });
    }

    static doApplyOtherProficienciesFormData({existingProfsActor, formData, formDataProp, actorData, opts}) {
        if (!formData?.data?.[formDataProp])
            return false;

        existingProfsActor = existingProfsActor || {};

        const formDataSet = formData.data[formDataProp];

        if (!Object.keys(formDataSet).length)
            return false;
        const cpyFormDataSet = MiscUtil.copy(formDataSet);

        const profSet = new Set();
        Object.keys(cpyFormDataSet).filter(k=>cpyFormDataSet[k]).forEach(k=>profSet.add(k));

        const mappedValidItems = new Set();
        const customItems = [];

        (existingProfsActor.value || []).forEach(it=>mappedValidItems.add(it));
        (existingProfsActor.custom || "").split(";").map(it=>it.trim()).filter(Boolean).forEach(it=>this._doApplyFormData_doCheckAddCustomItem(customItems, it));

        const existingProfsActorData = MiscUtil.get(actorData, "traits", opts.actorTraitProp);
        (existingProfsActorData?.value || []).forEach(it=>mappedValidItems.add(it));
        (existingProfsActorData?.custom || "").split(";").map(it=>it.trim()).filter(Boolean).forEach(it=>this._doApplyFormData_doCheckAddCustomItem(customItems, it));

        profSet.forEach(it=>{
            const mapped = opts.fnGetMappedItem ? opts.fnGetMappedItem(it) : it;
            if (mapped)
                mappedValidItems.add(mapped);
            else {
                const toAdd = opts.fnGetMappedCustomItem ? opts.fnGetMappedCustomItem(it) : it.toTitleCase();
                this._doApplyFormData_doCheckAddCustomItem(customItems, toAdd);
            }
        }
        );

        const dataTarget = MiscUtil.set(actorData, "traits", opts.actorTraitProp, {});
        dataTarget.value = [...mappedValidItems].map(it=>it.toLowerCase()).sort(SortUtil.ascSortLower);
        dataTarget.custom = customItems.join(";");
    }

    static _doApplyFormData_doCheckAddCustomItem(customItems, item) {
        const cleanItem = item.trim().toLowerCase();
        if (!customItems.some(it=>it.trim().toLowerCase() === cleanItem))
            customItems.push(item);
    }

    static doApplySavingThrowProficienciesFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        if (!formData?.data?.savingThrowProficiencies)
            return;

        actorData.abilities = actorData.abilities || {};
        Parser.ABIL_ABVS.filter(ab=>formData.data.savingThrowProficiencies[ab]).forEach(ab=>{
            const maxValue = Math.max(existingProfsActor[ab]?.proficient || 0, formData.data.savingThrowProficiencies[ab] ? 1 : 0, actorData.abilities[ab]?.proficient || 0, );
            const isUpdate = maxValue > (MiscUtil.get(actorData.abilities, ab, "proficient") || 0);
            if (isUpdate)
                MiscUtil.set(actorData.abilities, ab, "proficient", maxValue);
        }
        );
    }

    static async pFillActorImmunityData(existingProfsActor, importing, data, importOpts, opts) {
        opts = opts || {};

        const formData = await Charactermancer_DamageImmunitySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                immune: existingProfsActor,
            },
            available: importing,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyDamageImmunityFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData: data
        });
    }

    static async pFillActorResistanceData(existingProfsActor, importing, data, importOpts, opts) {
        opts = opts || {};

        const formData = await Charactermancer_DamageResistanceSelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                resist: existingProfsActor,
            },
            available: importing,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyDamageResistanceFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData: data
        });
    }

    static async pFillActorVulnerabilityData(existingProfsActor, importing, data, importOpts, opts) {
        opts = opts || {};

        const formData = await Charactermancer_DamageVulnerabilitySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                vulnerable: existingProfsActor,
            },
            available: importing,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyDamageVulnerabilityFormDataToActorUpdate({
            existingProfsActor,
            formData,
            actorData: data
        });
    }

    static async pFillActorConditionImmunityData(existing, importing, data, importOpts, opts) {
        opts = opts || {};

        const formData = await Charactermancer_ConditionImmunitySelect.pGetUserInput({
            ...opts,
            existingFvtt: {
                conditionImmune: existing,
            },
            available: importing,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyConditionImmunityFormDataToActorUpdate({
            existingProfsActor: existing,
            formData,
            actorData: data
        });
    }

    static doApplyDamageImmunityFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplyOtherProficienciesFormData({
            existingProfsActor,
            formData,
            formDataProp: "immune",
            actorData,
            opts: {
                actorTraitProp: "di",
            },
        });
    }

    static doApplyDamageResistanceFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplyOtherProficienciesFormData({
            existingProfsActor,
            formData,
            formDataProp: "resist",
            actorData,
            opts: {
                actorTraitProp: "dr",
            },
        });
    }

    static doApplyDamageVulnerabilityFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplyOtherProficienciesFormData({
            existingProfsActor,
            formData,
            formDataProp: "vulnerable",
            actorData,
            opts: {
                actorTraitProp: "dv",
            },
        });
    }

    static doApplyConditionImmunityFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplyOtherProficienciesFormData({
            existingProfsActor,
            formData,
            formDataProp: "conditionImmune",
            actorData,
            opts: {
                fnGetMappedItem: it=>it === "disease" ? "diseased" : it,
                actorTraitProp: "ci",
            },
        });
    }

    static async pFillActorExpertiseData({existingProficienciesSkills, existingProficienciesTools, expertise, actorData, importOpts, titlePrefix, }, ) {
        const mergedExistingProficienciesSkills = existingProficienciesSkills ? MiscUtil.copy(existingProficienciesSkills) : existingProficienciesSkills;
        const mergedExistingProficienciesTools = existingProficienciesTools ? MiscUtil.copy(existingProficienciesTools) : existingProficienciesTools;

        if (mergedExistingProficienciesSkills && actorData.skills) {
            Object.entries(actorData.skills).forEach(([key,meta])=>{
                if (!meta)
                    return;

                mergedExistingProficienciesSkills[key] = mergedExistingProficienciesSkills[key] || MiscUtil.copy(meta);
                mergedExistingProficienciesSkills[key].value = Math.max(mergedExistingProficienciesSkills[key].value, meta.value);
            }
            );
        }

        if (mergedExistingProficienciesSkills && actorData.tools) {
            Object.entries(actorData.tools).forEach(([key,meta])=>{
                if (!meta)
                    return;

                mergedExistingProficienciesTools[key] = mergedExistingProficienciesTools[key] || MiscUtil.copy(meta);
                mergedExistingProficienciesTools[key].value = Math.max(mergedExistingProficienciesTools[key].value, meta.value);
            }
            );
        }

        const formData = await Charactermancer_ExpertiseSelect.pGetUserInput({
            titlePrefix,
            existingFvtt: {
                skillProficiencies: mergedExistingProficienciesSkills,
                toolProficiencies: mergedExistingProficienciesTools,
            },
            available: expertise,
        });
        if (!formData)
            return importOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        this.doApplyExpertiseFormDataToActorUpdate({
            existingProfsActor: {
                skillProficiencies: existingProficienciesSkills,
                toolProficiencies: existingProficienciesTools,
            },
            formData,
            actorData: actorData,
        });
    }

    static doApplyExpertiseFormDataToActorUpdate({existingProfsActor, formData, actorData}) {
        this.doApplySkillFormDataToActorUpdate({
            existingProfsActor: existingProfsActor.skillProficiencies,
            formData,
            actorData,
        });

        this.doApplyToolFormDataToActorUpdate({
            existingProfsActor: existingProfsActor.toolProficiencies,
            formData,
            actorData,
        });
    }

    static doApplySensesFormDataToActorUpdate({existingSensesActor, existingTokenActor, formData, actorData, actorToken, configGroup}) {
        if (!Object.keys(formData?.data).length)
            return;

        const dataTarget = MiscUtil.getOrSet(actorData, "attributes", "senses", {});
        Object.assign(dataTarget, MiscUtil.copy(existingSensesActor));

        const foundrySenseData = this._getFoundrySenseData({
            configGroup,
            formData
        });

        this._getSensesNumericalKeys(foundrySenseData).forEach(kSense=>{
            const range = foundrySenseData[kSense];
            delete foundrySenseData[kSense];

            if (range == null)
                return;
            dataTarget[kSense] = Math.max(dataTarget[kSense], range);
        }
        );

        Object.assign(dataTarget, foundrySenseData);

        let {sight: {range: curSightRange}} = existingTokenActor || {
            sight: {}
        };
        if (curSightRange == null || isNaN(curSightRange) || Number(curSightRange) !== curSightRange) {
            const cleanedSightRange = curSightRange == null || isNaN(curSightRange) ? 0 : Number(curSightRange);
            if (curSightRange === 0)
                MiscUtil.set(actorToken, "sight", "range", cleanedSightRange);
        }

        MiscUtil.set(actorToken, "sight", "enabled", true);

        this.mutTokenSight({
            dataAttributesSenses: dataTarget,
            dataToken: actorToken,
            configGroup,
        });
    }

    static _getFoundrySenseData({configGroup, formData}) {
        const out = {};

        Object.entries(formData.data).forEach(([sense,range])=>{
            if (!range)
                return out[sense] = null;

            range = Config.getMetricNumberDistance({
                configGroup,
                originalValue: range,
                originalUnit: "feet"
            });
            range = Number(range.toFixed(2));

            out[sense] = range;
        }
        );

        const units = Config.getMetricUnitDistance({
            configGroup,
            originalUnit: "ft"
        });
        if (!out.units || units !== "ft")
            out.units = units;

        return out;
    }

    static _getSensesNumericalKeys() {
        const sensesModel = CONFIG.Item.dataModels.race.defineSchema().senses;
        return Object.entries(sensesModel.fields).filter(([,v])=>v instanceof foundry.data.fields.NumberField).map(([k])=>k);
    }

    static mutTokenSight({dataAttributesSenses, dataToken, configGroup}) {
        if (!dataAttributesSenses)
            return {
                dataAttributesSenses,
                dataToken
            };

        if (dataAttributesSenses.darkvision) {
            MiscUtil.set(dataToken, "sight", "range", Math.max(dataToken.sight?.dim ?? 0, dataAttributesSenses.darkvision));
            if (dataToken.sight?.visionMode == null || dataToken.sight?.visionMode === "basic")
                MiscUtil.set(dataToken, "sight", "visionMode", "darkvision");
        }

        let hasNonDarkvisionSense = false;
        for (const prop of ["blindsight", "tremorsense", "truesight"]) {
            if (!dataAttributesSenses[prop])
                continue;

            hasNonDarkvisionSense = true;

            const isUse = dataAttributesSenses[prop] > (dataToken.sight?.range ?? 0);
            if (!isUse)
                continue;

            MiscUtil.set(dataToken, "sight", "range", dataAttributesSenses[prop]);

            if (dataToken.sight?.visionMode === "basic") {
                MiscUtil.set(dataToken, "sight", "visionMode", prop === "tremorsense" ? "tremorsense" : "darkvision");
            }
        }

        if (dataAttributesSenses.truesight)
            this._mutTokenSight_addUpdateDetectionMode({
                dataToken,
                id: "seeAll",
                range: dataAttributesSenses.truesight
            });
        if (dataAttributesSenses.tremorsense)
            this._mutTokenSight_addUpdateDetectionMode({
                dataToken,
                id: "feelTremor",
                range: dataAttributesSenses.tremorsense
            });
        if (dataAttributesSenses.blindsight)
            this._mutTokenSight_addUpdateDetectionMode({
                dataToken,
                id: "blindsight",
                range: dataAttributesSenses.blindsight
            });

        if (dataAttributesSenses.darkvision && !hasNonDarkvisionSense && Config.getSafe(configGroup, "tokenVisionSaturation") !== ConfigConsts.C_USE_GAME_DEFAULT) {
            MiscUtil.set(dataToken, "sight", "saturation", -1);
        }

        return {
            dataAttributesSenses,
            dataToken
        };
    }

    static _mutTokenSight_addUpdateDetectionMode({dataToken, id, range}) {
        const detectionModeArr = MiscUtil.getOrSet(dataToken, "detectionModes", []);
        const existing = detectionModeArr.find(mode=>mode?.id === id);
        if (existing)
            return existing.range = Math.max(existing.range, range);
        detectionModeArr.push({
            id,
            range,
            enabled: true
        });
    }

    static _RE_IS_VERSATILE = / (?:two|both) hands/i;
    static _getDamageTupleMetas(str, {summonSpellLevel=0}={}) {
        const damageTupleMetas = [];

        const ixFirstDc = str.indexOf(`{@dc `);

        let ixLastMatch = null;
        let lenLastMatch = null;

        const strOut = str.replace(/(?:(?<dmgFlat>\d+)|\(?{@(?:dice|damage) (?<dmgDice1>[^|}]+)(?:\|[^}]+)?}(?:\s+[-+]\s+the spell's level)?(?: plus {@(?:dice|damage) (?<dmgDice2>[^|}]+)(?:\|[^}]+)?})?\)?)(?:\s+[-+]\s+[-+a-zA-Z0-9 ]*?)?(?: (?<dmgType>[^ ]+))? damage/gi, (...mDamage)=>{
            const [fullMatch] = mDamage;
            const [ixMatch,,{dmgFlat, dmgDice1, dmgDice2, dmgType}] = mDamage.slice(-3);

            const dmgDice1Clean = dmgDice1 ? dmgDice1.split("|")[0] : null;
            const dmgDice2Clean = dmgDice2 ? dmgDice2.split("|")[0] : null;
            const dmgTypeClean = dmgType || "";

            const isFlatDamage = dmgFlat != null;
            let dmg = isFlatDamage ? dmgFlat : dmgDice2Clean ? `${dmgDice1Clean} + ${dmgDice2Clean}` : dmgDice1Clean;

            if (isFlatDamage) {
                const tokens = str.split(/( )/g);
                let lenTokenStack = 0;
                const tokenStack = [];
                for (let i = 0; i < tokens.length; ++i) {
                    tokenStack.push(tokens[i]);
                    lenTokenStack += tokens[i].length;

                    if (lenTokenStack === ixMatch) {
                        const lastFourTokens = tokenStack.slice(-4);
                        if (/^by dealing$/i.test(lastFourTokens.join("").trim())) {
                            return "";
                        }
                    }
                }
            }

            dmg = dmg.replace(/\bPB\b/gi, `@${SharedConsts.MODULE_ID_FAKE}.userchar.pb`);

            dmg = dmg.replace(/\bsummonSpellLevel\b/gi, `${summonSpellLevel ?? 0}`);

            const tupleMeta = {
                tuple: [dmg, dmgTypeClean],
                isOnFailSavingThrow: false,
                isAlternateRoll: false,
            };

            if (~ixFirstDc && ixMatch >= ixFirstDc) {
                tupleMeta.isOnFailSavingThrow = true;
            }

            if (damageTupleMetas.last()?.isAlternateRoll || (damageTupleMetas.length && /\bor\b/.test(str.slice(ixLastMatch + lenLastMatch, ixMatch)) && !this._RE_IS_VERSATILE.test(str.slice(ixMatch + fullMatch.length)))) {
                tupleMeta.isAlternateRoll = true;
            }

            damageTupleMetas.push(tupleMeta);

            ixLastMatch = ixMatch;
            lenLastMatch = fullMatch.length;

            return "";
        }
        ).replace(/ +/g, " ");

        return {
            str: strOut,
            damageTupleMetas: damageTupleMetas.filter(it=>it.tuple.length),
        };
    }

    static _getDamagePartsAndOtherFormula(damageTupleMetas) {
        damageTupleMetas = damageTupleMetas || [];

        const damageTuples = [];
        const otherFormulaParts = [];

        damageTupleMetas.forEach(meta=>{
            if ((!Config.get("import", "isUseOtherFormulaFieldForSaveHalvesDamage") || !meta.isOnFailSavingThrow) && (!Config.get("import", "isUseOtherFormulaFieldForSaveHalvesDamage") || !meta.isAlternateRoll))
                return damageTuples.push(meta.tuple);

            otherFormulaParts.push(`${meta.tuple[1] ? "(" : ""}${meta.tuple[0]}${meta.tuple[1] ? `)[${meta.tuple[1]}]` : ""}`);
        }
        );

        if (!damageTuples.length)
            return {
                damageParts: damageTupleMetas.map(it=>it.tuple),
                formula: ""
            };

        return {
            damageParts: damageTuples,
            formula: otherFormulaParts.join(" + ")
        };
    }

    static _getSpeedValue(speeds, prop, configGroup) {
        if (speeds == null)
            return null;

        if (typeof speeds === "number") {
            return prop === "walk" ? Config.getMetricNumberDistance({
                configGroup,
                originalValue: speeds,
                originalUnit: "feet"
            }) : null;
        }

        const speed = speeds[prop];

        if (speed == null)
            return null;
        if (typeof speed === "boolean")
            return null;
        if (speed.number != null)
            return Config.getMetricNumberDistance({
                configGroup,
                originalValue: speed.number,
                originalUnit: "feet"
            });
        if (isNaN(speed))
            return null;
        return Config.getMetricNumberDistance({
            configGroup,
            originalValue: Number(speed),
            originalUnit: "feet"
        });
    }

    static _SPEED_PROPS_IS_EQUAL_MAP = {
        burrow: "burrow",
        climb: "climb",
        fly: "fly",
        swim: "swim",
    };

    static async _pGetSpeedEffects(speeds, {actor, actorItem, iconEntity, iconPropCompendium, taskRunner=null}={}) {
        if (speeds == null)
            return [];

        const icon = iconEntity && iconPropCompendium ? await this._ImageFetcher.pGetSaveImagePath(iconEntity, {
            propCompendium: iconPropCompendium,
            taskRunner
        }) : undefined;

        if (typeof speeds === "number")
            return [];

        const toMap = Object.entries(speeds).filter(([k,v])=>this._SPEED_PROPS_IS_EQUAL_MAP[k] && v === true);

        if (!toMap.length)
            return [];

        return [...toMap.map(([k])=>{
            return UtilActiveEffects.getGenericEffect({
                key: `system.attributes.movement.${this._SPEED_PROPS_IS_EQUAL_MAP[k]}`,
                value: `@attributes.movement.walk`,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                name: `${k.toTitleCase()} Speed`,
                icon,
                disabled: false,
                priority: UtilActiveEffects.PRIORITY_BASE,
                originActor: actor,
                originActorItem: actorItem,
            });
        }
        ), ];
    }

    static _isSpeedHover(speed) {
        if (typeof speed === "number")
            return false;
        return !!speed.canHover;
    }

    static getMovement(speed, {configGroup=null, propAllowlist=null}={}) {
        return {
            burrow: (!propAllowlist || propAllowlist.has("burrow")) ? this._getSpeedValue(speed, "burrow", configGroup) : null,
            climb: (!propAllowlist || propAllowlist.has("climb")) ? this._getSpeedValue(speed, "climb", configGroup) : null,
            fly: (!propAllowlist || propAllowlist.has("fly")) ? this._getSpeedValue(speed, "fly", configGroup) : null,
            swim: (!propAllowlist || propAllowlist.has("swim")) ? this._getSpeedValue(speed, "swim", configGroup) : null,
            walk: (!propAllowlist || propAllowlist.has("walk")) ? this._getSpeedValue(speed, "walk", configGroup) : null,
            units: Config.getMetricUnitDistance({
                configGroup,
                originalUnit: "ft"
            }),
            hover: this._isSpeedHover(speed),
        };
    }

    static _getParsedWeaponEntryData(ent) {
        if (!(ent.entries && ent.entries[0] && typeof ent.entries[0] === "string"))
            return;

        const damageTupleMetas = [];
        let attackBonus = 0;

        const str = ent.entries[0];

        damageTupleMetas.push(...this._getDamageTupleMetas(str).damageTupleMetas);

        const {rangeShort, rangeLong, rangeUnits} = this._getAttackRange(str);

        const mHit = /{@hit ([^|}]+)(?:\|[^}]+)?}/gi.exec(str);
        if (mHit) {
            const hitBonus = Number(mHit[1]);
            if (!isNaN(hitBonus)) {
                attackBonus = hitBonus;
            }
        }

        return {
            damageTupleMetas,
            rangeShort,
            rangeLong,
            rangeUnits,
            attackBonus,
        };
    }

    static _getAttackRange(str) {
        let rangeShort = null;
        let rangeLong = null;

        const mRange = /range (\d+)(?:\/(\d+))? ft/gi.exec(str);
        if (mRange) {
            rangeShort = Number(mRange[1]);
            if (mRange[2])
                rangeLong = Number(mRange[2]);
        } else {
            const mReach = /reach (\d+) ft/gi.exec(str);
            if (mReach) {
                rangeShort = Number(mReach[1]);
            }
        }

        rangeShort = Config.getMetricNumberDistance({
            configGroup: this._configGroup,
            originalValue: rangeShort,
            originalUnit: "feet"
        });
        rangeLong = Config.getMetricNumberDistance({
            configGroup: this._configGroup,
            originalValue: rangeLong,
            originalUnit: "feet"
        });

        return {
            rangeShort,
            rangeLong,
            rangeUnits: rangeShort || rangeLong ? Config.getMetricUnitDistance({
                configGroup: this._configGroup,
                originalUnit: "feet"
            }) : null,
        };
    }

    static getActorDamageResImmVulnConditionImm(ent) {
        const out = {};

        const allDis = new Set();
        const bypassDis = new Set();
        let customDis = [];
        this._getActorDamageResImmVulnConditionImm_addDamageTypesOrConditionTypes({
            ent,
            validTypesArr: UtilActors.VALID_DAMAGE_TYPES,
            fnRender: Parser.getFullImmRes,
            prop: "immune",
            allSet: allDis,
            bypassSet: bypassDis,
            customStack: customDis,
        });

        out.di = {
            value: [...allDis],
            custom: customDis.join(", "),
            bypasses: [...bypassDis],
        };

        const allDrs = new Set();
        const bypassDrs = new Set();
        let customDrs = [];
        this._getActorDamageResImmVulnConditionImm_addDamageTypesOrConditionTypes({
            ent,
            validTypesArr: UtilActors.VALID_DAMAGE_TYPES,
            fnRender: Parser.getFullImmRes,
            prop: "resist",
            allSet: allDrs,
            bypassSet: bypassDrs,
            customStack: customDrs,
        });

        out.dr = {
            value: [...allDrs],
            custom: customDrs.join(", "),
            bypasses: [...bypassDrs],
        };

        const allDvs = new Set();
        const bypassDvs = new Set();
        let customDvs = [];
        this._getActorDamageResImmVulnConditionImm_addDamageTypesOrConditionTypes({
            ent,
            validTypesArr: UtilActors.VALID_DAMAGE_TYPES,
            fnRender: Parser.getFullImmRes,
            prop: "vulnerable",
            allSet: allDvs,
            bypassSet: bypassDvs,
            customStack: customDvs,
        });

        out.dv = {
            value: [...allDvs],
            custom: customDvs.join(", "),
            bypasses: [...bypassDvs],
        };

        const allCis = new Set();
        let customCis = [];
        this._getActorDamageResImmVulnConditionImm_addDamageTypesOrConditionTypes({
            ent,
            validTypesArr: UtilActors.VALID_CONDITIONS,
            fnRender: arr=>Parser.getFullCondImm(arr, {
                isPlainText: true
            }),
            prop: "conditionImmune",
            allSet: allCis,
            customStack: customCis,
        });

        out.ci = {
            value: [...allCis],
            custom: customCis.join(", "),
        };

        return out;
    }

    static _getActorDamageResImmVulnConditionImm_addDamageTypesOrConditionTypes({ent, validTypesArr, fnRender, prop, allSet, bypassSet, customStack}, ) {
        if (!ent[prop])
            return;

        ent[prop].forEach(it=>{
            if (validTypesArr.includes(it)) {
                allSet.add(it);
                return;
            }

            if (this._PROPS_DAMAGE_IMM_VULN_RES.has(prop) && it[prop] && it[prop]instanceof Array && CollectionUtil.setEq(new Set(it[prop]), this._SET_PHYSICAL_DAMAGE) && it.note && it.cond) {
                const mNote = /\bnon[- ]?magical\b.*?(?:\baren't (?<bypass>silvered|adamantine)\b)?$/.exec(it.note);

                if (mNote) {
                    bypassSet.add("mgc");

                    switch ((mNote.groups.bypass || "").toLowerCase()) {
                    case "silvered":
                        bypassSet.add("sil");
                        break;
                    case "adamantine":
                        bypassSet.add("ada");
                        break;
                    }

                    it[prop].forEach(sub=>allSet.add(sub));
                    return;
                }
            }

            const asText = fnRender([it]);
            customStack.push(asText);
        }
        );
    }

    static getImportedEmbed(importedEmbeds, itemData) {
        const importedEmbed = importedEmbeds.find(it=>it.raw === itemData);

        if (!importedEmbed) {
            ui.notifications.warn(`Failed to link embedded entity for active effects! ${VeCt.STR_SEE_CONSOLE}`);
            console.warn(...LGT, `Could not find loaded item data`, itemData, `in imported embedded entities`, importedEmbeds);
            return null;
        }

        return importedEmbed;
    }

    static getConsumedSheetItem({consumes, actor}) {
        const lookupNames = [consumes.name.toLowerCase().trim(), consumes.name.toLowerCase().trim().toPlural(), ];

        return (actor?.items?.contents || []).find(it=>it.type === "feat" && lookupNames.includes(it.name.toLowerCase().trim()));
    }

    static _mutApplyDocOwnership(docData, {defaultOwnership, isAddDefaultOwnershipFromConfig, userOwnership, }, ) {
        if (defaultOwnership != null)
            docData.ownership = {
                default: defaultOwnership
            };
        else if (isAddDefaultOwnershipFromConfig)
            docData.ownership = {
                default: Config.get(this._configGroup, "ownership")
            };

        if (userOwnership)
            Object.assign(docData.ownership ||= {}, userOwnership);
    }

    static mutEffectsDisabledTransfer(effects, configGroup, opts={}) {
        if (!effects)
            return;

        return effects.map(effect=>this.mutEffectDisabledTransfer(effect, configGroup, opts));
    }

    static mutEffectDisabledTransfer(effect, configGroup, {hintDisabled=null, hintTransfer=null, hintSelfTarget=null, }={}, ) {
        if (!effect)
            return;

        const disabled = Config.get(configGroup, "setEffectDisabled");
        switch (disabled) {
        case ConfigConsts.C_USE_PLUT_VALUE:
            effect.disabled = hintDisabled != null ? hintDisabled : false;
            break;
        case ConfigConsts.C_BOOL_DISABLED:
            effect.disabled = false;
            break;
        case ConfigConsts.C_BOOL_ENABLED:
            effect.disabled = true;
            break;
        }

        const transfer = Config.get(configGroup, "setEffectTransfer");
        switch (transfer) {
        case ConfigConsts.C_USE_PLUT_VALUE:
            effect.transfer = hintTransfer != null ? hintTransfer : true;
            break;
        case ConfigConsts.C_BOOL_DISABLED:
            effect.transfer = false;
            break;
        case ConfigConsts.C_BOOL_ENABLED:
            effect.transfer = true;
            break;
        }

        if (UtilCompat.isPlutoniumAddonAutomationActive()) {
            const val = hintTransfer != null ? hintSelfTarget : false;
            MiscUtil.set(effect, "flags", UtilCompat.MODULE_DAE, "selfTarget", val);
            MiscUtil.set(effect, "flags", UtilCompat.MODULE_DAE, "selfTargetAlways", val);
        }

        return effect;
    }

    static getEffectsMutDedupeId(effects) {
        if (!effects?.length)
            return effects;

        const usedDedupeIds = new Set();

        effects.forEach(eff=>{
            const dedupeIdExisting = eff.flags?.[SharedConsts.MODULE_ID]?.dedupeId;
            if (dedupeIdExisting && !usedDedupeIds.has(dedupeIdExisting)) {
                usedDedupeIds.add(dedupeIdExisting);
                return;
            }

            if (!eff.name)
                throw new Error(`Effect did not have a name!`);

            const dedupeIdBase = dedupeIdExisting ?? eff.name.slugify({
                strict: true
            });
            if (!usedDedupeIds.has(dedupeIdBase)) {
                usedDedupeIds.add(dedupeIdBase);
                MiscUtil.set(eff, "flags", SharedConsts.MODULE_ID, "dedupeId", dedupeIdBase);
                return;
            }

            for (let i = 0; i < 99; ++i) {
                const dedupeId = `${dedupeIdBase}-${i}`;
                if (!usedDedupeIds.has(dedupeId)) {
                    usedDedupeIds.add(dedupeId);
                    MiscUtil.set(eff, "flags", SharedConsts.MODULE_ID, "dedupeId", dedupeId);
                    return;
                }
            }

            throw new Error(`Could not find an available dedupeId for base "${dedupeIdBase}"!`);
        }
        );

        return effects;
    }

    static _getTranslationData({srdData, }, ) {
        if (!srdData || !Config.get("integrationBabele", "isEnabled") || !UtilCompat.isBabeleActive() || !srdData.flags?.[UtilCompat.MODULE_BABELE])
            return null;

        return {
            name: srdData.name,
            description: srdData.system?.description?.value,
            flags: {
                [UtilCompat.MODULE_BABELE]: {
                    translated: !!srdData.flags[UtilCompat.MODULE_BABELE].translated,
                    hasTranslation: !!srdData.flags[UtilCompat.MODULE_BABELE].hasTranslation,
                },
            },
        };
    }

    static _getTranslationMeta({name, translationData, description, }, ) {
        if (translationData == null)
            return {
                name,
                description,
                flags: {}
            };

        const flags = {
            [UtilCompat.MODULE_BABELE]: {
                ...(translationData.flags?.[UtilCompat.MODULE_BABELE] || {}),
                originalName: name,
            },
        };

        name = translationData.name;

        if (description && Config.get("integrationBabele", "isUseTranslatedDescriptions"))
            description = translationData.description || description;

        return {
            name,
            description,
            flags
        };
    }

    static _getIdObj({id=null}={}) {
        if (id == null)
            id = foundry.utils.randomID();
        return {
            _id: id,
            id,
        };
    }
}

DataConverter.SYM_AT = "<PLUT_SYM__AT>";

DataConverter.ITEM_TYPES_ACTOR_TOOLS = new Set(["AT", "GS", "INS", "T"]);
DataConverter.ITEM_TYPES_ACTOR_WEAPONS = new Set(["M", "R"]);
DataConverter.ITEM_TYPES_ACTOR_ARMOR = new Set(["LA", "MA", "HA", "S"]);

DataConverter._PROPS_DAMAGE_IMM_VULN_RES = new Set(["immune", "resist", "vulnerable"]);
DataConverter._SET_PHYSICAL_DAMAGE = new Set(["bludgeoning", "piercing", "slashing"]);
DataConverter._CASTER_PROGRESSIONS = ["full", "artificer", "1/2", "1/3", "pact", ];

var DataConverter$1 = /*#__PURE__*/
Object.freeze({
    __proto__: null,
    DataConverter: DataConverter
});

class DataConverterFeature extends DataConverter {
    static async _pGetGenericDescription(ent, configGroup, {fluff=null}={}) {
        if (!Config.get(configGroup, "isImportDescription") && !fluff?.entries?.length)
            return "";

        const pts = [Config.get(configGroup, "isImportDescription") ? await UtilDataConverter.pGetWithDescriptionPlugins(()=>`<div>${Renderer.get().setFirstSection(true).render({
            entries: ent.entries
        }, 2)}</div>`) : null, fluff?.entries?.length ? Renderer.get().setFirstSection(true).render({
            type: "entries",
            entries: fluff?.entries
        }) : "", ].filter(Boolean).join(`<hr class="hr-1">`);

        return pts.length ? `<div>${pts}</div>` : "";
    }

    static _getData_getConsume({ent, actor}) {
        if (!ent?.consumes)
            return {};

        const sheetItem = DataConverter.getConsumedSheetItem({
            consumes: ent.consumes,
            actor
        });
        if (!sheetItem)
            return {};

        return {
            type: "charges",
            amount: ent.consumes.amount ?? 1,
            target: sheetItem.id,
        };
    }

    static async pMutActorUpdateFeature(actor, actorUpdate, ent, dataBuilderOpts) {
        const sideData = await this._SideDataInterface.pGetSideLoaded(ent);
        this.mutActorUpdate(actor, actorUpdate, ent, {
            sideData
        });
    }

    static async pGetDereferencedFeatureItem(feature) {
        return MiscUtil.copy(feature);
    }

    static async pGetClassSubclassFeatureAdditionalEntities(actor, entity, {taskRunner=null}={}) {
        const sideData = await this._SideDataInterface.pGetSideLoaded(entity);
        if (!sideData)
            return [];
        if (!sideData.subEntities)
            return [];

        const {ChooseImporter} = await Promise.resolve().then(function() {
            return ChooseImporter$1;
        });

        for (const prop in sideData.subEntities) {
            if (!sideData.subEntities.hasOwnProperty(prop))
                continue;

            const arr = sideData.subEntities[prop];
            if (!(arr instanceof Array))
                continue;

            const importer = ChooseImporter.getImporter(prop, {
                actor
            });
            await importer.pInit();
            for (const ent of arr) {
                await importer.pImportEntry(ent, {
                    taskRunner,
                }, );
            }
        }
    }
}
class DataConverterClassSubclassFeature extends DataConverterFeature {
    static _configGroup = "importClassSubclassFeature";

    static _SideDataInterface = SideDataInterfaceClassSubclassFeature;
    //TEMPFIX static _ImageFetcher = ImageFetcherClassSubclassFeature;

    static async pGetDereferencedFeatureItem(feature) {
        const type = UtilEntityClassSubclassFeature.getEntityType(feature);
        const hash = UrlUtil.URL_TO_HASH_BUILDER[type](feature);
        return DataLoader.pCacheAndGet(type, feature.source, hash, {
            isCopy: true
        });
    }

    static async pGetInitFeatureLoadeds(feature, {actor=null}={}) {
        const isIgnoredLookup = await this._pGetInitFeatureLoadeds_getIsIgnoredLookup(feature);

        const type = UtilEntityClassSubclassFeature.getEntityType(feature);
        switch (type) {
        case "classFeature":
            {
                const uid = DataUtil.class.packUidClassFeature(feature);
                const asClassFeatureRef = {
                    classFeature: uid
                };
                await PageFilterClassesFoundry.pInitClassFeatureLoadeds({
                    classFeature: asClassFeatureRef,
                    className: feature.className,
                    actor,
                    isIgnoredLookup
                });
                return asClassFeatureRef;
            }
        case "subclassFeature":
            {
                const uid = DataUtil.class.packUidSubclassFeature(feature);
                const asSubclassFeatureRef = {
                    subclassFeature: uid
                };
                const subclassNameLookup = await DataUtil.class.pGetSubclassLookup();
                const subclassName = MiscUtil.get(subclassNameLookup, feature.classSource, feature.className, feature.subclassSource, feature.subclassShortName, "name");
                await PageFilterClassesFoundry.pInitSubclassFeatureLoadeds({
                    subclassFeature: asSubclassFeatureRef,
                    className: feature.className,
                    subclassName: subclassName,
                    actor,
                    isIgnoredLookup
                });
                return asSubclassFeatureRef;
            }
        default:
            throw new Error(`Unhandled feature type "${type}"`);
        }
    }

    static async _pGetInitFeatureLoadeds_getIsIgnoredLookup(feature) {
        if (!feature.entries)
            return {};

        const type = UtilEntityClassSubclassFeature.getEntityType(feature);
        switch (type) {
        case "classFeature":
            {
                return this.pGetClassSubclassFeatureIgnoredLookup({
                    data: {
                        classFeature: [feature]
                    }
                });
            }
        case "subclassFeature":
            {
                return this.pGetClassSubclassFeatureIgnoredLookup({
                    data: {
                        subclassFeature: [feature]
                    }
                });
            }
        default:
            throw new Error(`Unhandled feature type "${type}"`);
        }
    }


    /**
     * Returns an object with boolean properties named after class and subclass features that are marked as ignored
     * @param {{classFeature:any[], subclassFeature:any[]}} data
     * @returns {any}
     */
    static async pGetClassSubclassFeatureIgnoredLookup({data}) {
        if (!data.classFeature?.length && !data.subclassFeature?.length)
            return {};

        const isIgnoredLookup = {};

        const allRefsClassFeature = new Set();
        const allRefsSubclassFeature = new Set();

        (data.classFeature || []).forEach(cf=>{
            const {refsClassFeature, refsSubclassFeature} = Charactermancer_Class_Util.getClassSubclassFeatureReferences(cf.entries);

            refsClassFeature.forEach(ref=>allRefsClassFeature.add((ref.classFeature || "").toLowerCase()));
            refsSubclassFeature.forEach(ref=>allRefsSubclassFeature.add((ref.subclassFeature || "").toLowerCase()));
        });

        (data.subclassFeature || []).forEach(scf=>{
            const {refsClassFeature, refsSubclassFeature} = Charactermancer_Class_Util.getClassSubclassFeatureReferences(scf.entries);

            refsClassFeature.forEach(ref=>allRefsClassFeature.add((ref.classFeature || "").toLowerCase()));
            refsSubclassFeature.forEach(ref=>allRefsSubclassFeature.add((ref.subclassFeature || "").toLowerCase()));
        });

        for (const uid of allRefsClassFeature) {
            if (await this._SideDataInterface.pGetIsIgnoredSideLoaded(DataUtil.class.unpackUidClassFeature(uid))) {
                isIgnoredLookup[uid] = true;
            }
        }

        for (const uid of allRefsSubclassFeature) {
            if (await this._SideDataInterface.pGetIsIgnoredSideLoaded(DataUtil.class.unpackUidSubclassFeature(uid))) {
                isIgnoredLookup[uid] = true;
            }
        }

        return isIgnoredLookup;
    }

    static async pGetDocumentJson(feature, opts) {
        opts = opts || {};
        if (opts.actor)
            opts.isActorItem = true;

        Renderer.get().setFirstSection(true).resetHeaderIndex();

        const out = await this._pGetClassSubclassFeatureItem(feature, opts);

        const additionalData = await this._SideDataInterface.pGetDataSideLoaded(feature);
        Object.assign(out.system, additionalData);

        const additionalFlags = await this._SideDataInterface.pGetFlagsSideLoaded(feature);
        Object.assign(out.flags, additionalFlags);

        this._mutApplyDocOwnership(out, opts);

        return out;
    }

    static _isUnarmoredDefense(feature) {
        const cleanLowerName = (feature.name || "").toLowerCase().trim();
        return /^unarmored defen[sc]e/.test(cleanLowerName);
    }

    static _getUnarmoredDefenseMeta(entity) {
        if (!entity.entries)
            return null;

        const attribs = new Set();

        JSON.stringify(entity.entries).replace(/(strength|dexterity|constitution|intelligence|wisdom|charisma|str|dex|con|int|wis|cha) modifier/gi, (fullMatch,ability)=>{
            ability = ability.slice(0, 3).toLowerCase();
            attribs.add(ability);
        }
        );

        const predefinedKey = CollectionUtil.setEq(DataConverterClassSubclassFeature._UNARMORED_DEFENSE_BARBARIAN, attribs) ? "unarmoredBarb" : CollectionUtil.setEq(DataConverterClassSubclassFeature._UNARMORED_DEFENSE_MONK, attribs) ? "unarmoredMonk" : null;

        return {
            formula: ["10", ...[...attribs].map(ab=>`@abilities.${ab}.mod`)].join(" + "),
            abilities: [...attribs],
            predefinedKey,
        };
    }

    static _getUnarmoredDefenseEffectSideTuples({actor, feature, img}) {
        if (!this._isUnarmoredDefense(feature))
            return [];

        const unarmoredDefenseMeta = this._getUnarmoredDefenseMeta(feature);
        if (!unarmoredDefenseMeta)
            return [];

        if (unarmoredDefenseMeta.predefinedKey) {
            return UtilActiveEffects.getExpandedEffects([{
                name: "Unarmored Defense",
                changes: [{
                    key: "system.attributes.ac.calc",
                    mode: "OVERRIDE",
                    value: unarmoredDefenseMeta.predefinedKey,
                }, ],
                transfer: true,
            }, ], {
                actor,
                img,
                parentName: feature.name,
            }, {
                isTuples: true,
            }, );
        }

        return UtilActiveEffects.getExpandedEffects([{
            name: "Unarmored Defense",
            changes: [{
                key: "system.attributes.ac.calc",
                mode: "OVERRIDE",
                value: "custom",
            }, ],
            transfer: true,
        }, {
            name: "Unarmored Defense",
            changes: [{
                key: "system.attributes.ac.formula",
                mode: "UPGRADE",
                value: unarmoredDefenseMeta.formula,
            }, ],
            transfer: true,
        }, ], {
            actor,
            img,
            parentName: feature.name,
        }, {
            isTuples: true,
        }, );
    }

    static async _pGetClassSubclassFeatureItem(feature, opts) {
        opts = opts || {};

        let {type=null, actor} = opts;
        type = type || UtilEntityClassSubclassFeature.getEntityType(feature);

        let pOut;
        if (await this._pIsInSrd(feature, type, opts)) {
            pOut = this._pGetClassSubclassFeatureItem_fromSrd(feature, type, actor, opts);
        } else {
            pOut = this._pGetClassSubclassFeatureItem_other(feature, type, actor, opts);
        }
        return pOut;
    }

    static async _pIsInSrd(feature, type, {taskRunner=null}={}) {
        const srdData = await UtilCompendium.getSrdCompendiumEntity(type, feature, {
            fnGetAliases: UtilEntityClassSubclassFeature.getCompendiumAliases.bind(UtilEntityClassSubclassFeature),
            taskRunner
        });
        return !!srdData;
    }

    static async _pGetClassSubclassFeatureItem_fromSrd(feature, type, actor, opts={}) {
        const srdData = await UtilCompendium.getSrdCompendiumEntity(type, feature, {
            fnGetAliases: UtilEntityClassSubclassFeature.getCompendiumAliases.bind(UtilEntityClassSubclassFeature),
            taskRunner: opts.taskRunner
        });

        const {name: translatedName, description: translatedDescription, flags: translatedFlags} = this._getTranslationMeta({
            translationData: this._getTranslationData({
                srdData
            }),
            name: UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(feature, {
                isActorItem: actor != null
            })),
            description: await this.pGetEntryDescription(feature),
        });

        //TEMPFIX
        const img = null;/* await this._ImageFetcher.pGetSaveImagePath(feature, {
            propCompendium: type,
            taskRunner: opts.taskRunner
        }); */

        const dataConsume = this._getData_getConsume({
            ent: feature,
            actor: opts.actor
        });

        const srdEffects = await this._SideDataInterface.pIsIgnoreSrdEffectsSideLoaded(feature) ? [] : MiscUtil.copy(srdData.effects || []);
        DataConverter.mutEffectsDisabledTransfer(srdEffects, "importClassSubclassFeature");

        const effectsSideTuples = UtilActiveEffects.getExpandedEffects(feature.effectsRaw, {
            actor,
            img,
            parentName: feature.name
        }, {
            isTuples: true
        });
        effectsSideTuples.push(...this._getUnarmoredDefenseEffectSideTuples({
            actor,
            feature,
            img
        }));
        effectsSideTuples.forEach(({effect, effectRaw})=>DataConverter.mutEffectDisabledTransfer(effect, "importClassSubclassFeature", UtilActiveEffects.getDisabledTransferHintsSideData(effectRaw)));

        return {
            name: translatedName,
            type: srdData.type,
            system: {
                ...srdData.system,

                source: UtilDocumentSource.getSourceObjectFromEntity(feature),
                description: {
                    value: translatedDescription,
                    chat: "",
                    unidentified: ""
                },
                consume: dataConsume,

                ...(feature.foundryAdditionalSystem || {}),
            },
            ownership: {
                default: 0
            },
            effects: DataConverter.getEffectsMutDedupeId([...srdEffects, ...effectsSideTuples.map(it=>it.effect), ]),
            flags: {
                ...translatedFlags,
                ...this._getClassSubclassFeatureFlags(feature, type, opts),
                ...(feature.foundryAdditionalFlags || {}),
            },
            img,
        };
    }

    static _getClassSubclassFeatureFlags(feature, type, opts) {
        opts = opts || {};

        const prop = UtilEntityClassSubclassFeature.getEntityType(feature);

        const out = {
            [SharedConsts.MODULE_ID]: {
                page: prop,
                source: feature.source,
                hash: UrlUtil.URL_TO_HASH_BUILDER[prop](feature),
            },
        };

        if (opts.isAddDataFlags) {
            out[SharedConsts.MODULE_ID].propDroppable = prop;
            out[SharedConsts.MODULE_ID].filterValues = opts.filterValues;
        }

        return out;
    }

    static async _pGetClassSubclassFeatureItem_other(feature, type, actor, opts) {
        const dataConsume = this._getData_getConsume({
            ent: feature,
            actor: opts.actor
        });

        //TEMPFIX
        const img = null;/* await this._ImageFetcher.pGetSaveImagePath(feature, {
            propCompendium: type,
            taskRunner: opts.taskRunner
        }); */

        const effectsSideTuples = UtilActiveEffects.getExpandedEffects(feature.effectsRaw, {
            actor,
            img,
            parentName: feature.name
        }, {
            isTuples: true
        });
        effectsSideTuples.push(...this._getUnarmoredDefenseEffectSideTuples({
            actor,
            feature,
            img
        }));
        effectsSideTuples.forEach(({effect, effectRaw})=>DataConverter.mutEffectDisabledTransfer(effect, "importClassSubclassFeature", UtilActiveEffects.getDisabledTransferHintsSideData(effectRaw)));

        return this._pGetItemActorPassive(feature, {
            isActorItem: opts.isActorItem,
            mode: "player",
            modeOptions: {
                isChannelDivinity: feature.className === "Cleric" && feature.name.toLowerCase().startsWith("channel divinity:"),
            },
            renderDepth: 0,
            fvttType: "feat",
            typeType: "class",
            img,
            fvttSource: UtilDocumentSource.getSourceObjectFromEntity(feature),
            requirements: [feature.className, feature.level, feature.subclassShortName ? `(${feature.subclassShortName})` : ""].filter(Boolean).join(" "),
            additionalData: feature.foundryAdditionalSystem,
            foundryFlags: this._getClassSubclassFeatureFlags(feature, type, opts),
            additionalFlags: feature.foundryAdditionalFlags,
            effects: DataConverter.getEffectsMutDedupeId(effectsSideTuples.map(it=>it.effect)),
            actor,
            consumeType: dataConsume.type,
            consumeTarget: dataConsume.target,
            consumeAmount: dataConsume.amount,
        }, );
    }
}
DataConverterClassSubclassFeature._UNARMORED_DEFENSE_BARBARIAN = new Set(["dex", "con"]);
DataConverterClassSubclassFeature._UNARMORED_DEFENSE_MONK = new Set(["dex", "wis"]);
//#endregion


export {SideDataInterfaces, DataConverterClassSubclassFeature};