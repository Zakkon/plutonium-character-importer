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

        const sheet = $$`<div></div>`.appendTo(wrapper);
        /* const $wrpSheetHeader = $$`<div></div>`.appendTo(sheet);
        const $wrpCharName = $$`<div class="charname"><label>Character Name</label></div>`.appendTo($wrpSheetHeader);
        const $wrpMisc = $$`<div class="misc"></div>`.appendTo($wrpSheetHeader);

        const $wrpSheetMain = $$`<div></div>`.appendTo(sheet);
        const $wrpAttributes = $$`<div class="attributes"></div>`.appendTo($wrpSheetMain);
        const $scores = $$`<div class="scores"></div>`.appendTo($wrpAttributes);
        const $scoresUl = $$`<ul></ul>`.appendTo($scores);
        
        //One score as test
        $$`<li>
            <div class="score">
                <label for="Strengthscore">Strength</label><label class="stat"/>10</label>
            </div>
            <div class="modifier">
                <label class="statmod"/>+0</label>
            </div>
        </li>`.appendTo($scoresUl); */

        const $form = $$`<form class="charsheet"></form>`;
        const $lblClass = $$`<label class="lblResult"></label>`;
        const $lblRace = $$`<label class="lblResult"/></label>`;
        const $lblBackground = $$`<label class="lblResult"/></label>`;
        

        const headerSection = $$`<header><section class="charname">
        <label for="charname">Character Name</label><input name="charname" placeholder="Thoradin Fireforge" />
      </section>
      <section class="misc">
        <ul>
          <li>
            <label class="lblTitle">Class & Level</label>${$lblClass}
          </li>
          <li>
            <label  class="lblTitle">Background</label>${$lblBackground}
          </li>
          <li>
            <label  class="lblTitle">Player Name</label><input class="lblResult" name="playername" placeholder="Player McPlayerface">
          </li>
          <li>
            <label  class="lblTitle">Race</label>${$lblRace}
          </li>
          <li>
            <label  class="lblTitle">Alignment</label><input class="lblResult" name="alignment" placeholder="Lawful Good" />
          </li>
          <li>
            <label  class="lblTitle">Experience Points</label><input class="lblResult" name="experiencepoints" placeholder="3240" />
          </li>
        </ul>
      </section>
    </header>`.appendTo($form);

    const $sectionAttributeScores = $$`<div class="scores"></div>`;
    const $lblProfBonus = $$`<label class ="lblProfScore">+2</label>`;
    const $sectionSkills = $$`<ul></ul>`;
    const $lblArmorClass = $$`<label class="score"></label>`;
    const $lblInitiative = $$`<label class="score"></label>`;
    const $sectionSaves = $$`<ul></ul>`;
    const $lblSpeed = $$`<label class="score"></label>`;
    const $armorWornText = $$`<span></span>`;
    const $spanWeaponProf = $$`<span></span>`;
    const $spanArmorProf = $$`<span></span>`;
    const $spanToolsProf = $$`<span></span>`;
    const $spanLanguages = $$`<span></span>`;
    const $divFeatures = $$`<div class ="featureTextArea textbox"></div>`;
    const $divEquipment = $$`<div class ="equipmentTextArea textbox"></div>`;
    const $attacksTextArea = $$`<div class ="attacksTextArea textbox"></div>`;
    const $lblMaxHP = $$`<label class="score"></label>`;
    const $lblHitDice = $$`<label class="scoreHitDice"></label>`;

    const mainSection = $$`<main>
    <section>
      <section class="attributes">
        ${$sectionAttributeScores}
        <div class="attr-applications">
          <div class="inspiration box">
            <div class="label-container">
              <label for="inspiration">Inspiration</label>
            </div>
            <input name="inspiration" type="checkbox" />
          </div>
          <div class="proficiencybonus box">
            <div class="label-container">
              <label class="upperCase">Proficiency Bonus</label>
            </div>
            ${$lblProfBonus}
          </div>
          <div class="saves list-section box">
            ${$sectionSaves}
            <div class="label">
              Saving Throws
            </div>
          </div>
          <div class="skills list-section box">
            ${$sectionSkills}
            <div class="label">Skills</div>
          </div>
        </div>
      </section>
      <div class="passive-perception box">
        <div class="label-container">
          <label class="upperCase">Passive Wisdom (Perception)</label>
        </div>
        <input name="passiveperception" placeholder="10" />
      </div>
      <div class="otherprofs box textblock">
        <label class="footerLabel upperCase">Other Proficiencies and Languages</label>
        <div class="profTextArea textbox">
          <div><b>Armor: </b>${$spanArmorProf}</div>
          <div><b>Weapons: </b>${$spanWeaponProf}</div>
          <div><b>Tools: </b>${$spanToolsProf}</div>
          <div><b>Languages: </b>${$spanLanguages}</div>
        </div>
      </div>
    </section>
    <section>
      <section class="combat">
        <div class="scoreBubble">
          <div>
            <label class="title upperCase">Armor Class</label>${$lblArmorClass}
          </div>
        </div>
        <div class="scoreBubble">
          <div>
            <label class="title upperCase">Initiative</label>${$lblInitiative}
          </div>
        </div>
        <div class="scoreBubble">
          <div>
            <label class="title upperCase">Speed</label>${$lblSpeed}
          </div>
        </div>
        <div class="armorWornText"><b>Armor worn: </b>${$armorWornText}</div>
        <div class="scoreBubbleWide">
          <div>
            <label class="title upperCase">Max HP</label>${$lblMaxHP}
          </div>
        </div>
        <div class="scoreBubbleWide">
          <div>
            <label class="title upperCase">Hit Dice</label>${$lblHitDice}
          </div>
        </div>
      </section>
      <section class="attacksandspellcasting">
        <div>
          <label class="upperCase">Attacks & Spellcasting</label>
          <table>
            <thead>
              <tr>
                <th>
                  Name
                </th>
                <th>
                  Atk Bonus
                </th>
                <th>
                  Damage/Type
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input name="atkname1" type="text" />
                </td>
                <td>
                  <input name="atkbonus1" type="text" />
                </td>
                <td>
                  <input name="atkdamage1" type="text" />
                </td>
              </tr>
              <tr>
                <td>
                  <input name="atkname2" type="text" />
                </td>
                <td>
                  <input name="atkbonus2" type="text" />
                </td>
                <td>
                  <input name="atkdamage2" type="text" />
                </td>
              </tr>
              <tr>
                <td>
                  <input name="atkname3" type="text" />
                </td>
                <td>
                  <input name="atkbonus3" type="text" />
                </td>
                <td>
                  <input name="atkdamage3" type="text" />
                </td>
              </tr>
            </tbody>
          </table>
          ${$attacksTextArea}
        </div>
      </section>
      <section class="equipment">
        <div>
          <label class="upperCase">Equipment</label>
          <div class="money">
            <ul>
              <li>
                <label for="cp">cp</label><input name="cp" />
              </li>
              <li>
                <label for="sp">sp</label><input name="sp" />
              </li>
              <li>
                <label for="ep">ep</label><input name="ep" />
              </li>
              <li>
                <label for="gp">gp</label><input name="gp" />
              </li>
              <li>
                <label for="pp">pp</label><input name="pp" />
              </li>
            </ul>
          </div>
          ${$divEquipment}
        </div>
      </section>
    </section>
    <section>
      <section class="flavor">
        <div class="personality">
          <label for="personality">Personality</label><textarea name="personality"></textarea>
        </div>
        <div class="ideals">
          <label for="ideals">Ideals</label><textarea name="ideals"></textarea>
        </div>
        <div class="bonds">
          <label for="bonds">Bonds</label><textarea name="bonds"></textarea>
        </div>
        <div class="flaws">
          <label for="flaws">Flaws</label><textarea name="flaws"></textarea>
        </div>
      </section>
      <section class="features">
        <div>
          <label class="upperCase">Features & Traits</label>${$divFeatures}
        </div>
      </section>
    </section>
  </main>`;
  mainSection.appendTo($form);

    $form.appendTo(sheet);


        const $wrpDisplay = $(`<div class="ve-flex-col min-h-0 ve-small"></div>`).appendTo(wrapper);

        //#region Class
        const $colClass = $$`<div></div>`.appendTo($wrpDisplay);
        //When class changes, redraw the elements
        const hkClass = () => {
            $colClass.empty();
            $divFeatures.empty();
            $colClass.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Class</div>");
            let classData = this.getClassData(this._parent.compClass);
            //If there are no classes selected, just print none and return
            let textOut = "";
            if(!classData?.length){ $colClass.append(`<div>None</div>`); $lblClass.html(textOut); return; }
            for(let i = 0; i < classData.length; ++i){
                const d = classData[i];
                const n =  `Level ${d.targetLevel} ` + d.cls.name + (d.sc? ` (${d.sc.name})` : "") + (d.isPrimary && classData.length > 1? " (Primary)" : "");
                $colClass.append(`<div>${n}</div>`);
                textOut += `${textOut.length > 0? " / " : ""}${d.cls.name} ${d.targetLevel}${d.sc? ` (${d.sc.name})` : ""}`;

                //Try to get features from class
                console.log("SUBCLASS", d.sc);
                let classFeaturesText = "";
                for(let f of d.cls.classFeatures){
                  for(let l of f.loadeds){
                    if(l.entity.level > d.targetLevel){continue;}
                    classFeaturesText += `${classFeaturesText.length > 0? ", " : ""}${l.entity.name}`;
                  }
                }
                if(classFeaturesText.length > 0){
                  $$`<div><b>${d.cls.name} Class Features:</b></div>`.appendTo($divFeatures);
                  $$`<div>${classFeaturesText}</div>`.appendTo($divFeatures);
                }

                if(d.sc){
                  let subclassFeaturesText = "";
                  for(let f of d.sc.subclassFeatures){
                    for(let l of f.loadeds){
                      if(l.entity.level > d.targetLevel){continue;}
                      subclassFeaturesText += `${subclassFeaturesText.length > 0? ", " : ""}${l.entity.name}`;
                    }
                  }
                  if(subclassFeaturesText.length > 0){
                    $$`<div><b>${d.sc.name} Subclass Features:</b></div>`.appendTo($divFeatures);
                    $$`<div>${subclassFeaturesText}</div>`.appendTo($divFeatures);
                  }
                  
                }
            }
            $lblClass.html(textOut);
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
            $lblRace.text(n);
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
            $lblBackground.text(n);
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
            $colAbilityScores.append(`<div>WIS: ${totals.values.wis}</div>`);
            $colAbilityScores.append(`<div>INT: ${totals.values.int}</div>`);
            $colAbilityScores.append(`<div>CHA: ${totals.values.cha}</div>`);


            //NEW UI STUFF
            const createAbilityScoreElement = (label, score) => {
                const modifier = Math.floor((score-10) / 2);
                return $$`<li>
                <div class="score">
                  <label class="ablName upperCase">${label}</label><label class="stat"/>${score}</label>
                </div>
                <div class="modifier">
                  <label class="statmod"/>${modifier>=0?"+"+modifier : modifier}</label>
                </div>
              </li>`;
            }
            $sectionAttributeScores.empty();
            const ul = $$`<ul></ul>`;
            ul.append(createAbilityScoreElement("Strength", totals.values.str));
            ul.append(createAbilityScoreElement("Dexterity", totals.values.dex));
            ul.append(createAbilityScoreElement("Constitution", totals.values.con));
            ul.append(createAbilityScoreElement("Wisdom", totals.values.wis,));
            ul.append(createAbilityScoreElement("Intelligence", totals.values.int));
            ul.append(createAbilityScoreElement("Charisma", totals.values.cha));
            ul.appendTo($sectionAttributeScores);

            //Calculate saving throws
            let saves = this._grabSavingThrowProficiencies();
            const createSavingThrowElement = (label, attr, totals, proficiencies, profBonus) => {

                const isProficient = !!proficiencies[attr];
                const modifier = this._getAbilityModifier(attr, totals.values[attr]) + (isProficient? profBonus : 0);
                const checkbox = $$`<input type="checkbox"></input>`;
                //TODO: Add another class to it if expertise? this could change the color of the checkbox
                //Alternatively, just create two smaller checkboxes instead?
                //Alternatively, just replace the checkbox with an icon
                //Check it if proficient or expertise
                checkbox.prop("checked", isProficient);

                return $$`<li>
                    <label>${label}</label>
                    <label class="modifier">${modifier>=0?"+"+modifier : modifier}</label>
                    ${checkbox}
                </li>`;
            }

            const profBonus = this._getProfBonus(this._parent.compClass);
            $sectionSaves.empty();
            $sectionSaves.append(createSavingThrowElement("Strength", "str", totals, saves, profBonus));
            $sectionSaves.append(createSavingThrowElement("Dexterity", "dex", totals, saves, profBonus));
            $sectionSaves.append(createSavingThrowElement("Constitution", "con", totals, saves, profBonus));
            $sectionSaves.append(createSavingThrowElement("Wisdom",  "wis", totals, saves, profBonus));
            $sectionSaves.append(createSavingThrowElement("Intelligence",  "int", totals, saves, profBonus));
            $sectionSaves.append(createSavingThrowElement("Charisma",  "cha", totals, saves, profBonus));
        };
        this._parent.compAbility.compStatgen.addHookBase("common_export_str", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_dex", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_con", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_int", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_wis", hkAbilities);
        this._parent.compAbility.compStatgen.addHookBase("common_export_cha", hkAbilities);
        hkAbilities();
        //#endregion

        //#region HP, Speed, Initiative
        const $colHpSpeed = $$`<div></div>`.appendTo($wrpDisplay);
        const $lblAC = $$`<div></div>`.appendTo($wrpDisplay); 
        const hkHpSpeed = () => {
            $colHpSpeed.empty();
            $colHpSpeed.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Hit Points</div>");
            let totals = this.test_grabAbilityScoreTotals(this._parent.compAbility);
            //Let's try to estimate HP
            //Grab constitution score
            const conMod = this._getAbilityModifier("con");
            const dexMod = this._getAbilityModifier("dex");
            //Grab HP increase mode from class component (from each of the classes!)
            const classList = this.getClassData(this._parent.compClass);
            let hpTotal = 0; //Calculate max
            let levelTotal = 0;
            let hitDiceInfo = {};
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

                if(!hitDiceInfo[data.cls.hd.faces]){
                  hitDiceInfo[data.cls.hd.faces] = data.cls.hd.number;
                }
                else{
                  hitDiceInfo[data.cls.hd.faces] += data.cls.hd.number;
                }
            }

            hpTotal += (conMod * levelTotal);

            $colHpSpeed.append(`<div>HP: ${hpTotal}</div>`);
            $lblMaxHP.text(hpTotal);
            $lblHitDice.empty();
            for(let diceSize of Object.keys(hitDiceInfo)){
              let str = hitDiceInfo[diceSize]+"d"+diceSize;
              $$`<div>${str}</div>`.appendTo($lblHitDice);
            }


            const scoreInitiative = dexMod;
            $lblInitiative.html(`${scoreInitiative>=0?"+"+scoreInitiative : scoreInitiative}`);

            const speedFt = 30;
            $lblSpeed.html(`${speedFt}`);
        };
        this._parent.compClass.addHookBase("class_ixMax", hkHpSpeed); 
        this._parent.compClass.addHookBase("class_totalLevels", hkHpSpeed);
        this._parent.compAbility.compStatgen.addHookBase("common_export_con", hkHpSpeed);
        this._parent.compAbility.compStatgen.addHookBase("common_export_dex", hkHpSpeed);
        this._parent.compClass.addHookBase("class_pulseChange", hkHpSpeed);
        //needs a hook here in case any of the classes change their HP mode
        hkHpSpeed();
        //#endregion

        //#region Proficiencies
        //#region Skills
        const $colSkills = $$`<div></div>`.appendTo($wrpDisplay);
        const hkSkills = () => {
            console.log("Hkskills");
            $colSkills.empty();
            $sectionSkills.empty();
            $colSkills.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Skills</div>");
            //We need to get the proficiency bonus, which is based upon combined class levels
            const profBonus = this._getProfBonus(this._parent.compClass);
            //We now need to get the names of all skill proficiencies
            const proficientSkills = this._grabSkillProficiencies();
            const allSkillNames = Parser.SKILL_TO_ATB_ABV;
            for(let skillName of Object.keys(allSkillNames)){
                //Get the modifier for the ability score
                let score = this._getAbilityModifier(Parser.SKILL_TO_ATB_ABV[skillName]);
                //Get proficiency / expertise if we are proficient in the skill
                if(proficientSkills[skillName] == 1){score += profBonus;}
                else if(proficientSkills[skillName] == 2){score += (profBonus * 2);}
                $colSkills.append(`<div>${skillName}: ${score>=0?"+"+score : score}</div>`);

                const checkbox = $$`<input type="checkbox"></input>`;
                //TODO: Add another class to it if expertise? this could change the color of the checkbox
                //Alternatively, just create two smaller checkboxes instead?
                //Alternatively, just replace the checkbox with an icon
                //Check it if proficient or expertise
                checkbox.prop("checked", proficientSkills[skillName] > 0);
                
                $$`<li>
                <label for="Acrobatics">${skillName} <span class="skill">(${Parser.SKILL_TO_ATB_ABV[skillName]})</span></label>
                <label class="modifier">${score>=0?"+"+score : score}</label>${checkbox}
                </li>`.appendTo($sectionSkills);
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

        //#region Tools
        const $colTools = $$`<div></div>`.appendTo($wrpDisplay);
        const hkTools = () => {
            $colTools.empty();
            $spanToolsProf.text("");
            $colTools.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Tools</div>");
            //We now need to get the names of all tool proficiencies
            const proficientTools = this._grabToolProficiencies();
            console.log("PROFTOOLS", proficientTools);
            let outStr = "";
            for(let toolName of Object.keys(proficientTools)){
                console.log("TOOL NAME", toolName);
                $colTools.append(`<div>${toolName}</div>`);
                outStr += outStr.length>0? ", " : "";
                outStr += toolName;
            }
            $spanToolsProf.text(outStr);
        }
        //We need a hook here to understand when proficiencies are lost/gained, and when we level up
        //We can listen to feature source tracker for a pulse regarding skill proficiencies
        this._parent.featureSourceTracker_._addHookBase("pulseToolsProficiencies", hkTools);
        this._parent.compClass.addHookBase("class_totalLevels", hkTools);
        hkTools();
        //#endregion
        //#region Weapons
        const $colWeaponsArmor = $$`<div></div>`.appendTo($wrpDisplay);
        const hkWeaponsArmor = () => {
            $colWeaponsArmor.empty();
            $spanWeaponProf.text("");
            $spanArmorProf.text("");
            let outStrWep = "";
            let outStrArm = "";
            $colWeaponsArmor.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Weapon Proficiencies</div>");
            //We now need to get the names of all tool proficiencies
            const weapons = this._grabWeaponProficiencies();
            for(let name of Object.keys(weapons)){
                $colWeaponsArmor.append(`<div>${name}</div>`);
                outStrWep += outStrWep.length>0? ", " : "";
                outStrWep += name;
            }
            $colWeaponsArmor.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Armor Proficiencies</div>");
            const armors = this._grabArmorProficiencies();
            for(let name of Object.keys(armors)){
                $colWeaponsArmor.append(`<div>${name}</div>`);
                outStrArm += outStrArm.length>0? ", " : "";
                outStrArm += name;
            }
            $spanWeaponProf.text(outStrWep);
            $spanArmorProf.text(outStrArm);
        }
        //We need a hook here to understand when proficiencies are lost/gained, and when we level up
        //We can listen to feature source tracker for a pulse regarding skill proficiencies
        this._parent.featureSourceTracker_._addHookBase("pulseToolsProficiencies", hkWeaponsArmor);
        this._parent.compClass.addHookBase("class_totalLevels", hkWeaponsArmor);
        hkWeaponsArmor();
        //#endregion
        //#region Language
        const $colLanguages = $$`<div></div>`.appendTo($wrpDisplay);
        const hkLanguages = () => {
            $colLanguages.empty();
            $spanLanguages.text("");
            let outStr = "";
            $colLanguages.append("<hr class=\"hr-2\"><div class=\"bold mb-2\">Languages</div>");
            const languages = this._grabLanguageProficiencies();
            for(let name of Object.keys(languages)){
                $colLanguages.append(`<div>${name}</div>`);
                outStr += outStr.length>0? ", " : "";
                outStr += name;
            }
            $spanLanguages.text(outStr);
        }
        this._parent.featureSourceTracker_._addHookBase("pulseLanguageProficiencies", hkLanguages);
        this._parent.compClass.addHookBase("class_totalLevels", hkLanguages);
        hkLanguages();
        //#endregion
        //#region Saving Throws
        //#endregion
        //#endregion

        //#region Attacks
        const hkCalcAttacks = () => {
          this._getOurItems().then(result => {
            $attacksTextArea.empty();
            //Try to fill in weapon attacks
            const weaponProfs = this._grabWeaponProficiencies();
            const strMod = this._getAbilityModifier("str");
            const dexMod = this._getAbilityModifier("dex");
            const profBonus = this._getProfBonus();
            const calcMeleeAttack = (it, strMod, dexMod, weaponProfs) => {
              const isProficient = !!weaponProfs[it.item.weaponCategory.toLowerCase()];
              const attr = (!!it.item.property["F"] && dexMod > strMod)? dexMod : strMod; //If weapon is finesse and our dex is better, use dex
              const toHit = attr + (isProficient? profBonus : 0);
              const dmg = it.item.dmg1 + (attr>=0? "+" : "") + attr.toString();
              return {toHit:(toHit>=0? "+" : "")+toHit.toString(), dmg:dmg, dmgType:it.item.dmgType};
            }
            const printWeaponAttack = (it) => {
              const isMeleeWeapon = it.item._typeListText.includes("melee weapon");
              const isRangedWeapon = it.item._typeListText.includes("ranged weapon");

              if(isMeleeWeapon){
                const result = calcMeleeAttack(it, strMod, dexMod, weaponProfs);
                let str = `<i>Melee Weapon Attack</i>, ${result.toHit} to hit, ${result.dmg} ${Parser.dmgTypeToFull(result.dmgType)}.`;
                $$`<div><b>${it.item.name}.</b> ${str}</div>`.appendTo($attacksTextArea);
              }
              //TODO: ranged weapons
            }

            for(let it of result.startingItems){
              if(!it.item.weapon){continue;}
              printWeaponAttack(it);
            }
            for(let it of result.boughtItems){
              if(!it.item.weapon){continue;}
              printWeaponAttack(it);
              
            }
            //TODO: cantrip attacks
          });
          
        }
        this._parent.compEquipment._compEquipmentShopGold._addHookBase("itemPurchases", hkCalcAttacks);
        this._parent.compAbility.compStatgen.addHookBase("common_export_dex", hkCalcAttacks);
        hkCalcAttacks();
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
                    spellsStr += spellsAtLvl[i];
                    if(i+1 < spellsAtLvl.length){spellsStr += ", ";}
                }
                $colSpells.append(`<div>${spellsStr}</div>`);
            }

            hkCalcAttacks(); //Calculate attacks as well, since it displays cantrip attacks
        };
        this._parent.compSpell.addHookBase("pulsePreparedLearned", hkSpells);
        this._parent.compSpell.addHookBase("pulseAlwaysPrepared", hkSpells);
        this._parent.compSpell.addHookBase("pulseAlwaysKnown", hkSpells);
        this._parent.compSpell.addHookBase("pulseExpandedSpells", hkSpells); //Not sure if this one is needed
        hkSpells();
        //#endregion

        const hkEquipment = () => {
            this._calcArmorClass().then(result=>{
                $lblAC.empty();
                const str = `AC: ${result.ac} (${result.name})`;
                $lblAC.append(`<div>${str}</div>`);
                $lblArmorClass.text(result.ac);
                $armorWornText.text(result.name);
            });

            //Fill UI list of items
            $divEquipment.empty();
            

            this._getOurItems().then(result => {
              $divEquipment.empty();
             
              let outStr = "";
              for(let it of result.startingItems){
                console.log("IT", it.item.name, it);
                outStr += (outStr.length>0? ", " : "") + (it.quantity>1? it.quantity+"x " : "") + it.item.name;
              }
              for(let it of result.boughtItems){
                console.log("IT", it.item.name, it);
                outStr += (outStr.length>0? ", " : "") + (it.quantity>1? it.quantity+"x " : "") + it.item.name;
              }
              const span = $$`<span>${outStr}</span>`;
              $$`<label><b>Carried Gear: </b>${span}</label>`.appendTo($divEquipment);
            });
            
        }
        this._parent.compEquipment._compEquipmentShopGold._addHookBase("itemPurchases", hkEquipment);
        this._parent.compAbility.compStatgen.addHookBase("common_export_dex", hkEquipment);
        this._parent.compAbility.compStatgen.addHookBase("common_export_cha", hkEquipment);
        hkEquipment();

        

        wrapper.appendTo(tabSheet);

        
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

    _pullProficienciesFromComponentForm(component, output, prop, isStringArray = false){
        const pasteVals = (fromSkills, isStringArray) => {
            if(fromSkills){
                if(isStringArray){
                    for(let str of fromSkills){
                        output[str] = 1;
                    }
                }
                else{
                    for(let skillName of Object.keys(fromSkills)){
                        skillName = skillName.toLowerCase(); //enforce lower case, just for safety
                        let skillVal = fromSkills[skillName];
                        let existingSkillVal = output[skillName] || 0;
                        //Only replace values if higher
                        //1 means proficiency, 2 means expertise
                        if(skillVal > existingSkillVal){output[skillName] = skillVal;}
                    }
                }
            }
        }

        if(!component){return;}
        const form = component.pGetFormData();
        console.log("FORM", prop, form);
        pasteVals(form.data[prop], isStringArray);
    }
    async _getOurItems() {
      let boughtItems = [];
      let startingItems = [];
      //Try to get items from bought items (we will do starting items later)
      const compEquipShop = this._parent.compEquipment._compEquipmentShopGold;
      //Go through bought items
      const itemKeys = compEquipShop.__state.itemPurchases;
      const itemDatas = compEquipShop.__state.itemDatas.item;
      for(let item of itemKeys){
          //cant be trusted to not be null
          const foundItem = ActorCharactermancerEquipment.findItemByUID(item.data.uid, itemDatas);
          console.log("FOUNDITEM", item.data);
          if(!foundItem){continue;}
          boughtItems.push({item:foundItem, quantity:item.data.quantity});
      }

      //We also need to go through starting items
      const rolledForGold = !!this._parent.compEquipment._compEquipmentCurrency._state.cpRolled;
      if(!rolledForGold)
      {
          //If we rolled for gold, it means we dont get any default starting equipment
          const compEquipDefault = this._parent.compEquipment._compEquipmentStartingDefault;
          const form = await compEquipDefault.pGetFormData();
          const items = form.data.equipmentItemEntries;
          for(let it of items){
            startingItems.push(it);
          }
      }

      return {boughtItems: boughtItems, startingItems:startingItems};
    }

    /**
     * Description
     * @param {ActorCharactermancerClass} compClass
     * @param {ActorCharactermancerBackground} compBackground
     * @param {ActorCharactermancerRace} compRace
     * @returns {{acrobatics:number, athletics:number}} Returned object has a bunch of parameters named after skills, their values are either 1 (proficient) or 2 (expertise)
     */
    _grabSkillProficiencies(){
        //What can give us proficiencies?
        //Classes
        //Subclasses
        //Backgrounds
        //Races
        //Feats

        const compClass = this._parent.compClass;
        const compBackground = this._parent.compBackground;
        const compRace = this._parent.compRace;
        const dataProp = "skillProficiencies";

        let out = {};

        //Get number of classes
        const highestClassIndex = compClass._state.class_ixMax;
        //Then paste skills gained from each class
        for(let ix = 0; ix <= highestClassIndex; ++ix){
            this._pullProficienciesFromComponentForm(compClass.compsClassSkillProficiencies[ix], out, dataProp);
        }
        this._pullProficienciesFromComponentForm(compRace.compRaceSkillProficiencies, out, dataProp);
        this._pullProficienciesFromComponentForm(compBackground.compBackgroundSkillProficiencies, out, dataProp);

        return out;
    }
     /**
     * Description
     * @param {ActorCharactermancerClass} compClass
     * @param {ActorCharactermancerBackground} compBackground
     * @param {ActorCharactermancerRace} compRace
     * @returns {{"disguise kit":number, "musical instrument":number}} Returned object has a bunch of parameters named after skills, their values are either 1 (proficient) or 2 (expertise)
     */
     _grabToolProficiencies(){
        //What can give us proficiencies?
        //Classes
        //Subclasses
        //Backgrounds
        //Races
        //Feats
        const compClass = this._parent.compClass;
        const compBackground = this._parent.compBackground;
        const compRace = this._parent.compRace;
        const dataProp = "toolProficiencies";

        let out = {};
        //Get number of classes
        const highestClassIndex = compClass._state.class_ixMax;
        //Then paste skills gained from each class
        for(let ix = 0; ix <= highestClassIndex; ++ix){
            this._pullProficienciesFromComponentForm(compClass.compsClassToolProficiencies[ix], out, dataProp);
        }
        this._pullProficienciesFromComponentForm(compRace.compRaceToolProficiencies, out, dataProp);
        this._pullProficienciesFromComponentForm(compBackground.compBackgroundToolProficiencies, out, dataProp);

        console.log("GAINED TOOLS", out);
        return out;
    }
    
    /**
     * @returns {{"simple":number, "dagger":number}} Returned object has a bunch of parameters named after skills, their values are either 1 (proficient) or 2 (expertise)
     */
     _grabWeaponProficiencies(){
        //What can give us proficiencies?
        //Classes
        //Feats?
        const compClass = this._parent.compClass;
        const dataProp = "weapons";

        let out = {};
        //Get number of classes
        const highestClassIndex = compClass._state.class_ixMax;
        //Then paste skills gained from each class
        for(let ix = 0; ix <= highestClassIndex; ++ix){
            this._pullProficienciesFromComponentForm(compClass.compsClassStartingProficiencies[ix], out, dataProp, true);
        }

        //We need to do some additional parsing (we will get stuff like "shortsword|phb", "dart|phb");
        for(let prop of Object.keys(out)){
            if(!prop.includes("|")){continue;}
            out[prop.split("|")[0]] = out[prop];
            delete out[prop];
        }

        return out;
    }
     /**
     * @returns {{"light":number, "medium":number}} Returned object has a bunch of parameters named after skills, their values are either 1 (proficient) or 2 (expertise)
     */
     _grabArmorProficiencies(){
        //What can give us proficiencies?
        //Classes
        //Feats?
        const compClass = this._parent.compClass;
        const dataProp = "armor";

        let out = {};
        //Get number of classes
        const highestClassIndex = compClass._state.class_ixMax;
        //Then paste skills gained from each class
        for(let ix = 0; ix <= highestClassIndex; ++ix){
            this._pullProficienciesFromComponentForm(compClass.compsClassStartingProficiencies[ix], out, dataProp, true);
        }

        //We need to do some additional parsing (we will get stuff like "light|phb", "medium|phb");
        for(let prop of Object.keys(out)){
            if(!prop.includes("|")){continue;}
            out[prop.split("|")[0]] = out[prop];
            delete out[prop];
        }

        return out;
    }
    /**
     * @returns {{"common":number, "dwarvish":number}} Returned object has a bunch of parameters named after skills, their values are either 1 (proficient) or 2 (expertise)
     */
    _grabLanguageProficiencies(){
        //What can give us proficiencies?
        //Races
        //Backgrounds
        //Classes
        const compClass = this._parent.compClass;
        const compRace = this._parent.compRace;
        const dataProp = "languageProficiencies";

        let out = {};
        //Get number of classes
        const highestClassIndex = compClass._state.class_ixMax;
        //Then paste languages gained from each class
        for(let ix = 0; ix <= highestClassIndex; ++ix){
            for(let fos of compClass.compsClassFeatureOptionsSelect[ix]){
                for(let subcomp of fos._subCompsLanguageProficiencies){
                    this._pullProficienciesFromComponentForm(subcomp, out, dataProp);
                }
                for(let subcomp of fos._subCompsSkillToolLanguageProficiencies){
                    this._pullProficienciesFromComponentForm(subcomp, out, dataProp);
                }
                
            }
            
        }

        this._pullProficienciesFromComponentForm(compRace._compRaceSkillToolLanguageProficiencies, out, dataProp);
        this._pullProficienciesFromComponentForm(compRace._compRaceLanguageProficiencies, out, dataProp);

        //We need to do some additional parsing (we will get stuff like "light|phb", "medium|phb");
        /* for(let prop of Object.keys(out)){
            if(!prop.includes("|")){continue;}
            out[prop.split("|")[0]] = out[prop];
            delete out[prop];
        } */

        return out;
    }
     /**
     * @returns {{"str":number, "dex":number}} Returned object has a bunch of parameters named after skills, their values are either 1 (proficient) or 2 (expertise)
     */
     _grabSavingThrowProficiencies(){
        //What can give us proficiencies?
        //Races
        //Backgrounds
        //Classes
        const compClass = this._parent.compClass;
        const compRace = this._parent.compRace;
        const dataProp = "savingThrows";

        let out = {};
        //Get number of classes
        const highestClassIndex = compClass._state.class_ixMax;
        //Then paste languages gained from each class
        for(let ix = 0; ix <= highestClassIndex; ++ix){
            this._pullProficienciesFromComponentForm(compClass.compsClassStartingProficiencies[ix], out, dataProp, true);
        }

        this._pullProficienciesFromComponentForm(compRace._compRaceSkillToolLanguageProficiencies, out, dataProp);
        this._pullProficienciesFromComponentForm(compRace._compRaceLanguageProficiencies, out, dataProp);

        return out;
    }

    /**
     * Get the proficiency bonus of our character (depends on character level)
     * @returns {number}
     */
    _getProfBonus(){
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
        return Math.floor((total-10) / 2);
    }

    async _calcArmorClass(){
        const dexModifier = this._getAbilityModifier("dex");
        //Try to get items from bought items (we will do starting items later)
        const compEquipShop = this._parent.compEquipment._compEquipmentShopGold;

        let bestArmorAC = Number.MIN_VALUE;
        let bestArmor = null;

        const tryUseArmor = (item) => {
            //Account for if proficient in armor? nah not yet
            //check if strength requirement is met?
            const armorAC = item.ac;
            const armorType = item.type.toUpperCase(); //LA, MA, HA
            //Light armor has no dex cap. Medium and heavy has +2 as an upper cap
            const dexBonus = armorType == "LA"? dexModifier : Math.min(dexModifier, 2);
            const finalAC = armorAC + dexBonus;
            if(finalAC > bestArmorAC){bestArmor = {ac:armorAC, dexBonus:dexBonus, name:item.name}; bestArmorAC = finalAC; }
        }

        const tryGetArmors = async () => {
            //Go through bought items
            const itemKeys = compEquipShop.__state.itemPurchases;
            const itemDatas = compEquipShop.__state.itemDatas.item;
            for(let item of itemKeys){
                //cant be trusted to not be null
                const foundItem = ActorCharactermancerEquipment.findItemByUID(item.data.uid, itemDatas);
                if(!foundItem){continue;}
                if(foundItem.armor == true){tryUseArmor(foundItem);}
            }
    
            //We also need to go through starting items
            const rolledForGold = !!this._parent.compEquipment._compEquipmentCurrency._state.cpRolled;
            if(!rolledForGold)
            {
                //If we rolled for gold, it means we dont get any default starting equipment
                const compEquipDefault = this._parent.compEquipment._compEquipmentStartingDefault;
                const form = await compEquipDefault.pGetFormData();
                const items = form.data.equipmentItemEntries;
                for(let it of items){if(it.armor == true){tryUseArmor(it);}}
            }
        }

        await tryGetArmors();
        //TODO: unarmored defense?
        //TODO: shield?

        const naturalAC = 10 + dexModifier; //unarmored defense here?
        if(bestArmorAC > naturalAC){
            return {ac:bestArmorAC, name:bestArmor.name};
        }
        else{
            return {ac:naturalAC, name:"Natural Armor"};
        }
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
        let spellsBylevel = [[],[],[],[],[],[],[],[],[],[]];
        //Go through each component that can add spells
        for(let j = 0; j < compSpells.compsSpellSpells.length; ++j)
        {
            const comp1 = compSpells.compsSpellSpells[j];
            //Go through each level for the component
            for(let spellLevelIx = 0; spellLevelIx < comp1._compsLevel.length; ++spellLevelIx)
            {
                //Grab the subcomponent that handles that specific level
                const subcomponent = comp1._compsLevel[spellLevelIx];
                const known = subcomponent.getSpellsKnown(true); //Get the spells known by that subcomponent
                for(let i = 0; i < known.length; ++i){
                    spellsBylevel[spellLevelIx].push(known[i].spell.name);
                }
            }
        }

        return spellsBylevel;
    }



}