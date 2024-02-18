class UtilApplications {
    static async $pGetAddAppLoadingOverlay($appHtml) {
        if (!$appHtml)
            return null;
        $appHtml.css("position", "relative");
        const $out = $(`<div class="veapp-loading__wrp-outer"><i>Loading...</i></div>`).focus().appendTo($appHtml);
        await MiscUtil.pDelay(5);
        return $out;
    }

    static pGetConfirmation(opts) {
        opts = opts || {};

        return new Promise(resolve=>{
            new Dialog({
                title: opts.title,
                content: opts.content,
                buttons: {
                    yes: {
                        icon: `<i class="fas fa-fw ${opts.faIcon}"></i>`,
                        label: opts.confirmText,
                        callback: ()=>resolve(true),
                    },
                    no: {
                        icon: `<i class="fas fa-fw fa-times"></i>`,
                        label: opts.dismissText || "Cancel",
                        callback: ()=>resolve(false),
                    },
                },
                default: "yes",
            }).render(true);
        }
        );
    }

    static getCleanEntityName(name) {
        return name || " ";
    }

    static getFolderList(folderType) {
        const sortFolders = (a,b)=>SortUtil.ascSort(a.sort, b.sort);

        const raw = CONFIG.Folder.collection.instance.contents.filter(it=>it.type === folderType).sort(sortFolders);
        if (!raw.length)
            return raw;

        const maxDepth = Math.max(...raw.map(it=>it.depth));

        const out = raw.filter(it=>it.depth === 1);
        if (out.length === raw.length)
            return out;

        for (let i = 2; i < maxDepth + 1; ++i) {
            const atDepth = raw.filter(it=>it.depth === i).sort(sortFolders).reverse();
            atDepth.forEach(it=>{
                const ixParent = out.findIndex(parent=>parent.id === it.folder?.id);
                if (~ixParent)
                    out.splice(ixParent + 1, 0, it);
            }
            );
        }

        return out;
    }

    static bringToFront(app) {
        if (!app._element)
            return;

        if (typeof _maxZ === "undefined")
            window._maxZ = 100;

        if (Object.keys(ui.windows).length === 0)
            _maxZ = 100;
        app._element.css({
            zIndex: Math.min(++_maxZ, Consts.Z_INDEX_MAX_FOUNDRY)
        });
    }

    static setApplicationTitle(app, title) {
        app.options.title = title;
        UtilApplications.$getAppElement(app).find(`.window-title`).text(app.title);
    }

    static getDataName(data) {
        return data?.actor?.name || data?.document?.name;
    }

    static getAppName(app) {
        return app.actor?.name || app.document?.name;
    }

    static async pGetImportCompApplicationFormData(opts) {
        let resolve, reject;
        const promise = new Promise((resolve_,reject_)=>{
            resolve = resolve_;
            reject = reject_;
        }
        );

        const ptrPRender = {
            _: null
        };

        const app = new class TempApplication extends Application {
            constructor() {
                super({
                    title: opts.comp.modalTitle,
                    template: `${SharedConsts.MODULE_LOCATION}/template/_Generic.hbs`,
                    width: opts.width != null ? opts.width : 480,
                    height: opts.height != null ? opts.height : 640,
                    resizable: true,
                });
            }

            async close(...args) {
                await super.close(...args);
                resolve(null);
            }

            activateListeners(html) {
                const $btnOk = $(`<button class="btn btn-primary mr-2">OK</button>`).click(async()=>{
                    const formData = await opts.comp.pGetFormData();

                    if (opts.fnGetInvalidMeta) {
                        const invalidMeta = opts.fnGetInvalidMeta(formData);
                        if (invalidMeta)
                            return ui.notifications[invalidMeta.type](invalidMeta.message);
                    }

                    resolve(formData);
                    return this.close();
                }
                );
                const $btnCancel = $(`<button class="btn btn-default">Cancel</button>`).click(()=>{
                    resolve(null);
                    return this.close();
                }
                );
                const $btnSkip = opts.isUnskippable ? null : $(`<button class="btn btn-default ml-3">Skip</button>`).click(()=>{
                    resolve(VeCt.SYM_UI_SKIP);
                    return this.close();
                }
                );

                if (opts.comp.pRender)
                    ptrPRender._ = opts.comp.pRender(html);
                else
                    opts.comp.render(html);
                $$`<div class="ve-flex-v-center ve-flex-h-right no-shrink pb-1 pt-1 px-1 mt-auto mr-3">${$btnOk}${$btnCancel}${$btnSkip}</div>`.appendTo(html);
            }
        }
        ();

        opts.comp.app = app;
        await app.render(true);

        if (opts.isAutoResize)
            this.autoResizeApplication(app, {
                ptrPRender
            });

        return promise;
    }

    static async pGetShowApplicationModal({title, cbClose,
    isWidth100, isHeight100,
    isMaxWidth640p, isMinHeight0,
    isIndestructible, isClosed, }, ) {
        let hasClosed = false;

        let resolveModal;
        const pResolveModal = new Promise(resolve=>{
            resolveModal = resolve;
        }
        );

        const app = new class TempApplication extends MixinHidableApplication(Application) {
            constructor() {
                super({
                    title: title || " ",
                    template: `${SharedConsts.MODULE_LOCATION}/template/_Generic.hbs`,
                    width: isWidth100 ? Util.getMaxWindowWidth(1170) : isMaxWidth640p ? 640 : 480,
                    height: isHeight100 ? Util.getMaxWindowHeight() : isMinHeight0 ? 100 : 640,
                    resizable: true,
                });
            }

            async _closeNoSubmit() {
                return super.close();
            }

            async close(...args) {
                await pHandleCloseClick(false);
                return super.close(...args);
            }

            async activateListeners(...args) {
                super.activateListeners(...args);
                out.$modal = out.$modalInner = this.element.find(`.ve-window`);
                hasClosed = false;
            }
        }
        ();

        if (isIndestructible)
            app.isClosable = false;

        const pHandleCloseClick = async(isDataEntered,...args)=>{
            if (!isIndestructible && hasClosed)
                return;

            hasClosed = true;

            if (cbClose)
                await cbClose(isDataEntered, ...args);
            if (!isIndestructible)
                resolveModal([isDataEntered, ...args]);

            await app._closeNoSubmit();
        }
        ;

        const out = {
            $modal: null,
            $modalInner: null,
            doClose: pHandleCloseClick,
            doAutoResize: ()=>this.autoResizeApplicationExisting(app),
            pGetResolved: ()=>pResolveModal,
            doOpen: ()=>app._render(true),
            doTeardown: ()=>app._pDoHardClose(),
        };

        await app._render(true);
        if (isClosed)
            app._doSoftClose();

        return out;
    }

    /**
	 * 
	 * Resize an app based on the content that is currently visible inside it.
	 * @param app The app to resize.
	 * @param ptrPRender Pointer to a promise which will resolve when the app is rendered.
	 */
    static autoResizeApplication(app, {ptrPRender}={}) {
        Hooks.once("renderApplication", async _app=>{
            if (_app !== app)
                return;
            if (ptrPRender?._)
                await ptrPRender._;

            this.autoResizeApplicationExisting(app);
        }
        );
    }

    static autoResizeApplicationExisting(app) {
        const centerPrev = app.position.top + app.position.height / 2;

        const pos = app.setPosition({
            width: app.position.width,
            height: "auto",
        });

        const center = pos.top + pos.height / 2;
        app.setPosition({
            width: app.position.width,
            height: app.position.height,
            top: app.position.top + (centerPrev - center),
        });
    }

    static _FORCE_RENDER_APP_TIME_LIMIT_MS = 7_500;

    static async pForceRenderApp(app, renderForce=true, renderOpts) {
        let resolve;
        let isResolved = false;
        const p = new Promise((resolve_)=>{
            resolve = resolve_;
        }
        );

        Hooks.once(`render${app.constructor.name}`, async(_app,$html,data)=>{
            if (_app !== app)
                return;
            resolve({
                app,
                $html,
                data
            });
            isResolved = true;
        }
        );

        app.render(renderForce, renderOpts);

        return Promise.race([p, MiscUtil.pDelay(this._FORCE_RENDER_APP_TIME_LIMIT_MS).then(()=>{
            if (!isResolved)
                console.warn(...LGT, `Failed to render "${app?.constructor?.name}" app in ${this._FORCE_RENDER_APP_TIME_LIMIT_MS}ms!`);
        }
        ), ]);
    }

    static isClosed(app) {
        return app._state < Application.RENDER_STATES.NONE;
    }

    /**
	 * 
	 * Auto-convert non-jQuery app elements, as some modules use bare DOM elements.
	 * @param app
	 */
    static $getAppElement(app) {
        if (!app?.element)
            return null;
        if (app.element instanceof jQuery)
            return app.element;
        return $(app.element);
    }

    static pAwaitAppClose(app) {
        return new Promise(resolve=>{
            const fnOnClose = (closedApp)=>{
                if (app.appId !== closedApp.appId)
                    return;
                Hooks.off("closeApplication", fnOnClose);
                resolve(closedApp);
            }
            ;
            Hooks.on("closeApplication", fnOnClose);
        }
        );
    }

    static getOpenAppsSortedByZindex({isFilterInvalid=false}={}) {
        return Object.entries(ui.windows).map(([appId,app])=>{
            const zIndex = Number((((UtilApplications.$getAppElement(app)[0] || {}).style || {})["z-index"] || -1));

            if (isNaN(zIndex) || !~zIndex) {
                if (Util.isDebug())
                    console.warn(`Could not determine z-index for app ${appId}`);
                if (isFilterInvalid)
                    return null;
            }

            return {
                appId,
                app,
                zIndex: isNaN(zIndex) ? -1 : zIndex,
            };
        }
        ).filter(Boolean).sort((a,b)=>SortUtil.ascSort(a.zIndex, b.zIndex)).map(({app})=>app);
    }
}

export default UtilApplications;