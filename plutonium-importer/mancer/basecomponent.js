import { ProxyBase } from "./proxybase.js";

function MixinBaseComponent(Cls) {
    class MixedBaseComponent extends Cls {
        constructor(...args) {
            super(...args);

            this.__locks = {};
            this.__rendered = {};

            this.__state = {
                ...this._getDefaultState()
            };
            this._state = this._getProxy("state", this.__state);
        }

        _addHookBase(prop, hook) {
            return this._addHook("state", prop, hook);
        }

        _removeHookBase(prop, hook) {
            return this._removeHook("state", prop, hook);
        }

        _removeHooksBase(prop) {
            return this._removeHooks("state", prop);
        }

        _addHookAllBase(hook) {
            return this._addHookAll("state", hook);
        }

        _removeHookAllBase(hook) {
            return this._removeHookAll("state", hook);
        }

        _setState(toState) {
            this._proxyAssign("state", "_state", "__state", toState, true);
        }

        _setStateValue(prop, value, {isForceTriggerHooks=true}={}) {
            if (this._state[prop] === value && !isForceTriggerHooks)
                return value;
            if (this._state[prop] !== value)
                return this._state[prop] = value;

            this._doFireHooksAll("state", prop, value, value);
            this._doFireHooks("state", prop, value, value);
            return value;
        }

        _getState() {
            return MiscUtil.copyFast(this.__state);
        }

        getPod() {
            this.__pod = this.__pod || {
                get: (prop)=>this._state[prop],
                set: (prop,val)=>this._state[prop] = val,
                delete: (prop)=>delete this._state[prop],
                addHook: (prop,hook)=>this._addHookBase(prop, hook),
                addHookAll: (hook)=>this._addHookAllBase(hook),
                removeHook: (prop,hook)=>this._removeHookBase(prop, hook),
                removeHookAll: (hook)=>this._removeHookAllBase(hook),
                triggerCollectionUpdate: (prop)=>this._triggerCollectionUpdate(prop),
                setState: (state)=>this._setState(state),
                getState: ()=>this._getState(),
                assign: (toObj,isOverwrite)=>this._proxyAssign("state", "_state", "__state", toObj, isOverwrite),
                pLock: lockName=>this._pLock(lockName),
                unlock: lockName=>this._unlock(lockName),
                component: this,
            };
            return this.__pod;
        }

        _getDefaultState() {
            return {};
        }

        getBaseSaveableState() {
            return {
                state: MiscUtil.copyFast(this.__state),
            };
        }

        setBaseSaveableStateFrom(toLoad, isOverwrite=false) {
            toLoad?.state && this._proxyAssignSimple("state", toLoad.state, isOverwrite);
        }

        _getRenderedCollection(opts) {
            opts = opts || {};
            const renderedLookupProp = opts.namespace ? `${opts.namespace}.${opts.prop}` : opts.prop;
            return (this.__rendered[renderedLookupProp] = this.__rendered[renderedLookupProp] || {});
        }

        _renderCollection(opts) {
            opts = opts || {};

            const rendered = this._getRenderedCollection(opts);
            const entities = this._state[opts.prop] || [];
            return this._renderCollection_doRender(rendered, entities, opts);
        }

        _renderCollection_doRender(rendered, entities, opts) {
            opts = opts || {};

            const toDelete = new Set(Object.keys(rendered));

            for (let i = 0; i < entities.length; ++i) {
                const it = entities[i];

                if (it.id == null)
                    throw new Error(`Collection item did not have an ID!`);
                const meta = rendered[it.id];

                toDelete.delete(it.id);
                if (meta) {
                    if (opts.isDiffMode) {
                        const nxtHash = this._getCollectionEntityHash(it);
                        if (nxtHash !== meta.__hash)
                            meta.__hash = nxtHash;
                        else
                            continue;
                    }

                    meta.data = it;
                    opts.fnUpdateExisting(meta, it, i);
                } else {
                    const meta = opts.fnGetNew(it, i);

                    if (meta == null)
                        continue;

                    meta.data = it;
                    if (!meta.$wrpRow && !meta.fnRemoveEles)
                        throw new Error(`A "$wrpRow" or a "fnRemoveEles" property is required for deletes!`);

                    if (opts.isDiffMode)
                        meta.__hash = this._getCollectionEntityHash(it);

                    rendered[it.id] = meta;
                }
            }

            const doRemoveElements = meta=>{
                if (meta.$wrpRow)
                    meta.$wrpRow.remove();
                if (meta.fnRemoveEles)
                    meta.fnRemoveEles();
            }
            ;

            toDelete.forEach(id=>{
                const meta = rendered[id];
                doRemoveElements(meta);
                delete rendered[id];
                if (opts.fnDeleteExisting)
                    opts.fnDeleteExisting(meta);
            }
            );

            if (opts.fnReorderExisting) {
                entities.forEach((it,i)=>{
                    const meta = rendered[it.id];
                    opts.fnReorderExisting(meta, it, i);
                }
                );
            }
        }

        async _pRenderCollection(opts) {
            opts = opts || {};

            const rendered = this._getRenderedCollection(opts);
            const entities = this._state[opts.prop] || [];
            return this._pRenderCollection_doRender(rendered, entities, opts);
        }

        async _pRenderCollection_doRender(rendered, entities, opts) {
            opts = opts || {};

            const toDelete = new Set(Object.keys(rendered));

            for (let i = 0; i < entities.length; ++i) {
                const it = entities[i];

                if (!it.id)
                    throw new Error(`Collection item did not have an ID!`);
                const meta = rendered[it.id];

                toDelete.delete(it.id);
                if (meta) {
                    if (opts.isDiffMode) {
                        const nxtHash = this._getCollectionEntityHash(it);
                        if (nxtHash !== meta.__hash)
                            meta.__hash = nxtHash;
                        else
                            continue;
                    }

                    const nxtMeta = await opts.pFnUpdateExisting(meta, it);
                    if (opts.isMultiRender)
                        rendered[it.id] = nxtMeta;
                } else {
                    const meta = await opts.pFnGetNew(it);

                    if (meta == null)
                        continue;

                    if (!opts.isMultiRender && !meta.$wrpRow && !meta.fnRemoveEles)
                        throw new Error(`A "$wrpRow" or a "fnRemoveEles" property is required for deletes!`);
                    if (opts.isMultiRender && meta.some(it=>!it.$wrpRow && !it.fnRemoveEles))
                        throw new Error(`A "$wrpRow" or a "fnRemoveEles" property is required for deletes!`);

                    if (opts.isDiffMode)
                        meta.__hash = this._getCollectionEntityHash(it);

                    rendered[it.id] = meta;
                }
            }

            const doRemoveElements = meta=>{
                if (meta.$wrpRow)
                    meta.$wrpRow.remove();
                if (meta.fnRemoveEles)
                    meta.fnRemoveEles();
            }
            ;

            for (const id of toDelete) {
                const meta = rendered[id];
                if (opts.isMultiRender)
                    meta.forEach(it=>doRemoveElements(it));
                else
                    doRemoveElements(meta);
                if (opts.additionalCaches)
                    opts.additionalCaches.forEach(it=>delete it[id]);
                delete rendered[id];
                if (opts.pFnDeleteExisting)
                    await opts.pFnDeleteExisting(meta);
            }

            if (opts.pFnReorderExisting) {
                await entities.pSerialAwaitMap(async(it,i)=>{
                    const meta = rendered[it.id];
                    await opts.pFnReorderExisting(meta, it, i);
                }
                );
            }
        }

        _detachCollection(prop, namespace=null) {
            const renderedLookupProp = namespace ? `${namespace}.${prop}` : prop;
            const rendered = (this.__rendered[renderedLookupProp] = this.__rendered[renderedLookupProp] || {});
            Object.values(rendered).forEach(it=>it.$wrpRow.detach());
        }

        _resetCollectionRenders(prop, namespace=null) {
            const renderedLookupProp = namespace ? `${namespace}.${prop}` : prop;
            const rendered = (this.__rendered[renderedLookupProp] = this.__rendered[renderedLookupProp] || {});
            Object.values(rendered).forEach(it=>it.$wrpRow.remove());
            delete this.__rendered[renderedLookupProp];
        }

        _getCollectionEntityHash(ent) {
            return CryptUtil.md5(JSON.stringify(ent));
        }

        render() {
            throw new Error("Unimplemented!");
        }

        getSaveableState() {
            return {
                ...this.getBaseSaveableState()
            };
        }
        setStateFrom(toLoad, isOverwrite=false) {
            this.setBaseSaveableStateFrom(toLoad, isOverwrite);
        }

        async _pLock(lockName) {
            while (this.__locks[lockName])
                await this.__locks[lockName].lock;
            let unlock = null;
            const lock = new Promise(resolve=>unlock = resolve);
            this.__locks[lockName] = {
                lock,
                unlock,
            };
        }

        async _pGate(lockName) {
            while (this.__locks[lockName])
                await this.__locks[lockName].lock;
        }

        _unlock(lockName) {
            const lockMeta = this.__locks[lockName];
            if (lockMeta) {
                delete this.__locks[lockName];
                lockMeta.unlock();
            }
        }

        async _pDoProxySetBase(prop, value) {
            return this._pDoProxySet("state", this.__state, prop, value);
        }

        _triggerCollectionUpdate(prop) {
            if (!this._state[prop])
                return;
            this._state[prop] = [...this._state[prop]];
        }

        static _toCollection(array) {
            if (array)
                return array.map(it=>({
                    id: CryptUtil.uid(),
                    entity: it
                }));
        }

        static _fromCollection(array) {
            if (array)
                return array.map(it=>it.entity);
        }

        static fromObject(obj, ...noModCollections) {
            const comp = new this();
            Object.entries(MiscUtil.copyFast(obj)).forEach(([k,v])=>{
                if (v == null)
                    comp.__state[k] = v;
                else if (noModCollections.includes(k) || noModCollections.includes("*"))
                    comp.__state[k] = v;
                else if (typeof v === "object" && v instanceof Array)
                    comp.__state[k] = BaseComponent$1._toCollection(v);
                else
                    comp.__state[k] = v;
            }
            );
            return comp;
        }

        static fromObjectNoMod(obj) {
            return this.fromObject(obj, "*");
        }

        toObject(...noModCollections) {
            const cpy = MiscUtil.copyFast(this.__state);
            Object.entries(cpy).forEach(([k,v])=>{
                if (v == null)
                    return;

                if (noModCollections.includes(k) || noModCollections.includes("*"))
                    cpy[k] = v;
                else if (v instanceof Array && v.every(it=>it && it.id))
                    cpy[k] = BaseComponent$1._fromCollection(v);
            }
            );
            return cpy;
        }

        toObjectNoMod() {
            return this.toObject("*");
        }
    }

    return MixedBaseComponent;
}

class BaseComponent extends MixinBaseComponent(ProxyBase) {
}

export {BaseComponent}