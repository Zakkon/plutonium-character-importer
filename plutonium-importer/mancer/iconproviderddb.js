import Vetools from "../veTools/vetools.js";

class _DdbImporterIconFileAdapterBase {
    static _getCleanLookupString(str) {
        return str.trim().toLowerCase();
    }

    static _getValidString(strOr) {
        if (!strOr)
            return null;
        if (typeof strOr === "string")
            return strOr;
        return null;
    }

    _CACHE = {};
    _pAddingToCache = null;

    constructor({filename}) {
        this._filename = filename;
    }

    async pInit() {
        return (this._pAddingToCache ||= this._pLoadCache());
    }

    async _pLoadCache() {
        const json = await DataUtil.loadRawJSON(Vetools.getModuleDataUrl(`ddb-importer/${this._filename}`));
        json.forEach(row=>this._addRowToCache({
            row
        }));
    }

    getPathFromCache({ent, fnGetAliases}) {
        const out = this._getPathFromCache({
            ent
        });
        if (out)
            return out;

        const entsAlias = fnGetAliases(ent);
        for (const entAlias of entsAlias) {
            const out = this._getPathFromCache({
                ent: entAlias
            });
            if (out)
                return out;
        }

        return null;
    }

    _addRowToCache({row}) {
        throw new Error("Unimplemented!");
    }

    _getPathFromCache({ent}) {
        throw new Error("Unimplemented!");
    }
}

class DdbImporterIconFileAdapter extends _DdbImporterIconFileAdapterBase {
    _addRowToCache({row}) {
        this._CACHE[row.name] = row.path;
    }

    _getPathFromCache({ent}) {
        if (!ent.name)
            return null;

        return this._CACHE[this.constructor._getCleanLookupString(ent.name)];
    }
}

class DdbImporterIconFileAdapterClassFeatures extends _DdbImporterIconFileAdapterBase {
    _subclassLookup = null;

    constructor() {
        super({
            filename: "class-features.json"
        });
    }

    async _pLoadCache() {
        this._subclassLookup = await DataUtil.class.pGetSubclassLookup();
        return super._pLoadCache();
    }

    _addRowToCache({row}) {
        if (row.subclass)
            return MiscUtil.set(this._CACHE, row.class, row.subclass, row.name, row.path);
        if (row.class)
            return MiscUtil.set(this._CACHE, row.class, row.name, row.path);
        return MiscUtil.set(this._CACHE, row.name, row.path);
    }

    _getPathFromCache({ent}) {
        if (!ent.name)
            return null;

        if (ent.classSource && ent.className && ent.subclassSource && ent.subclassShortName) {
            const subclassName = MiscUtil.get(this._subclassLookup, ent.classSource, ent.className, ent.subclassSource, ent.subclassShortName, "name");

            if (subclassName) {
                const out = this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent.className), this.constructor._getCleanLookupString(subclassName), this.constructor._getCleanLookupString(ent.name), ), );
                if (out)
                    return out;
            }
        }

        if (ent.className) {
            const out = this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent.className), this.constructor._getCleanLookupString(ent.name), ), );
            if (out)
                return out;
        }

        return this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent.name), ), );
    }
}

class DdbImporterIconFileAdapterNamedMonsterFeatures extends _DdbImporterIconFileAdapterBase {
    constructor() {
        super({
            filename: "named-monster-features.json"
        });
    }

    _addRowToCache({row}) {
        return MiscUtil.set(this._CACHE, row.monster, row.name, row.path);
    }

    _getPathFromCache({ent}) {
        if (!ent.name)
            return null;

        return this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent.monsterName), this.constructor._getCleanLookupString(ent.name), ), );
    }
}

class DdbImporterIconFileAdapterRaces extends _DdbImporterIconFileAdapterBase {
    constructor() {
        super({
            filename: "races.json"
        });
    }

    _addRowToCache({row}) {
        if (row.subrace)
            return MiscUtil.set(this._CACHE, row.race, row.subrace, row.name, row.path);
        if (row.race)
            return MiscUtil.set(this._CACHE, row.race, row.name, row.path);
        return MiscUtil.set(this._CACHE, row.name, row.path);
    }

    _getPathFromCache({ent}) {
        if (!ent.name)
            return null;

        if (ent._raceSubraceName) {
            const out = this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent._raceBaseName || ent.raceName), this.constructor._getCleanLookupString(ent.raceName), this.constructor._getCleanLookupString(ent.name), ), );
            if (out)
                return out;

            const outAlt = this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent._raceBaseName || ent.raceName), this.constructor._getCleanLookupString(ent._raceSubraceName), this.constructor._getCleanLookupString(ent.name), ), );
            if (outAlt)
                return outAlt;
        }

        if (ent.raceName) {
            const out = this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent.raceName), this.constructor._getCleanLookupString(ent.raceName), this.constructor._getCleanLookupString(ent.name), ), );
            if (out)
                return out;

            const outAlt = this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent.raceName), this.constructor._getCleanLookupString(ent.name), ), );
            if (outAlt)
                return outAlt;
        }

        if (ent._subraceName && ent._baseName) {
            const out = this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent._baseName), this.constructor._getCleanLookupString(ent._subraceName), ), );
            if (out)
                return out;
        }

        return this.constructor._getValidString(MiscUtil.get(this._CACHE, this.constructor._getCleanLookupString(ent.name), ), );
    }
}

class IconProviderDdbImporter {
    static _FILE_ADAPTER_BACKGROUNDS = new DdbImporterIconFileAdapter({
        filename: "backgrounds.json"
    });
    static _FILE_ADAPTER_CLASS_FEATURES = new DdbImporterIconFileAdapterClassFeatures();
    static _FILE_ADAPTER_CLASSES = new DdbImporterIconFileAdapter({
        filename: "classes.json"
    });
    static _FILE_ADAPTER_FEATS = new DdbImporterIconFileAdapter({
        filename: "feats.json"
    });
    static _FILE_ADAPTER_GENERAL = new DdbImporterIconFileAdapter({
        filename: "general.json"
    });
    static _FILE_ADAPTER_GENERIC_MONSTER_FEATURES = new DdbImporterIconFileAdapter({
        filename: "generic-monster-features.json"
    });
    static _FILE_ADAPTER_ITEMS = new DdbImporterIconFileAdapter({
        filename: "items.json"
    });
    static _FILE_ADAPTER_NAMED_MONSTER_FEATURES = new DdbImporterIconFileAdapterNamedMonsterFeatures();
    static _FILE_ADAPTER_RACES = new DdbImporterIconFileAdapterRaces();
    static _FILE_ADAPTER_SPELLS = new DdbImporterIconFileAdapter({
        filename: "spells.json"
    });

    static _PROP_TO_FILE_ADAPTERS = {
        ...UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_ITEMS].mergeMap(prop=>({
            [prop]: [this._FILE_ADAPTER_ITEMS]
        })),
        ...UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_SPELLS].mergeMap(prop=>({
            [prop]: [this._FILE_ADAPTER_SPELLS]
        })),
        "background": [this._FILE_ADAPTER_BACKGROUNDS, this._FILE_ADAPTER_GENERAL],
        "backgroundFeature": [this._FILE_ADAPTER_GENERAL],

        "class": [this._FILE_ADAPTER_CLASSES],
        "subclass": [this._FILE_ADAPTER_CLASSES],

        "classFeature": [this._FILE_ADAPTER_CLASS_FEATURES, this._FILE_ADAPTER_GENERAL],
        "subclassFeature": [this._FILE_ADAPTER_CLASS_FEATURES, this._FILE_ADAPTER_GENERAL],

        "optionalfeature": [this._FILE_ADAPTER_CLASS_FEATURES, this._FILE_ADAPTER_FEATS, this._FILE_ADAPTER_GENERAL],
        "feat": [this._FILE_ADAPTER_FEATS, this._FILE_ADAPTER_CLASS_FEATURES, this._FILE_ADAPTER_GENERAL],

        //Dont think importing monsters and creatures is needed atm
        /*  ...[...Renderer.monster.CHILD_PROPS_EXTENDED, ...UtilEntityCreatureFeature.CHILD_PROPS_FAUX, ].mergeMap(prop=>({
            [UtilEntityCreatureFeature.getNamespacedProp(prop)]: [this._FILE_ADAPTER_NAMED_MONSTER_FEATURES, this._FILE_ADAPTER_GENERIC_MONSTER_FEATURES]
        })), */

        ...UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_RACES].mergeMap(prop=>({
            [prop]: [this._FILE_ADAPTER_RACES]
        })), 

        "raceFeature": [this._FILE_ADAPTER_RACES, this._FILE_ADAPTER_GENERAL],
    };

    static async pGetIconPath(ent, {fnGetAliases=null}={}) {
        const adapters = this._PROP_TO_FILE_ADAPTERS[ent.__prop];
        if (!adapters)
            return null;

        for (const adapter of adapters) {
            await adapter.pInit();
            const out = adapter.getPathFromCache({
                ent,
                fnGetAliases
            });
            if (out)
                return out;
        }

        return null;
    }
}

export {IconProviderDdbImporter}