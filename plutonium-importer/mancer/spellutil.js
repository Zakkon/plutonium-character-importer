import { DataConverter, UtilDataConverter } from "./dataconverter.js";
class Charactermancer_Spell_Util {
    static getCasterProgressionMeta({casterProgression, curLevel, targetLevel, isBreakpointsOnly=false}) {
        if (casterProgression == null || curLevel == null || targetLevel == null)
            return null;

        const progression = UtilDataConverter.CASTER_TYPE_TO_PROGRESSION[casterProgression];
        if (!progression)
            return null;

        const levelToSpellLevel = [];
        let lastSpellLevel = 0;
        progression.forEach(slots=>{
            let isFound = false;
            for (let i = 0; i < slots.length; ++i) {
                const spellLevel = i + 1;
                if (slots[i] && spellLevel > lastSpellLevel) {
                    levelToSpellLevel.push(spellLevel);
                    lastSpellLevel = spellLevel;
                    isFound = true;
                    break;
                }
            }
            if (!isFound) {
                if (isBreakpointsOnly)
                    levelToSpellLevel.push(null);
                else
                    levelToSpellLevel.push(levelToSpellLevel.length ? levelToSpellLevel.last() : null);
            }
        }
        );

        const spannedLevels = levelToSpellLevel.slice(curLevel, targetLevel).filter(Boolean);
        if (!spannedLevels.length)
            return null;

        const spellLevelLow = Math.min(...spannedLevels);
        const spellLevelHigh = Math.max(...spannedLevels);

        const deltaLevels = Math.max(0, targetLevel - curLevel);
        const deltaSpellLevels = spellLevelHigh - spellLevelLow;

        return {
            spellLevelLow,
            spellLevelHigh,
            deltaLevels,
            deltaSpellLevels,
        };
    }

    static getCasterCantripProgressionMeta({cls, sc, curLevel, targetLevel}) {
        if (cls == null || curLevel == null || targetLevel == null)
            return null;

        const atCurLevel = curLevel === 0 ? 0 : this.getMaxLearnedCantrips({
            cls,
            sc,
            targetLevel: curLevel
        });
        const atTargetLevel = this.getMaxLearnedCantrips({
            cls,
            sc,
            targetLevel: targetLevel
        });
        if (atCurLevel == null || atTargetLevel == null)
            return null;

        const deltaLevels = Math.max(0, targetLevel - curLevel);
        const deltaMaxCantrips = atTargetLevel - atCurLevel;

        return {
            maxCantripsLow: atCurLevel,
            maxCantripsHigh: atTargetLevel,
            deltaLevels,
            deltaMaxCantrips,
        };
    }

    static getMaxLearnedCantrips({cls, sc, targetLevel}) {
        if (!cls || targetLevel == null)
            return null;

        let cantripProgression = DataConverter.getMaxCantripProgression(cls.cantripProgression, sc?.cantripProgression);

        if (PrereleaseUtil.hasSourceJson(cls.source) || (sc && PrereleaseUtil.hasSourceJson(sc.source)))
            cantripProgression = cantripProgression || this._getApproximateCantripProgression({
                cls,
                sc
            });
        if (BrewUtil2.hasSourceJson(cls.source) || (sc && BrewUtil2.hasSourceJson(sc.source)))
            cantripProgression = cantripProgression || this._getApproximateCantripProgression({
                cls,
                sc
            });

        if (!cantripProgression)
            return null;

        return cantripProgression[targetLevel - 1];
    }

    static _getApproximateCantripProgression({cls, sc}) {
        return this._getApproximateNumberCol({
            cls,
            sc,
            colNameLower: "cantrips known"
        });
    }

    static _getApproximateSpellsKnownProgression(cls, sc) {
        return this._getApproximateNumberCol({
            cls,
            sc,
            colNameLower: "spells known"
        });
    }

    static _getApproximateNumberCol({cls, sc, colNameLower}) {
        const tableGroups = (PrereleaseUtil.hasSourceJson(cls.source) ? cls.classTableGroups : null) || ((sc && PrereleaseUtil.hasSourceJson(sc.source)) ? sc?.subclassTableGroups : null) || (BrewUtil2.hasSourceJson(cls.source) ? cls.classTableGroups : null) || ((sc && BrewUtil2.hasSourceJson(sc.source)) ? sc?.subclassTableGroups : null);
        if (!tableGroups)
            return;
        for (const tblGroup of tableGroups) {
            const ixCol = (tblGroup.colLabels || []).findIndex(it=>`${it}`.toLowerCase().includes(colNameLower));
            if (!~ixCol)
                continue;

            const numbers = (tblGroup.rowsSpellProgression || tblGroup.rows || []).map(row=>row.filter((_,ixCell)=>ixCell === ixCol)).flat();

            if (numbers.every(it=>!isNaN(it)))
                return numbers.map(it=>Number(it));
        }
    }

    static getFixedLearnedProgression({cls, sc, targetLevel, isExistingClass, isDefault=false, formDataSlotSelectFromComp}={}) {
        if (targetLevel == null)
            return null;

        const casterProgression = DataConverter.getMaxCasterProgression(cls.casterProgression, sc?.casterProgression);

        if (!casterProgression || !UtilDataConverter.CASTER_TYPE_TO_PROGRESSION[casterProgression])
            return null;

        const totalKnownPerLevel = [...new Array(9)].map(()=>0);

        let isAnyData = false;

        const formDataSlotSelect = (isExistingClass || isDefault) ? Charactermancer_Spell_SlotLevelSelect.getDefaultFormData({
            targetLevel,
            casterProgression,
            spellsKnownProgression: cls?.spellsKnownProgression || sc?.spellsKnownProgression,
            spellsKnownProgressionFixed: cls?.spellsKnownProgressionFixed || sc?.spellsKnownProgressionFixed,
        }) : formDataSlotSelectFromComp;

        if (formDataSlotSelect) {
            isAnyData = isAnyData || formDataSlotSelect?.isAnyData;
            if (formDataSlotSelect?.data)
                formDataSlotSelect.data.forEach((it,i)=>totalKnownPerLevel[i] += it);
        }

        if (cls.spellsKnownProgressionFixedByLevel) {
            isAnyData = true;

            Object.entries(cls.spellsKnownProgressionFixedByLevel).forEach(([lvl,spellSummary])=>{
                if (Number(lvl) > targetLevel)
                    return;

                Object.entries(spellSummary).forEach(([lvlSpell,count])=>{
                    lvlSpell = Number(lvlSpell);
                    totalKnownPerLevel[lvlSpell - 1] += count;
                }
                );
            }
            );
        }

        if (!isAnyData)
            return null;

        return totalKnownPerLevel;
    }

    static getMaxPreparedSpells({cls, sc, targetLevel, existingAbilityScores, abilityScoresFromComp}={}) {
        if (!cls || targetLevel == null)
            return null;

        const casterProgression = DataConverter.getMaxCasterProgression(cls.casterProgression, sc?.casterProgression);

        if (!casterProgression || !UtilDataConverter.CASTER_TYPE_TO_PROGRESSION[casterProgression])
            return null;

        const spellSlotsAtLevel = UtilDataConverter.CASTER_TYPE_TO_PROGRESSION[casterProgression][targetLevel - 1];
        if (!spellSlotsAtLevel)
            return null;

        if (!spellSlotsAtLevel.some(Boolean))
            return null;

        if (cls.preparedSpellsProgression || sc?.preparedSpellsProgression)
            return this._getMaxPreparedSpells_preparedSpellsProgression({
                cls,
                sc,
                targetLevel,
                existingAbilityScores,
                abilityScoresFromComp
            });
        return this._getMaxPreparedSpells_preparedSpells({
            cls,
            sc,
            targetLevel,
            existingAbilityScores,
            abilityScoresFromComp
        });
    }

    static _getMaxPreparedSpells_preparedSpells({cls, sc, targetLevel, existingAbilityScores, abilityScoresFromComp}) {
        let preparedSpellExpression = cls.preparedSpells;

        if ((PrereleaseUtil.hasSourceJson(cls.source) || BrewUtil2.hasSourceJson(cls.source)) && !this._hasWellDefinedSpellData(cls, sc)) {
            preparedSpellExpression = preparedSpellExpression || this._getApproximatePreparedFormula(cls, sc);
        }

        if (!preparedSpellExpression)
            return null;

        const totalsAsi = abilityScoresFromComp;
        const preparedSpellExpressionEvaluable = preparedSpellExpression.replace(/<\$([^$]+)\$>/g, (...m)=>{
            switch (m[1]) {
            case "level":
                return targetLevel;
            case "str_mod":
                return this._getMaxPreparedSpells_getAbilityScore({
                    ability: "str",
                    totalsAsi,
                    existingAbilityScores
                });
            case "dex_mod":
                return this._getMaxPreparedSpells_getAbilityScore({
                    ability: "dex",
                    totalsAsi,
                    existingAbilityScores
                });
            case "con_mod":
                return this._getMaxPreparedSpells_getAbilityScore({
                    ability: "con",
                    totalsAsi,
                    existingAbilityScores
                });
            case "int_mod":
                return this._getMaxPreparedSpells_getAbilityScore({
                    ability: "int",
                    totalsAsi,
                    existingAbilityScores
                });
            case "wis_mod":
                return this._getMaxPreparedSpells_getAbilityScore({
                    ability: "wis",
                    totalsAsi,
                    existingAbilityScores
                });
            case "cha_mod":
                return this._getMaxPreparedSpells_getAbilityScore({
                    ability: "cha",
                    totalsAsi,
                    existingAbilityScores
                });
            default:
                throw new Error(`Unknown variable "${m[1]}"`);
            }
        }
        );

        const outRaw = eval(preparedSpellExpressionEvaluable);
        if (isNaN(outRaw)) {
            console.warn(...LGT, `Could not evaluate expression "${preparedSpellExpressionEvaluable}" (originally "${preparedSpellExpression}") as a number!`);
            return null;
        }

        return Math.max(1, Math.floor(outRaw));
    }

    static _getMaxPreparedSpells_preparedSpellsProgression({cls, sc, targetLevel}) {
        const progression = sc?.preparedSpellsProgression || cls.preparedSpellsProgression;
        return progression[Math.max(0, targetLevel - 1)] || 0;
    }

    static getMaxPreparedSpellsFormula({cls, sc}={}) {
        if (!cls)
            return null;

        const casterProgression = DataConverter.getMaxCasterProgression(cls.casterProgression, sc?.casterProgression);

        if (!casterProgression || !UtilDataConverter.CASTER_TYPE_TO_PROGRESSION[casterProgression])
            return null;

        let preparedSpellExpression = cls.preparedSpells;

        if ((PrereleaseUtil.hasSourceJson(cls.source) || BrewUtil2.hasSourceJson(cls.source)) && !this._hasWellDefinedSpellData(cls, sc)) {
            preparedSpellExpression = preparedSpellExpression || this._getApproximatePreparedFormula(cls, sc);
        }

        if (!preparedSpellExpression)
            return null;

        const preparedSpellExpressionEvaluable = preparedSpellExpression.replace(/<\$([^$]+)\$>/g, (...m)=>{
            switch (m[1]) {
            case "level":
                return `@classes.${Parser.stringToSlug(cls.name)}.levels`;
            case "str_mod":
            case "dex_mod":
            case "con_mod":
            case "int_mod":
            case "wis_mod":
            case "cha_mod":
                return `@abilities.${m[1].toLowerCase().slice(0, 3)}.mod`;
            default:
                throw new Error(`Unknown variable "${m[1]}"`);
            }
        }
        );

        return `max(1, floor(${preparedSpellExpressionEvaluable}))`;
    }

    static _getMaxPreparedSpells_getAbilityScore({totalsAsi, existingAbilityScores, ability}) {
        if (existingAbilityScores)
            return existingAbilityScores[ability] || 0;
        return Parser.getAbilityModNumber(totalsAsi?.totals?.[totalsAsi.mode]?.[ability] || 0);
    }

    static _hasWellDefinedSpellData(cls, sc) {
        return ["cantripProgression", "preparedSpells", "preparedSpellsProgression", "spellsKnownProgression", "spellsKnownProgressionFixed", "spellsKnownProgressionFixedAllowLowerLevel", "spellsKnownProgressionFixedByLevel", ].some(prop=>cls?.[prop] != null || sc?.[prop] != null);
    }

    static _getApproximatePreparedFormula(cls, sc) {
        if (!cls)
            return null;

        const casterProgression = DataConverter.getMaxCasterProgression(cls.casterProgression, sc?.casterProgression);

        if (!casterProgression || (!cls.classTableGroups && !sc?.subclassTableGroups) || casterProgression === "pact")
            return null;

        const hasSpellsKnown = [cls.classTableGroups, sc?.subclassTableGroups].filter(Boolean).some(tableGroups=>{
            tableGroups.map(it=>it.colLabels || []).flat().map(lbl=>Renderer.stripTags(`${lbl}`.trim())).some(it=>{
                const parts = it.toLowerCase().split(/[^a-z0-9]/g).map(it=>it.trim()).filter(Boolean);
                return parts.some(pt=>pt === "spell" || pt === "spells") && parts.some(pt=>pt === "known");
            }
            );
        }
        );

        if (hasSpellsKnown)
            return null;

        return `<$level$> ${casterProgression !== "full" ? `/ 2 ` : ""}+ ${cls.spellcastingAbility ? `<$${cls.spellcastingAbility}_mod$>` : "5"}`;
    }

    static getExistingCasterMeta({cls, sc, actor, targetLevel, formDataSlotSelectFromComp=null, abilityScoresFromComp=null}) {
        if (!targetLevel)
            return null;

        const casterProgression = DataConverter.getMaxCasterProgression(cls?.casterProgression, sc?.casterProgression);
        const casterProgressionMeta = Charactermancer_Spell_Util.getCasterProgressionMeta({
            casterProgression,
            curLevel: 0,
            targetLevel: targetLevel
        });

        return {
            maxLearnedCantrips: this.getMaxLearnedCantrips({
                cls,
                sc,
                targetLevel
            }),
            fixedLearnedProgression: this.getFixedLearnedProgression({
                cls,
                sc,
                targetLevel,
                isExistingClass: true,
                formDataSlotSelectFromComp
            }),
            maxPreparedSpells: this.getMaxPreparedSpells({
                cls,
                sc,
                targetLevel,
                existingAbilityScores: Charactermancer_Util.getCurrentAbilityScores(actor),
                abilityScoresFromComp
            }),
            spellLevelLow: casterProgressionMeta?.spellLevelLow,
            spellLevelLowHigh: casterProgressionMeta?.spellLevelHigh,
        };
    }
}
export {Charactermancer_Spell_Util}