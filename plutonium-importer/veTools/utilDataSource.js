import Vetools from "./vetools.js";
import { Config } from "./config.js";
class UtilDataSource {

    static sortListItems(a, b, o) {
        const ixTypeA = Math.min(...a.values.filterTypes.map(it=>UtilDataSource.SOURCE_TYPE_ORDER.indexOf(it)));
        const ixTypeB = Math.min(...b.values.filterTypes.map(it=>UtilDataSource.SOURCE_TYPE_ORDER.indexOf(it)));

        return SortUtil.ascSort(ixTypeA, ixTypeB) || SortUtil.compareListNames(a, b);
    }

    static _PROPS_NO_BLOCKLIST = new Set(["itemProperty", "itemType", "spellList"]);
    static _PROP_RE_FOUNDRY = /^foundry[A-Z]/;

    static getMergedData(data, {isFilterBlocklisted=true}={}) {
        const mergedData = {};

        data.forEach(sourceData=>{
            Object.entries(sourceData).forEach(([prop,arr])=>{
                if (!arr || !(arr instanceof Array))
                    return;
                if (mergedData[prop])
                    mergedData[prop] = [...mergedData[prop], ...MiscUtil.copy(arr)];
                else
                    mergedData[prop] = MiscUtil.copy(arr);
            }
            );
        });

        if (isFilterBlocklisted) {
            Object.entries(mergedData).forEach(([prop,arr])=>{
                if (!arr || !(arr instanceof Array))
                    return;
                mergedData[prop] = mergedData[prop].filter(it=>{
                    if (SourceUtil.getEntitySource(it) === VeCt.STR_GENERIC)
                        return false;

                    if (it.__prop && this._PROPS_NO_BLOCKLIST.has(it.__prop))
                        return true;
                    if (it.__prop && this._PROP_RE_FOUNDRY.test(it.__prop))
                        return false;

                    if (!SourceUtil.getEntitySource(it)) {
                        console.warn(`Entity did not have a "source"! This should never occur.`);
                        return true;
                    }
                    if (!it.__prop) {
                        console.warn(`Entity did not have a "__prop"! This should never occur.`);
                        return true;
                    }
                    if (!UrlUtil.URL_TO_HASH_BUILDER[it.__prop]) {
                        console.warn(`No hash builder found for "__prop" "${it.__prop}"! This should never occur.`);
                        return true;
                    }

                    switch (it.__prop) {
                    case "class":
                        {
                            if (!it.subclasses?.length)
                                break;

                            it.subclasses = it.subclasses.filter(sc=>{
                                if (sc.source === VeCt.STR_GENERIC)
                                    return false;

                                return !ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER["subclass"](sc), "subclass", sc.source, {
                                    isNoCount: true
                                }, );
                            }
                            );

                            break;
                        }

                    case "item":
                    case "baseitem":
                    case "itemGroup":
                    case "magicvariant":
                    case "_specificVariant":
                        {
                            return !Renderer.item.isExcluded(it);
                        }

                    case "race":
                        {
                            if (this._isExcludedRaceSubrace(it))
                                return false;
                        }
                    }

                    return !ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER[it.__prop](it), it.__prop, SourceUtil.getEntitySource(it), {
                        isNoCount: true
                    }, );
                }
                );
            }
            );
        }

        return mergedData;
    }

    static async pHandleBackgroundLoad({pLoad, isBackground=false, cntSources=null}) {
        const pTimeout = isBackground ? MiscUtil.pDelay(500, VeCt.SYM_UTIL_TIMEOUT) : null;

        const promises = [pLoad, pTimeout].filter(Boolean);

        const winner = await Promise.race(promises);
        if (winner === VeCt.SYM_UTIL_TIMEOUT)
            ui.notifications.info(`Please wait while ${cntSources != null ? `${cntSources} source${cntSources === 1 ? " is" : "s are"}` : "data is being"} loaded...`);
        return pLoad;
    }

    static _IGNORED_KEYS = new Set(["_meta", "$schema", ]);

    static async pGetAllContent({sources, uploadedFileMetas, customUrls, isBackground=false, userData, cacheKeys=null,
        page, isDedupable=false, fnGetDedupedData=null, fnGetBlocklistFilteredData=null, isAutoSelectAll=false, }, ) {
        const allContent = [];

        if (isAutoSelectAll && this.isTooManySources({ cntSources: sources.length })) {
            const ptHelp = `This may take a (very) long time! If this seems like too much, ${game.user.isGM ? "your GM" : "you"} may have to adjust ${game.user.isGM ? "your" : "the"} "Data Sources" Config options/${game.user.isGM ? "your" : "the"} "World Data Source Selector" list to limit the number of sources selected by default.`;

            console.warn(...LGT, `${sources.length} source${sources.length === 1 ? "" : "s"} are being loaded! ${ptHelp}`);

            if (!(await InputUiUtil.pGetUserBoolean({
                title: "Too Many Sources",
                htmlDescription: `You are about to load ${sources.length} source${sources.length === 1 ? "" 
                : "s"}. ${ptHelp}<br>Would you like to load ${sources.length} source${sources.length === 1 ? "" : "s"}?`,
                textNo: "Cancel",
                textYes: "Continue",
            })))
                return null;
        }

        const pLoad = sources.pMap(async source=>{
            await source.pLoadAndAddToAllContent({ uploadedFileMetas, customUrls, allContent, cacheKeys });
        });

        await UtilDataSource.pHandleBackgroundLoad({
            pLoad,
            isBackground,
            cntSources: sources.length
        });

        const allContentMerged = {};

        if (allContent.length === 1)
            Object.assign(allContentMerged, allContent[0]);
        else {
            allContent.forEach(obj=>{
                Object.entries(obj).forEach(([k,v])=>{
                    if (v == null)
                        return;
                    if (this._IGNORED_KEYS.has(k))
                        return;

                    if (!(v instanceof Array))
                        console.warn(`Could not merge "${typeof v}" for key "${k}"!`);

                    allContentMerged[k] = allContentMerged[k] || [];
                    allContentMerged[k] = [...allContentMerged[k], ...v];
                }
                );
            });
        }

        let dedupedAllContentMerged = fnGetDedupedData ? fnGetDedupedData({
            allContentMerged,
            isDedupable
        }) : this._getDedupedAllContentMerged({
            allContentMerged,
            isDedupable
        });

        dedupedAllContentMerged = fnGetBlocklistFilteredData ? fnGetBlocklistFilteredData({
            dedupedAllContentMerged,
            page
        }) : this._getBlocklistFilteredData({
            dedupedAllContentMerged,
            page
        });

        if (Config.get("import", "isShowVariantsInLists")) {
            Object.entries(dedupedAllContentMerged).forEach(([k,arr])=>{
                if (!(arr instanceof Array))
                    return;
                dedupedAllContentMerged[k] = arr.map(it=>[it, ...DataUtil.proxy.getVersions(it.__prop, it)]).flat();
            }
            );
        }

        Object.entries(dedupedAllContentMerged).forEach(([k,arr])=>{
            if (!(arr instanceof Array))
                return;
            if (!arr.length)
                delete dedupedAllContentMerged[k];
        }
        );

        return {
            dedupedAllContentMerged,
            cacheKeys,
            userData
        };
    }

    static isTooManySources({cntSources}) {
        return Config.get("dataSources", "tooManySourcesWarningThreshold") != null && cntSources >= Config.get("dataSources", "tooManySourcesWarningThreshold");
    }

    static _getBlocklistFilteredData({dedupedAllContentMerged, page}) {
        if (!UrlUtil.URL_TO_HASH_BUILDER[page])
            return dedupedAllContentMerged;
        dedupedAllContentMerged = {
            ...dedupedAllContentMerged
        };
        Object.entries(dedupedAllContentMerged).forEach(([k,arr])=>{
            if (!(arr instanceof Array))
                return;
            dedupedAllContentMerged[k] = arr.filter(it=>{
                if (it.source === VeCt.STR_GENERIC)
                    return false;

                if (!SourceUtil.getEntitySource(it)) {
                    console.warn(`Entity did not have a "source"! This should never occur.`);
                    return true;
                }
                if (!it.__prop) {
                    console.warn(`Entity did not have a "__prop"! This should never occur.`);
                    return true;
                }

                switch (it.__prop) {
                case "item":
                case "baseitem":
                case "itemGroup":
                case "magicvariant":
                case "_specificVariant":
                    {
                        return !Renderer.item.isExcluded(it);
                    }

                case "race":
                    {
                        if (this._isExcludedRaceSubrace(it))
                            return false;
                    }
                }

                return !ExcludeUtil.isExcluded((UrlUtil.URL_TO_HASH_BUILDER[it.__prop] || UrlUtil.URL_TO_HASH_BUILDER[page])(it), it.__prop, SourceUtil.getEntitySource(it), {
                    isNoCount: true
                }, );
            }
            );
        }
        );
        return dedupedAllContentMerged;
    }

    static _isExcludedRaceSubrace(it) {
        if (it.__prop !== "race")
            return false;
        return it._subraceName && ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER["subrace"]({
            name: it._subraceName,
            source: it.source,
            raceName: it._baseName,
            raceSource: it._baseSource
        }), "subrace", SourceUtil.getEntitySource(it), {
            isNoCount: true
        }, );
    }

    static _getDedupedAllContentMerged({allContentMerged, page, isDedupable=false}) {
        if (!isDedupable)
            return allContentMerged;
        return this._getDedupedData({
            allContentMerged,
            page
        });
    }

    static _getDedupedData({allContentMerged, page}) {
        if (!UrlUtil.URL_TO_HASH_BUILDER[page])
            return allContentMerged;

        const contentHashes = new Set();
        Object.entries(allContentMerged).forEach(([k,arr])=>{
            if (!(arr instanceof Array))
                return;
            allContentMerged[k] = arr.filter(it=>{
                const fnGetHash = UrlUtil.URL_TO_HASH_BUILDER[page];
                if (!fnGetHash)
                    return true;
                const hash = fnGetHash(it);
                if (contentHashes.has(hash))
                    return false;
                contentHashes.add(hash);
                return true;
            }
            );
        }
        );

        return allContentMerged;
    }

    static async pPostLoadGeneric({isPrerelease, isBrew}, out) {
        out = { ...out };

        if ((isBrew || isPrerelease) && (out.race || out.subrace)) {
            const nxt = await Charactermancer_Race_Util.pPostLoadPrereleaseBrew(out);
            Object.assign(out, nxt || {});
        }

        if ((isBrew || isPrerelease) && (out.item || out.baseitem || out.magicvariant || out.itemGroup)) {
            if (isBrew)
                out.item = await Vetools.pGetBrewItems(out);
            else if (isPrerelease)
                out.item = await Vetools.pGetPrereleaseItems(out);

            delete out.baseitem;
            delete out.magicvariant;
            delete out.itemProperty;
            delete out.itemType;
            delete out.itemGroup;
        }

        return out;
    }

    static getSourceFilterTypes(src) {
        return SourceUtil.isPrereleaseSource(src) ? [UtilDataSource.SOURCE_TYP_PRERELEASE] : SourceUtil.isNonstandardSource(src) ? [UtilDataSource.SOURCE_TYP_EXTRAS] : [UtilDataSource.SOURCE_TYP_OFFICIAL_SINGLE];
    }

    static getSourcesCustomUrl(nxtOpts={}) {
        return [new UtilDataSource.DataSourceUrl("Custom URL","",{
            ...nxtOpts,
            filterTypes: [UtilDataSource.SOURCE_TYP_CUSTOM],
            isAutoDetectPrereleaseBrew: true,
        },), ];
    }

    static getSourcesUploadFile(nxtOpts={}) {
        return [new UtilDataSource.DataSourceFile("Upload File",{
            ...nxtOpts,
            filterTypes: [UtilDataSource.SOURCE_TYP_CUSTOM],
            isAutoDetectPrereleaseBrew: true,
        },), ];
    }

    static async pGetSourcesPrerelease(dirsPrerelease, nxtOpts={}) {
        return this._pGetSourcesPrereleaseBrew({
            brewUtil: PrereleaseUtil,
            localSources: await Vetools.pGetLocalPrereleaseSources(...dirsPrerelease),
            sources: await Vetools.pGetPrereleaseSources(...dirsPrerelease),
            filterTypesLocal: [UtilDataSource.SOURCE_TYP_PRERELEASE, UtilDataSource.SOURCE_TYP_PRERELEASE_LOCAL],
            filterTypes: [UtilDataSource.SOURCE_TYP_PRERELEASE],
            nxtOpts,
        });
    }

    /**
     * @param {string[]} dirsHomebrew
     * @param {{pPostLoad:Function}} nxtOpts
     * @returns {Promise<any>}
     */
    static async pGetSourcesBrew(dirsHomebrew, nxtOpts={}) {
        return this._pGetSourcesPrereleaseBrew({
            brewUtil: BrewUtil2,
            localSources: await Vetools.pGetLocalBrewSources(...dirsHomebrew),
            sources: await Vetools.pGetBrewSources(...dirsHomebrew),
            filterTypesLocal: [UtilDataSource.SOURCE_TYP_BREW, UtilDataSource.SOURCE_TYP_BREW_LOCAL],
            filterTypes: [UtilDataSource.SOURCE_TYP_BREW],
            nxtOpts,
        });
    }

    /**
     * @param {{localSources:any[], sources:{name:string, url:string, abbreviations:string[]}[], nxtOpts:{pPostLoad:Function}, brewUtil:any,
     * filterTypesLocal:string[], filterTypes:string[]}}
     */
    static async _pGetSourcesPrereleaseBrew({localSources, sources, nxtOpts, brewUtil, filterTypesLocal, filterTypes}) {
        return [...localSources.map(({name, url, abbreviations})=>new UtilDataSource.DataSourceUrl(name,url,{
            ...nxtOpts,
            filterTypes: [...filterTypesLocal],
            abbreviations,
            brewUtil,
            isExistingPrereleaseBrew: true,
        },)), ...sources.map(({name, url, abbreviations})=>new UtilDataSource.DataSourceUrl(name,url,{
            ...nxtOpts,
            filterTypes: [...filterTypes],
            abbreviations,
            brewUtil,
        },)), ];
    }


    /**
     * Returns the prerelease and brew sources from the inputted material
     * @param {{_meta:{sources:{json:string}[]}}} json
     * @param {boolean} isErrorOnMultiple
     * @returns {{isPrerelease: Array, isBrew: Array}}
     */
    static getSourceType(json, {isErrorOnMultiple=false}={}) {
        const isPrereleasePerSource = (json._meta?.sources || []).map(it=>SourceUtil.isPrereleaseSource(it.json || ""));
        const isPrerelease = isPrereleasePerSource.every(it=>it);
        const isBrew = isPrereleasePerSource.every(it=>!it);

        if (isPrerelease && isBrew && isErrorOnMultiple)
            throw new Error(`Could not determine if data contained homebrew or if data contained prerelease content! Please ensure all homebrew/prerelease files have a valid "_meta.sources", and that no file contains both homebrew and prerelease sources.`);

        return { isPrerelease, isBrew };
    }
}
UtilDataSource.SOURCE_TYP_OFFICIAL_BASE = "Official";
UtilDataSource.SOURCE_TYP_OFFICIAL_ALL = `${UtilDataSource.SOURCE_TYP_OFFICIAL_BASE} (All)`;
UtilDataSource.SOURCE_TYP_OFFICIAL_SINGLE = `${UtilDataSource.SOURCE_TYP_OFFICIAL_BASE} (Single Source)`;
UtilDataSource.SOURCE_TYP_CUSTOM = "Custom/User";
UtilDataSource.SOURCE_TYP_EXTRAS = "Extras";
UtilDataSource.SOURCE_TYP_PRERELEASE = "Prerelease";
UtilDataSource.SOURCE_TYP_PRERELEASE_LOCAL = "Local Prerelease";
UtilDataSource.SOURCE_TYP_BREW = "Homebrew";
UtilDataSource.SOURCE_TYP_BREW_LOCAL = "Local Homebrew";
UtilDataSource.SOURCE_TYP_UNKNOWN = "Unknown";

UtilDataSource.SOURCE_TYPE_ORDER = [UtilDataSource.SOURCE_TYP_OFFICIAL_ALL, UtilDataSource.SOURCE_TYP_CUSTOM, UtilDataSource.SOURCE_TYP_OFFICIAL_SINGLE, UtilDataSource.SOURCE_TYP_EXTRAS, UtilDataSource.SOURCE_TYP_PRERELEASE_LOCAL, UtilDataSource.SOURCE_TYP_PRERELEASE, UtilDataSource.SOURCE_TYP_BREW_LOCAL, UtilDataSource.SOURCE_TYP_BREW, UtilDataSource.SOURCE_TYP_UNKNOWN, ];

UtilDataSource.SOURCE_TYPE_ORDER__FILTER = [UtilDataSource.SOURCE_TYP_OFFICIAL_ALL, UtilDataSource.SOURCE_TYP_OFFICIAL_SINGLE, UtilDataSource.SOURCE_TYP_EXTRAS, UtilDataSource.SOURCE_TYP_PRERELEASE_LOCAL, UtilDataSource.SOURCE_TYP_PRERELEASE, UtilDataSource.SOURCE_TYP_BREW_LOCAL, UtilDataSource.SOURCE_TYP_BREW, UtilDataSource.SOURCE_TYP_CUSTOM, UtilDataSource.SOURCE_TYP_UNKNOWN, ];

UtilDataSource.DataSourceBase = class {
    /**
     * @param {string} name
     * @param {{pPostLoad:Function, filterTypes:string[], abbreviations:string[], brewUtil:any, isExistingPrereleaseBrew:boolean}} opts
     */
    constructor(name, opts) {
        this.name = name;

        this._pPostLoad = opts.pPostLoad;
        this._brewUtil = opts.brewUtil;
        this._isAutoDetectPrereleaseBrew = !!opts.isAutoDetectPrereleaseBrew;
        this._isExistingPrereleaseBrew = !!opts.isExistingPrereleaseBrew;
        this.filterTypes = opts.filterTypes || [UtilDataSource.SOURCE_TYP_UNKNOWN];
        this.isDefault = !!opts.isDefault;
        this.abbreviations = opts.abbreviations;
        this.isWorldSelectable = !!opts.isWorldSelectable;
    }

    get identifier() {
        throw new Error(`Unimplemented!`);
    }
    get identifierWorld() {
        return this.isDefault ? "5etools" : this.identifier;
    }

    isCacheable() {
        throw new Error("Unimplemented!");
    }
    async pGetOutputs({uploadedFileMetas, customUrls}) {
        throw new Error("Unimplemented!");
    }

    async _pGetBrewUtil(...args) {
        if (this._brewUtil)
            return this._brewUtil;
        if (!this._isAutoDetectPrereleaseBrew)
            return null;
        return this._pGetBrewUtilAutodetected(...args);
    }

    async _pGetBrewUtilAutodetected(...args) {
        throw new Error("Unimplemented!");
    }

    async pLoadAndAddToAllContent({uploadedFileMetas, customUrls, allContent, cacheKeys=null}) {
        const meta = await this.pGetOutputs({
            uploadedFileMetas,
            customUrls
        });
        allContent.push(...meta.contents);
        if (cacheKeys && this.isCacheable())
            cacheKeys.push(...meta.cacheKeys);
    }
};

UtilDataSource.DataSourceUrl = class extends UtilDataSource.DataSourceBase {
    /**
     * @param {string} name
     * @param {string} url
     * @param {{pPostLoad:Function, filterTypes:string[], abbreviations:string[], brewUtil:any, isExistingPrereleaseBrew:boolean}} opts
     */
    constructor(name, url, opts) {
        opts = opts || {};

        super(name, {
            isWorldSelectable: !!url,
            ...opts
        });

        this.url = url;
        this.source = opts.source;
        this.userData = opts.userData;
    }

    get identifier() {
        return this.url === "" ? `VE_SOURCE_CUSTOM_URL` : this.url;
    }
    get identifierWorld() {
        return this.source ?? super.identifierWorld;
    }

    isCacheable() {
        return true;
    }

    async pGetOutputs({uploadedFileMetas, customUrls}) {
        if (this.url === "") {
            customUrls = customUrls || [];

            let loadedDatas;
            try {
                loadedDatas = await Promise.all(customUrls.map(async url=>{
                    const brewUtil = await this._pGetBrewUtil(url);
                    if (brewUtil && !this._isExistingPrereleaseBrew)
                        await brewUtil.pAddBrewFromUrl(url);

                    const data = await DataUtil.loadJSON(url);
                    return this._pPostLoad ? this._pPostLoad(data, this.userData) : data;
                }
                ));
            } catch (e) {
                ui.notifications.error(`Failed to load one or more URLs! ${VeCt.STR_SEE_CONSOLE}`);
                throw e;
            }

            return {
                cacheKeys: customUrls,
                contents: loadedDatas,
            };
        }

        let data;
        try {
            const brewUtil = await this._pGetBrewUtil(this.url);
            if (brewUtil && !this._isExistingPrereleaseBrew)
                await brewUtil.pAddBrewFromUrl(this.url);

            data = await DataUtil.loadJSON(this.url);
            if (this._pPostLoad)
                data = await this._pPostLoad(data, this.userData);
        } catch (e) {
            const msg = `Failed to load URL "${this.url}"!`;
            //console.ui.notifications.error(`${msg} ${VeCt.STR_SEE_CONSOLE}`);
            console.error(msg);
            throw e;
        }
        return {
            cacheKeys: [this.url],
            contents: [data],
        };
    }

    async _pGetBrewUtilAutodetected(url) {
        const json = await DataUtil.loadJSON(url);
        const {isPrerelease, isBrew} = UtilDataSource.getSourceType(json, {
            isErrorOnMultiple: true
        });
        if (isPrerelease)
            return PrereleaseUtil;
        if (isBrew)
            return BrewUtil2;
        return null;
    }
};

UtilDataSource.DataSourceFile = class extends UtilDataSource.DataSourceBase {
    constructor(name, opts) {
        opts = opts || {};

        super(name, {
            isWorldSelectable: false,
            ...opts
        });

        this.isFile = true;
    }

    get identifier() {
        return `VE_SOURCE_CUSTOM_FILE`;
    }

    isCacheable() {
        return false;
    }

    async pGetOutputs({uploadedFileMetas, customUrls}) {
        uploadedFileMetas = uploadedFileMetas || [];

        const allContent = await uploadedFileMetas.pMap(async fileMeta=>{
            if (!fileMeta)
                return null;

            const brewUtil = await this._pGetBrewUtil(fileMeta.contents);
            if (brewUtil && !this._isExistingPrereleaseBrew)
                await brewUtil.pAddBrewsFromFiles([{
                    json: fileMeta.contents,
                    name: fileMeta.name
                }]);

            const contents = await DataUtil.pDoMetaMerge(CryptUtil.uid(), MiscUtil.copyFast(fileMeta.contents));

            return this._pPostLoad ? this._pPostLoad(contents, this.userData) : contents;
        }
        );

        return {
            contents: allContent.filter(it=>it != null),
        };
    }

    async _pGetBrewUtilAutodetected(json) {
        const {isPrerelease, isBrew} = UtilDataSource.getSourceType(json, {
            isErrorOnMultiple: true
        });
        if (isPrerelease)
            return PrereleaseUtil;
        if (isBrew)
            return BrewUtil2;
        return null;
    }
};

UtilDataSource.DataSourceSpecial = class extends UtilDataSource.DataSourceBase {

    /**
     * @param {string} name
     * @param {any} pGet
     * @param {{cacheKey:string}} opts
     * @returns {any}
     */
    constructor(name, pGet, opts) {
        opts = opts || {};

        super(name, { isWorldSelectable: true, ...opts });
        this.special = { pGet };
        if (!opts.cacheKey) { throw new Error(`No cache key specified!`); }
        this.cacheKey = opts.cacheKey;
    }

    get identifier() {
        return this.cacheKey;
    }

    isCacheable() {
        return true;
    }

    async pGetOutputs({uploadedFileMetas, customUrls}) {
        let loadedData;
        try {
            const json = await Vetools.pLoadImporterSourceSpecial(this);
            loadedData = json;
            if (this._pPostLoad)
                loadedData = await this._pPostLoad(loadedData, json, this.userData);
        } catch (e) {
            //ui.notifications
            console.error(`Failed to load pre-defined source "${this.cacheKey}"! ${VeCt.STR_SEE_CONSOLE}`);
            throw e;
        }
        return {
            cacheKeys: [this.cacheKey],
            contents: [loadedData],
        };
    }

    async _pGetBrewUtilAutodetected() {
        throw new Error("Unimplemented!");
    }
};

export default UtilDataSource;