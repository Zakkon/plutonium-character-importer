class CharacterSelectScreen {
    constructor(){

    }

    myContent;

    render(){
        const _root = $("#window-root");

        const content = $$`<div></div>`;

        const btnNew = $$`<button>Create A Character</button>`;
        btnNew.click(() => {
            this.createNewCharacter();
        });

        const header = $$`
        <div class="character-screen-header">
            <h1>My Characters</h1>
            ${btnNew}
        </div>`;

        header.appendTo(content);

        const list = $$`<ul class="character-listing my-characters-listing">
        </ul>`;

        const hierarchy = $$`
        <div>
        ${list}
        </div>
        `;
        hierarchy.appendTo(content);

        content.appendTo(_root);
        this.myContent = content;

        const infos = CookieManager.getAllCharacterInfos();
        console.log("INFOS", infos)
        for(let ix = 0; ix < infos.length; ++ix){
            const result = infos[ix];
            const card = this.createCharacterElement(this, result.uid);
            card.appendTo(list);
        }
    }



    createCharacterElement(parent, charIx){
        const defaultIconUrl = `charbuilder/img/default_img.jpg`;
        const url = `url(${defaultIconUrl})`;

        const btnEdit = $$`<button class="character-card-footer-links-button">Edit</button>`;
        btnEdit.click(() => {
            parent.openCharacter(charIx, false);
        });
        const btnDelete = $$`<button class="character-card-footer-links-button btn-dangerous">Remove</button>`;
        btnDelete.click(() => {
            parent.deleteCharacter(ix);
        });

        let div = $$`
        <li class="character-card-wrapper">
            <div class="character-card">
                <div class="character-card-header">
                    <div class="character-card-background-image">
                    </div>
                    <div class="character-card-header-upper">
                        <div class="character-card-header-upper-portrait">
                            <div class="user-selected-avatar image" style="background-image: ${url}"></div>
                        </div>
                        <div class="character-card-header-upper-info">
                            <h2 class="character-card-header-upper-info-header">Name goes here</h2>
                            <div class="character-card-header-upper-info-secondary">Level 1 | Wood Elf | Ranger</div>
                        </div>
                    </div>
                </div>
                <div class="character-card-footer">
                    <div class="character-card-footer-links">
                        <button class="character-card-footer-links-button">View</button>
                        ${btnEdit}
                        <button class="character-card-footer-links-button btn-dangerous">Delete</button>
                    </div>
                </div>
            </div>
            </div>
            <div class="character-card-header"></div>
            </div>
        </li>`;
        return div;
    }

    close(){
        this.myContent.remove();
    }
    createNewCharacter(){
        this.close();
        SourceManager.defaultStart({actor:null});
    }
    deleteCharacter(uid){
        CookieManager.deleteCharacter(uid);
    }
    openCharacter(uid, toSheet){
        this.close();
        SourceManager.defaultStart({actor:null, cookieIx:uid});
    }
}