class UtilAdvancements {
    static _LevelledEmbeddedDocument = class {
        constructor({embeddedDocument, level}={}) {
            if (level == null)
                throw new Error(`Level must be defined!`);

            this.embeddedDocument = embeddedDocument;
            this.level = level;

            this.advancementId = null;
        }
    }
    ;

    static LevelledEmbeddedDocument_MinLevel0 = class extends this._LevelledEmbeddedDocument {
        constructor({level=0, ...rest}) {
            super({
                level,
                ...rest
            });
        }
    }
    ;

    static LevelledEmbeddedDocument_MinLevel1 = class extends this._LevelledEmbeddedDocument {
        constructor({level=1, ...rest}) {
            super({
                level,
                ...rest
            });
        }
    }
    ;

    static async pAddAdvancementLinks({actor, parentEmbeddedDocument, childLevelledEmbeddedDocuments, }, ) {
        childLevelledEmbeddedDocuments = childLevelledEmbeddedDocuments.filter(it=>it.embeddedDocument);

        if (!parentEmbeddedDocument || !childLevelledEmbeddedDocuments.length)
            return;

        const childrenByLevel = {};
        childLevelledEmbeddedDocuments.forEach(child=>{
            (childrenByLevel[child.level] = (childrenByLevel[child.level] || [])).push(child);
        }
        );

        const newAdvancement = Object.keys(childrenByLevel).map(it=>Number(it)).sort(SortUtil.ascSort).map(level=>{
            const _id = foundry.utils.randomID();
            const childrenAtLevel = childrenByLevel[level];
            childrenAtLevel.forEach(child=>child.advancementId = _id);
            return {
                _id,
                type: "ItemGrant",
                level,
                title: "Features",
                icon: parentEmbeddedDocument.img,
                configuration: {
                    items: [],
                },
                value: {
                    added: childrenAtLevel.mergeMap(it=>({
                        [it.embeddedDocument.id]: ""
                    })),
                },
            };
        }
        );

        const existingAdvancement = MiscUtil.copy(parentEmbeddedDocument.system?.advancement || []);

        const advancementToAdd = newAdvancement.filter(newAdv=>{
            const oldAdv = existingAdvancement.find(it=>it.type === "ItemGrant" && it.level === newAdv.level);
            if (!oldAdv)
                return true;

            if (newAdv?.value?.added) {
                const tgt = MiscUtil.getOrSet(oldAdv, "value", "added", {});
                Object.assign(tgt, newAdv.value.added);
            }

            childrenByLevel[newAdv.level].forEach(child=>child.advancementId = oldAdv._id);

            return false;
        }
        );

        const updatedMetas = await UtilDocuments.pUpdateEmbeddedDocuments(actor, [{
            _id: parentEmbeddedDocument.id,
            system: {
                advancement: [...existingAdvancement, ...advancementToAdd, ],
            },
        }, ], {
            ClsEmbed: Item,
        }, );
        const updatedParentDoc = updatedMetas[0]?.document;
        if (!updatedParentDoc)
            return;

        await UtilDocuments.pUpdateEmbeddedDocuments(actor, childLevelledEmbeddedDocuments.map(child=>({
            _id: child.embeddedDocument.id,
            flags: {
                [SharedConsts.SYSTEM_ID_DND5E]: {
                    advancementOrigin: `${updatedParentDoc.id}.${child.advancementId}`,
                },
            },
        })), {
            ClsEmbed: Item,
        }, );
    }

    static getAdvancementAbilityScoreImprovementVrgr() {
        return {
            _id: foundry.utils.randomID(),
            type: "AbilityScoreImprovement",
            configuration: {
                points: 3,
                fixed: Parser.ABIL_ABVS.mergeMap(abv=>({
                    [abv]: 0
                })),
                cap: 2,
            },
            value: {
                type: "asi"
            },
            level: 0,
            title: "",
        };
    }

    static getAdvancementAbilityScoreImprovement(ability) {
        if (!ability)
            return null;

        if (ability.length !== 1)
            return null;

        const [abil] = ability;

        if (abil.choose?.weighted)
            return null;

        const keysStatic = Parser.ABIL_ABVS.filter(abv=>abil[abv] != null);
        const isChooseFromAny = abil.choose?.from?.length === (6 - keysStatic.length);

        if (abil.choose && !isChooseFromAny)
            return null;

        if (abil.choose?.amount && abil.choose?.amount > 1)
            return null;

        return {
            _id: foundry.utils.randomID(),
            type: "AbilityScoreImprovement",
            configuration: {
                points: abil.choose?.count ?? 1,
                fixed: Parser.ABIL_ABVS.mergeMap(abv=>({
                    [abv]: abil[abv] ?? 0
                })),
                cap: abil.choose ? 1 : 0,
            },
            value: {
                type: "asi"
            },
            level: 0,
            title: "",
        };
    }

    static getAdvancementSize(size, {selectedSize=null}={}) {
        if (!size)
            return null;

        const sizes = size.map(sz=>UtilActors.VET_SIZE_TO_ABV[sz]).filter(Boolean);
        if (!sizes.length)
            return null;

        return {
            _id: foundry.utils.randomID(),
            type: "Size",
            configuration: {
                hint: "",
                sizes,
            },
            value: {
                size: UtilActors.VET_SIZE_TO_ABV[selectedSize] ? UtilActors.VET_SIZE_TO_ABV[selectedSize] : sizes.length === 1 ? sizes[0] : "",
            },
            level: 0,
            title: "",
        };
    }

    static getAdvancementHitPoints({hpAdvancementValue, isActorItem}) {
        if (hpAdvancementValue) {
            return {
                type: "HitPoints",
                value: hpAdvancementValue,
            };
        }

        if (!isActorItem) {
            return {
                type: "HitPoints"
            };
        }

        return null;
    }

    static getAdvancementSaves({savingThrowProficiencies, classRestriction=null, level=0}) {
        if (savingThrowProficiencies?.length !== 1)
            return null;

        const [savingThrowProficiency] = savingThrowProficiencies;

        if (savingThrowProficiency.choose)
            return null;

        const saves = Parser.ABIL_ABVS.filter(abv=>savingThrowProficiency[abv]);
        if (!saves.length)
            return null;

        const grants = saves.map(abv=>`saves:${abv}`);

        return {
            _id: foundry.utils.randomID(),
            type: "Trait",
            configuration: {
                hint: "",
                mode: "default",
                allowReplacements: false,
                grants,
                choices: [],
            },
            level,
            title: "",
            classRestriction,
            value: {
                chosen: grants,
            },
        };
    }

    static getAdvancementSkills({skillProficiencies, classRestriction=null, skillsChosenFvtt=null, level=0}) {
        if (skillProficiencies?.length !== 1)
            return null;

        const [skillProficiency] = skillProficiencies;

        const choicesSkills = (skillProficiency.choose?.from || []).filter(skill=>Parser.SKILL_TO_ATB_ABV[skill]).map(skill=>Parser._parse_bToA(UtilActors.SKILL_ABV_TO_FULL, skill));

        return {
            _id: foundry.utils.randomID(),
            type: "Trait",
            configuration: {
                hint: "",
                mode: "default",
                allowReplacements: false,
                grants: Object.entries(skillProficiency).filter(([k,v])=>Parser.SKILL_TO_ATB_ABV[k] && v).map(([k])=>k).map(skill=>`skills:${Parser._parse_bToA(UtilActors.SKILL_ABV_TO_FULL, skill)}`),
                choices: [choicesSkills.length ? {
                    count: skillProficiency.choose?.count ?? 1,
                    pool: choicesSkills.map(skill=>`skills:${Parser._parse_bToA(UtilActors.SKILL_ABV_TO_FULL, skill)}`),
                } : null, ].filter(Boolean),
            },
            level,
            title: "",
            classRestriction,
            value: skillsChosenFvtt != null ? {
                chosen: skillsChosenFvtt.map(skill=>`skills:${skill}`),
            } : {},
        };
    }
}
export default UtilAdvancements;