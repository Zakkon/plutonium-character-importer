import { Util } from "../veTools/utils.js";
class UtilDocuments {
    static async pCreateDocument(Clazz, docData, {isRender=true, isKeepId=true, isTemporary=false}={}) {
        docData = foundry.utils.flattenObject(docData);

        const out = await Clazz.create(docData, {
            renderSheet: false,
            render: isRender,
            keepId: isKeepId,
            temporary: isTemporary
        });

        if (isTemporary)
            out._isTempImportedDoc = true;

        return out;
    }

    static async pUpdateDocument(doc, docUpdate, {isRender=true, isTemporary=false, isDiff=null, isRecursive=null, isNoHook=null}={}) {
        docUpdate = foundry.utils.flattenObject(docUpdate);

        if (Util.isDebug())
            MiscUtil.set(docUpdate, "flags", "canary", "coalmine", Date.now());

        if (this.isTempDocument({
            doc,
            isTemporary
        })) {
            if (isDiff != null || isRecursive != null || isNoHook != null) {
                throw new Error(`Extra options ("isDiff", "isRecursive", "isNoHook") in temporary document updates are not supported!`);
            }

            foundry.utils.mergeObject(doc.system, docUpdate);

            return doc;
        }

        const opts = {
            render: isRender
        };
        if (isDiff != null)
            opts.diff = isDiff;
        if (isRecursive != null)
            opts.recursive = isRecursive;
        if (isNoHook != null)
            opts.noHook = isNoHook;

        return doc.update(docUpdate, opts);
    }

    static isTempDocument({isTemporary, doc}) {
        return isTemporary || doc?.id == null || doc?._isTempImportedDoc;
    }

    static async pCreateEmbeddedDocuments(doc, embedArray, {isTemporary=false, ClsEmbed, isKeepId=true, isKeepEmbeddedIds=true, isRender=true, }, ) {
        if (!embedArray?.length)
            return [];

        let createdEmbeds;

        if (this.isTempDocument({
            doc,
            isTemporary
        })) {
            embedArray.forEach(embed=>{
                this._setTempId(embed);
                (embed.effects || []).forEach(effect=>this._setTempId(effect));
            }
            );

            createdEmbeds = await ClsEmbed.create(embedArray.map(it=>foundry.utils.flattenObject(it)), {
                temporary: true,
                parent: doc
            });

            createdEmbeds.forEach(createdEmbed=>{
                doc[ClsEmbed.metadata.collection].set(createdEmbed.id, createdEmbed);

                (createdEmbed.effects || []).forEach(effect=>{
                    doc.effects.set(effect.id, effect);
                }
                );
            }
            );
        } else {
            createdEmbeds = await doc.createEmbeddedDocuments(ClsEmbed.metadata.name, embedArray.map(it=>foundry.utils.flattenObject(it)), {
                keepId: isKeepId,
                keepEmbeddedIds: isKeepEmbeddedIds,
                render: isRender,
            }, );
        }

        if (embedArray.length !== createdEmbeds.length)
            throw new Error(`Number of returned items did not match number of input items!`);
        return embedArray.map((raw,i)=>new UtilDocuments.ImportedEmbeddedDocument({
            raw,
            document: createdEmbeds[i]
        }));
    }

    static _setTempId(ent) {
        if (!ent._id && !ent.id)
            ent._id = foundry.utils.randomID();
        if (ent._id && !ent.id)
            ent.id = ent._id;
        if (!ent._id && ent.id)
            ent._id = ent.id;
    }

    static async pUpdateEmbeddedDocuments(doc, updateArray, {isTemporary=false, ClsEmbed, isRender=true, }, ) {
        if (!updateArray?.length)
            return [];

        if (Util.isDebug())
            updateArray.forEach(ud=>MiscUtil.set(ud, "flags", "canary", "coalmine", Date.now()));

        let updatedEmbeds;

        if (this.isTempDocument({
            doc,
            isTemporary
        })) {
            const updateTuples = updateArray.map(update=>{
                if (!update._id)
                    throw new Error(`Update had no "_id"!`);
                const embed = doc[ClsEmbed.metadata.collection].get(update._id);
                if (!embed)
                    throw new Error(`${ClsEmbed.metadata.name} with id "${update._id}" not found in parent document!`);
                return {
                    update,
                    embed
                };
            }
            );

            updateTuples.forEach(({update, embed})=>{
                foundry.utils.mergeObject(embed.system, MiscUtil.copy(update));

                Object.keys(embed.system._source).filter(k=>update[k]).forEach(k=>foundry.utils.mergeObject(embed.system._source[k], MiscUtil.copy(update[k])));
            }
            );

            updatedEmbeds = updateTuples.map(it=>it.embed);
        } else {
            if (Util.isDebug()) {
                updateArray.forEach(update=>{
                    if (!update._id)
                        throw new Error(`Update had no "_id"!`);
                    const embed = doc[ClsEmbed.metadata.collection].get(update._id);
                    if (!embed)
                        throw new Error(`${ClsEmbed.metadata.name} with id "${update._id}" not found in parent document!`);
                }
                );
            }

            const updatedEmbedsRaw = await doc.updateEmbeddedDocuments(ClsEmbed.metadata.name, updateArray.map(it=>foundry.utils.flattenObject(it)), {
                render: isRender
            }, );
            if (updateArray.length === updatedEmbedsRaw.length) {
                updatedEmbeds = updatedEmbedsRaw;
            } else {
                updatedEmbeds = updateArray.map(({_id})=>updateArray.find(it=>it.id === _id) || doc[ClsEmbed.metadata.collection].get(_id));
            }
        }

        if (updateArray.length !== updatedEmbeds.length)
            throw new Error(`Number of returned items did not match number of input items!`);
        return updateArray.map((raw,i)=>new UtilDocuments.ImportedEmbeddedDocument({
            raw,
            document: updatedEmbeds[i],
            isUpdate: true
        }));
    }

    static async pDeleteEmbeddedDocuments(doc, deleteArray, {isTemporary=false, ClsEmbed, }, ) {
        if (!deleteArray?.length)
            return [];

        if (this.isTempDocument({
            doc,
            isTemporary
        })) {
            throw new Error(`Deleting embedded documents from a temporary document is not supported! This is a bug!`);
        } else {
            await doc.deleteEmbeddedDocuments(ClsEmbed.metadata.name, deleteArray);
        }

    }
}

UtilDocuments.ImportedEmbeddedDocument = class {
    constructor({raw, document, isUpdate=false}) {
        this.raw = raw;
        this.document = document;
        this.isUpdate = isUpdate;
    }
}
;

class UtilDocumentItem {
    static getNameAsIdentifier(name) {
        return name.slugify({
            strict: true
        });
    }

    static getPrice({cp}) {
        if (!UtilVersions.getSystemVersion().isVersionTwoOnePlus)
            return (cp || 0) / 100;

        const singleCurrency = CurrencyUtil.getAsSingleCurrency({
            cp
        });
        const [denomination,value] = Object.entries(singleCurrency)[0];

        return {
            value,
            denomination,
        };
    }

    static TYPE_WEAPON = "weapon";
    static TYPE_TOOL = "tool";
    static TYPE_CONSUMABLE = "consumable";
    static TYPE_EQUIPMENT = "equipment";
    static TYPE_BACKPACK = "backpack";
    static TYPE_LOOT = "loot";

    static TYPES_ITEM = new Set([this.TYPE_WEAPON, this.TYPE_TOOL, this.TYPE_CONSUMABLE, this.TYPE_EQUIPMENT, this.TYPE_BACKPACK, this.TYPE_LOOT, ]);

    static TYPES_ITEM_ORDERED = [this.TYPE_WEAPON, this.TYPE_TOOL, this.TYPE_CONSUMABLE, this.TYPE_EQUIPMENT, this.TYPE_BACKPACK, this.TYPE_LOOT, ];
}
class UtilDocumentSource {
    static _SOURCE_PAGE_PREFIX = " pg. ";

    static getSourceObjectFromEntity(ent) {
        return {
            custom: "",
            book: ent.source ? Parser.sourceJsonToAbv(ent.source) : "",
            page: ent.page != null ? `${ent.page}` : "",
            license: ent.src ? "CC-BY-4.0" : "",
        };
    }

    static _getSourceObjectFromDocument(doc) {
        if (!doc)
            return null;

        let sourceObj = doc.system?.source || doc.system?.details?.source || doc.source;

        if (sourceObj instanceof Array)
            sourceObj = sourceObj[0];

        return sourceObj;
    }

    static _SOURCE_PAGE_PREFIX_RE = new RegExp(`${this._SOURCE_PAGE_PREFIX}\\d+`);

    static getDocumentSource(doc) {
        if (doc.flags?.[SharedConsts.MODULE_ID]?.source) {
            return new _DocumentSourceInfo({
                source: doc.flags?.[SharedConsts.MODULE_ID]?.source,
                isExact: true,
            });
        }

        const sourceObj = this._getSourceObjectFromDocument(doc);
        return this._getDocumentSourceFromSourceObject({
            sourceObj
        });
    }

    static _getDocumentSourceFromSourceObject({sourceObj}) {
        if (!sourceObj)
            return new _DocumentSourceInfo({
                source: null
            });

        if (sourceObj.book && sourceObj.book.trim()) {
            return new _DocumentSourceInfo({
                source: sourceObj.book.trim()
            });
        }

        const source = (sourceObj.custom || "").split(this._SOURCE_PAGE_PREFIX_RE)[0].trim();
        return new _DocumentSourceInfo({
            source
        });
    }

    static getDocumentSourceDisplayString(doc) {
        const docSourceInfo = this.getDocumentSource(doc);
        if (docSourceInfo.source == null)
            return "Unknown Source";
        return docSourceInfo.source;
    }

    static getDocumentSourceIdentifierString({doc, entity}) {
        if (doc && entity)
            throw new Error(`Only one of "doc" or "entity" should be provided!`);

        const sourceObj = entity ? this.getSourceObjectFromEntity(entity) : this._getSourceObjectFromDocument(doc);
        if (!sourceObj)
            return "unknown source";

        return this._getDocumentSourceFromSourceObject({
            sourceObj
        }).source.toLowerCase().trim();
    }
}
export {UtilDocuments, UtilDocumentItem, UtilDocumentSource}