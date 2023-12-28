class CharacterBuilder{


    /**Create a very general save file. FoundryVTT can later use this to create a more in-depth save file for importing stuff */
    prepareSaveFile(){
        let save = {
            name: "TestCharacter",
            classes: [
                {name: "Barbarian", source: "PHB", level: 1, }
            ],
            race: {name: "Human", source: "PHB" },
            sourcesUsed: ["PHB"],
            includesSourceContent: false,
            _sourceContent: [
                {
                    sourceName: "PHB",
                    classes: [
                        //put all the classes we are using from the PHB here
                    ],
                    subclasses: [],
                    classFeatures: [],
                    subclassFeatures: [],
                },
            ],
        };
    return save;
    }
    /**Create a save file that Foundry VTT use on an actor, to import all the features needed for that */
    prepareSaveFileFvtt(){

    }
}