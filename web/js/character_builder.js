testvar = "apple";
uiClass = null;

document.addEventListener('DOMContentLoaded', function () {
    //setShowMoreClassOptions(false);
    // Get the HTML elements by their IDs
    var titleLabel = document.getElementById('titleLabel');
   
    

    //$('.left-content').append(createClassChoiceDiv());

    // Check if the elements exist before trying to modify them
    if (titleLabel) {
        // Modify the text content of the label
        titleLabel.textContent = 'Dynamic Label Text';
    }

});
window.addEventListener('load', function () {
    uiClass = new UIObj_Class($('.left-content'));
    uiClass.createClassChoiceDiv();

    let exportBtn = $(document).find("#btn_export");
    exportBtn.on('click', () => {
        e_onPressExportButton();
    });
});


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

    constructor(parentDiv){
        this.parentDiv = parentDiv;
    }
    createClassChoiceDiv(){
        var mainDiv = $('<div>', { class: 'classChoicePage' });
        this.parentDiv.append(mainDiv);
        
        this.createClassSelectZone(mainDiv);
        
    
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
        this.compLevelSelector = new UIObj_Class_LevelSelect(this.holder_levelSelect
        /*{
        'features': _0xab8fed,
        'isRadio': true,
        'isForceSelect': false,//this.getExistingClassTotalLevels_() === 0x0 || !_0xa230b0,
        'maxPreviousLevel': 0,//_0xa230b0?.["level"],
        'isSubclass': false
      }*/);

    

    }
    createClassSelectZone(mainDiv){
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
                <select class="class_select"></select>
            </div>
        </div>
        </div>`;
        var botDiv = $.parseHTML(classSelectHTML);
        let classSelect = $(botDiv).find(".class_select");
        this.refreshClassChoiceOptions(classSelect);
        classSelect.on('change', () => {
            this.e_onChangeSelectedClass(mainDiv, classSelect);
          });
    
        // Append nested divs to the main container
        selectMainDiv.append(topDiv, botDiv);
    
        mainDiv.append(selectMainDiv);
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

    e_onChangeSelectedClass(classChoiceDiv, classDropdown){
        console.log(this);
        //var subclassDropdown = document.getElementById('class_dropdown_subclass');
        //Check if we need to rebuild subclass choices
        let choice = classDropdown[0].selectedIndex > 0 ? this.getClasses()[classDropdown[0].selectedIndex-1] : null;
        if(choice != this.curClass){
            //refreshSubclassChoiceOptions(subclassDropdown, choice);
            this.compHpIncreaseMode.refresh(choice);
            this.compHitPoints.refresh(choice);
            this.compStartingProficiencies.refresh(choice);
            this.compSkillSelector.refresh(choice);
            this.compLevelSelector.refresh(choice);
        }
        // Check if the selected value is not empty or "-"

        if (classDropdown[0].selectedIndex > 0) { this.setShowMoreClassOptions(classChoiceDiv, true);
            //this.refreshHitpoints(classChoiceDiv, choice);
            //refreshStartingProficiencies(classChoiceDiv, choice);
            //refreshSkillProficiencyChoices(classChoiceDiv, choice);
            //this.levelSelector.refresh(choice);
            //refreshSelectLevelList(classChoiceDiv, choice);
        }
        else {
            //this.levelSelector.refresh(null);
            //this.setShowMoreClassOptions(classChoiceDiv, false);
        }
        
    
        this.curClass = choice;
        //outputCharacter();
    }
    getClasses(){

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
        let jsons = [class_barbarian, class_bard];
        let classes = [];
        for(let str of jsons){
            let data = JSON.parse(str);
            classes.push(data.class[0]);
        }


        return classes;
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
class UIObj_BaseClassComponent {
    parentElement;
    constructor(parentDiv) {
        this.parentElement = parentDiv;
    }
    empty(){
        this.parentElement.html("");
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
                    <div class="mr-1 bold inline-block">Armor:</div>
                    <div class="inline-block ">light armor<div class="ve-small veapp__msg-warning inline-block" title=""></div>
        </div>
    </div>
    <div class="block">
        <div class="mr-1 bold inline-block">Weapons:</div>
        <div class="inline-block mr-1">simple weapons<div class="ve-small veapp__msg-warning inline-block" title="">
        </div>,
        </div>
        <div class="inline-block mr-1"><a href="https://5etools-mirror-1.github.io/items.html#hand%20crossbow_phb" onmouseover="Renderer.hover.pHandleLinkMouseOver(event, this)" onmouseleave="Renderer.hover.handleLinkMouseLeave(event, this)" onmousemove="Renderer.hover.handleLinkMouseMove(event, this)" data-vet-page="items.html" data-vet-source="phb" data-vet-hash="hand%20crossbow_phb" ontouchstart="Renderer.hover.handleTouchStart(event, this)">hand crossbow</a>
        <div class="ve-small veapp__msg-warning inline-block" title="">
        </div>,
        </div>
        <div class="inline-block mr-1">
        <a href="https://5etools-mirror-1.github.io/items.html#longsword_phb" onmouseover="Renderer.hover.pHandleLinkMouseOver(event, this)" onmouseleave="Renderer.hover.handleLinkMouseLeave(event, this)" onmousemove="Renderer.hover.handleLinkMouseMove(event, this)" data-vet-page="items.html" data-vet-source="phb" data-vet-hash="longsword_phb" ontouchstart="Renderer.hover.handleTouchStart(event, this)">longsword</a>
        <div class="ve-small veapp__msg-warning inline-block" title="">
        </div>,</div><div class="inline-block mr-1">
        <a href="https://5etools-mirror-1.github.io/items.html#rapier_phb" onmouseover="Renderer.hover.pHandleLinkMouseOver(event, this)" onmouseleave="Renderer.hover.handleLinkMouseLeave(event, this)" onmousemove="Renderer.hover.handleLinkMouseMove(event, this)" data-vet-page="items.html" data-vet-source="phb" data-vet-hash="rapier_phb" ontouchstart="Renderer.hover.handleTouchStart(event, this)" style="">rapier</a><div class="ve-small veapp__msg-warning inline-block" title=""></div>,</div><div class="inline-block "><a href="https://5etools-mirror-1.github.io/items.html#shortsword_phb" onmouseover="Renderer.hover.pHandleLinkMouseOver(event, this)" onmouseleave="Renderer.hover.handleLinkMouseLeave(event, this)" onmousemove="Renderer.hover.handleLinkMouseMove(event, this)" data-vet-page="items.html" data-vet-source="phb" data-vet-hash="shortsword_phb" ontouchstart="Renderer.hover.handleTouchStart(event, this)" style="">shortsword</a><div class="ve-small veapp__msg-warning inline-block" title=""></div>
        </div>
    </div><div class="block">
        <div class="mr-1 bold inline-block">Saving Throws:</div><div class="inline-block mr-1">Dexterity<div class="ve-small veapp__msg-warning inline-block" title=""></div>,</div><div class="inline-block ">Charisma<div class="ve-small veapp__msg-warning inline-block" title=""></div></div>
        </div></div>`;
        this.parentElement.append($.parseHTML(startingProfHTML));
    }
    refreshStartingProficiencies(classInfo){
        let startingProfs = classInfo.startingProficiencies;
        let element = this.parentElement.find("#starting_proficiencies_parent");
    
        //ARMOR
        console.log(startingProfs);
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
        let mainDiv = this.parentElement.find("#skill_proficiency_choice_parent");
        console.log(options);
        mainDiv.html("");
        mainDiv.parent().children().eq(0).html("Choose "+chooseNum+" Skill Proficiencies:");
        for(let option of options){
            let ability = SKILL_TO_ABILITY_ABV[option.toUpperCase()];
            let html = `<label class="ve-flex-v-center py-1 stripe-even">
            <div class="col-1 ve-flex-vh-center">
                <input type="checkbox"></div>
                <div class="col-11 ve-flex-v-center">
                    <div class="ve-flex-v-center w-100">
                        <div class="ve-flex-v-center">
                            <div class="ve-inline-flex-v-center">
                                <span class="help help--hover" onmouseover="Renderer.hover.pHandleLinkMouseOver(event, this)" onmouseleave="Renderer.hover.handleLinkMouseLeave(event, this)" onmousemove="Renderer.hover.handleLinkMouseMove(event, this)" data-vet-page="skill" data-vet-source="PHB" data-vet-hash="animal%20handling_phb" data-vet-is-faux-page="true" ontouchstart="Renderer.hover.handleTouchStart(event, this)">
                                `+toTitleCase(option)+`
                                </span><div class="ml-1 ve-small ve-muted" title="`+ABILITY_ABV_TO_FULL[ability]+`">(`+toTitleCase(ability)+`)
                                </div></div></div>
            <div class="ve-small veapp__msg-warning" title=""></div>
        </div></div>
        </label>`;
        mainDiv.append($.parseHTML(html));
    
        }
    }
}
class UIObj_Class_LevelSelect extends UIObj_BaseClassComponent{
    _features = null;
    _isRadio = true;
    _isForceSelect = true;
    _maxPreviousLevel = 0;
    _list = null;
    _fnsOnChange = null;
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
        this.setChosenLevel(1);
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
            return DataUtil.unpackUidClassFeature(uid);
        });
        this._features = this.constructor.groupByLevel(objs);
        
        //let levelSlots = new Array(20); for(let i = 0; i < levelSlots.length; ++i){levelSlots[i] = [];}
        
        console.log(this._features);

        const $cbAll = this._isRadio ? null : $(`<input type="checkbox" name="cb-select-all">`);
        const $wrpList = $(`<div class="veapp__list mb-1"></div>`);
        this._list = new List({
            $wrpList: $wrpList,
            fnSort: null,
            isUseJquery: true,
        });

        this._listSelectClickHandler = new ListSelectClickHandler({list: this._list});

        for (let ix = 0; ix < this._features.length; ++ix) {
            const $cb = this._render_$getCbRow(ix); //Create radio button
            const $dispFeatures = $(`<span class="col-9-5"></span>`);
            const fnUpdateRowText = ()=>$dispFeatures.text(this.constructor._getRowText(this._features[ix]));
            fnUpdateRowText();
            const $li = $(`<label class="w-100 ve-flex veapp__list-row veapp__list-row-hoverable ${this._isRadio && this._isForceSelect
                && ix <= this._maxPreviousLevel ? `list-multi-selected` : ""} ${ix < this._maxPreviousLevel ? `ve-muted` : ""}">
				<span class="col-1 ve-flex-vh-center">${$cb[0].outerHTML}</span>
				<span class="col-1-5 ve-text-center">${ix + 1}</span>
				${$dispFeatures[0].outerHTML}
			</label>`).click((evt)=>{
                this._handleSelectClick(listItem, evt);
            }
            );

            const listItem = new ListItem(ix, $li, "", {}, {
                cbSel: $cb[0],
                fnUpdateRowText,
            },);
            this._list.addItem(listItem);
        }

        if (!this._isRadio) {this._listSelectClickHandler.bindSelectAllCheckbox($cbAll);}

        this._list.init();
        $wrpList.appendTo(listDiv);

       /*  $(`<div class="ve-flex-col min-h-0">
			<div class="ve-flex-v-stretch input-group mb-1 no-shrink">
				<label class="btn btn-5et col-1 px-1 ve-flex-vh-center">${$cbAll}</label>
				<button class="btn-5et col-1-5">Level</button>
				<button class="btn-5et col-9-5">Features</button>
			</div>

			${$wrpList}
		</div>`).appendTo(listDiv); */

        /* for(let f of features){
            //Get the number at the end
            //console.log(f);
            if (typeof f === 'string' || f instanceof String){}
            else{f = f.classFeature;}
            let words = f.split("|");
            //Find the word that is just a number
            let lvlNum = -1;
            for(let word of words){if(Number.parseInt(word)){lvlNum = Number.parseInt(word);}}
            levelSlots[lvlNum-1].push(words[0]);
        }
        
        for(let lvl = 1; lvl <= 20; ++lvl){
            let featureText = "";
            for(let i = 0; i < levelSlots[lvl-1].length; ++i){
                featureText += levelSlots[lvl-1][i];
                if(i+1<levelSlots[lvl-1].length){featureText += ", ";}
            }
            let html = `<label class="w-100 ve-flex veapp__list-row veapp__list-row-hoverable list-multi-selected">
                <span class="col-1 ve-flex-vh-center"><input type="radio" class="no-events"></span>
                <span class="col-1-5 ve-text-center">`+lvl+`</span>
                <span class="col-9-5">`+featureText+`</span>
            </label>`;
            listDiv.append($.parseHTML(html));
        } */
    }
    setChosenLevel(level){

    }

    _handleSelectClick(listItem, evt) {
        if (!this._isRadio){return this._listSelectClickHandler.handleSelectClick(listItem, evt);}

        const isCheckedOld = listItem.data.cbSel.checked;
        const isDisabled = this._handleSelectClickRadio(this._list, listItem, evt);
        if (isDisabled){return;}

        const isCheckedNu = listItem.data.cbSel.checked;
        if (isCheckedOld !== isCheckedNu){this._doRunFnsOnchange();}
    }
    _handleSelectClickRadio(list, item, evt) {
        evt.preventDefault();
        evt.stopPropagation();

        if (item.data.cbSel.disabled){return true;}

        list.items.forEach(it=>{
            if (it === item) {
                if (it.data.cbSel.checked && !this._isForceSelect) {
                    it.data.cbSel.checked = false;
                    it.ele.removeClass("list-multi-selected");
                    return;
                }

                it.data.cbSel.checked = true; //original
                it.ele.addClass("list-multi-selected");
            }
            else
            {
                it.data.cbSel.checked = false;
                if (it.ix < item.ix) {it.ele.addClass("list-multi-selected");}
                else {it.ele.removeClass("list-multi-selected");}    
            }
        });
        console.log("HandleSelectClickRadio complete");
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
            let levelOfClass = 1;
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
class DataUtil{
    static SRC_PHB = "PHB";
    /**Takes a UID from a class feature (like Rage|Barbarian|1|PHB) and unpacks it into separate values*/
    static unpackUidClassFeature (uid, opts) {
        opts = opts || {};
        if (opts.isLower) uid = uid.toLowerCase();
        let [name, className, classSource, level, source, displayText] = uid.split("|").map(it => it.trim());
        classSource = classSource || (opts.isLower ? DataUtil.SRC_PHB.toLowerCase() : DataUtil.SRC_PHB);
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
String.prototype.toAscii = String.prototype.toAscii || function() {
    return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Æ/g, "AE").replace(/æ/g, "ae");
}
;


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