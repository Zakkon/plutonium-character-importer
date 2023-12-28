class ActorImporter {
    _state;
    _data;
    static api;

    handleWebSaveFile(savefile){
        //Assume save file has been parsed from JSON already

        //We need to create a _state
        _createState();
        //We also need to create a _data that contains the content we are using
        if(savefile.includesSourceContent){this._createData_FromSaveFile();}
    }

    async _prepareImport_Class({taskRunner:myRunner}){ //_pHandleSaveClick_class function
        const ourClassSources=[]; //Array of objects, each obj contains full class and full subclass data, along with bool if primary
        //Let's populate it by going through all of the references to classes we have on us, and grab the full class source for each
        for(let ix1=0;ix1<this._state.class_ixMax+1;++ix1){
            //Example: propIxClass = class_0_ixClass, propIxSubclass = class_0_subclass_ixSubclass
            const {propIxClass:prop_IxClass,propIxSubclass:prop_IxSubclass}=MancerBaseComponent.class_getProps(ix1),
            myClassSource=this.getClass_({'propIxClass':prop_IxClass}); //Get our class (with all data) using the correct index which _state tells us
    
            console.log(myClassSource);
            if(!myClassSource) {continue;} //This should be an entire class object, all features and everything, up to lvl 20. its the same as the class json
            for(let f of myClassSource.classFeatures)
            { if (typeof f !== "object") {console.error("Class features not set up correctly"); break; return;} }
            
            const mySubclassSource=this._getSubclass ({'cls':myClassSource, 'propIxSubclass':prop_IxSubclass });
    
            ourClassSources.push({
                'ix':ix1, //index of class (in relation to how many we have on us)
                'cls':myClassSource, //full class object
                'sc':mySubclassSource, //full subclass object (or null) (chosen subclass)
                'isPrimary':this._state.class_ixPrimaryClass===ix1 //says if this is primary true/false
            });
        }
    
        //For the next part to continue, we need to have at least one class in the array
        if(ourClassSources['length']){
          //Sort the classes (i guess primary goes first?)
            ourClassSources.sort((a,b)=>SortUtil.ascSort(Number(b.isPrimary), Number(a.isPrimary)) || SortUtil.ascSort(a.cls.name, b.cls.name));
    
          
            const importList = new ActorImporter.api.importer.ImportListClass({actor:this._actor});
            await importList.pInit();

            //We are now going to create copies of the class and subclass objects, so we don't accidentally overwrite them with anything
            for(let ix2=0x0;ix2<ourClassSources.length;++ix2) {
            //Now we are looking at a single class, and perhaps a subclass attached to it.
            //Make the properties easily accessible objects, and create the copies
            const {ix:ix,cls:cls,sc:sc,isPrimary:isPrimary}=ourClassSources[ix2],
                myClass=MiscUtil.copy(cls), mySubclass=sc?MiscUtil.copy(sc):null;
    
            //Tweak the copies a little
            if(mySubclass)delete mySubclass['additionalSpells']; //if we have chosen a subclass, delete the additionalSpells part of it (its a copy anyway)
            if(mySubclass)myClass['subclasses']=[mySubclass]; //if we have chosen a subclass, make class.subclasses just be an array of our 1 subclass object
            else myClass['subclasses']=[]; //or just wipe class.subclasses array if we didn't have a subclass selected
    
    
            //Now we need to add some extra data that tells us which levels we are going to add
            let lvlsToAdd = [];for(let i = 0; i < this._state["class_"+ix+"_targetLevel"]; ++i){lvlsToAdd.push(i);}
            myClass['_foundrySelectedLevelIndices'] = lvlsToAdd;
            if(!myClass['_foundrySelectedLevelIndices']['length'])continue; //if no .length, continue. That must be a bug, because we should have at least one level (index 0, which is lvl1)
            
            //How we calculate starting proficiencies from a class differs depending if its our primary class, or a multiclass option
            //So we need to make sure that _foundryStartingProficiencyMode is set to the right mode
            myClass['_foundryStartingProficiencyMode']=isPrimary? //_foundryStartingProficiencyMode = isPrimary? primary mode. else, multiclass mode
                CharacterImporter.Charactermancer_Class_ProficiencyImportModeSelect['MODE_PRIMARY']:
                CharacterImporter.Charactermancer_Class_ProficiencyImportModeSelect['MODE_MULTICLASS']; //Say if we are singleclass or multiclass mode
            
            //Check if the hp increase mode is anything other than 0. 0=average, 1=min value, 2=max value, 3=roll, 4=roll(custom formula), 5=donotincreasehp
            const HP_INCREASE_MODE = 0;
            if(//this['_compClass']['compsClassHpIncreaseMode'][ix]
            HP_INCREASE_MODE
            ){
              //Ask the UI what mode and formula we set for the hp increase
              const {mode:_0x37ccf8,customFormula:_0x30c459}=(await this['_compClass']['compsClassHpIncreaseMode'][ix]['pGetFormData']())['data'];
              //Then make sure our class uses the same mode and formula
              myClass['_foundryHpIncreaseMode']=_0x37ccf8,
              myClass['_foundryHpIncreaseCustomFormula']=_0x30c459;
            }
    
            myClass['_foundryAllFeatures']=[];
            //Debug, circumvent the whole UI and just create formDatas using the features we have on hand
            let formDatas = await this._getFeatureFormData(myClass.classFeatures);
            console.log(formDatas);
            for(let fd of formDatas){
              if(fd?.data?.features?.length) //If our class gave us at least 1 feature
                myClass['_foundryAllFeatures'].push(...fd.data.features);
            }
            console.log("foundryAllFeatures");
            console.log(myClass._foundryAllFeatures);
    
            //Again ask the UI, this time for our class's FeatureOption's select
            //I think this list contains all the 'Features' (Spellcasting, Rage, Unarmored Defence, etc) that we're given by our class up to our level
            
            //We need to get the feature OptionSets
            //this creates a Charactermancer_FeatureOptionsSelect object which contains a lot more info than just the feature
            //These objects are normally created during runtime when settings are tweaked in the character creator UI.
            
            let _features = []; //DEBUG TO AVOID LOOP
            for(const _0x1862c4_ftoptsel of //this['_compClass']['compsClassFeatureOptionsSelect'][ix]
              _features
            )
            {
              //by converting it into a formdata, we get a lot of improvements. in all, it makes the feature readable and usable by foundry
              const _0x195903_ftoform=await _0x1862c4_ftoptsel['pGetFormData']() //Then get the formData from that (see Charactermancer_FeatureOptionsSelect.pGetFormData)
              //formData = {isFormComplete:true, data: {feature...}}
              //lets try that mockup
              //{isFormComplete:true, data: {feature...}}
              ,
              _0x237cd5={'system':{}};
    
              //I suspect this has something to do with formdata.data, maybe it gets double layered as data sometimes. either way, sometimes this does nothing
              //OH! i think this might be rage, ki points etc
              //it aborts if formData.data.formDatasResources is null or length of 0
              //---APPLY RESOURCES---
              //await CharacterImporter.Charactermancer_FeatureOptionsSelect['pDoApplyResourcesFormDataToActor']({'actor':this._actor,'formData':_0x195903_ftoform }),
              
              //---APPLY SENSES---
              //I suspect this has something to do with extra senses being granted by a feature, like blindsight
              //it aborts if formData.data.formDatasSenses is null or length of 0 
              /* await CharacterImporter.Charactermancer_FeatureOptionsSelect['pDoApplySensesFormDataToActor']({
                'actor':this._actor,
                'actorUpdate':_0x237cd5,
                'formData':_0x195903_ftoform,
                'configGroup':'importClassSubclassFeature'
              }); */
    
              //Now it gets interesting. We're finally pushing the features to the _foundryAllFeatures array.
              if(_0x195903_ftoform?.data?.features?.length) //If our class gave us at least 1 feature
                myClass['_foundryAllFeatures'].push(..._0x195903_ftoform.data.features); //push them to the _foundryAllFeatures array
    
              //Now its time to get a lot of stuff, like language, tool, weapon, armor, saves, condition and skill proficiencies, damage vulnerabilities, etc etc 
              //await Charactermancer_FeatureOptionsSelect.pDoApplyProficiencyFormDataToActorUpdate(this._actor, _0x237cd5,_0x195903_ftoform)
              //---APPLY PROFICIENCIES---
              await CharacterImporter.Charactermancer_FeatureOptionsSelect['pDoApplyProficiencyFormDataToActorUpdate'](this._actor,_0x237cd5,_0x195903_ftoform),
                (Object['keys'](_0x237cd5['system'])['length']||Object['keys'](_0x237cd5['prototypeToken']||
                //Here I think we update the document with that info!
                {})['length'])&&await UtilDocuments['pUpdateDocument'](this._actor,_0x237cd5,{'isRender':![]});
            }
    
    
    
            //Delete additionalSpells
            delete myClass['additionalSpells'],
            myClass['_foundryAllFeatures']['forEach'](_0x20b3a5=>delete _0x20b3a5?.['entity']?.['additionalSpells']);
    
    
            this['_isLevelUp']&&(myClass['_foundryConInitial']=this['_conInitialWithModifiers'],
              myClass['_foundryConFinal']=this['_conFinalWithModifiers']);
    
            
            myClass['_foundryIsSkipImportPreparedSpells']=!![], myClass['_foundryIsSkipImportCantrips']=!![],
              //--APPLY SKILL PROFICIENCIES--
              /* await this['_pHandleSaveClick_pDoApplySkills']([this['_compClass']['compsClassSkillProficiencies'][ix]],myClass,
                [...isPrimary?['startingProficiencies','skills']:['multiclassing','proficienciesGained','skills']]), */
                //--APPLY TOOL PROFICIENCIES--
              /* await this['_pHandleSaveClick_pDoApplyTools']([this['_compClass']['compsClassToolProficiencies'][ix]],
                myClass,...isPrimary?[['startingProficiencies','toolProficiencies'],['startingProficiencies','tools']]:[['multiclassing',
                'proficienciesGained','toolProficiencies'],['multiclassing','proficienciesGained','tools']]) */
              delete myClass['startingEquipment'];
    
            //const _0x2c5e9a=this['_compSpell']['compsSpellSpellSlotLevelSelect'][ix];
    
            //TEST
            //Right now as we import the class, its asking us to make choices like hit dice, skills, etc
            //A way to avoid these choices is to remove them from the class obj copy
            delete myClass.hd;
            delete myClass.startingProficiencies;
            //Let's double check if our class obj has classFeatures correctly set up
            
            //END TEST
    
            console.log("pImportClass time!");
            await this._importApplyClassToActor(myClass, importList, myRunner, _0x37641b);
    
            /* for(const _0x1cafa7 of this['_compClass']['compsClassFeatureOptionsSelect'][ix]){
              const _0x454e55=await _0x1cafa7['pGetFormData']();
              await Charactermancer_FeatureOptionsSelect['pDoApplyAdditionalSpellsFormDataToActor']({
                'actor':this['_actor'],
                'formData':_0x454e55,
                'abilityAbv':sc?.['spellcastingAbility']||cls['spellcastingAbility'],
                'taskRunner':myRunner
              });
            } */
          }
        }
    }

    /**Returns an array of formData. Converts classFeature objects into formDatas that FoundryVTT can import to actors, and beautifies the 'entries' string array. Requires the classFeature objects to be prepared with the 'loadeds' property. */
    async _getFeatureFormData(features){
        if(features.length && features[0].loadeds == null){console.error("Given features were not sufficiently prepared");}
        //We dont have that yet, so we need to figure out a way to create them.
        //when new Charactermancer_Class_LevelSelect is called, they don't have the entity property yet
        //its not changed in the constructor either
        //But when a Charactermancer_FeatureOptionsSelect is created, then the entity IS set
        //THe difference seems to be that a Charactermancer_Class_LevelSelect is created with a 'feature'
        //while Charactermancer_FeatureOptionsSelect is created with an 'optionsSet' which is similar but a bit different
        //this entire conversion is done in Charactermancer_Util.getFeaturesGroupedByOptionsSet

        //Send the features (they shouldn't have an 'entity' property yet). This function will create the 'entity' property, then pass it along and create optionSets from them.
        let featuresGroupedByOptionsSet = await this._createFeatureOptionSets({filteredFeatures: features});
        //Wow that we have the optionsSet, we can create a Charactermancer_FeatureOptionsSelect, which we can later use to grab the formData

        let counter = 0;
        let featOptSelects = [];
        for (const obj of featuresGroupedByOptionsSet) { //For each group
        //Get optionSets from this group
            const {topLevelFeature: topL, optionsSets: optSets} = obj;
            console.log("input optionSets:"); console.log(optSets);
            //if (topL.level < _0x1dec8f || topL.level > _0x38b4f6) { continue; } //we are not going to bother with the level of the feature for now
            if (topL.name.toLowerCase() === 'ability score improvement') {counter++; continue; }
            //Loop through the optionSets
            for (const set of optSets) {
            //Create a new Charactermancer_FeatureOptionsSelect for the optionsset
            //This might be bad, we could be creating an UI object here (although I don't think it goes anywhere)
                const feOptSel = new CharacterImporter.api.charactermancer.Charactermancer_FeatureOptionsSelect({ //Here is one of only 2 places where these are created. (other is _feat_pRenderFeatureOptionsSelects_)
                    //keep in mind 'this' is supposed to refer to a ActorCharactermancerClass. the parent is an ActorCharactermancer type object
                    'featureSourceTracker': null,//this._parent['featureSourceTracker_'], //what is parent? what is point of this tracker?
                    'existingFeatureChecker': null,//_0x4548cc_exstFeatureChk, //what is this and what is the point of it?
                    'actor': this._actor, //obvious
                    'optionsSet': set, //what this is all about
                    'level': topL.level,
                    'modalFilterSpells': null,//this._parent['compSpell']['modalFilterSpells']
                });
                featOptSelects.push(feOptSel); //Debug
                /* this['_compsClassFeatureOptionsSelect'][_0x4ba617]['push'](feOptSel),
                feOptSel['findAndCopyStateFrom'](_0x4b61c1_existingFeatures); */
            }
        }
        //this['_state'][_0x5c4b09] = counter
        /* ,await this['_class_pRenderFeatureComps'](_0x4ba617, {
            '$stgFeatureOptions': _0x15b372
        }) */
        //;
        
        console.log(featOptSelects);
        let output = [];
        for(let i = 0; i < featOptSelects.length; ++i){
        output.push(await featOptSelects[i].pGetFormData())
        }
        return output;
    }
    /** Used by _getFeatureFormData to create option sets. Only worry about the filteredFeatures input parameter for now.*/
    async _createFeatureOptionSets({ix: _0x4ba617, propCntAsi: _0x5c4b09, filteredFeatures: inputFeatures, $stgFeatureOptions: _0x15b372}){
        //this function mimics _class_pRenderFeatureOptionsSelects_
        const //_0x4548cc_exstFeatureChk = this['_existingClassMetas'][_0x4ba617] ? new CharacterImporter.Charactermancer_Class_Util['ExistingFeatureChecker'](this['_actor']) : null,
        //filteredFeatures is just all the features for our class, there are some rare cases when we don't want to import certain features
        //_0x336be4 = CharacterImporter.Charactermancer_Util.getImportableFeatures(inputFeatures),
        _0x117b40 = MiscUtil.copy(inputFeatures);//_0x336be4); //Create a copy of it as well
        
        //Create groups of optionsets
        const optionSets = CharacterImporter.Charactermancer_Util.getFeaturesGroupedByOptionsSet(_0x117b40)
        //, {lvlMin: _0x1dec8f, lvlMax: _0x38b4f6} = await this._class_pGetMinMaxLevel(_0x4ba617)
        ;

        /* console.log("lvlMin: " + lvlMin);
        console.log("lvlMax: " + lvlMax); */
        console.log(optionSets);
        return optionSets;
    }
    /**Unstable. Tries to gather which levels you actually need to pull data for, based on UI. Intended for use with UI. */
    async _class_pGetMinMaxLevel(classIndex){
        //you can call it like this: const {lvlMin: min, lvlMax: max} = await this._class_pGetMinMaxLevel(classIx);
        //based on async[_0x1467c8(0xa8)]
        let min=0, max=0;
        if(this['_compsClassLevelSelect'][classIndex]){ //Just make sure we actually have the class matching the index cached
        const data=await this['_compsClassLevelSelect'][classIndex]['pGetFormData']()['data'];
        min=Math.min(...data)+1,max=Math.max(...data)+1;
        }
        return {'lvlMin':min,'lvlMax':max};
    }
    /**Imports features, skills, class, etc to the actor. The things imported depend on what is listed in the _class object. */
    async _importApplyClassToActor(_class, importList, taskRunner, filterValues){
        return await importList.pImportClass(_class,{
        'filterValues':filterValues,
        'isCharactermancer':!![],
        'spellSlotLevelSelection':null,//_0x2c5e9a?.['isAnyChoice']()?_0x2c5e9a['getFlagsChoicesState']():null,
        'taskRunner':taskRunner
        });
    }

    _createState(){
        let state = {};
        //Let's start by seeing how many classes the character has
        state.class_totalLevels = 0;
        state.class_ixPrimaryClass = 0 //Lets assume primary class always is the first in the array
        for(let i = 0; i< savefile.classes.length; ++i){
            let cls = savefile.classes[i];
            state["class_"+i+"_curLevel"] = 0; //Assume we start with no existing levels
            state["class_"+i+"_targetLevel"] = cls.level;
            state.class_totalLevels += cls.level;
            state["class_"+i+"_ixClass"] = i //Unique index of this class
            //state.class_0_cntAsi: 0, //How many ability score improvements are we going past?
        }
        state.class_ixMax = savefile.classes.length-1;
        state.class_pulseChange = true; //not sure what this does
        this._state = state;
        /* this._state = {
            class_0_cntAsi: 0, //How many ability score improvements are we going past?
            class_0_curLevel:0, //starting level
            class_0_ixClass:0, //index of the class in the dropdown menu
            class_0_targetLevel:1, //target level of the class
            class_ixMax: 0, //highest index of the classes we are using (think of it like classesUsed.count-1)
            class_ixPrimaryClass:0, //index of the primary class (in relation to how many classes we have)
            class_pulseChange:true, //not sure
            class_totalLevels: 1, //how many level ups
          } */
    }
    _createData_FromSaveFile(savefile){
        let data = {class: [], subclass:[], classFeature:[], subclassFeature:[]};
        for(let i = 0; i < savefile._sourceContent.length; ++i){
            let content = savefile._sourceContent[i];
            data.class = data.class.concat(content.class);
            data.subclass = data.subclass.concat(content.subclass);
            data.classFeature = data.classFeature.concat(content.classFeature);
            data.subclassFeature = data.subclassFeature.concat(content.subclassFeature);
        }
        this._data = data;
        this._cookData();
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

    /**Returns a class. _state should contain a property with the same name as propIxClass, which has the index of the class in _data.classes. As a fallback, ix is the index of the class in _data.classes.*/
    getClass_({ix:classIx,propIxClass:pi}){
        if(classIx==null&&pi==null)throw new Error("Unable to fetch class, no index given");
        if(pi!=null){
          if(this._state[pi]==null){return null;}
          //bitwise NOT operation (google it). havent seen it trigger yet
          if(!~this._state[pi]){console.warn("getClassStub"); return DataConverterClass.getClassStub();} //this._state[_0x21ca68]) return DataConverterClass["getClassStub"]
          return this._data.class[this._state[pi]];
        }
        if(classIx!=null&&~classIx){return this._data.class[classIx];}
        console.warn("getClassStub");
        return DataConverterClass.getClassStub();
    }
    _getSubclass({cls:c,propIxSubclass:pi,ix:i}){
    if(i==null&&pi==null)throw new Error("Unable to fetch subclass, no index given");
    if(!c)return null;
    if(pi!=null){
        if(this._state[pi]==null)return null;
        if(!~this._state[pi])return DataConverterClass.getSubclassStub({'cls':c});
        if(!c.subclasses?.length)return DataConverterClass.getSubclassStub({'cls':c}); //c.subclasses?.
        return c.subclasses[this._state[pi]];
    }
    if(i!=null&&~i)return c.subclasses[i];
    return DataConverterClass.getSubclassStub({'cls':c});
    }
}