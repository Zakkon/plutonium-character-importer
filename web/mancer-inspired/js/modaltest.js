class TestModal {
    constructor(){
        this._wrapper = $("#modalwrp");
    }
    _render(){

        
        

        const btn = $$`<button>Close</button>`.click(()=>{
            this.modal[0].close();
        });

        const el = $$`<dialog data-modal>
        <div>This is a modal</div>
        ${btn}
        </dialog>`;
        this.element = el;

        this._wrapper.append(this.element);

        const mod = this.element[0];
        console.log("MOD", mod);
        mod.showModal();
    }
    close(){

    }
}