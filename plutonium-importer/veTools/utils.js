import {SharedConsts} from "./config.js";
//#region Util
class Util {
    static _getLogTag() {
        return [`%cPlutonium`, `color: #337ab7; font-weight: bold;`, `|`, ];
    }

    static isDebug() {
        return !!CONFIG?.debug?.module?.[SharedConsts.MODULE_ID];
    }

    static _HEIGHT_MAX_OFFSET = 160;
    static getMaxWindowHeight(desiredHeight) {
        const targetHeight = Math.min(desiredHeight || Number.MAX_SAFE_INTEGER, document.documentElement.clientHeight - this._HEIGHT_MAX_OFFSET);
        return Math.max(this._HEIGHT_MAX_OFFSET, targetHeight);
    }

    static _WIDTH_MAX_OFFSET = 250;
    static getMaxWindowWidth(desiredWidth) {
        const targetWidth = Math.min(desiredWidth || Number.MAX_SAFE_INTEGER, document.documentElement.clientWidth - this._WIDTH_MAX_OFFSET);
        return Math.max(this._WIDTH_MAX_OFFSET, targetWidth);
    }

    static getWithoutParens(str) {
        return str.replace(/\([^)]+\)/g, "").trim();
    }
    static getTokens(str) {
        return str.split(/([ ,:;()"])/g).filter(Boolean);
    }
    static isPunctuation(token) {
        return /[,:;()"]/.test(token);
    }
    static isCapsFirst(word) {
        return /^[A-Z]/.test(word);
    }
    static getSentences(str) {
        return str.replace(/ +/g, " ").split(/[.?!]/g).map(it=>it.trim()).filter(Boolean);
    }

    static getRounded(n, dp) {
        return Number(n.toFixed(dp));
    }

    static trimObject(obj) {
        const walker = MiscUtil.getWalker({
            isAllowDeleteObjects: true,
            isDepthFirst: true,
        });

        return walker.walk(obj, {
            object: (it)=>{
                Object.entries(it).forEach(([k,v])=>{
                    if (v === undefined)
                        delete it[k];
                }
                );
                if (!Object.keys(it).length)
                    return undefined;
                return it;
            }
            ,
        }, );
    }

    static getCleanServerUrl(url) {
        return url.replace(/^(.*?)\/*$/, "$1/");
    }
}

const LGT = Util._getLogTag();
Util.Fvtt = class {
    static getOwnershipEnum({isIncludeDefault=false}={}) {
        return [isIncludeDefault ? {
            value: -1,
            name: "Default"
        } : null, ...Object.entries(CONST.DOCUMENT_OWNERSHIP_LEVELS).map(([name,value])=>({
            value,
            name: name.toTitleCase(),
        })), ].filter(Boolean);
    }

    static getMinimumRolesEnum() {
        return [...Object.entries(CONST.USER_ROLES).map(([name,value])=>({
            value,
            name: name.toTitleCase(),
        })), {
            value: CONST.USER_ROLES.GAMEMASTER + 1,
            name: `Cheater (Disable Feature)`,
        }, ];
    }

    static canUserCreateFolders() {
        return game.user.isGM;
    }
};

//#endregion
//#region UtilGameSettings
class UtilGameSettings {
    static prePreInit() {
        //TEMPFIX
        /* game.settings.register(SharedConsts.MODULE_ID, "isDbgMode", {
            name: `Debug Mode`,
            hint: `Enable additional developer-only debugging functionality. Not recommended, as it may reduce stability.`,
            default: false,
            type: Boolean,
            scope: "world",
            config: true,
        }); */
    }

    static isDbg() {
        return !!this.getSafe(SharedConsts.MODULE_ID, "isDbgMode");
    }

    static getSafe(module, key) {
        //TEMPFIX
        return null;
       /*  try {
            return game.settings.get(module, key);
        } catch (e) {
            return null;
        } */
    }
}
//#endregion
//#region UtilHooks
class UtilHooks {
    static callAll(name, val) {
        Hooks.callAll(this._getHookName(name), val);
    }

    static call(name, val) {
        Hooks.callAll(this._getHookName(name), val);
    }

    static on(name, fn) {
        Hooks.on(this._getHookName(name), fn);
    }

    static off(name, fn) {
        Hooks.off(this._getHookName(name), fn);
    }

    static _getHookName(name) {
        return `${SharedConsts.MODULE_ID_FAKE}.${name}`;
    }
}
UtilHooks.HK_CONFIG_UPDATE = "configUpdate";
UtilHooks.HK_IMPORT_COMPLETE = "importComplete";
//#endregion
//#region UtilCompat
class UtilCompat {
    static isModuleActive(moduleId) {
        //TEMPFIX
        return false;
        //return !!game.modules.get(moduleId)?.active;
    }

    static _MODULE_LIB_WRAPPER = "lib-wrapper";
    static MODULE_DAE = "dae";
    static _MODULE_DRAG_UPLOAD = "dragupload";
    static MODULE_MIDI_QOL = "midi-qol";
    static MODULE_KANKA_FOUNDRY = "kanka-foundry";
    static MODULE_SMOL_FOUNDRY = "smol-foundry";
    static MODULE_PERMISSION_VIEWER = "permission_viewer";
    static _MODULE_TWILIGHT_UI = "twilight-ui";
    static MODULE_TIDY5E_SHEET = "tidy5e-sheet";
    static _MODULE_OBSIDIAN = "obsidian";
    static MODULE_BABELE = "babele";
    static MODULE_MONKS_LITTLE_DETAILS = "monks-little-details";
    static MODULE_MONKS_BLOODSPLATS = "monks-bloodsplats";
    static MODULE_MONKS_ENHANCED_JOURNAL = "monks-enhanced-journal";
    static MODULE_BETTER_ROLLTABLES = "better-rolltables";
    static _MODULE_BETTER_ROLLTABLES = "item-piles";
    static MODULE_PLUTONIUM_ADDON_AUTOMATION = "plutonium-addon-automation";
    static MODULE_LEVELS = "levels";
    static MODULE_MULTICLASS_SPELLBOOK_FILTER = "spell-class-filter-for-5e";
    static MODULE_ROLLDATA_AWARE_ACTIVE_EFFECTS = "fvtt-rolldata-aware-active-effects";
    static MODULE_QUICK_INSERT = "quick-insert";
    static MODULE_PF2E_TOKENS_BESTIARIES = "pf2e-tokens-bestiaries";
    static _MODULE_DFREDS_CONVENIENT_EFFECTS = "dfreds-convenient-effects";
    static MODULE_LEVELS_3D_PREVIEW = "levels-3d-preview";
    static _MODULE_CANVAS_3D_COMPENDIUM = "canvas3dcompendium";
    static _MODULE_CANVAS_3D_TOKEN_COMPENDIUM = "canvas3dtokencompendium";
    static _MODULE_FOUNDRY_SUMMONS = "foundry-summons";
    static _MODULE_TOKEN_ACTION_HUD = "token-action-hud";
    static _MODULE_TOKEN_ACTION_HUD_CORE = "token-action-hud-core";
    static MODULE_SIMPLE_CALENDAR = "foundryvtt-simple-calendar";

    static isLibWrapperActive() {
        return this.isModuleActive(UtilCompat._MODULE_LIB_WRAPPER);
    }
    static isDaeActive() {
        return this.isModuleActive(UtilCompat.MODULE_DAE);
    }
    static isDragUploadActive() {
        return this.isModuleActive(UtilCompat._MODULE_DRAG_UPLOAD);
    }
    static isPermissionViewerActive() {
        return this.isModuleActive(UtilCompat.MODULE_PERMISSION_VIEWER);
    }
    static isSmolFoundryActive() {
        return this.isModuleActive(UtilCompat.MODULE_SMOL_FOUNDRY);
    }
    static isTwilightUiActive() {
        return this.isModuleActive(UtilCompat._MODULE_TWILIGHT_UI);
    }
    static isTidy5eSheetActive() {
        return this.isModuleActive(UtilCompat.MODULE_TIDY5E_SHEET);
    }
    static isObsidianActive() {
        return this.isModuleActive(UtilCompat._MODULE_OBSIDIAN);
    }
    static isBabeleActive() {
        return this.isModuleActive(UtilCompat.MODULE_BABELE);
    }
    static isMonksLittleDetailsActive() {
        return this.isModuleActive(UtilCompat.MODULE_MONKS_LITTLE_DETAILS);
    }
    static isMonksBloodsplatsActive() {
        return this.isModuleActive(UtilCompat.MODULE_MONKS_BLOODSPLATS);
    }
    static isBetterRolltablesActive() {
        return this.isModuleActive(UtilCompat.MODULE_BETTER_ROLLTABLES);
    }
    static isItemPilesActive() {
        return this.isModuleActive(UtilCompat._MODULE_BETTER_ROLLTABLES);
    }
    static isPlutoniumAddonAutomationActive() {
        return this.isModuleActive(UtilCompat.MODULE_PLUTONIUM_ADDON_AUTOMATION);
    }
    static isMidiQolActive() {
        return this.isModuleActive(UtilCompat.MODULE_MIDI_QOL);
    }
    static isModuleMulticlassSpellbookFilterActive() {
        return this.isModuleActive(UtilCompat.MODULE_MULTICLASS_SPELLBOOK_FILTER);
    }
    static isQuickInsertActive() {
        return this.isModuleActive(UtilCompat.MODULE_QUICK_INSERT);
    }
    static isPf2eTokensBestiaryActive() {
        return this.isModuleActive(UtilCompat.MODULE_PF2E_TOKENS_BESTIARIES);
    }
    static isDfredsConvenientEffectsActive() {
        return this.isModuleActive(UtilCompat._MODULE_DFREDS_CONVENIENT_EFFECTS);
    }
    static isLevels3dPreviewActive() {
        return this.isModuleActive(UtilCompat.MODULE_LEVELS_3D_PREVIEW);
    }
    static _isCanvas3dCompendiumActive() {
        return this.isModuleActive(UtilCompat._MODULE_CANVAS_3D_COMPENDIUM);
    }
    static _iCanvas3dTokenCompendiumActive() {
        return this.isModuleActive(UtilCompat._MODULE_CANVAS_3D_TOKEN_COMPENDIUM);
    }
    static isFoundrySummonsActive() {
        return this.isModuleActive(UtilCompat._MODULE_FOUNDRY_SUMMONS);
    }
    static isTokenActionHudActive() {
        return this.isModuleActive(UtilCompat._MODULE_TOKEN_ACTION_HUD) || this.isModuleActive(UtilCompat._MODULE_TOKEN_ACTION_HUD_CORE);
    }
    static isSimpleCalendarActive() {
        return this.isModuleActive(UtilCompat.MODULE_SIMPLE_CALENDAR);
    }

    static isThreeDiTokensActive() {
        return this.isLevels3dPreviewActive() && this._isCanvas3dCompendiumActive() && this._iCanvas3dTokenCompendiumActive();
    }

    static getApi(moduleName) {
        if (!this.isModuleActive(moduleName))
            return null;
        return game.modules.get(moduleName).api;
    }

    static getName(moduleName) {
        if (!this.isModuleActive(moduleName))
            return null;
        return game.modules.get(moduleName).title;
    }

    static isDaeGeneratingArmorEffects() {
        if (!this.isDaeActive())
            return false;
        return !!UtilGameSettings.getSafe(UtilCompat.MODULE_DAE, "calculateArmor");
    }

    static getFeatureFlags({isReaction}) {
        const out = {};

        if (isReaction) {
            out.adnd5e = {
                itemInfo: {
                    type: "reaction"
                }
            };
        }

        return out;
    }

    static MonksLittleDetails = class {
        static isDefeated(token) {
            return ((token.combatant && token.isDefeated) || token.actor?.effects.some(it=>it.statuses.has(CONFIG.specialStatusEffects.DEFEATED)) || token.document.overlayEffect === CONFIG.controlIcons.defeated);
        }
    }
    ;

    static DfredsConvenientEffects = class {
        static getCustomEffectsItemId() {
            return UtilGameSettings.getSafe(UtilCompat._MODULE_DFREDS_CONVENIENT_EFFECTS, "customEffectsItemId");
        }
    }
    ;

    static FoundrySummons = class {
        static getBlankNpcIds() {
            return (UtilGameSettings.getSafe(UtilCompat._MODULE_FOUNDRY_SUMMONS, "blankNPC") || []).map(it=>it?.id).filter(Boolean);
        }
    }
    ;
}
//#endregion
//#region UtilPrePreInit
class UtilPrePreInit {
    static _IS_GM = null;

    static isGM() {
        return UtilPrePreInit._IS_GM = UtilPrePreInit._IS_GM ?? game.data.users.find(it=>it._id === game.userId).role >= CONST.USER_ROLES.ASSISTANT;
    }
}
//#endregion

export {Util, UtilGameSettings, UtilCompat, UtilPrePreInit, UtilHooks, LGT};