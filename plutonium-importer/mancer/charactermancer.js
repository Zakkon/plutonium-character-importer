import { PageFilterClassesFoundry } from "../veTools/pagefilters.js";
import { Consts } from "../veTools/config.js";

class Charactermancer_Class_Util {
    /**return all features from a class (UID string format, except for gainSubclass features, which are objects with properties)*/
    static getAllFeatures(cls) {
        let allFeatures = [];
        const seenSubclassFeatureHashes = new Set();

        const gainSubclassFeatureLevels = cls.classFeatures.filter(it=>it.gainSubclassFeature).map(cf=>cf.level ??
            DataUtil.class.unpackUidClassFeature(cf.classFeature || cf).level);

        cls.classFeatures.forEach(cf=>{
            allFeatures.push(cf);

            const cfLevel = cf.level ?? DataUtil.class.unpackUidClassFeature(cf.classFeature || cf).level;
            const nxtCfLevel = gainSubclassFeatureLevels.includes(cfLevel) ? gainSubclassFeatureLevels[gainSubclassFeatureLevels.indexOf(cfLevel) + 1] : null;

            cls.subclasses.forEach(sc=>{
                sc.subclassFeatures.filter(scf=>{
                    const scfHash = scf.hash ?? DataUtil.class.unpackUidSubclassFeature(scf.subclassFeature || scf).hash;
                    const scfLevel = scf.level ?? DataUtil.class.unpackUidSubclassFeature(scf.subclassFeature || scf).level;

                    if (seenSubclassFeatureHashes.has(scfHash))
                        return false;

                    if (scf.isGainAtNextFeatureLevel) {
                        if (!cf.gainSubclassFeature)
                            return false;

                        if (cfLevel === gainSubclassFeatureLevels[0] && scfLevel <= cfLevel)
                            return true;

                        if (scfLevel <= cfLevel && (nxtCfLevel == null || scfLevel < nxtCfLevel))
                            return true;

                        return false;
                    }

                    return scfLevel === cfLevel;
                }
                ).forEach(scf=>{
                    const scfHash = scf.hash ?? DataUtil.class.unpackUidSubclassFeature(scf.subclassFeature || scf).hash;
                    seenSubclassFeatureHashes.add(scfHash);

                    scf.level = cfLevel;

                    allFeatures.push(scf);
                }
                );
            }
            );
        }
        );

        return MiscUtil.copy(allFeatures);
    }

    static isClassEntryFilterMatch(entry, pageFilter, filterValues) {
        const source = entry.source;
        const options = entry.isClassFeatureVariant ? {isClassFeatureVariant: true} : null;

        if (pageFilter.filterBox) {
            return pageFilter.filterBox.toDisplayByFilters(filterValues, ...[{
                filter: pageFilter.sourceFilter, value: source, }, pageFilter.optionsFilter ? {
                filter: pageFilter.optionsFilter,
                value: options,
            } : null, ].filter(Boolean), );
        }

        return pageFilter.sourceFilter.toDisplay(filterValues, source) && (!pageFilter.optionsFilter
            || pageFilter.optionsFilter.toDisplay(filterValues, options));
    }

    static getFilteredEntries_bySource(entries, pageFilter, filterValues) {
        const isDisplayableEntry = ({entry, filterValues, pageFilter})=>{
            if (!entry.source){return true;}

            return this.isClassEntryFilterMatch(entry, pageFilter, filterValues);
        };

        return this._getFilteredEntries({
            entries,
            pageFilter,
            filterValues,
            fnIsDisplayableEntry: isDisplayableEntry,
        }, );
    }
    static _getFilteredEntries({entries, pageFilter, filterValues, fnIsDisplayableEntry, }, ) {
        const recursiveFilter = (entry)=>{
            if (entry == null)
                return entry;
            if (typeof entry !== "object")
                return entry;

            if (entry instanceof Array) {
                entry = entry.filter(it=>fnIsDisplayableEntry({
                    entry: it, pageFilter, filterValues, }));

                return entry.map(it=>recursiveFilter(it));
            }

            Object.keys(entry).forEach(k=>{
                if (entry[k]instanceof Array) {
                    entry[k] = recursiveFilter(entry[k]);
                    if (!entry[k].length)
                        delete entry[k];
                } else
                    entry[k] = recursiveFilter(entry[k]);
            }
            );
            return entry;
        };

        entries = MiscUtil.copy(entries);
        return recursiveFilter(entries);
    }

    static async pGetPreparableSpells(spells, cls, spellLevelLow, spellLevelHigh) {
        Renderer.spell.populatePrereleaseLookup(await PrereleaseUtil.pGetBrewProcessed(), {
            isForce: true
        });
        Renderer.spell.populateBrewLookup(await BrewUtil2.pGetBrewProcessed(), {
            isForce: true
        });

        return spells.filter(it=>{
            if (!(it.level > 0 && it.level >= spellLevelLow && it.level <= spellLevelHigh))
                return false;

            Renderer.spell.uninitBrewSources(it);
            Renderer.spell.initBrewSources(it);

            const fromClassList = Renderer.spell.getCombinedClasses(it, "fromClassList");
            return fromClassList.some(c=>(c.name || "").toLowerCase() === cls.name.toLowerCase() && (c.source || Parser.SRC_PHB).toLowerCase() === cls.source.toLowerCase());
        }
        );
    }

    static getCasterProgression(cls, sc, {targetLevel, otherExistingClassItems=null, otherExistingSubclassItems=null}) {
        otherExistingClassItems = otherExistingClassItems || [];
        otherExistingSubclassItems = otherExistingSubclassItems || [];

        const isSpellcastingMulticlass = [...otherExistingClassItems.filter(it=>it.system?.spellcasting && it.system?.spellcasting !== "none"), ...otherExistingSubclassItems.filter(it=>it.system?.spellcasting && it.system?.spellcasting !== "none"), cls.casterProgression != null || sc?.casterProgression != null, ].filter(Boolean).length > 1;

        let {totalSpellcastingLevels, casterClassCount, maxPactCasterLevel, } = UtilActors.getActorSpellcastingInfo({
            sheetItems: [...otherExistingClassItems, ...otherExistingSubclassItems],
            isForceSpellcastingMulticlass: isSpellcastingMulticlass,
        });

        maxPactCasterLevel = Math.max(maxPactCasterLevel, targetLevel);

        const casterProgression = sc?.casterProgression || cls.casterProgression;
        const spellAbility = sc?.spellcastingAbility || cls.spellcastingAbility;

        if (casterProgression) {
            const fnRound = casterClassCount ? Math.floor : Math.ceil;
            switch (casterProgression) {
            case "full":
                totalSpellcastingLevels += targetLevel;
                break;
            case "1/2":
                totalSpellcastingLevels += fnRound(targetLevel / 2);
                break;
            case "1/3":
                totalSpellcastingLevels += fnRound(targetLevel / 3);
                break;
            }
        }

        return {
            casterProgression,
            spellAbility,
            totalSpellcastingLevels,
            maxPactCasterLevel,
        };
    }

    static getMysticProgression({cls=null, targetLevel=0, otherExistingClassItems=null, otherExistingSubclassItems=null}) {
        otherExistingClassItems = otherExistingClassItems || [];
        otherExistingSubclassItems = otherExistingSubclassItems || [];
        let totalMysticLevels = 0;

        if (cls?.name === "Mystic" && cls?.source === Parser.SRC_UATMC)
            totalMysticLevels += targetLevel;

        if (otherExistingClassItems) {
            totalMysticLevels += otherExistingClassItems.filter(it=>it.name.toLowerCase().trim() === "mystic").map(it=>it.system.levels).sum();
        }

        return {
            totalMysticLevels,
        };
    }

    static addFauxOptionalFeatureFeatures(classList, optfeatList) {
        for (const cls of classList) {
            if (cls.classFeatures && cls.optionalfeatureProgression?.length) {
                for (const optFeatProgression of cls.optionalfeatureProgression) {
                    this._addFauxOptionalFeatureFeatures_handleClassProgression(optfeatList, cls, null, optFeatProgression, );
                }
            }

            for (const sc of cls.subclasses) {
                if (sc.subclassFeatures && sc.optionalfeatureProgression?.length) {
                    for (const optFeatProgression of sc.optionalfeatureProgression) {
                        this._addFauxOptionalFeatureFeatures_handleClassProgression(optfeatList, cls, sc, optFeatProgression, );
                    }
                }
            }
        }
    }

    static _addFauxOptionalFeatureFeatures_handleClassProgression(optfeatList, cls, sc, optFeatProgression) {
        const fauxLoadeds = this._addFauxOptionalFeatureFeatures_getLoadeds(optfeatList, cls, optFeatProgression);

        let progression = optFeatProgression.progression;
        if (!(progression instanceof Array)) {
            if (progression["*"]) {
                progression = MiscUtil.copy(progression);
                progression[1] = progression["*"];
            }

            const populated = new Set(Object.keys(progression).map(it=>Number(it)).sort(SortUtil.ascSort));
            const nxt = [];
            const lvlMax = Math.max(...populated, Consts.CHAR_MAX_LEVEL);
            for (let i = 0; i < lvlMax; ++i) {
                nxt[i] = populated.has(i + 1) ? progression[i + 1] : nxt.length ? nxt.last() : 0;
            }
            progression = nxt;
        }

        let required = optFeatProgression.required;
        if (required && !(required instanceof Array)) {
            const populated = new Set(Object.keys(required).map(it=>Number(it)).sort(SortUtil.ascSort));
            const nxt = [];
            const lvlMax = Math.max(...populated, Consts.CHAR_MAX_LEVEL);
            for (let i = 0; i < lvlMax; ++i) {
                nxt[i] = populated.has(i + 1) ? required[i + 1] : [];
            }
            required = nxt;
        }

        const propFeatures = sc ? "subclassFeatures" : "classFeatures";
        const propFeature = sc ? "subclassFeature" : "classFeature";
        const fnUnpackUidFeature = sc ? DataUtil.class.unpackUidSubclassFeature : DataUtil.class.unpackUidClassFeature;

        let cntPrev = 0;
        progression.forEach((cntOptFeats,ixLvl)=>{
            if (cntOptFeats === cntPrev)
                return;
            const cntDelta = cntOptFeats - cntPrev;
            if (!~cntDelta)
                return;
            const lvl = ixLvl + 1;
            const requiredUidsUnpacked = (required?.[ixLvl] || []).map(it=>DataUtil.proxy.unpackUid("optionalfeature", it, "optfeature", {
                isLower: true
            }));

            const feature = this._addFauxOptionalFeatureFeatures_getFauxFeature(cls, sc, optFeatProgression, lvl, fauxLoadeds, cntDelta, requiredUidsUnpacked);

            const ixInsertBefore = (sc || cls)[propFeatures].findIndex(it=>{
                return (it.level || fnUnpackUidFeature(it[propFeature] || it).level) > lvl;
            }
            );
            if (~ixInsertBefore)
                (sc || cls)[propFeatures].splice(ixInsertBefore, 0, feature);
            else
                (sc || cls)[propFeatures].push(feature);

            cntPrev = cntOptFeats;
        }
        );
    }

    static _addFauxOptionalFeatureFeatures_getLoadeds(optfeatList, clsSc, optFeatProgression) {
        const availOptFeats = optfeatList.filter(it=>optFeatProgression.featureType instanceof Array && (optFeatProgression.featureType || []).some(ft=>it.featureType.includes(ft)));
        const optionsMeta = {
            setId: CryptUtil.uid(),
            name: optFeatProgression.name
        };
        return availOptFeats.map(it=>{
            return {
                type: "optionalfeature",
                entry: `{@optfeature ${it.name}|${it.source}}`,
                entity: MiscUtil.copy(it),
                optionsMeta,
                page: UrlUtil.PG_OPT_FEATURES,
                source: it.source,
                hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES](it),
                isRequiredOption: false,
            };
        }
        );
    }

    static _addFauxOptionalFeatureFeatures_getFauxFeature(cls, sc, optFeatProgression, lvl, fauxLoadeds, cntOptions, requiredUidsUnpacked) {
        const loadeds = MiscUtil.copy(fauxLoadeds).filter(l=>!ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES]({
            name: l.entity.name,
            source: l.entity.source
        }), "optionalfeature", l.entity.source, {
            isNoCount: true
        }, ));

        loadeds.forEach(l=>{
            l.isRequiredOption = requiredUidsUnpacked.some(it=>it.name === l.entity.name.toLowerCase() && it.source === l.entity.source.toLowerCase());
            l.optionsMeta.count = cntOptions;
            PageFilterClassesFoundry.populateEntityTempData({
                entity: l.entity,
                ancestorClassName: cls.name,
                ancestorSubclassName: sc?.name,
                level: lvl,
                ancestorType: "optionalfeature",
                displayName: `${optFeatProgression.name}: ${l.entity.name}`,
                foundrySystem: {
                    requirements: cls.name ? `${cls.name}${sc ? ` (${sc.name})` : ""} ${lvl}` : null,
                },
            });
        }
        );

        const out = {
            name: optFeatProgression.name,
            level: lvl,
            loadeds: loadeds,
        };

        if (sc) {
            Object.assign(out, {
                source: sc.source,
                subclassFeature: `${optFeatProgression.name}|${cls.name}|${cls.source}|${sc.shortName}|${sc.source}|${lvl}|${Parser.SRC_5ETOOLS_TMP}`,
                hash: UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"]({
                    name: optFeatProgression.name,
                    subclassName: sc.name,
                    subclassSource: sc.source,
                    className: cls.name,
                    classSource: cls.source,
                    level: lvl,
                    source: Parser.SRC_5ETOOLS_TMP,
                }),
            }, );
        } else {
            Object.assign(out, {
                source: cls.source,
                classFeature: `${optFeatProgression.name}|${cls.name}|${cls.source}|${lvl}|${Parser.SRC_5ETOOLS_TMP}`,
                hash: UrlUtil.URL_TO_HASH_BUILDER["classFeature"]({
                    name: optFeatProgression.name,
                    className: cls.name,
                    classSource: cls.source,
                    level: lvl,
                    source: Parser.SRC_5ETOOLS_TMP,
                }),
            }, );
        }

        return out;
    }

    static getExistingClassItems(actor, cls) {
        if (!cls || !actor?.items){return [];}

        return actor.items.filter(actItem=>{
            if (actItem.type !== "class"){return;}

            const {page, source, hash, propDroppable} = MiscUtil.get(actItem, "flags", SharedConsts.MODULE_ID) || {};
            if (page === UrlUtil.PG_CLASSES && propDroppable === "class" && source === cls.source && hash === UrlUtil.URL_TO_HASH_BUILDER["class"](cls))
                return true;

            return (actItem.name || "").toLowerCase().trim() === cls.name.toLowerCase().trim() && (!Config.get("import", "isStrictMatching") || (UtilDocumentSource.getDocumentSource(actItem).source || "").toLowerCase() === Parser.sourceJsonToAbv(cls.source).toLowerCase());
        }
        );
    }

    static getExistingSubclassItems(actor, cls, sc) {
        if (!cls || !sc)
            return [];

        return actor.items.filter(actItem=>{
            if (actItem.type !== "subclass")
                return false;

            const {page, source, hash, propDroppable} = MiscUtil.get(actItem, "flags", SharedConsts.MODULE_ID) || {};
            if (page === UrlUtil.PG_CLASSES && propDroppable === "subclass" && source === sc.source && hash === UrlUtil.URL_TO_HASH_BUILDER["subclass"](sc))
                return true;

            return (actItem.name || "").toLowerCase().trim() === sc.name.toLowerCase().trim() && (!Config.get("import", "isStrictMatching") || (UtilDocumentSource.getDocumentSource(actItem).source || "").toLowerCase() === Parser.sourceJsonToAbv(sc.source).toLowerCase());
        }
        );
    }

    static getClassFromExistingClassItem(existingClassItem, classes) {
        if (!existingClassItem || existingClassItem.type !== "class" || !classes?.length)
            return null;

        classes = [...classes].sort(this._sortByOfficialAndRecent.bind(this));

        return classes.find(cls=>cls.name.toLowerCase().trim() === existingClassItem.name.toLowerCase().trim() && (!Config.get("import", "isStrictMatching") || (UtilDocumentSource.getDocumentSource(existingClassItem).source || "").toLowerCase() === Parser.sourceJsonToAbv(cls.source).toLowerCase()), );
    }

    static getSubclassFromExistingSubclassItem(existingSubclassItem, cls, subclasses) {
        if (!existingSubclassItem || existingSubclassItem.type !== "subclass" || !subclasses?.length)
            return null;

        subclasses = subclasses.filter(it=>it.className === cls.name && it.classSource === cls.source);

        subclasses = [...subclasses].sort(this._sortByOfficialAndRecent.bind(this));

        return subclasses.find(sc=>sc.name.toLowerCase().trim() === existingSubclassItem.name.toLowerCase().trim() || sc.shortName.toLowerCase().trim() === existingSubclassItem.name.toLowerCase().trim(), );
    }

    static _sortByOfficialAndRecent(a, b) {
        const isNonStandardSourceA = SourceUtil.isNonstandardSource(a.source);
        const isNonStandardSourceB = SourceUtil.isNonstandardSource(b.source);

        if (isNonStandardSourceA === isNonStandardSourceB) {
            return SortUtil.ascSortDateString(Parser.sourceJsonToDate(a.source), Parser.sourceJsonToDate(b.source)) || SortUtil.ascSortLower(a.name, b.name);
        }

        return isNonStandardSourceA ? 1 : -1;
    }

    static getClassSubclassFeatureReferences(obj) {
        const refsClassFeature = [];
        const refsSubclassFeature = [];

        MiscUtil.getWalker({
            isNoModification: true
        }).walk(obj, {
            object: (obj)=>{
                if (obj.type === "refClassFeature") {
                    refsClassFeature.push(MiscUtil.copy(obj));
                    return;
                }

                if (obj.type === "refSubclassFeature") {
                    refsSubclassFeature.push(MiscUtil.copy(obj));
                }
            }
            ,
        }, );

        return {
            refsClassFeature,
            refsSubclassFeature
        };
    }

    static getClassSubclassItemTuples({classItems, subclassItems}) {
        if (!classItems?.length)
            return [];

        subclassItems = subclassItems || [];

        return classItems.map(classItem=>({
            classItem,
            subclassItem: subclassItems.find(it=>it.system.classIdentifier === classItem.system.identifier),
        }));
    }

    static getToolProficiencyData(profs) {
        if (!profs)
            return null;
        if (profs.toolProficiencies)
            return profs.toolProficiencies;
        if (!profs.tools)
            return null;

        const out = {};
        profs.tools.forEach(str=>{
            const itemUid = UtilActors.getItemUIdFromToolProficiency(str);
            if (!itemUid)
                return;
            const mappedTool = UtilActors.getMappedTool(itemUid);
            if (!mappedTool)
                return;
            const unmappedTool = UtilActors.getUnmappedTool(mappedTool);
            if (!unmappedTool)
                return;
            out[unmappedTool] = true;
        }
        );

        return [out];
    }
}
class Charactermancer_Feature_Util {
    static addFauxOptionalFeatureEntries(featureList, optfeatList) {
        if (!featureList || !optfeatList)
            return;

        Object.values(featureList).forEach(arr=>{
            if (!(arr instanceof Array))
                return;

            for (const feature of arr) {
                if (!feature.entries?.length || !feature.optionalfeatureProgression)
                    continue;

                for (const optFeatProgression of feature.optionalfeatureProgression) {
                    this._addFauxOptionalFeatureFeatures_handleFeatProgression(optfeatList, feature, optFeatProgression, );
                }
            }
        }
        );
    }

    static _addFauxOptionalFeatureFeatures_handleFeatProgression(optfeatList, feature, optFeatProgression) {
        if (optFeatProgression.progression instanceof Array)
            return;

        if (!optFeatProgression.progression["*"])
            return;

        const availOptFeats = optfeatList.filter(it=>optFeatProgression.featureType instanceof Array && (optFeatProgression.featureType || []).some(ft=>it.featureType.includes(ft))).filter(it=>!ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES](it), "optionalfeature", it.source, {
            isNoCount: true
        }, ));

        feature.entries.push({
            type: "options",
            count: optFeatProgression.progression["*"],
            entries: availOptFeats.map(it=>({
                type: "refOptionalfeature",
                optionalfeature: DataUtil.proxy.getUid("optionalfeature", it, {
                    isMaintainCase: true
                }),
            })),
            data: {
                _plut_tmpOptionalfeatureList: true,
            },
        });
    }

    static getCleanedFeature_tmpOptionalfeatureList(feature) {
        const cpyFeature = MiscUtil.copy(feature);
        MiscUtil.getWalker().walk(cpyFeature, {
            array: (arr)=>{
                return arr.filter(it=>it.data == null || !it.data._plut_tmpOptionalfeatureList);
            }
            ,
        }, );
        return cpyFeature;
    }
}

export {Charactermancer_Class_Util, Charactermancer_Feature_Util};