import { SideDataInterfaceClass } from "../veTools/dataloader.js";
import { SharedConsts, Config } from "../veTools/config.js";
import Vetools from "../veTools/vetools.js";
import { IconProviderDdbImporter } from "./iconproviderddb.js";

class ImageFetcherBase {
    static _SideDataInterface;
    static _UtilEntity = null;
    static _IMG_FALLBACK = null;

    static async pGetImagePath(ent, {fluff, propCompendium, isAllowCustom=true, isAllowActorItemImageSearch=false, taskRunner=null, }={}, ) {
        const meta = await this._pGetImagePathMeta(...arguments);
        return meta.img;
    }

    static async pGetSaveImagePath(ent, {fluff, propCompendium, isAllowCustom=true, isAllowActorItemImageSearch=false, taskRunner=null, }={}, ) {
        return Vetools.pOptionallySaveImageToServerAndGetUrl(await this.pGetImagePath(ent, {
            fluff,
            propCompendium,
            isAllowCustom,
            isAllowActorItemImageSearch,
            taskRunner
        }), );
    }

    static async pGetSaveImagePathMeta(ent, {fluff, propCompendium, isAllowCustom=true, isAllowActorItemImageSearch=false, taskRunner=null, }={}, ) {
        const meta = await this._pGetImagePathMeta(ent, {
            fluff,
            propCompendium,
            isAllowCustom,
            isAllowActorItemImageSearch,
            taskRunner
        });

        return {
            img: await Vetools.pOptionallySaveImageToServerAndGetUrl(meta.img),
            isFallback: meta.isFallback,
        };
    }

    static async _pGetImagePathMeta(ent, {fluff, propCompendium, isAllowCustom=true, isAllowActorItemImageSearch=false, taskRunner=null, }={}, ) {
        if (ent.foundryImg)
            return {
                img: ent.foundryImg
            };

        const fromSide = await this._SideDataInterface.pGetImgSideLoaded(ent);
        if (fromSide)
            return {
                img: fromSide
            };

        const optsGetters = {
            ent,
            fluff,
            propCompendium,
            isAllowCustom,
            isAllowActorItemImageSearch,
            taskRunner
        };
        const getters = Config.get("import", "isPreferFoundryImages") ? [this._pGetImagePathMeta_getter_foundry.bind(this, optsGetters), this._pGetImagePathMeta_getter_standard.bind(this, optsGetters), this._pGetImagePathMeta_getter_ddbi.bind(this, optsGetters), ] : [this._pGetImagePathMeta_getter_standard.bind(this, optsGetters), this._pGetImagePathMeta_getter_ddbi.bind(this, optsGetters), this._pGetImagePathMeta_getter_foundry.bind(this, optsGetters), ];

        for (const getter of getters) {
            const url = await getter();
            if (url)
                return {
                    img: url
                };
        }

        const fromFallback = this._getImgFallback(ent);
        if (fromFallback)
            return {
                img: fromFallback,
                isFallback: true
            };

        return {
            img: this._IMG_FALLBACK,
            isFallback: true
        };
    }

    static async _pGetImagePathMeta_getter_standard({ent, isAllowCustom, fluff}) {
        if (isAllowCustom) {
            const fromCustom = await this._pGetImgCustom(ent);
            if (fromCustom)
                return fromCustom;
        }

        if (fluff) {
            const fromFluff = await Vetools.pGetImageUrlFromFluff(fluff);
            if (fromFluff)
                return fromFluff;
        }
    }

    static async _pGetImagePathMeta_getter_ddbi({ent, isAllowCustom}) {
        if (!isAllowCustom)
            return null;

        return IconProviderDdbImporter.pGetIconPath(ent, {
            fnGetAliases: this._getFnGetEntityAliases(),
        }, );
    }

    static async _pGetImagePathMeta_getter_foundry({ent, propCompendium, isAllowActorItemImageSearch, taskRunner}) {
        if (!propCompendium)
            return null;

        const fromCompendium = await this._pGetImagePathMeta_pGetCompendiumImage({
            ent,
            propCompendium,
            isAllowActorItemImageSearch,
            taskRunner
        });
        if (fromCompendium)
            return fromCompendium;
    }

    static _getFnGetEntityAliases() {
        return this._UtilEntity ? this._UtilEntity.getEntityAliases.bind(this._UtilEntity) : ()=>[];
    }

    static async _pGetImagePathMeta_pGetCompendiumImage({ent, propCompendium, isAllowActorItemImageSearch=false, taskRunner}) {
        const out = await UtilCompendium.pGetCompendiumImage(propCompendium, ent, {
            fnGetAliases: this._getFnGetCompendiumAliases(),
            isIgnoreSrd: true,
            taskRunner,
            deepKeys: this._UtilEntity ? this._UtilEntity.getCompendiumDeepKeys() : null,
        }, );
        if (out)
            return out;

        if (!isAllowActorItemImageSearch)
            return null;

        return UtilCompendium.pGetActorItemCompendiumImage(propCompendium, ent, {
            fnGetAliases: this._getFnGetCompendiumAliases(),
            taskRunner,
        }, );
    }

    static _getFnGetCompendiumAliases() {
        return this._UtilEntity ? this._UtilEntity.getCompendiumAliases.bind(this._UtilEntity) : ()=>[];
    }

    static async _pGetImgCustom(ent) {
        return null;
    }

    static _getImgFallback(ent) {
        return null;
    }
}

class ImageFetcherClass extends ImageFetcherBase {
    static _SideDataInterface = SideDataInterfaceClass;
    static _IMG_FALLBACK = `modules/${SharedConsts.MODULE_ID}/media/icon/laurels.svg`;

    static async _pGetImagePathMeta_pGetCompendiumImage({ent, propCompendium, taskRunner}) {
        if (ent.__prop === "subclass")
            return this._pGetImagePathMeta_pGetCompendiumImage_subclass({
                ent,
                propCompendium,
                taskRunner
            });
        return this._pGetImagePathMeta_pGetCompendiumImage_class({
            ent,
            propCompendium,
            taskRunner
        });
    }

    static async _pGetImagePathMeta_pGetCompendiumImage_class({ent, propCompendium, taskRunner}) {
        return UtilCompendium.pGetCompendiumImage(propCompendium, ent, {
            taskRunner
        });
    }

    static async _pGetImagePathMeta_pGetCompendiumImage_subclass({ent, propCompendium, taskRunner}) {
        return UtilCompendium.pGetCompendiumImage(propCompendium, ent, {
            taskRunner
        });
    }
}

export {ImageFetcherClass}