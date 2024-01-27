class CharacterExportFvtt{

    /* CONCEPT =====================

    */

    /**
     * @param {CharacterBuilder} builder
     */
    static async exportCharacter(builder){
        //lets not be verbose here

        const brewSourcesLoaded = this.getBrewSources();

        const _meta = {};
        const _char = {race:null, classes:null};

        //probably needs to be cleaned of duplicates later
        let metaDataStack = [];

        //Lets start by getting the character race
        const race = builder.compRace.getRace_();
        if(!!race){
            const hash = UrlUtil.URL_TO_HASH_BUILDER.race(race);
            _char.race = {name:race.name, source:race.source, hash: hash, srd:race.srd,
                isSubRace: race._isSubRace, raceName:race.raceName, raceSource:race.raceSource, isBaseSrd:race._baseSrd,
                versionBaseName:race._versionBase_name, versionBaseSource:race._versionBase_source };
            metaDataStack.push({uid: race.name+"|"+race.source, _data:CharacterExportFvtt.getSourceMetaData(race)});

        }

        //Now lets get the class information
        const classData = await CharacterExportFvtt.getClassData(builder.compClass);
        let classArray = null;
        for(let i = 0; i < classData.length; ++i){
            const data = classData[i];
            if(!data.cls){continue;}
            const hash = UrlUtil.URL_TO_HASH_BUILDER.class(data.cls);
            if(!classArray){classArray = [];}
            const block = {
                name: data.cls.name,
                source: data.cls.source,
                hash: hash,
                srd: data.cls.srd,
                level: data.targetLevel,
                isPrimary: data.isPrimary
            };
            //Add skill proficiencies (a choice we get at lvl 1)
            if(data.skillProficiencies){block.skillProficiencies = data.skillProficiencies;}
            //Add tool proficiencies (a choice we get at lvl 1 for some classes)
            if(data.toolProficiencies){block.toolProficiencies = data.toolProficiencies;}
            if(data.featureOptSel){block.featureOptSel = data.featureOptSel;}
            metaDataStack.push({uid: data.cls.name+"|"+data.cls.source, _data:CharacterExportFvtt.getSourceMetaData(data.cls)});

            //Check if high enough level for subclass here?
            if(data.sc){
                const schash = UrlUtil.URL_TO_HASH_BUILDER.subclass(data.sc);
                block.subclass = {
                    name: data.sc.name,
                    source: data.sc.source, //maybe we should include some info here (and in class, race, etc) if this is brewed content
                    hash: data.schash
                }
                //subclasses generally dont have the 'srd' property
                metaDataStack.push({uid: data.sc.name+"|"+data.sc.source, _data:CharacterExportFvtt.getSourceMetaData(data.sc)});
            }
            classArray.push(block);
        }
        _char.classes = classArray;

        //Background information time
        const background = await CharacterExportFvtt.getBackground(builder.compBackground);
        console.log("Background: ", background);
        if(!!background){metaDataStack.push({uid: background.name+"|"+background.source, _data:CharacterExportFvtt.getSourceMetaData(background)});}
        _char.background = background;

        //ability scores (our choices, maybe not the total)
        const abilities = await CharacterExportFvtt.getAbilityScoreData(builder.compAbility);
        //equipment (including gold, and bought items)
        const equipment = await CharacterExportFvtt.getEquipmentData(builder.compEquipment);
        console.log("Equipment: ", equipment);
        //known spells & cantrips
        const spells = await CharacterExportFvtt.getAllSpells(builder.compSpell);
        console.log("Spells: ", spells);
        for(let srcIx = 0; srcIx < spells.length; ++srcIx){
            let src = spells[srcIx];
            for(let lvlix = 0; lvlix < src.spellsByLvl.length; ++lvlix){
                let lvl = src.spellsByLvl[lvlix];
                for(let spix = 0; spix < lvl.length; ++spix){
                    let sp = lvl[spix];
                    metaDataStack.push({uid: sp.spell.name+"|"+sp.spell.source, _data:CharacterExportFvtt.getSourceMetaData(sp.spell)});
                }
            }
        }
        _char.spellsBySource = spells;

        //Feats

        //optional feature stuff?

        //Build meta
        let isOfficialContentUsed = false;
        let brewSourcesUsed = [];
        for(let meta of metaDataStack){
            if(meta._data.isOfficialContent){isOfficialContentUsed = true;}
            else{
                brewSourcesUsed.push(meta._data.brewSource);
            }
        }
        _meta.isOfficialContentUsed = isOfficialContentUsed;
        _meta.brewSourcesUsed = brewSourcesUsed;

        const output = {character: _char, _meta:_meta};

        console.log("Export Character", output);
        let importStr = this.test_printExportJsonAsString(output);

        //test
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
        console.log("COMPABIL", compAbility);
        const statgen = compAbility._compStatgen;
        const s = statgen.__state;
        const chosenModeIx = statgen._meta.ixActiveTab___default;
        const chosenMode = (["none", "rolled", "std_array", "pointbuy"])[chosenModeIx];
        let out = {};
        if(chosenMode == 1){
            /* out = {pb_str:s["pb_str"], pb_dex:s["pb_dex"], pb_con:s["pb_con"],
            pb_wis:s["pb_wis"], pb_int:s["pb_int"], pb_cha:s["pb_cha"],
            pb_budget:s["pb_budget"], pb_isCustom:s["pb_isCustom"], pb_points:s["pb_points"]}; */
        }
        else if(chosenMode == 2){
            out = {array_str_abilSelectedScoreIx:s["array_str_abilSelectedScoreIx"],
            array_dex_abilSelectedScoreIx:s["array_dex_abilSelectedScoreIx"],
            array_con_abilSelectedScoreIx:s["array_con_abilSelectedScoreIx"],
            array_int_abilSelectedScoreIx:s["array_int_abilSelectedScoreIx"],
            array_wis_abilSelectedScoreIx:s["array_wis_abilSelectedScoreIx"],
            array_cha_abilSelectedScoreIx:s["array_cha_abilSelectedScoreIx"]};
        }
        else if(chosenMode == 3){
            out = {pb_str:s["pb_str"], pb_dex:s["pb_dex"], pb_con:s["pb_con"],
            pb_wis:s["pb_wis"], pb_int:s["pb_int"], pb_cha:s["pb_cha"],
            pb_budget:s["pb_budget"], pb_isCustom:s["pb_isCustom"], pb_points:s["pb_points"]};
        }
        out["mode"] = chosenModeIx;
    }
    /**
     * @param {ActorCharactermancerEquipment} compEquipment
     */
    static async getEquipmentData(compEquipment){

        //Get gold
        const compGold = compEquipment._compEquipmentCurrency;
        const remainingCp = compGold.getRemainingCp();
        const out = {remainingCp: remainingCp};

        const compDefault = compEquipment._compEquipmentStartingDefault;
        //const validStandard = compDefault._isValid_standard();
        //const isAvailable = compDefault.isAvailable;
        const formDefault = await compDefault.pGetFormData();
        if(!formDefault.isFormComplete){ console.error(formDefault.messageInvalid); return null;}
        out.itemsDefault = formDefault.data.equipmentItemEntries;

        const isStartingEquipmentActive = compEquipment.isStandardStartingEquipmentActive_();
        if(isStartingEquipmentActive){
            out.mode = "starting";
        }
        else{
            out.mode = "shop";
        }

        const compShop = compEquipment._compEquipmentShopGold;
        const formShop = await compShop.pGetFormData();
        if(!formShop.isFormComplete){ console.error(formShop.messageInvalid); return null;}
        out.itemsShop = formShop.data.equipmentItemEntries;
        return out;
    }
    /**
     * @param {ActorCharactermancerSpell} compSpell
     * @returns {{className:string, classSource:string, spellsByLvl:any[][]}[]}
     */
    static getAllSpells(compSpell){

        let spellsBySource = [];
        for(let j = 0; j < compSpell.compsSpellSpells.length; ++j){
            //Assume this component handles spells for a certain class
            let comp = compSpell.compsSpellSpells[j];
            if(!comp){continue;}
            let className = comp._className;
            let classSource = comp._classSource;
            let spellsByLvl = compSpell.compsSpellSpells[j]._test_getKnownSpells();
            spellsBySource.push({className: className, classSource:classSource, spellsByLvl: spellsByLvl});
        }
        return spellsBySource;
    }
    static getBackground(compBackground){
        return compBackground.getBackground_(); 
    }
    //#endregion

    //#region Get Source Metadata
    /**
     * Gets source metadata for an object (race/class/subclass/spell/etc)
     * @param {{srd:boolean}} item
     * @returns {{isOfficialContent:boolean, brewSource:any}}
     */
    static getSourceMetaData(item){
        //This is not a trustable way to confirm if something is from official sources or not. Yet.
        if(item.srd || this.isFromOfficialSource(item)){
            return {isOfficialContent:true};
        }
        else{ 
            const match = this.matchToBrewSource(item, brewSourcesLoaded);
            if(!match){throw new Error("Failed to get brew source for ", item);}
            return {isOfficialContent:false, brewSource:match};
        }
    }
     /**
     * @returns {{name:string, url:string, isDefault:boolean, isWorldSelectable:boolean, cacheKey:string, _brewUtil: any
     * filterTypes:string[], _pPostLoad:Function, _isExistingPrereleaseBrew:boolean, _isAutoDetectPrereleaseBrew:boolean,
     * abbreviations:string[] _isAutoDetectPrereleaseBrew:boolean, _isExistingPrereleaseBrew:boolean}[]}
     */
    static getLoadedSources(){
        return CharacterBuilder._testLoadedSources;
    }
    static getBrewSources(){
        //Only return non-default sources for now
        return this.getLoadedSources().filter(src => !src.isDefault);
    }
    /**
     * @param {{source:string, name:string}} item
     * @param {{name:string, url:string, abbreviations:string[]}} source
     * @returns {boolean}
     */
    static doesMatchToBrewSource(item, source){

        //The item of course has it's 'source' property, which is likely an abbreviation
        //For for some reasons, we can't assume that it will actually match any of the abbreviations included in the actual brew source
        //So we need to ask Parser to get the correct abbreviation
        const itemSourceAbbreviation = Parser.sourceJsonToAbv(item.source);

        //Match abbreviations
        if(!source.abbreviations.includes(itemSourceAbbreviation)){return false;}

        //Lets get the full name of the source. We expect the name to be split like this: "AUTHOR; BREW_NAME"
        let sourceFullName = "";
        if(!source.name.includes(";")){sourceFullName = source.name;} //Let's have a fallback in case for some reason the name doesnt have a section for the author
        else { sourceFullName = source.name.substring(source.name.indexOf(";") + 1).trim(); } //This is the expected outcome

        //Now we need the source full name on the end of the item in question (like a subclass, feat, or spell)
        //Parser should have this information
        const itemSourceFull = Parser.sourceJsonToFull(item.source); //Expect a full name of the brew here

        if(itemSourceFull == sourceFullName){return true;}
        return false;
    }
    static matchToBrewSource(item, brewSources){
        const matchedBrewSources = brewSources.filter(src => this.doesMatchToBrewSource(item, src));
        if(matchedBrewSources.length < 1){return null;}
        if(matchedBrewSources.length > 1){ console.error("Matched item to multiple brew sources", item, matchedBrewSources); } //something went wrong
        return matchedBrewSources[0];
    }
    /**
     * Checks if an object(race/class/subclass/etc) is from an official source 
     * @param {{__diagnostic:any}} item
     * @returns {boolean}
     */
    static isFromOfficialSource(item){
        //We can either check for a diagnostic property
        if(!item.__diagnostic){return true;}
        //or check is parser knows of the name
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


        const brewSources = CharacterExportFvtt.getBrewSources();
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