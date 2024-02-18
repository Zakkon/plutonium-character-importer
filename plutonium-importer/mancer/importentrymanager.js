import { UtilEntityGeneric } from "../veTools/utilentity.js";
import { LGT } from "../veTools/utils.js";

class UtilTaskRunnerStatus {
    static getEntityDisplayText({ent, isPlainText=false}={}) {
        const source = SourceUtil.getEntitySource(ent);

        if (isPlainText)
            return `${UtilEntityGeneric.getName(ent)} (${Parser.sourceJsonToAbv(source)})`;

        const sourceStyle = PrereleaseUtil.sourceJsonToStylePart(source) || BrewUtil2.sourceJsonToStylePart(source);
        return `<i>${UtilEntityGeneric.getName(ent)} (<span class="${Parser.sourceJsonToColor(source)}" ${sourceStyle ? `style="${sourceStyle}"` : ""}>${Parser.sourceJsonToAbv(source)}</span>)</i>`;
    }

    static getMessageMeta({ent, importSummary, }, ) {
        const taskRunnerName = this.getEntityDisplayText({
            ent
        });

        switch (importSummary.status || ConstsTaskRunner.TASK_EXIT_COMPLETE) {
        case ConstsTaskRunner.TASK_EXIT_CANCELLED:
            return {
                message: `Import of ${taskRunnerName} was cancelled.`
            };
        case ConstsTaskRunner.TASK_EXIT_SKIPPED_DUPLICATE:
            return {
                message: `Import of ${taskRunnerName} was skipped (duplicate found).`
            };
        case ConstsTaskRunner.TASK_EXIT_COMPLETE_UPDATE_OVERWRITE:
            return {
                message: `Imported ${taskRunnerName}, overwriting existing.`
            };
        case ConstsTaskRunner.TASK_EXIT_COMPLETE_UPDATE_OVERWRITE_DUPLICATE:
            return {
                message: `Imported ${taskRunnerName}, overwriting existing (duplicate found).`
            };
        case ConstsTaskRunner.TASK_EXIT_FAILED:
            return {
                message: `Failed to import ${taskRunnerName}! ${VeCt.STR_SEE_CONSOLE}`,
                isError: true
            };

        case ConstsTaskRunner.TASK_EXIT_COMPLETE:
        default:
            return {
                message: `Imported ${taskRunnerName}.`
            };
        }
    }
}

class ImportEntryManager {
    constructor({instance, ent, importOpts, dataOpts}) {
        this._instance = instance;
        this._ent = ent;
        this._importOpts = importOpts;
        this._dataOpts = dataOpts;

        this._taskRunner = importOpts?.taskRunner;
    }

    async pImportEntry() {
        const taskRunnerLineMeta = this._pImportEntry_doUpdateTaskRunner_preImport();

        try {
            const importSummary = await this._pImportEntry_pDoImport();
            this._pImportEntry_doUpdateTaskRunner_postImport_success({
                importSummary,
                taskRunnerLineMeta
            });
            UtilHooks.callAll(UtilHooks.HK_IMPORT_COMPLETE, importSummary);
            return importSummary;
        } catch (e) {
            this._pImportEntry_doUpdateTaskRunner_postImport_failure({
                taskRunnerLineMeta,
                e
            });
            return ImportSummary.failed({
                entity: this._ent
            });
        }
    }

    async _pImportEntry_pDoImport() {
        return this._instance._pImportEntry(this._ent, this._importOpts, this._dataOpts);
    }

    _pImportEntry_getTaskRunnerEntityName({isPlainText=false}={}) {
        return UtilTaskRunnerStatus.getEntityDisplayText({
            ent: this._ent,
            isPlainText
        });
    }

    _pImportEntry_doUpdateTaskRunner_preImport() {
        if (!this._taskRunner)
            return null;

        const out = this._taskRunner.addLogLine(`Importing ${this._pImportEntry_getTaskRunnerEntityName()}...`);
        this._taskRunner.pushDepth();
        return out;
    }

    _pImportEntry_doUpdateTaskRunner_postImport_success({importSummary, taskRunnerLineMeta}) {
        if (!this._taskRunner)
            return;

        this._taskRunner.popDepth();
        const {message, isError} = UtilTaskRunnerStatus.getMessageMeta({
            ent: this._ent,
            importSummary
        });
        this._taskRunner.addLogLine(message, {
            isError,
            linkedLogLineMeta: taskRunnerLineMeta
        });
    }

    _pImportEntry_doUpdateTaskRunner_postImport_failure({taskRunnerLineMeta, e}) {
        console.error(...LGT, `Task "${this._pImportEntry_getTaskRunnerEntityName({
            isPlainText: true
        })}" failed!`, e);

        if (!this._taskRunner)
            return;

        this._taskRunner.popDepth();
        this._taskRunner.addLogLine(`Failed to import ${this._pImportEntry_getTaskRunnerEntityName()}! ${VeCt.STR_SEE_CONSOLE}`, {
            isError: true,
            linkedLogLineMeta: taskRunnerLineMeta
        });
    }
}
class ImportEntryManagerClass extends ImportEntryManager {
    async _pImportEntry_pDoImport() {
        return this._instance._pImportClass(this._ent, this._importOpts, this._dataOpts);
    }
}
export {ImportEntryManagerClass}