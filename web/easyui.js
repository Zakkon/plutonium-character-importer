function buildUI_class(){
    const _0x3e5d60 = $(`<div class="ve-flex-col w-100 h-100 px-1 pt-1 overflow-y-auto ve-grow veapp__bg-foundry"></div>`);
    const _0x47c29f = $(`<div class="ve-flex-col w-100 h-100 px-1 overflow-y-auto ve-grow veapp__bg-foundry"></div>`);
    const _0x26fcb4 = $("<button class=\"btn btn-5et btn-sm\">Add Another Class</button>").click(() => {
        this._class_renderClass(_0x3e5d60, _0x47c29f, ++this._state.class_ixMax);
      });
    let parentDiv = $(document).find("#content_window");
    console.log(parentDiv);
    renderClass(parentDiv);
    //const small = $(`<div class="small"></div>`);
    $(`<div class="ve-flex w-100 h-100">
              <div class="ve-flex-col w-100">
                  ${_0x3e5d60[0].outerHTML}
                  <div class="mt-2">${_0x26fcb4[0].outerHTML}</div>
              </div>
              <div class="vr-1"></div>
              ${_0x47c29f[0].outerHTML}
          </div>`).appendTo(parentDiv);
          
          //console.log(small[0].outerHTML);
          //$(`<div class="ve-flex w-100 h-100">${small[0].outerHTML}</div>`).appendTo(parentDiv);
}
function renderClass(parentDiv){
    $(`<div class="ve-flex-col">
        <div class="split-v-center">
            <div class="bold">Select a Class</div>
        </div>
        <div class="ve-flex-col w-100 mt-2">
			<div class="ve-flex btn-group w-100">
				<div class="ve-flex no-shrink">
					<button class="btn btn-xs btn-5et h-100 btr-0 bbr-0 pr-2" title="Filter for Class and Subclass"><span class="glyphicon glyphicon-filter"></span> Filter</button>
				</div>
				<div class="ve-flex-col w-100">
					<div class="ve-flex relative ui-sel2__wrp w-100">
			<input class="form-control input-xs form-control--minimal ui-sel2__ipt-display italic ve-muted bl-0" tabindex="-1" autocomplete="new-password" autocapitalize="off" spellcheck="false">
			<input class="form-control input-xs form-control--minimal absolute ui-sel2__ipt-search bl-0" autocomplete="new-password" autocapitalize="off" spellcheck="false">
			<div class="absolute ui-sel2__wrp-options overflow-y-scroll"><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option italic active" tabindex="0">—</div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Barbarian </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Bard </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Cleric </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Druid </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Fighter </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Monk </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Paladin </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Ranger </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Rogue </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Sorcerer </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Warlock </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Wizard </div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Artificer [TCE]</div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option ve-hidden" tabindex="0">Expert Sidekick [TCE]</div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option" tabindex="0">Mystic [UAMy]</div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option ve-hidden" tabindex="0">Spellcaster Sidekick [TCE]</div><div class="ve-flex-v-center py-1 px-1 clickable ui-sel2__disp-option ve-hidden" tabindex="0">Warrior Sidekick [TCE]</div></div>
			<div class="ui-sel2__disp-arrow absolute no-events bold"><span class="glyphicon glyphicon-menu-down"></span></div>
		</div>
					<div class="ve-flex-col w-100 ve-hidden"></div>
				</div>
			</div>
			<div class="ve-flex-col ve-hidden"></div>
			<div class="ve-flex-col ve-hidden"></div>
			<div class="ve-flex-col ve-hidden"></div>
			<div class="ve-flex-col ve-hidden"></div>
			<div class="ve-flex-col ve-hidden"></div>
			<div class="ve-flex-col ve-hidden"></div>
			<div class="ve-flex-col ve-hidden"></div>
		</div>
    </div>`).appendTo(parentDiv);
}
buildUI_class();