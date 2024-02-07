class CharacterExportFvtt{

    /* CONCEPT =====================

    */

    /**
     * @param {CharacterBuilder} builder
     */
    static async exportCharacter(builder){
        //lets not be verbose here

        //Ids of brew sources that are fully loaded into memory
        const brewSourceIds = CharacterExportFvtt.getBrewSourceIds();
        console.log("BREW SOURCE IDS", brewSourceIds);

        const _meta = {};
        const _char = {race:null, classes:null};

        //probably needs to be cleaned of duplicates later
        let metaDataStack = [];

        //#region CLASS
        const classData = await CharacterExportFvtt.getClassData(builder.compClass);
        let classArray = null;
        for(let i = 0; i < classData.length; ++i){
            const data = classData[i];
            if(!data.cls){continue;}
            const hash = UrlUtil.URL_TO_HASH_BUILDER.class(data.cls);
            if(!classArray){classArray = [];}

            //Create a block with some more easily accessible properties (thank me later when you are loading this)
            const block = {
                name: data.cls.name,
                source: data.cls.source,
                hash: hash,
                srd: data.cls.srd,
                level: data.targetLevel,
                isPrimary: data.isPrimary
            };
            //Add some data to block that may or may not always be in our given data (depends on class)
            //TODO: Language, etc here?
            if(data.skillProficiencies){block.skillProficiencies = data.skillProficiencies;}
            if(data.toolProficiencies){block.toolProficiencies = data.toolProficiencies;}
            if(data.featureOptSel){block.featureOptSel = data.featureOptSel;}

            //Create some meta information (so we can track where this class came from)
            metaDataStack.push({uid: data.cls.name+"|"+data.cls.source,
                name:data.cls.name,
                source:data.cls.source,
                type:"class",
                _data:CharacterExportFvtt.getSourceMetaData(data.cls, brewSourceIds)});

            //Check if high enough level for subclass here?
            if(data.sc){
                const schash = UrlUtil.URL_TO_HASH_BUILDER.subclass(data.sc);
                //Add the subclass to block, if present
                block.subclass = {
                    name: data.sc.name,
                    source: data.sc.source, //maybe we should include some info here (and in class, race, etc) if this is brewed content
                    hash: schash
                }
                //Create some meta information (so we can track where this subclass came from)
                //Subclasses generally dont have the 'srd' property, by the way
                metaDataStack.push({uid: data.sc.name+"|"+data.sc.source,
                    name:data.sc.name,
                    source:data.sc.source,
                    type:"subclass",
                    _data:CharacterExportFvtt.getSourceMetaData(data.sc, brewSourceIds)});
            }
            classArray.push(block);
        }
        _char.classes = classArray;
        //#endregion

        //#region RACE
        const raceData = this.getRaceData(builder.compRace);
        if(!!raceData){
            let race = raceData.meta.race;
            const hash = UrlUtil.URL_TO_HASH_BUILDER.race(race);
            //Set the .race entry in the _char output
            _char.race = {stateInfo: raceData.stateInfo, race: {name:race.name, source:race.source, hash: hash, srd:race.srd,
                isSubRace: race._isSubRace, raceName:race.raceName, raceSource:race.raceSource, isBaseSrd:race._baseSrd,
                versionBaseName:race._versionBase_name, versionBaseSource:race._versionBase_source }};
            //Remember some metadata about what source this race is from
            metaDataStack.push({uid: race.name+"|"+race.source,
            name:race.name,
            source:race.source,
            type:"race",
            _data: CharacterExportFvtt.getSourceMetaData(race, brewSourceIds)});
        }
        //#endregion

        //#region BACKGROUND
        const background = await CharacterExportFvtt.getBackground(builder.compBackground);
        if(!!background){
            //Add background to character output
            _char.background = background;
            //Create some meta information (so we know where the background came from)
            metaDataStack.push({uid: background.name+"|"+background.source,
            name:background.name,
            source:background.source,
            type:"background",
            _data:CharacterExportFvtt.getSourceMetaData(background, brewSourceIds)});
        }
        //#endregion

        //#region ABILITY SCORES (our choices, maybe not the total)
        const abilities = await CharacterExportFvtt.getAbilityScoreData(builder.compAbility);
        //Add abilities to character output
        _char.abilities = abilities;
        //Don't think any meta information is needed here
        //#endregion

        //#region EQUIPMENT (including gold, and bought items)
        const equipment = await CharacterExportFvtt.getEquipmentData(builder.compEquipment);
        //Add equipment to character output
        _char.equipment = equipment;
        for(let it of equipment.boughtItems){
            console.log("BOUGHT ITEM", it);
            let uid = it.uid; //plate_armor|phb
            //TODO: get the full source of the item (assuming its not a PHB item or something)
        }
        //#endregion

        //#region SPELLS
        const spells = await CharacterExportFvtt.getAllSpells(builder.compSpell);
        for(let srcIx = 0; srcIx < spells.length; ++srcIx){
            let spellSource = spells[srcIx];
            for(let lvlix = 0; lvlix < spellSource.spellsByLvl.length; ++lvlix){
                let lvl = spellSource.spellsByLvl[lvlix];
                for(let spix = 0; spix < lvl.length; ++spix){
                    let sp = lvl[spix];
                    //Create some meta information (so we know where the spell came from)
                    metaDataStack.push({uid: sp.name+"|"+sp.source,
                        _data:CharacterExportFvtt.getSourceMetaData(sp.spell, brewSourceIds)});
                    //delete .spell info
                    delete sp.spell;
                    lvl[spix] = sp;
                }
                spellSource.spellsByLvl[lvlix] = lvl;
            }
            spells[srcIx] = spellSource;
        }
        _char.spellsBySource = spells;
        //#endregion

        //Feats

        //optional feature stuff?

        //Build meta
        let brewSourcesUsed = [];
        let fileSourcesUsed = [];
        for(let meta of metaDataStack){
            
            //Check that source is not official
            if(CharacterExportFvtt.isFromOfficialSource({source:meta.source})){continue;}

            const matchedSources = await CharacterExportFvtt._test_MatchEntityToSource({name:meta.name, source:meta.source}, meta.type);
            if(matchedSources.length < 0){
                //Could not make a match
                console.log(`Could not match ${meta.name} of type '${meta.type}' to any source`);
                continue;
            }
            else if(matchedSources.length > 1){
                //Resolve the conflict
                matchedSources = [matchedSources[0]];//TEMPORARY FIX
            }
            const match = matchedSources[0];
            if(!match){
                console.log(`For some reason matched ${meta.name} of type '${meta.type}' as ${match}`);
                continue;
            }
            console.log(`I think ${meta.name} is a ${meta.type} from ${match.filename}`);
            //We need to determine if match is an uploaded file or not
            const isUploaded = CharacterExportFvtt.isUploadedFileSource(match);
            if(isUploaded){fileSourcesUsed.push(match);}
            else{brewSourcesUsed.push(match);}
        }

        if(fileSourcesUsed.length > 0){
            let names = "";
            for(let n of fileSourcesUsed){
                names += `${names.length>0? ", ":""}${n.filename}`; 
            }

            const doProceed = await InputUiUtil.pGetUserBoolean({
                title: `Uploaded files are used`,
                htmlDescription: `Content from the uploaded files (${names}) seem to be used by your character.
                Be aware that should you wish to import this save anywhere else, you will need to include these files seperately.
                Do you still wish to proceed?`,
              });
            //Perhaps show some info here that characters using content from non-enabled sources will break badly
            if (!doProceed){return;}
        }

        

        _meta.fileSourcesUsed = fileSourcesUsed;
        _meta.brewSourcesUsed = brewSourcesUsed;

        //Optionally, instead of tracking each and every item, race, subclass, etc that we incorporated on our character,
        //we can just check which sources were enabled at the time of the exporting of the character
        //This does of course include bloat, but it's more accurate than what we have going right now
        _meta.enabledBrew = brewSourceIds.map(srcId => SourceManager.minifySourceId(srcId));

        const output = {character: _char, _meta:_meta};

        console.log("Export Character", output);
        console.log("MetaData", metaDataStack);
        let importStr = this.test_printExportJsonAsString(output);

        localStorage.setItem("lastCharacter", importStr);
    }

    //#region Pull Info From Builder
    /**
     * @param {ActorCharactermancerClass} compClass
     * @returns {{cls: any, isPrimary: boolean, propIxClass:string, propIxSubclass:string, targetLevel:number, sc:any}[]}
     */
    static async getClassData(compClass) {
        const primaryClassIndex = compClass._state.class_ixPrimaryClass;
        //If we have 2 classes, this will be 1
        const highestClassIndex = compClass._state.class_ixMax;

        const classList = [];
        for(let i = 0; i <= highestClassIndex; ++i){
            const isPrimary = i == primaryClassIndex;
            //Get a string property that will help us grab actual class data
            const { propIxClass: propIxClass, propIxSubclass: propIxSubclass, propCurLevel:propCurLevel, propTargetLevel: propTargetLevel } =
            ActorCharactermancerBaseComponent.class_getProps(i);
            //Grab actual class data
            const cls = compClass.getClass_({propIxClass: propIxClass});
            if(!cls){continue;}
            const targetLevel = compClass._state[propTargetLevel];
            const block = {
                cls: cls,
                isPrimary: isPrimary,
                propIxClass: propIxClass,
                propIxSubclass:propIxSubclass,
                targetLevel:targetLevel
            }
            let skillProficienciesForm = this.getClassSkills(compClass, i);
            if(skillProficienciesForm != null){
                block.skillProficiencies = skillProficienciesForm;
            }
            let toolProficienciesForm = this.getClassTools(compClass, i);
            if(toolProficienciesForm != null){
                block.toolProficiencies = toolProficienciesForm;
            }
            let featureOptSel = await this.getClassFeatureChoices(compClass, i);
            if(featureOptSel != null){
                block.featureOptSel = featureOptSel;
            }
            //Now we want to ask compClass if there is a subclass selected for this index
            const sc = compClass.getSubclass_({cls:cls, propIxSubclass:propIxSubclass});
            if(sc != null) { block.sc = sc; }
            classList.push(block);
        }
        return classList;
    }
    /**
     * @param {ActorCharactermancerRace} compRace
     * @returns {any}
     */
    static getRaceData(compRace){
        let out = null;
        const grabForm = (subCompName) => {
            if(compRace[subCompName]){
                const form = compRace[subCompName].pGetFormData();
                out.formInfo.subcomps[subCompName] = form;
            }
        }
        const grabState = (subCompName) => {
            if(compRace[subCompName]){
                out.stateInfo.subcomps[subCompName] = compRace[subCompName].__state;
            }
        }
        const race = compRace.getRace_();
        if(!!race){
            out = {meta:{race:race}, stateInfo:{subcomps:{}}};
            
            //Get states from subcomponents
            grabState("_compRaceSkillProficiencies");
            grabState("_compRaceArmorProficiencies");
            grabState("_compRaceConditionImmunity");
            grabState("_compRaceDamageImmunity");
            grabState("_compRaceDamageResistance");
            grabState("_compRaceDamageVulnerability");
            grabState("_compRaceExpertise");
            grabState("_compRaceLanguageProficiencies");
            grabState("_compRaceSkillToolLanguageProficiencies");
            grabState("_compRaceToolProficiencies");
            grabState("_compRaceWeaponProficiencies");
            
        }
        else{
            console.log("Race is null");
        }
        return out;
    }
    /**
     * @param {ActorCharactermancerClass} compClass
     * @param {number} ix
     * @returns {any} returns a form
     */
    static getClassSkills(compClass, ix){
        if(compClass.compsClassSkillProficiencies.length<=ix){return null;}
        const comp = compClass.compsClassSkillProficiencies[ix];
        if(comp==null){return null;}
        const form = comp._getFormData();
        return form;
    }
    /**
     * @param {ActorCharactermancerClass} compClass
     * @param {number} ix
     * @returns {any} returns a form
     */
    static getClassTools(compClass, ix){
        if(compClass.compsClassToolProficiencies.length<=ix){return null;}
        const comp = compClass.compsClassToolProficiencies[ix];
        if(comp==null){return null;}
        const form = comp._getFormData();
        return form;
    }
    /**
     * @param {ActorCharactermancerClass} compClass
     * @param {number} ix
     * @returns {any} returns a form
     */
    static async getClassFeatureChoices(compClass, ix){
        if(compClass.compsClassFeatureOptionsSelect.length<=ix){return null;}
        const compArray = compClass.compsClassFeatureOptionsSelect[ix];
        let compDatas = [];
        for(let k = 0; k < compArray.length; ++k){
            let comp = compArray[k];
            if(comp==null){return null;}

            let hashes = comp._optionsSet.map(set => {return set.hash});
            let subCompDatas = [];
            const subCompsNames = comp.allSubComponentNames;
            for(let j = 0; j < subCompsNames.length; ++j){
                let prop = subCompsNames[j];
                let subCompArray = comp[prop];
                if(!subCompArray){continue;}
                for(let i = 0; i < subCompArray.length; ++i){
                    let subComp = subCompArray[i];
                    //apparently the array can have null entries
                    if(!subComp){continue;}
                    console.log("SUBCOMP", subComp, comp);
                    compDatas.push({classIx: ix, parentCompIx: k, subCompProp:prop, subCompIx: i, state: subComp.__state});
                }
            }
            continue; //Debug
        }
        console.log(compDatas);
        return compDatas;
    }
    /**
     * @param {ActorCharactermancerAbility} compAbility
     * @returns {any}
     */
    static async getAbilityScoreData(compAbility){
        const statgen = compAbility._compStatgen;
        const s = statgen.__state;
        const chosenModeIx = statgen._meta.ixActiveTab___default;
        //const chosenMode = (["none", "rolled", "std_array", "pointbuy", "manual"])[chosenModeIx];
        let out = {};
        if(chosenModeIx == 1){ //ROLL
            out = {rolled_str_abilSelectedRollIx:s["rolled_str_abilSelectedRollIx"],
            rolled_dex_abilSelectedRollIx:s["rolled_dex_abilSelectedRollIx"],
            rolled_con_abilSelectedRollIx:s["rolled_con_abilSelectedRollIx"],
            rolled_wis_abilSelectedRollIx:s["rolled_wis_abilSelectedRollIx"],
            rolled_int_abilSelectedRollIx:s["rolled_int_abilSelectedRollIx"],
            rolled_cha_abilSelectedRollIx:s["rolled_cha_abilSelectedRollIx"],
            rolled_formula:s["rolled_formula"],
            pb_isCustom:s["pb_isCustom"],
            rolled_rolls:s["rolled_rolls"]};
        }
        else if(chosenModeIx == 2){ //STANDARD ARRAY
            out = {array_str_abilSelectedScoreIx:s["array_str_abilSelectedScoreIx"],
            array_dex_abilSelectedScoreIx:s["array_dex_abilSelectedScoreIx"],
            array_con_abilSelectedScoreIx:s["array_con_abilSelectedScoreIx"],
            array_int_abilSelectedScoreIx:s["array_int_abilSelectedScoreIx"],
            array_wis_abilSelectedScoreIx:s["array_wis_abilSelectedScoreIx"],
            array_cha_abilSelectedScoreIx:s["array_cha_abilSelectedScoreIx"]};
        }
        else if(chosenModeIx == 3){ //POINT BUY
            out = {pb_str:s["pb_str"], pb_dex:s["pb_dex"], pb_con:s["pb_con"],
            pb_wis:s["pb_wis"], pb_int:s["pb_int"], pb_cha:s["pb_cha"],
            pb_budget:s["pb_budget"], pb_isCustom:s["pb_isCustom"], pb_points:s["pb_points"]};
        }
        else if(chosenModeIx == 4){ //MANUAL
            out = {manual_str_abilValue:s["manual_str_abilValue"],
            manual_dex_abilValue:s["manual_dex_abilValue"],
            manual_con_abilValue:s["manual_con_abilValue"],
            manual_wis_abilValue:s["manual_wis_abilValue"],
            manual_int_abilValue:s["manual_int_abilValue"],
            manual_cha_abilValue:s["manual_cha_abilValue"]};
        }

        const specifiedSave = true; //Keep true for now, otherwise for some reason ASI feats dont get properly saved/loaded

        if(specifiedSave){
            //ASI data
            let asiData = {};
            //We can get feats from ASIs, Races, and... what else? Backgrounds?
            //TODO: Add background support here
            for(let prop of Object.keys(s)){
                if(prop.startsWith("common_asi_") || prop.startsWith("common_additionalFeats_")){
                    asiData[prop] = s[prop];
                }
                //Some races provide ASI choices, include them here while we are at it
                else if(prop.startsWith("common_raceChoice")){
                    out[prop] = s[prop];
                }
                //Keep track of number of custom feats
                //TODO: only include custom feats with index lower than this number
                else if (prop.startsWith("common_cntFeatsCustom")){
                    out[prop] = s[prop];
                }
            }

            return {state:out, stateAsi:asiData, mode:chosenModeIx};
        }
        else{
            //We can just grab every property starting with common_ and include that
            for(let prop of Object.keys(s)){
                if(prop.startsWith("common_")){
                    out[prop] = s[prop];
                }
            }
            return {state:out, mode:chosenModeIx};
        }
      
    }
    /**
     * @param {ActorCharactermancerEquipment} compEquipment
     */
    static async getEquipmentData(compEquipment){
        //Get gold
        const compGold = compEquipment._compEquipmentCurrency;

        const compDefault = compEquipment._compEquipmentStartingDefault;
        //Get the _state from compDefault, it contains info about which items were selected
        const stateDefault = compDefault.__state;
        //We also need info on if we rolled for gold or not. We can get this from compGold
        const cpRolled = compGold.__state.cpRolled;
        //Then we need info on which items were purchased in the item shop
        const compShop = compEquipment._compEquipmentShopGold;
        const boughtItems = compShop.__state.itemPurchases.map(it =>  { 
            return {isIgnoreCost: it.data.isIgnoreCost, quantity: it.data.quantity, value: it.data.value, uid: it.data.uid};});

        const out = {stateDefault:stateDefault, cpRolled:cpRolled, boughtItems:boughtItems};

        return out;
    }
    /**
     * @param {ActorCharactermancerSpell} compSpell
     * @returns {{className:string, classSource:string, spellsByLvl:Charactermancer_Spell_SpellMeta[][]}[]}
     */
    static getAllSpells(compSpell){

        let spellsBySource = [];
        for(let j = 0; j < compSpell.compsSpellSpells.length; ++j){
            //Assume this component handles spells for a certain class
            let comp = compSpell.compsSpellSpells[j];
            if(!comp){continue;}
            let className = comp._className;
            let classSource = comp._classSource;
            let spellsByLvl = compSpell.compsSpellSpells[j]._test_getKnownSpells().map(arr => arr.map(
                spell => {return {name: spell.spell.name, source:spell.spell.source,
                    isLearned:spell.isLearned, isPrepared:spell.isPrepared, spell:spell.spell};}
            ));
            spellsBySource.push({className: className, classSource:classSource, spellsByLvl: spellsByLvl});
        }
        console.log("OUTPUT", spellsBySource);
        return spellsBySource;
    }
    /**
     * Get background save data
     * @param {ActorCharactermancerBackground} compBackground
     * @returns {any}
     */
    static getBackground(compBackground){
        let bk = compBackground.getBackground_();
        if(!bk){return null;}
        const bkSource = bk.source;
        const bkName = bk.name;
        const isCompletelyCustom = bk.name == "Custom Background";

        let out = {name:bkName, source:bkSource};
        //Skill proficiencies
        out.isCustomizeSkills = !!compBackground.__state.background_isCustomizeSkills;
        out.stateSkillProficiencies = compBackground.compBackgroundSkillProficiencies?.__state;
        //Languages & tools
        out.isCustomizeLanguagesTools = !!compBackground.__state.background_isCustomizeLanguagesTools;
        out.stateLanguageToolProficiencies = compBackground.compBackgroundLanguageToolProficiencies?.__state;
        //Characteristics
        out.stateCharacteristics = compBackground.compBackgroundCharacteristics.__state;

        //Delete all properties that are null
        out = Object.fromEntries(Object.entries(out).filter(([_, v]) => v != null));

        //console.log("BACKCOMP", compBackground);
        return out;
    }
    //#endregion


    /**
     * @param {{name:string, source:string}} entity a subclass, race, class etc
     * @param {string} type "subclass", "class", "race", etc
     * @returns {{filename:string, url:string, isLocal:string, checksum:string}[]}
     */
    static async _test_MatchEntityToSource(entity, type){
        const returnOnFirstMatch = false;
        //Let's get all enabled sources first (one of them might Be 'Upload File')
        const enabledSources = CharacterExportFvtt.getBrewSourceIds();
        const brew = await BrewUtil2.pGetBrew();
        console.log("ENABLED SOURCES", enabledSources, "BREW", brew, entity);
        let matchedSources = [];
        for(let source of brew){
            //Even an uploaded file can appear here
            //source.head.filename
            //source.head.url (might be that uploaded files have this as null)

            const content = source.body[type]; //type array. subclass, class, race, etc
            if(!content){continue;}
            let matchedEntity = false; //This loop will close once a match is made
            for(let ci = 0; !matchedEntity && ci < content.length; ++ci){
                //Let's do a simple match: just 'name' and 'source'
                matchedEntity = (content[ci].name == entity.name && content[ci].source == entity.source);
            }
            if(matchedEntity){
                if(returnOnFirstMatch){return [source.head];}
                matchedSources.push(source.head);
            }
        }
        return matchedSources;
    }
    /**
     * @param {{filename:string}} source
     * @returns {boolean}
     */
    static isUploadedFileSource(source){
        //First, get all the brew sourceIds from somewhere
        let srcIds = this.getLoadedSources();
        //Next, filter the sources until we get one called 'Upload File'.
        //Alternatively, just check if source.isFile
        srcIds = srcIds.filter(srcId => srcId.isFile);
        if(!srcIds || srcIds.length < 1){return false;}
        //Now that we have confirmed the user did include an 'Upload File' source, we need to check if any uploaded files match
        //We need the uploadedFileMetas for this
        const fileMetas = CharacterBuilder._testUploadedFileMetas;
        return fileMetas.filter(meta => meta.name == source.filename).length > 0;
    }

    //#region Get Source Metadata
    /**
     * Gets source metadata for an object (race/class/subclass/spell/etc)
     * @param {{name:string, source:string}} item
     * @param {{name:string, url:string, abbreviations:string[], isDefault:boolean, isFile:boolean}[]} brewSourceIds
     * @returns {{isOfficialContent:boolean, brewSource:{name:string, url:string, abbreviations:string[]}}}
     */
    static getSourceMetaData(item, brewSourceIds){
        //This is not a trustable way to confirm if something is from official sources or not. Yet.
        if(item.srd || this.isFromOfficialSource(item)){
            return {isOfficialContent:true};
        }
        else {
            console.log("ITEM META", item, brewSourceIds);
            const match = this.matchToBrewSourceID(item, brewSourceIds);
            console.log("MATCH", match);
            if(!match){throw new Error(`Failed to get brew source for ${item.name}|${item.source}`);}
            return {isOfficialContent:false, brewSource:match};
        }
    }
     /**
     * @returns {{name:string, url:string, isDefault:boolean, isFile:boolean, isWorldSelectable:boolean, cacheKey:string, _brewUtil: any
     * filterTypes:string[], _pPostLoad:Function, _isExistingPrereleaseBrew:boolean, _isAutoDetectPrereleaseBrew:boolean,
     * abbreviations:string[] _isAutoDetectPrereleaseBrew:boolean, _isExistingPrereleaseBrew:boolean}[]}
     */
    static getLoadedSources(){
        return CharacterBuilder._testLoadedSources;
    }
    static getBrewSourceIds(){
        //Only return non-default sources for now
        return this.getLoadedSources().filter(src => !src.isDefault);
    }
    /**
     * @param {{source:string, name:string}} item
     * @param {{name:string, url:string, abbreviations:string[]}} sourceId
     * * @param {boolean} pendanticMode (default is true) in pedantic mode, we don't just check that abbreviations match, we do a deeper match
     * @returns {boolean}
     */
    static doesMatchToBrewSource(item, sourceId, pendanticMode=false){

        //NEW STUFF
        //check if custom upload or default source, we do not handle those
        if(sourceId.isFile){return false;}
        if(sourceId.isDefault){return false;}

        console.log("ITEM.SOURCE", item.source, "SOURCE ID", sourceId);
        const itemAbbreviation = item.source.toLowerCase();
        const srcUsedAbbreviations = sourceId.abbreviations.map(a => a.toLowerCase());
        //Match abbreviations. If brewer made a typo on the abbreviation somewhere, this will fail
        if(!srcUsedAbbreviations.includes(itemAbbreviation)){return false;}
        //Now that we know the abbreivations matched, we can return true, or if we want to be pedantic,
        //we can check to see that source names also match
        //(WARNING:) keep in mind, the user may have enabled more than 1 source that uses the same abbrevation!

        const src = BrewUtil2.sourceJsonToSource(item.source);
        const srcs = BrewUtil2.getSources();
        console.log("FOUND BREW SRC", src, srcs);
        console.log("BREW METAS", sourceId._brewUtil._cache_brews);

        //let brewMetas = BrewUtil2._getBrewMetas();
        //first, 

        if(!pendanticMode){return true;}

        //Since we can't rely on the itemAbbreviation alone to find us the correct source, we need to be more rough
        //We probably need to use the sourceId to load a source, then check if it mentions this item
        //const src = BrewUtil2.sourceJsonToSource(item.source);
        //console.log("SRC", src);
        
        //Lets get the full name of the source. We expect the name to be split like this: "AUTHOR; BREW_NAME"
        let sourceFullName = "";
        if(!sourceId.name.includes(";")){sourceFullName = sourceId.name;} //Let's have a fallback in case for some reason the name doesnt have a section for the author
        else { sourceFullName = sourceId.name.substring(sourceId.name.indexOf(";") + 1).trim(); } //This is the expected outcome

        //Now we need the source full name on the end of the item in question (like a subclass, feat, or spell)
        //Parser should have this information
        let itemSourceFull = Parser.sourceJsonToFull(item.source); //Expect a full name of the brew here
        //Remove all non-latin and non-numeral characters (sometimes people misplace ' and ´, among other things)
        const removeNonAlphanumericCharacters = (inputString) => {
            return inputString.replace(/[^a-zA-Z0-9]/gi, '');
        }

        console.log("SOURCEID", sourceId);

        //If the brewer made a typo between any two (of the numerous places) where you define the source's full name, this will fail and return null

        sourceFullName = removeNonAlphanumericCharacters(sourceFullName).toLowerCase();
        itemSourceFull = removeNonAlphanumericCharacters(itemSourceFull).toLowerCase();
        console.log(sourceFullName, itemSourceFull);

        return sourceFullName == itemSourceFull;
    }
    /**
     * @param {{name:string, source:string}} item
     * @param {{full:string, url:string, abbreviation:string}} fileSourceId
     * @returns {boolean}
     */
    static doesMatchToUploadedFileSource(item, fileSourceId){

        //test
        let itemSourceFull = Parser.sourceJsonToFull(item.source); //Ok so we cant rely on this to get the correct source name from an abbreviation
        console.log("BREWUTIL2 THOGUHT IT WAS", itemSourceFull);

        if(item.source == fileSourceId.abbreviation){return true;}
        //Fallback - not sure if this will ever work, but perhaps the sourceId has 'abbreviations' (a string array)
        if(!!fileSourceId.abbreviations && fileSourceId.abbreviations.includes(item.source)){return true;}
        //There might be a way to ask BrewUtil2 for the source by just using this abbreviation
        return false;
    }
    /**
     * Matches an item to a brew source ID
     * @param {{name:string, source:string}} item a class, subclass, race, item, feat, background, etc
     * @param {{name:string, abbreviations:string[]}[]} brewSourceIds
     * @returns {{name:string, abbreviations:string[]}}
     */
    static matchToBrewSourceID(item, brewSourceIds){

        let matchedIds = brewSourceIds.filter(srcId => this.doesMatchToBrewSource(item, srcId));

        //DEBUG - try to only match to uploaded files
        const uploadedFileSources = brewSourceIds.filter(srcId => srcId.isFile);
        if(uploadedFileSources.length > 0){
            const fileMetas = CharacterBuilder._testUploadedFileMetas;
            console.log("FILE METAS", fileMetas);
            for(let file of fileMetas){
                if(!file.contents?._meta){continue;}
                for(let src of file.contents._meta.sources){
                    let isMatch = this.doesMatchToUploadedFileSource(item, src);
                    if(isMatch){matchedIds.push(src);}
                }
            }
        }

        
        if(matchedIds.length < 1){return null;}
        if(matchedIds.length > 1){ console.error("Matched item to multiple brew sources", item, matchedIds); } //something went wrong
        return matchedIds[0];
    }

    /**
     * Checks if an object(race/class/subclass/etc) is from an official source 
     * @param {{__diagnostic:any}} item
     * @returns {boolean}
     */
    static isFromOfficialSource(item){
        return [Parser.SOURCES_VANILLA,
            ...Parser.SOURCES_CORE_SUPPLEMENTS,
            ...Parser.SOURCES_PARTNERED_WOTC,
            ...Parser.SOURCES_NON_STANDARD_WOTC,
            ...Parser.SOURCES_NON_FR,
            ...Parser.SOURCES_CORE_SUPPLEMENTS,
            ...Parser.SOURCES_COMEDY,
            ...Parser.SOURCES_ADVENTURES,
            //...Parser.SOURCES_AVAILABLE_DOCS_BOOK,
            //...Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE,
        ].includes(item.source);


        //we can check check if parser knows of the name
        //actually, SOURCE_JSON_TO_FULL probably gets filled by properties from homebrew.
        //So we cant rely on it to validate official sources
        //return !!Parser.SOURCE_JSON_TO_FULL[item.source];
        return false;
    }
    static matchToOfficialSource(item){
        return Parser.sourceJsonToFull(item.source);
    }
    //#endregion

    static test_getSourceFromSubclass(){
        const item = {
            className: "Sorcerer",
            classSource: "PHB",
            name: "Blood Magic",
            shortName: "Blood Magic",
            source: "FFBloodSorc",
            __diagnostic: {filename: "Foxfire94; Blood Magic Sorcerous Origin.json" },
            __prop: "subclass"
        };

         //First of all, try to figure out if this is a brewed subclass
        //one easy way (maybe?) of doing this is to check the __diagnostic property (only brewed (and maybe prerelease?) stuff has this)
        const isBrewedContent = CharacterExportFvtt.isFromOfficialSource(item);

        if(!isBrewedContent){
            const sourceNameFull = this.matchToOfficialSource(item);
            const meta = {
                isOfficial: true,
                source: item.source,
                sourceFull: sourceNameFull
            };
            return meta;
        }


        const brewSources = CharacterExportFvtt.getBrewSourceIds();
        console.log("BREW SOURCES", brewSources);

        const matchedBrewSources = brewSources.filter(src => this.doesMatchToBrewSource(item, src));
        if(matchedBrewSources.length<1){}
        console.log("Matched? ", matchedBrewSources.length==1);
    }

    static test_printExportJsonAsString(exportJson){
        const str = JSON.stringify(exportJson);
        console.log(str);
        return str;
    }
    
    /**
     * Save file schema
     * _meta:
     * character:
     * -classes (array)
     * --[0]
     * ---name (string)
     * ---source (string)
     * ---skillsTools
     * ---
    */
}

class CharacterImportFvtt {


    static test_string = `{"character":{"race":{"name":"Dragonborn","source":"PHB","hash":"dragonborn_phb","srd":true,"isSubRace":true,"raceName":"Dragonborn","raceSource":"PHB","isBaseSrd":true},"classes":null,"spellsBySource":[]},"_meta":{"isOfficialContentUsed":true,"brewSourcesUsed":[]}}`;
    //Useful for loading a savefile
    static importAsJsonString(jsonString){

        let data = {};
        for(let clData of data._char.classes){
            let clsState = this.loadClassState(clData);
        }
    }

    /**
     * @param {{name:string, source:string, srd:boolean, level:number, isPrimary:boolean,
     * subclass:{name:string, source:string}}} data
     * @returns {any}
     */
    static loadClassState(data){
        //Assume we have already loaded the needed soures into memory
        //Now we have to use the class name and the class source to create an UID so we can get the needed object


    }    
}