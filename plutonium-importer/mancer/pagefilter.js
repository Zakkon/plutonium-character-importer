import { BaseComponent } from "./basecomponent.js";

class FilterBox extends ProxyBase {
    static TITLE_BTN_RESET = "Reset filters. SHIFT to reset everything.";

    static selectFirstVisible(entryList) {
        if (Hist.lastLoadedId == null && !Hist.initialLoad) {
            Hist._freshLoad();
        }

    }

    constructor(opts) {
        super();

        this._$iptSearch = opts.$iptSearch;
        this._$wrpFormTop = opts.$wrpFormTop;
        this._$btnReset = opts.$btnReset;
        this._$btnOpen = opts.$btnOpen;
        this._$wrpMiniPills = opts.$wrpMiniPills;
        this._$btnToggleSummaryHidden = opts.$btnToggleSummaryHidden;
        this._filters = opts.filters;
        this._isCompact = opts.isCompact;
        this._namespace = opts.namespace;

        this._doSaveStateThrottled = MiscUtil.throttle(()=>this._pDoSaveState(), 50);
        this.__meta = this._getDefaultMeta();
        if (this._isCompact)
            this.__meta.isSummaryHidden = true;

        this._meta = this._getProxy("meta", this.__meta);
        this.__minisHidden = {};
        this._minisHidden = this._getProxy("minisHidden", this.__minisHidden);
        this.__combineAs = {};
        this._combineAs = this._getProxy("combineAs", this.__combineAs);
        this._modalMeta = null;
        this._isRendered = false;

        this._cachedState = null;

        this._compSearch = BaseComponent.fromObject({
            search: ""
        });
        this._metaIptSearch = null;

        this._filters.forEach(f=>f.filterBox = this);

        this._eventListeners = {};
    }

    get filters() {
        return this._filters;
    }

    teardown() {
        this._filters.forEach(f=>f._doTeardown());
        if (this._modalMeta)
            this._modalMeta.doTeardown();
    }

    on(identifier, fn) {
        const [eventName,namespace] = identifier.split(".");
        (this._eventListeners[eventName] = this._eventListeners[eventName] || []).push({
            namespace,
            fn
        });
        return this;
    }

    off(identifier, fn=null) {
        const [eventName,namespace] = identifier.split(".");
        this._eventListeners[eventName] = (this._eventListeners[eventName] || []).filter(it=>{
            if (fn != null)
                return it.namespace !== namespace || it.fn !== fn;
            return it.namespace !== namespace;
        }
        );
        if (!this._eventListeners[eventName].length)
            delete this._eventListeners[eventName];
        return this;
    }

    fireChangeEvent() {
        this._doSaveStateThrottled();
        this.fireEvent(FilterBox.EVNT_VALCHANGE);
    }

    fireEvent(eventName) {
        (this._eventListeners[eventName] || []).forEach(it=>it.fn());
    }

    _getNamespacedStorageKey() {
        return `${FilterBox._STORAGE_KEY}${this._namespace ? `.${this._namespace}` : ""}`;
    }
    getNamespacedHashKey(k) {
        return `${k || "_".repeat(FilterUtil.SUB_HASH_PREFIX_LENGTH)}${this._namespace ? `.${this._namespace}` : ""}`;
    }

    async pGetStoredActiveSources() {
        const stored = await StorageUtil.pGetForPage(this._getNamespacedStorageKey());
        if (stored) {
            const sourceFilterData = stored.filters[FilterBox.SOURCE_HEADER];
            if (sourceFilterData) {
                const state = sourceFilterData.state;
                const blue = [];
                const white = [];
                Object.entries(state).forEach(([src,mode])=>{
                    if (mode === 1)
                        blue.push(src);
                    else if (mode !== -1)
                        white.push(src);
                }
                );
                if (blue.length)
                    return blue;
                else
                    return white;
            }
        }
        return null;
    }

    registerMinisHiddenHook(prop, hook) {
        this._addHook("minisHidden", prop, hook);
    }

    isMinisHidden(header) {
        return !!this._minisHidden[header];
    }

    async pDoLoadState() {
        const toLoad = await StorageUtil.pGetForPage(this._getNamespacedStorageKey());
        if (toLoad == null)
            return;
        this._setStateFromLoaded(toLoad, {
            isUserSavedState: true
        });
    }

    _setStateFromLoaded(state, {isUserSavedState=false}={}) {
        state.box = state.box || {};
        this._proxyAssign("meta", "_meta", "__meta", state.box.meta || {}, true);
        this._proxyAssign("minisHidden", "_minisHidden", "__minisHidden", state.box.minisHidden || {}, true);
        this._proxyAssign("combineAs", "_combineAs", "__combineAs", state.box.combineAs || {}, true);
        this._filters.forEach(it=>it.setStateFromLoaded(state.filters, {
            isUserSavedState
        }));
    }

    _getSaveableState() {
        const filterOut = {};
        this._filters.forEach(it=>Object.assign(filterOut, it.getSaveableState()));
        return {
            box: {
                meta: {
                    ...this.__meta
                },
                minisHidden: {
                    ...this.__minisHidden
                },
                combineAs: {
                    ...this.__combineAs
                },
            },
            filters: filterOut,
        };
    }

    async _pDoSaveState() {
        await StorageUtil.pSetForPage(this._getNamespacedStorageKey(), this._getSaveableState());
    }

    trimState_() {
        this._filters.forEach(f=>f.trimState_());
    }

    render() {
        if (this._isRendered) {
            this._filters.map(f=>f.update());
            return;
        }
        this._isRendered = true;

        if (this._$wrpFormTop || this._$wrpMiniPills) {
            if (!this._$wrpMiniPills) {
                this._$wrpMiniPills = $(`<div class="fltr__mini-view btn-group"></div>`).insertAfter(this._$wrpFormTop);
            } else {
                this._$wrpMiniPills.addClass("fltr__mini-view");
            }
        }

        if (this._$btnReset) {
            this._$btnReset.title(FilterBox.TITLE_BTN_RESET).click((evt)=>this.reset(evt.shiftKey));
        }

        if (this._$wrpFormTop || this._$btnToggleSummaryHidden) {
            if (!this._$btnToggleSummaryHidden) {
                this._$btnToggleSummaryHidden = $(`<button class="btn btn-default ${this._isCompact ? "p-2" : ""}" title="Toggle Filter Summary"><span class="glyphicon glyphicon-resize-small"></span></button>`).prependTo(this._$wrpFormTop);
            } else if (!this._$btnToggleSummaryHidden.parent().length) {
                this._$btnToggleSummaryHidden.prependTo(this._$wrpFormTop);
            }
            this._$btnToggleSummaryHidden.click(()=>{
                this._meta.isSummaryHidden = !this._meta.isSummaryHidden;
                this._doSaveStateThrottled();
            }
            );
            const summaryHiddenHook = ()=>{
                this._$btnToggleSummaryHidden.toggleClass("active", !!this._meta.isSummaryHidden);
                this._$wrpMiniPills.toggleClass("ve-hidden", !!this._meta.isSummaryHidden);
            }
            ;
            this._addHook("meta", "isSummaryHidden", summaryHiddenHook);
            summaryHiddenHook();
        }

        if (this._$wrpFormTop || this._$btnOpen) {
            if (!this._$btnOpen) {
                this._$btnOpen = $(`<button class="btn btn-default ${this._isCompact ? "px-2" : ""}">Filter</button>`).prependTo(this._$wrpFormTop);
            } else if (!this._$btnOpen.parent().length) {
                this._$btnOpen.prependTo(this._$wrpFormTop);
            }
            this._$btnOpen.click(()=>this.show());
        }

        const sourceFilter = this._filters.find(it=>it.header === FilterBox.SOURCE_HEADER);
        if (sourceFilter) {
            const selFnAlt = (val)=>!SourceUtil.isNonstandardSource(val) && !PrereleaseUtil.hasSourceJson(val) && !BrewUtil2.hasSourceJson(val);
            const hkSelFn = ()=>{
                if (this._meta.isBrewDefaultHidden)
                    sourceFilter.setTempFnSel(selFnAlt);
                else
                    sourceFilter.setTempFnSel(null);
                sourceFilter.updateMiniPillClasses();
            }
            ;
            this._addHook("meta", "isBrewDefaultHidden", hkSelFn);
            hkSelFn();
        }

        if (this._$wrpMiniPills)
            this._filters.map((f,i)=>f.$renderMinis({
                filterBox: this,
                isFirst: i === 0,
                $wrpMini: this._$wrpMiniPills
            }));
    }

    async _render_pRenderModal() {
        this._isModalRendered = true;

        this._modalMeta = await UiUtil.pGetShowModal({
            isHeight100: true,
            isWidth100: true,
            isUncappedHeight: true,
            isIndestructible: true,
            isClosed: true,
            isEmpty: true,
            title: "Filter",
            cbClose: (isDataEntered)=>this._pHandleHide(!isDataEntered),
        });

        const $children = this._filters.map((f,i)=>f.$render({
            filterBox: this,
            isFirst: i === 0,
            $wrpMini: this._$wrpMiniPills
        }));

        this._metaIptSearch = ComponentUiUtil.$getIptStr(this._compSearch, "search", {
            decorationRight: "clear",
            asMeta: true,
            html: `<input class="form-control input-xs" placeholder="Search...">`
        }, );
        this._compSearch._addHookBase("search", ()=>{
            const searchTerm = this._compSearch._state.search.toLowerCase();
            this._filters.forEach(f=>f.handleSearch(searchTerm));
        }
        );

        const $btnShowAllFilters = $(`<button class="btn btn-xs btn-default">Show All</button>`).click(()=>this.showAllFilters());
        const $btnHideAllFilters = $(`<button class="btn btn-xs btn-default">Hide All</button>`).click(()=>this.hideAllFilters());

        const $btnReset = $(`<button class="btn btn-xs btn-default mr-3" title="${FilterBox.TITLE_BTN_RESET}">Reset</button>`).click(evt=>this.reset(evt.shiftKey));

        const $btnSettings = $(`<button class="btn btn-xs btn-default mr-3"><span class="glyphicon glyphicon-cog"></span></button>`).click(()=>this._pOpenSettingsModal());

        const $btnSaveAlt = $(`<button class="btn btn-xs btn-primary" title="Save"><span class="glyphicon glyphicon-ok"></span></button>`).click(()=>this._modalMeta.doClose(true));

        const $wrpBtnCombineFilters = $(`<div class="btn-group mr-3"></div>`);
        const $btnCombineFilterSettings = $(`<button class="btn btn-xs btn-default"><span class="glyphicon glyphicon-cog"></span></button>`).click(()=>this._pOpenCombineAsModal());

        const btnCombineFiltersAs = e_({
            tag: "button",
            clazz: `btn btn-xs btn-default`,
            click: ()=>this._meta.modeCombineFilters = FilterBox._COMBINE_MODES.getNext(this._meta.modeCombineFilters),
            title: `"AND" requires every filter to match. "OR" requires any filter to match. "Custom" allows you to specify a combination (every "AND" filter must match; only one "OR" filter must match) .`,
        }).appendTo($wrpBtnCombineFilters[0]);

        const hook = ()=>{
            btnCombineFiltersAs.innerText = this._meta.modeCombineFilters === "custom" ? this._meta.modeCombineFilters.uppercaseFirst() : this._meta.modeCombineFilters.toUpperCase();
            if (this._meta.modeCombineFilters === "custom")
                $wrpBtnCombineFilters.append($btnCombineFilterSettings);
            else
                $btnCombineFilterSettings.detach();
            this._doSaveStateThrottled();
        }
        ;
        this._addHook("meta", "modeCombineFilters", hook);
        hook();

        const $btnSave = $(`<button class="btn btn-primary fltr__btn-close mr-2">Save</button>`).click(()=>this._modalMeta.doClose(true));

        const $btnCancel = $(`<button class="btn btn-default fltr__btn-close">Cancel</button>`).click(()=>this._modalMeta.doClose(false));

        $$(this._modalMeta.$modal)`<div class="split mb-2 mt-2 ve-flex-v-center mobile__ve-flex-col">
			<div class="ve-flex-v-baseline mobile__ve-flex-col">
				<h4 class="m-0 mr-2 mobile__mb-2">Filters</h4>
				${this._metaIptSearch.$wrp.addClass("mobile__mb-2")}
			</div>
			<div class="ve-flex-v-center mobile__ve-flex-col">
				<div class="ve-flex-v-center mobile__m-1">
					<div class="mr-2">Combine as</div>
					${$wrpBtnCombineFilters}
				</div>
				<div class="ve-flex-v-center mobile__m-1">
					<div class="btn-group mr-2 ve-flex-h-center">
						${$btnShowAllFilters}
						${$btnHideAllFilters}
					</div>
					${$btnReset}
					${$btnSettings}
					${$btnSaveAlt}
				</div>
			</div>
		</div>
		<hr class="w-100 m-0 mb-2">

		<hr class="mt-1 mb-1">
		<div class="ui-modal__scroller smooth-scroll px-1">
			${$children}
		</div>
		<hr class="my-1 w-100">
		<div class="w-100 ve-flex-vh-center my-1">${$btnSave}${$btnCancel}</div>`;
    }

    async _pOpenSettingsModal() {
        const {$modalInner} = await UiUtil.pGetShowModal({
            title: "Settings"
        });

        UiUtil.$getAddModalRowCb($modalInner, "Deselect Homebrew Sources by Default", this._meta, "isBrewDefaultHidden");

        UiUtil.addModalSep($modalInner);

        UiUtil.$getAddModalRowHeader($modalInner, "Hide summary for filter...", {
            helpText: "The summary is the small red and blue button panel which appear below the search bar."
        });
        this._filters.forEach(f=>UiUtil.$getAddModalRowCb($modalInner, f.header, this._minisHidden, f.header));

        UiUtil.addModalSep($modalInner);

        const $rowResetAlwaysSave = UiUtil.$getAddModalRow($modalInner, "div").addClass("pr-2");
        $rowResetAlwaysSave.append(`<span>Always Save on Close</span>`);
        $(`<button class="btn btn-xs btn-default">Reset</button>`).appendTo($rowResetAlwaysSave).click(async()=>{
            await StorageUtil.pRemove(FilterBox._STORAGE_KEY_ALWAYS_SAVE_UNCHANGED);
            JqueryUtil.doToast("Saved!");
        }
        );
    }

    async _pOpenCombineAsModal() {
        const {$modalInner} = await UiUtil.pGetShowModal({
            title: "Filter Combination Logic"
        });
        const $btnReset = $(`<button class="btn btn-xs btn-default">Reset</button>`).click(()=>{
            Object.keys(this._combineAs).forEach(k=>this._combineAs[k] = "and");
            $sels.forEach($sel=>$sel.val("0"));
        }
        );
        UiUtil.$getAddModalRowHeader($modalInner, "Combine filters as...", {
            $eleRhs: $btnReset
        });
        const $sels = this._filters.map(f=>UiUtil.$getAddModalRowSel($modalInner, f.header, this._combineAs, f.header, ["and", "or"], {
            fnDisplay: (it)=>it.toUpperCase()
        }));
    }

    getValues({nxtStateOuter=null}={}) {
        const outObj = {};
        this._filters.forEach(f=>Object.assign(outObj, f.getValues({
            nxtState: nxtStateOuter?.filters
        })));
        return outObj;
    }

    addEventListener(type, listener) {
        (this._$wrpFormTop ? this._$wrpFormTop[0] : this._$btnOpen[0]).addEventListener(type, listener);
    }

    _mutNextState_reset_meta({tgt}) {
        Object.assign(tgt, this._getDefaultMeta());
    }

    _mutNextState_minisHidden({tgt}) {
        Object.assign(tgt, this._getDefaultMinisHidden(tgt));
    }

    _mutNextState_combineAs({tgt}) {
        Object.assign(tgt, this._getDefaultCombineAs(tgt));
    }

    _reset_meta() {
        const nxtBoxState = this._getNextBoxState_base();
        this._mutNextState_reset_meta({
            tgt: nxtBoxState.meta
        });
        this._setBoxStateFromNextBoxState(nxtBoxState);
    }

    _reset_minisHidden() {
        const nxtBoxState = this._getNextBoxState_base();
        this._mutNextState_minisHidden({
            tgt: nxtBoxState.minisHidden
        });
        this._setBoxStateFromNextBoxState(nxtBoxState);
    }

    _reset_combineAs() {
        const nxtBoxState = this._getNextBoxState_base();
        this._mutNextState_combineAs({
            tgt: nxtBoxState.combineAs
        });
        this._setBoxStateFromNextBoxState(nxtBoxState);
    }

    reset(isResetAll) {
        this._filters.forEach(f=>f.reset({
            isResetAll
        }));
        if (isResetAll) {
            this._reset_meta();
            this._reset_minisHidden();
            this._reset_combineAs();
        }
        this.render();
        this.fireChangeEvent();
    }

    async show() {
        if (!this._isModalRendered)
            await this._render_pRenderModal();
        this._cachedState = this._getSaveableState();
        this._modalMeta.doOpen();
        if (this._metaIptSearch?.$ipt)
            this._metaIptSearch.$ipt.focus();
    }

    async _pHandleHide(isCancel=false) {
        if (this._cachedState && isCancel) {
            const curState = this._getSaveableState();
            const hasChanges = !CollectionUtil.deepEquals(curState, this._cachedState);

            if (hasChanges) {
                const isSave = await InputUiUtil.pGetUserBoolean({
                    title: "Unsaved Changes",
                    textYesRemember: "Always Save",
                    textYes: "Save",
                    textNo: "Discard",
                    storageKey: FilterBox._STORAGE_KEY_ALWAYS_SAVE_UNCHANGED,
                    isGlobal: true,
                });
                if (isSave) {
                    this._cachedState = null;
                    this.fireChangeEvent();
                    return;
                } else
                    this._setStateFromLoaded(this._cachedState, {
                        isUserSavedState: true
                    });
            }
        } else {
            this.fireChangeEvent();
        }

        this._cachedState = null;
    }

    showAllFilters() {
        this._filters.forEach(f=>f.show());
    }

    hideAllFilters() {
        this._filters.forEach(f=>f.hide());
    }

    unpackSubHashes(subHashes, {force=false}={}) {
        const unpacked = {};
        subHashes.forEach(s=>{
            const unpackedPart = UrlUtil.unpackSubHash(s, true);
            if (Object.keys(unpackedPart).length > 1)
                throw new Error(`Multiple keys in subhash!`);
            const k = Object.keys(unpackedPart)[0];
            unpackedPart[k] = {
                clean: unpackedPart[k],
                raw: s
            };
            Object.assign(unpacked, unpackedPart);
        }
        );

        const urlHeaderToFilter = {};
        this._filters.forEach(f=>{
            const childFilters = f.getChildFilters();
            if (childFilters.length)
                childFilters.forEach(f=>urlHeaderToFilter[f.header.toLowerCase()] = f);
            urlHeaderToFilter[f.header.toLowerCase()] = f;
        }
        );

        const urlHeadersUpdated = new Set();
        const subHashesConsumed = new Set();
        let filterInitialSearch;

        const filterBoxState = {};
        const statePerFilter = {};
        const prefixLen = this.getNamespacedHashKey().length;
        Object.entries(unpacked).forEach(([hashKey,data])=>{
            const rawPrefix = hashKey.substring(0, prefixLen);
            const prefix = rawPrefix.substring(0, FilterUtil.SUB_HASH_PREFIX_LENGTH);

            const urlHeader = hashKey.substring(prefixLen);

            if (FilterUtil.SUB_HASH_PREFIXES.has(prefix) && urlHeaderToFilter[urlHeader]) {
                (statePerFilter[urlHeader] = statePerFilter[urlHeader] || {})[prefix] = data.clean;
                urlHeadersUpdated.add(urlHeader);
                subHashesConsumed.add(data.raw);
                return;
            }

            if (Object.values(FilterBox._SUB_HASH_PREFIXES).includes(prefix)) {
                if (prefix === VeCt.FILTER_BOX_SUB_HASH_SEARCH_PREFIX)
                    filterInitialSearch = data.clean[0];
                else
                    filterBoxState[prefix] = data.clean;
                subHashesConsumed.add(data.raw);
                return;
            }

            if (FilterUtil.SUB_HASH_PREFIXES.has(prefix))
                throw new Error(`Could not find filter with header ${urlHeader} for subhash ${data.raw}`);
        }
        );

        if (!subHashesConsumed.size && !force)
            return null;

        return {
            urlHeaderToFilter,
            filterBoxState,
            statePerFilter,
            urlHeadersUpdated,
            unpacked,
            subHashesConsumed,
            filterInitialSearch,
        };
    }

    setFromSubHashes(subHashes, {force=false, $iptSearch=null}={}) {
        const unpackedSubhashes = this.unpackSubHashes(subHashes, {
            force
        });

        if (unpackedSubhashes == null)
            return subHashes;

        const {unpacked, subHashesConsumed, filterInitialSearch, } = unpackedSubhashes;

        const {box: nxtStateBox, filters: nxtStatesFilters} = this.getNextStateFromSubHashes({
            unpackedSubhashes
        });

        this._setBoxStateFromNextBoxState(nxtStateBox);

        this._filters.flatMap(f=>[f, ...f.getChildFilters(), ]).filter(filter=>nxtStatesFilters[filter.header]).forEach(filter=>filter.setStateFromNextState(nxtStatesFilters));

        if (filterInitialSearch && ($iptSearch || this._$iptSearch))
            ($iptSearch || this._$iptSearch).val(filterInitialSearch).change().keydown().keyup().trigger("instantKeyup");

        const [link] = Hist.getHashParts();

        const outSub = [];
        Object.values(unpacked).filter(v=>!subHashesConsumed.has(v.raw)).forEach(v=>outSub.push(v.raw));

        Hist.setSuppressHistory(true);
        Hist.replaceHistoryHash(`${link}${outSub.length ? `${HASH_PART_SEP}${outSub.join(HASH_PART_SEP)}` : ""}`);

        this.fireChangeEvent();
        Hist.hashChange({
            isBlankFilterLoad: true
        });
        return outSub;
    }

    getNextStateFromSubHashes({unpackedSubhashes}) {
        const {urlHeaderToFilter, filterBoxState, statePerFilter, urlHeadersUpdated, } = unpackedSubhashes;

        const nxtStateBox = this._getNextBoxStateFromSubHashes(urlHeaderToFilter, filterBoxState);

        const nxtStateFilters = {};

        Object.entries(statePerFilter).forEach(([urlHeader,state])=>{
            const filter = urlHeaderToFilter[urlHeader];
            Object.assign(nxtStateFilters, filter.getNextStateFromSubhashState(state));
        }
        );

        Object.keys(urlHeaderToFilter).filter(k=>!urlHeadersUpdated.has(k)).forEach(k=>{
            const filter = urlHeaderToFilter[k];
            Object.assign(nxtStateFilters, filter.getNextStateFromSubhashState(null));
        }
        );

        return {
            box: nxtStateBox,
            filters: nxtStateFilters
        };
    }

    _getNextBoxState_base() {
        return {
            meta: MiscUtil.copyFast(this.__meta),
            minisHidden: MiscUtil.copyFast(this.__minisHidden),
            combineAs: MiscUtil.copyFast(this.__combineAs),
        };
    }

    _getNextBoxStateFromSubHashes(urlHeaderToFilter, filterBoxState) {
        const nxtBoxState = this._getNextBoxState_base();

        let hasMeta = false;
        let hasMinisHidden = false;
        let hasCombineAs = false;

        Object.entries(filterBoxState).forEach(([k,vals])=>{
            const mappedK = this.getNamespacedHashKey(Parser._parse_bToA(FilterBox._SUB_HASH_PREFIXES, k));
            switch (mappedK) {
            case "meta":
                {
                    hasMeta = true;
                    const data = vals.map(v=>UrlUtil.mini.decompress(v));
                    Object.keys(this._getDefaultMeta()).forEach((k,i)=>nxtBoxState.meta[k] = data[i]);
                    break;
                }
            case "minisHidden":
                {
                    hasMinisHidden = true;
                    Object.keys(nxtBoxState.minisHidden).forEach(k=>nxtBoxState.minisHidden[k] = false);
                    vals.forEach(v=>{
                        const [urlHeader,isHidden] = v.split("=");
                        const filter = urlHeaderToFilter[urlHeader];
                        if (!filter)
                            throw new Error(`Could not find filter with name "${urlHeader}"`);
                        nxtBoxState.minisHidden[filter.header] = !!Number(isHidden);
                    }
                    );
                    break;
                }
            case "combineAs":
                {
                    hasCombineAs = true;
                    Object.keys(nxtBoxState.combineAs).forEach(k=>nxtBoxState.combineAs[k] = "and");
                    vals.forEach(v=>{
                        const [urlHeader,ixCombineMode] = v.split("=");
                        const filter = urlHeaderToFilter[urlHeader];
                        if (!filter)
                            throw new Error(`Could not find filter with name "${urlHeader}"`);
                        nxtBoxState.combineAs[filter.header] = FilterBox._COMBINE_MODES[ixCombineMode] || FilterBox._COMBINE_MODES[0];
                    }
                    );
                    break;
                }
            }
        }
        );

        if (!hasMeta)
            this._mutNextState_reset_meta({
                tgt: nxtBoxState.meta
            });
        if (!hasMinisHidden)
            this._mutNextState_minisHidden({
                tgt: nxtBoxState.minisHidden
            });
        if (!hasCombineAs)
            this._mutNextState_combineAs({
                tgt: nxtBoxState.combineAs
            });

        return nxtBoxState;
    }

    _setBoxStateFromNextBoxState(nxtBoxState) {
        this._proxyAssignSimple("meta", nxtBoxState.meta, true);
        this._proxyAssignSimple("minisHidden", nxtBoxState.minisHidden, true);
        this._proxyAssignSimple("combineAs", nxtBoxState.combineAs, true);
    }

    getSubHashes(opts) {
        opts = opts || {};
        const out = [];
        const boxSubHashes = this.getBoxSubHashes();
        if (boxSubHashes)
            out.push(boxSubHashes);
        out.push(...this._filters.map(f=>f.getSubHashes()).filter(Boolean));
        if (opts.isAddSearchTerm && this._$iptSearch) {
            const searchTerm = UrlUtil.encodeForHash(this._$iptSearch.val().trim());
            if (searchTerm)
                out.push(UrlUtil.packSubHash(this._getSubhashPrefix("search"), [searchTerm]));
        }
        return out.flat();
    }

    getBoxSubHashes() {
        const out = [];

        const defaultMeta = this._getDefaultMeta();

        const anyNotDefault = Object.keys(defaultMeta).find(k=>this._meta[k] !== defaultMeta[k]);
        if (anyNotDefault) {
            const serMeta = Object.keys(defaultMeta).map(k=>UrlUtil.mini.compress(this._meta[k] === undefined ? defaultMeta[k] : this._meta[k]));
            out.push(UrlUtil.packSubHash(this._getSubhashPrefix("meta"), serMeta));
        }

        const setMinisHidden = Object.entries(this._minisHidden).filter(([k,v])=>!!v).map(([k])=>`${k.toUrlified()}=1`);
        if (setMinisHidden.length) {
            out.push(UrlUtil.packSubHash(this._getSubhashPrefix("minisHidden"), setMinisHidden));
        }

        const setCombineAs = Object.entries(this._combineAs).filter(([k,v])=>v !== FilterBox._COMBINE_MODES[0]).map(([k,v])=>`${k.toUrlified()}=${FilterBox._COMBINE_MODES.indexOf(v)}`);
        if (setCombineAs.length) {
            out.push(UrlUtil.packSubHash(this._getSubhashPrefix("combineAs"), setCombineAs));
        }

        return out.length ? out : null;
    }

    getFilterTag({isAddSearchTerm=false}={}) {
        const parts = this._filters.map(f=>f.getFilterTagPart()).filter(Boolean);
        if (isAddSearchTerm && this._$iptSearch) {
            const term = this._$iptSearch.val().trim();
            if (term)
                parts.push(`search=${term}`);
        }
        return `{@filter |${UrlUtil.getCurrentPage().replace(/\.html$/, "")}|${parts.join("|")}}`;
    }

    getDisplayState({nxtStateOuter=null}={}) {
        return this._filters.map(filter=>filter.getDisplayStatePart({
            nxtState: nxtStateOuter?.filters
        })).filter(Boolean).join("; ");
    }

    setFromValues(values) {
        this._filters.forEach(it=>it.setFromValues(values));
        this.fireChangeEvent();
    }

    toDisplay(boxState, ...entryVals) {
        return this._toDisplay(boxState, this._filters, entryVals);
    }

    toDisplayByFilters(boxState, ...filterToValueTuples) {
        return this._toDisplay(boxState, filterToValueTuples.map(it=>it.filter), filterToValueTuples.map(it=>it.value), );
    }

    _toDisplay(boxState, filters, entryVals) {
        switch (this._meta.modeCombineFilters) {
        case "and":
            return this._toDisplay_isAndDisplay(boxState, filters, entryVals);
        case "or":
            return this._toDisplay_isOrDisplay(boxState, filters, entryVals);
        case "custom":
            {
                if (entryVals.length !== filters.length)
                    throw new Error(`Number of filters and number of values did not match!`);

                const andFilters = [];
                const andValues = [];
                const orFilters = [];
                const orValues = [];

                for (let i = 0; i < filters.length; ++i) {
                    const f = filters[i];
                    if (!this._combineAs[f.header] || this._combineAs[f.header] === "and") {
                        andFilters.push(f);
                        andValues.push(entryVals[i]);
                    } else {
                        orFilters.push(f);
                        orValues.push(entryVals[i]);
                    }
                }

                return this._toDisplay_isAndDisplay(boxState, andFilters, andValues) && this._toDisplay_isOrDisplay(boxState, orFilters, orValues);
            }
        default:
            throw new Error(`Unhandled combining mode "${this._meta.modeCombineFilters}"`);
        }
    }

    _toDisplay_isAndDisplay(boxState, filters, vals) {
        return filters.map((f,i)=>f.toDisplay(boxState, vals[i])).every(it=>it);
    }

    _toDisplay_isOrDisplay(boxState, filters, vals) {
        const res = filters.map((f,i)=>{
            if (!f.isActive(boxState))
                return null;
            return f.toDisplay(boxState, vals[i]);
        }
        ).filter(it=>it != null);
        return res.length === 0 || res.find(it=>it);
    }

    _getSubhashPrefix(prop) {
        if (FilterBox._SUB_HASH_PREFIXES[prop])
            return this.getNamespacedHashKey(FilterBox._SUB_HASH_PREFIXES[prop]);
        throw new Error(`Unknown property "${prop}"`);
    }

    _getDefaultMeta() {
        const out = MiscUtil.copy(FilterBox._DEFAULT_META);
        if (this._isCompact)
            out.isSummaryHidden = true;
        return out;
    }

    _getDefaultMinisHidden(minisHidden) {
        if (!minisHidden)
            throw new Error(`Missing "minisHidden" argument!`);
        return Object.keys(minisHidden).mergeMap(k=>({
            [k]: false
        }));
    }

    _getDefaultCombineAs(combineAs) {
        if (!combineAs)
            throw new Error(`Missing "combineAs" argument!`);
        return Object.keys(combineAs).mergeMap(k=>({
            [k]: "and"
        }));
    }
}
;
FilterBox.EVNT_VALCHANGE = "valchange";
FilterBox.SOURCE_HEADER = "Source";
FilterBox._PILL_STATES = ["ignore", "yes", "no"];
FilterBox._COMBINE_MODES = ["and", "or", "custom"];
FilterBox._STORAGE_KEY = "filterBoxState";
FilterBox._DEFAULT_META = {
    modeCombineFilters: "and",
    isSummaryHidden: false,
    isBrewDefaultHidden: false,
};
FilterBox._STORAGE_KEY_ALWAYS_SAVE_UNCHANGED = "filterAlwaysSaveUnchanged";

FilterBox._SUB_HASH_BOX_META_PREFIX = "fbmt";
FilterBox._SUB_HASH_BOX_MINIS_HIDDEN_PREFIX = "fbmh";
FilterBox._SUB_HASH_BOX_COMBINE_AS_PREFIX = "fbca";
FilterBox._SUB_HASH_PREFIXES = {
    meta: FilterBox._SUB_HASH_BOX_META_PREFIX,
    minisHidden: FilterBox._SUB_HASH_BOX_MINIS_HIDDEN_PREFIX,
    combineAs: FilterBox._SUB_HASH_BOX_COMBINE_AS_PREFIX,
    search: VeCt.FILTER_BOX_SUB_HASH_SEARCH_PREFIX,
};

class FilterItem {
    constructor(options) {
        this.item = options.item;
        this.pFnChange = options.pFnChange;
        this.group = options.group;
        this.nest = options.nest;
        this.nestHidden = options.nestHidden;
        this.isIgnoreRed = options.isIgnoreRed;
        this.userData = options.userData;

        this.rendered = null;
        this.searchText = null;
    }
}
;

class SourceFilterItem extends FilterItem {
    constructor(options) {
        super(options);
        this.isOtherSource = options.isOtherSource;
    }
}

class FilterBase extends BaseComponent {
    constructor(opts) {
        super();
        this._filterBox = null;

        this.header = opts.header;
        this._headerHelp = opts.headerHelp;

        this.__meta = {
            ...this.getDefaultMeta()
        };
        this._meta = this._getProxy("meta", this.__meta);

        this._hasUserSavedState = false;
    }

    _getRenderedHeader() {
        return `<span ${this._headerHelp ? `title="${this._headerHelp.escapeQuotes()}" class="help-subtle"` : ""}>${this.header}</span>`;
    }

    set filterBox(it) {
        this._filterBox = it;
    }

    show() {
        this._meta.isHidden = false;
    }

    hide() {
        this._meta.isHidden = true;
    }

    getBaseSaveableState() {
        return {
            meta: {
                ...this.__meta
            }
        };
    }

    _getNextState_base() {
        return {
            [this.header]: {
                state: MiscUtil.copyFast(this.__state),
                meta: MiscUtil.copyFast(this.__meta),
            },
        };
    }

    setStateFromNextState(nxtState) {
        this._proxyAssignSimple("state", nxtState[this.header].state, true);
        this._proxyAssignSimple("meta", nxtState[this.header].meta, true);
    }

    reset({isResetAll=false}={}) {
        const nxtState = this._getNextState_base();
        this._mutNextState_reset(nxtState, {
            isResetAll
        });
        this.setStateFromNextState(nxtState);
    }

    _mutNextState_resetBase(nxtState, {isResetAll=false}={}) {
        Object.assign(nxtState[this.header].meta, MiscUtil.copy(this.getDefaultMeta()));
    }

    getMetaSubHashes() {
        const compressedMeta = this._getCompressedMeta();
        if (!compressedMeta)
            return null;
        return [UrlUtil.packSubHash(this.getSubHashPrefix("meta", this.header), compressedMeta)];
    }

    _mutNextState_meta_fromSubHashState(nxtState, subHashState) {
        const hasMeta = this._mutNextState_meta_fromSubHashState_mutGetHasMeta(nxtState, subHashState, this.getDefaultMeta());
        if (!hasMeta)
            this._mutNextState_resetBase(nxtState);
    }

    _mutNextState_meta_fromSubHashState_mutGetHasMeta(nxtState, state, defaultMeta) {
        let hasMeta = false;

        Object.entries(state).forEach(([k,vals])=>{
            const prop = FilterBase.getProp(k);
            if (prop !== "meta")
                return;

            hasMeta = true;
            const data = vals.map(v=>UrlUtil.mini.decompress(v));
            Object.keys(defaultMeta).forEach((k,i)=>{
                if (data[i] !== undefined)
                    nxtState[this.header].meta[k] = data[i];
                else
                    nxtState[this.header].meta[k] = defaultMeta[k];
            }
            );
        }
        );

        return hasMeta;
    }

    setBaseStateFromLoaded(toLoad) {
        Object.assign(this._meta, toLoad.meta);
    }

    getSubHashPrefix(prop, header) {
        if (FilterBase._SUB_HASH_PREFIXES[prop]) {
            const prefix = this._filterBox.getNamespacedHashKey(FilterBase._SUB_HASH_PREFIXES[prop]);
            return `${prefix}${header.toUrlified()}`;
        }
        throw new Error(`Unknown property "${prop}"`);
    }

    static getProp(prefix) {
        return Parser._parse_bToA(FilterBase._SUB_HASH_PREFIXES, prefix);
    }

    _getBtnMobToggleControls(wrpControls) {
        const btnMobToggleControls = e_({
            tag: "button",
            clazz: `btn btn-xs btn-default mobile__visible ml-auto px-3 mr-2`,
            html: `<span class="glyphicon glyphicon-option-vertical"></span>`,
            click: ()=>this._meta.isMobileHeaderHidden = !this._meta.isMobileHeaderHidden,
        });
        const hkMobHeaderHidden = ()=>{
            btnMobToggleControls.toggleClass("active", !this._meta.isMobileHeaderHidden);
            wrpControls.toggleClass("mobile__hidden", !!this._meta.isMobileHeaderHidden);
        }
        ;
        this._addHook("meta", "isMobileHeaderHidden", hkMobHeaderHidden);
        hkMobHeaderHidden();

        return btnMobToggleControls;
    }

    getChildFilters() {
        return [];
    }
    getDefaultMeta() {
        return {
            ...FilterBase._DEFAULT_META
        };
    }

    isActive(vals) {
        vals = vals || this.getValues();
        return vals[this.header]._isActive;
    }

    _getCompressedMeta({isStripUiKeys=false}={}) {
        const defaultMeta = this.getDefaultMeta();
        const isAnyNotDefault = Object.keys(defaultMeta).some(k=>this._meta[k] !== defaultMeta[k]);
        if (!isAnyNotDefault)
            return null;

        let keys = Object.keys(defaultMeta);

        if (isStripUiKeys) {
            const popCount = Object.keys(FilterBase._DEFAULT_META).length;
            if (popCount)
                keys = keys.slice(0, -popCount);
        }

        while (keys.length && defaultMeta[keys.last()] === this._meta[keys.last()])
            keys.pop();

        return keys.map(k=>UrlUtil.mini.compress(this._meta[k] === undefined ? defaultMeta[k] : this._meta[k]));
    }

    $render() {
        throw new Error(`Unimplemented!`);
    }
    $renderMinis() {
        throw new Error(`Unimplemented!`);
    }
    getValues({nxtState=null}={}) {
        throw new Error(`Unimplemented!`);
    }
    _mutNextState_reset() {
        throw new Error(`Unimplemented!`);
    }
    update() {
        throw new Error(`Unimplemented!`);
    }
    toDisplay() {
        throw new Error(`Unimplemented!`);
    }
    addItem() {
        throw new Error(`Unimplemented!`);
    }
    getSaveableState() {
        throw new Error(`Unimplemented!`);
    }
    setStateFromLoaded() {
        throw new Error(`Unimplemented!`);
    }
    getSubHashes() {
        throw new Error(`Unimplemented!`);
    }
    getNextStateFromSubhashState() {
        throw new Error(`Unimplemented!`);
    }
    setFromValues() {
        throw new Error(`Unimplemented!`);
    }
    handleSearch() {
        throw new Error(`Unimplemented`);
    }
    getFilterTagPart() {
        throw new Error(`Unimplemented`);
    }
    getDisplayStatePart({nxtState=null}={}) {
        throw new Error(`Unimplemented`);
    }
    _doTeardown() {}
    trimState_() {}
}
FilterBase._DEFAULT_META = {
    isHidden: false,
    isMobileHeaderHidden: true,
};
FilterBase._SUB_HASH_STATE_PREFIX = "flst";
FilterBase._SUB_HASH_META_PREFIX = "flmt";
FilterBase._SUB_HASH_NESTS_HIDDEN_PREFIX = "flnh";
FilterBase._SUB_HASH_OPTIONS_PREFIX = "flop";
FilterBase._SUB_HASH_PREFIXES = {
    state: FilterBase._SUB_HASH_STATE_PREFIX,
    meta: FilterBase._SUB_HASH_META_PREFIX,
    nestsHidden: FilterBase._SUB_HASH_NESTS_HIDDEN_PREFIX,
    options: FilterBase._SUB_HASH_OPTIONS_PREFIX,
};


class Filter extends FilterBase {
    static _getAsFilterItems(items) {
        return items ? items.map(it=>it instanceof FilterItem ? it : new FilterItem({
            item: it
        })) : null;
    }

    static _validateItemNests(items, nests) {
        if (!nests)
            return;
        items = items.filter(it=>it.nest);
        const noNest = items.find(it=>!nests[it.nest]);
        if (noNest)
            throw new Error(`Filter does not have matching nest: "${noNest.item}" (call addNest first)`);
        const invalid = items.find(it=>!it.nest || !nests[it.nest]);
        if (invalid)
            throw new Error(`Invalid nest: "${invalid.item}"`);
    }

    static _validateItemNest(item, nests) {
        if (!nests || !item.nest)
            return;
        if (!nests[item.nest])
            throw new Error(`Filter does not have matching nest: "${item.item}" (call addNest first)`);
        if (!item.nest || !nests[item.nest])
            throw new Error(`Invalid nest: "${item.item}"`);
    }

    constructor(opts) {
        super(opts);
        this._items = Filter._getAsFilterItems(opts.items || []);
        this.__itemsSet = new Set(this._items.map(it=>it.item));
        this._nests = opts.nests;
        this._displayFn = opts.displayFn;
        this._displayFnMini = opts.displayFnMini;
        this._displayFnTitle = opts.displayFnTitle;
        this._selFn = opts.selFn;
        this._selFnCache = null;
        this._deselFn = opts.deselFn;
        this._itemSortFn = opts.itemSortFn === undefined ? SortUtil.ascSort : opts.itemSortFn;
        this._itemSortFnMini = opts.itemSortFnMini;
        this._groupFn = opts.groupFn;
        this._minimalUi = opts.minimalUi;
        this._umbrellaItems = Filter._getAsFilterItems(opts.umbrellaItems);
        this._umbrellaExcludes = Filter._getAsFilterItems(opts.umbrellaExcludes);
        this._isSortByDisplayItems = !!opts.isSortByDisplayItems;
        this._isReprintedFilter = !!opts.isMiscFilter && this._items.some(it=>it.item === "Reprinted");
        this._isSrdFilter = !!opts.isMiscFilter && this._items.some(it=>it.item === "SRD");
        this._isBasicRulesFilter = !!opts.isMiscFilter && this._items.some(it=>it.item === "Basic Rules");

        Filter._validateItemNests(this._items, this._nests);

        this._filterBox = null;
        this._items.forEach(it=>this._defaultItemState(it, {
            isForce: true
        }));
        this.__$wrpFilter = null;
        this.__wrpPills = null;
        this.__wrpMiniPills = null;
        this.__$wrpNestHeadInner = null;
        this._updateNestSummary = null;
        this.__nestsHidden = {};
        this._nestsHidden = this._getProxy("nestsHidden", this.__nestsHidden);
        this._isNestsDirty = false;
        this._isItemsDirty = false;
        this._pillGroupsMeta = {};
    }

    get isReprintedFilter() {
        return this._isReprintedFilter;
    }
    get isSrdFilter() {
        return this._isSrdFilter;
    }
    get isBasicRulesFilter() {
        return this._isBasicRulesFilter;
    }

    getSaveableState() {
        return {
            [this.header]: {
                ...this.getBaseSaveableState(),
                state: {
                    ...this.__state
                },
                nestsHidden: {
                    ...this.__nestsHidden
                },
            },
        };
    }

    setStateFromLoaded(filterState, {isUserSavedState=false}={}) {
        if (!filterState?.[this.header])
            return;

        const toLoad = filterState[this.header];
        this._hasUserSavedState = this._hasUserSavedState || isUserSavedState;
        this.setBaseStateFromLoaded(toLoad);
        Object.assign(this._state, toLoad.state);
        Object.assign(this._nestsHidden, toLoad.nestsHidden);
    }

    _getStateNotDefault({nxtState=null}={}) {
        const state = nxtState?.[this.header]?.state || this.__state;

        return Object.entries(state).filter(([k,v])=>{
            if (k.startsWith("_"))
                return false;
            const defState = this._getDefaultState(k);
            return defState !== v;
        }
        );
    }

    getSubHashes() {
        const out = [];

        const baseMeta = this.getMetaSubHashes();
        if (baseMeta)
            out.push(...baseMeta);

        const areNotDefaultState = this._getStateNotDefault();
        if (areNotDefaultState.length) {
            const serPillStates = areNotDefaultState.map(([k,v])=>`${k.toUrlified()}=${v}`);
            out.push(UrlUtil.packSubHash(this.getSubHashPrefix("state", this.header), serPillStates));
        }

        const areNotDefaultNestsHidden = Object.entries(this._nestsHidden).filter(([k,v])=>this._nests[k] && !(this._nests[k].isHidden === v));
        if (areNotDefaultNestsHidden.length) {
            const nestsHidden = areNotDefaultNestsHidden.map(([k])=>`${k.toUrlified()}=1`);
            out.push(UrlUtil.packSubHash(this.getSubHashPrefix("nestsHidden", this.header), nestsHidden));
        }

        if (!out.length)
            return null;

        out.push(UrlUtil.packSubHash(this.getSubHashPrefix("options", this.header), ["extend"]));
        return out;
    }

    getFilterTagPart() {
        const areNotDefaultState = this._getStateNotDefault();
        const compressedMeta = this._getCompressedMeta({
            isStripUiKeys: true
        });

        if (!areNotDefaultState.length && !compressedMeta)
            return null;

        const pt = Object.entries(this._state).filter(([k])=>!k.startsWith("_")).filter(([,v])=>v).map(([k,v])=>`${v === 2 ? "!" : ""}${k}`).join(";").toLowerCase();

        return [this.header.toLowerCase(), pt, compressedMeta ? compressedMeta.join(HASH_SUB_LIST_SEP) : null, ].filter(it=>it != null).join("=");
    }

    getDisplayStatePart({nxtState=null}={}) {
        const state = nxtState?.[this.header]?.state || this.__state;

        const areNotDefaultState = this._getStateNotDefault({
            nxtState
        });

        if (!areNotDefaultState.length)
            return null;

        const ptState = Object.entries(state).filter(([k])=>!k.startsWith("_")).filter(([,v])=>v).map(([k,v])=>{
            const item = this._items.find(item=>`${item.item}` === k);
            if (!item)
                return null;
            return `${v === 2 ? "not " : ""}${this._displayFn ? this._displayFn(item.item, item) : item.item}`;
        }
        ).filter(Boolean).join(", ");

        if (!ptState)
            return null;

        return `${this.header}: ${ptState}`;
    }

    _getOptionsFromSubHashState(state) {
        const opts = {};
        Object.entries(state).forEach(([k,vals])=>{
            const prop = FilterBase.getProp(k);
            switch (prop) {
            case "options":
                {
                    vals.forEach(val=>{
                        switch (val) {
                        case "extend":
                            {
                                opts.isExtendDefaultState = true;
                            }
                        }
                    }
                    );
                }
            }
        }
        );
        return new FilterTransientOptions(opts);
    }

    setStateFromNextState(nxtState) {
        super.setStateFromNextState(nxtState);
        this._proxyAssignSimple("nestsHidden", nxtState[this.header].nestsHidden, true);
    }

    getNextStateFromSubhashState(state) {
        const nxtState = this._getNextState_base();

        if (state == null) {
            this._mutNextState_reset(nxtState);
            return nxtState;
        }

        this._mutNextState_meta_fromSubHashState(nxtState, state);
        const transientOptions = this._getOptionsFromSubHashState(state);

        let hasState = false;
        let hasNestsHidden = false;

        Object.entries(state).forEach(([k,vals])=>{
            const prop = FilterBase.getProp(k);
            switch (prop) {
            case "state":
                {
                    hasState = true;
                    if (transientOptions.isExtendDefaultState) {
                        Object.keys(nxtState[this.header].state).forEach(k=>nxtState[this.header].state[k] = this._getDefaultState(k));
                    } else {
                        Object.keys(nxtState[this.header].state).forEach(k=>nxtState[this.header].state[k] = 0);
                    }

                    vals.forEach(v=>{
                        const [statePropLower,state] = v.split("=");
                        const stateProp = Object.keys(nxtState[this.header].state).find(k=>k.toLowerCase() === statePropLower);
                        if (stateProp)
                            nxtState[this.header].state[stateProp] = Number(state);
                    }
                    );
                    break;
                }
            case "nestsHidden":
                {
                    hasNestsHidden = true;
                    Object.keys(nxtState[this.header].nestsHidden).forEach(k=>{
                        const nestKey = Object.keys(this._nests).find(it=>k.toLowerCase() === it.toLowerCase());
                        nxtState[this.header].nestsHidden[k] = this._nests[nestKey] && this._nests[nestKey].isHidden;
                    }
                    );
                    vals.forEach(v=>{
                        const [nestNameLower,state] = v.split("=");
                        const nestName = Object.keys(nxtState[this.header].nestsHidden).find(k=>k.toLowerCase() === nestNameLower);
                        if (nestName)
                            nxtState[this.header].nestsHidden[nestName] = !!Number(state);
                    }
                    );
                    break;
                }
            }
        }
        );

        if (!hasState)
            this._mutNextState_reset(nxtState);
        if (!hasNestsHidden && this._nests)
            this._mutNextState_resetNestsHidden({
                tgt: nxtState[this.header].nestsHidden
            });

        return nxtState;
    }

    setFromValues(values) {
        if (values[this.header]) {
            Object.keys(this._state).forEach(k=>this._state[k] = 0);
            Object.assign(this._state, values[this.header]);
        }
    }

    setValue(k, v) {
        this._state[k] = v;
    }

    _mutNextState_resetNestsHidden({tgt}) {
        if (!this._nests)
            return;
        Object.entries(this._nests).forEach(([nestName,nestMeta])=>tgt[nestName] = !!nestMeta.isHidden);
    }

    _defaultItemState(item, {isForce=false}={}) {
        if (!isForce && this._hasUserSavedState)
            return this._state[item.item] = 0;

        this._state[item.item] = this._getDefaultState(item.item);
    }

    _getDefaultState(k) {
        return this._deselFn && this._deselFn(k) ? 2 : this._selFn && this._selFn(k) ? 1 : 0;
    }

    _getDisplayText(item) {
        return this._displayFn ? this._displayFn(item.item, item) : item.item;
    }

    _getDisplayTextMini(item) {
        return this._displayFnMini ? this._displayFnMini(item.item, item) : this._getDisplayText(item);
    }

    _getPill(item) {
        const displayText = this._getDisplayText(item);

        const btnPill = e_({
            tag: "div",
            clazz: "fltr__pill",
            html: displayText,
            click: evt=>this._getPill_handleClick({
                evt,
                item
            }),
            contextmenu: evt=>this._getPill_handleContextmenu({
                evt,
                item
            }),
        });

        this._getPill_bindHookState({
            btnPill,
            item
        });

        item.searchText = displayText.toLowerCase();

        return btnPill;
    }

    _getPill_handleClick({evt, item}) {
        if (evt.shiftKey) {
            this._doSetPillsClear();
        }

        if (++this._state[item.item] > 2)
            this._state[item.item] = 0;
    }

    _getPill_handleContextmenu({evt, item}) {
        evt.preventDefault();

        if (evt.shiftKey) {
            this._doSetPillsClear();
        }

        if (--this._state[item.item] < 0)
            this._state[item.item] = 2;
    }

    _getPill_bindHookState({btnPill, item}) {
        this._addHook("state", item.item, ()=>{
            const val = FilterBox._PILL_STATES[this._state[item.item]];
            btnPill.attr("state", val);
        }
        )();
    }

    setTempFnSel(tempFnSel) {
        this._selFnCache = this._selFnCache || this._selFn;
        if (tempFnSel)
            this._selFn = tempFnSel;
        else
            this._selFn = this._selFnCache;
    }

    updateMiniPillClasses() {
        this._items.filter(it=>it.btnMini).forEach(it=>{
            const isDefaultDesel = this._deselFn && this._deselFn(it.item);
            const isDefaultSel = this._selFn && this._selFn(it.item);
            it.btnMini.toggleClass("fltr__mini-pill--default-desel", isDefaultDesel).toggleClass("fltr__mini-pill--default-sel", isDefaultSel);
        }
        );
    }

    _getBtnMini(item) {
        const toDisplay = this._getDisplayTextMini(item);

        const btnMini = e_({
            tag: "div",
            clazz: `fltr__mini-pill ${this._filterBox.isMinisHidden(this.header) ? "ve-hidden" : ""} ${this._deselFn && this._deselFn(item.item) ? "fltr__mini-pill--default-desel" : ""} ${this._selFn && this._selFn(item.item) ? "fltr__mini-pill--default-sel" : ""}`,
            html: toDisplay,
            title: `${this._displayFnTitle ? `${this._displayFnTitle(item.item, item)} (` : ""}Filter: ${this.header}${this._displayFnTitle ? ")" : ""}`,
            click: ()=>{
                this._state[item.item] = 0;
                this._filterBox.fireChangeEvent();
            }
            ,
        }).attr("state", FilterBox._PILL_STATES[this._state[item.item]]);

        const hook = ()=>{
            const val = FilterBox._PILL_STATES[this._state[item.item]];
            btnMini.attr("state", val);
            if (item.pFnChange)
                item.pFnChange(item.item, val);
        }
        ;
        this._addHook("state", item.item, hook);

        const hideHook = ()=>btnMini.toggleClass("ve-hidden", this._filterBox.isMinisHidden(this.header));
        this._filterBox.registerMinisHiddenHook(this.header, hideHook);

        return btnMini;
    }

    _doSetPillsAll() {
        this._proxyAssignSimple("state", Object.keys(this._state).mergeMap(k=>({
            [k]: 1
        })), true, );
    }

    _doSetPillsClear() {
        this._proxyAssignSimple("state", Object.keys(this._state).mergeMap(k=>({
            [k]: 0
        })), true, );
    }

    _doSetPillsNone() {
        this._proxyAssignSimple("state", Object.keys(this._state).mergeMap(k=>({
            [k]: 2
        })), true, );
    }

    _doSetPinsDefault() {
        this.reset();
    }

    _getHeaderControls(opts) {
        const btnAll = e_({
            tag: "button",
            clazz: `btn btn-default ${opts.isMulti ? "btn-xxs" : "btn-xs"} fltr__h-btn--all w-100`,
            click: ()=>this._doSetPillsAll(),
            html: "All",
        });
        const btnClear = e_({
            tag: "button",
            clazz: `btn btn-default ${opts.isMulti ? "btn-xxs" : "btn-xs"} fltr__h-btn--clear w-100`,
            click: ()=>this._doSetPillsClear(),
            html: "Clear",
        });
        const btnNone = e_({
            tag: "button",
            clazz: `btn btn-default ${opts.isMulti ? "btn-xxs" : "btn-xs"} fltr__h-btn--none w-100`,
            click: ()=>this._doSetPillsNone(),
            html: "None",
        });
        const btnDefault = e_({
            tag: "button",
            clazz: `btn btn-default ${opts.isMulti ? "btn-xxs" : "btn-xs"} w-100`,
            click: ()=>this._doSetPinsDefault(),
            html: "Default",
        });

        const wrpStateBtnsOuter = e_({
            tag: "div",
            clazz: "ve-flex-v-center fltr__h-wrp-state-btns-outer",
            children: [e_({
                tag: "div",
                clazz: "btn-group ve-flex-v-center w-100",
                children: [btnAll, btnClear, btnNone, btnDefault, ],
            }), ],
        });
        this._getHeaderControls_addExtraStateBtns(opts, wrpStateBtnsOuter);

        const wrpSummary = e_({
            tag: "div",
            clazz: "ve-flex-vh-center ve-hidden"
        });

        const btnCombineBlue = e_({
            tag: "button",
            clazz: `btn btn-default ${opts.isMulti ? "btn-xxs" : "btn-xs"} fltr__h-btn-logic--blue fltr__h-btn-logic w-100`,
            click: ()=>this._meta.combineBlue = Filter._getNextCombineMode(this._meta.combineBlue),
            title: `Blue match mode for this filter. "AND" requires all blues to match, "OR" requires at least one blue to match, "XOR" requires exactly one blue to match.`,
        });
        const hookCombineBlue = ()=>e_({
            ele: btnCombineBlue,
            text: `${this._meta.combineBlue}`.toUpperCase()
        });
        this._addHook("meta", "combineBlue", hookCombineBlue);
        hookCombineBlue();

        const btnCombineRed = e_({
            tag: "button",
            clazz: `btn btn-default ${opts.isMulti ? "btn-xxs" : "btn-xs"} fltr__h-btn-logic--red fltr__h-btn-logic w-100`,
            click: ()=>this._meta.combineRed = Filter._getNextCombineMode(this._meta.combineRed),
            title: `Red match mode for this filter. "AND" requires all reds to match, "OR" requires at least one red to match, "XOR" requires exactly one red to match.`,
        });
        const hookCombineRed = ()=>e_({
            ele: btnCombineRed,
            text: `${this._meta.combineRed}`.toUpperCase()
        });
        this._addHook("meta", "combineRed", hookCombineRed);
        hookCombineRed();

        const btnShowHide = e_({
            tag: "button",
            clazz: `btn btn-default ${opts.isMulti ? "btn-xxs" : "btn-xs"} ml-2`,
            click: ()=>this._meta.isHidden = !this._meta.isHidden,
            html: "Hide",
        });
        const hookShowHide = ()=>{
            e_({
                ele: btnShowHide
            }).toggleClass("active", this._meta.isHidden);
            wrpStateBtnsOuter.toggleVe(!this._meta.isHidden);

            const cur = this.getValues()[this.header];

            const htmlSummary = [cur._totals.yes ? `<span class="fltr__summary_item fltr__summary_item--include" title="${cur._totals.yes} hidden &quot;required&quot; tags">${cur._totals.yes}</span>` : null, cur._totals.yes && cur._totals.no ? `<span class="fltr__summary_item_spacer"></span>` : null, cur._totals.no ? `<span class="fltr__summary_item fltr__summary_item--exclude" title="${cur._totals.no} hidden &quot;excluded&quot; tags">${cur._totals.no}</span>` : null, ].filter(Boolean).join("");
            e_({
                ele: wrpSummary,
                html: htmlSummary
            }).toggleVe(this._meta.isHidden);
        }
        ;
        this._addHook("meta", "isHidden", hookShowHide);
        hookShowHide();

        return e_({
            tag: "div",
            clazz: `ve-flex-v-center fltr__h-wrp-btns-outer`,
            children: [wrpSummary, wrpStateBtnsOuter, e_({
                tag: "span",
                clazz: `btn-group ml-2 ve-flex-v-center`,
                children: [btnCombineBlue, btnCombineRed]
            }), btnShowHide, ],
        });
    }

    _getHeaderControls_addExtraStateBtns() {}

    $render(opts) {
        this._filterBox = opts.filterBox;
        this.__wrpMiniPills = opts.$wrpMini ? e_({
            ele: opts.$wrpMini[0]
        }) : null;

        const wrpControls = this._getHeaderControls(opts);

        if (this._nests) {
            const wrpNestHead = e_({
                tag: "div",
                clazz: "fltr__wrp-pills--sub"
            }).appendTo(this.__wrpPills);
            this.__$wrpNestHeadInner = e_({
                tag: "div",
                clazz: "ve-flex ve-flex-wrap fltr__container-pills"
            }).appendTo(wrpNestHead);

            const wrpNestHeadSummary = e_({
                tag: "div",
                clazz: "fltr__summary_nest"
            }).appendTo(wrpNestHead);

            this._updateNestSummary = ()=>{
                const stats = {
                    high: 0,
                    low: 0
                };
                this._items.filter(it=>this._state[it.item] && this._nestsHidden[it.nest]).forEach(it=>{
                    const key = this._state[it.item] === 1 ? "high" : "low";
                    stats[key]++;
                }
                );

                wrpNestHeadSummary.empty();

                if (stats.high) {
                    e_({
                        tag: "span",
                        clazz: "fltr__summary_item fltr__summary_item--include",
                        text: stats.high,
                        title: `${stats.high} hidden "required" tag${stats.high === 1 ? "" : "s"}`,
                    }).appendTo(wrpNestHeadSummary);
                }

                if (stats.high && stats.low)
                    e_({
                        tag: "span",
                        clazz: "fltr__summary_item_spacer"
                    }).appendTo(wrpNestHeadSummary);

                if (stats.low) {
                    e_({
                        tag: "span",
                        clazz: "fltr__summary_item fltr__summary_item--exclude",
                        text: stats.low,
                        title: `${stats.low} hidden "excluded" tag${stats.low === 1 ? "" : "s"}`,
                    }).appendTo(wrpNestHeadSummary);
                }
            }
            ;

            this._doRenderNests();
        }

        this._doRenderPills();

        const btnMobToggleControls = this._getBtnMobToggleControls(wrpControls);

        this.__$wrpFilter = $$`<div>
			${opts.isFirst ? "" : `<div class="fltr__dropdown-divider ${opts.isMulti ? "fltr__dropdown-divider--indented" : ""} mb-1"></div>`}
			<div class="split fltr__h ${this._minimalUi ? "fltr__minimal-hide" : ""} mb-1">
				<div class="fltr__h-text ve-flex-h-center mobile__w-100">
					${opts.isMulti ? `<span class="mr-2">\u2012</span>` : ""}
					${this._getRenderedHeader()}
					${btnMobToggleControls}
				</div>
				${wrpControls}
			</div>
			${this.__wrpPills}
		</div>`;

        this._doToggleDisplay();

        return this.__$wrpFilter;
    }

    $renderMinis(opts) {
        if (!opts.$wrpMini)
            return;

        this._filterBox = opts.filterBox;
        this.__wrpMiniPills = e_({
            ele: opts.$wrpMini[0]
        });

        this._renderMinis_initWrpPills();

        this._doRenderMiniPills();
    }

    _renderMinis_initWrpPills() {
        this.__wrpPills = e_({
            tag: "div",
            clazz: `fltr__wrp-pills ${this._groupFn ? "fltr__wrp-subs" : "fltr__container-pills"}`
        });
        const hook = ()=>this.__wrpPills.toggleVe(!this._meta.isHidden);
        this._addHook("meta", "isHidden", hook);
        hook();
    }

    getValues({nxtState=null}={}) {
        const state = MiscUtil.copy(nxtState?.[this.header]?.state || this.__state);
        const meta = nxtState?.[this.header]?.meta || this.__meta;

        Object.keys(state).filter(k=>!this._items.some(it=>`${it.item}` === k)).forEach(k=>delete state[k]);
        const out = {
            ...state
        };

        out._isActive = Object.values(state).some(Boolean);
        out._totals = {
            yes: 0,
            no: 0,
            ignored: 0
        };
        Object.values(state).forEach(v=>{
            const totalKey = v === 0 ? "ignored" : v === 1 ? "yes" : "no";
            out._totals[totalKey]++;
        }
        );
        out._combineBlue = meta.combineBlue;
        out._combineRed = meta.combineRed;
        return {
            [this.header]: out
        };
    }

    _getNextState_base() {
        return {
            [this.header]: {
                ...super._getNextState_base()[this.header],
                nestsHidden: MiscUtil.copyFast(this.__nestsHidden),
            },
        };
    }

    _mutNextState_reset(nxtState, {isResetAll=false}={}) {
        if (isResetAll) {
            this._mutNextState_resetBase(nxtState);
            this._mutNextState_resetNestsHidden({
                tgt: nxtState[this.header].nestsHidden
            });
        } else {
            Object.assign(nxtState[this.header].meta, {
                combineBlue: Filter._DEFAULT_META.combineBlue,
                combineRed: Filter._DEFAULT_META.combineRed
            });
        }
        Object.keys(nxtState[this.header].state).forEach(k=>delete nxtState[this.header].state[k]);
        this._items.forEach(item=>nxtState[this.header].state[item.item] = this._getDefaultState(item.item));
    }

    _doRenderPills() {
        if (this._itemSortFn)
            this._items.sort(this._isSortByDisplayItems && this._displayFn ? (a,b)=>this._itemSortFn(this._displayFn(a.item, a), this._displayFn(b.item, b)) : this._itemSortFn);

        this._items.forEach(it=>{
            if (!it.rendered) {
                it.rendered = this._getPill(it);
                if (it.nest) {
                    const hook = ()=>it.rendered.toggleVe(!this._nestsHidden[it.nest]);
                    this._addHook("nestsHidden", it.nest, hook);
                    hook();
                }
            }

            if (this._groupFn) {
                const group = this._groupFn(it);
                this._doRenderPills_doRenderWrpGroup(group);
                this._pillGroupsMeta[group].wrpPills.append(it.rendered);
            } else
                it.rendered.appendTo(this.__wrpPills);
        }
        );
    }

    _doRenderPills_doRenderWrpGroup(group) {
        const existingMeta = this._pillGroupsMeta[group];
        if (existingMeta && !existingMeta.isAttached) {
            existingMeta.hrDivider.appendTo(this.__wrpPills);
            existingMeta.wrpPills.appendTo(this.__wrpPills);
            existingMeta.isAttached = true;
        }
        if (existingMeta)
            return;

        this._pillGroupsMeta[group] = {
            hrDivider: this._doRenderPills_doRenderWrpGroup_getHrDivider(group).appendTo(this.__wrpPills),
            wrpPills: this._doRenderPills_doRenderWrpGroup_getWrpPillsSub(group).appendTo(this.__wrpPills),
            isAttached: true,
        };

        Object.entries(this._pillGroupsMeta).sort((a,b)=>SortUtil.ascSortLower(a[0], b[0])).forEach(([groupKey,groupMeta],i)=>{
            groupMeta.hrDivider.appendTo(this.__wrpPills);
            groupMeta.hrDivider.toggleVe(!this._isGroupDividerHidden(groupKey, i));
            groupMeta.wrpPills.appendTo(this.__wrpPills);
        }
        );

        if (this._nests) {
            this._pillGroupsMeta[group].toggleDividerFromNestVisibility = ()=>{
                this._pillGroupsMeta[group].hrDivider.toggleVe(!this._isGroupDividerHidden(group));
            }
            ;

            Object.keys(this._nests).forEach(nestName=>{
                const hook = ()=>this._pillGroupsMeta[group].toggleDividerFromNestVisibility();
                this._addHook("nestsHidden", nestName, hook);
                hook();
                this._pillGroupsMeta[group].toggleDividerFromNestVisibility();
            }
            );
        }
    }

    _isGroupDividerHidden(group, ixSortedGroups) {
        if (!this._nests) {
            if (ixSortedGroups === undefined)
                return `${group}` === `${Object.keys(this._pillGroupsMeta).sort((a,b)=>SortUtil.ascSortLower(a, b))[0]}`;
            return ixSortedGroups === 0;
        }

        const groupItems = this._items.filter(it=>this._groupFn(it) === group);
        const hiddenGroupItems = groupItems.filter(it=>this._nestsHidden[it.nest]);
        return groupItems.length === hiddenGroupItems.length;
    }

    _doRenderPills_doRenderWrpGroup_getHrDivider() {
        return e_({
            tag: "hr",
            clazz: `fltr__dropdown-divider--sub hr-2 mx-3`
        });
    }
    _doRenderPills_doRenderWrpGroup_getWrpPillsSub() {
        return e_({
            tag: "div",
            clazz: `fltr__wrp-pills--sub fltr__container-pills`
        });
    }

    _doRenderMiniPills() {
        const view = this._items.slice(0);
        if (this._itemSortFnMini || this._itemSortFn) {
            const fnSort = this._itemSortFnMini || this._itemSortFn;
            view.sort(this._isSortByDisplayItems && this._displayFn ? (a,b)=>fnSort(this._displayFn(a.item, a), this._displayFn(b.item, b)) : fnSort);
        }

        if (this.__wrpMiniPills) {
            view.forEach(it=>{
                (it.btnMini = it.btnMini || this._getBtnMini(it)).appendTo(this.__wrpMiniPills);
            }
            );
        }
    }

    _doToggleDisplay() {
        if (this.__$wrpFilter)
            this.__$wrpFilter.toggleClass("fltr__no-items", !this._items.length);
    }

    _doRenderNests() {
        Object.entries(this._nests).sort((a,b)=>SortUtil.ascSort(a[0], b[0])).forEach(([nestName,nestMeta])=>{
            if (nestMeta._$btnNest == null) {
                if (this._nestsHidden[nestName] == null)
                    this._nestsHidden[nestName] = !!nestMeta.isHidden;

                const $btnText = $(`<span>${nestName} [${this._nestsHidden[nestName] ? "+" : "\u2212"}]</span>`);
                nestMeta._$btnNest = $$`<div class="fltr__btn_nest">${$btnText}</div>`.click(()=>this._nestsHidden[nestName] = !this._nestsHidden[nestName]);

                const hook = ()=>{
                    $btnText.text(`${nestName} [${this._nestsHidden[nestName] ? "+" : "\u2212"}]`);

                    const stats = {
                        high: 0,
                        low: 0,
                        total: 0
                    };
                    this._items.filter(it=>it.nest === nestName).find(it=>{
                        const key = this._state[it.item] === 1 ? "high" : this._state[it.item] ? "low" : "ignored";
                        stats[key]++;
                        stats.total++;
                    }
                    );
                    const allHigh = stats.total === stats.high;
                    const allLow = stats.total === stats.low;
                    nestMeta._$btnNest.toggleClass("fltr__btn_nest--include-all", this._nestsHidden[nestName] && allHigh).toggleClass("fltr__btn_nest--exclude-all", this._nestsHidden[nestName] && allLow).toggleClass("fltr__btn_nest--include", this._nestsHidden[nestName] && !!(!allHigh && !allLow && stats.high && !stats.low)).toggleClass("fltr__btn_nest--exclude", this._nestsHidden[nestName] && !!(!allHigh && !allLow && !stats.high && stats.low)).toggleClass("fltr__btn_nest--both", this._nestsHidden[nestName] && !!(!allHigh && !allLow && stats.high && stats.low));

                    if (this._updateNestSummary)
                        this._updateNestSummary();
                }
                ;

                this._items.filter(it=>it.nest === nestName).find(it=>{
                    this._addHook("state", it.item, hook);
                }
                );

                this._addHook("nestsHidden", nestName, hook);
                hook();
            }
            nestMeta._$btnNest.appendTo(this.__$wrpNestHeadInner);
        }
        );

        if (this._updateNestSummary)
            this._updateNestSummary();
    }

    update() {
        if (this._isNestsDirty) {
            this._isNestsDirty = false;

            this._doRenderNests();
        }

        if (this._isItemsDirty) {
            this._isItemsDirty = false;

            this._doRenderPills();
        }

        this._doRenderMiniPills();
        this._doToggleDisplay();
    }

    addItem(item) {
        if (item == null)
            return;

        if (item instanceof Array) {
            const len = item.length;
            for (let i = 0; i < len; ++i)
                this.addItem(item[i]);
            return;
        }

        if (!this.__itemsSet.has(item.item || item)) {
            item = item instanceof FilterItem ? item : new FilterItem({
                item
            });
            Filter._validateItemNest(item, this._nests);

            this._isItemsDirty = true;
            this._items.push(item);
            this.__itemsSet.add(item.item);
            if (this._state[item.item] == null)
                this._defaultItemState(item);
        }
    }

    static _isItemsEqual(item1, item2) {
        return (item1 instanceof FilterItem ? item1.item : item1) === (item2 instanceof FilterItem ? item2.item : item2);
    }

    removeItem(item) {
        const ixItem = this._items.findIndex(it=>Filter._isItemsEqual(it, item));
        if (~ixItem) {
            const item = this._items[ixItem];

            this._isItemsDirty = true;
            item.rendered.detach();
            item.btnMini.detach();
            this._items.splice(ixItem, 1);
        }
    }

    addNest(nestName, nestMeta) {
        if (!this._nests)
            throw new Error(`Filter was not nested!`);
        if (!this._nests[nestName]) {
            this._isNestsDirty = true;
            this._nests[nestName] = nestMeta;

            if (this._groupFn) {
                Object.keys(this._pillGroupsMeta).forEach(group=>{
                    const hook = ()=>this._pillGroupsMeta[group].toggleDividerFromNestVisibility();
                    this._addHook("nestsHidden", nestName, hook);
                    hook();
                    this._pillGroupsMeta[group].toggleDividerFromNestVisibility();
                }
                );
            }
        }
    }

    _toDisplay_getMappedEntryVal(entryVal) {
        if (!(entryVal instanceof Array))
            entryVal = [entryVal];
        entryVal = entryVal.map(it=>it instanceof FilterItem ? it : new FilterItem({
            item: it
        }));
        return entryVal;
    }

    _toDisplay_getFilterState(boxState) {
        return boxState[this.header];
    }

    toDisplay(boxState, entryVal) {
        const filterState = this._toDisplay_getFilterState(boxState);
        if (!filterState)
            return true;

        const totals = filterState._totals;

        entryVal = this._toDisplay_getMappedEntryVal(entryVal);

        const isUmbrella = ()=>{
            if (this._umbrellaItems) {
                if (!entryVal)
                    return false;

                if (this._umbrellaExcludes && this._umbrellaExcludes.some(it=>filterState[it.item]))
                    return false;

                return this._umbrellaItems.some(u=>entryVal.includes(u.item)) && (this._umbrellaItems.some(u=>filterState[u.item] === 0) || this._umbrellaItems.some(u=>filterState[u.item] === 1));
            }
        }
        ;

        let hide = false;
        let display = false;

        switch (filterState._combineBlue) {
        case "or":
            {
                if (totals.yes === 0)
                    display = true;

                display = display || entryVal.some(fi=>filterState[fi.item] === 1 || isUmbrella());

                break;
            }
        case "xor":
            {
                if (totals.yes === 0)
                    display = true;

                display = display || entryVal.filter(fi=>filterState[fi.item] === 1 || isUmbrella()).length === 1;

                break;
            }
        case "and":
            {
                const totalYes = entryVal.filter(fi=>filterState[fi.item] === 1).length;
                display = !totals.yes || totals.yes === totalYes;

                break;
            }
        default:
            throw new Error(`Unhandled combine mode "${filterState._combineBlue}"`);
        }

        switch (filterState._combineRed) {
        case "or":
            {
                hide = hide || entryVal.filter(fi=>!fi.isIgnoreRed).some(fi=>filterState[fi.item] === 2);

                break;
            }
        case "xor":
            {
                hide = hide || entryVal.filter(fi=>!fi.isIgnoreRed).filter(fi=>filterState[fi.item] === 2).length === 1;

                break;
            }
        case "and":
            {
                const totalNo = entryVal.filter(fi=>!fi.isIgnoreRed).filter(fi=>filterState[fi.item] === 2).length;
                hide = totals.no && totals.no === totalNo;

                break;
            }
        default:
            throw new Error(`Unhandled combine mode "${filterState._combineRed}"`);
        }

        return display && !hide;
    }

    _doInvertPins() {
        const cur = MiscUtil.copy(this._state);
        Object.keys(this._state).forEach(k=>this._state[k] = cur[k] === 1 ? 0 : 1);
    }

    getDefaultMeta() {
        return {
            ...super.getDefaultMeta(),
            ...Filter._DEFAULT_META,
        };
    }

    handleSearch(searchTerm) {
        const isHeaderMatch = this.header.toLowerCase().includes(searchTerm);

        if (isHeaderMatch) {
            this._items.forEach(it=>{
                if (!it.rendered)
                    return;
                it.rendered.toggleClass("fltr__hidden--search", false);
            }
            );

            if (this.__$wrpFilter)
                this.__$wrpFilter.toggleClass("fltr__hidden--search", false);

            return true;
        }

        let visibleCount = 0;
        this._items.forEach(it=>{
            if (!it.rendered)
                return;
            const isVisible = it.searchText.includes(searchTerm);
            it.rendered.toggleClass("fltr__hidden--search", !isVisible);
            if (isVisible)
                visibleCount++;
        }
        );

        if (this.__$wrpFilter)
            this.__$wrpFilter.toggleClass("fltr__hidden--search", visibleCount === 0);

        return visibleCount !== 0;
    }

    static _getNextCombineMode(combineMode) {
        let ix = Filter._COMBINE_MODES.indexOf(combineMode);
        if (ix === -1)
            ix = (Filter._COMBINE_MODES.length - 1);
        if (++ix === Filter._COMBINE_MODES.length)
            ix = 0;
        return Filter._COMBINE_MODES[ix];
    }

    _doTeardown() {
        this._items.forEach(it=>{
            if (it.rendered)
                it.rendered.detach();
            if (it.btnMini)
                it.btnMini.detach();
        }
        );

        Object.values(this._nests || {}).filter(nestMeta=>nestMeta._$btnNest).forEach(nestMeta=>nestMeta._$btnNest.detach());

        Object.values(this._pillGroupsMeta || {}).forEach(it=>{
            it.hrDivider.detach();
            it.wrpPills.detach();
            it.isAttached = false;
        }
        );
    }
}
;
Filter._DEFAULT_META = {
    combineBlue: "or",
    combineRed: "or",
};
Filter._COMBINE_MODES = ["or", "and", "xor"];


class SourceFilter extends Filter {
    static _SORT_ITEMS_MINI(a, b) {
        a = a.item ?? a;
        b = b.item ?? b;
        const valA = BrewUtil2.hasSourceJson(a) ? 2 : (SourceUtil.isNonstandardSource(a) || PrereleaseUtil.hasSourceJson(a)) ? 1 : 0;
        const valB = BrewUtil2.hasSourceJson(b) ? 2 : (SourceUtil.isNonstandardSource(b) || PrereleaseUtil.hasSourceJson(b)) ? 1 : 0;
        return SortUtil.ascSort(valA, valB) || SortUtil.ascSortLower(Parser.sourceJsonToFull(a), Parser.sourceJsonToFull(b));
    }

    static _getDisplayHtmlMini(item) {
        item = item.item || item;
        const isBrewSource = BrewUtil2.hasSourceJson(item);
        const isNonStandardSource = !isBrewSource && (SourceUtil.isNonstandardSource(item) || PrereleaseUtil.hasSourceJson(item));
        return `<span ${isBrewSource ? `title="(Homebrew)"` : isNonStandardSource ? `title="(UA/Etc.)"` : ""} class="glyphicon ${isBrewSource ? `glyphicon-glass` : isNonStandardSource ? `glyphicon-file` : `glyphicon-book`}"></span> ${Parser.sourceJsonToAbv(item)}`;
    }

    constructor(opts) {
        opts = opts || {};

        opts.header = opts.header === undefined ? FilterBox.SOURCE_HEADER : opts.header;
        opts.displayFn = opts.displayFn === undefined ? item=>Parser.sourceJsonToFullCompactPrefix(item.item || item) : opts.displayFn;
        opts.displayFnMini = opts.displayFnMini === undefined ? SourceFilter._getDisplayHtmlMini.bind(SourceFilter) : opts.displayFnMini;
        opts.displayFnTitle = opts.displayFnTitle === undefined ? item=>Parser.sourceJsonToFull(item.item || item) : opts.displayFnTitle;
        opts.itemSortFnMini = opts.itemSortFnMini === undefined ? SourceFilter._SORT_ITEMS_MINI.bind(SourceFilter) : opts.itemSortFnMini;
        opts.itemSortFn = opts.itemSortFn === undefined ? (a,b)=>SortUtil.ascSortLower(Parser.sourceJsonToFull(a.item), Parser.sourceJsonToFull(b.item)) : opts.itemSortFn;
        opts.groupFn = opts.groupFn === undefined ? SourceUtil.getFilterGroup : opts.groupFn;
        opts.selFn = opts.selFn === undefined ? PageFilter.defaultSourceSelFn : opts.selFn;

        super(opts);

        this.__tmpState = {
            ixAdded: 0
        };
        this._tmpState = this._getProxy("tmpState", this.__tmpState);
    }

    doSetPillsClear() {
        return this._doSetPillsClear();
    }

    addItem(item) {
        const out = super.addItem(item);
        this._tmpState.ixAdded++;
        return out;
    }

    removeItem(item) {
        const out = super.removeItem(item);
        this._tmpState.ixAdded--;
        return out;
    }

    _getHeaderControls_addExtraStateBtns(opts, wrpStateBtnsOuter) {
        const btnSupplements = e_({
            tag: "button",
            clazz: `btn btn-default w-100 ${opts.isMulti ? "btn-xxs" : "btn-xs"}`,
            title: `SHIFT to add to existing selection; CTRL to include UA/etc.`,
            html: `Core/Supplements`,
            click: evt=>this._doSetPinsSupplements({
                isIncludeUnofficial: EventUtil.isCtrlMetaKey(evt),
                isAdditive: evt.shiftKey
            }),
        });

        const btnAdventures = e_({
            tag: "button",
            clazz: `btn btn-default w-100 ${opts.isMulti ? "btn-xxs" : "btn-xs"}`,
            title: `SHIFT to add to existing selection; CTRL to include UA`,
            html: `Adventures`,
            click: evt=>this._doSetPinsAdventures({
                isIncludeUnofficial: EventUtil.isCtrlMetaKey(evt),
                isAdditive: evt.shiftKey
            }),
        });

        const btnPartnered = e_({
            tag: "button",
            clazz: `btn btn-default w-100 ${opts.isMulti ? "btn-xxs" : "btn-xs"}`,
            title: `SHIFT to add to existing selection`,
            html: `Partnered`,
            click: evt=>this._doSetPinsPartnered({
                isAdditive: evt.shiftKey
            }),
        });

        const btnHomebrew = e_({
            tag: "button",
            clazz: `btn btn-default w-100 ${opts.isMulti ? "btn-xxs" : "btn-xs"}`,
            title: `SHIFT to add to existing selection`,
            html: `Homebrew`,
            click: evt=>this._doSetPinsHomebrew({
                isAdditive: evt.shiftKey
            }),
        });

        const hkIsButtonsActive = ()=>{
            const hasPartnered = Object.keys(this.__state).some(src=>SourceUtil.getFilterGroup(src) === SourceUtil.FILTER_GROUP_PARTNERED);
            btnPartnered.toggleClass("ve-hidden", !hasPartnered);

            const hasBrew = Object.keys(this.__state).some(src=>SourceUtil.getFilterGroup(src) === SourceUtil.FILTER_GROUP_HOMEBREW);
            btnHomebrew.toggleClass("ve-hidden", !hasBrew);
        }
        ;
        this._addHook("tmpState", "ixAdded", hkIsButtonsActive);
        hkIsButtonsActive();

        const actionSelectDisplayMode = new ContextUtil.ActionSelect({
            values: Object.keys(SourceFilter._PILL_DISPLAY_MODE_LABELS).map(Number),
            fnGetDisplayValue: val=>SourceFilter._PILL_DISPLAY_MODE_LABELS[val] || SourceFilter._PILL_DISPLAY_MODE_LABELS[0],
            fnOnChange: val=>this._meta.pillDisplayMode = val,
        });
        this._addHook("meta", "pillDisplayMode", ()=>{
            actionSelectDisplayMode.setValue(this._meta.pillDisplayMode);
        }
        )();

        const menu = ContextUtil.getMenu([new ContextUtil.Action("Select All Standard Sources",()=>this._doSetPinsStandard(),), new ContextUtil.Action("Select All Partnered Sources",()=>this._doSetPinsPartnered(),), new ContextUtil.Action("Select All Non-Standard Sources",()=>this._doSetPinsNonStandard(),), new ContextUtil.Action("Select All Homebrew Sources",()=>this._doSetPinsHomebrew(),), null, new ContextUtil.Action(`Select "Vanilla" Sources`,()=>this._doSetPinsVanilla(),{
            title: `Select a baseline set of sources suitable for any campaign.`
        },), new ContextUtil.Action("Select All Non-UA Sources",()=>this._doSetPinsNonUa(),), null, new ContextUtil.Action("Select SRD Sources",()=>this._doSetPinsSrd(),{
            title: `Select System Reference Document Sources.`
        },), new ContextUtil.Action("Select Basic Rules Sources",()=>this._doSetPinsBasicRules(),), null, new ContextUtil.Action("Invert Selection",()=>this._doInvertPins(),), null, actionSelectDisplayMode, ]);
        const btnBurger = e_({
            tag: "button",
            clazz: `btn btn-default ${opts.isMulti ? "btn-xxs" : "btn-xs"}`,
            html: `<span class="glyphicon glyphicon-option-vertical"></span>`,
            click: evt=>ContextUtil.pOpenMenu(evt, menu),
            title: "Other Options",
        });

        const btnOnlyPrimary = e_({
            tag: "button",
            clazz: `btn btn-default w-100 ${opts.isMulti ? "btn-xxs" : "btn-xs"}`,
            html: `Include References`,
            title: `Consider entities as belonging to every source they appear in (i.e. reprints) as well as their primary source`,
            click: ()=>this._meta.isIncludeOtherSources = !this._meta.isIncludeOtherSources,
        });
        const hkIsIncludeOtherSources = ()=>{
            btnOnlyPrimary.toggleClass("active", !!this._meta.isIncludeOtherSources);
        }
        ;
        hkIsIncludeOtherSources();
        this._addHook("meta", "isIncludeOtherSources", hkIsIncludeOtherSources);

        e_({
            tag: "div",
            clazz: `btn-group mr-2 w-100 ve-flex-v-center mobile__m-1 mobile__mb-2`,
            children: [btnSupplements, btnAdventures, btnPartnered, btnHomebrew, btnBurger, btnOnlyPrimary, ],
        }).prependTo(wrpStateBtnsOuter);
    }

    _doSetPinsStandard() {
        Object.keys(this._state).forEach(k=>this._state[k] = SourceUtil.getFilterGroup(k) === SourceUtil.FILTER_GROUP_STANDARD ? 1 : 0);
    }

    _doSetPinsPartnered({isAdditive=false}) {
        this._proxyAssignSimple("state", Object.keys(this._state).mergeMap(k=>({
            [k]: SourceUtil.getFilterGroup(k) === SourceUtil.FILTER_GROUP_PARTNERED ? 1 : isAdditive ? this._state[k] : 0
        })), );
    }

    _doSetPinsNonStandard() {
        Object.keys(this._state).forEach(k=>this._state[k] = SourceUtil.getFilterGroup(k) === SourceUtil.FILTER_GROUP_NON_STANDARD ? 1 : 0);
    }

    _doSetPinsSupplements({isIncludeUnofficial=false, isAdditive=false}={}) {
        this._proxyAssignSimple("state", Object.keys(this._state).mergeMap(k=>({
            [k]: SourceUtil.isCoreOrSupplement(k) && (isIncludeUnofficial || !SourceUtil.isNonstandardSource(k)) ? 1 : isAdditive ? this._state[k] : 0
        })), );
    }

    _doSetPinsAdventures({isIncludeUnofficial=false, isAdditive=false}) {
        this._proxyAssignSimple("state", Object.keys(this._state).mergeMap(k=>({
            [k]: SourceUtil.isAdventure(k) && (isIncludeUnofficial || !SourceUtil.isNonstandardSource(k)) ? 1 : isAdditive ? this._state[k] : 0
        })), );
    }

    _doSetPinsHomebrew({isAdditive=false}) {
        this._proxyAssignSimple("state", Object.keys(this._state).mergeMap(k=>({
            [k]: SourceUtil.getFilterGroup(k) === SourceUtil.FILTER_GROUP_HOMEBREW ? 1 : isAdditive ? this._state[k] : 0
        })), );
    }

    _doSetPinsVanilla() {
        Object.keys(this._state).forEach(k=>this._state[k] = Parser.SOURCES_VANILLA.has(k) ? 1 : 0);
    }

    _doSetPinsNonUa() {
        Object.keys(this._state).forEach(k=>this._state[k] = !SourceUtil.isPrereleaseSource(k) ? 1 : 0);
    }

    _doSetPinsSrd() {
        SourceFilter._SRD_SOURCES = SourceFilter._SRD_SOURCES || new Set([Parser.SRC_PHB, Parser.SRC_MM, Parser.SRC_DMG]);

        Object.keys(this._state).forEach(k=>this._state[k] = SourceFilter._SRD_SOURCES.has(k) ? 1 : 0);

        const srdFilter = this._filterBox.filters.find(it=>it.isSrdFilter);
        if (srdFilter)
            srdFilter.setValue("SRD", 1);

        const basicRulesFilter = this._filterBox.filters.find(it=>it.isBasicRulesFilter);
        if (basicRulesFilter)
            basicRulesFilter.setValue("Basic Rules", 0);

        const reprintedFilter = this._filterBox.filters.find(it=>it.isReprintedFilter);
        if (reprintedFilter)
            reprintedFilter.setValue("Reprinted", 0);
    }

    _doSetPinsBasicRules() {
        SourceFilter._BASIC_RULES_SOURCES = SourceFilter._BASIC_RULES_SOURCES || new Set([Parser.SRC_PHB, Parser.SRC_MM, Parser.SRC_DMG]);

        Object.keys(this._state).forEach(k=>this._state[k] = SourceFilter._BASIC_RULES_SOURCES.has(k) ? 1 : 0);

        const basicRulesFilter = this._filterBox.filters.find(it=>it.isBasicRulesFilter);
        if (basicRulesFilter)
            basicRulesFilter.setValue("Basic Rules", 1);

        const srdFilter = this._filterBox.filters.find(it=>it.isSrdFilter);
        if (srdFilter)
            srdFilter.setValue("SRD", 0);

        const reprintedFilter = this._filterBox.filters.find(it=>it.isReprintedFilter);
        if (reprintedFilter)
            reprintedFilter.setValue("Reprinted", 0);
    }

    static getCompleteFilterSources(ent) {
        if (!ent.otherSources)
            return ent.source;

        const otherSourcesFilt = ent.otherSources.filter(src=>!ExcludeUtil.isExcluded("*", "*", src.source, {
            isNoCount: true
        }));
        if (!otherSourcesFilt.length)
            return ent.source;

        return [ent.source].concat(otherSourcesFilt.map(src=>new SourceFilterItem({
            item: src.source,
            isIgnoreRed: true,
            isOtherSource: true
        })));
    }

    _doRenderPills_doRenderWrpGroup_getHrDivider(group) {
        switch (group) {
        case SourceUtil.FILTER_GROUP_NON_STANDARD:
            return this._doRenderPills_doRenderWrpGroup_getHrDivider_groupNonStandard(group);
        case SourceUtil.FILTER_GROUP_HOMEBREW:
            return this._doRenderPills_doRenderWrpGroup_getHrDivider_groupBrew(group);
        default:
            return super._doRenderPills_doRenderWrpGroup_getHrDivider(group);
        }
    }

    _doRenderPills_doRenderWrpGroup_getHrDivider_groupNonStandard(group) {
        let dates = [];
        const comp = BaseComponent.fromObject({
            min: 0,
            max: 0,
            curMin: 0,
            curMax: 0,
        });

        const wrpSlider = new ComponentUiUtil.RangeSlider({
            comp,
            propMin: "min",
            propMax: "max",
            propCurMin: "curMin",
            propCurMax: "curMax",
            fnDisplay: val=>dates[val]?.str,
        }).get();

        const wrpWrpSlider = e_({
            tag: "div",
            clazz: `"w-100 ve-flex pt-2 pb-5 mb-2 mt-1 fltr-src__wrp-slider`,
            children: [wrpSlider, ],
        }).hideVe();

        const btnCancel = e_({
            tag: "button",
            clazz: `btn btn-xs btn-default px-1`,
            html: "Cancel",
            click: ()=>{
                grpBtnsInactive.showVe();
                wrpWrpSlider.hideVe();
                grpBtnsActive.hideVe();
            }
            ,
        });

        const btnConfirm = e_({
            tag: "button",
            clazz: `btn btn-xs btn-default px-1`,
            html: "Confirm",
            click: ()=>{
                grpBtnsInactive.showVe();
                wrpWrpSlider.hideVe();
                grpBtnsActive.hideVe();

                const min = comp._state.curMin;
                const max = comp._state.curMax;

                const allowedDateSet = new Set(dates.slice(min, max + 1).map(it=>it.str));
                const nxtState = {};
                Object.keys(this._state).filter(k=>SourceUtil.isNonstandardSource(k)).forEach(k=>{
                    const sourceDate = Parser.sourceJsonToDate(k);
                    nxtState[k] = allowedDateSet.has(sourceDate) ? 1 : 0;
                }
                );
                this._proxyAssign("state", "_state", "__state", nxtState);
            }
            ,
        });

        const btnShowSlider = e_({
            tag: "button",
            clazz: `btn btn-xxs btn-default px-1`,
            html: "Select by Date",
            click: ()=>{
                grpBtnsInactive.hideVe();
                wrpWrpSlider.showVe();
                grpBtnsActive.showVe();

                dates = Object.keys(this._state).filter(it=>SourceUtil.isNonstandardSource(it)).map(it=>Parser.sourceJsonToDate(it)).filter(Boolean).unique().map(it=>({
                    str: it,
                    date: new Date(it)
                })).sort((a,b)=>SortUtil.ascSortDate(a.date, b.date)).reverse();

                comp._proxyAssignSimple("state", {
                    min: 0,
                    max: dates.length - 1,
                    curMin: 0,
                    curMax: dates.length - 1,
                }, );
            }
            ,
        });

        const btnClear = e_({
            tag: "button",
            clazz: `btn btn-xxs btn-default px-1`,
            html: "Clear",
            click: ()=>{
                const nxtState = {};
                Object.keys(this._state).filter(k=>SourceUtil.isNonstandardSource(k)).forEach(k=>nxtState[k] = 0);
                this._proxyAssign("state", "_state", "__state", nxtState);
            }
            ,
        });

        const grpBtnsActive = e_({
            tag: "div",
            clazz: `ve-flex-v-center btn-group`,
            children: [btnCancel, btnConfirm, ],
        }).hideVe();

        const grpBtnsInactive = e_({
            tag: "div",
            clazz: `ve-flex-v-center btn-group`,
            children: [btnClear, btnShowSlider, ],
        });

        return e_({
            tag: "div",
            clazz: `ve-flex-col w-100`,
            children: [super._doRenderPills_doRenderWrpGroup_getHrDivider(), e_({
                tag: "div",
                clazz: `mb-1 ve-flex-h-right`,
                children: [grpBtnsActive, grpBtnsInactive, ],
            }), wrpWrpSlider, ],
        });
    }

    _doRenderPills_doRenderWrpGroup_getHrDivider_groupBrew(group) {
        const btnClear = e_({
            tag: "button",
            clazz: `btn btn-xxs btn-default px-1`,
            html: "Clear",
            click: ()=>{
                const nxtState = {};
                Object.keys(this._state).filter(k=>BrewUtil2.hasSourceJson(k)).forEach(k=>nxtState[k] = 0);
                this._proxyAssign("state", "_state", "__state", nxtState);
            }
            ,
        });

        return e_({
            tag: "div",
            clazz: `ve-flex-col w-100`,
            children: [super._doRenderPills_doRenderWrpGroup_getHrDivider(), e_({
                tag: "div",
                clazz: `mb-1 ve-flex-h-right`,
                children: [e_({
                    tag: "div",
                    clazz: `ve-flex-v-center btn-group`,
                    children: [btnClear, ],
                }), ],
            }), ],
        });
    }

    _toDisplay_getMappedEntryVal(entryVal) {
        entryVal = super._toDisplay_getMappedEntryVal(entryVal);
        if (!this._meta.isIncludeOtherSources)
            entryVal = entryVal.filter(it=>!it.isOtherSource);
        return entryVal;
    }

    _getPill(item) {
        const displayText = this._getDisplayText(item);
        const displayTextMini = this._getDisplayTextMini(item);

        const dispName = e_({
            tag: "span",
            html: displayText,
        });

        const spc = e_({
            tag: "span",
            clazz: "px-2 fltr-src__spc-pill",
            text: "|",
        });

        const dispAbbreviation = e_({
            tag: "span",
            html: displayTextMini,
        });

        const btnPill = e_({
            tag: "div",
            clazz: "fltr__pill",
            children: [dispAbbreviation, spc, dispName, ],
            click: evt=>this._getPill_handleClick({
                evt,
                item
            }),
            contextmenu: evt=>this._getPill_handleContextmenu({
                evt,
                item
            }),
        });

        this._getPill_bindHookState({
            btnPill,
            item
        });

        this._addHook("meta", "pillDisplayMode", ()=>{
            dispAbbreviation.toggleVe(this._meta.pillDisplayMode !== 0);
            spc.toggleVe(this._meta.pillDisplayMode === 2);
            dispName.toggleVe(this._meta.pillDisplayMode !== 1);
        }
        )();

        item.searchText = `${Parser.sourceJsonToAbv(item.item || item).toLowerCase()} -- ${displayText.toLowerCase()}`;

        return btnPill;
    }

    getSources() {
        const out = {
            all: [],
        };
        this._items.forEach(it=>{
            out.all.push(it.item);
            const group = this._groupFn(it);
            (out[group] ||= []).push(it.item);
        }
        );
        return out;
    }

    getDefaultMeta() {
        return {
            ...super.getDefaultMeta(),
            ...SourceFilter._DEFAULT_META,
        };
    }
}
;
SourceFilter._DEFAULT_META = {
    isIncludeOtherSources: false,
    pillDisplayMode: 0,
};
SourceFilter._PILL_DISPLAY_MODE_LABELS = {
    "0": "As Names",
    "1": "As Abbreviations",
    "2": "As Names Plus Abbreviations",
};
SourceFilter._SRD_SOURCES = null;
SourceFilter._BASIC_RULES_SOURCES = null;

class PageFilter {
    static defaultSourceSelFn(val) {
        return SourceUtil.getFilterGroup(val) === SourceUtil.FILTER_GROUP_STANDARD;
    }

    constructor(opts) {
        opts = opts || {};
        this._sourceFilter = new SourceFilter(opts.sourceFilterOpts);
        this._filterBox = null;
    }

    get filterBox() {
        return this._filterBox;
    }
    get sourceFilter() {
        return this._sourceFilter;
    }

    mutateAndAddToFilters(entity, isExcluded, opts) {
        this.constructor.mutateForFilters(entity, opts);
        this.addToFilters(entity, isExcluded, opts);
    }

    static mutateForFilters(entity, opts) {
        throw new Error("Unimplemented!");
    }
    addToFilters(entity, isExcluded, opts) {
        throw new Error("Unimplemented!");
    }
    toDisplay(values, entity) {
        throw new Error("Unimplemented!");
    }
    async _pPopulateBoxOptions() {
        throw new Error("Unimplemented!");
    }

    async pInitFilterBox(opts) {
        opts = opts || {};
        await this._pPopulateBoxOptions(opts);
        this._filterBox = new FilterBox(opts);
        await this._filterBox.pDoLoadState();
        return this._filterBox;
    }

    trimState() {
        return this._filterBox.trimState_();
    }

    static _getClassFilterItem({className, classSource, isVariantClass, definedInSource}) {
        const nm = className.split("(")[0].trim();
        const variantSuffix = isVariantClass ? ` [${definedInSource ? Parser.sourceJsonToAbv(definedInSource) : "Unknown"}]` : "";
        const sourceSuffix = (SourceUtil.isNonstandardSource(classSource || Parser.SRC_PHB) || (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(classSource || Parser.SRC_PHB)) || (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(classSource || Parser.SRC_PHB))) ? ` (${Parser.sourceJsonToAbv(classSource)})` : "";
        const name = `${nm}${variantSuffix}${sourceSuffix}`;

        const opts = {
            item: name,
            userData: {
                group: SourceUtil.getFilterGroup(classSource || Parser.SRC_PHB),
            },
        };

        if (isVariantClass) {
            opts.nest = definedInSource ? Parser.sourceJsonToFull(definedInSource) : "Unknown";
            opts.userData.equivalentClassName = `${nm}${sourceSuffix}`;
            opts.userData.definedInSource = definedInSource;
        }

        return new FilterItem(opts);
    }

    static _getSubclassFilterItem({className, classSource, subclassShortName, subclassName, subclassSource, subSubclassName, isVariantClass, definedInSource}) {
        const group = SourceUtil.isSubclassReprinted(className, classSource, subclassShortName, subclassSource) || Parser.sourceJsonToFull(subclassSource).startsWith(Parser.UA_PREFIX) || Parser.sourceJsonToFull(subclassSource).startsWith(Parser.PS_PREFIX);

        const classFilterItem = this._getClassFilterItem({
            className: subclassShortName || subclassName,
            classSource: subclassSource,
        });

        return new FilterItem({
            item: `${className}: ${classFilterItem.item}${subSubclassName ? `, ${subSubclassName}` : ""}`,
            nest: className,
            userData: {
                group,
            },
        });
    }

    static _isReprinted({reprintedAs, tag, page, prop}) {
        return reprintedAs?.length && reprintedAs.some(it=>{
            const {name, source} = DataUtil.generic.unpackUid(it?.uid ?? it, tag);
            const hash = UrlUtil.URL_TO_HASH_BUILDER[page]({
                name,
                source
            });
            return !ExcludeUtil.isExcluded(hash, prop, source, {
                isNoCount: true
            });
        }
        );
    }

    static getListAliases(ent) {
        return (ent.alias || []).map(it=>`"${it}"`).join(",");
    }
};

class PageFilterSpells extends PageFilter {
    static _META_ADD_CONC = "Concentration";
    static _META_ADD_V = "Verbal";
    static _META_ADD_S = "Somatic";
    static _META_ADD_M = "Material";
    static _META_ADD_R = "Royalty";
    static _META_ADD_M_COST = "Material with Cost";
    static _META_ADD_M_CONSUMED = "Material is Consumed";
    static _META_ADD_M_CONSUMED_OPTIONAL = "Material is Optionally Consumed";

    static F_RNG_POINT = "Point";
    static F_RNG_SELF_AREA = "Self (Area)";
    static F_RNG_SELF = "Self";
    static F_RNG_TOUCH = "Touch";
    static F_RNG_SPECIAL = "Special";

    static _META_FILTER_BASE_ITEMS = [this._META_ADD_CONC, this._META_ADD_V, this._META_ADD_S, this._META_ADD_M, this._META_ADD_R, this._META_ADD_M_COST, this._META_ADD_M_CONSUMED, this._META_ADD_M_CONSUMED_OPTIONAL, ...Object.keys(Parser.SP_MISC_TAG_TO_FULL), ];

    static INCHES_PER_FOOT = 12;
    static FEET_PER_YARD = 3;
    static FEET_PER_MILE = 5280;

    static sortSpells(a, b, o) {
        switch (o.sortBy) {
        case "name":
            return SortUtil.compareListNames(a, b);
        case "source":
        case "level":
        case "school":
        case "concentration":
        case "ritual":
            return SortUtil.ascSort(a.values[o.sortBy], b.values[o.sortBy]) || SortUtil.compareListNames(a, b);
        case "time":
            return SortUtil.ascSort(a.values.normalisedTime, b.values.normalisedTime) || SortUtil.compareListNames(a, b);
        case "range":
            return SortUtil.ascSort(a.values.normalisedRange, b.values.normalisedRange) || SortUtil.compareListNames(a, b);
        }
    }

    static sortMetaFilter(a, b) {
        const ixA = PageFilterSpells._META_FILTER_BASE_ITEMS.indexOf(a.item);
        const ixB = PageFilterSpells._META_FILTER_BASE_ITEMS.indexOf(b.item);

        if (~ixA && ~ixB)
            return ixA - ixB;
        if (~ixA)
            return -1;
        if (~ixB)
            return 1;
        return SortUtil.ascSortLower(a, b);
    }

    static getFilterAbilitySave(ability) {
        return `${ability.uppercaseFirst()} Save`;
    }
    static getFilterAbilityCheck(ability) {
        return `${ability.uppercaseFirst()} Check`;
    }

    static getMetaFilterObj(s) {
        const out = [];
        if (s.meta) {
            Object.entries(s.meta).filter(([_,v])=>v).sort(SortUtil.ascSort).forEach(([k])=>out.push(k.toTitleCase()));
        }
        if (s.duration.filter(d=>d.concentration).length) {
            out.push(PageFilterSpells._META_ADD_CONC);
            s._isConc = true;
        } else
            s._isConc = false;
        if (s.components && s.components.v)
            out.push(PageFilterSpells._META_ADD_V);
        if (s.components && s.components.s)
            out.push(PageFilterSpells._META_ADD_S);
        if (s.components && s.components.m)
            out.push(PageFilterSpells._META_ADD_M);
        if (s.components && s.components.r)
            out.push(PageFilterSpells._META_ADD_R);
        if (s.components && s.components.m && s.components.m.cost)
            out.push(PageFilterSpells._META_ADD_M_COST);
        if (s.components && s.components.m && s.components.m.consume) {
            if (s.components.m.consume === "optional")
                out.push(PageFilterSpells._META_ADD_M_CONSUMED_OPTIONAL);
            else
                out.push(PageFilterSpells._META_ADD_M_CONSUMED);
        }
        if (s.miscTags)
            out.push(...s.miscTags);
        if ((!s.miscTags || (s.miscTags && !s.miscTags.includes("PRM"))) && s.duration.filter(it=>it.type === "permanent").length)
            out.push("PRM");
        if ((!s.miscTags || (s.miscTags && !s.miscTags.includes("SCL"))) && s.entriesHigherLevel)
            out.push("SCL");
        if (s.srd)
            out.push("SRD");
        if (s.basicRules)
            out.push("Basic Rules");
        if (s.hasFluff || s.fluff?.entries)
            out.push("Has Info");
        if (s.hasFluffImages || s.fluff?.images)
            out.push("Has Images");
        return out;
    }

    static getFilterDuration(spell) {
        const fDur = spell.duration[0] || {
            type: "special"
        };
        switch (fDur.type) {
        case "instant":
            return "Instant";
        case "timed":
            {
                if (!fDur.duration)
                    return "Special";
                switch (fDur.duration.type) {
                case "turn":
                case "round":
                    return "1 Round";

                case "minute":
                    {
                        const amt = fDur.duration.amount || 0;
                        if (amt <= 1)
                            return "1 Minute";
                        if (amt <= 10)
                            return "10 Minutes";
                        if (amt <= 60)
                            return "1 Hour";
                        if (amt <= 8 * 60)
                            return "8 Hours";
                        return "24+ Hours";
                    }

                case "hour":
                    {
                        const amt = fDur.duration.amount || 0;
                        if (amt <= 1)
                            return "1 Hour";
                        if (amt <= 8)
                            return "8 Hours";
                        return "24+ Hours";
                    }

                case "week":
                case "day":
                case "year":
                    return "24+ Hours";
                default:
                    return "Special";
                }
            }
        case "permanent":
            return "Permanent";
        case "special":
        default:
            return "Special";
        }
    }

    static getNormalisedTime(time) {
        const firstTime = time[0];
        let multiplier = 1;
        let offset = 0;
        switch (firstTime.unit) {
        case Parser.SP_TM_B_ACTION:
            offset = 1;
            break;
        case Parser.SP_TM_REACTION:
            offset = 2;
            break;
        case Parser.SP_TM_ROUND:
            multiplier = 6;
            break;
        case Parser.SP_TM_MINS:
            multiplier = 60;
            break;
        case Parser.SP_TM_HRS:
            multiplier = 3600;
            break;
        }
        if (time.length > 1)
            offset += 0.5;
        return (multiplier * firstTime.number) + offset;
    }

    static getNormalisedRange(range) {
        const state = {
            multiplier: 1,
            distance: 0,
            offset: 0,
        };

        switch (range.type) {
        case Parser.RNG_SPECIAL:
            return 1000000000;
        case Parser.RNG_POINT:
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_LINE:
            state.offset = 1;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_CONE:
            state.offset = 2;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_RADIUS:
            state.offset = 3;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_HEMISPHERE:
            state.offset = 4;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_SPHERE:
            state.offset = 5;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_CYLINDER:
            state.offset = 6;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        case Parser.RNG_CUBE:
            state.offset = 7;
            this._getNormalisedRange_getAdjustedForDistance({
                range,
                state
            });
            break;
        }

        return (state.multiplier * state.distance) + state.offset;
    }

    static _getNormalisedRange_getAdjustedForDistance({range, state}) {
        const dist = range.distance;
        switch (dist.type) {
        case Parser.UNT_FEET:
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT;
            state.distance = dist.amount;
            break;
        case Parser.UNT_YARDS:
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT * PageFilterSpells.FEET_PER_YARD;
            state.distance = dist.amount;
            break;
        case Parser.UNT_MILES:
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT * PageFilterSpells.FEET_PER_MILE;
            state.distance = dist.amount;
            break;
        case Parser.RNG_SELF:
            state.distance = 0;
            break;
        case Parser.RNG_TOUCH:
            state.distance = 1;
            break;
        case Parser.RNG_SIGHT:
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT * PageFilterSpells.FEET_PER_MILE;
            state.distance = 12;
            break;
        case Parser.RNG_UNLIMITED_SAME_PLANE:
            state.distance = 900000000;
            break;
        case Parser.RNG_UNLIMITED:
            state.distance = 900000001;
            break;
        default:
            {
                this._getNormalisedRange_getAdjustedForDistance_prereleaseBrew({
                    range,
                    state,
                    brewUtil: PrereleaseUtil
                }) || this._getNormalisedRange_getAdjustedForDistance_prereleaseBrew({
                    range,
                    state,
                    brewUtil: BrewUtil2
                });
            }
        }
    }

    static _getNormalisedRange_getAdjustedForDistance_prereleaseBrew({range, state, brewUtil}) {
        const dist = range.distance;
        const fromBrew = brewUtil.getMetaLookup("spellDistanceUnits")?.[dist.type];
        if (!fromBrew)
            return false;

        const ftPerUnit = fromBrew.feetPerUnit;
        if (ftPerUnit != null) {
            state.multiplier = PageFilterSpells.INCHES_PER_FOOT * ftPerUnit;
            state.distance = dist.amount;
        } else {
            state.distance = 910000000;
        }

        return true;
    }

    static getRangeType(range) {
        switch (range.type) {
        case Parser.RNG_SPECIAL:
            return PageFilterSpells.F_RNG_SPECIAL;
        case Parser.RNG_POINT:
            switch (range.distance.type) {
            case Parser.RNG_SELF:
                return PageFilterSpells.F_RNG_SELF;
            case Parser.RNG_TOUCH:
                return PageFilterSpells.F_RNG_TOUCH;
            default:
                return PageFilterSpells.F_RNG_POINT;
            }
        case Parser.RNG_LINE:
        case Parser.RNG_CONE:
        case Parser.RNG_RADIUS:
        case Parser.RNG_HEMISPHERE:
        case Parser.RNG_SPHERE:
        case Parser.RNG_CYLINDER:
        case Parser.RNG_CUBE:
            return PageFilterSpells.F_RNG_SELF_AREA;
        }
    }

    static getTblTimeStr(time) {
        return (time.number === 1 && Parser.SP_TIME_SINGLETONS.includes(time.unit)) ? `${time.unit.uppercaseFirst()}` : `${time.number ? `${time.number} ` : ""}${Parser.spTimeUnitToShort(time.unit).uppercaseFirst()}`;
    }

    static getTblLevelStr(spell) {
        return `${Parser.spLevelToFull(spell.level)}${spell.meta && spell.meta.ritual ? " (rit.)" : ""}${spell.meta && spell.meta.technomagic ? " (tec.)" : ""}`;
    }

    static getRaceFilterItem(r) {
        const addSuffix = (r.source === Parser.SRC_DMG || SourceUtil.isNonstandardSource(r.source || Parser.SRC_PHB) || (typeof PrereleaseUtil !== "undefined" && PrereleaseUtil.hasSourceJson(r.source || Parser.SRC_PHB)) || (typeof BrewUtil2 !== "undefined" && BrewUtil2.hasSourceJson(r.source || Parser.SRC_PHB))) && !r.name.includes(Parser.sourceJsonToAbv(r.source));
        const name = `${r.name}${addSuffix ? ` (${Parser.sourceJsonToAbv(r.source)})` : ""}`;
        const opts = {
            item: name,
            userData: {
                group: SourceUtil.getFilterGroup(r.source || Parser.SRC_PHB),
            },
        };
        if (r.baseName)
            opts.nest = r.baseName;
        else
            opts.nest = "(No Subraces)";
        return new FilterItem(opts);
    }

    constructor() {
        super();

        this._classFilter = new Filter({
            header: "Class",
            groupFn: it=>it.userData.group,
        });
        this._subclassFilter = new Filter({
            header: "Subclass",
            nests: {},
            groupFn: it=>it.userData.group,
        });
        this._levelFilter = new Filter({
            header: "Level",
            items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ],
            displayFn: (lvl)=>Parser.spLevelToFullLevelText(lvl, {
                isPluralCantrips: false
            }),
        });
        this._variantClassFilter = new VariantClassFilter();
        this._classAndSubclassFilter = new MultiFilterClasses({
            classFilter: this._classFilter,
            subclassFilter: this._subclassFilter,
            variantClassFilter: this._variantClassFilter,
        });
        this._raceFilter = new Filter({
            header: "Race",
            nests: {},
            groupFn: it=>it.userData.group,
        });
        this._backgroundFilter = new SearchableFilter({
            header: "Background"
        });
        this._featFilter = new SearchableFilter({
            header: "Feat"
        });
        this._optionalfeaturesFilter = new SearchableFilter({
            header: "Other Option/Feature"
        });
        this._metaFilter = new Filter({
            header: "Components & Miscellaneous",
            items: [...PageFilterSpells._META_FILTER_BASE_ITEMS, "Ritual", "SRD", "Basic Rules", "Has Images", "Has Token"],
            itemSortFn: PageFilterSpells.sortMetaFilter,
            isMiscFilter: true,
            displayFn: it=>Parser.spMiscTagToFull(it),
        });
        this._groupFilter = new Filter({
            header: "Group"
        });
        this._schoolFilter = new Filter({
            header: "School",
            items: [...Parser.SKL_ABVS],
            displayFn: Parser.spSchoolAbvToFull,
            itemSortFn: (a,b)=>SortUtil.ascSortLower(Parser.spSchoolAbvToFull(a.item), Parser.spSchoolAbvToFull(b.item)),
        });
        this._subSchoolFilter = new Filter({
            header: "Subschool",
            items: [],
            displayFn: it=>Parser.spSchoolAbvToFull(it).toTitleCase(),
            itemSortFn: (a,b)=>SortUtil.ascSortLower(Parser.spSchoolAbvToFull(a.item), Parser.spSchoolAbvToFull(b.item)),
        });
        this._damageFilter = new Filter({
            header: "Damage Type",
            items: MiscUtil.copy(Parser.DMG_TYPES),
            displayFn: StrUtil.uppercaseFirst,
        });
        this._conditionFilter = new Filter({
            header: "Conditions Inflicted",
            items: [...Parser.CONDITIONS],
            displayFn: uid=>uid.split("|")[0].toTitleCase(),
        });
        this._spellAttackFilter = new Filter({
            header: "Spell Attack",
            items: ["M", "R", "O"],
            displayFn: Parser.spAttackTypeToFull,
            itemSortFn: null,
        });
        this._saveFilter = new Filter({
            header: "Saving Throw",
            items: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
            displayFn: PageFilterSpells.getFilterAbilitySave,
            itemSortFn: null,
        });
        this._checkFilter = new Filter({
            header: "Ability Check",
            items: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"],
            displayFn: PageFilterSpells.getFilterAbilityCheck,
            itemSortFn: null,
        });
        this._timeFilter = new Filter({
            header: "Cast Time",
            items: [Parser.SP_TM_ACTION, Parser.SP_TM_B_ACTION, Parser.SP_TM_REACTION, Parser.SP_TM_ROUND, Parser.SP_TM_MINS, Parser.SP_TM_HRS, ],
            displayFn: Parser.spTimeUnitToFull,
            itemSortFn: null,
        });
        this._durationFilter = new RangeFilter({
            header: "Duration",
            isLabelled: true,
            labelSortFn: null,
            labels: ["Instant", "1 Round", "1 Minute", "10 Minutes", "1 Hour", "8 Hours", "24+ Hours", "Permanent", "Special"],
        });
        this._rangeFilter = new Filter({
            header: "Range",
            items: [PageFilterSpells.F_RNG_SELF, PageFilterSpells.F_RNG_TOUCH, PageFilterSpells.F_RNG_POINT, PageFilterSpells.F_RNG_SELF_AREA, PageFilterSpells.F_RNG_SPECIAL, ],
            itemSortFn: null,
        });
        this._areaTypeFilter = new Filter({
            header: "Area Style",
            items: ["ST", "MT", "R", "N", "C", "Y", "H", "L", "S", "Q", "W"],
            displayFn: Parser.spAreaTypeToFull,
            itemSortFn: null,
        });
        this._affectsCreatureTypeFilter = new Filter({
            header: "Affects Creature Types",
            items: [...Parser.MON_TYPES],
            displayFn: StrUtil.toTitleCase,
        });
    }

    static mutateForFilters(s) {
        Renderer.spell.initBrewSources(s);

        s._normalisedTime = PageFilterSpells.getNormalisedTime(s.time);
        s._normalisedRange = PageFilterSpells.getNormalisedRange(s.range);

        s._fSources = SourceFilter.getCompleteFilterSources(s);
        s._fMeta = PageFilterSpells.getMetaFilterObj(s);
        s._fClasses = Renderer.spell.getCombinedClasses(s, "fromClassList").map(c=>{
            return this._getClassFilterItem({
                className: c.name,
                definedInSource: c.definedInSource,
                classSource: c.source,
                isVariantClass: false,
            });
        }
        );
        s._fSubclasses = Renderer.spell.getCombinedClasses(s, "fromSubclass").map(c=>{
            return this._getSubclassFilterItem({
                className: c.class.name,
                classSource: c.class.source,
                subclassName: c.subclass.name,
                subclassShortName: c.subclass.shortName,
                subclassSource: c.subclass.source,
                subSubclassName: c.subclass.subSubclass,
            });
        }
        );
        s._fVariantClasses = Renderer.spell.getCombinedClasses(s, "fromClassListVariant").map(c=>{
            return this._getClassFilterItem({
                className: c.name,
                definedInSource: c.definedInSource,
                classSource: c.source,
                isVariantClass: true,
            });
        }
        );
        s._fClassesAndVariantClasses = [...s._fClasses, ...s._fVariantClasses.map(it=>(it.userData.definedInSource && !SourceUtil.isNonstandardSource(it.userData.definedInSource)) ? new FilterItem({
            item: it.userData.equivalentClassName
        }) : null).filter(Boolean).filter(it=>!s._fClasses.some(itCls=>itCls.item === it.item)), ];
        s._fRaces = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "races",
            prop: "race"
        }).map(PageFilterSpells.getRaceFilterItem);
        s._fBackgrounds = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "backgrounds",
            prop: "background"
        }).map(it=>it.name);
        s._fFeats = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "feats",
            prop: "feat"
        }).map(it=>it.name);
        s._fOptionalfeatures = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "optionalfeatures",
            prop: "optionalfeature"
        }).map(it=>it.name);
        s._fGroups = Renderer.spell.getCombinedGeneric(s, {
            propSpell: "groups"
        }).map(it=>it.name);
        s._fTimeType = s.time.map(t=>t.unit);
        s._fDurationType = PageFilterSpells.getFilterDuration(s);
        s._fRangeType = PageFilterSpells.getRangeType(s.range);

        s._fAreaTags = [...(s.areaTags || [])];
        if (s.range.type === "line" && !s._fAreaTags.includes("L"))
            s._fAreaTags.push("L");

        s._fAffectsCreatureType = s.affectsCreatureType || [...Parser.MON_TYPES];
    }

    static unmutateForFilters(s) {
        Renderer.spell.uninitBrewSources(s);

        delete s._normalisedTime;
        delete s._normalisedRange;

        Object.keys(s).filter(it=>it.startsWith("_f")).forEach(it=>delete s[it]);
    }

    addToFilters(s, isExcluded) {
        if (isExcluded)
            return;

        if (s.level > 9)
            this._levelFilter.addItem(s.level);
        this._groupFilter.addItem(s._fGroups);
        this._schoolFilter.addItem(s.school);
        this._sourceFilter.addItem(s._fSources);
        this._metaFilter.addItem(s._fMeta);
        this._backgroundFilter.addItem(s._fBackgrounds);
        this._featFilter.addItem(s._fFeats);
        this._optionalfeaturesFilter.addItem(s._fOptionalfeatures);
        s._fClasses.forEach(c=>this._classFilter.addItem(c));
        s._fSubclasses.forEach(sc=>{
            this._subclassFilter.addNest(sc.nest, {
                isHidden: true
            });
            this._subclassFilter.addItem(sc);
        }
        );
        s._fRaces.forEach(r=>{
            if (r.nest)
                this._raceFilter.addNest(r.nest, {
                    isHidden: true
                });
            this._raceFilter.addItem(r);
        }
        );
        s._fVariantClasses.forEach(c=>{
            this._variantClassFilter.addNest(c.nest, {
                isHidden: true
            });
            this._variantClassFilter.addItem(c);
        }
        );
        this._subSchoolFilter.addItem(s.subschools);
        this._conditionFilter.addItem(s.conditionInflict);
        this._affectsCreatureTypeFilter.addItem(s.affectsCreatureType);
    }

    async _pPopulateBoxOptions(opts) {
        await SourceUtil.pInitSubclassReprintLookup();

        opts.filters = [this._sourceFilter, this._levelFilter, this._classAndSubclassFilter, this._raceFilter, this._backgroundFilter, this._featFilter, this._optionalfeaturesFilter, this._metaFilter, this._groupFilter, this._schoolFilter, this._subSchoolFilter, this._damageFilter, this._conditionFilter, this._spellAttackFilter, this._saveFilter, this._checkFilter, this._timeFilter, this._durationFilter, this._rangeFilter, this._areaTypeFilter, this._affectsCreatureTypeFilter, ];
    }

    toDisplay(values, s) {
        return this._filterBox.toDisplay(values, s._fSources, s.level, [this._classAndSubclassFilter.isVariantSplit ? s._fClasses : s._fClassesAndVariantClasses, s._fSubclasses, this._classAndSubclassFilter.isVariantSplit ? s._fVariantClasses : null, ], s._fRaces, s._fBackgrounds, s._fFeats, s._fOptionalfeatures, s._fMeta, s._fGroups, s.school, s.subschools, s.damageInflict, s.conditionInflict, s.spellAttack, s.savingThrow, s.abilityCheck, s._fTimeType, s._fDurationType, s._fRangeType, s._fAreaTags, s._fAffectsCreatureType, );
    }
};

class VariantClassFilter extends Filter {
    constructor(opts) {
        super({
            header: "Optional/Variant Class",
            nests: {},
            groupFn: it=>it.userData.group,
            ...opts,
        });

        this._parent = null;
    }

    set parent(multiFilterClasses) {
        this._parent = multiFilterClasses;
    }

    handleVariantSplit(isVariantSplit) {
        this.__$wrpFilter.toggleVe(isVariantSplit);
    }
}

class MultiFilterClasses extends MultiFilter {
    constructor(opts) {
        super({
            header: "Classes",
            mode: "or",
            filters: [opts.classFilter, opts.subclassFilter, opts.variantClassFilter],
            ...opts
        });

        this._classFilter = opts.classFilter;
        this._subclassFilter = opts.subclassFilter;
        this._variantClassFilter = opts.variantClassFilter;

        this._variantClassFilter.parent = this;
    }

    get classFilter_() {
        return this._classFilter;
    }
    get isVariantSplit() {
        return this._meta.isVariantSplit;
    }

    $render(opts) {
        const $out = super.$render(opts);

        const hkVariantSplit = ()=>this._variantClassFilter.handleVariantSplit(this._meta.isVariantSplit);
        this._addHook("meta", "isVariantSplit", hkVariantSplit);
        hkVariantSplit();

        return $out;
    }

    _getHeaderControls_addExtraStateBtns(opts, wrpStateBtnsOuter) {
        const btnToggleVariantSplit = ComponentUiUtil.getBtnBool(this, "isVariantSplit", {
            ele: e_({
                tag: "button",
                clazz: "btn btn-default btn-xs",
                text: "Include Variants"
            }),
            isInverted: true,
            stateName: "meta",
            stateProp: "_meta",
            title: `If "Optional/Variant Class" spell lists should be treated as part of the "Class" filter.`,
        }, );

        e_({
            tag: "div",
            clazz: `btn-group w-100 ve-flex-v-center mobile__m-1 mobile__mb-2`,
            children: [btnToggleVariantSplit, ],
        }).prependTo(wrpStateBtnsOuter);
    }

    getDefaultMeta() {
        return {
            ...MultiFilterClasses._DEFAULT_META,
            ...super.getDefaultMeta()
        };
    }
}
MultiFilterClasses._DEFAULT_META = {
    isVariantSplit: false,
};


export {PageFilterSpells}