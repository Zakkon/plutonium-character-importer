globalThis.DataUtil = {
    _loading: {},
    _loaded: {},
    _merging: {},
    _merged: {},

    async _pLoad({url, id, isBustCache=false}) {
        if (DataUtil._loading[id] && !isBustCache) {
            await DataUtil._loading[id];
            return DataUtil._loaded[id];
        }

        DataUtil._loading[id] = new Promise((resolve,reject)=>{
            const request = new XMLHttpRequest();

            request.open("GET", url, true);
            request.overrideMimeType("application/json");

            request.onload = function() {
                try {
                    DataUtil._loaded[id] = JSON.parse(this.response);
                    resolve();
                } catch (e) {
                    reject(new Error(`Could not parse JSON from ${url}: ${e.message}`));
                }
            }
            ;
            request.onerror = (e)=>{
                const ptDetail = ["status", "statusText", "readyState", "response", "responseType", ].map(prop=>`${prop}=${JSON.stringify(e.target[prop])}`).join(" ");
                reject(new Error(`Error during JSON request: ${ptDetail}`));
            }
            ;

            request.send();
        }
        );

        await DataUtil._loading[id];
        return DataUtil._loaded[id];
    },

    _mutAddProps(data) {
        if (data && typeof data === "object") {
            for (const k in data) {
                if (data[k]instanceof Array) {
                    for (const it of data[k]) {
                        if (typeof it !== "object")
                            continue;
                        it.__prop = k;
                    }
                }
            }
        }
    },

    async loadJSON(url) {
        return DataUtil._loadJson(url, {
            isDoDataMerge: true
        });
    },

    async loadRawJSON(url, {isBustCache}={}) {
        return DataUtil._loadJson(url, {
            isBustCache
        });
    },

    async _loadJson(url, {isDoDataMerge=false, isBustCache=false}={}) {
        const procUrl = UrlUtil.link(url, {
            isBustCache
        });

        let data;
        try {
            data = await DataUtil._pLoad({
                url: procUrl,
                id: url,
                isBustCache
            });
        } catch (e) {
            setTimeout(()=>{
                throw e;
            }
            );
        }

        if (!data)
            data = await DataUtil._pLoad({
                url: url,
                id: url,
                isBustCache
            });

        if (isDoDataMerge)
            await DataUtil.pDoMetaMerge(url, data);

        return data;
    },

    async pDoMetaMerge(ident, data, options) {
        DataUtil._mutAddProps(data);
        DataUtil._merging[ident] = DataUtil._merging[ident] || DataUtil._pDoMetaMerge(ident, data, options);
        await DataUtil._merging[ident];
        const out = DataUtil._merged[ident];

        if (options?.isSkipMetaMergeCache) {
            delete DataUtil._merging[ident];
            delete DataUtil._merged[ident];
        }

        return out;
    },

    _pDoMetaMerge_handleCopyProp(prop, arr, entry, options) {
        if (!entry._copy)
            return;
        let fnMergeCopy = DataUtil[prop]?.pMergeCopy;
        if (!fnMergeCopy)
            throw new Error(`No dependency _copy merge strategy specified for property "${prop}"`);
        fnMergeCopy = fnMergeCopy.bind(DataUtil[prop]);
        return fnMergeCopy(arr, entry, options);
    },

    async _pDoMetaMerge(ident, data, options) {
        if (data._meta) {
            const loadedSourceIds = new Set();

            if (data._meta.dependencies) {
                await Promise.all(Object.entries(data._meta.dependencies).map(async([dataProp,sourceIds])=>{
                    sourceIds.forEach(sourceId=>loadedSourceIds.add(sourceId));

                    if (!data[dataProp])
                        return;
                    const isHasInternalCopies = (data._meta.internalCopies || []).includes(dataProp);

                    const dependencyData = await Promise.all(sourceIds.map(sourceId=>DataUtil.pLoadByMeta(dataProp, sourceId)));

                    const flatDependencyData = dependencyData.map(dd=>dd[dataProp]).flat().filter(Boolean);
                    await Promise.all(data[dataProp].map(entry=>DataUtil._pDoMetaMerge_handleCopyProp(dataProp, flatDependencyData, entry, {
                        ...options,
                        isErrorOnMissing: !isHasInternalCopies
                    })));
                }
                ));
                delete data._meta.dependencies;
            }

            if (data._meta.internalCopies) {
                for (const prop of data._meta.internalCopies) {
                    if (!data[prop])
                        continue;
                    for (const entry of data[prop]) {
                        await DataUtil._pDoMetaMerge_handleCopyProp(prop, data[prop], entry, {
                            ...options,
                            isErrorOnMissing: true
                        });
                    }
                }
                delete data._meta.internalCopies;
            }

            if (data._meta.includes) {
                const includesData = await Promise.all(Object.entries(data._meta.includes).map(async([dataProp,sourceIds])=>{
                    sourceIds = sourceIds.filter(it=>!loadedSourceIds.has(it));

                    sourceIds.forEach(sourceId=>loadedSourceIds.add(sourceId));

                    const includesData = await Promise.all(sourceIds.map(sourceId=>DataUtil.pLoadByMeta(dataProp, sourceId)));

                    const flatIncludesData = includesData.map(dd=>dd[dataProp]).flat().filter(Boolean);
                    return {
                        dataProp,
                        flatIncludesData
                    };
                }
                ));
                delete data._meta.includes;

                includesData.forEach(({dataProp, flatIncludesData})=>{
                    data[dataProp] = [...data[dataProp] || [], ...flatIncludesData];
                }
                );
            }
        }

        if (data._meta && data._meta.otherSources) {
            await Promise.all(Object.entries(data._meta.otherSources).map(async([dataProp,sourceIds])=>{
                const additionalData = await Promise.all(Object.entries(sourceIds).map(async([sourceId,findWith])=>({
                    findWith,
                    dataOther: await DataUtil.pLoadByMeta(dataProp, sourceId),
                })));

                additionalData.forEach(({findWith, dataOther})=>{
                    const toAppend = dataOther[dataProp].filter(it=>it.otherSources && it.otherSources.find(os=>os.source === findWith));
                    if (toAppend.length)
                        data[dataProp] = (data[dataProp] || []).concat(toAppend);
                }
                );
            }
            ));
            delete data._meta.otherSources;
        }

        if (data._meta && !Object.keys(data._meta).length)
            delete data._meta;

        DataUtil._merged[ident] = data;
    },

    async pDoMetaMergeSingle(prop, meta, ent) {
        return (await DataUtil.pDoMetaMerge(CryptUtil.uid(), {
            _meta: meta,
            [prop]: [ent],
        }, {
            isSkipMetaMergeCache: true,
        }, ))[prop][0];
    },

    getCleanFilename(filename) {
        return filename.replace(/[^-_a-zA-Z0-9]/g, "_");
    },

    getCsv(headers, rows) {
        function escapeCsv(str) {
            return `"${str.replace(/"/g, `""`).replace(/ +/g, " ").replace(/\n\n+/gi, "\n\n")}"`;
        }

        function toCsv(row) {
            return row.map(str=>escapeCsv(str)).join(",");
        }

        return `${toCsv(headers)}\n${rows.map(r=>toCsv(r)).join("\n")}`;
    },

    userDownload(filename, data, {fileType=null, isSkipAdditionalMetadata=false, propVersion="siteVersion", valVersion=VERSION_NUMBER}={}) {
        filename = `${filename}.json`;
        if (isSkipAdditionalMetadata || data instanceof Array)
            return DataUtil._userDownload(filename, JSON.stringify(data, null, "\t"), "text/json");

        data = {
            [propVersion]: valVersion,
            ...data
        };
        if (fileType != null)
            data = {
                fileType,
                ...data
            };
        return DataUtil._userDownload(filename, JSON.stringify(data, null, "\t"), "text/json");
    },

    userDownloadText(filename, string) {
        return DataUtil._userDownload(filename, string, "text/plain");
    },

    _userDownload(filename, data, mimeType) {
        const a = document.createElement("a");
        const t = new Blob([data],{
            type: mimeType
        });
        a.href = window.URL.createObjectURL(t);
        a.download = filename;
        a.dispatchEvent(new MouseEvent("click",{
            bubbles: true,
            cancelable: true,
            view: window
        }));
        setTimeout(()=>window.URL.revokeObjectURL(a.href), 100);
    },

    pUserUpload({isMultiple=false, expectedFileTypes=null, propVersion="siteVersion", }={}, ) {
        return new Promise(resolve=>{
            const $iptAdd = $(`<input type="file" ${isMultiple ? "multiple" : ""} class="ve-hidden" accept=".json">`).on("change", (evt)=>{
                const input = evt.target;

                const reader = new FileReader();
                let readIndex = 0;
                const out = [];
                const errs = [];

                reader.onload = async()=>{
                    const name = input.files[readIndex - 1].name;
                    const text = reader.result;

                    try {
                        const json = JSON.parse(text);

                        const isSkipFile = expectedFileTypes != null && json.fileType && !expectedFileTypes.includes(json.fileType) && !(await InputUiUtil.pGetUserBoolean({
                            textYes: "Yes",
                            textNo: "Cancel",
                            title: "File Type Mismatch",
                            htmlDescription: `The file "${name}" has the type "${json.fileType}" when the expected file type was "${expectedFileTypes.join("/")}".<br>Are you sure you want to upload this file?`,
                        }));

                        if (!isSkipFile) {
                            delete json.fileType;
                            delete json[propVersion];

                            out.push({
                                name,
                                json
                            });
                        }
                    } catch (e) {
                        errs.push({
                            filename: name,
                            message: e.message
                        });
                    }

                    if (input.files[readIndex]) {
                        reader.readAsText(input.files[readIndex++]);
                        return;
                    }

                    resolve({
                        files: out,
                        errors: errs,
                        jsons: out.map(({json})=>json),
                    });
                }
                ;

                reader.readAsText(input.files[readIndex++]);
            }
            ).appendTo(document.body);

            $iptAdd.click();
        }
        );
    },

    doHandleFileLoadErrorsGeneric(errors) {
        if (!errors)
            return;
        errors.forEach(err=>{
            JqueryUtil.doToast({
                content: `Could not load file "${err.filename}": <code>${err.message}</code>. ${VeCt.STR_SEE_CONSOLE}`,
                type: "danger",
            });
        }
        );
    },

    cleanJson(cpy, {isDeleteUniqueId=true}={}) {
        if (!cpy)
            return cpy;
        cpy.name = cpy._displayName || cpy.name;
        if (isDeleteUniqueId)
            delete cpy.uniqueId;
        DataUtil.__cleanJsonObject(cpy);
        return cpy;
    },

    _CLEAN_JSON_ALLOWED_UNDER_KEYS: ["_copy", "_versions", "_version", ],
    __cleanJsonObject(obj) {
        if (obj == null)
            return obj;
        if (typeof obj !== "object")
            return obj;

        if (obj instanceof Array) {
            return obj.forEach(it=>DataUtil.__cleanJsonObject(it));
        }

        Object.entries(obj).forEach(([k,v])=>{
            if (DataUtil._CLEAN_JSON_ALLOWED_UNDER_KEYS.includes(k))
                return;
            if ((k.startsWith("_") && k !== "_") || k === "customHashId")
                delete obj[k];
            else
                DataUtil.__cleanJsonObject(v);
        }
        );
    },

    _MULTI_SOURCE_PROP_TO_DIR: {
        "monster": "bestiary",
        "monsterFluff": "bestiary",
        "spell": "spells",
        "spellFluff": "spells",
        "class": "class",
        "subclass": "class",
        "classFeature": "class",
        "subclassFeature": "class",
    },
    _MULTI_SOURCE_PROP_TO_INDEX_NAME: {
        "class": "index.json",
        "subclass": "index.json",
        "classFeature": "index.json",
        "subclassFeature": "index.json",
    },
    async pLoadByMeta(prop, source) {

        switch (prop) {
        case "monster":
        case "spell":
        case "monsterFluff":
        case "spellFluff":
            {
                const data = await DataUtil[prop].pLoadSingleSource(source);
                if (data)
                    return data;

                return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
            }

        case "class":
        case "subclass":
        case "classFeature":
        case "subclassFeature":
            {
                const baseUrlPart = `${Renderer.get().baseUrl}data/${DataUtil._MULTI_SOURCE_PROP_TO_DIR[prop]}`;
                const index = await DataUtil.loadJSON(`${baseUrlPart}/${DataUtil._MULTI_SOURCE_PROP_TO_INDEX_NAME[prop]}`);
                if (index[source])
                    return DataUtil.loadJSON(`${baseUrlPart}/${index[source]}`);

                return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
            }

        case "item":
        case "itemGroup":
        case "baseitem":
            {
                const data = await DataUtil.item.loadRawJSON();
                if (data[prop] && data[prop].some(it=>it.source === source))
                    return data;
                return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
            }
        case "race":
            {
                const data = await DataUtil.race.loadJSON({
                    isAddBaseRaces: true
                });
                if (data[prop] && data[prop].some(it=>it.source === source))
                    return data;
                return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
            }

        default:
            {
                const impl = DataUtil[prop];
                if (impl && (impl.getDataUrl || impl.loadJSON)) {
                    const data = await (impl.loadJSON ? impl.loadJSON() : DataUtil.loadJSON(impl.getDataUrl()));
                    if (data[prop] && data[prop].some(it=>it.source === source))
                        return data;

                    return DataUtil._pLoadByMeta_pGetPrereleaseBrew(source);
                }

                throw new Error(`Could not get loadable URL for \`${JSON.stringify({
                    key: prop,
                    value: source
                })}\``);
            }
        }
    },

    async _pLoadByMeta_pGetPrereleaseBrew(source) {
        const fromPrerelease = await DataUtil.pLoadPrereleaseBySource(source);
        if (fromPrerelease)
            return fromPrerelease;

        const fromBrew = await DataUtil.pLoadBrewBySource(source);
        if (fromBrew)
            return fromBrew;

        throw new Error(`Could not find prerelease/brew URL for source "${source}"`);
    },

    async pLoadPrereleaseBySource(source) {
        if (typeof PrereleaseUtil === "undefined")
            return null;
        return this._pLoadPrereleaseBrewBySource({
            source,
            brewUtil: PrereleaseUtil
        });
    },

    async pLoadBrewBySource(source) {
        if (typeof BrewUtil2 === "undefined")
            return null;
        return this._pLoadPrereleaseBrewBySource({
            source,
            brewUtil: BrewUtil2
        });
    },

    async _pLoadPrereleaseBrewBySource({source, brewUtil}) {
        const fromExisting = await brewUtil.pGetBrewBySource(source);
        if (fromExisting)
            return MiscUtil.copyFast(fromExisting.body);

        const url = await brewUtil.pGetSourceUrl(source);
        if (!url)
            return null;

        return DataUtil.loadJSON(url);
    },

    dbg: {
        isTrackCopied: false,
    },

    generic: {
        _MERGE_REQUIRES_PRESERVE_BASE: {
            page: true,
            otherSources: true,
            srd: true,
            basicRules: true,
            reprintedAs: true,
            hasFluff: true,
            hasFluffImages: true,
            hasToken: true,
            _versions: true,
        },

        _walker_replaceTxt: null,

        unpackUid(uid, tag, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,source,displayText,...others] = uid.split("|").map(Function.prototype.call.bind(String.prototype.trim));

            source = source || Parser.getTagSource(tag, source);
            if (opts.isLower)
                source = source.toLowerCase();

            return {
                name,
                source,
                displayText,
                others,
            };
        },

        packUid(ent, tag) {
            const sourceDefault = Parser.getTagSource(tag);
            return [ent.name, (ent.source || "").toLowerCase() === sourceDefault.toLowerCase() ? "" : ent.source, ].join("|").replace(/\|+$/, "");
        },

        getNormalizedUid(uid, tag) {
            const {name, source} = DataUtil.generic.unpackUid(uid, tag, {
                isLower: true
            });
            return [name, source].join("|");
        },

        getUid(ent, {isMaintainCase=false}={}) {
            const {name} = ent;
            const source = SourceUtil.getEntitySource(ent);
            if (!name || !source)
                throw new Error(`Entity did not have a name and source!`);
            const out = [name, source].join("|");
            if (isMaintainCase)
                return out;
            return out.toLowerCase();
        },

        async _pMergeCopy(impl, page, entryList, entry, options) {
            if (!entry._copy)
                return;

            const hashCurrent = UrlUtil.URL_TO_HASH_BUILDER[page](entry);
            const hash = UrlUtil.URL_TO_HASH_BUILDER[page](entry._copy);

            if (hashCurrent === hash)
                throw new Error(`${hashCurrent} _copy self-references! This is a bug!`);

            const it = (impl._mergeCache = impl._mergeCache || {})[hash] || DataUtil.generic._pMergeCopy_search(impl, page, entryList, entry, options);

            if (!it) {
                if (options.isErrorOnMissing) {
                    if (!IS_DEPLOYED && !IS_VTT)
                        throw new Error(`Could not find "${page}" entity "${entry._copy.name}" ("${entry._copy.source}") to copy in copier "${entry.name}" ("${entry.source}")`);
                }
                return;
            }

            if (DataUtil.dbg.isTrackCopied)
                it.dbg_isCopied = true;
            if (it._copy)
                await DataUtil.generic._pMergeCopy(impl, page, entryList, it, options);

            const templateData = entry._copy?._trait ? (await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/bestiary/template.json`)) : null;
            return DataUtil.generic.copyApplier.getCopy(impl, MiscUtil.copyFast(it), entry, templateData, options);
        },

        _pMergeCopy_search(impl, page, entryList, entry, options) {
            const entryHash = UrlUtil.URL_TO_HASH_BUILDER[page](entry._copy);
            return entryList.find(it=>{
                const hash = UrlUtil.URL_TO_HASH_BUILDER[page](it);
                impl._mergeCache[hash] = it;
                return hash === entryHash;
            }
            );
        },

        COPY_ENTRY_PROPS: ["action", "bonus", "reaction", "trait", "legendary", "mythic", "variant", "spellcasting", "actionHeader", "bonusHeader", "reactionHeader", "legendaryHeader", "mythicHeader", ],

        copyApplier: class {
            static _normaliseMods(obj) {
                Object.entries(obj._mod).forEach(([k,v])=>{
                    if (!(v instanceof Array))
                        obj._mod[k] = [v];
                }
                );
            }

            static _doEnsureArray({obj, prop}) {
                if (!(obj[prop]instanceof Array))
                    obj[prop] = [obj[prop]];
            }

            static _getRegexFromReplaceModInfo({replace, flags}) {
                return new RegExp(replace,`g${flags || ""}`);
            }

            static _doReplaceStringHandler({re, withStr}, str) {
                const split = Renderer.splitByTags(str);
                const len = split.length;
                for (let i = 0; i < len; ++i) {
                    if (split[i].startsWith("{@"))
                        continue;
                    split[i] = split[i].replace(re, withStr);
                }
                return split.join("");
            }

            static _doMod_appendStr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (copyTo[prop])
                    copyTo[prop] = `${copyTo[prop]}${modInfo.joiner || ""}${modInfo.str}`;
                else
                    copyTo[prop] = modInfo.str;
            }

            static _doMod_replaceName({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (!copyTo[prop])
                    return;

                DataUtil.generic._walker_replaceTxt = DataUtil.generic._walker_replaceTxt || MiscUtil.getWalker();
                const re = this._getRegexFromReplaceModInfo({
                    replace: modInfo.replace,
                    flags: modInfo.flags
                });
                const handlers = {
                    string: this._doReplaceStringHandler.bind(null, {
                        re: re,
                        withStr: modInfo.with
                    })
                };

                copyTo[prop].forEach(it=>{
                    if (it.name)
                        it.name = DataUtil.generic._walker_replaceTxt.walk(it.name, handlers);
                }
                );
            }

            static _doMod_replaceTxt({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (!copyTo[prop])
                    return;

                DataUtil.generic._walker_replaceTxt = DataUtil.generic._walker_replaceTxt || MiscUtil.getWalker();
                const re = this._getRegexFromReplaceModInfo({
                    replace: modInfo.replace,
                    flags: modInfo.flags
                });
                const handlers = {
                    string: this._doReplaceStringHandler.bind(null, {
                        re: re,
                        withStr: modInfo.with
                    })
                };

                const props = modInfo.props || [null, "entries", "headerEntries", "footerEntries"];
                if (!props.length)
                    return;

                if (props.includes(null)) {
                    copyTo[prop] = copyTo[prop].map(it=>{
                        if (typeof it !== "string")
                            return it;
                        return DataUtil.generic._walker_replaceTxt.walk(it, handlers);
                    }
                    );
                }

                copyTo[prop].forEach(it=>{
                    props.forEach(prop=>{
                        if (prop == null)
                            return;
                        if (it[prop])
                            it[prop] = DataUtil.generic._walker_replaceTxt.walk(it[prop], handlers);
                    }
                    );
                }
                );
            }

            static _doMod_prependArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });
                copyTo[prop] = copyTo[prop] ? modInfo.items.concat(copyTo[prop]) : modInfo.items;
            }

            static _doMod_appendArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });
                copyTo[prop] = copyTo[prop] ? copyTo[prop].concat(modInfo.items) : modInfo.items;
            }

            static _doMod_appendIfNotExistsArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });
                if (!copyTo[prop])
                    return copyTo[prop] = modInfo.items;
                copyTo[prop] = copyTo[prop].concat(modInfo.items.filter(it=>!copyTo[prop].some(x=>CollectionUtil.deepEquals(it, x))));
            }

            static _doMod_replaceArr({copyTo, copyFrom, modInfo, msgPtFailed, prop, isThrow=true}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });

                if (!copyTo[prop]) {
                    if (isThrow)
                        throw new Error(`${msgPtFailed} Could not find "${prop}" array`);
                    return false;
                }

                let ixOld;
                if (modInfo.replace.regex) {
                    const re = new RegExp(modInfo.replace.regex,modInfo.replace.flags || "");
                    ixOld = copyTo[prop].findIndex(it=>it.name ? re.test(it.name) : typeof it === "string" ? re.test(it) : false);
                } else if (modInfo.replace.index != null) {
                    ixOld = modInfo.replace.index;
                } else {
                    ixOld = copyTo[prop].findIndex(it=>it.name ? it.name === modInfo.replace : it === modInfo.replace);
                }

                if (~ixOld) {
                    copyTo[prop].splice(ixOld, 1, ...modInfo.items);
                    return true;
                } else if (isThrow)
                    throw new Error(`${msgPtFailed} Could not find "${prop}" item with name "${modInfo.replace}" to replace`);
                return false;
            }

            static _doMod_replaceOrAppendArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                const didReplace = this._doMod_replaceArr({
                    copyTo,
                    copyFrom,
                    modInfo,
                    msgPtFailed,
                    prop,
                    isThrow: false
                });
                if (!didReplace)
                    this._doMod_appendArr({
                        copyTo,
                        copyFrom,
                        modInfo,
                        msgPtFailed,
                        prop
                    });
            }

            static _doMod_insertArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "items"
                });
                if (!copyTo[prop])
                    throw new Error(`${msgPtFailed} Could not find "${prop}" array`);
                copyTo[prop].splice(~modInfo.index ? modInfo.index : copyTo[prop].length, 0, ...modInfo.items);
            }

            static _doMod_removeArr({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (modInfo.names) {
                    this._doEnsureArray({
                        obj: modInfo,
                        prop: "names"
                    });
                    modInfo.names.forEach(nameToRemove=>{
                        const ixOld = copyTo[prop].findIndex(it=>it.name === nameToRemove);
                        if (~ixOld)
                            copyTo[prop].splice(ixOld, 1);
                        else {
                            if (!modInfo.force)
                                throw new Error(`${msgPtFailed} Could not find "${prop}" item with name "${nameToRemove}" to remove`);
                        }
                    }
                    );
                } else if (modInfo.items) {
                    this._doEnsureArray({
                        obj: modInfo,
                        prop: "items"
                    });
                    modInfo.items.forEach(itemToRemove=>{
                        const ixOld = copyTo[prop].findIndex(it=>it === itemToRemove);
                        if (~ixOld)
                            copyTo[prop].splice(ixOld, 1);
                        else
                            throw new Error(`${msgPtFailed} Could not find "${prop}" item "${itemToRemove}" to remove`);
                    }
                    );
                } else
                    throw new Error(`${msgPtFailed} One of "names" or "items" must be provided!`);
            }

            static _doMod_calculateProp({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                copyTo[prop] = copyTo[prop] || {};
                const toExec = modInfo.formula.replace(/<\$([^$]+)\$>/g, (...m)=>{
                    switch (m[1]) {
                    case "prof_bonus":
                        return Parser.crToPb(copyTo.cr);
                    case "dex_mod":
                        return Parser.getAbilityModNumber(copyTo.dex);
                    default:
                        throw new Error(`${msgPtFailed} Unknown variable "${m[1]}"`);
                    }
                }
                );
                copyTo[prop][modInfo.prop] = eval(toExec);
            }

            static _doMod_scalarAddProp({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                const applyTo = (k)=>{
                    const out = Number(copyTo[prop][k]) + modInfo.scalar;
                    const isString = typeof copyTo[prop][k] === "string";
                    copyTo[prop][k] = isString ? `${out >= 0 ? "+" : ""}${out}` : out;
                }
                ;

                if (!copyTo[prop])
                    return;
                if (modInfo.prop === "*")
                    Object.keys(copyTo[prop]).forEach(k=>applyTo(k));
                else
                    applyTo(modInfo.prop);
            }

            static _doMod_scalarMultProp({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                const applyTo = (k)=>{
                    let out = Number(copyTo[prop][k]) * modInfo.scalar;
                    if (modInfo.floor)
                        out = Math.floor(out);
                    const isString = typeof copyTo[prop][k] === "string";
                    copyTo[prop][k] = isString ? `${out >= 0 ? "+" : ""}${out}` : out;
                }
                ;

                if (!copyTo[prop])
                    return;
                if (modInfo.prop === "*")
                    Object.keys(copyTo[prop]).forEach(k=>applyTo(k));
                else
                    applyTo(modInfo.prop);
            }

            static _doMod_addSenses({copyTo, copyFrom, modInfo, msgPtFailed}) {
                this._doEnsureArray({
                    obj: modInfo,
                    prop: "senses"
                });
                copyTo.senses = copyTo.senses || [];
                modInfo.senses.forEach(sense=>{
                    let found = false;
                    for (let i = 0; i < copyTo.senses.length; ++i) {
                        const m = new RegExp(`${sense.type} (\\d+)`,"i").exec(copyTo.senses[i]);
                        if (m) {
                            found = true;
                            if (Number(m[1]) < sense.range) {
                                copyTo.senses[i] = `${sense.type} ${sense.range} ft.`;
                            }
                            break;
                        }
                    }

                    if (!found)
                        copyTo.senses.push(`${sense.type} ${sense.range} ft.`);
                }
                );
            }

            static _doMod_addSaves({copyTo, copyFrom, modInfo, msgPtFailed}) {
                copyTo.save = copyTo.save || {};
                Object.entries(modInfo.saves).forEach(([save,mode])=>{
                    const total = mode * Parser.crToPb(copyTo.cr) + Parser.getAbilityModNumber(copyTo[save]);
                    const asText = total >= 0 ? `+${total}` : total;
                    if (copyTo.save && copyTo.save[save]) {
                        if (Number(copyTo.save[save]) < total)
                            copyTo.save[save] = asText;
                    } else
                        copyTo.save[save] = asText;
                }
                );
            }

            static _doMod_addSkills({copyTo, copyFrom, modInfo, msgPtFailed}) {
                copyTo.skill = copyTo.skill || {};
                Object.entries(modInfo.skills).forEach(([skill,mode])=>{
                    const total = mode * Parser.crToPb(copyTo.cr) + Parser.getAbilityModNumber(copyTo[Parser.skillToAbilityAbv(skill)]);
                    const asText = total >= 0 ? `+${total}` : total;
                    if (copyTo.skill && copyTo.skill[skill]) {
                        if (Number(copyTo.skill[skill]) < total)
                            copyTo.skill[skill] = asText;
                    } else
                        copyTo.skill[skill] = asText;
                }
                );
            }

            static _doMod_addAllSaves({copyTo, copyFrom, modInfo, msgPtFailed}) {
                return this._doMod_addSaves({
                    copyTo,
                    copyFrom,
                    modInfo: {
                        mode: "addSaves",
                        saves: Object.keys(Parser.ATB_ABV_TO_FULL).mergeMap(it=>({
                            [it]: modInfo.saves
                        })),
                    },
                    msgPtFailed,
                });
            }

            static _doMod_addAllSkills({copyTo, copyFrom, modInfo, msgPtFailed}) {
                return this._doMod_addSkills({
                    copyTo,
                    copyFrom,
                    modInfo: {
                        mode: "addSkills",
                        skills: Object.keys(Parser.SKILL_TO_ATB_ABV).mergeMap(it=>({
                            [it]: modInfo.skills
                        })),
                    },
                    msgPtFailed,
                });
            }

            static _doMod_addSpells({copyTo, copyFrom, modInfo, msgPtFailed}) {
                if (!copyTo.spellcasting)
                    throw new Error(`${msgPtFailed} Creature did not have a spellcasting property!`);

                const spellcasting = copyTo.spellcasting[0];

                if (modInfo.spells) {
                    const spells = spellcasting.spells;

                    Object.keys(modInfo.spells).forEach(k=>{
                        if (!spells[k])
                            spells[k] = modInfo.spells[k];
                        else {
                            const spellCategoryNu = modInfo.spells[k];
                            const spellCategoryOld = spells[k];
                            Object.keys(spellCategoryNu).forEach(kk=>{
                                if (!spellCategoryOld[kk])
                                    spellCategoryOld[kk] = spellCategoryNu[kk];
                                else {
                                    if (typeof spellCategoryOld[kk] === "object") {
                                        if (spellCategoryOld[kk]instanceof Array)
                                            spellCategoryOld[kk] = spellCategoryOld[kk].concat(spellCategoryNu[kk]).sort(SortUtil.ascSortLower);
                                        else
                                            throw new Error(`${msgPtFailed} Object at key ${kk} not an array!`);
                                    } else
                                        spellCategoryOld[kk] = spellCategoryNu[kk];
                                }
                            }
                            );
                        }
                    }
                    );
                }

                ["constant", "will", "ritual"].forEach(prop=>{
                    if (!modInfo[prop])
                        return;
                    modInfo[prop].forEach(sp=>(spellcasting[prop] = spellcasting[prop] || []).push(sp));
                }
                );

                ["recharge", "charges", "rest", "daily", "weekly", "yearly"].forEach(prop=>{
                    if (!modInfo[prop])
                        return;

                    for (let i = 1; i <= 9; ++i) {
                        const e = `${i}e`;

                        spellcasting[prop] = spellcasting[prop] || {};

                        if (modInfo[prop][i]) {
                            modInfo[prop][i].forEach(sp=>(spellcasting[prop][i] = spellcasting[prop][i] || []).push(sp));
                        }

                        if (modInfo[prop][e]) {
                            modInfo[prop][e].forEach(sp=>(spellcasting[prop][e] = spellcasting[prop][e] || []).push(sp));
                        }
                    }
                }
                );
            }

            static _doMod_replaceSpells({copyTo, copyFrom, modInfo, msgPtFailed}) {
                if (!copyTo.spellcasting)
                    throw new Error(`${msgPtFailed} Creature did not have a spellcasting property!`);

                const spellcasting = copyTo.spellcasting[0];

                const handleReplace = (curSpells,replaceMeta,k)=>{
                    this._doEnsureArray({
                        obj: replaceMeta,
                        prop: "with"
                    });

                    const ix = curSpells[k].indexOf(replaceMeta.replace);
                    if (~ix) {
                        curSpells[k].splice(ix, 1, ...replaceMeta.with);
                        curSpells[k].sort(SortUtil.ascSortLower);
                    } else
                        throw new Error(`${msgPtFailed} Could not find spell "${replaceMeta.replace}" to replace`);
                }
                ;

                if (modInfo.spells) {
                    const trait0 = spellcasting.spells;
                    Object.keys(modInfo.spells).forEach(k=>{
                        if (trait0[k]) {
                            const replaceMetas = modInfo.spells[k];
                            const curSpells = trait0[k];
                            replaceMetas.forEach(replaceMeta=>handleReplace(curSpells, replaceMeta, "spells"));
                        }
                    }
                    );
                }

                if (modInfo.daily) {
                    for (let i = 1; i <= 9; ++i) {
                        const e = `${i}e`;

                        if (modInfo.daily[i]) {
                            modInfo.daily[i].forEach(replaceMeta=>handleReplace(spellcasting.daily, replaceMeta, i));
                        }

                        if (modInfo.daily[e]) {
                            modInfo.daily[e].forEach(replaceMeta=>handleReplace(spellcasting.daily, replaceMeta, e));
                        }
                    }
                }
            }

            static _doMod_removeSpells({copyTo, copyFrom, modInfo, msgPtFailed}) {
                if (!copyTo.spellcasting)
                    throw new Error(`${msgPtFailed} Creature did not have a spellcasting property!`);

                const spellcasting = copyTo.spellcasting[0];

                if (modInfo.spells) {
                    const spells = spellcasting.spells;

                    Object.keys(modInfo.spells).forEach(k=>{
                        if (!spells[k]?.spells)
                            return;

                        spells[k].spells = spells[k].spells.filter(it=>!modInfo.spells[k].includes(it));
                    }
                    );
                }

                ["constant", "will", "ritual"].forEach(prop=>{
                    if (!modInfo[prop])
                        return;
                    spellcasting[prop].filter(it=>!modInfo[prop].includes(it));
                }
                );

                ["recharge", "charges", "rest", "daily", "weekly", "yearly"].forEach(prop=>{
                    if (!modInfo[prop])
                        return;

                    for (let i = 1; i <= 9; ++i) {
                        const e = `${i}e`;

                        spellcasting[prop] = spellcasting[prop] || {};

                        if (modInfo[prop][i]) {
                            spellcasting[prop][i] = spellcasting[prop][i].filter(it=>!modInfo[prop][i].includes(it));
                        }

                        if (modInfo[prop][e]) {
                            spellcasting[prop][e] = spellcasting[prop][e].filter(it=>!modInfo[prop][e].includes(it));
                        }
                    }
                }
                );
            }

            static _doMod_scalarAddHit({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (!copyTo[prop])
                    return;
                copyTo[prop] = JSON.parse(JSON.stringify(copyTo[prop]).replace(/{@hit ([-+]?\d+)}/g, (m0,m1)=>`{@hit ${Number(m1) + modInfo.scalar}}`));
            }

            static _doMod_scalarAddDc({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                if (!copyTo[prop])
                    return;
                copyTo[prop] = JSON.parse(JSON.stringify(copyTo[prop]).replace(/{@dc (\d+)(?:\|[^}]+)?}/g, (m0,m1)=>`{@dc ${Number(m1) + modInfo.scalar}}`));
            }

            static _doMod_maxSize({copyTo, copyFrom, modInfo, msgPtFailed}) {
                const sizes = [...copyTo.size].sort(SortUtil.ascSortSize);

                const ixsCur = sizes.map(it=>Parser.SIZE_ABVS.indexOf(it));
                const ixMax = Parser.SIZE_ABVS.indexOf(modInfo.max);

                if (!~ixMax || ixsCur.some(ix=>!~ix))
                    throw new Error(`${msgPtFailed} Unhandled size!`);

                const ixsNxt = ixsCur.filter(ix=>ix <= ixMax);
                if (!ixsNxt.length)
                    ixsNxt.push(ixMax);

                copyTo.size = ixsNxt.map(ix=>Parser.SIZE_ABVS[ix]);
            }

            static _doMod_scalarMultXp({copyTo, copyFrom, modInfo, msgPtFailed}) {
                const getOutput = (input)=>{
                    let out = input * modInfo.scalar;
                    if (modInfo.floor)
                        out = Math.floor(out);
                    return out;
                }
                ;

                if (copyTo.cr.xp)
                    copyTo.cr.xp = getOutput(copyTo.cr.xp);
                else {
                    const curXp = Parser.crToXpNumber(copyTo.cr);
                    if (!copyTo.cr.cr)
                        copyTo.cr = {
                            cr: copyTo.cr
                        };
                    copyTo.cr.xp = getOutput(curXp);
                }
            }

            static _doMod_setProp({copyTo, copyFrom, modInfo, msgPtFailed, prop}) {
                const propPath = modInfo.prop.split(".");
                if (prop !== "*")
                    propPath.unshift(prop);
                MiscUtil.set(copyTo, ...propPath, MiscUtil.copyFast(modInfo.value));
            }

            static _doMod_handleProp({copyTo, copyFrom, modInfos, msgPtFailed, prop=null}) {
                modInfos.forEach(modInfo=>{
                    if (typeof modInfo === "string") {
                        switch (modInfo) {
                        case "remove":
                            return delete copyTo[prop];
                        default:
                            throw new Error(`${msgPtFailed} Unhandled mode: ${modInfo}`);
                        }
                    } else {
                        switch (modInfo.mode) {
                        case "appendStr":
                            return this._doMod_appendStr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "replaceName":
                            return this._doMod_replaceName({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "replaceTxt":
                            return this._doMod_replaceTxt({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "prependArr":
                            return this._doMod_prependArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "appendArr":
                            return this._doMod_appendArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "replaceArr":
                            return this._doMod_replaceArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "replaceOrAppendArr":
                            return this._doMod_replaceOrAppendArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "appendIfNotExistsArr":
                            return this._doMod_appendIfNotExistsArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "insertArr":
                            return this._doMod_insertArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "removeArr":
                            return this._doMod_removeArr({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "calculateProp":
                            return this._doMod_calculateProp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "scalarAddProp":
                            return this._doMod_scalarAddProp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "scalarMultProp":
                            return this._doMod_scalarMultProp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "setProp":
                            return this._doMod_setProp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "addSenses":
                            return this._doMod_addSenses({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addSaves":
                            return this._doMod_addSaves({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addSkills":
                            return this._doMod_addSkills({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addAllSaves":
                            return this._doMod_addAllSaves({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addAllSkills":
                            return this._doMod_addAllSkills({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "addSpells":
                            return this._doMod_addSpells({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "replaceSpells":
                            return this._doMod_replaceSpells({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "removeSpells":
                            return this._doMod_removeSpells({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "maxSize":
                            return this._doMod_maxSize({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "scalarMultXp":
                            return this._doMod_scalarMultXp({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed
                            });
                        case "scalarAddHit":
                            return this._doMod_scalarAddHit({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        case "scalarAddDc":
                            return this._doMod_scalarAddDc({
                                copyTo,
                                copyFrom,
                                modInfo,
                                msgPtFailed,
                                prop
                            });
                        default:
                            throw new Error(`${msgPtFailed} Unhandled mode: ${modInfo.mode}`);
                        }
                    }
                }
                );
            }

            static _doMod({copyTo, copyFrom, modInfos, msgPtFailed, props=null, isExternalApplicationIdentityOnly}) {
                if (isExternalApplicationIdentityOnly)
                    return;

                if (props?.length)
                    props.forEach(prop=>this._doMod_handleProp({
                        copyTo,
                        copyFrom,
                        modInfos,
                        msgPtFailed,
                        prop
                    }));
                else
                    this._doMod_handleProp({
                        copyTo,
                        copyFrom,
                        modInfos,
                        msgPtFailed
                    });
            }

            static getCopy(impl, copyFrom, copyTo, templateData, {isExternalApplicationKeepCopy=false, isExternalApplicationIdentityOnly=false}={}) {
                if (isExternalApplicationKeepCopy)
                    copyTo.__copy = MiscUtil.copyFast(copyFrom);

                const msgPtFailed = `Failed to apply _copy to "${copyTo.name}" ("${copyTo.source}").`;

                const copyMeta = copyTo._copy || {};

                if (copyMeta._mod)
                    this._normaliseMods(copyMeta);

                let template = null;
                if (copyMeta._trait) {
                    template = templateData.monsterTemplate.find(t=>t.name.toLowerCase() === copyMeta._trait.name.toLowerCase() && t.source.toLowerCase() === copyMeta._trait.source.toLowerCase());
                    if (!template)
                        throw new Error(`${msgPtFailed} Could not find traits to apply with name "${copyMeta._trait.name}" and source "${copyMeta._trait.source}"`);
                    template = MiscUtil.copyFast(template);

                    if (template.apply._mod) {
                        this._normaliseMods(template.apply);

                        if (copyMeta._mod) {
                            Object.entries(template.apply._mod).forEach(([k,v])=>{
                                if (copyMeta._mod[k])
                                    copyMeta._mod[k] = copyMeta._mod[k].concat(v);
                                else
                                    copyMeta._mod[k] = v;
                            }
                            );
                        } else
                            copyMeta._mod = template.apply._mod;
                    }

                    delete copyMeta._trait;
                }

                const copyToRootProps = new Set(Object.keys(copyTo));

                Object.keys(copyFrom).forEach(k=>{
                    if (copyTo[k] === null)
                        return delete copyTo[k];
                    if (copyTo[k] == null) {
                        if (DataUtil.generic._MERGE_REQUIRES_PRESERVE_BASE[k] || impl?._MERGE_REQUIRES_PRESERVE[k]) {
                            if (copyTo._copy._preserve?.["*"] || copyTo._copy._preserve?.[k])
                                copyTo[k] = copyFrom[k];
                        } else
                            copyTo[k] = copyFrom[k];
                    }
                }
                );

                if (template && template.apply._root) {
                    Object.entries(template.apply._root).filter(([k,v])=>!copyToRootProps.has(k)).forEach(([k,v])=>copyTo[k] = v);
                }

                if (copyMeta._mod) {
                    Object.entries(copyMeta._mod).forEach(([k,v])=>{
                        copyMeta._mod[k] = DataUtil.generic.variableResolver.resolve({
                            obj: v,
                            ent: copyTo
                        });
                    }
                    );

                    Object.entries(copyMeta._mod).forEach(([prop,modInfos])=>{
                        if (prop === "*")
                            this._doMod({
                                copyTo,
                                copyFrom,
                                modInfos,
                                props: DataUtil.generic.COPY_ENTRY_PROPS,
                                msgPtFailed,
                                isExternalApplicationIdentityOnly
                            });
                        else if (prop === "_")
                            this._doMod({
                                copyTo,
                                copyFrom,
                                modInfos,
                                msgPtFailed,
                                isExternalApplicationIdentityOnly
                            });
                        else
                            this._doMod({
                                copyTo,
                                copyFrom,
                                modInfos,
                                props: [prop],
                                msgPtFailed,
                                isExternalApplicationIdentityOnly
                            });
                    }
                    );
                }

                copyTo._isCopy = true;

                delete copyTo._copy;
            }
        }
        ,

        variableResolver: class {
            static _getSize({ent}) {
                return ent.size?.[0] || Parser.SZ_MEDIUM;
            }

            static _SIZE_TO_MULT = {
                [Parser.SZ_LARGE]: 2,
                [Parser.SZ_HUGE]: 3,
                [Parser.SZ_GARGANTUAN]: 4,
            };

            static _getSizeMult(size) {
                return this._SIZE_TO_MULT[size] ?? 1;
            }

            static _getCleanMathExpression(str) {
                return str.replace(/[^-+/*0-9.,]+/g, "");
            }

            static resolve({obj, ent, msgPtFailed=null}) {
                return JSON.parse(JSON.stringify(obj).replace(/<\$(?<variable>[^$]+)\$>/g, (...m)=>{
                    const [mode,detail] = m.last().variable.split("__");

                    switch (mode) {
                    case "name":
                        return ent.name;
                    case "short_name":
                    case "title_short_name":
                        {
                            return Renderer.monster.getShortName(ent, {
                                isTitleCase: mode === "title_short_name"
                            });
                        }

                    case "dc":
                    case "spell_dc":
                        {
                            if (!Parser.ABIL_ABVS.includes(detail))
                                throw new Error(`${msgPtFailed ? `${msgPtFailed} ` : ""} Unknown ability score "${detail}"`);
                            return 8 + Parser.getAbilityModNumber(Number(ent[detail])) + Parser.crToPb(ent.cr);
                        }

                    case "to_hit":
                        {
                            if (!Parser.ABIL_ABVS.includes(detail))
                                throw new Error(`${msgPtFailed ? `${msgPtFailed} ` : ""} Unknown ability score "${detail}"`);
                            const total = Parser.crToPb(ent.cr) + Parser.getAbilityModNumber(Number(ent[detail]));
                            return total >= 0 ? `+${total}` : total;
                        }

                    case "damage_mod":
                        {
                            if (!Parser.ABIL_ABVS.includes(detail))
                                throw new Error(`${msgPtFailed ? `${msgPtFailed} ` : ""} Unknown ability score "${detail}"`);
                            const total = Parser.getAbilityModNumber(Number(ent[detail]));
                            return total === 0 ? "" : total > 0 ? ` + ${total}` : ` - ${Math.abs(total)}`;
                        }

                    case "damage_avg":
                        {
                            const replaced = detail.replace(/\b(?<abil>str|dex|con|int|wis|cha)\b/gi, (...m)=>Parser.getAbilityModNumber(Number(ent[m.last().abil]))).replace(/\bsize_mult\b/g, ()=>this._getSizeMult(this._getSize({
                                ent
                            })));

                            return Math.floor(eval(this._getCleanMathExpression(replaced)));
                        }

                    case "size_mult":
                        {
                            const mult = this._getSizeMult(this._getSize({
                                ent
                            }));

                            if (!detail)
                                return mult;

                            return Math.floor(eval(`${mult} * ${this._getCleanMathExpression(detail)}`));
                        }

                    default:
                        return m[0];
                    }
                }
                ), );
            }
        }
        ,

        getVersions(parent, {impl=null, isExternalApplicationIdentityOnly=false}={}) {
            if (!parent?._versions?.length)
                return [];

            return parent._versions.map(ver=>{
                if (ver._template && ver._implementations?.length)
                    return DataUtil.generic._getVersions_template({
                        ver
                    });
                return DataUtil.generic._getVersions_basic({
                    ver
                });
            }
            ).flat().map(ver=>DataUtil.generic._getVersion({
                parentEntity: parent,
                version: ver,
                impl,
                isExternalApplicationIdentityOnly
            }));
        },

        _getVersions_template({ver}) {
            return ver._implementations.map(impl=>{
                let cpyTemplate = MiscUtil.copyFast(ver._template);
                const cpyImpl = MiscUtil.copyFast(impl);

                DataUtil.generic._getVersions_mutExpandCopy({
                    ent: cpyTemplate
                });

                if (cpyImpl._variables) {
                    cpyTemplate = MiscUtil.getWalker().walk(cpyTemplate, {
                        string: str=>str.replace(/{{([^}]+)}}/g, (...m)=>cpyImpl._variables[m[1]]),
                    }, );
                    delete cpyImpl._variables;
                }

                Object.assign(cpyTemplate, cpyImpl);

                return cpyTemplate;
            }
            );
        },

        _getVersions_basic({ver}) {
            const cpyVer = MiscUtil.copyFast(ver);
            DataUtil.generic._getVersions_mutExpandCopy({
                ent: cpyVer
            });
            return cpyVer;
        },

        _getVersions_mutExpandCopy({ent}) {
            ent._copy = {
                _mod: ent._mod,
                _preserve: ent._preserve || {
                    "*": true
                },
            };
            delete ent._mod;
            delete ent._preserve;
        },

        _getVersion({parentEntity, version, impl=null, isExternalApplicationIdentityOnly}) {
            const additionalData = {
                _versionBase_isVersion: true,
                _versionBase_name: parentEntity.name,
                _versionBase_source: parentEntity.source,
                _versionBase_hasToken: parentEntity.hasToken,
                _versionBase_hasFluff: parentEntity.hasFluff,
                _versionBase_hasFluffImages: parentEntity.hasFluffImages,
            };
            const cpyParentEntity = MiscUtil.copyFast(parentEntity);

            delete cpyParentEntity._versions;
            delete cpyParentEntity.hasToken;
            delete cpyParentEntity.hasFluff;
            delete cpyParentEntity.hasFluffImages;

            DataUtil.generic.copyApplier.getCopy(impl, cpyParentEntity, version, null, {
                isExternalApplicationIdentityOnly
            }, );
            Object.assign(version, additionalData);
            return version;
        },
    },

    proxy: {
        getVersions(prop, ent, {isExternalApplicationIdentityOnly=false}={}) {
            if (DataUtil[prop]?.getVersions)
                return DataUtil[prop]?.getVersions(ent, {
                    isExternalApplicationIdentityOnly
                });
            return DataUtil.generic.getVersions(ent, {
                isExternalApplicationIdentityOnly
            });
        },

        unpackUid(prop, uid, tag, opts) {
            if (DataUtil[prop]?.unpackUid)
                return DataUtil[prop]?.unpackUid(uid, tag, opts);
            return DataUtil.generic.unpackUid(uid, tag, opts);
        },

        getNormalizedUid(prop, uid, tag, opts) {
            if (DataUtil[prop]?.getNormalizedUid)
                return DataUtil[prop].getNormalizedUid(uid, tag, opts);
            return DataUtil.generic.getNormalizedUid(uid, tag, opts);
        },

        getUid(prop, ent, opts) {
            if (DataUtil[prop]?.getUid)
                return DataUtil[prop].getUid(ent, opts);
            return DataUtil.generic.getUid(ent, opts);
        },
    },

    monster: class extends _DataUtilPropConfigMultiSource {
        static _MERGE_REQUIRES_PRESERVE = {
            legendaryGroup: true,
            environment: true,
            soundClip: true,
            altArt: true,
            variant: true,
            dragonCastingColor: true,
            familiar: true,
        };

        static _PAGE = UrlUtil.PG_BESTIARY;

        static _DIR = "bestiary";
        static _PROP = "monster";

        static async loadJSON() {
            await DataUtil.monster.pPreloadMeta();
            return super.loadJSON();
        }

        static getVersions(mon, {isExternalApplicationIdentityOnly=false}={}) {
            const additionalVersionData = DataUtil.monster._getAdditionalVersionsData(mon);
            if (additionalVersionData.length) {
                mon = MiscUtil.copyFast(mon);
                (mon._versions = mon._versions || []).push(...additionalVersionData);
            }
            return DataUtil.generic.getVersions(mon, {
                impl: DataUtil.monster,
                isExternalApplicationIdentityOnly
            });
        }

        static _getAdditionalVersionsData(mon) {
            if (!mon.variant?.length)
                return [];

            return mon.variant.filter(it=>it._version).map(it=>{
                const toAdd = {
                    name: it._version.name || it.name,
                    source: it._version.source || it.source || mon.source,
                    variant: null,
                };

                if (it._version.addAs) {
                    const cpy = MiscUtil.copyFast(it);
                    delete cpy._version;
                    delete cpy.type;
                    delete cpy.source;
                    delete cpy.page;

                    toAdd._mod = {
                        [it._version.addAs]: {
                            mode: "appendArr",
                            items: cpy,
                        },
                    };

                    return toAdd;
                }

                if (it._version.addHeadersAs) {
                    const cpy = MiscUtil.copyFast(it);
                    cpy.entries = cpy.entries.filter(it=>it.name && it.entries);
                    cpy.entries.forEach(cpyEnt=>{
                        delete cpyEnt.type;
                        delete cpyEnt.source;
                    }
                    );

                    toAdd._mod = {
                        [it._version.addHeadersAs]: {
                            mode: "appendArr",
                            items: cpy.entries,
                        },
                    };

                    return toAdd;
                }
            }
            ).filter(Boolean);
        }

        static async pPreloadMeta() {
            DataUtil.monster._pLoadMeta = DataUtil.monster._pLoadMeta || ((async()=>{
                const legendaryGroups = await DataUtil.legendaryGroup.pLoadAll();
                DataUtil.monster.populateMetaReference({
                    legendaryGroup: legendaryGroups
                });
            }
            )());
            await DataUtil.monster._pLoadMeta;
        }

        static _pLoadMeta = null;
        static metaGroupMap = {};
        static getMetaGroup(mon) {
            if (!mon.legendaryGroup || !mon.legendaryGroup.source || !mon.legendaryGroup.name)
                return null;
            return (DataUtil.monster.metaGroupMap[mon.legendaryGroup.source] || {})[mon.legendaryGroup.name];
        }
        static populateMetaReference(data) {
            (data.legendaryGroup || []).forEach(it=>{
                (DataUtil.monster.metaGroupMap[it.source] = DataUtil.monster.metaGroupMap[it.source] || {})[it.name] = it;
            }
            );
        }
    }
    ,

    monsterFluff: class extends _DataUtilPropConfigMultiSource {
        static _PAGE = UrlUtil.PG_BESTIARY;
        static _DIR = "bestiary";
        static _PROP = "monsterFluff";
    }
    ,

    monsterTemplate: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = "monsterTemplate";
        static _FILENAME = "bestiary/template.json";
    }
    ,

    spell: class extends _DataUtilPropConfigMultiSource {
        static _PAGE = UrlUtil.PG_SPELLS;
        static _DIR = "spells";
        static _PROP = "spell";
        static _IS_MUT_ENTITIES = true;

        static _SPELL_SOURCE_LOOKUP = null;

        static PROPS_SPELL_SOURCE = ["classes", "races", "optionalfeatures", "backgrounds", "feats", "charoptions", "rewards", ];

        static setSpellSourceLookup(lookup, {isExternalApplication=false}={}) {
            if (!isExternalApplication)
                throw new Error("Should not be calling this!");
            this._SPELL_SOURCE_LOOKUP = MiscUtil.copyFast(lookup);
        }

        static mutEntity(sp, {isExternalApplication=false}={}) {
            if (!isExternalApplication)
                throw new Error("Should not be calling this!");
            return this._mutEntity(sp);
        }

        static unmutEntity(sp, {isExternalApplication=false}={}) {
            if (!isExternalApplication)
                throw new Error("Should not be calling this!");
            this.PROPS_SPELL_SOURCE.forEach(prop=>delete sp[prop]);
            delete sp._isMutEntity;
        }

        static mutEntityBrewBuilder(sp, sourcesLookup) {
            const out = this._mutEntity(sp, {
                sourcesLookup
            });
            delete sp._isMutEntity;
            return out;
        }

        static async _pInitPreData_() {
            this._SPELL_SOURCE_LOOKUP = await DataUtil.loadRawJSON(`${Renderer.get().baseUrl}data/generated/gendata-spell-source-lookup.json`);
        }

        static _mutEntity(sp, {sourcesLookup=null}={}) {
            if (sp._isMutEntity)
                return sp;

            const spSources = (sourcesLookup ?? this._SPELL_SOURCE_LOOKUP)[sp.source.toLowerCase()]?.[sp.name.toLowerCase()];
            if (!spSources)
                return sp;

            this._mutSpell_class({
                sp,
                spSources,
                propSources: "class",
                propClasses: "fromClassList"
            });
            this._mutSpell_class({
                sp,
                spSources,
                propSources: "classVariant",
                propClasses: "fromClassListVariant"
            });
            this._mutSpell_subclass({
                sp,
                spSources
            });
            this._mutSpell_race({
                sp,
                spSources
            });
            this._mutSpell_optionalfeature({
                sp,
                spSources
            });
            this._mutSpell_background({
                sp,
                spSources
            });
            this._mutSpell_feat({
                sp,
                spSources
            });
            this._mutSpell_charoption({
                sp,
                spSources
            });
            this._mutSpell_reward({
                sp,
                spSources
            });

            sp._isMutEntity = true;

            return sp;
        }

        static _mutSpell_class({sp, spSources, propSources, propClasses}) {
            if (!spSources[propSources])
                return;

            Object.entries(spSources[propSources]).forEach(([source,nameTo])=>{
                const tgt = MiscUtil.getOrSet(sp, "classes", propClasses, []);

                Object.entries(nameTo).forEach(([name,val])=>{
                    if (tgt.some(it=>it.name === nameTo && it.source === source))
                        return;

                    const toAdd = {
                        name,
                        source
                    };
                    if (val === true)
                        return tgt.push(toAdd);

                    if (val.definedInSource) {
                        toAdd.definedInSource = val.definedInSource;
                        tgt.push(toAdd);
                        return;
                    }

                    if (val.definedInSources) {
                        val.definedInSources.forEach(definedInSource=>{
                            const cpyToAdd = MiscUtil.copyFast(toAdd);

                            if (definedInSource == null) {
                                return tgt.push(cpyToAdd);
                            }

                            cpyToAdd.definedInSource = definedInSource;
                            tgt.push(cpyToAdd);
                        }
                        );

                        return;
                    }

                    throw new Error("Unimplemented!");
                }
                );
            }
            );
        }

        static _mutSpell_subclass({sp, spSources}) {
            if (!spSources.subclass)
                return;

            Object.entries(spSources.subclass).forEach(([classSource,classNameTo])=>{
                Object.entries(classNameTo).forEach(([className,sourceTo])=>{
                    Object.entries(sourceTo).forEach(([source,nameTo])=>{
                        const tgt = MiscUtil.getOrSet(sp, "classes", "fromSubclass", []);

                        Object.entries(nameTo).forEach(([name,val])=>{
                            if (val === true)
                                throw new Error("Unimplemented!");

                            if (tgt.some(it=>it.class.name === className && it.class.source === classSource && it.subclass.name === name && it.subclass.source === source && ((it.subclass.subSubclass == null && val.subSubclasses == null) || val.subSubclasses.includes(it.subclass.subSubclass))))
                                return;

                            const toAdd = {
                                class: {
                                    name: className,
                                    source: classSource,
                                },
                                subclass: {
                                    name: val.name,
                                    shortName: name,
                                    source,
                                },
                            };

                            if (!val.subSubclasses?.length)
                                return tgt.push(toAdd);

                            val.subSubclasses.forEach(subSubclass=>{
                                const cpyToAdd = MiscUtil.copyFast(toAdd);
                                cpyToAdd.subclass.subSubclass = subSubclass;
                                tgt.push(cpyToAdd);
                            }
                            );
                        }
                        );
                    }
                    );
                }
                );
            }
            );
        }

        static _mutSpell_race({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "race",
                propSpell: "races"
            });
        }

        static _mutSpell_optionalfeature({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "optionalfeature",
                propSpell: "optionalfeatures"
            });
        }

        static _mutSpell_background({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "background",
                propSpell: "backgrounds"
            });
        }

        static _mutSpell_feat({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "feat",
                propSpell: "feats"
            });
        }

        static _mutSpell_charoption({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "charoption",
                propSpell: "charoptions"
            });
        }

        static _mutSpell_reward({sp, spSources}) {
            this._mutSpell_generic({
                sp,
                spSources,
                propSources: "reward",
                propSpell: "rewards"
            });
        }

        static _mutSpell_generic({sp, spSources, propSources, propSpell}) {
            if (!spSources[propSources])
                return;

            Object.entries(spSources[propSources]).forEach(([source,nameTo])=>{
                const tgt = MiscUtil.getOrSet(sp, propSpell, []);

                Object.entries(nameTo).forEach(([name,val])=>{
                    if (tgt.some(it=>it.name === nameTo && it.source === source))
                        return;

                    const toAdd = {
                        name,
                        source
                    };
                    if (val === true)
                        return tgt.push(toAdd);

                    Object.assign(toAdd, {
                        ...val
                    });
                    tgt.push(toAdd);
                }
                );
            }
            );
        }
    }
    ,

    spellFluff: class extends _DataUtilPropConfigMultiSource {
        static _PAGE = UrlUtil.PG_SPELLS;
        static _DIR = "spells";
        static _PROP = "spellFluff";
    }
    ,

    background: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_BACKGROUNDS;
        static _FILENAME = "backgrounds.json";
    }
    ,

    backgroundFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_BACKGROUNDS;
        static _FILENAME = "fluff-backgrounds.json";
    }
    ,

    charoption: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CHAR_CREATION_OPTIONS;
        static _FILENAME = "charcreationoptions.json";
    }
    ,

    charoptionFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CHAR_CREATION_OPTIONS;
        static _FILENAME = "fluff-charcreationoptions.json";
    }
    ,

    condition: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CONDITIONS_DISEASES;
        static _FILENAME = "conditionsdiseases.json";
    }
    ,

    conditionFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CONDITIONS_DISEASES;
        static _FILENAME = "fluff-conditionsdiseases.json";
    }
    ,

    disease: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_CONDITIONS_DISEASES;
        static _FILENAME = "conditionsdiseases.json";
    }
    ,

    feat: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_FEATS;
        static _FILENAME = "feats.json";
    }
    ,

    featFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_FEATS;
        static _FILENAME = "fluff-feats.json";
    }
    ,

    item: class extends _DataUtilPropConfigCustom {
        static _MERGE_REQUIRES_PRESERVE = {
            lootTables: true,
            tier: true,
        };
        static _PAGE = UrlUtil.PG_ITEMS;

        static async loadRawJSON() {
            if (DataUtil.item._loadedRawJson)
                return DataUtil.item._loadedRawJson;

            DataUtil.item._pLoadingRawJson = (async()=>{
                const urlItems = `${Renderer.get().baseUrl}data/items.json`;
                const urlItemsBase = `${Renderer.get().baseUrl}data/items-base.json`;
                const urlVariants = `${Renderer.get().baseUrl}data/magicvariants.json`;

                const [dataItems,dataItemsBase,dataVariants] = await Promise.all([DataUtil.loadJSON(urlItems), DataUtil.loadJSON(urlItemsBase), DataUtil.loadJSON(urlVariants), ]);

                DataUtil.item._loadedRawJson = {
                    item: MiscUtil.copyFast(dataItems.item),
                    itemGroup: MiscUtil.copyFast(dataItems.itemGroup),
                    magicvariant: MiscUtil.copyFast(dataVariants.magicvariant),
                    baseitem: MiscUtil.copyFast(dataItemsBase.baseitem),
                };
            }
            )();
            await DataUtil.item._pLoadingRawJson;

            return DataUtil.item._loadedRawJson;
        }

        static async loadJSON() {
            return {
                item: await Renderer.item.pBuildList()
            };
        }

        static async loadPrerelease() {
            return {
                item: await Renderer.item.pGetItemsFromPrerelease()
            };
        }

        static async loadBrew() {
            return {
                item: await Renderer.item.pGetItemsFromBrew()
            };
        }
    }
    ,

    itemGroup: class extends _DataUtilPropConfig {
        static _MERGE_REQUIRES_PRESERVE = {
            lootTables: true,
            tier: true,
        };
        static _PAGE = UrlUtil.PG_ITEMS;

        static async pMergeCopy(...args) {
            return DataUtil.item.pMergeCopy(...args);
        }
        static async loadRawJSON(...args) {
            return DataUtil.item.loadRawJSON(...args);
        }
    }
    ,

    baseitem: class extends _DataUtilPropConfig {
        static _PAGE = UrlUtil.PG_ITEMS;

        static async pMergeCopy(...args) {
            return DataUtil.item.pMergeCopy(...args);
        }
        static async loadRawJSON(...args) {
            return DataUtil.item.loadRawJSON(...args);
        }
    }
    ,

    itemFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_ITEMS;
        static _FILENAME = "fluff-items.json";
    }
    ,

    itemType: class extends _DataUtilPropConfig {
        static _PAGE = "itemType";
    }
    ,

    language: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_LANGUAGES;
        static _FILENAME = "languages.json";

        static async loadJSON() {
            const rawData = await super.loadJSON();

            const scriptLookup = {};
            (rawData.languageScript || []).forEach(script=>scriptLookup[script.name] = script);

            const out = {
                language: MiscUtil.copyFast(rawData.language)
            };
            out.language.forEach(lang=>{
                if (!lang.script || lang.fonts === false)
                    return;

                const script = scriptLookup[lang.script];
                if (!script)
                    return;

                lang._fonts = [...script.fonts];
            }
            );

            return out;
        }
    }
    ,

    languageFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_LANGUAGES;
        static _FILENAME = "fluff-languages.json";
    }
    ,

    object: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_OBJECTS;
        static _FILENAME = "objects.json";
    }
    ,

    objectFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_OBJECTS;
        static _FILENAME = "fluff-objects.json";
    }
    ,

    race: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_RACES;
        static _FILENAME = "races.json";

        static _loadCache = {};
        static _pIsLoadings = {};
        static async loadJSON({isAddBaseRaces=false}={}) {
            if (!DataUtil.race._pIsLoadings[isAddBaseRaces]) {
                DataUtil.race._pIsLoadings[isAddBaseRaces] = (async()=>{
                    DataUtil.race._loadCache[isAddBaseRaces] = DataUtil.race.getPostProcessedSiteJson(await this.loadRawJSON(), {
                        isAddBaseRaces
                    }, );
                }
                )();
            }
            await DataUtil.race._pIsLoadings[isAddBaseRaces];
            return DataUtil.race._loadCache[isAddBaseRaces];
        }

        static getPostProcessedSiteJson(rawRaceData, {isAddBaseRaces=false}={}) {
            rawRaceData = MiscUtil.copyFast(rawRaceData);
            (rawRaceData.subrace || []).forEach(sr=>{
                const r = rawRaceData.race.find(it=>it.name === sr.raceName && it.source === sr.raceSource);
                if (!r)
                    return JqueryUtil.doToast({
                        content: `Failed to find race "${sr.raceName}" (${sr.raceSource})`,
                        type: "danger"
                    });
                const cpySr = MiscUtil.copyFast(sr);
                delete cpySr.raceName;
                delete cpySr.raceSource;
                (r.subraces = r.subraces || []).push(sr);
            }
            );
            delete rawRaceData.subrace;
            const raceData = Renderer.race.mergeSubraces(rawRaceData.race, {
                isAddBaseRaces
            });
            raceData.forEach(it=>it.__prop = "race");
            return {
                race: raceData
            };
        }

        static async loadPrerelease({isAddBaseRaces=true}={}) {
            return DataUtil.race._loadPrereleaseBrew({
                isAddBaseRaces,
                brewUtil: typeof PrereleaseUtil !== "undefined" ? PrereleaseUtil : null
            });
        }

        static async loadBrew({isAddBaseRaces=true}={}) {
            return DataUtil.race._loadPrereleaseBrew({
                isAddBaseRaces,
                brewUtil: typeof BrewUtil2 !== "undefined" ? BrewUtil2 : null
            });
        }

        static async _loadPrereleaseBrew({isAddBaseRaces=true, brewUtil}={}) {
            if (!brewUtil)
                return {};

            const rawSite = await DataUtil.race.loadRawJSON();
            const brew = await brewUtil.pGetBrewProcessed();
            return DataUtil.race.getPostProcessedPrereleaseBrewJson(rawSite, brew, {
                isAddBaseRaces
            });
        }

        static getPostProcessedPrereleaseBrewJson(rawSite, brew, {isAddBaseRaces=false}={}) {
            rawSite = MiscUtil.copyFast(rawSite);
            brew = MiscUtil.copyFast(brew);

            const rawSiteUsed = [];
            (brew.subrace || []).forEach(sr=>{
                const rSite = rawSite.race.find(it=>it.name === sr.raceName && it.source === sr.raceSource);
                const rBrew = (brew.race || []).find(it=>it.name === sr.raceName && it.source === sr.raceSource);
                if (!rSite && !rBrew)
                    return JqueryUtil.doToast({
                        content: `Failed to find race "${sr.raceName}" (${sr.raceSource})`,
                        type: "danger"
                    });
                const rTgt = rSite || rBrew;
                const cpySr = MiscUtil.copyFast(sr);
                delete cpySr.raceName;
                delete cpySr.raceSource;
                (rTgt.subraces = rTgt.subraces || []).push(sr);
                if (rSite && !rawSiteUsed.includes(rSite))
                    rawSiteUsed.push(rSite);
            }
            );
            delete brew.subrace;

            const raceDataBrew = Renderer.race.mergeSubraces(brew.race || [], {
                isAddBaseRaces
            });
            const raceDataSite = Renderer.race.mergeSubraces(rawSiteUsed, {
                isAddBaseRaces: false
            });

            const out = [...raceDataBrew, ...raceDataSite];
            out.forEach(it=>it.__prop = "race");
            return {
                race: out
            };
        }
    }
    ,

    raceFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_RACES;
        static _FILENAME = "fluff-races.json";

        static _getApplyUncommonMonstrous(data) {
            data = MiscUtil.copyFast(data);
            data.raceFluff.forEach(raceFluff=>{
                if (raceFluff.uncommon) {
                    raceFluff.entries = raceFluff.entries || [];
                    raceFluff.entries.push(MiscUtil.copyFast(data.raceFluffMeta.uncommon));
                    delete raceFluff.uncommon;
                }

                if (raceFluff.monstrous) {
                    raceFluff.entries = raceFluff.entries || [];
                    raceFluff.entries.push(MiscUtil.copyFast(data.raceFluffMeta.monstrous));
                    delete raceFluff.monstrous;
                }
            }
            );
            return data;
        }

        static async loadJSON() {
            const data = await super.loadJSON();
            return this._getApplyUncommonMonstrous(data);
        }

        static async loadUnmergedJSON() {
            const data = await super.loadUnmergedJSON();
            return this._getApplyUncommonMonstrous(data);
        }
    }
    ,

    raceFeature: class extends _DataUtilPropConfig {
        static _PAGE = "raceFeature";
    }
    ,

    recipe: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_RECIPES;
        static _FILENAME = "recipes.json";

        static async loadJSON() {
            const rawData = await super.loadJSON();
            return {
                recipe: await DataUtil.recipe.pGetPostProcessedRecipes(rawData.recipe)
            };
        }

        static async pGetPostProcessedRecipes(recipes) {
            if (!recipes?.length)
                return;

            recipes = MiscUtil.copyFast(recipes);

            recipes.forEach(r=>Renderer.recipe.populateFullIngredients(r));

            const out = [];

            for (const r of recipes) {
                const fluff = await Renderer.utils.pGetFluff({
                    entity: r,
                    fnGetFluffData: DataUtil.recipeFluff.loadJSON.bind(DataUtil.recipeFluff),
                    fluffProp: "recipeFluff",
                });

                if (!fluff) {
                    out.push(r);
                    continue;
                }

                const cpyR = MiscUtil.copyFast(r);
                cpyR.fluff = MiscUtil.copyFast(fluff);
                delete cpyR.fluff.name;
                delete cpyR.fluff.source;
                out.push(cpyR);
            }

            return out;
        }

        static async loadPrerelease() {
            return this._loadPrereleaseBrew({
                brewUtil: typeof PrereleaseUtil !== "undefined" ? PrereleaseUtil : null
            });
        }

        static async loadBrew() {
            return this._loadPrereleaseBrew({
                brewUtil: typeof BrewUtil2 !== "undefined" ? BrewUtil2 : null
            });
        }

        static async _loadPrereleaseBrew({brewUtil}) {
            if (!brewUtil)
                return {};

            const brew = await brewUtil.pGetBrewProcessed();
            if (!brew?.recipe?.length)
                return brew;

            return {
                ...brew,
                recipe: await DataUtil.recipe.pGetPostProcessedRecipes(brew.recipe),
            };
        }
    }
    ,

    recipeFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_RECIPES;
        static _FILENAME = "fluff-recipes.json";
    }
    ,

    vehicle: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_VEHICLES;
        static _FILENAME = "vehicles.json";
    }
    ,

    vehicleFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_VEHICLES;
        static _FILENAME = "fluff-vehicles.json";
    }
    ,

    optionalfeature: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_OPT_FEATURES;
        static _FILENAME = "optionalfeatures.json";
    }
    ,

    class: class clazz extends _DataUtilPropConfigCustom {
        static _PAGE = UrlUtil.PG_CLASSES;

        static _pLoadJson = null;
        static _pLoadRawJson = null;

        static loadJSON() {
            return DataUtil.class._pLoadJson = DataUtil.class._pLoadJson || (async()=>{
                return {
                    class: await DataLoader.pCacheAndGetAllSite("class"),
                    subclass: await DataLoader.pCacheAndGetAllSite("subclass"),
                };
            }
            )();
        }

        static loadRawJSON() {
            return DataUtil.class._pLoadRawJson = DataUtil.class._pLoadRawJson || (async()=>{
                const index = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/class/index.json`);
                const allData = await Promise.all(Object.values(index).map(it=>DataUtil.loadJSON(`${Renderer.get().baseUrl}data/class/${it}`)));

                return {
                    class: MiscUtil.copyFast(allData.map(it=>it.class || []).flat()),
                    subclass: MiscUtil.copyFast(allData.map(it=>it.subclass || []).flat()),
                    classFeature: allData.map(it=>it.classFeature || []).flat(),
                    subclassFeature: allData.map(it=>it.subclassFeature || []).flat(),
                };
            }
            )();
        }

        static async loadPrerelease() {
            return {
                class: await DataLoader.pCacheAndGetAllPrerelease("class"),
                subclass: await DataLoader.pCacheAndGetAllPrerelease("subclass"),
            };
        }

        static async loadBrew() {
            return {
                class: await DataLoader.pCacheAndGetAllBrew("class"),
                subclass: await DataLoader.pCacheAndGetAllBrew("subclass"),
            };
        }

        static packUidSubclass(it) {
            const sourceDefault = Parser.getTagSource("subclass");
            return [it.name, it.className, (it.classSource || "").toLowerCase() === sourceDefault.toLowerCase() ? "" : it.classSource, (it.source || "").toLowerCase() === sourceDefault.toLowerCase() ? "" : it.source, ].join("|").replace(/\|+$/, "");
        }

        static unpackUidClassFeature(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,className,classSource,level,source,displayText] = uid.split("|").map(it=>it.trim());
            classSource = classSource || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
            source = source || classSource;
            level = Number(level);
            return {
                name,
                className,
                classSource,
                level,
                source,
                displayText,
            };
        }

        static isValidClassFeatureUid(uid) {
            const {name, className, level} = DataUtil.class.unpackUidClassFeature(uid);
            return !(!name || !className || isNaN(level));
        }

        static packUidClassFeature(f) {
            return [f.name, f.className, f.classSource === Parser.SRC_PHB ? "" : f.classSource, f.level, f.source === f.classSource ? "" : f.source, ].join("|").replace(/\|+$/, "");
        }

        static unpackUidSubclassFeature(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,className,classSource,subclassShortName,subclassSource,level,source,displayText] = uid.split("|").map(it=>it.trim());
            classSource = classSource || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
            subclassSource = subclassSource || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
            source = source || subclassSource;
            level = Number(level);
            return {
                name,
                className,
                classSource,
                subclassShortName,
                subclassSource,
                level,
                source,
                displayText,
            };
        }

        static isValidSubclassFeatureUid(uid) {
            const {name, className, subclassShortName, level} = DataUtil.class.unpackUidSubclassFeature(uid);
            return !(!name || !className || !subclassShortName || isNaN(level));
        }

        static packUidSubclassFeature(f) {
            return [f.name, f.className, f.classSource === Parser.SRC_PHB ? "" : f.classSource, f.subclassShortName, f.subclassSource === Parser.SRC_PHB ? "" : f.subclassSource, f.level, f.source === f.subclassSource ? "" : f.source, ].join("|").replace(/\|+$/, "");
        }

        static _CACHE_SUBCLASS_LOOKUP_PROMISE = null;
        static _CACHE_SUBCLASS_LOOKUP = null;
        static async pGetSubclassLookup() {
            DataUtil.class._CACHE_SUBCLASS_LOOKUP_PROMISE = DataUtil.class._CACHE_SUBCLASS_LOOKUP_PROMISE || (async()=>{
                const subclassLookup = {};
                Object.assign(subclassLookup, await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/generated/gendata-subclass-lookup.json`));
                DataUtil.class._CACHE_SUBCLASS_LOOKUP = subclassLookup;
            }
            )();
            await DataUtil.class._CACHE_SUBCLASS_LOOKUP_PROMISE;
            return DataUtil.class._CACHE_SUBCLASS_LOOKUP;
        }
    }
    ,

    subclass: class extends _DataUtilPropConfig {
        static _PAGE = "subclass";
    }
    ,

    deity: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_DEITIES;
        static _FILENAME = "deities.json";

        static doPostLoad(data) {
            const PRINT_ORDER = [Parser.SRC_PHB, Parser.SRC_DMG, Parser.SRC_SCAG, Parser.SRC_VGM, Parser.SRC_MTF, Parser.SRC_ERLW, Parser.SRC_EGW, Parser.SRC_TDCSR, ];

            const inSource = {};
            PRINT_ORDER.forEach(src=>{
                inSource[src] = {};
                data.deity.filter(it=>it.source === src).forEach(it=>inSource[src][it.reprintAlias || it.name] = it);
            }
            );

            const laterPrinting = [PRINT_ORDER.last()];
            [...PRINT_ORDER].reverse().slice(1).forEach(src=>{
                laterPrinting.forEach(laterSrc=>{
                    Object.keys(inSource[src]).forEach(name=>{
                        const newer = inSource[laterSrc][name];
                        if (newer) {
                            const old = inSource[src][name];
                            old.reprinted = true;
                            if (!newer._isEnhanced) {
                                newer.previousVersions = newer.previousVersions || [];
                                newer.previousVersions.push(old);
                            }
                        }
                    }
                    );
                }
                );

                laterPrinting.push(src);
            }
            );
            data.deity.forEach(g=>g._isEnhanced = true);

            return data;
        }

        static async loadJSON() {
            const data = await super.loadJSON();
            DataUtil.deity.doPostLoad(data);
            return data;
        }

        static getUid(ent, opts) {
            return this.packUidDeity(ent, opts);
        }

        static getNormalizedUid(uid, tag) {
            const {name, pantheon, source} = this.unpackUidDeity(uid, tag, {
                isLower: true
            });
            return [name, pantheon, source].join("|");
        }

        static unpackUidDeity(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,pantheon,source,displayText,...others] = uid.split("|").map(it=>it.trim());

            pantheon = pantheon || "forgotten realms";
            if (opts.isLower)
                pantheon = pantheon.toLowerCase();

            source = source || Parser.getTagSource("deity", source);
            if (opts.isLower)
                source = source.toLowerCase();

            return {
                name,
                pantheon,
                source,
                displayText,
                others,
            };
        }

        static packUidDeity(it) {
            const sourceDefault = Parser.getTagSource("deity");
            return [it.name, (it.pantheon || "").toLowerCase() === "forgotten realms" ? "" : it.pantheon, (it.source || "").toLowerCase() === sourceDefault.toLowerCase() ? "" : it.source, ].join("|").replace(/\|+$/, "");
        }
    }
    ,

    table: class extends _DataUtilPropConfigCustom {
        static async loadJSON() {
            const datas = await Promise.all([`${Renderer.get().baseUrl}data/generated/gendata-tables.json`, `${Renderer.get().baseUrl}data/tables.json`, ].map(url=>DataUtil.loadJSON(url)));
            const combined = {};
            datas.forEach(data=>{
                Object.entries(data).forEach(([k,v])=>{
                    if (combined[k] && combined[k]instanceof Array && v instanceof Array)
                        combined[k] = combined[k].concat(v);
                    else if (combined[k] == null)
                        combined[k] = v;
                    else
                        throw new Error(`Could not merge keys for key "${k}"`);
                }
                );
            }
            );

            return combined;
        }
    }
    ,

    legendaryGroup: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_BESTIARY;
        static _FILENAME = "bestiary/legendarygroups.json";

        static async pLoadAll() {
            return (await this.loadJSON()).legendaryGroup;
        }
    }
    ,

    variantrule: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_VARIANTRULES;
        static _FILENAME = "variantrules.json";

        static async loadJSON() {
            const rawData = await super.loadJSON();
            const rawDataGenerated = await DataUtil.loadJSON(`${Renderer.get().baseUrl}data/generated/gendata-variantrules.json`);

            return {
                variantrule: [...rawData.variantrule, ...rawDataGenerated.variantrule]
            };
        }
    }
    ,

    deck: class extends _DataUtilPropConfigCustom {
        static _PAGE = UrlUtil.PG_DECKS;

        static _pLoadJson = null;
        static _pLoadRawJson = null;

        static loadJSON() {
            return DataUtil.deck._pLoadJson = DataUtil.deck._pLoadJson || (async()=>{
                return {
                    deck: await DataLoader.pCacheAndGetAllSite("deck"),
                    card: await DataLoader.pCacheAndGetAllSite("card"),
                };
            }
            )();
        }

        static loadRawJSON() {
            return DataUtil.deck._pLoadRawJson = DataUtil.deck._pLoadRawJson || DataUtil.loadJSON(`${Renderer.get().baseUrl}data/decks.json`);
        }

        static async loadPrerelease() {
            return {
                deck: await DataLoader.pCacheAndGetAllPrerelease("deck"),
                card: await DataLoader.pCacheAndGetAllPrerelease("card"),
            };
        }

        static async loadBrew() {
            return {
                deck: await DataLoader.pCacheAndGetAllBrew("deck"),
                card: await DataLoader.pCacheAndGetAllBrew("card"),
            };
        }

        static unpackUidCard(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,set,source,displayText] = uid.split("|").map(it=>it.trim());
            set = set || "none";
            source = source || Parser.getTagSource("card", source)[opts.isLower ? "toLowerCase" : "toString"]();
            return {
                name,
                set,
                source,
                displayText,
            };
        }
    }
    ,

    reward: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_REWARDS;
        static _FILENAME = "rewards.json";
    }
    ,

    rewardFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_REWARDS;
        static _FILENAME = "fluff-rewards.json";
    }
    ,

    trap: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_TRAPS_HAZARDS;
        static _FILENAME = "trapshazards.json";
    }
    ,

    trapFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_TRAPS_HAZARDS;
        static _FILENAME = "fluff-trapshazards.json";
    }
    ,

    hazard: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_TRAPS_HAZARDS;
        static _FILENAME = "trapshazards.json";
    }
    ,

    hazardFluff: class extends _DataUtilPropConfigSingleSource {
        static _PAGE = UrlUtil.PG_TRAPS_HAZARDS;
        static _FILENAME = "fluff-trapshazards.json";
    }
    ,

    quickreference: {
        unpackUid(uid, opts) {
            opts = opts || {};
            if (opts.isLower)
                uid = uid.toLowerCase();
            let[name,source,ixChapter,ixHeader,displayText] = uid.split("|").map(it=>it.trim());
            source = source || (opts.isLower ? Parser.SRC_PHB.toLowerCase() : Parser.SRC_PHB);
            ixChapter = Number(ixChapter || 0);
            return {
                name,
                ixChapter,
                ixHeader,
                source,
                displayText,
            };
        },
    },

    brew: new _DataUtilBrewHelper({
        defaultUrlRoot: VeCt.URL_ROOT_BREW
    }),
    prerelease: new _DataUtilBrewHelper({
        defaultUrlRoot: VeCt.URL_ROOT_PRERELEASE
    }),
};