import { MixinFolderPathBuilder, MixinHidableApplication } from "./applicationextensions.js";
import { ConfigConsts, SharedConsts } from "../veTools/config.js";
import { Util } from "../veTools/utils.js";

class ImportList extends MixinHidableApplication(MixinFolderPathBuilder(Application)) {
    static async api_pImportEntry(entry, {isTemp=false, packId=null}={}) {
        if (game.user.role < Config.get("import", "minimumRole"))
            throw new Error(`You do not have sufficient permissions!`);

        const pack = packId ? game.packs.get(packId) : null;
        if (!pack && packId)
            throw new Error(`Could not find pack "${pack}"`);

        if (isTemp && packId)
            throw new Error(`Options "isTemp" and "packId" are mutually exclusive!`);

        entry = await entry;
        if (entry == null)
            throw new Error(`Entry cannot be null/undefined!`);

        const imp = new this();
        await imp.pInit();
        imp.pack = pack;
        return imp.pImportEntry(entry, {
            isTemp
        });
    }

    static init() {
        UtilLibWrapper.addPatch("Actor.fromDropData", this._lw_Actor_fromDropData, UtilLibWrapper.LIBWRAPPER_MODE_MIXED, );
        UtilLibWrapper.addPatch("Item.fromDropData", this._lw_Item_fromDropData, UtilLibWrapper.LIBWRAPPER_MODE_MIXED, );
        UtilLibWrapper.addPatch("JournalEntry.fromDropData", this._lw_JournalEntry_fromDropData, UtilLibWrapper.LIBWRAPPER_MODE_MIXED, );
        UtilLibWrapper.addPatch("RollTable.fromDropData", this._lw_RollTable_fromDropData, UtilLibWrapper.LIBWRAPPER_MODE_MIXED, );
    }

    static async _lw_Actor_fromDropData(fn, ...args) {
        const out = await ImportList._pHandleDropGetImportedDoc(args[0]);
        if (out)
            return out;
        return fn(...args);
    }

    static async _lw_Item_fromDropData(fn, ...args) {
        const out = await ImportList._pHandleDropGetImportedDoc(args[0], {
            isTemp: true
        });
        if (out)
            return out;
        return fn(...args);
    }

    static async _lw_JournalEntry_fromDropData(fn, ...args) {
        const out = await ImportList._pHandleDropGetImportedDoc(args[0]);
        if (out)
            return out;
        return fn(...args);
    }

    static async _lw_RollTable_fromDropData(fn, ...args) {
        const out = await ImportList._pHandleDropGetImportedDoc(args[0]);
        if (out)
            return out;
        return fn(...args);
    }

    static preInit() {
        UtilLibWrapper.addPatch("ActorDirectory.prototype._onDrop", this._lw_ActorDirectory_prototype__onDrop, UtilLibWrapper.LIBWRAPPER_MODE_MIXED, );

        UtilLibWrapper.addPatch("Compendium.prototype._onDrop", this._lw_Compendium_prototype__onDrop, UtilLibWrapper.LIBWRAPPER_MODE_MIXED, );
    }

    static async _lw_ActorDirectory_prototype__onDrop(fn, ...args) {
        if (await ImportList._pHandleSidebarDrop(this, ...args))
            return;
        return fn(...args);
    }

    static async _lw_Compendium_prototype__onDrop(fn, ...args) {
        const data = UtilEvents.getDropJson(args[0]);
        const out = await ImportList._pHandleDropGetImportedDoc(data, {
            pack: this.collection
        });
        if (out)
            return out;
        return fn(...args);
    }

    static get ID() {
        throw new Error("Unimplemented!");
    }
    static get DISPLAY_NAME_TYPE_SINGLE() {
        throw new Error("Unimplemented!");
    }
    static get DISPLAY_NAME_TYPE_PLURAL() {
        throw new Error("Unimplemented!");
    }
    static get PROPS() {
        return null;
    }

    static IMPLS = new Map();

    static registerImpl(Impl) {
        if (!Impl.ID || this.IMPLS.get(Impl.ID))
            throw new Error(`Duplicate or missing importer ID! Importer "${Impl.name}" ID was "${Impl.ID}".`);
        this.IMPLS.set(Impl.ID, Impl);
        ConfigConsts.registerImporter({
            id: Impl.ID,
            name: Impl.DISPLAY_NAME_TYPE_PLURAL
        });
        return this.IMPLS;
    }

    static get FOLDER_TYPE() {
        return "Item";
    }

    static _isImporterDropEvent({evt, data}) {
        if (!evt && !data)
            return false;
        if (!data)
            data = UtilEvents.getDropJson(evt);

        if (data.subType !== UtilEvents.EVT_DATA_SUBTYPE__HOVER && data.subType !== UtilEvents.EVT_DATA_SUBTYPE__IMPORT)
            return false;

        return data.page && data.source && data.hash;
    }

    static async patcher_pHandleActorDrop(evt) {
        const data = UtilEvents.getDropJson(evt);

        if (!ImportList._isImporterDropEvent({
            evt
        }))
            return;

        const doc = await ImportList._pHandleDropGetImportedDoc(data, {
            isTemp: true
        });
        if (!doc)
            return;

        ImportList._suppressCreateSheetItemHookTimeStart = Date.now();

        const evtNxt = new DragEvent("drop",{
            dataTransfer: new DataTransfer(),
        },);
        evtNxt.dataTransfer.setData("text/plain", JSON.stringify({
            type: doc.documentName,
            data: doc.toJSON(),
            uuid: `${doc.documentName}.${doc.id}`,
        }), );

        Object.defineProperty(evtNxt, "target", {
            writable: false,
            value: evt.target
        });

        return this._onDrop(evtNxt);
    }

    static async _pHandleSidebarDrop(sidebar, evt) {
        const data = UtilEvents.getDropJson(evt);

        if (!ImportList._isImporterDropEvent({
            evt
        }))
            return;

        await ImportList._pHandleDropGetImportedDoc(data, {
            requiresDocumentName: sidebar.constructor.documentName
        });

        return true;
    }

    static async _pHandleDropGetImportedDoc(data, {isTemp=false, requiresDocumentName=null, pack=null}={}) {
        if (ImportList._isImporterDropEvent({
            data
        }))
            return this._pHandleDropGetImportedDoc_importerDrop(...arguments);
        if (ImportList._isBadlyDroppedCustomUid({
            data
        }))
            return this._pHandleDropGetImportedDoc_badCustomUidDrop(...arguments);
        return null;
    }

    static async _pHandleDropGetImportedDoc_importerDrop(data, {isTemp=false, requiresDocumentName=null, pack=null}={}) {
        const entity = await DataLoader.pCacheAndGet(data.page, data.source, data.hash, {
            isCopy: true
        });

        const {ChooseImporter} = await Promise.resolve().then(function() {
            return ChooseImporter$1;
        });

        return this._pHandleDropGetImportedDoc_getFromEntity({
            ChooseImporter,
            entity,
            page: data.page,
            pack,
            requiresDocumentName,
            isTemp,
        });
    }

    static _isBadlyDroppedCustomUid({data}) {
        if (!data.uuid)
            return false;
        return UtilDragDrop.isCustomUuid(data.uuid);
    }

    static async _pHandleDropGetImportedDoc_badCustomUidDrop(data, {isTemp=false, requiresDocumentName=null, pack=null}={}) {
        const [_,tag,pipeParts] = /^@([a-z][a-zA-Z]+)\[([^\]]+)]$/.exec(data.uuid);

        const {ChooseImporter} = await Promise.resolve().then(function() {
            return ChooseImporter$1;
        });

        const importerMeta = ChooseImporter.getImporterClassMeta(tag);
        if (!importerMeta)
            return null;

        const {page, pageHover, source, hash, hashHover} = Renderer.utils.getTagMeta(`@${tag}`, pipeParts);

        const entity = await DataLoader.pCacheAndGet(pageHover || page, source, hashHover || hash, {
            isCopy: true
        });

        return this._pHandleDropGetImportedDoc_getFromEntity({
            ChooseImporter,
            entity,
            page: pageHover || page,
            pack,
            requiresDocumentName,
            isTemp,
        });
    }

    static async _pHandleDropGetImportedDoc_getFromEntity({ChooseImporter, entity, page, pack, requiresDocumentName, isTemp, }, ) {
        const importer = ChooseImporter.getImporter(entity?.__prop || page);
        if (pack)
            importer.pack = pack;
        await importer.pInit();

        if (requiresDocumentName != null && importer.constructor.FOLDER_TYPE !== requiresDocumentName)
            return null;

        const importSummary = await importer.pImportEntry(entity, {
            isTemp,
            defaultOwnership: UtilDataConverter.getTempDocumentDefaultOwnership({
                documentType: importer.constructor.FOLDER_TYPE
            }),
        }, );

        return (importSummary.imported || []).map(it=>it.document).filter(Boolean)[0];
    }

    static _initCreateSheetItemHook({prop, importerName, isForce, pFnGetEntity, pFnImport, fnGetSuccessMessage, fnGetFailedMessage, }, ) {
        Hooks.on("preCreateItem", (item,itemData,options,itemId)=>{
            if (item.parent?.documentName !== "Actor")
                return;

            const flags = itemData.flags?.[SharedConsts.MODULE_ID];
            if (!flags || flags?.propDroppable !== prop)
                return;
            if (flags.isStandardDragDrop || flags.isDirectImport)
                return;

            if (ImportList._suppressCreateSheetItemHookTimeStart != null && (Date.now() - ImportList._suppressCreateSheetItemHookTimeStart) < 10_000) {
                ImportList._suppressCreateSheetItemHookTimeStart = null;
                return;
            }
            ImportList._suppressCreateSheetItemHookTimeStart = null;

            const actor = item.parent;

            this._pGetUseImporterDragDrop({
                isForce
            }).then(async isUseImporter=>{
                if (isUseImporter == null)
                    return;

                let ent;
                try {
                    if (pFnGetEntity)
                        ent = await pFnGetEntity(flags);
                    else
                        ent = await DataLoader.pCacheAndGet(flags.propDroppable, flags.source, flags.hash);
                } catch (e) {
                    if (isUseImporter) {
                        ui.notifications.error(`Failed to import "${ent?.name ?? flags.hash}"! ${VeCt.STR_SEE_CONSOLE}`);
                        throw e;
                    }
                }

                if (isUseImporter && !ent) {
                    const msg = `Failed to import "${flags.hash}"!`;
                    ui.notifications.error(`${msg} ${VeCt.STR_SEE_CONSOLE}`);
                    throw new Error(`${msg} The original entity could not be found.`);
                }

                try {
                    if (isUseImporter) {
                        const imp = new this({
                            actor
                        });
                        await imp.pInit();

                        if (pFnImport)
                            await pFnImport({
                                ent,
                                imp,
                                flags
                            });
                        else
                            await imp.pImportEntry(ent, {
                                filterValues: flags.filterValues
                            });

                        const msg = fnGetSuccessMessage ? fnGetSuccessMessage({
                            ent,
                            flags
                        }) : `Imported "${ent.name}" via ${importerName} Importer`;
                        ui.notifications.info(msg);
                        return;
                    }

                    itemData = MiscUtil.copy(itemData);
                    MiscUtil.set(itemData.flags, SharedConsts.MODULE_ID, "isStandardDragDrop", true);
                    await UtilDocuments.pCreateEmbeddedDocuments(actor, [itemData], {
                        ClsEmbed: Item,
                        isKeepId: false,
                        isKeepEmbeddedIds: false
                    });
                } catch (e) {
                    const msg = fnGetFailedMessage ? fnGetFailedMessage({
                        ent,
                        flags
                    }) : `Failed to import "${ent.name}"! ${VeCt.STR_SEE_CONSOLE}`;
                    ui.notifications.error(msg);
                    throw e;
                }
            }
            );

            return false;
        }
        );
    }

    static async _pGetUseImporterDragDrop({isForce}) {
        if (isForce)
            return true;

        const dragDropMode = Config.get("import", "dragDropMode");
        if (dragDropMode === ConfigConsts.C_IMPORT_DRAG_DROP_MODE_NEVER)
            return false;

        if (dragDropMode === ConfigConsts.C_IMPORT_DRAG_DROP_MODE_PROMPT) {
            return InputUiUtil.pGetUserBoolean({
                title: `Import via ${Config.get("ui", "isStreamerMode") ? "SRD Importer" : SharedConsts.MODULE_TITLE}? Note that this will ignore any in-Foundry modifications made to the item.`,
                textYes: "Yes, use the importer",
                textNo: "No, use normal drag-drop",
            });
        }

        return true;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: `${SharedConsts.MODULE_LOCATION}/template/ImportList.hbs`,
            width: 960,
            height: Util.getMaxWindowHeight(),
            resizable: true,
            title: `Import ${this.DISPLAY_NAME_TYPE_PLURAL}`,
        });
    }

    _isSkipContentFlatten = false;
    _dirsHomebrew = null;
    _titleSearch = "entry";
    _sidebarTab = null;
    _gameProp = null;
    _defaultFolderPath = null;
    _pageFilter = null;
    _page = null;
    _listInitialSortBy = null;
    _isPreviewable = false;
    _isDedupable = false;
    _isNotDroppable = false;
    _configGroup = null;
    _isFolderOnly = false;
    _isNonCacheableInstance = null;
    _titleButtonRun = "Import";
    _namespace = null;
    _fnListSort = undefined;
    _pFnGetFluff = null;
    _isActorRadio = false;
    _isAlwaysRadio = false;
    _ClsCustomizer = null;
    static _DataConverter = null;

    constructor(externalData) {
        super();

        this._actor = externalData?.actor;
        this._table = externalData?.table;
        this._pack = externalData?.pack;
        this._packCache = null;
        this._packCacheFlat = null;

        this._isInit = false;
        this._content = null;
        this._list = null;
        this._listSelectClickHandler = null;

        this._$bntFilter = null;
        this._$btnReset = null;
        this._$btnFeelingLucky = null;
        this._$btnToggleSummary = null;
        this._$iptSearch = null;
        this._$dispNumVisible = null;
        this._$cbAll = null;
        this._$btnTogglePreviewAll = null;
        this._$wrpRun = null;
        this._$btnRun = null;
        this._$btnsRunAdditional = {};
        this._$wrpBtnsSort = null;
        this._$wrpList = null;
        this._$wrpMiniPills = null;

        this._userData = null;
    }

    get _isRadio() {
        return this._isAlwaysRadio || (!!this._actor && this._isActorRadio);
    }

    get page() {
        return this._page;
    }
    set pack(val) {
        this._pack = val;
    }
    get isFolderOnly() {
        return this._isFolderOnly;
    }
    get isNonCacheableInstance() {
        return !!this._isNonCacheableInstance;
    }
    get isDedupable() {
        return !!this._isDedupable;
    }
    set userData(val) {
        this._userData = val;
    }

    get gameProp() {
        return this._gameProp;
    }
    get actor() {
        return this._actor;
    }
    get table() {
        return this._table;
    }
    get configGroup() {
        return this._configGroup;
    }

    get propsNamespace() {
        if (!this._namespace && !this.constructor.PROPS)
            throw new Error(`One of "PROPS" or "namespace" must be provided!`);
        return this._namespace || this.constructor.PROPS.join("_");
    }

    async pSetContent(val) {
        if (!this.constructor.PROPS?.length || this._isSkipContentFlatten) {
            this._content = val;
            return;
        }

        let content = [];
        Object.entries(val).forEach(([k,arr])=>{
            if (!this.constructor.PROPS.includes(k))
                return;
            content = [...content, ...arr];
        }
        );
        this._content = content;
    }

    async pSyncStateFrom(that) {
        this._actor = that._actor;
        this._table = that._table;
        this._pack = that._pack;
        await this.pSetFolderPathSpec(that._folderPathSpec);
    }

    async _close_isAlwaysHardClose() {
        return !!this._isNonCacheableInstance;
    }

    async _close_doHardCloseTeardown() {
        if (this._pageFilter?.filterBox)
            this._pageFilter.filterBox.teardown();
    }

    isInvalidatedByConfigChange(configDiff) {
        return false;
    }

    async pPreRender() {}

    activateSidebarTab({sidebarTab=null}={}) {
        sidebarTab = sidebarTab || this._sidebarTab;

        if (this._table)
            ui.sidebar.activateTab("tables");
        if (this._pack)
            ui.sidebar.activateTab("compendium");
        else if (!this._actor && !this._table && sidebarTab)
            ui.sidebar.activateTab(sidebarTab);
    }

    renderTargetApplication({gameProp=null}={}) {
        if (this._actor)
            return this._actor.render();
        if (this._table)
            return this._table.render();
        if (this._pack)
            return this._pack.render();

        gameProp = gameProp || this._gameProp;
        return game[gameProp].render();
    }

    async pInit() {
        if (this._isInit)
            return true;
        this._isInit = true;

        await this._pInit_folderPathSpec();
    }

    _getFullFolderPathSpecKey() {
        return `${ImportList._STO_K_FOLDER_PATH_SPEC}.${this._folderPathSpecKeyConstructorName}`;
    }
    get _folderPathSpecKeyConstructorName() {
        return this.constructor.name;
    }

    _colWidthName = 9;
    _colWidthSource = 2;

    getData() {
        return {
            isRadio: !!this._isRadio,
            isPreviewable: this._isPreviewable,
            isNotDroppable: this._isNotDroppable,
            titleButtonRun: this._titleButtonRun,
            titleSearch: this._titleSearch,
            ...this._getData_cols(),
            rows: this._content.map((it,ix)=>this._getData_row({
                it,
                ix
            })),
        };
    }

    _getData_cols() {
        return {
            cols: [...this._getData_cols_otherPre(), {
                name: "Name",
                width: this._colWidthName,
                field: "name",
            }, ...this._getData_cols_other(), {
                name: "Source",
                width: this._colWidthSource,
                field: "source",
                titleProp: "sourceLong",
                displayProp: "sourceShort",
                classNameProp: "sourceClassName",
                styleProp: "sourceStyle",
                rowClassName: "ve-text-center",
            }, ],
        };
    }

    _getData_cols_otherPre() {
        return [];
    }
    _getData_cols_other() {
        return [];
    }

    _getData_row({it, ix}) {
        if (this._pageFilter)
            this._pageFilter.constructor.mutateForFilters(it);

        return {
            name: it.name,
            source: it.source,
            sourceShort: Parser.sourceJsonToAbv(it.source),
            sourceLong: Parser.sourceJsonToFull(it.source),
            sourceClassName: Parser.sourceJsonToColor(it.source),
            sourceStyle: PrereleaseUtil.sourceJsonToStylePart(it.source) || BrewUtil2.sourceJsonToStylePart(it.source),
            isVersion: !!it._versionBase_isVersion,
            __prop: it.__prop,
            ...this._getData_row_mutGetAdditionalValues({
                it,
                ix
            }),
            ix,
        };
    }

    _getData_row_mutGetAdditionalValues({it, ix}) {
        return {};
    }

    _renderInner_doFindUiElements($html) {
        const root = $html[0];

        const $wrpFilterControls = $(root.children[0]);
        this._$bntFilter = $wrpFilterControls.find(`[name="btn-filter"]`);
        this._$btnReset = $wrpFilterControls.find(`[name="btn-reset"]`);
        this._$btnFeelingLucky = $wrpFilterControls.find(`[name="btn-feeling-lucky"]`);
        this._$btnToggleSummary = $wrpFilterControls.find(`[name="btn-toggle-summary"]`);
        this._$iptSearch = $wrpFilterControls.find(`.search`);
        this._$dispNumVisible = $wrpFilterControls.find(`.lst__wrp-search-visible`);

        this._$wrpMiniPills = $(root.children[1]);

        const $wrpBtnsSort = $(root.children[2]);
        this._$cbAll = $wrpBtnsSort.find(`[name="cb-select-all"]`);
        this._$btnTogglePreviewAll = $wrpBtnsSort.find(`[name="btn-toggle-all-previews"]`);
        this._$wrpBtnsSort = $wrpBtnsSort;

        this._$wrpList = $(root.children[3]);

        this._$wrpRun = $(root.children[4]);
        this._$btnRun = this._$wrpRun.find(`[name="btn-run"]`);

        this._$wrpRun.find(`[name]`).each((i,e)=>{
            if (e.name === "btn-run")
                return;
            this._$btnsRunAdditional[e.name] = $(e);
        }
        );
    }

    async _renderInner(data) {
        const $html = await super._renderInner(data);
        await this._renderInner_custom($html);
        return $html;
    }

    async _renderInner_custom($html) {
        this._renderInner_doFindUiElements($html);

        this._renderInner_initRunButton();
        this._renderInner_initRunButtonsAdditional();

        this._renderInner_initSearchKeyHandlers();

        const doResetSearch = ()=>{
            if (this._$iptSearch)
                this._$iptSearch.val("");
            if (this._list)
                this._list.reset();
        }
        ;

        this._$btnReset.click(()=>{
            doResetSearch();
        }
        );

        this._renderInner_initFeelingLuckyButton();

        if (this._pageFilter) {
            await this._renderInner_pInitFilteredList();
            await this._renderInner_initPreviewsAndQuicksImportsAndDroppables();
        } else {
            this._renderInner_initList();
        }

        this._list.on("updated", ()=>this._$dispNumVisible.html(`${this._list.visibleItems.length}/${this._list.items.length}`));
        this._listSelectClickHandler.bindSelectAllCheckbox(this._$cbAll);
        ListUiUtil.bindPreviewAllButton(this._$btnTogglePreviewAll, this._list);

        doResetSearch();
    }

    _renderInner_initFeelingLuckyButton() {
        this._$btnFeelingLucky.click(()=>{
            if (!this._list || !this._list.visibleItems.length)
                return;

            this._listSelectClickHandler.setCheckboxes({
                isChecked: false,
                isIncludeHidden: true,
                list: this._list
            });

            const listItem = RollerUtil.rollOnArray(this._list.visibleItems);
            if (!listItem)
                return;

            this._listSelectClickHandler.setCheckbox(listItem, {
                toVal: true
            });

            listItem.ele.scrollIntoView({
                block: "center"
            });
        }
        );
    }

    _renderInner_initPreviewsAndQuicksImportsAndDroppables() {
        if (!this._isPreviewable && this._isNotDroppable)
            return;

        const items = this._list.items;
        const len = items.length;
        for (let i = 0; i < len; ++i) {
            const item = items[i];

            if (this._isPreviewable) {
                const eleControlsWrp = item.ele.firstElementChild.children[1];

                const btnShowHidePreview = eleControlsWrp.children[0];
                const btnImport = eleControlsWrp.children[1];

                this._renderInner_initPreviewButton(item, btnShowHidePreview);
                this._renderInner_initPreviewImportButton(item, btnImport);
            }

            if (!this._isNotDroppable) {
                this._renderInner_initDroppable(item);
            }
        }
    }

    _renderInner_initPreviewButton(item, btnShowHidePreview) {
        ListUiUtil.bindPreviewButton(this._page, this._content, item, btnShowHidePreview);
    }

    _renderInner_initPreviewImportButton(item, btnImport) {
        btnImport.addEventListener("click", async evt=>{
            evt.stopPropagation();
            evt.preventDefault();

            if (this._isRadio)
                this.close();

            const toImport = this._content[item.ix];
            try {
                await this._pDoPreCachePack();
                let imported;
                try {
                    imported = await this.pImportEntry(toImport);
                } finally {
                    this._pHandleClickRunButton_doDumpPackCache();
                }
                if (!imported)
                    return;
                imported.doNotification();
            } catch (e) {
                setTimeout(()=>{
                    throw e;
                }
                );
                ImportSummary.failed({
                    entity: toImport
                }).doNotification();
            }
        }
        );
    }

    _renderInner_initDroppable(listItem) {
        listItem.ele.addEventListener("dragstart", evt=>{
            const meta = {
                type: this.constructor.FOLDER_TYPE,
                subType: UtilEvents.EVT_DATA_SUBTYPE__IMPORT,
                page: this._page,
                source: listItem.values.source,
                hash: listItem.values.hash,
                name: listItem.name,
                tag: this._getAsTag(listItem),
            };
            evt.dataTransfer.setData("text/plain", JSON.stringify(meta));
        }
        );
    }

    _renderInner_initRunButton() {
        this._$btnRun.click(()=>this._pHandleClickRunButton());
    }

    _renderInner_initRunButtonsAdditional() {
        if (this._$btnsRunAdditional["btn-run-mods"])
            this._$btnsRunAdditional["btn-run-mods"].click(()=>this._pHandleClickRunButton({
                optsPostProcessing: {
                    isUseMods: true
                }
            }));
    }

    _renderInner_initSearchKeyHandlers() {
        if (!this._$iptSearch)
            return;

        this._renderInner_initSearchKeyHandlers_enter();
    }

    _renderInner_initSearchKeyHandlers_enter() {
        this._$iptSearch.keydown(async evt=>{
            if (evt.key !== "Enter")
                return;
            if (!this._list)
                return;

            evt.stopPropagation();
            evt.preventDefault();

            const li = this._list.visibleItems[0];
            if (!li)
                return;

            await this._pImportListItems({
                listItems: [li],
                isBackground: true,
            });
        }
        );
    }

    async _pGetPreCustomizedEntries(entries) {
        return entries;
    }

    async _pFnPostProcessEntries(entries, {isUseMods=false}={}) {
        if (!this._ClsCustomizer)
            return entries;

        const entriesPreCustomized = await this._pGetPreCustomizedEntries(entries);
        if (!isUseMods)
            return entriesPreCustomized;

        const customizer = new this._ClsCustomizer(entriesPreCustomized,{
            titleSearch: this._titleSearch,
            isActor: !!this._actor
        });
        await customizer.pInit();
        return customizer.pGetCustomizedEntries();
    }

    async _pHandleClickRunButton({gameProp=null, sidebarTab=null, optsPostProcessing={}, optsImportEntry={}, }={}, ) {
        if (!this._list)
            return;

        const listItems = this._list.items.filter(it=>it.data.cbSel.checked);

        if (!listItems.length)
            return ui.notifications.warn(`Please select something to import!`);

        if (!this._pack && listItems.length > 100 && !Config.get("ui", "isDisableLargeImportWarning")) {
            const isContinue = await InputUiUtil.pGetUserBoolean({
                title: `Warning: Large Import`,
                htmlDescription: `You have selected ${listItems.length} ${listItems.length === 1 ? "entity" : "entities"} to import.<br>Importing a large number of entities may degrade game performance (consider importing to a compendium instead).<br>Do you wish to continue?`,
                textYesRemember: "Continue and Remember",
                textYes: "Continue",
                textNo: "Cancel",
                fnRemember: val=>Config.set("ui", "isDisableLargeImportWarning", val),
            });
            if (isContinue == null || isContinue === false)
                return;
        }

        if (this._pack && !Config.get("ui", "isDisableLargeImportWarning") && (this._pack.index.size + listItems.length) > 500) {
            const isContinue = await InputUiUtil.pGetUserBoolean({
                title: `Warning: Large Compendium`,
                htmlDescription: `You have selected ${listItems.length} ${listItems.length === 1 ? "entity" : "entities"} to import${this._pack.index.size ? ` to a compendium with ${this._pack.index.size} existing document${this._pack.index.size !== 1 ? "s" : ""}` : ""}.<br>Importing a large number of documents to a single compendium may degrade game performance.<br>Do you wish to continue?`,
                textYesRemember: "Continue and Remember",
                textYes: "Continue",
                textNo: "Cancel",
                fnRemember: val=>Config.set("ui", "isDisableLargeImportWarning", val),
            });
            if (isContinue == null || isContinue === false)
                return;
        }

        this.close();

        await this._pImportListItems({
            listItems,
            optsPostProcessing,
            optsImportEntry,
            gameProp,
            sidebarTab,
        });

        this._$cbAll.prop("checked", false);
        this._list.items.forEach(item=>{
            item.data.cbSel.checked = false;
            item.ele.classList.remove("list-multi-selected");
        }
        );
    }

    async _pImportListItems({listItems, optsPostProcessing, optsImportEntry, gameProp, sidebarTab,
    isBackground=false, }, ) {
        gameProp = gameProp || this._gameProp;
        sidebarTab = sidebarTab || this._sidebarTab;

        let entries = listItems.map(li=>this._content[li.ix]);
        entries = await this._pFnPostProcessEntries(entries, optsPostProcessing);
        if (entries == null)
            return;

        await this._pDoPreCachePack({
            gameProp
        });

        await (isBackground ? this._pImportListItems_background({
            entries,
            optsImportEntry
        }) : this._pImportListItems_foreground({
            entries,
            optsImportEntry
        }));

        this.activateSidebarTab({
            sidebarTab
        });
        this.renderTargetApplication({
            gameProp
        });

        this._pHandleClickRunButton_doDumpPackCache();
    }

    async _pImportListItems_background({entries, optsImportEntry}) {
        for (const entry of entries) {
            try {
                const importedMeta = await this.pImportEntry(entry, new ImportOpts({
                    ...optsImportEntry,
                    isBatched: true
                }));
                if (importedMeta)
                    importedMeta.doNotification();
            } catch (e) {
                ImportSummary.failed({
                    entity: entry
                }).doNotification();
                console.error(e);
            }
        }
    }

    async _pImportListItems_foreground({entries, optsImportEntry}) {
        await (new AppTaskRunner({
            tasks: [...entries.map(entry=>{
                return new TaskClosure({
                    fnGetPromise: async({taskRunner})=>this.pImportEntry(entry, new ImportOpts({
                        ...optsImportEntry,
                        taskRunner,
                        isBatched: true
                    })),
                });
            }
            ), ],
            titleInitial: "Importing...",
            titleComplete: "Import Complete",
        })).pRun();
    }

    async _renderInner_pInitFilteredList() {
        this._list = new List({
            $iptSearch: this._$iptSearch,
            $wrpList: this._$wrpList,
            fnSort: this._fnListSort,
            sortByInitial: this._listInitialSortBy,
            syntax: this._renderInner_getListSyntax(),
        });
        SortUtil.initBtnSortHandlers(this._$wrpBtnsSort, this._list);
        this._listSelectClickHandler = new ListSelectClickHandler({
            list: this._list
        });

        await this._pageFilter.pInitFilterBox({
            $iptSearch: this._$iptSearch,
            $btnReset: this._$btnReset,
            $btnOpen: this._$bntFilter,
            $btnToggleSummaryHidden: this._$btnToggleSummary,
            $wrpMiniPills: this._$wrpMiniPills,
            namespace: this._getFilterNamespace(),
        });

        this._content.forEach(it=>this._pageFilter.addToFilters(it));

        this._renderInner_absorbListItems();
        this._list.init();

        this._pageFilter.trimState();
        this._pageFilter.filterBox.render();

        await this._pPostFilterRender();

        this._pageFilter.filterBox.on(FilterBox.EVNT_VALCHANGE, this._handleFilterChange.bind(this), );

        this._handleFilterChange();
    }

    _renderInner_getListSyntax() {
        return new ListUiUtil.ListSyntax({
            fnGetDataList: ()=>this._content,
            pFnGetFluff: this._pFnGetFluff,
        }).build();
    }

    async _pPostFilterRender() {}

    async _pPostRenderOrShow() {
        await super._pPostRenderOrShow();
        if (this._$iptSearch)
            this._$iptSearch.focus();
    }

    _renderInner_initList() {
        this._list = new List({
            $iptSearch: this._$iptSearch,
            $wrpList: this._$wrpList,
            fnSort: this._fnListSort,
        });
        SortUtil.initBtnSortHandlers(this._$wrpBtnsSort, this._list);

        this._listSelectClickHandler = new ListSelectClickHandler({
            list: this._list
        });

        this._renderInner_absorbListItems();
        this._list.init();
    }

    _renderInner_absorbListItems() {
        this._list.doAbsorbItems(this._content, {
            fnGetName: it=>it.name,
            fnGetValues: this._renderInner_absorbListItems_fnGetValues.bind(this),
            fnGetData: UtilList2.absorbFnGetData,
            fnBindListeners: it=>this._renderInner_absorbListItems_isRadio ? UtilList2.absorbFnBindListenersRadio(this._listSelectClickHandler, it) : UtilList2.absorbFnBindListeners(this._listSelectClickHandler, it),
        }, );
    }

    get _renderInner_absorbListItems_isRadio() {
        return !!this._isRadio;
    }

    _renderInner_absorbListItems_fnGetValues(it) {
        return {
            source: it.source,
            hash: UrlUtil.URL_TO_HASH_BUILDER[this._page](it),
        };
    }

    _handleFilterChange() {
        const f = this._pageFilter.filterBox.getValues();
        this._list.filter(li=>this._pageFilter.toDisplay(f, this._content[li.ix]));
    }

    async pImportEntry(ent, importOpts, dataOpts) {
        return new ImportEntryManager({
            instance: this,
            ent,
            importOpts,
            dataOpts,
        }).pImportEntry();
    }

    async _pImportEntry(ent, importOpts, dataOpts) {
        importOpts ||= new ImportOpts();

        console.log(...LGT, `Importing ${this._titleSearch} "${ent.name}" (from "${Parser.sourceJsonToAbv(ent.source)}")`);

        if (this.constructor._DataConverter.isStubEntity(ent))
            return ImportSummary.completedStub({
                entity: ent
            });

        ent = await this._pGetCustomizedEntity({
            ent
        });

        Renderer.get().setFirstSection(true).resetHeaderIndex();

        await this._pImportEntry_preImport({
            ent,
            importOpts,
            dataOpts
        });

        if (importOpts.isDataOnly) {
            return new ImportSummary({
                status: ConstsTaskRunner.TASK_EXIT_COMPLETE_DATA_ONLY,
                imported: [new ImportedDocument({
                    document: await this.constructor._DataConverter.pGetDocumentJson(ent, {
                        actor: this._actor,
                        taskRunner: importOpts.taskRunner
                    }),
                    actor: this._actor,
                }), ],
                entity: ent,
            });
        }

        if (importOpts.isTemp)
            return this._pImportEntry_pImportToDirectoryGeneric(ent, importOpts, dataOpts);
        if (this._actor)
            return this._pImportEntry_pImportToActor(ent, importOpts, dataOpts);
        return this._pImportEntry_pImportToDirectoryGeneric(ent, importOpts, dataOpts);
    }

    async _pGetCustomizedEntity({ent}) {
        if (!ent._fvttCustomizerState)
            return ent;
        return this._ClsCustomizer.pGetAppliedCustomizations({
            ent
        });
    }

    async _pImportEntry_preImport({ent, importOpts, dataOpts}) {}

    async _pImportEntry_pImportToActor(ent, importOpts, dataOpts) {
        await UtilDocuments.pCreateEmbeddedDocuments(this._actor, [await this.constructor._DataConverter.pGetDocumentJson(ent, {
            isActorItem: true,
            actor: this._actor,
            taskRunner: importOpts.taskRunner
        }, dataOpts)], {
            ClsEmbed: Item,
            isRender: !importOpts.isBatched
        }, );

        return new ImportSummary({
            status: ConstsTaskRunner.TASK_EXIT_COMPLETE,
            imported: [new ImportedDocument({
                name: ent.name,
                actor: this._actor,
            }), ],
            entity: ent,
        });
    }

    async pGetSources({isApplyWorldDataSourceFilter=true}={}) {
        return (await this._pGetSources()).filter(dataSource=>!isApplyWorldDataSourceFilter || !UtilWorldDataSourceSelector.isFiltered(dataSource));
    }

    async _pGetSources() {
        throw new Error(`Unimplemented!`);
    }

    async pGetAllContent({sources, uploadedFileMetas, customUrls, isBackground=false}) {
        const userData = await this.pGetChooseImporterUserDataForSources(sources);
        const cacheKeys = [];

        return UtilDataSource.pGetAllContent({
            sources,
            uploadedFileMetas,
            customUrls,
            isBackground,
            userData,
            cacheKeys,

            page: this._page,

            isDedupable: this._isDedupable,
            fnGetDedupedData: this._getDedupedData ? this._getDedupedData.bind(this) : null,

            fnGetBlocklistFilteredData: this._getBlocklistFilteredData ? this._getBlocklistFilteredData.bind(this) : null,
        });
    }

    async _pImportEntry_getUserVersion(entity) {
        if (entity._foundryIsIgnoreVersions)
            return entity;

        const versions = DataUtil.proxy.getVersions(entity.__prop, entity);
        if (!versions.length)
            return entity;

        const ix = await InputUiUtil.pGetUserEnum({
            values: versions,
            placeholder: "Select Version...",
            title: `Select the Version to Import`,
            fnDisplay: it=>{
                if (it == null)
                    return `(Base version)`;
                return `${it.name}${entity.source !== it.source ? ` (${Parser.sourceJsonToAbv(it.source)})` : ""}`;
            }
            ,
            isAllowNull: true,
        });

        if (ix == null) {
            const cpy = MiscUtil.copy(entity);
            cpy._foundryIsIgnoreVersions = true;
            return cpy;
        }
        return versions[ix];
    }

    async _pGetSourcesPrerelease(nxtOpts={}) {
        return UtilDataSource.pGetSourcesPrerelease(this._dirsHomebrew, nxtOpts);
    }
    async _pGetSourcesBrew(nxtOpts={}) {
        return UtilDataSource.pGetSourcesBrew(this._dirsHomebrew, nxtOpts);
    }

    getFolderPathForceLeafEntryName() {
        return null;
    }

    getFolderPathMeta() {
        return {
            alpha: {
                label: "First Letter of Name",
                getter: it=>it.name.slice(0, 1).toUpperCase(),
            },
            source: {
                label: "Source (Full)",
                getter: it=>Parser.sourceJsonToFull(it.source),
            },
            sourceAbbreviation: {
                label: "Source (Abbreviation)",
                getter: it=>Parser.sourceJsonToAbv(it.source),
            },
        };
    }

    async _pImportEntry_pGetFolderIdMeta(entry, opts) {
        opts = opts || {};

        return this._pGetCreateFoldersGetIdFromObject({
            folderType: opts.folderType || this.constructor.FOLDER_TYPE,
            obj: entry,
            sorting: opts.sorting,
            defaultOwnership: this._getFolderDefaultOwnership(opts),
            userOwnership: opts.userOwnership,
            isFoldersOnly: opts.isFoldersOnly,
            isRender: !opts.isBatched,
        });
    }

    _getFolderDefaultOwnership({defaultOwnership, isAddDefaultOwnershipFromConfig, }, ) {
        if (defaultOwnership != null)
            return defaultOwnership;
        if (isAddDefaultOwnershipFromConfig && Config.has(this._configGroup, "ownership"))
            return Config.get(this._configGroup, "ownership");
        return null;
    }

    _getFilterNamespace() {
        return `importer_${this._actor ? `actor` : `directory`}_${this.propsNamespace}`;
    }

    _getDuplicateMeta(opts) {
        opts = opts || {};

        return new DuplicateMeta({
            mode: Config.get("import", "deduplicationMode"),
            existing: this._getDuplicateMeta_getExisting(opts),
        });
    }

    _getDuplicateMeta_getExisting(opts) {
        if (opts?.importOpts?.isTemp || opts?.importOpts?.isImportToTempDirectory)
            return null;

        const gameProp = opts.gameProp || this._gameProp;

        const pack = gameProp === this._gameProp ? this._pack : null;

        let existing = null;
        switch (gameProp) {
        case "actors":
        case "items":
            {
                if (!((opts.name != null && opts.sourceIdentifier != null) || opts.entity))
                    throw new Error(`Either "name" and "sourceIdentifier", or "entity", must be provided!`);

                const cleanName = (opts.name ?? UtilDataConverter.getNameWithSourcePart(opts.entity)).toLowerCase().trim();
                const sourceIdent = opts.sourceIdentifier ?? UtilDocumentSource.getDocumentSourceIdentifierString({
                    entity: opts.entity
                });

                switch (gameProp) {
                case "actors":
                case "items":
                    {
                        if (pack) {
                            const key = this._getDuplicateMeta_getEntityKey({
                                name: cleanName,
                                sourceIdent
                            });
                            existing = (this._packCache || {})[key];
                            break;
                        }

                        existing = game[gameProp].find(doc=>this.constructor._getDuplicateMeta_getCleanName(doc) === cleanName && (!Config.get("import", "isStrictMatching") || UtilDocumentSource.getDocumentSourceIdentifierString({
                            doc
                        }) === sourceIdent), );

                        break;
                    }
                }

                break;
            }

        case "journal":
        case "tables":
        case "scenes":
        case "cards":
            {
                const cleanName = opts.name.toLowerCase().trim();

                const isMatch = (docExisting)=>{
                    return this.constructor._getDuplicateMeta_getCleanName(docExisting) === cleanName && this.constructor._getDuplicateMeta_isFlagMatch(opts.flags, docExisting);
                }
                ;

                if (pack) {
                    existing = (this._packCacheFlat || []).find(it=>isMatch(it));
                } else {
                    existing = game[gameProp].find(it=>isMatch(it));
                }
                break;
            }

        default:
            throw new Error(`Game property "${gameProp}" is not supported!`);
        }
        return existing;
    }

    _getDuplicateCheckFlags(docData) {
        return null;
    }

    _getDuplicateMetasSub(opts) {
        if (opts?.importOpts?.isTemp || opts?.importOpts?.isImportToTempDirectory)
            return null;

        const toCreates = [];
        const toUpdates = [];

        opts.children.forEach(child=>{
            const cleanName = child.name.toLowerCase().trim();
            const existing = opts.parent.pages.find(it=>this.constructor._getDuplicateMeta_getCleanName(it) === cleanName && this.constructor._getDuplicateMeta_isFlagMatch(child.flags, it));

            if (existing)
                child._id = existing.id;
            (existing ? toUpdates : toCreates).push(child);
        }
        );

        return {
            toCreates,
            toUpdates
        };
    }

    static _getDuplicateMeta_getCleanName(it) {
        let out = (MiscUtil.get(it, "name") || "").toLowerCase().trim();

        out = out.replace(/\[[^\]]+]/g, "").trim();

        return out;
    }

    static _getDuplicateMeta_isFlagMatch(flags, entity) {
        if (!flags)
            return true;
        if (!entity)
            return false;

        if (!entity.flags)
            return false;
        for (const [moduleKey,flagGroup] of Object.entries(flags)) {
            if (entity.flags[moduleKey] == null)
                return false;
            for (const [k,v] of Object.entries(flagGroup)) {
                if (!CollectionUtil.deepEquals(v, entity.flags[moduleKey]?.[k]))
                    return false;
            }
        }
        return true;
    }

    _getDuplicateMeta_getEntityKey(obj) {
        return Object.entries(obj).sort(([aK],[bK])=>SortUtil.ascSortLower(aK, bK)).map(([k,v])=>`${k}=${`${v}`.trim()}`.toLowerCase()).join("::");
    }

    async _pDoPreCachePack({gameProp=null, taskRunner=null}={}) {
        gameProp = gameProp || this._gameProp;

        if (!this._pack || Config.get("import", "deduplicationMode") === ConfigConsts.C_IMPORT_DEDUPE_MODE_NONE)
            return;

        this._packCache = {};
        this._packCacheFlat = [];
        const content = await UtilCompendium.pGetCompendiumData(this._pack, true, {
            taskRunner
        });

        content.forEach(doc=>{
            switch (gameProp) {
            case "actors":
                {
                    const cleanName = (MiscUtil.get(doc, "name") || "").toLowerCase().trim();
                    const sourceIdent = UtilDocumentSource.getDocumentSourceIdentifierString({
                        doc
                    });

                    const key = this._getDuplicateMeta_getEntityKey({
                        name: cleanName,
                        sourceIdent
                    });
                    this._packCache[key] = doc;

                    break;
                }
            case "items":
                {
                    const cleanName = (MiscUtil.get(doc, "name") || "").toLowerCase().trim();
                    const sourceIdent = UtilDocumentSource.getDocumentSourceIdentifierString({
                        doc
                    });

                    const key = this._getDuplicateMeta_getEntityKey({
                        name: cleanName,
                        sourceIdent
                    });
                    this._packCache[key] = doc;

                    break;
                }
            case "journal":
            case "tables":
            case "scenes":
            case "cards":
                {
                    const cleanName = (MiscUtil.get(doc, "name") || "").toLowerCase().trim();

                    const key = this._getDuplicateMeta_getEntityKey({
                        name: cleanName
                    });
                    this._packCache[key] = doc;

                    break;
                }
            default:
                throw new Error(`Game property "${gameProp}" is not supported!`);
            }

            this._packCacheFlat.push(doc);
        }
        );
    }

    _pHandleClickRunButton_doDumpPackCache() {
        this._packCache = null;
        this._packCacheFlat = null;
    }

    async _pImportEntry_pDoUpdateExistingPackEntity({entity, duplicateMeta, docData, importOpts}) {
        await this._pCleanExistingDocumentCollections({
            document: duplicateMeta.existing
        });

        this._pImportEntry_pDoUpdateExisting_maintainImg({
            duplicateMeta,
            docData
        });

        await UtilDocuments.pUpdateDocument(duplicateMeta.existing, docData);

        await this._pImportEntry_pAddToTargetTableIfRequired([duplicateMeta.existing], duplicateMeta, importOpts);

        return new ImportSummary({
            status: ConstsTaskRunner.TASK_EXIT_COMPLETE_UPDATE_OVERWRITE_DUPLICATE,
            imported: [new ImportedDocument({
                isExisting: true,
                document: duplicateMeta.existing,
                pack: this._pack,
            }), ],
            entity,
        });
    }

    async _pImportEntry_pDoUpdateExistingDirectoryEntity({entity, duplicateMeta, docData}) {
        await this._pCleanExistingDocumentCollections({
            document: duplicateMeta.existing
        });

        this._pImportEntry_pDoUpdateExisting_maintainImg({
            duplicateMeta,
            docData
        });

        await UtilDocuments.pUpdateDocument(duplicateMeta.existing, docData);

        return new ImportSummary({
            status: ConstsTaskRunner.TASK_EXIT_COMPLETE_UPDATE_OVERWRITE_DUPLICATE,
            imported: [new ImportedDocument({
                isExisting: true,
                document: duplicateMeta.existing,
            }), ],
            entity,
        });
    }

    async _pCleanExistingDocumentCollections({document}) {
        const fields = Object.values(document.constructor.schema.fields).filter((v)=>v instanceof foundry.data.fields.EmbeddedCollectionField);

        for (const field of fields) {
            const toDelete = document[field.element.metadata.collection].map(it=>it.id);
            if (!toDelete.length)
                continue;
            await UtilDocuments.pDeleteEmbeddedDocuments(document, toDelete, {
                ClsEmbed: CONFIG[field.element.metadata.name].documentClass
            }, );
        }
    }

    _pImportEntry_pDoUpdateExisting_maintainImg({duplicateMeta, docData}) {
        if (!duplicateMeta?.isOverwrite)
            return;

        const prevImg = Config.get("import", "isDuplicateHandlingMaintainImage") ? duplicateMeta.existing.img : null;
        if (prevImg != null)
            docData.img = prevImg;
    }

    async _pImportEntry_pImportToDirectoryGeneric(toImport, importOpts, dataOpts={}, {docData=null, isSkipDuplicateHandling=false}={}) {
        docData = docData || await this._pImportEntry_pImportToDirectoryGeneric_pGetImportableData(toImport, {
            isAddDataFlags: true,
            filterValues: importOpts.filterValues,
            ...dataOpts,
            isAddDefaultOwnershipFromConfig: importOpts.isAddDefaultOwnershipFromConfig ?? true,
            defaultOwnership: importOpts.defaultOwnership,
            userOwnership: importOpts.userOwnership,
        }, importOpts, );

        const duplicateMeta = isSkipDuplicateHandling ? null : this._getDuplicateMeta({
            name: docData.name,
            sourceIdentifier: UtilDocumentSource.getDocumentSourceIdentifierString({
                doc: docData
            }),
            flags: this._getDuplicateCheckFlags(docData),
            importOpts,
        });
        if (duplicateMeta?.isSkip) {
            return new ImportSummary({
                status: ConstsTaskRunner.TASK_EXIT_SKIPPED_DUPLICATE,
                imported: [new ImportedDocument({
                    isExisting: true,
                    document: duplicateMeta.existing,
                }), ],
                entity: toImport,
            });
        }

        const Clazz = this._getDocumentClass();

        if (importOpts.isTemp) {
            const imported = await UtilDocuments.pCreateDocument(Clazz, docData, {
                isRender: false,
                isTemporary: true
            });
            return new ImportSummary({
                status: ConstsTaskRunner.TASK_EXIT_COMPLETE,
                imported: [new ImportedDocument({
                    document: imported,
                }), ],
                entity: toImport,
            });
        }

        if (this._pack) {
            if (duplicateMeta?.isOverwrite) {
                return this._pImportEntry_pDoUpdateExistingPackEntity({
                    entity: toImport,
                    duplicateMeta,
                    docData,
                    importOpts,
                });
            }

            const instance = new Clazz(docData);
            const imported = await this._pack.importDocument(instance);

            await this._pImportEntry_pAddToTargetTableIfRequired([imported], duplicateMeta, importOpts);

            return new ImportSummary({
                status: ConstsTaskRunner.TASK_EXIT_COMPLETE,
                imported: [new ImportedDocument({
                    document: imported,
                    pack: this._pack,
                }), ],
                entity: toImport,
            });
        }

        return this._pImportEntry_pImportToDirectoryGeneric_toDirectory({
            duplicateMeta,
            docData,
            toImport,
            isSkipDuplicateHandling,
            Clazz,
            importOpts,
        });
    }

    async _pImportEntry_pImportToDirectoryGeneric_toDirectory({duplicateMeta, docData, toImport, isSkipDuplicateHandling=false, Clazz, folderType=null, importOpts, }, ) {
        if (duplicateMeta?.isOverwrite) {
            return this._pImportEntry_pDoUpdateExistingDirectoryEntity({
                entity: toImport,
                duplicateMeta,
                docData,
            });
        }

        const folderIdMeta = await this._pImportEntry_pImportToDirectoryGeneric_pGetFolderIdMeta({
            toImport,
            importOpts,
            folderType,
        });

        if (folderIdMeta?.parentDocumentId) {
            return this._pImportEntry_pImportToDirectoryGeneric_toDirectorySubEntities({
                entity: toImport,
                parent: game.journal.get(folderIdMeta.parentDocumentId),
                folderIdMeta,
                isSkipDuplicateHandling,
                embeddedDocDatas: docData.pages,
                ClsEmbed: JournalEntryPage,
                importOpts,
            });
        }

        if (folderIdMeta?.folderId)
            docData.folder = folderIdMeta.folderId;

        const imported = await UtilDocuments.pCreateDocument(Clazz, docData, {
            isTemporary: false,
            isRender: !importOpts.isBatched
        });

        return new ImportSummary({
            status: ConstsTaskRunner.TASK_EXIT_COMPLETE,
            imported: [new ImportedDocument({
                document: imported,
            }), ],
            entity: toImport,
        });
    }

    async _pImportEntry_pImportToDirectoryGeneric_pGetFolderIdMeta({toImport, importOpts, folderType=null, }, ) {
        folderType = folderType || this.constructor.FOLDER_TYPE;

        return importOpts.isImportToTempDirectory ? new FolderIdMeta({
            folderId: await UtilFolders.pCreateTempFolderGetId({
                folderType
            })
        }) : importOpts.folderId !== undefined ? new FolderIdMeta({
            folderId: importOpts.folderId
        }) : this._pImportEntry_pGetFolderIdMeta(toImport, {
            isAddDefaultOwnershipFromConfig: importOpts.isAddDefaultOwnershipFromConfig ?? true,
            defaultOwnership: importOpts.defaultOwnership,
            userOwnership: importOpts.userOwnership,
            isBatched: importOpts.isBatched,
            folderType,
        }, );
    }

    async _pImportEntry_pImportToDirectoryGeneric_toDirectorySubEntities({entity, parent, isSkipDuplicateHandling, embeddedDocDatas, ClsEmbed, importOpts, }, ) {
        importOpts ||= new ImportOpts();

        const duplicateMetasSub = isSkipDuplicateHandling ? {
            toCreates: embeddedDocDatas,
            toUpdates: []
        } : this._getDuplicateMetasSub({
            parent,
            children: embeddedDocDatas,
            importOpts
        });

        const importedDocuments = [];

        if (duplicateMetasSub.toCreates.length) {
            const importedEmbeds = await UtilDocuments.pCreateEmbeddedDocuments(parent, duplicateMetasSub.toCreates, {
                ClsEmbed,
                isRender: !importOpts.isBatched,
            }, );

            importedDocuments.push(...importedEmbeds.map(it=>new ImportedDocument({
                embeddedDocument: it?.document
            })), );
        }

        if (duplicateMetasSub.toUpdates.length) {
            const importedEmbeds = await UtilDocuments.pUpdateEmbeddedDocuments(parent, duplicateMetasSub.toUpdates, {
                ClsEmbed,
            }, );

            importedDocuments.push(...importedEmbeds.map(it=>new ImportedDocument({
                embeddedDocument: it?.document,
                isExisting: true
            })), );
        }

        return new ImportSummary({
            status: ConstsTaskRunner.TASK_EXIT_COMPLETE,
            imported: importedDocuments,
            entity,
        });
    }

    _getDocumentClass() {
        switch (this._gameProp) {
        case "items":
            return CONFIG.Item.documentClass;
        case "journal":
            return CONFIG.JournalEntry.documentClass;
        case "tables":
            return CONFIG.RollTable.documentClass;
        case "scenes":
            return CONFIG.Scene.documentClass;
        case "cards":
            return CONFIG.Cards.documentClass;
        }
        throw new Error(`Unhandled game prop "${this._gameProp}"`);
    }

    async _pImportEntry_pAddToTargetTableIfRequired(fvttEntities, duplicateMeta, importOpts) {
        if (!this._table)
            return;

        const isFilterRows = duplicateMeta?.mode === ConfigConsts.C_IMPORT_DEDUPE_MODE_SKIP || duplicateMeta?.isOverwrite;

        fvttEntities = isFilterRows ? fvttEntities.filter(fvttEntity=>!this._table.results.some(it=>it.documentId === fvttEntity.id)) : fvttEntities;
        if (!fvttEntities.length)
            return;

        const rangeLowHigh = DataConverterTable.getMaxTableRange(this._table) + 1;
        await UtilDocuments.pCreateEmbeddedDocuments(this._table, await fvttEntities.pSerialAwaitMap(fvttEntity=>DataConverterTable.pGetTableResult({
            type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
            text: fvttEntity.name,
            documentId: fvttEntity.id,
            collection: this._pack.collection,
            rangeExact: rangeLowHigh,
            img: fvttEntity.img,
        })), {
            ClsEmbed: TableResult,
            isRender: !importOpts.isBatched,
        }, );
    }

    _pImportEntry_pImportToDirectoryGeneric_pGetImportableData(it, getItemOpts, importOpts) {
        return this.constructor._DataConverter.pGetDocumentJson(it, {
            actor: this._actor,
            taskRunner: importOpts.taskRunner,
            ...getItemOpts
        });
    }

    async pGetChooseImporterUserDataForSources() {}

    _getAsTag(listItem) {
        const tag = Parser.getPropTag(this._content[listItem.ix].__prop);
        const ptId = DataUtil.generic.packUid(this._content[listItem.ix], tag);
        return `@${tag}[${ptId}]`;
    }
}
ImportList._STO_K_FOLDER_PATH_SPEC = "ImportList.folderKeyPathSpec";
ImportList._suppressCreateSheetItemHookTimeStart = null;

function MixinUserChooseImporter(ClsImportList) {
    class MixedUserChooseImporter extends ClsImportList {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                title: `Select ${this.DISPLAY_NAME_TYPE_SINGLE}`
            });
        }

        _isNotDroppable = true;
        _titleButtonRun = "Select";
        _isAlwaysRadio = true;

        _isForceImportToTempDirectory = false;

        constructor(...arge) {
            super(...arge);

            this._isResolveOnClose = true;
            this._fnResolve = null;
            this._fnReject = null;
            this.pResult = null;
        }

        _getImportOpts() {
            return this._isForceImportToTempDirectory ? new ImportOpts({
                isImportToTempDirectory: true
            }) : new ImportOpts({
                isTemp: true,
                isDataOnly: true
            });
        }

        _isImportSuccess(importSummary) {
            return (!this._isForceImportToTempDirectory && importSummary.status === ConstsTaskRunner.TASK_EXIT_COMPLETE_DATA_ONLY) || (this._isForceImportToTempDirectory && importSummary.status === ConstsTaskRunner.TASK_EXIT_COMPLETE);
        }

        async _pHandleClickRunButton() {
            if (!this._list)
                return;

            try {
                const selItem = this._list.items.find(it=>it.data.cbSel.checked);

                if (!selItem)
                    return ui.notifications.warn(`Please select something from the list!`);

                this._isResolveOnClose = false;

                this.close();

                let entries = [this._content[selItem.ix]];

                entries = await this._pFnPostProcessEntries(entries);
                if (entries == null)
                    return;

                const importOpts = this._getImportOpts();

                const importSummary = await this.pImportEntry(entries[0], importOpts);
                if (this._isImportSuccess(importSummary))
                    this._fnResolve(importSummary?.imported?.[0]?.document);
                else
                    this._fnReject(new Error(`Import exited with status "${importSummary.status.toString()}"`));

                selItem.data.cbSel.checked = false;
                selItem.ele.classList.remove("list-multi-selected");
            } catch (e) {
                this._fnReject(e);
            }
        }

        _renderInner_initPreviewImportButton(item, btnImport) {
            btnImport.addEventListener("click", async evt=>{
                evt.stopPropagation();
                evt.preventDefault();

                try {
                    let entries = [this._content[item.ix]];

                    entries = await this._pFnPostProcessEntries(entries);
                    if (entries == null)
                        return;

                    const importOpts = this._getImportOpts();

                    const imported = await this.pImportEntry(entries[0], importOpts);
                    if (this._isImportSuccess(imported))
                        this._fnResolve(imported?.imported?.[0]?.document);
                    else
                        this._fnReject(new Error(`Import exited with status "${imported.status.toString()}"`));

                    this.close();
                } catch (e) {
                    this._fnReject(e);
                }
            }
            );
        }

        async close(...args) {
            await super.close(...args);
            if (this._isResolveOnClose)
                this._fnResolve(null);
        }

        async pPreRender(...preRenderArgs) {
            await super.pPreRender(...preRenderArgs);

            if (!preRenderArgs?.length)
                return;

            const [{fnResolve, fnReject, pResult}] = preRenderArgs;

            this._isResolveOnClose = true;
            this._fnResolve = fnResolve;
            this._fnReject = fnReject;
            this.pResult = pResult;
        }

        static async pGetUserChoice(mode, namespace) {
            const {ChooseImporter} = await Promise.resolve().then(function() {
                return ChooseImporter$1;
            });

            const importer = new this({});
            await importer.pInit();

            let fnResolve = null;
            let fnReject = null;
            const pResult = new Promise((resolve,reject)=>{
                fnResolve = resolve;
                fnReject = reject;
            }
            );

            const chooseImporter = new ChooseImporter({
                mode: new ChooseImporter.Mode({
                    ...mode,
                    importerInstance: importer,
                }),
                namespace,
                isAlwaysCloseWindow: true,
                isTemp: true,
                importerPreRenderArgs: {
                    fnResolve,
                    fnReject,
                    pResult,
                },
            },);

            if (chooseImporter.isMaybeSkippable()) {
                if (await chooseImporter.pInitIsSubSkippable()) {
                    chooseImporter.pDoQuickOpenUsingExistingSourceSelection({
                        isSilent: true,
                        isBackground: true
                    }).then(null);
                    return pResult;
                }
            }

            chooseImporter.render(true);
            return pResult;
        }
    }
    return MixedUserChooseImporter;
}

//#region ImportListCharacter
class ImportListCharacter extends ImportList {
    async _pApplyAllAdditionalSpellsToActor({entity, importOpts, dataBuilderOpts}) {
        const formData = await Charactermancer_AdditionalSpellsSelect.pGetUserInput({
            additionalSpells: entity.additionalSpells,
            sourceHintText: entity.name,
            modalFilterSpells: await Charactermancer_AdditionalSpellsSelect.pGetInitModalFilterSpells(),

            curLevel: 0,
            targetLevel: Consts.CHAR_MAX_LEVEL,
            spellLevelLow: 0,
            spellLevelHigh: 9,
        });

        if (formData == null) {
            dataBuilderOpts.isCancelled = true;
            return null;
        }
        if (formData === VeCt.SYM_UI_SKIP)
            return null;

        return Charactermancer_AdditionalSpellsSelect.pApplyFormDataToActor(this._actor, formData, {
            taskRunner: importOpts.taskRunner
        });
    }

    _applyAdditionalSpellImportSummariesToTagHashItemIdMap({tagHashItemIdMap, importSummariesAdditionalSpells}) {
        importSummariesAdditionalSpells.forEach(importSummary=>{
            if (!importSummary.entity)
                return;

            const hash = UrlUtil.URL_TO_HASH_BUILDER[UrlUtil.PG_SPELLS](importSummary.entity);
            MiscUtil.set(tagHashItemIdMap, "spell", hash, importSummary.getPrimaryDocument().id);
        }
        );
    }

    async _pDoMergeAndApplyActorUpdate(actorUpdate) {
        if (!Object.keys(actorUpdate).length)
            return;

        this._doMergeExistingSkillToolData({
            actorUpdate,
            propActorData: "skills"
        });
        this._doMergeExistingSkillToolData({
            actorUpdate,
            propActorData: "tools"
        });
        this._doMergeExistingOtherProficiencyData({
            actorUpdate
        });
        this._doMergeExistingDiDrDvCiData({
            actorUpdate
        });
        await UtilDocuments.pUpdateDocument(this._actor, actorUpdate);
    }

    _doMergeExistingSkillToolData({actorUpdate, prop}) {
        if (!actorUpdate?.system?.[prop])
            return;
        Object.entries(actorUpdate.system[prop]).forEach(([abv,meta])=>{
            meta.value = Math.max(this._actor._source?.system?.[prop]?.[abv]?.value, meta.value, 0);
        }
        );
    }

    _doMergeExistingOtherProficiencyData({actorUpdate}) {
        const actorDataPaths = [["system", "traits", "languages"], ["system", "traits", "weaponProf"], ["system", "traits", "armorProf"], ];
        return this._doMergeExistingGenericTraitsData({
            actorUpdate,
            actorDataPaths
        });
    }

    _doMergeExistingDiDrDvCiData({actorUpdate}) {
        const actorDataPaths = [["system", "traits", "di"], ["system", "traits", "dr"], ["system", "traits", "dv"], ["system", "traits", "ci"], ];
        return this._doMergeExistingGenericTraitsData({
            actorUpdate,
            actorDataPaths
        });
    }

    _doMergeExistingGenericTraitsData({actorUpdate, actorDataPaths}) {
        actorDataPaths.forEach(actorDataPath=>{
            const actorUpdatePath = actorDataPath.slice(1);
            const fromActor = MiscUtil.get(this._actor, "_source", ...actorDataPath);
            const fromUpdate = MiscUtil.get(actorUpdate, ...actorUpdatePath);
            if (!fromActor && !fromUpdate)
                return;
            if (!fromActor && fromUpdate)
                return;
            if (fromActor && !fromUpdate)
                return MiscUtil.set(actorUpdate, ...actorUpdatePath, MiscUtil.copy(fromActor));

            if (fromActor.value && fromUpdate.value) {
                MiscUtil.set(actorUpdate, ...actorUpdatePath, "value", [...new Set([...fromActor.value, ...fromUpdate.value])]);
            } else {
                MiscUtil.set(actorUpdate, ...actorUpdatePath, "value", MiscUtil.copy(fromActor.value || fromUpdate.value));
            }

            if (fromActor.custom && fromActor.custom.trim().length && fromUpdate.custom && fromUpdate.custom.trim().length) {
                const allCustom = fromActor.custom.trim().split(";").map(it=>it.trim()).filter(Boolean);
                fromUpdate.custom.trim().split(";").map(it=>it.trim()).filter(Boolean).filter(it=>!allCustom.some(ac=>ac.toLowerCase() === it.toLowerCase())).forEach(it=>allCustom.push(it));

                MiscUtil.set(actorUpdate, ...actorUpdatePath, "custom", allCustom.join(";"));
            } else {
                MiscUtil.set(actorUpdate, ...actorUpdatePath, "custom", fromActor.custom || fromUpdate.custom);
            }
        }
        );
    }

    async _pImportActorAdditionalFeats(ent, importOpts, dataBuilderOpts) {
        if (!ent.feats)
            return;

        const formData = await Charactermancer_AdditionalFeatsSelect.pGetUserInput({
            available: ent.feats,
            actor: this._actor
        });
        if (!formData)
            return dataBuilderOpts.isCancelled = true;
        if (formData === VeCt.SYM_UI_SKIP)
            return;

        if (!(formData.data || []).length)
            return;

        const {ImportListFeat} = await Promise.resolve().then(function() {
            return ImportListFeat$1;
        });
        const importListFeat = new ImportListFeat({
            actor: this._actor
        });
        await importListFeat.pInit();

        for (const {page, source, hash} of (formData.data || [])) {
            const feat = await DataLoader.pCacheAndGet(page, source, hash);
            await importListFeat.pImportEntry(feat, importOpts);
        }
    }

    static async _pPostLoad_pGetAllOptionalFeatures() {
        return {
            optionalfeature: [...(await DataUtil.loadJSON(Vetools.DATA_URL_OPTIONALFEATURES)).optionalfeature, ...((await PrereleaseUtil.pGetBrewProcessed())?.optionalfeature || []), ...((await BrewUtil2.pGetBrewProcessed())?.optionalfeature || []), ],
        };
    }
}

ImportListCharacter.ImportEntryOpts = class {
    constructor(opts) {
        opts = opts || {};

        this.isCharactermancer = !!opts.isCharactermancer;

        this.isCancelled = false;

        this.items = [];
        this.effects = [];
        this.equipmentItemEntries = [];
    }
}
;
//#endregion


export {ImportList, ImportListCharacter}