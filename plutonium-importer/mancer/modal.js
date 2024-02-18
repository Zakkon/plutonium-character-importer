import { PageFilterSpells } from "./pagefilter.js";

class ModalFilter {
    static _$getFilterColumnHeaders(btnMeta) {
        return btnMeta.map((it,i)=>$(`<button class="col-${it.width} ${i === 0 ? "pl-0" : i === btnMeta.length ? "pr-0" : ""} ${it.disabled ? "" : "sort"} btn btn-default btn-xs" ${it.disabled ? "" : `data-sort="${it.sort}"`} ${it.title ? `title="${it.title}"` : ""} ${it.disabled ? "disabled" : ""}>${it.text}</button>`));
    }

    constructor(opts) {
        this._modalTitle = opts.modalTitle;
        this._fnSort = opts.fnSort;
        this._pageFilter = opts.pageFilter;
        this._namespace = opts.namespace;
        this._allData = opts.allData || null;
        this._isRadio = !!opts.isRadio;

        this._list = null;
        this._filterCache = null;
    }

    get pageFilter() {
        return this._pageFilter;
    }

    get allData() {
        return this._allData;
    }

    _$getWrpList() {
        return $(`<div class="list ui-list__wrp overflow-x-hidden overflow-y-auto h-100 min-h-0"></div>`);
    }

    _$getColumnHeaderPreviewAll(opts) {
        return $(`<button class="btn btn-default btn-xs ${opts.isBuildUi ? "col-1" : "col-0-5"}">${ListUiUtil.HTML_GLYPHICON_EXPAND}</button>`);
    }

    async pPopulateWrapper($wrp, opts) {
        opts = opts || {};

        await this._pInit();

        const $ovlLoading = $(`<div class="w-100 h-100 ve-flex-vh-center"><i class="dnd-font ve-muted">Loading...</i></div>`).appendTo($wrp);

        const $iptSearch = (opts.$iptSearch || $(`<input class="form-control lst__search lst__search--no-border-h h-100" type="search" placeholder="Search...">`)).disableSpellcheck();
        const $btnReset = opts.$btnReset || $(`<button class="btn btn-default">Reset</button>`);
        const $dispNumVisible = $(`<div class="lst__wrp-search-visible no-events ve-flex-vh-center"></div>`);

        const $wrpIptSearch = $$`<div class="w-100 relative">
			${$iptSearch}
			<div class="lst__wrp-search-glass no-events ve-flex-vh-center"><span class="glyphicon glyphicon-search"></span></div>
			${$dispNumVisible}
		</div>`;

        const $wrpFormTop = $$`<div class="ve-flex input-group btn-group w-100 lst__form-top">${$wrpIptSearch}${$btnReset}</div>`;

        const $wrpFormBottom = opts.$wrpMiniPills || $(`<div class="w-100"></div>`);

        const $wrpFormHeaders = $(`<div class="input-group input-group--bottom ve-flex no-shrink"></div>`);
        const $cbSelAll = opts.isBuildUi || this._isRadio ? null : $(`<input type="checkbox">`);
        const $btnSendAllToRight = opts.isBuildUi ? $(`<button class="btn btn-xxs btn-default col-1" title="Add All"><span class="glyphicon glyphicon-arrow-right"></span></button>`) : null;

        if (!opts.isBuildUi) {
            if (this._isRadio)
                $wrpFormHeaders.append(`<label class="btn btn-default btn-xs col-0-5 ve-flex-vh-center" disabled></label>`);
            else
                $$`<label class="btn btn-default btn-xs col-0-5 ve-flex-vh-center">${$cbSelAll}</label>`.appendTo($wrpFormHeaders);
        }

        const $btnTogglePreviewAll = this._$getColumnHeaderPreviewAll(opts).appendTo($wrpFormHeaders);

        this._$getColumnHeaders().forEach($ele=>$wrpFormHeaders.append($ele));
        if (opts.isBuildUi)
            $btnSendAllToRight.appendTo($wrpFormHeaders);

        const $wrpForm = $$`<div class="ve-flex-col w-100 mb-1">${$wrpFormTop}${$wrpFormBottom}${$wrpFormHeaders}</div>`;
        const $wrpList = this._$getWrpList();

        const $btnConfirm = opts.isBuildUi ? null : $(`<button class="btn btn-default">Confirm</button>`);

        this._list = new List({
            $iptSearch,
            $wrpList,
            fnSort: this._fnSort,
        });
        const listSelectClickHandler = new ListSelectClickHandler({
            list: this._list
        });

        if (!opts.isBuildUi && !this._isRadio)
            listSelectClickHandler.bindSelectAllCheckbox($cbSelAll);
        ListUiUtil.bindPreviewAllButton($btnTogglePreviewAll, this._list);
        SortUtil.initBtnSortHandlers($wrpFormHeaders, this._list);
        this._list.on("updated", ()=>$dispNumVisible.html(`${this._list.visibleItems.length}/${this._list.items.length}`));

        this._allData = this._allData || await this._pLoadAllData();

        await this._pageFilter.pInitFilterBox({
            $wrpFormTop,
            $btnReset,
            $wrpMiniPills: $wrpFormBottom,
            namespace: this._namespace,
            $btnOpen: opts.$btnOpen,
            $btnToggleSummaryHidden: opts.$btnToggleSummaryHidden,
        });

        this._allData.forEach((it,i)=>{
            this._pageFilter.mutateAndAddToFilters(it);
            const filterListItem = this._getListItem(this._pageFilter, it, i);
            this._list.addItem(filterListItem);
            if (!opts.isBuildUi) {
                if (this._isRadio)
                    filterListItem.ele.addEventListener("click", evt=>listSelectClickHandler.handleSelectClickRadio(filterListItem, evt));
                else
                    filterListItem.ele.addEventListener("click", evt=>listSelectClickHandler.handleSelectClick(filterListItem, evt));
            }
        }
        );

        this._list.init();
        this._list.update();

        const handleFilterChange = ()=>{
            const f = this._pageFilter.filterBox.getValues();
            this._list.filter(li=>this._isListItemMatchingFilter(f, li));
        }
        ;

        this._pageFilter.trimState();

        this._pageFilter.filterBox.on(FilterBox.EVNT_VALCHANGE, handleFilterChange);
        this._pageFilter.filterBox.render();
        handleFilterChange();

        $ovlLoading.remove();

        const $wrpInner = $$`<div class="ve-flex-col h-100">
			${$wrpForm}
			${$wrpList}
			${opts.isBuildUi ? null : $$`<hr class="hr-1"><div class="ve-flex-vh-center">${$btnConfirm}</div>`}
		</div>`.appendTo($wrp.empty());

        return {
            $wrpIptSearch,
            $iptSearch,
            $wrpInner,
            $btnConfirm,
            pageFilter: this._pageFilter,
            list: this._list,
            $cbSelAll,
            $btnSendAllToRight,
        };
    }

    _isListItemMatchingFilter(f, li) {
        return this._isEntityItemMatchingFilter(f, this._allData[li.ix]);
    }
    _isEntityItemMatchingFilter(f, it) {
        return this._pageFilter.toDisplay(f, it);
    }

    async pPopulateHiddenWrapper() {
        await this._pInit();

        this._allData = this._allData || await this._pLoadAllData();

        await this._pageFilter.pInitFilterBox({
            namespace: this._namespace
        });

        this._allData.forEach(it=>{
            this._pageFilter.mutateAndAddToFilters(it);
        }
        );

        this._pageFilter.trimState();
    }

    handleHiddenOpenButtonClick() {
        this._pageFilter.filterBox.show();
    }

    handleHiddenResetButtonClick(evt) {
        this._pageFilter.filterBox.reset(evt.shiftKey);
    }

    _getStateFromFilterExpression(filterExpression) {
        const filterSubhashMeta = Renderer.getFilterSubhashes(Renderer.splitTagByPipe(filterExpression), this._namespace);
        const subhashes = filterSubhashMeta.subhashes.map(it=>`${it.key}${HASH_SUB_KV_SEP}${it.value}`);
        const unpackedSubhashes = this.pageFilter.filterBox.unpackSubHashes(subhashes, {
            force: true
        });
        return this.pageFilter.filterBox.getNextStateFromSubHashes({
            unpackedSubhashes
        });
    }

    getItemsMatchingFilterExpression({filterExpression}) {
        const nxtStateOuter = this._getStateFromFilterExpression(filterExpression);

        const f = this._pageFilter.filterBox.getValues({
            nxtStateOuter
        });
        const filteredItems = this._filterCache.list.getFilteredItems({
            items: this._filterCache.list.items,
            fnFilter: li=>this._isListItemMatchingFilter(f, li),
        });

        return this._filterCache.list.getSortedItems({
            items: filteredItems
        });
    }

    getEntitiesMatchingFilterExpression({filterExpression}) {
        const nxtStateOuter = this._getStateFromFilterExpression(filterExpression);

        const f = this._pageFilter.filterBox.getValues({
            nxtStateOuter
        });
        return this._allData.filter(this._isEntityItemMatchingFilter.bind(this, f));
    }

    getRenderedFilterExpression({filterExpression}) {
        const nxtStateOuter = this._getStateFromFilterExpression(filterExpression);
        return this.pageFilter.filterBox.getDisplayState({
            nxtStateOuter
        });
    }

    async pGetUserSelection({filterExpression=null}={}) {
        return new Promise(async resolve=>{
            const {$modalInner, doClose} = await this._pGetShowModal(resolve);

            await this.pPreloadHidden($modalInner);

            this._doApplyFilterExpression(filterExpression);

            this._filterCache.$btnConfirm.off("click").click(async()=>{
                const checked = this._filterCache.list.visibleItems.filter(it=>it.data.cbSel.checked);
                resolve(checked);

                doClose(true);

                if (this._filterCache.$cbSelAll)
                    this._filterCache.$cbSelAll.prop("checked", false);
                this._filterCache.list.items.forEach(it=>{
                    if (it.data.cbSel)
                        it.data.cbSel.checked = false;
                    it.ele.classList.remove("list-multi-selected");
                }
                );
            }
            );

            await UiUtil.pDoForceFocus(this._filterCache.$iptSearch[0]);
        }
        );
    }

    async _pGetShowModal(resolve) {
        const {$modalInner, doClose} = await UiUtil.pGetShowModal({
            isHeight100: true,
            isWidth100: true,
            title: `Filter/Search for ${this._modalTitle}`,
            cbClose: (isDataEntered)=>{
                this._filterCache.$wrpModalInner.detach();
                if (!isDataEntered)
                    resolve([]);
            }
            ,
            isUncappedHeight: true,
        });

        return {
            $modalInner,
            doClose
        };
    }

    _doApplyFilterExpression(filterExpression) {
        if (!filterExpression)
            return;

        const filterSubhashMeta = Renderer.getFilterSubhashes(Renderer.splitTagByPipe(filterExpression), this._namespace);
        const subhashes = filterSubhashMeta.subhashes.map(it=>`${it.key}${HASH_SUB_KV_SEP}${it.value}`);
        this.pageFilter.filterBox.setFromSubHashes(subhashes, {
            force: true,
            $iptSearch: this._filterCache.$iptSearch
        });
    }

    _getNameStyle() {
        return `bold`;
    }

    async pPreloadHidden($modalInner) {
        $modalInner = $modalInner || $(`<div></div>`);

        if (this._filterCache) {
            this._filterCache.$wrpModalInner.appendTo($modalInner);
        } else {
            const meta = await this.pPopulateWrapper($modalInner);
            const {$iptSearch, $btnConfirm, pageFilter, list, $cbSelAll} = meta;
            const $wrpModalInner = meta.$wrpInner;

            this._filterCache = {
                $iptSearch,
                $wrpModalInner,
                $btnConfirm,
                pageFilter,
                list,
                $cbSelAll
            };
        }
    }

    _$getColumnHeaders() {
        throw new Error(`Unimplemented!`);
    }
    async _pInit() {}
    async _pLoadAllData() {
        throw new Error(`Unimplemented!`);
    }
    async _getListItem() {
        throw new Error(`Unimplemented!`);
    }
};

class ModalFilterSpells extends ModalFilter {
    constructor(opts) {
        opts = opts || {};
        super({
            ...opts,
            modalTitle: `Spell${opts.isRadio ? "" : "s"}`,
            pageFilter: new PageFilterSpells(),
            fnSort: PageFilterSpells.sortSpells,
        });
    }

    _$getColumnHeaders() {
        const btnMeta = [{
            sort: "name",
            text: "Name",
            width: "3"
        }, {
            sort: "level",
            text: "Level",
            width: "1-5"
        }, {
            sort: "time",
            text: "Time",
            width: "2"
        }, {
            sort: "school",
            text: "School",
            width: "1"
        }, {
            sort: "concentration",
            text: "C.",
            title: "Concentration",
            width: "0-5"
        }, {
            sort: "range",
            text: "Range",
            width: "2"
        }, {
            sort: "source",
            text: "Source",
            width: "1"
        }, ];
        return ModalFilter._$getFilterColumnHeaders(btnMeta);
    }

    async _pInit() {
        if (typeof PrereleaseUtil !== "undefined")
            Renderer.spell.populatePrereleaseLookup(await PrereleaseUtil.pGetBrewProcessed());
        if (typeof BrewUtil2 !== "undefined")
            Renderer.spell.populateBrewLookup(await BrewUtil2.pGetBrewProcessed());
    }

    async _pLoadAllData() {
        return [...(await DataUtil.spell.pLoadAll()), ...((await PrereleaseUtil.pGetBrewProcessed()).spell || []), ...((await BrewUtil2.pGetBrewProcessed()).spell || []), ];
    }

    _getListItem(pageFilter, spell, spI) {
        const eleRow = document.createElement("div");
        eleRow.className = "px-0 w-100 ve-flex-col no-shrink";

        const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS](spell);
        const source = Parser.sourceJsonToAbv(spell.source);
        const levelText = PageFilterSpells.getTblLevelStr(spell);
        const time = PageFilterSpells.getTblTimeStr(spell.time[0]);
        const school = Parser.spSchoolAndSubschoolsAbvsShort(spell.school, spell.subschools);
        const concentration = spell._isConc ? "×" : "";
        const range = Parser.spRangeToFull(spell.range);

        eleRow.innerHTML = `<div class="w-100 ve-flex-vh-center lst--border veapp__list-row no-select lst__wrp-cells">
			<div class="col-0-5 pl-0 ve-flex-vh-center">${this._isRadio ? `<input type="radio" name="radio" class="no-events">` : `<input type="checkbox" class="no-events">`}</div>

			<div class="col-0-5 px-1 ve-flex-vh-center">
				<div class="ui-list__btn-inline px-2" title="Toggle Preview (SHIFT to Toggle Info Preview)">[+]</div>
			</div>

			<div class="col-3 ${spell._versionBase_isVersion ? "italic" : ""} ${this._getNameStyle()}">${spell._versionBase_isVersion ? `<span class="px-3"></span>` : ""}${spell.name}</div>
			<div class="col-1-5 ve-text-center">${levelText}</div>
			<div class="col-2 ve-text-center">${time}</div>
			<div class="col-1 sp__school-${spell.school} ve-text-center" title="${Parser.spSchoolAndSubschoolsAbvsToFull(spell.school, spell.subschools)}" ${Parser.spSchoolAbvToStyle(spell.school)}>${school}</div>
			<div class="col-0-5 ve-text-center" title="Concentration">${concentration}</div>
			<div class="col-2 text-right">${range}</div>
			<div class="col-1 pr-0 ve-text-center ${Parser.sourceJsonToColor(spell.source)}" title="${Parser.sourceJsonToFull(spell.source)}" ${Parser.sourceJsonToStyle(spell.source)}>${source}</div>
		</div>`;

        const btnShowHidePreview = eleRow.firstElementChild.children[1].firstElementChild;

        const listItem = new ListItem(spI,eleRow,spell.name,{
            hash,
            source,
            sourceJson: spell.source,
            level: spell.level,
            time,
            school: Parser.spSchoolAbvToFull(spell.school),
            classes: Parser.spClassesToFull(spell, {
                isTextOnly: true
            }),
            concentration,
            normalisedTime: spell._normalisedTime,
            normalisedRange: spell._normalisedRange,
        },{
            cbSel: eleRow.firstElementChild.firstElementChild.firstElementChild,
            btnShowHidePreview,
        },);

        ListUiUtil.bindPreviewButton(UrlUtil.PG_SPELLS, this._allData, listItem, btnShowHidePreview);

        return listItem;
    }
}

function MixinModalFilterFvtt(Cls) {
    class MixedModalFilterFvtt extends Cls {
        constructor(...args) {
            super(...args);

            this._prevApp = null;
        }

        _getNameStyle() {
            return "";
        }

        _getShowModal(resolve) {
            if (this._prevApp)
                this._prevApp.close();

            const self = this;

            const app = new class TempApplication extends Application {
                constructor() {
                    super({
                        title: `Filter/Search for ${self._modalTitle}`,
                        template: `${SharedConsts.MODULE_LOCATION}/template/_Generic.hbs`,
                        width: Util.getMaxWindowWidth(900),
                        height: Util.getMaxWindowHeight(),
                        resizable: true,
                    });

                    this._$wrpHtmlInner = $(`<div class="ve-flex-col w-100 h-100"></div>`);
                }

                get $modalInner() {
                    return this._$wrpHtmlInner;
                }

                async close(...args) {
                    self._filterCache.$wrpModalInner.detach();
                    await super.close(...args);
                    resolve([]);
                }

                activateListeners($html) {
                    this._$wrpHtmlInner.appendTo($html);
                }
            }
            ();

            app.render(true);
            this._prevApp = app;

            return {
                $modalInner: app.$modalInner,
                doClose: app.close.bind(app)
            };
        }

        getDataFromSelected(selected) {
            return this._allData[selected.ix];
        }
    }
    return MixedModalFilterFvtt;
}

class ModalFilterSpellsFvtt extends MixinModalFilterFvtt(ModalFilterSpells) {
}

export {ModalFilterSpellsFvtt}