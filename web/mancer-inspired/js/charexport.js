class CharacterExportFvtt{

    /* CONCEPT =====================

    */

    /**
     * @param {CharacterBuilder} builder
     */
    static exportCharacter(builder){
        //lets not be verbose here

        const brewSourcesLoaded = this.getBrewSources();

        const _meta = {};
        const _char = {race:null, classes:null};

        let isOfficialContentUsed = false;
        const brewSourcesUsed = []; //Needs to be cleaned of duplicates later

        //Lets start by getting the character race
        const race = builder.compRace.getRace_();
        if(!!race){
            _char.race = {name:race.name, source:race.source, srd:race.srd,
                isSubRace: race._isSubRace, raceName:race.raceName, raceSource:race.raceSource, isBaseSrd:race._baseSrd,
                versionBaseName:race._versionBase_name, versionBaseSource:race._versionBase_source };
            if(race.srd || this.isFromOfficialSource(race)){isOfficialContentUsed=true;}
            else{ const match = this.matchToBrewSource(race, brewSourcesLoaded); if(match){brewSourcesUsed.push(match);} }
        }

        //Now lets get the class information
        const classData = CharacterExportFvtt.getClassData(builder.compClass);
        let classArray = null;
        for(let i = 0; i < classData.length; ++i){
            const data = classData[i];
            if(!data.cls){continue;}
            if(!classArray){classArray = [];}
            const block = {
                name: data.cls.name,
                source: data.cls.source,
                srd: data.cls.srd,
                level: data.targetLevel,
                isPrimary: data.isPrimary
            };
            if(data.cls.srd || this.isFromOfficialSource(data.cls)){isOfficialContentUsed=true;}
            else{ const match = this.matchToBrewSource(data.cls, brewSourcesLoaded); if(match){brewSourcesUsed.push(match);} }

            //Check if high enough level for subclass here?
            if(data.sc){
                console.log(data.sc);
                block.subclass = {
                    name: data.sc.name,
                    source: data.sc.source //maybe we should include some info here (and in class, race, etc) if this is brewed content
                }
                //subclasses generally dont have the 'srd' property
                if(data.sc.srd || this.isFromOfficialSource(data.sc)){isOfficialContentUsed=true;}
                else{ const match = this.matchToBrewSource(data.sc, brewSourcesLoaded); if(match){brewSourcesUsed.push(match);} }
            }
            classArray.push(block);
        }
        _char.classes = classArray;

        //Background information time

        //ability scores (our choices, maybe not the total)

        //equipment (including gold, and bought items)

        //known spells & cantrips

        //Feats

        //optional feature stuff?

        //Build meta
        _meta.isOfficialContentUsed = isOfficialContentUsed;
        _meta.brewSourcesUsed = brewSourcesUsed;

        const output = {character: _char, _meta:_meta};

        console.log("Export Character", output);
    }

    /**
     * @param {ActorCharactermancerClass} compClass
     * @returns {{cls: any, isPrimary: boolean, propIxSubclass:string, targetLevel:number, sc:any}[]}
     */
    static getClassData(compClass) {
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
                propIxSubclass:propIxSubclass,
                targetLevel:targetLevel
            }
            //Now we want to ask compClass if there is a subclass selected for this index
            const sc = compClass.getSubclass_({cls:cls, propIxSubclass:propIxSubclass});
            if(sc != null) { block.sc = sc; }
            classList.push(block);
        }
        return classList;
    }

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
    
}

class CharacterImportFvtt{
    
}