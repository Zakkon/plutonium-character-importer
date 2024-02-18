import { BaseComponent } from "./basecomponent.js";

class FolderPathBuilderRowTextOnly extends BaseComponent {
    constructor(folderMeta, {fnOnKeydown, folderType}={}) {
        super();
        this._folderMeta = folderMeta;
        this._$row = null;
        this._fnOnKeydown = fnOnKeydown;
        this._folderType = folderType;
    }

    get $row() {
        return this._$row;
    }

    set isJournalEntryName(val) {
        this._state.isJournalEntryName = !!val;
    }

    _$getDispIsJournalEntry() {
        const $dispIsJournalEntry = $(`<div class="ve-muted ve-small italic help-subtle" title="Imported entities will be created as pages within a journal entry with this name. If you would prefer to have each page imported to its own journal entry with this name, click to open the Config, and disable the &quot;Treat Journal Entries as Folders&quot; option.">Journal Entry name</div>`).on("click", evt=>Config.pOpen({
            evt,
            initialVisibleGroup: "journalEntries"
        }));
        const hkIsJournalEntry = ()=>$dispIsJournalEntry.toggleVe(this._state.isJournalEntryName);
        this._addHookBase("isJournalEntryName", hkIsJournalEntry);
        hkIsJournalEntry();
        return $dispIsJournalEntry;
    }

    render($parent, parent) {
        this._parent = parent;

        const $dispIsJournalEntry = this._$getDispIsJournalEntry();

        const $iptName = ComponentUiUtil.$getIptStr(this, "text").attr("type", "text").addClass("mr-2");
        if (this._fnOnKeydown)
            $iptName.keydown(evt=>this._fnOnKeydown(evt));

        const $btnRemove = $(`<button class="btn btn-danger btn-xs"><span class="fas fa-fw fa-trash"></span></button>`).click(()=>{
            const {removeRow} = this._parent;
            removeRow(this);
        }
        );

        this._$row = $$`<div class="ve-flex-v-center w-100 my-1 imp-folder__row">
			<div class="ve-flex-col w-100 min-w-0">
				${$dispIsJournalEntry}
				${$iptName}
			</div>
			${DragReorderUiUtil.$getDragPad2(()=>this._$row, $parent, this._parent)}
			${$btnRemove}
		</div>`.appendTo($parent);
    }

    _getDefaultState() {
        return {
            ...FolderPathBuilderRowTextOnly._DEFAULT_STATE
        };
    }

    static getStateFromDefault_(val, {...rest}={}) {
        const comp = new FolderPathBuilderRowTextOnly({
            ...rest
        });
        comp.__state.text = val;
        return comp.__state;
    }
}
FolderPathBuilderRowTextOnly._DEFAULT_STATE = {
    text: "",
    isFreeText: true,
    isJournalEntryName: false,
};

class FolderPathBuilderRow extends FolderPathBuilderRowTextOnly {
    render($parent, parent) {
        this._parent = parent;

        const $dispIsJournalEntry = this._$getDispIsJournalEntry();

        const $btnToggleFreeText = ComponentUiUtil.$getBtnBool(this, "isFreeText", {
            $ele: $(`<button class="btn btn-xs mr-1 imp-folder__btn-mode">Custom</button>`)
        });

        const $iptName = ComponentUiUtil.$getIptStr(this, "text").attr("type", "text");
        if (this._fnOnKeydown)
            $iptName.keydown(evt=>this._fnOnKeydown(evt));
        const $wrpFreeText = $$`<div class="ve-flex mr-1 w-100">${$iptName}</div>`;

        const folderMetaKeys = Object.keys(this._folderMeta).sort((a,b)=>SortUtil.ascSortLower(this._folderMeta[a].label, this._folderMeta[b].label));
        const $selProp = ComponentUiUtil.$getSelEnum(this, "selectedProp", {
            values: folderMetaKeys,
            isAllowNull: true,
            fnDisplay: (k)=>this._folderMeta[k].label,
        }, );
        const $wrpSelProp = $$`<div class="ve-flex mr-1 w-100">${$selProp}</div>`;

        const hookFreeText = ()=>{
            $wrpFreeText.toggleClass("ve-hidden", !this._state.isFreeText);
            $wrpSelProp.toggleClass("ve-hidden", this._state.isFreeText);
        }
        ;
        hookFreeText();
        this._addHookBase("isFreeText", hookFreeText);

        const $btnRemove = $(`<button class="btn btn-danger btn-xs"><span class="fas fa-fw fa-trash"></span></button>`).click(()=>{
            const {removeRow} = this._parent;
            removeRow(this);
        }
        );

        this._$row = $$`<div class="ve-flex-v-center w-100 my-1 imp-folder__row">
			${$btnToggleFreeText}
			<div class="ve-flex-col w-100">
				${$dispIsJournalEntry}
				${$wrpFreeText}
				${$wrpSelProp}
			</div>
			${DragReorderUiUtil.$getDragPad2(()=>this._$row, $parent, this._parent)}
			${$btnRemove}
		</div>`.appendTo($parent);
    }

    _getDefaultState() {
        return {
            ...FolderPathBuilderRow._DEFAULT_STATE
        };
    }

    static getStateFromDefault_(val, {folderPathMeta, ...rest}={}) {
        const comp = new FolderPathBuilderRow({
            ...rest
        });
        if (val?.metaKey) {
            if (!folderPathMeta?.[val.metaKey])
                throw new Error(`Folder path meta key "${val.metaKey}" was not found in the available values!`);
            comp.__state.isFreeText = false;
            comp.__state.selectedProp = val.metaKey;
        } else {
            comp.__state.text = val;
        }
        return comp.__state;
    }

    static getStateFromFolder_(fld) {
        return {
            ...FolderPathBuilderRow._DEFAULT_STATE,
            text: fld.name,
            isFreeText: true,
        };
    }
}
FolderPathBuilderRow._DEFAULT_STATE = {
    isFreeText: true,
    text: "",
    selectedProp: null,
};

export {FolderPathBuilderRowTextOnly, FolderPathBuilderRow}