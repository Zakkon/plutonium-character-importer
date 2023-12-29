testvar = "apple";
uiClass = null;

document.addEventListener('DOMContentLoaded', function () {
    JqueryUtil.initEnhancements();
    //Renderer.tag._init();
    // Get the HTML elements by their IDs
    var titleLabel = document.getElementById('titleLabel');
    
    


    // Check if the elements exist before trying to modify them
    if (titleLabel) {
        // Modify the text content of the label
        titleLabel.textContent = 'Dynamic Label Text';
    }

});
window.addEventListener('load', function () {
   
    createPage_ClassSelect();
    addNewClassChoiceSection();
    let exportBtn = $(document).find("#btn_export");
    exportBtn.on('click', () => {
        e_onPressExportButton();
    });
});

function createPage_ClassSelect(){

    //Create a div that will hold the Ui objects
    let wrapper = $(`<div id="classPageWrapper"></div>`);
    wrapper.appendTo($('.left-content'));
    //Following that will be the addNewClassButton

    //Add another class button
    const addNewClassBtn = $("<button class=\"btn btn-5et btn-sm\">Add Another Class</button>").click(() => {
        //this._class_renderClass(_0x3e5d60, _0x47c29f, ++this._state.class_ixMax);
        console.log("Clicked Add New Class!");
        this.addNewClassChoiceSection();
    });
    addNewClassBtn.appendTo(wrapper);
}
/**Adds a new UIObj_Class to the left side of the screen. */
function addNewClassChoiceSection(){
    let wrapper = $('.left-content').find("#classPageWrapper");
    //Get the last object of the wrapper (it's probably the addNewClassButton)
    let btn = wrapper.children(':last');
    uiClass = new UIObj_Class(wrapper, $('#class_sidebar'));
    let div = uiClass.createClassChoiceDiv();
    btn.before(div);


    //let textPanel = uiClass.createClassTextRoller($('#class_sidebar'));
}

function getSubclasses(className){
 return [{name: "Zealot"}, {name: "Totem Warrior"}];
}


function refreshSubclassChoiceOptions(dropdownMenu, classChoice){
    dropdownMenu.innerHTML = '';
    if(classChoice == null){return;}
    // Populate the dropdown menu with options
    var options = [];
    for(let c of getSubclasses(classChoice.name)){options.push(c.name);}
    options.unshift("-");

    // Loop through the options and create option elements
    for (var i = 0; i < options.length; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.text = options[i];
        dropdownMenu.add(option);
    }
}

function e_onPressExportButton(){
    let sh = new SheetCompiler; sh.compile(uiClass);
}

function outputCharacter(){
    //Get class
    console.log(curClass);
}

function averageOfDice(diceSize)
{
    return (diceSize / 2) + 1;
}
function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}


class UIObj_Class {
    parentDiv;
    curClass = null;
    curSubclass = null;

    mainDiv;
    holder_classSubclass;
    compClassSubclass;
    holder_HpIncreaseMode;
    compHpIncreaseMode;
    holder_hp;
    compHitPoints;
    holder_startingProficiencies;
    compStartingProficiencies;
    holder_skillProficiencies;
    compSkillSelector;
    holder_levelSelect;
    compLevelSelector;

    //We actually own and control our own text roller on the right side of the screen
    holder_textRollers;
    compClassTextRoller_Class;
    compClassTextRoller_Subclass;

    constructor(parentDiv, sidebarParentDiv){
        this.parentDiv = parentDiv;
        this.holder_textRollers = sidebarParentDiv;
    }
    createClassChoiceDiv(){
        var mainDiv = $('<div>', { class: 'classChoicePage' });
        this.mainDiv = mainDiv;
        //this.holder_HpIncreaseMode = $(`<div class="ve-flex-col"><div>`);
        //this.holder_HpIncreaseMode.appendTo(extraInfoDiv);
        this.compClassSubclass = new UIObj_Class_ClassSubclassChoice(mainDiv, this);
        this.compClassSubclass.render();
        this.compClassSubclass.populateClassDropdown(ContentGetter.getClasses());
        
    
        //EXTRA INFO PAGE
        var extraInfoDiv = $('<div>', { class: 'class-extra-choices ve-hidden' });
        mainDiv.append(extraInfoDiv);
    
        //-HIT POINT CALCULATION OPTIONS
        this.holder_HpIncreaseMode = $(`<div class="ve-flex-col"><div>`);
        this.holder_HpIncreaseMode.appendTo(extraInfoDiv);
        this.compHpIncreaseMode = new UIObj_Class_HitPointsIncreaseMode(this.holder_HpIncreaseMode);

        //-HIT POINT INFO
        this.holder_hp = $(`<div class="ve-flex-col"><div>`);
        this.holder_hp.appendTo(extraInfoDiv);
        this.compHitPoints = new UIObj_Class_HitPoints(this.holder_hp);
        
    
        //-CLASS STARTING PROFICIENCIES
        this.holder_startingProficiencies = $(`<div class="ve-flex-col"><div>`);
        this.holder_startingProficiencies.appendTo(extraInfoDiv);
        this.compStartingProficiencies = new UIObj_Class_StartingProficiencies(this.holder_startingProficiencies);
        
    
        //-SKILL PROFICIENCIES OPTIONS
        this.holder_skillProficiencies = $(`<div class="ve-flex-col"><div>`);
        this.holder_skillProficiencies.appendTo(extraInfoDiv);
        this.compSkillSelector = new UIObj_Class_SkillSelect(this.holder_skillProficiencies);
        
        //-TOOL PROFICIENCIES CHOICES
        let toolProfHTML = `<div class="ve-flex-col"><hr class="hr-2"><div class="bold mb-2">Tool Proficiencies</div><div class="ve-flex-col"><div class="mb-1">Choose three Tool Proficiencies:</div><div class="ve-flex-col w-100 overflow-y-auto"><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Bagpipes</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Drum</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Dulcimer</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Flute</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Horn</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Lute</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Lyre</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Pan Flute</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Shawm</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label><label class="ve-flex-v-center py-1 stripe-even">
        <div class="col-1 ve-flex-vh-center"><input type="checkbox"></div>
        <div class="col-11 ve-flex-v-center"><div class="ve-flex-v-center w-100">
        <div class="ve-flex-v-center">Viol</div>
        <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label></div></div></div>`;
        
        //-SELECT LEVELS
        this.holder_levelSelect = $(`<div class="ve-flex-col"><div>`);
        this.holder_levelSelect.appendTo(extraInfoDiv);
        this.compLevelSelector = new UIObj_Class_LevelSelect(this.holder_levelSelect);

        this.createClassTextRollers();

        return mainDiv;

    }
    /**Create a textRoller that this UI object will be responsible for. Whenever this object's class gets removed, it will also remove the textroller */
    createClassTextRollers(parentDiv){
        //CLASS TEXT (RIGHT SIDE)
        this.compClassTextRoller_Class = new UIObj_ClassTextRoller(this.holder_textRollers);
        this.compClassTextRoller_Class.render(null);
        this.compClassTextRoller_Subclass = new UIObj_ClassTextRoller(this.holder_textRollers);
        this.compClassTextRoller_Subclass.render(null);
    }

    refreshClassChoiceOptions(dropdownMenu){
        dropdownMenu.innerHTML = '';
        // Populate the dropdown menu with options
        var options = [];
        for(let c of this.getClasses()){options.push(c.name);}
        console.log(this.getClasses());
        options.unshift("-");
    
        // Loop through the options and create option elements
        for (var i = 0; i < options.length; i++) {
            var option =  $('<option>', { value: i, text: options[i]});
            option.value = i;
            option.text = options[i];
            dropdownMenu.append(option);
        }
    }
    
    setShowMoreClassOptions(classInfoPage, show){
        //Show the rest of the choices and info for the class (such as hit dice, subclass choice) when a class has been chosen
        const hi = "ve-hidden";
        let extraInfoPage = classInfoPage.find(".class-extra-choices");
        if(show && extraInfoPage.hasClass(hi)){extraInfoPage.removeClass(hi);}
        else if(!show && !extraInfoPage.hasClass(hi)){extraInfoPage.addClass(hi);}
    }

    e_onChangeLevelSelect(lvl){
        //Check if any of the features allow us to make a choice (like skill proficiencies)
    }
    e_onChangeSelectedClass(classDropdown){
        //var subclassDropdown = document.getElementById('class_dropdown_subclass');
        //Check if we need to rebuild subclass choices
        let choice = classDropdown[0].selectedIndex > 0 ? ContentGetter.getClasses()[classDropdown[0].selectedIndex-1] : null;
        if(choice != this.curClass){
            //refreshSubclassChoiceOptions(subclassDropdown, choice);
            this.compHpIncreaseMode.refresh(choice);
            this.compHitPoints.refresh(choice);
            this.compStartingProficiencies.refresh(choice);
            this.compSkillSelector.refresh(choice);
            this.compLevelSelector.refresh(choice);
            this.compClassTextRoller_Class.render(choice);
        }
        // Check if the selected value is not empty or "-"

        if (classDropdown[0].selectedIndex > 0) { this.setShowMoreClassOptions(this.mainDiv, true);
            //Get the class we chose
            let chosenClass = this.compClassSubclass.lastClassOptions[classDropdown[0].selectedIndex-1];
            console.log(chosenClass);
            this.compClassSubclass.setSubclassDropdownInactive(false);
            let content = ContentGetter.getSubclasses();
            //Warning: we should add some compability between "PHB" and "phb" (a common typo)
            content = content.filter(entry => entry.className === chosenClass.name && entry.classSource === chosenClass.source);
            this.compClassSubclass.populateSubclassDropdown(content);
        }
        else {
            this.compClassSubclass.setSubclassDropdownInactive(true);
        }
        
    
        this.curClass = choice;
    }
    e_onChangeSelectedSubclass(subclassDropdown){
        console.log("change subclass");
        //Check if we need to rebuild subclass choices
        let choice = subclassDropdown[0].selectedIndex > 0 ? ContentGetter.getSubclasses()[subclassDropdown[0].selectedIndex-1] : null;
        console.log(choice);
        if(choice != this.curSubclass){
            this.compClassTextRoller_Subclass.render(choice, true);
        }
        // Check if the selected value is not empty or "-"

        if (subclassDropdown[0].selectedIndex > 0) {
        }
        else {
        }
        
    
        this.curSubclass = choice;
    }
    
}
class UIObj_BaseClassComponent {
    parentElement;
    constructor(parentDiv) {
        this.parentElement = parentDiv;
    }
    empty(){
        this.parentElement.html("");
    }
}
class UIObj_Class_ClassSubclassChoice extends UIObj_BaseClassComponent{
    classDropdown = null;
    subclassDropdown = null;
    parentUI;
    lastClassOptions;
    lastSubclassOptions;
    constructor(parentElement, parentUI){
        super(parentElement);
        this.parentUI = parentUI;
    }
    render(){
        //CLASS SELECTOR FIELD
        var selectMainDiv = $('<div>', { class: 've-flex-col' });
        // Create nested divs with different classes
        var topDiv = $('<div>', { class: 'split-v-center' });
        topDiv.append($('<div>', { class: 'bold', text:"Select a Class" }));

        var primaryClassBtn = $('<div>', { class: 've-flex-v-center'});
        primaryClassBtn.append($('<button>', { class: 'btn btn-5et btn-xs mr-2', text:"Primary Class",
        title:"This is your primary class, i.e. the one you chose at level 1 for the purposes of proficiencies/etc.", disabled: true}));
        topDiv.append(primaryClassBtn);
    
        let classSelectHTML = `<div class="ve-flex-col w-100 mt-2">
        <div class="ve-flex btn-group w-100">
            <div class="ve-flex no-shrink">
                <button class="btn btn-xs btn-5et h-100 btr-0 bbr-0 pr-2" title="Filter for Class and Subclass">
                    <span class="glyphicon glyphicon-filter"></span> Filter
                </button>
            </div>
            <div class="ve-flex-col w-100">
                <div class="ve-flex-col w-100">
                    <select class="class_select"></select>
                </div>
                <div class="ve-flex-col w-100">
                    <select class="subclass_select"></select>
                </div>
            </div>
        </div>
        </div>`;
        var botDiv = $.parseHTML(classSelectHTML);

        //CLASS DROPDOWN
        this.classDropdown = $(botDiv).find(".class_select");
        this.classDropdown.on('change', () => {
            this.parentUI.e_onChangeSelectedClass(this.classDropdown);
        });

        //SUBCLASS DROPDOWN
        this.subclassDropdown = $(botDiv).find(".subclass_select");
        this.subclassDropdown.on('change', () => {
            this.parentUI.e_onChangeSelectedSubclass(this.subclassDropdown);
        });
        this.setSubclassDropdownInactive(true);
    
        // Append nested divs to the main container
        selectMainDiv.append(topDiv, botDiv);
    
        this.parentElement.append(selectMainDiv);
    }
    setSubclassDropdownInactive(inactive){
        if(inactive)
        {
            this.subclassDropdown.html("");
            this.subclassDropdown.append($(`<option value="" selected disabled>Choose a Subclass</option>`));
            this.subclassDropdown.disabled = true;
            if (! this.subclassDropdown.hasClass('ve-muted')) {  this.subclassDropdown.addClass('ve-muted') ;}
        }
        else{
            this.subclassDropdown.html("");
            if ( this.subclassDropdown.hasClass('ve-muted')) {  this.subclassDropdown.removeClass('ve-muted') ;}
            this.subclassDropdown.disabled = false;
            //Populate it with options
        }
    }
    populateClassDropdown(classOptions){
        if(!this.classDropdown){return;} //Call render first
        this.classDropdown.html("");
        // Populate the dropdown menu with options
        var options = [];
        this.lastClassOptions = classOptions;
        for(let c of classOptions){options.push(c.name);}
        options.unshift("-");
    
        // Loop through the options and create option elements
        for (var i = 0; i < options.length; i++) {
            var option =  $('<option>', { value: i, text: options[i]});
            option.value = i;
            option.text = options[i];
            this.classDropdown.append(option);
        }
    }
    populateSubclassDropdown(subclassOptions){
        
        if(!this.subclassDropdown){return;} //Call render first
        this.subclassDropdown.html("");
        // Populate the dropdown menu with options
        var options = [];
        this.lastSubclassOptions = subclassOptions;
        for(let c of subclassOptions){options.push(c.name);}
        options.unshift("-");
    
        // Loop through the options and create option elements
        for (var i = 0; i < options.length; i++) {
            var option =  $('<option>', { value: i, text: options[i]});
            option.value = i;
            option.text = options[i];
            this.subclassDropdown.append(option);
        }
    }

}
class UIObj_Class_HitPointsIncreaseMode extends UIObj_BaseClassComponent{
    refresh(classChoice){
        this.empty();
        if(classChoice == null){return;}
        this.render();
    }
    render(){
        let hitpointCalcHTML = `
        <hr class="hr-2">
            <div class="bold mb-2">Hit Points Increase Mode</div>
            <div class="ve-flex-col min-h-0">
                <select class="form-control input-xs">
                    <option value="0">Take Average</option>
                    <option value="1">Minimum Value</option>
                    <option value="2">Maximum Value</option>
                    <option value="3">Roll</option>
                    <option value="4">Roll (Custom Formula)</option>
                    <option value="5">Do Not Increase HP</option>
                </select>
                <div class="mt-2 ve-flex-v-center ve-hidden">
                    <div class="inline-block bold mr-1 no-wrap">Custom Formula:</div>
                    <input class="form-control input-xs form-control--minimal code" autocomplete="new-password" autocapitalize="off" spellcheck="false">
                </div>
            </div>
        `;
        var hitpointCalc = $.parseHTML(hitpointCalcHTML);
        this.parentElement.append(hitpointCalc);
    }
}
class UIObj_Class_HitPoints extends UIObj_BaseClassComponent{
    refresh(classChoice){
        this.empty();
        if(classChoice == null){return;}
        this.render();
        this.refreshHitpoints(classChoice);
    }
    render(){
        let hitpointInfoHTML = `
        <hr class="hr-2">
            <div class="bold mb-2">Hit Points</div>
            <div class="ve-flex-col min-h-0 ve-small">
                <div class="block">
                    <div class="inline-block bold mr-1">Hit Dice:</div>
                    <span id="lbl_hit_dice_sizeAmount" class="roller render-roller" title="Hit die. Click to roll. SHIFT/CTRL to roll twice." data-roll-name="Hit die" onmousedown="event.preventDefault()" data-packed-dice="{&quot;toRoll&quot;:&quot;1d8&quot;,&quot;rollable&quot;:true}">1d8
                    </span>
                </div>
            <div class="block" id="lbl_hit_dice_explain"><div class="inline-block bold mr-1">Hit Points:</div>8 + your Constitution modifier</div>
            <div id="lbl_hit_dice_explain_higherLevel" class="block">
                
            </div>
        </div>
        `;
        this.parentElement.append($.parseHTML(hitpointInfoHTML));
    }
    refreshHitpoints(classInfo){
        let lbl = this.parentElement.find("#lbl_hit_dice_sizeAmount");
        console.log(lbl);
        let startHP = classInfo.hd.faces * classInfo.hd.number;
    
        //Set the hit dice
        this.parentElement.find("#lbl_hit_dice_sizeAmount")[0].innerHTML = classInfo.hd.number + "d" + classInfo.hd.faces;
    
        //Starting HP is always max of the hit dice
        //Replace the text inside the div without deleting the other divs inside
        this.parentElement.find("#lbl_hit_dice_explain").contents().filter(function() {
            return this.nodeType === 3; // Filter out text nodes
        }).replaceWith((startHP) + " + your Constitution modifier");
    
        //Explain how HP will increase
        //Replace the text inside the div without deleting the other divs inside
        this.parentElement.find("#lbl_hit_dice_explain_higherLevel").html(`<div class="inline-block bold mr-1">Hit Points at Higher Levels:</div>
        <span class="roller render-roller" title="Hit die. Click to roll. SHIFT/CTRL to roll twice." data-roll-name="Hit die" onmousedown="event.preventDefault()" data-packed-dice="{&quot;toRoll&quot;:&quot;1d8&quot;,&quot;rollable&quot;:true}">
        ` + classInfo.hd.number + "d" + classInfo.hd.faces + `</span>
            (or `+averageOfDice(startHP)+`) + your Constitution modifier per `+classInfo.name+` level after 1st`);
    }
}
class UIObj_Class_StartingProficiencies extends UIObj_BaseClassComponent{
    refresh(classChoice){
        this.empty();
        if(classChoice == null){return;}
        this.render();
        this.refreshStartingProficiencies(classChoice);
    }
    render(){
        let startingProfHTML = `
        <hr class="hr-2">
            <div class="bold mb-2">Proficiencies</div>
            <div class="ve-flex-col min-h-0 ve-small" id="starting_proficiencies_parent">
                <div class="block">
                </div>
                <div class="block">
                </div>
                <div class="block">
                </div>
            </div>
        </hr>`;
        this.parentElement.append($.parseHTML(startingProfHTML));
    }
    refreshStartingProficiencies(classInfo){
        let startingProfs = classInfo.startingProficiencies;
        let element = this.parentElement.find("#starting_proficiencies_parent");
    
        //ARMOR
        let armorBlock = element.children().eq(0);
        armorBlock.html(`<div class="mr-1 bold inline-block">Armor:</div>`);
        for(let i = 0; i < startingProfs.armor.length; ++i){
            let str = startingProfs.armor[i];
            let text = ["light", "medium", "heavy"].includes(str) ? str + ` armor` : str.includes("|") ? str : str;//`{@item `+str+`}` : str;
            let comma = (i+1>=startingProfs.armor.length? "" : ",");
            let obj = $.parseHTML(`<div class="inline-block mr-1">`+text+`<div class="ve-small veapp__msg-warning inline-block" title=""></div>`+comma+`</div>`);
            armorBlock.append(obj);
        }
        //WEAPONS
        let weaponBlock = element.children().eq(1);
        weaponBlock.html(`<div class="mr-1 bold inline-block">Weapons:</div>`);
        for(let i = 0; i < startingProfs.weapons.length; ++i){
            let str = startingProfs.weapons[i];
            let text = ["simple", "martial"].includes(str) ? str + ` weapons` : str.includes("|") ? str : str;//`{@item `+str+`}` : str;
            let comma = (i+1>=startingProfs.weapons.length? "" : ",");
            let obj = $.parseHTML(`<div class="inline-block mr-1">`+text+`<div class="ve-small veapp__msg-warning inline-block" title=""></div>`+comma+`</div>`);
            weaponBlock.append(obj);
        }
        //SAVING THROWS
        let savesBlock = element.children().eq(2);
        savesBlock.html(`<div class="mr-1 bold inline-block">Saving Throws:</div>`);
        for(let i = 0; i < classInfo.proficiency.length; ++i){
            let str = classInfo.proficiency[i];
            let text = ABILITY_ABV_TO_FULL[str.toUpperCase()];
            let comma = (i+1>=classInfo.proficiency.length? "" : ",");
            let obj = $.parseHTML(`<div class="inline-block mr-1">`+text+`<div class="ve-small veapp__msg-warning inline-block" title=""></div>`+comma+`</div>`);
            savesBlock.append(obj);
        }
    }
}
class UIObj_Class_SkillSelect extends UIObj_BaseClassComponent{
    _options;
    refresh(classChoice){
        this.empty();
        if(classChoice == null){return;}
        this.render();
        this.refreshSkillProficiencyChoices(classChoice);
    }
    render(){
        let skillProfOptionsHTML = `
     <hr class="hr-2">
        <div class="bold mb-2">Skill Proficiencies</div>
        <div class="ve-flex-col">
            <div class="mb-1">Choose three Skill Proficiencies:</div>
            <div id="skill_proficiency_choice_parent" class="ve-flex-col w-100 overflow-y-auto">
            </div>
        </div>
    </hr>`;
        
        this.parentElement.append($.parseHTML(skillProfOptionsHTML));
    }
    refreshSkillProficiencyChoices(classInfo){
        const skills = classInfo.startingProficiencies.skills[0];
        let canChooseAny = skills.any;
        let chooseNum = -1; //-1 means choose 
        let options = [];
        if(canChooseAny){
            chooseNum = classInfo.startingProficiencies.skills[0].any;
            for(let sk of SKILLS){
                options.push(toTitleCase(sk));
            }
        }
        else{
            chooseNum = classInfo.startingProficiencies.skills[0].choose.count;
            options = classInfo.startingProficiencies.skills[0].choose.from;
        }

        //Prep object that we will cache and use to keep track of the buttons as they get pressed
        this._options = {
            chooseAny: canChooseAny,
            chooseNum: chooseNum,
            chooseFrom: options,
            marked: Array.from({ length: options.length }, () => false),
            lastMarkedIx: 0,
            checkboxes: [options.length]
        }

        let mainDiv = this.parentElement.find("#skill_proficiency_choice_parent");
        mainDiv.html("");
        mainDiv.parent().children().eq(0).html("Choose "+chooseNum+" Skill Proficiencies:");
        
        

        for(let i = 0; i < options.length; ++i){
            let option = options[i];
            let checkbox = $(`<input type="checkbox"></input>`).change((evt) =>{
                this.e_onCheckboxChange(i, evt);
            });
            this._options.checkboxes[i] = checkbox;

            let ability = SKILL_TO_ABILITY_ABV[option.toUpperCase()];
            let html = `<label class="ve-flex-v-center py-1 stripe-even">
                            <div class="col-1 ve-flex-vh-center">
                            </div>
                            <div class="col-11 ve-flex-v-center">
                                <div class="ve-flex-v-center w-100">
                                    <div class="ve-flex-v-center">
                                        <div class="ve-inline-flex-v-center">
                                            <span class="help help--hover">${toTitleCase(option)}</span>
                                        <div class="ml-1 ve-small ve-muted" title="${ABILITY_ABV_TO_FULL[ability]}">(${toTitleCase(ability)})
                                        </div>
                                    </div>
                                </div>
                                <div class="ve-small veapp__msg-warning" title=""></div>
                            </div>
                        </div>
                    </label>`;
        
        let obj = $(html);//$.parseHTML(html);
        obj.children().first().append(checkbox);
        mainDiv.append(obj);
        }
    }
    getNumMarked(){
        let count = 0;
        for(let i = 0; i < this._options.marked.length; ++i){
            if(this._options.marked[i]){count++;}
        }
        return count;
    }
    setMarked(ix, asMarked){
        //get the checkbox ui object
        let cb = this._options.checkboxes[ix];
        if(!asMarked){
            this._options.marked[ix] = false;
            cb.prop("checked", false);
            return;
        }
        if(!this._options.chooseAny && this.getNumMarked() == this._options.chooseNum){
            //unmark the last one
            this.setMarked(this._options.lastMarkedIx, false);
        }
        this._options.marked[ix] = true;
        this._options.lastMarkedIx = ix;
        cb.prop("checked", true);
    }
    e_onCheckboxChange(ix, evt){
        evt.preventDefault();
        evt.stopPropagation();
        this.setMarked(ix, !this._options.marked[ix]); //Toggle our mark status
    }
}
class UIObj_Class_LevelSelect extends UIObj_BaseClassComponent{
    _features = null;
    _isRadio = true;
    _isForceSelect = false; //used with _maxPreviousLevel when we want to force the user to choose levels over a certain one
    _maxPreviousLevel = 0;
    _list = null;
    _list2 = null;
    _fnsOnChange = null;
    _chosenIx = 0;
    constructor(parentDiv, opts) {
        super(parentDiv);
        this._fnsOnChange = [];
        
        if(opts==null){return;}
        this._isSubclass = !!opts.isSubclass;
        this._isRadio = !!opts.isRadio;
        this._isForceSelect = !!opts.isForceSelect;
        this._featureArr = this.constructor._getLevelGroupedFeatures(opts.features, this._isSubclass);
        this._maxPreviousLevel = opts.maxPreviousLevel || 0;

        this._list = null;
        this._listSelectClickHandler = null;

        this._fnsOnChange = [];
    }
    refresh(classChoice){
        //Clear all our past html (if any exists)
        this.empty();
        if(classChoice == null){return;}
        this.render();
        this.refreshSelectLevelList(classChoice);
        this.setChosenIx(0);
    }
    render(){
        let selectLevelsHTML = `
        <hr class="hr-2">
            <div class="bold mb-2">Select Levels</div>
            <div class="ve-flex-col min-h-0">
                <div class="ve-flex-v-stretch input-group mb-1 no-shrink">
                    <label class="btn btn-5et col-1 px-1 ve-flex-vh-center"></label>
                    <button class="btn-5et col-1-5">Level</button>
                    <button class="btn-5et col-9-5">Features</button>
                </div>
        
                <div id="level_list" class="veapp__list mb-1">
                    
                </div>
            </div>
        `;
        
        this.parentElement.append($.parseHTML(selectLevelsHTML));
    }
    refreshSelectLevelList(classInfo){
        let listDiv = this.parentElement.find("#level_list");
        listDiv.html("");

        //We need to use features sorted by level
        let objs = classInfo.classFeatures.map((featureUID) => {
            let uid = featureUID;
            if (typeof uid !== "string") {uid = featureUID.classFeature;}
            return MyDataUtil.unpackUidClassFeature(uid);
        });
        this._features = this.constructor.groupByLevel(objs);
        
        //let levelSlots = new Array(20); for(let i = 0; i < levelSlots.length; ++i){levelSlots[i] = [];}
        

        let $cbAll = this._isRadio ? null : $(`<input type="checkbox" name="cb-select-all">`);
        let $wrpList = $(`<div class="veapp__list mb-1"></div>`);
        this._list = new List({
            $wrpList: $wrpList,
            fnSort: null,
            isUseJquery: true,
        });
        this._listSelectClickHandler = new ListSelectClickHandler({list: this._list});

        for (let ix = 0; ix < this._features.length; ++ix) {
            let cb = this._render_$getCbRow(ix); //Create radio button
            const $dispFeatures = $(`<span class="col-9-5"></span>`);
            const fnUpdateRowText = ()=>$dispFeatures.text(this.constructor._getRowText(this._features[ix]));
            fnUpdateRowText();

            //Create a wrapper object that contains info about if the whole thing should be grayed out or not. Also feels clicks
            //Then inside that, add a span which contains a radio button
            //Next to that span, add a label which has the level number
            //And next to that, add the text for what features we will get
            let li = $(`<label class="w-100 ve-flex veapp__list-row veapp__list-row-hoverable
                ${this._isRadio && this._isForceSelect && ix <= this._maxPreviousLevel ? `list-multi-selected`
                : ""} ${ix < this._maxPreviousLevel ? `ve-muted` : ""}"></label>`).click((evt)=>{
                this._handleSelectClick(listItem, evt);
            }
            );
            let liSpan = $('<span class="col-1 ve-flex-vh-center"></span>');
            cb.appendTo(liSpan);
            li.append(liSpan);
            li.append($(`<span class="col-1-5 ve-text-center">${ix + 1}</span>`));
            li.append($dispFeatures);

            //We need to seriously make a better replacement for this
            let listItem = new ListItem(ix, li, "", {}, {
                cbSel: cb[0], //Original, This somehow breaks the line button from appearing checked.
                fnUpdateRowText,
            });

            this._list.addItem(listItem);
        }

        if (!this._isRadio) {this._listSelectClickHandler.bindSelectAllCheckbox($cbAll);}

        this._list.init();
        $wrpList.appendTo(listDiv);
    }
    setChosenIx(ix){
        //ix should be level -1
        //Make the UI respond to this
        this._handleSelectClick(this._list._items[ix], null);
        this._chosenIx = ix;
    }
    getChosenIx(){
        return this._chosenIx;
    }

    _handleSelectClick(listItem, evt) {
        if (!this._isRadio){return this._listSelectClickHandler.handleSelectClick(listItem, evt);}

        const isCheckedOld = listItem.data.cbSel.checked;
        //Make sure we can't toggle off the radio button by clicking it again
        if(isCheckedOld){return;}

        const isDisabled = this._handleSelectClickRadio(this._list, listItem, evt);
        if (isDisabled){return;}

        const isCheckedNu = listItem.data.cbSel.checked;
        if (isCheckedOld !== isCheckedNu){this._doRunFnsOnchange();}
    }
    _handleSelectClickRadio(list, item, evt) {
        if(evt){
            evt.preventDefault();
            evt.stopPropagation();
        }
        

        if (item.data.cbSel.disabled){return true;}

        list.items.forEach(it=>{
            if (it === item) {
                if (it.data.cbSel.checked && !this._isForceSelect) {
                    it.data.cbSel.checked = false;
                    it.ele.removeClass("list-multi-selected");
                    return;
                }

                this._chosenIx = it.ix;
                it.data.cbSel.checked = true;
                it.ele.addClass("list-multi-selected");
            }
            else
            {
                it.data.cbSel.checked = false;
                if (it.ix < item.ix) {it.ele.addClass("list-multi-selected");}
                else {it.ele.removeClass("list-multi-selected");}    
            }
        });
    }
    onchange(fn) {
        this._fnsOnChange.push(fn);
    }

    _doRunFnsOnchange() {
        this._fnsOnChange.forEach(fn=>fn());
    }

    _render_$getCbRow(ix) {
        if (!this._isRadio){return $(`<input type="checkbox" class="no-events">`);}
            

        const $cb = $(`<input type="radio" class="no-events">`);
        if (ix === this._maxPreviousLevel && this._isForceSelect){$cb.prop("checked", true);}
        else if (ix < this._maxPreviousLevel){$cb.prop("disabled", true);}

        return $cb;
    }
    static _getRowText(lvl) {
        return lvl.map(f=>f.tableDisplayName || f.name).join(", ") || "\u2014";
    }
    static groupByLevel(array) {
        return array.reduce((result, obj) => {
            const targetIndex = obj.level - 1;
        
            while (result.length <= targetIndex) {
                result.push([]);
            }
        
            result[targetIndex].push(obj);
        
            return result;
          },
        []);
    }
}
class UIObj_ClassInfo {
    constructor(parentElement){
         //CLASS TEXT (RIGHT SIDE)
         this.compClassTextSelector = new UIObj_ClassTextRoller(parentDiv);
         this.compClassTextSelector.render(null);
    }
}
class UIObj_ClassTextRoller extends UIObj_BaseClassComponent{
    curClass;
    curClassFeatures;
    isSubclass;
    wrapper;
    entriesHolder;

    render(classChoice, isSubclass=false){
        //Delete wrapper
        if(this.wrapper != null){this.wrapper.remove(); this.wrapper = null;}
        if(!classChoice){return;}
        this.curClass = classChoice;
        this.isSubclass = isSubclass;
        let wrapper = $("<div></div>");
        this.wrapper = wrapper;
        wrapper.appendTo(this.parentElement);
        //Content element

        let contentHolderParent = $(`<div class="ve-flex-col w-100"></div>`);
        contentHolderParent.appendTo(wrapper);
        let contentHolder = $(`<div class="ve-flex-col"></div>`);
        contentHolder.appendTo(contentHolderParent);

        const collapseButton = $("<div class=\"py-1 pl-2 clickable ve-muted\">[‒]</div>").click(() => {
            console.log("collapse button pressed");
            collapseButton.text(collapseButton.text() === '[+]' ? '[‒]' : "[+]");
            //if ($wrpTable) { $wrpTable.toggleVe(); }
            this.entriesHolder.toggleVe();
          });

        //Title element (class name)
        let titleElement = $(`<div class="split-v-center">
        <div class="rd__h rd__h--0"><div class="entry-title-inner">${classChoice.name}</div></div>
        </div>`);
        collapseButton.appendTo(titleElement);
        titleElement.appendTo(contentHolder);
        contentHolder.append($(`<hr class="hr-1"></hr>`))
        
        //table element

        //Entries
        this.prepareEntriesStrings(contentHolder);

        //Footer element (just a thin line)
        let footer = $(`<div class="ve-flex-col w-100"></div>`);
        footer.appendTo(wrapper);
    }

    prepareEntriesStrings(parent)
    {
        //all these entries have a className, a classSource, and an array called "entries", which contains text about the feature
        //when does entries get type:"section"?
        let holder = $(`<div></div>`);
        let features = !this.isSubclass ? ContentGetter.getFeaturesFromClass(this.curClass) : ContentGetter.getFeaturesFromSubclass(this.curClass);
        for(let f of features){
            this.prepareFeatureString(f, holder);
        }
       

        //try this later (plutonium renderer)
        let entries = {entries:features, type:"section"};
        //_class_renderEntriesSection(holder, this.curClass.name, entries);
        
        this.entriesHolder = holder;
        parent.append(holder);
    }
    prepareFeatureString(feature, holder){
        let container = $(`<div></div>`);
        let lbl = $(`<h2 class="rd__h rd__h--1"><span class="entry-title-inner">${feature.name}</span></h2>`);
        lbl.appendTo(container);

        for(let e of feature.entries){
            if(typeof e === "object"){
                if(e.type == "list"){
                    let ul = $(`<ul></ul>`);
                    for(let li of e.items){
                         ul.append($(`<li>${li}</li>`));
                    }
                    container.append(ul);
                }
            }
            else{
                container.append($(`<p>${e}</p>`));
            }
        }

        holder.append(container);
    }
}
class SheetCompiler {
    static INCLUDE_SOURCE_CONTENT = true;
    cachedContent;
    cacheSourceClass(source, cls){
        //Look around to see if any object with our sourceName has been set already
        const existsSource = this.cachedContent.some(obj => obj.hasOwnProperty('sourceName') && obj.sourceName === source);
        if(!existsSource){this.cachedContent.push({sourceName: source});} //If not, create one
        //Get the object with our sourceName
        let sourceEntry = this.cachedContent.find(obj => obj.hasOwnProperty('sourceName') && obj.sourceName === source);
        if (!sourceEntry.classes) { sourceEntry.classes = []; }
        sourceEntry.classes.push(cls);
    }
    compile(ui_class){
        console.log("Compile Class");
        if(ui_class.curClass==null){return;}
        this.cachedContent = [];

        let classes = [ui_class.curClass];
        let sf = {
            name: "TestCharacter",
        };
        let classesShortInfo = [];
        let sourcesUsed = [];
        for(let i = 0; i < classes.length; ++i){
            let levelOfClass = ui_class.compLevelSelector.getChosenIx()+1;
            let cl = classes[i];
            classesShortInfo.push({name: cl.name, source: cl.source, level: levelOfClass});
            if(!sourcesUsed.includes(cl.source)){sourcesUsed.push(cl.source);}
            this.cacheSourceClass(cl.source, cl);
        }
        sf.classes = classesShortInfo;
        sf.sourcesUsed = sourcesUsed;
        sf.includesSourceContent = SheetCompiler.INCLUDE_SOURCE_CONTENT;
        if(SheetCompiler.INCLUDE_SOURCE_CONTENT){
            sf._sourceContent = this.cachedContent;
        }
        console.log(sf);
        return sf;
    }
}
class MyDataUtil{
    static SRC_PHB = "PHB";
    /**Takes a UID from a class feature (like Rage|Barbarian|1|PHB) and unpacks it into separate values*/
    static unpackUidClassFeature (uid, opts) {
        opts = opts || {};
        if (opts.isLower) uid = uid.toLowerCase();
        let [name, className, classSource, level, source, displayText] = uid.split("|").map(it => it.trim());
        classSource = classSource || (opts.isLower ? MyDataUtil.SRC_PHB.toLowerCase() : MyDataUtil.SRC_PHB);
        source = source || classSource;
        level = Number(level);
        return {
            name,
            className,
            classSource,
            level,
            source,
            displayText,
        };
    }
    
}
//#region List
class List {
    #activeSearch = null;

    constructor(opts) {
        if (opts.fnSearch && opts.isFuzzy)
            throw new Error(`The options "fnSearch" and "isFuzzy" are mutually incompatible!`);

        this._$iptSearch = opts.$iptSearch;
        this._$wrpList = opts.$wrpList;
        this._fnSort = opts.fnSort === undefined ? SortUtil.listSort : opts.fnSort;
        this._fnSearch = opts.fnSearch;
        this._syntax = opts.syntax;
        this._isFuzzy = !!opts.isFuzzy;
        this._isSkipSearchKeybindingEnter = !!opts.isSkipSearchKeybindingEnter;
        this._helpText = opts.helpText;

        this._items = [];
        this._eventHandlers = {};

        this._searchTerm = List._DEFAULTS.searchTerm;
        this._sortBy = opts.sortByInitial || List._DEFAULTS.sortBy;
        this._sortDir = opts.sortDirInitial || List._DEFAULTS.sortDir;
        this._sortByInitial = this._sortBy;
        this._sortDirInitial = this._sortDir;
        this._fnFilter = null;
        this._isUseJquery = opts.isUseJquery;

        if (this._isFuzzy)
            this._initFuzzySearch();

        this._searchedItems = [];
        this._filteredItems = [];
        this._sortedItems = [];

        this._isInit = false;
        this._isDirty = false;

        this._prevList = null;
        this._nextList = null;
        this._lastSelection = null;
        this._isMultiSelection = false;
    }

    get items() {
        return this._items;
    }
    get visibleItems() {
        return this._sortedItems;
    }
    get sortBy() {
        return this._sortBy;
    }
    get sortDir() {
        return this._sortDir;
    }
    set nextList(list) {
        this._nextList = list;
    }
    set prevList(list) {
        this._prevList = list;
    }

    setFnSearch(fn) {
        this._fnSearch = fn;
        this._isDirty = true;
    }

    init() {
        if (this._isInit)
            return;

        if (this._$iptSearch) {
            UiUtil.bindTypingEnd({
                $ipt: this._$iptSearch,
                fnKeyup: ()=>this.search(this._$iptSearch.val())
            });
            this._searchTerm = List$1.getCleanSearchTerm(this._$iptSearch.val());
            this._init_bindKeydowns();

            const helpText = [...(this._helpText || []), ...Object.values(this._syntax || {}).filter(({help})=>help).map(({help})=>help), ];

            if (helpText.length)
                this._$iptSearch.title(helpText.join(" "));
        }

        this._doSearch();
        this._isInit = true;
    }

    _init_bindKeydowns() {
        this._$iptSearch.on("keydown", evt=>{
            if (evt._List__isHandled)
                return;

            switch (evt.key) {
            case "Escape":
                return this._handleKeydown_escape(evt);
            case "Enter":
                return this._handleKeydown_enter(evt);
            }
        }
        );
    }

    _handleKeydown_escape(evt) {
        evt._List__isHandled = true;

        if (!this._$iptSearch.val()) {
            $(document.activeElement).blur();
            return;
        }

        this._$iptSearch.val("");
        this.search("");
    }

    _handleKeydown_enter(evt) {
        if (this._isSkipSearchKeybindingEnter)
            return;

        if (IS_VTT)
            return;
        if (!EventUtil.noModifierKeys(evt))
            return;

        const firstVisibleItem = this.visibleItems[0];
        if (!firstVisibleItem)
            return;

        evt._List__isHandled = true;

        $(firstVisibleItem.ele).click();
        if (firstVisibleItem.values.hash)
            window.location.hash = firstVisibleItem.values.hash;
    }

    _initFuzzySearch() {
        elasticlunr.clearStopWords();
        this._fuzzySearch = elasticlunr(function() {
            this.addField("s");
            this.setRef("ix");
        });
        SearchUtil.removeStemmer(this._fuzzySearch);
    }

    update({isForce=false}={}) {
        if (!this._isInit || !this._isDirty || isForce)
            return false;
        this._doSearch();
        return true;
    }

    _doSearch() {
        this._doSearch_doInterruptExistingSearch();
        this._doSearch_doSearchTerm();
        this._doSearch_doPostSearchTerm();
    }

    _doSearch_doInterruptExistingSearch() {
        if (!this.#activeSearch)
            return;
        this.#activeSearch.interrupt();
        this.#activeSearch = null;
    }

    _doSearch_doSearchTerm() {
        if (this._doSearch_doSearchTerm_preSyntax())
            return;

        const matchingSyntax = this._doSearch_getMatchingSyntax();
        if (matchingSyntax) {
            if (this._doSearch_doSearchTerm_syntax(matchingSyntax))
                return;

            this._searchedItems = [];
            this._doSearch_doSearchTerm_pSyntax(matchingSyntax).then(isContinue=>{
                if (!isContinue)
                    return;
                this._doSearch_doPostSearchTerm();
            }
            );

            return;
        }

        if (this._isFuzzy)
            return this._searchedItems = this._doSearch_doSearchTerm_fuzzy();

        if (this._fnSearch)
            return this._searchedItems = this._items.filter(it=>this._fnSearch(it, this._searchTerm));

        this._searchedItems = this._items.filter(it=>this.constructor.isVisibleDefaultSearch(it, this._searchTerm));
    }

    _doSearch_doSearchTerm_preSyntax() {
        if (!this._searchTerm && !this._fnSearch) {
            this._searchedItems = [...this._items];
            return true;
        }
    }

    _doSearch_getMatchingSyntax() {
        const [command,term] = this._searchTerm.split(/^([a-z]+):/).filter(Boolean);
        if (!command || !term || !this._syntax?.[command])
            return null;
        return {
            term: this._doSearch_getSyntaxSearchTerm(term),
            syntax: this._syntax[command]
        };
    }

    _doSearch_getSyntaxSearchTerm(term) {
        if (!term.startsWith("/") || !term.endsWith("/"))
            return term;
        try {
            return new RegExp(term.slice(1, -1));
        } catch (ignored) {
            return term;
        }
    }

    _doSearch_doSearchTerm_syntax({term, syntax: {fn, isAsync}}) {
        if (isAsync)
            return false;

        this._searchedItems = this._items.filter(it=>fn(it, term));
        return true;
    }

    async _doSearch_doSearchTerm_pSyntax({term, syntax: {fn, isAsync}}) {
        if (!isAsync)
            return false;

        this.#activeSearch = new _ListSearch({
            term,
            fn,
            items: this._items,
        });
        const {isInterrupted, searchedItems} = await this.#activeSearch.pRun();

        if (isInterrupted)
            return false;
        this._searchedItems = searchedItems;
        return true;
    }

    static isVisibleDefaultSearch(li, searchTerm) {
        return li.searchText.includes(searchTerm);
    }

    _doSearch_doSearchTerm_fuzzy() {
        const results = this._fuzzySearch.search(this._searchTerm, {
            fields: {
                s: {
                    expand: true
                },
            },
            bool: "AND",
            expand: true,
        }, );

        return results.map(res=>this._items[res.doc.ix]);
    }

    _doSearch_doPostSearchTerm() {
        this._searchedItems = this._searchedItems.filter(it=>!it.data.isExcluded);

        this._doFilter();
    }

    getFilteredItems({items=null, fnFilter}={}) {
        items = items || this._searchedItems;
        fnFilter = fnFilter || this._fnFilter;

        if (!fnFilter)
            return items;

        return items.filter(it=>fnFilter(it));
    }

    _doFilter() {
        this._filteredItems = this.getFilteredItems();
        this._doSort();
    }

    getSortedItems({items=null}={}) {
        items = items || [...this._filteredItems];

        const opts = {
            sortBy: this._sortBy,
            sortDir: this._sortDir,
        };
        if (this._fnSort)
            items.sort((a,b)=>this._fnSort(a, b, opts));
        if (this._sortDir === "desc")
            items.reverse();

        return items;
    }

    _doSort() {
        this._sortedItems = this.getSortedItems();
        this._doRender();
    }

    _doRender() {
        const len = this._sortedItems.length;

        if (this._isUseJquery) {
            this._$wrpList.children().detach();
            for (let i = 0; i < len; ++i)
                this._$wrpList.append(this._sortedItems[i].ele);
        } else {
            this._$wrpList[0].innerHTML = "";
            const frag = document.createDocumentFragment();
            for (let i = 0; i < len; ++i)
                frag.appendChild(this._sortedItems[i].ele);
            this._$wrpList[0].appendChild(frag);
        }

        this._isDirty = false;
        this._trigger("updated");
    }

    search(searchTerm) {
        const nextTerm = List$1.getCleanSearchTerm(searchTerm);
        if (nextTerm === this._searchTerm)
            return;
        this._searchTerm = nextTerm;
        return this._doSearch();
    }

    filter(fnFilter) {
        if (this._fnFilter === fnFilter)
            return;
        this._fnFilter = fnFilter;
        this._doFilter();
    }

    sort(sortBy, sortDir) {
        if (this._sortBy !== sortBy || this._sortDir !== sortDir) {
            this._sortBy = sortBy;
            this._sortDir = sortDir;
            this._doSort();
        }
    }

    reset() {
        if (this._searchTerm !== List$1._DEFAULTS.searchTerm) {
            this._searchTerm = List$1._DEFAULTS.searchTerm;
            return this._doSearch();
        } else if (this._sortBy !== this._sortByInitial || this._sortDir !== this._sortDirInitial) {
            this._sortBy = this._sortByInitial;
            this._sortDir = this._sortDirInitial;
        }
    }

    addItem(listItem) {
        this._isDirty = true;
        this._items.push(listItem);

        if (this._isFuzzy)
            this._fuzzySearch.addDoc({
                ix: listItem.ix,
                s: listItem.searchText
            });
    }

    removeItem(listItem) {
        const ixItem = this._items.indexOf(listItem);
        return this.removeItemByIndex(listItem.ix, ixItem);
    }

    removeItemByIndex(ix, ixItem) {
        ixItem = ixItem ?? this._items.findIndex(it=>it.ix === ix);
        if (!~ixItem)
            return;

        this._isDirty = true;
        const removed = this._items.splice(ixItem, 1);

        if (this._isFuzzy)
            this._fuzzySearch.removeDocByRef(ix);

        return removed[0];
    }

    removeItemBy(valueName, value) {
        const ixItem = this._items.findIndex(it=>it.values[valueName] === value);
        return this.removeItemByIndex(ixItem, ixItem);
    }

    removeItemByData(dataName, value) {
        const ixItem = this._items.findIndex(it=>it.data[dataName] === value);
        return this.removeItemByIndex(ixItem, ixItem);
    }

    removeAllItems() {
        this._isDirty = true;
        this._items = [];
        if (this._isFuzzy)
            this._initFuzzySearch();
    }

    on(eventName, handler) {
        (this._eventHandlers[eventName] = this._eventHandlers[eventName] || []).push(handler);
    }

    off(eventName, handler) {
        if (!this._eventHandlers[eventName])
            return false;
        const ix = this._eventHandlers[eventName].indexOf(handler);
        if (!~ix)
            return false;
        this._eventHandlers[eventName].splice(ix, 1);
        return true;
    }

    _trigger(eventName) {
        (this._eventHandlers[eventName] || []).forEach(fn=>fn());
    }

    doAbsorbItems(dataArr, opts) {
        const children = [...this._$wrpList[0].children];

        const len = children.length;
        if (len !== dataArr.length)
            throw new Error(`Data source length and list element length did not match!`);

        for (let i = 0; i < len; ++i) {
            const node = children[i];
            const dataItem = dataArr[i];
            const listItem = new ListItem$1(i,node,opts.fnGetName(dataItem),opts.fnGetValues ? opts.fnGetValues(dataItem) : {},{},);
            if (opts.fnGetData)
                listItem.data = opts.fnGetData(listItem, dataItem);
            if (opts.fnBindListeners)
                opts.fnBindListeners(listItem, dataItem);
            this.addItem(listItem);
        }
    }

    doSelect(item, evt) {
        if (evt && evt.shiftKey) {
            evt.preventDefault();
            if (this._prevList && this._prevList._lastSelection) {
                this._prevList._selectFromItemToEnd(this._prevList._lastSelection, true);
                this._selectToItemFromStart(item);
            } else if (this._nextList && this._nextList._lastSelection) {
                this._nextList._selectToItemFromStart(this._nextList._lastSelection, true);
                this._selectFromItemToEnd(item);
            } else if (this._lastSelection && this.visibleItems.includes(item)) {
                this._doSelect_doMulti(item);
            } else {
                this._doSelect_doSingle(item);
            }
        } else
            this._doSelect_doSingle(item);
    }

    _doSelect_doSingle(item) {
        if (this._isMultiSelection) {
            this.deselectAll();
            if (this._prevList)
                this._prevList.deselectAll();
            if (this._nextList)
                this._nextList.deselectAll();
        } else if (this._lastSelection)
            this._lastSelection.isSelected = false;

        item.isSelected = true;
        this._lastSelection = item;
    }

    _doSelect_doMulti(item) {
        this._selectFromItemToItem(this._lastSelection, item);

        if (this._prevList && this._prevList._isMultiSelection) {
            this._prevList.deselectAll();
        }

        if (this._nextList && this._nextList._isMultiSelection) {
            this._nextList.deselectAll();
        }
    }

    _selectFromItemToEnd(item, isKeepLastSelection=false) {
        this.deselectAll(isKeepLastSelection);
        this._isMultiSelection = true;
        const ixStart = this.visibleItems.indexOf(item);
        const len = this.visibleItems.length;
        for (let i = ixStart; i < len; ++i) {
            this.visibleItems[i].isSelected = true;
        }
    }

    _selectToItemFromStart(item, isKeepLastSelection=false) {
        this.deselectAll(isKeepLastSelection);
        this._isMultiSelection = true;
        const ixEnd = this.visibleItems.indexOf(item);
        for (let i = 0; i <= ixEnd; ++i) {
            this.visibleItems[i].isSelected = true;
        }
    }

    _selectFromItemToItem(item1, item2) {
        this.deselectAll(true);

        if (item1 === item2) {
            if (this._lastSelection)
                this._lastSelection.isSelected = false;
            item1.isSelected = true;
            this._lastSelection = item1;
            return;
        }

        const ix1 = this.visibleItems.indexOf(item1);
        const ix2 = this.visibleItems.indexOf(item2);

        this._isMultiSelection = true;
        const [ixStart,ixEnd] = [ix1, ix2].sort(SortUtil.ascSort);
        for (let i = ixStart; i <= ixEnd; ++i) {
            this.visibleItems[i].isSelected = true;
        }
    }

    deselectAll(isKeepLastSelection=false) {
        if (!isKeepLastSelection)
            this._lastSelection = null;
        this._isMultiSelection = false;
        this._items.forEach(it=>it.isSelected = false);
    }

    updateSelected(item) {
        if (this.visibleItems.includes(item)) {
            if (this._isMultiSelection)
                this.deselectAll(true);

            if (this._lastSelection && this._lastSelection !== item)
                this._lastSelection.isSelected = false;

            item.isSelected = true;
            this._lastSelection = item;
        } else
            this.deselectAll();
    }

    getSelected() {
        return this.visibleItems.filter(it=>it.isSelected);
    }

    static getCleanSearchTerm(str) {
        return (str || "").toAscii().trim().toLowerCase().split(/\s+/g).join(" ");
    }
}
List._DEFAULTS = {
    searchTerm: "",
    sortBy: "name",
    sortDir: "asc",
    fnFilter: null,
}
class ListItem {
    constructor(ix, ele, name, values, data) {
        this.ix = ix;
        this.ele = ele;
        this.name = name;
        this.values = values || {};
        this.data = data || {};

        this.searchText = null;
        this.mutRegenSearchText();

        this._isSelected = false;
    }

    mutRegenSearchText() {
        let searchText = `${this.name} - `;
        for (const k in this.values) {
            const v = this.values[k];
            if (!v)
                continue;
            searchText += `${v} - `;
        }
        this.searchText = searchText.toAscii().toLowerCase();
    }

    set isSelected(val) {
        if (this._isSelected === val)
            return;
        this._isSelected = val;

        if (this.ele instanceof $) {
            if (this._isSelected)
                this.ele.addClass("list-multi-selected");
            else
                this.ele.removeClass("list-multi-selected");
        } else {
            if (this._isSelected)
                this.ele.classList.add("list-multi-selected");
            else
                this.ele.classList.remove("list-multi-selected");
        }
    }

    get isSelected() {
        return this._isSelected;
    }
}
class ListSelectClickHandlerBase {
    static _EVT_PASS_THOUGH_TAGS = new Set(["A", "BUTTON"]);

    constructor() {
        this._firstSelection = null;
        this._lastSelection = null;

        this._selectionInitialValue = null;
    }

    get _visibleItems() {
        throw new Error("Unimplemented!");
    }

    get _allItems() {
        throw new Error("Unimplemented!");
    }

    _getCb(item, opts) {
        throw new Error("Unimplemented!");
    }

    _setCheckbox(item, opts) {
        throw new Error("Unimplemented!");
    }

    _setHighlighted(item, opts) {
        throw new Error("Unimplemented!");
    }

    handleSelectClick(item, evt, opts) {
        opts = opts || {};

        if (opts.isPassThroughEvents) {
            const evtPath = evt.composedPath();
            const subEles = evtPath.slice(0, evtPath.indexOf(evt.currentTarget));
            if (subEles.some(ele=>this.constructor._EVT_PASS_THOUGH_TAGS.has(ele?.tagName)))
                return;
        }

        evt.preventDefault();
        evt.stopPropagation();

        const cb = this._getCb(item, opts);
        if (cb.disabled)
            return true;

        if (evt && evt.shiftKey && this._firstSelection) {
            if (this._lastSelection === item) {

                this._setCheckbox(item, {
                    ...opts,
                    toVal: !cb.checked
                });
            } else if (this._firstSelection === item && this._lastSelection) {

                const ix1 = this._visibleItems.indexOf(this._firstSelection);
                const ix2 = this._visibleItems.indexOf(this._lastSelection);

                const [ixStart,ixEnd] = [ix1, ix2].sort(SortUtil.ascSort);
                for (let i = ixStart; i <= ixEnd; ++i) {
                    const it = this._visibleItems[i];
                    this._setCheckbox(it, {
                        ...opts,
                        toVal: false
                    });
                }

                this._setCheckbox(item, opts);
            } else {
                this._selectionInitialValue = this._getCb(this._firstSelection, opts).checked;

                const ix1 = this._visibleItems.indexOf(this._firstSelection);
                const ix2 = this._visibleItems.indexOf(item);
                const ix2Prev = this._lastSelection ? this._visibleItems.indexOf(this._lastSelection) : null;

                const [ixStart,ixEnd] = [ix1, ix2].sort(SortUtil.ascSort);
                const nxtOpts = {
                    ...opts,
                    toVal: this._selectionInitialValue
                };
                for (let i = ixStart; i <= ixEnd; ++i) {
                    const it = this._visibleItems[i];
                    this._setCheckbox(it, nxtOpts);
                }

                if (this._selectionInitialValue && ix2Prev != null) {
                    if (ix2Prev > ixEnd) {
                        const nxtOpts = {
                            ...opts,
                            toVal: !this._selectionInitialValue
                        };
                        for (let i = ixEnd + 1; i <= ix2Prev; ++i) {
                            const it = this._visibleItems[i];
                            this._setCheckbox(it, nxtOpts);
                        }
                    } else if (ix2Prev < ixStart) {
                        const nxtOpts = {
                            ...opts,
                            toVal: !this._selectionInitialValue
                        };
                        for (let i = ix2Prev; i < ixStart; ++i) {
                            const it = this._visibleItems[i];
                            this._setCheckbox(it, nxtOpts);
                        }
                    }
                }
            }

            this._lastSelection = item;
        } else {

            const cbMaster = this._getCb(item, opts);
            if (cbMaster) {
                cbMaster.checked = !cbMaster.checked;

                if (opts.fnOnSelectionChange)
                    opts.fnOnSelectionChange(item, cbMaster.checked);

                if (!opts.isNoHighlightSelection) {
                    this._setHighlighted(item, cbMaster.checked);
                }
            } else {
                if (!opts.isNoHighlightSelection) {
                    this._setHighlighted(item, false);
                }
            }

            this._firstSelection = item;
            this._lastSelection = null;
            this._selectionInitialValue = null;
        }
    }

    handleSelectClickRadio(item, evt) {
        evt.preventDefault();
        evt.stopPropagation();

        this._allItems.forEach(itemOther=>{
            const cb = this._getCb(itemOther);

            if (itemOther === item) {
                cb.checked = true;
                this._setHighlighted(itemOther, true);
            } else {
                cb.checked = false;
                this._setHighlighted(itemOther, false);
            }
        }
        );
    }
}

class ListSelectClickHandler extends ListSelectClickHandlerBase {
    constructor({list}) {
        super();
        this._list = list;
    }

    get _visibleItems() {
        return this._list.visibleItems;
    }

    get _allItems() {
        return this._list.items;
    }

    _getCb(item, opts={}) {
        return opts.fnGetCb ? opts.fnGetCb(item) : item.data.cbSel;
    }

    _setCheckbox(item, opts={}) {
        return this.setCheckbox(item, opts);
    }

    _setHighlighted(item, isHighlighted) {
        if (isHighlighted)
            item.ele instanceof $ ? item.ele.addClass("list-multi-selected") : item.ele.classList.add("list-multi-selected");
        else
            item.ele instanceof $ ? item.ele.removeClass("list-multi-selected") : item.ele.classList.remove("list-multi-selected");
    }

    setCheckbox(item, {fnGetCb, fnOnSelectionChange, isNoHighlightSelection, toVal=true}={}) {
        const cbSlave = this._getCb(item, {
            fnGetCb,
            fnOnSelectionChange,
            isNoHighlightSelection
        });

        if (cbSlave?.disabled)
            return;

        if (cbSlave) {
            cbSlave.checked = toVal;
            if (fnOnSelectionChange)
                fnOnSelectionChange(item, toVal);
        }

        if (isNoHighlightSelection)
            return;

        this._setHighlighted(item, toVal);
    }

    bindSelectAllCheckbox($cbAll) {
        $cbAll.change(()=>{
            const isChecked = $cbAll.prop("checked");
            this.setCheckboxes({
                isChecked
            });
        }
        );
    }

    setCheckboxes({isChecked, isIncludeHidden}) {
        (isIncludeHidden ? this._list.items : this._list.visibleItems).forEach(item=>{
            if (item.data.cbSel?.disabled)
                return;

            if (item.data.cbSel)
                item.data.cbSel.checked = isChecked;

            this._setHighlighted(item, isChecked);
        }
        );
    }
}
//#endregion



function _class_renderEntriesSection(parentDiv, className, entries, { $wrpTable = null } = {})
{
    //entries can look like this:
    //{entries: (array of classFeatures. Real kind, not the UID kind), type:"section"};
    console.log(entries);

    //Collapse button
    /* const _0x4c8fa0 = $("<div class=\"py-1 pl-2 clickable ve-muted\">[‒]</div>").click(() => {
      _0x4c8fa0.text(_0x4c8fa0.text() === '[+]' ? '[‒]' : "[+]");
      if ($wrpTable) {
        $wrpTable.toggleVe();
      }
      _0x3fe7d2.toggleVe();
    });*/
    //Despite what the name may seem, it actually genererates the ENTIRETY of all the text for all the class features
    const entriesText = Renderer.hover.$getHoverContent_generic(entries);

    //Original
    /* $`<div class="ve-flex-col">
        <div class="split-v-center">
            <div class="rd__h rd__h--0">
                <div class="entry-title-inner">${(className || '').qq()}</div>
            </div>
            ${_0x4c8fa0}
        </div>
        ${$wrpTable}
        ${entriesText}
    </div>`.appendTo(parentDiv); */

    console.log(entriesText);
    console.log(entriesText[0]);
    console.log(entriesText[0].outerHTML);

    //My simpler version
    $(`<div class="ve-flex-col">
        <div class="split-v-center">
            <div class="rd__h rd__h--0">
                <div class="entry-title-inner">${(className || '').qq()}</div>
            </div>
        </div>
        ${entriesText[0].outerHTML}
    </div>`).appendTo(parentDiv);
}

globalThis.HASH_LIST_SEP = "_";
globalThis.HASH_PART_SEP = ",";

//#region Extension Functions
String.prototype.toAscii = String.prototype.toAscii || function() {
    return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Æ/g, "AE").replace(/æ/g, "ae");
};
Array.prototype.mergeMap || Object.defineProperty(Array.prototype, "mergeMap", {
    enumerable: false,
    writable: true,
    value: function(fnMap) {
        return this.map((...args)=>fnMap(...args)).filter(it=>it != null).reduce((a,b)=>Object.assign(a, b), {});
    },
});
String.prototype.toUrlified = String.prototype.toUrlified || function() {
    return encodeURIComponent(this.toLowerCase()).toLowerCase();
}
;
String.prototype.qq = String.prototype.qq || function() {
    return this.escapeQuotes();
}
;
String.prototype.escapeQuotes = String.prototype.escapeQuotes || function() {
    return this.replace(/'/g, `&apos;`).replace(/"/g, `&quot;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`);
}
;
//#endregion

//#region Jquery Extensions
globalThis.JqueryUtil = {
    _isEnhancementsInit: false,
    initEnhancements() {
        if (JqueryUtil._isEnhancementsInit)
            return;
        JqueryUtil._isEnhancementsInit = true;

        JqueryUtil.addSelectors();

        window.$$ = function(parts, ...args) {
            if (parts instanceof jQuery || parts instanceof HTMLElement) {
                return (...passed)=>{
                    const parts2 = [...passed[0]];
                    const args2 = passed.slice(1);
                    parts2[0] = `<div>${parts2[0]}`;
                    parts2.last(`${parts2.last()}</div>`);

                    const $temp = $$(parts2, ...args2);
                    $temp.children().each((i,e)=>$(e).appendTo(parts));
                    return parts;
                }
                ;
            } else {
                const $eles = [];
                let ixArg = 0;

                const handleArg = (arg)=>{
                    if (arg instanceof $) {
                        $eles.push(arg);
                        return `<${arg.tag()} data-r="true"></${arg.tag()}>`;
                    } else if (arg instanceof HTMLElement) {
                        return handleArg($(arg));
                    } else
                        return arg;
                }
                ;

                const raw = parts.reduce((html,p)=>{
                    const myIxArg = ixArg++;
                    if (args[myIxArg] == null)
                        return `${html}${p}`;
                    if (args[myIxArg]instanceof Array)
                        return `${html}${args[myIxArg].map(arg=>handleArg(arg)).join("")}${p}`;
                    else
                        return `${html}${handleArg(args[myIxArg])}${p}`;
                }
                );
                const $res = $(raw);

                if ($res.length === 1) {
                    if ($res.attr("data-r") === "true")
                        return $eles[0];
                    else
                        $res.find(`[data-r=true]`).replaceWith(i=>$eles[i]);
                } else {
                    const $tmp = $(`<div></div>`);
                    $tmp.append($res);
                    $tmp.find(`[data-r=true]`).replaceWith(i=>$eles[i]);
                    return $tmp.children();
                }

                return $res;
            }
        }
        ;

        $.fn.extend({
            disableSpellcheck: function() {
                return this.attr("autocomplete", "new-password").attr("autocapitalize", "off").attr("spellcheck", "false");
            },
            tag: function() {
                return this.prop("tagName").toLowerCase();
            },
            title: function(...args) {
                return this.attr("title", ...args);
            },
            placeholder: function(...args) {
                return this.attr("placeholder", ...args);
            },
            disable: function() {
                return this.attr("disabled", true);
            },

            fastSetHtml: function(html) {
                if (!this.length)
                    return this;
                let tgt = this[0];
                while (tgt.children.length) {
                    tgt = tgt.children[0];
                }
                tgt.innerHTML = html;
                return this;
            },

            blurOnEsc: function() {
                return this.keydown(evt=>{
                    if (evt.which === 27)
                        this.blur();
                }
                );
            },

            hideVe: function() {
                return this.addClass("ve-hidden");
            },
            showVe: function() {
                return this.removeClass("ve-hidden");
            },
            toggleVe: function(val) {
                if (val === undefined)
                    return this.toggleClass("ve-hidden", !this.hasClass("ve-hidden"));
                else
                    return this.toggleClass("ve-hidden", !val);
            },
        });

        $.event.special.destroyed = {
            remove: function(o) {
                if (o.handler)
                    o.handler();
            },
        };
    },

    addSelectors() {
        $.expr[":"].textEquals = (el,i,m)=>$(el).text().toLowerCase().trim() === m[3].unescapeQuotes();

        $.expr[":"].containsInsensitive = (el,i,m)=>{
            const searchText = m[3];
            const textNode = $(el).contents().filter((i,e)=>e.nodeType === 3)[0];
            if (!textNode)
                return false;
            const match = textNode.nodeValue.toLowerCase().trim().match(`${searchText.toLowerCase().trim().escapeRegexp()}`);
            return match && match.length > 0;
        }
        ;
    },

    showCopiedEffect(eleOr$Ele, text="Copied!", bubble) {
        const $ele = eleOr$Ele instanceof $ ? eleOr$Ele : $(eleOr$Ele);

        const top = $(window).scrollTop();
        const pos = $ele.offset();

        const animationOptions = {
            top: "-=8",
            opacity: 0,
        };
        if (bubble) {
            animationOptions.left = `${Math.random() > 0.5 ? "-" : "+"}=${~~(Math.random() * 17)}`;
        }
        const seed = Math.random();
        const duration = bubble ? 250 + seed * 200 : 250;
        const offsetY = bubble ? 16 : 0;

        const $dispCopied = $(`<div class="clp__disp-copied ve-flex-vh-center py-2 px-4"></div>`);
        $dispCopied.html(text).css({
            top: (pos.top - 24) + offsetY - top,
            left: pos.left + ($ele.width() / 2),
        }).appendTo(document.body).animate(animationOptions, {
            duration,
            complete: ()=>$dispCopied.remove(),
            progress: (_,progress)=>{
                if (bubble) {
                    const diffProgress = 0.5 - progress;
                    animationOptions.top = `${diffProgress > 0 ? "-" : "+"}=40`;
                    $dispCopied.css("transform", `rotate(${seed > 0.5 ? "-" : ""}${seed * 500 * progress}deg)`);
                }
            }
            ,
        }, );
    },

    _dropdownInit: false,
    bindDropdownButton($ele) {
        if (!JqueryUtil._dropdownInit) {
            JqueryUtil._dropdownInit = true;
            document.addEventListener("click", ()=>[...document.querySelectorAll(`.open`)].filter(ele=>!(ele.className || "").split(" ").includes(`dropdown--navbar`)).forEach(ele=>ele.classList.remove("open")));
        }
        $ele.click(()=>setTimeout(()=>$ele.parent().addClass("open"), 1));
    },

    _WRP_TOAST: null,
    _ACTIVE_TOAST: [],
    doToast(options) {
        if (typeof window === "undefined")
            return;

        if (JqueryUtil._WRP_TOAST == null) {
            JqueryUtil._WRP_TOAST = e_({
                tag: "div",
                clazz: "toast__container no-events w-100 overflow-y-hidden ve-flex-col",
            });
            document.body.appendChild(JqueryUtil._WRP_TOAST);
        }

        if (typeof options === "string") {
            options = {
                content: options,
                type: "info",
            };
        }
        options.type = options.type || "info";

        options.isAutoHide = options.isAutoHide ?? true;
        options.autoHideTime = options.autoHideTime ?? 5000;

        const eleToast = e_({
            tag: "div",
            clazz: `toast toast--type-${options.type} events-initial relative my-2 mx-auto`,
            children: [e_({
                tag: "div",
                clazz: "toast__wrp-content",
                children: [options.content instanceof $ ? options.content[0] : options.content, ],
            }), e_({
                tag: "div",
                clazz: "toast__wrp-control",
                children: [e_({
                    tag: "button",
                    clazz: "btn toast__btn-close",
                    children: [e_({
                        tag: "span",
                        clazz: "glyphicon glyphicon-remove",
                    }), ],
                }), ],
            }), ],
            mousedown: evt=>{
                evt.preventDefault();
            }
            ,
            click: evt=>{
                evt.preventDefault();
                JqueryUtil._doToastCleanup(toastMeta);

                if (!evt.shiftKey)
                    return;
                [...JqueryUtil._ACTIVE_TOAST].forEach(toastMeta=>JqueryUtil._doToastCleanup(toastMeta));
            }
            ,
        });

        eleToast.prependTo(JqueryUtil._WRP_TOAST);

        const toastMeta = {
            isAutoHide: !!options.isAutoHide,
            eleToast
        };
        JqueryUtil._ACTIVE_TOAST.push(toastMeta);

        AnimationUtil.pRecomputeStyles().then(()=>{
            eleToast.addClass(`toast--animate`);

            if (options.isAutoHide) {
                setTimeout(()=>{
                    JqueryUtil._doToastCleanup(toastMeta);
                }
                , options.autoHideTime);
            }

            if (JqueryUtil._ACTIVE_TOAST.length >= 3) {
                JqueryUtil._ACTIVE_TOAST.filter(({isAutoHide})=>!isAutoHide).forEach(toastMeta=>{
                    JqueryUtil._doToastCleanup(toastMeta);
                }
                );
            }
        }
        );
    },

    _doToastCleanup(toastMeta) {
        toastMeta.eleToast.removeClass("toast--animate");
        JqueryUtil._ACTIVE_TOAST.splice(JqueryUtil._ACTIVE_TOAST.indexOf(toastMeta), 1);
        setTimeout(()=>toastMeta.eleToast.parentElement && toastMeta.eleToast.remove(), 85);
    },

    isMobile() {
        if (navigator?.userAgentData?.mobile)
            return true;
        return window.matchMedia("(max-width: 768px)").matches;
    },
};
//#endregion

//#region ContentGetter
class ContentGetter{
    static _getBase(){
        

        const class_barbarian = String.raw`{
        "class": [
            {
                "name": "Barbarian",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "hd": {
                    "number": 1,
                    "faces": 12
                },
                "proficiency": [
                    "str",
                    "con"
                ],
                "startingProficiencies": {
                    "armor": [
                        "light",
                        "medium",
                        "{@item shield|phb|shields}"
                    ],
                    "weapons": [
                        "simple",
                        "martial"
                    ],
                    "skills": [
                        {
                            "choose": {
                                "from": [
                                    "animal handling",
                                    "athletics",
                                    "intimidation",
                                    "nature",
                                    "perception",
                                    "survival"
                                ],
                                "count": 2
                            }
                        }
                    ]
                },
                "startingEquipment": {
                    "additionalFromBackground": true,
                    "default": [
                        "(a) a {@item greataxe|phb} or (b) any {@filter martial melee weapon|items|source=phb|category=basic|type=martial weapon;melee weapon=u~u~sand}",
                        "(a) two {@item handaxe|phb|handaxes} or (b) any {@filter simple weapon|items|source=phb|category=basic|type=simple weapon}",
                        "An {@item explorer's pack|phb}, and four {@item javelin|phb|javelins}"
                    ],
                    "goldAlternative": "{@dice 2d4 × 10|2d4 × 10|Starting Gold}",
                    "defaultData": [
                        {
                            "a": [
                                "greataxe|phb"
                            ],
                            "b": [
                                {
                                    "equipmentType": "weaponMartialMelee"
                                }
                            ]
                        },
                        {
                            "a": [
                                {
                                    "item": "handaxe|phb",
                                    "quantity": 2
                                }
                            ],
                            "b": [
                                {
                                    "equipmentType": "weaponSimple"
                                }
                            ]
                        },
                        {
                            "_": [
                                "explorer's pack|phb",
                                {
                                    "item": "javelin|phb",
                                    "quantity": 4
                                }
                            ]
                        }
                    ]
                },
                "multiclassing": {
                    "requirements": {
                        "str": 13
                    },
                    "proficienciesGained": {
                        "armor": [
                            "{@item shield|phb|shields}"
                        ],
                        "weapons": [
                            "simple",
                            "martial"
                        ]
                    }
                },
                "classTableGroups": [
                    {
                        "colLabels": [
                            "Rages",
                            "Rage Damage"
                        ],
                        "rows": [
                            [
                                "2",
                                {
                                    "type": "bonus",
                                    "value": 2
                                }
                            ],
                            [
                                "2",
                                {
                                    "type": "bonus",
                                    "value": 2
                                }
                            ],
                            [
                                "3",
                                {
                                    "type": "bonus",
                                    "value": 2
                                }
                            ],
                            [
                                "3",
                                {
                                    "type": "bonus",
                                    "value": 2
                                }
                            ],
                            [
                                "3",
                                {
                                    "type": "bonus",
                                    "value": 2
                                }
                            ],
                            [
                                "4",
                                {
                                    "type": "bonus",
                                    "value": 2
                                }
                            ],
                            [
                                "4",
                                {
                                    "type": "bonus",
                                    "value": 2
                                }
                            ],
                            [
                                "4",
                                {
                                    "type": "bonus",
                                    "value": 2
                                }
                            ],
                            [
                                "4",
                                {
                                    "type": "bonus",
                                    "value": 3
                                }
                            ],
                            [
                                "4",
                                {
                                    "type": "bonus",
                                    "value": 3
                                }
                            ],
                            [
                                "4",
                                {
                                    "type": "bonus",
                                    "value": 3
                                }
                            ],
                            [
                                "5",
                                {
                                    "type": "bonus",
                                    "value": 3
                                }
                            ],
                            [
                                "5",
                                {
                                    "type": "bonus",
                                    "value": 3
                                }
                            ],
                            [
                                "5",
                                {
                                    "type": "bonus",
                                    "value": 3
                                }
                            ],
                            [
                                "5",
                                {
                                    "type": "bonus",
                                    "value": 3
                                }
                            ],
                            [
                                "5",
                                {
                                    "type": "bonus",
                                    "value": 4
                                }
                            ],
                            [
                                "6",
                                {
                                    "type": "bonus",
                                    "value": 4
                                }
                            ],
                            [
                                "6",
                                {
                                    "type": "bonus",
                                    "value": 4
                                }
                            ],
                            [
                                "6",
                                {
                                    "type": "bonus",
                                    "value": 4
                                }
                            ],
                            [
                                "Unlimited",
                                {
                                    "type": "bonus",
                                    "value": 4
                                }
                            ]
                        ]
                    }
                ],
                "classFeatures": [
                    "Rage|Barbarian||1",
                    "Unarmored Defense|Barbarian||1",
                    "Danger Sense|Barbarian||2",
                    "Reckless Attack|Barbarian||2",
                    {
                        "classFeature": "Primal Path|Barbarian||3",
                        "gainSubclassFeature": true
                    },
                    "Primal Knowledge|Barbarian||3|TCE",
                    "Ability Score Improvement|Barbarian||4",
                    "Extra Attack|Barbarian||5",
                    "Fast Movement|Barbarian||5",
                    {
                        "classFeature": "Path Feature|Barbarian||6",
                        "gainSubclassFeature": true
                    },
                    "Feral Instinct|Barbarian||7",
                    "Instinctive Pounce|Barbarian||7|TCE",
                    "Ability Score Improvement|Barbarian||8",
                    "Brutal Critical (1 die)|Barbarian||9",
                    {
                        "classFeature": "Path feature|Barbarian||10",
                        "gainSubclassFeature": true
                    },
                    "Relentless Rage|Barbarian||11",
                    "Ability Score Improvement|Barbarian||12",
                    "Brutal Critical (2 dice)|Barbarian||13",
                    {
                        "classFeature": "Path feature|Barbarian||14",
                        "gainSubclassFeature": true
                    },
                    "Persistent Rage|Barbarian||15",
                    "Ability Score Improvement|Barbarian||16",
                    "Brutal Critical (3 dice)|Barbarian||17",
                    "Indomitable Might|Barbarian||18",
                    "Ability Score Improvement|Barbarian||19",
                    "Primal Champion|Barbarian||20"
                ],
                "subclassTitle": "Primal Path",
                "fluff": [
                    {
                        "name": "Barbarian",
                        "type": "section",
                        "entries": [
                            "A tall human tribesman strides through a blizzard, draped in fur and hefting his axe. He laughs as he charges toward the frost giant who dared poach his people's elk herd.",
                            "A half-orc snarls at the latest challenger to her authority over their savage tribe, ready to break his neck with her bare hands as she did to the last six rivals.",
                            "Frothing at the mouth, a dwarf slams his helmet into the face of his drow foe, then turns to drive his armored elbow into the gut of another.",
                            "These barbarians, different as they might be, are defined by their rage: unbridled, unquenchable, and unthinking fury. More than a mere emotion, their anger is the ferocity of a cornered predator, the unrelenting assault of a storm, the churning turmoil of the sea.",
                            "For some, their rage springs from a communion with fierce animal spirits. Others draw from a roiling reservoir of anger at a world full of pain. For every barbarian, rage is a power that fuels not just a battle frenzy but also uncanny reflexes, resilience, and feats of strength.",
                            {
                                "type": "entries",
                                "name": "Primal Instinct",
                                "entries": [
                                    "People of towns and cities take pride in how their civilized ways set them apart from animals, as if denying one's own nature was a mark of superiority. To a barbarian, though, civilization is no virtue, but a sign of weakness. The strong embrace their animal nature\u2014keen instincts, primal physicality, and ferocious rage. Barbarians are uncomfortable when hedged in by walls and crowds. They thrive in the wilds of their homelands: the tundra, jungle, or grasslands where their tribes live and hunt.",
                                    "Barbarians come alive in the chaos of combat. They can enter a berserk state where rage takes over, giving them superhuman strength and resilience. A barbarian can draw on this reservoir of fury only a few times without resting, but those few rages are usually sufficient to defeat whatever threats arise."
                                ]
                            },
                            {
                                "type": "entries",
                                "name": "A Life of Danger",
                                "entries": [
                                    "Not every member of the tribes deemed \"barbarians\" by scions of civilized society has the barbarian class. A true barbarian among these people is as uncommon as a skilled fighter in a town, and he or she plays a similar role as a protector of the people and a leader in times of war. Life in the wild places of the world is fraught with peril: rival tribes, deadly weather, and terrifying monsters. Barbarians charge headlong into that danger so that their people don't have to.",
                                    "Their courage in the face of danger makes barbarians perfectly suited for adventuring. Wandering is often a way of life for their native tribes, and the rootless life of the adventurer is little hardship for a barbarian. Some barbarians miss the close-knit family structures of the tribe, but eventually find them replaced by the bonds formed among the members of their adventuring parties."
                                ]
                            },
                            {
                                "type": "entries",
                                "name": "Creating a Barbarian",
                                "entries": [
                                    "When creating a barbarian character, think about where your character comes from and his or her place in the world. Talk with your DM about an appropriate origin for your barbarian. Did you come from a distant land, making you a stranger in the area of the campaign? Or is the campaign set in a rough-and-tumble frontier where barbarians are common?",
                                    "What led you to take up the adventuring life? Were you lured to settled lands by the promise of riches? Did you join forces with soldiers of those lands to face a shared threat? Did monsters or an invading horde drive you out of your homeland, making you a rootless refugee? Perhaps you were a prisoner of war, brought in chains to \"civilized\" lands and only now able to win your freedom. Or you might have been cast out from your people because of a crime you committed, a taboo you violated, or a coup that removed you from a position of authority.",
                                    {
                                        "type": "entries",
                                        "name": "Quick Build",
                                        "entries": [
                                            "You can make a barbarian quickly by following these suggestions. First, put your highest ability score in Strength, followed by Constitution. Second, choose the {@background outlander} background."
                                        ]
                                    }
                                ]
                            }
                        ],
                        "source": "PHB",
                        "page": 46
                    },
                    {
                        "type": "section",
                        "entries": [
                            {
                                "type": "quote",
                                "entries": [
                                    "I have witnessed the indomitable performance of barbarians on the field of battle, and it makes me wonder what force lies at the heart of their rage."
                                ],
                                "by": "Seret, archwizard"
                            },
                            "The anger felt by a normal person resembles the rage of a barbarian in the same way that a gentle breeze is akin to a furious thunderstorm. The barbarian's driving force comes from a place that transcends mere emotion, making its manifestation all the more terrible. Whether the impetus for the fury comes entirely from within or from forging a link with a spirit animal, a raging barbarian becomes able to perform supernatural feats of strength and endurance. The outburst is temporary, but while it lasts, it takes over body and mind, driving the barbarian on despite peril and injury, until the last enemy falls.",
                            "It can be tempting to play a barbarian character that is a straightforward application of the classic archetype\u2014a brute, and usually a dimwitted one at that, who rushes in where others fear to tread. But not all the barbarians in the world are cut from that cloth, so you can certainly put your own spin on things. Either way, consider adding some flourishes to make your barbarian stand out from all others; see the following sections for some ideas.",
                            {
                                "type": "entries",
                                "name": "Personal Totems",
                                "entries": [
                                    "Barbarians tend to travel light, carrying little in the way of personal effects or other unnecessary gear. The few possessions they do carry often include small items that have special significance. A personal totem is significant because it has a mystical origin or is tied to an important moment in the character's life\u2014perhaps a remembrance from the barbarian's past or a harbinger of what lies ahead.",
                                    "A personal totem of this sort might be associated with a barbarian's spirit animal, or might actually be the totem object for the animal, but such a connection is not essential. One who has a bear totem spirit, for instance, could still carry an eagle's feather as a personal totem.",
                                    "Consider creating one or more personal totems for your character\u2014objects that hold a special link to your character's past or future. Think about how a totem might affect your character's actions.",
                                    {
                                        "type": "table",
                                        "caption": "Personal Totems",
                                        "colLabels": [
                                            "{@dice d6}",
                                            "Totem"
                                        ],
                                        "colStyles": [
                                            "col-1 text-center",
                                            "col-11"
                                        ],
                                        "rows": [
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 1
                                                    }
                                                },
                                                "A tuft of fur from a solitary wolf that you befriended during a hunt"
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 2
                                                    }
                                                },
                                                "Three eagle feathers given to you by a wise shaman, who told you they would play a role in determining your fate"
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 3
                                                    }
                                                },
                                                "A necklace made from the claws of a young cave bear that you slew singlehandedly as a child"
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 4
                                                    }
                                                },
                                                "A small leather pouch holding three stones that represent your ancestors"
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 5
                                                    }
                                                },
                                                "A few small bones from the first beast you killed, tied together with colored wool"
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 6
                                                    }
                                                },
                                                "An egg-sized stone in the shape of your spirit animal that appeared one day in your belt pouch"
                                            ]
                                        ]
                                    }
                                ]
                            },
                            {
                                "type": "entries",
                                "name": "Tattoos",
                                "entries": [
                                    "The members of many barbarian clans decorate their bodies with tattoos, each of which represents a significant moment in the life of the bearer or the bearer's ancestors, or which symbolizes a feeling or an attitude. As with personal totems, a barbarian's tattoos might or might not be related to an animal spirit.",
                                    "Each tattoo a barbarian displays contributes to that individual's identity. If your character wears tattoos, what do they look like, and what do they represent?",
                                    {
                                        "type": "table",
                                        "caption": "Tattoos",
                                        "colLabels": [
                                            "{@dice d6}",
                                            "Tattoo"
                                        ],
                                        "colStyles": [
                                            "col-1 text-center",
                                            "col-11"
                                        ],
                                        "rows": [
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 1
                                                    }
                                                },
                                                "The wings of an eagle are spread wide across your upper back."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 2
                                                    }
                                                },
                                                "Etched on the backs of your hands are the paws of a cave bear."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 3
                                                    }
                                                },
                                                "The symbols of your clan are displayed in viny patterns along your arms."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 4
                                                    }
                                                },
                                                "The antlers of an elk are inked across your back."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 5
                                                    }
                                                },
                                                "Images of your spirit animal are tattooed along your weapon arm and hand."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 6
                                                    }
                                                },
                                                "The eyes of a wolf are marked on your back to help you see and ward off evil spirits."
                                            ]
                                        ]
                                    }
                                ]
                            },
                            {
                                "type": "entries",
                                "name": "Superstitions",
                                "entries": [
                                    "Barbarians vary widely in how they understand life. Some follow gods and look for guidance from those deities in the cycles of nature and the animals they encounter. These barbarians believe that spirits inhabit the plants and animals of the world, and the barbarians look to them for omens and power.",
                                    "Other barbarians trust only in the blood that runs in their veins and the steel they hold in their hands. They have no use for the invisible world, instead relying on their senses to hunt and survive like the wild beasts they emulate.",
                                    "Both of these attitudes can give rise to superstitions. These beliefs are often passed down within a family or shared among the members of a clan or a hunting group.",
                                    "If your barbarian character has any superstitions, were they ingrained in you by your family, or are they the result of personal experience?",
                                    {
                                        "type": "table",
                                        "caption": "Superstition",
                                        "colLabels": [
                                            "{@dice d6}",
                                            "Superstition"
                                        ],
                                        "colStyles": [
                                            "col-1 text-center",
                                            "col-11"
                                        ],
                                        "rows": [
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 1
                                                    }
                                                },
                                                "If you disturb the bones of the dead, you inherit all the troubles that plagued them in life."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 2
                                                    }
                                                },
                                                "Never trust a wizard. They're all devils in disguise, especially the friendly ones."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 3
                                                    }
                                                },
                                                "Dwarves have lost their spirits, and are almost like the undead. That's why they live underground."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 4
                                                    }
                                                },
                                                "Magical things bring trouble. Never sleep with a magic object within ten feet of you."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 5
                                                    }
                                                },
                                                "When you walk through a graveyard, be sure to wear silver, or a ghost might jump into your body."
                                            ],
                                            [
                                                {
                                                    "type": "cell",
                                                    "roll": {
                                                        "exact": 6
                                                    }
                                                },
                                                "If an elf looks you in the eyes, she's trying to read your thoughts."
                                            ]
                                        ]
                                    }
                                ]
                            }
                        ],
                        "source": "XGE",
                        "page": 8
                    }
                ]
            }
        ],
        "subclass": [
            {
                "name": "Path of the Berserker",
                "shortName": "Berserker",
                "source": "PHB",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 49,
                "srd": true,
                "subclassFeatures": [
                    "Path of the Berserker|Barbarian||Berserker||3",
                    "Mindless Rage|Barbarian||Berserker||6",
                    "Intimidating Presence|Barbarian||Berserker||10",
                    "Retaliation|Barbarian||Berserker||14"
                ]
            },
            {
                "name": "Path of the Totem Warrior",
                "shortName": "Totem Warrior",
                "source": "PHB",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 50,
                "additionalSpells": [
                    {
                        "innate": {
                            "3": {
                                "ritual": [
                                    "beast sense",
                                    "speak with animals"
                                ]
                            },
                            "10": {
                                "ritual": [
                                    "commune with nature"
                                ]
                            }
                        }
                    }
                ],
                "subclassFeatures": [
                    "Path of the Totem Warrior|Barbarian||Totem Warrior||3",
                    "Aspect of the Beast|Barbarian||Totem Warrior||6",
                    "Spirit Walker|Barbarian||Totem Warrior||10",
                    "Totemic Attunement|Barbarian||Totem Warrior||14"
                ]
            },
            {
                "name": "Path of the Battlerager",
                "shortName": "Battlerager",
                "source": "SCAG",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 121,
                "subclassFeatures": [
                    "Path of the Battlerager|Barbarian||Battlerager|SCAG|3",
                    "Reckless Abandon|Barbarian||Battlerager|SCAG|6",
                    "Battlerager Charge|Barbarian||Battlerager|SCAG|10",
                    "Spiked Retribution|Barbarian||Battlerager|SCAG|14"
                ]
            },
            {
                "name": "Path of the Ancestral Guardian",
                "shortName": "Ancestral Guardian",
                "source": "XGE",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 9,
                "spellcastingAbility": "wis",
                "additionalSpells": [
                    {
                        "innate": {
                            "10": [
                                "augury",
                                "clairvoyance"
                            ]
                        }
                    }
                ],
                "subclassFeatures": [
                    "Path of the Ancestral Guardian|Barbarian||Ancestral Guardian|XGE|3",
                    "Spirit Shield|Barbarian||Ancestral Guardian|XGE|6",
                    "Consult the Spirits|Barbarian||Ancestral Guardian|XGE|10",
                    "Vengeful Ancestors|Barbarian||Ancestral Guardian|XGE|14"
                ]
            },
            {
                "name": "Path of the Storm Herald",
                "shortName": "Storm Herald",
                "source": "XGE",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 10,
                "subclassFeatures": [
                    "Path of the Storm Herald|Barbarian||Storm Herald|XGE|3",
                    "Storm Soul|Barbarian||Storm Herald|XGE|6",
                    "Shielding Storm|Barbarian||Storm Herald|XGE|10",
                    "Raging Storm|Barbarian||Storm Herald|XGE|14"
                ]
            },
            {
                "name": "Path of the Zealot",
                "shortName": "Zealot",
                "source": "XGE",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 11,
                "subclassFeatures": [
                    "Path of the Zealot|Barbarian||Zealot|XGE|3",
                    "Fanatical Focus|Barbarian||Zealot|XGE|6",
                    "Zealous Presence|Barbarian||Zealot|XGE|10",
                    "Rage beyond Death|Barbarian||Zealot|XGE|14"
                ]
            },
            {
                "name": "Path of the Beast",
                "shortName": "Beast",
                "source": "TCE",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 24,
                "subclassFeatures": [
                    "Path of the Beast|Barbarian||Beast|TCE|3",
                    "Bestial Soul|Barbarian||Beast|TCE|6",
                    "Infectious Fury|Barbarian||Beast|TCE|10",
                    "Call the Hunt|Barbarian||Beast|TCE|14"
                ]
            },
            {
                "name": "Path of Wild Magic",
                "shortName": "Wild Magic",
                "source": "TCE",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 25,
                "subclassFeatures": [
                    "Path of Wild Magic|Barbarian||Wild Magic|TCE|3",
                    "Bolstering Magic|Barbarian||Wild Magic|TCE|6",
                    "Unstable Backlash|Barbarian||Wild Magic|TCE|10",
                    "Controlled Surge|Barbarian||Wild Magic|TCE|14"
                ]
            },
            {
                "name": "Path of the Juggernaut",
                "shortName": "Juggernaut",
                "source": "TDCSR",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 165,
                "subclassFeatures": [
                    "Path of the Juggernaut|Barbarian|PHB|Juggernaut|TDCSR|3",
                    "Demolishing Might|Barbarian|PHB|Juggernaut|TDCSR|6",
                    "Resolute Stance|Barbarian|PHB|Juggernaut|TDCSR|6",
                    "Thunderous Blows (10th Level)|Barbarian|PHB|Juggernaut|TDCSR|10",
                    "Hurricane Strike|Barbarian|PHB|Juggernaut|TDCSR|10",
                    "Unstoppable|Barbarian|PHB|Juggernaut|TDCSR|14"
                ]
            },
            {
                "name": "Path of the Giant",
                "shortName": "Giant",
                "source": "BGG",
                "className": "Barbarian",
                "classSource": "PHB",
                "page": 1,
                "spellcastingAbility": "wis",
                "additionalSpells": [
                    {
                        "innate": {
                            "3": [
                                "druidcraft#c"
                            ]
                        }
                    },
                    {
                        "innate": {
                            "3": [
                                "thaumaturgy#c"
                            ]
                        }
                    }
                ],
                "subclassFeatures": [
                    "Path of the Giant|Barbarian||Giant|BGG|3",
                    "Elemental Cleaver|Barbarian||Giant|BGG|6",
                    "Mighty Impel|Barbarian||Giant|BGG|10",
                    "Demiurgic Colossus|Barbarian||Giant|BGG|14"
                ]
            }
        ],
        "classFeature": [
            {
                "name": "Rage",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 1,
                "entries": [
                    "In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action.",
                    "While raging, you gain the following benefits if you aren't wearing heavy armor:",
                    {
                        "type": "list",
                        "items": [
                            "You have advantage on Strength checks and Strength saving throws.",
                            "When you make a melee weapon attack using Strength, you gain a +2 bonus to the damage roll. This bonus increases as you level.",
                            "You have resistance to bludgeoning, piercing, and slashing damage."
                        ]
                    },
                    "If you are able to cast spells, you can't cast them or concentrate on them while raging.",
                    "Your rage lasts for 1 minute. It ends early if you are knocked {@condition unconscious} or if your turn ends and you haven't attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on your turn as a bonus action.",
                    "Once you have raged the maximum number of times for your barbarian level, you must finish a long rest before you can rage again. You may rage 2 times at 1st level, 3 at 3rd, 4 at 6th, 5 at 12th, and 6 at 17th."
                ]
            },
            {
                "name": "Unarmored Defense",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 1,
                "entries": [
                    "While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit."
                ]
            },
            {
                "name": "Danger Sense",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 2,
                "entries": [
                    "At 2nd level, you gain an uncanny sense of when things nearby aren't as they should be, giving you an edge when you dodge away from danger. You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. To gain this benefit, you can't be {@condition blinded}, {@condition deafened}, or {@condition incapacitated}."
                ]
            },
            {
                "name": "Reckless Attack",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 2,
                "entries": [
                    "Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn."
                ]
            },
            {
                "name": "Primal Knowledge",
                "source": "TCE",
                "page": 24,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 3,
                "isClassFeatureVariant": true,
                "entries": [
                    "{@i 3rd-level barbarian {@variantrule optional class features|tce|optional feature}}",
                    "When you reach 3rd level and again at 10th level, you gain proficiency in one skill of your choice from the list of skills available to barbarians at 1st level."
                ]
            },
            {
                "name": "Primal Path",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 3,
                "entries": [
                    "At 3rd level, you choose a path that shapes the nature of your rage from the list of available paths. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels."
                ]
            },
            {
                "name": "Ability Score Improvement",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 4,
                "entries": [
                    "When you reach 4th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                    "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                ]
            },
            {
                "name": "Extra Attack",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 5,
                "entries": [
                    "Beginning at 5th level, you can attack twice, instead of once, whenever you take the {@action Attack} action on your turn."
                ]
            },
            {
                "name": "Fast Movement",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 5,
                "entries": [
                    "Starting at 5th level, your speed increases by 10 feet while you aren't wearing heavy armor."
                ]
            },
            {
                "name": "Path Feature",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 6,
                "entries": [
                    "At 6th level, you gain a feature from your Primal Path."
                ]
            },
            {
                "name": "Feral Instinct",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 7,
                "entries": [
                    "By 7th level, your instincts are so honed that you have advantage on initiative rolls.",
                    "Additionally, if you are {@quickref Surprise|PHB|3|0|surprised} at the beginning of combat and aren't {@condition incapacitated}, you can act normally on your first turn, but only if you enter your rage before doing anything else on that turn."
                ]
            },
            {
                "name": "Instinctive Pounce",
                "source": "TCE",
                "page": 24,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 7,
                "isClassFeatureVariant": true,
                "entries": [
                    "{@i 7th-level barbarian {@variantrule optional class features|tce|optional feature}}",
                    "As part of the bonus action you take to enter your rage, you can move up to half your speed."
                ]
            },
            {
                "name": "Ability Score Improvement",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 8,
                "entries": [
                    "When you reach 8th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                    "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                ]
            },
            {
                "name": "Brutal Critical (1 die)",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 9,
                "entries": [
                    "Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack.",
                    "This increases to two additional dice at 13th level and three additional dice at 17th level."
                ]
            },
            {
                "name": "Path feature",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 10,
                "entries": [
                    "At 10th level, you gain a feature from your Primal Path."
                ]
            },
            {
                "name": "Relentless Rage",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 11,
                "entries": [
                    "Starting at 11th level, your rage can keep you fighting despite grievous wounds. If you drop to 0 hit points while you're raging and don't die outright, you can make a DC 10 Constitution saving throw. If you succeed, you drop to 1 hit point instead.",
                    "Each time you use this feature after the first, the DC increases by 5. When you finish a short or long rest, the DC resets to 10."
                ]
            },
            {
                "name": "Ability Score Improvement",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 12,
                "entries": [
                    "When you reach 12th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                    "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                ]
            },
            {
                "name": "Brutal Critical (2 dice)",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 13,
                "entries": [
                    "At 13th level, you can roll two additional weapon damage dice when determining the extra damage for a critical hit with a melee attack.",
                    "This increases to three additional dice at 17th level."
                ]
            },
            {
                "name": "Path feature",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 14,
                "entries": [
                    "At 14th level, you gain a feature from your Primal Path."
                ]
            },
            {
                "name": "Persistent Rage",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 15,
                "entries": [
                    "Beginning at 15th level, your rage is so fierce that it ends early only if you fall {@condition unconscious} or if you choose to end it."
                ]
            },
            {
                "name": "Ability Score Improvement",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 16,
                "entries": [
                    "When you reach 16th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                    "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                ]
            },
            {
                "name": "Brutal Critical (3 dice)",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 17,
                "entries": [
                    "At 17th level, you can roll three additional weapon damage dice when determining the extra damage for a critical hit with a melee attack."
                ]
            },
            {
                "name": "Indomitable Might",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 18,
                "entries": [
                    "Beginning at 18th level, if your total for a Strength check is less than your Strength score, you can use that score in place of the total."
                ]
            },
            {
                "name": "Ability Score Improvement",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 19,
                "entries": [
                    "When you reach 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                    "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                ]
            },
            {
                "name": "Primal Champion",
                "source": "PHB",
                "page": 46,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "level": 20,
                "entries": [
                    "At 20th level, you embody the power of the wilds. Your Strength and Constitution scores increase by 4. Your maximum for those scores is now 24."
                ]
            }
        ],
        "subclassFeature": [
            {
                "name": "Giant Power",
                "source": "BGG",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Giant",
                "subclassSource": "BGG",
                "level": 3,
                "entries": [
                    "{@i 3rd-Level Path of the Giant Feature}",
                    "When you choose this path, you learn to speak, read, and write Giant or one other language of your choice if you already know Giant. Additionally, you learn a cantrip of your choice: either {@spell druidcraft} or {@spell thaumaturgy}. Wisdom is your spellcasting ability for this spell."
                ]
            },
            {
                "name": "Giant's Havoc",
                "source": "BGG",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Giant",
                "subclassSource": "BGG",
                "level": 3,
                "entries": [
                    "{@i 3rd-Level Path of the Giant Feature}",
                    "Your rages pull strength from the primal might of giants, transforming you into a hulking force of destruction. While raging, you gain the following benefits:",
                    {
                        "type": "list",
                        "style": "list-hang-notitle",
                        "items": [
                            {
                                "type": "item",
                                "name": "Crushing Throw",
                                "entry": "When you make a successful ranged attack with a thrown weapon using Strength, you can add your Rage Damage bonus to the attack's damage roll."
                            },
                            {
                                "type": "item",
                                "name": "Giant Stature",
                                "entry": "Your reach increases by 5 feet, and if you are smaller than Large, you become Large, along with anything you are wearing. If there isn't enough room for you to increase your size, your size doesn't change."
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Path of the Giant",
                "source": "BGG",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Giant",
                "subclassSource": "BGG",
                "level": 3,
                "entries": [
                    "Barbarians who walk the Path of the Giant draw strength from the same primal forces as giants. As they rage, these barbarians surge with elemental power and grow in size, taking on forms that evoke the glory of giants. Some barbarians look like oversized versions of themselves, perhaps with a hint of elemental energy flaring in their eyes and around their weapons. Others transform more dramatically, taking on the appearance of an actual giant or a form similar to an Elemental, wreathed in fire, frost, or lightning.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Giant Power|Barbarian||Giant|BGG|3"
                    },
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Giant's Havoc|Barbarian||Giant|BGG|3"
                    }
                ]
            },
            {
                "name": "Elemental Cleaver",
                "source": "BGG",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Giant",
                "subclassSource": "BGG",
                "level": 6,
                "header": 2,
                "entries": [
                    "{@i 6th-Level Path of the Giant Feature}",
                    "Your bond with the elemental might of giants grows, and you learn to infuse weapons with primordial energy.",
                    "When you enter your rage, you can choose one weapon that you are holding and infuse it with one of the following damage types: acid, cold, fire, thunder, or lightning. While you wield the infused weapon during your rage, the weapon's damage type changes to the chosen type, it deals an extra {@dice 1d6} damage of the chosen type when it hits, and it gains the thrown property, with a normal range of 20 feet and a long range of 60 feet. If you throw the weapon, it reappears in your hand the instant after it hits or misses a target. The infused weapon's benefits are suppressed while a creature other than you wields it.",
                    "While raging and holding the infused weapon, you can use a bonus action to change the infused weapon's current damage type to another one from the damage type options above."
                ]
            },
            {
                "name": "Mighty Impel",
                "source": "BGG",
                "page": 12,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Giant",
                "subclassSource": "BGG",
                "level": 10,
                "header": 2,
                "entries": [
                    "{@i 10th-Level Path of the Giant Feature}",
                    "Your connection to giant strength allows you to hurl both allies and enemies on the battlefield. As a bonus action while raging, you can choose one Medium or smaller creature within your reach and move it to an unoccupied space you can see within 30 feet of yourself. An unwilling creature must succeed on a Strength saving throw (DC equals 8 + your proficiency bonus + your Strength modifier) to avoid the effect.",
                    "If, at the end of this movement, the thrown creature isn't on a surface or liquid that can support it, the creature falls, taking damage as normal and landing {@condition prone}."
                ]
            },
            {
                "name": "Demiurgic Colossus",
                "source": "BGG",
                "page": 12,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Giant",
                "subclassSource": "BGG",
                "level": 14,
                "header": 2,
                "entries": [
                    "{@i 14th-Level Path of the Giant Feature}",
                    "The primordial power of your rage intensifies. When you rage, your reach increases by 10 feet, your size can increase to Large or Huge (your choice), and you can use your Mighty Impel to move creatures that are Large or smaller.",
                    "In addition, the extra damage dealt by your Elemental Cleaver feature increases to {@dice 2d6}."
                ]
            },
            {
                "name": "Path of the Berserker",
                "source": "PHB",
                "page": 49,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Berserker",
                "subclassSource": "PHB",
                "level": 3,
                "entries": [
                    "For some barbarians, rage is a means to an end\u2014that end being violence. The Path of the Berserker is a path of untrammeled fury, slick with blood. As you enter the berserker's rage, you thrill in the chaos of battle, heedless of your own health or well-being.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Frenzy|Barbarian||Berserker||3"
                    }
                ]
            },
            {
                "name": "Frenzy",
                "source": "PHB",
                "page": 49,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Berserker",
                "subclassSource": "PHB",
                "level": 3,
                "header": 1,
                "entries": [
                    "Starting when you choose this path at 3rd level, you can go into a frenzy when you rage. If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one. When your rage ends, you suffer one level of {@condition exhaustion}."
                ]
            },
            {
                "name": "Mindless Rage",
                "source": "PHB",
                "page": 49,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Berserker",
                "subclassSource": "PHB",
                "level": 6,
                "header": 2,
                "entries": [
                    "Beginning at 6th level, you can't be {@condition charmed} or {@condition frightened} while raging. If you are {@condition charmed} or {@condition frightened} when you enter your rage, the effect is suspended for the duration of the rage."
                ]
            },
            {
                "name": "Intimidating Presence",
                "source": "PHB",
                "page": 49,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Berserker",
                "subclassSource": "PHB",
                "level": 10,
                "header": 2,
                "entries": [
                    "Beginning at 10th level, you can use your action to frighten someone with your menacing presence. When you do so, choose one creature that you can see within 30 feet of you. If the creature can see or hear you, it must succeed on a Wisdom saving throw (DC equal to 8 + your proficiency bonus + your Charisma modifier) or be {@condition frightened} of you until the end of your next turn. On subsequent turns, you can use your action to extend the duration of this effect on the {@condition frightened} creature until the end of your next turn. This effect ends if the creature ends its turn out of line of sight or more than 60 feet away from you.",
                    "If the creature succeeds on its saving throw, you can't use this feature on that creature again for 24 hours."
                ]
            },
            {
                "name": "Retaliation",
                "source": "PHB",
                "page": 49,
                "srd": true,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Berserker",
                "subclassSource": "PHB",
                "level": 14,
                "header": 2,
                "entries": [
                    "Starting at 14th level, when you take damage from a creature that is within 5 feet of you, you can use your reaction to make a melee weapon attack against that creature."
                ]
            },
            {
                "name": "Bear",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 3,
                "entries": [
                    "While raging, you have resistance to all damage except psychic damage. The spirit of the bear makes you tough enough to stand up to any punishment."
                ]
            },
            {
                "name": "Eagle",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 3,
                "entries": [
                    "While you're raging and aren't wearing heavy armor, other creatures have disadvantage on opportunity attack rolls against you, and you can use the {@action Dash} action as a bonus action on your turn. The spirit of the eagle makes you into a predator who can weave through the fray with ease."
                ]
            },
            {
                "name": "Path of the Totem Warrior",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 3,
                "entries": [
                    "The Path of the Totem Warrior is a spiritual journey, as the barbarian accepts a spirit animal as guide, protector, and inspiration. In battle, your totem spirit fills you with supernatural might, adding magical fuel to your barbarian rage.",
                    "Most barbarian tribes consider a totem animal to be kin to a particular clan. In such cases, it is unusual for an individual to have more than one totem animal spirit, though exceptions exist.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Spirit Seeker|Barbarian||Totem Warrior||3"
                    },
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Totem Spirit|Barbarian||Totem Warrior||3"
                    }
                ]
            },
            {
                "name": "Wolf",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 3,
                "entries": [
                    "While you're raging, your friends have advantage on melee attack rolls against any creature within 5 feet of you that is hostile to you. The spirit of the wolf makes you a leader of hunters."
                ]
            },
            {
                "name": "Spirit Seeker",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 3,
                "header": 1,
                "entries": [
                    "Yours is a path that seeks attunement with the natural world, giving you a kinship with beasts. At 3rd level when you adopt this path, you gain the ability to cast the {@spell beast sense} and {@spell speak with animals} spells, but only as rituals, as described in {@book chapter 10|PHB|10|rituals}."
                ]
            },
            {
                "name": "Totem Spirit",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 3,
                "header": 1,
                "entries": [
                    "At 3rd level, when you adopt this path, you choose a totem spirit and gain its feature. You must make or acquire a physical totem object\u2014an amulet or similar adornment\u2014that incorporates fur or feathers, claws, teeth, or bones of the totem animal. At your option, you also gain minor physical attributes that are reminiscent of your totem spirit. For example, if you have a bear totem spirit, you might be unusually hairy and thick-skinned, or if your totem is the eagle, your eyes turn bright yellow.",
                    "Your totem animal might be an animal related to those listed here but more appropriate to your homeland. For example, you could choose a hawk or vulture in place of an eagle.",
                    {
                        "type": "options",
                        "count": 1,
                        "entries": [
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Bear|Barbarian||Totem Warrior||3"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Eagle|Barbarian||Totem Warrior||3"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Elk|Barbarian|SCAG|Totem Warrior||3|SCAG"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Tiger|Barbarian|SCAG|Totem Warrior||3|SCAG"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Wolf|Barbarian||Totem Warrior||3"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Bear",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 6,
                "entries": [
                    "You gain the might of a bear. Your carrying capacity (including maximum load and maximum lift) is doubled, and you have advantage on Strength checks made to push, pull, lift, or break objects."
                ]
            },
            {
                "name": "Eagle",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 6,
                "entries": [
                    "You gain the eyesight of an eagle. You can see up to 1 mile away with no difficulty, able to discern even fine details as though looking at something no more than 100 feet away from you. Additionally, dim light doesn't impose disadvantage on your Wisdom ({@skill Perception}) checks."
                ]
            },
            {
                "name": "Wolf",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 6,
                "entries": [
                    "You gain the hunting sensibilities of a wolf. You can track other creatures while traveling at a fast pace, and you can move stealthily while traveling at a normal pace."
                ]
            },
            {
                "name": "Aspect of the Beast",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 6,
                "header": 2,
                "entries": [
                    "At 6th level, you gain a magical benefit based on the totem animal of your choice. You can choose the same animal you selected at 3rd level or a different one.",
                    {
                        "type": "options",
                        "count": 1,
                        "entries": [
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Bear|Barbarian||Totem Warrior||6"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Eagle|Barbarian||Totem Warrior||6"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Elk|Barbarian|SCAG|Totem Warrior||6|SCAG"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Tiger|Barbarian|SCAG|Totem Warrior||6|SCAG"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Wolf|Barbarian||Totem Warrior||6"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Spirit Walker",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 10,
                "header": 2,
                "entries": [
                    "At 10th level, you can cast the {@spell commune with nature} spell, but only as a ritual. When you do so, a spiritual version of one of the animals you chose for Totem Spirit or Aspect of the Beast appears to you to convey the information you seek."
                ]
            },
            {
                "name": "Bear",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 14,
                "entries": [
                    "While you're raging, any creature within 5 feet of you that's hostile to you has disadvantage on attack rolls against targets other than you or another character with this feature. An enemy is immune to this effect if it can't see or hear you or if it can't be {@condition frightened}."
                ]
            },
            {
                "name": "Eagle",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 14,
                "entries": [
                    "While raging, you have a flying speed equal to your current walking speed. This benefit works only in short bursts; you fall if you end your turn in the air and nothing else is holding you aloft."
                ]
            },
            {
                "name": "Wolf",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 14,
                "entries": [
                    "While you're raging, you can use a bonus action on your turn to knock a Large or smaller creature {@condition prone} when you hit it with melee weapon attack."
                ]
            },
            {
                "name": "Totemic Attunement",
                "source": "PHB",
                "page": 50,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 14,
                "header": 2,
                "entries": [
                    "At 14th level, you gain a magical benefit based on a totem animal of your choice. You can choose the same animal you selected previously or a different one.",
                    {
                        "type": "options",
                        "count": 1,
                        "entries": [
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Bear|Barbarian||Totem Warrior||14"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Eagle|Barbarian||Totem Warrior||14"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Elk|Barbarian|SCAG|Totem Warrior||14|SCAG"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Tiger|Barbarian|SCAG|Totem Warrior||14|SCAG"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Wolf|Barbarian||Totem Warrior||14"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Path of the Battlerager",
                "source": "SCAG",
                "page": 121,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Battlerager",
                "subclassSource": "SCAG",
                "level": 3,
                "entries": [
                    "Known as Kuldjargh (literally \"axe idiot\") in Dwarvish, battleragers are dwarf followers of the gods of war and take the Path of the Battlerager. They specialize in wearing bulky, {@item spiked armor|scag} and throwing themselves into combat, striking with their body itself and giving themselves over to the fury of battle.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Restriction\u2014Dwarves Only|Barbarian||Battlerager|SCAG|3"
                    },
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Battlerager Armor|Barbarian||Battlerager|SCAG|3"
                    }
                ]
            },
            {
                "name": "Battlerager Armor",
                "source": "SCAG",
                "page": 121,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Battlerager",
                "subclassSource": "SCAG",
                "level": 3,
                "header": 1,
                "entries": [
                    "When you choose this path at 3rd level, you gain the ability to use {@item spiked armor|scag} as a weapon.",
                    "While you are wearing {@item spiked armor|scag} and are raging, you can use a bonus action to make one melee weapon attack with your armor spikes at a target within 5 feet of you. If the attack hits, the spikes deal {@damage 1d4} piercing damage. You use your Strength modifier for the attack and damage rolls.",
                    "Additionally, when you use the {@action Attack} action to grapple a creature, the target takes 3 piercing damage if your grapple check succeeds."
                ]
            },
            {
                "name": "Restriction\u2014Dwarves Only",
                "source": "SCAG",
                "page": 121,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Battlerager",
                "subclassSource": "SCAG",
                "level": 3,
                "header": 1,
                "entries": [
                    "Only dwarves can follow the Path of the Battlerager. The battlerager fills a particular niche in dwarven society and culture.",
                    "Your DM can lift this restriction to better suit the campaign. The restriction exists for the Forgotten Realms. It might not apply to your DM's setting or your DM's version of the Realms."
                ]
            },
            {
                "name": "Reckless Abandon",
                "source": "SCAG",
                "page": 121,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Battlerager",
                "subclassSource": "SCAG",
                "level": 6,
                "header": 2,
                "entries": [
                    "Beginning at 6th level, when you use Reckless Attack while raging, you also gain temporary hit points equal to your Constitution modifier (minimum of 1). They vanish if any of them are left when your rage ends."
                ]
            },
            {
                "name": "Battlerager Charge",
                "source": "SCAG",
                "page": 121,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Battlerager",
                "subclassSource": "SCAG",
                "level": 10,
                "header": 2,
                "entries": [
                    "Beginning at 10th level, you can take the {@action Dash} action as a bonus action while you are raging."
                ]
            },
            {
                "name": "Spiked Retribution",
                "source": "SCAG",
                "page": 121,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Battlerager",
                "subclassSource": "SCAG",
                "level": 14,
                "header": 2,
                "entries": [
                    "Starting at 14th level, when a creature within 5 feet of you hits you with a melee attack, the attacker takes 3 piercing damage if you are raging, aren't {@condition incapacitated}, and are wearing {@item spiked armor|scag}."
                ]
            },
            {
                "name": "Path of the Beast",
                "source": "TCE",
                "page": 24,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Beast",
                "subclassSource": "TCE",
                "level": 3,
                "entries": [
                    "Barbarians who walk the Path of the Beast draw their rage from a bestial spark burning within their souls. That beast bursts forth in the throes of rage, physically transforming the barbarian.",
                    "Such a barbarian might be inhabited by a primal spirit or be descended from shape-shifters. You can choose the origin of your feral might or determine it by rolling on the Origin of the Beast table.",
                    {
                        "type": "table",
                        "caption": "Origin of the Beast",
                        "colLabels": [
                            "d4",
                            "Origin"
                        ],
                        "colStyles": [
                            "col-2 text-center",
                            "col-10"
                        ],
                        "rows": [
                            [
                                "1",
                                "One of your parents is a lycanthrope, and you've inherited some of their curse."
                            ],
                            [
                                "2",
                                "You are descended from an archdruid and inherited the ability to partially change shape."
                            ],
                            [
                                "3",
                                "A fey spirit gifted you with the ability to adopt different bestial aspects."
                            ],
                            [
                                "4",
                                "An ancient animal spirit dwells within you, allowing you to walk this path."
                            ]
                        ]
                    },
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Form of the Beast|Barbarian||Beast|TCE|3"
                    }
                ]
            },
            {
                "name": "Form of the Beast",
                "source": "TCE",
                "page": 24,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Beast",
                "subclassSource": "TCE",
                "level": 3,
                "header": 1,
                "entries": [
                    "{@i 3rd-level Path of the Beast feature}",
                    "When you enter your rage, you can transform, revealing the bestial power within you. Until the rage ends, you manifest a natural weapon. It counts as a simple melee weapon for you, and you add your Strength modifier to the attack and damage rolls when you attack with it, as normal.",
                    "You choose the weapon's form each time you rage:",
                    {
                        "type": "list",
                        "style": "list-hang-notitle",
                        "items": [
                            {
                                "type": "item",
                                "name": "Bite",
                                "entry": "Your mouth transforms into a bestial muzzle or great mandibles (your choice). It deals {@damage 1d8} piercing damage on a hit. Once on each of your turns when you damage a creature with this bite, you regain a number of hit points equal to your proficiency bonus, provided you have less than half your hit points when you hit."
                            },
                            {
                                "type": "item",
                                "name": "Claws",
                                "entry": "Each of your hands transforms into a claw, which you can use as a weapon if it's empty. It deals {@damage 1d6} slashing damage on a hit. Once on each of your turns when you attack with a claw using the {@action Attack} action, you can make one additional claw attack as part of the same action."
                            },
                            {
                                "type": "item",
                                "name": "Tail",
                                "entry": "You grow a lashing, spiny tail, which deals {@damage 1d8} piercing damage on a hit and has the reach property. If a creature you can see within 10 feet of you hits you with an attack roll, you can use your reaction to swipe your tail and roll a {@dice d8}, applying a bonus to your AC equal to the number rolled, potentially causing the attack to miss you."
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Bestial Soul",
                "source": "TCE",
                "page": 24,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Beast",
                "subclassSource": "TCE",
                "level": 6,
                "header": 2,
                "entries": [
                    "{@i 6th-level Path of the Beast feature}",
                    "The feral power within you increases, causing the natural weapons of your Form of the Beast to count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.",
                    "You can also alter your form to help you adapt to your surroundings. When you finish a short or long rest, choose one of the following benefits, which lasts until you finish your next short or long rest:",
                    {
                        "type": "list",
                        "items": [
                            "You gain a swimming speed equal to your walking speed, and you can breathe underwater.",
                            "You gain a climbing speed equal to your walking speed, and you can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.",
                            "When you jump, you can make a Strength ({@skill Athletics}) check and extend your jump by a number of feet equal to the check's total. You can make this special check only once per turn."
                        ]
                    }
                ]
            },
            {
                "name": "Infectious Fury",
                "source": "TCE",
                "page": 24,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Beast",
                "subclassSource": "TCE",
                "level": 10,
                "header": 2,
                "entries": [
                    "{@i 10th-level Path of the Beast feature}",
                    "When you hit a creature with your natural weapons while you are raging, the beast within you can curse your target with rabid fury. The target must succeed on a Wisdom saving throw (DC equal to 8 + your Constitution modifier + your proficiency bonus) or suffer one of the following effects (your choice):",
                    {
                        "type": "list",
                        "items": [
                            "The target must use its reaction to make a melee attack against another creature of your choice that you can see.",
                            "The target takes {@damage 2d12} psychic damage."
                        ]
                    },
                    "You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest."
                ]
            },
            {
                "name": "Call the Hunt",
                "source": "TCE",
                "page": 24,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Beast",
                "subclassSource": "TCE",
                "level": 14,
                "header": 2,
                "entries": [
                    "{@i 14th-level Path of the Beast feature}",
                    "The beast within you grows so powerful that you can spread its ferocity to others and gain resilience from them joining your hunt. When you enter your rage, you can choose a number of other willing creatures you can see within 30 feet of you equal to your Constitution modifier (minimum of one creature).",
                    "You gain 5 temporary hit points for each creature that accepts this feature. Until the rage ends, the chosen creatures can each use the following benefit once on each of their turns: when the creature hits a target with an attack roll and deals damage to it, the creature can roll a {@dice d6} and gain a bonus to the damage equal to the number rolled.",
                    "You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest."
                ]
            },
            {
                "name": "Path of Wild Magic",
                "source": "TCE",
                "page": 25,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Wild Magic",
                "subclassSource": "TCE",
                "level": 3,
                "entries": [
                    "Many places in the multiverse abound with beauty, intense emotion, and rampant magic; the Feywild, the Upper Planes, and other realms of supernatural power radiate with such forces and can profoundly influence people. As folk of deep feeling, barbarians are especially susceptible to these wild influences, with some barbarians being transformed by the magic. These magic-suffused barbarians walk the Path of Wild Magic. Elf, tiefling, aasimar, and genasi barbarians often seek this path, eager to manifest the otherworldly magic of their ancestors.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Magic Awareness|Barbarian||Wild Magic|TCE|3"
                    },
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Wild Surge|Barbarian||Wild Magic|TCE|3"
                    }
                ]
            },
            {
                "name": "Magic Awareness",
                "source": "TCE",
                "page": 25,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Wild Magic",
                "subclassSource": "TCE",
                "level": 3,
                "header": 1,
                "entries": [
                    "{@i 3rd-level Path of Wild Magic feature}",
                    "As an action, you can open your awareness to the presence of concentrated magic. Until the end of your next turn, you know the location of any spell or magic item within 60 feet of you that isn't behind total cover. When you sense a spell, you learn which school of magic it belongs to.",
                    "You can use this feature a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest."
                ]
            },
            {
                "name": "Wild Surge",
                "source": "TCE",
                "page": 25,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Wild Magic",
                "subclassSource": "TCE",
                "level": 3,
                "header": 1,
                "entries": [
                    "{@i 3rd-level Path of Wild Magic feature}",
                    "The magical energy roiling inside you sometimes erupts from you. When you enter your rage, roll on the Wild Magic table to determine the magical effect produced.",
                    "If the effect requires a saving throw, the DC equals 8 + your proficiency bonus + your Constitution modifier.",
                    {
                        "type": "table",
                        "caption": "Wild Magic",
                        "colLabels": [
                            "d8",
                            "Magical Effect"
                        ],
                        "colStyles": [
                            "col-2 text-center",
                            "col-10"
                        ],
                        "rows": [
                            [
                                "1",
                                "Shadowy tendrils lash around you. Each creature of your choice that you can see within 30 feet of you must succeed on a Constitution saving throw or take {@damage 1d12} necrotic damage. You also gain {@dice 1d12} temporary hit points."
                            ],
                            [
                                "2",
                                "You teleport up to 30 feet to an unoccupied space you can see. Until your rage ends, you can use this effect again on each of your turns as a bonus action."
                            ],
                            [
                                "3",
                                "An intangible spirit, which looks like a {@creature flumph} or a {@creature pixie} (your choice), appears within 5 feet of one creature of your choice that you can see within 30 feet of you. At the end of the current turn, the spirit explodes, and each creature within 5 feet of it must succeed on a Dexterity saving throw or take {@damage 1d6} force damage. Until your rage ends, you can use this effect again, summoning another spirit, on each of your turns as a bonus action."
                            ],
                            [
                                "4",
                                "Magic infuses one weapon of your choice that you are holding. Until your rage ends, the weapon's damage type changes to force, and it gains the light and thrown properties, with a normal range of 20 feet and a long range of 60 feet. If the weapon leaves your hand, the weapon reappears in your hand at the end of the current turn."
                            ],
                            [
                                "5",
                                "Whenever a creature hits you with an attack roll before your rage ends, that creature takes {@damage 1d6} force damage, as magic lashes out in retribution."
                            ],
                            [
                                "6",
                                "Until your rage ends, you are surrounded by multi colored, protective lights; you gain a +1 bonus to AC, and while within 10 feet of you, your allies gain the same bonus."
                            ],
                            [
                                "7",
                                "Flowers and vines temporarily grow around you. Until your rage ends, the ground within 15 feet of you is {@quickref difficult terrain||3} for your enemies."
                            ],
                            [
                                "8",
                                "A bolt of light shoots from your chest. Another creature of your choice that you can see within 30 feet of you must succeed on a Constitution saving throw or take {@damage 1d6} radiant damage and be {@condition blinded} until the start of your next turn. Until your rage ends, you can use this effect again on each of your turns as a bonus action."
                            ]
                        ],
                        "data": {
                            "tableInclude": true
                        }
                    }
                ]
            },
            {
                "name": "Bolstering Magic",
                "source": "TCE",
                "page": 25,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Wild Magic",
                "subclassSource": "TCE",
                "level": 6,
                "header": 2,
                "entries": [
                    "{@i 6th-level Path of Wild Magic feature}",
                    "You can harness your wild magic to bolster yourself or a companion. As an action, you can touch one creature (which can be yourself) and confer one of the following benefits of your choice to that creature:",
                    {
                        "type": "list",
                        "items": [
                            "For 10 minutes, the creature can roll a {@dice d3} whenever making an attack roll or an ability check and add the number rolled to the {@dice d20} roll.",
                            "Roll a {@dice d3}. The creature regains one expended spell slot, the level of which equals the number rolled or lower (the creature's choice). Once a creature receives this benefit, that creature can't receive it again until after a long rest."
                        ]
                    },
                    "You can take this action a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest."
                ]
            },
            {
                "name": "Unstable Backlash",
                "source": "TCE",
                "page": 25,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Wild Magic",
                "subclassSource": "TCE",
                "level": 10,
                "header": 2,
                "entries": [
                    "{@i 10th-level Path of Wild Magic feature}",
                    "When you are imperiled during your rage, the magic within you can lash out; immediately after you take damage or fail a saving throw while raging, you can use your reaction to roll on the Wild Magic table and immediately produce the effect rolled. This effect replaces your current Wild Magic effect."
                ]
            },
            {
                "name": "Controlled Surge",
                "source": "TCE",
                "page": 25,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Wild Magic",
                "subclassSource": "TCE",
                "level": 14,
                "header": 2,
                "entries": [
                    "{@i 14th-level Path of Wild Magic feature}",
                    "Whenever you roll on the Wild Magic table, you can roll the die twice and choose which of the two effects to unleash. If you roll the same number on both dice, you can ignore the number and choose any effect on the table."
                ]
            },
            {
                "name": "Path of the Juggernaut",
                "source": "TDCSR",
                "page": 165,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Juggernaut",
                "subclassSource": "TDCSR",
                "level": 3,
                "entries": [
                    "Barbarians who follow the Path of the Juggernaut stand so resolutely that none can deter them, and they swing their weapons with such force that all who stand against them are flung aside. In might and in spirit, juggernauts are immovable object and unstoppable force all at once.",
                    "Juggernaut barbarians can be found all over Tal'Dorei, and are common among the goliath warriors of the {@book Rivermaw herd|TDCSR|3|Rivermaw Herd} that wanders the {@book Dividing Plains|TDCSR|3|Dividing Plains}. Some {@book dwarves|TDCSR|4|dwarves} and humanoid survivalists of the {@book Cliffkeep Mountains|TDCSR|3|Cliffkeep Mountains} adopt this fighting style as an extension of their rugged determinism. And a number of stalwart juggernauts hail from the jungles of the {@book Rifenmist Peninsula|TDCSR|3|Rifenmist Peninsula}, having cast off the oppressive yoke of the {@book Iron Authority|TDCSR|3|Tz'Arrm, Helm of the Emperor}.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Thunderous Blows|Barbarian|PHB|Juggernaut|TDCSR|3"
                    },
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Spirit of the Mountain|Barbarian|PHB|Juggernaut|TDCSR|3"
                    }
                ]
            },
            {
                "name": "Spirit of the Mountain",
                "source": "TDCSR",
                "page": 166,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Juggernaut",
                "subclassSource": "TDCSR",
                "level": 3,
                "header": 1,
                "entries": [
                    "At 3rd level, you harness your fury to anchor your feet to the ground, becoming a bulwark of strength. While you are raging, you can't be knocked {@condition prone} or moved along the ground against your will."
                ]
            },
            {
                "name": "Thunderous Blows",
                "source": "TDCSR",
                "page": 165,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Juggernaut",
                "subclassSource": "TDCSR",
                "level": 3,
                "header": 1,
                "entries": [
                    "Starting when you choose this path at 3rd level, your rage instills you with the strength to shove and smash your way through your foes, making any battlefield your domain. When you hit a creature with a melee attack while you're raging, you can push that creature up to 5 feet away from you in a direction of your choice. A creature that is Huge or larger makes a Strength {@quickref saving throws|PHB|2|1|saving throw} with a DC equal to 8 + your proficiency bonus + your Strength modifier. On a success, the creature is not pushed.",
                    {
                        "type": "inset",
                        "name": "Rules Tip: Forced Movement",
                        "page": 166,
                        "entries": [
                            "Usually when one creature moves out of a hostile creature's reach, the hostile creature can use its reaction to make an {@action opportunity attack}. However, forced movement\u2014such as being pushed by a Path of the Juggernaut barbarian's {@subclassFeature Thunderous Blows|Barbarian|PHB|Juggernaut|TDCSR|3} feature\u2014doesn't provoke {@action opportunity attack|PHB|opportunity attacks}.",
                            "Likewise, a juggernaut barbarian's {@subclassFeature Hurricane Strike|Barbarian|PHB|Juggernaut|TDCSR|10} feature allows an ally to make a melee weapon attack as a reaction only if the foe ends its forced movement within 5 feet of the ally. If a foe is pushed through other spaces within 5 feet of your allies, those allies can't make normal {@action opportunity attack|PHB|opportunity attacks} against the foe."
                        ]
                    }
                ]
            },
            {
                "name": "Demolishing Might",
                "source": "TDCSR",
                "page": 166,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Juggernaut",
                "subclassSource": "TDCSR",
                "level": 6,
                "header": 2,
                "entries": [
                    "Starting at 6th level, your melee weapon attacks deal an extra {@damage 1d8} damage to constructs, and deal double damage to objects and structures."
                ]
            },
            {
                "name": "Resolute Stance",
                "source": "TDCSR",
                "page": 166,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Juggernaut",
                "subclassSource": "TDCSR",
                "level": 6,
                "header": 2,
                "entries": [
                    "Also at 6th level, you can temporarily refocus your combat ability to make yourself a bulwark of defense. At the start of your turn (no action required), you can assume a defensive stance that lasts until the start of your next turn. While in this stance, you can't be {@condition grappled}, attack rolls against you have {@quickref Advantage and Disadvantage|PHB|2|0|disadvantage}, and your weapon attacks are made with {@quickref Advantage and Disadvantage|PHB|2|0|disadvantage}."
                ]
            },
            {
                "name": "Hurricane Strike",
                "source": "TDCSR",
                "page": 166,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Juggernaut",
                "subclassSource": "TDCSR",
                "level": 10,
                "header": 2,
                "entries": [
                    "Starting at 10th level, your blows can hurl foes through the air and into the attacks of your allies. As a reaction when you push a creature at least 5 feet, you can then leap into an unoccupied space next to the creature. If you do so, the creature must succeed on a Strength {@quickref saving throws|PHB|2|1|saving throw} with a DC equal to 8 + your proficiency bonus + your Strength modifier or be knocked {@condition prone}. This leap costs no movement and does not provoke {@action opportunity attack|PHB|opportunity attacks}.",
                    "Additionally, whenever you push a creature into a space within 5 feet of one of your allies, the ally can use its reaction to make a melee weapon attack against that creature."
                ]
            },
            {
                "name": "Thunderous Blows (10th Level)",
                "source": "TDCSR",
                "page": 165,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Juggernaut",
                "subclassSource": "TDCSR",
                "level": 10,
                "header": 2,
                "entries": [
                    "Starting at 10th level, you can push a creature up to 10 feet when you hit it with a melee attack while you're raging."
                ]
            },
            {
                "name": "Unstoppable",
                "source": "TDCSR",
                "page": 166,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Juggernaut",
                "subclassSource": "TDCSR",
                "level": 14,
                "header": 2,
                "entries": [
                    "At 14th level, your fury in battle makes you unstoppable. While you're raging, your speed cannot be reduced, and you are immune to the {@condition frightened}, {@condition paralyzed}, {@condition prone}, and {@condition stunned} conditions.",
                    "If you are {@condition frightened}, {@condition paralyzed}, or {@condition stunned}, you can still use a bonus action to enter a rage (even if you can't otherwise take actions). You aren't affected by any of these conditions while you're raging."
                ]
            },
            {
                "name": "Path of the Ancestral Guardian",
                "source": "XGE",
                "page": 9,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Ancestral Guardian",
                "subclassSource": "XGE",
                "level": 3,
                "entries": [
                    "Some barbarians hail from cultures that revere their ancestors. These tribes teach that the warriors of the past linger in the world as mighty spirits, who can guide and protect the living. When a barbarian who follows this path rages, the barbarian contacts the spirit world and calls on these guardian spirits for aid.",
                    "Barbarians who draw on their ancestral guardians can better fight to protect their tribes and their allies. In order to cement ties to their ancestral guardians, barbarians who follow this path cover themselves in elaborate tattoos that celebrate their ancestors' deeds. These tattoos tell sagas of victories against terrible monsters and other fearsome rivals.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Ancestral Protectors|Barbarian||Ancestral Guardian|XGE|3"
                    }
                ]
            },
            {
                "name": "Ancestral Protectors",
                "source": "XGE",
                "page": 9,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Ancestral Guardian",
                "subclassSource": "XGE",
                "level": 3,
                "header": 1,
                "entries": [
                    "Starting when you choose this path at 3rd level, spectral warriors appear when you enter your rage. While you're raging, the first creature you hit with an attack on your turn becomes the target of the warriors, which hinder its attacks. Until the start of your next turn, that target has disadvantage on any attack roll that isn't against you, and when the target hits a creature other than you with an attack, that creature has resistance to the damage dealt by the attack. The effect on the target ends early if your rage ends."
                ]
            },
            {
                "name": "Spirit Shield",
                "source": "XGE",
                "page": 9,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Ancestral Guardian",
                "subclassSource": "XGE",
                "level": 6,
                "header": 2,
                "entries": [
                    "Beginning at 6th level, the guardian spirits that aid you can provide supernatural protection to those you defend. If you are raging and another creature you can see within 30 feet of you takes damage, you can use your reaction to reduce that damage by {@dice 2d6}.",
                    "When you reach certain levels in this class, you can reduce the damage by more: by {@dice 3d6} at 10th level and by {@dice 4d6} at 14th level."
                ]
            },
            {
                "name": "Consult the Spirits",
                "source": "XGE",
                "page": 9,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Ancestral Guardian",
                "subclassSource": "XGE",
                "level": 10,
                "header": 2,
                "entries": [
                    "At 10th level, you gain the ability to consult with your ancestral spirits. When you do so, you cast the {@spell augury} or {@spell clairvoyance} spell, without using a spell slot or material components. Rather than creating a spherical sensor, this use of {@spell clairvoyance} invisibly summons one of your ancestral spirits to the chosen location. Wisdom is your spellcasting ability for these spells.",
                    "After you cast either spell in this way, you can't use this feature again until you finish a short or long rest."
                ]
            },
            {
                "name": "Vengeful Ancestors",
                "source": "XGE",
                "page": 9,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Ancestral Guardian",
                "subclassSource": "XGE",
                "level": 14,
                "header": 2,
                "entries": [
                    "At 14th level, your ancestral spirits grow powerful enough to retaliate. When you use your Spirit Shield to reduce the damage of an attack, the attacker takes an amount of force damage equal to the damage that your Spirit Shield prevents."
                ]
            },
            {
                "name": "Path of the Storm Herald",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 3,
                "entries": [
                    "All barbarians harbor a fury within. Their rage grants them superior strength, durability, and speed. Barbarians who follow the Path of the Storm Herald learn to transform that rage into a mantle of primal magic, which swirls around them. When in a fury, a barbarian of this path taps into the forces of nature to create powerful magical effects.",
                    "Storm heralds are typically elite champions who train alongside druids, rangers, and others sworn to protect nature. Other storm heralds hone their craft in lodges in regions wracked by storms, in the frozen reaches at the world's end, or deep in the hottest deserts.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Storm Aura|Barbarian||Storm Herald|XGE|3"
                    }
                ]
            },
            {
                "name": "Storm Aura",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 3,
                "header": 1,
                "entries": [
                    "Starting at 3rd level, you emanate a stormy, magical aura while you rage. The aura extends 10 feet from you in every direction, but not through total cover.",
                    "Your aura has an effect that activates when you enter your rage, and you can activate the effect again on each of your turns as a bonus action. Choose desert, sea, or tundra. Your aura's effect depends on that chosen environment, as detailed below. You can change your environment choice whenever you gain a level in this class.",
                    "If your aura's effects require a saving throw, the DC equals 8 + your proficiency bonus + your Constitution modifier.",
                    {
                        "type": "options",
                        "entries": [
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Desert|Barbarian|XGE|Storm Herald|XGE|3"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Sea|Barbarian|XGE|Storm Herald|XGE|3"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Tundra|Barbarian|XGE|Storm Herald|XGE|3"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Storm Soul",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 6,
                "header": 2,
                "entries": [
                    "At 6th level, the storm grants you benefits even when your aura isn't active. The benefits are based on the environment you chose for your Storm Aura.",
                    {
                        "type": "options",
                        "entries": [
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Desert|Barbarian|XGE|Storm Herald|XGE|6"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Sea|Barbarian|XGE|Storm Herald|XGE|6"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Tundra|Barbarian|XGE|Storm Herald|XGE|6"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Shielding Storm",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 10,
                "header": 2,
                "entries": [
                    "At 10th level, you learn to use your mastery of the storm to protect others. Each creature of your choice has the damage resistance you gained from the Storm Soul feature while the creature is in your Storm Aura."
                ]
            },
            {
                "name": "Raging Storm",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 14,
                "header": 2,
                "entries": [
                    "At 14th level, the power of the storm you channel grows mightier, lashing out at your foes. The effect is based on the environment you chose for your Storm Aura.",
                    {
                        "type": "options",
                        "entries": [
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Desert|Barbarian|XGE|Storm Herald|XGE|14"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Sea|Barbarian|XGE|Storm Herald|XGE|14"
                            },
                            {
                                "type": "refSubclassFeature",
                                "subclassFeature": "Tundra|Barbarian|XGE|Storm Herald|XGE|14"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Path of the Zealot",
                "source": "XGE",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Zealot",
                "subclassSource": "XGE",
                "level": 3,
                "entries": [
                    "Some deities inspire their followers to pitch themselves into a ferocious battle fury. These barbarians are zealots\u2014warriors who channel their rage into powerful displays of divine power.",
                    "A variety of gods across the worlds of D&D inspire their followers to embrace this path. Tempus from the Forgotten Realms and Hextor and Erythnul of Greyhawk are all prime examples. In general, the gods who inspire zealots are deities of combat, destruction, and violence. Not all are evil, but few are good.",
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Divine Fury|Barbarian||Zealot|XGE|3"
                    },
                    {
                        "type": "refSubclassFeature",
                        "subclassFeature": "Warrior of the Gods|Barbarian||Zealot|XGE|3"
                    }
                ]
            },
            {
                "name": "Divine Fury",
                "source": "XGE",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Zealot",
                "subclassSource": "XGE",
                "level": 3,
                "header": 1,
                "entries": [
                    "Starting when you choose this path at 3rd level, you can channel divine fury into your weapon strikes. While you're raging, the first creature you hit on each of your turns with a weapon attack takes extra damage equal to {@dice 1d6} + half your barbarian level. The extra damage is necrotic or radiant; you choose the type of damage when you gain this feature."
                ]
            },
            {
                "name": "Warrior of the Gods",
                "source": "XGE",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Zealot",
                "subclassSource": "XGE",
                "level": 3,
                "header": 1,
                "entries": [
                    "At 3rd level, your soul is marked for endless battle. If a spell, such as {@spell raise dead}, has the sole effect of restoring you to life (but not undeath), the caster doesn't need material components to cast the spell on you."
                ]
            },
            {
                "name": "Fanatical Focus",
                "source": "XGE",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Zealot",
                "subclassSource": "XGE",
                "level": 6,
                "header": 2,
                "entries": [
                    "Starting at 6th level, the divine power that fuels your rage can protect you. If you fail a saving throw while you're raging, you can reroll it, and you must use the new roll. You can use this ability only once per rage."
                ]
            },
            {
                "name": "Zealous Presence",
                "source": "XGE",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Zealot",
                "subclassSource": "XGE",
                "level": 10,
                "header": 2,
                "entries": [
                    "At 10th level, you learn to channel divine power to inspire zealotry in others. As a bonus action, you unleash a battle cry infused with divine energy. Up to ten other creatures of your choice within 60 feet of you that can hear you gain advantage on attack rolls and saving throws until the start of your next turn.",
                    "Once you use this feature, you can't use it again until you finish a long rest."
                ]
            },
            {
                "name": "Rage beyond Death",
                "source": "XGE",
                "page": 11,
                "className": "Barbarian",
                "classSource": "PHB",
                "subclassShortName": "Zealot",
                "subclassSource": "XGE",
                "level": 14,
                "header": 2,
                "entries": [
                    "Beginning at 14th level, the divine power that fuels your rage allows you to shrug off fatal blows.",
                    "While you're raging, having 0 hit points doesn't knock you {@condition unconscious}. You still must make death saving throws, and you suffer the normal effects of taking damage while at 0 hit points. However, if you would die due to failing death saving throws, you don't die until your rage ends, and you die then only if you still have 0 hit points."
                ]
            },
            {
                "name": "Elk",
                "source": "SCAG",
                "page": 122,
                "className": "Barbarian",
                "classSource": "SCAG",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 3,
                "entries": [
                    "While you're raging and aren't wearing heavy armor, your walking speed increases by 15 feet. The spirit of the elk makes you extraordinarily swift."
                ]
            },
            {
                "name": "Tiger",
                "source": "SCAG",
                "page": 122,
                "className": "Barbarian",
                "classSource": "SCAG",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 3,
                "entries": [
                    "While raging, you can add 10 feet to your long jump distance and 3 feet to your high jump distance. The spirit of the tiger empowers your leaps."
                ]
            },
            {
                "name": "Elk",
                "source": "SCAG",
                "page": 122,
                "className": "Barbarian",
                "classSource": "SCAG",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 6,
                "entries": [
                    "Whether mounted or on foot, your travel pace is doubled, as is the travel pace of up to ten companions while they're within 60 feet of you and you're not {@condition incapacitated}. The elk spirit helps you roam far and fast."
                ]
            },
            {
                "name": "Tiger",
                "source": "SCAG",
                "page": 122,
                "className": "Barbarian",
                "classSource": "SCAG",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 6,
                "entries": [
                    "You gain proficiency in two skills from the following list: {@skill Athletics}, {@skill Acrobatics}, {@skill Stealth}, and {@skill Survival}. The cat spirit hones your survival instincts."
                ]
            },
            {
                "name": "Elk",
                "source": "SCAG",
                "page": 122,
                "className": "Barbarian",
                "classSource": "SCAG",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 14,
                "entries": [
                    "While raging, you can use a bonus action during your move to pass through the space of a Large or smaller creature. That creature must succeed on a Strength saving throw (DC 8 + your Strength bonus + your proficiency bonus) or be knocked {@condition prone} and take bludgeoning damage equal to {@dice 1d12} + your Strength modifier."
                ]
            },
            {
                "name": "Tiger",
                "source": "SCAG",
                "page": 122,
                "className": "Barbarian",
                "classSource": "SCAG",
                "subclassShortName": "Totem Warrior",
                "subclassSource": "PHB",
                "level": 14,
                "entries": [
                    "While you're raging, if you move at least 20 feet in a straight line toward a Large or smaller target right before making a melee weapon attack against it, you can use a bonus action to make an additional melee weapon attack against it."
                ]
            },
            {
                "name": "Desert",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 3,
                "entries": [
                    "When this effect is activated, all other creatures in your aura take 2 fire damage each. The damage increases when you reach certain levels in this class, increasing to 3 at 5th level, 4 at 10th level, 5 at 15th level, and 6 at 20th level."
                ]
            },
            {
                "name": "Sea",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 3,
                "entries": [
                    "When this effect is activated, you can choose one other creature you can see in your aura. The target must make a Dexterity saving throw. The target takes {@damage 1d6} lightning damage on a failed save, or half as much damage on a successful one. The damage increases when you reach certain levels in this class, increasing to {@dice 2d6} at 10th level, {@dice 3d6} at 15th level, and {@dice 4d6} at 20th level."
                ]
            },
            {
                "name": "Tundra",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 3,
                "entries": [
                    "When this effect is activated, each creature of your choice in your aura gains 2 temporary hit points, as icy spirits inure it to suffering. The temporary hit points increase when you reach certain levels in this class, increasing to 3 at 5th level, 4 at 10th level, 5 at 15th level, and 6 at 20th level."
                ]
            },
            {
                "name": "Desert",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 6,
                "entries": [
                    "You gain resistance to fire damage, and you don't suffer the effects of extreme heat, as described in the Dungeon Master's Guide. Moreover, as an action, you can touch a flammable object that isn't being worn or carried by anyone else and set it on fire."
                ]
            },
            {
                "name": "Sea",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 6,
                "entries": [
                    "You gain resistance to lightning damage, and you can breathe underwater. You also gain a swimming speed of 30 feet."
                ]
            },
            {
                "name": "Tundra",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 6,
                "entries": [
                    "You gain resistance to cold damage, and you don't suffer the effects of extreme cold, as described in the Dungeon Master's Guide. Moreover, as an action, you can touch water and turn a 5-foot cube of it into ice, which melts after 1 minute. This action fails if a creature is in the cube."
                ]
            },
            {
                "name": "Desert",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 14,
                "entries": [
                    "Immediately after a creature in your aura hits you with an attack, you can use your reaction to force that creature to make a Dexterity saving throw. On a failed save, the creature takes fire damage equal to half your barbarian level."
                ]
            },
            {
                "name": "Sea",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 14,
                "entries": [
                    "When you hit a creature in your aura with an attack, you can use your reaction to force that creature to make a Strength saving throw. On a failed save, the creature is knocked {@condition prone}, as if struck by a wave."
                ]
            },
            {
                "name": "Tundra",
                "source": "XGE",
                "page": 10,
                "className": "Barbarian",
                "classSource": "XGE",
                "subclassShortName": "Storm Herald",
                "subclassSource": "XGE",
                "level": 14,
                "entries": [
                    "Whenever the effect of your Storm Aura is activated, you can choose one creature you can see in the aura. That creature must succeed on a Strength saving throw, or its speed is reduced to 0 until the start of your next turn, as magical frost covers it."
                ]
            }
        ]
    }
        `;

        const class_bard = String.raw`{
            "class": [
                {
                    "name": "Bard",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "hd": {
                        "number": 1,
                        "faces": 8
                    },
                    "proficiency": [
                        "dex",
                        "cha"
                    ],
                    "spellcastingAbility": "cha",
                    "casterProgression": "full",
                    "cantripProgression": [
                        2,
                        2,
                        2,
                        3,
                        3,
                        3,
                        3,
                        3,
                        3,
                        4,
                        4,
                        4,
                        4,
                        4,
                        4,
                        4,
                        4,
                        4,
                        4,
                        4
                    ],
                    "spellsKnownProgression": [
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        14,
                        15,
                        15,
                        16,
                        18,
                        19,
                        19,
                        20,
                        22,
                        22,
                        22
                    ],
                    "additionalSpells": [
                        {
                            "name": "Magical Secrets",
                            "known": {
                                "10": [
                                    {
                                        "choose": "level=0;1;2;3;4;5"
                                    },
                                    {
                                        "choose": "level=0;1;2;3;4;5"
                                    }
                                ],
                                "14": [
                                    {
                                        "choose": "level=0;1;2;3;4;5;6;7"
                                    },
                                    {
                                        "choose": "level=0;1;2;3;4;5;6;7"
                                    }
                                ],
                                "18": [
                                    {
                                        "choose": ""
                                    },
                                    {
                                        "choose": ""
                                    }
                                ]
                            }
                        }
                    ],
                    "startingProficiencies": {
                        "armor": [
                            "light"
                        ],
                        "weapons": [
                            "simple",
                            "{@item hand crossbow|phb|hand crossbows}",
                            "{@item longsword|phb|longswords}",
                            "{@item rapier|phb|rapiers}",
                            "{@item shortsword|phb|shortswords}"
                        ],
                        "tools": [
                            "three {@item musical instrument|PHB|musical instruments} of your choice"
                        ],
                        "toolProficiencies": [
                            {
                                "anyMusicalInstrument": 3
                            }
                        ],
                        "skills": [
                            {
                                "any": 3
                            }
                        ]
                    },
                    "startingEquipment": {
                        "additionalFromBackground": true,
                        "default": [
                            "(a) a {@item rapier|phb}, (b) a {@item longsword|phb}, or (c) any {@filter simple weapon|items|source=phb|category=basic|type=simple weapon}",
                            "(a) a {@item diplomat's pack|phb} or (b) an {@item entertainer's pack|phb}",
                            "(a) a {@item lute|phb} or (b) any other {@filter musical instrument|items|miscellaneous=mundane|type=instrument}",
                            "{@item Leather armor|phb}, and a {@item dagger|phb}"
                        ],
                        "goldAlternative": "{@dice 5d4 × 10|5d4 × 10|Starting Gold}",
                        "defaultData": [
                            {
                                "a": [
                                    "rapier|phb"
                                ],
                                "b": [
                                    "longsword|phb"
                                ],
                                "c": [
                                    {
                                        "equipmentType": "weaponSimple"
                                    }
                                ]
                            },
                            {
                                "a": [
                                    "diplomat's pack|phb"
                                ],
                                "b": [
                                    "entertainer's pack|phb"
                                ]
                            },
                            {
                                "a": [
                                    "lute|phb"
                                ],
                                "b": [
                                    {
                                        "equipmentType": "instrumentMusical"
                                    }
                                ]
                            },
                            {
                                "_": [
                                    "Leather armor|phb",
                                    "dagger|phb"
                                ]
                            }
                        ]
                    },
                    "multiclassing": {
                        "requirements": {
                            "cha": 13
                        },
                        "proficienciesGained": {
                            "armor": [
                                "light"
                            ],
                            "skills": [
                                {
                                    "choose": {
                                        "from": [
                                            "athletics",
                                            "acrobatics",
                                            "sleight of hand",
                                            "stealth",
                                            "arcana",
                                            "history",
                                            "investigation",
                                            "nature",
                                            "religion",
                                            "animal handling",
                                            "insight",
                                            "medicine",
                                            "perception",
                                            "survival",
                                            "deception",
                                            "intimidation",
                                            "performance",
                                            "persuasion"
                                        ],
                                        "count": 1
                                    }
                                }
                            ],
                            "tools": [
                                "one {@item musical instrument|PHB} of your choice"
                            ],
                            "toolProficiencies": [
                                {
                                    "anyMusicalInstrument": 1
                                }
                            ]
                        }
                    },
                    "classTableGroups": [
                        {
                            "colLabels": [
                                "{@filter Cantrips Known|spells|level=0|class=bard}",
                                "{@filter Spells Known|spells|class=bard}"
                            ],
                            "rows": [
                                [
                                    2,
                                    4
                                ],
                                [
                                    2,
                                    5
                                ],
                                [
                                    2,
                                    6
                                ],
                                [
                                    3,
                                    7
                                ],
                                [
                                    3,
                                    8
                                ],
                                [
                                    3,
                                    9
                                ],
                                [
                                    3,
                                    10
                                ],
                                [
                                    3,
                                    11
                                ],
                                [
                                    3,
                                    12
                                ],
                                [
                                    4,
                                    14
                                ],
                                [
                                    4,
                                    15
                                ],
                                [
                                    4,
                                    15
                                ],
                                [
                                    4,
                                    16
                                ],
                                [
                                    4,
                                    18
                                ],
                                [
                                    4,
                                    19
                                ],
                                [
                                    4,
                                    19
                                ],
                                [
                                    4,
                                    20
                                ],
                                [
                                    4,
                                    22
                                ],
                                [
                                    4,
                                    22
                                ],
                                [
                                    4,
                                    22
                                ]
                            ]
                        },
                        {
                            "title": "Spell Slots per Spell Level",
                            "colLabels": [
                                "{@filter 1st|spells|level=1|class=bard}",
                                "{@filter 2nd|spells|level=2|class=bard}",
                                "{@filter 3rd|spells|level=3|class=bard}",
                                "{@filter 4th|spells|level=4|class=bard}",
                                "{@filter 5th|spells|level=5|class=bard}",
                                "{@filter 6th|spells|level=6|class=bard}",
                                "{@filter 7th|spells|level=7|class=bard}",
                                "{@filter 8th|spells|level=8|class=bard}",
                                "{@filter 9th|spells|level=9|class=bard}"
                            ],
                            "rowsSpellProgression": [
                                [
                                    2,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    3,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    2,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    2,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    2,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    1,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    2,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    2,
                                    1,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    2,
                                    1,
                                    0,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    2,
                                    1,
                                    1,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    2,
                                    1,
                                    1,
                                    0,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    2,
                                    1,
                                    1,
                                    1,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    2,
                                    1,
                                    1,
                                    1,
                                    0
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    2,
                                    1,
                                    1,
                                    1,
                                    1
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    3,
                                    1,
                                    1,
                                    1,
                                    1
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    3,
                                    2,
                                    1,
                                    1,
                                    1
                                ],
                                [
                                    4,
                                    3,
                                    3,
                                    3,
                                    3,
                                    2,
                                    2,
                                    1,
                                    1
                                ]
                            ]
                        }
                    ],
                    "classFeatures": [
                        "Bardic Inspiration|Bard||1",
                        "Spellcasting|Bard||1",
                        "Jack of All Trades|Bard||2",
                        "Song of Rest (d6)|Bard||2",
                        "Magical Inspiration|Bard||2|TCE",
                        {
                            "classFeature": "Bard College|Bard||3",
                            "gainSubclassFeature": true
                        },
                        "Expertise|Bard||3",
                        "Ability Score Improvement|Bard||4",
                        "Bardic Versatility|Bard||4|TCE",
                        "Bardic Inspiration (d8)|Bard||5",
                        "Font of Inspiration|Bard||5",
                        "Countercharm|Bard||6",
                        {
                            "classFeature": "Bard College feature|Bard||6",
                            "gainSubclassFeature": true
                        },
                        "Ability Score Improvement|Bard||8",
                        "Song of Rest (d8)|Bard||9",
                        "Bardic Inspiration (d10)|Bard||10",
                        "Expertise|Bard||10",
                        "Magical Secrets|Bard||10",
                        "Ability Score Improvement|Bard||12",
                        "Song of Rest (d10)|Bard||13",
                        "Magical Secrets|Bard||14",
                        {
                            "classFeature": "Bard College feature|Bard||14",
                            "gainSubclassFeature": true
                        },
                        "Bardic Inspiration (d12)|Bard||15",
                        "Ability Score Improvement|Bard||16",
                        "Song of Rest (d12)|Bard||17",
                        "Magical Secrets|Bard||18",
                        "Ability Score Improvement|Bard||19",
                        "Superior Inspiration|Bard||20"
                    ],
                    "subclassTitle": "Bard College",
                    "fluff": [
                        {
                            "name": "Bard",
                            "type": "section",
                            "entries": [
                                "Humming as she traces her fingers over an ancient monument in a long-forgotten ruin, a half-elf in rugged leathers finds knowledge springing into her mind, conjured forth by the magic of her song\u2014knowledge of the people who constructed the monument and the mythic saga it depicts.",
                                "A stern human warrior bangs his sword rhythmically against his scale mail, setting the tempo for his war chant and exhorting his companions to bravery and heroism. The magic of his song fortifies and emboldens them.",
                                "Laughing as she tunes her cittern, a gnome weaves her subtle magic over the assembled nobles, ensuring that her companions' words will be well received.",
                                "Whether scholar, skald, or scoundrel, a bard weaves magic through words and music to inspire allies, demoralize foes, manipulate minds, create illusions, and even heal wounds.",
                                {
                                    "type": "entries",
                                    "name": "Music and Magic",
                                    "entries": [
                                        "In the worlds of D&D, words and music are not just vibrations of air, but vocalizations with power all their own. The bard is a master of song, speech, and the magic they contain. Bards say that the multiverse was spoken into existence, that the words of the gods gave it shape, and that echoes of these primordial Words of Creation still resound throughout the cosmos. The music of bards is an attempt to snatch and harness those echoes, subtly woven into their spells and powers.",
                                        "The greatest strength of bards is their sheer versatility. Many bards prefer to stick to the sidelines in combat, using their magic to inspire their allies and hinder their foes from a distance. But bards are capable of defending themselves in melee if necessary, using their magic to bolster their swords and armor. Their spells lean toward charms and illusions rather than blatantly destructive spells. They have a wide-ranging knowledge of many subjects and a natural aptitude that lets them do almost anything well. Bards become masters of the talents they set their minds to perfecting, from musical performance to esoteric knowledge."
                                    ]
                                },
                                {
                                    "type": "entries",
                                    "name": "Learning from Experience",
                                    "entries": [
                                        "True bards are not common in the world. Not every minstrel singing in a tavern or jester cavorting in a royal court is a bard. Discovering the magic hidden in music requires hard study and some measure of natural talent that most troubadours and jongleurs lack. It can be hard to spot the difference between these performers and true bards, though. A bard's life is spent wandering across the land gathering lore, telling stories, and living on the gratitude of audiences, much like any other entertainer. But a depth of knowledge, a level of musical skill, and a touch of magic set bards apart from their fellows.",
                                        "Only rarely do bards settle in one place for long, and their natural desire to travel\u2014to find new tales to tell, new skills to learn, and new discoveries beyond the horizon\u2014makes an adventuring career a natural calling. Every adventure is an opportunity to learn, practice a variety of skills, enter long-forgotten tombs, discover lost works of magic, decipher old tomes, travel to strange places, or encounter exotic creatures. Bards love to accompany heroes to witness their deeds firsthand. A bard who can tell an awe-inspiring story from personal experience earns renown among other bards. Indeed, after telling so many stories about heroes accomplishing mighty deeds, many bards take these themes to heart and assume heroic roles themselves."
                                    ]
                                },
                                {
                                    "type": "entries",
                                    "name": "Creating a Bard",
                                    "entries": [
                                        "Bards thrive on stories, whether those stories are true or not. Your character's background and motivations are not as important as the stories that he or she tells about them. Perhaps you had a secure and mundane childhood. There's no good story to be told about that, so you might paint yourself as an orphan raised by a hag in a dismal swamp. Or your childhood might be worthy of a story. Some bards acquire their magical music through extraordinary means, including the inspiration of fey or other supernatural creatures.",
                                        "Did you serve an apprenticeship, studying under a master, following the more experienced bard until you were ready to strike out on your own? Or did you attend a college where you studied bardic lore and practiced your musical magic? Perhaps you were a young runaway or orphan, befriended by a wandering bard who became your mentor. Or you might have been a spoiled noble child tutored by a master. Perhaps you stumbled into the clutches of a hag, making a bargain for a musical gift in addition to your life and freedom, but at what cost?",
                                        {
                                            "type": "entries",
                                            "name": "Quick Build",
                                            "entries": [
                                                "You can make a bard quickly by following these suggestions. First, Charisma should be your highest ability score, followed by Dexterity. Second, choose the {@background entertainer} background. Third, choose the {@spell dancing lights} and {@spell vicious mockery} cantrips, along with the following 1st-level spells: {@spell charm person}, {@spell detect magic}, {@spell healing word}, and {@spell thunderwave}."
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "source": "PHB",
                            "page": 51
                        },
                        {
                            "type": "section",
                            "entries": [
                                {
                                    "type": "quote",
                                    "entries": [
                                        "Music is the fruit of the divine tree that vibrates with the Words of Creation. But the question I ask you is, can a bard go to the root of this tree? Can one tap into the source of that power? Ah, then what manner of music they would bring to this world!"
                                    ],
                                    "by": "Fletcher Danairia, master bard"
                                },
                                "Bards bring levity during grave times; they impart wisdom to offset ignorance; and they make the ridiculous seem sublime. Bards are preservers of ancient history, their songs and tales perpetuating the memory of great events down through time\u2014knowledge so important that it is memorized and passed along as oral history, to survive even when no written record remains.",
                                "It is also the bard's role to chronicle smaller and more contemporary events\u2014the stories of today's heroes, including their feats of valor as well as their less than impressive failures.",
                                "Of course, the world has many people who can carry a tune or tell a good story, and there's much more to any adventuring bard than a glib tongue and a melodious voice. Yet what truly sets bards apart from others\u2014and from one another\u2014are the style and substance of their performances.",
                                "To grab and hold the attention of an audience, bards are typically flamboyant and outgoing when they perform. The most famous of them are essentially the D&D world's equivalent of pop stars. If you're playing a bard, consider using one of your favorite musicians as a role model for your character.",
                                "You can add some unique aspects to your bard character by considering the suggestions that follow.",
                                {
                                    "type": "entries",
                                    "name": "Defining Work",
                                    "entries": [
                                        "Every successful bard is renowned for at least one piece of performance art, typically a song or a poem that is popular with everyone who hears it. These performances are spoken about for years by those who view them, and some spectators have had their lives forever changed because of the experience.",
                                        "If your character is just starting out, your ultimate defining work is likely in the future. But in order to make any sort of living at your profession, chances are you already have a piece or two in your repertoire that have proven to be audience pleasers.",
                                        {
                                            "type": "table",
                                            "caption": "Defining Work",
                                            "colLabels": [
                                                "{@dice d6}",
                                                "Defining Work"
                                            ],
                                            "colStyles": [
                                                "col-1 text-center",
                                                "col-11"
                                            ],
                                            "rows": [
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 1
                                                        }
                                                    },
                                                    "\"The Three Flambinis,\" a ribald song concerning mistaken identities and unfettered desire"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 2
                                                        }
                                                    },
                                                    "\"Waltz of the Myconids,\" an upbeat tune that children in particular enjoy"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 3
                                                        }
                                                    },
                                                    "\"Asmodeus's Golden Arse,\" a dramatic poem you claim was inspired by your personal visit to Avernus"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 4
                                                        }
                                                    },
                                                    "\"The Pirates of Luskan,\" your firsthand account of being kidnapped by sea reavers as a child"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 5
                                                        }
                                                    },
                                                    "\"A Hoop, Two Pigeons, and a Hell Hound,\" a subtle parody of an incompetent noble"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 6
                                                        }
                                                    },
                                                    "\"A Fool in the Abyss,\" a comedic poem about a jester's travels among demons"
                                                ]
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "entries",
                                    "name": "Instrument",
                                    "entries": [
                                        "In a bard's quest for the ultimate performance and the highest acclaim, one's instrument is at least as important as one's vocal ability. The instrument's quality of manufacture is a critical factor, of course; the best ones make the best music, and some bards are continually on the lookout for an improvement. Perhaps just as important, though, is the instrument's own entertainment value; those that are bizarrely constructed or made of exotic materials are likely to leave a lasting impression on an audience.",
                                        "You might have an \"off the rack\" instrument, perhaps because it's all you can afford right now. Or, if your first instrument was gifted to you, it might be of a more elaborate sort. Are you satisfied with the instrument you have, or do you aspire to replace it with something truly distinctive?",
                                        {
                                            "type": "table",
                                            "caption": "Instrument",
                                            "colLabels": [
                                                "{@dice d6}",
                                                "Instrument"
                                            ],
                                            "colStyles": [
                                                "col-1 text-center",
                                                "col-11"
                                            ],
                                            "rows": [
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 1
                                                        }
                                                    },
                                                    "A masterfully crafted halfling fiddle"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 2
                                                        }
                                                    },
                                                    "A mithral {@item horn|PHB} made by elves"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 3
                                                        }
                                                    },
                                                    "A zither made with drow spider silk"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 4
                                                        }
                                                    },
                                                    "An orcish {@item drum|PHB}"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 5
                                                        }
                                                    },
                                                    "A wooden bullywug croak box"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 6
                                                        }
                                                    },
                                                    "A tinker's harp of gnomish design"
                                                ]
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "entries",
                                    "name": "Embarrassment",
                                    "entries": [
                                        "Almost every bard has suffered at least one bad experience in front of an audience, and chances are you're no exception. No one becomes famous right away, after all; perhaps you had a few small difficulties early in your career, or maybe it took you a while to restore your reputation after one agonizing night when the fates conspired to bring about your theatrical ruin.",
                                        "The ways that a performance can go wrong are as varied as the fish in the sea. No matter what sort of disaster might occur, however, a bard has the courage and the confidence to rebound from it\u2014either pressing on with the show (if possible) or promising to come back tomorrow with a new performance that's guaranteed to please.",
                                        {
                                            "type": "table",
                                            "caption": "Embarrassment",
                                            "colLabels": [
                                                "{@dice d6}",
                                                "Embarrassment"
                                            ],
                                            "colStyles": [
                                                "col-1 text-center",
                                                "col-11"
                                            ],
                                            "rows": [
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 1
                                                        }
                                                    },
                                                    "The time when your comedic song, \"Big Tom's Hijinks\"\u2014which, by the way, you thought was brilliant\u2014did not go over well with Big Tom"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 2
                                                        }
                                                    },
                                                    "The matinee performance when a circus's owlbear got loose and terrorized the crowd"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 3
                                                        }
                                                    },
                                                    "When your opening song was your enthusiastic but universally hated rendition of \"Song of the Froghemoth\""
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 4
                                                        }
                                                    },
                                                    "The first and last public performance of \"Mirt, Man about Town\""
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 5
                                                        }
                                                    },
                                                    "The time on stage when your wig caught fire and you threw it down\u2014which set fire to the stage"
                                                ],
                                                [
                                                    {
                                                        "type": "cell",
                                                        "roll": {
                                                            "exact": 6
                                                        }
                                                    },
                                                    "When you sat on your {@item lute|PHB} by mistake during the final stanza of \"Starlight Serenade\""
                                                ]
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "entries",
                                    "name": "A Bard's Muse",
                                    "entries": [
                                        "Naturally, every bard has a repertoire of songs and stories. Some bards are generalists who can draw from a wide range of topics for each performance, and who take pride in their versatility. Others adopt a more personal approach to their art, driven by their attachment to a muse\u2014a particular concept that inspires much of what those bards do in front of an audience.",
                                        "A bard who follows a muse generally does so to gain a deeper understanding of what that muse represents and how to best convey that understanding to others through performance.",
                                        "If your bard character has a muse, it could be one of the three described here, or one of your own devising.",
                                        {
                                            "type": "entries",
                                            "entries": [
                                                {
                                                    "type": "entries",
                                                    "name": "Nature",
                                                    "entries": [
                                                        "You feel a kinship with the natural world, and its beauty and mystery inspire you. For you, a tree is deeply symbolic, its roots delving into the dark unknown to draw forth the power of the earth, while its branches reach toward the sun to nourish their flowers and fruit. Nature is the ancient witness who has seen every kingdom rise and fall, even those whose names have been forgotten and wait to be rediscovered. The gods of nature share their secrets with druids and sages, opening their hearts and minds to new ways of seeing, and as with those individuals, you find that your creativity blossoms while you wander in an open field of waving grass or walk in silent reverence through a grove of ancient oaks."
                                                    ]
                                                },
                                                {
                                                    "type": "entries",
                                                    "name": "Love",
                                                    "entries": [
                                                        "You are on a quest to identify the essence of true love. Though you do not disdain the superficial love of flesh and form, the deeper form of love that can inspire thousands or bring joy to one's every moment is what you are interested in. Love of this sort takes on many forms, and you can see its presence everywhere\u2014from the sparkling of a beautiful gem to the song of a simple fisher thanking the sea for its bounty. You are on the trail of love, that most precious and mysterious of emotions, and your search fills your stories and your songs with vitality and passion."
                                                    ]
                                                },
                                                {
                                                    "type": "entries",
                                                    "name": "Conflict",
                                                    "entries": [
                                                        "Drama embodies conflict, and the best stories have conflict as a key element. From the morning-after tale of a tavern brawl to the saga of an epic battle, from a lover's spat to a rift between powerful dynasties, conflict is what inspires tale-tellers like you to create your best work. Conflict can bring out the best in some people, causing their heroic nature to shine forth and transform the world, but it can cause others to gravitate toward darkness and fall under the sway of evil. You strive to experience or witness all forms of conflict, great and small, so as to study this eternal aspect of life and immortalize it in your words and music."
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "source": "XGE",
                            "page": 12
                        }
                    ]
                }
            ],
            "subclass": [
                {
                    "name": "College of Lore",
                    "shortName": "Lore",
                    "source": "PHB",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 54,
                    "srd": true,
                    "additionalSpells": [
                        {
                            "name": "Additional Magical Secrets",
                            "known": {
                                "6": [
                                    {
                                        "choose": "level=0;1;2;3"
                                    },
                                    {
                                        "choose": "level=0;1;2;3"
                                    }
                                ]
                            }
                        }
                    ],
                    "subclassFeatures": [
                        "College of Lore|Bard||Lore||3",
                        "Additional Magical Secrets|Bard||Lore||6",
                        "Peerless Skill|Bard||Lore||14"
                    ]
                },
                {
                    "name": "College of Valor",
                    "shortName": "Valor",
                    "source": "PHB",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 55,
                    "subclassFeatures": [
                        "College of Valor|Bard||Valor||3",
                        "Extra Attack|Bard||Valor||6",
                        "Battle Magic|Bard||Valor||14"
                    ]
                },
                {
                    "name": "College of Glamour",
                    "shortName": "Glamour",
                    "source": "XGE",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 14,
                    "additionalSpells": [
                        {
                            "innate": {
                                "6": [
                                    "command"
                                ]
                            }
                        }
                    ],
                    "subclassFeatures": [
                        "College of Glamour|Bard||Glamour|XGE|3",
                        "Mantle of Majesty|Bard||Glamour|XGE|6",
                        "Unbreakable Majesty|Bard||Glamour|XGE|14"
                    ]
                },
                {
                    "name": "College of Swords",
                    "shortName": "Swords",
                    "source": "XGE",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 15,
                    "optionalfeatureProgression": [
                        {
                            "name": "Fighting Style",
                            "featureType": [
                                "FS:B"
                            ],
                            "progression": {
                                "3": 1
                            }
                        }
                    ],
                    "subclassFeatures": [
                        "College of Swords|Bard||Swords|XGE|3",
                        "Extra Attack|Bard||Swords|XGE|6",
                        "Master's Flourish|Bard||Swords|XGE|14"
                    ]
                },
                {
                    "name": "College of Whispers",
                    "shortName": "Whispers",
                    "source": "XGE",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 16,
                    "subclassFeatures": [
                        "College of Whispers|Bard||Whispers|XGE|3",
                        "Mantle of Whispers|Bard||Whispers|XGE|6",
                        "Shadow Lore|Bard||Whispers|XGE|14"
                    ]
                },
                {
                    "name": "College of Creation",
                    "shortName": "Creation",
                    "source": "TCE",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 28,
                    "subclassFeatures": [
                        "College of Creation|Bard||Creation|TCE|3",
                        "Animating Performance|Bard||Creation|TCE|6",
                        "Creative Crescendo|Bard||Creation|TCE|14"
                    ]
                },
                {
                    "name": "College of Eloquence",
                    "shortName": "Eloquence",
                    "source": "TCE",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 29,
                    "otherSources": [
                        {
                            "source": "MOT",
                            "page": 28
                        }
                    ],
                    "subclassFeatures": [
                        "College of Eloquence|Bard||Eloquence|TCE|3",
                        "Unfailing Inspiration|Bard||Eloquence|TCE|6",
                        "Universal Speech|Bard||Eloquence|TCE|6",
                        "Infectious Inspiration|Bard||Eloquence|TCE|14"
                    ]
                },
                {
                    "name": "College of Spirits",
                    "shortName": "Spirits",
                    "source": "VRGR",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 28,
                    "additionalSpells": [
                        {
                            "known": {
                                "3": [
                                    "guidance#c"
                                ]
                            }
                        }
                    ],
                    "subclassFeatures": [
                        "College of Spirits|Bard||Spirits|VRGR|3",
                        "Spirit Session|Bard||Spirits|VRGR|6",
                        "Mystical Connection|Bard||Spirits|VRGR|14"
                    ]
                },
                {
                    "name": "College of Tragedy",
                    "shortName": "Tragedy",
                    "source": "TDCSR",
                    "className": "Bard",
                    "classSource": "PHB",
                    "page": 167,
                    "subclassFeatures": [
                        "College of Tragedy|Bard|PHB|Tragedy|TDCSR|3",
                        "Tale of Hubris|Bard|PHB|Tragedy|TDCSR|6",
                        "Impending Misfortune|Bard|PHB|Tragedy|TDCSR|6",
                        "Tale of Hubris (14th Level)|Bard|PHB|Tragedy|TDCSR|14",
                        "Nimbus of Pathos|Bard|PHB|Tragedy|TDCSR|14"
                    ]
                }
            ],
            "classFeature": [
                {
                    "name": "Bardic Inspiration",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 1,
                    "entries": [
                        "You can inspire others through stirring words or music. To do so, you use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic Inspiration die, a {@dice d6}.",
                        "Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, attack roll, or saving throw it makes. The creature can wait until after it rolls the {@dice d20} before deciding to use the Bardic Inspiration die, but must decide before the DM says whether the roll succeeds or fails. Once the Bardic Inspiration die is rolled, it is lost. A creature can have only one Bardic Inspiration die at a time.",
                        "You can use this feature a number of times equal to your Charisma modifier (a minimum of once). You regain any expended uses when you finish a long rest.",
                        "Your Bardic Inspiration die changes when you reach certain levels in this class. The die becomes a {@dice d8} at 5th level, a {@dice d10} at 10th level, and a {@dice d12} at 15th level."
                    ]
                },
                {
                    "name": "Spellcasting",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 1,
                    "entries": [
                        "You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. Your spells are part of your vast repertoire, magic that you can tune to different situations. See {@book chapter 10|PHB|10} for the general rules of spellcasting and {@book chapter 11|PHB|11} for the {@filter bard spell list|spells|class=bard}.",
                        {
                            "type": "entries",
                            "name": "Cantrips",
                            "entries": [
                                "You know two cantrips of your choice from the bard spell list. You learn additional bard cantrips of your choice at higher levels, learning a 3rd cantrip at 4th level and a 4th at 10th level."
                            ]
                        },
                        {
                            "type": "entries",
                            "name": "Spell Slots",
                            "entries": [
                                "The Bard table shows how many spell slots you have to cast your {@filter bard spells|spells|class=bard} of 1st level and higher. To cast one of these spells, you must expend a slot of the spell's level or higher. You regain all expended spell slots when you finish a long rest.",
                                "For example, if you know the 1st-level spell {@spell cure wounds} and have a 1st-level and a 2nd-level spell slot available, you can cast {@spell cure wounds} using either slot."
                            ]
                        },
                        {
                            "type": "entries",
                            "name": "Spells Known of 1st Level and Higher",
                            "entries": [
                                "You know four 1st-level spells of your choice from the bard spell list.",
                                "You learn an additional bard spell of your choice at each level except 12th, 16th, 19th, and 20th. Each of these spells must be of a level for which you have spell slots. For instance, when you reach 3rd level in this class, you can learn one new spell of 1st or 2nd level.",
                                "Additionally, when you gain a level in this class, you can choose one of the bard spells you know and replace it with another spell from the bard spell list, which also must be of a level for which you have spell slots."
                            ]
                        },
                        {
                            "type": "entries",
                            "name": "Spellcasting Ability",
                            "entries": [
                                "Charisma is your spellcasting ability for your bard spells. Your magic comes from the heart and soul you pour into the performance of your music or oration. You use your Charisma whenever a spell refers to your spellcasting ability. In addition, you use your Charisma modifier when setting the saving throw DC for a bard spell you cast and when making an attack roll with one.",
                                {
                                    "type": "abilityDc",
                                    "name": "Spell",
                                    "attributes": [
                                        "cha"
                                    ]
                                },
                                {
                                    "type": "abilityAttackMod",
                                    "name": "Spell",
                                    "attributes": [
                                        "cha"
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "entries",
                            "name": "Ritual Casting",
                            "entries": [
                                "You can cast any bard spell you know as a ritual if that spell has the ritual tag."
                            ]
                        },
                        {
                            "type": "entries",
                            "name": "Spellcasting Focus",
                            "entries": [
                                "You can use a {@item musical instrument|PHB} as a spellcasting focus for your bard spells."
                            ]
                        }
                    ]
                },
                {
                    "name": "Jack of All Trades",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 2,
                    "entries": [
                        "Starting at 2nd level, you can add half your proficiency bonus, rounded down, to any ability check you make that doesn't already include your proficiency bonus."
                    ]
                },
                {
                    "name": "Magical Inspiration",
                    "source": "TCE",
                    "page": 27,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 2,
                    "isClassFeatureVariant": true,
                    "entries": [
                        "{@i 2nd-level bard {@variantrule optional class features|tce|optional feature}}",
                        "If a creature has a Bardic Inspiration die from you and casts a spell that restores hit points or deals damage, the creature can roll that die and choose a target affected by the spell. Add the number rolled as a bonus to the hit points regained or the damage dealt. The Bardic Inspiration die is then lost."
                    ]
                },
                {
                    "name": "Song of Rest (d6)",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 2,
                    "entries": [
                        "Beginning at 2nd level, you can use soothing music or oration to help revitalize your wounded allies during a short rest. If you or any friendly creatures who can hear your performance regain hit points by spending Hit Dice at the end of the short rest, each of those creatures regains an extra {@dice 1d6} hit points.",
                        "The extra hit points increase when you reach certain levels in this class: to {@dice 1d8} at 9th level, to {@dice 1d10} at 13th level, and to {@dice 1d12} at 17th level."
                    ]
                },
                {
                    "name": "Bard College",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 3,
                    "entries": [
                        "At 3rd level, you delve into the advanced techniques of a bard college of your choice from the list of available colleges. Your choice grants you features at 3rd level and again at 6th and 14th level."
                    ]
                },
                {
                    "name": "Expertise",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 3,
                    "entries": [
                        "At 3rd level, choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.",
                        "At 10th level, you can choose another two skill proficiencies to gain this benefit."
                    ]
                },
                {
                    "name": "Ability Score Improvement",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 4,
                    "entries": [
                        "When you reach 4th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                        "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                    ]
                },
                {
                    "name": "Bardic Versatility",
                    "source": "TCE",
                    "page": 27,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 4,
                    "isClassFeatureVariant": true,
                    "entries": [
                        "{@i 4th-level bard {@variantrule optional class features|tce|optional feature}}",
                        "Whenever you reach a level in this class that grants the Ability Score Improvement feature, you can do one of the following, representing a change in focus as you use your skills and magic:",
                        {
                            "type": "list",
                            "items": [
                                "Replace one of the skills you chose for the Expertise feature with one of your other skill proficiencies that isn't benefiting from Expertise.",
                                "Replace one cantrip you learned from this class's Spellcasting feature with another cantrip from the {@filter bard spell list|spells|level=0|class=bard}."
                            ]
                        }
                    ]
                },
                {
                    "name": "Bardic Inspiration (d8)",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 5,
                    "entries": [
                        "At 5th level, your Bardic Inspiration die changes to a {@dice d8}."
                    ]
                },
                {
                    "name": "Font of Inspiration",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 5,
                    "entries": [
                        "Beginning when you reach 5th level, you regain all of your expended uses of Bardic Inspiration when you finish a short or long rest."
                    ]
                },
                {
                    "name": "Bard College feature",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 6,
                    "entries": [
                        "At 6th level, you gain a feature from your Bard College."
                    ]
                },
                {
                    "name": "Countercharm",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 6,
                    "entries": [
                        "At 6th level, you gain the ability to use musical notes or words of power to disrupt mind-influencing effects. As an action, you can start a performance that lasts until the end of your next turn. During that time, you and any friendly creatures within 30 feet of you have advantage on saving throws against being {@condition frightened} or {@condition charmed}. A creature must be able to hear you to gain this benefit. The performance ends early if you are {@condition incapacitated} or silenced or if you voluntarily end it (no action required)."
                    ]
                },
                {
                    "name": "Ability Score Improvement",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 8,
                    "entries": [
                        "When you reach 8th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                        "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                    ]
                },
                {
                    "name": "Song of Rest (d8)",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 9,
                    "entries": [
                        "At 9th level, the extra hit points gained from Song of Rest increases to {@dice 1d8}."
                    ]
                },
                {
                    "name": "Bardic Inspiration (d10)",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 10,
                    "entries": [
                        "At 10th level, your Bardic Inspiration die changes to a {@dice d10}."
                    ]
                },
                {
                    "name": "Expertise",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 10,
                    "entries": [
                        "At 10th level, you can choose another two skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies."
                    ]
                },
                {
                    "name": "Magical Secrets",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 10,
                    "entries": [
                        "By 10th level, you have plundered magical knowledge from a wide spectrum of disciplines. Choose two spells from any classes, including this one. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip.",
                        "The chosen spells count as bard spells for you and are included in the number in the Spells Known column of the Bard table.",
                        "You learn two additional spells from any classes at 14th level and again at 18th level."
                    ]
                },
                {
                    "name": "Ability Score Improvement",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 12,
                    "entries": [
                        "When you reach 12th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                        "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                    ]
                },
                {
                    "name": "Song of Rest (d10)",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 13,
                    "entries": [
                        "At 13th level, the extra hit points gained from Song of Rest increases to {@dice 1d10}."
                    ]
                },
                {
                    "name": "Bard College feature",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 14,
                    "entries": [
                        "At 14th level, you gain a feature from your Bard College."
                    ]
                },
                {
                    "name": "Magical Secrets",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 14,
                    "entries": [
                        "At 14th level, choose two additional spells from any classes, including this one. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip.",
                        "The chosen spells count as bard spells for you and are included in the number in the Spells Known column of the Bard table."
                    ]
                },
                {
                    "name": "Bardic Inspiration (d12)",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 15,
                    "entries": [
                        "At 15th level, your Bardic Inspiration die changes to a {@dice d12}."
                    ]
                },
                {
                    "name": "Ability Score Improvement",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 16,
                    "entries": [
                        "When you reach 16th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                        "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                    ]
                },
                {
                    "name": "Song of Rest (d12)",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 17,
                    "entries": [
                        "At 17th level, the extra hit points gained from Song of Rest increases to {@dice 1d12}."
                    ]
                },
                {
                    "name": "Magical Secrets",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 18,
                    "entries": [
                        "At 18th level, choose two additional spells from any class, including this one. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip.",
                        "The chosen spells count as bard spells for you and are included in the number in the Spells Known column of the Bard table."
                    ]
                },
                {
                    "name": "Ability Score Improvement",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 19,
                    "entries": [
                        "When you reach 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
                        "If your DM allows the use of feats, you may instead take a {@5etools feat|feats.html}."
                    ]
                },
                {
                    "name": "Superior Inspiration",
                    "source": "PHB",
                    "page": 51,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "level": 20,
                    "entries": [
                        "At 20th level, when you roll initiative and have no uses of Bardic Inspiration left, you regain one use."
                    ]
                }
            ],
            "subclassFeature": [
                {
                    "name": "College of Lore",
                    "source": "PHB",
                    "page": 54,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Lore",
                    "subclassSource": "PHB",
                    "level": 3,
                    "entries": [
                        "Bards of the College of Lore know something about most things, collecting bits of knowledge from sources as diverse as scholarly tomes and peasant tales. Whether singing folk ballads in taverns or elaborate compositions in royal courts, these bards use their gifts to hold audiences spellbound. When the applause dies down, the audience members might find themselves questioning everything they held to be true, from their faith in the priesthood of the local temple to their loyalty to the king.",
                        "The loyalty of these bards lies in the pursuit of beauty and truth, not in fealty to a monarch or following the tenets of a deity. A noble who keeps such a bard as a herald or advisor knows that the bard would rather be honest than politic.",
                        "The college's members gather in libraries and sometimes in actual colleges, complete with classrooms and dormitories, to share their lore with one another. They also meet at festivals or affairs of state, where they can expose corruption, unravel lies, and poke fun at self-important figures of authority.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Bonus Proficiencies|Bard||Lore||3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Cutting Words|Bard||Lore||3"
                        }
                    ]
                },
                {
                    "name": "Bonus Proficiencies",
                    "source": "PHB",
                    "page": 54,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Lore",
                    "subclassSource": "PHB",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "When you join the College of Lore at 3rd level, you gain proficiency with three skills of your choice."
                    ]
                },
                {
                    "name": "Cutting Words",
                    "source": "PHB",
                    "page": 54,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Lore",
                    "subclassSource": "PHB",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "Also at 3rd level, you learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence of others. When a creature that you can see within 60 feet of you makes an attack roll, an ability check, or a damage roll, you can use your reaction to expend one of your uses of Bardic Inspiration, rolling a Bardic Inspiration die and subtracting the number rolled from the creature's roll. You can choose to use this feature after the creature makes its roll, but before the DM determines whether the attack roll or ability check succeeds or fails, or before the creature deals its damage. The creature is immune if it can't hear you or if it's immune to being {@condition charmed}."
                    ]
                },
                {
                    "name": "Additional Magical Secrets",
                    "source": "PHB",
                    "page": 54,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Lore",
                    "subclassSource": "PHB",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "At 6th level, you learn two spells of your choice from any class. A spell you choose must be of a level you can cast, as shown on the Bard table, or a cantrip. The chosen spells count as bard spells for you but don't count against the number of bard spells you know."
                    ]
                },
                {
                    "name": "Peerless Skill",
                    "source": "PHB",
                    "page": 54,
                    "srd": true,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Lore",
                    "subclassSource": "PHB",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "Starting at 14th level, when you make an ability check, you can expend one use of Bardic Inspiration. Roll a Bardic Inspiration die and add the number rolled to your ability check. You can choose to do so after you roll the die for the ability check, but before the DM tells you whether you succeed or fail."
                    ]
                },
                {
                    "name": "College of Valor",
                    "source": "PHB",
                    "page": 55,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Valor",
                    "subclassSource": "PHB",
                    "level": 3,
                    "entries": [
                        "Bards of the College of Valor are daring skalds whose tales keep alive the memory of the great heroes of the past, and thereby inspire a new generation of heroes. These bards gather in mead halls or around great bonfires to sing the deeds of the mighty, both past and present. They travel the land to witness great events firsthand and to ensure that the memory of those events doesn't pass from the world. With their songs, they inspire others to reach the same heights of accomplishment as the heroes of old.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Bonus Proficiencies|Bard||Valor||3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Combat Inspiration|Bard||Valor||3"
                        }
                    ]
                },
                {
                    "name": "Bonus Proficiencies",
                    "source": "PHB",
                    "page": 55,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Valor",
                    "subclassSource": "PHB",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "When you join the College of Valor at 3rd level, you gain proficiency with medium armor, shields, and martial weapons."
                    ]
                },
                {
                    "name": "Combat Inspiration",
                    "source": "PHB",
                    "page": 55,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Valor",
                    "subclassSource": "PHB",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "Also at 3rd level, you learn to inspire others in battle. A creature that has a Bardic Inspiration die from you can roll that die and add the number rolled to a weapon damage roll it just made. Alternatively, when an attack roll is made against the creature, it can use its reaction to roll the Bardic Inspiration die and add the number rolled to its AC against that attack, after seeing the roll but before knowing whether it hits or misses."
                    ]
                },
                {
                    "name": "Extra Attack",
                    "source": "PHB",
                    "page": 55,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Valor",
                    "subclassSource": "PHB",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "Starting at 6th level, you can attack twice, instead of once, whenever you take the {@action Attack} action on your turn."
                    ]
                },
                {
                    "name": "Battle Magic",
                    "source": "PHB",
                    "page": 55,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Valor",
                    "subclassSource": "PHB",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "At 14th level, you have mastered the art of weaving spellcasting and weapon use into a single harmonious act. When you use your action to cast a bard spell, you can make one weapon attack as a bonus action."
                    ]
                },
                {
                    "name": "College of Creation",
                    "source": "TCE",
                    "page": 27,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Creation",
                    "subclassSource": "TCE",
                    "level": 3,
                    "entries": [
                        "Bards believe the cosmos is a work of art-the creation of the first dragons and gods. That creative work included harmonies that continue to resound through existence today, a power known as the Song of Creation. The bards of the College of Creation draw on that primeval song through dance, music, and poetry, and their teachers share this lesson:",
                        "\"Before the sun and the moon, there was the Song, and its music awoke the first dawn. Its melodies so delighted the stones and trees that some of them gained a voice of their own. And now they sing too. Learn the Song, students, and you too can teach the mountains to sing and dance.\"",
                        "Dwarves and gnomes often encourage their bards to become students of the Song of Creation. And among dragonborn, the Song of Creation is revered, for legends portray Bahamut and Tiamat-the greatest of dragons-as two of the song's first singers.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Mote of Potential|Bard||Creation|TCE|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Performance of Creation|Bard||Creation|TCE|3"
                        }
                    ]
                },
                {
                    "name": "Mote of Potential",
                    "source": "TCE",
                    "page": 27,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Creation",
                    "subclassSource": "TCE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "{@i 3rd-level College of Creation feature}",
                        "Whenever you give a creature a Bardic Inspiration die, you can utter a note from the Song of Creation to create a Tiny mote of potential, which orbits within 5 feet of that creature. The mote is intangible and invulnerable, and it lasts until the Bardic Inspiration die is lost. The mote looks like a musical note, a star, a flower, or another symbol of art or life that you choose.",
                        "When the creature uses the Bardic Inspiration die, the mote provides an additional effect based on whether the die benefits an ability check, an attack roll, or a saving throw, as detailed below:",
                        {
                            "type": "list",
                            "style": "list-hang-notitle",
                            "items": [
                                {
                                    "type": "item",
                                    "name": "Ability Check",
                                    "entry": "When the creature rolls the Bardic Inspiration die to add it to an ability check, the creature can roll the Bardic Inspiration die again and choose which roll to use, as the mote pops and emits colorful, harmless sparks for a moment."
                                },
                                {
                                    "type": "item",
                                    "name": "Attack Roll",
                                    "entry": "Immediately after the creature rolls the Bardic Inspiration die to add it to an attack roll against a target, the mote thunderously shatters. The target and each creature of your choice that you can see within 5 feet of it must succeed on a Constitution saving throw against your spell save DC or take thunder damage equal to the number rolled on the Bardic Inspiration die."
                                },
                                {
                                    "type": "item",
                                    "name": "Saving Throw",
                                    "entry": "Immediately after the creature rolls the Bardic Inspiration die and adds it to a saving throw, the mote vanishes with the sound of soft music, causing the creature to gain temporary hit points equal to the number rolled on the Bardic Inspiration die plus your Charisma modifier (minimum of 1 temporary hit point)."
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Performance of Creation",
                    "source": "TCE",
                    "page": 27,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Creation",
                    "subclassSource": "TCE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "{@i 3rd-level College of Creation feature}",
                        "As an action, you can channel the magic of the Song of Creation to create one nonmagical item of your choice in an unoccupied space within 10 feet of you. The item must appear on a surface or in a liquid that can support it. The gp value of the item can't be more than 20 times your bard level, and the item must be Medium or smaller. The item glimmers softly, and a creature can faintly hear music when touching it. The created item disappears after a number of hours equal to your proficiency bonus. For examples of items you can create, see the equipment chapter of the {@book Player's Handbook|PHB|5}.",
                        "Once you create an item with this feature, you can't do so again until you finish a long rest, unless you expend a spell slot of 2nd level or higher to use this feature again. You can have only one item created by this feature at a time; if you use this action and already have an item from this feature, the first one immediately vanishes.",
                        "The size of the item you can create with this feature increases by one size category when you reach 6th level (Large) and 14th level (Huge)."
                    ]
                },
                {
                    "name": "Animating Performance",
                    "source": "TCE",
                    "page": 27,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Creation",
                    "subclassSource": "TCE",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "{@i 6th-level College of Creation feature}",
                        "As an action, you can animate one Large or smaller nonmagical item within 30 feet of you that isn't being worn or carried. The animate item uses the {@creature Dancing Item|TCE} stat block, which uses your proficiency bonus (PB). The item is friendly to you and your companions and obeys your commands. It lives for 1 hour, until it is reduced to 0 hit points, or until you die.",
                        "In combat, the item shares your initiative count, but it takes its turn immediately after yours. It can move and use its reaction on its own, but the only action it takes on its turn is the {@action Dodge} action, unless you take a bonus action on your turn to command it to take another action. That action can be one in its stat block or some other action. If you are {@condition incapacitated}, the item can take any action of its choice, not just {@action Dodge}.",
                        "When you use your Bardic Inspiration feature, you can command the item as part of the same bonus action you use for Bardic Inspiration.",
                        "Once you animate an item with this feature, you can't do so again until you finish a long rest, unless you expend a spell slot of 3rd level or higher to use this feature again. You can have only one item animated by this feature at a time; if you use this action and already have a {@creature dancing item|TCE} from this feature, the first one immediately becomes inanimate."
                    ]
                },
                {
                    "name": "Creative Crescendo",
                    "source": "TCE",
                    "page": 27,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Creation",
                    "subclassSource": "TCE",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "{@i 14th-level College of Creation feature}",
                        "When you use your Performance of Creation feature, you can create more than one item at once. The number of items equals your Charisma modifier (minimum of two items). If you create an item that would exceed that number, you choose which of the previously created items disappears. Only one of these items can be of the maximum size you can create; the rest must be Small or Tiny.",
                        "You are no longer limited by gp value when creating items with Performance of Creation."
                    ]
                },
                {
                    "name": "College of Eloquence",
                    "source": "TCE",
                    "page": 29,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Eloquence",
                    "subclassSource": "TCE",
                    "level": 3,
                    "entries": [
                        "Adherents of the College of Eloquence master the art of oratory. Persuasion is regarded as a high art, and a well-reasoned, well-spoken argument often proves more persuasive than facts. These bards wield a blend of logic and theatrical wordplay, winning over skeptics and detractors with logical arguments and plucking at heartstrings to appeal to the emotions of audiences.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Silver Tongue|Bard||Eloquence|TCE|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Unsettling Words|Bard||Eloquence|TCE|3"
                        }
                    ]
                },
                {
                    "name": "Silver Tongue",
                    "source": "TCE",
                    "page": 29,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Eloquence",
                    "subclassSource": "TCE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "{@i 3rd-level College of Eloquence feature}",
                        "You are a master at saying the right thing at the right time. When you make a Charisma ({@skill Persuasion}) or Charisma ({@skill Deception}) check, you can treat a {@dice d20} roll of 9 or lower as a 10."
                    ]
                },
                {
                    "name": "Unsettling Words",
                    "source": "TCE",
                    "page": 29,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Eloquence",
                    "subclassSource": "TCE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "{@i 3rd-level College of Eloquence feature}",
                        "You can spin words laced with magic that unsettle a creature and cause it to doubt itself. As a bonus action, you can expend one use of your Bardic Inspiration and choose one creature you can see within 60 feet of you. Roll the Bardic Inspiration die. The creature must subtract the number rolled from the next saving throw it makes before the start of your next turn."
                    ]
                },
                {
                    "name": "Unfailing Inspiration",
                    "source": "TCE",
                    "page": 29,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Eloquence",
                    "subclassSource": "TCE",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "{@i 6th-level College of Eloquence feature}",
                        "Your inspiring words are so persuasive that others feel driven to succeed. When a creature adds one of your Bardic Inspiration dice to its ability check, attack roll, or saving throw and the roll fails, the creature can keep the Bardic Inspiration die."
                    ]
                },
                {
                    "name": "Universal Speech",
                    "source": "TCE",
                    "page": 29,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Eloquence",
                    "subclassSource": "TCE",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "{@i 6th-level College of Eloquence feature}",
                        "You have gained the ability to make your speech intelligible to any creature. As an action, choose one or more creatures within 60 feet of you, up to a number equal to your Charisma modifier (minimum of one creature). The chosen creatures can magically understand you, regardless of the language you speak, for 1 hour.",
                        "Once you use this feature, you can't use it again until you finish a long rest, unless you expend a spell slot to use it again."
                    ]
                },
                {
                    "name": "Infectious Inspiration",
                    "source": "TCE",
                    "page": 29,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Eloquence",
                    "subclassSource": "TCE",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "{@i 14th-level College of Eloquence feature}",
                        "When you successfully inspire someone, the power of your eloquence can now spread to someone else. When a creature within 60 feet of you adds one of your Bardic Inspiration dice to its ability check, attack roll, or saving throw and the roll succeeds, you can use your reaction to encourage a different creature (other than yourself) that can hear you within 60 feet of you, giving it a Bardic Inspiration die without expending any of your Bardic Inspiration uses.",
                        "You can use this reaction a number of times equal to your Charisma modifier (minimum of once), and you regain all expended uses when you finish a long rest."
                    ]
                },
                {
                    "name": "College of Tragedy",
                    "source": "TDCSR",
                    "page": 167,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Tragedy",
                    "subclassSource": "TDCSR",
                    "level": 3,
                    "entries": [
                        "Not all grand stories conclude in triumphant victory. Many tales end with death and despair, and bards of the College of Tragedy know that sorrow and pathos are emotions just as potent as joy and delight. These bards specialize in the power of tragic storytelling, weaving words and spells together to dramatic and devastating effect.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Poetry in Misery|Bard|PHB|Tragedy|TDCSR|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Sorrowful Fate|Bard|PHB|Tragedy|TDCSR|3"
                        }
                    ]
                },
                {
                    "name": "Poetry in Misery",
                    "source": "TDCSR",
                    "page": 167,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Tragedy",
                    "subclassSource": "TDCSR",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "When you join the College of Tragedy at 3rd level, you learn to harness the beauty in failure, finding inspiration in even the direst twists of fate. Whenever you or an ally within 30 feet of you rolls a 1 on the {@dice d20} for an attack roll, an ability check, or a {@quickref saving throws|PHB|2|1|saving throw}, you can use your reaction to soliloquize and regain one expended use of your Bardic Inspiration feature."
                    ]
                },
                {
                    "name": "Sorrowful Fate",
                    "source": "TDCSR",
                    "page": 167,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Tragedy",
                    "subclassSource": "TDCSR",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "Starting at 3rd level, you exploit a foe's peril to instill deep feelings of sorrow and doom. When you or an ally you can see forces a creature to make a {@quickref saving throws|PHB|2|1|saving throw}, you can expend one use of your Bardic Inspiration to change the type of {@quickref saving throws|PHB|2|1|saving throw} to a Charisma save instead.",
                        "If the target fails this save, roll a Bardic Inspiration die. The target takes psychic damage equal to the result, and is plagued with regret for 1 minute. If the target is reduced to 0 hit points during this time and can speak, they are magically compelled to utter darkly poetic final words before succumbing to their injuries.",
                        "Once you use this feature, you can't use it again until you finish a {@quickref resting|PHB|2|0|short or long rest}."
                    ]
                },
                {
                    "name": "Impending Misfortune",
                    "source": "TDCSR",
                    "page": 167,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Tragedy",
                    "subclassSource": "TDCSR",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "Also at 6th level, your words can twist the power of fate to create triumph from the promise of future despair. When you make an attack roll or a {@quickref saving throws|PHB|2|1|saving throw}, you can gain a +10 bonus to the roll, but the next attack roll or {@quickref saving throws|PHB|2|1|saving throw} you make takes a \u221210 penalty. If not used, this penalty disappears when you finish a {@quickref resting|PHB|2|0|short or long rest}.",
                        "You can't use this feature again until you finish a {@quickref resting|PHB|2|0|short or long rest}, or until you are reduced to 0 hit points."
                    ]
                },
                {
                    "name": "Tale of Hubris",
                    "source": "TDCSR",
                    "page": 167,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Tragedy",
                    "subclassSource": "TDCSR",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "At 6th level, you learn to weave a magical narrative that draws out the fatal arrogance of your foes. When a creature scores a critical hit against you or an ally within 60 feet of you that you can see, you can use your reaction and expend one use of your Bardic Inspiration to target the attacking creature and evoke the story of their downfall. For 1 minute or until the target suffers a critical hit, any weapon attack against the target scores a critical hit on a roll of 18\u201320."
                    ]
                },
                {
                    "name": "Nimbus of Pathos",
                    "source": "TDCSR",
                    "page": 167,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Tragedy",
                    "subclassSource": "TDCSR",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "Upon reaching 14th level, you can touch a willing creature as an action and empower it with tragic heroism. For 1 minute, the creature is surrounded by mournful music and ghostly singing, granting it the following benefits and drawbacks:",
                        {
                            "type": "list",
                            "items": [
                                "The creature has a +4 bonus to AC.",
                                "It has {@quickref Advantage and Disadvantage|PHB|2|0|advantage} on attack rolls and {@quickref saving throws|PHB|2|1}.",
                                "When the creature hits a target with a weapon attack or spell attack, that target takes an extra {@damage 1d10} radiant damage.",
                                "Any weapon attack against the creature scores a critical hit on a roll of 18\u201320."
                            ]
                        },
                        "When this effect ends, the creature immediately drops to 0 hit points and is dying. Once you use this feature, you can't use it again until you finish a {@quickref resting|PHB|2|0|long rest}."
                    ]
                },
                {
                    "name": "Tale of Hubris (14th Level)",
                    "source": "TDCSR",
                    "page": 167,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Tragedy",
                    "subclassSource": "TDCSR",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "At 14th level, the critical hit range of this feature increases to 17\u201320."
                    ]
                },
                {
                    "name": "College of Spirits",
                    "source": "VRGR",
                    "page": 28,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Spirits",
                    "subclassSource": "VRGR",
                    "level": 3,
                    "entries": [
                        "Bards of the College of Spirits seek tales with inherent power\u2014be they legends, histories, or fictions\u2014and bring their subjects to life. Using occult trappings, these bards conjure spiritual embodiments of powerful forces to change the world once more. Such spirits are capricious, though, and what a bard summons isn't always entirely under their control.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Guiding Whispers|Bard||Spirits|VRGR|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Spiritual Focus|Bard||Spirits|VRGR|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Tales from Beyond|Bard||Spirits|VRGR|3"
                        }
                    ]
                },
                {
                    "name": "Guiding Whispers",
                    "source": "VRGR",
                    "page": 28,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Spirits",
                    "subclassSource": "VRGR",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "{@i 3rd-level College of Spirits feature}",
                        "You can reach out to spirits to guide you and others. You learn the {@spell guidance} cantrip, which doesn't count against the number of bard cantrips you know. For you, it has a range of 60 feet when you cast it."
                    ]
                },
                {
                    "name": "Spiritual Focus",
                    "source": "VRGR",
                    "page": 28,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Spirits",
                    "subclassSource": "VRGR",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "{@i 3rd-level College of Spirits feature}",
                        "You employ tools that aid you in channeling spirits, be they historical figures or fictional archetypes. You can use the following objects as a spellcasting focus for your bard spells: a candle, crystal ball, skull, spirit board, or {@deck tarokka deck|CoS}.",
                        "Starting at 6th level, when you cast a bard spell that deals damage or restores hit points through the Spiritual Focus, roll a {@dice d6}, and you gain a bonus to one damage or healing roll of the spell equal to the number rolled."
                    ]
                },
                {
                    "name": "Tales from Beyond",
                    "source": "VRGR",
                    "page": 28,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Spirits",
                    "subclassSource": "VRGR",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "{@i 3rd-level College of Spirits feature}",
                        "You reach out to spirits who tell their tales through you. While you are holding your Spiritual Focus, you can use a bonus action to expend one use of your Bardic Inspiration and roll on the Spirit Tales table using your Bardic Inspiration die to determine the tale the spirits direct you to tell. You retain the tale in mind until you bestow the tale's effect or you finish a short or long rest.",
                        "You can use an action to choose one creature you can see within 30 feet of you (this can be you) to be the target of the tale's effect. Once you do so, you can't bestow the tale's effect again until you roll it again.",
                        "You can retain only one of these tales in mind at a time, and rolling on the Spirit Tales table immediately ends the effect of the previous tale.",
                        "If the tale requires a saving throw, the DC equals your spell save DC.",
                        {
                            "type": "table",
                            "caption": "Spirit Tales",
                            "colLabels": [
                                "Bardic Insp. Die",
                                "Tale Told Through You"
                            ],
                            "colStyles": [
                                "col-2 text-center",
                                "col-10"
                            ],
                            "rows": [
                                [
                                    "1",
                                    "Tale of the Clever Animal. For the next 10 minutes, whenever the target makes an Intelligence, a Wisdom, or a Charisma check, the target can roll an extra die immediately after rolling the {@dice d20} and add the extra die's number to the check. The extra die is the same type as your Bardic Inspiration die."
                                ],
                                [
                                    "2",
                                    "Tale of the Renowned Duelist. You make a melee spell attack against the target. On a hit, the target takes force damage equal to two rolls of your Bardic Inspiration die + your Charisma modifier."
                                ],
                                [
                                    "3",
                                    "Tale of the Beloved Friends. The target and another creature of its choice it can see within 5 feet of it gains temporary hit points equal to a roll of your Bardic Inspiration die + your Charisma modifier."
                                ],
                                [
                                    "4",
                                    "Tale of the Runaway. The target can immediately use its reaction to teleport up to 30 feet to an unoccupied space it can see. When the target teleports, it can choose a number of creatures it can see within 30 feet of it up to your Charisma modifier (minimum of 0) to immediately use the same reaction."
                                ],
                                [
                                    "5",
                                    "Tale of the Avenger. For 1 minute, any creature that hits the target with a melee attack takes force damage equal to a roll of your Bardic Inspiration die."
                                ],
                                [
                                    "6",
                                    "Tale of the Traveler. The target gains temporary hit points equal to a roll of your Bardic Inspiration die + your bard level. While it has these temporary hit points, the target's walking speed increases by 10 feet and it gains a +1 bonus to its AC."
                                ],
                                [
                                    "7",
                                    "Tale of the Beguiler. The target must succeed on a Wisdom saving throw or take psychic damage equal to two rolls of your Bardic Inspiration die, and the target is {@condition incapacitated} until the end of its next turn."
                                ],
                                [
                                    "8",
                                    "Tale of the Phantom. The target becomes {@condition invisible} until the end of its next turn or until it hits a creature with an attack. If the target hits a creature with an attack during this invisibility, the creature it hits takes necrotic damage equal to a roll of your Bardic Inspiration die and is {@condition frightened} of the target until the end of the {@condition frightened} creature's next turn."
                                ],
                                [
                                    "9",
                                    "Tale of the Brute. Each creature of the target's choice it can see within 30 feet of it must make a Strength saving throw. On a failed save, a creature takes thunder damage equal to three rolls of your Bardic Inspiration die and is knocked {@condition prone}. A creature that succeeds on its saving throw takes half as much damage and isn't knocked {@condition prone}."
                                ],
                                [
                                    "10",
                                    "Tale of the Dragon. The target spews fire from the mouth in a 30-foot cone. Each creature in that area must make a Dexterity saving throw, taking fire damage equal to four rolls of your Bardic Inspiration die on a failed save, or half as much damage on a successful one."
                                ],
                                [
                                    "11",
                                    "Tale of the Angel. The target regains hit points equal to two rolls of your Bardic Inspiration die + your Charisma modifier, and you end one condition from the following list affecting the target: {@condition blinded}, {@condition deafened}, {@condition paralyzed}, {@condition petrified}, or {@condition poisoned}."
                                ],
                                [
                                    "12",
                                    "Tale of the Mind-Bender. You evoke an incomprehensible fable from an otherworldly being. The target must succeed on an Intelligence saving throw or take psychic damage equal to three rolls of your Bardic Inspiration die and be {@condition stunned} until the end of its next turn."
                                ]
                            ]
                        }
                    ]
                },
                {
                    "name": "Spirit Session",
                    "source": "VRGR",
                    "page": 28,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Spirits",
                    "subclassSource": "VRGR",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "{@i 6th-level College of Spirits feature}",
                        "Spirits provide you with supernatural insights. You can conduct an hour-long ritual channeling spirits (which can be done during a short or long rest) using your Spiritual Focus. You can conduct the ritual with a number of willing creatures equal to your proficiency bonus (including yourself). At the end of the ritual, you temporarily learn {@filter one spell of your choice from any class|spells|school=d;n|level=0;1;2;3;4;5;6}.",
                        "The spell you choose must be of a level equal to the number of creatures that conducted the ritual or less, the spell must be of a level you can cast, and it must be in the school of divination or necromancy. The chosen spell counts as a bard spell for you but doesn't count against the number of bard spells you know.",
                        "Once you perform the ritual, you can't do so again until you start a long rest, and you know the chosen spell until you start a long rest."
                    ]
                },
                {
                    "name": "Mystical Connection",
                    "source": "VRGR",
                    "page": 28,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Spirits",
                    "subclassSource": "VRGR",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "{@i 14th-level College of Spirits feature}",
                        "You now have the ability to nudge the spirits of Tales from Beyond toward certain tales. Whenever you roll on the Spirit Tales table, you can roll the die twice and choose which of the two effects to bestow. If you roll the same number on both dice, you can ignore the number and choose any effect on the table.",
                        {
                            "type": "inset",
                            "name": "Spirit Tales",
                            "entries": [
                                "Storytellers, like bards of the College of Spirits, often give voice to tales inspired by some greater theme or body of work. When determining what stories you tell, consider what unites them. Do they all feature characters from a specific group, like archetypes from the {@deck tarokka deck|CoS}, figures from constellations, childhood imaginary friends, or characters in a particular storybook? Or are your inspirations more general, incorporating historic champions, mythological heroes, or urban legends? Use the tales you tell to define your niche as a storytelling adventurer."
                            ]
                        }
                    ]
                },
                {
                    "name": "College of Glamour",
                    "source": "XGE",
                    "page": 14,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Glamour",
                    "subclassSource": "XGE",
                    "level": 3,
                    "entries": [
                        "The College of Glamour is the home of bards who mastered their craft in the vibrant realm of the Feywild or under the tutelage of someone who dwelled there. Tutored by satyrs, eladrin, and other fey, these bards learn to use their magic to delight and captivate others.",
                        "The bards of this college are regarded with a mixture of awe and fear. Their performances are the stuff of legend. These bards are so eloquent that a speech or song that one of them performs can cause captors to release the bard unharmed and can lull a furious dragon into complacency. The same magic that allows them to quell beasts can also bend minds. Villainous bards of this college can leech off a community for weeks, misusing their magic to turn their hosts into thralls. Heroic bards of this college instead use this power to gladden the downtrodden and undermine oppressors.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Mantle of Inspiration|Bard||Glamour|XGE|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Enthralling Performance|Bard||Glamour|XGE|3"
                        }
                    ]
                },
                {
                    "name": "Enthralling Performance",
                    "source": "XGE",
                    "page": 14,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Glamour",
                    "subclassSource": "XGE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "Starting at 3rd level, you can charge your performance with seductive, fey magic.",
                        "If you perform for at least 1 minute, you can attempt to inspire wonder in your audience by singing, reciting a poem, or dancing. At the end of the performance, choose a number of humanoids within 60 feet of you who watched and listened to all of it, up to a number equal to your Charisma modifier (minimum of one). Each target must succeed on a Wisdom saving throw against your spell save DC or be {@condition charmed} by you. While {@condition charmed} in this way, the target idolizes you, it speaks glowingly of you to anyone who talks to it, and it hinders anyone who opposes you, although it avoids violence unless it was already inclined to fight on your behalf. This effect ends on a target after 1 hour, if it takes any damage, if you attack it, or if it witnesses you attacking or damaging any of its allies.",
                        "If a target succeeds on its saving throw, the target has no hint that you tried to charm it.",
                        "Once you use this feature, you can't use it again until you finish a short or long rest."
                    ]
                },
                {
                    "name": "Mantle of Inspiration",
                    "source": "XGE",
                    "page": 14,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Glamour",
                    "subclassSource": "XGE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "When you join the College of Glamour at 3rd level, you gain the ability to weave a song of fey magic that imbues your allies with vigor and speed.",
                        "As a bonus action, you can expend one use of your Bardic Inspiration to grant yourself a wondrous appearance. When you do so, choose a number of creatures you can see and that can see you within 60 feet of you, up to a number equal to your Charisma modifier (minimum of one). Each of them gains 5 temporary hit points. When a creature gains these temporary hit points, it can immediately use its reaction to move up to its speed, without provoking opportunity attacks.",
                        "The number of temporary hit points increases when you reach certain levels in this class, increasing to 8 at 5th level, 11 at 10th level, and 14 at 15th level."
                    ]
                },
                {
                    "name": "Mantle of Majesty",
                    "source": "XGE",
                    "page": 14,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Glamour",
                    "subclassSource": "XGE",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "At 6th level, you gain the ability to cloak yourself in a fey magic that makes others want to serve you. As a bonus action, you cast {@spell command}, without expending a spell slot, and you take on an appearance of unearthly beauty for 1 minute or until your {@status concentration} ends (as if you were {@status concentration||concentrating} on a spell). During this time, you can cast {@spell command} as a bonus action on each of your turns, without expending a spell slot.",
                        "Any creature {@condition charmed} by you automatically fails its saving throw against the {@spell command} you cast with this feature.",
                        "Once you use this feature, you can't use it again until you finish a long rest."
                    ]
                },
                {
                    "name": "Unbreakable Majesty",
                    "source": "XGE",
                    "page": 14,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Glamour",
                    "subclassSource": "XGE",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "At 14th level, your appearance permanently gains an otherworldly aspect that makes you look more lovely and fierce.",
                        "In addition, as a bonus action, you can assume a magically majestic presence for 1 minute or until you are {@condition incapacitated}. For the duration, whenever any creature tries to attack you for the first time on a turn, the attacker must make a Charisma saving throw against your spell save DC. On a failed save, it can't attack you on this turn, and it must choose a new target for its attack or the attack is wasted. On a successful save, it can attack you on this turn, but it has disadvantage on any saving throw it makes against your spells on your next turn.",
                        "Once you assume this majestic presence, you can't do so again until you finish a short or long rest."
                    ]
                },
                {
                    "name": "College of Swords",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 3,
                    "entries": [
                        "Bards of the College of Swords are called blades, and they entertain through daring feats of weapon prowess. Blades perform stunts such as sword swallowing, knife throwing and juggling, and mock combats. Though they use their weapons to entertain, they are also highly trained and skilled warriors in their own right.",
                        "Their talent with weapons inspires many blades to lead double lives. One blade might use a circus troupe as cover for nefarious deeds such as assassination, robbery, and blackmail. Other blades strike at the wicked, bringing justice to bear against the cruel and powerful. Most troupes are happy to accept a blade's talent for the excitement it adds to a performance, but few entertainers fully trust a blade in their ranks.",
                        "Blades who abandon their lives as entertainers have often run into trouble that makes maintaining their secret activities impossible. A blade caught stealing or engaging in vigilante justice is too great a liability for most troupes. With their weapon skills and magic, these blades either take up work as enforcers for thieves' guilds or strike out on their own as adventurers.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Bonus Proficiencies|Bard||Swords|XGE|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Fighting Style|Bard||Swords|XGE|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Blade Flourish|Bard||Swords|XGE|3"
                        }
                    ]
                },
                {
                    "name": "Blade Flourish",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "At 3rd level, you learn to perform impressive displays of martial prowess and speed.",
                        "Whenever you take the {@action Attack} action on your turn, your walking speed increases by 10 feet until the end of the turn, and if a weapon attack that you make as part of this action hits a creature, you can use one of the following Blade Flourish options of your choice. You can use only one Blade Flourish option per turn.",
                        {
                            "type": "options",
                            "entries": [
                                {
                                    "type": "refSubclassFeature",
                                    "subclassFeature": "Defensive Flourish|Bard|XGE|Swords|XGE|3"
                                },
                                {
                                    "type": "refSubclassFeature",
                                    "subclassFeature": "Slashing Flourish|Bard|XGE|Swords|XGE|3"
                                },
                                {
                                    "type": "refSubclassFeature",
                                    "subclassFeature": "Mobile Flourish|Bard|XGE|Swords|XGE|3"
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Bonus Proficiencies",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "When you join the College of Swords at 3rd level, you gain proficiency with medium armor and the {@item scimitar|phb}.",
                        "If you're proficient with a simple or martial melee weapon, you can use it as a spellcasting focus for your bard spells."
                    ]
                },
                {
                    "name": "Fighting Style",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "At 3rd level, you adopt a style of fighting as your specialty. Choose one of the following options. You can't take a Fighting Style option more than once, even if something in the game lets you choose again.",
                        {
                            "type": "options",
                            "count": 1,
                            "entries": [
                                {
                                    "type": "refOptionalfeature",
                                    "optionalfeature": "Dueling"
                                },
                                {
                                    "type": "refOptionalfeature",
                                    "optionalfeature": "Two-Weapon Fighting"
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Extra Attack",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "Starting at 6th level, you can attack twice, instead of once, whenever you take the {@action Attack} action on your turn."
                    ]
                },
                {
                    "name": "Master's Flourish",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "Starting at 14th level, whenever you use a Blade Flourish option, you can roll a {@dice d6} and use it instead of expending a Bardic Inspiration die."
                    ]
                },
                {
                    "name": "College of Whispers",
                    "source": "XGE",
                    "page": 16,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Whispers",
                    "subclassSource": "XGE",
                    "level": 3,
                    "entries": [
                        "Most folk are happy to welcome a bard into their midst. Bards of the College of Whispers use this to their advantage. They appear to be like other bards, sharing news, singing songs, and telling tales to the audiences they gather. In truth, the College of Whispers teaches its students that they are wolves among sheep. These bards use their knowledge and magic to uncover secrets and turn them against others through extortion and threats.",
                        "Many other bards hate the College of Whispers, viewing it as a parasite that uses a bard's reputation to acquire wealth and power. For this reason, members of this college rarely reveal their true nature. They typically claim to follow some other college, or they keep their actual calling secret in order to infiltrate and exploit royal courts and other settings of power.",
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Psychic Blades|Bard||Whispers|XGE|3"
                        },
                        {
                            "type": "refSubclassFeature",
                            "subclassFeature": "Words of Terror|Bard||Whispers|XGE|3"
                        }
                    ]
                },
                {
                    "name": "Psychic Blades",
                    "source": "XGE",
                    "page": 16,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Whispers",
                    "subclassSource": "XGE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "When you join the College of Whispers at 3rd level, you gain the ability to make your weapon attacks magically toxic to a creature's mind.",
                        "When you hit a creature with a weapon attack, you can expend one use of your Bardic Inspiration to deal an extra {@damage 2d6} psychic damage to that target. You can do so only once per round on your turn.",
                        "The psychic damage increases when you reach certain levels in this class, increasing to {@dice 3d6} at 5th level, {@dice 5d6} at 10th level, and {@dice 8d6} at 15th level."
                    ]
                },
                {
                    "name": "Words of Terror",
                    "source": "XGE",
                    "page": 16,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Whispers",
                    "subclassSource": "XGE",
                    "level": 3,
                    "header": 1,
                    "entries": [
                        "At 3rd level, you learn to infuse innocent-seeming words with an insidious magic that can inspire terror.",
                        "If you speak to a humanoid alone for at least 1 minute, you can attempt to seed paranoia in its mind. At the end of the conversation, the target must succeed on a Wisdom saving throw against your spell save DC or be {@condition frightened} of you or another creature of your choice. The target is {@condition frightened} in this way for 1 hour, until it is attacked or damaged, or until it witnesses its allies being attacked or damaged.",
                        "If the target succeeds on its saving throw, the target has no hint that you tried to frighten it.",
                        "Once you use this feature, you can't use it again until you finish a short or long rest."
                    ]
                },
                {
                    "name": "Mantle of Whispers",
                    "source": "XGE",
                    "page": 16,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Whispers",
                    "subclassSource": "XGE",
                    "level": 6,
                    "header": 2,
                    "entries": [
                        "At 6th level, you gain the ability to adopt a humanoid's persona. When a humanoid dies within 30 feet of you, you can magically capture its shadow using your reaction. You retain this shadow until you use it or you finish a long rest.",
                        "You can use the shadow as an action. When you do so, it vanishes, magically transforming into a disguise that appears on you. You now look like the dead person, but healthy and alive. This disguise lasts for 1 hour or until you end it as a bonus action.",
                        "While you're in the disguise, you gain access to all information that the humanoid would freely share with a casual acquaintance. Such information includes general details on its background and personal life, but doesn't include secrets. The information is enough that you can pass yourself off as the person by drawing on its memories.",
                        "Another creature can see through this disguise by succeeding on a Wisdom ({@skill Insight}) check contested by your Charisma ({@skill Deception}) check. You gain a +5 bonus to your check.",
                        "Once you capture a shadow with this feature, you can't capture another one with it until you finish a short or long rest."
                    ]
                },
                {
                    "name": "Shadow Lore",
                    "source": "XGE",
                    "page": 16,
                    "className": "Bard",
                    "classSource": "PHB",
                    "subclassShortName": "Whispers",
                    "subclassSource": "XGE",
                    "level": 14,
                    "header": 2,
                    "entries": [
                        "At 14th level, you gain the ability to weave dark magic into your words and tap into a creature's deepest fears.",
                        "As an action, you magically whisper a phrase that only one creature of your choice within 30 feet of you can hear. The target must make a Wisdom saving throw against your spell save DC. It automatically succeeds if it doesn't share a language with you or if it can't hear you. On a successful saving throw, your whisper sounds like unintelligible mumbling and has no effect.",
                        "On a failed saving throw, the target is {@condition charmed} by you for the next 8 hours or until you or your allies attack it, damage it, or force it to make a saving throw. It interprets the whispers as a description of its most mortifying secret. You gain no knowledge of this secret, but the target is convinced you know it.",
                        "The {@condition charmed} creature obeys your commands for fear that you will reveal its secret. It won't risk its life for you or fight for you, unless it was already inclined to do so. It grants you favors and gifts it would offer to a close friend.",
                        "When the effect ends, the creature has no understanding of why it held you in such fear.",
                        "Once you use this feature, you can't use it again until you finish a long rest."
                    ]
                },
                {
                    "name": "Defensive Flourish",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "XGE",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 3,
                    "entries": [
                        "You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to the target you hit. The damage equals the number you roll on the Bardic Inspiration die. You also add the number rolled to your AC until the start of your next turn."
                    ]
                },
                {
                    "name": "Mobile Flourish",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "XGE",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 3,
                    "entries": [
                        "You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to the target you hit. The damage equals the number you roll on the Bardic Inspiration die. You can also push the target up to 5 feet away from you, plus a number of feet equal to the number you roll on that die. You can then immediately use your reaction to move up to your walking speed to an unoccupied space within 5 feet of the target."
                    ]
                },
                {
                    "name": "Slashing Flourish",
                    "source": "XGE",
                    "page": 15,
                    "className": "Bard",
                    "classSource": "XGE",
                    "subclassShortName": "Swords",
                    "subclassSource": "XGE",
                    "level": 3,
                    "entries": [
                        "You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to the target you hit and to any other creature of your choice that you can see within 5 feet of you. The damage equals the number you roll on the Bardic Inspiration die."
                    ]
                }
            ]
        }
        `;
        
        let data = {class: [], subclass:[], classFeature:[], subclassFeature:[]};
        let jsons = [class_barbarian, class_bard];
        for(let str of jsons){
            let parsed = JSON.parse(str);
            data.class = data.class.concat(parsed.class);
            data.subclass = data.subclass.concat(parsed.subclass);
            data.classFeature = data.classFeature.concat(parsed.classFeature);
            data.subclassFeature = data.subclassFeature.concat(parsed.subclassFeature);
        }
        return data;
    }
    static getClasses(){
        return ContentGetter._getBase().class;
    }
    static getSubclasses(){
        return ContentGetter._getBase().subclass;
    }
    static getFeaturesFromClass(cls){
        return this._getBase().classFeature.filter(f => f.className == cls.name && f.classSource == cls.source);
    }
    static getFeaturesFromSubclass(sc){
        return this._getBase().subclassFeature.filter(f =>
            f.className == sc.className &&
            f.classSource == sc.classSource &&
            f.subclassSource == sc.source &&
            f.subclassShortName == sc.shortName);
    }
    _cookData(){
        //Prep class feature info
        const isIgnoredLookup = {
            "elemental disciplines|monk||four elements||3":true,
            "fighting style|bard||swords|xge|3":true,
            "infusions known|artificer|tce|2":true,
            "maneuver options|fighter||battle master||3|tce":true,
            "maneuvers|fighter||battle master||3":true
        };
        const opts = {actor: this._actor, isIgnoredLookup: isIgnoredLookup};
        for(let j = 0; j < this._data.class.length; ++j)
        {
            let cls = this._data.class[j];
            //Make sure the classFeatures aren't just strings, look like this:
            //{classFeature: "string"}
            for(let i = 0; i < cls.classFeatures.length; ++i){
            let f = cls.classFeatures[i];
            if (typeof f !== "object") {cls.classFeatures[i] = {classFeature: f};}
            }
    
            //Now we need to flesh out some more data about the class features, using just the UID we can get a lot of such info.
            await (cls.classFeatures || []).pSerialAwaitMap(cf => CharacterImporter.api.util.apps.PageFilterClassesRaw.pInitClassFeatureLoadeds({...opts, classFeature: cf, className: cls.name}));
    
            if (cls.classFeatures) {cls.classFeatures = cls.classFeatures.filter(it => !it.isIgnored);}
            this._data.class[j] = cls;
    
            /* for (const sc of cls.subclasses || []) {
            await (sc.subclassFeatures || []).pSerialAwaitMap(scf => this.pInitSubclassFeatureLoadeds({...opts, subclassFeature: scf, className: cls.name, subclassName: sc.name}));
    
            if (sc.subclassFeatures) sc.subclassFeatures = sc.subclassFeatures.filter(it => !it.isIgnored);
        } */
        }
    }
}
//#endregion


const ABILITY_ABV_TO_FULL = {
    "STR" : "Strength",
    "DEX" : "Dexterity",
    "CON" : "Constitution",
    "INT" : "Intelligence",
    "WIS" : "Wisdom",
    "CHA" : "Charisma"
};
const SKILL_TO_ABILITY_ABV = {
    "ACROBATICS" : "DEX",
    "ANIMAL HANDLING" : "WIS",
    "ARCANA" : "INT",
    "ATHLETICS" : "STR",
    "DECEPTION" : "CHA",
    "HISTORY" : "INT",
    "INSIGHT" : "WIS",
    "INTIMIDATION" : "CHA",
    "INVESTIGATION" : "INT",
    "MEDICINE" : "WIS",
    "NATURE" : "INT",
    "PERCEPTION" : "WIS",
    "PERFORMANCE" : "CHA",
    "PERSUASION" : "CHA",
    "RELIGION" : "INT",
    "SLEIGHT OF HAND" : "DEX",
    "STEALTH" : "DEX",
    "SURVIVAL" : "WIS",
};
const SKILLS = [
    "ACROBATICS",
    "ARCANA",
    "ANIMAL HANDLING",
    "ATHLETICS",
    "DECEPTION",
    "HISTORY",
    "INSIGHT",
    "INTIMIDATION",
    "INVESTIGATION",
    "MEDICINE",
    "NATURE",
    "PERCEPTION",
    "PERFORMANCE",
    "PERSUASION",
    "RELIGION",
    "SLEIGHT OF HAND",
    "STEALTH",
    "SURVIVAL",
];

globalThis.Parser = {};

//#region SourceUtil
globalThis.SourceUtil = {
    ADV_BOOK_GROUPS: [{
        group: "core",
        displayName: "Core"
    }, {
        group: "supplement",
        displayName: "Supplements"
    }, {
        group: "setting",
        displayName: "Settings"
    }, {
        group: "setting-alt",
        displayName: "Additional Settings"
    }, {
        group: "supplement-alt",
        displayName: "Extras"
    }, {
        group: "prerelease",
        displayName: "Prerelease"
    }, {
        group: "homebrew",
        displayName: "Homebrew"
    }, {
        group: "screen",
        displayName: "Screens"
    }, {
        group: "recipe",
        displayName: "Recipes"
    }, {
        group: "other",
        displayName: "Miscellaneous"
    }, ],

    _subclassReprintLookup: {},
    async pInitSubclassReprintLookup() {
        SourceUtil._subclassReprintLookup = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/generated/gendata-subclass-lookup.json`);
    },

    isSubclassReprinted(className, classSource, subclassShortName, subclassSource) {
        const fromLookup = MiscUtil.get(SourceUtil._subclassReprintLookup, classSource, className, subclassSource, subclassShortName);
        return fromLookup ? fromLookup.isReprinted : false;
    },

    isSiteSource(source) {
        return !!Parser.SOURCE_JSON_TO_FULL[source];
    },

    isAdventure(source) {
        if (source instanceof FilterItem)
            source = source.item;
        return Parser.SOURCES_ADVENTURES.has(source);
    },

    isCoreOrSupplement(source) {
        if (source instanceof FilterItem)
            source = source.item;
        return Parser.SOURCES_CORE_SUPPLEMENTS.has(source);
    },

    isNonstandardSource(source) {
        if (source == null)
            return false;
        return ((typeof BrewUtil2 === "undefined" || !BrewUtil2.hasSourceJson(source)) && SourceUtil.isNonstandardSourceWotc(source)) || SourceUtil.isPrereleaseSource(source);
    },

    isPartneredSourceWotc(source) {
        if (source == null)
            return false;
        return Parser.SOURCES_PARTNERED_WOTC.has(source);
    },

    isPrereleaseSource(source) {
        if (source == null)
            return false;
        if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
            return true;
        return source.startsWith(Parser.SRC_UA_PREFIX) || source.startsWith(Parser.SRC_UA_ONE_PREFIX);
    },

    isNonstandardSourceWotc(source) {
        return SourceUtil.isPrereleaseSource(source) || source.startsWith(Parser.SRC_PS_PREFIX) || source.startsWith(Parser.SRC_AL_PREFIX) || source.startsWith(Parser.SRC_MCVX_PREFIX) || Parser.SOURCES_NON_STANDARD_WOTC.has(source);
    },

    FILTER_GROUP_STANDARD: 0,
    FILTER_GROUP_PARTNERED: 1,
    FILTER_GROUP_NON_STANDARD: 2,
    FILTER_GROUP_HOMEBREW: 3,

    getFilterGroup(source) {
        if (source instanceof FilterItem)
            source = source.item;
        if ((typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source)) || SourceUtil.isNonstandardSource(source))
            return SourceUtil.FILTER_GROUP_NON_STANDARD;
        if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
            return SourceUtil.FILTER_GROUP_HOMEBREW;
        if (SourceUtil.isPartneredSourceWotc(source))
            return SourceUtil.FILTER_GROUP_PARTNERED;
        return SourceUtil.FILTER_GROUP_STANDARD;
    },

    getAdventureBookSourceHref(source, page) {
        if (!source)
            return null;
        source = source.toLowerCase();

        let docPage, mappedSource;
        if (Parser.SOURCES_AVAILABLE_DOCS_BOOK[source]) {
            docPage = UrlUtil.PG_BOOK;
            mappedSource = Parser.SOURCES_AVAILABLE_DOCS_BOOK[source];
        } else if (Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[source]) {
            docPage = UrlUtil.PG_ADVENTURE;
            mappedSource = Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[source];
        }
        if (!docPage)
            return null;

        mappedSource = mappedSource.toLowerCase();

        return `${docPage}#${[mappedSource, page ? `page:${page}` : null].filter(Boolean).join(HASH_PART_SEP)}`;
    },

    getEntitySource(it) {
        return it.source || it.inherits?.source;
    },
};
//#endregion
//#region MiscUtil
globalThis.MiscUtil = {
    COLOR_HEALTHY: "#00bb20",
    COLOR_HURT: "#c5ca00",
    COLOR_BLOODIED: "#f7a100",
    COLOR_DEFEATED: "#cc0000",

    copy(obj, {isSafe=false, isPreserveUndefinedValueKeys=false}={}) {
        if (isSafe && obj === undefined)
            return undefined;
        return JSON.parse(JSON.stringify(obj));
    },

    copyFast(obj) {
        if ((typeof obj !== "object") || obj == null)
            return obj;

        if (obj instanceof Array)
            return obj.map(MiscUtil.copyFast);

        const cpy = {};
        for (const k of Object.keys(obj))
            cpy[k] = MiscUtil.copyFast(obj[k]);
        return cpy;
    },

    async pCopyTextToClipboard(text) {
        function doCompatibilityCopy() {
            const $iptTemp = $(`<textarea class="clp__wrp-temp"></textarea>`).appendTo(document.body).val(text).select();
            document.execCommand("Copy");
            $iptTemp.remove();
        }

        if (navigator && navigator.permissions) {
            try {
                const access = await navigator.permissions.query({
                    name: "clipboard-write"
                });
                if (access.state === "granted" || access.state === "prompt") {
                    await navigator.clipboard.writeText(text);
                } else
                    doCompatibilityCopy();
            } catch (e) {
                doCompatibilityCopy();
            }
        } else
            doCompatibilityCopy();
    },

    checkProperty(object, ...path) {
        for (let i = 0; i < path.length; ++i) {
            object = object[path[i]];
            if (object == null)
                return false;
        }
        return true;
    },

    get(object, ...path) {
        if (object == null)
            return null;
        for (let i = 0; i < path.length; ++i) {
            object = object[path[i]];
            if (object == null)
                return object;
        }
        return object;
    },

    set(object, ...pathAndVal) {
        if (object == null)
            return null;

        const val = pathAndVal.pop();
        if (!pathAndVal.length)
            return null;

        const len = pathAndVal.length;
        for (let i = 0; i < len; ++i) {
            const pathPart = pathAndVal[i];
            if (i === len - 1)
                object[pathPart] = val;
            else
                object = (object[pathPart] = object[pathPart] || {});
        }

        return val;
    },

    getOrSet(object, ...pathAndVal) {
        if (pathAndVal.length < 2)
            return null;
        const existing = MiscUtil.get(object, ...pathAndVal.slice(0, -1));
        if (existing != null)
            return existing;
        return MiscUtil.set(object, ...pathAndVal);
    },

    getThenSetCopy(object1, object2, ...path) {
        const val = MiscUtil.get(object1, ...path);
        return MiscUtil.set(object2, ...path, MiscUtil.copyFast(val, {
            isSafe: true
        }));
    },

    delete(object, ...path) {
        if (object == null)
            return object;
        for (let i = 0; i < path.length - 1; ++i) {
            object = object[path[i]];
            if (object == null)
                return object;
        }
        return delete object[path.last()];
    },

    deleteObjectPath(object, ...path) {
        const stack = [object];

        if (object == null)
            return object;
        for (let i = 0; i < path.length - 1; ++i) {
            object = object[path[i]];
            stack.push(object);
            if (object === undefined)
                return object;
        }
        const out = delete object[path.last()];

        for (let i = path.length - 1; i > 0; --i) {
            if (!Object.keys(stack[i]).length)
                delete stack[i - 1][path[i - 1]];
        }

        return out;
    },

    merge(obj1, obj2) {
        obj2 = MiscUtil.copyFast(obj2);

        Object.entries(obj2).forEach(([k,v])=>{
            if (obj1[k] == null) {
                obj1[k] = v;
                return;
            }

            if (typeof obj1[k] === "object" && typeof v === "object" && !(obj1[k]instanceof Array) && !(v instanceof Array)) {
                MiscUtil.merge(obj1[k], v);
                return;
            }

            obj1[k] = v;
        }
        );

        return obj1;
    },

    mix: (superclass)=>new MiscUtil._MixinBuilder(superclass),
    _MixinBuilder: function(superclass) {
        this.superclass = superclass;

        this.with = function(...mixins) {
            return mixins.reduce((c,mixin)=>mixin(c), this.superclass);
        }
        ;
    },

    clearSelection() {
        if (document.getSelection) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(document.createRange());
        } else if (window.getSelection) {
            if (window.getSelection().removeAllRanges) {
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(document.createRange());
            } else if (window.getSelection().empty) {
                window.getSelection().empty();
            }
        } else if (document.selection) {
            document.selection.empty();
        }
    },

    randomColor() {
        let r;
        let g;
        let b;
        const h = RollerUtil.randomise(30, 0) / 30;
        const i = ~~(h * 6);
        const f = h * 6 - i;
        const q = 1 - f;
        switch (i % 6) {
        case 0:
            r = 1;
            g = f;
            b = 0;
            break;
        case 1:
            r = q;
            g = 1;
            b = 0;
            break;
        case 2:
            r = 0;
            g = 1;
            b = f;
            break;
        case 3:
            r = 0;
            g = q;
            b = 1;
            break;
        case 4:
            r = f;
            g = 0;
            b = 1;
            break;
        case 5:
            r = 1;
            g = 0;
            b = q;
            break;
        }
        return `#${`00${(~~(r * 255)).toString(16)}`.slice(-2)}${`00${(~~(g * 255)).toString(16)}`.slice(-2)}${`00${(~~(b * 255)).toString(16)}`.slice(-2)}`;
    },

    invertColor(hex, opts) {
        opts = opts || {};

        hex = hex.slice(1);
        let r = parseInt(hex.slice(0, 2), 16);
        let g = parseInt(hex.slice(2, 4), 16);
        let b = parseInt(hex.slice(4, 6), 16);

        const isDark = (r * 0.299 + g * 0.587 + b * 0.114) > 186;
        if (opts.dark && opts.light)
            return isDark ? opts.dark : opts.light;
        else if (opts.bw)
            return isDark ? "#000000" : "#FFFFFF";

        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        return `#${[r, g, b].map(it=>it.padStart(2, "0")).join("")}`;
    },

    scrollPageTop() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    },

    expEval(str) {
        return new Function(`return ${str.replace(/[^-()\d/*+.]/g, "")}`)();
    },

    parseNumberRange(input, min=Number.MIN_SAFE_INTEGER, max=Number.MAX_SAFE_INTEGER) {
        if (!input || !input.trim())
            return null;

        const errInvalid = input=>{
            throw new Error(`Could not parse range input "${input}"`);
        }
        ;

        const errOutOfRange = ()=>{
            throw new Error(`Number was out of range! Range was ${min}-${max} (inclusive).`);
        }
        ;

        const isOutOfRange = (num)=>num < min || num > max;

        const addToRangeVal = (range,num)=>range.add(num);

        const addToRangeLoHi = (range,lo,hi)=>{
            for (let i = lo; i <= hi; ++i)
                range.add(i);
        }
        ;

        const clean = input.replace(/\s*/g, "");
        if (!/^((\d+-\d+|\d+),)*(\d+-\d+|\d+)$/.exec(clean))
            errInvalid();

        const parts = clean.split(",");
        const out = new Set();

        for (const part of parts) {
            if (part.includes("-")) {
                const spl = part.split("-");
                const numLo = Number(spl[0]);
                const numHi = Number(spl[1]);

                if (isNaN(numLo) || isNaN(numHi) || numLo === 0 || numHi === 0 || numLo > numHi)
                    errInvalid();

                if (isOutOfRange(numLo) || isOutOfRange(numHi))
                    errOutOfRange();

                if (numLo === numHi)
                    addToRangeVal(out, numLo);
                else
                    addToRangeLoHi(out, numLo, numHi);
                continue;
            }

            const num = Number(part);
            if (isNaN(num) || num === 0)
                errInvalid();

            if (isOutOfRange(num))
                errOutOfRange();
            addToRangeVal(out, num);
        }

        return out;
    },

    findCommonPrefix(strArr, {isRespectWordBoundaries}={}) {
        if (isRespectWordBoundaries) {
            return MiscUtil._findCommonPrefixSuffixWords({
                strArr
            });
        }

        let prefix = null;
        strArr.forEach(s=>{
            if (prefix == null) {
                prefix = s;
                return;
            }

            const minLen = Math.min(s.length, prefix.length);
            for (let i = 0; i < minLen; ++i) {
                const cp = prefix[i];
                const cs = s[i];
                if (cp !== cs) {
                    prefix = prefix.substring(0, i);
                    break;
                }
            }
        }
        );
        return prefix;
    },

    findCommonSuffix(strArr, {isRespectWordBoundaries}={}) {
        if (!isRespectWordBoundaries)
            throw new Error(`Unimplemented!`);

        return MiscUtil._findCommonPrefixSuffixWords({
            strArr,
            isSuffix: true
        });
    },

    _findCommonPrefixSuffixWords({strArr, isSuffix}) {
        let prefixTks = null;
        let lenMax = -1;

        strArr.map(str=>{
            lenMax = Math.max(lenMax, str.length);
            return str.split(" ");
        }
        ).forEach(tks=>{
            if (isSuffix)
                tks.reverse();

            if (prefixTks == null)
                return prefixTks = [...tks];

            const minLen = Math.min(tks.length, prefixTks.length);
            while (prefixTks.length > minLen)
                prefixTks.pop();

            for (let i = 0; i < minLen; ++i) {
                const cp = prefixTks[i];
                const cs = tks[i];
                if (cp !== cs) {
                    prefixTks = prefixTks.slice(0, i);
                    break;
                }
            }
        }
        );

        if (isSuffix)
            prefixTks.reverse();

        if (!prefixTks.length)
            return "";

        const out = prefixTks.join(" ");
        if (out.length === lenMax)
            return out;

        return isSuffix ? ` ${prefixTks.join(" ")}` : `${prefixTks.join(" ")} `;
    },

    calculateBlendedColor(fgHexTarget, fgOpacity, bgHex) {
        const fgDcTarget = CryptUtil.hex2Dec(fgHexTarget);
        const bgDc = CryptUtil.hex2Dec(bgHex);
        return ((fgDcTarget - ((1 - fgOpacity) * bgDc)) / fgOpacity).toString(16);
    },

    debounce(func, wait, options) {
        let lastArgs;
        let lastThis;
        let maxWait;
        let result;
        let timerId;
        let lastCallTime;
        let lastInvokeTime = 0;
        let leading = false;
        let maxing = false;
        let trailing = true;

        wait = Number(wait) || 0;
        if (typeof options === "object") {
            leading = !!options.leading;
            maxing = "maxWait"in options;
            maxWait = maxing ? Math.max(Number(options.maxWait) || 0, wait) : maxWait;
            trailing = "trailing"in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
            let args = lastArgs;
            let thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function leadingEdge(time) {
            lastInvokeTime = time;
            timerId = setTimeout(timerExpired, wait);
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
            let timeSinceLastCall = time - lastCallTime;
            let timeSinceLastInvoke = time - lastInvokeTime;
            let result = wait - timeSinceLastCall;
            return maxing ? Math.min(result, maxWait - timeSinceLastInvoke) : result;
        }

        function shouldInvoke(time) {
            let timeSinceLastCall = time - lastCallTime;
            let timeSinceLastInvoke = time - lastInvokeTime;

            return (lastCallTime === undefined || (timeSinceLastCall >= wait) || (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
            const time = Date.now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timerId = undefined;

            if (trailing && lastArgs)
                return invokeFunc(time);
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel() {
            if (timerId !== undefined)
                clearTimeout(timerId);
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
            return timerId === undefined ? result : trailingEdge(Date.now());
        }

        function debounced() {
            let time = Date.now();
            let isInvoking = shouldInvoke(time);
            lastArgs = arguments;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking) {
                if (timerId === undefined)
                    return leadingEdge(lastCallTime);
                if (maxing) {
                    timerId = setTimeout(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined)
                timerId = setTimeout(timerExpired, wait);
            return result;
        }

        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
    },

    throttle(func, wait, options) {
        let leading = true;
        let trailing = true;

        if (typeof options === "object") {
            leading = "leading"in options ? !!options.leading : leading;
            trailing = "trailing"in options ? !!options.trailing : trailing;
        }

        return this.debounce(func, wait, {
            leading,
            maxWait: wait,
            trailing
        });
    },

    pDelay(msecs, resolveAs) {
        return new Promise(resolve=>setTimeout(()=>resolve(resolveAs), msecs));
    },

    GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST: new Set(["caption", "type", "colLabels", "colLabelGroups", "name", "colStyles", "style", "shortName", "subclassShortName", "id", "path"]),

    getWalker(opts) {
        opts = opts || {};

        if (opts.isBreakOnReturn && !opts.isNoModification)
            throw new Error(`"isBreakOnReturn" may only be used in "isNoModification" mode!`);

        const keyBlocklist = opts.keyBlocklist || new Set();

        const getMappedPrimitive = (obj,primitiveHandlers,lastKey,stack,prop,propPre,propPost)=>{
            if (primitiveHandlers[propPre])
                MiscUtil._getWalker_runHandlers({
                    handlers: primitiveHandlers[propPre],
                    obj,
                    lastKey,
                    stack
                });
            if (primitiveHandlers[prop]) {
                const out = MiscUtil._getWalker_applyHandlers({
                    opts,
                    handlers: primitiveHandlers[prop],
                    obj,
                    lastKey,
                    stack
                });
                if (out === VeCt.SYM_WALKER_BREAK)
                    return out;
                if (!opts.isNoModification)
                    obj = out;
            }
            if (primitiveHandlers[propPost])
                MiscUtil._getWalker_runHandlers({
                    handlers: primitiveHandlers[propPost],
                    obj,
                    lastKey,
                    stack
                });
            return obj;
        }
        ;

        const doObjectRecurse = (obj,primitiveHandlers,stack)=>{
            for (const k of Object.keys(obj)) {
                if (keyBlocklist.has(k))
                    continue;

                const out = fn(obj[k], primitiveHandlers, k, stack);
                if (out === VeCt.SYM_WALKER_BREAK)
                    return VeCt.SYM_WALKER_BREAK;
                if (!opts.isNoModification)
                    obj[k] = out;
            }
        }
        ;

        const fn = (obj,primitiveHandlers,lastKey,stack)=>{
            if (obj === null)
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "null", "preNull", "postNull");

            switch (typeof obj) {
            case "undefined":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "undefined", "preUndefined", "postUndefined");
            case "boolean":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "boolean", "preBoolean", "postBoolean");
            case "number":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "number", "preNumber", "postNumber");
            case "string":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "string", "preString", "postString");
            case "object":
                {
                    if (obj instanceof Array) {
                        if (primitiveHandlers.preArray)
                            MiscUtil._getWalker_runHandlers({
                                handlers: primitiveHandlers.preArray,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            const out = new Array(obj.length);
                            for (let i = 0, len = out.length; i < len; ++i) {
                                out[i] = fn(obj[i], primitiveHandlers, lastKey, stack);
                                if (out[i] === VeCt.SYM_WALKER_BREAK)
                                    return out[i];
                            }
                            if (!opts.isNoModification)
                                obj = out;
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.array) {
                                const out = MiscUtil._getWalker_applyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (out === VeCt.SYM_WALKER_BREAK)
                                    return out;
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.array) {
                                const out = MiscUtil._getWalker_applyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (out === VeCt.SYM_WALKER_BREAK)
                                    return out;
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj != null) {
                                const out = new Array(obj.length);
                                for (let i = 0, len = out.length; i < len; ++i) {
                                    if (stack)
                                        stack.push(obj);
                                    out[i] = fn(obj[i], primitiveHandlers, lastKey, stack);
                                    if (stack)
                                        stack.pop();
                                    if (out[i] === VeCt.SYM_WALKER_BREAK)
                                        return out[i];
                                }
                                if (!opts.isNoModification)
                                    obj = out;
                            } else {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        }
                        if (primitiveHandlers.postArray)
                            MiscUtil._getWalker_runHandlers({
                                handlers: primitiveHandlers.postArray,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    }

                    if (primitiveHandlers.preObject)
                        MiscUtil._getWalker_runHandlers({
                            handlers: primitiveHandlers.preObject,
                            obj,
                            lastKey,
                            stack
                        });
                    if (opts.isDepthFirst) {
                        if (stack)
                            stack.push(obj);
                        const flag = doObjectRecurse(obj, primitiveHandlers, stack);
                        if (stack)
                            stack.pop();
                        if (flag === VeCt.SYM_WALKER_BREAK)
                            return flag;

                        if (primitiveHandlers.object) {
                            const out = MiscUtil._getWalker_applyHandlers({
                                opts,
                                handlers: primitiveHandlers.object,
                                obj,
                                lastKey,
                                stack
                            });
                            if (out === VeCt.SYM_WALKER_BREAK)
                                return out;
                            if (!opts.isNoModification)
                                obj = out;
                        }
                        if (obj == null) {
                            if (!opts.isAllowDeleteObjects)
                                throw new Error(`Object handler(s) returned null!`);
                        }
                    } else {
                        if (primitiveHandlers.object) {
                            const out = MiscUtil._getWalker_applyHandlers({
                                opts,
                                handlers: primitiveHandlers.object,
                                obj,
                                lastKey,
                                stack
                            });
                            if (out === VeCt.SYM_WALKER_BREAK)
                                return out;
                            if (!opts.isNoModification)
                                obj = out;
                        }
                        if (obj == null) {
                            if (!opts.isAllowDeleteObjects)
                                throw new Error(`Object handler(s) returned null!`);
                        } else {
                            if (stack)
                                stack.push(obj);
                            const flag = doObjectRecurse(obj, primitiveHandlers, stack);
                            if (stack)
                                stack.pop();
                            if (flag === VeCt.SYM_WALKER_BREAK)
                                return flag;
                        }
                    }
                    if (primitiveHandlers.postObject)
                        MiscUtil._getWalker_runHandlers({
                            handlers: primitiveHandlers.postObject,
                            obj,
                            lastKey,
                            stack
                        });
                    return obj;
                }
            default:
                throw new Error(`Unhandled type "${typeof obj}"`);
            }
        }
        ;

        return {
            walk: fn
        };
    },

    _getWalker_applyHandlers({opts, handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        const didBreak = handlers.some(h=>{
            const out = h(obj, lastKey, stack);
            if (opts.isBreakOnReturn && out)
                return true;
            if (!opts.isNoModification)
                obj = out;
        }
        );
        if (didBreak)
            return VeCt.SYM_WALKER_BREAK;
        return obj;
    },

    _getWalker_runHandlers({handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        handlers.forEach(h=>h(obj, lastKey, stack));
    },

    getAsyncWalker(opts) {
        opts = opts || {};
        const keyBlocklist = opts.keyBlocklist || new Set();

        const pFn = async(obj,primitiveHandlers,lastKey,stack)=>{
            if (obj == null) {
                if (primitiveHandlers.null)
                    return MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.null,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            }

            const pDoObjectRecurse = async()=>{
                await Object.keys(obj).pSerialAwaitMap(async k=>{
                    const v = obj[k];
                    if (keyBlocklist.has(k))
                        return;
                    const out = await pFn(v, primitiveHandlers, k, stack);
                    if (!opts.isNoModification)
                        obj[k] = out;
                }
                );
            }
            ;

            const to = typeof obj;
            switch (to) {
            case undefined:
                if (primitiveHandlers.preUndefined)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preUndefined,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.undefined) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.undefined,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postUndefined)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postUndefined,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "boolean":
                if (primitiveHandlers.preBoolean)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preBoolean,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.boolean) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.boolean,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postBoolean)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postBoolean,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "number":
                if (primitiveHandlers.preNumber)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preNumber,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.number) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.number,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postNumber)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postNumber,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "string":
                if (primitiveHandlers.preString)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preString,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.string) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.string,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postString)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postString,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "object":
                {
                    if (obj instanceof Array) {
                        if (primitiveHandlers.preArray)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.preArray,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            const out = await obj.pSerialAwaitMap(it=>pFn(it, primitiveHandlers, lastKey, stack));
                            if (!opts.isNoModification)
                                obj = out;
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.array) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.array) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj != null) {
                                const out = await obj.pSerialAwaitMap(it=>pFn(it, primitiveHandlers, lastKey, stack));
                                if (!opts.isNoModification)
                                    obj = out;
                            } else {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        }
                        if (primitiveHandlers.postArray)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.postArray,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    } else {
                        if (primitiveHandlers.preObject)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.preObject,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            await pDoObjectRecurse();
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.object) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.object,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteObjects)
                                    throw new Error(`Object handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.object) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.object,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteObjects)
                                    throw new Error(`Object handler(s) returned null!`);
                            } else {
                                await pDoObjectRecurse();
                            }
                        }
                        if (primitiveHandlers.postObject)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.postObject,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    }
                }
            default:
                throw new Error(`Unhandled type "${to}"`);
            }
        }
        ;

        return {
            pWalk: pFn
        };
    },

    async _getAsyncWalker_pApplyHandlers({opts, handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        await handlers.pSerialAwaitMap(async pH=>{
            const out = await pH(obj, lastKey, stack);
            if (!opts.isNoModification)
                obj = out;
        }
        );
        return obj;
    },

    async _getAsyncWalker_pRunHandlers({handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        await handlers.pSerialAwaitMap(pH=>pH(obj, lastKey, stack));
    },

    pDefer(fn) {
        return (async()=>fn())();
    },
};
//#endregion
//#region UrlUtil
globalThis.UrlUtil = {
    encodeForHash(toEncode) {
        if (toEncode instanceof Array)
            return toEncode.map(it=>`${it}`.toUrlified()).join(HASH_LIST_SEP);
        else
            return `${toEncode}`.toUrlified();
    },

    encodeArrayForHash(...toEncodes) {
        return toEncodes.map(UrlUtil.encodeForHash).join(HASH_LIST_SEP);
    },

    autoEncodeHash(obj) {
        const curPage = UrlUtil.getCurrentPage();
        const encoder = UrlUtil.URL_TO_HASH_BUILDER[curPage];
        if (!encoder)
            throw new Error(`No encoder found for page ${curPage}`);
        return encoder(obj);
    },

    decodeHash(hash) {
        return hash.split(HASH_LIST_SEP).map(it=>decodeURIComponent(it));
    },

    getSluggedHash(hash) {
        return Parser.stringToSlug(decodeURIComponent(hash)).replace(/_/g, "-");
    },

    getCurrentPage() {
        if (typeof window === "undefined")
            return VeCt.PG_NONE;
        const pSplit = window.location.pathname.split("/");
        let out = pSplit[pSplit.length - 1];
        if (!out.toLowerCase().endsWith(".html"))
            out += ".html";
        return out;
    },

    link(href, {isBustCache=false}={}) {
        if (isBustCache)
            return UrlUtil._link_getWithParam(href, {
                param: `t=${Date.now()}`
            });
        return href;
    },

    _link_getWithParam(href, {param=`v=${VERSION_NUMBER}`}={}) {
        if (href.includes("?"))
            return `${href}&${param}`;
        return `${href}?${param}`;
    },

    unpackSubHash(subHash, unencode) {
        if (subHash.includes(HASH_SUB_KV_SEP)) {
            const keyValArr = subHash.split(HASH_SUB_KV_SEP).map(s=>s.trim());
            const out = {};
            let k = keyValArr[0].toLowerCase();
            if (unencode)
                k = decodeURIComponent(k);
            let v = keyValArr[1].toLowerCase();
            if (unencode)
                v = decodeURIComponent(v);
            out[k] = v.split(HASH_SUB_LIST_SEP).map(s=>s.trim());
            if (out[k].length === 1 && out[k] === HASH_SUB_NONE)
                out[k] = [];
            return out;
        } else {
            throw new Error(`Badly formatted subhash ${subHash}`);
        }
    },

    packSubHash(key, values, opts) {
        opts = opts || {};
        if (opts.isEncodeBoth || opts.isEncodeKey)
            key = key.toUrlified();
        if (opts.isEncodeBoth || opts.isEncodeValues)
            values = values.map(it=>it.toUrlified());
        return `${key}${HASH_SUB_KV_SEP}${values.join(HASH_SUB_LIST_SEP)}`;
    },

    categoryToPage(category) {
        return UrlUtil.CAT_TO_PAGE[category];
    },
    categoryToHoverPage(category) {
        return UrlUtil.CAT_TO_HOVER_PAGE[category] || UrlUtil.categoryToPage(category);
    },

    pageToDisplayPage(page) {
        return UrlUtil.PG_TO_NAME[page] || page;
    },

    getFilename(url) {
        return url.slice(url.lastIndexOf("/") + 1);
    },

    isFullUrl(url) {
        return url && /^.*?:\/\//.test(url);
    },

    mini: {
        compress(primitive) {
            const type = typeof primitive;
            if (primitive === undefined)
                return "u";
            if (primitive === null)
                return "x";
            switch (type) {
            case "boolean":
                return `b${Number(primitive)}`;
            case "number":
                return `n${primitive}`;
            case "string":
                return `s${primitive.toUrlified()}`;
            default:
                throw new Error(`Unhandled type "${type}"`);
            }
        },

        decompress(raw) {
            const [type,data] = [raw.slice(0, 1), raw.slice(1)];
            switch (type) {
            case "u":
                return undefined;
            case "x":
                return null;
            case "b":
                return !!Number(data);
            case "n":
                return Number(data);
            case "s":
                return decodeURIComponent(String(data));
            default:
                throw new Error(`Unhandled type "${type}"`);
            }
        },
    },

    class: {
        getIndexedClassEntries(cls) {
            const out = [];

            (cls.classFeatures || []).forEach((lvlFeatureList,ixLvl)=>{
                lvlFeatureList.filter(feature=>(!feature.gainSubclassFeature || feature.gainSubclassFeatureHasContent) && feature.name !== "Ability Score Improvement" && feature.name !== "Proficiency Versatility").forEach((feature,ixFeature)=>{
                    const name = Renderer.findName(feature);
                    if (!name) {
                        if (BrewUtil2.hasSourceJson(cls.source))
                            return;
                        else
                            throw new Error("Class feature had no name!");
                    }
                    out.push({
                        _type: "classFeature",
                        source: cls.source.source || cls.source,
                        name,
                        hash: `${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](cls)}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
                            feature: {
                                ixLevel: ixLvl,
                                ixFeature: ixFeature
                            }
                        })}`,
                        entry: feature,
                        level: ixLvl + 1,
                    });
                }
                );
            }
            );

            return out;
        },

        getIndexedSubclassEntries(sc) {
            const out = [];

            const lvlFeatures = sc.subclassFeatures || [];
            sc.source = sc.source || sc.classSource;
            lvlFeatures.forEach(lvlFeature=>{
                lvlFeature.forEach((feature,ixFeature)=>{
                    const subclassFeatureHash = `${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({
                        name: sc.className,
                        source: sc.classSource
                    })}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
                        subclass: sc,
                        feature: {
                            ixLevel: feature.level - 1,
                            ixFeature: ixFeature
                        }
                    })}`;

                    const name = Renderer.findName(feature);
                    if (!name) {
                        if (BrewUtil2.hasSourceJson(sc.source))
                            return;
                        else
                            throw new Error("Subclass feature had no name!");
                    }
                    out.push({
                        _type: "subclassFeature",
                        name,
                        subclassName: sc.name,
                        subclassShortName: sc.shortName,
                        source: sc.source.source || sc.source,
                        hash: subclassFeatureHash,
                        entry: feature,
                        level: feature.level,
                    });

                    if (feature.entries) {
                        const namedFeatureParts = feature.entries.filter(it=>it.name);
                        namedFeatureParts.forEach(it=>{
                            if (out.find(existing=>it.name === existing.name && feature.level === existing.level))
                                return;
                            out.push({
                                _type: "subclassFeaturePart",
                                name: it.name,
                                subclassName: sc.name,
                                subclassShortName: sc.shortName,
                                source: sc.source.source || sc.source,
                                hash: subclassFeatureHash,
                                entry: feature,
                                level: feature.level,
                            });
                        }
                        );
                    }
                }
                );
            }
            );

            return out;
        },
    },

    getStateKeySubclass(sc) {
        return Parser.stringToSlug(`sub ${sc.shortName || sc.name} ${sc.source}`);
    },

    getClassesPageStatePart(opts) {
        if (!opts.subclass && !opts.feature)
            return "";

        if (!opts.feature)
            return UrlUtil.packSubHash("state", [UrlUtil._getClassesPageStatePart_subclass(opts.subclass)]);
        if (!opts.subclass)
            return UrlUtil.packSubHash("state", [UrlUtil._getClassesPageStatePart_feature(opts.feature)]);

        return UrlUtil.packSubHash("state", [UrlUtil._getClassesPageStatePart_subclass(opts.subclass), UrlUtil._getClassesPageStatePart_feature(opts.feature), ], );
    },

    _getClassesPageStatePart_subclass(sc) {
        return `${UrlUtil.getStateKeySubclass(sc)}=${UrlUtil.mini.compress(true)}`;
    },
    _getClassesPageStatePart_feature(feature) {
        return `feature=${UrlUtil.mini.compress(`${feature.ixLevel}-${feature.ixFeature}`)}`;
    },
};

UrlUtil.PG_BESTIARY = "bestiary.html";
UrlUtil.PG_SPELLS = "spells.html";
UrlUtil.PG_BACKGROUNDS = "backgrounds.html";
UrlUtil.PG_ITEMS = "items.html";
UrlUtil.PG_CLASSES = "classes.html";
UrlUtil.PG_CONDITIONS_DISEASES = "conditionsdiseases.html";
UrlUtil.PG_FEATS = "feats.html";
UrlUtil.PG_OPT_FEATURES = "optionalfeatures.html";
UrlUtil.PG_PSIONICS = "psionics.html";
UrlUtil.PG_RACES = "races.html";
UrlUtil.PG_REWARDS = "rewards.html";
UrlUtil.PG_VARIANTRULES = "variantrules.html";
UrlUtil.PG_ADVENTURE = "adventure.html";
UrlUtil.PG_ADVENTURES = "adventures.html";
UrlUtil.PG_BOOK = "book.html";
UrlUtil.PG_BOOKS = "books.html";
UrlUtil.PG_DEITIES = "deities.html";
UrlUtil.PG_CULTS_BOONS = "cultsboons.html";
UrlUtil.PG_OBJECTS = "objects.html";
UrlUtil.PG_TRAPS_HAZARDS = "trapshazards.html";
UrlUtil.PG_QUICKREF = "quickreference.html";
UrlUtil.PG_MANAGE_BREW = "managebrew.html";
UrlUtil.PG_MANAGE_PRERELEASE = "manageprerelease.html";
UrlUtil.PG_MAKE_BREW = "makebrew.html";
UrlUtil.PG_DEMO_RENDER = "renderdemo.html";
UrlUtil.PG_TABLES = "tables.html";
UrlUtil.PG_VEHICLES = "vehicles.html";
UrlUtil.PG_CHARACTERS = "characters.html";
UrlUtil.PG_ACTIONS = "actions.html";
UrlUtil.PG_LANGUAGES = "languages.html";
UrlUtil.PG_STATGEN = "statgen.html";
UrlUtil.PG_LIFEGEN = "lifegen.html";
UrlUtil.PG_NAMES = "names.html";
UrlUtil.PG_DM_SCREEN = "dmscreen.html";
UrlUtil.PG_CR_CALCULATOR = "crcalculator.html";
UrlUtil.PG_ENCOUNTERGEN = "encountergen.html";
UrlUtil.PG_LOOTGEN = "lootgen.html";
UrlUtil.PG_TEXT_CONVERTER = "converter.html";
UrlUtil.PG_CHANGELOG = "changelog.html";
UrlUtil.PG_CHAR_CREATION_OPTIONS = "charcreationoptions.html";
UrlUtil.PG_RECIPES = "recipes.html";
UrlUtil.PG_CLASS_SUBCLASS_FEATURES = "classfeatures.html";
UrlUtil.PG_CREATURE_FEATURES = "creaturefeatures.html";
UrlUtil.PG_VEHICLE_FEATURES = "vehiclefeatures.html";
UrlUtil.PG_OBJECT_FEATURES = "objectfeatures.html";
UrlUtil.PG_TRAP_FEATURES = "trapfeatures.html";
UrlUtil.PG_MAPS = "maps.html";
UrlUtil.PG_SEARCH = "search.html";
UrlUtil.PG_DECKS = "decks.html";

UrlUtil.URL_TO_HASH_GENERIC = (it)=>UrlUtil.encodeArrayForHash(it.name, it.source);

UrlUtil.URL_TO_HASH_BUILDER = {};
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BESTIARY] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BACKGROUNDS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_FEATS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_PSIONICS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RACES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_REWARDS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VARIANTRULES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURE] = (it)=>UrlUtil.encodeForHash(it.id);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURES] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURE];
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOK] = (it)=>UrlUtil.encodeForHash(it.id);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOKS] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOK];
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DEITIES] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.pantheon, it.source);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CULTS_BOONS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OBJECTS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAPS_HAZARDS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TABLES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ACTIONS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_LANGUAGES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CHAR_CREATION_OPTIONS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RECIPES] = (it)=>`${UrlUtil.encodeArrayForHash(it.name, it.source)}${it._scaleFactor ? `${HASH_PART_SEP}${VeCt.HASH_SCALED}${HASH_SUB_KV_SEP}${it._scaleFactor}` : ""}`;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DECKS] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASS_SUBCLASS_FEATURES] = (it)=>(it.__prop === "subclassFeature" || it.subclassSource) ? UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"](it) : UrlUtil.URL_TO_HASH_BUILDER["classFeature"](it);
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CREATURE_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLE_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OBJECT_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAP_FEATURES] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_QUICKREF] = ({name, ixChapter, ixHeader})=>{
    const hashParts = ["bookref-quick", ixChapter, UrlUtil.encodeForHash(name.toLowerCase())];
    if (ixHeader)
        hashParts.push(ixHeader);
    return hashParts.join(HASH_PART_SEP);
}
;

UrlUtil.URL_TO_HASH_BUILDER["monster"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BESTIARY];
UrlUtil.URL_TO_HASH_BUILDER["spell"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS];
UrlUtil.URL_TO_HASH_BUILDER["background"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BACKGROUNDS];
UrlUtil.URL_TO_HASH_BUILDER["item"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS];
UrlUtil.URL_TO_HASH_BUILDER["itemGroup"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS];
UrlUtil.URL_TO_HASH_BUILDER["baseitem"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS];
UrlUtil.URL_TO_HASH_BUILDER["magicvariant"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ITEMS];
UrlUtil.URL_TO_HASH_BUILDER["class"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES];
UrlUtil.URL_TO_HASH_BUILDER["condition"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES];
UrlUtil.URL_TO_HASH_BUILDER["disease"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES];
UrlUtil.URL_TO_HASH_BUILDER["status"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CONDITIONS_DISEASES];
UrlUtil.URL_TO_HASH_BUILDER["feat"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_FEATS];
UrlUtil.URL_TO_HASH_BUILDER["optionalfeature"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OPT_FEATURES];
UrlUtil.URL_TO_HASH_BUILDER["psionic"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_PSIONICS];
UrlUtil.URL_TO_HASH_BUILDER["race"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RACES];
UrlUtil.URL_TO_HASH_BUILDER["subrace"] = (it)=>UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RACES]({
    name: `${it.name} (${it.raceName})`,
    source: it.source
});
UrlUtil.URL_TO_HASH_BUILDER["reward"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_REWARDS];
UrlUtil.URL_TO_HASH_BUILDER["variantrule"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VARIANTRULES];
UrlUtil.URL_TO_HASH_BUILDER["adventure"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURES];
UrlUtil.URL_TO_HASH_BUILDER["adventureData"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ADVENTURES];
UrlUtil.URL_TO_HASH_BUILDER["book"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOKS];
UrlUtil.URL_TO_HASH_BUILDER["bookData"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_BOOKS];
UrlUtil.URL_TO_HASH_BUILDER["deity"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DEITIES];
UrlUtil.URL_TO_HASH_BUILDER["cult"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CULTS_BOONS];
UrlUtil.URL_TO_HASH_BUILDER["boon"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CULTS_BOONS];
UrlUtil.URL_TO_HASH_BUILDER["object"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_OBJECTS];
UrlUtil.URL_TO_HASH_BUILDER["trap"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAPS_HAZARDS];
UrlUtil.URL_TO_HASH_BUILDER["hazard"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TRAPS_HAZARDS];
UrlUtil.URL_TO_HASH_BUILDER["table"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TABLES];
UrlUtil.URL_TO_HASH_BUILDER["tableGroup"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_TABLES];
UrlUtil.URL_TO_HASH_BUILDER["vehicle"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLES];
UrlUtil.URL_TO_HASH_BUILDER["vehicleUpgrade"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_VEHICLES];
UrlUtil.URL_TO_HASH_BUILDER["action"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_ACTIONS];
UrlUtil.URL_TO_HASH_BUILDER["language"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_LANGUAGES];
UrlUtil.URL_TO_HASH_BUILDER["charoption"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CHAR_CREATION_OPTIONS];
UrlUtil.URL_TO_HASH_BUILDER["recipe"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_RECIPES];
UrlUtil.URL_TO_HASH_BUILDER["deck"] = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DECKS];

UrlUtil.URL_TO_HASH_BUILDER["subclass"] = it=>{
    return Hist.util.getCleanHash(`${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({
        name: it.className,
        source: it.classSource
    })}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
        subclass: it
    })}`, );
}
;
UrlUtil.URL_TO_HASH_BUILDER["classFeature"] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.className, it.classSource, it.level, it.source);
UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.className, it.classSource, it.subclassShortName, it.subclassSource, it.level, it.source);
UrlUtil.URL_TO_HASH_BUILDER["card"] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.set, it.source);
UrlUtil.URL_TO_HASH_BUILDER["legendaryGroup"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["itemEntry"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["itemProperty"] = (it)=>UrlUtil.encodeArrayForHash(it.abbreviation, it.source);
UrlUtil.URL_TO_HASH_BUILDER["itemType"] = (it)=>UrlUtil.encodeArrayForHash(it.abbreviation, it.source);
UrlUtil.URL_TO_HASH_BUILDER["itemTypeAdditionalEntries"] = (it)=>UrlUtil.encodeArrayForHash(it.appliesTo, it.source);
UrlUtil.URL_TO_HASH_BUILDER["itemMastery"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["skill"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["sense"] = UrlUtil.URL_TO_HASH_GENERIC;
UrlUtil.URL_TO_HASH_BUILDER["raceFeature"] = (it)=>UrlUtil.encodeArrayForHash(it.name, it.raceName, it.raceSource, it.source);
UrlUtil.URL_TO_HASH_BUILDER["citation"] = UrlUtil.URL_TO_HASH_GENERIC;

Object.keys(UrlUtil.URL_TO_HASH_BUILDER).filter(k=>!k.endsWith(".html") && k.toLowerCase() !== k).forEach(k=>UrlUtil.URL_TO_HASH_BUILDER[k.toLowerCase()] = UrlUtil.URL_TO_HASH_BUILDER[k]);

Object.keys(UrlUtil.URL_TO_HASH_BUILDER).filter(k=>!k.endsWith(".html")).forEach(k=>UrlUtil.URL_TO_HASH_BUILDER[`raw_${k}`] = UrlUtil.URL_TO_HASH_BUILDER[k]);

Object.keys(UrlUtil.URL_TO_HASH_BUILDER).filter(k=>!k.endsWith(".html")).forEach(k=>{
    UrlUtil.URL_TO_HASH_BUILDER[`${k}Fluff`] = UrlUtil.URL_TO_HASH_BUILDER[k];
    UrlUtil.URL_TO_HASH_BUILDER[`${k}Template`] = UrlUtil.URL_TO_HASH_BUILDER[k];
}
);

UrlUtil.PG_TO_NAME = {};
UrlUtil.PG_TO_NAME[UrlUtil.PG_BESTIARY] = "Bestiary";
UrlUtil.PG_TO_NAME[UrlUtil.PG_SPELLS] = "Spells";
UrlUtil.PG_TO_NAME[UrlUtil.PG_BACKGROUNDS] = "Backgrounds";
UrlUtil.PG_TO_NAME[UrlUtil.PG_ITEMS] = "Items";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CLASSES] = "Classes";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CONDITIONS_DISEASES] = "Conditions & Diseases";
UrlUtil.PG_TO_NAME[UrlUtil.PG_FEATS] = "Feats";
UrlUtil.PG_TO_NAME[UrlUtil.PG_OPT_FEATURES] = "Other Options and Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_PSIONICS] = "Psionics";
UrlUtil.PG_TO_NAME[UrlUtil.PG_RACES] = "Races";
UrlUtil.PG_TO_NAME[UrlUtil.PG_REWARDS] = "Supernatural Gifts & Rewards";
UrlUtil.PG_TO_NAME[UrlUtil.PG_VARIANTRULES] = "Optional, Variant, and Expanded Rules";
UrlUtil.PG_TO_NAME[UrlUtil.PG_ADVENTURES] = "Adventures";
UrlUtil.PG_TO_NAME[UrlUtil.PG_BOOKS] = "Books";
UrlUtil.PG_TO_NAME[UrlUtil.PG_DEITIES] = "Deities";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CULTS_BOONS] = "Cults & Supernatural Boons";
UrlUtil.PG_TO_NAME[UrlUtil.PG_OBJECTS] = "Objects";
UrlUtil.PG_TO_NAME[UrlUtil.PG_TRAPS_HAZARDS] = "Traps & Hazards";
UrlUtil.PG_TO_NAME[UrlUtil.PG_QUICKREF] = "Quick Reference";
UrlUtil.PG_TO_NAME[UrlUtil.PG_MANAGE_BREW] = "Homebrew Manager";
UrlUtil.PG_TO_NAME[UrlUtil.PG_MANAGE_PRERELEASE] = "Prerelease Content Manager";
UrlUtil.PG_TO_NAME[UrlUtil.PG_MAKE_BREW] = "Homebrew Builder";
UrlUtil.PG_TO_NAME[UrlUtil.PG_DEMO_RENDER] = "Renderer Demo";
UrlUtil.PG_TO_NAME[UrlUtil.PG_TABLES] = "Tables";
UrlUtil.PG_TO_NAME[UrlUtil.PG_VEHICLES] = "Vehicles";
UrlUtil.PG_TO_NAME[UrlUtil.PG_ACTIONS] = "Actions";
UrlUtil.PG_TO_NAME[UrlUtil.PG_LANGUAGES] = "Languages";
UrlUtil.PG_TO_NAME[UrlUtil.PG_STATGEN] = "Stat Generator";
UrlUtil.PG_TO_NAME[UrlUtil.PG_LIFEGEN] = "This Is Your Life";
UrlUtil.PG_TO_NAME[UrlUtil.PG_NAMES] = "Names";
UrlUtil.PG_TO_NAME[UrlUtil.PG_DM_SCREEN] = "DM Screen";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CR_CALCULATOR] = "CR Calculator";
UrlUtil.PG_TO_NAME[UrlUtil.PG_ENCOUNTERGEN] = "Encounter Generator";
UrlUtil.PG_TO_NAME[UrlUtil.PG_LOOTGEN] = "Loot Generator";
UrlUtil.PG_TO_NAME[UrlUtil.PG_TEXT_CONVERTER] = "Text Converter";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CHANGELOG] = "Changelog";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CHAR_CREATION_OPTIONS] = "Other Character Creation Options";
UrlUtil.PG_TO_NAME[UrlUtil.PG_RECIPES] = "Recipes";
UrlUtil.PG_TO_NAME[UrlUtil.PG_CREATURE_FEATURES] = "Creature Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_VEHICLE_FEATURES] = "Vehicle Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_OBJECT_FEATURES] = "Object Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_TRAP_FEATURES] = "Trap Features";
UrlUtil.PG_TO_NAME[UrlUtil.PG_MAPS] = "Maps";
UrlUtil.PG_TO_NAME[UrlUtil.PG_DECKS] = "Decks";

UrlUtil.CAT_TO_PAGE = {};
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CREATURE] = UrlUtil.PG_BESTIARY;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SPELL] = UrlUtil.PG_SPELLS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_BACKGROUND] = UrlUtil.PG_BACKGROUNDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ITEM] = UrlUtil.PG_ITEMS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CLASS] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CLASS_FEATURE] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SUBCLASS] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SUBCLASS_FEATURE] = UrlUtil.PG_CLASSES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CONDITION] = UrlUtil.PG_CONDITIONS_DISEASES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_FEAT] = UrlUtil.PG_FEATS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ELDRITCH_INVOCATION] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_METAMAGIC] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER_CAVALIER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ARCANE_SHOT] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_FIGHTING_STYLE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_PSIONIC] = UrlUtil.PG_PSIONICS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_RACE] = UrlUtil.PG_RACES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OTHER_REWARD] = UrlUtil.PG_REWARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = UrlUtil.PG_VARIANTRULES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ADVENTURE] = UrlUtil.PG_ADVENTURE;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_DEITY] = UrlUtil.PG_DEITIES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_OBJECT] = UrlUtil.PG_OBJECTS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TRAP] = UrlUtil.PG_TRAPS_HAZARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_HAZARD] = UrlUtil.PG_TRAPS_HAZARDS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_QUICKREF] = UrlUtil.PG_QUICKREF;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CULT] = UrlUtil.PG_CULTS_BOONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_BOON] = UrlUtil.PG_CULTS_BOONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_DISEASE] = UrlUtil.PG_CONDITIONS_DISEASES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TABLE] = UrlUtil.PG_TABLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_TABLE_GROUP] = UrlUtil.PG_TABLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_VEHICLE] = UrlUtil.PG_VEHICLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_PACT_BOON] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ARTIFICER_INFUSION] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SHIP_UPGRADE] = UrlUtil.PG_VEHICLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] = UrlUtil.PG_VEHICLES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ONOMANCY_RESONANT] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ALCHEMICAL_FORMULA] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_MANEUVER] = UrlUtil.PG_OPT_FEATURES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_ACTION] = UrlUtil.PG_ACTIONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_LANGUAGE] = UrlUtil.PG_LANGUAGES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_BOOK] = UrlUtil.PG_BOOK;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_PAGE] = null;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_LEGENDARY_GROUP] = null;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CHAR_CREATION_OPTIONS] = UrlUtil.PG_CHAR_CREATION_OPTIONS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_RECIPES] = UrlUtil.PG_RECIPES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_STATUS] = UrlUtil.PG_CONDITIONS_DISEASES;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_DECK] = UrlUtil.PG_DECKS;
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_CARD] = "card";
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SKILLS] = "skill";
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_SENSES] = "sense";
UrlUtil.CAT_TO_PAGE[Parser.CAT_ID_LEGENDARY_GROUP] = "legendaryGroup";

UrlUtil.CAT_TO_HOVER_PAGE = {};
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_CLASS_FEATURE] = "classfeature";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_SUBCLASS_FEATURE] = "subclassfeature";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_CARD] = "card";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_SKILLS] = "skill";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_SENSES] = "sense";
UrlUtil.CAT_TO_HOVER_PAGE[Parser.CAT_ID_LEGENDARY_GROUP] = "legendaryGroup";

/* UrlUtil.HASH_START_CREATURE_SCALED = `${VeCt.HASH_SCALED}${HASH_SUB_KV_SEP}`;
UrlUtil.HASH_START_CREATURE_SCALED_SPELL_SUMMON = `${VeCt.HASH_SCALED_SPELL_SUMMON}${HASH_SUB_KV_SEP}`;
UrlUtil.HASH_START_CREATURE_SCALED_CLASS_SUMMON = `${VeCt.HASH_SCALED_CLASS_SUMMON}${HASH_SUB_KV_SEP}`; */

UrlUtil.SUBLIST_PAGES = {
    [UrlUtil.PG_BESTIARY]: true,
    [UrlUtil.PG_SPELLS]: true,
    [UrlUtil.PG_BACKGROUNDS]: true,
    [UrlUtil.PG_ITEMS]: true,
    [UrlUtil.PG_CONDITIONS_DISEASES]: true,
    [UrlUtil.PG_FEATS]: true,
    [UrlUtil.PG_OPT_FEATURES]: true,
    [UrlUtil.PG_PSIONICS]: true,
    [UrlUtil.PG_RACES]: true,
    [UrlUtil.PG_REWARDS]: true,
    [UrlUtil.PG_VARIANTRULES]: true,
    [UrlUtil.PG_DEITIES]: true,
    [UrlUtil.PG_CULTS_BOONS]: true,
    [UrlUtil.PG_OBJECTS]: true,
    [UrlUtil.PG_TRAPS_HAZARDS]: true,
    [UrlUtil.PG_TABLES]: true,
    [UrlUtil.PG_VEHICLES]: true,
    [UrlUtil.PG_ACTIONS]: true,
    [UrlUtil.PG_LANGUAGES]: true,
    [UrlUtil.PG_CHAR_CREATION_OPTIONS]: true,
    [UrlUtil.PG_RECIPES]: true,
    [UrlUtil.PG_DECKS]: true,
};

UrlUtil.PAGE_TO_PROPS = {};
UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_SPELLS] = ["spell"];
UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_ITEMS] = ["item", "itemGroup", "itemType", "itemEntry", "itemProperty", "itemTypeAdditionalEntries", "itemMastery", "baseitem", "magicvariant"];
UrlUtil.PAGE_TO_PROPS[UrlUtil.PG_RACES] = ["race", "subrace"];
//#endregion

//#region DataUtil
class _DataUtilPropConfig {
    static _MERGE_REQUIRES_PRESERVE = {};
    static _PAGE = null;

    static get PAGE() {
        return this._PAGE;
    }

    static async pMergeCopy(lst, ent, options) {
        return DataUtil.generic._pMergeCopy(this, this._PAGE, lst, ent, options);
    }
}
class _DataUtilPropConfigMultiSource extends _DataUtilPropConfig {
    static _DIR = null;
    static _PROP = null;
    static _IS_MUT_ENTITIES = false;

    static get _isFluff() {
        return this._PROP.endsWith("Fluff");
    }

    static _P_INDEX = null;

    static pLoadIndex() {
        this._P_INDEX = this._P_INDEX || DataUtil.loadJSON(`${Renderer.get().baseUrl}data/${this._DIR}/${this._isFluff ? `fluff-` : ""}index.json`);
        return this._P_INDEX;
    }

    static async pLoadAll() {
        const json = await this.loadJSON();
        return json[this._PROP];
    }

    static async loadJSON() {
        return this._loadJSON({
            isUnmerged: false
        });
    }
    static async loadUnmergedJSON() {
        return this._loadJSON({
            isUnmerged: true
        });
    }

    static async _loadJSON({isUnmerged=false}={}) {
        const index = await this.pLoadIndex();

        const allData = await Object.entries(index).pMap(async([source,file])=>this._pLoadSourceEntities({
            source,
            isUnmerged,
            file
        }));

        return {
            [this._PROP]: allData.flat()
        };
    }

    static async pLoadSingleSource(source) {
        const index = await this.pLoadIndex();

        const file = index[source];
        if (!file)
            return null;

        return {
            [this._PROP]: await this._pLoadSourceEntities({
                source,
                file
            })
        };
    }

    static async _pLoadSourceEntities({source, isUnmerged=false, file}) {
        await this._pInitPreData();

        const fnLoad = isUnmerged ? DataUtil.loadRawJSON.bind(DataUtil) : DataUtil.loadJSON.bind(DataUtil);

        let data = await fnLoad(`${Renderer.get().baseUrl}data/${this._DIR}/${file}`);
        data = data[this._PROP].filter(it=>it.source === source);

        if (!this._IS_MUT_ENTITIES)
            return data;

        return data.map(ent=>this._mutEntity(ent));
    }

    static _P_INIT_PRE_DATA = null;

    static async _pInitPreData() {
        return (this._P_INIT_PRE_DATA = this._P_INIT_PRE_DATA || this._pInitPreData_());
    }

    static async _pInitPreData_() {}

    static _mutEntity(ent) {
        return ent;
    }
}
class _DataUtilPropConfigSingleSource extends _DataUtilPropConfig {
    static _FILENAME = null;

    static getDataUrl() {
        return `${Renderer.get().baseUrl}data/${this._FILENAME}`;
    }

    static async loadJSON() {
        return this.loadRawJSON();
    }
    static async loadRawJSON() {
        return DataUtil.loadJSON(this.getDataUrl());
    }
    static async loadUnmergedJSON() {
        return DataUtil.loadRawJSON(this.getDataUrl());
    }
}
class _DataUtilPropConfigCustom extends _DataUtilPropConfig {
    static async loadJSON() {
        throw new Error("Unimplemented!");
    }
    static async loadUnmergedJSON() {
        throw new Error("Unimplemented!");
    }
}
globalThis.DataUtil = {
    _loading: {},
    _loaded: {},
    _merging: {},
    _merged: {},

    async _pLoad({url, id, isBustCache=false}) {
        if (DataUtil._loading[id] && !isBustCache) {
            await DataUtil._loading[id];
            return DataUtil._loaded[id];
        }

        DataUtil._loading[id] = new Promise((resolve,reject)=>{
            const request = new XMLHttpRequest();

            request.open("GET", url, true);
            request.overrideMimeType("application/json");

            request.onload = function() {
                try {
                    DataUtil._loaded[id] = JSON.parse(this.response);
                    resolve();
                } catch (e) {
                    reject(new Error(`Could not parse JSON from ${url}: ${e.message}`));
                }
            }
            ;
            request.onerror = (e)=>{
                const ptDetail = ["status", "statusText", "readyState", "response", "responseType", ].map(prop=>`${prop}=${JSON.stringify(e.target[prop])}`).join(" ");
                reject(new Error(`Error during JSON request: ${ptDetail}`));
            }
            ;

            request.send();
        }
        );

        await DataUtil._loading[id];
        return DataUtil._loaded[id];
    },

    _mutAddProps(data) {
        if (data && typeof data === "object") {
            for (const k in data) {
                if (data[k]instanceof Array) {
                    for (const it of data[k]) {
                        if (typeof it !== "object")
                            continue;
                        it.__prop = k;
                    }
                }
            }
        }
    },

    async loadJSON(url) {
        return DataUtil._loadJson(url, {
            isDoDataMerge: true
        });
    },

    async loadRawJSON(url, {isBustCache}={}) {
        return DataUtil._loadJson(url, {
            isBustCache
        });
    },

    async _loadJson(url, {isDoDataMerge=false, isBustCache=false}={}) {
        const procUrl = UrlUtil.link(url, {
            isBustCache
        });

        let data;
        try {
            data = await DataUtil._pLoad({
                url: procUrl,
                id: url,
                isBustCache
            });
        } catch (e) {
            setTimeout(()=>{
                throw e;
            }
            );
        }

        if (!data)
            data = await DataUtil._pLoad({
                url: url,
                id: url,
                isBustCache
            });

        if (isDoDataMerge)
            await DataUtil.pDoMetaMerge(url, data);

        return data;
    },

    async pDoMetaMerge(ident, data, options) {
        DataUtil._mutAddProps(data);
        DataUtil._merging[ident] = DataUtil._merging[ident] || DataUtil._pDoMetaMerge(ident, data, options);
        await DataUtil._merging[ident];
        const out = DataUtil._merged[ident];

        if (options?.isSkipMetaMergeCache) {
            delete DataUtil._merging[ident];
            delete DataUtil._merged[ident];
        }

        return out;
    },

    _pDoMetaMerge_handleCopyProp(prop, arr, entry, options) {
        if (!entry._copy)
            return;
        let fnMergeCopy = DataUtil[prop]?.pMergeCopy;
        if (!fnMergeCopy)
            throw new Error(`No dependency _copy merge strategy specified for property "${prop}"`);
        fnMergeCopy = fnMergeCopy.bind(DataUtil[prop]);
        return fnMergeCopy(arr, entry, options);
    },

    async _pDoMetaMerge(ident, data, options) {
        if (data._meta) {
            const loadedSourceIds = new Set();

            if (data._meta.dependencies) {
                await Promise.all(Object.entries(data._meta.dependencies).map(async([dataProp,sourceIds])=>{
                    sourceIds.forEach(sourceId=>loadedSourceIds.add(sourceId));

                    if (!data[dataProp])
                        return;
                    const isHasInternalCopies = (data._meta.internalCopies || []).includes(dataProp);

                    const dependencyData = await Promise.all(sourceIds.map(sourceId=>DataUtil.pLoadByMeta(dataProp, sourceId)));

                    const flatDependencyData = dependencyData.map(dd=>dd[dataProp]).flat().filter(Boolean);
                    await Promise.all(data[dataProp].map(entry=>DataUtil._pDoMetaMerge_handleCopyProp(dataProp, flatDependencyData, entry, {
                        ...options,
                        isErrorOnMissing: !isHasInternalCopies
                    })));
                }
                ));
                delete data._meta.dependencies;
            }

            if (data._meta.internalCopies) {
                for (const prop of data._meta.internalCopies) {
                    if (!data[prop])
                        continue;
                    for (const entry of data[prop]) {
                        await DataUtil._pDoMetaMerge_handleCopyProp(prop, data[prop], entry, {
                            ...options,
                            isErrorOnMissing: true
                        });
                    }
                }
                delete data._meta.internalCopies;
            }

            if (data._meta.includes) {
                const includesData = await Promise.all(Object.entries(data._meta.includes).map(async([dataProp,sourceIds])=>{
                    sourceIds = sourceIds.filter(it=>!loadedSourceIds.has(it));

                    sourceIds.forEach(sourceId=>loadedSourceIds.add(sourceId));

                    const includesData = await Promise.all(sourceIds.map(sourceId=>DataUtil.pLoadByMeta(dataProp, sourceId)));

                    const flatIncludesData = includesData.map(dd=>dd[dataProp]).flat().filter(Boolean);
                    return {
                        dataProp,
                        flatIncludesData
                    };
                }
                ));
                delete data._meta.includes;

                includesData.forEach(({dataProp, flatIncludesData})=>{
                    data[dataProp] = [...data[dataProp] || [], ...flatIncludesData];
                }
                );
            }
        }

        if (data._meta && data._meta.otherSources) {
            await Promise.all(Object.entries(data._meta.otherSources).map(async([dataProp,sourceIds])=>{
                const additionalData = await Promise.all(Object.entries(sourceIds).map(async([sourceId,findWith])=>({
                    findWith,
                    dataOther: await DataUtil.pLoadByMeta(dataProp, sourceId),
                })));

                additionalData.forEach(({findWith, dataOther})=>{
                    const toAppend = dataOther[dataProp].filter(it=>it.otherSources && it.otherSources.find(os=>os.source === findWith));
                    if (toAppend.length)
                        data[dataProp] = (data[dataProp] || []).concat(toAppend);
                }
                );
            }
            ));
            delete data._meta.otherSources;
        }

        if (data._meta && !Object.keys(data._meta).length)
            delete data._meta;

        DataUtil._merged[ident] = data;
    },

    async pDoMetaMergeSingle(prop, meta, ent) {
        return (await DataUtil.pDoMetaMerge(CryptUtil.uid(), {
            _meta: meta,
            [prop]: [ent],
        }, {
            isSkipMetaMergeCache: true,
        }, ))[prop][0];
    },

    getCleanFilename(filename) {
        return filename.replace(/[^-_a-zA-Z0-9]/g, "_");
    },

    getCsv(headers, rows) {
        function escapeCsv(str) {
            return `"${str.replace(/"/g, `""`).replace(/ +/g, " ").replace(/\n\n+/gi, "\n\n")}"`;
        }

        function toCsv(row) {
            return row.map(str=>escapeCsv(str)).join(",");
        }

        return `${toCsv(headers)}\n${rows.map(r=>toCsv(r)).join("\n")}`;
    },

    userDownload(filename, data, {fileType=null, isSkipAdditionalMetadata=false, propVersion="siteVersion", valVersion=VERSION_NUMBER}={}) {
        filename = `${filename}.json`;
        if (isSkipAdditionalMetadata || data instanceof Array)
            return DataUtil._userDownload(filename, JSON.stringify(data, null, "\t"), "text/json");

        data = {
            [propVersion]: valVersion,
            ...data
        };
        if (fileType != null)
            data = {
                fileType,
                ...data
            };
        return DataUtil._userDownload(filename, JSON.stringify(data, null, "\t"), "text/json");
    },

    userDownloadText(filename, string) {
        return DataUtil._userDownload(filename, string, "text/plain");
    },

    _userDownload(filename, data, mimeType) {
        const a = document.createElement("a");
        const t = new Blob([data],{
            type: mimeType
        });
        a.href = window.URL.createObjectURL(t);
        a.download = filename;
        a.dispatchEvent(new MouseEvent("click",{
            bubbles: true,
            cancelable: true,
            view: window
        }));
        setTimeout(()=>window.URL.revokeObjectURL(a.href), 100);
    },

    pUserUpload({isMultiple=false, expectedFileTypes=null, propVersion="siteVersion", }={}, ) {
        return new Promise(resolve=>{
            const $iptAdd = $(`<input type="file" ${isMultiple ? "multiple" : ""} class="ve-hidden" accept=".json">`).on("change", (evt)=>{
                const input = evt.target;

                const reader = new FileReader();
                let readIndex = 0;
                const out = [];
                const errs = [];

                reader.onload = async()=>{
                    const name = input.files[readIndex - 1].name;
                    const text = reader.result;

                    try {
                        const json = JSON.parse(text);

                        const isSkipFile = expectedFileTypes != null && json.fileType && !expectedFileTypes.includes(json.fileType) && !(await InputUiUtil.pGetUserBoolean({
                            textYes: "Yes",
                            textNo: "Cancel",
                            title: "File Type Mismatch",
                            htmlDescription: `The file "${name}" has the type "${json.fileType}" when the expected file type was "${expectedFileTypes.join("/")}".<br>Are you sure you want to upload this file?`,
                        }));

                        if (!isSkipFile) {
                            delete json.fileType;
                            delete json[propVersion];

                            out.push({
                                name,
                                json
                            });
                        }
                    } catch (e) {
                        errs.push({
                            filename: name,
                            message: e.message
                        });
                    }

                    if (input.files[readIndex]) {
                        reader.readAsText(input.files[readIndex++]);
                        return;
                    }

                    resolve({
                        files: out,
                        errors: errs,
                        jsons: out.map(({json})=>json),
                    });
                }
                ;

                reader.readAsText(input.files[readIndex++]);
            }
            ).appendTo(document.body);

            $iptAdd.click();
        }
        );
    },

    doHandleFileLoadErrorsGeneric(errors) {
        if (!errors)
            return;
        errors.forEach(err=>{
            JqueryUtil.doToast({
                content: `Could not load file "${err.filename}": <code>${err.message}</code>. ${VeCt.STR_SEE_CONSOLE}`,
                type: "danger",
            });
        }
        );
    },

    cleanJson(cpy, {isDeleteUniqueId=true}={}) {
        if (!cpy)
            return cpy;
        cpy.name = cpy._displayName || cpy.name;
        if (isDeleteUniqueId)
            delete cpy.uniqueId;
        DataUtil.__cleanJsonObject(cpy);
        return cpy;
    },

    _CLEAN_JSON_ALLOWED_UNDER_KEYS: ["_copy", "_versions", "_version", ],
    __cleanJsonObject(obj) {
        if (obj == null)
            return obj;
        if (typeof obj !== "object")
            return obj;

        if (obj instanceof Array) {
            return obj.forEach(it=>DataUtil.__cleanJsonObject(it));
        }

        Object.entries(obj).forEach(([k,v])=>{
            if (DataUtil._CLEAN_JSON_ALLOWED_UNDER_KEYS.includes(k))
                return;
            if ((k.startsWith("_") && k !== "_") || k === "customHashId")
                delete obj[k];
            else
                DataUtil.__cleanJsonObject(v);
        }
        );
    },

    _MULTI_SOURCE_PROP_TO_DIR: {
        "monster": "bestiary",
        "monsterFluff": "bestiary",
        "spell": "spells",
        "spellFluff": "spells",
        "class": "class",
        "subclass": "class",
        "classFeature": "class",
        "subclassFeature": "class",
    },
    _MULTI_SOURCE_PROP_TO_INDEX_NAME: {
        "class": "index.json",
        "subclass": "index.json",
        "classFeature": "index.json",
        "subclassFeature": "index.json",
    },
    async pLoadByMeta(prop, source) {

        switch (prop) {
        case "monster":
        case "spell":
        case "monsterFluff":
        case "spellFluff":
            {
                const data = await DataUtil[prop].pLoadSingleSource(source);
                if (data)
                    return data;

                return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
            }

        case "class":
        case "subclass":
        case "classFeature":
        case "subclassFeature":
            {
                const baseUrlPart = `${Renderer.get().baseUrl}data/${DataUtil._MULTI_SOURCE_PROP_TO_DIR[prop]}`;
                const index = await DataUtil.loadJSON(`${baseUrlPart}/${DataUtil._MULTI_SOURCE_PROP_TO_INDEX_NAME[prop]}`);
                if (index[source])
                    return DataUtil.loadJSON(`${baseUrlPart}/${index[source]}`);

                return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
            }

        case "item":
        case "itemGroup":
        case "baseitem":
            {
                const data = await DataUtil.item.loadRawJSON();
                if (data[prop] && data[prop].some(it=>it.source === source))
                    return data;
                return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
            }
        case "race":
            {
                const data = await DataUtil.race.loadJSON({
                    isAddBaseRaces: true
                });
                if (data[prop] && data[prop].some(it=>it.source === source))
                    return data;
                return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
            }

        default:
            {
                const impl = DataUtil[prop];
                if (impl && (impl.getDataUrl || impl.loadJSON)) {
                    const data = await (impl.loadJSON ? impl.loadJSON() : DataUtil.loadJSON(impl.getDataUrl()));
                    if (data[prop] && data[prop].some(it=>it.source === source))
                        return data;

                    return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
                }

                throw new Error(`Could not get loadable URL for \`${JSON.stringify({
                    key: prop,
                    value: source
                })}\``);
            }
        }
    },

    async _pLoadByMeta_pGetPrereleaseBrew(source) {
        const fromPrerelease = await DataUtil.pLoadPrereleaseBySource(source);
        if (fromPrerelease)
            return fromPrerelease;

        const fromBrew = await DataUtil.pLoadBrewBySource(source);
        if (fromBrew)
            return fromBrew;

        throw new Error(`Could not find prerelease/brew URL for source "${source}"`);
    },

    async pLoadPrereleaseBySource(source) {
        if (typeof PrereleaseUtil === "undefined")
            return null;
        return this._pLoadPrereleaseBrewBySource({
            source,
            brewUtil: PrereleaseUtil
        });
    },

    async pLoadBrewBySource(source) {
        if (typeof BrewUtil2 === "undefined")
            return null;
        return this._pLoadPrereleaseBrewBySource({
            source,
            brewUtil: BrewUtil2
        });
    },

    async _pLoadPrereleaseBrewBySource({source, brewUtil}) {
        const fromExisting = await brewUtil.pGetBrewBySource(source);
        if (fromExisting)
            return MiscUtil.copyFast(fromExisting.body);

        const url = await brewUtil.pGetSourceUrl(source);
        if (!url)
            return null;

        return DataUtil.loadJSON(url);
    },

    dbg: {
        isTrackCopied: false,
    },

    generic: {
        _MERGE_REQUIRES_PRESERVE_BASE: {
            page: true,
            otherSources: true,
            srd: true,
            basicRules: true,
            reprintedAs: true,
            hasFluff: true,
            hasFluffImages: true,
            hasToken: true,
            _versions: true,
        },

        _walker_replaceTxt: null,

        unpackUid(uid, tag, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,source,displayText,...others] = uid.split("|").map(Function.prototype.call.bind(String.prototype.trim));

            source = source || Parser.getTagSource(tag, source);
            if (opts.isLower)
                source = source.toLowerCase();

            return {
                name,
                source,
                displayText,
                others,
            };
        },

        packUid(ent, tag) {
            const sourceDefault = Parser.getTagSource(tag);
            return [ent.name, (ent.source || "").toLowerCase() === sourceDefault.toLowerCase() ? "" : ent.source, ].join("|").replace(/\|+$/, "");
        },

        getNormalizedUid(uid, tag) {
            const {name, source} = DataUtil.generic.unpackUid(uid, tag, {
                isLower: true
            });
            return [name, source].join("|");
        },

        getUid(ent, {isMaintainCase=false}={}) {
            const {name} = ent;
            const source = SourceUtil.getEntitySource(ent);
            if (!name || !source)
                throw new Error(`Entity did not have a name and source!`);
            const out = [name, source].join("|");
            if (isMaintainCase)
                return out;
            return out.toLowerCase();
        },

        async _pMergeCopy(impl, page, entryList, entry, options) {
            if (!entry._copy)
                return;

            const hashCurrent = UrlUtil.URL_TO_HASH_BUILDER[page](entry);
            const hash = UrlUtil.URL_TO_HASH_BUILDER[page](entry._copy);

            if (hashCurrent === hash)
                throw new Error(`${hashCurrent} _copy self-references! This is a bug!`);

            const it = (impl._mergeCache = impl._mergeCache || {})[hash] || DataUtil.generic._pMergeCopy_search(impl, page, entryList, entry, options);

            if (!it) {
                if (options.isErrorOnMissing) {
                    if (!IS_DEPLOYED && !IS_VTT)
                        throw new Error(`Could not find "${page}" entity "${entry._copy.name}" ("${entry._copy.source}") to copy in copier "${entry.name}" ("${entry.source}")`);
                }
                return;
            }

            if (DataUtil.dbg.isTrackCopied)
                it.dbg_isCopied = true;
            if (it._copy)
                await DataUtil.generic._pMergeCopy(impl, page, entryList, it, options);

            const templateData = entry._copy?._trait ? (await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/bestiary/template.json`)) : null;
            return DataUtil.generic.copyApplier.getCopy(impl, MiscUtil.copyFast(it), entry, templateData, options);
        },

        _pMergeCopy_search(impl, page, entryList, entry, options) {
            const entryHash = UrlUtil.URL_TO_HASH_BUILDER[page](entry._copy);
            return entryList.find(it=>{
                const hash = UrlUtil.URL_TO_HASH_BUILDER[page](it);
                impl._mergeCache[hash] = it;
                return hash === entryHash;
            }
            );
        },

        COPY_ENTRY_PROPS: ["action", "bonus", "reaction", "trait", "legendary", "mythic", "variant", "spellcasting", "actionHeader", "bonusHeader", "reactionHeader", "legendaryHeader", "mythicHeader", ],

        copyApplier: class {
            static _normaliseMods(obj) {
                Object.entries(obj._mod).forEach(([k,v])=>{
                    if (!(v instanceof Array))
                        obj._mod[k] = [v];
                }
                );
            }

            static _doEnsureArray({obj, prop}) {
                if (!(obj[prop]instanceof Array))
                    obj[prop] = [obj[prop]];
            }

            static _getRegexFromReplaceModInfo({replace, flags}) {
                return new RegExp(replace,`g${flags || ""}`);
            }

            static _doReplaceStringHandler({re, withStr}, str) {
                const split = Renderer.splitByTags(str);
                const len = split.length;
                for (let i = 0; i < len; ++i) {
                    if (split[i].startsWith("{@"))
                        continue;
                    split[i] = split[i].replace(re, withStr);
                }
                return split.join("");
            }

            static _doMod_appendStr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (copyTo[prop])
                    copyTo[prop] = `${copyTo[prop]}${modInfo.joiner || ""}${modInfo.str}`;
                else
                    copyTo[prop] = modInfo.str;
            }

            static _doMod_replaceName({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (!copyTo[prop])
                    return;

                DataUtil.generic._walker_replaceTxt = DataUtil.generic._walker_replaceTxt || MiscUtil.getWalker();
                const re = this._getRegexFromReplaceModInfo({
                    replace: modInfo.replace,
                    flags: modInfo.flags
                });
                const handlers = {
                    string: this._doReplaceStringHandler.bind(null, {
                        re: re,
                        withStr: modInfo.with
                    })
                };

                copyTo[prop].forEach(it=>{
                    if (it.name)
                        it.name = DataUtil.generic._walker_replaceTxt.walk(it.name, handlers);
                }
                );
            }

            static _doMod_replaceTxt({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (!copyTo[prop])
                    return;

                DataUtil.generic._walker_replaceTxt = DataUtil.generic._walker_replaceTxt || MiscUtil.getWalker();
                const re = this._getRegexFromReplaceModInfo({
                    replace: modInfo.replace,
                    flags: modInfo.flags
                });
                const handlers = {
                    string: this._doReplaceStringHandler.bind(null, {
                        re: re,
                        withStr: modInfo.with
                    })
                };

                const props = modInfo.props || [null, "entries", "headerEntries", "footerEntries"];
                if (!props.length)
                    return;

                if (props.includes(null)) {
                    copyTo[prop] = copyTo[prop].map(it=>{
                        if (typeof it !== "string")
                            return it;
                        return DataUtil.generic._walker_replaceTxt.walk(it, handlers);
                    }
                    );
                }

                copyTo[prop].forEach(it=>{
                    props.forEach(prop=>{
                        if (prop == null)
                            return;
                        if (it[prop])
                            it[prop] = DataUtil.generic._walker_replaceTxt.walk(it[prop], handlers);
                    }
                    );
                }
                );
            }

            static _doMod_prependArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });
                copyTo[prop] = copyTo[prop] ? modInfo.items.concat(copyTo[prop]) : modInfo.items;
            }

            static _doMod_appendArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });
                copyTo[prop] = copyTo[prop] ? copyTo[prop].concat(modInfo.items) : modInfo.items;
            }

            static _doMod_appendIfNotExistsArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });
                if (!copyTo[prop])
                    return copyTo[prop] = modInfo.items;
                copyTo[prop] = copyTo[prop].concat(modInfo.items.filter(it=>!copyTo[prop].some(x=>CollectionUtil.deepEquals(it, x))));
            }

            static _doMod_replaceArr({copyTo, copyFrom, modInfo, msgPtFailed, prop, isThrow=true}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });

                if (!copyTo[prop]) {
                    if (isThrow)
                        throw new Error(`${msgPtFailed} Could not find "${prop}" array`);
                    return false;
                }

                let ixOld;
                if (modInfo.replace.regex) {
                    const re = new RegExp(modInfo.replace.regex,modInfo.replace.flags || "");
                    ixOld = copyTo[prop].findIndex(it=>it.name ? re.test(it.name) : typeof it === "string" ? re.test(it) : false);
                } else if (modInfo.replace.index != null) {
                    ixOld = modInfo.replace.index;
                } else {
                    ixOld = copyTo[prop].findIndex(it=>it.name ? it.name === modInfo.replace : it === modInfo.replace);
                }

                if (~ixOld) {
                    copyTo[prop].splice(ixOld, 1, ...modInfo.items);
                    return true;
                } else if (isThrow)
                    throw new Error(`${msgPtFailed} Could not find "${prop}" item with name "${modInfo.replace}" to replace`);
                return false;
            }

            static _doMod_replaceOrAppendArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                const didReplace = this._doMod_replaceArr({
                    copyTo,
                    copyFrom,
                    modInfo,
                    msgPtFailed,
                    prop,
                    isThrow: false
                });
                if (!didReplace)
                    this._doMod_appendArr({
                        copyTo,
                        copyFrom,
                        modInfo,
                        msgPtFailed,
                        prop
                    });
            }

            static _doMod_insertArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });
                if (!copyTo[prop])
                    throw new Error(`${msgPtFailed} Could not find "${prop}" array`);
                copyTo[prop].splice(~modInfo.index ? modInfo.index : copyTo[prop].length, 0, ...modInfo.items);
            }

            static _doMod_removeArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (modInfo.names) {
                    this._doEnsureArray({
                        obj: modInfo,
                        prop: "names"
                    });
                    modInfo.names.forEach(nameToRemove=>{
                        const ixOld = copyTo[prop].findIndex(it=>it.name === nameToRemove);
                        if (~ixOld)
                            copyTo[prop].splice(ixOld, 1);
                        else {
                            if (!modInfo.force)
                                throw new Error(`${msgPtFailed} Could not find "${prop}" item with name "${nameToRemove}" to remove`);
                        }
                    }
                    );
                } else if (modInfo.items) {
                    this._doEnsureArray({
                        obj: modInfo,
                        prop: "items"
                    });
                    modInfo.items.forEach(itemToRemove=>{
                        const ixOld = copyTo[prop].findIndex(it=>it === itemToRemove);
                        if (~ixOld)
                            copyTo[prop].splice(ixOld, 1);
                        else
                            throw new Error(`${msgPtFailed} Could not find "${prop}" item "${itemToRemove}" to remove`);
                    }
                    );
                } else
                    throw new Error(`${msgPtFailed} One of "names" or "items" must be provided!`);
            }

            static _doMod_calculateProp({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                copyTo[prop] = copyTo[prop] || {};
                const toExec = modInfo.formula.replace(/<\$([^$]+)\$>/g, (...m)=>{
                    switch (m[1]) {
                    case "prof_bonus":
                        return Parser.crToPb(copyTo.cr);
                    case "dex_mod":
                        return Parser.getAbilityModNumber(copyTo.dex);
                    default:
                        throw new Error(`${msgPtFailed} Unknown variable "${m[1]}"`);
                    }
                }
                );
                copyTo[prop][modInfo.prop] = eval(toExec);
            }

            static _doMod_scalarAddProp({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                const applyTo = (k)=>{
                    const out = Number(copyTo[prop][k]) + modInfo.scalar;
                    const isString = typeof copyTo[prop][k] === "string";
                    copyTo[prop][k] = isString ? `${out >= 0 ? "+" : ""}${out}` : out;
                }
                ;

                if (!copyTo[prop])
                    return;
                if (modInfo.prop === "*")
                    Object.keys(copyTo[prop]).forEach(k=>applyTo(k));
                else
                    applyTo(modInfo.prop);
            }

            static _doMod_scalarMultProp({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                const applyTo = (k)=>{
                    let out = Number(copyTo[prop][k]) * modInfo.scalar;
                    if (modInfo.floor)
                        out = Math.floor(out);
                    const isString = typeof copyTo[prop][k] === "string";
                    copyTo[prop][k] = isString ? `${out >= 0 ? "+" : ""}${out}` : out;
                }
                ;

                if (!copyTo[prop])
                    return;
                if (modInfo.prop === "*")
                    Object.keys(copyTo[prop]).forEach(k=>applyTo(k));
                else
                    applyTo(modInfo.prop);
            }

            static _doMod_addSenses({copyTo, copyFrom, modInfo, msgPtFailed}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "senses"
                });
                copyTo.senses = copyTo.senses || [];
                modInfo.senses.forEach(sense=>{
                    let found = false;
                    for (let i = 0; i < copyTo.senses.length; ++i) {
                        const m = new RegExp(`${sense.type} (\\d+)`,"i").exec(copyTo.senses[i]);
                        if (m) {
                            found = true;
                            if (Number(m[1]) < sense.range) {
                                copyTo.senses[i] = `${sense.type} ${sense.range} ft.`;
                            }
                            break;
                        }
                    }

                    if (!found)
                        copyTo.senses.push(`${sense.type} ${sense.range} ft.`);
                }
                );
            }

            static _doMod_addSaves({copyTo, copyFrom, modInfo, msgPtFailed}) {
                copyTo.save = copyTo.save || {};
                Object.entries(modInfo.saves).forEach(([save,mode])=>{
                    const total = mode * Parser.crToPb(copyTo.cr) + Parser.getAbilityModNumber(copyTo[save]);
                    const asText = total >= 0 ? `+${total}` : total;
                    if (copyTo.save && copyTo.save[save]) {
                        if (Number(copyTo.save[save]) < total)
                            copyTo.save[save] = asText;
                    } else
                        copyTo.save[save] = asText;
                }
                );
            }

            static _doMod_addSkills({copyTo, copyFrom, modInfo, msgPtFailed}) {
                copyTo.skill = copyTo.skill || {};
                Object.entries(modInfo.skills).forEach(([skill,mode])=>{
                    const total = mode * Parser.crToPb(copyTo.cr) + Parser.getAbilityModNumber(copyTo[Parser.skillToAbilityAbv(skill)]);
                    const asText = total >= 0 ? `+${total}` : total;
                    if (copyTo.skill && copyTo.skill[skill]) {
                        if (Number(copyTo.skill[skill]) < total)
                            copyTo.skill[skill] = asText;
                    } else
                        copyTo.skill[skill] = asText;
                }
                );
            }

            static _doMod_addAllSaves({copyTo, copyFrom, modInfo, msgPtFailed}) {
                return this._doMod_addSaves({
                    copyTo,
                    copyFrom,
                    modInfo: {
                        mode: "addSaves",
                        saves: Object.keys(Parser.ATB_ABV_TO_FULL).mergeMap(it=>({
                            [it]: modInfo.saves
                        })),
                    },
                    msgPtFailed,
                });
            }

            static _doMod_addAllSkills({copyTo, copyFrom, modInfo, msgPtFailed}) {
                return this._doMod_addSkills({
                    copyTo,
                    copyFrom,
                    modInfo: {
                        mode: "addSkills",
                        skills: Object.keys(Parser.SKILL_TO_ATB_ABV).mergeMap(it=>({
                            [it]: modInfo.skills
                        })),
                    },
                    msgPtFailed,
                });
            }

            static _doMod_addSpells({copyTo, copyFrom, modInfo, msgPtFailed}) {
                if (!copyTo.spellcasting)
                    throw new Error(`${msgPtFailed} Creature did not have a spellcasting property!`);

                const spellcasting = copyTo.spellcasting[0];

                if (modInfo.spells) {
                    const spells = spellcasting.spells;

                    Object.keys(modInfo.spells).forEach(k=>{
                        if (!spells[k])
                            spells[k] = modInfo.spells[k];
                        else {
                            const spellCategoryNu = modInfo.spells[k];
                            const spellCategoryOld = spells[k];
                            Object.keys(spellCategoryNu).forEach(kk=>{
                                if (!spellCategoryOld[kk])
                                    spellCategoryOld[kk] = spellCategoryNu[kk];
                                else {
                                    if (typeof spellCategoryOld[kk] === "object") {
                                        if (spellCategoryOld[kk]instanceof Array)
                                            spellCategoryOld[kk] = spellCategoryOld[kk].concat(spellCategoryNu[kk]).sort(SortUtil.ascSortLower);
                                        else
                                            throw new Error(`${msgPtFailed} Object at key ${kk} not an array!`);
                                    } else
                                        spellCategoryOld[kk] = spellCategoryNu[kk];
                                }
                            }
                            );
                        }
                    }
                    );
                }

                ["constant", "will", "ritual"].forEach(prop=>{
                    if (!modInfo[prop])
                        return;
                    modInfo[prop].forEach(sp=>(spellcasting[prop] = spellcasting[prop] || []).push(sp));
                }
                );

                ["recharge", "charges", "rest", "daily", "weekly", "yearly"].forEach(prop=>{
                    if (!modInfo[prop])
                        return;

                    for (let i = 1; i <= 9; ++i) {
                        const e = `${i}e`;

                        spellcasting[prop] = spellcasting[prop] || {};

                        if (modInfo[prop][i]) {
                            modInfo[prop][i].forEach(sp=>(spellcasting[prop][i] = spellcasting[prop][i] || []).push(sp));
                        }

                        if (modInfo[prop][e]) {
                            modInfo[prop][e].forEach(sp=>(spellcasting[prop][e] = spellcasting[prop][e] || []).push(sp));
                        }
                    }
                }
                );
            }

            static _doMod_replaceSpells({copyTo, copyFrom, modInfo, msgPtFailed}) {
                if (!copyTo.spellcasting)
                    throw new Error(`${msgPtFailed} Creature did not have a spellcasting property!`);

                const spellcasting = copyTo.spellcasting[0];

                const handleReplace = (curSpells,replaceMeta,k)=>{
                    this._doEnsureArray({
                        obj: replaceMeta,
                        prop: "with"
                    });

                    const ix = curSpells[k].indexOf(replaceMeta.replace);
                    if (~ix) {
                        curSpells[k].splice(ix, 1, ...replaceMeta.with);
                        curSpells[k].sort(SortUtil.ascSortLower);
                    } else
                        throw new Error(`${msgPtFailed} Could not find spell "${replaceMeta.replace}" to replace`);
                }
                ;

                if (modInfo.spells) {
                    const trait0 = spellcasting.spells;
                    Object.keys(modInfo.spells).forEach(k=>{
                        if (trait0[k]) {
                            const replaceMetas = modInfo.spells[k];
                            const curSpells = trait0[k];
                            replaceMetas.forEach(replaceMeta=>handleReplace(curSpells, replaceMeta, "spells"));
                        }
                    }
                    );
                }

                if (modInfo.daily) {
                    for (let i = 1; i <= 9; ++i) {
                        const e = `${i}e`;

                        if (modInfo.daily[i]) {
                            modInfo.daily[i].forEach(replaceMeta=>handleReplace(spellcasting.daily, replaceMeta, i));
                        }

                        if (modInfo.daily[e]) {
                            modInfo.daily[e].forEach(replaceMeta=>handleReplace(spellcasting.daily, replaceMeta, e));
                        }
                    }
                }
            }

            static _doMod_removeSpells({copyTo, copyFrom, modInfo, msgPtFailed}) {
                if (!copyTo.spellcasting)
                    throw new Error(`${msgPtFailed} Creature did not have a spellcasting property!`);

                const spellcasting = copyTo.spellcasting[0];

                if (modInfo.spells) {
                    const spells = spellcasting.spells;

                    Object.keys(modInfo.spells).forEach(k=>{
                        if (!spells[k]?.spells)
                            return;

                        spells[k].spells = spells[k].spells.filter(it=>!modInfo.spells[k].includes(it));
                    }
                    );
                }

                ["constant", "will", "ritual"].forEach(prop=>{
                    if (!modInfo[prop])
                        return;
                    spellcasting[prop].filter(it=>!modInfo[prop].includes(it));
                }
                );

                ["recharge", "charges", "rest", "daily", "weekly", "yearly"].forEach(prop=>{
                    if (!modInfo[prop])
                        return;

                    for (let i = 1; i <= 9; ++i) {
                        const e = `${i}e`;

                        spellcasting[prop] = spellcasting[prop] || {};

                        if (modInfo[prop][i]) {
                            spellcasting[prop][i] = spellcasting[prop][i].filter(it=>!modInfo[prop][i].includes(it));
                        }

                        if (modInfo[prop][e]) {
                            spellcasting[prop][e] = spellcasting[prop][e].filter(it=>!modInfo[prop][e].includes(it));
                        }
                    }
                }
                );
            }

            static _doMod_scalarAddHit({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (!copyTo[prop])
                    return;
                copyTo[prop] = JSON.parse(JSON.stringify(copyTo[prop]).replace(/{@hit ([-+]?\d+)}/g, (m0,m1)=>`{@hit ${Number(m1) + modInfo.scalar}}`));
            }

            static _doMod_scalarAddDc({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (!copyTo[prop])
                    return;
                copyTo[prop] = JSON.parse(JSON.stringify(copyTo[prop]).replace(/{@dc (\d+)(?:\|[^}]+)?}/g, (m0,m1)=>`{@dc ${Number(m1) + modInfo.scalar}}`));
            }

            static _doMod_maxSize({copyTo, copyFrom, modInfo, msgPtFailed}) {
                const sizes = [...copyTo.size].sort(SortUtil.ascSortSize);

                const ixsCur = sizes.map(it=>Parser.SIZE_ABVS.indexOf(it));
                const ixMax = Parser.SIZE_ABVS.indexOf(modInfo.max);

                if (!~ixMax || ixsCur.some(ix=>!~ix))
                    throw new Error(`${msgPtFailed} Unhandled size!`);

                const ixsNxt = ixsCur.filter(ix=>ix <= ixMax);
                if (!ixsNxt.length)
                    ixsNxt.push(ixMax);

                copyTo.size = ixsNxt.map(ix=>Parser.SIZE_ABVS[ix]);
            }

            static _doMod_scalarMultXp({copyTo, copyFrom, modInfo, msgPtFailed}) {
                const getOutput = (input)=>{
                    let out = input * modInfo.scalar;
                    if (modInfo.floor)
                        out = Math.floor(out);
                    return out;
                }
                ;

                if (copyTo.cr.xp)
                    copyTo.cr.xp = getOutput(copyTo.cr.xp);
                else {
                    const curXp = Parser.crToXpNumber(copyTo.cr);
                    if (!copyTo.cr.cr)
                        copyTo.cr = {
                            cr: copyTo.cr
                        };
                    copyTo.cr.xp = getOutput(curXp);
                }
            }

            static _doMod_setProp({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                const propPath = modInfo.prop.split(".");
                if (prop !== "*")
                    propPath.unshift(prop);
                MiscUtil.set(copyTo, ...propPath, MiscUtil.copyFast(modInfo.value));
            }

            static _doMod_handleProp({copyTo, copyFrom, modInfos, msgPtFailed, prop=null}) {
                modInfos.forEach(modInfo=>{
                    if (typeof modInfo === "string") {
                        switch (modInfo) {
                        case "remove":
                            return delete copyTo[prop];
                        default:
                            throw new Error(`${msgPtFailed} Unhandled mode: ${modInfo}`);
                        }
                    } else {
                        switch (modInfo.mode) {
                        case "appendStr":
                            return this._doMod_appendStr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "replaceName":
                            return this._doMod_replaceName({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "replaceTxt":
                            return this._doMod_replaceTxt({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "prependArr":
                            return this._doMod_prependArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "appendArr":
                            return this._doMod_appendArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "replaceArr":
                            return this._doMod_replaceArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "replaceOrAppendArr":
                            return this._doMod_replaceOrAppendArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "appendIfNotExistsArr":
                            return this._doMod_appendIfNotExistsArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "insertArr":
                            return this._doMod_insertArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "removeArr":
                            return this._doMod_removeArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "calculateProp":
                            return this._doMod_calculateProp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "scalarAddProp":
                            return this._doMod_scalarAddProp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "scalarMultProp":
                            return this._doMod_scalarMultProp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "setProp":
                            return this._doMod_setProp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "addSenses":
                            return this._doMod_addSenses({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addSaves":
                            return this._doMod_addSaves({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addSkills":
                            return this._doMod_addSkills({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addAllSaves":
                            return this._doMod_addAllSaves({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addAllSkills":
                            return this._doMod_addAllSkills({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addSpells":
                            return this._doMod_addSpells({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "replaceSpells":
                            return this._doMod_replaceSpells({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "removeSpells":
                            return this._doMod_removeSpells({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "maxSize":
                            return this._doMod_maxSize({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "scalarMultXp":
                            return this._doMod_scalarMultXp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "scalarAddHit":
                            return this._doMod_scalarAddHit({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "scalarAddDc":
                            return this._doMod_scalarAddDc({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        default:
                            throw new Error(`${msgPtFailed} Unhandled mode: ${modInfo.mode}`);
                        }
                    }
                }
                );
            }

            static _doMod({copyTo, copyFrom, modInfos, msgPtFailed, props=null, isExternalApplicationIdentityOnly}) {
                if (isExternalApplicationIdentityOnly)
                    return;

                if (props?.length)
                    props.forEach(prop=>this._doMod_handleProp({
                        copyTo,
                        copyFrom,
                        modInfos,
                        msgPtFailed,
                        prop
                    }));
                else
                    this._doMod_handleProp({
                        copyTo,
                        copyFrom,
                        modInfos,
                        msgPtFailed
                    });
            }

            static getCopy(impl, copyFrom, copyTo, templateData, {isExternalApplicationKeepCopy=false, isExternalApplicationIdentityOnly=false}={}) {
                if (isExternalApplicationKeepCopy)
                    copyTo.__copy = MiscUtil.copyFast(copyFrom);

                const msgPtFailed = `Failed to apply _copy to "${copyTo.name}" ("${copyTo.source}").`;

                const copyMeta = copyTo._copy || {};

                if (copyMeta._mod)
                    this._normaliseMods(copyMeta);

                let template = null;
                if (copyMeta._trait) {
                    template = templateData.monsterTemplate.find(t=>t.name.toLowerCase() === copyMeta._trait.name.toLowerCase() && t.source.toLowerCase() === copyMeta._trait.source.toLowerCase());
                    if (!template)
                        throw new Error(`${msgPtFailed} Could not find traits to apply with name "${copyMeta._trait.name}" and source "${copyMeta._trait.source}"`);
                    template = MiscUtil.copyFast(template);

                    if (template.apply._mod) {
                        this._normaliseMods(template.apply);

                        if (copyMeta._mod) {
                            Object.entries(template.apply._mod).forEach(([k,v])=>{
                                if (copyMeta._mod[k])
                                    copyMeta._mod[k] = copyMeta._mod[k].concat(v);
                                else
                                    copyMeta._mod[k] = v;
                            }
                            );
                        } else
                            copyMeta._mod = template.apply._mod;
                    }

                    delete copyMeta._trait;
                }

                const copyToRootProps = new Set(Object.keys(copyTo));

                Object.keys(copyFrom).forEach(k=>{
                    if (copyTo[k] === null)
                        return delete copyTo[k];
                    if (copyTo[k] == null) {
                        if (DataUtil.generic._MERGE_REQUIRES_PRESERVE_BASE[k] || impl?._MERGE_REQUIRES_PRESERVE[k]) {
                            if (copyTo._copy._preserve?.["*"] || copyTo._copy._preserve?.[k])
                                copyTo[k] = copyFrom[k];
                        } else
                            copyTo[k] = copyFrom[k];
                    }
                }
                );

                if (template && template.apply._root) {
                    Object.entries(template.apply._root).filter(([k,v])=>!copyToRootProps.has(k)).forEach(([k,v])=>copyTo[k] = v);
                }

                if (copyMeta._mod) {
                    Object.entries(copyMeta._mod).forEach(([k,v])=>{
                        copyMeta._mod[k] = DataUtil.generic.variableResolver.resolve({
                            obj: v,
                            ent: copyTo
                        });
                    }
                    );

                    Object.entries(copyMeta._mod).forEach(([prop,modInfos])=>{
                        if (prop === "*")
                            this._doMod({
                                copyTo,
                                copyFrom,
                                modInfos,
                                props: DataUtil.generic.COPY_ENTRY_PROPS,
                                msgPtFailed,
                                isExternalApplicationIdentityOnly
                            });
                        else if (prop === "_")
                            this._doMod({
                                copyTo,
                                copyFrom,
                                modInfos,
                                msgPtFailed,
                                isExternalApplicationIdentityOnly
                            });
                        else
                            this._doMod({
                                copyTo,
                                copyFrom,
                                modInfos,
                                props: [prop],
                                msgPtFailed,
                                isExternalApplicationIdentityOnly
                            });
                    }
                    );
                }

                copyTo._isCopy = true;

                delete copyTo._copy;
            }
        }
        ,

        variableResolver: class {
            static _getSize({ent}) {
                return ent.size?.[0] || Parser.SZ_MEDIUM;
            }

            static _SIZE_TO_MULT = {
                [Parser.SZ_LARGE]: 2,
                [Parser.SZ_HUGE]: 3,
                [Parser.SZ_GARGANTUAN]: 4,
            };

            static _getSizeMult(size) {
                return this._SIZE_TO_MULT[size] ?? 1;
            }

            static _getCleanMathExpression(str) {
                return str.replace(/[^-+/*0-9.,]+/g, "");
            }

            static resolve({obj, ent, msgPtFailed=null}) {
                return JSON.parse(JSON.stringify(obj).replace(/<\$(?<variable>[^$]+)\$>/g, (...m)=>{
                    const [mode,detail] = m.last().variable.split("__");

                    switch (mode) {
                    case "name":
                        return ent.name;
                    case "short_name":
                    case "title_short_name":
                        {
                            return Renderer.monster.getShortName(ent, {
                                isTitleCase: mode === "title_short_name"
                            });
                        }

                    case "dc":
                    case "spell_dc":
                        {
                            if (!Parser.ABIL_ABVS.includes(detail))
                                throw new Error(`${msgPtFailed ? `${msgPtFailed} ` : ""} Unknown ability score "${detail}"`);
                            return 8 + Parser.getAbilityModNumber(Number(ent[detail])) + Parser.crToPb(ent.cr);
                        }

                    case "to_hit":
                        {
                            if (!Parser.ABIL_ABVS.includes(detail))
                                throw new Error(`${msgPtFailed ? `${msgPtFailed} ` : ""} Unknown ability score "${detail}"`);
                            const total = Parser.crToPb(ent.cr) + Parser.getAbilityModNumber(Number(ent[detail]));
                            return total >= 0 ? `+${total}` : total;
                        }

                    case "damage_mod":
                        {
                            if (!Parser.ABIL_ABVS.includes(detail))
                                throw new Error(`${msgPtFailed ? `${msgPtFailed} ` : ""} Unknown ability score "${detail}"`);
                            const total = Parser.getAbilityModNumber(Number(ent[detail]));
                            return total === 0 ? "" : total > 0 ? ` + ${total}` : ` - ${Math.abs(total)}`;
                        }

                    case "damage_avg":
                        {
                            const replaced = detail.replace(/\b(?<abil>str|dex|con|int|wis|cha)\b/gi, (...m)=>Parser.getAbilityModNumber(Number(ent[m.last().abil]))).replace(/\bsize_mult\b/g, ()=>this._getSizeMult(this._getSize({
                                ent
                            })));

                            return Math.floor(eval(this._getCleanMathExpression(replaced)));
                        }

                    case "size_mult":
                        {
                            const mult = this._getSizeMult(this._getSize({
                                ent
                            }));

                            if (!detail)
                                return mult;

                            return Math.floor(eval(`${mult} * ${this._getCleanMathExpression(detail)}`));
                        }

                    default:
                        return m[0];
                    }
                }
                ), );
            }
        }
        ,

        getVersions(parent, {impl=null, isExternalApplicationIdentityOnly=false}={}) {
            if (!parent?._versions?.length)
                return [];

            return parent._versions.map(ver=>{
                if (ver._template && ver._implementations?.length)
                    return DataUtil.generic._getVersions_template({
                        ver
                    });
                return DataUtil.generic._getVersions_basic({
                    ver
                });
            }
            ).flat().map(ver=>DataUtil.generic._getVersion({
                parentEntity: parent,
                version: ver,
                impl,
                isExternalApplicationIdentityOnly
            }));
        },

        _getVersions_template({ver}) {
            return ver._implementations.map(impl=>{
                let cpyTemplate = MiscUtil.copyFast(ver._template);
                const cpyImpl = MiscUtil.copyFast(impl);

                DataUtil.generic._getVersions_mutExpandCopy({
                    ent: cpyTemplate
                });

                if (cpyImpl._variables) {
                    cpyTemplate = MiscUtil.getWalker().walk(cpyTemplate, {
                        string: str=>str.replace(/{{([^}]+)}}/g, (...m)=>cpyImpl._variables[m[1]]),
                    }, );
                    delete cpyImpl._variables;
                }

                Object.assign(cpyTemplate, cpyImpl);

                return cpyTemplate;
            }
            );
        },

        _getVersions_basic({ver}) {
            const cpyVer = MiscUtil.copyFast(ver);
            DataUtil.generic._getVersions_mutExpandCopy({
                ent: cpyVer
            });
            return cpyVer;
        },

        _getVersions_mutExpandCopy({ent}) {
            ent._copy = {
                _mod: ent._mod,
                _preserve: ent._preserve || {
                    "*": true
                },
            };
            delete ent._mod;
            delete ent._preserve;
        },

        _getVersion({parentEntity, version, impl=null, isExternalApplicationIdentityOnly}) {
            const additionalData = {
                _versionBase_isVersion: true,
                _versionBase_name: parentEntity.name,
                _versionBase_source: parentEntity.source,
                _versionBase_hasToken: parentEntity.hasToken,
                _versionBase_hasFluff: parentEntity.hasFluff,
                _versionBase_hasFluffImages: parentEntity.hasFluffImages,
            };
            const cpyParentEntity = MiscUtil.copyFast(parentEntity);

            delete cpyParentEntity._versions;
            delete cpyParentEntity.hasToken;
            delete cpyParentEntity.hasFluff;
            delete cpyParentEntity.hasFluffImages;

            DataUtil.generic.copyApplier.getCopy(impl, cpyParentEntity, version, null, {
                isExternalApplicationIdentityOnly
            }, );
            Object.assign(version, additionalData);
            return version;
        },
    },

    proxy: {
        getVersions(prop, ent, {isExternalApplicationIdentityOnly=false}={}) {
            if (DataUtil[prop]?.getVersions)
                return DataUtil[prop]?.getVersions(ent, {
                    isExternalApplicationIdentityOnly
                });
            return DataUtil.generic.getVersions(ent, {
                isExternalApplicationIdentityOnly
            });
        },

        unpackUid(prop, uid, tag, opts) {
            if (DataUtil[prop]?.unpackUid)
                return DataUtil[prop]?.unpackUid(uid, tag, opts);
            return DataUtil.generic.unpackUid(uid, tag, opts);
        },

        getNormalizedUid(prop, uid, tag, opts) {
            if (DataUtil[prop]?.getNormalizedUid)
                return DataUtil[prop].getNormalizedUid(uid, tag, opts);
            return DataUtil.generic.getNormalizedUid(uid, tag, opts);
        },

        getUid(prop, ent, opts) {
            if (DataUtil[prop]?.getUid)
                return DataUtil[prop].getUid(ent, opts);
            return DataUtil.generic.getUid(ent, opts);
        },
    },

    monster: class extends _DataUtilPropConfigMultiSource {
        static _MERGE_REQUIRES_PRESERVE = {
            legendaryGroup: true,
            environment: true,
            soundClip: true,
            altArt: true,
            variant: true,
            dragonCastingColor: true,
            familiar: true,
        };

        static _PAGE = UrlUtil.PG_BESTIARY;

        static _DIR = "bestiary";
        static _PROP = "monster";

        static async loadJSON() {
            await DataUtil.monster.pPreloadMeta();
            return super.loadJSON();
        }

        static getVersions(mon, {isExternalApplicationIdentityOnly=false}={}) {
            const additionalVersionData = DataUtil.monster._getAdditionalVersionsData(mon);
            if (additionalVersionData.length) {
                mon = MiscUtil.copyFast(mon);
                (mon._versions = mon._versions || []).push(...additionalVersionData);
            }
            return DataUtil.generic.getVersions(mon, {
                impl: DataUtil.monster,
                isExternalApplicationIdentityOnly
            });
        }

        static _getAdditionalVersionsData(mon) {
            if (!mon.variant?.length)
                return [];

            return mon.variant.filter(it=>it._version).map(it=>{
                const toAdd = {
                    name: it._version.name || it.name,
                    source: it._version.source || it.source || mon.source,
                    variant: null,
                };

                if (it._version.addAs) {
                    const cpy = MiscUtil.copyFast(it);
                    delete cpy._version;
                    delete cpy.type;
                    delete cpy.source;
                    delete cpy.page;

                    toAdd._mod = {
                        [it._version.addAs]: {
                            mode: "appendArr",
                            items: cpy,
                        },
                    };

                    return toAdd;
                }

                if (it._version.addHeadersAs) {
                    const cpy = MiscUtil.copyFast(it);
                    cpy.entries = cpy.entries.filter(it=>it.name && it.entries);
                    cpy.entries.forEach(cpyEnt=>{
                        delete cpyEnt.type;
                        delete cpyEnt.source;
                    }
                    );

                    toAdd._mod = {
                        [it._version.addHeadersAs]: {
                            mode: "appendArr",
                            items: cpy.entries,
                        },
                    };

                    return toAdd;
                }
            }
            ).filter(Boolean);
        }

        static async pPreloadMeta() {
            DataUtil.monster._pLoadMeta = DataUtil.monster._pLoadMeta || ((async()=>{
                const legendaryGroups = await DataUtil.legendaryGroup.pLoadAll();
                DataUtil.monster.populateMetaReference({
                    legendaryGroup: legendaryGroups
                });
            }
            )());
            await DataUtil.monster._pLoadMeta;
        }

        static _pLoadMeta = null;
        static metaGroupMap = {};
        static getMetaGroup(mon) {
            if (!mon.legendaryGroup || !mon.legendaryGroup.source || !mon.legendaryGroup.name)
                return null;
            return (DataUtil.monster.metaGroupMap[mon.legendaryGroup.source] || {})[mon.legendaryGroup.name];
        }
        static populateMetaReference(data) {
            (data.legendaryGroup || []).forEach(it=>{
                (DataUtil.monster.metaGroupMap[it.source] = DataUtil.monster.metaGroupMap[it.source] || {})[it.name] = it;
            }
            );
        }
    }
    ,

    monsterFluff: class extends _DataUtilPropConfigMultiSource {
        static _PAGE = UrlUtil.PG_BESTIARY;
        static _DIR = "bestiary";
        static _PROP = "monsterFluff";
    }
    ,

    monsterTemplate: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = "monsterTemplate";
        static _FILENAME = "bestiary/template.json";
    }
    ,

    spell: class extends _DataUtilPropConfigMultiSource {
        static _PAGE = UrlUtil.PG_SPELLS;
        static _DIR = "spells";
        static _PROP = "spell";
        static _IS_MUT_ENTITIES = true;

        static _SPELL_SOURCE_LOOKUP = null;

        static PROPS_SPELL_SOURCE = ["classes", "races", "optionalfeatures", "backgrounds", "feats", "charoptions", "rewards", ];

        static setSpellSourceLookup(lookup, {isExternalApplication=false}={}) {
            if (!isExternalApplication)
                throw new Error("Should not be calling this!");
            this._SPELL_SOURCE_LOOKUP = MiscUtil.copyFast(lookup);
        }

        static mutEntity(sp, {isExternalApplication=false}={}) {
            if (!isExternalApplication)
                throw new Error("Should not be calling this!");
            return this._mutEntity(sp);
        }

        static unmutEntity(sp, {isExternalApplication=false}={}) {
            if (!isExternalApplication)
                throw new Error("Should not be calling this!");
            this.PROPS_SPELL_SOURCE.forEach(prop=>delete sp[prop]);
            delete sp._isMutEntity;
        }

        static mutEntityBrewBuilder(sp, sourcesLookup) {
            const out = this._mutEntity(sp, {
                sourcesLookup
            });
            delete sp._isMutEntity;
            return out;
        }

        static async _pInitPreData_() {
            this._SPELL_SOURCE_LOOKUP = await DataUtil.loadRawJSON(`${Renderer.get().baseUrl}data/generated/gendata-spell-source-lookup.json`);
        }

        static _mutEntity(sp, {sourcesLookup=null}={}) {
            if (sp._isMutEntity)
                return sp;

            const spSources = (sourcesLookup ?? this._SPELL_SOURCE_LOOKUP)[sp.source.toLowerCase()]?.[sp.name.toLowerCase()];
            if (!spSources)
                return sp;

            this._mutSpell_class({
                sp,
                spSources,
                propSources: "class",
                propClasses: "fromClassList"
            });
            this._mutSpell_class({
                sp,
                spSources,
                propSources: "classVariant",
                propClasses: "fromClassListVariant"
            });
            this._mutSpell_subclass({
                sp,
                spSources
            });
            this._mutSpell_race({
                sp,
                spSources
            });
            this._mutSpell_optionalfeature({
                sp,
                spSources
            });
            this._mutSpell_background({
                sp,
                spSources
            });
            this._mutSpell_feat({
                sp,
                spSources
            });
            this._mutSpell_charoption({
                sp,
                spSources
            });
            this._mutSpell_reward({
                sp,
                spSources
            });

            sp._isMutEntity = true;

            return sp;
        }

        static _mutSpell_class({sp, spSources, propSources, propClasses}) {
            if (!spSources[propSources])
                return;

            Object.entries(spSources[propSources]).forEach(([source,nameTo])=>{
                const tgt = MiscUtil.getOrSet(sp, "classes", propClasses, []);

                Object.entries(nameTo).forEach(([name,val])=>{
                    if (tgt.some(it=>it.name === nameTo && it.source === source))
                        return;

                    const toAdd = {
                        name,
                        source
                    };
                    if (val === true)
                        return tgt.push(toAdd);

                    if (val.definedInSource) {
                        toAdd.definedInSource = val.definedInSource;
                        tgt.push(toAdd);
                        return;
                    }

                    if (val.definedInSources) {
                        val.definedInSources.forEach(definedInSource=>{
                            const cpyToAdd = MiscUtil.copyFast(toAdd);

                            if (definedInSource == null) {
                                return tgt.push(cpyToAdd);
                            }

                            cpyToAdd.definedInSource = definedInSource;
                            tgt.push(cpyToAdd);
                        }
                        );

                        return;
                    }

                    throw new Error("Unimplemented!");
                }
                );
            }
            );
        }

        static _mutSpell_subclass({sp, spSources}) {
            if (!spSources.subclass)
                return;

            Object.entries(spSources.subclass).forEach(([classSource,classNameTo])=>{
                Object.entries(classNameTo).forEach(([className,sourceTo])=>{
                    Object.entries(sourceTo).forEach(([source,nameTo])=>{
                        const tgt = MiscUtil.getOrSet(sp, "classes", "fromSubclass", []);

                        Object.entries(nameTo).forEach(([name,val])=>{
                            if (val === true)
                                throw new Error("Unimplemented!");

                            if (tgt.some(it=>it.class.name === className && it.class.source === classSource && it.subclass.name === name && it.subclass.source === source && ((it.subclass.subSubclass == null && val.subSubclasses == null) || val.subSubclasses.includes(it.subclass.subSubclass))))
                                return;

                            const toAdd = {
                                class: {
                                    name: className,
                                    source: classSource,
                                },
                                subclass: {
                                    name: val.name,
                                    shortName: name,
                                    source,
                                },
                            };

                            if (!val.subSubclasses?.length)
                                return tgt.push(toAdd);

                            val.subSubclasses.forEach(subSubclass=>{
                                const cpyToAdd = MiscUtil.copyFast(toAdd);
                                cpyToAdd.subclass.subSubclass = subSubclass;
                                tgt.push(cpyToAdd);
                            }
                            );
                        }
                        );
                    }
                    );
                }
                );
            }
            );
        }

        static _mutSpell_race({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "race",
                propSpell: "races"
            });
        }

        static _mutSpell_optionalfeature({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "optionalfeature",
                propSpell: "optionalfeatures"
            });
        }

        static _mutSpell_background({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "background",
                propSpell: "backgrounds"
            });
        }

        static _mutSpell_feat({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "feat",
                propSpell: "feats"
            });
        }

        static _mutSpell_charoption({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "charoption",
                propSpell: "charoptions"
            });
        }

        static _mutSpell_reward({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "reward",
                propSpell: "rewards"
            });
        }

        static _mutSpell_generic({sp, spSources, propSources, propSpell}) {
            if (!spSources[propSources])
                return;

            Object.entries(spSources[propSources]).forEach(([source,nameTo])=>{
                const tgt = MiscUtil.getOrSet(sp, propSpell, []);

                Object.entries(nameTo).forEach(([name,val])=>{
                    if (tgt.some(it=>it.name === nameTo && it.source === source))
                        return;

                    const toAdd = {
                        name,
                        source
                    };
                    if (val === true)
                        return tgt.push(toAdd);

                    Object.assign(toAdd, {
                        ...val
                    });
                    tgt.push(toAdd);
                }
                );
            }
            );
        }
    }
    ,

    spellFluff: class extends _DataUtilPropConfigMultiSource {
        static _PAGE = UrlUtil.PG_SPELLS;
        static _DIR = "spells";
        static _PROP = "spellFluff";
    }
    ,

    background: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_BACKGROUNDS;
        static _FILENAME = "backgrounds.json";
    }
    ,

    backgroundFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_BACKGROUNDS;
        static _FILENAME = "fluff-backgrounds.json";
    }
    ,

    charoption: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CHAR_CREATION_OPTIONS;
        static _FILENAME = "charcreationoptions.json";
    }
    ,

    charoptionFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CHAR_CREATION_OPTIONS;
        static _FILENAME = "fluff-charcreationoptions.json";
    }
    ,

    condition: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CONDITIONS_DISEASES;
        static _FILENAME = "conditionsdiseases.json";
    }
    ,

    conditionFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CONDITIONS_DISEASES;
        static _FILENAME = "fluff-conditionsdiseases.json";
    }
    ,

    disease: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CONDITIONS_DISEASES;
        static _FILENAME = "conditionsdiseases.json";
    }
    ,

    feat: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_FEATS;
        static _FILENAME = "feats.json";
    }
    ,

    featFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_FEATS;
        static _FILENAME = "fluff-feats.json";
    }
    ,

    item: class extends _DataUtilPropConfigCustom {
        static _MERGE_REQUIRES_PRESERVE = {
            lootTables: true,
            tier: true,
        };
        static _PAGE = UrlUtil.PG_ITEMS;

        static async loadRawJSON() {
            if (DataUtil.item._loadedRawJson)
                return DataUtil.item._loadedRawJson;

            DataUtil.item._pLoadingRawJson = (async()=>{
                const urlItems = `${Renderer.get().baseUrl}data/items.json`;
                const urlItemsBase = `${Renderer.get().baseUrl}data/items-base.json`;
                const urlVariants = `${Renderer.get().baseUrl}data/magicvariants.json`;

                const [dataItems,dataItemsBase,dataVariants] = await Promise.all([DataUtil.loadJSON(urlItems), DataUtil.loadJSON(urlItemsBase), DataUtil.loadJSON(urlVariants), ]);

                DataUtil.item._loadedRawJson = {
                    item: MiscUtil.copyFast(dataItems.item),
                    itemGroup: MiscUtil.copyFast(dataItems.itemGroup),
                    magicvariant: MiscUtil.copyFast(dataVariants.magicvariant),
                    baseitem: MiscUtil.copyFast(dataItemsBase.baseitem),
                };
            }
            )();
            await DataUtil.item._pLoadingRawJson;

            return DataUtil.item._loadedRawJson;
        }

        static async loadJSON() {
            return {
                item: await Renderer.item.pBuildList()
            };
        }

        static async loadPrerelease() {
            return {
                item: await Renderer.item.pGetItemsFromPrerelease()
            };
        }

        static async loadBrew() {
            return {
                item: await Renderer.item.pGetItemsFromBrew()
            };
        }
    }
    ,

    itemGroup: class extends _DataUtilPropConfig {
        static _MERGE_REQUIRES_PRESERVE = {
            lootTables: true,
            tier: true,
        };
        static _PAGE = UrlUtil.PG_ITEMS;

        static async pMergeCopy(...args) {
            return DataUtil.item.pMergeCopy(...args);
        }
        static async loadRawJSON(...args) {
            return DataUtil.item.loadRawJSON(...args);
        }
    }
    ,

    baseitem: class extends _DataUtilPropConfig {
        static _PAGE = UrlUtil.PG_ITEMS;

        static async pMergeCopy(...args) {
            return DataUtil.item.pMergeCopy(...args);
        }
        static async loadRawJSON(...args) {
            return DataUtil.item.loadRawJSON(...args);
        }
    }
    ,

    itemFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_ITEMS;
        static _FILENAME = "fluff-items.json";
    }
    ,

    itemType: class extends _DataUtilPropConfig {
        static _PAGE = "itemType";
    }
    ,

    language: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_LANGUAGES;
        static _FILENAME = "languages.json";

        static async loadJSON() {
            const rawData = await super.loadJSON();

            const scriptLookup = {};
            (rawData.languageScript || []).forEach(script=>scriptLookup[script.name] = script);

            const out = {
                language: MiscUtil.copyFast(rawData.language)
            };
            out.language.forEach(lang=>{
                if (!lang.script || lang.fonts === false)
                    return;

                const script = scriptLookup[lang.script];
                if (!script)
                    return;

                lang._fonts = [...script.fonts];
            }
            );

            return out;
        }
    }
    ,

    languageFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_LANGUAGES;
        static _FILENAME = "fluff-languages.json";
    }
    ,

    object: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_OBJECTS;
        static _FILENAME = "objects.json";
    }
    ,

    objectFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_OBJECTS;
        static _FILENAME = "fluff-objects.json";
    }
    ,

    race: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_RACES;
        static _FILENAME = "races.json";

        static _loadCache = {};
        static _pIsLoadings = {};
        static async loadJSON({isAddBaseRaces=false}={}) {
            if (!DataUtil.race._pIsLoadings[isAddBaseRaces]) {
                DataUtil.race._pIsLoadings[isAddBaseRaces] = (async()=>{
                    DataUtil.race._loadCache[isAddBaseRaces] = DataUtil.race.getPostProcessedSiteJson(await this.loadRawJSON(), {
                        isAddBaseRaces
                    }, );
                }
                )();
            }
            await DataUtil.race._pIsLoadings[isAddBaseRaces];
            return DataUtil.race._loadCache[isAddBaseRaces];
        }

        static getPostProcessedSiteJson(rawRaceData, {isAddBaseRaces=false}={}) {
            rawRaceData = MiscUtil.copyFast(rawRaceData);
            (rawRaceData.subrace || []).forEach(sr=>{
                const r = rawRaceData.race.find(it=>it.name === sr.raceName && it.source === sr.raceSource);
                if (!r)
                    return JqueryUtil.doToast({
                        content: `Failed to find race "${sr.raceName}" (${sr.raceSource})`,
                        type: "danger"
                    });
                const cpySr = MiscUtil.copyFast(sr);
                delete cpySr.raceName;
                delete cpySr.raceSource;
                (r.subraces = r.subraces || []).push(sr);
            }
            );
            delete rawRaceData.subrace;
            const raceData = Renderer.race.mergeSubraces(rawRaceData.race, {
                isAddBaseRaces
            });
            raceData.forEach(it=>it.__prop = "race");
            return {
                race: raceData
            };
        }

        static async loadPrerelease({isAddBaseRaces=true}={}) {
            return DataUtil.race._loadPrereleaseBrew({
                isAddBaseRaces,
                brewUtil: typeof PrereleaseUtil !== "undefined" ? PrereleaseUtil : null
            });
        }

        static async loadBrew({isAddBaseRaces=true}={}) {
            return DataUtil.race._loadPrereleaseBrew({
                isAddBaseRaces,
                brewUtil: typeof BrewUtil2 !== "undefined" ? BrewUtil2 : null
            });
        }

        static async _loadPrereleaseBrew({isAddBaseRaces=true, brewUtil}={}) {
            if (!brewUtil)
                return {};

            const rawSite = await DataUtil.race.loadRawJSON();
            const brew = await brewUtil.pGetBrewProcessed();
            return DataUtil.race.getPostProcessedPrereleaseBrewJson(rawSite, brew, {
                isAddBaseRaces
            });
        }

        static getPostProcessedPrereleaseBrewJson(rawSite, brew, {isAddBaseRaces=false}={}) {
            rawSite = MiscUtil.copyFast(rawSite);
            brew = MiscUtil.copyFast(brew);

            const rawSiteUsed = [];
            (brew.subrace || []).forEach(sr=>{
                const rSite = rawSite.race.find(it=>it.name === sr.raceName && it.source === sr.raceSource);
                const rBrew = (brew.race || []).find(it=>it.name === sr.raceName && it.source === sr.raceSource);
                if (!rSite && !rBrew)
                    return JqueryUtil.doToast({
                        content: `Failed to find race "${sr.raceName}" (${sr.raceSource})`,
                        type: "danger"
                    });
                const rTgt = rSite || rBrew;
                const cpySr = MiscUtil.copyFast(sr);
                delete cpySr.raceName;
                delete cpySr.raceSource;
                (rTgt.subraces = rTgt.subraces || []).push(sr);
                if (rSite && !rawSiteUsed.includes(rSite))
                    rawSiteUsed.push(rSite);
            }
            );
            delete brew.subrace;

            const raceDataBrew = Renderer.race.mergeSubraces(brew.race || [], {
                isAddBaseRaces
            });
            const raceDataSite = Renderer.race.mergeSubraces(rawSiteUsed, {
                isAddBaseRaces: false
            });

            const out = [...raceDataBrew, ...raceDataSite];
            out.forEach(it=>it.__prop = "race");
            return {
                race: out
            };
        }
    }
    ,

    raceFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_RACES;
        static _FILENAME = "fluff-races.json";

        static _getApplyUncommonMonstrous(data) {
            data = MiscUtil.copyFast(data);
            data.raceFluff.forEach(raceFluff=>{
                if (raceFluff.uncommon) {
                    raceFluff.entries = raceFluff.entries || [];
                    raceFluff.entries.push(MiscUtil.copyFast(data.raceFluffMeta.uncommon));
                    delete raceFluff.uncommon;
                }

                if (raceFluff.monstrous) {
                    raceFluff.entries = raceFluff.entries || [];
                    raceFluff.entries.push(MiscUtil.copyFast(data.raceFluffMeta.monstrous));
                    delete raceFluff.monstrous;
                }
            }
            );
            return data;
        }

        static async loadJSON() {
            const data = await super.loadJSON();
            return this._getApplyUncommonMonstrous(data);
        }

        static async loadUnmergedJSON() {
            const data = await super.loadUnmergedJSON();
            return this._getApplyUncommonMonstrous(data);
        }
    }
    ,

    raceFeature: class extends _DataUtilPropConfig {
        static _PAGE = "raceFeature";
    }
    ,

    recipe: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_RECIPES;
        static _FILENAME = "recipes.json";

        static async loadJSON() {
            const rawData = await super.loadJSON();
            return {
                recipe: await DataUtil.recipe.pGetPostProcessedRecipes(rawData.recipe)
            };
        }

        static async pGetPostProcessedRecipes(recipes) {
            if (!recipes?.length)
                return;

            recipes = MiscUtil.copyFast(recipes);

            recipes.forEach(r=>Renderer.recipe.populateFullIngredients(r));

            const out = [];

            for (const r of recipes) {
                const fluff = await Renderer.utils.pGetFluff({
                    entity: r,
                    fnGetFluffData: DataUtil.recipeFluff.loadJSON.bind(DataUtil.recipeFluff),
                    fluffProp: "recipeFluff",
                });

                if (!fluff) {
                    out.push(r);
                    continue;
                }

                const cpyR = MiscUtil.copyFast(r);
                cpyR.fluff = MiscUtil.copyFast(fluff);
                delete cpyR.fluff.name;
                delete cpyR.fluff.source;
                out.push(cpyR);
            }

            return out;
        }

        static async loadPrerelease() {
            return this._loadPrereleaseBrew({
                brewUtil: typeof PrereleaseUtil !== "undefined" ? PrereleaseUtil : null
            });
        }

        static async loadBrew() {
            return this._loadPrereleaseBrew({
                brewUtil: typeof BrewUtil2 !== "undefined" ? BrewUtil2 : null
            });
        }

        static async _loadPrereleaseBrew({brewUtil}) {
            if (!brewUtil)
                return {};

            const brew = await brewUtil.pGetBrewProcessed();
            if (!brew?.recipe?.length)
                return brew;

            return {
                ...brew,
                recipe: await DataUtil.recipe.pGetPostProcessedRecipes(brew.recipe),
            };
        }
    }
    ,

    recipeFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_RECIPES;
        static _FILENAME = "fluff-recipes.json";
    }
    ,

    vehicle: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_VEHICLES;
        static _FILENAME = "vehicles.json";
    }
    ,

    vehicleFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_VEHICLES;
        static _FILENAME = "fluff-vehicles.json";
    }
    ,

    optionalfeature: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_OPT_FEATURES;
        static _FILENAME = "optionalfeatures.json";
    }
    ,

    class: class clazz extends _DataUtilPropConfigCustom {
        static _PAGE = UrlUtil.PG_CLASSES;

        static _pLoadJson = null;
        static _pLoadRawJson = null;

        static loadJSON() {
            return DataUtil.class._pLoadJson = DataUtil.class._pLoadJson || (async()=>{
                return {
                    class: await DataLoader.pCacheAndGetAllSite("class"),
                    subclass: await DataLoader.pCacheAndGetAllSite("subclass"),
                };
            }
            )();
        }

        static loadRawJSON() {
            return DataUtil.class._pLoadRawJson = DataUtil.class._pLoadRawJson || (async()=>{
                const index = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/class/index.json`);
                const allData = await Promise.all(Object.values(index).map(it=>DataUtil.loadJSON(`${Renderer.get().baseUrl}data/class/${it}`)));

                return {
                    class: MiscUtil.copyFast(allData.map(it=>it.class || []).flat()),
                    subclass: MiscUtil.copyFast(allData.map(it=>it.subclass || []).flat()),
                    classFeature: allData.map(it=>it.classFeature || []).flat(),
                    subclassFeature: allData.map(it=>it.subclassFeature || []).flat(),
                };
            }
            )();
        }

        static async loadPrerelease() {
            return {
                class: await DataLoader.pCacheAndGetAllPrerelease("class"),
                subclass: await DataLoader.pCacheAndGetAllPrerelease("subclass"),
            };
        }

        static async loadBrew() {
            return {
                class: await DataLoader.pCacheAndGetAllBrew("class"),
                subclass: await DataLoader.pCacheAndGetAllBrew("subclass"),
            };
        }

        static packUidSubclass(it) {
            const sourceDefault = Parser.getTagSource("subclass");
            return [it.name, it.className, (it.classSource || "").toLowerCase() === sourceDefault.toLowerCase() ? "" : it.classSource, (it.source || "").toLowerCase() === sourceDefault.toLowerCase() ? "" : it.source, ].join("|").replace(/\|+$/, "");
        }

        static unpackUidClassFeature(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,className,classSource,level,source,displayText] = uid.split("|").map(it=>it.trim());
            classSource = classSource || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
            source = source || classSource;
            level = Number(level);
            return {
                name,
                className,
                classSource,
                level,
                source,
                displayText,
            };
        }

        static isValidClassFeatureUid(uid) {
            const {name, className, level} = DataUtil.class.unpackUidClassFeature(uid);
            return !(!name || !className || isNaN(level));
        }

        static packUidClassFeature(f) {
            return [f.name, f.className, f.classSource === Parser.SRC_PHB ? "" : f.classSource, f.level, f.source === f.classSource ? "" : f.source, ].join("|").replace(/\|+$/, "");
        }

        static unpackUidSubclassFeature(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,className,classSource,subclassShortName,subclassSource,level,source,displayText] = uid.split("|").map(it=>it.trim());
            classSource = classSource || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
            subclassSource = subclassSource || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
            source = source || subclassSource;
            level = Number(level);
            return {
                name,
                className,
                classSource,
                subclassShortName,
                subclassSource,
                level,
                source,
                displayText,
            };
        }

        static isValidSubclassFeatureUid(uid) {
            const {name, className, subclassShortName, level} = DataUtil.class.unpackUidSubclassFeature(uid);
            return !(!name || !className || !subclassShortName || isNaN(level));
        }

        static packUidSubclassFeature(f) {
            return [f.name, f.className, f.classSource === Parser.SRC_PHB ? "" : f.classSource, f.subclassShortName, f.subclassSource === Parser.SRC_PHB ? "" : f.subclassSource, f.level, f.source === f.subclassSource ? "" : f.source, ].join("|").replace(/\|+$/, "");
        }

        static _CACHE_SUBCLASS_LOOKUP_PROMISE = null;
        static _CACHE_SUBCLASS_LOOKUP = null;
        static async pGetSubclassLookup() {
            DataUtil.class._CACHE_SUBCLASS_LOOKUP_PROMISE = DataUtil.class._CACHE_SUBCLASS_LOOKUP_PROMISE || (async()=>{
                const subclassLookup = {};
                Object.assign(subclassLookup, await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/generated/gendata-subclass-lookup.json`));
                DataUtil.class._CACHE_SUBCLASS_LOOKUP = subclassLookup;
            }
            )();
            await DataUtil.class._CACHE_SUBCLASS_LOOKUP_PROMISE;
            return DataUtil.class._CACHE_SUBCLASS_LOOKUP;
        }
    }
    ,

    subclass: class extends _DataUtilPropConfig {
        static _PAGE = "subclass";
    }
    ,

    deity: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_DEITIES;
        static _FILENAME = "deities.json";

        static doPostLoad(data) {
            const PRINT_ORDER = [Parser.SRC_PHB, Parser.SRC_DMG, Parser.SRC_SCAG, Parser.SRC_VGM, Parser.SRC_MTF, Parser.SRC_ERLW, Parser.SRC_EGW, Parser.SRC_TDCSR, ];

            const inSource = {};
            PRINT_ORDER.forEach(src=>{
                inSource[src] = {};
                data.deity.filter(it=>it.source === src).forEach(it=>inSource[src][it.reprintAlias || it.name] = it);
            }
            );

            const laterPrinting = [PRINT_ORDER.last()];
            [...PRINT_ORDER].reverse().slice(1).forEach(src=>{
                laterPrinting.forEach(laterSrc=>{
                    Object.keys(inSource[src]).forEach(name=>{
                        const newer = inSource[laterSrc][name];
                        if (newer) {
                            const old = inSource[src][name];
                            old.reprinted = true;
                            if (!newer._isEnhanced) {
                                newer.previousVersions = newer.previousVersions || [];
                                newer.previousVersions.push(old);
                            }
                        }
                    }
                    );
                }
                );

                laterPrinting.push(src);
            }
            );
            data.deity.forEach(g=>g._isEnhanced = true);

            return data;
        }

        static async loadJSON() {
            const data = await super.loadJSON();
            DataUtil.deity.doPostLoad(data);
            return data;
        }

        static getUid(ent, opts) {
            return this.packUidDeity(ent, opts);
        }

        static getNormalizedUid(uid, tag) {
            const {name, pantheon, source} = this.unpackUidDeity(uid, tag, {
                isLower: true
            });
            return [name, pantheon, source].join("|");
        }

        static unpackUidDeity(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,pantheon,source,displayText,...others] = uid.split("|").map(it=>it.trim());

            pantheon = pantheon || "forgotten realms";
            if (opts.isLower)
                pantheon = pantheon.toLowerCase();

            source = source || Parser.getTagSource("deity", source);
            if (opts.isLower)
                source = source.toLowerCase();

            return {
                name,
                pantheon,
                source,
                displayText,
                others,
            };
        }

        static packUidDeity(it) {
            const sourceDefault = Parser.getTagSource("deity");
            return [it.name, (it.pantheon || "").toLowerCase() === "forgotten realms" ? "" : it.pantheon, (it.source || "").toLowerCase() === sourceDefault.toLowerCase() ? "" : it.source, ].join("|").replace(/\|+$/, "");
        }
    }
    ,

    table: class extends _DataUtilPropConfigCustom {
        static async loadJSON() {
            const datas = await Promise.all([`${Renderer.get().baseUrl}data/generated/gendata-tables.json`, `${Renderer.get().baseUrl}data/tables.json`, ].map(url=>DataUtil.loadJSON(url)));
            const combined = {};
            datas.forEach(data=>{
                Object.entries(data).forEach(([k,v])=>{
                    if (combined[k] && combined[k]instanceof Array && v instanceof Array)
                        combined[k] = combined[k].concat(v);
                    else if (combined[k] == null)
                        combined[k] = v;
                    else
                        throw new Error(`Could not merge keys for key "${k}"`);
                }
                );
            }
            );

            return combined;
        }
    }
    ,

    legendaryGroup: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_BESTIARY;
        static _FILENAME = "bestiary/legendarygroups.json";

        static async pLoadAll() {
            return (await this.loadJSON()).legendaryGroup;
        }
    }
    ,

    variantrule: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_VARIANTRULES;
        static _FILENAME = "variantrules.json";

        static async loadJSON() {
            const rawData = await super.loadJSON();
            const rawDataGenerated = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/generated/gendata-variantrules.json`);

            return {
                variantrule: [...rawData.variantrule, ...rawDataGenerated.variantrule]
            };
        }
    }
    ,

    deck: class extends _DataUtilPropConfigCustom {
        static _PAGE = UrlUtil.PG_DECKS;

        static _pLoadJson = null;
        static _pLoadRawJson = null;

        static loadJSON() {
            return DataUtil.deck._pLoadJson = DataUtil.deck._pLoadJson || (async()=>{
                return {
                    deck: await DataLoader.pCacheAndGetAllSite("deck"),
                    card: await DataLoader.pCacheAndGetAllSite("card"),
                };
            }
            )();
        }

        static loadRawJSON() {
            return DataUtil.deck._pLoadRawJson = DataUtil.deck._pLoadRawJson || DataUtil.loadJSON(`${Renderer.get().baseUrl}data/decks.json`);
        }

        static async loadPrerelease() {
            return {
                deck: await DataLoader.pCacheAndGetAllPrerelease("deck"),
                card: await DataLoader.pCacheAndGetAllPrerelease("card"),
            };
        }

        static async loadBrew() {
            return {
                deck: await DataLoader.pCacheAndGetAllBrew("deck"),
                card: await DataLoader.pCacheAndGetAllBrew("card"),
            };
        }

        static unpackUidCard(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,set,source,displayText] = uid.split("|").map(it=>it.trim());
            set = set || "none";
            source = source || Parser.getTagSource("card", source)[opts.isLower ? "toLowerCase" : "toString"]();
            return {
                name,
                set,
                source,
                displayText,
            };
        }
    }
    ,

    reward: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_REWARDS;
        static _FILENAME = "rewards.json";
    }
    ,

    rewardFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_REWARDS;
        static _FILENAME = "fluff-rewards.json";
    }
    ,

    trap: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_TRAPS_HAZARDS;
        static _FILENAME = "trapshazards.json";
    }
    ,

    trapFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_TRAPS_HAZARDS;
        static _FILENAME = "fluff-trapshazards.json";
    }
    ,

    hazard: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_TRAPS_HAZARDS;
        static _FILENAME = "trapshazards.json";
    }
    ,

    hazardFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_TRAPS_HAZARDS;
        static _FILENAME = "fluff-trapshazards.json";
    }
    ,

    quickreference: {
        unpackUid(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,source,ixChapter,ixHeader,displayText] = uid.split("|").map(it=>it.trim());
            source = source || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
            ixChapter = Number(ixChapter || 0);
            return {
                name,
                ixChapter,
                ixHeader,
                source,
                displayText,
            };
        },
    },

    /* brew: new _DataUtilBrewHelper({
        defaultUrlRoot: VeCt.URL_ROOT_BREW
    }),
    prerelease: new _DataUtilBrewHelper({
        defaultUrlRoot: VeCt.URL_ROOT_PRERELEASE
    }), */
};

//#endregion

//#region Parser
Parser._parse_aToB = function(abMap, a, fallback) {
    if (a === undefined || a === null)
        throw new TypeError("undefined or null object passed to parser");
    if (typeof a === "string")
        a = a.trim();
    if (abMap[a] !== undefined)
        return abMap[a];
    return fallback !== undefined ? fallback : a;
}
;

Parser._parse_bToA = function(abMap, b, fallback) {
    if (b === undefined || b === null)
        throw new TypeError("undefined or null object passed to parser");
    if (typeof b === "string")
        b = b.trim();
    for (const v in abMap) {
        if (!abMap.hasOwnProperty(v))
            continue;
        if (abMap[v] === b)
            return v;
    }
    return fallback !== undefined ? fallback : b;
}
;

Parser.attrChooseToFull = function(attList) {
    if (attList.length === 1)
        return `${Parser.attAbvToFull(attList[0])} modifier`;
    else {
        const attsTemp = [];
        for (let i = 0; i < attList.length; ++i) {
            attsTemp.push(Parser.attAbvToFull(attList[i]));
        }
        return `${attsTemp.join(" or ")} modifier (your choice)`;
    }
}
;

Parser.numberToText = function(number) {
    if (number == null)
        throw new TypeError(`undefined or null object passed to parser`);
    if (Math.abs(number) >= 100)
        return `${number}`;

    return `${number < 0 ? "negative " : ""}${Parser.numberToText._getPositiveNumberAsText(Math.abs(number))}`;
}
;

Parser.numberToText._getPositiveNumberAsText = num=>{
    const [preDotRaw,postDotRaw] = `${num}`.split(".");

    if (!postDotRaw)
        return Parser.numberToText._getPositiveIntegerAsText(num);

    let preDot = preDotRaw === "0" ? "" : `${Parser.numberToText._getPositiveIntegerAsText(Math.trunc(num))} and `;

    switch (postDotRaw) {
    case "125":
        return `${preDot}one-eighth`;
    case "2":
        return `${preDot}one-fifth`;
    case "25":
        return `${preDot}one-quarter`;
    case "375":
        return `${preDot}three-eighths`;
    case "4":
        return `${preDot}two-fifths`;
    case "5":
        return `${preDot}one-half`;
    case "6":
        return `${preDot}three-fifths`;
    case "625":
        return `${preDot}five-eighths`;
    case "75":
        return `${preDot}three-quarters`;
    case "8":
        return `${preDot}four-fifths`;
    case "875":
        return `${preDot}seven-eighths`;

    default:
        {
            const asNum = Number(`0.${postDotRaw}`);

            if (asNum.toFixed(2) === (1 / 3).toFixed(2))
                return `${preDot}one-third`;
            if (asNum.toFixed(2) === (2 / 3).toFixed(2))
                return `${preDot}two-thirds`;

            if (asNum.toFixed(2) === (1 / 6).toFixed(2))
                return `${preDot}one-sixth`;
            if (asNum.toFixed(2) === (5 / 6).toFixed(2))
                return `${preDot}five-sixths`;
        }
    }
}
;

Parser.numberToText._getPositiveIntegerAsText = num=>{
    switch (num) {
    case 0:
        return "zero";
    case 1:
        return "one";
    case 2:
        return "two";
    case 3:
        return "three";
    case 4:
        return "four";
    case 5:
        return "five";
    case 6:
        return "six";
    case 7:
        return "seven";
    case 8:
        return "eight";
    case 9:
        return "nine";
    case 10:
        return "ten";
    case 11:
        return "eleven";
    case 12:
        return "twelve";
    case 13:
        return "thirteen";
    case 14:
        return "fourteen";
    case 15:
        return "fifteen";
    case 16:
        return "sixteen";
    case 17:
        return "seventeen";
    case 18:
        return "eighteen";
    case 19:
        return "nineteen";
    case 20:
        return "twenty";
    case 30:
        return "thirty";
    case 40:
        return "forty";
    case 50:
        return "fifty";
    case 60:
        return "sixty";
    case 70:
        return "seventy";
    case 80:
        return "eighty";
    case 90:
        return "ninety";
    default:
        {
            const str = String(num);
            return `${Parser.numberToText._getPositiveIntegerAsText(Number(`${str[0]}0`))}-${Parser.numberToText._getPositiveIntegerAsText(Number(str[1]))}`;
        }
    }
}
;

Parser.textToNumber = function(str) {
    str = str.trim().toLowerCase();
    if (!isNaN(str))
        return Number(str);
    switch (str) {
    case "zero":
        return 0;
    case "one":
    case "a":
    case "an":
        return 1;
    case "two":
    case "double":
        return 2;
    case "three":
    case "triple":
        return 3;
    case "four":
    case "quadruple":
        return 4;
    case "five":
        return 5;
    case "six":
        return 6;
    case "seven":
        return 7;
    case "eight":
        return 8;
    case "nine":
        return 9;
    case "ten":
        return 10;
    case "eleven":
        return 11;
    case "twelve":
        return 12;
    case "thirteen":
        return 13;
    case "fourteen":
        return 14;
    case "fifteen":
        return 15;
    case "sixteen":
        return 16;
    case "seventeen":
        return 17;
    case "eighteen":
        return 18;
    case "nineteen":
        return 19;
    case "twenty":
        return 20;
    case "thirty":
        return 30;
    case "forty":
        return 40;
    case "fifty":
        return 50;
    case "sixty":
        return 60;
    case "seventy":
        return 70;
    case "eighty":
        return 80;
    case "ninety":
        return 90;
    }
    return NaN;
}
;

Parser.numberToVulgar = function(number, {isFallbackOnFractional=true}={}) {
    const isNeg = number < 0;
    const spl = `${number}`.replace(/^-/, "").split(".");
    if (spl.length === 1)
        return number;

    let preDot = spl[0] === "0" ? "" : spl[0];
    if (isNeg)
        preDot = `-${preDot}`;

    switch (spl[1]) {
    case "125":
        return `${preDot}⅛`;
    case "2":
        return `${preDot}⅕`;
    case "25":
        return `${preDot}¼`;
    case "375":
        return `${preDot}⅜`;
    case "4":
        return `${preDot}⅖`;
    case "5":
        return `${preDot}½`;
    case "6":
        return `${preDot}⅗`;
    case "625":
        return `${preDot}⅝`;
    case "75":
        return `${preDot}¾`;
    case "8":
        return `${preDot}⅘`;
    case "875":
        return `${preDot}⅞`;

    default:
        {
            const asNum = Number(`0.${spl[1]}`);

            if (asNum.toFixed(2) === (1 / 3).toFixed(2))
                return `${preDot}⅓`;
            if (asNum.toFixed(2) === (2 / 3).toFixed(2))
                return `${preDot}⅔`;

            if (asNum.toFixed(2) === (1 / 6).toFixed(2))
                return `${preDot}⅙`;
            if (asNum.toFixed(2) === (5 / 6).toFixed(2))
                return `${preDot}⅚`;
        }
    }

    return isFallbackOnFractional ? Parser.numberToFractional(number) : null;
}
;

Parser.vulgarToNumber = function(str) {
    const [,leading="0",vulgar=""] = /^(\d+)?([⅛¼⅜½⅝¾⅞⅓⅔⅙⅚])?$/.exec(str) || [];
    let out = Number(leading);
    switch (vulgar) {
    case "⅛":
        out += 0.125;
        break;
    case "¼":
        out += 0.25;
        break;
    case "⅜":
        out += 0.375;
        break;
    case "½":
        out += 0.5;
        break;
    case "⅝":
        out += 0.625;
        break;
    case "¾":
        out += 0.75;
        break;
    case "⅞":
        out += 0.875;
        break;
    case "⅓":
        out += 1 / 3;
        break;
    case "⅔":
        out += 2 / 3;
        break;
    case "⅙":
        out += 1 / 6;
        break;
    case "⅚":
        out += 5 / 6;
        break;
    case "":
        break;
    default:
        throw new Error(`Unhandled vulgar part "${vulgar}"`);
    }
    return out;
}
;

Parser.numberToSuperscript = function(number) {
    return `${number}`.split("").map(c=>isNaN(c) ? c : Parser._NUMBERS_SUPERSCRIPT[Number(c)]).join("");
}
;
Parser._NUMBERS_SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

Parser.numberToSubscript = function(number) {
    return `${number}`.split("").map(c=>isNaN(c) ? c : Parser._NUMBERS_SUBSCRIPT[Number(c)]).join("");
}
;
Parser._NUMBERS_SUBSCRIPT = "₀₁₂₃₄₅₆₇₈₉";

Parser._greatestCommonDivisor = function(a, b) {
    if (b < Number.EPSILON)
        return a;
    return Parser._greatestCommonDivisor(b, Math.floor(a % b));
}
;
Parser.numberToFractional = function(number) {
    const len = number.toString().length - 2;
    let denominator = 10 ** len;
    let numerator = number * denominator;
    const divisor = Parser._greatestCommonDivisor(numerator, denominator);
    numerator = Math.floor(numerator / divisor);
    denominator = Math.floor(denominator / divisor);

    return denominator === 1 ? String(numerator) : `${Math.floor(numerator)}/${Math.floor(denominator)}`;
}
;

Parser.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

Parser.attAbvToFull = function(abv) {
    return Parser._parse_aToB(Parser.ATB_ABV_TO_FULL, abv);
}
;

Parser.attFullToAbv = function(full) {
    return Parser._parse_bToA(Parser.ATB_ABV_TO_FULL, full);
}
;

Parser.sizeAbvToFull = function(abv) {
    return Parser._parse_aToB(Parser.SIZE_ABV_TO_FULL, abv);
}
;

Parser.getAbilityModNumber = function(abilityScore) {
    return Math.floor((abilityScore - 10) / 2);
}
;

Parser.getAbilityModifier = function(abilityScore) {
    let modifier = Parser.getAbilityModNumber(abilityScore);
    if (modifier >= 0)
        modifier = `+${modifier}`;
    return `${modifier}`;
}
;

Parser.getSpeedString = (ent,{isMetric=false, isSkipZeroWalk=false}={})=>{
    if (ent.speed == null)
        return "\u2014";

    const unit = isMetric ? Parser.metric.getMetricUnit({
        originalUnit: "ft.",
        isShortForm: true
    }) : "ft.";
    if (typeof ent.speed === "object") {
        const stack = [];
        let joiner = ", ";

        Parser.SPEED_MODES.filter(mode=>!ent.speed.hidden?.includes(mode)).forEach(mode=>Parser._getSpeedString_addSpeedMode({
            ent,
            prop: mode,
            stack,
            isMetric,
            isSkipZeroWalk,
            unit
        }));

        if (ent.speed.choose && !ent.speed.hidden?.includes("choose")) {
            joiner = "; ";
            stack.push(`${ent.speed.choose.from.sort().joinConjunct(", ", " or ")} ${ent.speed.choose.amount} ${unit}${ent.speed.choose.note ? ` ${ent.speed.choose.note}` : ""}`);
        }

        return stack.join(joiner) + (ent.speed.note ? ` ${ent.speed.note}` : "");
    }

    return (isMetric ? Parser.metric.getMetricNumber({
        originalValue: ent.speed,
        originalUnit: Parser.UNT_FEET
    }) : ent.speed) + (ent.speed === "Varies" ? "" : ` ${unit} `);
}
;
Parser._getSpeedString_addSpeedMode = ({ent, prop, stack, isMetric, isSkipZeroWalk, unit})=>{
    if (ent.speed[prop] || (!isSkipZeroWalk && prop === "walk"))
        Parser._getSpeedString_addSpeed({
            prop,
            speed: ent.speed[prop] || 0,
            isMetric,
            unit,
            stack
        });
    if (ent.speed.alternate && ent.speed.alternate[prop])
        ent.speed.alternate[prop].forEach(speed=>Parser._getSpeedString_addSpeed({
            prop,
            speed,
            isMetric,
            unit,
            stack
        }));
}
;
Parser._getSpeedString_addSpeed = ({prop, speed, isMetric, unit, stack})=>{
    const ptName = prop === "walk" ? "" : `${prop} `;
    const ptValue = Parser._getSpeedString_getVal({
        prop,
        speed,
        isMetric
    });
    const ptUnit = speed === true ? "" : ` ${unit}`;
    const ptCondition = Parser._getSpeedString_getCondition({
        speed
    });
    stack.push([ptName, ptValue, ptUnit, ptCondition].join(""));
}
;
Parser._getSpeedString_getVal = ({prop, speed, isMetric})=>{
    if (speed === true && prop !== "walk")
        return "equal to your walking speed";

    const num = speed === true ? 0 : speed.number != null ? speed.number : speed;

    return isMetric ? Parser.metric.getMetricNumber({
        originalValue: num,
        originalUnit: Parser.UNT_FEET
    }) : num;
}
;
Parser._getSpeedString_getCondition = ({speed})=>speed.condition ? ` ${Renderer.get().render(speed.condition)}` : "";

Parser.SPEED_MODES = ["walk", "burrow", "climb", "fly", "swim"];

Parser.SPEED_TO_PROGRESSIVE = {
    "walk": "walking",
    "burrow": "burrowing",
    "climb": "climbing",
    "fly": "flying",
    "swim": "swimming",
};

Parser.speedToProgressive = function(prop) {
    return Parser._parse_aToB(Parser.SPEED_TO_PROGRESSIVE, prop);
}
;

Parser._addCommas = function(intNum) {
    return `${intNum}`.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
}
;

Parser.raceCreatureTypesToFull = function(creatureTypes) {
    const hasSubOptions = creatureTypes.some(it=>it.choose);
    return creatureTypes.map(it=>{
        if (!it.choose)
            return Parser.monTypeToFullObj(it).asText;
        return [...it.choose].sort(SortUtil.ascSortLower).map(sub=>Parser.monTypeToFullObj(sub).asText).joinConjunct(", ", " or ");
    }
    ).joinConjunct(hasSubOptions ? "; " : ", ", " and ");
}
;

Parser.crToXp = function(cr, {isDouble=false}={}) {
    if (cr != null && cr.xp)
        return Parser._addCommas(`${isDouble ? cr.xp * 2 : cr.xp}`);

    const toConvert = cr ? (cr.cr || cr) : null;
    if (toConvert === "Unknown" || toConvert == null || !Parser.XP_CHART_ALT[toConvert])
        return "Unknown";
    if (toConvert === "0")
        return "10";
    const xp = Parser.XP_CHART_ALT[toConvert];
    return Parser._addCommas(`${isDouble ? 2 * xp : xp}`);
}
;

Parser.crToXpNumber = function(cr) {
    if (cr != null && cr.xp)
        return cr.xp;
    const toConvert = cr ? (cr.cr || cr) : cr;
    if (toConvert === "Unknown" || toConvert == null)
        return null;
    return Parser.XP_CHART_ALT[toConvert] ?? null;
}
;

Parser.LEVEL_TO_XP_EASY = [0, 25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800];
Parser.LEVEL_TO_XP_MEDIUM = [0, 50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4100, 4900, 5700];
Parser.LEVEL_TO_XP_HARD = [0, 75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500];
Parser.LEVEL_TO_XP_DEADLY = [0, 100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700];
Parser.LEVEL_TO_XP_DAILY = [0, 300, 600, 1200, 1700, 3500, 4000, 5000, 6000, 7500, 9000, 10500, 11500, 13500, 15000, 18000, 20000, 25000, 27000, 30000, 40000];

Parser.LEVEL_XP_REQUIRED = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

Parser.CRS = ["0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];

Parser.levelToXpThreshold = function(level) {
    return [Parser.LEVEL_TO_XP_EASY[level], Parser.LEVEL_TO_XP_MEDIUM[level], Parser.LEVEL_TO_XP_HARD[level], Parser.LEVEL_TO_XP_DEADLY[level]];
}
;

Parser.isValidCr = function(cr) {
    return Parser.CRS.includes(cr);
}
;

Parser.crToNumber = function(cr, opts={}) {
    const {isDefaultNull=false} = opts;

    if (cr === "Unknown" || cr === "\u2014" || cr == null)
        return isDefaultNull ? null : VeCt.CR_UNKNOWN;
    if (cr.cr)
        return Parser.crToNumber(cr.cr, opts);

    const parts = cr.trim().split("/");
    if (!parts.length || parts.length >= 3)
        return isDefaultNull ? null : VeCt.CR_CUSTOM;
    if (isNaN(parts[0]))
        return isDefaultNull ? null : VeCt.CR_CUSTOM;

    if (parts.length === 2) {
        if (isNaN(Number(parts[1])))
            return isDefaultNull ? null : VeCt.CR_CUSTOM;
        return Number(parts[0]) / Number(parts[1]);
    }

    return Number(parts[0]);
}
;

Parser.numberToCr = function(number, safe) {
    if (safe && typeof number === "string" && Parser.CRS.includes(number))
        return number;

    if (number == null)
        return "Unknown";

    return Parser.numberToFractional(number);
}
;

Parser.crToPb = function(cr) {
    if (cr === "Unknown" || cr == null)
        return 0;
    cr = cr.cr || cr;
    if (Parser.crToNumber(cr) < 5)
        return 2;
    return Math.ceil(cr / 4) + 1;
}
;

Parser.levelToPb = function(level) {
    if (!level)
        return 2;
    return Math.ceil(level / 4) + 1;
}
;
Parser.SKILL_TO_ATB_ABV = {
    "athletics": "str",
    "acrobatics": "dex",
    "sleight of hand": "dex",
    "stealth": "dex",
    "arcana": "int",
    "history": "int",
    "investigation": "int",
    "nature": "int",
    "religion": "int",
    "animal handling": "wis",
    "insight": "wis",
    "medicine": "wis",
    "perception": "wis",
    "survival": "wis",
    "deception": "cha",
    "intimidation": "cha",
    "performance": "cha",
    "persuasion": "cha",
};


Parser.skillToAbilityAbv = function(skill) {
    return Parser._parse_aToB(Parser.SKILL_TO_ATB_ABV, skill);
}
;

Parser.SKILL_TO_SHORT = {
    "athletics": "ath",
    "acrobatics": "acro",
    "sleight of hand": "soh",
    "stealth": "slth",
    "arcana": "arc",
    "history": "hist",
    "investigation": "invn",
    "nature": "natr",
    "religion": "reli",
    "animal handling": "hndl",
    "insight": "ins",
    "medicine": "med",
    "perception": "perp",
    "survival": "surv",
    "deception": "decp",
    "intimidation": "intm",
    "performance": "perf",
    "persuasion": "pers",
};

Parser.skillToShort = function(skill) {
    return Parser._parse_aToB(Parser.SKILL_TO_SHORT, skill);
}
;

Parser.LANGUAGES_STANDARD = ["Common", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Orc", ];

Parser.LANGUAGES_EXOTIC = ["Abyssal", "Aquan", "Auran", "Celestial", "Draconic", "Deep Speech", "Ignan", "Infernal", "Primordial", "Sylvan", "Terran", "Undercommon", ];

Parser.LANGUAGES_SECRET = ["Druidic", "Thieves' cant", ];

Parser.LANGUAGES_ALL = [...Parser.LANGUAGES_STANDARD, ...Parser.LANGUAGES_EXOTIC, ...Parser.LANGUAGES_SECRET, ].sort();

Parser.acToFull = function(ac, renderer) {
    if (typeof ac === "string")
        return ac;
    renderer = renderer || Renderer.get();

    let stack = "";
    let inBraces = false;
    for (let i = 0; i < ac.length; ++i) {
        const cur = ac[i];
        const nxt = ac[i + 1];

        if (cur.special != null) {
            if (inBraces)
                inBraces = false;

            stack += cur.special;
        } else if (cur.ac) {
            const isNxtBraces = nxt && nxt.braces;

            if (!inBraces && cur.braces) {
                stack += "(";
                inBraces = true;
            }

            stack += cur.ac;

            if (cur.from) {
                if (cur.braces) {
                    stack += " (";
                } else {
                    stack += inBraces ? "; " : " (";
                }

                inBraces = true;

                stack += cur.from.map(it=>renderer.render(it)).join(", ");

                if (cur.braces) {
                    stack += ")";
                } else if (!isNxtBraces) {
                    stack += ")";
                    inBraces = false;
                }
            }

            if (cur.condition)
                stack += ` ${renderer.render(cur.condition)}`;

            if (inBraces && !isNxtBraces) {
                stack += ")";
                inBraces = false;
            }
        } else {
            stack += cur;
        }

        if (nxt) {
            if (nxt.braces) {
                stack += inBraces ? "; " : " (";
                inBraces = true;
            } else
                stack += ", ";
        }
    }
    if (inBraces)
        stack += ")";

    return stack.trim();
}
;

Parser.MONSTER_COUNT_TO_XP_MULTIPLIER = [1, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5, 2.5, 3, 3, 3, 3, 4];
Parser.numMonstersToXpMult = function(num, playerCount=3) {
    const baseVal = (()=>{
        if (num >= Parser.MONSTER_COUNT_TO_XP_MULTIPLIER.length)
            return 4;
        return Parser.MONSTER_COUNT_TO_XP_MULTIPLIER[num - 1];
    }
    )();

    if (playerCount < 3)
        return baseVal >= 3 ? baseVal + 1 : baseVal + 0.5;
    else if (playerCount > 5) {
        return baseVal === 4 ? 3 : baseVal - 0.5;
    } else
        return baseVal;
}
;

Parser.armorFullToAbv = function(armor) {
    return Parser._parse_bToA(Parser.ARMOR_ABV_TO_FULL, armor);
}
;

Parser.weaponFullToAbv = function(weapon) {
    return Parser._parse_bToA(Parser.WEAPON_ABV_TO_FULL, weapon);
}
;

Parser._getSourceStringFromSource = function(source) {
    if (source && source.source)
        return source.source;
    return source;
}
;
Parser._buildSourceCache = function(dict) {
    const out = {};
    Object.entries(dict).forEach(([k,v])=>out[k.toLowerCase()] = v);
    return out;
}
;
Parser._sourceJsonCache = null;
Parser.hasSourceJson = function(source) {
    Parser._sourceJsonCache = Parser._sourceJsonCache || Parser._buildSourceCache(Object.keys(Parser.SOURCE_JSON_TO_FULL).mergeMap(k=>({
        [k]: k
    })));
    return !!Parser._sourceJsonCache[source.toLowerCase()];
}
;
Parser._sourceFullCache = null;
Parser.hasSourceFull = function(source) {
    Parser._sourceFullCache = Parser._sourceFullCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_FULL);
    return !!Parser._sourceFullCache[source.toLowerCase()];
}
;
Parser._sourceAbvCache = null;
Parser.hasSourceAbv = function(source) {
    Parser._sourceAbvCache = Parser._sourceAbvCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_ABV);
    return !!Parser._sourceAbvCache[source.toLowerCase()];
}
;
Parser._sourceDateCache = null;
Parser.hasSourceDate = function(source) {
    Parser._sourceDateCache = Parser._sourceDateCache || Parser._buildSourceCache(Parser.SOURCE_JSON_TO_DATE);
    return !!Parser._sourceDateCache[source.toLowerCase()];
}
;
Parser.sourceJsonToJson = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceJson(source))
        return Parser._sourceJsonCache[source.toLowerCase()];
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToSource(source).json;
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToSource(source).json;
    return source;
}
;
Parser.sourceJsonToFull = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceFull(source))
        return Parser._sourceFullCache[source.toLowerCase()].replace(/'/g, "\u2019");
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToFull(source).replace(/'/g, "\u2019");
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToFull(source).replace(/'/g, "\u2019");
    return Parser._parse_aToB(Parser.SOURCE_JSON_TO_FULL, source).replace(/'/g, "\u2019");
}
;
Parser.sourceJsonToFullCompactPrefix = function(source) {
    return Parser.sourceJsonToFull(source).replace(Parser.UA_PREFIX, Parser.UA_PREFIX_SHORT).replace(/^Unearthed Arcana (\d+): /, "UA$1: ").replace(Parser.AL_PREFIX, Parser.AL_PREFIX_SHORT).replace(Parser.PS_PREFIX, Parser.PS_PREFIX_SHORT);
}
;
Parser.sourceJsonToAbv = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceAbv(source))
        return Parser._sourceAbvCache[source.toLowerCase()];
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToAbv(source);
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToAbv(source);
    return Parser._parse_aToB(Parser.SOURCE_JSON_TO_ABV, source);
}
;
Parser.sourceJsonToDate = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceDate(source))
        return Parser._sourceDateCache[source.toLowerCase()];
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToDate(source);
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToDate(source);
    return Parser._parse_aToB(Parser.SOURCE_JSON_TO_DATE, source, null);
}
;

Parser.sourceJsonToColor = function(source) {
    return `source${Parser.sourceJsonToAbv(source)}`;
}
;

Parser.sourceJsonToStyle = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceJson(source))
        return "";
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToStyle(source);
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToStyle(source);
    return "";
}
;

Parser.sourceJsonToStylePart = function(source) {
    source = Parser._getSourceStringFromSource(source);
    if (Parser.hasSourceJson(source))
        return "";
    if (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(source))
        return PrereleaseUtil.sourceJsonToStylePart(source);
    if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(source))
        return BrewUtil2.sourceJsonToStylePart(source);
    return "";
}
;

Parser.stringToSlug = function(str) {
    return str.trim().toLowerCase().toAscii().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
}
;

Parser.stringToCasedSlug = function(str) {
    return str.toAscii().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
}
;

Parser.ITEM_SPELLCASTING_FOCUS_CLASSES = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"];

Parser.itemValueToFull = function(item, opts={
    isShortForm: false,
    isSmallUnits: false
}) {
    return Parser._moneyToFull(item, "value", "valueMult", opts);
}
;

Parser.itemValueToFullMultiCurrency = function(item, opts={
    isShortForm: false,
    isSmallUnits: false
}) {
    return Parser._moneyToFullMultiCurrency(item, "value", "valueMult", opts);
}
;

Parser.itemVehicleCostsToFull = function(item, isShortForm) {
    return {
        travelCostFull: Parser._moneyToFull(item, "travelCost", "travelCostMult", {
            isShortForm
        }),
        shippingCostFull: Parser._moneyToFull(item, "shippingCost", "shippingCostMult", {
            isShortForm
        }),
    };
}
;

Parser.spellComponentCostToFull = function(item, isShortForm) {
    return Parser._moneyToFull(item, "cost", "costMult", {
        isShortForm
    });
}
;

Parser.vehicleCostToFull = function(item, isShortForm) {
    return Parser._moneyToFull(item, "cost", "costMult", {
        isShortForm
    });
}
;

Parser._moneyToFull = function(it, prop, propMult, opts={
    isShortForm: false,
    isSmallUnits: false
}) {
    if (it[prop] == null && it[propMult] == null)
        return "";
    if (it[prop] != null) {
        const {coin, mult} = Parser.getCurrencyAndMultiplier(it[prop], it.currencyConversion);
        return `${(it[prop] * mult).toLocaleString(undefined, {
            maximumFractionDigits: 5
        })}${opts.isSmallUnits ? `<span class="small ml-1">${coin}</span>` : ` ${coin}`}`;
    } else if (it[propMult] != null)
        return opts.isShortForm ? `×${it[propMult]}` : `base value ×${it[propMult]}`;
    return "";
}
;

Parser._moneyToFullMultiCurrency = function(it, prop, propMult, {isShortForm, multiplier}={}) {
    if (it[prop]) {
        const conversionTable = Parser.getCurrencyConversionTable(it.currencyConversion);

        const simplified = it.currencyConversion ? CurrencyUtil.doSimplifyCoins({
            [conversionTable[0]?.coin || "cp"]: it[prop] * (multiplier ?? conversionTable[0]?.mult ?? 1),
        }, {
            currencyConversionId: it.currencyConversion,
        }, ) : CurrencyUtil.doSimplifyCoins({
            cp: it[prop] * (multiplier ?? 1),
        });

        return [...conversionTable].reverse().filter(meta=>simplified[meta.coin]).map(meta=>`${simplified[meta.coin].toLocaleString(undefined, {
            maximumFractionDigits: 5
        })} ${meta.coin}`).join(", ");
    }

    if (it[propMult])
        return isShortForm ? `×${it[propMult]}` : `base value ×${it[propMult]}`;

    return "";
}
;

Parser.DEFAULT_CURRENCY_CONVERSION_TABLE = [{
    coin: "cp",
    mult: 1,
}, {
    coin: "sp",
    mult: 0.1,
}, {
    coin: "gp",
    mult: 0.01,
    isFallback: true,
}, ];
Parser.FULL_CURRENCY_CONVERSION_TABLE = [{
    coin: "cp",
    mult: 1,
}, {
    coin: "sp",
    mult: 0.1,
}, {
    coin: "ep",
    mult: 0.02,
}, {
    coin: "gp",
    mult: 0.01,
    isFallback: true,
}, {
    coin: "pp",
    mult: 0.001,
}, ];
Parser.getCurrencyConversionTable = function(currencyConversionId) {
    const fromPrerelease = currencyConversionId ? PrereleaseUtil.getMetaLookup("currencyConversions")?.[currencyConversionId] : null;
    const fromBrew = currencyConversionId ? BrewUtil2.getMetaLookup("currencyConversions")?.[currencyConversionId] : null;
    const conversionTable = fromPrerelease?.length ? fromPrerelease : fromBrew?.length ? fromBrew : Parser.DEFAULT_CURRENCY_CONVERSION_TABLE;
    if (conversionTable !== Parser.DEFAULT_CURRENCY_CONVERSION_TABLE)
        conversionTable.sort((a,b)=>SortUtil.ascSort(b.mult, a.mult));
    return conversionTable;
}
;
Parser.getCurrencyAndMultiplier = function(value, currencyConversionId) {
    const conversionTable = Parser.getCurrencyConversionTable(currencyConversionId);

    if (!value)
        return conversionTable.find(it=>it.isFallback) || conversionTable[0];
    if (conversionTable.length === 1)
        return conversionTable[0];
    if (!Number.isInteger(value) && value < conversionTable[0].mult)
        return conversionTable[0];

    for (let i = conversionTable.length - 1; i >= 0; --i) {
        if (Number.isInteger(value * conversionTable[i].mult))
            return conversionTable[i];
    }

    return conversionTable.last();
}
;

Parser.COIN_ABVS = ["cp", "sp", "ep", "gp", "pp"];
Parser.COIN_ABV_TO_FULL = {
    "cp": "copper pieces",
    "sp": "silver pieces",
    "ep": "electrum pieces",
    "gp": "gold pieces",
    "pp": "platinum pieces",
};
Parser.COIN_CONVERSIONS = [1, 10, 50, 100, 1000];

Parser.coinAbvToFull = function(coin) {
    return Parser._parse_aToB(Parser.COIN_ABV_TO_FULL, coin);
}
;

Parser.getDisplayCurrency = function(currency, {isDisplayEmpty=false}={}) {
    return [...Parser.COIN_ABVS].reverse().filter(abv=>isDisplayEmpty ? currency[abv] != null : currency[abv]).map(abv=>`${currency[abv].toLocaleString()} ${abv}`).join(", ");
}
;

Parser.itemWeightToFull = function(item, isShortForm) {
    if (item.weight) {
        if (Math.round(item.weight) === item.weight)
            return `${item.weight} lb.${(item.weightNote ? ` ${item.weightNote}` : "")}`;

        const integerPart = Math.floor(item.weight);

        const vulgarGlyph = Parser.numberToVulgar(item.weight - integerPart, {
            isFallbackOnFractional: false
        });
        if (vulgarGlyph)
            return `${integerPart || ""}${vulgarGlyph} lb.${(item.weightNote ? ` ${item.weightNote}` : "")}`;

        return `${(item.weight < 1 ? item.weight * 16 : item.weight).toLocaleString(undefined, {
            maximumFractionDigits: 5
        })} ${item.weight < 1 ? "oz" : "lb"}.${(item.weightNote ? ` ${item.weightNote}` : "")}`;
    }
    if (item.weightMult)
        return isShortForm ? `×${item.weightMult}` : `base weight ×${item.weightMult}`;
    return "";
}
;

Parser.ITEM_RECHARGE_TO_FULL = {
    round: "Every Round",
    restShort: "Short Rest",
    restLong: "Long Rest",
    dawn: "Dawn",
    dusk: "Dusk",
    midnight: "Midnight",
    week: "Week",
    month: "Month",
    year: "Year",
    decade: "Decade",
    century: "Century",
    special: "Special",
};
Parser.itemRechargeToFull = function(recharge) {
    return Parser._parse_aToB(Parser.ITEM_RECHARGE_TO_FULL, recharge);
}
;

Parser.ITEM_MISC_TAG_TO_FULL = {
    "CF/W": "Creates Food/Water",
    "TT": "Trinket Table",
};
Parser.itemMiscTagToFull = function(type) {
    return Parser._parse_aToB(Parser.ITEM_MISC_TAG_TO_FULL, type);
}
;

Parser._decimalSeparator = (0.1).toLocaleString().substring(1, 2);
Parser._numberCleanRegexp = Parser._decimalSeparator === "." ? new RegExp(/[\s,]*/g,"g") : new RegExp(/[\s.]*/g,"g");
Parser._costSplitRegexp = Parser._decimalSeparator === "." ? new RegExp(/(\d+(\.\d+)?)([csegp]p)/) : new RegExp(/(\d+(,\d+)?)([csegp]p)/);

Parser.coinValueToNumber = function(value) {
    if (!value)
        return 0;
    if (value === "Varies")
        return 0;

    value = value.replace(/\s*/, "").replace(Parser._numberCleanRegexp, "").toLowerCase();
    const m = Parser._costSplitRegexp.exec(value);
    if (!m)
        throw new Error(`Badly formatted value "${value}"`);
    const ixCoin = Parser.COIN_ABVS.indexOf(m[3]);
    if (!~ixCoin)
        throw new Error(`Unknown coin type "${m[3]}"`);
    return Number(m[1]) * Parser.COIN_CONVERSIONS[ixCoin];
}
;

Parser.weightValueToNumber = function(value) {
    if (!value)
        return 0;

    if (Number(value))
        return Number(value);
    else
        throw new Error(`Badly formatted value ${value}`);
}
;

Parser.dmgTypeToFull = function(dmgType) {
    return Parser._parse_aToB(Parser.DMGTYPE_JSON_TO_FULL, dmgType);
}
;

Parser.skillProficienciesToFull = function(skillProficiencies) {
    function renderSingle(skProf) {
        if (skProf.any) {
            skProf = MiscUtil.copyFast(skProf);
            skProf.choose = {
                "from": Object.keys(Parser.SKILL_TO_ATB_ABV),
                "count": skProf.any
            };
            delete skProf.any;
        }

        const keys = Object.keys(skProf).sort(SortUtil.ascSortLower);

        const ixChoose = keys.indexOf("choose");
        if (~ixChoose)
            keys.splice(ixChoose, 1);

        const baseStack = [];
        keys.filter(k=>skProf[k]).forEach(k=>baseStack.push(Renderer.get().render(`{@skill ${k.toTitleCase()}}`)));

        const chooseStack = [];
        if (~ixChoose) {
            const chObj = skProf.choose;
            if (chObj.from.length === 18) {
                chooseStack.push(`choose any ${!chObj.count || chObj.count === 1 ? "skill" : chObj.count}`);
            } else {
                chooseStack.push(`choose ${chObj.count || 1} from ${chObj.from.map(it=>Renderer.get().render(`{@skill ${it.toTitleCase()}}`)).joinConjunct(", ", " and ")}`);
            }
        }

        const base = baseStack.joinConjunct(", ", " and ");
        const choose = chooseStack.join("");
        if (baseStack.length && chooseStack.length)
            return `${base}; and ${choose}`;
        else if (baseStack.length)
            return base;
        else if (chooseStack.length)
            return choose;
    }

    return skillProficiencies.map(renderSingle).join(" <i>or</i> ");
}
;

Parser.spSchoolAndSubschoolsAbvsToFull = function(school, subschools) {
    if (!subschools || !subschools.length)
        return Parser.spSchoolAbvToFull(school);
    else
        return `${Parser.spSchoolAbvToFull(school)} (${subschools.map(sub=>Parser.spSchoolAbvToFull(sub)).join(", ")})`;
}
;

Parser.spSchoolAbvToFull = function(schoolOrSubschool) {
    const out = Parser._parse_aToB(Parser.SP_SCHOOL_ABV_TO_FULL, schoolOrSubschool);
    if (Parser.SP_SCHOOL_ABV_TO_FULL[schoolOrSubschool])
        return out;
    if (PrereleaseUtil.getMetaLookup("spellSchools")?.[schoolOrSubschool])
        return PrereleaseUtil.getMetaLookup("spellSchools")?.[schoolOrSubschool].full;
    if (BrewUtil2.getMetaLookup("spellSchools")?.[schoolOrSubschool])
        return BrewUtil2.getMetaLookup("spellSchools")?.[schoolOrSubschool].full;
    return out;
}
;

Parser.spSchoolAndSubschoolsAbvsShort = function(school, subschools) {
    if (!subschools || !subschools.length)
        return Parser.spSchoolAbvToShort(school);
    else
        return `${Parser.spSchoolAbvToShort(school)} (${subschools.map(sub=>Parser.spSchoolAbvToShort(sub)).join(", ")})`;
}
;

Parser.spSchoolAbvToShort = function(school) {
    const out = Parser._parse_aToB(Parser.SP_SCHOOL_ABV_TO_SHORT, school);
    if (Parser.SP_SCHOOL_ABV_TO_SHORT[school])
        return out;
    if (PrereleaseUtil.getMetaLookup("spellSchools")?.[school])
        return PrereleaseUtil.getMetaLookup("spellSchools")?.[school].short;
    if (BrewUtil2.getMetaLookup("spellSchools")?.[school])
        return BrewUtil2.getMetaLookup("spellSchools")?.[school].short;
    if (out.length <= 4)
        return out;
    return `${out.slice(0, 3)}.`;
}
;

Parser.spSchoolAbvToStyle = function(school) {
    const stylePart = Parser.spSchoolAbvToStylePart(school);
    if (!stylePart)
        return stylePart;
    return `style="${stylePart}"`;
}
;

Parser.spSchoolAbvToStylePart = function(school) {
    return Parser._spSchoolAbvToStylePart_prereleaseBrew({
        school,
        brewUtil: PrereleaseUtil
    }) || Parser._spSchoolAbvToStylePart_prereleaseBrew({
        school,
        brewUtil: BrewUtil2
    }) || "";
}
;

Parser._spSchoolAbvToStylePart_prereleaseBrew = function({school, brewUtil}) {
    const rawColor = brewUtil.getMetaLookup("spellSchools")?.[school]?.color;
    if (!rawColor || !rawColor.trim())
        return "";
    const validColor = BrewUtilShared.getValidColor(rawColor);
    if (validColor.length)
        return `color: #${validColor};`;
}
;

Parser.getOrdinalForm = function(i) {
    i = Number(i);
    if (isNaN(i))
        return "";
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11)
        return `${i}st`;
    if (j === 2 && k !== 12)
        return `${i}nd`;
    if (j === 3 && k !== 13)
        return `${i}rd`;
    return `${i}th`;
}
;

Parser.spLevelToFull = function(level) {
    if (level === 0)
        return "Cantrip";
    else
        return Parser.getOrdinalForm(level);
}
;

Parser.getArticle = function(str) {
    str = `${str}`;
    str = str.replace(/\d+/g, (...m)=>Parser.numberToText(m[0]));
    return /^[aeiou]/i.test(str) ? "an" : "a";
}
;

Parser.spLevelToFullLevelText = function(level, {isDash=false, isPluralCantrips=true}={}) {
    return `${Parser.spLevelToFull(level)}${(level === 0 ? (isPluralCantrips ? "s" : "") : `${isDash ? "-" : " "}level`)}`;
}
;

Parser.spLevelToSpellPoints = function(lvl) {
    lvl = Number(lvl);
    if (isNaN(lvl) || lvl === 0)
        return 0;
    return Math.ceil(1.34 * lvl);
}
;

Parser.spMetaToArr = function(meta) {
    if (!meta)
        return [];
    return Object.entries(meta).filter(([_,v])=>v).sort(SortUtil.ascSort).map(([k])=>k);
}
;

Parser.spMetaToFull = function(meta) {
    if (!meta)
        return "";
    const metaTags = Parser.spMetaToArr(meta);
    if (metaTags.length)
        return ` (${metaTags.join(", ")})`;
    return "";
}
;

Parser.spLevelSchoolMetaToFull = function(level, school, meta, subschools) {
    const levelPart = level === 0 ? Parser.spLevelToFull(level).toLowerCase() : `${Parser.spLevelToFull(level)}-level`;
    const levelSchoolStr = level === 0 ? `${Parser.spSchoolAbvToFull(school)} ${levelPart}` : `${levelPart} ${Parser.spSchoolAbvToFull(school).toLowerCase()}`;

    const metaArr = Parser.spMetaToArr(meta);
    if (metaArr.length || (subschools && subschools.length)) {
        const metaAndSubschoolPart = [(subschools || []).map(sub=>Parser.spSchoolAbvToFull(sub)).join(", "), metaArr.join(", "), ].filter(Boolean).join("; ").toLowerCase();
        return `${levelSchoolStr} (${metaAndSubschoolPart})`;
    }
    return levelSchoolStr;
}
;

Parser.spTimeListToFull = function(times, isStripTags) {
    return times.map(t=>`${Parser.getTimeToFull(t)}${t.condition ? `, ${isStripTags ? Renderer.stripTags(t.condition) : Renderer.get().render(t.condition)}` : ""}`).join(" or ");
}
;

Parser.getTimeToFull = function(time) {
    return `${time.number ? `${time.number} ` : ""}${time.unit === "bonus" ? "bonus action" : time.unit}${time.number > 1 ? "s" : ""}`;
}
;

Parser.getMinutesToFull = function(mins) {
    const days = Math.floor(mins / (24 * 60));
    mins = mins % (24 * 60);

    const hours = Math.floor(mins / 60);
    mins = mins % 60;

    return [days ? `${days} day${days > 1 ? "s" : ""}` : null, hours ? `${hours} hour${hours > 1 ? "s" : ""}` : null, mins ? `${mins} minute${mins > 1 ? "s" : ""}` : null, ].filter(Boolean).join(" ");
}
;

Parser.RNG_SPECIAL = "special";
Parser.RNG_POINT = "point";
Parser.RNG_LINE = "line";
Parser.RNG_CUBE = "cube";
Parser.RNG_CONE = "cone";
Parser.RNG_RADIUS = "radius";
Parser.RNG_SPHERE = "sphere";
Parser.RNG_HEMISPHERE = "hemisphere";
Parser.RNG_CYLINDER = "cylinder";
Parser.RNG_SELF = "self";
Parser.RNG_SIGHT = "sight";
Parser.RNG_UNLIMITED = "unlimited";
Parser.RNG_UNLIMITED_SAME_PLANE = "plane";
Parser.RNG_TOUCH = "touch";
Parser.SP_RANGE_TYPE_TO_FULL = {
    [Parser.RNG_SPECIAL]: "Special",
    [Parser.RNG_POINT]: "Point",
    [Parser.RNG_LINE]: "Line",
    [Parser.RNG_CUBE]: "Cube",
    [Parser.RNG_CONE]: "Cone",
    [Parser.RNG_RADIUS]: "Radius",
    [Parser.RNG_SPHERE]: "Sphere",
    [Parser.RNG_HEMISPHERE]: "Hemisphere",
    [Parser.RNG_CYLINDER]: "Cylinder",
    [Parser.RNG_SELF]: "Self",
    [Parser.RNG_SIGHT]: "Sight",
    [Parser.RNG_UNLIMITED]: "Unlimited",
    [Parser.RNG_UNLIMITED_SAME_PLANE]: "Unlimited on the same plane",
    [Parser.RNG_TOUCH]: "Touch",
};

Parser.spRangeTypeToFull = function(range) {
    return Parser._parse_aToB(Parser.SP_RANGE_TYPE_TO_FULL, range);
}
;

Parser.UNT_FEET = "feet";
Parser.UNT_YARDS = "yards";
Parser.UNT_MILES = "miles";
Parser.SP_DIST_TYPE_TO_FULL = {
    [Parser.UNT_FEET]: "Feet",
    [Parser.UNT_YARDS]: "Yards",
    [Parser.UNT_MILES]: "Miles",
    [Parser.RNG_SELF]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_SELF],
    [Parser.RNG_TOUCH]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_TOUCH],
    [Parser.RNG_SIGHT]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_SIGHT],
    [Parser.RNG_UNLIMITED]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_UNLIMITED],
    [Parser.RNG_UNLIMITED_SAME_PLANE]: Parser.SP_RANGE_TYPE_TO_FULL[Parser.RNG_UNLIMITED_SAME_PLANE],
};

Parser.spDistanceTypeToFull = function(range) {
    return Parser._parse_aToB(Parser.SP_DIST_TYPE_TO_FULL, range);
}
;

Parser.SP_RANGE_TO_ICON = {
    [Parser.RNG_SPECIAL]: "fa-star",
    [Parser.RNG_POINT]: "",
    [Parser.RNG_LINE]: "fa-grip-lines-vertical",
    [Parser.RNG_CUBE]: "fa-cube",
    [Parser.RNG_CONE]: "fa-traffic-cone",
    [Parser.RNG_RADIUS]: "fa-hockey-puck",
    [Parser.RNG_SPHERE]: "fa-globe",
    [Parser.RNG_HEMISPHERE]: "fa-globe",
    [Parser.RNG_CYLINDER]: "fa-database",
    [Parser.RNG_SELF]: "fa-street-view",
    [Parser.RNG_SIGHT]: "fa-eye",
    [Parser.RNG_UNLIMITED_SAME_PLANE]: "fa-globe-americas",
    [Parser.RNG_UNLIMITED]: "fa-infinity",
    [Parser.RNG_TOUCH]: "fa-hand-paper",
};

Parser.spRangeTypeToIcon = function(range) {
    return Parser._parse_aToB(Parser.SP_RANGE_TO_ICON, range);
}
;

Parser.spRangeToShortHtml = function(range) {
    switch (range.type) {
    case Parser.RNG_SPECIAL:
        return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(range.type)} help-subtle" title="Special"></span>`;
    case Parser.RNG_POINT:
        return Parser.spRangeToShortHtml._renderPoint(range);
    case Parser.RNG_LINE:
    case Parser.RNG_CUBE:
    case Parser.RNG_CONE:
    case Parser.RNG_RADIUS:
    case Parser.RNG_SPHERE:
    case Parser.RNG_HEMISPHERE:
    case Parser.RNG_CYLINDER:
        return Parser.spRangeToShortHtml._renderArea(range);
    }
}
;
Parser.spRangeToShortHtml._renderPoint = function(range) {
    const dist = range.distance;
    switch (dist.type) {
    case Parser.RNG_SELF:
    case Parser.RNG_SIGHT:
    case Parser.RNG_UNLIMITED:
    case Parser.RNG_UNLIMITED_SAME_PLANE:
    case Parser.RNG_SPECIAL:
    case Parser.RNG_TOUCH:
        return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(dist.type)} help-subtle" title="${Parser.spRangeTypeToFull(dist.type)}"></span>`;
    case Parser.UNT_FEET:
    case Parser.UNT_YARDS:
    case Parser.UNT_MILES:
    default:
        return `${dist.amount} <span class="ve-small">${Parser.getSingletonUnit(dist.type, true)}</span>`;
    }
}
;
Parser.spRangeToShortHtml._renderArea = function(range) {
    const size = range.distance;
    return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(Parser.RNG_SELF)} help-subtle" title="Self"></span> ${size.amount}<span class="ve-small">-${Parser.getSingletonUnit(size.type, true)}</span> ${Parser.spRangeToShortHtml._getAreaStyleString(range)}`;
}
;
Parser.spRangeToShortHtml._getAreaStyleString = function(range) {
    return `<span class="fas fa-fw ${Parser.spRangeTypeToIcon(range.type)} help-subtle" title="${Parser.spRangeTypeToFull(range.type)}"></span>`;
}
;

Parser.spRangeToFull = function(range) {
    switch (range.type) {
    case Parser.RNG_SPECIAL:
        return Parser.spRangeTypeToFull(range.type);
    case Parser.RNG_POINT:
        return Parser.spRangeToFull._renderPoint(range);
    case Parser.RNG_LINE:
    case Parser.RNG_CUBE:
    case Parser.RNG_CONE:
    case Parser.RNG_RADIUS:
    case Parser.RNG_SPHERE:
    case Parser.RNG_HEMISPHERE:
    case Parser.RNG_CYLINDER:
        return Parser.spRangeToFull._renderArea(range);
    }
}
;
Parser.spRangeToFull._renderPoint = function(range) {
    const dist = range.distance;
    switch (dist.type) {
    case Parser.RNG_SELF:
    case Parser.RNG_SIGHT:
    case Parser.RNG_UNLIMITED:
    case Parser.RNG_UNLIMITED_SAME_PLANE:
    case Parser.RNG_SPECIAL:
    case Parser.RNG_TOUCH:
        return Parser.spRangeTypeToFull(dist.type);
    case Parser.UNT_FEET:
    case Parser.UNT_YARDS:
    case Parser.UNT_MILES:
    default:
        return `${dist.amount} ${dist.amount === 1 ? Parser.getSingletonUnit(dist.type) : dist.type}`;
    }
}
;
Parser.spRangeToFull._renderArea = function(range) {
    const size = range.distance;
    return `Self (${size.amount}-${Parser.getSingletonUnit(size.type)}${Parser.spRangeToFull._getAreaStyleString(range)}${range.type === Parser.RNG_CYLINDER ? `${size.amountSecondary != null && size.typeSecondary != null ? `, ${size.amountSecondary}-${Parser.getSingletonUnit(size.typeSecondary)}-high` : ""} cylinder` : ""})`;
}
;
Parser.spRangeToFull._getAreaStyleString = function(range) {
    switch (range.type) {
    case Parser.RNG_SPHERE:
        return " radius";
    case Parser.RNG_HEMISPHERE:
        return `-radius ${range.type}`;
    case Parser.RNG_CYLINDER:
        return "-radius";
    default:
        return ` ${range.type}`;
    }
}
;

Parser.getSingletonUnit = function(unit, isShort) {
    switch (unit) {
    case Parser.UNT_FEET:
        return isShort ? "ft." : "foot";
    case Parser.UNT_YARDS:
        return isShort ? "yd." : "yard";
    case Parser.UNT_MILES:
        return isShort ? "mi." : "mile";
    default:
        {
            const fromPrerelease = Parser._getSingletonUnit_prereleaseBrew({
                unit,
                isShort,
                brewUtil: PrereleaseUtil
            });
            if (fromPrerelease)
                return fromPrerelease;

            const fromBrew = Parser._getSingletonUnit_prereleaseBrew({
                unit,
                isShort,
                brewUtil: BrewUtil2
            });
            if (fromBrew)
                return fromBrew;

            if (unit.charAt(unit.length - 1) === "s")
                return unit.slice(0, -1);
            return unit;
        }
    }
}
;

Parser._getSingletonUnit_prereleaseBrew = function({unit, isShort, brewUtil}) {
    const fromBrew = brewUtil.getMetaLookup("spellDistanceUnits")?.[unit]?.["singular"];
    if (fromBrew)
        return fromBrew;
}
;

Parser.RANGE_TYPES = [{
    type: Parser.RNG_POINT,
    hasDistance: true,
    isRequireAmount: false
},
{
    type: Parser.RNG_LINE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_CUBE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_CONE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_RADIUS,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_SPHERE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_HEMISPHERE,
    hasDistance: true,
    isRequireAmount: true
}, {
    type: Parser.RNG_CYLINDER,
    hasDistance: true,
    isRequireAmount: true
},
{
    type: Parser.RNG_SPECIAL,
    hasDistance: false,
    isRequireAmount: false
}, ];

Parser.DIST_TYPES = [{
    type: Parser.RNG_SELF,
    hasAmount: false
}, {
    type: Parser.RNG_TOUCH,
    hasAmount: false
},
{
    type: Parser.UNT_FEET,
    hasAmount: true
}, {
    type: Parser.UNT_YARDS,
    hasAmount: true
}, {
    type: Parser.UNT_MILES,
    hasAmount: true
},
{
    type: Parser.RNG_SIGHT,
    hasAmount: false
}, {
    type: Parser.RNG_UNLIMITED_SAME_PLANE,
    hasAmount: false
}, {
    type: Parser.RNG_UNLIMITED,
    hasAmount: false
}, ];

Parser.spComponentsToFull = function(comp, level, {isPlainText=false}={}) {
    if (!comp)
        return "None";
    const out = [];
    if (comp.v)
        out.push("V");
    if (comp.s)
        out.push("S");
    if (comp.m != null) {
        const fnRender = isPlainText ? Renderer.stripTags.bind(Renderer) : Renderer.get().render.bind(Renderer.get());
        out.push(`M${comp.m !== true ? ` (${fnRender(comp.m.text != null ? comp.m.text : comp.m)})` : ""}`);
    }
    if (comp.r)
        out.push(`R (${level} gp)`);
    return out.join(", ") || "None";
}
;

Parser.SP_END_TYPE_TO_FULL = {
    "dispel": "dispelled",
    "trigger": "triggered",
    "discharge": "discharged",
};
Parser.spEndTypeToFull = function(type) {
    return Parser._parse_aToB(Parser.SP_END_TYPE_TO_FULL, type);
}
;

Parser.spDurationToFull = function(dur) {
    let hasSubOr = false;
    const outParts = dur.map(d=>{
        switch (d.type) {
        case "special":
            return "Special";
        case "instant":
            return `Instantaneous${d.condition ? ` (${d.condition})` : ""}`;
        case "timed":
            return `${d.concentration ? "Concentration, " : ""}${d.concentration ? "u" : d.duration.upTo ? "U" : ""}${d.concentration || d.duration.upTo ? "p to " : ""}${d.duration.amount} ${d.duration.amount === 1 ? d.duration.type : `${d.duration.type}s`}`;
        case "permanent":
            {
                if (d.ends) {
                    const endsToJoin = d.ends.map(m=>Parser.spEndTypeToFull(m));
                    hasSubOr = hasSubOr || endsToJoin.length > 1;
                    return `Until ${endsToJoin.joinConjunct(", ", " or ")}`;
                } else {
                    return "Permanent";
                }
            }
        }
    }
    );
    return `${outParts.joinConjunct(hasSubOr ? "; " : ", ", " or ")}${dur.length > 1 ? " (see below)" : ""}`;
}
;

Parser.DURATION_TYPES = [{
    type: "instant",
    full: "Instantaneous"
}, {
    type: "timed",
    hasAmount: true
}, {
    type: "permanent",
    hasEnds: true
}, {
    type: "special"
}, ];

Parser.DURATION_AMOUNT_TYPES = ["turn", "round", "minute", "hour", "day", "week", "year", ];

Parser.spClassesToFull = function(sp, {isTextOnly=false, subclassLookup={}}={}) {
    const fromSubclassList = Renderer.spell.getCombinedClasses(sp, "fromSubclass");
    const fromSubclasses = Parser.spSubclassesToFull(fromSubclassList, {
        isTextOnly,
        subclassLookup
    });
    const fromClassList = Renderer.spell.getCombinedClasses(sp, "fromClassList");
    return `${Parser.spMainClassesToFull(fromClassList, {
        isTextOnly
    })}${fromSubclasses ? `, ${fromSubclasses}` : ""}`;
}
;

Parser.spMainClassesToFull = function(fromClassList, {isTextOnly=false}={}) {
    return fromClassList.map(c=>({
        hash: UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](c),
        c
    })).filter(it=>!ExcludeUtil.isInitialised || !ExcludeUtil.isExcluded(it.hash, "class", it.c.source)).sort((a,b)=>SortUtil.ascSort(a.c.name, b.c.name)).map(it=>{
        if (isTextOnly)
            return it.c.name;

        return `<span title="${it.c.definedInSource ? `Class source` : "Source"}: ${Parser.sourceJsonToFull(it.c.source)}${it.c.definedInSource ? `. Spell list defined in: ${Parser.sourceJsonToFull(it.c.definedInSource)}.` : ""}">${Renderer.get().render(`{@class ${it.c.name}|${it.c.source}}`)}</span>`;
    }
    ).join(", ") || "";
}
;

Parser.spSubclassesToFull = function(fromSubclassList, {isTextOnly=false, subclassLookup={}}={}) {
    return fromSubclassList.filter(mt=>{
        if (!ExcludeUtil.isInitialised)
            return true;
        const excludeClass = ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES](mt.class), "class", mt.class.source);
        if (excludeClass)
            return false;

        return !ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER["subclass"]({
            shortName: mt.subclass.name,
            source: mt.subclass.source,
            className: mt.class.name,
            classSource: mt.class.source,
        }), "subclass", mt.subclass.source, {
            isNoCount: true
        }, );
    }
    ).sort((a,b)=>{
        const byName = SortUtil.ascSort(a.class.name, b.class.name);
        return byName || SortUtil.ascSort(a.subclass.name, b.subclass.name);
    }
    ).map(c=>Parser._spSubclassItem({
        fromSubclass: c,
        isTextOnly
    })).join(", ") || "";
}
;

Parser._spSubclassItem = function({fromSubclass, isTextOnly}) {
    const c = fromSubclass.class;
    const sc = fromSubclass.subclass;
    const text = `${sc.shortName}${sc.subSubclass ? ` (${sc.subSubclass})` : ""}`;
    if (isTextOnly)
        return text;

    const classPart = `<span title="Source: ${Parser.sourceJsonToFull(c.source)}${c.definedInSource ? ` From a class spell list defined in: ${Parser.sourceJsonToFull(c.definedInSource)}` : ""}">${Renderer.get().render(`{@class ${c.name}|${c.source}}`)}</span>`;

    return `<span class="italic" title="Source: ${Parser.sourceJsonToFull(fromSubclass.subclass.source)}">${Renderer.get().render(`{@class ${c.name}|${c.source}|${text}|${sc.shortName}|${sc.source}}`)}</span> ${classPart}`;
}
;

Parser.SPELL_ATTACK_TYPE_TO_FULL = {};
Parser.SPELL_ATTACK_TYPE_TO_FULL["M"] = "Melee";
Parser.SPELL_ATTACK_TYPE_TO_FULL["R"] = "Ranged";
Parser.SPELL_ATTACK_TYPE_TO_FULL["O"] = "Other/Unknown";

Parser.spAttackTypeToFull = function(type) {
    return Parser._parse_aToB(Parser.SPELL_ATTACK_TYPE_TO_FULL, type);
}
;

Parser.SPELL_AREA_TYPE_TO_FULL = {
    ST: "Single Target",
    MT: "Multiple Targets",
    C: "Cube",
    N: "Cone",
    Y: "Cylinder",
    S: "Sphere",
    R: "Circle",
    Q: "Square",
    L: "Line",
    H: "Hemisphere",
    W: "Wall",
};
Parser.spAreaTypeToFull = function(type) {
    return Parser._parse_aToB(Parser.SPELL_AREA_TYPE_TO_FULL, type);
}
;

Parser.SP_MISC_TAG_TO_FULL = {
    HL: "Healing",
    THP: "Grants Temporary Hit Points",
    SGT: "Requires Sight",
    PRM: "Permanent Effects",
    SCL: "Scaling Effects",
    SMN: "Summons Creature",
    MAC: "Modifies AC",
    TP: "Teleportation",
    FMV: "Forced Movement",
    RO: "Rollable Effects",
    LGTS: "Creates Sunlight",
    LGT: "Creates Light",
    UBA: "Uses Bonus Action",
    PS: "Plane Shifting",
    OBS: "Obscures Vision",
    DFT: "Difficult Terrain",
    AAD: "Additional Attack Damage",
    OBJ: "Affects Objects",
    ADV: "Grants Advantage",
};
Parser.spMiscTagToFull = function(type) {
    return Parser._parse_aToB(Parser.SP_MISC_TAG_TO_FULL, type);
}
;

Parser.SP_CASTER_PROGRESSION_TO_FULL = {
    full: "Full",
    "1/2": "Half",
    "1/3": "One-Third",
    "pact": "Pact Magic",
};
Parser.spCasterProgressionToFull = function(type) {
    return Parser._parse_aToB(Parser.SP_CASTER_PROGRESSION_TO_FULL, type);
}
;

Parser.monTypeToFullObj = function(type) {
    const out = {
        types: [],
        tags: [],
        asText: "",
        asTextShort: "",

        typeSidekick: null,
        tagsSidekick: [],
        asTextSidekick: null,
    };

    if (typeof type === "string") {
        out.types = [type];
        out.asText = type.toTitleCase();
        out.asTextShort = out.asText;
        return out;
    }

    if (type.type?.choose) {
        out.types = type.type.choose;
    } else {
        out.types = [type.type];
    }

    if (type.swarmSize) {
        out.tags.push("swarm");
        out.asText = `swarm of ${Parser.sizeAbvToFull(type.swarmSize)} ${out.types.map(typ=>Parser.monTypeToPlural(typ).toTitleCase()).joinConjunct(", ", " or ")}`;
        out.asTextShort = out.asText;
        out.swarmSize = type.swarmSize;
    } else {
        out.asText = out.types.map(typ=>typ.toTitleCase()).joinConjunct(", ", " or ");
        out.asTextShort = out.asText;
    }

    const tagMetas = Parser.monTypeToFullObj._getTagMetas(type.tags);
    if (tagMetas.length) {
        out.tags.push(...tagMetas.map(({filterTag})=>filterTag));
        const ptTags = ` (${tagMetas.map(({displayTag})=>displayTag).join(", ")})`;
        out.asText += ptTags;
        out.asTextShort += ptTags;
    }

    if (type.note)
        out.asText += ` ${type.note}`;

    if (type.sidekickType) {
        out.typeSidekick = type.sidekickType;
        if (!type.sidekickHidden)
            out.asTextSidekick = `${type.sidekickType}`;

        const tagMetas = Parser.monTypeToFullObj._getTagMetas(type.sidekickTags);
        if (tagMetas.length) {
            out.tagsSidekick.push(...tagMetas.map(({filterTag})=>filterTag));
            if (!type.sidekickHidden)
                out.asTextSidekick += ` (${tagMetas.map(({displayTag})=>displayTag).join(", ")})`;
        }
    }

    return out;
}
;

Parser.monTypeToFullObj._getTagMetas = (tags)=>{
    return tags ? tags.map(tag=>{
        if (typeof tag === "string") {
            return {
                filterTag: tag.toLowerCase(),
                displayTag: tag.toTitleCase(),
            };
        } else {
            return {
                filterTag: tag.tag.toLowerCase(),
                displayTag: `${tag.prefix} ${tag.tag}`.toTitleCase(),
            };
        }
    }
    ) : [];
}
;

Parser.monTypeToPlural = function(type) {
    return Parser._parse_aToB(Parser.MON_TYPE_TO_PLURAL, type);
}
;

Parser.monTypeFromPlural = function(type) {
    return Parser._parse_bToA(Parser.MON_TYPE_TO_PLURAL, type);
}
;

Parser.monCrToFull = function(cr, {xp=null, isMythic=false}={}) {
    if (cr == null)
        return "";

    if (typeof cr === "string") {
        if (Parser.crToNumber(cr) >= VeCt.CR_CUSTOM)
            return `${cr}${xp != null ? ` (${xp} XP)` : ""}`;

        xp = xp != null ? Parser._addCommas(xp) : Parser.crToXp(cr);
        return `${cr} (${xp} XP${isMythic ? `, or ${Parser.crToXp(cr, {
            isDouble: true
        })} XP as a mythic encounter` : ""})`;
    } else {
        const stack = [Parser.monCrToFull(cr.cr, {
            xp: cr.xp,
            isMythic
        })];
        if (cr.lair)
            stack.push(`${Parser.monCrToFull(cr.lair)} when encountered in lair`);
        if (cr.coven)
            stack.push(`${Parser.monCrToFull(cr.coven)} when part of a coven`);
        return stack.joinConjunct(", ", " or ");
    }
}
;

Parser.getFullImmRes = function(toParse) {
    if (!toParse?.length)
        return "";

    let maxDepth = 0;

    function toString(it, depth=0) {
        maxDepth = Math.max(maxDepth, depth);
        if (typeof it === "string") {
            return it;
        } else if (it.special) {
            return it.special;
        } else {
            const stack = [];

            if (it.preNote)
                stack.push(it.preNote);

            const prop = it.immune ? "immune" : it.resist ? "resist" : it.vulnerable ? "vulnerable" : null;
            if (prop) {
                const toJoin = it[prop].length === Parser.DMG_TYPES.length && CollectionUtil.deepEquals(Parser.DMG_TYPES, it[prop]) ? ["all damage"] : it[prop].map(nxt=>toString(nxt, depth + 1));
                stack.push(depth ? toJoin.join(maxDepth ? "; " : ", ") : toJoin.joinConjunct(", ", " and "));
            }

            if (it.note)
                stack.push(it.note);

            return stack.join(" ");
        }
    }

    const arr = toParse.map(it=>toString(it));

    if (arr.length <= 1)
        return arr.join("");

    let out = "";
    for (let i = 0; i < arr.length - 1; ++i) {
        const it = arr[i];
        const nxt = arr[i + 1];

        const orig = toParse[i];
        const origNxt = toParse[i + 1];

        out += it;
        out += (it.includes(",") || nxt.includes(",") || (orig && orig.cond) || (origNxt && origNxt.cond)) ? "; " : ", ";
    }
    out += arr.last();
    return out;
}
;

Parser.getFullCondImm = function(condImm, {isPlainText=false, isEntry=false}={}) {
    if (isPlainText && isEntry)
        throw new Error(`Options "isPlainText" and "isEntry" are mutually exclusive!`);

    if (!condImm?.length)
        return "";

    const render = condition=>{
        if (isPlainText)
            return condition;
        const ent = `{@condition ${condition}}`;
        if (isEntry)
            return ent;
        return Renderer.get().render(ent);
    }
    ;

    return condImm.map(it=>{
        if (it.special)
            return it.special;
        if (it.conditionImmune)
            return `${it.preNote ? `${it.preNote} ` : ""}${it.conditionImmune.map(render).join(", ")}${it.note ? ` ${it.note}` : ""}`;
        return render(it);
    }
    ).sort(SortUtil.ascSortLower).join(", ");
}
;

Parser.MON_SENSE_TAG_TO_FULL = {
    "B": "blindsight",
    "D": "darkvision",
    "SD": "superior darkvision",
    "T": "tremorsense",
    "U": "truesight",
};
Parser.monSenseTagToFull = function(tag) {
    return Parser._parse_aToB(Parser.MON_SENSE_TAG_TO_FULL, tag);
}
;

Parser.MON_SPELLCASTING_TAG_TO_FULL = {
    "P": "Psionics",
    "I": "Innate",
    "F": "Form Only",
    "S": "Shared",
    "O": "Other",
    "CA": "Class, Artificer",
    "CB": "Class, Bard",
    "CC": "Class, Cleric",
    "CD": "Class, Druid",
    "CP": "Class, Paladin",
    "CR": "Class, Ranger",
    "CS": "Class, Sorcerer",
    "CL": "Class, Warlock",
    "CW": "Class, Wizard",
};
Parser.monSpellcastingTagToFull = function(tag) {
    return Parser._parse_aToB(Parser.MON_SPELLCASTING_TAG_TO_FULL, tag);
}
;

Parser.MON_MISC_TAG_TO_FULL = {
    "AOE": "Has Areas of Effect",
    "HPR": "Has HP Reduction",
    "MW": "Has Weapon Attacks, Melee",
    "RW": "Has Weapon Attacks, Ranged",
    "MLW": "Has Melee Weapons",
    "RNG": "Has Ranged Weapons",
    "RCH": "Has Reach Attacks",
    "THW": "Has Thrown Weapons",
};
Parser.monMiscTagToFull = function(tag) {
    return Parser._parse_aToB(Parser.MON_MISC_TAG_TO_FULL, tag);
}
;

Parser.MON_LANGUAGE_TAG_TO_FULL = {
    "AB": "Abyssal",
    "AQ": "Aquan",
    "AU": "Auran",
    "C": "Common",
    "CE": "Celestial",
    "CS": "Can't Speak Known Languages",
    "D": "Dwarvish",
    "DR": "Draconic",
    "DS": "Deep Speech",
    "DU": "Druidic",
    "E": "Elvish",
    "G": "Gnomish",
    "GI": "Giant",
    "GO": "Goblin",
    "GTH": "Gith",
    "H": "Halfling",
    "I": "Infernal",
    "IG": "Ignan",
    "LF": "Languages Known in Life",
    "O": "Orc",
    "OTH": "Other",
    "P": "Primordial",
    "S": "Sylvan",
    "T": "Terran",
    "TC": "Thieves' cant",
    "TP": "Telepathy",
    "U": "Undercommon",
    "X": "Any (Choose)",
    "XX": "All",
};
Parser.monLanguageTagToFull = function(tag) {
    return Parser._parse_aToB(Parser.MON_LANGUAGE_TAG_TO_FULL, tag);
}
;

Parser.ENVIRONMENTS = ["arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain", "swamp", "underdark", "underwater", "urban"];

Parser.PSI_ABV_TYPE_TALENT = "T";
Parser.PSI_ABV_TYPE_DISCIPLINE = "D";
Parser.PSI_ORDER_NONE = "None";
Parser.psiTypeToFull = type=>Parser.psiTypeToMeta(type).full;

Parser.psiTypeToMeta = type=>{
    let out = {};
    if (type === Parser.PSI_ABV_TYPE_TALENT)
        out = {
            hasOrder: false,
            full: "Talent"
        };
    else if (type === Parser.PSI_ABV_TYPE_DISCIPLINE)
        out = {
            hasOrder: true,
            full: "Discipline"
        };
    else if (PrereleaseUtil.getMetaLookup("psionicTypes")?.[type])
        out = MiscUtil.copyFast(PrereleaseUtil.getMetaLookup("psionicTypes")[type]);
    else if (BrewUtil2.getMetaLookup("psionicTypes")?.[type])
        out = MiscUtil.copyFast(BrewUtil2.getMetaLookup("psionicTypes")[type]);
    out.full = out.full || "Unknown";
    out.short = out.short || out.full;
    return out;
}
;

Parser.psiOrderToFull = (order)=>{
    return order === undefined ? Parser.PSI_ORDER_NONE : order;
}
;

Parser.prereqSpellToFull = function(spell, {isTextOnly=false}={}) {
    if (spell) {
        const [text,suffix] = spell.split("#");
        if (!suffix)
            return isTextOnly ? spell : Renderer.get().render(`{@spell ${spell}}`);
        else if (suffix === "c")
            return (isTextOnly ? Renderer.stripTags : Renderer.get().render.bind(Renderer.get()))(`{@spell ${text}} cantrip`);
        else if (suffix === "x")
            return (isTextOnly ? Renderer.stripTags : Renderer.get().render.bind(Renderer.get()))("{@spell hex} spell or a warlock feature that curses");
    } else
        return VeCt.STR_NONE;
}
;

Parser.prereqPactToFull = function(pact) {
    if (pact === "Chain")
        return "Pact of the Chain";
    if (pact === "Tome")
        return "Pact of the Tome";
    if (pact === "Blade")
        return "Pact of the Blade";
    if (pact === "Talisman")
        return "Pact of the Talisman";
    return pact;
}
;

Parser.prereqPatronToShort = function(patron) {
    if (patron === "Any")
        return patron;
    const mThe = /^The (.*?)$/.exec(patron);
    if (mThe)
        return mThe[1];
    return patron;
}
;

Parser.OPT_FEATURE_TYPE_TO_FULL = {
    AI: "Artificer Infusion",
    ED: "Elemental Discipline",
    EI: "Eldritch Invocation",
    MM: "Metamagic",
    "MV": "Maneuver",
    "MV:B": "Maneuver, Battle Master",
    "MV:C2-UA": "Maneuver, Cavalier V2 (UA)",
    "AS:V1-UA": "Arcane Shot, V1 (UA)",
    "AS:V2-UA": "Arcane Shot, V2 (UA)",
    "AS": "Arcane Shot",
    OTH: "Other",
    "FS:F": "Fighting Style; Fighter",
    "FS:B": "Fighting Style; Bard",
    "FS:P": "Fighting Style; Paladin",
    "FS:R": "Fighting Style; Ranger",
    "PB": "Pact Boon",
    "OR": "Onomancy Resonant",
    "RN": "Rune Knight Rune",
    "AF": "Alchemical Formula",
};

Parser.optFeatureTypeToFull = function(type) {
    if (Parser.OPT_FEATURE_TYPE_TO_FULL[type])
        return Parser.OPT_FEATURE_TYPE_TO_FULL[type];
    if (PrereleaseUtil.getMetaLookup("optionalFeatureTypes")?.[type])
        return PrereleaseUtil.getMetaLookup("optionalFeatureTypes")[type];
    if (BrewUtil2.getMetaLookup("optionalFeatureTypes")?.[type])
        return BrewUtil2.getMetaLookup("optionalFeatureTypes")[type];
    return type;
}
;

Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL = {
    "SG": "Supernatural Gift",
    "OF": "Optional Feature",
    "DG": "Dark Gift",
    "RF:B": "Replacement Feature: Background",
    "CS": "Character Secret",
};

Parser.charCreationOptionTypeToFull = function(type) {
    if (Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL[type])
        return Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL[type];
    if (PrereleaseUtil.getMetaLookup("charOption")?.[type])
        return PrereleaseUtil.getMetaLookup("charOption")[type];
    if (BrewUtil2.getMetaLookup("charOption")?.[type])
        return BrewUtil2.getMetaLookup("charOption")[type];
    return type;
}
;

Parser.alignmentAbvToFull = function(alignment) {
    if (!alignment)
        return null;
    if (typeof alignment === "object") {
        if (alignment.special != null) {
            return alignment.special;
        } else {
            return `${alignment.alignment.map(a=>Parser.alignmentAbvToFull(a)).join(" ")}${alignment.chance ? ` (${alignment.chance}%)` : ""}${alignment.note ? ` (${alignment.note})` : ""}`;
        }
    } else {
        alignment = alignment.toUpperCase();
        switch (alignment) {
        case "L":
            return "lawful";
        case "N":
            return "neutral";
        case "NX":
            return "neutral (law/chaos axis)";
        case "NY":
            return "neutral (good/evil axis)";
        case "C":
            return "chaotic";
        case "G":
            return "good";
        case "E":
            return "evil";
        case "U":
            return "unaligned";
        case "A":
            return "any alignment";
        }
        return alignment;
    }
}
;

Parser.alignmentListToFull = function(alignList) {
    if (!alignList)
        return "";
    if (alignList.some(it=>typeof it !== "string")) {
        if (alignList.some(it=>typeof it === "string"))
            throw new Error(`Mixed alignment types: ${JSON.stringify(alignList)}`);
        alignList = alignList.filter(it=>it.alignment === undefined || it.alignment != null);
        return alignList.map(it=>it.special != null || it.chance != null || it.note != null ? Parser.alignmentAbvToFull(it) : Parser.alignmentListToFull(it.alignment)).join(" or ");
    } else {
        if (alignList.length === 1)
            return Parser.alignmentAbvToFull(alignList[0]);
        if (alignList.length === 2) {
            return alignList.map(a=>Parser.alignmentAbvToFull(a)).join(" ");
        }
        if (alignList.length === 3) {
            if (alignList.includes("NX") && alignList.includes("NY") && alignList.includes("N"))
                return "any neutral alignment";
        }
        if (alignList.length === 5) {
            if (!alignList.includes("G"))
                return "any non-good alignment";
            if (!alignList.includes("E"))
                return "any non-evil alignment";
            if (!alignList.includes("L"))
                return "any non-lawful alignment";
            if (!alignList.includes("C"))
                return "any non-chaotic alignment";
        }
        if (alignList.length === 4) {
            if (!alignList.includes("L") && !alignList.includes("NX"))
                return "any chaotic alignment";
            if (!alignList.includes("G") && !alignList.includes("NY"))
                return "any evil alignment";
            if (!alignList.includes("C") && !alignList.includes("NX"))
                return "any lawful alignment";
            if (!alignList.includes("E") && !alignList.includes("NY"))
                return "any good alignment";
        }
        throw new Error(`Unmapped alignment: ${JSON.stringify(alignList)}`);
    }
}
;

Parser.weightToFull = function(lbs, isSmallUnit) {
    const tons = Math.floor(lbs / 2000);
    lbs = lbs - (2000 * tons);
    return [tons ? `${tons}${isSmallUnit ? `<span class="ve-small ml-1">` : " "}ton${tons === 1 ? "" : "s"}${isSmallUnit ? `</span>` : ""}` : null, lbs ? `${lbs}${isSmallUnit ? `<span class="ve-small ml-1">` : " "}lb.${isSmallUnit ? `</span>` : ""}` : null, ].filter(Boolean).join(", ");
}
;

Parser.RARITIES = ["common", "uncommon", "rare", "very rare", "legendary", "artifact"];
Parser.ITEM_RARITIES = ["none", ...Parser.RARITIES, "unknown", "unknown (magic)", "other"];

Parser.CAT_ID_CREATURE = 1;
Parser.CAT_ID_SPELL = 2;
Parser.CAT_ID_BACKGROUND = 3;
Parser.CAT_ID_ITEM = 4;
Parser.CAT_ID_CLASS = 5;
Parser.CAT_ID_CONDITION = 6;
Parser.CAT_ID_FEAT = 7;
Parser.CAT_ID_ELDRITCH_INVOCATION = 8;
Parser.CAT_ID_PSIONIC = 9;
Parser.CAT_ID_RACE = 10;
Parser.CAT_ID_OTHER_REWARD = 11;
Parser.CAT_ID_VARIANT_OPTIONAL_RULE = 12;
Parser.CAT_ID_ADVENTURE = 13;
Parser.CAT_ID_DEITY = 14;
Parser.CAT_ID_OBJECT = 15;
Parser.CAT_ID_TRAP = 16;
Parser.CAT_ID_HAZARD = 17;
Parser.CAT_ID_QUICKREF = 18;
Parser.CAT_ID_CULT = 19;
Parser.CAT_ID_BOON = 20;
Parser.CAT_ID_DISEASE = 21;
Parser.CAT_ID_METAMAGIC = 22;
Parser.CAT_ID_MANEUVER_BATTLEMASTER = 23;
Parser.CAT_ID_TABLE = 24;
Parser.CAT_ID_TABLE_GROUP = 25;
Parser.CAT_ID_MANEUVER_CAVALIER = 26;
Parser.CAT_ID_ARCANE_SHOT = 27;
Parser.CAT_ID_OPTIONAL_FEATURE_OTHER = 28;
Parser.CAT_ID_FIGHTING_STYLE = 29;
Parser.CAT_ID_CLASS_FEATURE = 30;
Parser.CAT_ID_VEHICLE = 31;
Parser.CAT_ID_PACT_BOON = 32;
Parser.CAT_ID_ELEMENTAL_DISCIPLINE = 33;
Parser.CAT_ID_ARTIFICER_INFUSION = 34;
Parser.CAT_ID_SHIP_UPGRADE = 35;
Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE = 36;
Parser.CAT_ID_ONOMANCY_RESONANT = 37;
Parser.CAT_ID_RUNE_KNIGHT_RUNE = 37;
Parser.CAT_ID_ALCHEMICAL_FORMULA = 38;
Parser.CAT_ID_MANEUVER = 39;
Parser.CAT_ID_SUBCLASS = 40;
Parser.CAT_ID_SUBCLASS_FEATURE = 41;
Parser.CAT_ID_ACTION = 42;
Parser.CAT_ID_LANGUAGE = 43;
Parser.CAT_ID_BOOK = 44;
Parser.CAT_ID_PAGE = 45;
Parser.CAT_ID_LEGENDARY_GROUP = 46;
Parser.CAT_ID_CHAR_CREATION_OPTIONS = 47;
Parser.CAT_ID_RECIPES = 48;
Parser.CAT_ID_STATUS = 49;
Parser.CAT_ID_SKILLS = 50;
Parser.CAT_ID_SENSES = 51;
Parser.CAT_ID_DECK = 52;
Parser.CAT_ID_CARD = 53;

Parser.CAT_ID_TO_FULL = {};
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CREATURE] = "Bestiary";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SPELL] = "Spell";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BACKGROUND] = "Background";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ITEM] = "Item";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS] = "Class";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CONDITION] = "Condition";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FEAT] = "Feat";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ELDRITCH_INVOCATION] = "Eldritch Invocation";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PSIONIC] = "Psionic";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RACE] = "Race";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OTHER_REWARD] = "Other Reward";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = "Variant/Optional Rule";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ADVENTURE] = "Adventure";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DEITY] = "Deity";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OBJECT] = "Object";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TRAP] = "Trap";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_HAZARD] = "Hazard";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_QUICKREF] = "Quick Reference";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CULT] = "Cult";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BOON] = "Boon";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DISEASE] = "Disease";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_METAMAGIC] = "Metamagic";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = "Maneuver; Battlemaster";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE] = "Table";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_TABLE_GROUP] = "Table";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER_CAVALIER] = "Maneuver; Cavalier";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARCANE_SHOT] = "Arcane Shot";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = "Optional Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_FIGHTING_STYLE] = "Fighting Style";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CLASS_FEATURE] = "Class Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_VEHICLE] = "Vehicle";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PACT_BOON] = "Pact Boon";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = "Elemental Discipline";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ARTIFICER_INFUSION] = "Infusion";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SHIP_UPGRADE] = "Ship Upgrade";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] = "Infernal War Machine Upgrade";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ONOMANCY_RESONANT] = "Onomancy Resonant";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = "Rune Knight Rune";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ALCHEMICAL_FORMULA] = "Alchemical Formula";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_MANEUVER] = "Maneuver";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS] = "Subclass";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SUBCLASS_FEATURE] = "Subclass Feature";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_ACTION] = "Action";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_LANGUAGE] = "Language";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_BOOK] = "Book";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_PAGE] = "Page";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_LEGENDARY_GROUP] = "Legendary Group";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CHAR_CREATION_OPTIONS] = "Character Creation Option";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_RECIPES] = "Recipe";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_STATUS] = "Status";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_DECK] = "Deck";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_CARD] = "Card";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SKILLS] = "Skill";
Parser.CAT_ID_TO_FULL[Parser.CAT_ID_SENSES] = "Sense";

Parser.pageCategoryToFull = function(catId) {
    return Parser._parse_aToB(Parser.CAT_ID_TO_FULL, catId);
}
;

Parser.CAT_ID_TO_PROP = {};
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CREATURE] = "monster";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SPELL] = "spell";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BACKGROUND] = "background";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ITEM] = "item";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS] = "class";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CONDITION] = "condition";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FEAT] = "feat";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PSIONIC] = "psionic";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RACE] = "race";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OTHER_REWARD] = "reward";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VARIANT_OPTIONAL_RULE] = "variantrule";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ADVENTURE] = "adventure";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DEITY] = "deity";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OBJECT] = "object";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TRAP] = "trap";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_HAZARD] = "hazard";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CULT] = "cult";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BOON] = "boon";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DISEASE] = "condition";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE] = "table";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_TABLE_GROUP] = "tableGroup";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_VEHICLE] = "vehicle";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ELDRITCH_INVOCATION] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER_CAVALIER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARCANE_SHOT] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_OPTIONAL_FEATURE_OTHER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_FIGHTING_STYLE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_METAMAGIC] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER_BATTLEMASTER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PACT_BOON] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ELEMENTAL_DISCIPLINE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ARTIFICER_INFUSION] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SHIP_UPGRADE] = "vehicleUpgrade";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_INFERNAL_WAR_MACHINE_UPGRADE] = "vehicleUpgrade";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ONOMANCY_RESONANT] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RUNE_KNIGHT_RUNE] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ALCHEMICAL_FORMULA] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_MANEUVER] = "optionalfeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_QUICKREF] = null;
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CLASS_FEATURE] = "classFeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS] = "subclass";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SUBCLASS_FEATURE] = "subclassFeature";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_ACTION] = "action";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_LANGUAGE] = "language";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_BOOK] = "book";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_PAGE] = null;
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_LEGENDARY_GROUP] = "legendaryGroup";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CHAR_CREATION_OPTIONS] = "charoption";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_RECIPES] = "recipe";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_STATUS] = "status";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_DECK] = "deck";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_CARD] = "card";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SKILLS] = "skill";
Parser.CAT_ID_TO_PROP[Parser.CAT_ID_SENSES] = "sense";

Parser.pageCategoryToProp = function(catId) {
    return Parser._parse_aToB(Parser.CAT_ID_TO_PROP, catId);
}
;

Parser.ABIL_ABVS = ["str", "dex", "con", "int", "wis", "cha"];

Parser.spClassesToCurrentAndLegacy = function(fromClassList) {
    const current = [];
    const legacy = [];
    fromClassList.forEach(cls=>{
        if ((cls.name === "Artificer" && cls.source === "UAArtificer") || (cls.name === "Artificer (Revisited)" && cls.source === "UAArtificerRevisited"))
            legacy.push(cls);
        else
            current.push(cls);
    }
    );
    return [current, legacy];
}
;

Parser.spSubclassesToCurrentAndLegacyFull = function(sp, subclassLookup) {
    return Parser._spSubclassesToCurrentAndLegacyFull({
        sp,
        subclassLookup,
        prop: "fromSubclass"
    });
}
;

Parser.spVariantSubclassesToCurrentAndLegacyFull = function(sp, subclassLookup) {
    return Parser._spSubclassesToCurrentAndLegacyFull({
        sp,
        subclassLookup,
        prop: "fromSubclassVariant"
    });
}
;

Parser._spSubclassesToCurrentAndLegacyFull = ({sp, subclassLookup, prop})=>{
    const fromSubclass = Renderer.spell.getCombinedClasses(sp, prop);
    if (!fromSubclass.length)
        return ["", ""];

    const current = [];
    const legacy = [];
    const curNames = new Set();
    const toCheck = [];
    fromSubclass.filter(c=>{
        const excludeClass = ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({
            name: c.class.name,
            source: c.class.source
        }), "class", c.class.source, {
            isNoCount: true
        }, );
        if (excludeClass)
            return false;

        const excludeSubclass = ExcludeUtil.isExcluded(UrlUtil.URL_TO_HASH_BUILDER["subclass"]({
            shortName: c.subclass.shortName,
            source: c.subclass.source,
            className: c.class.name,
            classSource: c.class.source,
        }), "subclass", c.subclass.source, {
            isNoCount: true
        }, );
        if (excludeSubclass)
            return false;

        return !Renderer.spell.isExcludedSubclassVariantSource({
            classDefinedInSource: c.class.definedInSource
        });
    }
    ).sort((a,b)=>{
        const byName = SortUtil.ascSort(a.subclass.name, b.subclass.name);
        return byName || SortUtil.ascSort(a.class.name, b.class.name);
    }
    ).forEach(c=>{
        const nm = c.subclass.name;
        const src = c.subclass.source;

        const toAdd = Parser._spSubclassItem({
            fromSubclass: c,
            isTextOnly: false
        });

        const fromLookup = MiscUtil.get(subclassLookup, c.class.source, c.class.name, c.subclass.source, c.subclass.name, );

        if (fromLookup && fromLookup.isReprinted) {
            legacy.push(toAdd);
        } else if (SourceUtil.isNonstandardSource(src)) {
            const cleanName = Parser._spSubclassesToCurrentAndLegacyFull.mapClassShortNameToMostRecent(nm.split("(")[0].trim().split(/v\d+/)[0].trim(), );
            toCheck.push({
                "name": cleanName,
                "ele": toAdd
            });
        } else {
            current.push(toAdd);
            curNames.add(nm);
        }
    }
    );

    toCheck.forEach(n=>{
        if (curNames.has(n.name)) {
            legacy.push(n.ele);
        } else {
            current.push(n.ele);
        }
    }
    );

    return [current.join(", "), legacy.join(", ")];
}
;

Parser._spSubclassesToCurrentAndLegacyFull.mapClassShortNameToMostRecent = (shortName)=>{
    switch (shortName) {
    case "Favored Soul":
        return "Divine Soul";
    case "Undying Light":
        return "Celestial";
    case "Deep Stalker":
        return "Gloom Stalker";
    }
    return shortName;
}
;

Parser.spVariantClassesToCurrentAndLegacy = function(fromVariantClassList) {
    const current = [];
    const legacy = [];
    fromVariantClassList.forEach(cls=>{
        if (SourceUtil.isPrereleaseSource(cls.definedInSource))
            legacy.push(cls);
        else
            current.push(cls);
    }
    );
    return [current, legacy];
}
;

Parser.attackTypeToFull = function(attackType) {
    return Parser._parse_aToB(Parser.ATK_TYPE_TO_FULL, attackType);
}
;

Parser.trapHazTypeToFull = function(type) {
    return Parser._parse_aToB(Parser.TRAP_HAZARD_TYPE_TO_FULL, type);
}
;

Parser.TRAP_HAZARD_TYPE_TO_FULL = {
    MECH: "Mechanical Trap",
    MAG: "Magical Trap",
    SMPL: "Simple Trap",
    CMPX: "Complex Trap",
    HAZ: "Hazard",
    WTH: "Weather",
    ENV: "Environmental Hazard",
    WLD: "Wilderness Hazard",
    GEN: "Generic",
    EST: "Eldritch Storm",
};

Parser.tierToFullLevel = function(tier) {
    return Parser._parse_aToB(Parser.TIER_TO_FULL_LEVEL, tier);
}
;

Parser.TIER_TO_FULL_LEVEL = {};
Parser.TIER_TO_FULL_LEVEL[1] = "1st\u20134th Level";
Parser.TIER_TO_FULL_LEVEL[2] = "5th\u201310th Level";
Parser.TIER_TO_FULL_LEVEL[3] = "11th\u201316th Level";
Parser.TIER_TO_FULL_LEVEL[4] = "17th\u201320th Level";

Parser.trapInitToFull = function(init) {
    return Parser._parse_aToB(Parser.TRAP_INIT_TO_FULL, init);
}
;

Parser.TRAP_INIT_TO_FULL = {};
Parser.TRAP_INIT_TO_FULL[1] = "initiative count 10";
Parser.TRAP_INIT_TO_FULL[2] = "initiative count 20";
Parser.TRAP_INIT_TO_FULL[3] = "initiative count 20 and initiative count 10";

Parser.ATK_TYPE_TO_FULL = {};
Parser.ATK_TYPE_TO_FULL["MW"] = "Melee Weapon Attack";
Parser.ATK_TYPE_TO_FULL["RW"] = "Ranged Weapon Attack";

Parser.bookOrdinalToAbv = (ordinal,preNoSuff)=>{
    if (ordinal === undefined)
        return "";
    switch (ordinal.type) {
    case "part":
        return `${preNoSuff ? " " : ""}Part ${ordinal.identifier}${preNoSuff ? "" : " \u2014 "}`;
    case "chapter":
        return `${preNoSuff ? " " : ""}Ch. ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
    case "episode":
        return `${preNoSuff ? " " : ""}Ep. ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
    case "appendix":
        return `${preNoSuff ? " " : ""}App.${ordinal.identifier != null ? ` ${ordinal.identifier}` : ""}${preNoSuff ? "" : ": "}`;
    case "level":
        return `${preNoSuff ? " " : ""}Level ${ordinal.identifier}${preNoSuff ? "" : ": "}`;
    default:
        throw new Error(`Unhandled ordinal type "${ordinal.type}"`);
    }
}
;

Parser.IMAGE_TYPE_TO_FULL = {
    "map": "Map",
    "mapPlayer": "Map (Player)",
};
Parser.imageTypeToFull = function(imageType) {
    return Parser._parse_aToB(Parser.IMAGE_TYPE_TO_FULL, imageType, "Other");
}
;

Parser.nameToTokenName = function(name) {
    return name.toAscii().replace(/"/g, "");
}
;

Parser.bytesToHumanReadable = function(bytes, {fixedDigits=2}={}) {
    if (bytes == null)
        return "";
    if (!bytes)
        return "0 B";
    const e = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, e)).toFixed(fixedDigits)} ${`\u200bKMGTP`.charAt(e)}B`;
}
;

Parser.SKL_ABV_ABJ = "A";
Parser.SKL_ABV_EVO = "V";
Parser.SKL_ABV_ENC = "E";
Parser.SKL_ABV_ILL = "I";
Parser.SKL_ABV_DIV = "D";
Parser.SKL_ABV_NEC = "N";
Parser.SKL_ABV_TRA = "T";
Parser.SKL_ABV_CON = "C";
Parser.SKL_ABV_PSI = "P";
Parser.SKL_ABVS = [Parser.SKL_ABV_ABJ, Parser.SKL_ABV_CON, Parser.SKL_ABV_DIV, Parser.SKL_ABV_ENC, Parser.SKL_ABV_EVO, Parser.SKL_ABV_ILL, Parser.SKL_ABV_NEC, Parser.SKL_ABV_PSI, Parser.SKL_ABV_TRA, ];

Parser.SP_TM_ACTION = "action";
Parser.SP_TM_B_ACTION = "bonus";
Parser.SP_TM_REACTION = "reaction";
Parser.SP_TM_ROUND = "round";
Parser.SP_TM_MINS = "minute";
Parser.SP_TM_HRS = "hour";
Parser.SP_TIME_SINGLETONS = [Parser.SP_TM_ACTION, Parser.SP_TM_B_ACTION, Parser.SP_TM_REACTION, Parser.SP_TM_ROUND];
Parser.SP_TIME_TO_FULL = {
    [Parser.SP_TM_ACTION]: "Action",
    [Parser.SP_TM_B_ACTION]: "Bonus Action",
    [Parser.SP_TM_REACTION]: "Reaction",
    [Parser.SP_TM_ROUND]: "Rounds",
    [Parser.SP_TM_MINS]: "Minutes",
    [Parser.SP_TM_HRS]: "Hours",
};
Parser.spTimeUnitToFull = function(timeUnit) {
    return Parser._parse_aToB(Parser.SP_TIME_TO_FULL, timeUnit);
}
;

Parser.SP_TIME_TO_SHORT = {
    [Parser.SP_TM_ROUND]: "Rnd.",
    [Parser.SP_TM_MINS]: "Min.",
    [Parser.SP_TM_HRS]: "Hr.",
};
Parser.spTimeUnitToShort = function(timeUnit) {
    return Parser._parse_aToB(Parser.SP_TIME_TO_SHORT, timeUnit);
}
;

Parser.SP_TIME_TO_ABV = {
    [Parser.SP_TM_ACTION]: "A",
    [Parser.SP_TM_B_ACTION]: "BA",
    [Parser.SP_TM_REACTION]: "R",
    [Parser.SP_TM_ROUND]: "rnd",
    [Parser.SP_TM_MINS]: "min",
    [Parser.SP_TM_HRS]: "hr",
};
Parser.spTimeUnitToAbv = function(timeUnit) {
    return Parser._parse_aToB(Parser.SP_TIME_TO_ABV, timeUnit);
}
;

Parser.spTimeToShort = function(time, isHtml) {
    if (!time)
        return "";
    return (time.number === 1 && Parser.SP_TIME_SINGLETONS.includes(time.unit)) ? `${Parser.spTimeUnitToAbv(time.unit).uppercaseFirst()}${time.condition ? "*" : ""}` : `${time.number} ${isHtml ? `<span class="ve-small">` : ""}${Parser.spTimeUnitToAbv(time.unit)}${isHtml ? `</span>` : ""}${time.condition ? "*" : ""}`;
}
;

Parser.SKL_ABJ = "Abjuration";
Parser.SKL_EVO = "Evocation";
Parser.SKL_ENC = "Enchantment";
Parser.SKL_ILL = "Illusion";
Parser.SKL_DIV = "Divination";
Parser.SKL_NEC = "Necromancy";
Parser.SKL_TRA = "Transmutation";
Parser.SKL_CON = "Conjuration";
Parser.SKL_PSI = "Psionic";

Parser.SP_SCHOOL_ABV_TO_FULL = {};
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ABJ] = Parser.SKL_ABJ;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_EVO] = Parser.SKL_EVO;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ENC] = Parser.SKL_ENC;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ILL] = Parser.SKL_ILL;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_DIV] = Parser.SKL_DIV;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_NEC] = Parser.SKL_NEC;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_TRA] = Parser.SKL_TRA;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_CON] = Parser.SKL_CON;
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_PSI] = Parser.SKL_PSI;

Parser.SP_SCHOOL_ABV_TO_SHORT = {};
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ABJ] = "Abj.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_EVO] = "Evoc.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ENC] = "Ench.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_ILL] = "Illu.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_DIV] = "Divin.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_NEC] = "Necro.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_TRA] = "Trans.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_CON] = "Conj.";
Parser.SP_SCHOOL_ABV_TO_SHORT[Parser.SKL_ABV_PSI] = "Psi.";

Parser.ATB_ABV_TO_FULL = {
    "str": "Strength",
    "dex": "Dexterity",
    "con": "Constitution",
    "int": "Intelligence",
    "wis": "Wisdom",
    "cha": "Charisma",
};

Parser.TP_ABERRATION = "aberration";
Parser.TP_BEAST = "beast";
Parser.TP_CELESTIAL = "celestial";
Parser.TP_CONSTRUCT = "construct";
Parser.TP_DRAGON = "dragon";
Parser.TP_ELEMENTAL = "elemental";
Parser.TP_FEY = "fey";
Parser.TP_FIEND = "fiend";
Parser.TP_GIANT = "giant";
Parser.TP_HUMANOID = "humanoid";
Parser.TP_MONSTROSITY = "monstrosity";
Parser.TP_OOZE = "ooze";
Parser.TP_PLANT = "plant";
Parser.TP_UNDEAD = "undead";
Parser.MON_TYPES = [Parser.TP_ABERRATION, Parser.TP_BEAST, Parser.TP_CELESTIAL, Parser.TP_CONSTRUCT, Parser.TP_DRAGON, Parser.TP_ELEMENTAL, Parser.TP_FEY, Parser.TP_FIEND, Parser.TP_GIANT, Parser.TP_HUMANOID, Parser.TP_MONSTROSITY, Parser.TP_OOZE, Parser.TP_PLANT, Parser.TP_UNDEAD];
Parser.MON_TYPE_TO_PLURAL = {};
Parser.MON_TYPE_TO_PLURAL[Parser.TP_ABERRATION] = "aberrations";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_BEAST] = "beasts";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_CELESTIAL] = "celestials";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_CONSTRUCT] = "constructs";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_DRAGON] = "dragons";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_ELEMENTAL] = "elementals";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_FEY] = "fey";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_FIEND] = "fiends";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_GIANT] = "giants";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_HUMANOID] = "humanoids";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_MONSTROSITY] = "monstrosities";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_OOZE] = "oozes";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_PLANT] = "plants";
Parser.MON_TYPE_TO_PLURAL[Parser.TP_UNDEAD] = "undead";

Parser.SZ_FINE = "F";
Parser.SZ_DIMINUTIVE = "D";
Parser.SZ_TINY = "T";
Parser.SZ_SMALL = "S";
Parser.SZ_MEDIUM = "M";
Parser.SZ_LARGE = "L";
Parser.SZ_HUGE = "H";
Parser.SZ_GARGANTUAN = "G";
Parser.SZ_COLOSSAL = "C";
Parser.SZ_VARIES = "V";
Parser.SIZE_ABVS = [Parser.SZ_TINY, Parser.SZ_SMALL, Parser.SZ_MEDIUM, Parser.SZ_LARGE, Parser.SZ_HUGE, Parser.SZ_GARGANTUAN, Parser.SZ_VARIES];
Parser.SIZE_ABV_TO_FULL = {};
Parser.SIZE_ABV_TO_FULL[Parser.SZ_FINE] = "Fine";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_DIMINUTIVE] = "Diminutive";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_TINY] = "Tiny";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_SMALL] = "Small";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_MEDIUM] = "Medium";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_LARGE] = "Large";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_HUGE] = "Huge";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_GARGANTUAN] = "Gargantuan";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_COLOSSAL] = "Colossal";
Parser.SIZE_ABV_TO_FULL[Parser.SZ_VARIES] = "Varies";

Parser.XP_CHART_ALT = {
    "0": 10,
    "1/8": 25,
    "1/4": 50,
    "1/2": 100,
    "1": 200,
    "2": 450,
    "3": 700,
    "4": 1100,
    "5": 1800,
    "6": 2300,
    "7": 2900,
    "8": 3900,
    "9": 5000,
    "10": 5900,
    "11": 7200,
    "12": 8400,
    "13": 10000,
    "14": 11500,
    "15": 13000,
    "16": 15000,
    "17": 18000,
    "18": 20000,
    "19": 22000,
    "20": 25000,
    "21": 33000,
    "22": 41000,
    "23": 50000,
    "24": 62000,
    "25": 75000,
    "26": 90000,
    "27": 105000,
    "28": 120000,
    "29": 135000,
    "30": 155000,
};

Parser.ARMOR_ABV_TO_FULL = {
    "l.": "light",
    "m.": "medium",
    "h.": "heavy",
};

Parser.WEAPON_ABV_TO_FULL = {
    "s.": "simple",
    "m.": "martial",
};

Parser.CONDITION_TO_COLOR = {
    "Blinded": "#525252",
    "Charmed": "#f01789",
    "Deafened": "#ababab",
    "Exhausted": "#947a47",
    "Frightened": "#c9ca18",
    "Grappled": "#8784a0",
    "Incapacitated": "#3165a0",
    "Invisible": "#7ad2d6",
    "Paralyzed": "#c00900",
    "Petrified": "#a0a0a0",
    "Poisoned": "#4dc200",
    "Prone": "#5e60a0",
    "Restrained": "#d98000",
    "Stunned": "#a23bcb",
    "Unconscious": "#3a40ad",

    "Concentration": "#009f7a",
};

Parser.RULE_TYPE_TO_FULL = {
    "O": "Optional",
    "P": "Prerelease",
    "V": "Variant",
    "VO": "Variant Optional",
    "VV": "Variant Variant",
    "U": "Unknown",
};

Parser.ruleTypeToFull = function(ruleType) {
    return Parser._parse_aToB(Parser.RULE_TYPE_TO_FULL, ruleType);
}
;

Parser.VEHICLE_TYPE_TO_FULL = {
    "SHIP": "Ship",
    "SPELLJAMMER": "Spelljammer Ship",
    "INFWAR": "Infernal War Machine",
    "CREATURE": "Creature",
    "OBJECT": "Object",
    "SHP:H": "Ship Upgrade, Hull",
    "SHP:M": "Ship Upgrade, Movement",
    "SHP:W": "Ship Upgrade, Weapon",
    "SHP:F": "Ship Upgrade, Figurehead",
    "SHP:O": "Ship Upgrade, Miscellaneous",
    "IWM:W": "Infernal War Machine Variant, Weapon",
    "IWM:A": "Infernal War Machine Upgrade, Armor",
    "IWM:G": "Infernal War Machine Upgrade, Gadget",
};

Parser.vehicleTypeToFull = function(vehicleType) {
    return Parser._parse_aToB(Parser.VEHICLE_TYPE_TO_FULL, vehicleType);
}
;

Parser.SRC_5ETOOLS_TMP = "Parser.SRC_5ETOOLS_TMP";
Parser.SRC_CoS = "CoS";
Parser.SRC_DMG = "DMG";
Parser.SRC_EEPC = "EEPC";
Parser.SRC_EET = "EET";
Parser.SRC_HotDQ = "HotDQ";
Parser.SRC_LMoP = "LMoP";
Parser.SRC_MM = "MM";
Parser.SRC_OotA = "OotA";
Parser.SRC_PHB = "PHB";
Parser.SRC_PotA = "PotA";
Parser.SRC_RoT = "RoT";
Parser.SRC_RoTOS = "RoTOS";
Parser.SRC_SCAG = "SCAG";
Parser.SRC_SKT = "SKT";
Parser.SRC_ToA = "ToA";
Parser.SRC_TLK = "TLK";
Parser.SRC_ToD = "ToD";
Parser.SRC_TTP = "TTP";
Parser.SRC_TYP = "TftYP";
Parser.SRC_TYP_AtG = "TftYP-AtG";
Parser.SRC_TYP_DiT = "TftYP-DiT";
Parser.SRC_TYP_TFoF = "TftYP-TFoF";
Parser.SRC_TYP_THSoT = "TftYP-THSoT";
Parser.SRC_TYP_TSC = "TftYP-TSC";
Parser.SRC_TYP_ToH = "TftYP-ToH";
Parser.SRC_TYP_WPM = "TftYP-WPM";
Parser.SRC_VGM = "VGM";
Parser.SRC_XGE = "XGE";
Parser.SRC_OGA = "OGA";
Parser.SRC_MTF = "MTF";
Parser.SRC_WDH = "WDH";
Parser.SRC_WDMM = "WDMM";
Parser.SRC_GGR = "GGR";
Parser.SRC_KKW = "KKW";
Parser.SRC_LLK = "LLK";
Parser.SRC_AZfyT = "AZfyT";
Parser.SRC_GoS = "GoS";
Parser.SRC_AI = "AI";
Parser.SRC_OoW = "OoW";
Parser.SRC_ESK = "ESK";
Parser.SRC_DIP = "DIP";
Parser.SRC_HftT = "HftT";
Parser.SRC_DC = "DC";
Parser.SRC_SLW = "SLW";
Parser.SRC_SDW = "SDW";
Parser.SRC_BGDIA = "BGDIA";
Parser.SRC_LR = "LR";
Parser.SRC_AL = "AL";
Parser.SRC_SAC = "SAC";
Parser.SRC_ERLW = "ERLW";
Parser.SRC_EFR = "EFR";
Parser.SRC_RMBRE = "RMBRE";
Parser.SRC_RMR = "RMR";
Parser.SRC_MFF = "MFF";
Parser.SRC_AWM = "AWM";
Parser.SRC_IMR = "IMR";
Parser.SRC_SADS = "SADS";
Parser.SRC_EGW = "EGW";
Parser.SRC_EGW_ToR = "ToR";
Parser.SRC_EGW_DD = "DD";
Parser.SRC_EGW_FS = "FS";
Parser.SRC_EGW_US = "US";
Parser.SRC_MOT = "MOT";
Parser.SRC_IDRotF = "IDRotF";
Parser.SRC_TCE = "TCE";
Parser.SRC_VRGR = "VRGR";
Parser.SRC_HoL = "HoL";
Parser.SRC_XMtS = "XMtS";
Parser.SRC_RtG = "RtG";
Parser.SRC_AitFR = "AitFR";
Parser.SRC_AitFR_ISF = "AitFR-ISF";
Parser.SRC_AitFR_THP = "AitFR-THP";
Parser.SRC_AitFR_AVT = "AitFR-AVT";
Parser.SRC_AitFR_DN = "AitFR-DN";
Parser.SRC_AitFR_FCD = "AitFR-FCD";
Parser.SRC_WBtW = "WBtW";
Parser.SRC_DoD = "DoD";
Parser.SRC_MaBJoV = "MaBJoV";
Parser.SRC_FTD = "FTD";
Parser.SRC_SCC = "SCC";
Parser.SRC_SCC_CK = "SCC-CK";
Parser.SRC_SCC_HfMT = "SCC-HfMT";
Parser.SRC_SCC_TMM = "SCC-TMM";
Parser.SRC_SCC_ARiR = "SCC-ARiR";
Parser.SRC_MPMM = "MPMM";
Parser.SRC_CRCotN = "CRCotN";
Parser.SRC_JttRC = "JttRC";
Parser.SRC_SAiS = "SAiS";
Parser.SRC_AAG = "AAG";
Parser.SRC_BAM = "BAM";
Parser.SRC_LoX = "LoX";
Parser.SRC_DoSI = "DoSI";
Parser.SRC_DSotDQ = "DSotDQ";
Parser.SRC_KftGV = "KftGV";
Parser.SRC_BGG = "BGG";
Parser.SRC_TDCSR = "TDCSR";
Parser.SRC_PaBTSO = "PaBTSO";
Parser.SRC_PAitM = "PAitM";
Parser.SRC_SatO = "SatO";
Parser.SRC_ToFW = "ToFW";
Parser.SRC_MPP = "MPP";
Parser.SRC_BMT = "BMT";
Parser.SRC_GHLoE = "GHLoE";
Parser.SRC_DoDk = "DoDk";
Parser.SRC_SCREEN = "Screen";
Parser.SRC_SCREEN_WILDERNESS_KIT = "ScreenWildernessKit";
Parser.SRC_SCREEN_DUNGEON_KIT = "ScreenDungeonKit";
Parser.SRC_SCREEN_SPELLJAMMER = "ScreenSpelljammer";
Parser.SRC_HF = "HF";
Parser.SRC_HFFotM = "HFFotM";
Parser.SRC_HFStCM = "HFStCM";
Parser.SRC_CM = "CM";
Parser.SRC_NRH = "NRH";
Parser.SRC_NRH_TCMC = "NRH-TCMC";
Parser.SRC_NRH_AVitW = "NRH-AVitW";
Parser.SRC_NRH_ASS = "NRH-ASS";
Parser.SRC_NRH_CoI = "NRH-CoI";
Parser.SRC_NRH_TLT = "NRH-TLT";
Parser.SRC_NRH_AWoL = "NRH-AWoL";
Parser.SRC_NRH_AT = "NRH-AT";
Parser.SRC_MGELFT = "MGELFT";
Parser.SRC_VD = "VD";
Parser.SRC_SjA = "SjA";
Parser.SRC_HAT_TG = "HAT-TG";
Parser.SRC_HAT_LMI = "HAT-LMI";
Parser.SRC_GotSF = "GotSF";
Parser.SRC_LK = "LK";
Parser.SRC_CoA = "CoA";
Parser.SRC_PiP = "PiP";

Parser.SRC_AL_PREFIX = "AL";

Parser.SRC_ALCoS = `${Parser.SRC_AL_PREFIX}CurseOfStrahd`;
Parser.SRC_ALEE = `${Parser.SRC_AL_PREFIX}ElementalEvil`;
Parser.SRC_ALRoD = `${Parser.SRC_AL_PREFIX}RageOfDemons`;

Parser.SRC_PS_PREFIX = "PS";

Parser.SRC_PSA = `${Parser.SRC_PS_PREFIX}A`;
Parser.SRC_PSI = `${Parser.SRC_PS_PREFIX}I`;
Parser.SRC_PSK = `${Parser.SRC_PS_PREFIX}K`;
Parser.SRC_PSZ = `${Parser.SRC_PS_PREFIX}Z`;
Parser.SRC_PSX = `${Parser.SRC_PS_PREFIX}X`;
Parser.SRC_PSD = `${Parser.SRC_PS_PREFIX}D`;

Parser.SRC_UA_PREFIX = "UA";
Parser.SRC_UA_ONE_PREFIX = "XUA";
Parser.SRC_MCVX_PREFIX = "MCV";
Parser.SRC_MisMVX_PREFIX = "MisMV";
Parser.SRC_AA_PREFIX = "AA";

Parser.SRC_UATMC = `${Parser.SRC_UA_PREFIX}TheMysticClass`;
Parser.SRC_MCV1SC = `${Parser.SRC_MCVX_PREFIX}1SC`;
Parser.SRC_MCV2DC = `${Parser.SRC_MCVX_PREFIX}2DC`;
Parser.SRC_MCV3MC = `${Parser.SRC_MCVX_PREFIX}3MC`;
Parser.SRC_MCV4EC = `${Parser.SRC_MCVX_PREFIX}4EC`;
Parser.SRC_MisMV1 = `${Parser.SRC_MisMVX_PREFIX}1`;
Parser.SRC_AATM = `${Parser.SRC_AA_PREFIX}TM`;

Parser.AL_PREFIX = "Adventurers League: ";
Parser.AL_PREFIX_SHORT = "AL: ";
Parser.PS_PREFIX = "Plane Shift: ";
Parser.PS_PREFIX_SHORT = "PS: ";
Parser.UA_PREFIX = "Unearthed Arcana: ";
Parser.UA_PREFIX_SHORT = "UA: ";
Parser.TftYP_NAME = "Tales from the Yawning Portal";
Parser.AitFR_NAME = "Adventures in the Forgotten Realms";
Parser.NRH_NAME = "NERDS Restoring Harmony";
Parser.MCVX_PREFIX = "Monstrous Compendium Volume ";
Parser.MisMVX_PREFIX = "Misplaced Monsters: Volume ";
Parser.AA_PREFIX = "Adventure Atlas: ";

Parser.SOURCE_JSON_TO_FULL = {};
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CoS] = "Curse of Strahd";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DMG] = "Dungeon Master's Guide";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EEPC] = "Elemental Evil Player's Companion";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EET] = "Elemental Evil: Trinkets";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HotDQ] = "Hoard of the Dragon Queen";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LMoP] = "Lost Mine of Phandelver";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MM] = "Monster Manual";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OotA] = "Out of the Abyss";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PHB] = "Player's Handbook";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PotA] = "Princes of the Apocalypse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RoT] = "The Rise of Tiamat";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RoTOS] = "The Rise of Tiamat Online Supplement";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCAG] = "Sword Coast Adventurer's Guide";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SKT] = "Storm King's Thunder";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToA] = "Tomb of Annihilation";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TLK] = "The Lost Kenku";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToD] = "Tyranny of Dragons";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TTP] = "The Tortle Package";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP] = Parser.TftYP_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_AtG] = `${Parser.TftYP_NAME}: Against the Giants`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_DiT] = `${Parser.TftYP_NAME}: Dead in Thay`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_TFoF] = `${Parser.TftYP_NAME}: The Forge of Fury`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_THSoT] = `${Parser.TftYP_NAME}: The Hidden Shrine of Tamoachan`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_TSC] = `${Parser.TftYP_NAME}: The Sunless Citadel`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_ToH] = `${Parser.TftYP_NAME}: Tomb of Horrors`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TYP_WPM] = `${Parser.TftYP_NAME}: White Plume Mountain`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VGM] = "Volo's Guide to Monsters";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XGE] = "Xanathar's Guide to Everything";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OGA] = "One Grung Above";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MTF] = "Mordenkainen's Tome of Foes";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WDH] = "Waterdeep: Dragon Heist";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WDMM] = "Waterdeep: Dungeon of the Mad Mage";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GGR] = "Guildmasters' Guide to Ravnica";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_KKW] = "Krenko's Way";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LLK] = "Lost Laboratory of Kwalish";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AZfyT] = "A Zib for your Thoughts";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GoS] = "Ghosts of Saltmarsh";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AI] = "Acquisitions Incorporated";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_OoW] = "The Orrery of the Wanderer";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ESK] = "Essentials Kit";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DIP] = "Dragon of Icespire Peak";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HftT] = "Hunt for the Thessalhydra";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DC] = "Divine Contention";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SLW] = "Storm Lord's Wrath";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SDW] = "Sleeping Dragon's Wake";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BGDIA] = "Baldur's Gate: Descent Into Avernus";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LR] = "Locathah Rising";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AL] = "Adventurers' League";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SAC] = "Sage Advice Compendium";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ERLW] = "Eberron: Rising from the Last War";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EFR] = "Eberron: Forgotten Relics";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RMBRE] = "The Lost Dungeon of Rickedness: Big Rick Energy";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RMR] = "Dungeons & Dragons vs. Rick and Morty: Basic Rules";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MFF] = "Mordenkainen's Fiendish Folio";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AWM] = "Adventure with Muk";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_IMR] = "Infernal Machine Rebuild";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SADS] = "Sapphire Anniversary Dice Set";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW] = "Explorer's Guide to Wildemount";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_ToR] = "Tide of Retribution";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_DD] = "Dangerous Designs";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_FS] = "Frozen Sick";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_EGW_US] = "Unwelcome Spirits";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MOT] = "Mythic Odysseys of Theros";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_IDRotF] = "Icewind Dale: Rime of the Frostmaiden";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TCE] = "Tasha's Cauldron of Everything";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VRGR] = "Van Richten's Guide to Ravenloft";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HoL] = "The House of Lament";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_RtG] = "Return to Glory";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR] = Parser.AitFR_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_ISF] = `${Parser.AitFR_NAME}: In Scarlet Flames`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_THP] = `${Parser.AitFR_NAME}: The Hidden Page`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_AVT] = `${Parser.AitFR_NAME}: A Verdant Tomb`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_DN] = `${Parser.AitFR_NAME}: Deepest Night`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AitFR_FCD] = `${Parser.AitFR_NAME}: From Cyan Depths`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_WBtW] = "The Wild Beyond the Witchlight";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoD] = "Domains of Delight";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MaBJoV] = "Minsc and Boo's Journal of Villainy";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_FTD] = "Fizban's Treasury of Dragons";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC] = "Strixhaven: A Curriculum of Chaos";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_CK] = "Campus Kerfuffle";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_HfMT] = "Hunt for Mage Tower";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_TMM] = "The Magister's Masquerade";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCC_ARiR] = "A Reckoning in Ruins";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MPMM] = "Mordenkainen Presents: Monsters of the Multiverse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CRCotN] = "Critical Role: Call of the Netherdeep";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_JttRC] = "Journeys through the Radiant Citadel";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SAiS] = "Spelljammer: Adventures in Space";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AAG] = "Astral Adventurer's Guide";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BAM] = "Boo's Astral Menagerie";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LoX] = "Light of Xaryxis";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoSI] = "Dragons of Stormwreck Isle";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DSotDQ] = "Dragonlance: Shadow of the Dragon Queen";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_KftGV] = "Keys from the Golden Vault";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BGG] = "Bigby Presents: Glory of the Giants";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_TDCSR] = "Tal'Dorei Campaign Setting Reborn";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PaBTSO] = "Phandelver and Below: The Shattered Obelisk";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PAitM] = "Planescape: Adventures in the Multiverse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SatO] = "Sigil and the Outlands";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ToFW] = "Turn of Fortune's Wheel";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MPP] = "Morte's Planar Parade";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_BMT] = "The Book of Many Things";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GHLoE] = "Grim Hollow: Lairs of Etharis";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_DoDk] = "Dungeons of Drakkenheim";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN] = "Dungeon Master's Screen";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_WILDERNESS_KIT] = "Dungeon Master's Screen: Wilderness Kit";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_DUNGEON_KIT] = "Dungeon Master's Screen: Dungeon Kit";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SCREEN_SPELLJAMMER] = "Dungeon Master's Screen: Spelljammer";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HF] = "Heroes' Feast";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HFFotM] = "Heroes' Feast: Flavors of the Multiverse";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HFStCM] = "Heroes' Feast: Saving the Childrens Menu";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CM] = "Candlekeep Mysteries";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH] = Parser.NRH_NAME;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_TCMC] = `${Parser.NRH_NAME}: The Candy Mountain Caper`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AVitW] = `${Parser.NRH_NAME}: A Voice in the Wilderness`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_ASS] = `${Parser.NRH_NAME}: A Sticky Situation`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_CoI] = `${Parser.NRH_NAME}: Circus of Illusions`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_TLT] = `${Parser.NRH_NAME}: The Lost Tomb`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AWoL] = `${Parser.NRH_NAME}: A Web of Lies`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_NRH_AT] = `${Parser.NRH_NAME}: Adventure Together`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MGELFT] = "Muk's Guide To Everything He Learned From Tasha";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_VD] = "Vecna Dossier";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_SjA] = "Spelljammer Academy";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HAT_TG] = "Honor Among Thieves: Thieves' Gallery";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_HAT_LMI] = "Honor Among Thieves: Legendary Magic Items";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_GotSF] = "Giants of the Star Forge";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_LK] = "Lightning Keep";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_CoA] = "Chains of Asmodeus";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PiP] = "Peril in Pinebrook";
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALCoS] = `${Parser.AL_PREFIX}Curse of Strahd`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALEE] = `${Parser.AL_PREFIX}Elemental Evil`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_ALRoD] = `${Parser.AL_PREFIX}Rage of Demons`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSA] = `${Parser.PS_PREFIX}Amonkhet`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSI] = `${Parser.PS_PREFIX}Innistrad`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSK] = `${Parser.PS_PREFIX}Kaladesh`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSZ] = `${Parser.PS_PREFIX}Zendikar`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSX] = `${Parser.PS_PREFIX}Ixalan`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_PSD] = `${Parser.PS_PREFIX}Dominaria`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_XMtS] = `X Marks the Spot`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_UATMC] = `${Parser.UA_PREFIX}The Mystic Class`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV1SC] = `${Parser.MCVX_PREFIX}1: Spelljammer Creatures`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV2DC] = `${Parser.MCVX_PREFIX}2: Dragonlance Creatures`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV3MC] = `${Parser.MCVX_PREFIX}3: Minecraft Creatures`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MCV4EC] = `${Parser.MCVX_PREFIX}4: Eldraine Creatures`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_MisMV1] = `${Parser.MisMVX_PREFIX}1`;
Parser.SOURCE_JSON_TO_FULL[Parser.SRC_AATM] = `${Parser.AA_PREFIX}The Mortuary`;

Parser.SOURCE_JSON_TO_ABV = {};
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CoS] = "CoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DMG] = "DMG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EEPC] = "EEPC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EET] = "EET";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HotDQ] = "HotDQ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LMoP] = "LMoP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MM] = "MM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OotA] = "OotA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PHB] = "PHB";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PotA] = "PotA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RoT] = "RoT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RoTOS] = "RoTOS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCAG] = "SCAG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SKT] = "SKT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToA] = "ToA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TLK] = "TLK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToD] = "ToD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TTP] = "TTP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_AtG] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_DiT] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_TFoF] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_THSoT] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_TSC] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_ToH] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TYP_WPM] = "TftYP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VGM] = "VGM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XGE] = "XGE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OGA] = "OGA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MTF] = "MTF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WDH] = "WDH";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WDMM] = "WDMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GGR] = "GGR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_KKW] = "KKW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LLK] = "LLK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AZfyT] = "AZfyT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GoS] = "GoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AI] = "AI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_OoW] = "OoW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ESK] = "ESK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DIP] = "DIP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HftT] = "HftT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DC] = "DC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SLW] = "SLW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SDW] = "SDW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BGDIA] = "BGDIA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LR] = "LR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AL] = "AL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SAC] = "SAC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ERLW] = "ERLW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EFR] = "EFR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RMBRE] = "RMBRE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RMR] = "RMR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MFF] = "MFF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AWM] = "AWM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_IMR] = "IMR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SADS] = "SADS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW] = "EGW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_ToR] = "ToR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_DD] = "DD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_FS] = "FS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_EGW_US] = "US";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MOT] = "MOT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_IDRotF] = "IDRotF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TCE] = "TCE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VRGR] = "VRGR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HoL] = "HoL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_RtG] = "RtG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR] = "AitFR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_ISF] = "AitFR-ISF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_THP] = "AitFR-THP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_AVT] = "AitFR-AVT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_DN] = "AitFR-DN";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AitFR_FCD] = "AitFR-FCD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_WBtW] = "WBtW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoD] = "DoD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MaBJoV] = "MaBJoV";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_FTD] = "FTD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC] = "SCC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_CK] = "SCC-CK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_HfMT] = "SCC-HfMT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_TMM] = "SCC-TMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCC_ARiR] = "SCC-ARiR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MPMM] = "MPMM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CRCotN] = "CRCotN";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_JttRC] = "JttRC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SAiS] = "SAiS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AAG] = "AAG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BAM] = "BAM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LoX] = "LoX";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoSI] = "DoSI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DSotDQ] = "DSotDQ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_KftGV] = "KftGV";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BGG] = "BGG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_TDCSR] = "TDCSR";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PaBTSO] = "PaBTSO";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PAitM] = "PAitM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SatO] = "SatO";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ToFW] = "ToFW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MPP] = "MPP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_BMT] = "BMT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GHLoE] = "GHLoE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_DoDk] = "DoDk";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN] = "Screen";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_WILDERNESS_KIT] = "ScWild";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_DUNGEON_KIT] = "ScDun";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SCREEN_SPELLJAMMER] = "ScSJ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HF] = "HF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HFFotM] = "HFFotM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HFStCM] = "HFStCM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CM] = "CM";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH] = "NRH";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_TCMC] = "NRH-TCMC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AVitW] = "NRH-AVitW";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_ASS] = "NRH-ASS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_CoI] = "NRH-CoI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_TLT] = "NRH-TLT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AWoL] = "NRH-AWoL";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_NRH_AT] = "NRH-AT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MGELFT] = "MGELFT";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_VD] = "VD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_SjA] = "SjA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HAT_TG] = "HAT-TG";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_HAT_LMI] = "HAT-LMI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_GotSF] = "GotSF";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_LK] = "LK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_CoA] = "CoA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PiP] = "PiP";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALCoS] = "ALCoS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALEE] = "ALEE";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_ALRoD] = "ALRoD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSA] = "PSA";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSI] = "PSI";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSK] = "PSK";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSZ] = "PSZ";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSX] = "PSX";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_PSD] = "PSD";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_XMtS] = "XMtS";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_UATMC] = "UAMy";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV1SC] = "MCV1SC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV2DC] = "MCV2DC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV3MC] = "MCV3MC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MCV4EC] = "MCV4EC";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_MisMV1] = "MisMV1";
Parser.SOURCE_JSON_TO_ABV[Parser.SRC_AATM] = "AATM";

Parser.SOURCE_JSON_TO_DATE = {};
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CoS] = "2016-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DMG] = "2014-12-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EEPC] = "2015-03-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EET] = "2015-03-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HotDQ] = "2014-08-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LMoP] = "2014-07-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MM] = "2014-09-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OotA] = "2015-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PHB] = "2014-08-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PotA] = "2015-04-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RoT] = "2014-11-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RoTOS] = "2014-11-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCAG] = "2015-11-03";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SKT] = "2016-09-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToA] = "2017-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TLK] = "2017-11-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToD] = "2019-10-22";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TTP] = "2017-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_AtG] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_DiT] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_TFoF] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_THSoT] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_TSC] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_ToH] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TYP_WPM] = "2017-04-04";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VGM] = "2016-11-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XGE] = "2017-11-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OGA] = "2017-10-11";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MTF] = "2018-05-29";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WDH] = "2018-09-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WDMM] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GGR] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_KKW] = "2018-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LLK] = "2018-11-10";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AZfyT] = "2019-03-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GoS] = "2019-05-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AI] = "2019-06-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_OoW] = "2019-06-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ESK] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DIP] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HftT] = "2019-05-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DC] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SLW] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SDW] = "2019-06-24";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BGDIA] = "2019-09-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LR] = "2019-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SAC] = "2019-01-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ERLW] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EFR] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RMBRE] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RMR] = "2019-11-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MFF] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AWM] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_IMR] = "2019-11-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SADS] = "2019-12-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_ToR] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_DD] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_FS] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_EGW_US] = "2020-03-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MOT] = "2020-06-02";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_IDRotF] = "2020-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TCE] = "2020-11-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VRGR] = "2021-05-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HoL] = "2021-05-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_RtG] = "2021-05-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR] = "2021-06-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_ISF] = "2021-06-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_THP] = "2021-07-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_AVT] = "2021-07-14";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_DN] = "2021-07-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AitFR_FCD] = "2021-07-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_WBtW] = "2021-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoD] = "2021-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MaBJoV] = "2021-10-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_FTD] = "2021-11-26";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_CK] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_HfMT] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_TMM] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCC_ARiR] = "2021-12-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MPMM] = "2022-01-25";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CRCotN] = "2022-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_JttRC] = "2022-07-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SAiS] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AAG] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BAM] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LoX] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoSI] = "2022-07-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DSotDQ] = "2022-11-22";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_KftGV] = "2023-02-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BGG] = "2023-08-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_TDCSR] = "2022-01-18";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PaBTSO] = "2023-09-19";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PAitM] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SatO] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ToFW] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MPP] = "2023-10-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_BMT] = "2023-11-14";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GHLoE] = "2023-11-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_DoDk] = "2023-12-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN] = "2015-01-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_WILDERNESS_KIT] = "2020-11-17";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_DUNGEON_KIT] = "2020-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SCREEN_SPELLJAMMER] = "2022-08-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HF] = "2020-10-27";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HFFotM] = "2023-11-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HFStCM] = "2023-11-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CM] = "2021-03-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_TCMC] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AVitW] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_ASS] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_CoI] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_TLT] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AWoL] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_NRH_AT] = "2021-09-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MGELFT] = "2020-12-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_VD] = "2022-06-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_SjA] = "2022-07-11";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HAT_TG] = "2023-03-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_HAT_LMI] = "2023-03-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_GotSF] = "2023-08-01";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_LK] = "2023-09-26";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_CoA] = "2023-10-30";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PiP] = "2023-11-20";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALCoS] = "2016-03-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALEE] = "2015-04-07";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_ALRoD] = "2015-09-15";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSA] = "2017-07-06";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSI] = "2016-07-12";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSK] = "2017-02-16";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSZ] = "2016-04-27";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSX] = "2018-01-09";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_PSD] = "2018-07-31";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_XMtS] = "2017-12-11";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_UATMC] = "2017-03-13";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV1SC] = "2022-04-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV2DC] = "2022-12-05";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV3MC] = "2023-03-28";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MCV4EC] = "2023-09-21";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_MisMV1] = "2023-05-03";
Parser.SOURCE_JSON_TO_DATE[Parser.SRC_AATM] = "2023-10-17";

Parser.SOURCES_ADVENTURES = new Set([Parser.SRC_LMoP, Parser.SRC_HotDQ, Parser.SRC_RoT, Parser.SRC_RoTOS, Parser.SRC_PotA, Parser.SRC_OotA, Parser.SRC_CoS, Parser.SRC_SKT, Parser.SRC_TYP, Parser.SRC_TYP_AtG, Parser.SRC_TYP_DiT, Parser.SRC_TYP_TFoF, Parser.SRC_TYP_THSoT, Parser.SRC_TYP_TSC, Parser.SRC_TYP_ToH, Parser.SRC_TYP_WPM, Parser.SRC_ToA, Parser.SRC_TLK, Parser.SRC_TTP, Parser.SRC_WDH, Parser.SRC_LLK, Parser.SRC_WDMM, Parser.SRC_KKW, Parser.SRC_AZfyT, Parser.SRC_GoS, Parser.SRC_HftT, Parser.SRC_OoW, Parser.SRC_DIP, Parser.SRC_SLW, Parser.SRC_SDW, Parser.SRC_DC, Parser.SRC_BGDIA, Parser.SRC_LR, Parser.SRC_EFR, Parser.SRC_RMBRE, Parser.SRC_IMR, Parser.SRC_EGW_ToR, Parser.SRC_EGW_DD, Parser.SRC_EGW_FS, Parser.SRC_EGW_US, Parser.SRC_IDRotF, Parser.SRC_CM, Parser.SRC_HoL, Parser.SRC_XMtS, Parser.SRC_RtG, Parser.SRC_AitFR, Parser.SRC_AitFR_ISF, Parser.SRC_AitFR_THP, Parser.SRC_AitFR_AVT, Parser.SRC_AitFR_DN, Parser.SRC_AitFR_FCD, Parser.SRC_WBtW, Parser.SRC_NRH, Parser.SRC_NRH_TCMC, Parser.SRC_NRH_AVitW, Parser.SRC_NRH_ASS, Parser.SRC_NRH_CoI, Parser.SRC_NRH_TLT, Parser.SRC_NRH_AWoL, Parser.SRC_NRH_AT, Parser.SRC_SCC, Parser.SRC_SCC_CK, Parser.SRC_SCC_HfMT, Parser.SRC_SCC_TMM, Parser.SRC_SCC_ARiR, Parser.SRC_CRCotN, Parser.SRC_JttRC, Parser.SRC_SjA, Parser.SRC_LoX, Parser.SRC_DoSI, Parser.SRC_DSotDQ, Parser.SRC_KftGV, Parser.SRC_GotSF, Parser.SRC_PaBTSO, Parser.SRC_LK, Parser.SRC_CoA, Parser.SRC_PiP, Parser.SRC_HFStCM, Parser.SRC_GHLoE, Parser.SRC_DoDk,
Parser.SRC_AWM, ]);
Parser.SOURCES_CORE_SUPPLEMENTS = new Set(Object.keys(Parser.SOURCE_JSON_TO_FULL).filter(it=>!Parser.SOURCES_ADVENTURES.has(it)));
Parser.SOURCES_NON_STANDARD_WOTC = new Set([Parser.SRC_OGA, Parser.SRC_LLK, Parser.SRC_AZfyT, Parser.SRC_LR, Parser.SRC_TLK, Parser.SRC_TTP, Parser.SRC_AWM, Parser.SRC_IMR, Parser.SRC_SADS, Parser.SRC_MFF, Parser.SRC_XMtS, Parser.SRC_RtG, Parser.SRC_AitFR, Parser.SRC_AitFR_ISF, Parser.SRC_AitFR_THP, Parser.SRC_AitFR_AVT, Parser.SRC_AitFR_DN, Parser.SRC_AitFR_FCD, Parser.SRC_DoD, Parser.SRC_MaBJoV, Parser.SRC_NRH, Parser.SRC_NRH_TCMC, Parser.SRC_NRH_AVitW, Parser.SRC_NRH_ASS, Parser.SRC_NRH_CoI, Parser.SRC_NRH_TLT, Parser.SRC_NRH_AWoL, Parser.SRC_NRH_AT, Parser.SRC_MGELFT, Parser.SRC_VD, Parser.SRC_SjA, Parser.SRC_HAT_TG, Parser.SRC_HAT_LMI, Parser.SRC_GotSF, Parser.SRC_MCV3MC, Parser.SRC_MCV4EC, Parser.SRC_MisMV1, Parser.SRC_LK, Parser.SRC_AATM, Parser.SRC_CoA, Parser.SRC_PiP, Parser.SRC_HFStCM, ]);
Parser.SOURCES_PARTNERED_WOTC = new Set([Parser.SRC_RMBRE, Parser.SRC_RMR, Parser.SRC_EGW, Parser.SRC_EGW_ToR, Parser.SRC_EGW_DD, Parser.SRC_EGW_FS, Parser.SRC_EGW_US, Parser.SRC_CRCotN, Parser.SRC_TDCSR, Parser.SRC_HftT, Parser.SRC_GHLoE, Parser.SRC_DoDk, ]);

Parser.SOURCES_VANILLA = new Set([Parser.SRC_DMG, Parser.SRC_MM, Parser.SRC_PHB, Parser.SRC_SCAG, Parser.SRC_XGE, Parser.SRC_SAC, Parser.SRC_MFF, Parser.SRC_SADS, Parser.SRC_TCE, Parser.SRC_FTD, Parser.SRC_MPMM, Parser.SRC_SCREEN, Parser.SRC_SCREEN_WILDERNESS_KIT, Parser.SRC_SCREEN_DUNGEON_KIT, Parser.SRC_VD, Parser.SRC_GotSF, Parser.SRC_BGG, Parser.SRC_MaBJoV, Parser.SRC_CoA, Parser.SRC_BMT, ]);

Parser.SOURCES_COMEDY = new Set([Parser.SRC_AI, Parser.SRC_OoW, Parser.SRC_RMR, Parser.SRC_RMBRE, Parser.SRC_HftT, Parser.SRC_AWM, Parser.SRC_MGELFT, Parser.SRC_HAT_TG, Parser.SRC_HAT_LMI, Parser.SRC_MCV3MC, Parser.SRC_MisMV1, Parser.SRC_LK, Parser.SRC_PiP, ]);

Parser.SOURCES_NON_FR = new Set([Parser.SRC_GGR, Parser.SRC_KKW, Parser.SRC_ERLW, Parser.SRC_EFR, Parser.SRC_EGW, Parser.SRC_EGW_ToR, Parser.SRC_EGW_DD, Parser.SRC_EGW_FS, Parser.SRC_EGW_US, Parser.SRC_MOT, Parser.SRC_XMtS, Parser.SRC_AZfyT, Parser.SRC_SCC, Parser.SRC_SCC_CK, Parser.SRC_SCC_HfMT, Parser.SRC_SCC_TMM, Parser.SRC_SCC_ARiR, Parser.SRC_CRCotN, Parser.SRC_SjA, Parser.SRC_SAiS, Parser.SRC_AAG, Parser.SRC_BAM, Parser.SRC_LoX, Parser.SRC_DSotDQ, Parser.SRC_TDCSR, Parser.SRC_PAitM, Parser.SRC_SatO, Parser.SRC_ToFW, Parser.SRC_MPP, Parser.SRC_MCV4EC, Parser.SRC_LK, Parser.SRC_GHLoE, Parser.SRC_DoDk, ]);

Parser.SOURCES_AVAILABLE_DOCS_BOOK = {};
[Parser.SRC_PHB, Parser.SRC_MM, Parser.SRC_DMG, Parser.SRC_SCAG, Parser.SRC_VGM, Parser.SRC_OGA, Parser.SRC_XGE, Parser.SRC_MTF, Parser.SRC_GGR, Parser.SRC_AI, Parser.SRC_ERLW, Parser.SRC_RMR, Parser.SRC_EGW, Parser.SRC_MOT, Parser.SRC_TCE, Parser.SRC_VRGR, Parser.SRC_DoD, Parser.SRC_MaBJoV, Parser.SRC_FTD, Parser.SRC_SCC, Parser.SRC_MPMM, Parser.SRC_AAG, Parser.SRC_BAM, Parser.SRC_HAT_TG, Parser.SRC_SCREEN, Parser.SRC_SCREEN_WILDERNESS_KIT, Parser.SRC_SCREEN_DUNGEON_KIT, Parser.SRC_SCREEN_SPELLJAMMER, Parser.SRC_BGG, Parser.SRC_TDCSR, Parser.SRC_SatO, Parser.SRC_MPP, Parser.SRC_HF, Parser.SRC_HFFotM, Parser.SRC_BMT, ].forEach(src=>{
    Parser.SOURCES_AVAILABLE_DOCS_BOOK[src] = src;
    Parser.SOURCES_AVAILABLE_DOCS_BOOK[src.toLowerCase()] = src;
}
);
[{
    src: Parser.SRC_PSA,
    id: "PS-A"
}, {
    src: Parser.SRC_PSI,
    id: "PS-I"
}, {
    src: Parser.SRC_PSK,
    id: "PS-K"
}, {
    src: Parser.SRC_PSZ,
    id: "PS-Z"
}, {
    src: Parser.SRC_PSX,
    id: "PS-X"
}, {
    src: Parser.SRC_PSD,
    id: "PS-D"
}, ].forEach(({src, id})=>{
    Parser.SOURCES_AVAILABLE_DOCS_BOOK[src] = id;
    Parser.SOURCES_AVAILABLE_DOCS_BOOK[src.toLowerCase()] = id;
}
);
Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE = {};
[Parser.SRC_LMoP, Parser.SRC_HotDQ, Parser.SRC_RoT, Parser.SRC_PotA, Parser.SRC_OotA, Parser.SRC_CoS, Parser.SRC_SKT, Parser.SRC_TYP_AtG, Parser.SRC_TYP_DiT, Parser.SRC_TYP_TFoF, Parser.SRC_TYP_THSoT, Parser.SRC_TYP_TSC, Parser.SRC_TYP_ToH, Parser.SRC_TYP_WPM, Parser.SRC_ToA, Parser.SRC_TLK, Parser.SRC_TTP, Parser.SRC_WDH, Parser.SRC_LLK, Parser.SRC_WDMM, Parser.SRC_KKW, Parser.SRC_AZfyT, Parser.SRC_GoS, Parser.SRC_HftT, Parser.SRC_OoW, Parser.SRC_DIP, Parser.SRC_SLW, Parser.SRC_SDW, Parser.SRC_DC, Parser.SRC_BGDIA, Parser.SRC_LR, Parser.SRC_EFR, Parser.SRC_RMBRE, Parser.SRC_IMR, Parser.SRC_EGW_ToR, Parser.SRC_EGW_DD, Parser.SRC_EGW_FS, Parser.SRC_EGW_US, Parser.SRC_IDRotF, Parser.SRC_CM, Parser.SRC_HoL, Parser.SRC_XMtS, Parser.SRC_RtG, Parser.SRC_AitFR_ISF, Parser.SRC_AitFR_THP, Parser.SRC_AitFR_AVT, Parser.SRC_AitFR_DN, Parser.SRC_AitFR_FCD, Parser.SRC_WBtW, Parser.SRC_NRH, Parser.SRC_NRH_TCMC, Parser.SRC_NRH_AVitW, Parser.SRC_NRH_ASS, Parser.SRC_NRH_CoI, Parser.SRC_NRH_TLT, Parser.SRC_NRH_AWoL, Parser.SRC_NRH_AT, Parser.SRC_SCC_CK, Parser.SRC_SCC_HfMT, Parser.SRC_SCC_TMM, Parser.SRC_SCC_ARiR, Parser.SRC_CRCotN, Parser.SRC_JttRC, Parser.SRC_LoX, Parser.SRC_DoSI, Parser.SRC_DSotDQ, Parser.SRC_KftGV, Parser.SRC_GotSF, Parser.SRC_PaBTSO, Parser.SRC_ToFW, Parser.SRC_LK, Parser.SRC_CoA, Parser.SRC_PiP, Parser.SRC_HFStCM, Parser.SRC_GHLoE, Parser.SRC_DoDk, ].forEach(src=>{
    Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[src] = src;
    Parser.SOURCES_AVAILABLE_DOCS_ADVENTURE[src.toLowerCase()] = src;
}
);

Parser.getTagSource = function(tag, source) {
    if (source && source.trim())
        return source;

    tag = tag.trim();

    const tagMeta = Renderer.tag.TAG_LOOKUP[tag];

    if (!tagMeta)
        throw new Error(`Unhandled tag "${tag}"`);
    return tagMeta.defaultSource;
}
;

Parser.PROP_TO_TAG = {
    "monster": "creature",
    "optionalfeature": "optfeature",
    "tableGroup": "table",
    "vehicleUpgrade": "vehupgrade",
    "baseitem": "item",
    "itemGroup": "item",
    "magicvariant": "item",
};
Parser.getPropTag = function(prop) {
    if (Parser.PROP_TO_TAG[prop])
        return Parser.PROP_TO_TAG[prop];
    return prop;
}
;

Parser.PROP_TO_DISPLAY_NAME = {
    "variantrule": "Variant Rule",
    "optionalfeature": "Option/Feature",
    "magicvariant": "Magic Item Variant",
    "baseitem": "Item (Base)",
    "item": "Item",
    "adventure": "Adventure",
    "adventureData": "Adventure Text",
    "book": "Book",
    "bookData": "Book Text",
    "makebrewCreatureTrait": "Homebrew Builder Creature Trait",
    "charoption": "Other Character Creation Option",

    "bonus": "Bonus Action",
    "legendary": "Legendary Action",
    "mythic": "Mythic Action",
    "lairActions": "Lair Action",
    "regionalEffects": "Regional Effect",
};
Parser.getPropDisplayName = function(prop, {suffix=""}={}) {
    if (Parser.PROP_TO_DISPLAY_NAME[prop])
        return `${Parser.PROP_TO_DISPLAY_NAME[prop]}${suffix}`;

    const mFluff = /Fluff$/.exec(prop);
    if (mFluff)
        return Parser.getPropDisplayName(prop.slice(0, -mFluff[0].length), {
            suffix: " Fluff"
        });

    const mFoundry = /^foundry(?<prop>[A-Z].*)$/.exec(prop);
    if (mFoundry)
        return Parser.getPropDisplayName(mFoundry.groups.prop.lowercaseFirst(), {
            suffix: " Foundry Data"
        });

    return `${prop.split(/([A-Z][a-z]+)/g).filter(Boolean).join(" ").uppercaseFirst()}${suffix}`;
}
;

Parser.ITEM_TYPE_JSON_TO_ABV = {
    "A": "ammunition",
    "AF": "ammunition",
    "AT": "artisan's tools",
    "EM": "eldritch machine",
    "EXP": "explosive",
    "FD": "food and drink",
    "G": "adventuring gear",
    "GS": "gaming set",
    "HA": "heavy armor",
    "IDG": "illegal drug",
    "INS": "instrument",
    "LA": "light armor",
    "M": "melee weapon",
    "MA": "medium armor",
    "MNT": "mount",
    "MR": "master rune",
    "GV": "generic variant",
    "P": "potion",
    "R": "ranged weapon",
    "RD": "rod",
    "RG": "ring",
    "S": "shield",
    "SC": "scroll",
    "SCF": "spellcasting focus",
    "OTH": "other",
    "T": "tools",
    "TAH": "tack and harness",
    "TG": "trade good",
    "$": "treasure",
    "VEH": "vehicle (land)",
    "SHP": "vehicle (water)",
    "AIR": "vehicle (air)",
    "SPC": "vehicle (space)",
    "WD": "wand",
};

Parser.DMGTYPE_JSON_TO_FULL = {
    "A": "acid",
    "B": "bludgeoning",
    "C": "cold",
    "F": "fire",
    "O": "force",
    "L": "lightning",
    "N": "necrotic",
    "P": "piercing",
    "I": "poison",
    "Y": "psychic",
    "R": "radiant",
    "S": "slashing",
    "T": "thunder",
};

Parser.DMG_TYPES = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
Parser.CONDITIONS = ["blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"];

Parser.SENSES = [{
    "name": "blindsight",
    "source": Parser.SRC_PHB
}, {
    "name": "darkvision",
    "source": Parser.SRC_PHB
}, {
    "name": "tremorsense",
    "source": Parser.SRC_MM
}, {
    "name": "truesight",
    "source": Parser.SRC_PHB
}, ];

Parser.NUMBERS_ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
Parser.NUMBERS_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
Parser.NUMBERS_TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];

Parser.metric = {
    MILES_TO_KILOMETRES: 1.6,
    FEET_TO_METRES: 0.3,
    YARDS_TO_METRES: 0.9,
    POUNDS_TO_KILOGRAMS: 0.5,
    getMetricNumber({originalValue, originalUnit, toFixed=null}) {
        if (originalValue == null || isNaN(originalValue))
            return originalValue;

        originalValue = Number(originalValue);
        if (!originalValue)
            return originalValue;

        let out = null;
        switch (originalUnit) {
        case "ft.":
        case "ft":
        case Parser.UNT_FEET:
            out = originalValue * Parser.metric.FEET_TO_METRES;
            break;
        case "yd.":
        case "yd":
        case Parser.UNT_YARDS:
            out = originalValue * Parser.metric.YARDS_TO_METRES;
            break;
        case "mi.":
        case "mi":
        case Parser.UNT_MILES:
            out = originalValue * Parser.metric.MILES_TO_KILOMETRES;
            break;
        case "lb.":
        case "lb":
        case "lbs":
            out = originalValue * Parser.metric.POUNDS_TO_KILOGRAMS;
            break;
        default:
            return originalValue;
        }
        if (toFixed != null)
            return NumberUtil.toFixedNumber(out, toFixed);
        return out;
    },

    getMetricUnit({originalUnit, isShortForm=false, isPlural=true}) {
        switch (originalUnit) {
        case "ft.":
        case "ft":
        case Parser.UNT_FEET:
            return isShortForm ? "m" : `meter`[isPlural ? "toPlural" : "toString"]();
        case "yd.":
        case "yd":
        case Parser.UNT_YARDS:
            return isShortForm ? "m" : `meter`[isPlural ? "toPlural" : "toString"]();
        case "mi.":
        case "mi":
        case Parser.UNT_MILES:
            return isShortForm ? "km" : `kilometre`[isPlural ? "toPlural" : "toString"]();
        case "lb.":
        case "lb":
        case "lbs":
            return isShortForm ? "kg" : `kilogram`[isPlural ? "toPlural" : "toString"]();
        default:
            return originalUnit;
        }
    },
};

Parser.MAP_GRID_TYPE_TO_FULL = {};
Parser.MAP_GRID_TYPE_TO_FULL["none"] = "None";
Parser.MAP_GRID_TYPE_TO_FULL["square"] = "Square";
Parser.MAP_GRID_TYPE_TO_FULL["hexRowsOdd"] = "Hex Rows (Odd)";
Parser.MAP_GRID_TYPE_TO_FULL["hexRowsEven"] = "Hex Rows (Even)";
Parser.MAP_GRID_TYPE_TO_FULL["hexColsOdd"] = "Hex Columns (Odd)";
Parser.MAP_GRID_TYPE_TO_FULL["hexColsEven"] = "Hex Columns (Even)";

Parser.mapGridTypeToFull = function(gridType) {
    return Parser._parse_aToB(Parser.MAP_GRID_TYPE_TO_FULL, gridType);
}
;
//#endregion


// #region Renderer
"use strict";
globalThis.Renderer = function() {
    this.wrapperTag = "div";
    this.baseUrl = "";
    this.baseMediaUrls = {};

    if (globalThis.DEPLOYED_IMG_ROOT) {
        this.baseMediaUrls["img"] = globalThis.DEPLOYED_IMG_ROOT;
    }

    this._lazyImages = false;
    this._subVariant = false;
    this._firstSection = true;
    this._isAddHandlers = true;
    this._headerIndex = 1;
    this._tagExportDict = null;
    this._roll20Ids = null;
    this._trackTitles = {
        enabled: false,
        titles: {}
    };
    this._enumerateTitlesRel = {
        enabled: false,
        titles: {}
    };
    this._isHeaderIndexIncludeTableCaptions = false;
    this._isHeaderIndexIncludeImageTitles = false;
    this._plugins = {};
    this._fnPostProcess = null;
    this._extraSourceClasses = null;
    this._depthTracker = null;
    this._depthTrackerAdditionalProps = [];
    this._depthTrackerAdditionalPropsInherited = [];
    this._lastDepthTrackerInheritedProps = {};
    this._isInternalLinksDisabled = false;
    this._isPartPageExpandCollapseDisabled = false;
    this._fnsGetStyleClasses = {};

    this.setLazyImages = function(bool) {
        if (typeof IntersectionObserver === "undefined")
            this._lazyImages = false;
        else
            this._lazyImages = !!bool;
        return this;
    }
    ;

    this.setWrapperTag = function(tag) {
        this.wrapperTag = tag;
        return this;
    }
    ;

    this.setBaseUrl = function(url) {
        this.baseUrl = url;
        return this;
    }
    ;

    this.setBaseMediaUrl = function(mediaDir, url) {
        this.baseMediaUrls[mediaDir] = url;
        return this;
    }
    ;

    this.setFirstSection = function(bool) {
        this._firstSection = bool;
        return this;
    }
    ;

    this.setAddHandlers = function(bool) {
        this._isAddHandlers = bool;
        return this;
    }
    ;

    this.setFnPostProcess = function(fn) {
        this._fnPostProcess = fn;
        return this;
    }
    ;

    this.setExtraSourceClasses = function(arr) {
        this._extraSourceClasses = arr;
        return this;
    }
    ;

    this.resetHeaderIndex = function() {
        this._headerIndex = 1;
        this._trackTitles.titles = {};
        this._enumerateTitlesRel.titles = {};
        return this;
    }
    ;

    this.getHeaderIndex = function() {
        return this._headerIndex;
    }
    ;

    this.setHeaderIndexTableCaptions = function(bool) {
        this._isHeaderIndexIncludeTableCaptions = bool;
        return this;
    }
    ;
    this.setHeaderIndexImageTitles = function(bool) {
        this._isHeaderIndexIncludeImageTitles = bool;
        return this;
    }
    ;

    this.doExportTags = function(toObj) {
        this._tagExportDict = toObj;
        return this;
    }
    ;

    this.resetExportTags = function() {
        this._tagExportDict = null;
        return this;
    }
    ;

    this.setRoll20Ids = function(roll20Ids) {
        this._roll20Ids = roll20Ids;
        return this;
    }
    ;

    this.resetRoll20Ids = function() {
        this._roll20Ids = null;
        return this;
    }
    ;

    this.setInternalLinksDisabled = function(val) {
        this._isInternalLinksDisabled = !!val;
        return this;
    }
    ;
    this.isInternalLinksDisabled = function() {
        return !!this._isInternalLinksDisabled;
    }
    ;

    this.setPartPageExpandCollapseDisabled = function(val) {
        this._isPartPageExpandCollapseDisabled = !!val;
        return this;
    }
    ;

    this.setFnGetStyleClasses = function(identifier, fn) {
        if (fn == null) {
            delete this._fnsGetStyleClasses[identifier];
            return this;
        }

        this._fnsGetStyleClasses[identifier] = fn;
        return this;
    }
    ;

    this.setEnumerateTitlesRel = function(bool) {
        this._enumerateTitlesRel.enabled = bool;
        return this;
    }
    ;

    this._getEnumeratedTitleRel = function(name) {
        if (this._enumerateTitlesRel.enabled && name) {
            const clean = name.toLowerCase();
            this._enumerateTitlesRel.titles[clean] = this._enumerateTitlesRel.titles[clean] || 0;
            return `data-title-relative-index="${this._enumerateTitlesRel.titles[clean]++}"`;
        } else
            return "";
    }
    ;

    this.setTrackTitles = function(bool) {
        this._trackTitles.enabled = bool;
        return this;
    }
    ;

    this.getTrackedTitles = function() {
        return MiscUtil.copyFast(this._trackTitles.titles);
    }
    ;

    this.getTrackedTitlesInverted = function({isStripTags=false}={}) {
        const trackedTitlesInverse = {};
        Object.entries(this._trackTitles.titles || {}).forEach(([titleIx,titleName])=>{
            if (isStripTags)
                titleName = Renderer.stripTags(titleName);
            titleName = titleName.toLowerCase().trim();
            (trackedTitlesInverse[titleName] = trackedTitlesInverse[titleName] || []).push(titleIx);
        }
        );
        return trackedTitlesInverse;
    }
    ;

    this._handleTrackTitles = function(name, {isTable=false, isImage=false}={}) {
        if (!this._trackTitles.enabled)
            return;
        if (isTable && !this._isHeaderIndexIncludeTableCaptions)
            return;
        if (isImage && !this._isHeaderIndexIncludeImageTitles)
            return;
        this._trackTitles.titles[this._headerIndex] = name;
    }
    ;

    this._handleTrackDepth = function(entry, depth) {
        if (!entry.name || !this._depthTracker)
            return;

        this._lastDepthTrackerInheritedProps = MiscUtil.copyFast(this._lastDepthTrackerInheritedProps);
        if (entry.source)
            this._lastDepthTrackerInheritedProps.source = entry.source;
        if (this._depthTrackerAdditionalPropsInherited?.length) {
            this._depthTrackerAdditionalPropsInherited.forEach(prop=>this._lastDepthTrackerInheritedProps[prop] = entry[prop] || this._lastDepthTrackerInheritedProps[prop]);
        }

        const additionalData = this._depthTrackerAdditionalProps.length ? this._depthTrackerAdditionalProps.mergeMap(it=>({
            [it]: entry[it]
        })) : {};

        this._depthTracker.push({
            ...this._lastDepthTrackerInheritedProps,
            ...additionalData,
            depth,
            name: entry.name,
            type: entry.type,
            ixHeader: this._headerIndex,
            source: this._lastDepthTrackerInheritedProps.source,
            data: entry.data,
            page: entry.page,
            alias: entry.alias,
            entry,
        });
    }
    ;

    this.addPlugin = function(pluginType, fnPlugin) {
        MiscUtil.getOrSet(this._plugins, pluginType, []).push(fnPlugin);
    }
    ;

    this.removePlugin = function(pluginType, fnPlugin) {
        if (!fnPlugin)
            return;
        const ix = (MiscUtil.get(this._plugins, pluginType) || []).indexOf(fnPlugin);
        if (~ix)
            this._plugins[pluginType].splice(ix, 1);
    }
    ;

    this.removePlugins = function(pluginType) {
        MiscUtil.delete(this._plugins, pluginType);
    }
    ;

    this._getPlugins = function(pluginType) {
        return this._plugins[pluginType] || [];
    }
    ;

    this.withPlugin = function({pluginTypes, fnPlugin, fn}) {
        for (const pt of pluginTypes)
            this.addPlugin(pt, fnPlugin);
        try {
            return fn(this);
        } finally {
            for (const pt of pluginTypes)
                this.removePlugin(pt, fnPlugin);
        }
    }
    ;

    this.pWithPlugin = async function({pluginTypes, fnPlugin, pFn}) {
        for (const pt of pluginTypes)
            this.addPlugin(pt, fnPlugin);
        try {
            const out = await pFn(this);
            return out;
        } finally {
            for (const pt of pluginTypes)
                this.removePlugin(pt, fnPlugin);
        }
    }
    ;

    this.setDepthTracker = function(arr, {additionalProps, additionalPropsInherited}={}) {
        this._depthTracker = arr;
        this._depthTrackerAdditionalProps = additionalProps || [];
        this._depthTrackerAdditionalPropsInherited = additionalPropsInherited || [];
        return this;
    }
    ;

    this.getLineBreak = function() {
        return "<br>";
    }
    ;

    this.recursiveRender = function(entry, textStack, meta, options) {
        if (entry instanceof Array) {
            entry.forEach(nxt=>this.recursiveRender(nxt, textStack, meta, options));
            setTimeout(()=>{
                throw new Error(`Array passed to renderer! The renderer only guarantees support for primitives and basic objects.`);
            }
            );
            return this;
        }

        if (textStack.length === 0)
            textStack[0] = "";
        else
            textStack.reverse();

        meta = meta || {};
        meta._typeStack = [];
        meta.depth = meta.depth == null ? 0 : meta.depth;

        this._recursiveRender(entry, textStack, meta, options);
        if (this._fnPostProcess)
            textStack[0] = this._fnPostProcess(textStack[0]);
        textStack.reverse();

        return this;
    }
    ;

    this._recursiveRender = function(entry, textStack, meta, options) {
        if (entry == null)
            return;
        if (!textStack)
            throw new Error("Missing stack!");
        if (!meta)
            throw new Error("Missing metadata!");
        if (entry.type === "section")
            meta.depth = -1;

        options = options || {};

        meta._didRenderPrefix = false;
        meta._didRenderSuffix = false;

        if (typeof entry === "object") {
            const type = entry.type == null || entry.type === "section" ? "entries" : entry.type;

            if (type === "wrapper")
                return this._recursiveRender(entry.wrapped, textStack, meta, options);

            meta._typeStack.push(type);

            switch (type) {
            case "entries":
                this._renderEntries(entry, textStack, meta, options);
                break;
            case "options":
                this._renderOptions(entry, textStack, meta, options);
                break;
            case "list":
                this._renderList(entry, textStack, meta, options);
                break;
            case "table":
                this._renderTable(entry, textStack, meta, options);
                break;
            case "tableGroup":
                this._renderTableGroup(entry, textStack, meta, options);
                break;
            case "inset":
                this._renderInset(entry, textStack, meta, options);
                break;
            case "insetReadaloud":
                this._renderInsetReadaloud(entry, textStack, meta, options);
                break;
            case "variant":
                this._renderVariant(entry, textStack, meta, options);
                break;
            case "variantInner":
                this._renderVariantInner(entry, textStack, meta, options);
                break;
            case "variantSub":
                this._renderVariantSub(entry, textStack, meta, options);
                break;
            case "spellcasting":
                this._renderSpellcasting(entry, textStack, meta, options);
                break;
            case "quote":
                this._renderQuote(entry, textStack, meta, options);
                break;
            case "optfeature":
                this._renderOptfeature(entry, textStack, meta, options);
                break;
            case "patron":
                this._renderPatron(entry, textStack, meta, options);
                break;

            case "abilityDc":
                this._renderAbilityDc(entry, textStack, meta, options);
                break;
            case "abilityAttackMod":
                this._renderAbilityAttackMod(entry, textStack, meta, options);
                break;
            case "abilityGeneric":
                this._renderAbilityGeneric(entry, textStack, meta, options);
                break;

            case "inline":
                this._renderInline(entry, textStack, meta, options);
                break;
            case "inlineBlock":
                this._renderInlineBlock(entry, textStack, meta, options);
                break;
            case "bonus":
                this._renderBonus(entry, textStack, meta, options);
                break;
            case "bonusSpeed":
                this._renderBonusSpeed(entry, textStack, meta, options);
                break;
            case "dice":
                this._renderDice(entry, textStack, meta, options);
                break;
            case "link":
                this._renderLink(entry, textStack, meta, options);
                break;
            case "actions":
                this._renderActions(entry, textStack, meta, options);
                break;
            case "attack":
                this._renderAttack(entry, textStack, meta, options);
                break;
            case "ingredient":
                this._renderIngredient(entry, textStack, meta, options);
                break;

            case "item":
                this._renderItem(entry, textStack, meta, options);
                break;
            case "itemSub":
                this._renderItemSub(entry, textStack, meta, options);
                break;
            case "itemSpell":
                this._renderItemSpell(entry, textStack, meta, options);
                break;

            case "statblockInline":
                this._renderStatblockInline(entry, textStack, meta, options);
                break;
            case "statblock":
                this._renderStatblock(entry, textStack, meta, options);
                break;

            case "image":
                this._renderImage(entry, textStack, meta, options);
                break;
            case "gallery":
                this._renderGallery(entry, textStack, meta, options);
                break;

            case "flowchart":
                this._renderFlowchart(entry, textStack, meta, options);
                break;
            case "flowBlock":
                this._renderFlowBlock(entry, textStack, meta, options);
                break;

            case "homebrew":
                this._renderHomebrew(entry, textStack, meta, options);
                break;

            case "code":
                this._renderCode(entry, textStack, meta, options);
                break;
            case "hr":
                this._renderHr(entry, textStack, meta, options);
                break;
            }

            meta._typeStack.pop();
        } else if (typeof entry === "string") {
            this._renderPrefix(entry, textStack, meta, options);
            this._renderString(entry, textStack, meta, options);
            this._renderSuffix(entry, textStack, meta, options);
        } else {
            this._renderPrefix(entry, textStack, meta, options);
            this._renderPrimitive(entry, textStack, meta, options);
            this._renderSuffix(entry, textStack, meta, options);
        }
    }
    ;

    this._RE_TEXT_CENTER = /\btext-center\b/;

    this._getMutatedStyleString = function(str) {
        if (!str)
            return str;
        return str.replace(this._RE_TEXT_CENTER, "ve-text-center");
    }
    ;

    this._adjustDepth = function(meta, dDepth) {
        const cachedDepth = meta.depth;
        meta.depth += dDepth;
        meta.depth = Math.min(Math.max(-1, meta.depth), 2);
        return cachedDepth;
    }
    ;

    this._renderPrefix = function(entry, textStack, meta, options) {
        if (meta._didRenderPrefix)
            return;
        if (options.prefix != null) {
            textStack[0] += options.prefix;
            meta._didRenderPrefix = true;
        }
    }
    ;

    this._renderSuffix = function(entry, textStack, meta, options) {
        if (meta._didRenderSuffix)
            return;
        if (options.suffix != null) {
            textStack[0] += options.suffix;
            meta._didRenderSuffix = true;
        }
    }
    ;

    this._renderImage = function(entry, textStack, meta, options) {
        if (entry.title)
            this._handleTrackTitles(entry.title, {
                isImage: true
            });

        textStack[0] += `<div class="float-clear"></div>`;

        if (entry.imageType === "map" || entry.imageType === "mapPlayer")
            textStack[0] += `<div class="rd__wrp-map">`;
        textStack[0] += `<div class="${meta._typeStack.includes("gallery") ? "rd__wrp-gallery-image" : ""}">`;

        const href = this._renderImage_getUrl(entry);
        const svg = this._lazyImages && entry.width != null && entry.height != null ? `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${entry.width}" height="${entry.height}"><rect width="100%" height="100%" fill="#ccc3"></rect></svg>`)}` : null;
        const ptTitleCreditTooltip = this._renderImage_getTitleCreditTooltipText(entry);
        const ptTitle = ptTitleCreditTooltip ? `title="${ptTitleCreditTooltip}"` : "";
        const pluginDataIsNoLink = this._getPlugins("image_isNoLink").map(plugin=>plugin(entry, textStack, meta, options)).some(Boolean);

        textStack[0] += `<div class="${this._renderImage_getWrapperClasses(entry, meta)}" ${entry.title && this._isHeaderIndexIncludeImageTitles ? `data-title-index="${this._headerIndex++}"` : ""}>
			${pluginDataIsNoLink ? "" : `<a href="${href}" target="_blank" rel="noopener noreferrer" ${ptTitle}>`}
				<img class="${this._renderImage_getImageClasses(entry, meta)}" src="${svg || href}" ${pluginDataIsNoLink ? ptTitle : ""} ${entry.altText || entry.title ? `alt="${Renderer.stripTags((entry.altText || entry.title)).qq()}"` : ""} ${svg ? `data-src="${href}"` : `loading="lazy"`} ${this._renderImage_getStylePart(entry)}>
			${pluginDataIsNoLink ? "" : `</a>`}
		</div>`;

        if (!this._renderImage_isComicStyling(entry) && (entry.title || entry.credit || entry.mapRegions)) {
            const ptAdventureBookMeta = entry.mapRegions && meta.adventureBookPage && meta.adventureBookSource && meta.adventureBookHash ? `data-rd-adventure-book-map-page="${meta.adventureBookPage.qq()}" data-rd-adventure-book-map-source="${meta.adventureBookSource.qq()}" data-rd-adventure-book-map-hash="${meta.adventureBookHash.qq()}"` : "";

            textStack[0] += `<div class="rd__image-title">`;

            if (entry.title && !entry.mapRegions)
                textStack[0] += `<div class="rd__image-title-inner">${this.render(entry.title)}</div>`;

            if (entry.mapRegions && !IS_VTT) {
                textStack[0] += `<button class="btn btn-xs btn-default rd__image-btn-viewer" onclick="RenderMap.pShowViewer(event, this)" data-rd-packed-map="${this._renderImage_getMapRegionData(entry)}" ${ptAdventureBookMeta} title="Open Dynamic Viewer (SHIFT to Open in New Window)"><span class="glyphicon glyphicon-picture"></span> ${Renderer.stripTags(entry.title) || "Dynamic Viewer"}</button>`;
            }

            if (entry.credit)
                textStack[0] += `<div class="rd__image-credit ve-muted"><span class="glyphicon glyphicon-pencil" title="Art Credit"></span> ${this.render(entry.credit)}</div>`;

            textStack[0] += `</div>`;
        }

        if (entry._galleryTitlePad)
            textStack[0] += `<div class="rd__image-title">&nbsp;</div>`;
        if (entry._galleryCreditPad)
            textStack[0] += `<div class="rd__image-credit">&nbsp;</div>`;

        textStack[0] += `</div>`;
        if (entry.imageType === "map" || entry.imageType === "mapPlayer")
            textStack[0] += `</div>`;
    }
    ;

    this._renderImage_getTitleCreditTooltipText = function(entry) {
        if (!entry.title && !entry.credit)
            return null;
        return Renderer.stripTags([entry.title, entry.credit ? `Art credit: ${entry.credit}` : null].filter(Boolean).join(". "), ).qq();
    }
    ;

    this._renderImage_getStylePart = function(entry) {
        const styles = [entry.maxWidth ? `max-width: min(100%, ${entry.maxWidth}${entry.maxWidthUnits || "px"})` : "", entry.maxHeight ? `max-height: min(60vh, ${entry.maxHeight}${entry.maxHeightUnits || "px"})` : "", ].filter(Boolean).join("; ");
        return styles ? `style="${styles}"` : "";
    }
    ;

    this._renderImage_getMapRegionData = function(entry) {
        return JSON.stringify(this.getMapRegionData(entry)).escapeQuotes();
    }
    ;

    this.getMapRegionData = function(entry) {
        return {
            regions: entry.mapRegions,
            width: entry.width,
            height: entry.height,
            href: this._renderImage_getUrl(entry),
            hrefThumbnail: this._renderImage_getUrlThumbnail(entry),
            page: entry.page,
            source: entry.source,
            hash: entry.hash,
        };
    }
    ;

    this._renderImage_isComicStyling = function(entry) {
        if (!entry.style)
            return false;
        return ["comic-speaker-left", "comic-speaker-right"].includes(entry.style);
    }
    ;

    this._renderImage_getWrapperClasses = function(entry) {
        const out = ["rd__wrp-image", "relative"];
        if (entry.style) {
            switch (entry.style) {
            case "comic-speaker-left":
                out.push("rd__comic-img-speaker", "rd__comic-img-speaker--left");
                break;
            case "comic-speaker-right":
                out.push("rd__comic-img-speaker", "rd__comic-img-speaker--right");
                break;
            }
        }
        return out.join(" ");
    }
    ;

    this._renderImage_getImageClasses = function(entry) {
        const out = ["rd__image"];
        if (entry.style) {
            switch (entry.style) {
            case "deity-symbol":
                out.push("rd__img-small");
                break;
            }
        }
        return out.join(" ");
    }
    ;

    this._renderImage_getUrl = function(entry) {
        let url = Renderer.utils.getMediaUrl(entry, "href", "img");
        for (const plugin of this._getPlugins(`image_urlPostProcess`)) {
            url = plugin(entry, url) || url;
        }
        return url;
    }
    ;

    this._renderImage_getUrlThumbnail = function(entry) {
        let url = Renderer.utils.getMediaUrl(entry, "hrefThumbnail", "img");
        for (const plugin of this._getPlugins(`image_urlThumbnailPostProcess`)) {
            url = plugin(entry, url) || url;
        }
        return url;
    }
    ;

    this._renderList_getListCssClasses = function(entry, textStack, meta, options) {
        const out = [`rd__list`];
        if (entry.style || entry.columns) {
            if (entry.style)
                out.push(...entry.style.split(" ").map(it=>`rd__${it}`));
            if (entry.columns)
                out.push(`columns-${entry.columns}`);
        }
        return out.join(" ");
    }
    ;

    this._renderTableGroup = function(entry, textStack, meta, options) {
        const len = entry.tables.length;
        for (let i = 0; i < len; ++i)
            this._recursiveRender(entry.tables[i], textStack, meta);
    }
    ;

    this._renderTable = function(entry, textStack, meta, options) {
        if (entry.intro) {
            const len = entry.intro.length;
            for (let i = 0; i < len; ++i) {
                this._recursiveRender(entry.intro[i], textStack, meta, {
                    prefix: "<p>",
                    suffix: "</p>"
                });
            }
        }

        textStack[0] += `<table class="w-100 rd__table ${this._getMutatedStyleString(entry.style || "")} ${entry.isStriped === false ? "" : "stripe-odd-table"}">`;

        const headerRowMetas = Renderer.table.getHeaderRowMetas(entry);
        const autoRollMode = Renderer.table.getAutoConvertedRollMode(entry, {
            headerRowMetas
        });
        const toRenderLabel = autoRollMode ? RollerUtil.getFullRollCol(headerRowMetas.last()[0]) : null;
        const isInfiniteResults = autoRollMode === RollerUtil.ROLL_COL_VARIABLE;

        if (entry.caption != null) {
            this._handleTrackTitles(entry.caption, {
                isTable: true
            });
            textStack[0] += `<caption ${this._isHeaderIndexIncludeTableCaptions ? `data-title-index="${this._headerIndex++}"` : ""}>${entry.caption}</caption>`;
        }

        const rollCols = [];
        let bodyStack = [""];
        bodyStack[0] += "<tbody>";
        const lenRows = entry.rows.length;
        for (let ixRow = 0; ixRow < lenRows; ++ixRow) {
            bodyStack[0] += "<tr>";
            const r = entry.rows[ixRow];
            let roRender = r.type === "row" ? r.row : r;

            const len = roRender.length;
            for (let ixCell = 0; ixCell < len; ++ixCell) {
                rollCols[ixCell] = rollCols[ixCell] || false;

                if (autoRollMode && ixCell === 0) {
                    roRender = Renderer.getRollableRow(roRender, {
                        isForceInfiniteResults: isInfiniteResults,
                        isFirstRow: ixRow === 0,
                        isLastRow: ixRow === lenRows - 1,
                    }, );
                    rollCols[ixCell] = true;
                }

                let toRenderCell;
                if (roRender[ixCell].type === "cell") {
                    if (roRender[ixCell].roll) {
                        rollCols[ixCell] = true;
                        if (roRender[ixCell].entry) {
                            toRenderCell = roRender[ixCell].entry;
                        } else if (roRender[ixCell].roll.exact != null) {
                            toRenderCell = roRender[ixCell].roll.pad ? StrUtil.padNumber(roRender[ixCell].roll.exact, 2, "0") : roRender[ixCell].roll.exact;
                        } else {

                            const dispMin = roRender[ixCell].roll.displayMin != null ? roRender[ixCell].roll.displayMin : roRender[ixCell].roll.min;
                            const dispMax = roRender[ixCell].roll.displayMax != null ? roRender[ixCell].roll.displayMax : roRender[ixCell].roll.max;

                            if (dispMax === Renderer.dice.POS_INFINITE) {
                                toRenderCell = roRender[ixCell].roll.pad ? `${StrUtil.padNumber(dispMin, 2, "0")}+` : `${dispMin}+`;
                            } else {
                                toRenderCell = roRender[ixCell].roll.pad ? `${StrUtil.padNumber(dispMin, 2, "0")}-${StrUtil.padNumber(dispMax, 2, "0")}` : `${dispMin}-${dispMax}`;
                            }
                        }
                    } else if (roRender[ixCell].entry) {
                        toRenderCell = roRender[ixCell].entry;
                    }
                } else {
                    toRenderCell = roRender[ixCell];
                }
                bodyStack[0] += `<td ${this._renderTable_makeTableTdClassText(entry, ixCell)} ${this._renderTable_getCellDataStr(roRender[ixCell])} ${roRender[ixCell].type === "cell" && roRender[ixCell].width ? `colspan="${roRender[ixCell].width}"` : ""}>`;
                if (r.style === "row-indent-first" && ixCell === 0)
                    bodyStack[0] += `<div class="rd__tab-indent"></div>`;
                const cacheDepth = this._adjustDepth(meta, 1);
                this._recursiveRender(toRenderCell, bodyStack, meta);
                meta.depth = cacheDepth;
                bodyStack[0] += "</td>";
            }
            bodyStack[0] += "</tr>";
        }
        bodyStack[0] += "</tbody>";

        if (headerRowMetas) {
            textStack[0] += "<thead>";

            for (let ixRow = 0, lenRows = headerRowMetas.length; ixRow < lenRows; ++ixRow) {
                textStack[0] += "<tr>";

                const headerRowMeta = headerRowMetas[ixRow];
                for (let ixCell = 0, lenCells = headerRowMeta.length; ixCell < lenCells; ++ixCell) {
                    const lbl = headerRowMeta[ixCell];
                    textStack[0] += `<th ${this._renderTable_getTableThClassText(entry, ixCell)} data-rd-isroller="${rollCols[ixCell]}" ${entry.isNameGenerator ? `data-rd-namegeneratorrolls="${headerRowMeta.length - 1}"` : ""}>`;
                    this._recursiveRender(autoRollMode && ixCell === 0 ? RollerUtil.getFullRollCol(lbl) : lbl, textStack, meta);
                    textStack[0] += `</th>`;
                }

                textStack[0] += "</tr>";
            }

            textStack[0] += "</thead>";
        }

        textStack[0] += bodyStack[0];

        if (entry.footnotes != null) {
            textStack[0] += "<tfoot>";
            const len = entry.footnotes.length;
            for (let i = 0; i < len; ++i) {
                textStack[0] += `<tr><td colspan="99">`;
                const cacheDepth = this._adjustDepth(meta, 1);
                this._recursiveRender(entry.footnotes[i], textStack, meta);
                meta.depth = cacheDepth;
                textStack[0] += "</td></tr>";
            }
            textStack[0] += "</tfoot>";
        }
        textStack[0] += "</table>";

        if (entry.outro) {
            const len = entry.outro.length;
            for (let i = 0; i < len; ++i) {
                this._recursiveRender(entry.outro[i], textStack, meta, {
                    prefix: "<p>",
                    suffix: "</p>"
                });
            }
        }
    }
    ;

    this._renderTable_getCellDataStr = function(ent) {
        function convertZeros(num) {
            if (num === 0)
                return 100;
            return num;
        }

        if (ent.roll) {
            return `data-roll-min="${convertZeros(ent.roll.exact != null ? ent.roll.exact : ent.roll.min)}" data-roll-max="${convertZeros(ent.roll.exact != null ? ent.roll.exact : ent.roll.max)}"`;
        }

        return "";
    }
    ;

    this._renderTable_getTableThClassText = function(entry, i) {
        return entry.colStyles == null || i >= entry.colStyles.length ? "" : `class="${this._getMutatedStyleString(entry.colStyles[i])}"`;
    }
    ;

    this._renderTable_makeTableTdClassText = function(entry, i) {
        if (entry.rowStyles != null)
            return i >= entry.rowStyles.length ? "" : `class="${this._getMutatedStyleString(entry.rowStyles[i])}"`;
        else
            return this._renderTable_getTableThClassText(entry, i);
    }
    ;

    this._renderEntries = function(entry, textStack, meta, options) {
        this._renderEntriesSubtypes(entry, textStack, meta, options, true);
    }
    ;

    this._getPagePart = function(entry, isInset) {
        if (!Renderer.utils.isDisplayPage(entry.page))
            return "";
        return ` <span class="rd__title-link ${isInset ? `rd__title-link--inset` : ""}">${entry.source ? `<span class="help-subtle" title="${Parser.sourceJsonToFull(entry.source)}">${Parser.sourceJsonToAbv(entry.source)}</span> ` : ""}p${entry.page}</span>`;
    }
    ;

    this._renderEntriesSubtypes = function(entry, textStack, meta, options, incDepth) {
        const type = entry.type || "entries";
        const isInlineTitle = meta.depth >= 2;
        const isAddPeriod = isInlineTitle && entry.name && !Renderer._INLINE_HEADER_TERMINATORS.has(entry.name[entry.name.length - 1]);
        const pagePart = !this._isPartPageExpandCollapseDisabled && !isInlineTitle ? this._getPagePart(entry) : "";
        const partExpandCollapse = !this._isPartPageExpandCollapseDisabled && !isInlineTitle ? `<span class="rd__h-toggle ml-2 clickable no-select" data-rd-h-toggle-button="true" title="Toggle Visibility (CTRL to Toggle All)">[\u2013]</span>` : "";
        const partPageExpandCollapse = !this._isPartPageExpandCollapseDisabled && (pagePart || partExpandCollapse) ? `<span class="ve-flex-vh-center">${[pagePart, partExpandCollapse].filter(Boolean).join("")}</span>` : "";
        const nextDepth = incDepth && meta.depth < 2 ? meta.depth + 1 : meta.depth;
        const styleString = this._renderEntriesSubtypes_getStyleString(entry, meta, isInlineTitle);
        const dataString = this._renderEntriesSubtypes_getDataString(entry);
        if (entry.name != null && Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP[entry.type])
            this._handleTrackTitles(entry.name);

        const headerTag = isInlineTitle ? "span" : `h${Math.min(Math.max(meta.depth + 2, 1), 6)}`;
        const headerClass = `rd__h--${meta.depth + 1}`;
        const cachedLastDepthTrackerProps = MiscUtil.copyFast(this._lastDepthTrackerInheritedProps);
        this._handleTrackDepth(entry, meta.depth);

        const pluginDataNamePrefix = this._getPlugins(`${type}_namePrefix`).map(plugin=>plugin(entry, textStack, meta, options)).filter(Boolean);

        const headerSpan = entry.name ? `<${headerTag} class="rd__h ${headerClass}" data-title-index="${this._headerIndex++}" ${this._getEnumeratedTitleRel(entry.name)}> <span class="entry-title-inner${!pagePart && entry.source ? ` help-subtle` : ""}"${!pagePart && entry.source ? ` title="Source: ${Parser.sourceJsonToFull(entry.source)}${entry.page ? `, p${entry.page}` : ""}"` : ""}>${pluginDataNamePrefix.join("")}${this.render({
            type: "inline",
            entries: [entry.name]
        })}${isAddPeriod ? "." : ""}</span>${partPageExpandCollapse}</${headerTag}> ` : "";

        if (meta.depth === -1) {
            if (!this._firstSection)
                textStack[0] += `<hr class="rd__hr rd__hr--section">`;
            this._firstSection = false;
        }

        if (entry.entries || entry.name) {
            textStack[0] += `<${this.wrapperTag} ${dataString} ${styleString}>${headerSpan}`;
            this._renderEntriesSubtypes_renderPreReqText(entry, textStack, meta);
            if (entry.entries) {
                const cacheDepth = meta.depth;
                const len = entry.entries.length;
                for (let i = 0; i < len; ++i) {
                    meta.depth = nextDepth;
                    this._recursiveRender(entry.entries[i], textStack, meta, {
                        prefix: "<p>",
                        suffix: "</p>"
                    });
                    if (i === 0 && cacheDepth >= 2)
                        textStack[0] += `<div class="rd__spc-inline-post"></div>`;
                }
                meta.depth = cacheDepth;
            }
            textStack[0] += `</${this.wrapperTag}>`;
        }

        this._lastDepthTrackerInheritedProps = cachedLastDepthTrackerProps;
    }
    ;

    this._renderEntriesSubtypes_getDataString = function(entry) {
        let dataString = "";
        if (entry.source)
            dataString += `data-source="${entry.source}"`;
        if (entry.data) {
            for (const k in entry.data) {
                if (!k.startsWith("rd-"))
                    continue;
                dataString += ` data-${k}="${`${entry.data[k]}`.escapeQuotes()}"`;
            }
        }
        return dataString;
    }
    ;

    this._renderEntriesSubtypes_renderPreReqText = function(entry, textStack, meta) {
        if (entry.prerequisite) {
            textStack[0] += `<span class="rd__prerequisite">Prerequisite: `;
            this._recursiveRender({
                type: "inline",
                entries: [entry.prerequisite]
            }, textStack, meta);
            textStack[0] += `</span>`;
        }
    }
    ;

    this._renderEntriesSubtypes_getStyleString = function(entry, meta, isInlineTitle) {
        const styleClasses = ["rd__b"];
        styleClasses.push(this._getStyleClass(entry.type || "entries", entry));
        if (isInlineTitle) {
            if (this._subVariant)
                styleClasses.push(Renderer.HEAD_2_SUB_VARIANT);
            else
                styleClasses.push(Renderer.HEAD_2);
        } else
            styleClasses.push(meta.depth === -1 ? Renderer.HEAD_NEG_1 : meta.depth === 0 ? Renderer.HEAD_0 : Renderer.HEAD_1);
        return styleClasses.length > 0 ? `class="${styleClasses.join(" ")}"` : "";
    }
    ;

    this._renderOptions = function(entry, textStack, meta, options) {
        if (!entry.entries)
            return;
        entry.entries = entry.entries.sort((a,b)=>a.name && b.name ? SortUtil.ascSort(a.name, b.name) : a.name ? -1 : b.name ? 1 : 0);

        if (entry.style && entry.style === "list-hang-notitle") {
            const fauxEntry = {
                type: "list",
                style: "list-hang-notitle",
                items: entry.entries.map(ent=>{
                    if (typeof ent === "string")
                        return ent;
                    if (ent.type === "item")
                        return ent;

                    const out = {
                        ...ent,
                        type: "item"
                    };
                    if (ent.name)
                        out.name = Renderer._INLINE_HEADER_TERMINATORS.has(ent.name[ent.name.length - 1]) ? out.name : `${out.name}.`;
                    return out;
                }
                ),
            };
            this._renderList(fauxEntry, textStack, meta, options);
        } else
            this._renderEntriesSubtypes(entry, textStack, meta, options, false);
    }
    ;

    this._renderList = function(entry, textStack, meta, options) {
        if (entry.items) {
            const tag = entry.start ? "ol" : "ul";
            const cssClasses = this._renderList_getListCssClasses(entry, textStack, meta, options);
            textStack[0] += `<${tag} ${cssClasses ? `class="${cssClasses}"` : ""} ${entry.start ? `start="${entry.start}"` : ""}>`;
            if (entry.name)
                textStack[0] += `<li class="rd__list-name">${entry.name}</li>`;
            const isListHang = entry.style && entry.style.split(" ").includes("list-hang");
            const len = entry.items.length;
            for (let i = 0; i < len; ++i) {
                const item = entry.items[i];
                if (item.type !== "list") {
                    const className = `${this._getStyleClass(entry.type, item)}${item.type === "itemSpell" ? " rd__li-spell" : ""}`;
                    textStack[0] += `<li class="rd__li ${className}">`;
                }
                if (isListHang && typeof item === "string")
                    textStack[0] += "<div>";
                this._recursiveRender(item, textStack, meta);
                if (isListHang && typeof item === "string")
                    textStack[0] += "</div>";
                if (item.type !== "list")
                    textStack[0] += "</li>";
            }
            textStack[0] += `</${tag}>`;
        }
    }
    ;

    this._getPtExpandCollapseSpecial = function() {
        return `<span class="rd__h-toggle ml-2 clickable no-select" data-rd-h-special-toggle-button="true" title="Toggle Visibility (CTRL to Toggle All)">[\u2013]</span>`;
    }
    ;

    this._renderInset = function(entry, textStack, meta, options) {
        const dataString = this._renderEntriesSubtypes_getDataString(entry);
        textStack[0] += `<${this.wrapperTag} class="rd__b-special rd__b-inset ${this._getMutatedStyleString(entry.style || "")}" ${dataString}>`;

        const cachedLastDepthTrackerProps = MiscUtil.copyFast(this._lastDepthTrackerInheritedProps);
        this._handleTrackDepth(entry, 1);

        const pagePart = this._getPagePart(entry, true);
        const partExpandCollapse = this._getPtExpandCollapseSpecial();
        const partPageExpandCollapse = `<span class="ve-flex-vh-center">${[pagePart, partExpandCollapse].filter(Boolean).join("")}</span>`;

        if (entry.name != null) {
            if (Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP[entry.type])
                this._handleTrackTitles(entry.name);
            textStack[0] += `<span class="rd__h rd__h--2-inset" data-title-index="${this._headerIndex++}" ${this._getEnumeratedTitleRel(entry.name)}><h4 class="entry-title-inner">${entry.name}</h4>${partPageExpandCollapse}</span>`;
        } else {
            textStack[0] += `<span class="rd__h rd__h--2-inset rd__h--2-inset-no-name">${partPageExpandCollapse}</span>`;
        }

        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                const cacheDepth = meta.depth;
                meta.depth = 2;
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: "<p>",
                    suffix: "</p>"
                });
                meta.depth = cacheDepth;
            }
        }
        textStack[0] += `<div class="float-clear"></div>`;
        textStack[0] += `</${this.wrapperTag}>`;

        this._lastDepthTrackerInheritedProps = cachedLastDepthTrackerProps;
    }
    ;

    this._renderInsetReadaloud = function(entry, textStack, meta, options) {
        const dataString = this._renderEntriesSubtypes_getDataString(entry);
        textStack[0] += `<${this.wrapperTag} class="rd__b-special rd__b-inset rd__b-inset--readaloud ${this._getMutatedStyleString(entry.style || "")}" ${dataString}>`;

        const cachedLastDepthTrackerProps = MiscUtil.copyFast(this._lastDepthTrackerInheritedProps);
        this._handleTrackDepth(entry, 1);

        const pagePart = this._getPagePart(entry, true);
        const partExpandCollapse = this._getPtExpandCollapseSpecial();
        const partPageExpandCollapse = `<span class="ve-flex-vh-center">${[pagePart, partExpandCollapse].filter(Boolean).join("")}</span>`;

        if (entry.name != null) {
            if (Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP[entry.type])
                this._handleTrackTitles(entry.name);
            textStack[0] += `<span class="rd__h rd__h--2-inset" data-title-index="${this._headerIndex++}" ${this._getEnumeratedTitleRel(entry.name)}><h4 class="entry-title-inner">${entry.name}</h4>${this._getPagePart(entry, true)}</span>`;
        } else {
            textStack[0] += `<span class="rd__h rd__h--2-inset rd__h--2-inset-no-name">${partPageExpandCollapse}</span>`;
        }

        const len = entry.entries.length;
        for (let i = 0; i < len; ++i) {
            const cacheDepth = meta.depth;
            meta.depth = 2;
            this._recursiveRender(entry.entries[i], textStack, meta, {
                prefix: "<p>",
                suffix: "</p>"
            });
            meta.depth = cacheDepth;
        }
        textStack[0] += `<div class="float-clear"></div>`;
        textStack[0] += `</${this.wrapperTag}>`;

        this._lastDepthTrackerInheritedProps = cachedLastDepthTrackerProps;
    }
    ;

    this._renderVariant = function(entry, textStack, meta, options) {
        const dataString = this._renderEntriesSubtypes_getDataString(entry);

        if (entry.name != null && Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP[entry.type])
            this._handleTrackTitles(entry.name);
        const cachedLastDepthTrackerProps = MiscUtil.copyFast(this._lastDepthTrackerInheritedProps);
        this._handleTrackDepth(entry, 1);

        const pagePart = this._getPagePart(entry, true);
        const partExpandCollapse = this._getPtExpandCollapseSpecial();
        const partPageExpandCollapse = `<span class="ve-flex-vh-center">${[pagePart, partExpandCollapse].filter(Boolean).join("")}</span>`;

        textStack[0] += `<${this.wrapperTag} class="rd__b-special rd__b-inset" ${dataString}>`;
        textStack[0] += `<span class="rd__h rd__h--2-inset" data-title-index="${this._headerIndex++}" ${this._getEnumeratedTitleRel(entry.name)}><h4 class="entry-title-inner">Variant: ${entry.name}</h4>${partPageExpandCollapse}</span>`;
        const len = entry.entries.length;
        for (let i = 0; i < len; ++i) {
            const cacheDepth = meta.depth;
            meta.depth = 2;
            this._recursiveRender(entry.entries[i], textStack, meta, {
                prefix: "<p>",
                suffix: "</p>"
            });
            meta.depth = cacheDepth;
        }
        if (entry.source)
            textStack[0] += Renderer.utils.getSourceAndPageTrHtml({
                source: entry.source,
                page: entry.page
            });
        textStack[0] += `</${this.wrapperTag}>`;

        this._lastDepthTrackerInheritedProps = cachedLastDepthTrackerProps;
    }
    ;

    this._renderVariantInner = function(entry, textStack, meta, options) {
        const dataString = this._renderEntriesSubtypes_getDataString(entry);

        if (entry.name != null && Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP[entry.type])
            this._handleTrackTitles(entry.name);
        const cachedLastDepthTrackerProps = MiscUtil.copyFast(this._lastDepthTrackerInheritedProps);
        this._handleTrackDepth(entry, 1);

        textStack[0] += `<${this.wrapperTag} class="rd__b-inset-inner" ${dataString}>`;
        textStack[0] += `<span class="rd__h rd__h--2-inset" data-title-index="${this._headerIndex++}" ${this._getEnumeratedTitleRel(entry.name)}><h4 class="entry-title-inner">${entry.name}</h4></span>`;
        const len = entry.entries.length;
        for (let i = 0; i < len; ++i) {
            const cacheDepth = meta.depth;
            meta.depth = 2;
            this._recursiveRender(entry.entries[i], textStack, meta, {
                prefix: "<p>",
                suffix: "</p>"
            });
            meta.depth = cacheDepth;
        }
        if (entry.source)
            textStack[0] += Renderer.utils.getSourceAndPageTrHtml({
                source: entry.source,
                page: entry.page
            });
        textStack[0] += `</${this.wrapperTag}>`;

        this._lastDepthTrackerInheritedProps = cachedLastDepthTrackerProps;
    }
    ;

    this._renderVariantSub = function(entry, textStack, meta, options) {
        this._subVariant = true;
        const fauxEntry = entry;
        fauxEntry.type = "entries";
        const cacheDepth = meta.depth;
        meta.depth = 3;
        this._recursiveRender(fauxEntry, textStack, meta, {
            prefix: "<p>",
            suffix: "</p>"
        });
        meta.depth = cacheDepth;
        this._subVariant = false;
    }
    ;

    this._renderSpellcasting_getEntries = function(entry) {
        const hidden = new Set(entry.hidden || []);
        const toRender = [{
            type: "entries",
            name: entry.name,
            entries: entry.headerEntries ? MiscUtil.copyFast(entry.headerEntries) : []
        }];

        if (entry.constant || entry.will || entry.recharge || entry.charges || entry.rest || entry.daily || entry.weekly || entry.yearly || entry.ritual) {
            const tempList = {
                type: "list",
                style: "list-hang-notitle",
                items: [],
                data: {
                    isSpellList: true
                }
            };
            if (entry.constant && !hidden.has("constant"))
                tempList.items.push({
                    type: "itemSpell",
                    name: `Constant:`,
                    entry: this._renderSpellcasting_getRenderableList(entry.constant).join(", ")
                });
            if (entry.will && !hidden.has("will"))
                tempList.items.push({
                    type: "itemSpell",
                    name: `At will:`,
                    entry: this._renderSpellcasting_getRenderableList(entry.will).join(", ")
                });

            this._renderSpellcasting_getEntries_procPerDuration({
                entry,
                tempList,
                hidden,
                prop: "recharge",
                fnGetDurationText: num=>`{@recharge ${num}|m}`,
                isSkipPrefix: true
            });
            this._renderSpellcasting_getEntries_procPerDuration({
                entry,
                tempList,
                hidden,
                prop: "charges",
                fnGetDurationText: num=>` charge${num === 1 ? "" : "s"}`
            });
            this._renderSpellcasting_getEntries_procPerDuration({
                entry,
                tempList,
                hidden,
                prop: "rest",
                durationText: "/rest"
            });
            this._renderSpellcasting_getEntries_procPerDuration({
                entry,
                tempList,
                hidden,
                prop: "daily",
                durationText: "/day"
            });
            this._renderSpellcasting_getEntries_procPerDuration({
                entry,
                tempList,
                hidden,
                prop: "weekly",
                durationText: "/week"
            });
            this._renderSpellcasting_getEntries_procPerDuration({
                entry,
                tempList,
                hidden,
                prop: "yearly",
                durationText: "/year"
            });

            if (entry.ritual && !hidden.has("ritual"))
                tempList.items.push({
                    type: "itemSpell",
                    name: `Rituals:`,
                    entry: this._renderSpellcasting_getRenderableList(entry.ritual).join(", ")
                });
            tempList.items = tempList.items.filter(it=>it.entry !== "");
            if (tempList.items.length)
                toRender[0].entries.push(tempList);
        }

        if (entry.spells && !hidden.has("spells")) {
            const tempList = {
                type: "list",
                style: "list-hang-notitle",
                items: [],
                data: {
                    isSpellList: true
                }
            };

            const lvls = Object.keys(entry.spells).map(lvl=>Number(lvl)).sort(SortUtil.ascSort);

            for (const lvl of lvls) {
                const spells = entry.spells[lvl];
                if (spells) {
                    let levelCantrip = `${Parser.spLevelToFull(lvl)}${(lvl === 0 ? "s" : " level")}`;
                    let slotsAtWill = ` (at will)`;
                    const slots = spells.slots;
                    if (slots >= 0)
                        slotsAtWill = slots > 0 ? ` (${slots} slot${slots > 1 ? "s" : ""})` : ``;
                    if (spells.lower && spells.lower !== lvl) {
                        levelCantrip = `${Parser.spLevelToFull(spells.lower)}-${levelCantrip}`;
                        if (slots >= 0)
                            slotsAtWill = slots > 0 ? ` (${slots} ${Parser.spLevelToFull(lvl)}-level slot${slots > 1 ? "s" : ""})` : ``;
                    }
                    tempList.items.push({
                        type: "itemSpell",
                        name: `${levelCantrip}${slotsAtWill}:`,
                        entry: this._renderSpellcasting_getRenderableList(spells.spells).join(", ") || "\u2014"
                    });
                }
            }

            toRender[0].entries.push(tempList);
        }

        if (entry.footerEntries)
            toRender.push({
                type: "entries",
                entries: entry.footerEntries
            });
        return toRender;
    }
    ;

    this._renderSpellcasting_getEntries_procPerDuration = function({entry, hidden, tempList, prop, durationText, fnGetDurationText, isSkipPrefix}) {
        if (!entry[prop] || hidden.has(prop))
            return;

        for (let lvl = 9; lvl > 0; lvl--) {
            const perDur = entry[prop];
            if (perDur[lvl]) {
                tempList.items.push({
                    type: "itemSpell",
                    name: `${isSkipPrefix ? "" : lvl}${fnGetDurationText ? fnGetDurationText(lvl) : durationText}:`,
                    entry: this._renderSpellcasting_getRenderableList(perDur[lvl]).join(", "),
                });
            }

            const lvlEach = `${lvl}e`;
            if (perDur[lvlEach]) {
                const isHideEach = !perDur[lvl] && perDur[lvlEach].length === 1;
                tempList.items.push({
                    type: "itemSpell",
                    name: `${isSkipPrefix ? "" : lvl}${fnGetDurationText ? fnGetDurationText(lvl) : durationText}${isHideEach ? "" : ` each`}:`,
                    entry: this._renderSpellcasting_getRenderableList(perDur[lvlEach]).join(", "),
                });
            }
        }
    }
    ;

    this._renderSpellcasting_getRenderableList = function(spellList) {
        return spellList.filter(it=>!it.hidden).map(it=>it.entry || it);
    }
    ;

    this._renderSpellcasting = function(entry, textStack, meta, options) {
        const toRender = this._renderSpellcasting_getEntries(entry);
        if (!toRender?.[0].entries?.length)
            return;
        this._recursiveRender({
            type: "entries",
            entries: toRender
        }, textStack, meta);
    }
    ;

    this._renderQuote = function(entry, textStack, meta, options) {
        textStack[0] += `<div class="${this._renderList_getQuoteCssClasses(entry, textStack, meta, options)}">`;

        const len = entry.entries.length;
        for (let i = 0; i < len; ++i) {
            textStack[0] += `<p class="rd__quote-line ${i === len - 1 && entry.by ? `rd__quote-line--last` : ""}">${i === 0 && !entry.skipMarks ? "&ldquo;" : ""}`;
            this._recursiveRender(entry.entries[i], textStack, meta, {
                prefix: entry.skipItalics ? "" : "<i>",
                suffix: entry.skipItalics ? "" : "</i>"
            });
            textStack[0] += `${i === len - 1 && !entry.skipMarks ? "&rdquo;" : ""}</p>`;
        }

        if (entry.by || entry.from) {
            textStack[0] += `<p>`;
            const tempStack = [""];
            const byArr = this._renderQuote_getBy(entry);
            if (byArr) {
                for (let i = 0, len = byArr.length; i < len; ++i) {
                    const by = byArr[i];
                    this._recursiveRender(by, tempStack, meta);
                    if (i < len - 1)
                        tempStack[0] += "<br>";
                }
            }
            textStack[0] += `<span class="rd__quote-by">\u2014 ${byArr ? tempStack.join("") : ""}${byArr && entry.from ? `, ` : ""}${entry.from ? `<i>${entry.from}</i>` : ""}</span>`;
            textStack[0] += `</p>`;
        }

        textStack[0] += `</div>`;
    }
    ;

    this._renderList_getQuoteCssClasses = function(entry, textStack, meta, options) {
        const out = [`rd__quote`];
        if (entry.style) {
            if (entry.style)
                out.push(...entry.style.split(" ").map(it=>`rd__${it}`));
        }
        return out.join(" ");
    }
    ;

    this._renderQuote_getBy = function(entry) {
        if (!entry.by?.length)
            return null;
        return entry.by instanceof Array ? entry.by : [entry.by];
    }
    ;

    this._renderOptfeature = function(entry, textStack, meta, options) {
        this._renderEntriesSubtypes(entry, textStack, meta, options, true);
    }
    ;

    this._renderPatron = function(entry, textStack, meta, options) {
        this._renderEntriesSubtypes(entry, textStack, meta, options, false);
    }
    ;

    this._renderAbilityDc = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `<div class="ve-text-center"><b>`;
        this._recursiveRender(entry.name, textStack, meta);
        textStack[0] += ` save DC</b> = 8 + your proficiency bonus + your ${Parser.attrChooseToFull(entry.attributes)}</div>`;
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderAbilityAttackMod = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `<div class="ve-text-center"><b>`;
        this._recursiveRender(entry.name, textStack, meta);
        textStack[0] += ` attack modifier</b> = your proficiency bonus + your ${Parser.attrChooseToFull(entry.attributes)}</div>`;
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderAbilityGeneric = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `<div class="ve-text-center">`;
        if (entry.name)
            this._recursiveRender(entry.name, textStack, meta, {
                prefix: "<b>",
                suffix: "</b> = "
            });
        textStack[0] += `${entry.text}${entry.attributes ? ` ${Parser.attrChooseToFull(entry.attributes)}` : ""}</div>`;
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderInline = function(entry, textStack, meta, options) {
        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i)
                this._recursiveRender(entry.entries[i], textStack, meta);
        }
    }
    ;

    this._renderInlineBlock = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i)
                this._recursiveRender(entry.entries[i], textStack, meta);
        }
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderBonus = function(entry, textStack, meta, options) {
        textStack[0] += (entry.value < 0 ? "" : "+") + entry.value;
    }
    ;

    this._renderBonusSpeed = function(entry, textStack, meta, options) {
        textStack[0] += entry.value === 0 ? "\u2014" : `${entry.value < 0 ? "" : "+"}${entry.value} ft.`;
    }
    ;

    this._renderDice = function(entry, textStack, meta, options) {
        const pluginResults = this._getPlugins("dice").map(plugin=>plugin(entry, textStack, meta, options)).filter(Boolean);

        textStack[0] += Renderer.getEntryDice(entry, entry.name, {
            isAddHandlers: this._isAddHandlers,
            pluginResults
        });
    }
    ;

    this._renderActions = function(entry, textStack, meta, options) {
        const dataString = this._renderEntriesSubtypes_getDataString(entry);

        if (entry.name != null && Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP[entry.type])
            this._handleTrackTitles(entry.name);
        const cachedLastDepthTrackerProps = MiscUtil.copyFast(this._lastDepthTrackerInheritedProps);
        this._handleTrackDepth(entry, 2);

        textStack[0] += `<${this.wrapperTag} class="${Renderer.HEAD_2}" ${dataString}><span class="rd__h rd__h--3" data-title-index="${this._headerIndex++}" ${this._getEnumeratedTitleRel(entry.name)}><span class="entry-title-inner">${entry.name}.</span></span> `;
        const len = entry.entries.length;
        for (let i = 0; i < len; ++i)
            this._recursiveRender(entry.entries[i], textStack, meta, {
                prefix: "<p>",
                suffix: "</p>"
            });
        textStack[0] += `</${this.wrapperTag}>`;

        this._lastDepthTrackerInheritedProps = cachedLastDepthTrackerProps;
    }
    ;

    this._renderAttack = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `<i>${Parser.attackTypeToFull(entry.attackType)}:</i> `;
        const len = entry.attackEntries.length;
        for (let i = 0; i < len; ++i)
            this._recursiveRender(entry.attackEntries[i], textStack, meta);
        textStack[0] += ` <i>Hit:</i> `;
        const len2 = entry.hitEntries.length;
        for (let i = 0; i < len2; ++i)
            this._recursiveRender(entry.hitEntries[i], textStack, meta);
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderIngredient = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        this._recursiveRender(entry.entry, textStack, meta);
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderItem = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `<p class="rd__p-list-item"><span class="${this._getMutatedStyleString(entry.style) || "bold"} rd__list-item-name">${this.render(entry.name)}${this._renderItem_isAddPeriod(entry) ? "." : ""}</span> `;
        if (entry.entry)
            this._recursiveRender(entry.entry, textStack, meta);
        else if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i)
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: i > 0 ? `<span class="rd__p-cont-indent">` : "",
                    suffix: i > 0 ? "</span>" : ""
                });
        }
        textStack[0] += "</p>";
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderItem_isAddPeriod = function(entry) {
        return entry.name && entry.nameDot !== false && !Renderer._INLINE_HEADER_TERMINATORS.has(entry.name[entry.name.length - 1]);
    }
    ;

    this._renderItemSub = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        const isAddPeriod = entry.name && entry.nameDot !== false && !Renderer._INLINE_HEADER_TERMINATORS.has(entry.name[entry.name.length - 1]);
        this._recursiveRender(entry.entry, textStack, meta, {
            prefix: `<p class="rd__p-list-item"><span class="italic rd__list-item-name">${entry.name}${isAddPeriod ? "." : ""}</span> `,
            suffix: "</p>"
        });
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderItemSpell = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);

        const tempStack = [""];
        this._recursiveRender(entry.name || "", tempStack, meta);

        this._recursiveRender(entry.entry, textStack, meta, {
            prefix: `<p>${tempStack.join("")} `,
            suffix: "</p>"
        });
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._InlineStatblockStrategy = function({pFnPreProcess, }, ) {
        this.pFnPreProcess = pFnPreProcess;
    }
    ;

    this._INLINE_STATBLOCK_STRATEGIES = {
        "item": new this._InlineStatblockStrategy({
            pFnPreProcess: async(ent)=>{
                await Renderer.item.pPopulatePropertyAndTypeReference();
                Renderer.item.enhanceItem(ent);
                return ent;
            }
            ,
        }),
    };

    this._renderStatblockInline = function(entry, textStack, meta, options) {
        const fnGetRenderCompact = Renderer.hover.getFnRenderCompact(entry.dataType);

        const headerName = entry.displayName || entry.data?.name;
        const headerStyle = entry.style;

        if (!fnGetRenderCompact) {
            this._renderPrefix(entry, textStack, meta, options);
            this._renderDataHeader(textStack, headerName, headerStyle);
            textStack[0] += `<tr>
				<td colspan="6">
					<i class="text-danger">Cannot render &quot;${entry.type}&quot;&mdash;unknown data type &quot;${entry.dataType}&quot;!</i>
				</td>
			</tr>`;
            this._renderDataFooter(textStack);
            this._renderSuffix(entry, textStack, meta, options);
            return;
        }

        const strategy = this._INLINE_STATBLOCK_STRATEGIES[entry.dataType];

        if (!strategy?.pFnPreProcess && !entry.data?._copy) {
            this._renderPrefix(entry, textStack, meta, options);
            this._renderDataHeader(textStack, headerName, headerStyle, {
                isCollapsed: entry.collapsed
            });
            textStack[0] += fnGetRenderCompact(entry.data, {
                isEmbeddedEntity: true
            });
            this._renderDataFooter(textStack);
            this._renderSuffix(entry, textStack, meta, options);
            return;
        }

        this._renderPrefix(entry, textStack, meta, options);
        this._renderDataHeader(textStack, headerName, headerStyle, {
            isCollapsed: entry.collapsed
        });

        const id = CryptUtil.uid();
        Renderer._cache.inlineStatblock[id] = {
            pFn: async(ele)=>{
                const entLoaded = entry.data?._copy ? (await DataUtil.pDoMetaMergeSingle(entry.dataType, {
                    dependencies: {
                        [entry.dataType]: entry.dependencies
                    }
                }, entry.data, )) : entry.data;

                const ent = strategy?.pFnPreProcess ? await strategy.pFnPreProcess(entLoaded) : entLoaded;

                const tbl = ele.closest("table");
                const nxt = e_({
                    outer: Renderer.utils.getEmbeddedDataHeader(headerName, headerStyle, {
                        isCollapsed: entry.collapsed
                    }) + fnGetRenderCompact(ent, {
                        isEmbeddedEntity: true
                    }) + Renderer.utils.getEmbeddedDataFooter(),
                });
                tbl.parentNode.replaceChild(nxt, tbl, );
            }
            ,
        };

        textStack[0] += `<tr><td colspan="6"><style data-rd-cache-id="${id}" data-rd-cache="inlineStatblock" onload="Renderer._cache.pRunFromEle(this)"></style></td></tr>`;
        this._renderDataFooter(textStack);
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderDataHeader = function(textStack, name, style, {isCollapsed=false}={}) {
        textStack[0] += Renderer.utils.getEmbeddedDataHeader(name, style, {
            isCollapsed
        });
    }
    ;

    this._renderDataFooter = function(textStack) {
        textStack[0] += Renderer.utils.getEmbeddedDataFooter();
    }
    ;

    this._renderStatblock = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);

        const page = entry.prop || Renderer.tag.getPage(entry.tag);
        const source = Parser.getTagSource(entry.tag, entry.source);
        const hash = entry.hash || (UrlUtil.URL_TO_HASH_BUILDER[page] ? UrlUtil.URL_TO_HASH_BUILDER[page]({
            ...entry,
            name: entry.name,
            source
        }) : null);

        const asTag = `{@${entry.tag} ${entry.name}|${source}${entry.displayName ? `|${entry.displayName}` : ""}}`;

        if (!page || !source || !hash) {
            this._renderDataHeader(textStack, entry.name, entry.style);
            textStack[0] += `<tr>
				<td colspan="6">
					<i class="text-danger">Cannot load ${entry.tag ? `&quot;${asTag}&quot;` : entry.displayName || entry.name}! An unknown tag/prop, source, or hash was provided.</i>
				</td>
			</tr>`;
            this._renderDataFooter(textStack);
            this._renderSuffix(entry, textStack, meta, options);

            return;
        }

        this._renderDataHeader(textStack, entry.displayName || entry.name, entry.style, {
            isCollapsed: entry.collapsed
        });
        textStack[0] += `<tr>
			<td colspan="6" data-rd-tag="${(entry.tag || "").qq()}" data-rd-page="${(page || "").qq()}" data-rd-source="${(source || "").qq()}" data-rd-hash="${(hash || "").qq()}" data-rd-name="${(entry.name || "").qq()}" data-rd-display-name="${(entry.displayName || "").qq()}" data-rd-style="${(entry.style || "").qq()}">
				<i>Loading ${entry.tag ? `${Renderer.get().render(asTag)}` : entry.displayName || entry.name}...</i>
				<style onload="Renderer.events.handleLoad_inlineStatblock(this)"></style>
			</td>
		</tr>`;
        this._renderDataFooter(textStack);
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderGallery = function(entry, textStack, meta, options) {
        if (entry.name)
            textStack[0] += `<h5 class="rd__gallery-name">${entry.name}</h5>`;
        textStack[0] += `<div class="rd__wrp-gallery">`;
        const len = entry.images.length;
        const anyNamed = entry.images.some(it=>it.title);
        const isAnyCredited = entry.images.some(it=>it.credit);
        for (let i = 0; i < len; ++i) {
            const img = MiscUtil.copyFast(entry.images[i]);

            if (anyNamed && !img.title)
                img._galleryTitlePad = true;
            if (isAnyCredited && !img.credit)
                img._galleryCreditPad = true;

            delete img.imageType;
            this._recursiveRender(img, textStack, meta, options);
        }
        textStack[0] += `</div>`;
    }
    ;

    this._renderFlowchart = function(entry, textStack, meta, options) {
        textStack[0] += `<div class="rd__wrp-flowchart">`;
        const len = entry.blocks.length;
        for (let i = 0; i < len; ++i) {
            this._recursiveRender(entry.blocks[i], textStack, meta, options);
            if (i !== len - 1) {
                textStack[0] += `<div class="rd__s-v-flow"></div>`;
            }
        }
        textStack[0] += `</div>`;
    }
    ;

    this._renderFlowBlock = function(entry, textStack, meta, options) {
        const dataString = this._renderEntriesSubtypes_getDataString(entry);
        textStack[0] += `<${this.wrapperTag} class="rd__b-special rd__b-flow ve-text-center" ${dataString}>`;

        const cachedLastDepthTrackerProps = MiscUtil.copyFast(this._lastDepthTrackerInheritedProps);
        this._handleTrackDepth(entry, 1);

        if (entry.name != null) {
            if (Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP[entry.type])
                this._handleTrackTitles(entry.name);
            textStack[0] += `<span class="rd__h rd__h--2-flow-block" data-title-index="${this._headerIndex++}" ${this._getEnumeratedTitleRel(entry.name)}><h4 class="entry-title-inner">${this.render({
                type: "inline",
                entries: [entry.name]
            })}</h4></span>`;
        }
        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i) {
                const cacheDepth = meta.depth;
                meta.depth = 2;
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: "<p>",
                    suffix: "</p>"
                });
                meta.depth = cacheDepth;
            }
        }
        textStack[0] += `<div class="float-clear"></div>`;
        textStack[0] += `</${this.wrapperTag}>`;

        this._lastDepthTrackerInheritedProps = cachedLastDepthTrackerProps;
    }
    ;

    this._renderHomebrew = function(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        textStack[0] += `<div class="homebrew-section"><div class="homebrew-float"><span class="homebrew-notice"></span>`;

        if (entry.oldEntries) {
            const hoverMeta = Renderer.hover.getInlineHover({
                type: "entries",
                name: "Homebrew",
                entries: entry.oldEntries
            });
            let markerText;
            if (entry.movedTo) {
                markerText = "(See moved content)";
            } else if (entry.entries) {
                markerText = "(See replaced content)";
            } else {
                markerText = "(See removed content)";
            }
            textStack[0] += `<span class="homebrew-old-content" href="#${window.location.hash}" ${hoverMeta.html}>${markerText}</span>`;
        }

        textStack[0] += `</div>`;

        if (entry.entries) {
            const len = entry.entries.length;
            for (let i = 0; i < len; ++i)
                this._recursiveRender(entry.entries[i], textStack, meta, {
                    prefix: "<p>",
                    suffix: "</p>"
                });
        } else if (entry.movedTo) {
            textStack[0] += `<i>This content has been moved to ${entry.movedTo}.</i>`;
        } else {
            textStack[0] += "<i>This content has been deleted.</i>";
        }

        textStack[0] += `</div>`;
        this._renderSuffix(entry, textStack, meta, options);
    }
    ;

    this._renderCode = function(entry, textStack, meta, options) {
        const isWrapped = !!StorageUtil.syncGet("rendererCodeWrap");
        textStack[0] += `
			<div class="ve-flex-col h-100">
				<div class="ve-flex no-shrink pt-1">
					<button class="btn btn-default btn-xs mb-1 mr-2" onclick="Renderer.events.handleClick_copyCode(event, this)">Copy Code</button>
					<button class="btn btn-default btn-xs mb-1 ${isWrapped ? "active" : ""}" onclick="Renderer.events.handleClick_toggleCodeWrap(event, this)">Word Wrap</button>
				</div>
				<pre class="h-100 w-100 mb-1 ${isWrapped ? "rd__pre-wrap" : ""}">${entry.preformatted}</pre>
			</div>
		`;
    }
    ;

    this._renderHr = function(entry, textStack, meta, options) {
        textStack[0] += `<hr class="rd__hr">`;
    }
    ;

    this._getStyleClass = function(entryType, entry) {
        const outList = [];

        const pluginResults = this._getPlugins(`${entryType}_styleClass_fromSource`).map(plugin=>plugin(entryType, entry)).filter(Boolean);

        if (!pluginResults.some(it=>it.isSkip)) {
            if (SourceUtil.isNonstandardSource(entry.source) || (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(entry.source)))
                outList.push("spicy-sauce");
            if (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(entry.source))
                outList.push("refreshing-brew");
        }

        if (this._extraSourceClasses)
            outList.push(...this._extraSourceClasses);
        for (const k in this._fnsGetStyleClasses) {
            const fromFn = this._fnsGetStyleClasses[k](entry);
            if (fromFn)
                outList.push(...fromFn);
        }
        if (entry.style)
            outList.push(this._getMutatedStyleString(entry.style));
        return outList.join(" ");
    }
    ;

    this._renderString = function(entry, textStack, meta, options) {
        const tagSplit = Renderer.splitByTags(entry);
        const len = tagSplit.length;
        for (let i = 0; i < len; ++i) {
            const s = tagSplit[i];
            if (!s)
                continue;
            if (s.startsWith("{@")) {
                const [tag,text] = Renderer.splitFirstSpace(s.slice(1, -1));
                this._renderString_renderTag(textStack, meta, options, tag, text);
            } else
                textStack[0] += s;
        }
    }
    ;

    this._renderString_renderTag = function(textStack, meta, options, tag, text) {
        for (const plugin of this._getPlugins("string_tag")) {
            const out = plugin(tag, text, textStack, meta, options);
            if (out)
                return void (textStack[0] += out);
        }

        for (const plugin of this._getPlugins(`string_${tag}`)) {
            const out = plugin(tag, text, textStack, meta, options);
            if (out)
                return void (textStack[0] += out);
        }

        switch (tag) {
        case "@b":
        case "@bold":
            textStack[0] += `<b>`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</b>`;
            break;
        case "@i":
        case "@italic":
            textStack[0] += `<i>`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</i>`;
            break;
        case "@s":
        case "@strike":
            textStack[0] += `<s>`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</s>`;
            break;
        case "@u":
        case "@underline":
            textStack[0] += `<u>`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</u>`;
            break;
        case "@sup":
            textStack[0] += `<sup>`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</sup>`;
            break;
        case "@sub":
            textStack[0] += `<sub>`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</sub>`;
            break;
        case "@kbd":
            textStack[0] += `<kbd>`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</kbd>`;
            break;
        case "@code":
            textStack[0] += `<span class="code">`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</span>`;
            break;
        case "@style":
            {
                const [displayText,styles] = Renderer.splitTagByPipe(text);
                const classNames = (styles || "").split(";").map(it=>Renderer._STYLE_TAG_ID_TO_STYLE[it.trim()]).filter(Boolean).join(" ");
                textStack[0] += `<span class="${classNames}">`;
                this._recursiveRender(displayText, textStack, meta);
                textStack[0] += `</span>`;
                break;
            }
        case "@font":
            {
                const [displayText,fontFamily] = Renderer.splitTagByPipe(text);
                textStack[0] += `<span style="font-family: '${fontFamily}'">`;
                this._recursiveRender(displayText, textStack, meta);
                textStack[0] += `</span>`;
                break;
            }
        case "@note":
            textStack[0] += `<i class="ve-muted">`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</i>`;
            break;
        case "@tip":
            {
                const [displayText,titielText] = Renderer.splitTagByPipe(text);
                textStack[0] += `<span title="${titielText.qq()}">`;
                this._recursiveRender(displayText, textStack, meta);
                textStack[0] += `</span>`;
                break;
            }
        case "@atk":
            textStack[0] += `<i>${Renderer.attackTagToFull(text)}</i>`;
            break;
        case "@h":
            textStack[0] += `<i>Hit:</i> `;
            break;
        case "@m":
            textStack[0] += `<i>Miss:</i> `;
            break;
        case "@color":
            {
                const [toDisplay,color] = Renderer.splitTagByPipe(text);
                const ptColor = this._renderString_renderTag_getBrewColorPart(color);

                textStack[0] += `<span class="rd__color" style="color: ${ptColor}">`;
                this._recursiveRender(toDisplay, textStack, meta);
                textStack[0] += `</span>`;
                break;
            }
        case "@highlight":
            {
                const [toDisplay,color] = Renderer.splitTagByPipe(text);
                const ptColor = this._renderString_renderTag_getBrewColorPart(color);

                textStack[0] += ptColor ? `<span style="background-color: ${ptColor}">` : `<span class="rd__highlight">`;
                textStack[0] += toDisplay;
                textStack[0] += `</span>`;
                break;
            }
        case "@help":
            {
                const [toDisplay,title=""] = Renderer.splitTagByPipe(text);
                textStack[0] += `<span class="help" title="${title.qq()}">`;
                this._recursiveRender(toDisplay, textStack, meta);
                textStack[0] += `</span>`;
                break;
            }

        case "@unit":
            {
                const [amount,unitSingle,unitPlural] = Renderer.splitTagByPipe(text);
                textStack[0] += isNaN(amount) ? unitSingle : Number(amount) > 1 ? (unitPlural || unitSingle.toPlural()) : unitSingle;
                break;
            }

        case "@comic":
            textStack[0] += `<span class="rd__comic">`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</span>`;
            break;
        case "@comicH1":
            textStack[0] += `<span class="rd__comic rd__comic--h1">`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</span>`;
            break;
        case "@comicH2":
            textStack[0] += `<span class="rd__comic rd__comic--h2">`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</span>`;
            break;
        case "@comicH3":
            textStack[0] += `<span class="rd__comic rd__comic--h3">`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</span>`;
            break;
        case "@comicH4":
            textStack[0] += `<span class="rd__comic rd__comic--h4">`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</span>`;
            break;
        case "@comicNote":
            textStack[0] += `<span class="rd__comic rd__comic--note">`;
            this._recursiveRender(text, textStack, meta);
            textStack[0] += `</span>`;
            break;

        case "@dc":
            {
                const [dcText,displayText] = Renderer.splitTagByPipe(text);
                textStack[0] += `DC <span class="rd__dc">${displayText || dcText}</span>`;
                break;
            }

        case "@dcYourSpellSave":
            {
                const [displayText] = Renderer.splitTagByPipe(text);
                textStack[0] += displayText || "your spell save DC";
                break;
            }

        case "@dice":
        case "@autodice":
        case "@damage":
        case "@hit":
        case "@d20":
        case "@chance":
        case "@coinflip":
        case "@recharge":
        case "@ability":
        case "@savingThrow":
        case "@skillCheck":
            {
                const fauxEntry = Renderer.utils.getTagEntry(tag, text);

                if (tag === "@recharge") {
                    const [,flagsRaw] = Renderer.splitTagByPipe(text);
                    const flags = flagsRaw ? flagsRaw.split("") : null;
                    textStack[0] += `${flags && flags.includes("m") ? "" : "("}Recharge `;
                    this._recursiveRender(fauxEntry, textStack, meta);
                    textStack[0] += `${flags && flags.includes("m") ? "" : ")"}`;
                } else {
                    this._recursiveRender(fauxEntry, textStack, meta);
                }

                break;
            }

        case "@hitYourSpellAttack":
            this._renderString_renderTag_hitYourSpellAttack(textStack, meta, options, tag, text);
            break;

        case "@scaledice":
        case "@scaledamage":
            {
                const fauxEntry = Renderer.parseScaleDice(tag, text);
                this._recursiveRender(fauxEntry, textStack, meta);
                break;
            }

        case "@filter":
            {
                const [displayText,page,...filters] = Renderer.splitTagByPipe(text);

                const filterSubhashMeta = Renderer.getFilterSubhashes(filters);

                const fauxEntry = {
                    type: "link",
                    text: displayText,
                    href: {
                        type: "internal",
                        path: `${page}.html`,
                        hash: HASH_BLANK,
                        hashPreEncoded: true,
                        subhashes: filterSubhashMeta.subhashes,
                    },
                };

                if (filterSubhashMeta.customHash)
                    fauxEntry.href.hash = filterSubhashMeta.customHash;

                this._recursiveRender(fauxEntry, textStack, meta);

                break;
            }
        case "@link":
            {
                const [displayText,url] = Renderer.splitTagByPipe(text);
                let outUrl = url == null ? displayText : url;
                if (!outUrl.startsWith("http"))
                    outUrl = `http://${outUrl}`;
                const fauxEntry = {
                    type: "link",
                    href: {
                        type: "external",
                        url: outUrl,
                    },
                    text: displayText,
                };
                this._recursiveRender(fauxEntry, textStack, meta);

                break;
            }
        case "@5etools":
            {
                const [displayText,page,hash] = Renderer.splitTagByPipe(text);
                const fauxEntry = {
                    type: "link",
                    href: {
                        type: "internal",
                        path: page,
                    },
                    text: displayText,
                };
                if (hash) {
                    fauxEntry.hash = hash;
                    fauxEntry.hashPreEncoded = true;
                }
                this._recursiveRender(fauxEntry, textStack, meta);

                break;
            }

        case "@footnote":
            {
                const [displayText,footnoteText,optTitle] = Renderer.splitTagByPipe(text);
                const hoverMeta = Renderer.hover.getInlineHover({
                    type: "entries",
                    name: optTitle ? optTitle.toTitleCase() : "Footnote",
                    entries: [footnoteText, optTitle ? `{@note ${optTitle}}` : ""].filter(Boolean),
                });
                textStack[0] += `<span class="help" ${hoverMeta.html}>`;
                this._recursiveRender(displayText, textStack, meta);
                textStack[0] += `</span>`;

                break;
            }
        case "@homebrew":
            {
                const [newText,oldText] = Renderer.splitTagByPipe(text);
                const tooltipEntries = [];
                if (newText && oldText) {
                    tooltipEntries.push("{@b This is a homebrew addition, replacing the following:}");
                } else if (newText) {
                    tooltipEntries.push("{@b This is a homebrew addition.}");
                } else if (oldText) {
                    tooltipEntries.push("{@b The following text has been removed with this homebrew:}");
                }
                if (oldText) {
                    tooltipEntries.push(oldText);
                }
                const hoverMeta = Renderer.hover.getInlineHover({
                    type: "entries",
                    name: "Homebrew Modifications",
                    entries: tooltipEntries,
                });
                textStack[0] += `<span class="homebrew-inline" ${hoverMeta.html}>`;
                this._recursiveRender(newText || "[...]", textStack, meta);
                textStack[0] += `</span>`;

                break;
            }
        case "@area":
            {
                const {areaId, displayText} = Renderer.tag.TAG_LOOKUP.area.getMeta(tag, text);

                if (typeof BookUtil === "undefined") {
                    textStack[0] += displayText;
                } else {
                    const area = BookUtil.curRender.headerMap[areaId] || {
                        entry: {
                            name: ""
                        }
                    };
                    const hoverMeta = Renderer.hover.getInlineHover(area.entry, {
                        isLargeBookContent: true,
                        depth: area.depth
                    });
                    textStack[0] += `<a href="#${BookUtil.curRender.curBookId},${area.chapter},${UrlUtil.encodeForHash(area.entry.name)},0" ${hoverMeta.html}>${displayText}</a>`;
                }

                break;
            }

        case "@loader":
            {
                const {name, path, mode} = this._renderString_getLoaderTagMeta(text);

                const brewUtilName = mode === "homebrew" ? "BrewUtil2" : mode === "prerelease" ? "PrereleaseUtil" : null;
                const brewUtil = globalThis[brewUtilName];

                if (!brewUtil) {
                    textStack[0] += `<span class="text-danger" title="Unknown loader mode &quot;${mode.qq()}&quot;!">${name}<span class="glyphicon glyphicon-alert rd__loadbrew-icon rd__loadbrew-icon"></span></span>`;

                    break;
                }

                textStack[0] += `<span onclick="${brewUtilName}.pAddBrewFromLoaderTag(this)" data-rd-loader-path="${path.escapeQuotes()}" data-rd-loader-name="${name.escapeQuotes()}" class="rd__wrp-loadbrew--ready" title="Click to install ${brewUtil.DISPLAY_NAME}">${name}<span class="glyphicon glyphicon-download-alt rd__loadbrew-icon rd__loadbrew-icon"></span></span>`;
                break;
            }

        case "@book":
        case "@adventure":
            {
                const page = tag === "@book" ? "book.html" : "adventure.html";
                const [displayText,book,chapter,section,rawNumber] = Renderer.splitTagByPipe(text);
                const number = rawNumber || 0;
                const hash = `${book}${chapter ? `${HASH_PART_SEP}${chapter}${section ? `${HASH_PART_SEP}${UrlUtil.encodeForHash(section)}${number != null ? `${HASH_PART_SEP}${UrlUtil.encodeForHash(number)}` : ""}` : ""}` : ""}`;
                const fauxEntry = {
                    type: "link",
                    href: {
                        type: "internal",
                        path: page,
                        hash,
                        hashPreEncoded: true,
                    },
                    text: displayText,
                };
                this._recursiveRender(fauxEntry, textStack, meta);

                break;
            }

        default:
            {
                const {name, source, displayText, others, page, hash, hashPreEncoded, pageHover, hashHover, hashPreEncodedHover, preloadId, linkText, subhashes, subhashesHover, isFauxPage} = Renderer.utils.getTagMeta(tag, text);

                const fauxEntry = {
                    type: "link",
                    href: {
                        type: "internal",
                        path: page,
                        hash,
                        hover: {
                            page,
                            isFauxPage,
                            source,
                        },
                    },
                    text: (displayText || name),
                };

                if (hashPreEncoded != null)
                    fauxEntry.href.hashPreEncoded = hashPreEncoded;
                if (pageHover != null)
                    fauxEntry.href.hover.page = pageHover;
                if (hashHover != null)
                    fauxEntry.href.hover.hash = hashHover;
                if (hashPreEncodedHover != null)
                    fauxEntry.href.hover.hashPreEncoded = hashPreEncodedHover;
                if (preloadId != null)
                    fauxEntry.href.hover.preloadId = preloadId;
                if (linkText)
                    fauxEntry.text = linkText;
                if (subhashes)
                    fauxEntry.href.subhashes = subhashes;
                if (subhashesHover)
                    fauxEntry.href.hover.subhashes = subhashesHover;

                this._recursiveRender(fauxEntry, textStack, meta);

                break;
            }
        }
    }
    ;

    this._renderString_renderTag_getBrewColorPart = function(color) {
        if (!color)
            return "";
        const scrubbedColor = BrewUtilShared.getValidColor(color, {
            isExtended: true
        });
        return scrubbedColor.startsWith("--") ? `var(${scrubbedColor})` : `#${scrubbedColor}`;
    }
    ;

    this._renderString_renderTag_hitYourSpellAttack = function(textStack, meta, options, tag, text) {
        const [displayText] = Renderer.splitTagByPipe(text);

        const fauxEntry = {
            type: "dice",
            rollable: true,
            subType: "d20",
            displayText: displayText || "your spell attack modifier",
            toRoll: `1d20 + #$prompt_number:title=Enter your Spell Attack Modifier$#`,
        };
        return this._recursiveRender(fauxEntry, textStack, meta);
    }
    ;

    this._renderString_getLoaderTagMeta = function(text, {isDefaultUrl=false}={}) {
        const [name,file,mode="homebrew"] = Renderer.splitTagByPipe(text);

        if (!isDefaultUrl)
            return {
                name,
                path: file,
                mode
            };

        const path = /^.*?:\/\//.test(file) ? file : `${VeCt.URL_ROOT_BREW}${file}`;
        return {
            name,
            path,
            mode
        };
    }
    ;

    this._renderPrimitive = function(entry, textStack, meta, options) {
        textStack[0] += entry;
    }
    ;

    this._renderLink = function(entry, textStack, meta, options) {
        let href = this._renderLink_getHref(entry);

        if (entry.href.hover && this._roll20Ids) {
            const procHash = UrlUtil.encodeForHash(entry.href.hash);
            const id = this._roll20Ids[procHash];
            if (id) {
                href = `http://journal.roll20.net/${id.type}/${id.roll20Id}`;
            }
        }

        const pluginData = this._getPlugins("link").map(plugin=>plugin(entry, textStack, meta, options)).filter(Boolean);
        const isDisableEvents = pluginData.some(it=>it.isDisableEvents);
        const additionalAttributes = pluginData.map(it=>it.attributes).filter(Boolean);

        if (this._isInternalLinksDisabled && entry.href.type === "internal") {
            textStack[0] += `<span class="bold" ${isDisableEvents ? "" : this._renderLink_getHoverString(entry)} ${additionalAttributes.join(" ")}>${this.render(entry.text)}</span>`;
        } else if (entry.href.hover?.isFauxPage) {
            textStack[0] += `<span class="help help--hover" ${isDisableEvents ? "" : this._renderLink_getHoverString(entry)} ${additionalAttributes.join(" ")}>${this.render(entry.text)}</span>`;
        } else {
            textStack[0] += `<a href="${href.qq()}" ${entry.href.type === "internal" ? "" : `target="_blank" rel="noopener noreferrer"`} ${isDisableEvents ? "" : this._renderLink_getHoverString(entry)} ${additionalAttributes.join(" ")}>${this.render(entry.text)}</a>`;
        }
    }
    ;

    this._renderLink_getHref = function(entry) {
        let href;
        if (entry.href.type === "internal") {
            href = `${this.baseUrl}${entry.href.path}#`;
            if (entry.href.hash != null) {
                href += entry.href.hashPreEncoded ? entry.href.hash : UrlUtil.encodeForHash(entry.href.hash);
            }
            if (entry.href.subhashes != null) {
                href += Renderer.utils.getLinkSubhashString(entry.href.subhashes);
            }
        } else if (entry.href.type === "external") {
            href = entry.href.url;
        }
        return href;
    }
    ;

    this._renderLink_getHoverString = function(entry) {
        if (!entry.href.hover || !this._isAddHandlers)
            return "";

        let procHash = entry.href.hover.hash ? entry.href.hover.hashPreEncoded ? entry.href.hover.hash : UrlUtil.encodeForHash(entry.href.hover.hash) : entry.href.hashPreEncoded ? entry.href.hash : UrlUtil.encodeForHash(entry.href.hash);

        if (this._tagExportDict) {
            this._tagExportDict[procHash] = {
                page: entry.href.hover.page,
                source: entry.href.hover.source,
                hash: procHash,
            };
        }

        if (entry.href.hover.subhashes) {
            procHash += Renderer.utils.getLinkSubhashString(entry.href.hover.subhashes);
        }

        const pluginData = this._getPlugins("link_attributesHover").map(plugin=>plugin(entry, procHash)).filter(Boolean);
        const replacementAttributes = pluginData.map(it=>it.attributesHoverReplace).filter(Boolean);
        if (replacementAttributes.length)
            return replacementAttributes.join(" ");

        return `onmouseover="Renderer.hover.pHandleLinkMouseOver(event, this)" onmouseleave="Renderer.hover.handleLinkMouseLeave(event, this)" onmousemove="Renderer.hover.handleLinkMouseMove(event, this)" data-vet-page="${entry.href.hover.page.qq()}" data-vet-source="${entry.href.hover.source.qq()}" data-vet-hash="${procHash.qq()}" ${entry.href.hover.preloadId != null ? `data-vet-preload-id="${`${entry.href.hover.preloadId}`.qq()}"` : ""} ${entry.href.hover.isFauxPage ? `data-vet-is-faux-page="true"` : ""} ${Renderer.hover.getPreventTouchString()}`;
    }
    ;

    this.render = function(entry, depth=0) {
        const tempStack = [];
        this.recursiveRender(entry, tempStack, {
            depth
        });
        return tempStack.join("");
    }
    ;
}
;

Renderer.hover = {
    LinkMeta: function() {
        this.isHovered = false;
        this.isLoading = false;
        this.isPermanent = false;
        this.windowMeta = null;
    },

    _BAR_HEIGHT: 16,

    _linkCache: {},
    _eleCache: new Map(),
    _entryCache: {},
    _isInit: false,
    _dmScreen: null,
    _lastId: 0,
    _contextMenu: null,
    _contextMenuLastClicked: null,

    bindDmScreen(screen) {
        this._dmScreen = screen;
    },

    _getNextId() {
        return ++Renderer.hover._lastId;
    },

    _doInit() {
        if (!Renderer.hover._isInit) {
            Renderer.hover._isInit = true;

            $(document.body).on("click", ()=>Renderer.hover.cleanTempWindows());

            Renderer.hover._contextMenu = ContextUtil.getMenu([new ContextUtil.Action("Maximize All",()=>{
                const $permWindows = $(`.hoverborder[data-perm="true"]`);
                $permWindows.attr("data-display-title", "false");
            }
            ,), new ContextUtil.Action("Minimize All",()=>{
                const $permWindows = $(`.hoverborder[data-perm="true"]`);
                $permWindows.attr("data-display-title", "true");
            }
            ,), null, new ContextUtil.Action("Close Others",()=>{
                const hoverId = Renderer.hover._contextMenuLastClicked?.hoverId;
                Renderer.hover._doCloseAllWindows({
                    hoverIdBlocklist: new Set([hoverId])
                });
            }
            ,), new ContextUtil.Action("Close All",()=>Renderer.hover._doCloseAllWindows(),), ]);
        }
    },

    cleanTempWindows() {
        for (const [key,meta] of Renderer.hover._eleCache.entries()) {
            if (!meta.isPermanent && meta.windowMeta && typeof key === "number") {
                meta.windowMeta.doClose();
                Renderer.hover._eleCache.delete(key);
                return;
            }

            if (!meta.isPermanent && meta.windowMeta && !document.body.contains(key)) {
                meta.windowMeta.doClose();
                return;
            }

            if (!meta.isPermanent && meta.isHovered && meta.windowMeta) {
                const bounds = key.getBoundingClientRect();
                if (EventUtil._mouseX < bounds.x || EventUtil._mouseY < bounds.y || EventUtil._mouseX > bounds.x + bounds.width || EventUtil._mouseY > bounds.y + bounds.height) {
                    meta.windowMeta.doClose();
                }
            }
        }
    },

    _doCloseAllWindows({hoverIdBlocklist=null}={}) {
        Object.entries(Renderer.hover._WINDOW_METAS).filter(([hoverId,meta])=>hoverIdBlocklist == null || !hoverIdBlocklist.has(Number(hoverId))).forEach(([,meta])=>meta.doClose());
    },

    _getSetMeta(ele) {
        if (!Renderer.hover._eleCache.has(ele))
            Renderer.hover._eleCache.set(ele, new Renderer.hover.LinkMeta());
        return Renderer.hover._eleCache.get(ele);
    },

    _handleGenericMouseOverStart({evt, ele}) {
        if (Renderer.hover.isSmallScreen(evt) && !evt.shiftKey)
            return;

        Renderer.hover.cleanTempWindows();

        const meta = Renderer.hover._getSetMeta(ele);
        if (meta.isHovered || meta.isLoading)
            return;
        ele.style.cursor = "progress";

        meta.isHovered = true;
        meta.isLoading = true;
        meta.isPermanent = evt.shiftKey;

        return meta;
    },

    _doPredefinedShowStart({entryId}) {
        Renderer.hover.cleanTempWindows();

        const meta = Renderer.hover._getSetMeta(entryId);

        meta.isPermanent = true;

        return meta;
    },

    async pHandleLinkMouseOver(evt, ele, opts) {
        Renderer.hover._doInit();

        let page, source, hash, preloadId, customHashId, isFauxPage;
        if (opts) {
            page = opts.page;
            source = opts.source;
            hash = opts.hash;
            preloadId = opts.preloadId;
            customHashId = opts.customHashId;
            isFauxPage = !!opts.isFauxPage;
        } else {
            page = ele.dataset.vetPage;
            source = ele.dataset.vetSource;
            hash = ele.dataset.vetHash;
            preloadId = ele.dataset.vetPreloadId;
            isFauxPage = ele.dataset.vetIsFauxPage;
        }

        let meta = Renderer.hover._handleGenericMouseOverStart({
            evt,
            ele
        });
        if (meta == null)
            return;

        if ((EventUtil.isCtrlMetaKey(evt)) && Renderer.hover._pageToFluffFn(page))
            meta.isFluff = true;

        let toRender;
        if (preloadId != null) {
            switch (page) {
            case UrlUtil.PG_BESTIARY:
                {
                    const {_scaledCr: scaledCr, _scaledSpellSummonLevel: scaledSpellSummonLevel, _scaledClassSummonLevel: scaledClassSummonLevel} = Renderer.monster.getUnpackedCustomHashId(preloadId);

                    const baseMon = await DataLoader.pCacheAndGet(page, source, hash);
                    if (scaledCr != null) {
                        toRender = await ScaleCreature.scale(baseMon, scaledCr);
                    } else if (scaledSpellSummonLevel != null) {
                        toRender = await ScaleSpellSummonedCreature.scale(baseMon, scaledSpellSummonLevel);
                    } else if (scaledClassSummonLevel != null) {
                        toRender = await ScaleClassSummonedCreature.scale(baseMon, scaledClassSummonLevel);
                    }
                    break;
                }
            }
        } else if (customHashId) {
            toRender = await DataLoader.pCacheAndGet(page, source, hash);
            toRender = await Renderer.hover.pApplyCustomHashId(page, toRender, customHashId);
        } else {
            if (meta.isFluff)
                toRender = await Renderer.hover.pGetHoverableFluff(page, source, hash);
            else
                toRender = await DataLoader.pCacheAndGet(page, source, hash);
        }

        meta.isLoading = false;

        if (opts?.isDelay) {
            meta.isDelayed = true;
            ele.style.cursor = "help";
            await MiscUtil.pDelay(1100);
            meta.isDelayed = false;
        }

        ele.style.cursor = "";

        if (!meta || (!meta.isHovered && !meta.isPermanent))
            return;

        const tmpEvt = meta._tmpEvt;
        delete meta._tmpEvt;

        const win = (evt.view || {}).window;

        const $content = meta.isFluff ? Renderer.hover.$getHoverContent_fluff(page, toRender) : Renderer.hover.$getHoverContent_stats(page, toRender);

        const compactReferenceData = {
            page,
            source,
            hash,
        };

        if (meta.windowMeta && !meta.isPermanent) {
            meta.windowMeta.doClose();
            meta.windowMeta = null;
        }

        meta.windowMeta = Renderer.hover.getShowWindow($content, Renderer.hover.getWindowPositionFromEvent(tmpEvt || evt, {
            isPreventFlicker: !meta.isPermanent
        }), {
            title: toRender ? toRender.name : "",
            isPermanent: meta.isPermanent,
            pageUrl: isFauxPage ? null : `${Renderer.get().baseUrl}${page}#${hash}`,
            cbClose: ()=>meta.isHovered = meta.isPermanent = meta.isLoading = meta.isFluff = false,
            isBookContent: page === UrlUtil.PG_RECIPES,
            compactReferenceData,
            sourceData: toRender,
        }, );

        if (!meta.isFluff && !win?._IS_POPOUT) {
            const fnBind = Renderer.hover.getFnBindListenersCompact(page);
            if (fnBind)
                fnBind(toRender, $content);
        }
    },

    handleInlineMouseOver(evt, ele, entry, opts) {
        Renderer.hover._doInit();

        entry = entry || JSON.parse(ele.dataset.vetEntry);

        let meta = Renderer.hover._handleGenericMouseOverStart({
            evt,
            ele
        });
        if (meta == null)
            return;

        meta.isLoading = false;

        ele.style.cursor = "";

        if (!meta || (!meta.isHovered && !meta.isPermanent))
            return;

        const tmpEvt = meta._tmpEvt;
        delete meta._tmpEvt;

        const win = (evt.view || {}).window;

        const $content = Renderer.hover.$getHoverContent_generic(entry, opts);

        if (meta.windowMeta && !meta.isPermanent) {
            meta.windowMeta.doClose();
            meta.windowMeta = null;
        }

        meta.windowMeta = Renderer.hover.getShowWindow($content, Renderer.hover.getWindowPositionFromEvent(tmpEvt || evt, {
            isPreventFlicker: !meta.isPermanent
        }), {
            title: entry?.name || "",
            isPermanent: meta.isPermanent,
            pageUrl: null,
            cbClose: ()=>meta.isHovered = meta.isPermanent = meta.isLoading = false,
            isBookContent: true,
            sourceData: entry,
        }, );
    },

    async pGetHoverableFluff(page, source, hash, opts) {
        let toRender = await DataLoader.pCacheAndGet(`${page}Fluff`, source, hash, opts);

        if (!toRender) {
            const entity = await DataLoader.pCacheAndGet(page, source, hash, opts);

            const pFnGetFluff = Renderer.hover._pageToFluffFn(page);
            if (!pFnGetFluff && opts?.isSilent)
                return null;

            toRender = await pFnGetFluff(entity);
        }

        if (!toRender)
            return toRender;

        if (toRender && (!toRender.name || !toRender.source)) {
            const toRenderParent = await DataLoader.pCacheAndGet(page, source, hash, opts);
            toRender = MiscUtil.copyFast(toRender);
            toRender.name = toRenderParent.name;
            toRender.source = toRenderParent.source;
        }

        return toRender;
    },

    handleLinkMouseLeave(evt, ele) {
        const meta = Renderer.hover._eleCache.get(ele);
        ele.style.cursor = "";

        if (!meta || meta.isPermanent)
            return;

        if (evt.shiftKey) {
            meta.isPermanent = true;
            meta.windowMeta.setIsPermanent(true);
            return;
        }

        meta.isHovered = false;
        if (meta.windowMeta) {
            meta.windowMeta.doClose();
            meta.windowMeta = null;
        }
    },

    handleLinkMouseMove(evt, ele) {
        const meta = Renderer.hover._eleCache.get(ele);
        if (!meta || meta.isPermanent)
            return;

        if (meta.isDelayed) {
            meta._tmpEvt = evt;
            return;
        }

        if (!meta.windowMeta)
            return;

        meta.windowMeta.setPosition(Renderer.hover.getWindowPositionFromEvent(evt, {
            isPreventFlicker: !evt.shiftKey && !meta.isPermanent
        }));

        if (evt.shiftKey && !meta.isPermanent) {
            meta.isPermanent = true;
            meta.windowMeta.setIsPermanent(true);
        }
    },

    handlePredefinedMouseOver(evt, ele, entryId, opts) {
        opts = opts || {};

        const meta = Renderer.hover._handleGenericMouseOverStart({
            evt,
            ele
        });
        if (meta == null)
            return;

        Renderer.hover.cleanTempWindows();

        const toRender = Renderer.hover._entryCache[entryId];

        meta.isLoading = false;
        if (!meta.isHovered && !meta.isPermanent)
            return;

        const $content = Renderer.hover.$getHoverContent_generic(toRender, opts);
        meta.windowMeta = Renderer.hover.getShowWindow($content, Renderer.hover.getWindowPositionFromEvent(evt, {
            isPreventFlicker: !meta.isPermanent
        }), {
            title: toRender.data && toRender.data.hoverTitle != null ? toRender.data.hoverTitle : toRender.name,
            isPermanent: meta.isPermanent,
            cbClose: ()=>meta.isHovered = meta.isPermanent = meta.isLoading = false,
            sourceData: toRender,
        }, );

        ele.style.cursor = "";
    },

    doPredefinedShow(entryId, opts) {
        opts = opts || {};

        const meta = Renderer.hover._doPredefinedShowStart({
            entryId
        });
        if (meta == null)
            return;

        Renderer.hover.cleanTempWindows();

        const toRender = Renderer.hover._entryCache[entryId];

        const $content = Renderer.hover.$getHoverContent_generic(toRender, opts);
        meta.windowMeta = Renderer.hover.getShowWindow($content, Renderer.hover.getWindowPositionExact((window.innerWidth / 2) - (Renderer.hover._DEFAULT_WIDTH_PX / 2), 100), {
            title: toRender.data && toRender.data.hoverTitle != null ? toRender.data.hoverTitle : toRender.name,
            isPermanent: meta.isPermanent,
            cbClose: ()=>meta.isHovered = meta.isPermanent = meta.isLoading = false,
            sourceData: toRender,
        }, );
    },

    handlePredefinedMouseLeave(evt, ele) {
        return Renderer.hover.handleLinkMouseLeave(evt, ele);
    },

    handlePredefinedMouseMove(evt, ele) {
        return Renderer.hover.handleLinkMouseMove(evt, ele);
    },

    _WINDOW_POSITION_PROPS_FROM_EVENT: ["isFromBottom", "isFromRight", "clientX", "window", "isPreventFlicker", "bcr", ],

    getWindowPositionFromEvent(evt, {isPreventFlicker=false}={}) {
        const ele = evt.target;
        const win = evt?.view?.window || window;

        const bcr = ele.getBoundingClientRect().toJSON();

        const isFromBottom = bcr.top > win.innerHeight / 2;
        const isFromRight = bcr.left > win.innerWidth / 2;

        return {
            mode: "autoFromElement",
            isFromBottom,
            isFromRight,
            clientX: EventUtil.getClientX(evt),
            window: win,
            isPreventFlicker,
            bcr,
        };
    },

    getWindowPositionExact(x, y, evt=null) {
        return {
            window: evt?.view?.window || window,
            mode: "exact",
            x,
            y,
        };
    },

    getWindowPositionExactVisibleBottom(x, y, evt=null) {
        return {
            ...Renderer.hover.getWindowPositionExact(x, y, evt),
            mode: "exactVisibleBottom",
        };
    },

    _WINDOW_METAS: {},
    MIN_Z_INDEX: 200,
    _MAX_Z_INDEX: 300,
    _DEFAULT_WIDTH_PX: 600,
    _BODY_SCROLLER_WIDTH_PX: 15,

    _getZIndex() {
        const zIndices = Object.values(Renderer.hover._WINDOW_METAS).map(it=>it.zIndex);
        if (!zIndices.length)
            return Renderer.hover.MIN_Z_INDEX;
        return Math.max(...zIndices);
    },

    _getNextZIndex(hoverId) {
        const cur = Renderer.hover._getZIndex();
        if (hoverId != null && Renderer.hover._WINDOW_METAS[hoverId].zIndex === cur)
            return cur;
        const out = cur + 1;

        if (out > Renderer.hover._MAX_Z_INDEX) {
            const sortedWindowMetas = Object.entries(Renderer.hover._WINDOW_METAS).sort(([kA,vA],[kB,vB])=>SortUtil.ascSort(vA.zIndex, vB.zIndex));

            if (sortedWindowMetas.length >= (Renderer.hover._MAX_Z_INDEX - Renderer.hover.MIN_Z_INDEX)) {
                sortedWindowMetas.forEach(([k,v])=>{
                    v.setZIndex(Renderer.hover.MIN_Z_INDEX);
                }
                );
            } else {
                sortedWindowMetas.forEach(([k,v],i)=>{
                    v.setZIndex(Renderer.hover.MIN_Z_INDEX + i);
                }
                );
            }

            return Renderer.hover._getNextZIndex(hoverId);
        } else
            return out;
    },

    _isIntersectRect(r1, r2) {
        return r1.left <= r2.right && r2.left <= r1.right && r1.top <= r2.bottom && r2.top <= r1.bottom;
    },

    getShowWindow($content, position, opts) {
        opts = opts || {};

        Renderer.hover._doInit();

        const initialWidth = opts.width == null ? Renderer.hover._DEFAULT_WIDTH_PX : opts.width;
        const initialZIndex = Renderer.hover._getNextZIndex();

        const $body = $(position.window.document.body);
        const $hov = $(`<div class="hwin"></div>`).css({
            "right": -initialWidth,
            "width": initialWidth,
            "zIndex": initialZIndex,
        });
        const $wrpContent = $(`<div class="hwin__wrp-table"></div>`);
        if (opts.height != null)
            $wrpContent.css("height", opts.height);
        const $hovTitle = $(`<span class="window-title min-w-0 overflow-ellipsis" title="${`${opts.title || ""}`.qq()}">${opts.title || ""}</span>`);

        const hoverWindow = {};
        const hoverId = Renderer.hover._getNextId();
        Renderer.hover._WINDOW_METAS[hoverId] = hoverWindow;
        const mouseUpId = `mouseup.${hoverId} touchend.${hoverId}`;
        const mouseMoveId = `mousemove.${hoverId} touchmove.${hoverId}`;
        const resizeId = `resize.${hoverId}`;
        const drag = {};

        const $brdrTopRightResize = $(`<div class="hoverborder__resize-ne"></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 1
        }));

        const $brdrRightResize = $(`<div class="hoverborder__resize-e"></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 2
        }));

        const $brdrBottomRightResize = $(`<div class="hoverborder__resize-se"></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 3
        }));

        const $brdrBtm = $(`<div class="hoverborder hoverborder--btm ${opts.isBookContent ? "hoverborder-book" : ""}"><div class="hoverborder__resize-s"></div></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 4
        }));

        const $brdrBtmLeftResize = $(`<div class="hoverborder__resize-sw"></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 5
        }));

        const $brdrLeftResize = $(`<div class="hoverborder__resize-w"></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 6
        }));

        const $brdrTopLeftResize = $(`<div class="hoverborder__resize-nw"></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 7
        }));

        const $brdrTopResize = $(`<div class="hoverborder__resize-n"></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 8
        }));

        const $brdrTop = $(`<div class="hoverborder hoverborder--top ${opts.isBookContent ? "hoverborder-book" : ""}" ${opts.isPermanent ? `data-perm="true"` : ""}></div>`).on("mousedown touchstart", (evt)=>Renderer.hover._getShowWindow_handleDragMousedown({
            hoverWindow,
            hoverId,
            $hov,
            drag,
            $wrpContent
        }, {
            evt,
            type: 9
        })).on("contextmenu", (evt)=>{
            Renderer.hover._contextMenuLastClicked = {
                hoverId,
            };
            ContextUtil.pOpenMenu(evt, Renderer.hover._contextMenu);
        }
        );

        $(position.window.document).on(mouseUpId, (evt)=>{
            if (drag.type) {
                if (drag.type < 9) {
                    $wrpContent.css("max-height", "");
                    $hov.css("max-width", "");
                }
                Renderer.hover._getShowWindow_adjustPosition({
                    $hov,
                    $wrpContent,
                    position
                });

                if (drag.type === 9) {
                    if (EventUtil.isUsingTouch() && evt.target.classList.contains("hwin__top-border-icon")) {
                        evt.preventDefault();
                        drag.type = 0;
                        $(evt.target).click();
                        return;
                    }

                    if (this._dmScreen && opts.compactReferenceData) {
                        const panel = this._dmScreen.getPanelPx(EventUtil.getClientX(evt), EventUtil.getClientY(evt));
                        if (!panel)
                            return;
                        this._dmScreen.setHoveringPanel(panel);
                        const target = panel.getAddButtonPos();

                        if (Renderer.hover._getShowWindow_isOverHoverTarget({
                            evt,
                            target
                        })) {
                            panel.doPopulate_Stats(opts.compactReferenceData.page, opts.compactReferenceData.source, opts.compactReferenceData.hash);
                            Renderer.hover._getShowWindow_doClose({
                                $hov,
                                position,
                                mouseUpId,
                                mouseMoveId,
                                resizeId,
                                hoverId,
                                opts,
                                hoverWindow
                            });
                        }
                        this._dmScreen.resetHoveringButton();
                    }
                }
                drag.type = 0;
            }
        }
        ).on(mouseMoveId, (evt)=>{
            const args = {
                $wrpContent,
                $hov,
                drag,
                evt
            };
            switch (drag.type) {
            case 1:
                Renderer.hover._getShowWindow_handleNorthDrag(args);
                Renderer.hover._getShowWindow_handleEastDrag(args);
                break;
            case 2:
                Renderer.hover._getShowWindow_handleEastDrag(args);
                break;
            case 3:
                Renderer.hover._getShowWindow_handleSouthDrag(args);
                Renderer.hover._getShowWindow_handleEastDrag(args);
                break;
            case 4:
                Renderer.hover._getShowWindow_handleSouthDrag(args);
                break;
            case 5:
                Renderer.hover._getShowWindow_handleSouthDrag(args);
                Renderer.hover._getShowWindow_handleWestDrag(args);
                break;
            case 6:
                Renderer.hover._getShowWindow_handleWestDrag(args);
                break;
            case 7:
                Renderer.hover._getShowWindow_handleNorthDrag(args);
                Renderer.hover._getShowWindow_handleWestDrag(args);
                break;
            case 8:
                Renderer.hover._getShowWindow_handleNorthDrag(args);
                break;
            case 9:
                {
                    const diffX = drag.startX - EventUtil.getClientX(evt);
                    const diffY = drag.startY - EventUtil.getClientY(evt);
                    $hov.css("left", drag.baseLeft - diffX).css("top", drag.baseTop - diffY);
                    drag.startX = EventUtil.getClientX(evt);
                    drag.startY = EventUtil.getClientY(evt);
                    drag.baseTop = parseFloat($hov.css("top"));
                    drag.baseLeft = parseFloat($hov.css("left"));

                    if (this._dmScreen) {
                        const panel = this._dmScreen.getPanelPx(EventUtil.getClientX(evt), EventUtil.getClientY(evt));
                        if (!panel)
                            return;
                        this._dmScreen.setHoveringPanel(panel);
                        const target = panel.getAddButtonPos();

                        if (Renderer.hover._getShowWindow_isOverHoverTarget({
                            evt,
                            target
                        }))
                            this._dmScreen.setHoveringButton(panel);
                        else
                            this._dmScreen.resetHoveringButton();
                    }
                    break;
                }
            }
        }
        );
        $(position.window).on(resizeId, ()=>Renderer.hover._getShowWindow_adjustPosition({
            $hov,
            $wrpContent,
            position
        }));

        $brdrTop.attr("data-display-title", false);
        $brdrTop.on("dblclick", ()=>Renderer.hover._getShowWindow_doToggleMinimizedMaximized({
            $brdrTop,
            $hov
        }));
        $brdrTop.append($hovTitle);
        const $brdTopRhs = $(`<div class="ve-flex ml-auto no-shrink"></div>`).appendTo($brdrTop);

        if (opts.pageUrl && !position.window._IS_POPOUT && !Renderer.get().isInternalLinksDisabled()) {
            const $btnGotoPage = $(`<a class="hwin__top-border-icon glyphicon glyphicon-modal-window" title="Go to Page" href="${opts.pageUrl}"></a>`).appendTo($brdTopRhs);
        }

        if (!position.window._IS_POPOUT && !opts.isPopout) {
            const $btnPopout = $(`<span class="hwin__top-border-icon glyphicon glyphicon-new-window hvr__popout" title="Open as Popup Window"></span>`).on("click", evt=>{
                evt.stopPropagation();
                return Renderer.hover._getShowWindow_pDoPopout({
                    $hov,
                    position,
                    mouseUpId,
                    mouseMoveId,
                    resizeId,
                    hoverId,
                    opts,
                    hoverWindow,
                    $content
                }, {
                    evt
                });
            }
            ).appendTo($brdTopRhs);
        }

        if (opts.sourceData) {
            const btnPopout = e_({
                tag: "span",
                clazz: `hwin__top-border-icon hwin__top-border-icon--text`,
                title: "Show Source Data",
                text: "{}",
                click: evt=>{
                    evt.stopPropagation();
                    evt.preventDefault();

                    const $content = Renderer.hover.$getHoverContent_statsCode(opts.sourceData);
                    Renderer.hover.getShowWindow($content, Renderer.hover.getWindowPositionFromEvent(evt), {
                        title: [opts.sourceData._displayName || opts.sourceData.name, "Source Data"].filter(Boolean).join(" \u2014 "),
                        isPermanent: true,
                        isBookContent: true,
                    }, );
                }
                ,
            });
            $brdTopRhs.append(btnPopout);
        }

        const $btnClose = $(`<span class="hwin__top-border-icon glyphicon glyphicon-remove" title="Close (CTRL to Close All)"></span>`).on("click", (evt)=>{
            evt.stopPropagation();

            if (EventUtil.isCtrlMetaKey(evt)) {
                Renderer.hover._doCloseAllWindows();
                return;
            }

            Renderer.hover._getShowWindow_doClose({
                $hov,
                position,
                mouseUpId,
                mouseMoveId,
                resizeId,
                hoverId,
                opts,
                hoverWindow
            });
        }
        ).appendTo($brdTopRhs);

        $wrpContent.append($content);

        $hov.append($brdrTopResize).append($brdrTopRightResize).append($brdrRightResize).append($brdrBottomRightResize).append($brdrBtmLeftResize).append($brdrLeftResize).append($brdrTopLeftResize)
        .append($brdrTop).append($wrpContent).append($brdrBtm);

        $body.append($hov);

        Renderer.hover._getShowWindow_setPosition({
            $hov,
            $wrpContent,
            position
        }, position);

        hoverWindow.$windowTitle = $hovTitle;
        hoverWindow.zIndex = initialZIndex;
        hoverWindow.setZIndex = Renderer.hover._getNextZIndex.bind(this, {
            $hov,
            hoverWindow
        });

        hoverWindow.setPosition = Renderer.hover._getShowWindow_setPosition.bind(this, {
            $hov,
            $wrpContent,
            position
        });
        hoverWindow.setIsPermanent = Renderer.hover._getShowWindow_setIsPermanent.bind(this, {
            opts,
            $brdrTop
        });
        hoverWindow.doClose = Renderer.hover._getShowWindow_doClose.bind(this, {
            $hov,
            position,
            mouseUpId,
            mouseMoveId,
            resizeId,
            hoverId,
            opts,
            hoverWindow
        });
        hoverWindow.doMaximize = Renderer.hover._getShowWindow_doMaximize.bind(this, {
            $brdrTop,
            $hov
        });
        hoverWindow.doZIndexToFront = Renderer.hover._getShowWindow_doZIndexToFront.bind(this, {
            $hov,
            hoverWindow,
            hoverId
        });

        if (opts.isPopout)
            Renderer.hover._getShowWindow_pDoPopout({
                $hov,
                position,
                mouseUpId,
                mouseMoveId,
                resizeId,
                hoverId,
                opts,
                hoverWindow,
                $content
            });

        return hoverWindow;
    },

    _getShowWindow_doClose({$hov, position, mouseUpId, mouseMoveId, resizeId, hoverId, opts, hoverWindow}) {
        $hov.remove();
        $(position.window.document).off(mouseUpId);
        $(position.window.document).off(mouseMoveId);
        $(position.window).off(resizeId);

        delete Renderer.hover._WINDOW_METAS[hoverId];

        if (opts.cbClose)
            opts.cbClose(hoverWindow);
    },

    _getShowWindow_handleDragMousedown({hoverWindow, hoverId, $hov, drag, $wrpContent}, {evt, type}) {
        if (evt.which === 0 || evt.which === 1)
            evt.preventDefault();
        hoverWindow.zIndex = Renderer.hover._getNextZIndex(hoverId);
        $hov.css({
            "z-index": hoverWindow.zIndex,
            "animation": "initial",
        });
        drag.type = type;
        drag.startX = EventUtil.getClientX(evt);
        drag.startY = EventUtil.getClientY(evt);
        drag.baseTop = parseFloat($hov.css("top"));
        drag.baseLeft = parseFloat($hov.css("left"));
        drag.baseHeight = $wrpContent.height();
        drag.baseWidth = parseFloat($hov.css("width"));
        if (type < 9) {
            $wrpContent.css({
                "height": drag.baseHeight,
                "max-height": "initial",
            });
            $hov.css("max-width", "initial");
        }
    },

    _getShowWindow_isOverHoverTarget({evt, target}) {
        return EventUtil.getClientX(evt) >= target.left && EventUtil.getClientX(evt) <= target.left + target.width && EventUtil.getClientY(evt) >= target.top && EventUtil.getClientY(evt) <= target.top + target.height;
    },

    _getShowWindow_handleNorthDrag({$wrpContent, $hov, drag, evt}) {
        const diffY = Math.max(drag.startY - EventUtil.getClientY(evt), 80 - drag.baseHeight);
        $wrpContent.css("height", drag.baseHeight + diffY);
        $hov.css("top", drag.baseTop - diffY);
        drag.startY = EventUtil.getClientY(evt);
        drag.baseHeight = $wrpContent.height();
        drag.baseTop = parseFloat($hov.css("top"));
    },

    _getShowWindow_handleEastDrag({$wrpContent, $hov, drag, evt}) {
        const diffX = drag.startX - EventUtil.getClientX(evt);
        $hov.css("width", drag.baseWidth - diffX);
        drag.startX = EventUtil.getClientX(evt);
        drag.baseWidth = parseFloat($hov.css("width"));
    },

    _getShowWindow_handleSouthDrag({$wrpContent, $hov, drag, evt}) {
        const diffY = drag.startY - EventUtil.getClientY(evt);
        $wrpContent.css("height", drag.baseHeight - diffY);
        drag.startY = EventUtil.getClientY(evt);
        drag.baseHeight = $wrpContent.height();
    },

    _getShowWindow_handleWestDrag({$wrpContent, $hov, drag, evt}) {
        const diffX = Math.max(drag.startX - EventUtil.getClientX(evt), 150 - drag.baseWidth);
        $hov.css("width", drag.baseWidth + diffX).css("left", drag.baseLeft - diffX);
        drag.startX = EventUtil.getClientX(evt);
        drag.baseWidth = parseFloat($hov.css("width"));
        drag.baseLeft = parseFloat($hov.css("left"));
    },

    _getShowWindow_doToggleMinimizedMaximized({$brdrTop, $hov}) {
        const curState = $brdrTop.attr("data-display-title");
        const isNextMinified = curState === "false";
        $brdrTop.attr("data-display-title", isNextMinified);
        $brdrTop.attr("data-perm", true);
        $hov.toggleClass("hwin--minified", isNextMinified);
    },

    _getShowWindow_doMaximize({$brdrTop, $hov}) {
        $brdrTop.attr("data-display-title", false);
        $hov.toggleClass("hwin--minified", false);
    },

    async _getShowWindow_pDoPopout({$hov, position, mouseUpId, mouseMoveId, resizeId, hoverId, opts, hoverWindow, $content}, {evt}={}) {
        const dimensions = opts.fnGetPopoutSize ? opts.fnGetPopoutSize() : {
            width: 600,
            height: $content.height()
        };
        const win = window.open("", opts.title || "", `width=${dimensions.width},height=${dimensions.height}location=0,menubar=0,status=0,titlebar=0,toolbar=0`, );

        if (!win._IS_POPOUT) {
            win._IS_POPOUT = true;
            win.document.write(`
				<!DOCTYPE html>
				<html lang="en" class="ve-popwindow ${typeof styleSwitcher !== "undefined" ? styleSwitcher.getDayNightClassNames() : ""}"><head>
					<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
					<title>${opts.title}</title>
					${$(`link[rel="stylesheet"][href]`).map((i,e)=>e.outerHTML).get().join("\n")}
					<!-- Favicons -->
					<link rel="icon" type="image/svg+xml" href="favicon.svg">
					<link rel="icon" type="image/png" sizes="256x256" href="favicon-256x256.png">
					<link rel="icon" type="image/png" sizes="144x144" href="favicon-144x144.png">
					<link rel="icon" type="image/png" sizes="128x128" href="favicon-128x128.png">
					<link rel="icon" type="image/png" sizes="64x64" href="favicon-64x64.png">
					<link rel="icon" type="image/png" sizes="48x48" href="favicon-48x48.png">
					<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
					<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">

					<!-- Chrome Web App Icons -->
					<link rel="manifest" href="manifest.webmanifest">
					<meta name="application-name" content="5etools">
					<meta name="theme-color" content="#006bc4">

					<!-- Windows Start Menu tiles -->
					<meta name="msapplication-config" content="browserconfig.xml"/>
					<meta name="msapplication-TileColor" content="#006bc4">

					<!-- Apple Touch Icons -->
					<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon-180x180.png">
					<link rel="apple-touch-icon" sizes="360x360" href="apple-touch-icon-360x360.png">
					<link rel="apple-touch-icon" sizes="167x167" href="apple-touch-icon-167x167.png">
					<link rel="apple-touch-icon" sizes="152x152" href="apple-touch-icon-152x152.png">
					<link rel="apple-touch-icon" sizes="120x120" href="apple-touch-icon-120x120.png">
					<meta name="apple-mobile-web-app-title" content="5etools">

					<!-- macOS Safari Pinned Tab and Touch Bar -->
					<link rel="mask-icon" href="safari-pinned-tab.svg" color="#006bc4">

					<style>
						html, body { width: 100%; height: 100%; }
						body { overflow-y: scroll; }
						.hwin--popout { max-width: 100%; max-height: 100%; box-shadow: initial; width: 100%; overflow-y: auto; }
					</style>
				</head><body class="rd__body-popout">
				<div class="hwin hoverbox--popout hwin--popout"></div>
				<script type="text/javascript" src="js/parser.js"></script>
				<script type="text/javascript" src="js/utils.js"></script>
				<script type="text/javascript" src="lib/jquery.js"></script>
				</body></html>
			`);

            win.Renderer = Renderer;

            let ticks = 50;
            while (!win.document.body && ticks-- > 0)
                await MiscUtil.pDelay(5);

            win.$wrpHoverContent = $(win.document).find(`.hoverbox--popout`);
        }

        let $cpyContent;
        if (opts.$pFnGetPopoutContent) {
            $cpyContent = await opts.$pFnGetPopoutContent();
        } else {
            $cpyContent = $content.clone(true, true);
        }

        $cpyContent.appendTo(win.$wrpHoverContent.empty());

        Renderer.hover._getShowWindow_doClose({
            $hov,
            position,
            mouseUpId,
            mouseMoveId,
            resizeId,
            hoverId,
            opts,
            hoverWindow
        });
    },

    _getShowWindow_setPosition({$hov, $wrpContent, position}, positionNxt) {
        switch (positionNxt.mode) {
        case "autoFromElement":
            {
                const bcr = $hov[0].getBoundingClientRect();

                if (positionNxt.isFromBottom)
                    $hov.css("top", positionNxt.bcr.top - (bcr.height + 10));
                else
                    $hov.css("top", positionNxt.bcr.top + positionNxt.bcr.height + 10);

                if (positionNxt.isFromRight)
                    $hov.css("left", (positionNxt.clientX || positionNxt.bcr.left) - (bcr.width + 10));
                else
                    $hov.css("left", (positionNxt.clientX || (positionNxt.bcr.left + positionNxt.bcr.width)) + 10);

                if (position !== positionNxt) {
                    Renderer.hover._WINDOW_POSITION_PROPS_FROM_EVENT.forEach(prop=>{
                        position[prop] = positionNxt[prop];
                    }
                    );
                }

                break;
            }
        case "exact":
            {
                $hov.css({
                    "left": positionNxt.x,
                    "top": positionNxt.y,
                });
                break;
            }
        case "exactVisibleBottom":
            {
                $hov.css({
                    "left": positionNxt.x,
                    "top": positionNxt.y,
                    "animation": "initial",
                });

                let yPos = positionNxt.y;

                const {bottom: posBottom, height: winHeight} = $hov[0].getBoundingClientRect();
                const height = position.window.innerHeight;
                if (posBottom > height) {
                    yPos = position.window.innerHeight - winHeight;
                    $hov.css({
                        "top": yPos,
                        "animation": "",
                    });
                }

                break;
            }
        default:
            throw new Error(`Positiong mode unimplemented: "${positionNxt.mode}"`);
        }

        Renderer.hover._getShowWindow_adjustPosition({
            $hov,
            $wrpContent,
            position
        });
    },

    _getShowWindow_adjustPosition({$hov, $wrpContent, position}) {
        const eleHov = $hov[0];
        const wrpContent = $wrpContent[0];

        const bcr = eleHov.getBoundingClientRect().toJSON();
        const screenHeight = position.window.innerHeight;
        const screenWidth = position.window.innerWidth;

        if (bcr.top < 0) {
            bcr.top = 0;
            bcr.bottom = bcr.top + bcr.height;
            eleHov.style.top = `${bcr.top}px`;
        } else if (bcr.top >= screenHeight - Renderer.hover._BAR_HEIGHT) {
            bcr.top = screenHeight - Renderer.hover._BAR_HEIGHT;
            bcr.bottom = bcr.top + bcr.height;
            eleHov.style.top = `${bcr.top}px`;
        }

        if (bcr.left < 0) {
            bcr.left = 0;
            bcr.right = bcr.left + bcr.width;
            eleHov.style.left = `${bcr.left}px`;
        } else if (bcr.left + bcr.width + Renderer.hover._BODY_SCROLLER_WIDTH_PX > screenWidth) {
            bcr.left = Math.max(screenWidth - bcr.width - Renderer.hover._BODY_SCROLLER_WIDTH_PX, 0);
            bcr.right = bcr.left + bcr.width;
            eleHov.style.left = `${bcr.left}px`;
        }

        if (position.isPreventFlicker && Renderer.hover._isIntersectRect(bcr, position.bcr)) {
            if (position.isFromBottom) {
                bcr.height = position.bcr.top - 5;
                wrpContent.style.height = `${bcr.height}px`;
            } else {
                bcr.height = screenHeight - position.bcr.bottom - 5;
                wrpContent.style.height = `${bcr.height}px`;
            }
        }
    },

    _getShowWindow_setIsPermanent({opts, $brdrTop}, isPermanent) {
        opts.isPermanent = isPermanent;
        $brdrTop.attr("data-perm", isPermanent);
    },

    _getShowWindow_setZIndex({$hov, hoverWindow}, zIndex) {
        $hov.css("z-index", zIndex);
        hoverWindow.zIndex = zIndex;
    },

    _getShowWindow_doZIndexToFront({$hov, hoverWindow, hoverId}) {
        const nxtZIndex = Renderer.hover._getNextZIndex(hoverId);
        Renderer.hover._getNextZIndex({
            $hov,
            hoverWindow
        }, nxtZIndex);
    },

    getMakePredefinedHover(entry, opts) {
        opts = opts || {};

        const id = opts.id ?? Renderer.hover._getNextId();
        Renderer.hover._entryCache[id] = entry;
        return {
            id,
            html: `onmouseover="Renderer.hover.handlePredefinedMouseOver(event, this, ${id}, ${JSON.stringify(opts).escapeQuotes()})" onmousemove="Renderer.hover.handlePredefinedMouseMove(event, this)" onmouseleave="Renderer.hover.handlePredefinedMouseLeave(event, this)" ${Renderer.hover.getPreventTouchString()}`,
            mouseOver: (evt,ele)=>Renderer.hover.handlePredefinedMouseOver(evt, ele, id, opts),
            mouseMove: (evt,ele)=>Renderer.hover.handlePredefinedMouseMove(evt, ele),
            mouseLeave: (evt,ele)=>Renderer.hover.handlePredefinedMouseLeave(evt, ele),
            touchStart: (evt,ele)=>Renderer.hover.handleTouchStart(evt, ele),
            show: ()=>Renderer.hover.doPredefinedShow(id, opts),
        };
    },

    updatePredefinedHover(id, entry) {
        Renderer.hover._entryCache[id] = entry;
    },

    getInlineHover(entry, opts) {
        return {
            html: `onmouseover="Renderer.hover.handleInlineMouseOver(event, this)" onmouseleave="Renderer.hover.handleLinkMouseLeave(event, this)" onmousemove="Renderer.hover.handleLinkMouseMove(event, this)" data-vet-entry="${JSON.stringify(entry).qq()}" ${opts ? `data-vet-opts="${JSON.stringify(opts).qq()}"` : ""} ${Renderer.hover.getPreventTouchString()}`,
        };
    },

    getPreventTouchString() {
        return `ontouchstart="Renderer.hover.handleTouchStart(event, this)"`;
    },

    handleTouchStart(evt, ele) {
        if (!Renderer.hover.isSmallScreen(evt)) {
            $(ele).data("href", $(ele).data("href") || $(ele).attr("href"));
            $(ele).attr("href", "javascript:void(0)");
            setTimeout(()=>{
                const data = $(ele).data("href");
                if (data) {
                    $(ele).attr("href", data);
                    $(ele).data("href", null);
                }
            }
            , 100);
        }
    },

    getEntityLink(ent, {displayText=null, prop=null, isLowerCase=false, isTitleCase=false, }={}, ) {
        if (isLowerCase && isTitleCase)
            throw new Error(`"isLowerCase" and "isTitleCase" are mutually exclusive!`);

        const name = isLowerCase ? ent.name.toLowerCase() : isTitleCase ? ent.name.toTitleCase() : ent.name;

        let parts = [name, ent.source, displayText || "", ];

        switch (prop || ent.__prop) {
        case "monster":
            {
                if (ent._isScaledCr) {
                    parts.push(`${VeCt.HASH_SCALED}=${Parser.numberToCr(ent._scaledCr)}`);
                }

                if (ent._isScaledSpellSummon) {
                    parts.push(`${VeCt.HASH_SCALED_SPELL_SUMMON}=${ent._scaledSpellSummonLevel}`);
                }

                if (ent._isScaledClassSummon) {
                    parts.push(`${VeCt.HASH_SCALED_CLASS_SUMMON}=${ent._scaledClassSummonLevel}`);
                }

                break;
            }

        case "deity":
            {
                parts.splice(1, 0, ent.pantheon);
                break;
            }
        }

        while (parts.length && !parts.last()?.length)
            parts.pop();

        return Renderer.get().render(`{@${Parser.getPropTag(prop || ent.__prop)} ${parts.join("|")}}`);
    },

    getRefMetaFromTag(str) {
        str = str.slice(2, -1);
        const [tag,...refParts] = str.split(" ");
        const ref = refParts.join(" ");
        const type = `ref${tag.uppercaseFirst()}`;
        return {
            type,
            [tag]: ref
        };
    },

    async pApplyCustomHashId(page, ent, customHashId) {
        switch (page) {
        case UrlUtil.PG_BESTIARY:
            {
                const out = await Renderer.monster.pGetModifiedCreature(ent, customHashId);
                Renderer.monster.updateParsed(out);
                return out;
            }

        case UrlUtil.PG_RECIPES:
            return Renderer.recipe.pGetModifiedRecipe(ent, customHashId);

        default:
            return ent;
        }
    },

    getGenericCompactRenderedString(entry, depth=0) {
        return `
			<tr class="text homebrew-hover"><td colspan="6">
			${Renderer.get().setFirstSection(true).render(entry, depth)}
			</td></tr>
		`;
    },

    getFnRenderCompact(page, {isStatic=false}={}) {
        switch (page) {
        case "generic":
        case "hover":
            return Renderer.hover.getGenericCompactRenderedString;
        case UrlUtil.PG_QUICKREF:
            return Renderer.hover.getGenericCompactRenderedString;
        case UrlUtil.PG_CLASSES:
            return Renderer.class.getCompactRenderedString;
        case UrlUtil.PG_SPELLS:
            return Renderer.spell.getCompactRenderedString;
        case UrlUtil.PG_ITEMS:
            return Renderer.item.getCompactRenderedString;
        case UrlUtil.PG_BESTIARY:
            return it=>Renderer.monster.getCompactRenderedString(it, {
                isShowScalers: !isStatic,
                isScaledCr: it._originalCr != null,
                isScaledSpellSummon: it._isScaledSpellSummon,
                isScaledClassSummon: it._isScaledClassSummon
            });
        case UrlUtil.PG_CONDITIONS_DISEASES:
            return Renderer.condition.getCompactRenderedString;
        case UrlUtil.PG_BACKGROUNDS:
            return Renderer.background.getCompactRenderedString;
        case UrlUtil.PG_FEATS:
            return Renderer.feat.getCompactRenderedString;
        case UrlUtil.PG_OPT_FEATURES:
            return Renderer.optionalfeature.getCompactRenderedString;
        case UrlUtil.PG_PSIONICS:
            return Renderer.psionic.getCompactRenderedString;
        case UrlUtil.PG_REWARDS:
            return Renderer.reward.getCompactRenderedString;
        case UrlUtil.PG_RACES:
            return it=>Renderer.race.getCompactRenderedString(it, {
                isStatic
            });
        case UrlUtil.PG_DEITIES:
            return Renderer.deity.getCompactRenderedString;
        case UrlUtil.PG_OBJECTS:
            return Renderer.object.getCompactRenderedString;
        case UrlUtil.PG_TRAPS_HAZARDS:
            return Renderer.traphazard.getCompactRenderedString;
        case UrlUtil.PG_VARIANTRULES:
            return Renderer.variantrule.getCompactRenderedString;
        case UrlUtil.PG_CULTS_BOONS:
            return Renderer.cultboon.getCompactRenderedString;
        case UrlUtil.PG_TABLES:
            return Renderer.table.getCompactRenderedString;
        case UrlUtil.PG_VEHICLES:
            return Renderer.vehicle.getCompactRenderedString;
        case UrlUtil.PG_ACTIONS:
            return Renderer.action.getCompactRenderedString;
        case UrlUtil.PG_LANGUAGES:
            return Renderer.language.getCompactRenderedString;
        case UrlUtil.PG_CHAR_CREATION_OPTIONS:
            return Renderer.charoption.getCompactRenderedString;
        case UrlUtil.PG_RECIPES:
            return Renderer.recipe.getCompactRenderedString;
        case UrlUtil.PG_CLASS_SUBCLASS_FEATURES:
            return Renderer.hover.getGenericCompactRenderedString;
        case UrlUtil.PG_CREATURE_FEATURES:
            return Renderer.hover.getGenericCompactRenderedString;
        case UrlUtil.PG_DECKS:
            return Renderer.deck.getCompactRenderedString;
        case "classfeature":
        case "classFeature":
            return Renderer.hover.getGenericCompactRenderedString;
        case "subclassfeature":
        case "subclassFeature":
            return Renderer.hover.getGenericCompactRenderedString;
        case "citation":
            return Renderer.hover.getGenericCompactRenderedString;
        default:
            if (Renderer[page]?.getCompactRenderedString)
                return Renderer[page].getCompactRenderedString;
            return null;
        }
    },

    getFnBindListenersCompact(page) {
        switch (page) {
        case UrlUtil.PG_BESTIARY:
            return Renderer.monster.bindListenersCompact;
        case UrlUtil.PG_RACES:
            return Renderer.race.bindListenersCompact;
        default:
            return null;
        }
    },

    _pageToFluffFn(page) {
        switch (page) {
        case UrlUtil.PG_BESTIARY:
            return Renderer.monster.pGetFluff;
        case UrlUtil.PG_ITEMS:
            return Renderer.item.pGetFluff;
        case UrlUtil.PG_CONDITIONS_DISEASES:
            return Renderer.condition.pGetFluff;
        case UrlUtil.PG_SPELLS:
            return Renderer.spell.pGetFluff;
        case UrlUtil.PG_RACES:
            return Renderer.race.pGetFluff;
        case UrlUtil.PG_BACKGROUNDS:
            return Renderer.background.pGetFluff;
        case UrlUtil.PG_FEATS:
            return Renderer.feat.pGetFluff;
        case UrlUtil.PG_LANGUAGES:
            return Renderer.language.pGetFluff;
        case UrlUtil.PG_VEHICLES:
            return Renderer.vehicle.pGetFluff;
        case UrlUtil.PG_CHAR_CREATION_OPTIONS:
            return Renderer.charoption.pGetFluff;
        case UrlUtil.PG_RECIPES:
            return Renderer.recipe.pGetFluff;
        default:
            return null;
        }
    },

    isSmallScreen(evt) {
        if (typeof window === "undefined")
            return false;

        evt = evt || {};
        const win = (evt.view || {}).window || window;
        return win.innerWidth <= 768;
    },

    $getHoverContent_stats(page, toRender, opts, renderFnOpts) {
        opts = opts || {};
        if (page === UrlUtil.PG_RECIPES)
            opts = {
                ...MiscUtil.copyFast(opts),
                isBookContent: true
            };

        const fnRender = opts.fnRender || Renderer.hover.getFnRenderCompact(page, {
            isStatic: opts.isStatic
        });
        const $out = $`<table class="w-100 stats ${opts.isBookContent ? `stats--book` : ""}">${fnRender(toRender, renderFnOpts)}</table>`;

        if (!opts.isStatic) {
            const fnBind = Renderer.hover.getFnBindListenersCompact(page);
            if (fnBind)
                fnBind(toRender, $out[0]);
        }

        return $out;
    },

    $getHoverContent_fluff(page, toRender, opts, renderFnOpts) {
        opts = opts || {};
        if (page === UrlUtil.PG_RECIPES)
            opts = {
                ...MiscUtil.copyFast(opts),
                isBookContent: true
            };

        if (!toRender) {
            return $`<table class="w-100 stats ${opts.isBookContent ? `stats--book` : ""}"><tr class="text"><td colspan="6" class="p-2 ve-text-center">${Renderer.utils.HTML_NO_INFO}</td></tr></table>`;
        }

        toRender = MiscUtil.copyFast(toRender);

        if (toRender.images && toRender.images.length) {
            const cachedImages = MiscUtil.copyFast(toRender.images);
            delete toRender.images;

            toRender.entries = toRender.entries || [];
            const hasText = toRender.entries.length > 0;
            if (hasText)
                toRender.entries.unshift({
                    type: "hr"
                });
            cachedImages[0].maxHeight = 33;
            cachedImages[0].maxHeightUnits = "vh";
            toRender.entries.unshift(cachedImages[0]);

            if (cachedImages.length > 1) {
                if (hasText)
                    toRender.entries.push({
                        type: "hr"
                    });
                toRender.entries.push(...cachedImages.slice(1));
            }
        }

        return $`<table class="w-100 stats ${opts.isBookContent ? `stats--book` : ""}">${Renderer.generic.getCompactRenderedString(toRender, renderFnOpts)}</table>`;
    },

    $getHoverContent_statsCode(toRender, {isSkipClean=false, title=null}={}) {
        const cleanCopy = isSkipClean ? toRender : DataUtil.cleanJson(MiscUtil.copyFast(toRender));
        return Renderer.hover.$getHoverContent_miscCode(title || [cleanCopy.name, "Source Data"].filter(Boolean).join(" \u2014 "), JSON.stringify(cleanCopy, null, "\t"), );
    },

    $getHoverContent_miscCode(name, code) {
        const toRenderCode = {
            type: "code",
            name,
            preformatted: code,
        };
        return $`<table class="w-100 stats stats--book">${Renderer.get().render(toRenderCode)}</table>`;
    },

    $getHoverContent_generic(toRender, opts) {
        opts = opts || {};

        return $(`<table class="w-100 stats ${opts.isBookContent || opts.isLargeBookContent ? "stats--book" : ""} ${opts.isLargeBookContent ?
             "stats--book-large" : ""}">${Renderer.hover.getGenericCompactRenderedString(toRender, opts.depth || 0)}</table>`);
    },

    doPopoutCurPage(evt, entity) {
        const page = UrlUtil.getCurrentPage();
        const $content = Renderer.hover.$getHoverContent_stats(page, entity);
        Renderer.hover.getShowWindow($content, Renderer.hover.getWindowPositionFromEvent(evt), {
            pageUrl: `#${UrlUtil.autoEncodeHash(entity)}`,
            title: entity._displayName || entity.name,
            isPermanent: true,
            isBookContent: page === UrlUtil.PG_RECIPES,
            sourceData: entity,
        }, );
    },
};
Renderer.get = ()=>{
    if (!Renderer.defaultRenderer)
        Renderer.defaultRenderer = new Renderer();
    return Renderer.defaultRenderer;
}
;
Renderer.tag = class {
    static _TagBase = class {
        tagName;
        defaultSource = null;
        page = null;

        get tag() {
            return `@${this.tagName}`;
        }

        getStripped(tag, text) {
            text = text.replace(/<\$([^$]+)\$>/gi, "");
            return this._getStripped(tag, text);
        }

        _getStripped(tag, text) {
            throw new Error("Unimplemented!");
        }

        getMeta(tag, text) {
            return this._getMeta(tag, text);
        }
        _getMeta(tag, text) {
            throw new Error("Unimplemented!");
        }
    }
    ;

    static _TagBaseAt = class extends this._TagBase {
        get tag() {
            return `@${this.tagName}`;
        }
    }
    ;

    static _TagBaseHash = class extends this._TagBase {
        get tag() {
            return `#${this.tagName}`;
        }
    }
    ;

    static _TagTextStyle = class extends this._TagBaseAt {
        _getStripped(tag, text) {
            return text;
        }
    }
    ;

    static TagBoldShort = class extends this._TagTextStyle {
        tagName = "b";
    }
    ;

    static TagBoldLong = class extends this._TagTextStyle {
        tagName = "bold";
    }
    ;

    static TagItalicShort = class extends this._TagTextStyle {
        tagName = "i";
    }
    ;

    static TagItalicLong = class extends this._TagTextStyle {
        tagName = "italic";
    }
    ;

    static TagStrikethroughShort = class extends this._TagTextStyle {
        tagName = "s";
    }
    ;

    static TagStrikethroughLong = class extends this._TagTextStyle {
        tagName = "strike";
    }
    ;

    static TagUnderlineShort = class extends this._TagTextStyle {
        tagName = "u";
    }
    ;

    static TagUnderlineLong = class extends this._TagTextStyle {
        tagName = "underline";
    }
    ;

    static TagSup = class extends this._TagTextStyle {
        tagName = "sup";
    }
    ;

    static TagSub = class extends this._TagTextStyle {
        tagName = "sub";
    }
    ;

    static TagKbd = class extends this._TagTextStyle {
        tagName = "kbd";
    }
    ;

    static TagCode = class extends this._TagTextStyle {
        tagName = "code";
    }
    ;

    static TagStyle = class extends this._TagTextStyle {
        tagName = "style";
    }
    ;

    static TagFont = class extends this._TagTextStyle {
        tagName = "font";
    }
    ;

    static TagComic = class extends this._TagTextStyle {
        tagName = "comic";
    }
    ;

    static TagComicH1 = class extends this._TagTextStyle {
        tagName = "comicH1";
    }
    ;

    static TagComicH2 = class extends this._TagTextStyle {
        tagName = "comicH2";
    }
    ;

    static TagComicH3 = class extends this._TagTextStyle {
        tagName = "comicH3";
    }
    ;

    static TagComicH4 = class extends this._TagTextStyle {
        tagName = "comicH4";
    }
    ;

    static TagComicNote = class extends this._TagTextStyle {
        tagName = "comicNote";
    }
    ;

    static TagNote = class extends this._TagTextStyle {
        tagName = "note";
    }
    ;

    static TagTip = class extends this._TagTextStyle {
        tagName = "tip";
    }
    ;

    static TagUnit = class extends this._TagBaseAt {
        tagName = "unit";

        _getStripped(tag, text) {
            const [amount,unitSingle,unitPlural] = Renderer.splitTagByPipe(text);
            return isNaN(amount) ? unitSingle : Number(amount) > 1 ? (unitPlural || unitSingle.toPlural()) : unitSingle;
        }
    }
    ;

    static TagHit = class extends this._TagBaseAt {
        tagName = "h";

        _getStripped(tag, text) {
            return "Hit: ";
        }
    }
    ;

    static TagMiss = class extends this._TagBaseAt {
        tagName = "m";

        _getStripped(tag, text) {
            return "Miss: ";
        }
    }
    ;

    static TagAtk = class extends this._TagBaseAt {
        tagName = "atk";

        _getStripped(tag, text) {
            return Renderer.attackTagToFull(text);
        }
    }
    ;

    static TagHitYourSpellAttack = class extends this._TagBaseAt {
        tagName = "hitYourSpellAttack";

        _getStripped(tag, text) {
            const [displayText] = Renderer.splitTagByPipe(text);
            return displayText || "your spell attack modifier";
        }
    }
    ;

    static TagDc = class extends this._TagBaseAt {
        tagName = "dc";

        _getStripped(tag, text) {
            const [dcText,displayText] = Renderer.splitTagByPipe(text);
            return `DC ${displayText || dcText}`;
        }
    }
    ;

    static TagDcYourSpellSave = class extends this._TagBaseAt {
        tagName = "dcYourSpellSave";

        _getStripped(tag, text) {
            const [displayText] = Renderer.splitTagByPipe(text);
            return displayText || "your spell save DC";
        }
    }
    ;

    static _TagDiceFlavor = class extends this._TagBaseAt {
        _getStripped(tag, text) {
            const [rollText,displayText] = Renderer.splitTagByPipe(text);
            switch (tag) {
            case "@damage":
            case "@dice":
            case "@autodice":
                {
                    return displayText || rollText.replace(/;/g, "/");
                }
            case "@d20":
            case "@hit":
                {
                    return displayText || (()=>{
                        const n = Number(rollText);
                        if (!isNaN(n))
                            return `${n >= 0 ? "+" : ""}${n}`;
                        return rollText;
                    }
                    )();
                }
            case "@recharge":
                {
                    const asNum = Number(rollText || 6);
                    if (isNaN(asNum)) {
                        throw new Error(`Could not parse "${rollText}" as a number!`);
                    }
                    return `(Recharge ${asNum}${asNum < 6 ? `\u20136` : ""})`;
                }
            case "@chance":
                {
                    return displayText || `${rollText} percent`;
                }
            case "@ability":
                {
                    const [,rawScore] = rollText.split(" ").map(it=>it.trim().toLowerCase()).filter(Boolean);
                    const score = Number(rawScore) || 0;
                    return displayText || `${score} (${Parser.getAbilityModifier(score)})`;
                }
            case "@savingThrow":
            case "@skillCheck":
                {
                    return displayText || rollText;
                }
            }
            throw new Error(`Unhandled tag: ${tag}`);
        }
    }
    ;

    static TaChance = class extends this._TagDiceFlavor {
        tagName = "chance";
    }
    ;

    static TaD20 = class extends this._TagDiceFlavor {
        tagName = "d20";
    }
    ;

    static TaDamage = class extends this._TagDiceFlavor {
        tagName = "damage";
    }
    ;

    static TaDice = class extends this._TagDiceFlavor {
        tagName = "dice";
    }
    ;

    static TaAutodice = class extends this._TagDiceFlavor {
        tagName = "autodice";
    }
    ;

    static TaHit = class extends this._TagDiceFlavor {
        tagName = "hit";
    }
    ;

    static TaRecharge = class extends this._TagDiceFlavor {
        tagName = "recharge";
    }
    ;

    static TaAbility = class extends this._TagDiceFlavor {
        tagName = "ability";
    }
    ;

    static TaSavingThrow = class extends this._TagDiceFlavor {
        tagName = "savingThrow";
    }
    ;

    static TaSkillCheck = class extends this._TagDiceFlavor {
        tagName = "skillCheck";
    }
    ;

    static _TagDiceFlavorScaling = class extends this._TagBaseAt {
        _getStripped(tag, text) {
            const [,,addPerProgress,,displayText] = Renderer.splitTagByPipe(text);
            return displayText || addPerProgress;
        }
    }
    ;

    static TagScaledice = class extends this._TagDiceFlavorScaling {
        tagName = "scaledice";
    }
    ;

    static TagScaledamage = class extends this._TagDiceFlavorScaling {
        tagName = "scaledamage";
    }
    ;

    static TagCoinflip = class extends this._TagBaseAt {
        tagName = "coinflip";

        _getStripped(tag, text) {
            const [displayText] = Renderer.splitTagByPipe(text);
            return displayText || "flip a coin";
        }
    }
    ;

    static _TagPipedNoDisplayText = class extends this._TagBaseAt {
        _getStripped(tag, text) {
            const parts = Renderer.splitTagByPipe(text);
            return parts[0];
        }
    }
    ;

    static Tag5etools = class extends this._TagPipedNoDisplayText {
        tagName = "5etools";
    }
    ;

    static TagAdventure = class extends this._TagPipedNoDisplayText {
        tagName = "adventure";
    }
    ;

    static TagBook = class extends this._TagPipedNoDisplayText {
        tagName = "book";
    }
    ;

    static TagFilter = class extends this._TagPipedNoDisplayText {
        tagName = "filter";
    }
    ;

    static TagFootnote = class extends this._TagPipedNoDisplayText {
        tagName = "footnote";
    }
    ;

    static TagLink = class extends this._TagPipedNoDisplayText {
        tagName = "link";
    }
    ;

    static TagLoader = class extends this._TagPipedNoDisplayText {
        tagName = "loader";
    }
    ;

    static TagColor = class extends this._TagPipedNoDisplayText {
        tagName = "color";
    }
    ;

    static TagHighlight = class extends this._TagPipedNoDisplayText {
        tagName = "highlight";
    }
    ;

    static TagHelp = class extends this._TagPipedNoDisplayText {
        tagName = "help";
    }
    ;

    static _TagPipedDisplayTextThird = class extends this._TagBaseAt {
        _getStripped(tag, text) {
            const parts = Renderer.splitTagByPipe(text);
            return parts.length >= 3 ? parts[2] : parts[0];
        }
    }
    ;

    static TagAction = class extends this._TagPipedDisplayTextThird {
        tagName = "action";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_ACTIONS;
    }
    ;

    static TagBackground = class extends this._TagPipedDisplayTextThird {
        tagName = "background";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_BACKGROUNDS;
    }
    ;

    static TagBoon = class extends this._TagPipedDisplayTextThird {
        tagName = "boon";
        defaultSource = Parser.SRC_MTF;
        page = UrlUtil.PG_CULTS_BOONS;
    }
    ;

    static TagCharoption = class extends this._TagPipedDisplayTextThird {
        tagName = "charoption";
        defaultSource = Parser.SRC_MOT;
        page = UrlUtil.PG_CHAR_CREATION_OPTIONS;
    }
    ;

    static TagClass = class extends this._TagPipedDisplayTextThird {
        tagName = "class";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_CLASSES;
    }
    ;

    static TagCondition = class extends this._TagPipedDisplayTextThird {
        tagName = "condition";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_CONDITIONS_DISEASES;
    }
    ;

    static TagCreature = class extends this._TagPipedDisplayTextThird {
        tagName = "creature";
        defaultSource = Parser.SRC_MM;
        page = UrlUtil.PG_BESTIARY;
    }
    ;

    static TagCult = class extends this._TagPipedDisplayTextThird {
        tagName = "cult";
        defaultSource = Parser.SRC_MTF;
        page = UrlUtil.PG_CULTS_BOONS;
    }
    ;

    static TagDeck = class extends this._TagPipedDisplayTextThird {
        tagName = "deck";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_DECKS;
    }
    ;

    static TagDisease = class extends this._TagPipedDisplayTextThird {
        tagName = "disease";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_CONDITIONS_DISEASES;
    }
    ;

    static TagFeat = class extends this._TagPipedDisplayTextThird {
        tagName = "feat";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_FEATS;
    }
    ;

    static TagHazard = class extends this._TagPipedDisplayTextThird {
        tagName = "hazard";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_TRAPS_HAZARDS;
    }
    ;

    static TagItem = class extends this._TagPipedDisplayTextThird {
        tagName = "item";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_ITEMS;
    }
    ;

    /* static TagItemMastery = class extends this._TagPipedDisplayTextThird {
        tagName = "itemMastery";
        defaultSource = VeCt.STR_GENERIC;
        page = "itemMastery";
    }
    ; */

    static TagLanguage = class extends this._TagPipedDisplayTextThird {
        tagName = "language";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_LANGUAGES;
    }
    ;

    static TagLegroup = class extends this._TagPipedDisplayTextThird {
        tagName = "legroup";
        defaultSource = Parser.SRC_MM;
        page = "legendaryGroup";
    }
    ;

    static TagObject = class extends this._TagPipedDisplayTextThird {
        tagName = "object";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_OBJECTS;
    }
    ;

    static TagOptfeature = class extends this._TagPipedDisplayTextThird {
        tagName = "optfeature";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_OPT_FEATURES;
    }
    ;

    static TagPsionic = class extends this._TagPipedDisplayTextThird {
        tagName = "psionic";
        defaultSource = Parser.SRC_UATMC;
        page = UrlUtil.PG_PSIONICS;
    }
    ;

    static TagRace = class extends this._TagPipedDisplayTextThird {
        tagName = "race";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_RACES;
    }
    ;

    static TagRecipe = class extends this._TagPipedDisplayTextThird {
        tagName = "recipe";
        defaultSource = Parser.SRC_HF;
        page = UrlUtil.PG_RECIPES;
    }
    ;

    static TagReward = class extends this._TagPipedDisplayTextThird {
        tagName = "reward";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_REWARDS;
    }
    ;

    static TagVehicle = class extends this._TagPipedDisplayTextThird {
        tagName = "vehicle";
        defaultSource = Parser.SRC_GoS;
        page = UrlUtil.PG_VEHICLES;
    }
    ;

    static TagVehupgrade = class extends this._TagPipedDisplayTextThird {
        tagName = "vehupgrade";
        defaultSource = Parser.SRC_GoS;
        page = UrlUtil.PG_VEHICLES;
    }
    ;

    static TagSense = class extends this._TagPipedDisplayTextThird {
        tagName = "sense";
        defaultSource = Parser.SRC_PHB;
        page = "sense";
    }
    ;

    static TagSkill = class extends this._TagPipedDisplayTextThird {
        tagName = "skill";
        defaultSource = Parser.SRC_PHB;
        page = "skill";
    }
    ;

    static TagSpell = class extends this._TagPipedDisplayTextThird {
        tagName = "spell";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_SPELLS;
    }
    ;

    static TagStatus = class extends this._TagPipedDisplayTextThird {
        tagName = "status";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_CONDITIONS_DISEASES;
    }
    ;

    static TagTable = class extends this._TagPipedDisplayTextThird {
        tagName = "table";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_TABLES;
    }
    ;

    static TagTrap = class extends this._TagPipedDisplayTextThird {
        tagName = "trap";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_TRAPS_HAZARDS;
    }
    ;

    static TagVariantrule = class extends this._TagPipedDisplayTextThird {
        tagName = "variantrule";
        defaultSource = Parser.SRC_DMG;
        page = UrlUtil.PG_VARIANTRULES;
    }
    ;

    static TagCite = class extends this._TagPipedDisplayTextThird {
        tagName = "cite";
        defaultSource = Parser.SRC_PHB;
        page = "citation";
    }
    ;

    static _TagPipedDisplayTextFourth = class extends this._TagBaseAt {
        _getStripped(tag, text) {
            const parts = Renderer.splitTagByPipe(text);
            return parts.length >= 4 ? parts[3] : parts[0];
        }
    }
    ;

    static TagCard = class extends this._TagPipedDisplayTextFourth {
        tagName = "card";
        defaultSource = Parser.SRC_DMG;
        page = "card";
    }
    ;

    static TagDeity = class extends this._TagPipedDisplayTextFourth {
        tagName = "deity";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_DEITIES;
    }
    ;

    static _TagPipedDisplayTextSixth = class extends this._TagBaseAt {
        _getStripped(tag, text) {
            const parts = Renderer.splitTagByPipe(text);
            return parts.length >= 6 ? parts[5] : parts[0];
        }
    }
    ;

    static TagClassFeature = class extends this._TagPipedDisplayTextSixth {
        tagName = "classFeature";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_CLASSES;
    }
    ;

    static _TagPipedDisplayTextEight = class extends this._TagBaseAt {
        _getStripped(tag, text) {
            const parts = Renderer.splitTagByPipe(text);
            return parts.length >= 8 ? parts[7] : parts[0];
        }
    }
    ;

    static TagSubclassFeature = class extends this._TagPipedDisplayTextEight {
        tagName = "subclassFeature";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_CLASSES;
    }
    ;

    static TagQuickref = class extends this._TagBaseAt {
        tagName = "quickref";
        defaultSource = Parser.SRC_PHB;
        page = UrlUtil.PG_QUICKREF;

        _getStripped(tag, text) {
            const {name, displayText} = DataUtil.quickreference.unpackUid(text);
            return displayText || name;
        }
    }
    ;

    static TagArea = class extends this._TagBaseAt {
        tagName = "area";

        _getStripped(tag, text) {
            const [compactText,,flags] = Renderer.splitTagByPipe(text);

            return flags && flags.includes("x") ? compactText : `${flags && flags.includes("u") ? "A" : "a"}rea ${compactText}`;
        }

        _getMeta(tag, text) {
            const [compactText,areaId,flags] = Renderer.splitTagByPipe(text);

            const displayText = flags && flags.includes("x") ? compactText : `${flags && flags.includes("u") ? "A" : "a"}rea ${compactText}`;

            return {
                areaId,
                displayText,
            };
        }
    }
    ;

    static TagHomebrew = class extends this._TagBaseAt {
        tagName = "homebrew";

        _getStripped(tag, text) {
            const [newText,oldText] = Renderer.splitTagByPipe(text);
            if (newText && oldText) {
                return `${newText} [this is a homebrew addition, replacing the following: "${oldText}"]`;
            } else if (newText) {
                return `${newText} [this is a homebrew addition]`;
            } else if (oldText) {
                return `[the following text has been removed due to homebrew: ${oldText}]`;
            } else
                throw new Error(`Homebrew tag had neither old nor new text!`);
        }
    }
    ;

    static TagItemEntry = class extends this._TagBaseHash {
        tagName = "itemEntry";
        defaultSource = Parser.SRC_DMG;
    }
    ;

    static TAGS = [new this.TagBoldShort(), new this.TagBoldLong(), new this.TagItalicShort(), new this.TagItalicLong(), new this.TagStrikethroughShort(), new this.TagStrikethroughLong(), new this.TagUnderlineShort(), new this.TagUnderlineLong(), new this.TagSup(), new this.TagSub(), new this.TagKbd(), new this.TagCode(), new this.TagStyle(), new this.TagFont(),
    new this.TagComic(), new this.TagComicH1(), new this.TagComicH2(), new this.TagComicH3(), new this.TagComicH4(), new this.TagComicNote(),
    new this.TagNote(), new this.TagTip(),
    new this.TagUnit(),
    new this.TagHit(), new this.TagMiss(),
    new this.TagAtk(),
    new this.TagHitYourSpellAttack(),
    new this.TagDc(),
    new this.TagDcYourSpellSave(),
    new this.TaChance(), new this.TaD20(), new this.TaDamage(), new this.TaDice(), new this.TaAutodice(), new this.TaHit(), new this.TaRecharge(), new this.TaAbility(), new this.TaSavingThrow(), new this.TaSkillCheck(),
    new this.TagScaledice(), new this.TagScaledamage(),
    new this.TagCoinflip(),
    new this.Tag5etools(), new this.TagAdventure(), new this.TagBook(), new this.TagFilter(), new this.TagFootnote(), new this.TagLink(), new this.TagLoader(), new this.TagColor(), new this.TagHighlight(), new this.TagHelp(),
    new this.TagQuickref(),
    new this.TagArea(),
    new this.TagAction(), new this.TagBackground(), new this.TagBoon(), new this.TagCharoption(), new this.TagClass(),
    new this.TagCondition(), new this.TagCreature(), new this.TagCult(), new this.TagDeck(), new this.TagDisease(), new this.TagFeat(), new this.TagHazard(), new this.TagItem(),
    //new this.TagItemMastery(),
    new this.TagLanguage(), new this.TagLegroup(), new this.TagObject(), new this.TagOptfeature(), new this.TagPsionic(), new this.TagRace(), new this.TagRecipe(), new this.TagReward(), new this.TagVehicle(), new this.TagVehupgrade(), new this.TagSense(), new this.TagSkill(), new this.TagSpell(), new this.TagStatus(), new this.TagTable(), new this.TagTrap(), new this.TagVariantrule(), new this.TagCite(),
    new this.TagCard(), new this.TagDeity(),
    new this.TagClassFeature({
        tagName: "classFeature"
    }),
    new this.TagSubclassFeature({
        tagName: "subclassFeature"
    }),
    new this.TagHomebrew(),
    new this.TagItemEntry(), ];

    static TAG_LOOKUP = {};

    static _init() {
        this.TAGS.forEach(tag=>{
            this.TAG_LOOKUP[tag.tag] = tag;
            this.TAG_LOOKUP[tag.tagName] = tag;
        }
        );

        return null;
    }

    static _ = this._init();

    static getPage(tag) {
        const tagInfo = this.TAG_LOOKUP[tag];
        return tagInfo?.page;
    }
}
;
Renderer.utils = {
    /* getBorderTr: (optText=null)=>{
        return `<tr><th class="border" colspan="6">${optText || ""}</th></tr>`;
    }
    ,

    getDividerTr: ()=>{
        return `<tr><td class="divider" colspan="6"><div></div></td></tr>`;
    }
    ,

    getSourceSubText(it) {
        return it.sourceSub ? ` \u2014 ${it.sourceSub}` : "";
    },

    getNameTr: (it,opts)=>{
        opts = opts || {};

        let dataPart = "";
        let pageLinkPart;
        if (opts.page) {
            const hash = UrlUtil.URL_TO_HASH_BUILDER[opts.page](it);
            dataPart = `data-page="${opts.page}" data-source="${it.source.escapeQuotes()}" data-hash="${hash.escapeQuotes()}" ${opts.extensionData != null ? `data-extension='${JSON.stringify(opts.extensionData).escapeQuotes()}` : ""}'`;
            pageLinkPart = SourceUtil.getAdventureBookSourceHref(it.source, it.page);

            if (opts.isEmbeddedEntity)
                ExtensionUtil.addEmbeddedToCache(opts.page, it.source, hash, it);
        }

        const tagPartSourceStart = `<${pageLinkPart ? `a href="${Renderer.get().baseUrl}${pageLinkPart}"` : "span"}`;
        const tagPartSourceEnd = `</${pageLinkPart ? "a" : "span"}>`;

        const ptBrewSourceLink = Renderer.utils._getNameTr_getPtPrereleaseBrewSourceLink({
            ent: it,
            brewUtil: PrereleaseUtil
        }) || Renderer.utils._getNameTr_getPtPrereleaseBrewSourceLink({
            ent: it,
            brewUtil: BrewUtil2
        });

        const $ele = $$`<tr>
			<th class="rnd-name ${opts.extraThClasses ? opts.extraThClasses.join(" ") : ""}" colspan="6" ${dataPart}>
				<div class="name-inner">
					<div class="ve-flex-v-center">
						<h1 class="stats-name copyable m-0" onmousedown="event.preventDefault()" onclick="Renderer.utils._pHandleNameClick(this)">${opts.prefix || ""}${it._displayName || it.name}${opts.suffix || ""}</h1>
						${opts.controlRhs || ""}
						${!IS_VTT && ExtensionUtil.ACTIVE && opts.page ? Renderer.utils.getBtnSendToFoundryHtml() : ""}
					</div>
					<div class="stats-source ve-flex-v-baseline">
						${tagPartSourceStart} class="help-subtle stats-source-abbreviation ${it.source ? `${Parser.sourceJsonToColor(it.source)}" title="${Parser.sourceJsonToFull(it.source)}${Renderer.utils.getSourceSubText(it)}` : ""}" ${Parser.sourceJsonToStyle(it.source)}>${it.source ? Parser.sourceJsonToAbv(it.source) : ""}${tagPartSourceEnd}

						${Renderer.utils.isDisplayPage(it.page) ? ` ${tagPartSourceStart} class="rd__stats-name-page ml-1" title="Page ${it.page}">p${it.page}${tagPartSourceEnd}` : ""}

						${ptBrewSourceLink}
					</div>
				</div>
			</th>
		</tr>`;

        if (opts.asJquery)
            return $ele;
        else
            return $ele[0].outerHTML;
    }
    ,

    _getNameTr_getPtPrereleaseBrewSourceLink({ent, brewUtil}) {
        if (!brewUtil.hasSourceJson(ent.source) || !brewUtil.sourceJsonToSource(ent.source)?.url)
            return "";

        return `<a href="${brewUtil.sourceJsonToSource(ent.source).url}" title="View ${brewUtil.DISPLAY_NAME.toTitleCase()} Source" class="ve-self-flex-center ml-2 ve-muted rd__stats-name-brew-link" target="_blank" rel="noopener noreferrer"><span class="	glyphicon glyphicon-share"></span></a>`;
    },

    getBtnSendToFoundryHtml({isMb=true}={}) {
        return `<button title="Send to Foundry (SHIFT for Temporary Import)" class="btn btn-xs btn-default btn-stats-name mx-2 ${isMb ? "mb-2" : ""} ve-self-flex-end" onclick="ExtensionUtil.pDoSendStats(event, this)" draggable="true" ondragstart="ExtensionUtil.doDragStart(event, this)"><span class="glyphicon glyphicon-send"></span></button>`;
    }, */

    isDisplayPage(page) {
        return page != null && ((!isNaN(page) && page > 0) || isNaN(page));
    },

   /*  getExcludedTr({entity, dataProp, page, isExcluded}) {
        const excludedHtml = Renderer.utils.getExcludedHtml({
            entity,
            dataProp,
            page,
            isExcluded
        });
        if (!excludedHtml)
            return "";
        return `<tr><td colspan="6" class="pt-3">${excludedHtml}</td></tr>`;
    },

    getExcludedHtml({entity, dataProp, page, isExcluded}) {
        if (isExcluded != null && !isExcluded)
            return "";
        if (isExcluded == null) {
            if (!ExcludeUtil.isInitialised)
                return "";
            if (page && !UrlUtil.URL_TO_HASH_BUILDER[page])
                return "";
            const hash = page ? UrlUtil.URL_TO_HASH_BUILDER[page](entity) : UrlUtil.autoEncodeHash(entity);
            isExcluded = isExcluded || dataProp === "item" ? Renderer.item.isExcluded(entity, {
                hash
            }) : ExcludeUtil.isExcluded(hash, dataProp, entity.source);
        }
        return isExcluded ? `<div class="ve-text-center text-danger"><b><i>Warning: This content has been <a href="blocklist.html">blocklisted</a>.</i></b></div>` : "";
    },

    getSourceAndPageTrHtml(it, {tag, fnUnpackUid}={}) {
        const html = Renderer.utils.getSourceAndPageHtml(it, {
            tag,
            fnUnpackUid
        });
        return html ? `<b>Source:</b> ${html}` : "";
    },

    _getAltSourceHtmlOrText(it, prop, introText, isText) {
        if (!it[prop] || !it[prop].length)
            return "";

        return `${introText} ${it[prop].map(as=>{
            if (as.entry)
                return (isText ? Renderer.stripTags : Renderer.get().render)(as.entry);
            return `${isText ? "" : `<i class="help-subtle" title="${Parser.sourceJsonToFull(as.source).qq()}">`}${Parser.sourceJsonToAbv(as.source)}${isText ? "" : `</i>`}${Renderer.utils.isDisplayPage(as.page) ? `, page ${as.page}` : ""}`;
        }
        ).join("; ")}`;
    },

    _getReprintedAsHtmlOrText(ent, {isText, tag, fnUnpackUid}={}) {
        if (!ent.reprintedAs)
            return "";
        if (!tag || !fnUnpackUid)
            return "";

        const ptReprinted = ent.reprintedAs.map(it=>{
            const uid = it.uid ?? it;
            const tag_ = it.tag ?? tag;

            const {name, source, displayText} = fnUnpackUid(uid);

            if (isText) {
                return `${Renderer.stripTags(displayText || name)} in ${Parser.sourceJsonToAbv(source)}`;
            }

            const asTag = `{@${tag_} ${name}|${source}${displayText ? `|${displayText}` : ""}}`;

            return `${Renderer.get().render(asTag)} in <i class="help-subtle" title="${Parser.sourceJsonToFull(source).qq()}">${Parser.sourceJsonToAbv(source)}</i>`;
        }
        ).join("; ");

        return `Reprinted as ${ptReprinted}`;
    },

    getSourceAndPageHtml(it, {tag, fnUnpackUid}={}) {
        return this._getSourceAndPageHtmlOrText(it, {
            tag,
            fnUnpackUid
        });
    },
    getSourceAndPageText(it, {tag, fnUnpackUid}={}) {
        return this._getSourceAndPageHtmlOrText(it, {
            isText: true,
            tag,
            fnUnpackUid
        });
    },

    _getSourceAndPageHtmlOrText(it, {isText, tag, fnUnpackUid}={}) {
        const sourceSub = Renderer.utils.getSourceSubText(it);
        const baseText = `${isText ? `` : `<i title="${Parser.sourceJsonToFull(it.source)}${sourceSub}">`}${Parser.sourceJsonToAbv(it.source)}${sourceSub}${isText ? "" : `</i>`}${Renderer.utils.isDisplayPage(it.page) ? `, page ${it.page}` : ""}`;
        const reprintedAsText = Renderer.utils._getReprintedAsHtmlOrText(it, {
            isText,
            tag,
            fnUnpackUid
        });
        const addSourceText = Renderer.utils._getAltSourceHtmlOrText(it, "additionalSources", "Additional information from", isText);
        const otherSourceText = Renderer.utils._getAltSourceHtmlOrText(it, "otherSources", "Also found in", isText);
        const externalSourceText = Renderer.utils._getAltSourceHtmlOrText(it, "externalSources", "External sources:", isText);

        const srdText = it.srd ? `${isText ? "" : `the <span title="Systems Reference Document">`}SRD${isText ? "" : `</span>`}${typeof it.srd === "string" ? ` (as &quot;${it.srd}&quot;)` : ""}` : "";
        const basicRulesText = it.basicRules ? `the Basic Rules${typeof it.basicRules === "string" ? ` (as &quot;${it.basicRules}&quot;)` : ""}` : "";
        const srdAndBasicRulesText = (srdText || basicRulesText) ? `Available in ${[srdText, basicRulesText].filter(it=>it).join(" and ")}` : "";

        return `${[baseText, addSourceText, reprintedAsText, otherSourceText, srdAndBasicRulesText, externalSourceText].filter(it=>it).join(". ")}${baseText && (addSourceText || otherSourceText || srdAndBasicRulesText || externalSourceText) ? "." : ""}`;
    },

    async _pHandleNameClick(ele) {
        await MiscUtil.pCopyTextToClipboard($(ele).text());
        JqueryUtil.showCopiedEffect($(ele));
    },

    getPageTr(it, {tag, fnUnpackUid}={}) {
        return `<tr><td colspan=6>${Renderer.utils.getSourceAndPageTrHtml(it, {
            tag,
            fnUnpackUid
        })}</td></tr>`;
    },

    getAbilityRollerEntry(statblock, ability) {
        if (statblock[ability] == null)
            return "\u2014";
        return `{@ability ${ability} ${statblock[ability]}}`;
    },

    getAbilityRoller(statblock, ability) {
        return Renderer.get().render(Renderer.utils.getAbilityRollerEntry(statblock, ability));
    },

    getEmbeddedDataHeader(name, style, {isCollapsed=false}={}) {
        return `<table class="rd__b-special rd__b-data ${style ? `rd__b-data--${style}` : ""}">
		<thead><tr><th class="rd__data-embed-header" colspan="6" data-rd-data-embed-header="true"><span class="rd__data-embed-name ${isCollapsed ? "" : `ve-hidden`}">${name}</span><span class="rd__data-embed-toggle">[${isCollapsed ? "+" : "\u2013"}]</span></th></tr></thead><tbody class="${isCollapsed ? `ve-hidden` : ""}" data-rd-embedded-data-render-target="true">`;
    },

    getEmbeddedDataFooter() {
        return `</tbody></table>`;
    },

    TabButton: function({label, fnChange, fnPopulate, isVisible}) {
        this.label = label;
        this.fnChange = fnChange;
        this.fnPopulate = fnPopulate;
        this.isVisible = isVisible;
    },

    _tabs: {},
    _curTab: null,
    _tabsPreferredLabel: null,
    bindTabButtons({tabButtons, tabLabelReference, $wrpTabs, $pgContent}) {
        Renderer.utils._tabs = {};
        Renderer.utils._curTab = null;

        $wrpTabs.find(`.stat-tab-gen`).remove();

        tabButtons.forEach((tb,i)=>{
            tb.ix = i;

            tb.$t = $(`<button class="ui-tab__btn-tab-head btn btn-default stat-tab-gen">${tb.label}</button>`).click(()=>tb.fnActivateTab({
                isUserInput: true
            }));

            tb.fnActivateTab = ({isUserInput=false}={})=>{
                const curTab = Renderer.utils._curTab;
                const tabs = Renderer.utils._tabs;

                if (!curTab || curTab.label !== tb.label) {
                    if (curTab)
                        curTab.$t.removeClass(`ui-tab__btn-tab-head--active`);
                    Renderer.utils._curTab = tb;
                    tb.$t.addClass(`ui-tab__btn-tab-head--active`);
                    if (curTab)
                        tabs[curTab.label].$content = $pgContent.children().detach();

                    tabs[tb.label] = tb;
                    if (!tabs[tb.label].$content && tb.fnPopulate)
                        tb.fnPopulate();
                    else
                        $pgContent.append(tabs[tb.label].$content);
                    if (tb.fnChange)
                        tb.fnChange();
                }

                if (isUserInput)
                    Renderer.utils._tabsPreferredLabel = tb.label;
            }
            ;
        }
        );

        if (tabButtons.length !== 1)
            tabButtons.slice().reverse().forEach(tb=>$wrpTabs.prepend(tb.$t));

        if (!Renderer.utils._tabsPreferredLabel)
            return tabButtons[0].fnActivateTab();

        const tabButton = tabButtons.find(tb=>tb.label === Renderer.utils._tabsPreferredLabel);
        if (tabButton)
            return tabButton.fnActivateTab();

        const ixDesired = tabLabelReference.indexOf(Renderer.utils._tabsPreferredLabel);
        if (!~ixDesired)
            return tabButtons[0].fnActivateTab();
        const ixsAvailableMetas = tabButtons.map(tb=>{
            const ixMapped = tabLabelReference.indexOf(tb.label);
            if (!~ixMapped)
                return null;
            return {
                ixMapped,
                label: tb.label,
            };
        }
        ).filter(Boolean);
        if (!ixsAvailableMetas.length)
            return tabButtons[0].fnActivateTab();
        const ixMetaHigher = ixsAvailableMetas.find(({ixMapped})=>ixMapped > ixDesired);
        if (ixMetaHigher != null)
            return (tabButtons.find(it=>it.label === ixMetaHigher.label) || tabButtons[0]).fnActivateTab();

        const ixMetaMax = ixsAvailableMetas.last();
        (tabButtons.find(it=>it.label === ixMetaMax.label) || tabButtons[0]).fnActivateTab();
    },

    _pronounceButtonsBound: false,
    bindPronounceButtons() {
        if (Renderer.utils._pronounceButtonsBound)
            return;
        Renderer.utils._pronounceButtonsBound = true;
        $(`body`).on("click", ".btn-name-pronounce", function() {
            const audio = $(this).find(`.name-pronounce`)[0];
            audio.currentTime = 0;
            audio.play();
        });
    },

    async pHasFluffText(entity, prop) {
        return entity.hasFluff || ((await Renderer.utils.pGetPredefinedFluff(entity, prop))?.entries?.length || 0) > 0;
    },

    async pHasFluffImages(entity, prop) {
        return entity.hasFluffImages || (((await Renderer.utils.pGetPredefinedFluff(entity, prop))?.images?.length || 0) > 0);
    },

    async pGetPredefinedFluff(entry, prop) {
        if (!entry.fluff)
            return null;

        const mappedProp = `_${prop}`;
        const mappedPropAppend = `_append${prop.uppercaseFirst()}`;
        const fluff = {};

        const assignPropsIfExist = (fromObj,...props)=>{
            props.forEach(prop=>{
                if (fromObj[prop])
                    fluff[prop] = fromObj[prop];
            }
            );
        }
        ;

        assignPropsIfExist(entry.fluff, "name", "type", "entries", "images");

        if (entry.fluff[mappedProp]) {
            const fromList = [...((await PrereleaseUtil.pGetBrewProcessed())[prop] || []), ...((await BrewUtil2.pGetBrewProcessed())[prop] || []), ].find(it=>it.name === entry.fluff[mappedProp].name && it.source === entry.fluff[mappedProp].source, );
            if (fromList) {
                assignPropsIfExist(fromList, "name", "type", "entries", "images");
            }
        }

        if (entry.fluff[mappedPropAppend]) {
            const fromList = [...((await PrereleaseUtil.pGetBrewProcessed())[prop] || []), ...((await BrewUtil2.pGetBrewProcessed())[prop] || []), ].find(it=>it.name === entry.fluff[mappedPropAppend].name && it.source === entry.fluff[mappedPropAppend].source, );
            if (fromList) {
                if (fromList.entries) {
                    fluff.entries = MiscUtil.copyFast(fluff.entries || []);
                    fluff.entries.push(...MiscUtil.copyFast(fromList.entries));
                }
                if (fromList.images) {
                    fluff.images = MiscUtil.copyFast(fluff.images || []);
                    fluff.images.push(...MiscUtil.copyFast(fromList.images));
                }
            }
        }

        return fluff;
    },

    async pGetFluff({entity, pFnPostProcess, fnGetFluffData, fluffUrl, fluffBaseUrl, fluffProp}={}) {
        let predefinedFluff = await Renderer.utils.pGetPredefinedFluff(entity, fluffProp);
        if (predefinedFluff) {
            if (pFnPostProcess)
                predefinedFluff = await pFnPostProcess(predefinedFluff);
            return predefinedFluff;
        }
        if (!fnGetFluffData && !fluffBaseUrl && !fluffUrl)
            return null;

        const fluffIndex = fluffBaseUrl ? await DataUtil.loadJSON(`${Renderer.get().baseUrl}${fluffBaseUrl}fluff-index.json`) : null;
        if (fluffIndex && !fluffIndex[entity.source])
            return null;

        const data = fnGetFluffData ? await fnGetFluffData() : fluffIndex && fluffIndex[entity.source] ? await DataUtil.loadJSON(`${Renderer.get().baseUrl}${fluffBaseUrl}${fluffIndex[entity.source]}`) : await DataUtil.loadJSON(`${Renderer.get().baseUrl}${fluffUrl}`);
        if (!data)
            return null;

        let fluff = (data[fluffProp] || []).find(it=>it.name === entity.name && it.source === entity.source);
        if (!fluff && entity._versionBase_name && entity._versionBase_source)
            fluff = (data[fluffProp] || []).find(it=>it.name === entity._versionBase_name && it.source === entity._versionBase_source);
        if (!fluff)
            return null;

        if (pFnPostProcess)
            fluff = await pFnPostProcess(fluff);
        return fluff;
    },

    _TITLE_SKIP_TYPES: new Set(["entries", "section"]),
    async pBuildFluffTab({isImageTab, $content, entity, $headerControls, pFnGetFluff}={}) {
        $content.append(Renderer.utils.getBorderTr());
        $content.append(Renderer.utils.getNameTr(entity, {
            controlRhs: $headerControls,
            asJquery: true
        }));
        const $td = $(`<td colspan="6" class="text"></td>`);
        $$`<tr class="text">${$td}</tr>`.appendTo($content);
        $content.append(Renderer.utils.getBorderTr());

        const fluff = MiscUtil.copyFast((await pFnGetFluff(entity)) || {});
        fluff.entries = fluff.entries || [Renderer.utils.HTML_NO_INFO];
        fluff.images = fluff.images || [Renderer.utils.HTML_NO_IMAGES];

        $td.fastSetHtml(Renderer.utils.getFluffTabContent({
            entity,
            fluff,
            isImageTab
        }));
    },

    getFluffTabContent({entity, fluff, isImageTab=false}) {
        Renderer.get().setFirstSection(true);
        return (fluff[isImageTab ? "images" : "entries"] || []).map((ent,i)=>{
            if (isImageTab)
                return Renderer.get().render(ent);

            if (i === 0 && ent.name && entity.name && (Renderer.utils._TITLE_SKIP_TYPES).has(ent.type)) {
                const entryLowName = ent.name.toLowerCase().trim();
                const entityLowName = entity.name.toLowerCase().trim();

                if (entryLowName.includes(entityLowName) || entityLowName.includes(entryLowName)) {
                    const cpy = MiscUtil.copyFast(ent);
                    delete cpy.name;
                    return Renderer.get().render(cpy);
                } else
                    return Renderer.get().render(ent);
            } else {
                if (typeof ent === "string")
                    return `<p>${Renderer.get().render(ent)}</p>`;
                else
                    return Renderer.get().render(ent);
            }
        }
        ).join("");
    },

    HTML_NO_INFO: "<i>No information available.</i>",
    HTML_NO_IMAGES: "<i>No images available.</i>",

    prerequisite: class {
        static _WEIGHTS = ["level", "pact", "patron", "spell", "race", "alignment", "ability", "proficiency", "spellcasting", "spellcasting2020", "spellcastingFeature", "spellcastingPrepared", "psionics", "feature", "feat", "background", "item", "itemType", "itemProperty", "campaign", "group", "other", "otherSummary", undefined, ].mergeMap((k,i)=>({
            [k]: i
        }));

        static _getShortClassName(className) {
            const ixFirstVowel = /[aeiou]/.exec(className).index;
            const start = className.slice(0, ixFirstVowel + 1);
            let end = className.slice(ixFirstVowel + 1);
            end = end.replace(/[aeiou]/g, "");
            return `${start}${end}`.toTitleCase();
        }

        static getHtml(prerequisites, {isListMode=false, blocklistKeys=new Set(), isTextOnly=false, isSkipPrefix=false}={}) {
            if (!prerequisites?.length)
                return isListMode ? "\u2014" : "";

            const prereqsShared = prerequisites.length === 1 ? {} : Object.entries(prerequisites.slice(1).reduce((a,b)=>CollectionUtil.objectIntersect(a, b), prerequisites[0]), ).filter(([k,v])=>prerequisites.every(pre=>CollectionUtil.deepEquals(pre[k], v))).mergeMap(([k,v])=>({
                [k]: v
            }));

            const shared = Object.keys(prereqsShared).length ? this.getHtml([prereqsShared], {
                isListMode,
                blocklistKeys,
                isTextOnly,
                isSkipPrefix: true
            }) : null;

            let cntPrerequisites = 0;
            let hasNote = false;
            const listOfChoices = prerequisites.map(pr=>{
                const ptNote = !isListMode && pr.note ? Renderer.get().render(pr.note) : null;
                if (ptNote) {
                    hasNote = true;
                }

                const prereqsToJoin = Object.entries(pr).filter(([k])=>!prereqsShared[k]).sort(([kA],[kB])=>this._WEIGHTS[kA] - this._WEIGHTS[kB]).map(([k,v])=>{
                    if (k === "note" || blocklistKeys.has(k))
                        return false;

                    cntPrerequisites += 1;

                    switch (k) {
                    case "level":
                        return this._getHtml_level({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "pact":
                        return this._getHtml_pact({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "patron":
                        return this._getHtml_patron({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "spell":
                        return this._getHtml_spell({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "feat":
                        return this._getHtml_feat({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "feature":
                        return this._getHtml_feature({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "item":
                        return this._getHtml_item({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "itemType":
                        return this._getHtml_itemType({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "itemProperty":
                        return this._getHtml_itemProperty({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "otherSummary":
                        return this._getHtml_otherSummary({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "other":
                        return this._getHtml_other({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "race":
                        return this._getHtml_race({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "background":
                        return this._getHtml_background({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "ability":
                        return this._getHtml_ability({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "proficiency":
                        return this._getHtml_proficiency({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "spellcasting":
                        return this._getHtml_spellcasting({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "spellcasting2020":
                        return this._getHtml_spellcasting2020({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "spellcastingFeature":
                        return this._getHtml_spellcastingFeature({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "spellcastingPrepared":
                        return this._getHtml_spellcastingPrepared({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "psionics":
                        return this._getHtml_psionics({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "alignment":
                        return this._getHtml_alignment({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "campaign":
                        return this._getHtml_campaign({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    case "group":
                        return this._getHtml_group({
                            v,
                            isListMode,
                            isTextOnly
                        });
                    default:
                        throw new Error(`Unhandled key: ${k}`);
                    }
                }
                ).filter(Boolean);

                const ptPrereqs = prereqsToJoin.join(prereqsToJoin.some(it=>/ or /.test(it)) ? "; " : ", ");

                return [ptPrereqs, ptNote].filter(Boolean).join(". ");
            }
            ).filter(Boolean);

            if (!listOfChoices.length && !shared)
                return isListMode ? "\u2014" : "";
            if (isListMode)
                return [shared, listOfChoices.join("/")].filter(Boolean).join(" + ");

            const sharedSuffix = MiscUtil.findCommonSuffix(listOfChoices, {
                isRespectWordBoundaries: true
            });
            const listOfChoicesTrimmed = sharedSuffix ? listOfChoices.map(it=>it.slice(0, -sharedSuffix.length)) : listOfChoices;

            const joinedChoices = (hasNote ? listOfChoicesTrimmed.join(" Or, ") : listOfChoicesTrimmed.joinConjunct(listOfChoicesTrimmed.some(it=>/ or /.test(it)) ? "; " : ", ", " or ")) + sharedSuffix;
            return `${isSkipPrefix ? "" : `Prerequisite${cntPrerequisites === 1 ? "" : "s"}: `}${[shared, joinedChoices].filter(Boolean).join(", plus ")}`;
        }

        static _getHtml_level({v, isListMode}) {
            if (typeof v === "number") {
                if (isListMode)
                    return `Lvl ${v}`;
                else
                    return `${Parser.getOrdinalForm(v)} level`;
            } else if (!v.class && !v.subclass) {
                if (isListMode)
                    return `Lvl ${v.level}`;
                else
                    return `${Parser.getOrdinalForm(v.level)} level`;
            }

            const isLevelVisible = v.level !== 1;
            const isSubclassVisible = v.subclass && v.subclass.visible;
            const isClassVisible = v.class && (v.class.visible || isSubclassVisible);
            if (isListMode) {
                const shortNameRaw = isClassVisible ? this._getShortClassName(v.class.name) : null;
                return `${isClassVisible ? `${shortNameRaw.slice(0, 4)}${isSubclassVisible ? "*" : "."}` : ""}${isLevelVisible ? ` Lvl ${v.level}` : ""}`;
            } else {
                let classPart = "";
                if (isClassVisible && isSubclassVisible)
                    classPart = ` ${v.class.name} (${v.subclass.name})`;
                else if (isClassVisible)
                    classPart = ` ${v.class.name}`;
                else if (isSubclassVisible)
                    classPart = ` &lt;remember to insert class name here&gt; (${v.subclass.name})`;
                return `${isLevelVisible ? `${Parser.getOrdinalForm(v.level)} level` : ""}${isClassVisible ? ` ${classPart}` : ""}`;
            }
        }

        static _getHtml_pact({v, isListMode}) {
            return Parser.prereqPactToFull(v);
        }

        static _getHtml_patron({v, isListMode}) {
            return isListMode ? `${Parser.prereqPatronToShort(v)} patron` : `${v} patron`;
        }

        static _getHtml_spell({v, isListMode, isTextOnly}) {
            return isListMode ? v.map(sp=>{
                if (typeof sp === "string")
                    return sp.split("#")[0].split("|")[0].toTitleCase();
                return sp.entrySummary || sp.entry;
            }
            ).join("/") : v.map(sp=>{
                if (typeof sp === "string")
                    return Parser.prereqSpellToFull(sp, {
                        isTextOnly
                    });
                return isTextOnly ? Renderer.stripTags(sp.entry) : Renderer.get().render(`{@filter ${sp.entry}|spells|${sp.choose}}`);
            }
            ).joinConjunct(", ", " or ");
        }

        static _getHtml_feat({v, isListMode, isTextOnly}) {
            return isListMode ? v.map(x=>x.split("|")[0].toTitleCase()).join("/") : v.map(it=>(isTextOnly ? Renderer.stripTags.bind(Renderer) : Renderer.get().render.bind(Renderer.get()))(`{@feat ${it}} feat`)).joinConjunct(", ", " or ");
        }

        static _getHtml_feature({v, isListMode, isTextOnly}) {
            return isListMode ? v.map(x=>Renderer.stripTags(x).toTitleCase()).join("/") : v.map(it=>isTextOnly ? Renderer.stripTags(it) : Renderer.get().render(it)).joinConjunct(", ", " or ");
        }

        static _getHtml_item({v, isListMode}) {
            return isListMode ? v.map(x=>x.toTitleCase()).join("/") : v.joinConjunct(", ", " or ");
        }

        static _getHtml_itemType({v, isListMode}) {
            return isListMode ? v.map(it=>Renderer.item.getType(it)).map(it=>it?.abbreviation).join("+") : v.map(it=>Renderer.item.getType(it)).map(it=>it?.name?.toTitleCase()).joinConjunct(", ", " and ");
        }

        static _getHtml_itemProperty({v, isListMode}) {
            if (v == null)
                return isListMode ? "No Prop." : "No Other Properties";

            return isListMode ? v.map(it=>Renderer.item.getProperty(it)).map(it=>it?.abbreviation).join("+") : (`${v.map(it=>Renderer.item.getProperty(it)).map(it=>it?.name?.toTitleCase()).joinConjunct(", ", " and ")} Property`);
        }

        static _getHtml_otherSummary({v, isListMode, isTextOnly}) {
            return isListMode ? (v.entrySummary || Renderer.stripTags(v.entry)) : (isTextOnly ? Renderer.stripTags(v.entry) : Renderer.get().render(v.entry));
        }

        static _getHtml_other({v, isListMode, isTextOnly}) {
            return isListMode ? "Special" : (isTextOnly ? Renderer.stripTags(v) : Renderer.get().render(v));
        }

        static _getHtml_race({v, isListMode, isTextOnly}) {
            const parts = v.map((it,i)=>{
                if (isListMode) {
                    return `${it.name.toTitleCase()}${it.subrace != null ? ` (${it.subrace})` : ""}`;
                } else {
                    const raceName = it.displayEntry ? (isTextOnly ? Renderer.stripTags(it.displayEntry) : Renderer.get().render(it.displayEntry)) : i === 0 ? it.name.toTitleCase() : it.name;
                    return `${raceName}${it.subrace != null ? ` (${it.subrace})` : ""}`;
                }
            }
            );
            return isListMode ? parts.join("/") : parts.joinConjunct(", ", " or ");
        }

        static _getHtml_background({v, isListMode, isTextOnly}) {
            const parts = v.map((it,i)=>{
                if (isListMode) {
                    return `${it.name.toTitleCase()}`;
                } else {
                    return it.displayEntry ? (isTextOnly ? Renderer.stripTags(it.displayEntry) : Renderer.get().render(it.displayEntry)) : i === 0 ? it.name.toTitleCase() : it.name;
                }
            }
            );
            return isListMode ? parts.join("/") : parts.joinConjunct(", ", " or ");
        }

        static _getHtml_ability({v, isListMode, isTextOnly}) {

            let hadMultipleInner = false;
            let hadMultiMultipleInner = false;
            let allValuesEqual = null;

            outer: for (const abMeta of v) {
                for (const req of Object.values(abMeta)) {
                    if (allValuesEqual == null)
                        allValuesEqual = req;
                    else {
                        if (req !== allValuesEqual) {
                            allValuesEqual = null;
                            break outer;
                        }
                    }
                }
            }

            const abilityOptions = v.map(abMeta=>{
                if (allValuesEqual) {
                    const abList = Object.keys(abMeta);
                    hadMultipleInner = hadMultipleInner || abList.length > 1;
                    return isListMode ? abList.map(ab=>ab.uppercaseFirst()).join(", ") : abList.map(ab=>Parser.attAbvToFull(ab)).joinConjunct(", ", " and ");
                } else {
                    const groups = {};

                    Object.entries(abMeta).forEach(([ab,req])=>{
                        (groups[req] = groups[req] || []).push(ab);
                    }
                    );

                    let isMulti = false;
                    const byScore = Object.entries(groups).sort(([reqA],[reqB])=>SortUtil.ascSort(Number(reqB), Number(reqA))).map(([req,abs])=>{
                        hadMultipleInner = hadMultipleInner || abs.length > 1;
                        if (abs.length > 1)
                            hadMultiMultipleInner = isMulti = true;

                        abs = abs.sort(SortUtil.ascSortAtts);
                        return isListMode ? `${abs.map(ab=>ab.uppercaseFirst()).join(", ")} ${req}+` : `${abs.map(ab=>Parser.attAbvToFull(ab)).joinConjunct(", ", " and ")} ${req} or higher`;
                    }
                    );

                    return isListMode ? `${isMulti || byScore.length > 1 ? "(" : ""}${byScore.join(" & ")}${isMulti || byScore.length > 1 ? ")" : ""}` : isMulti ? byScore.joinConjunct("; ", " and ") : byScore.joinConjunct(", ", " and ");
                }
            }
            );

            if (isListMode) {
                return `${abilityOptions.join("/")}${allValuesEqual != null ? ` ${allValuesEqual}+` : ""}`;
            } else {
                const isComplex = hadMultiMultipleInner || hadMultipleInner || allValuesEqual == null;
                const joined = abilityOptions.joinConjunct(hadMultiMultipleInner ? " - " : hadMultipleInner ? "; " : ", ", isComplex ? (isTextOnly ? ` /or/ ` : ` <i>or</i> `) : " or ", );
                return `${joined}${allValuesEqual != null ? ` ${allValuesEqual} or higher` : ""}`;
            }
        }

        static _getHtml_proficiency({v, isListMode}) {
            const parts = v.map(obj=>{
                return Object.entries(obj).map(([profType,prof])=>{
                    switch (profType) {
                    case "armor":
                        {
                            return isListMode ? `Prof ${Parser.armorFullToAbv(prof)} armor` : `Proficiency with ${prof} armor`;
                        }
                    case "weapon":
                        {
                            return isListMode ? `Prof ${Parser.weaponFullToAbv(prof)} weapon` : `Proficiency with a ${prof} weapon`;
                        }
                    case "weaponGroup":
                        {
                            return isListMode ? `Prof ${Parser.weaponFullToAbv(prof)} weapons` : `${prof.toTitleCase()} Proficiency`;
                        }
                    default:
                        throw new Error(`Unhandled proficiency type: "${profType}"`);
                    }
                }
                );
            }
            );
            return isListMode ? parts.join("/") : parts.joinConjunct(", ", " or ");
        }

        static _getHtml_spellcasting({v, isListMode}) {
            return isListMode ? "Spellcasting" : "The ability to cast at least one spell";
        }

        static _getHtml_spellcasting2020({v, isListMode}) {
            return isListMode ? "Spellcasting" : "Spellcasting or Pact Magic feature";
        }

        static _getHtml_spellcastingFeature({v, isListMode}) {
            return isListMode ? "Spellcasting" : "Spellcasting Feature";
        }

        static _getHtml_spellcastingPrepared({v, isListMode}) {
            return isListMode ? "Spellcasting" : "Spellcasting feature from a class that prepares spells";
        }

        static _getHtml_psionics({v, isListMode, isTextOnly}) {
            return isListMode ? "Psionics" : (isTextOnly ? Renderer.stripTags : Renderer.get().render.bind(Renderer.get()))("Psionic Talent feature or Wild Talent feat");
        }

        static _getHtml_alignment({v, isListMode}) {
            return isListMode ? Parser.alignmentListToFull(v).replace(/\bany\b/gi, "").trim().replace(/\balignment\b/gi, "align").trim().toTitleCase() : Parser.alignmentListToFull(v);
        }

        static _getHtml_campaign({v, isListMode}) {
            return isListMode ? v.join("/") : `${v.joinConjunct(", ", " or ")} Campaign`;
        }

        static _getHtml_group({v, isListMode}) {
            return isListMode ? v.map(it=>it.toTitleCase()).join("/") : `${v.map(it=>it.toTitleCase()).joinConjunct(", ", " or ")} Group`;
        }
    }
    ,

    getRepeatableEntry(ent) {
        if (!ent.repeatable)
            return null;
        return `{@b Repeatable:} ${ent.repeatableNote || (ent.repeatable ? "Yes" : "No")}`;
    },

    getRepeatableHtml(ent, {isListMode=false}={}) {
        const entryRepeatable = Renderer.utils.getRepeatableEntry(ent);
        if (entryRepeatable == null)
            return isListMode ? "\u2014" : "";
        return Renderer.get().render(entryRepeatable);
    },

    getRenderedSize(size) {
        return [...(size ? [size].flat() : [])].sort(SortUtil.ascSortSize).map(sz=>Parser.sizeAbvToFull(sz)).joinConjunct(", ", " or ");
    },

    getMediaUrl(entry, prop, mediaDir) {
        if (!entry[prop])
            return "";

        let href = "";
        if (entry[prop].type === "internal") {
            const baseUrl = Renderer.get().baseMediaUrls[mediaDir] || Renderer.get().baseUrl;
            const mediaPart = `${mediaDir}/${entry[prop].path}`;
            href = baseUrl !== "" ? `${baseUrl}${mediaPart}` : UrlUtil.link(mediaPart);
        } else if (entry[prop].type === "external") {
            href = entry[prop].url;
        }
        return href;
    },

    getTagEntry(tag, text) {
        switch (tag) {
        case "@dice":
        case "@autodice":
        case "@damage":
        case "@hit":
        case "@d20":
        case "@chance":
        case "@recharge":
            {
                const fauxEntry = {
                    type: "dice",
                    rollable: true,
                };
                const [rollText,displayText,name,...others] = Renderer.splitTagByPipe(text);
                if (displayText)
                    fauxEntry.displayText = displayText;

                if ((!fauxEntry.displayText && (rollText || "").includes("summonSpellLevel")) || (fauxEntry.displayText && fauxEntry.displayText.includes("summonSpellLevel")))
                    fauxEntry.displayText = (fauxEntry.displayText || rollText || "").replace(/summonSpellLevel/g, "the spell's level");

                if ((!fauxEntry.displayText && (rollText || "").includes("summonClassLevel")) || (fauxEntry.displayText && fauxEntry.displayText.includes("summonClassLevel")))
                    fauxEntry.displayText = (fauxEntry.displayText || rollText || "").replace(/summonClassLevel/g, "your class level");

                if (name)
                    fauxEntry.name = name;

                switch (tag) {
                case "@dice":
                case "@autodice":
                case "@damage":
                    {
                        fauxEntry.toRoll = rollText;

                        if (!fauxEntry.displayText && (rollText || "").includes(";"))
                            fauxEntry.displayText = rollText.replace(/;/g, "/");
                        if ((!fauxEntry.displayText && (rollText || "").includes("#$")) || (fauxEntry.displayText && fauxEntry.displayText.includes("#$")))
                            fauxEntry.displayText = (fauxEntry.displayText || rollText).replace(/#\$prompt_number[^$]*\$#/g, "(n)");
                        fauxEntry.displayText = fauxEntry.displayText || fauxEntry.toRoll;

                        if (tag === "@damage")
                            fauxEntry.subType = "damage";
                        if (tag === "@autodice")
                            fauxEntry.autoRoll = true;

                        return fauxEntry;
                    }
                case "@d20":
                case "@hit":
                    {
                        let mod;
                        if (!isNaN(rollText)) {
                            const n = Number(rollText);
                            mod = `${n >= 0 ? "+" : ""}${n}`;
                        } else
                            mod = /^\s+[-+]/.test(rollText) ? rollText : `+${rollText}`;
                        fauxEntry.displayText = fauxEntry.displayText || mod;
                        fauxEntry.toRoll = `1d20${mod}`;
                        fauxEntry.subType = "d20";
                        fauxEntry.d20mod = mod;
                        if (tag === "@hit")
                            fauxEntry.context = {
                                type: "hit"
                            };
                        return fauxEntry;
                    }
                case "@chance":
                    {
                        const [textSuccess,textFailure] = others;
                        fauxEntry.toRoll = `1d100`;
                        fauxEntry.successThresh = Number(rollText);
                        fauxEntry.chanceSuccessText = textSuccess;
                        fauxEntry.chanceFailureText = textFailure;
                        return fauxEntry;
                    }
                case "@recharge":
                    {
                        const flags = displayText ? displayText.split("") : null;
                        fauxEntry.toRoll = "1d6";
                        const asNum = Number(rollText || 6);
                        fauxEntry.successThresh = 7 - asNum;
                        fauxEntry.successMax = 6;
                        fauxEntry.displayText = `${asNum}${asNum < 6 ? `\u20136` : ""}`;
                        fauxEntry.chanceSuccessText = "Recharged!";
                        fauxEntry.chanceFailureText = "Did not recharge";
                        fauxEntry.isColorSuccessFail = true;
                        return fauxEntry;
                    }
                }

                return fauxEntry;
            }

        case "@ability":
        case "@savingThrow":
            {
                const fauxEntry = {
                    type: "dice",
                    rollable: true,
                    subType: "d20",
                    context: {
                        type: tag === "@ability" ? "abilityCheck" : "savingThrow"
                    },
                };

                const [abilAndScoreOrScore,displayText,name,...others] = Renderer.splitTagByPipe(text);

                let[abil,...rawScoreOrModParts] = abilAndScoreOrScore.split(" ").map(it=>it.trim()).filter(Boolean);
                abil = abil.toLowerCase();

                fauxEntry.context.ability = abil;

                if (name)
                    fauxEntry.name = name;
                else {
                    if (tag === "@ability")
                        fauxEntry.name = Parser.attAbvToFull(abil);
                    else if (tag === "@savingThrow")
                        fauxEntry.name = `${Parser.attAbvToFull(abil)} save`;
                }

                const rawScoreOrMod = rawScoreOrModParts.join(" ");
                if (isNaN(rawScoreOrMod) && tag === "@savingThrow") {
                    if (displayText)
                        fauxEntry.displayText = displayText;
                    else
                        fauxEntry.displayText = rawScoreOrMod;

                    fauxEntry.toRoll = `1d20${rawScoreOrMod}`;
                    fauxEntry.d20mod = rawScoreOrMod;
                } else {
                    const scoreOrMod = Number(rawScoreOrMod) || 0;
                    const mod = (tag === "@ability" ? Parser.getAbilityModifier : UiUtil.intToBonus)(scoreOrMod);

                    if (displayText)
                        fauxEntry.displayText = displayText;
                    else {
                        if (tag === "@ability")
                            fauxEntry.displayText = `${scoreOrMod} (${mod})`;
                        else
                            fauxEntry.displayText = mod;
                    }

                    fauxEntry.toRoll = `1d20${mod}`;
                    fauxEntry.d20mod = mod;
                }

                return fauxEntry;
            }

        case "@skillCheck":
            {
                const fauxEntry = {
                    type: "dice",
                    rollable: true,
                    subType: "d20",
                    context: {
                        type: "skillCheck"
                    },
                };

                const [skillAndMod,displayText,name,...others] = Renderer.splitTagByPipe(text);

                const parts = skillAndMod.split(" ").map(it=>it.trim()).filter(Boolean);
                const namePart = parts.shift();
                const bonusPart = parts.join(" ");
                const skill = namePart.replace(/_/g, " ");

                let mod = bonusPart;
                if (!isNaN(bonusPart))
                    mod = UiUtil.intToBonus(Number(bonusPart) || 0);
                else if (bonusPart.startsWith("#$"))
                    mod = `+${bonusPart}`;

                fauxEntry.context.skill = skill;
                fauxEntry.displayText = displayText || mod;

                if (name)
                    fauxEntry.name = name;
                else
                    fauxEntry.name = skill.toTitleCase();

                fauxEntry.toRoll = `1d20${mod}`;
                fauxEntry.d20mod = mod;

                return fauxEntry;
            }

        case "@coinflip":
            {
                const [displayText,name,textSuccess,textFailure] = Renderer.splitTagByPipe(text);

                const fauxEntry = {
                    type: "dice",
                    toRoll: "1d2",
                    successThresh: 1,
                    successMax: 2,
                    displayText: displayText || "flip a coin",
                    chanceSuccessText: textSuccess || `Heads`,
                    chanceFailureText: textFailure || `Tails`,
                    isColorSuccessFail: !textSuccess && !textFailure,
                    rollable: true,
                };

                return fauxEntry;
            }

        default:
            throw new Error(`Unhandled tag "${tag}"`);
        }
    },*/

    getTagMeta(tag, text) {
        switch (tag) {
        case "@deity":
            {
                let[name,pantheon,source,displayText,...others] = Renderer.splitTagByPipe(text);
                pantheon = pantheon || "forgotten realms";
                source = source || Parser.getTagSource(tag, source);
                const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_DEITIES]({
                    name,
                    pantheon,
                    source
                });

                return {
                    name,
                    displayText,
                    others,

                    page: UrlUtil.PG_DEITIES,
                    source,
                    hash,

                    hashPreEncoded: true,
                };
            }

        case "@card":
            {
                const unpacked = DataUtil.deck.unpackUidCard(text);
                const {name, set, source, displayText} = unpacked;
                const hash = UrlUtil.URL_TO_HASH_BUILDER["card"]({
                    name,
                    set,
                    source
                });

                return {
                    name,
                    displayText,

                    isFauxPage: true,
                    page: "card",
                    source,
                    hash,
                    hashPreEncoded: true,
                };
            }

        case "@classFeature":
            {
                const unpacked = DataUtil.class.unpackUidClassFeature(text);

                const classPageHash = `${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({
                    name: unpacked.className,
                    source: unpacked.classSource
                })}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
                    feature: {
                        ixLevel: unpacked.level - 1,
                        ixFeature: 0
                    }
                })}`;

                return {
                    name: unpacked.name,
                    displayText: unpacked.displayText,

                    page: UrlUtil.PG_CLASSES,
                    source: unpacked.source,
                    hash: classPageHash,
                    hashPreEncoded: true,

                    pageHover: "classfeature",
                    hashHover: UrlUtil.URL_TO_HASH_BUILDER["classFeature"](unpacked),
                    hashPreEncodedHover: true,
                };
            }

        case "@subclassFeature":
            {
                const unpacked = DataUtil.class.unpackUidSubclassFeature(text);

                const classPageHash = `${UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_CLASSES]({
                    name: unpacked.className,
                    source: unpacked.classSource
                })}${HASH_PART_SEP}${UrlUtil.getClassesPageStatePart({
                    feature: {
                        ixLevel: unpacked.level - 1,
                        ixFeature: 0
                    }
                })}`;

                return {
                    name: unpacked.name,
                    displayText: unpacked.displayText,

                    page: UrlUtil.PG_CLASSES,
                    source: unpacked.source,
                    hash: classPageHash,
                    hashPreEncoded: true,

                    pageHover: "subclassfeature",
                    hashHover: UrlUtil.URL_TO_HASH_BUILDER["subclassFeature"](unpacked),
                    hashPreEncodedHover: true,
                };
            }

        case "@quickref":
            {
                const unpacked = DataUtil.quickreference.unpackUid(text);

                const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_QUICKREF](unpacked);

                return {
                    name: unpacked.name,
                    displayText: unpacked.displayText,

                    page: UrlUtil.PG_QUICKREF,
                    source: unpacked.source,
                    hash,
                    hashPreEncoded: true,
                };
            }

        default:
            return Renderer.utils._getTagMeta_generic(tag, text);
        }
    },

    _getTagMeta_generic(tag, text) {
        const {name, source, displayText, others} = DataUtil.generic.unpackUid(text, tag);
        const hash = UrlUtil.encodeForHash([name, source]);

        const out = {
            name,
            displayText,
            others,

            page: null,
            source,
            hash,

            preloadId: null,
            subhashes: null,
            linkText: null,

            hashPreEncoded: true,
        };

        switch (tag) {
        case "@spell":
            out.page = UrlUtil.PG_SPELLS;
            break;
        case "@item":
            out.page = UrlUtil.PG_ITEMS;
            break;
        case "@condition":
        case "@disease":
        case "@status":
            out.page = UrlUtil.PG_CONDITIONS_DISEASES;
            break;
        case "@background":
            out.page = UrlUtil.PG_BACKGROUNDS;
            break;
        case "@race":
            out.page = UrlUtil.PG_RACES;
            break;
        case "@optfeature":
            out.page = UrlUtil.PG_OPT_FEATURES;
            break;
        case "@reward":
            out.page = UrlUtil.PG_REWARDS;
            break;
        case "@feat":
            out.page = UrlUtil.PG_FEATS;
            break;
        case "@psionic":
            out.page = UrlUtil.PG_PSIONICS;
            break;
        case "@object":
            out.page = UrlUtil.PG_OBJECTS;
            break;
        case "@boon":
        case "@cult":
            out.page = UrlUtil.PG_CULTS_BOONS;
            break;
        case "@trap":
        case "@hazard":
            out.page = UrlUtil.PG_TRAPS_HAZARDS;
            break;
        case "@variantrule":
            out.page = UrlUtil.PG_VARIANTRULES;
            break;
        case "@table":
            out.page = UrlUtil.PG_TABLES;
            break;
        case "@vehicle":
        case "@vehupgrade":
            out.page = UrlUtil.PG_VEHICLES;
            break;
        case "@action":
            out.page = UrlUtil.PG_ACTIONS;
            break;
        case "@language":
            out.page = UrlUtil.PG_LANGUAGES;
            break;
        case "@charoption":
            out.page = UrlUtil.PG_CHAR_CREATION_OPTIONS;
            break;
        case "@recipe":
            out.page = UrlUtil.PG_RECIPES;
            break;
        case "@deck":
            out.page = UrlUtil.PG_DECKS;
            break;

        case "@legroup":
            {
                out.page = "legendaryGroup";
                out.isFauxPage = true;
                break;
            }

        case "@creature":
            {
                out.page = UrlUtil.PG_BESTIARY;

                if (others.length) {
                    const [type,value] = others[0].split("=").map(it=>it.trim().toLowerCase()).filter(Boolean);
                    if (type && value) {
                        switch (type) {
                        case VeCt.HASH_SCALED:
                            {
                                const targetCrNum = Parser.crToNumber(value);
                                out.preloadId = Renderer.monster.getCustomHashId({
                                    name,
                                    source,
                                    _isScaledCr: true,
                                    _scaledCr: targetCrNum
                                });
                                out.subhashes = [{
                                    key: VeCt.HASH_SCALED,
                                    value: targetCrNum
                                }, ];
                                out.linkText = displayText || `${name} (CR ${value})`;
                                break;
                            }

                        case VeCt.HASH_SCALED_SPELL_SUMMON:
                            {
                                const scaledSpellNum = Number(value);
                                out.preloadId = Renderer.monster.getCustomHashId({
                                    name,
                                    source,
                                    _isScaledSpellSummon: true,
                                    _scaledSpellSummonLevel: scaledSpellNum
                                });
                                out.subhashes = [{
                                    key: VeCt.HASH_SCALED_SPELL_SUMMON,
                                    value: scaledSpellNum
                                }, ];
                                out.linkText = displayText || `${name} (Spell Level ${value})`;
                                break;
                            }

                        case VeCt.HASH_SCALED_CLASS_SUMMON:
                            {
                                const scaledClassNum = Number(value);
                                out.preloadId = Renderer.monster.getCustomHashId({
                                    name,
                                    source,
                                    _isScaledClassSummon: true,
                                    _scaledClassSummonLevel: scaledClassNum
                                });
                                out.subhashes = [{
                                    key: VeCt.HASH_SCALED_CLASS_SUMMON,
                                    value: scaledClassNum
                                }, ];
                                out.linkText = displayText || `${name} (Class Level ${value})`;
                                break;
                            }
                        }
                    }
                }

                break;
            }

        case "@class":
            {
                out.page = UrlUtil.PG_CLASSES;

                if (others.length) {
                    const [subclassShortName,subclassSource,featurePart] = others;

                    if (subclassSource)
                        out.source = subclassSource;

                    const classStateOpts = {
                        subclass: {
                            shortName: subclassShortName.trim(),
                            source: subclassSource ? subclassSource.trim() : Parser.SRC_PHB,
                        },
                    };

                    const hoverSubhashObj = UrlUtil.unpackSubHash(UrlUtil.getClassesPageStatePart(classStateOpts));
                    out.subhashesHover = [{
                        key: "state",
                        value: hoverSubhashObj.state,
                        preEncoded: true
                    }];

                    if (featurePart) {
                        const featureParts = featurePart.trim().split("-");
                        classStateOpts.feature = {
                            ixLevel: featureParts[0] || "0",
                            ixFeature: featureParts[1] || "0",
                        };
                    }

                    const subhashObj = UrlUtil.unpackSubHash(UrlUtil.getClassesPageStatePart(classStateOpts));

                    out.subhashes = [{
                        key: "state",
                        value: subhashObj.state.join(HASH_SUB_LIST_SEP),
                        preEncoded: true
                    }, {
                        key: "fltsource",
                        value: "clear"
                    }, {
                        key: "flstmiscellaneous",
                        value: "clear"
                    }, ];
                }

                break;
            }

        case "@skill":
            {
                out.isFauxPage = true;
                out.page = "skill";
                break;
            }
        case "@sense":
            {
                out.isFauxPage = true;
                out.page = "sense";
                break;
            }
        case "@itemMastery":
            {
                out.isFauxPage = true;
                out.page = "itemMastery";
                break;
            }
        case "@cite":
            {
                out.isFauxPage = true;
                out.page = "citation";
                break;
            }

        default:
            throw new Error(`Unhandled tag "${tag}"`);
        }

        return out;
    },

    /*
    applyTemplate(ent, templateString, {fnPreApply, mapCustom}={}) {
        return templateString.replace(/{{([^}]+)}}/g, (fullMatch,strArgs)=>{
            if (fnPreApply)
                fnPreApply(fullMatch, strArgs);

            if (strArgs === "item.dmg1") {
                return Renderer.item._getTaggedDamage(ent.dmg1);
            } else if (strArgs === "item.dmg2") {
                return Renderer.item._getTaggedDamage(ent.dmg2);
            }

            if (mapCustom && mapCustom[strArgs])
                return mapCustom[strArgs];

            const args = strArgs.split(" ").map(arg=>arg.trim()).filter(Boolean);

            if (args.length === 1) {
                return Renderer.utils._applyTemplate_getValue(ent, args[0]);
            } else if (args.length === 2) {
                const val = Renderer.utils._applyTemplate_getValue(ent, args[1]);
                switch (args[0]) {
                case "getFullImmRes":
                    return Parser.getFullImmRes(val);
                default:
                    throw new Error(`Unknown template function "${args[0]}"`);
                }
            } else
                throw new Error(`Unhandled number of arguments ${args.length}`);
        }
        );
    },

    _applyTemplate_getValue(ent, prop) {
        const spl = prop.split(".");
        switch (spl[0]) {
        case "item":
            {
                const path = spl.slice(1);
                if (!path.length)
                    return `{@i missing key path}`;
                return MiscUtil.get(ent, ...path);
            }
        default:
            return `{@i unknown template root: "${spl[0]}"}`;
        }
    },

    getFlatEntries(entry) {
        const out = [];
        const depthStack = [];

        const recurse = ({obj})=>{
            let isPopDepth = false;

            Renderer.ENTRIES_WITH_ENUMERATED_TITLES.forEach(meta=>{
                if (obj.type !== meta.type)
                    return;

                const kName = "name";
                if (obj[kName] == null)
                    return;

                isPopDepth = true;

                const curDepth = depthStack.length ? depthStack.last() : 0;
                const nxtDepth = meta.depth ? meta.depth : meta.depthIncrement ? curDepth + meta.depthIncrement : curDepth;

                depthStack.push(Math.min(nxtDepth, 2, ), );

                const cpyObj = MiscUtil.copyFast(obj);

                out.push({
                    depth: curDepth,
                    entry: cpyObj,
                    key: meta.key,
                    ix: out.length,
                    name: cpyObj.name,
                });

                cpyObj[meta.key] = cpyObj[meta.key].map(child=>{
                    if (!child.type)
                        return child;
                    const childMeta = Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP[child.type];
                    if (!childMeta)
                        return child;

                    const kNameChild = "name";
                    if (child[kName] == null)
                        return child;

                    const ixNextRef = out.length;

                    recurse({
                        obj: child
                    });

                    return {
                        IX_FLAT_REF: ixNextRef
                    };
                }
                );
            }
            );

            if (isPopDepth)
                depthStack.pop();
        }
        ;

        recurse({
            obj: entry
        });

        return out;
    },

    getLinkSubhashString(subhashes) {
        let out = "";
        const len = subhashes.length;
        for (let i = 0; i < len; ++i) {
            const subHash = subhashes[i];
            if (subHash.preEncoded)
                out += `${HASH_PART_SEP}${subHash.key}${HASH_SUB_KV_SEP}`;
            else
                out += `${HASH_PART_SEP}${UrlUtil.encodeForHash(subHash.key)}${HASH_SUB_KV_SEP}`;
            if (subHash.value != null) {
                if (subHash.preEncoded)
                    out += subHash.value;
                else
                    out += UrlUtil.encodeForHash(subHash.value);
            } else {
                out += subHash.values.map(v=>UrlUtil.encodeForHash(v)).join(HASH_SUB_LIST_SEP);
            }
        }
        return out;
    },

    initFullEntries_(ent, {propEntries="entries", propFullEntries="_fullEntries"}={}) {
        ent[propFullEntries] = ent[propFullEntries] || (ent[propEntries] ? MiscUtil.copyFast(ent[propEntries]) : []);
    },

    lazy: {
        _getIntersectionConfig() {
            return {
                rootMargin: "150px 0px",
                threshold: 0.01,
            };
        },

        _OBSERVERS: {},
        getCreateObserver({observerId, fnOnObserve}) {
            if (!Renderer.utils.lazy._OBSERVERS[observerId]) {
                const observer = Renderer.utils.lazy._OBSERVERS[observerId] = new IntersectionObserver(Renderer.utils.lazy.getFnOnIntersect({
                    observerId,
                    fnOnObserve,
                }),Renderer.utils.lazy._getIntersectionConfig(),);

                observer._TRACKED = new Set();

                observer.track = it=>{
                    observer._TRACKED.add(it);
                    return observer.observe(it);
                }
                ;

                observer.untrack = it=>{
                    observer._TRACKED.delete(it);
                    return observer.unobserve(it);
                }
                ;

                observer._printListener = evt=>{
                    if (!observer._TRACKED.size)
                        return;

                    [...observer._TRACKED].forEach(it=>{
                        observer.untrack(it);
                        fnOnObserve({
                            observer,
                            entry: {
                                target: it,
                            },
                        });
                    }
                    );

                    alert(`All content must be loaded prior to printing. Please cancel the print and wait a few moments for loading to complete!`);
                }
                ;
                window.addEventListener("beforeprint", observer._printListener);
            }
            return Renderer.utils.lazy._OBSERVERS[observerId];
        },

        destroyObserver({observerId}) {
            const observer = Renderer.utils.lazy._OBSERVERS[observerId];
            if (!observer)
                return;

            observer.disconnect();
            window.removeEventListener("beforeprint", observer._printListener);
        },

        getFnOnIntersect({observerId, fnOnObserve}) {
            return obsEntries=>{
                const observer = Renderer.utils.lazy._OBSERVERS[observerId];

                obsEntries.forEach(entry=>{
                    if (entry.intersectionRatio <= 0)
                        return;

                    observer.untrack(entry.target);
                    fnOnObserve({
                        observer,
                        entry,
                    });
                }
                );
            }
            ;
        },
    }, */
};
Renderer.ENTRIES_WITH_ENUMERATED_TITLES = [{
    type: "section",
    key: "entries",
    depth: -1
}, {
    type: "entries",
    key: "entries",
    depthIncrement: 1
}, {
    type: "options",
    key: "entries"
}, {
    type: "inset",
    key: "entries",
    depth: 2
}, {
    type: "insetReadaloud",
    key: "entries",
    depth: 2
}, {
    type: "variant",
    key: "entries",
    depth: 2
}, {
    type: "variantInner",
    key: "entries",
    depth: 2
}, {
    type: "actions",
    key: "entries",
    depth: 2
}, {
    type: "flowBlock",
    key: "entries",
    depth: 2
}, {
    type: "optfeature",
    key: "entries",
    depthIncrement: 1
}, {
    type: "patron",
    key: "entries"
}, ];
Renderer.ENTRIES_WITH_ENUMERATED_TITLES_LOOKUP = Renderer.ENTRIES_WITH_ENUMERATED_TITLES.mergeMap(it=>({
    [it.type]: it
}));
Renderer._splitByTagsBase = function(leadingCharacter) {
    return function(string) {
        let tagDepth = 0;
        let char, char2;
        const out = [];
        let curStr = "";
        let isLastOpen = false;

        const len = string.length;
        for (let i = 0; i < len; ++i) {
            char = string[i];
            char2 = string[i + 1];

            switch (char) {
            case "{":
                isLastOpen = true;
                if (char2 === leadingCharacter) {
                    if (tagDepth++ > 0) {
                        curStr += "{";
                    } else {
                        out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter));
                        curStr = `{${leadingCharacter}`;
                        ++i;
                    }
                } else
                    curStr += "{";
                break;

            case "}":
                isLastOpen = false;
                curStr += "}";
                if (tagDepth !== 0 && --tagDepth === 0) {
                    out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter));
                    curStr = "";
                }
                break;

            case leadingCharacter:
                {
                    if (!isLastOpen)
                        curStr += "<VE_LEAD>";
                    else
                        curStr += leadingCharacter;
                    break;
                }

            default:
                isLastOpen = false;
                curStr += char;
                break;
            }
        }

        if (curStr)
            out.push(curStr.replace(/<VE_LEAD>/g, leadingCharacter));

        return out;
    }
    ;
}
;
Renderer.splitFirstSpace = function(string) {
    const firstIndex = string.indexOf(" ");
    return firstIndex === -1 ? [string, ""] : [string.substr(0, firstIndex), string.substr(firstIndex + 1)];
}
;

Renderer._splitByPipeBase = function(leadingCharacter) {
    return function(string) {
        let tagDepth = 0;
        let char, char2;
        const out = [];
        let curStr = "";

        const len = string.length;
        for (let i = 0; i < len; ++i) {
            char = string[i];
            char2 = string[i + 1];

            switch (char) {
            case "{":
                if (char2 === leadingCharacter)
                    tagDepth++;
                curStr += "{";

                break;

            case "}":
                if (tagDepth)
                    tagDepth--;
                curStr += "}";

                break;

            case "|":
                {
                    if (tagDepth)
                        curStr += "|";
                    else {
                        out.push(curStr);
                        curStr = "";
                    }
                    break;
                }

            default:
                {
                    curStr += char;
                    break;
                }
            }
        }

        if (curStr)
            out.push(curStr);
        return out;
    }
    ;
}
;

Renderer.splitByTags = Renderer._splitByTagsBase("@");
Renderer.splitByPropertyInjectors = Renderer._splitByTagsBase("=");
Renderer.splitTagByPipe = Renderer._splitByPipeBase("@");
//#endregion


