import GameStorage from "./gamestorage.js";
import { FolderPathBuilderRow, FolderPathBuilderRowTextOnly } from "./folderpath.js";

function MixinFolderPathBuilder(Cls) {
    class MixedFolderPathBuilder extends Cls {
        _getFullFolderPathSpecKey() {
            throw new Error("Unimplemented!");
        }
        getFolderPathMeta() {
            throw new Error("Unimplemented!");
        }

        constructor(...args) {
            super(...args);
            this._folderPathSpec = [];
            this._defaultFolderPath = [];
            this._mxFolderPathBuilder_textOnlyMode = false;
        }

        get folderPathSpec() {
            return this._folderPathSpec;
        }

        async _pInit_folderPathSpec() {
            this._folderPathSpec = MiscUtil.get((await GameStorage.pGetClient(this._getFullFolderPathSpecKey())), "path");
            if (this._folderPathSpec != null)
                return;

            const folderPathMeta = this.getFolderPathMeta();
            const defaultSpec = (this._defaultFolderPath || []).map(it=>(this._mxFolderPathBuilder_textOnlyMode ? FolderPathBuilderRowTextOnly : FolderPathBuilderRow).getStateFromDefault_(it, {
                folderPathMeta
            }));
            await this.pSetFolderPathSpec(defaultSpec);
        }

        async pSetFolderPathSpec(folderPathSpec) {
            this._folderPathSpec = folderPathSpec;
            return GameStorage.pSetClient(this._getFullFolderPathSpecKey(), {
                path: this._folderPathSpec
            });
        }

        async pHandleEditFolderPathClick() {
            await this._pInit_folderPathSpec();
            const builderApp = new FolderPathBuilderApp({
                fpApp: this,
                folderType: this.constructor.FOLDER_TYPE
            });
            builderApp.render(true);
        }

        async _pGetCreateFoldersGetIdFromObject({folderType, obj, sorting="a", defaultOwnership=null, userOwnership=null, isFoldersOnly=false, isRender=true}) {
            if (!this._folderPathSpec.length || !folderType)
                return new FolderIdMeta();

            const pathStrings = this._getFolderPathStrings({
                obj
            });

            return UtilFolderPathBuilder.pGetCreateFolderIdMeta({
                folderType,
                folderNames: pathStrings,
                sorting,
                defaultOwnership,
                userOwnership,
                isFoldersOnly,
                isRender,
            });
        }

        _getFolderPathStrings({obj}) {
            return FolderPathBuilder.getFolderPathStrings({
                obj,
                folderPathSpec: this._folderPathSpec,
                folderPathMeta: this.getFolderPathMeta()
            });
        }
    }
    return MixedFolderPathBuilder;
}

function MixinHidableApplication(Cls) {
    class MixedHidableApplication extends Cls {
        constructor(...args) {
            super(...args);

            this._isClosable = true;
            this._isHidden = false;
            this._isRendered = false;
        }

        set isClosable(val) {
            this._isClosable = !!val;
        }

        get isEscapeable() {
            if (this._isClosable)
                return true;
            else
                return !this._isHidden;
        }

        async _close_isAlwaysHardClose() {
            return false;
        }

        async _close_doHardCloseTeardown() {}

        async close(...args) {
            if (this._isClosable || await this._close_isAlwaysHardClose()) {
                await this._close_doHardCloseTeardown();
                this._isRendered = false;
                return super.close(...args);
            }

            this._doSoftClose();
        }

        _doSoftClose() {
            this._isHidden = true;
            this.element.hideVe();
        }

        async _pDoHardClose() {
            this._isClosable = true;
            return this.close();
        }

        async _pPostRenderOrShow() {}

        async _render(...args) {
            if (!this._isHidden && this._isRendered) {
                this._doSoftOpen();
                return;
            }

            if (this._isHidden) {
                this._doSoftOpen();
                await this._pPostRenderOrShow();
                return;
            }

            await super._render(...args);
            await this._pPostRenderOrShow();

            this._isRendered = true;
        }

        _doSoftOpen() {
            this.element.showVe();
            this._isHidden = false;
            this.maximize();
            UtilApplications.bringToFront(this);
        }

        async showAndRender(renderForce, renderOpts) {
            if (this._isHidden) {
                this.element.showVe();
                this._isHidden = false;
            }

            await UtilApplications.pForceRenderApp(this, renderForce, renderOpts);
        }
    }
    return MixedHidableApplication;
}

export {MixinFolderPathBuilder, MixinHidableApplication}