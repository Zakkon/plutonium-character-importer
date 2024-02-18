function MixinProxyBase(Cls) {
    class MixedProxyBase extends Cls {
        constructor(...args) {
            super(...args);
            this.__hooks = {};
            this.__hooksAll = {};
            this.__hooksTmp = null;
            this.__hooksAllTmp = null;
        }

        _getProxy(hookProp, toProxy) {
            return new Proxy(toProxy,{
                set: (object,prop,value)=>{
                    return this._doProxySet(hookProp, object, prop, value);
                }
                ,
                deleteProperty: (object,prop)=>{
                    if (!(prop in object))
                        return true;
                    const prevValue = object[prop];
                    Reflect.deleteProperty(object, prop);
                    this._doFireHooksAll(hookProp, prop, undefined, prevValue);
                    if (this.__hooks[hookProp] && this.__hooks[hookProp][prop])
                        this.__hooks[hookProp][prop].forEach(hook=>hook(prop, undefined, prevValue));
                    return true;
                }
                ,
            });
        }

        _doProxySet(hookProp, object, prop, value) {
            if (object[prop] === value)
                return true;
            const prevValue = object[prop];
            Reflect.set(object, prop, value);
            this._doFireHooksAll(hookProp, prop, value, prevValue);
            this._doFireHooks(hookProp, prop, value, prevValue);
            return true;
        }

        async _pDoProxySet(hookProp, object, prop, value) {
            if (object[prop] === value)
                return true;
            const prevValue = object[prop];
            Reflect.set(object, prop, value);
            if (this.__hooksAll[hookProp])
                for (const hook of this.__hooksAll[hookProp])
                    await hook(prop, value, prevValue);
            if (this.__hooks[hookProp] && this.__hooks[hookProp][prop])
                for (const hook of this.__hooks[hookProp][prop])
                    await hook(prop, value, prevValue);
            return true;
        }

        _doFireHooks(hookProp, prop, value, prevValue) {
            if (this.__hooks[hookProp] && this.__hooks[hookProp][prop])
                this.__hooks[hookProp][prop].forEach(hook=>hook(prop, value, prevValue));
        }

        _doFireHooksAll(hookProp, prop, value, prevValue) {
            if (this.__hooksAll[hookProp])
                this.__hooksAll[hookProp].forEach(hook=>hook(prop, undefined, prevValue));
        }

        _doFireAllHooks(hookProp) {
            if (this.__hooks[hookProp])
                Object.entries(this.__hooks[hookProp]).forEach(([prop,hk])=>hk(prop));
        }

        _addHook(hookProp, prop, hook) {
            ProxyBase._addHook_to(this.__hooks, hookProp, prop, hook);
            if (this.__hooksTmp)
                ProxyBase._addHook_to(this.__hooksTmp, hookProp, prop, hook);
            return hook;
        }

        static _addHook_to(obj, hookProp, prop, hook) {
            ((obj[hookProp] = obj[hookProp] || {})[prop] = (obj[hookProp][prop] || [])).push(hook);
        }

        _addHookAll(hookProp, hook) {
            ProxyBase._addHookAll_to(this.__hooksAll, hookProp, hook);
            if (this.__hooksAllTmp)
                ProxyBase._addHookAll_to(this.__hooksAllTmp, hookProp, hook);
            return hook;
        }

        static _addHookAll_to(obj, hookProp, hook) {
            (obj[hookProp] = obj[hookProp] || []).push(hook);
        }

        _removeHook(hookProp, prop, hook) {
            ProxyBase._removeHook_from(this.__hooks, hookProp, prop, hook);
            if (this.__hooksTmp)
                ProxyBase._removeHook_from(this.__hooksTmp, hookProp, prop, hook);
        }

        static _removeHook_from(obj, hookProp, prop, hook) {
            if (obj[hookProp] && obj[hookProp][prop]) {
                const ix = obj[hookProp][prop].findIndex(hk=>hk === hook);
                if (~ix)
                    obj[hookProp][prop].splice(ix, 1);
            }
        }

        _removeHooks(hookProp, prop) {
            if (this.__hooks[hookProp])
                delete this.__hooks[hookProp][prop];
            if (this.__hooksTmp && this.__hooksTmp[hookProp])
                delete this.__hooksTmp[hookProp][prop];
        }

        _removeHookAll(hookProp, hook) {
            ProxyBase._removeHookAll_from(this.__hooksAll, hookProp, hook);
            if (this.__hooksAllTmp)
                ProxyBase._removeHook_from(this.__hooksAllTmp, hookProp, hook);
        }

        static _removeHookAll_from(obj, hookProp, hook) {
            if (obj[hookProp]) {
                const ix = obj[hookProp].findIndex(hk=>hk === hook);
                if (~ix)
                    obj[hookProp].splice(ix, 1);
            }
        }

        _resetHooks(hookProp) {
            if (hookProp !== undefined)
                delete this.__hooks[hookProp];
            else
                Object.keys(this.__hooks).forEach(prop=>delete this.__hooks[prop]);
        }

        _resetHooksAll(hookProp) {
            if (hookProp !== undefined)
                delete this.__hooksAll[hookProp];
            else
                Object.keys(this.__hooksAll).forEach(prop=>delete this.__hooksAll[prop]);
        }

        _saveHookCopiesTo(obj) {
            this.__hooksTmp = obj;
        }
        _saveHookAllCopiesTo(obj) {
            this.__hooksAllTmp = obj;
        }

        _proxyAssign(hookProp, proxyProp, underProp, toObj, isOverwrite) {
            const oldKeys = Object.keys(this[proxyProp]);
            const nuKeys = new Set(Object.keys(toObj));
            const dirtyKeyValues = {};

            if (isOverwrite) {
                oldKeys.forEach(k=>{
                    if (!nuKeys.has(k) && this[underProp] !== undefined) {
                        const prevValue = this[proxyProp][k];
                        delete this[underProp][k];
                        dirtyKeyValues[k] = prevValue;
                    }
                }
                );
            }

            nuKeys.forEach(k=>{
                if (!CollectionUtil.deepEquals(this[underProp][k], toObj[k])) {
                    const prevValue = this[proxyProp][k];
                    this[underProp][k] = toObj[k];
                    dirtyKeyValues[k] = prevValue;
                }
            }
            );

            Object.entries(dirtyKeyValues).forEach(([k,prevValue])=>{
                this._doFireHooksAll(hookProp, k, this[underProp][k], prevValue);
                if (this.__hooks[hookProp] && this.__hooks[hookProp][k])
                    this.__hooks[hookProp][k].forEach(hk=>hk(k, this[underProp][k], prevValue));
            }
            );
        }

        _proxyAssignSimple(hookProp, toObj, isOverwrite) {
            return this._proxyAssign(hookProp, `_${hookProp}`, `__${hookProp}`, toObj, isOverwrite);
        }
    }

    return MixedProxyBase;
}

class ProxyBase extends MixinProxyBase(class {}) {
}
export {ProxyBase}