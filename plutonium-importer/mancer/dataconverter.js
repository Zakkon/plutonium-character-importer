import { SideDataInterfaceClass } from "../veTools/dataloader.js";
import { ImageFetcherClass } from "./imagefetcher.js";
import UtilCompendium from "./utilcompendium.js";
import UtilApplications from "./utilapplications.js";
import { UtilEntityGeneric } from "../veTools/utilentity.js";
import { Config, SharedConsts, ConfigConsts } from "../veTools/config.js";
import Vetools from "../veTools/vetools.js";
import { UtilDocumentItem, UtilDocumentSource } from "./utildocument.js";
import { UtilActors } from "./utilactors.js";
import UtilAdvancements from "./utiladvancements.js";
import { Charactermancer_Class_ProficiencyImportModeSelect } from "./mancercomponents.js";
import { Charactermancer_Spell_Util } from "./spellutil.js";

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
        if (!ixs.length)
            return null;
        return this._CASTER_PROGRESSIONS[Math.min(...ixs)];
    }

    static getMaxCantripProgression(...casterProgressions) {
        const out = [];
        casterProgressions.filter(Boolean).forEach(progression=>{
            progression.forEach((cnt,i)=>{
                if (out[i] == null)
                    return out[i] = cnt;
                out[i] = Math.max(out[i], cnt);
            }
            );
        }
        );
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


class DataConverterClass extends DataConverter {
    static _configGroup = "importClass";

    static _SideDataInterface = SideDataInterfaceClass;
    static _ImageFetcher = ImageFetcherClass;

    static _getDoNotUseNote() {
        return UtilDataConverter.pGetWithDescriptionPlugins(()=>`<p>${Renderer.get().render(`{@note Note: importing a class as an item is provided for display purposes only. If you wish to import a class to a character sheet, please use the importer on the sheet instead.}`)}</p>`);
    }

    static _getDataHitDice(cls) {
        if (cls.hd?.number !== 1)
            return null;
        if (!cls.hd?.faces)
            return null;

        const asString = `d${cls.hd.faces}`;
        if (!CONFIG.DND5E.hitDieTypes.includes(asString))
            return null;
        return asString;
    }

    static async pGetClassItem(cls, opts) {
        opts = opts || {};
        if (opts.actor)
            opts.isActorItem = true;

        Renderer.get().setFirstSection(true).resetHeaderIndex();

        const itemId = foundry.utils.randomID();

        if (!opts.isClsDereferenced) {
            cls = await DataLoader.pCacheAndGet("class", cls.source, UrlUtil.URL_TO_HASH_BUILDER["class"](cls), {
                isRequired: true
            });
        }

        if (opts.pageFilter?.filterBox && opts.filterValues) {
            cls = MiscUtil.copy(cls);

            Renderer.class.mutFilterDereferencedClassFeatures({
                cpyCls: cls,
                pageFilter: opts.pageFilter,
                filterValues: opts.filterValues,
            });
        }

        const srdData = await UtilCompendium.getSrdCompendiumEntity("class", cls, {
            taskRunner: opts.taskRunner
        });

        const {name: translatedName, description: translatedDescription, flags: translatedFlags} = this._getTranslationMeta({
            translationData: this._getTranslationData({
                srdData
            }),
            name: UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(cls, {
                isActorItem: opts.isActorItem
            })),
            description: await this._pGetClassDescription(cls, opts),
        });

        const identifierCls = UtilDocumentItem.getNameAsIdentifier(cls.name);

        const img = await this._ImageFetcher.pGetSaveImagePath(cls, {
            propCompendium: "class",
            taskRunner: opts.taskRunner
        });

        const hitDice = this._getDataHitDice(cls);

        const additionalData = await this._SideDataInterface.pGetDataSideLoaded(cls);
        const additionalFlags = await this._SideDataInterface.pGetFlagsSideLoaded(cls);
        const additionalAdvancement = await this._SideDataInterface._pGetAdvancementSideLoaded(cls);

        const effectsSideTuples = await this._SideDataInterface.pGetEffectsSideLoadedTuples({
            ent: cls,
            img,
            actor: opts.actor
        });
        effectsSideTuples.forEach(({effect, effectRaw})=>DataConverter.mutEffectDisabledTransfer(effect, "importClass", UtilActiveEffects.getDisabledTransferHintsSideData(effectRaw)));

        const out = {
            id: itemId,
            _id: itemId,
            name: translatedName,
            type: "class",
            system: {
                identifier: identifierCls,
                description: {
                    value: translatedDescription,
                    chat: "",
                    unidentified: ""
                },
                source: UtilDocumentSource.getSourceObjectFromEntity(cls),
                levels: opts.level ?? 1,
                hitDice,
                hitDiceUsed: 0,
                spellcasting: {
                    progression: UtilActors.getMappedCasterType(cls.casterProgression) || cls.casterProgression,
                    ability: cls.spellcastingAbility,
                },
                advancement: [...(srdData?.system?.advancement || []).filter(it=>it.type === "ScaleValue"), ...this._getClassAdvancement(cls, opts), ...(additionalAdvancement || []), ],

                ...additionalData,
            },
            ownership: {
                default: 0
            },
            flags: {
                ...translatedFlags,
                ...this._getClassSubclassFlags({
                    cls,
                    filterValues: opts.filterValues,
                    proficiencyImportMode: opts.proficiencyImportMode,
                    isActorItem: opts.isActorItem,
                    spellSlotLevelSelection: opts.spellSlotLevelSelection,
                }),
                ...additionalFlags,
            },
            effects: DataConverter.getEffectsMutDedupeId([await this._pGetPreparedSpellsEffect({
                cls,
                actorId: opts.actor?.id,
                itemId,
                existing: this._getExistingPreparedSpellsEffect({
                    actor: opts.actor
                }),
                taskRunner: opts.taskRunner,
            }), ...effectsSideTuples.map(it=>it.effect), ].filter(Boolean), ),
            img,
        };

        this._mutApplyDocOwnership(out, opts);

        return out;
    }

    static async _pGetClassDescription(cls, opts) {
        const ptDoNotUse = !opts.isActorItem ? await this._getDoNotUseNote() : "";

        const ptTable = await UtilDataConverter.pGetWithDescriptionPlugins(()=>this.pGetRenderedClassTable(cls));

        const ptFluff = cls?.fluff?.length ? await UtilDataConverter.pGetWithDescriptionPlugins(()=>Renderer.get().setFirstSection(true).render({
            type: cls.fluff[0].type || "section",
            entries: cls.fluff[0].entries || []
        })) : "";

        const ptFeatures = !opts.isActorItem ? await UtilDataConverter.pGetWithDescriptionPlugins(()=>Renderer.get().setFirstSection(true).render({
            type: "section",
            entries: cls.classFeatures.flat()
        })) : "";

        if (!Config.get("importClass", "isImportDescription"))
            return `<div class="mb-2 ve-flex-col">${ptDoNotUse}${ptTable}</div>`;

        return `<div class="mb-2 ve-flex-col">${ptDoNotUse}${ptTable}${ptFluff}${ptFeatures}</div>`;
    }

    static _getClassAdvancement(cls, opts) {
        return [...this._getClassAdvancement_hitPoints(cls, opts), ...this._getClassAdvancement_saves(cls, opts), ...this._getClassAdvancement_skills(cls, opts), ];
    }

    static _getClassAdvancement_hitPoints(cls, opts) {
        const hitDice = this._getDataHitDice(cls);
        if (hitDice == null)
            return [];

        const advancement = UtilAdvancements.getAdvancementHitPoints({
            hpAdvancementValue: opts.hpAdvancementValue,
            isActorItem: opts.isActorItem,
        });
        if (advancement == null)
            return [];

        return [advancement];
    }

    static _getClassAdvancement_saves(cls, opts) {
        const saves = (cls.proficiency || []).filter(it=>Parser.ATB_ABV_TO_FULL[it]);
        if (!saves.length)
            return [];

        const advancement = UtilAdvancements.getAdvancementSaves({
            savingThrowProficiencies: [saves.mergeMap(abv=>({
                [abv]: true
            }))],
            classRestriction: "primary",
            level: 1,
        });
        if (advancement == null)
            return [];

        return [advancement];
    }

    static _getClassAdvancement_skills(cls, opts) {
        return [UtilAdvancements.getAdvancementSkills({
            skillProficiencies: cls.startingProficiencies?.skills,
            classRestriction: "primary",
            skillsChosenFvtt: opts.proficiencyImportMode === Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY ? opts.startingSkills : null,
            level: 1,
        }), UtilAdvancements.getAdvancementSkills({
            skillProficiencies: cls.multiclassing?.proficienciesGained?.skills,
            classRestriction: "secondary",
            skillsChosenFvtt: opts.proficiencyImportMode === Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS ? opts.startingSkills : null,
            level: 1,
        }), ].filter(Boolean);
    }

    static _getClassSubclassFlags({cls, sc, filterValues, proficiencyImportMode, isActorItem, spellSlotLevelSelection}) {
        const out = {
            [SharedConsts.MODULE_ID]: {
                page: UrlUtil.PG_CLASSES,
                source: sc ? sc.source : cls.source,
                hash: sc ? UrlUtil.URL_TO_HASH_BUILDER["subclass"](sc) : UrlUtil.URL_TO_HASH_BUILDER["class"](cls),

                propDroppable: sc ? "subclass" : "class",
                filterValues,

                isPrimaryClass: proficiencyImportMode === Charactermancer_Class_ProficiencyImportModeSelect.MODE_PRIMARY,

                spellSlotLevelSelection,
            },
        };

        if (isActorItem)
            out[SharedConsts.MODULE_ID].isDirectImport = true;

        return out;
    }

    static _getAllSkillChoices(skillProfs) {
        const allSkills = new Set();

        skillProfs.forEach(skillProfGroup=>{
            Object.keys(Parser.SKILL_TO_ATB_ABV).filter(skill=>skillProfGroup[skill]).forEach(skill=>allSkills.add(skill));

            if (skillProfGroup.choose?.from?.length) {
                skillProfGroup.choose.from.filter(skill=>Parser.SKILL_TO_ATB_ABV[skill]).forEach(skill=>allSkills.add(skill));
            }
        }
        );

        return Object.entries(UtilActors.SKILL_ABV_TO_FULL).filter(([,vetKey])=>allSkills.has(vetKey)).map(([fvttKey])=>fvttKey);
    }

    static async pGetSubclassItem(cls, sc, opts) {
        opts = opts || {};
        if (opts.actor)
            opts.isActorItem = true;

        Renderer.get().setFirstSection(true).resetHeaderIndex();

        const itemId = foundry.utils.randomID();

        if (!opts.isScDereferenced) {
            sc = await DataLoader.pCacheAndGet("subclass", sc.source, UrlUtil.URL_TO_HASH_BUILDER["subclass"](sc));
        }

        if (opts.pageFilter?.filterBox && opts.filterValues) {
            sc = MiscUtil.copy(sc);

            Renderer.class.mutFilterDereferencedSubclassFeatures({
                cpySc: sc,
                pageFilter: opts.pageFilter,
                filterValues: opts.filterValues,
            });
        }

        const srdData = await UtilCompendium.getSrdCompendiumEntity("subclass", sc, {
            taskRunner: opts.taskRunner
        });

        const {name: translatedName, description: translatedDescription, flags: translatedFlags} = this._getTranslationMeta({
            translationData: this._getTranslationData({
                srdData
            }),
            name: UtilApplications.getCleanEntityName(UtilDataConverter.getNameWithSourcePart(sc, {
                isActorItem: opts.isActorItem
            })),
            description: await this._pGetSubclassDescription(cls, sc, opts),
        });

        const identifierCls = UtilDocumentItem.getNameAsIdentifier(cls.name);
        const identifierSc = UtilDocumentItem.getNameAsIdentifier(sc.name);

        const imgMetaSc = await this._ImageFetcher.pGetSaveImagePathMeta(sc, {
            propCompendium: "subclass",
            taskRunner: opts.taskRunner
        });
        const imgMetaCls = (Config.get("importClass", "isUseDefaultSubclassImage") || (imgMetaSc && !imgMetaSc.isFallback)) ? null : await this._ImageFetcher.pGetSaveImagePathMeta(cls, {
            propCompendium: "class",
            taskRunner: opts.taskRunner
        });

        const img = (imgMetaSc && !imgMetaSc.isFallback) ? imgMetaSc.img : imgMetaCls && !imgMetaCls.isFallback ? imgMetaCls.img : (imgMetaSc?.img || imgMetaCls.img);

        const additionalData = await this._SideDataInterface.pGetDataSideLoaded(sc, {
            propOpts: "_SIDE_LOAD_OPTS_SUBCLASS"
        });
        const additionalFlags = await this._SideDataInterface.pGetFlagsSideLoaded(sc, {
            propOpts: "_SIDE_LOAD_OPTS_SUBCLASS"
        });
        const additionalAdvancement = await this._SideDataInterface._pGetAdvancementSideLoaded(sc, {
            propOpts: "_SIDE_LOAD_OPTS_SUBCLASS"
        });

        const effectsSideTuples = await this._SideDataInterface.pGetEffectsSideLoadedTuples({
            ent: sc,
            img,
            actor: opts.actor
        }, {
            propOpts: "_SIDE_LOAD_OPTS_SUBCLASS"
        });
        effectsSideTuples.forEach(({effect, effectRaw})=>DataConverter.mutEffectDisabledTransfer(effect, "importClass", UtilActiveEffects.getDisabledTransferHintsSideData(effectRaw)));

        const out = {
            id: itemId,
            _id: itemId,
            name: translatedName,
            type: "subclass",
            system: {
                identifier: identifierSc,
                classIdentifier: identifierCls,
                description: {
                    value: translatedDescription,
                    chat: "",
                    unidentified: ""
                },
                source: UtilDocumentSource.getSourceObjectFromEntity(sc),
                spellcasting: {
                    progression: UtilActors.getMappedCasterType(sc.casterProgression) || sc.casterProgression,
                    ability: sc.spellcastingAbility,
                },
                advancement: [...(srdData?.system?.advancement || []).filter(it=>it.type === "ScaleValue"), ...(additionalAdvancement || []), ],

                ...additionalData,
            },
            ownership: {
                default: 0
            },
            flags: {
                ...translatedFlags,
                ...this._getClassSubclassFlags({
                    cls,
                    sc,
                    filterValues: opts.filterValues,
                    proficiencyImportMode: opts.proficiencyImportMode,
                    isActorItem: opts.isActorItem,
                }),
                ...additionalFlags,
            },
            effects: DataConverter.getEffectsMutDedupeId([await this._pGetPreparedSpellsEffect({
                cls,
                sc,
                actorId: opts.actor?.id,
                itemId,
                existing: this._getExistingPreparedSpellsEffect({
                    actor: opts.actor
                }),
                taskRunner: opts.taskRunner,
            }), ...effectsSideTuples.map(it=>it.effect), ].filter(Boolean), ),
            img,
        };

        this._mutApplyDocOwnership(out, opts);

        return out;
    }

    static async _pGetSubclassDescription(cls, sc, opts) {
        const ptDoNotUse = !opts.isActorItem ? await this._getDoNotUseNote() : "";

        const fluff = MiscUtil.copy(Renderer.findEntry(sc.subclassFeatures || {}));

        const cleanEntries = MiscUtil.getWalker({
            keyBlocklist: MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST
        }).walk(MiscUtil.copy(fluff.entries), {
            array: (arr)=>{
                return arr.filter(it=>!it?.data?.isFvttSyntheticFeatureLink);
            }
            ,
        }, );

        const ptFluff = opts.isActorItem ? Renderer.get().setFirstSection(true).render({
            type: "entries",
            entries: cleanEntries
        }) : "";

        const ptFeatures = !opts.isActorItem ? await UtilDataConverter.pGetWithDescriptionPlugins(()=>Renderer.get().setFirstSection(true).render({
            type: "section",
            entries: sc.subclassFeatures.flat()
        })) : "";

        if (!Config.get("importClass", "isImportDescription"))
            return `<div class="mb-2 ve-flex-col">${ptDoNotUse}</div>`;

        return `<div class="mb-2 ve-flex-col">${ptDoNotUse}${ptFluff}${ptFeatures}</div>`;
    }

    static async pGetRenderedClassTable(cls, sc, opts={}) {
        if (!Config.get("importClass", "isImportClassTable"))
            return "";

        return UtilDataConverter.pGetWithDescriptionPlugins(async()=>{
            cls = await DataLoader.pCacheAndGet("class", cls.source, UrlUtil.URL_TO_HASH_BUILDER["class"](cls));

            if (sc) {
                sc = await DataLoader.pCacheAndGet("subclass", sc.source, UrlUtil.URL_TO_HASH_BUILDER["subclass"](sc));
            }

            return this.getRenderedClassTableFromDereferenced(cls, sc, opts);
        }
        );
    }

    static getRenderedClassTableFromDereferenced(cls, sc, {isAddHeader=false, isSpellsOnly=false}={}) {
        if (!cls)
            return "";

        return Vetools.withUnpatchedDiceRendering(()=>{
            Renderer.get().setFirstSection(true).resetHeaderIndex();

            const tblGroupHeaders = [];
            const tblHeaders = [];

            const renderTableGroupHeader = (tableGroup)=>{
                let thGroupHeader;
                if (tableGroup.title) {
                    thGroupHeader = `<th class="cls-tbl__col-group" colspan="${tableGroup.colLabels.length}">${tableGroup.title}</th>`;
                } else {
                    thGroupHeader = `<th colspan="${tableGroup.colLabels.length}"></th>`;
                }
                tblGroupHeaders.push(thGroupHeader);

                tableGroup.colLabels.forEach(lbl=>{
                    tblHeaders.push(`<th class="cls-tbl__col-generic-center"><div class="cls__squash_header">${Renderer.get().render(lbl)}</div></th>`);
                }
                );
            }
            ;

            if (cls.classTableGroups) {
                cls.classTableGroups.forEach(tableGroup=>{
                    if (isSpellsOnly)
                        tableGroup = this._getRenderedClassTableFromDereferenced_getSpellsOnlyTableGroup(tableGroup);
                    if (!tableGroup)
                        return;
                    renderTableGroupHeader(tableGroup);
                }
                );
            }

            if (sc?.subclassTableGroups) {
                sc.subclassTableGroups.forEach(tableGroup=>{
                    if (isSpellsOnly)
                        tableGroup = this._getRenderedClassTableFromDereferenced_getSpellsOnlyTableGroup(tableGroup);
                    if (!tableGroup)
                        return;
                    renderTableGroupHeader(tableGroup);
                }
                );
            }

            const tblRows = cls.classFeatures.map((lvlFeatures,ixLvl)=>{
                const pb = Math.ceil((ixLvl + 1) / 4) + 1;

                const lvlFeaturesFilt = lvlFeatures.filter(it=>it.name && it.type !== "inset");
                const dispsFeatures = lvlFeaturesFilt.map((it,ixFeature)=>`<div class="inline-block">${it.name}${ixFeature === lvlFeaturesFilt.length - 1 ? "" : `<span class="mr-1">,</span>`}</div>`);

                const ptTableGroups = [];

                const renderTableGroupRow = (tableGroup)=>{
                    const row = (tableGroup.rowsSpellProgression || tableGroup.rows)[ixLvl] || [];
                    const cells = row.map(cell=>`<td class="cls-tbl__col-generic-center">${cell === 0 ? "\u2014" : Renderer.get().render(cell)}</td>`);
                    ptTableGroups.push(...cells);
                }
                ;

                if (cls.classTableGroups) {
                    cls.classTableGroups.forEach(tableGroup=>{
                        if (isSpellsOnly)
                            tableGroup = this._getRenderedClassTableFromDereferenced_getSpellsOnlyTableGroup(tableGroup);
                        if (!tableGroup)
                            return;
                        renderTableGroupRow(tableGroup);
                    }
                    );
                }

                if (sc?.subclassTableGroups) {
                    sc.subclassTableGroups.forEach(tableGroup=>{
                        if (isSpellsOnly)
                            tableGroup = this._getRenderedClassTableFromDereferenced_getSpellsOnlyTableGroup(tableGroup);
                        if (!tableGroup)
                            return;
                        renderTableGroupRow(tableGroup);
                    }
                    );
                }

                return `<tr class="cls-tbl__stripe-odd">
					<td class="cls-tbl__col-level">${Parser.getOrdinalForm(ixLvl + 1)}</td>
					${isSpellsOnly ? "" : `<td class="cls-tbl__col-prof-bonus">+${pb}</td>`}
					${isSpellsOnly ? "" : `<td>${dispsFeatures.join("") || `\u2014`}</td>`}
					${ptTableGroups.join("")}
				</tr>`;
            }
            );

            return `<table class="cls-tbl shadow-big w-100 mb-3">
				<tbody>
				<tr><th class="border" colspan="15"></th></tr>
				${isAddHeader ? `<tr><th class="cls-tbl__disp-name" colspan="15">${cls.name}</th></tr>` : ""}
				<tr>
					<th colspan="${isSpellsOnly ? "1" : "3"}"></th>
					${tblGroupHeaders.join("")}
				</tr>
				<tr>
					<th class="cls-tbl__col-level">Level</th>
					${isSpellsOnly ? "" : `<th class="cls-tbl__col-prof-bonus">Proficiency Bonus</th>`}
					${isSpellsOnly ? "" : `<th>Features</th>`}
					${tblHeaders.join("")}
				</tr>
				${tblRows.join("")}
				<tr><th class="border" colspan="15"></th></tr>
				</tbody>
			</table>`;
        }
        );
    }

    static _getRenderedClassTableFromDereferenced_getSpellsOnlyTableGroup(tableGroup) {
        tableGroup = MiscUtil.copy(tableGroup);

        if (/spell/i.test(`${tableGroup.title || ""}`))
            return tableGroup;

        if (!tableGroup.colLabels)
            return null;

        const ixsSpellLabels = new Set(tableGroup.colLabels.map((it,ix)=>{
            const stripped = Renderer.stripTags(`${it || ""}`);
            return /cantrip|spell|slot level/i.test(stripped) ? ix : null;
        }
        ).filter(ix=>ix != null));

        if (!ixsSpellLabels.size)
            return null;

        tableGroup.colLabels = tableGroup.colLabels.filter((_,ix)=>ixsSpellLabels.has(ix));
        if (tableGroup.rowsSpellProgression)
            tableGroup.rowsSpellProgression = tableGroup.rowsSpellProgression.map(row=>row.filter((_,ix)=>ixsSpellLabels.has(ix)));
        if (tableGroup.rows)
            tableGroup.rows = tableGroup.rows.map(row=>row.filter((_,ix)=>ixsSpellLabels.has(ix)));

        return tableGroup;
    }

    static _getExistingPreparedSpellsEffect({actor}) {
        if (!actor)
            return null;
        return actor.effects.contents.find(it=>(it.name || "").toLowerCase().trim() === "prepared spells");
    }

    static async _pGetPreparedSpellsEffect({cls, sc, actorId, itemId, existing, taskRunner}) {
        if (existing)
            return null;
        if (sc && !sc.preparedSpells)
            return null;
        if (!sc && !cls.preparedSpells)
            return null;

        const spellsPreparedFormula = Charactermancer_Spell_Util.getMaxPreparedSpellsFormula({
            cls,
            sc
        });
        if (!spellsPreparedFormula)
            return null;

        if (game)
            return null;

        return UtilActiveEffects.getGenericEffect({
            key: `flags.${UtilCompat.MODULE_TIDY5E_SHEET}.maxPreparedSpells`,
            value: spellsPreparedFormula,
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            name: `Prepared Spells`,
            icon: await this._ImageFetcher.pGetSaveImagePath(cls, {
                propCompendium: "class",
                taskRunner
            }),
            disabled: false,
            priority: UtilActiveEffects.PRIORITY_BASE,
            originActorId: actorId,
            originActorItemId: itemId,
        });
    }

    static isStubClass(cls) {
        if (!cls)
            return false;
        return cls.name === DataConverterClass.STUB_CLASS.name && cls.source === DataConverterClass.STUB_CLASS.source;
    }

    static isStubSubclass(sc) {
        if (!sc)
            return false;
        return sc.name === DataConverterClass.STUB_SUBCLASS.name && sc.source === DataConverterClass.STUB_SUBCLASS.source;
    }

    static getClassStub() {
        const out = MiscUtil.copy(DataConverterClass.STUB_CLASS);
        out.subclasses = [{
            ...MiscUtil.copy(DataConverterClass.STUB_SUBCLASS),
            className: out.name,
            classSource: out.source,
        }, ];
        return out;
    }

    static getSubclassStub({cls}) {
        const out = MiscUtil.copy(DataConverterClass.STUB_SUBCLASS);
        out.className = cls.name;
        out.classSource = cls.source;
        return out;
    }
}

DataConverterClass.STUB_CLASS = {
    name: "Unknown Class",
    source: Parser.SRC_PHB,
    classFeatures: [],
    _isStub: true,
};
DataConverterClass.STUB_SUBCLASS = {
    name: "Unknown Subclass",
    source: Parser.SRC_PHB,
    subclassFeatures: [],
    _isStub: true,
};

class UtilDataConverter {
    static getNameWithSourcePart(ent, {displayName=null, isActorItem=false}={}) {
        return `${displayName || `${ent.type === "variant" ? "Variant: " : ""}${Renderer.stripTags(UtilEntityGeneric.getName(ent))}`}${!isActorItem && ent.source && Config.get("import", "isAddSourceToName") ? ` (${Parser.sourceJsonToAbv(ent.source)})` : ""}`;
    }

    static async pGetItemWeaponType(uid) {
        uid = uid.toLowerCase().trim();

        if (UtilDataConverter.WEAPONS_MARTIAL.includes(uid))
            return "martial";
        if (UtilDataConverter.WEAPONS_SIMPLE.includes(uid))
            return "simple";

        let[name,source] = Renderer.splitTagByPipe(uid);
        source = source || "phb";
        const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS]({
            name,
            source
        });

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

export {DataConverter, DataConverterClass, UtilDataConverter}