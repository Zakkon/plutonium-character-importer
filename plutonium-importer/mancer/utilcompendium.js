import { Config } from "../veTools/config.js";

class UtilCompendium {
    static init() {
        UtilHooks.on(UtilHooks.HK_CONFIG_UPDATE, ()=>this._pHandleConfigUpdate());
        this._pHandleConfigUpdate().then(null);

        Hooks.on("updateCompendium", (pack)=>this._pHandleCompendiumUpdate({
            pack
        }));
    }

    static async _pHandleConfigUpdate() {
        await this._pFlushCompendiumCaches();
    }

    static async _pHandleCompendiumUpdate({pack}) {
        await this._pFlushCompendiumCaches({
            pack
        });
    }

    static async _pFlushCompendiumCaches({pack}={}) {
        await this._COMPENDIUM_CACHES_LOCK.pLock();
        try {
            this._pFlushCompendiumCaches_({
                pack
            });
        } finally {
            this._COMPENDIUM_CACHES_LOCK.unlock();
        }
    }

    static _pFlushCompendiumCaches_({pack}={}) {
        if (pack) {
            ConfigConsts.getCompendiumPaths().forEach(([group,key])=>{
                const currentValue = Config.get(group, key) || "";

                const toCheckIdents = new Set(this._getCompendiumsFromString(currentValue).map(it=>it.collection));
                if (!toCheckIdents.has(pack.collection))
                    return;

                Object.entries(this._COMPENDIUM_CACHES).forEach(([_KEY,cached])=>{
                    Object.keys(cached).filter(ident=>ident === pack.collection).forEach(ident=>MiscUtil.deleteObjectPath(this._COMPENDIUM_CACHES, _KEY, ident));
                }
                );
            }
            );

            return;
        }

        ConfigConsts.getCompendiumPaths().forEach(path=>{
            const [group,key] = path;
            const pathKey = path.join("___");

            const storedValue = this._COMPENDIUM_CONFIG_PREV_VALUES[pathKey] || "";
            const currentValue = Config.get(group, key) || "";

            if (storedValue.trim() !== currentValue.trim()) {
                const toDumpIdents = CollectionUtil.setDiff(new Set(this._getCompendiumsFromString(storedValue).map(it=>it.collection)), new Set(this._getCompendiumsFromString(currentValue).map(it=>it.collection)), );

                Object.entries(this._COMPENDIUM_CACHES).forEach(([_KEY,cached])=>{
                    Object.keys(cached).filter(ident=>toDumpIdents.has(ident)).forEach(ident=>MiscUtil.deleteObjectPath(this._COMPENDIUM_CACHES, _KEY, ident));
                }
                );
            }

            this._COMPENDIUM_CONFIG_PREV_VALUES[pathKey] = currentValue;
        }
        );
    }

    static async pGetCompendiumData(compendium, isContent, {taskRunner=null}={}) {
        isContent = isContent || UtilCompat.isBabeleActive();

        const maxTimeSecs = 10;
        const taskRunnerLineMeta = taskRunner ? taskRunner.addLogLine(`Caching compendium &quot;<i>${compendium.metadata.label.qq()}</i>&quot;...`) : null;
        const compendiumData = await Promise.race([isContent ? compendium.getDocuments() : compendium.getIndex(), MiscUtil.pDelay(maxTimeSecs * 1000, null), ]);
        if (taskRunner)
            taskRunner.addLogLine(`Cached compendium &quot;<i>${compendium.metadata.label.qq()}</i>&quot;.`, {
                linkedLogLineMeta: taskRunnerLineMeta
            });
        if (!compendiumData) {
            console.warn(...LGT, `Loading of ${compendium?.metadata?.system}.${compendium?.metadata?.name} took more than ${maxTimeSecs} seconds! This usually means the compendium is inaccessible. Cancelling compendium load.`);
            return [];
        }
        return compendiumData;
    }

    static async pGetCompendiumImage(entityType, entity, opts) {
        return this._pGetCacheAndGetCompendiumData(this._COMPENDIUM_CACHE_KEY_IMAGE, this._getAdditionalDataCompendiums({
            entityType
        }), entityType, entity, opts, );
    }

    static async _pGetCacheAndGetCompendiumData(cacheId, compendiums, entityType, entity, opts) {
        opts = opts || {};

        if (!compendiums?.length)
            return null;

        if (!opts.isIgnoreSrd && !entity.srd)
            return null;

        let lookupMetas = this._getBaseLookupMetas({
            entity,
            fnGetAliases: !opts.deepKeys ? opts.fnGetAliases : null
        });

        if (opts.deepKeys) {
            lookupMetas = lookupMetas.map(it=>({
                name: it
            }));

            if (opts.fnGetAliases) {
                const aliasMetas = opts.fnGetAliases(entity);
                aliasMetas.forEach(it=>it.name = it.name ? this._getLookupName(it.name) : it.name);
                lookupMetas.unshift(...aliasMetas);
            }
        }

        if (opts.deepKeys) {
            cacheId = {
                baseCacheId: cacheId,
                deepKeys: opts.deepKeys,
                cacheId: [cacheId, ...opts.deepKeys.sort(SortUtil.ascSortLower)].join("__"),
            };
        }

        await this._COMPENDIUM_CACHES_LOCK.pLock();
        try {
            for (const lookupMeta of lookupMetas) {
                for (const compendium of compendiums) {
                    if (!this._isCompendiumCached(this._COMPENDIUM_CACHES, cacheId, compendium)) {
                        await this._pCacheCompendium(this._COMPENDIUM_CACHES, cacheId, compendium, {
                            taskRunner: opts.taskRunner
                        });
                    }

                    const out = this._getCachedCompendiumData(this._COMPENDIUM_CACHES, cacheId, compendium, lookupMeta);
                    if (out)
                        return out;
                }
            }
        } finally {
            this._COMPENDIUM_CACHES_LOCK.unlock();
        }
    }

    static _getCompendiumsFromString(joinedCompendiumNamesOrArray) {
        if (!joinedCompendiumNamesOrArray)
            return [];

        joinedCompendiumNamesOrArray = typeof joinedCompendiumNamesOrArray === "string" ? joinedCompendiumNamesOrArray.split(",").map(it=>it.trim().toLowerCase()) : joinedCompendiumNamesOrArray.map(it=>it.toLowerCase());

        return joinedCompendiumNamesOrArray.map(it=>game.packs.find(x=>x.collection.toLowerCase() === it)).filter(Boolean);
    }

    static _getAdditionalDataCompendiums({entityType}) {
        switch (entityType) {
        case "spell":
            return this._getCompendiumsFromString(Config.get("importSpell", "additionalDataCompendium"));
        case "monster":
            return this._getCompendiumsFromString(Config.get("importCreature", "additionalDataCompendium"));
        case "item":
            return this._getCompendiumsFromString(Config.get("importItem", "additionalDataCompendium"));
        case "class":
            return this._getCompendiumsFromString(Config.get("importClass", "additionalDataCompendiumClasses"));
        case "subclass":
            return this._getCompendiumsFromString(Config.get("importClass", "additionalDataCompendiumSubclasses"));
        case "classFeature":
            return this._getCompendiumsFromString(Config.get("importClass", "additionalDataCompendiumFeatures"));
        case "subclassFeature":
            return this._getCompendiumsFromString(Config.get("importClass", "additionalDataCompendiumFeatures"));
        case "optionalfeature":
            return this._getCompendiumsFromString(Config.get("importOptionalFeature", "additionalDataCompendium"));
        case "race":
            return this._getCompendiumsFromString(Config.get("importRace", "additionalDataCompendium"));
        case "raceFeature":
            return this._getCompendiumsFromString(Config.get("importRaceFeature", "additionalDataCompendiumFeatures"));
        case "monsterFeature":
            return this._getCompendiumsFromString(Config.get("importCreature", "additionalDataCompendiumFeatures"));
        case "background":
            return this._getCompendiumsFromString(Config.get("importBackground", "additionalDataCompendium"));
        case "backgroundFeature":
            return this._getCompendiumsFromString(Config.get("importBackground", "additionalDataCompendiumFeatures"));
        case "table":
            return this._getCompendiumsFromString(Config.get("importTable", "additionalDataCompendium"));
        default:
            return null;
        }
    }

    static _getReplacementDataCompendiums({entityType}) {
        switch (entityType) {
        case "spell":
            return this._getCompendiumsFromString(Config.get("importSpell", "replacementDataCompendium"));
        case "item":
            return this._getCompendiumsFromString(Config.get("importItem", "replacementDataCompendium"));
        default:
            return null;
        }
    }

    static async pGetActorItemCompendiumImage(entityType, entity, opts) {
        return this._pGetCacheAndGetActorItemCompendiumData(this._COMPENDIUM_CACHE_KEY_IMAGE, entityType, entity, opts, );
    }

    static async _pGetCacheAndGetActorItemCompendiumData(cacheId, entityType, entity, opts) {
        opts = opts || {};

        let lookupMetas = this._getBaseLookupMetas({
            entity
        });

        let compendiums;
        switch (cacheId) {
        case this._COMPENDIUM_CACHE_KEY_IMAGE:
            {
                switch (entityType) {
                case "monsterFeature":
                    compendiums = this._getCompendiumsFromString(Config.get("importCreature", "additionalDataCompendium"));
                    break;
                default:
                    return null;
                }

                break;
            }

        case this._COMPENDIUM_CACHE_KEY_SYSTEM:
            {
                switch (entityType) {
                case "monsterFeature":
                    compendiums = this._getCompendiumsFromString(ConfigConsts.SRD_COMPENDIUMS_CREATURES);
                    break;
                default:
                    return null;
                }

                break;
            }

        default:
            throw new Error(`Unknown cache ID "${cacheId}"`);
        }

        if (!compendiums.length)
            return null;

        await this._COMPENDIUM_ACTOR_CACHES_LOCK.pLock();
        try {
            for (const lookupMeta of lookupMetas) {
                for (const compendium of compendiums) {
                    if (!this._isCompendiumCached(this._COMPENDIUM_ACTOR_CACHES, cacheId, compendium)) {
                        await this._pCacheActorItemCompendium(this._COMPENDIUM_ACTOR_CACHES, cacheId, compendium, {
                            taskRunner: opts.taskRunner
                        });
                    }

                    const out = this._getCachedCompendiumData(this._COMPENDIUM_ACTOR_CACHES, cacheId, compendium, lookupMeta);
                    if (out)
                        return out;
                }
            }
        } finally {
            this._COMPENDIUM_ACTOR_CACHES_LOCK.unlock();
        }
    }

    static async getCompendiumEntity(entityType, entity, opts={}) {
        const out = await this._pGetCacheAndGetCompendiumData(this._COMPENDIUM_CACHE_KEY_SYSTEM, this._getReplacementDataCompendiums({
            entityType
        }), entityType, entity, {
            ...opts,
            isIgnoreSrd: true,
        }, );
        if (!out)
            return out;

        delete out._id;

        return out;
    }

    static async getSrdCompendiumEntity(entityType, entity, opts) {
        return this._pGetCacheAndGetCompendiumData(this._COMPENDIUM_CACHE_KEY_SYSTEM, this._getAdditionalDataCompendiums({
            entityType
        }), entityType, entity, opts, );
    }

    static _isCompendiumCached(_CACHES, cacheId, compendium) {
        cacheId = cacheId.cacheId || cacheId;
        return !!MiscUtil.get(_CACHES, cacheId, compendium.collection);
    }

    static async _pCacheCompendium(_CACHES, cacheId, compendium, {taskRunner=null}={}) {
        let isContent;
        if (cacheId.baseCacheId) {
            isContent = true;
        } else {
            switch (cacheId) {
            case this._COMPENDIUM_CACHE_KEY_IMAGE:
                isContent = false;
                break;
            case this._COMPENDIUM_CACHE_KEY_SYSTEM:
                isContent = true;
                break;
            default:
                throw new Error(`Unknown cache ID "${cacheId}"`);
            }
        }

        const compendiumData = await this.pGetCompendiumData(compendium, isContent, {
            taskRunner
        });

        const cache = MiscUtil.getOrSet(_CACHES, cacheId.cacheId || cacheId, compendium.collection, {});
        if (!compendiumData)
            return;

        if (cacheId.baseCacheId) {
            compendiumData.forEach(it=>cache[this._getLookupName(this._getCompendiumDocOriginalName(it))] = MiscUtil.copy(it.system));
        } else {
            switch (cacheId) {
            case this._COMPENDIUM_CACHE_KEY_IMAGE:
                compendiumData.forEach(it=>cache[this._getLookupName(this._getCompendiumDocOriginalName(it))] = it.img);
                break;
            case this._COMPENDIUM_CACHE_KEY_SYSTEM:
                compendiumData.forEach(it=>cache[this._getLookupName(this._getCompendiumDocOriginalName(it))] = it.toObject());
                break;
            default:
                throw new Error(`Unknown cache ID "${cacheId}"`);
            }
        }
    }

    static async _pCacheActorItemCompendium(caches, cacheId, compendium, {taskRunner=null}={}) {
        const compendiumData = await this.pGetCompendiumData(compendium, true, {
            taskRunner
        });

        const cache = MiscUtil.getOrSet(caches, cacheId.cacheId || cacheId, compendium.collection, {});
        if (!compendiumData)
            return;

        compendiumData.forEach(act=>{
            act.items.forEach(it=>{
                const cleanName = this._getLookupName(this._getCompendiumDocOriginalName(it));
                switch (cacheId) {
                case this._COMPENDIUM_CACHE_KEY_IMAGE:
                    {
                        if (!it.img || UtilImage.isDefaultActorImage(it.img))
                            return;
                        cache[cleanName] = cache[cleanName] || it.img;
                        break;
                    }
                case this._COMPENDIUM_CACHE_KEY_SYSTEM:
                    cache[cleanName] = cache[cleanName] || it.toObject();
                    break;
                default:
                    throw new Error(`Unknown cache ID "${cacheId}"`);
                }
            }
            );
        }
        );
    }

    static _getCachedCompendiumData(_CACHES, cacheId, compendium, lookupNameOrMeta) {
        const cache = MiscUtil.get(_CACHES, cacheId.cacheId || cacheId, compendium.collection);
        if (!cache)
            return null;
        const fromCache = cache[lookupNameOrMeta.name || lookupNameOrMeta];
        if (!fromCache || typeof lookupNameOrMeta === "string")
            return fromCache;

        const isMatch = Object.entries(lookupNameOrMeta).filter(([keyPath])=>keyPath !== "name").every(([keyPath,valRequired])=>{
            if (typeof valRequired === "string")
                valRequired = valRequired.toLowerCase().trim();

            let it;
            const pathParts = keyPath.split(".");
            for (const pathPart of pathParts) {
                it = (it || fromCache)[pathPart];
                if (it === undefined)
                    return false;
            }
            if (typeof it === "string")
                it = this._getLookupName(it);

            return it === valRequired;
        }
        );

        if (!isMatch)
            return null;

        switch (cacheId.baseCacheId) {
        case this._COMPENDIUM_CACHE_KEY_IMAGE:
            return fromCache.img;
        case this._COMPENDIUM_CACHE_KEY_SYSTEM:
            return fromCache;
        default:
            throw new Error(`Unknown cache ID "${cacheId.baseCacheId}"`);
        }
    }

    static _getCompendiumDocOriginalName(doc) {
        return IntegrationBabele.getOriginalName(doc);
    }

    static _getLookupName(name) {
        return CleanUtil.getCleanString(name.toLowerCase().trim(), );
    }

    static _getBaseLookupMetas({entity, fnGetAliases}) {
        const lookupMetas = [];
        if (entity.name)
            lookupMetas.push(this._getLookupName(entity.name));
        if (typeof entity.srd === "string")
            lookupMetas.push(entity.srd);
        if (entity._displayName)
            lookupMetas.push(this._getLookupName(entity._displayName));
        if (fnGetAliases)
            lookupMetas.push(...fnGetAliases(entity).map(it=>this._getLookupName(it)));
        return lookupMetas;
    }

    static pGetPlutoniumCompendiumId(page, hash) {
        switch (page) {
        case UrlUtil.PG_BESTIARY:
            return this._pGetPlutoniumCompendiumId_generic({
                page,
                hash,
                packName: SharedConsts.PACK_NAME_CREATURES
            });
        case UrlUtil.PG_ITEMS:
            return this._pGetPlutoniumCompendiumId_generic({
                page,
                hash,
                packName: SharedConsts.PACK_NAME_ITEMS
            });
        case UrlUtil.PG_SPELLS:
            return this._pGetPlutoniumCompendiumId_generic({
                page,
                hash,
                packName: SharedConsts.PACK_NAME_SPELLS
            });
        default:
            throw new Error(`Unhandled page "${page}"`);
        }
    }

    static async _pGetPlutoniumCompendiumId_generic({page, hash, packName}) {
        const pack = game.packs.get(`${SharedConsts.MODULE_ID}.${packName}`);
        if (!pack)
            return null;

        if (!UtilCompendium._PLUT_CACHES[packName]) {
            const lock = UtilCompendium._PLUT_CACHES_LOCKS[packName] || new VeLock();
            try {
                await lock.pLock();
                if (!UtilCompendium._PLUT_CACHES[packName])
                    UtilCompendium._PLUT_CACHES[packName] = await pack.getDocuments();
            } finally {
                lock.unlock();
            }
        }

        const match = UtilCompendium._PLUT_CACHES[packName].find(it=>it.flags?.[SharedConsts.MODULE_ID]?.page === page && it.flags?.[SharedConsts.MODULE_ID]?.hash === hash);
        if (!match)
            return null;

        return {
            packName: packName,
            packPackage: SharedConsts.MODULE_ID,
            packId: match.id,
        };
    }

    static getAvailablePacks({folderType}) {
        return game.packs.filter(it=>!it.locked && it.metadata.type === folderType);
    }

    static async pGetUserCreatePack({folderType}) {
        const $dispPackName = $(`<div class="w-100 italic"></div>`);
        const packLabel = await InputUiUtil.pGetUserString({
            title: `Enter New "${folderType}" Compendium Name`,
            fnIsValid: str=>Parser.stringToSlug(str).length,
            $elePost: $$`<label class="mb-2 split-v-center ve-muted">
					<div class="mr-2 bold no-wrap">Compendium ID:</div>
					${$dispPackName}
				</label>`,
            cbPostRender: ({comp, propValue})=>{
                const hkId = ()=>$dispPackName.text(comp._state[propValue] ? (Parser.stringToSlug(comp._state[propValue]) || "(Invalid)") : "\u2014");
                comp._addHookBase(propValue, hkId);
                hkId();
            }
            ,
        });
        if (!packLabel || !packLabel.trim())
            return null;

        return CompendiumCollection.createCompendium({
            type: "Item",
            label: packLabel,
            name: Parser.stringToSlug(packLabel),
            package: "world",
        });
    }

    static $getSelCompendium({availablePacks=null, folderType=null}) {
        availablePacks = availablePacks || this.getAvailablePacks({
            folderType
        });
        return $(`<select class="block ve-foundry-button m-0">
			${availablePacks.map((pack)=>`<option value="${pack.collection}">${pack.metadata.label}</option>`).join("")}
		</select>`);
    }

    static getPackByCollection({collection}) {
        if (collection == null)
            return null;
        return game.packs.find(it=>it.collection === collection);
    }
}

UtilCompendium._COMPENDIUM_CACHE_KEY_IMAGE = "img";
UtilCompendium._COMPENDIUM_CACHE_KEY_SYSTEM = "system";
UtilCompendium._COMPENDIUM_CONFIG_PREV_VALUES = {};
UtilCompendium._COMPENDIUM_CACHES = {};
UtilCompendium._COMPENDIUM_CACHES_LOCK = new VeLock();
UtilCompendium._COMPENDIUM_ACTOR_IMAGE_LAST_VALUES = {};
UtilCompendium._COMPENDIUM_ACTOR_CACHES = {};
UtilCompendium._COMPENDIUM_ACTOR_CACHES_LOCK = new VeLock();

UtilCompendium._PLUT_CACHES = {};
UtilCompendium._PLUT_CACHES_LOCKS = {};

export default UtilCompendium;