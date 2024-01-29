class ActorCharactermancerSheet extends ActorCharactermancerBaseComponent{
    
    /**
     * What to display on the sheet:
     * 
     * Character name
     * Class
     * Race
     * Size
     * Background - Just the name, right? So custom background is just "Custom Background", nothing else
     * Ability scores (and modifiers) - Not sure if we can get ability score improvements from items, feats (and maybe subclass features?) to work
     * Hit points - This needs CON modifier. Not sure if items, feats (and maybe subclass features?) can be considered
     * Speed - Should be pulled from race. Not sure if we can consider items, class features, feats etc
     * AC - Not sure if we can consider armor, features, items, etc. Unarmored defense?
     * Darkvision
     * Proficiency bonus
     * Inititative bonus - Not sure if we can consider items, class features, feats
     * Proficiencies - armor, weapons, tools, saves, skills
     * Passive proficiency
     * Languages
     * Skills (and their modifiers, with * for proficient, and ** for expertise) (what about half proficiency?)
     * Saves (modifiers, with * for proficient)
     * Encumberance (lift & carry)
     * Item list - (armor has AC in parenthesis) - then total weight
     * Coins + total weight
     * Spell list (known cantrips, lvl1, lvl2, etc. each category shows number of spell slots)
     * 
     * Things we probably can't display on the sheet:
     * 
     * Race features (too long, not sure what would be useful info)
     * Class features (too long, not sure what would be useful info)
     * Subclass features (too long, not sure what would be useful info)
     * Warlock pact magic
     * Battle master manouvers
     * Resistances (comes from items and subclass features, needs serious parsing)
     * Immunities
     * Vulnerabilities
     * Ranger pets
     * Druid shapes
     * Cleric channel divinity
     * Rogue sneak attack
     * Any mystic related stuff
     * Any artificer related stuff
     * Extra attacks
     * Ki points
     * 
    */

    /**
     * @param {{parent:CharacterBuilder}} parentInfo
     */
    constructor(parentInfo) {
        parentInfo = parentInfo || {};
        super();
        this._actor = parentInfo.actor;
        this._data = parentInfo.data; //data is an object containing information about all classes, subclasses, feats, etc
        this._parent = parentInfo.parent;
        this._tabSheet = parentInfo.tabSheet;
  
    }
    render(){
        const tabSheet = this._tabSheet?.$wrpTab;
        if (!tabSheet) { return; }
        const wrapper = $$`<div class="ve-flex-col w-100 h-100 px-1 pt-1 overflow-y-auto ve-grow veapp__bg-foundry"></div>`;
        //const noFeatsWarningLbl = $("<div><i class=\"ve-muted\">No feats are available for your current build.</i><hr class=\"hr-1\"></div>").appendTo(wrapper);
        console.log("RENDER SHEET");
        
        const $wrpDisplay = $(`<div class="ve-flex-col min-h-0 ve-small"></div>`).appendTo(wrapper);
        
        //#region Class
        const $colClass = $$`<div></div>`.appendTo($wrpDisplay);
        //When class changes, redraw the elements
        const hkClass = () => {
            $colClass.empty();
            $colClass.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Class</div>");
            let classData = this.getClassData(this._parent.compClass);
            //If there are no classes selected, just print none and return
            if(!classData?.length){ $colClass.append(`<div>None</div>`); return; }
            for(let i = 0; i < classData.length; ++i){
                const d = classData[i];
                const n =  `Level ${d.targetLevel} ` + d.cls.name + (d.sc? ` (${d.sc.name})` : "") + (d.isPrimary && classData.length > 1? " (Primary)" : "");
                $colClass.append(`<div>${n}</div>`);
            }
        };
        //We need some hooks to redraw class info
        this._parent.compClass.addHookBase("class_ixPrimaryClass", hkClass);
        this._parent.compClass.addHookBase("class_ixMax", hkClass); 
        this._parent.compClass.addHookBase("class_totalLevels", hkClass);
        this._parent.compClass.addHookBase("class_pulseChange", hkClass); //This also senses when subclass is changed
        hkClass();
        //#endregion

        //#region Race
        const $colRace = $$`<div></div>`.appendTo($wrpDisplay);
        //When race version changes, redraw the elements
        const hkRace = () => {
            $colRace.empty();
            $colRace.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Race</div>");
            let curRace = this.getRace_();
            const n = curRace? curRace.name : "None";
            $colRace.append(`<div>${n}</div>`);
        };
        this._parent.compRace.addHookBase("race_ixRace_version", hkRace);
        hkRace();
        //#endregion
        
        //#region Background
        const $colBackground = $$`<div></div>`.appendTo($wrpDisplay);
        const hkBackground = () => {
            $colBackground.empty();
            $colBackground.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Background</div>");
            let curBackground = this.getBackground();
            const n = curBackground? curBackground.name : "None";
            $colBackground.append(`<div>${n}</div>`);
        };
        this._parent.compBackground.addHookBase("background_pulseBackground", hkBackground);
        hkBackground();
        //#endregion

        //#region Ability Scores
        const $colAbilityScores = $$`<div></div>`.appendTo($wrpDisplay);
        const hkAbilities = () => {
            $colAbilityScores.empty();
            $colAbilityScores.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Ability Scores</div>");
            let totals = this.test_grabAbilityScoreTotals(this._parent.compAbility);
            $colAbilityScores.append(`<div>STR: ${totals.values.str}</div>`);
            $colAbilityScores.append(`<div>DEX: ${totals.values.dex}</div>`);
            $colAbilityScores.append(`<div>CON: ${totals.values.con}</div>`);
            $colAbilityScores.append(`<div>INT: ${totals.values.int}</div>`);
            $colAbilityScores.append(`<div>WIS: ${totals.values.wis}</div>`);
            $colAbilityScores.append(`<div>CHA: ${totals.values.cha}</div>`);
            
        };
        this._parent.compAbility.compStatgen.addHookBase("common_export_str", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_dex", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_con", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_int", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_wis", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_cha", hkAbilities);
        hkAbilities();
        //#endregion

        //#region HP, Speed
        const $colHpSpeed = $$`<div></div>`.appendTo($wrpDisplay);
        const hkHpSpeed = () => {
            $colHpSpeed.empty();
            $colHpSpeed.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Hit Points</div>");
            let totals = this.test_grabAbilityScoreTotals(this._parent.compAbility);
            //Let's try to estimate HP
            //Grab constitution score
            const conScore = this.test_grabAbilityScoreTotals(this._parent.compAbility).values.con;
            const conMod = (conScore-10)/2;
            //Grab HP increase mode from class component (from each of the classes!)
            const classList = this.getClassData(this._parent.compClass);
            let hpTotal = 0; //Calculate max
            let levelTotal = 0;
            for(let ix = 0; ix < classList.length; ++ix){
                const data = classList[ix];
                if(!data.cls){continue;}
                //A problem is we dont know what hp increase mode the class is using when a class is first picked (and this hook fires)
                //This is because the components that handle that choice arent built yet
                //So we will need a backup
                let hpMode = -1; let customFormula = "";
                const hpModeComp = this._parent.compClass._compsClassHpIncreaseMode[ix];
                const hpInfoComp = this._parent.compClass._compsClassHpInfo[ix];
                const targetLevel = data.targetLevel || 1;
                
                if(hpModeComp && hpInfoComp){
                    const formData = hpModeComp.pGetFormData();
                    if(formData.isFormComplete){
                        hpMode = formData.data.mode;
                        customFormula = formData.data.formula;
                    }
                }
                if(hpMode<0){ //Fallback
                    hpMode = Config.get("importClass", "hpIncreaseMode") ?? ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__TAKE_AVERAGE;
                    customFormula = Config.get("importClass", "hpIncreaseModeCustomRollFormula") ?? "(2 * @hd.number)d(@hd.faces / 2)";
                }
                
                const hp = ActorCharactermancerSheet.calcHitPointsAtLevel(data.cls.hd.number, data.cls.hd.faces, targetLevel, hpMode, customFormula);
                hpTotal += hp;
                levelTotal += targetLevel;
            }

            hpTotal += (conMod * levelTotal);

            $colHpSpeed.append(`<div>HP: ${hpTotal}</div>`);
        };
        this._parent.compClass.addHookBase("class_ixMax", hkHpSpeed); 
        this._parent.compClass.addHookBase("class_totalLevels", hkHpSpeed);
        this._parent.compAbility.compStatgen.addHookBase("common_export_con", hkHpSpeed);
        this._parent.compClass.addHookBase("class_pulseChange", hkHpSpeed);
        //needs a hook here in case any of the classes change their HP mode
        hkHpSpeed();
        //#endregion

        //#region Skills
        const $colSkills = $$`<div></div>`.appendTo($wrpDisplay);
        const hkSkills = () => {
            console.log("Hkskills");
            $colSkills.empty();
            $colSkills.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Skills</div>");
            //We need to get the proficiency bonus, which is based upon combined class levels
            const profBonus = this._getProfBonus(this._parent.compClass);
            //We now need to get the names of all skill proficiencies
            const proficientSkills = this.grabSkillProficiencies(this._parent.compClass, this._parent.compBackground, this._parent.compRace);
            const allSkillNames = Parser.SKILL_TO_ATB_ABV;
            for(let skillName of Object.keys(allSkillNames)){
                //Get the modifier for the ability score
                let score = this._getAbilityModifier(Parser.SKILL_TO_ATB_ABV[skillName]);
                //Get proficiency / expertise if we are proficient in the skill
                if(proficientSkills[skillName] == 1){score += profBonus;}
                else if(proficientSkills[skillName] == 2){score += (profBonus * 2);}
                $colSkills.append(`<div>${skillName}: ${score>=0?"+"+score : score}</div>`);
            }
        }
        this._parent.compAbility.compStatgen.addHookBase("common_export_str", hkSkills);
        this._parent.compAbility.compStatgen.addHookBase("common_export_dex", hkSkills);
        this._parent.compAbility.compStatgen.addHookBase("common_export_con", hkSkills);
        this._parent.compAbility.compStatgen.addHookBase("common_export_int", hkSkills);
        this._parent.compAbility.compStatgen.addHookBase("common_export_wis", hkSkills);
        this._parent.compAbility.compStatgen.addHookBase("common_export_cha", hkSkills);
        //We need a hook here to understand when proficiencies are lost/gained, and when we level up
        //We can listen to feature source tracker for a pulse regarding skill proficiencies
        this._parent.featureSourceTracker_._addHookBase("pulseSkillProficiencies", hkSkills);
        this._parent.compClass.addHookBase("class_totalLevels", hkSkills);
        hkSkills();
        //#endregion


        //#region Spells
        const $colSpells = $$`<div></div>`.appendTo($wrpDisplay);
        const hkSpells = () => {
            $colSpells.empty();
            $colSpells.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Spells</div>");
            
            const spellsByLvl = ActorCharactermancerSheet.getAllSpells(this._parent.compSpell);
            for(let lvl = 0; lvl < spellsByLvl.length; ++lvl){
                const spellsAtLvl = spellsByLvl[lvl] || null;
                if(!spellsAtLvl || !spellsAtLvl.length){continue;}
                let str = "Cantrips";
                switch(lvl){
                    case 0: str = "Cantrips"; break;
                    case 1: str = "1st Level"; break;
                    case 2: str = "2nd Level"; break;
                    case 3: str = "3rd Level"; break;
                    case 4: str = "4th Level"; break;
                    case 5: str = "5th Level"; break;
                    case 6: str = "6th Level"; break;
                    case 7: str = "7th Level"; break;
                    case 8: str = "8th Level"; break;
                    case 9: str = "9th Level"; break;
                    default: throw new Error("Unimplemented!"); break;
                }
                str += ":";
                $colSpells.append(`<div class="bold mb-2">${str}</div>`);

                let spellsStr = "";
                for(let i = 0; i < spellsAtLvl.length; ++i){
                    spellsStr += spellsAtLvl[i].name;
                    if(i+1 < spellsAtLvl.length){spellsStr += ", ";}
                }
                $colSpells.append(`<div>${spellsStr}</div>`);
            }
        };
        this._parent.compSpell.addHookBase("cntLearnedCantrips", hkSpells);
        this._parent.compSpell.addHookBase("pulseFixedLearned", hkSpells);
        hkSpells();
        //#endregion

        this.grabSkillProficiencies(this._parent.compClass, this._parent.compBackground, this._parent.compRace);

        const sectionParent = $$`<div class="ve-flex-col w-100 h-100 px-1 overflow-y-auto ve-grow veapp__bg-foundry"></div>`;
        


        $$`<div class="ve-flex w-100 h-100">
                <div class="ve-flex-col w-100">
                    ${wrapper}
                </div>
                <div class="vr-1"></div>
                ${sectionParent}
        </div>`.appendTo(tabSheet);

        
       /*  this.setAdditionalFeatStateFromStatgen_();
        const onBackgroundPulse = () => this._state.feat_availableFromBackground =
            this._parent.compBackground.getFeatureCustomizedBackground_({'isAllowStub': false })?.["feats"];
        this._parent.compBackground.addHookBase("background_pulseBackground", onBackgroundPulse);

        this._state.feat_availableFromBackground = this._parent.compBackground.getFeatureCustomizedBackground_({
          'isAllowStub': false
        })?.["feats"]; */
    }

    getRace_() { return this._parent.compRace.getRace_(); }
    getClassData(compClass) {
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
            //Now we want to ask compClass if there is a subclass selected for this index
            const sc = compClass.getSubclass_({cls:cls, propIxSubclass:propIxSubclass});
            if(sc != null) { block.sc = sc; }
            classList.push(block);
        }
        return classList;
    }
    /**
     * Description
     * @param {ActorCharactermancerClass} compClass
     * @param {number} ix
     * @param {number} conMod
     * @returns {number}
     */
    getClassHpInfo(compClass, ix, conMod){
        const hpModeComp = compClass._compsClassHpIncreaseMode[ix];
        const hpInfoComp = compClass._compsClassHpInfo[ix];

        //HP at level 1
        const lvl1Hp = (((hpInfoComp._hitDice.faces / 2) + 1) * hpInfoComp._hitDice.number) + conMod;
        let totalHp = lvl1Hp;
    }
    getBackground(){
        return this._parent.compBackground.getBackground_(); 
    }

    test_gatherExportInfo() {
        //Get class(es) selected
        const p = this._parent;
        //Grab class data
        const classNames = this.test_grabClassNames(p.compClass);
        console.log("Classes: ", classNames);

        //Time to grab race data
        const raceName = this.test_grabRaceName(p.compRace);
        console.log("Race: ", raceName);

         //Grab background name
         const bkName = this.test_grabBackgroundName(p.compBackground);
         console.log("Background: ", bkName);

         //Grab Ability scores
         const abs = this.test_grabAbilityScoreTotals(p.compAbility);
         console.log("Ability Scores: ", abs);

         //Grab spells
         const spells = this.test_grabSpells(p.compSpell);
    }
    test_grabClassNames(compClass){
        const primaryClassIndex = compClass._state.class_ixPrimaryClass;
        //If we have 2 classes, this will be 1
        const highestClassIndex = compClass._state.class_ixMax;

        const classList = []; //lets make this an array of names
        for(let i = 0; i <= highestClassIndex; ++i){
            const isPrimary = i == primaryClassIndex;
            //Get a string property that will help us grab actual class data
            const { propIxClass: propIxClass } =
            ActorCharactermancerBaseComponent.class_getProps(i);
            //Grab actual class data
            const cls = compClass.getClass_({propIxClass: propIxClass});
            if(!cls){continue;}
            classList.push(cls.name + (isPrimary? " (Primary)" : ""));
        }
        return classList;
    }
    test_grabRaceName(compRace){
        const race = compRace.getRace_();
        if(race==null){return "no race";}
        return race.name;
    }
    test_grabBackgroundName(compBackground){
        const b = compBackground.getBackground_();
        if(b==null){return "no background";}
        return b.name;
    }
    test_grabAbilityScoreTotals(compAbility) {
        const info = compAbility.getTotals();
        if(info.mode == "none"){return {mode: info.mode, values: {str:0,dex:0, con:0, int:0, wis:0, cha:0}};}
        const result = info.totals[info.mode];
        return {mode: info.mode, values: result};
    }

    /**
     * Description
     * @param {ActorCharactermancerClass} compClass
     * @param {ActorCharactermancerBackground} compBackground
     * @param {ActorCharactermancerRace} compRace
     * @returns {any}
     */
    grabSkillProficiencies(compClass, compBackground, compRace){
        //What can give us proficiencies?
        //Classes
        //Subclasses
        //Backgrounds
        //Races
        //Feats

        let skillsDb = {};
        const pasteSkillVals = (fromSkills) => {
            if(fromSkills){
                for(let skillName of Object.keys(fromSkills)){
                    skillName = skillName.toLowerCase(); //enforce lower case, just for safety
                    let skillVal = fromSkills[skillName];
                    let existingSkillVal = skillsDb[skillName] || 0;
                    //Only replace values if higher
                    //1 means proficiency, 2 means expertise
                    if(skillVal > existingSkillVal){skillsDb[skillName] = skillVal;}
                }
            }
        }
        //Get number of classes
        const highestClassIndex = compClass._state.class_ixMax;
        //Then paste skills gained from each class
        for(let ix = 0; ix <= highestClassIndex; ++ix){
            const subComp = compClass.compsClassSkillProficiencies[ix];
            if(subComp){
                const classSkillsForm = subComp._getFormData();
                pasteSkillVals(classSkillsForm.data.skillProficiencies);
            }
        }
        //Then paste skills gained from race
        if(compRace.compRaceSkillProficiencies){
            const raceSkillsForm = compRace.compRaceSkillProficiencies.pGetFormData();
            console.log("RACESKILLSFORM", raceSkillsForm, compRace.compRaceSkillProficiencies);
            pasteSkillVals(raceSkillsForm.data.skillProficiencies);
        }
        console.log("COMPRACE", compRace);
        //Then paste skills gained from background
        if(compBackground.compBackgroundSkillProficiencies){
            const bkSkillsForm = compBackground.compBackgroundSkillProficiencies.pGetFormData();
            pasteSkillVals(bkSkillsForm.data.skillProficiencies);
        }
        console.log("GAINED SKILLS", skillsDb);
        return skillsDb;
    }
    _getProfBonus(compClass){
        const classList = this.getClassData(this._parent.compClass);
        let levelTotal = 0;
        for(let ix = 0; ix < classList.length; ++ix){
            const data = classList[ix];
            if(!data.cls){continue;}
            const targetLevel = data.targetLevel || 1;
            levelTotal += targetLevel;
        }

        return Parser.levelToPb(levelTotal);
    }
    _getAbilityModifier(abl_abrivation, total=null){
        if(total == null){
            const compability = this._parent.compAbility.compStatgen;
            const totals = this.test_grabAbilityScoreTotals(this._parent.compAbility);
            total = totals.values[abl_abrivation];
        }
        return (total-10) / 2;
    }


    /**
     * @param {ActorCharactermancerSpell} compSpells
     */
    test_grabSpells(compSpells){
        let spellsKnown = new Array(10);
        for(let j = 0; j < compSpells.compsSpellSpells.length; ++j)
        {
            const comp1 = compSpells.compsSpellSpells[j];
            for(let spellLevelIx = 0; spellLevelIx < comp1._compsLevel.length; ++spellLevelIx)
            {
                const comp2 = comp1._compsLevel[spellLevelIx];
                const known = comp2.getSpellsKnown();
                console.log("Known spells of level " + spellLevelIx, known);
                for(let arrayEntry of known){
                    spellsKnown[spellLevelIx].push(arrayEntry.spell.name);
                }
            }
        }
    }

    /**
     * * @param {number} hitDiceNumber
     * @param {number} hitDiceFaces
     * @param {number} level
     * @param {number} mode
     * @param {string} customFormula
     * @returns {number}
     */
    static calcHitPointsAtLevel(hitDiceNumber, hitDiceFaces, level, mode, customFormula){
        switch(mode){
            case 0: //Take Average
                return (hitDiceFaces * hitDiceNumber) + ((((hitDiceFaces * hitDiceNumber) / 2)+1) * (level-1));
            case 1: //Minimum Value
                return (hitDiceFaces * hitDiceNumber) + ((1) * (level-1));
            case 2: //Maximum Value
                return (hitDiceFaces * hitDiceNumber) + (((hitDiceFaces * hitDiceNumber)) * (level-1));
            case 3: //Roll
                console.error("Roll mode not yet implemented!"); return;
            case 4: //Custom Formula
                console.error("Custom Formula mode not yet implemented!"); return;
            case 5: //Do Not Increase HP
                return (hitDiceFaces * hitDiceNumber);
            default: console.error("Unimplemented!"); return 0;
        }
    }

    /**
     * @param {ActorCharactermancerSpell} compSpells
     * @returns {any[][]}
     */
    static getAllSpells(compSpells){
        let spellsBylevel = new Array(10);
        for(let j = 0; j < compSpells.compsSpellSpells.length; ++j)
        {
            const comp1 = compSpells.compsSpellSpells[j];
            for(let spellLevelIx = 0; spellLevelIx < comp1._compsLevel.length; ++spellLevelIx)
            {
                const subcomponent = comp1._compsLevel[spellLevelIx];
                const known = subcomponent.getSpellsKnown();
                for(let arrayEntry of known){
                    spellsBylevel[spellLevelIx].push(arrayEntry.spell.name);
                }
            }
        }

        return spellsBylevel;
    }


}