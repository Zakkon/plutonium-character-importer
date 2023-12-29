globalThis.MiscUtil = {
    COLOR_HEALTHY: "#00bb20",
    COLOR_HURT: "#c5ca00",
    COLOR_BLOODIED: "#f7a100",
    COLOR_DEFEATED: "#cc0000",

    copy(obj, {isSafe=false, isPreserveUndefinedValueKeys=false}={}) {
        if (isSafe && obj === undefined)
            return undefined;
        return JSON.parse(JSON.stringify(obj));
    },

    copyFast(obj) {
        if ((typeof obj !== "object") || obj == null)
            return obj;

        if (obj instanceof Array)
            return obj.map(MiscUtil.copyFast);

        const cpy = {};
        for (const k of Object.keys(obj))
            cpy[k] = MiscUtil.copyFast(obj[k]);
        return cpy;
    },

    async pCopyTextToClipboard(text) {
        function doCompatibilityCopy() {
            const $iptTemp = $(`<textarea class="clp__wrp-temp"></textarea>`).appendTo(document.body).val(text).select();
            document.execCommand("Copy");
            $iptTemp.remove();
        }

        if (navigator && navigator.permissions) {
            try {
                const access = await navigator.permissions.query({
                    name: "clipboard-write"
                });
                if (access.state === "granted" || access.state === "prompt") {
                    await navigator.clipboard.writeText(text);
                } else
                    doCompatibilityCopy();
            } catch (e) {
                doCompatibilityCopy();
            }
        } else
            doCompatibilityCopy();
    },

    checkProperty(object, ...path) {
        for (let i = 0; i < path.length; ++i) {
            object = object[path[i]];
            if (object == null)
                return false;
        }
        return true;
    },

    get(object, ...path) {
        if (object == null)
            return null;
        for (let i = 0; i < path.length; ++i) {
            object = object[path[i]];
            if (object == null)
                return object;
        }
        return object;
    },

    set(object, ...pathAndVal) {
        if (object == null)
            return null;

        const val = pathAndVal.pop();
        if (!pathAndVal.length)
            return null;

        const len = pathAndVal.length;
        for (let i = 0; i < len; ++i) {
            const pathPart = pathAndVal[i];
            if (i === len - 1)
                object[pathPart] = val;
            else
                object = (object[pathPart] = object[pathPart] || {});
        }

        return val;
    },

    getOrSet(object, ...pathAndVal) {
        if (pathAndVal.length < 2)
            return null;
        const existing = MiscUtil.get(object, ...pathAndVal.slice(0, -1));
        if (existing != null)
            return existing;
        return MiscUtil.set(object, ...pathAndVal);
    },

    getThenSetCopy(object1, object2, ...path) {
        const val = MiscUtil.get(object1, ...path);
        return MiscUtil.set(object2, ...path, MiscUtil.copyFast(val, {
            isSafe: true
        }));
    },

    delete(object, ...path) {
        if (object == null)
            return object;
        for (let i = 0; i < path.length - 1; ++i) {
            object = object[path[i]];
            if (object == null)
                return object;
        }
        return delete object[path.last()];
    },

    deleteObjectPath(object, ...path) {
        const stack = [object];

        if (object == null)
            return object;
        for (let i = 0; i < path.length - 1; ++i) {
            object = object[path[i]];
            stack.push(object);
            if (object === undefined)
                return object;
        }
        const out = delete object[path.last()];

        for (let i = path.length - 1; i > 0; --i) {
            if (!Object.keys(stack[i]).length)
                delete stack[i - 1][path[i - 1]];
        }

        return out;
    },

    merge(obj1, obj2) {
        obj2 = MiscUtil.copyFast(obj2);

        Object.entries(obj2).forEach(([k,v])=>{
            if (obj1[k] == null) {
                obj1[k] = v;
                return;
            }

            if (typeof obj1[k] === "object" && typeof v === "object" && !(obj1[k]instanceof Array) && !(v instanceof Array)) {
                MiscUtil.merge(obj1[k], v);
                return;
            }

            obj1[k] = v;
        }
        );

        return obj1;
    },

    mix: (superclass)=>new MiscUtil._MixinBuilder(superclass),
    _MixinBuilder: function(superclass) {
        this.superclass = superclass;

        this.with = function(...mixins) {
            return mixins.reduce((c,mixin)=>mixin(c), this.superclass);
        }
        ;
    },

    clearSelection() {
        if (document.getSelection) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(document.createRange());
        } else if (window.getSelection) {
            if (window.getSelection().removeAllRanges) {
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(document.createRange());
            } else if (window.getSelection().empty) {
                window.getSelection().empty();
            }
        } else if (document.selection) {
            document.selection.empty();
        }
    },

    randomColor() {
        let r;
        let g;
        let b;
        const h = RollerUtil.randomise(30, 0) / 30;
        const i = ~~(h * 6);
        const f = h * 6 - i;
        const q = 1 - f;
        switch (i % 6) {
        case 0:
            r = 1;
            g = f;
            b = 0;
            break;
        case 1:
            r = q;
            g = 1;
            b = 0;
            break;
        case 2:
            r = 0;
            g = 1;
            b = f;
            break;
        case 3:
            r = 0;
            g = q;
            b = 1;
            break;
        case 4:
            r = f;
            g = 0;
            b = 1;
            break;
        case 5:
            r = 1;
            g = 0;
            b = q;
            break;
        }
        return `#${`00${(~~(r * 255)).toString(16)}`.slice(-2)}${`00${(~~(g * 255)).toString(16)}`.slice(-2)}${`00${(~~(b * 255)).toString(16)}`.slice(-2)}`;
    },

    invertColor(hex, opts) {
        opts = opts || {};

        hex = hex.slice(1);
        let r = parseInt(hex.slice(0, 2), 16);
        let g = parseInt(hex.slice(2, 4), 16);
        let b = parseInt(hex.slice(4, 6), 16);

        const isDark = (r * 0.299 + g * 0.587 + b * 0.114) > 186;
        if (opts.dark && opts.light)
            return isDark ? opts.dark : opts.light;
        else if (opts.bw)
            return isDark ? "#000000" : "#FFFFFF";

        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        return `#${[r, g, b].map(it=>it.padStart(2, "0")).join("")}`;
    },

    scrollPageTop() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    },

    expEval(str) {
        return new Function(`return ${str.replace(/[^-()\d/*+.]/g, "")}`)();
    },

    parseNumberRange(input, min=Number.MIN_SAFE_INTEGER, max=Number.MAX_SAFE_INTEGER) {
        if (!input || !input.trim())
            return null;

        const errInvalid = input=>{
            throw new Error(`Could not parse range input "${input}"`);
        }
        ;

        const errOutOfRange = ()=>{
            throw new Error(`Number was out of range! Range was ${min}-${max} (inclusive).`);
        }
        ;

        const isOutOfRange = (num)=>num < min || num > max;

        const addToRangeVal = (range,num)=>range.add(num);

        const addToRangeLoHi = (range,lo,hi)=>{
            for (let i = lo; i <= hi; ++i)
                range.add(i);
        }
        ;

        const clean = input.replace(/\s*/g, "");
        if (!/^((\d+-\d+|\d+),)*(\d+-\d+|\d+)$/.exec(clean))
            errInvalid();

        const parts = clean.split(",");
        const out = new Set();

        for (const part of parts) {
            if (part.includes("-")) {
                const spl = part.split("-");
                const numLo = Number(spl[0]);
                const numHi = Number(spl[1]);

                if (isNaN(numLo) || isNaN(numHi) || numLo === 0 || numHi === 0 || numLo > numHi)
                    errInvalid();

                if (isOutOfRange(numLo) || isOutOfRange(numHi))
                    errOutOfRange();

                if (numLo === numHi)
                    addToRangeVal(out, numLo);
                else
                    addToRangeLoHi(out, numLo, numHi);
                continue;
            }

            const num = Number(part);
            if (isNaN(num) || num === 0)
                errInvalid();

            if (isOutOfRange(num))
                errOutOfRange();
            addToRangeVal(out, num);
        }

        return out;
    },

    findCommonPrefix(strArr, {isRespectWordBoundaries}={}) {
        if (isRespectWordBoundaries) {
            return MiscUtil._findCommonPrefixSuffixWords({
                strArr
            });
        }

        let prefix = null;
        strArr.forEach(s=>{
            if (prefix == null) {
                prefix = s;
                return;
            }

            const minLen = Math.min(s.length, prefix.length);
            for (let i = 0; i < minLen; ++i) {
                const cp = prefix[i];
                const cs = s[i];
                if (cp !== cs) {
                    prefix = prefix.substring(0, i);
                    break;
                }
            }
        }
        );
        return prefix;
    },

    findCommonSuffix(strArr, {isRespectWordBoundaries}={}) {
        if (!isRespectWordBoundaries)
            throw new Error(`Unimplemented!`);

        return MiscUtil._findCommonPrefixSuffixWords({
            strArr,
            isSuffix: true
        });
    },

    _findCommonPrefixSuffixWords({strArr, isSuffix}) {
        let prefixTks = null;
        let lenMax = -1;

        strArr.map(str=>{
            lenMax = Math.max(lenMax, str.length);
            return str.split(" ");
        }
        ).forEach(tks=>{
            if (isSuffix)
                tks.reverse();

            if (prefixTks == null)
                return prefixTks = [...tks];

            const minLen = Math.min(tks.length, prefixTks.length);
            while (prefixTks.length > minLen)
                prefixTks.pop();

            for (let i = 0; i < minLen; ++i) {
                const cp = prefixTks[i];
                const cs = tks[i];
                if (cp !== cs) {
                    prefixTks = prefixTks.slice(0, i);
                    break;
                }
            }
        }
        );

        if (isSuffix)
            prefixTks.reverse();

        if (!prefixTks.length)
            return "";

        const out = prefixTks.join(" ");
        if (out.length === lenMax)
            return out;

        return isSuffix ? ` ${prefixTks.join(" ")}` : `${prefixTks.join(" ")} `;
    },

    calculateBlendedColor(fgHexTarget, fgOpacity, bgHex) {
        const fgDcTarget = CryptUtil.hex2Dec(fgHexTarget);
        const bgDc = CryptUtil.hex2Dec(bgHex);
        return ((fgDcTarget - ((1 - fgOpacity) * bgDc)) / fgOpacity).toString(16);
    },

    debounce(func, wait, options) {
        let lastArgs;
        let lastThis;
        let maxWait;
        let result;
        let timerId;
        let lastCallTime;
        let lastInvokeTime = 0;
        let leading = false;
        let maxing = false;
        let trailing = true;

        wait = Number(wait) || 0;
        if (typeof options === "object") {
            leading = !!options.leading;
            maxing = "maxWait"in options;
            maxWait = maxing ? Math.max(Number(options.maxWait) || 0, wait) : maxWait;
            trailing = "trailing"in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
            let args = lastArgs;
            let thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function leadingEdge(time) {
            lastInvokeTime = time;
            timerId = setTimeout(timerExpired, wait);
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
            let timeSinceLastCall = time - lastCallTime;
            let timeSinceLastInvoke = time - lastInvokeTime;
            let result = wait - timeSinceLastCall;
            return maxing ? Math.min(result, maxWait - timeSinceLastInvoke) : result;
        }

        function shouldInvoke(time) {
            let timeSinceLastCall = time - lastCallTime;
            let timeSinceLastInvoke = time - lastInvokeTime;

            return (lastCallTime === undefined || (timeSinceLastCall >= wait) || (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
            const time = Date.now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timerId = undefined;

            if (trailing && lastArgs)
                return invokeFunc(time);
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel() {
            if (timerId !== undefined)
                clearTimeout(timerId);
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
            return timerId === undefined ? result : trailingEdge(Date.now());
        }

        function debounced() {
            let time = Date.now();
            let isInvoking = shouldInvoke(time);
            lastArgs = arguments;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking) {
                if (timerId === undefined)
                    return leadingEdge(lastCallTime);
                if (maxing) {
                    timerId = setTimeout(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined)
                timerId = setTimeout(timerExpired, wait);
            return result;
        }

        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
    },

    throttle(func, wait, options) {
        let leading = true;
        let trailing = true;

        if (typeof options === "object") {
            leading = "leading"in options ? !!options.leading : leading;
            trailing = "trailing"in options ? !!options.trailing : trailing;
        }

        return this.debounce(func, wait, {
            leading,
            maxWait: wait,
            trailing
        });
    },

    pDelay(msecs, resolveAs) {
        return new Promise(resolve=>setTimeout(()=>resolve(resolveAs), msecs));
    },

    GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST: new Set(["caption", "type", "colLabels", "colLabelGroups", "name", "colStyles", "style", "shortName", "subclassShortName", "id", "path"]),

    getWalker(opts) {
        opts = opts || {};

        if (opts.isBreakOnReturn && !opts.isNoModification)
            throw new Error(`"isBreakOnReturn" may only be used in "isNoModification" mode!`);

        const keyBlocklist = opts.keyBlocklist || new Set();

        const getMappedPrimitive = (obj,primitiveHandlers,lastKey,stack,prop,propPre,propPost)=>{
            if (primitiveHandlers[propPre])
                MiscUtil._getWalker_runHandlers({
                    handlers: primitiveHandlers[propPre],
                    obj,
                    lastKey,
                    stack
                });
            if (primitiveHandlers[prop]) {
                const out = MiscUtil._getWalker_applyHandlers({
                    opts,
                    handlers: primitiveHandlers[prop],
                    obj,
                    lastKey,
                    stack
                });
                if (out === VeCt.SYM_WALKER_BREAK)
                    return out;
                if (!opts.isNoModification)
                    obj = out;
            }
            if (primitiveHandlers[propPost])
                MiscUtil._getWalker_runHandlers({
                    handlers: primitiveHandlers[propPost],
                    obj,
                    lastKey,
                    stack
                });
            return obj;
        }
        ;

        const doObjectRecurse = (obj,primitiveHandlers,stack)=>{
            for (const k of Object.keys(obj)) {
                if (keyBlocklist.has(k))
                    continue;

                const out = fn(obj[k], primitiveHandlers, k, stack);
                if (out === VeCt.SYM_WALKER_BREAK)
                    return VeCt.SYM_WALKER_BREAK;
                if (!opts.isNoModification)
                    obj[k] = out;
            }
        }
        ;

        const fn = (obj,primitiveHandlers,lastKey,stack)=>{
            if (obj === null)
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "null", "preNull", "postNull");

            switch (typeof obj) {
            case "undefined":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "undefined", "preUndefined", "postUndefined");
            case "boolean":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "boolean", "preBoolean", "postBoolean");
            case "number":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "number", "preNumber", "postNumber");
            case "string":
                return getMappedPrimitive(obj, primitiveHandlers, lastKey, stack, "string", "preString", "postString");
            case "object":
                {
                    if (obj instanceof Array) {
                        if (primitiveHandlers.preArray)
                            MiscUtil._getWalker_runHandlers({
                                handlers: primitiveHandlers.preArray,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            const out = new Array(obj.length);
                            for (let i = 0, len = out.length; i < len; ++i) {
                                out[i] = fn(obj[i], primitiveHandlers, lastKey, stack);
                                if (out[i] === VeCt.SYM_WALKER_BREAK)
                                    return out[i];
                            }
                            if (!opts.isNoModification)
                                obj = out;
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.array) {
                                const out = MiscUtil._getWalker_applyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (out === VeCt.SYM_WALKER_BREAK)
                                    return out;
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.array) {
                                const out = MiscUtil._getWalker_applyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (out === VeCt.SYM_WALKER_BREAK)
                                    return out;
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj != null) {
                                const out = new Array(obj.length);
                                for (let i = 0, len = out.length; i < len; ++i) {
                                    if (stack)
                                        stack.push(obj);
                                    out[i] = fn(obj[i], primitiveHandlers, lastKey, stack);
                                    if (stack)
                                        stack.pop();
                                    if (out[i] === VeCt.SYM_WALKER_BREAK)
                                        return out[i];
                                }
                                if (!opts.isNoModification)
                                    obj = out;
                            } else {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        }
                        if (primitiveHandlers.postArray)
                            MiscUtil._getWalker_runHandlers({
                                handlers: primitiveHandlers.postArray,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    }

                    if (primitiveHandlers.preObject)
                        MiscUtil._getWalker_runHandlers({
                            handlers: primitiveHandlers.preObject,
                            obj,
                            lastKey,
                            stack
                        });
                    if (opts.isDepthFirst) {
                        if (stack)
                            stack.push(obj);
                        const flag = doObjectRecurse(obj, primitiveHandlers, stack);
                        if (stack)
                            stack.pop();
                        if (flag === VeCt.SYM_WALKER_BREAK)
                            return flag;

                        if (primitiveHandlers.object) {
                            const out = MiscUtil._getWalker_applyHandlers({
                                opts,
                                handlers: primitiveHandlers.object,
                                obj,
                                lastKey,
                                stack
                            });
                            if (out === VeCt.SYM_WALKER_BREAK)
                                return out;
                            if (!opts.isNoModification)
                                obj = out;
                        }
                        if (obj == null) {
                            if (!opts.isAllowDeleteObjects)
                                throw new Error(`Object handler(s) returned null!`);
                        }
                    } else {
                        if (primitiveHandlers.object) {
                            const out = MiscUtil._getWalker_applyHandlers({
                                opts,
                                handlers: primitiveHandlers.object,
                                obj,
                                lastKey,
                                stack
                            });
                            if (out === VeCt.SYM_WALKER_BREAK)
                                return out;
                            if (!opts.isNoModification)
                                obj = out;
                        }
                        if (obj == null) {
                            if (!opts.isAllowDeleteObjects)
                                throw new Error(`Object handler(s) returned null!`);
                        } else {
                            if (stack)
                                stack.push(obj);
                            const flag = doObjectRecurse(obj, primitiveHandlers, stack);
                            if (stack)
                                stack.pop();
                            if (flag === VeCt.SYM_WALKER_BREAK)
                                return flag;
                        }
                    }
                    if (primitiveHandlers.postObject)
                        MiscUtil._getWalker_runHandlers({
                            handlers: primitiveHandlers.postObject,
                            obj,
                            lastKey,
                            stack
                        });
                    return obj;
                }
            default:
                throw new Error(`Unhandled type "${typeof obj}"`);
            }
        }
        ;

        return {
            walk: fn
        };
    },

    _getWalker_applyHandlers({opts, handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        const didBreak = handlers.some(h=>{
            const out = h(obj, lastKey, stack);
            if (opts.isBreakOnReturn && out)
                return true;
            if (!opts.isNoModification)
                obj = out;
        }
        );
        if (didBreak)
            return VeCt.SYM_WALKER_BREAK;
        return obj;
    },

    _getWalker_runHandlers({handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        handlers.forEach(h=>h(obj, lastKey, stack));
    },

    getAsyncWalker(opts) {
        opts = opts || {};
        const keyBlocklist = opts.keyBlocklist || new Set();

        const pFn = async(obj,primitiveHandlers,lastKey,stack)=>{
            if (obj == null) {
                if (primitiveHandlers.null)
                    return MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.null,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            }

            const pDoObjectRecurse = async()=>{
                await Object.keys(obj).pSerialAwaitMap(async k=>{
                    const v = obj[k];
                    if (keyBlocklist.has(k))
                        return;
                    const out = await pFn(v, primitiveHandlers, k, stack);
                    if (!opts.isNoModification)
                        obj[k] = out;
                }
                );
            }
            ;

            const to = typeof obj;
            switch (to) {
            case undefined:
                if (primitiveHandlers.preUndefined)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preUndefined,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.undefined) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.undefined,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postUndefined)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postUndefined,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "boolean":
                if (primitiveHandlers.preBoolean)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preBoolean,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.boolean) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.boolean,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postBoolean)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postBoolean,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "number":
                if (primitiveHandlers.preNumber)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preNumber,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.number) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.number,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postNumber)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postNumber,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "string":
                if (primitiveHandlers.preString)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.preString,
                        obj,
                        lastKey,
                        stack
                    });
                if (primitiveHandlers.string) {
                    const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                        opts,
                        handlers: primitiveHandlers.string,
                        obj,
                        lastKey,
                        stack
                    });
                    if (!opts.isNoModification)
                        obj = out;
                }
                if (primitiveHandlers.postString)
                    await MiscUtil._getAsyncWalker_pRunHandlers({
                        handlers: primitiveHandlers.postString,
                        obj,
                        lastKey,
                        stack
                    });
                return obj;
            case "object":
                {
                    if (obj instanceof Array) {
                        if (primitiveHandlers.preArray)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.preArray,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            const out = await obj.pSerialAwaitMap(it=>pFn(it, primitiveHandlers, lastKey, stack));
                            if (!opts.isNoModification)
                                obj = out;
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.array) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.array) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.array,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj != null) {
                                const out = await obj.pSerialAwaitMap(it=>pFn(it, primitiveHandlers, lastKey, stack));
                                if (!opts.isNoModification)
                                    obj = out;
                            } else {
                                if (!opts.isAllowDeleteArrays)
                                    throw new Error(`Array handler(s) returned null!`);
                            }
                        }
                        if (primitiveHandlers.postArray)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.postArray,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    } else {
                        if (primitiveHandlers.preObject)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.preObject,
                                obj,
                                lastKey,
                                stack
                            });
                        if (opts.isDepthFirst) {
                            if (stack)
                                stack.push(obj);
                            await pDoObjectRecurse();
                            if (stack)
                                stack.pop();

                            if (primitiveHandlers.object) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.object,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteObjects)
                                    throw new Error(`Object handler(s) returned null!`);
                            }
                        } else {
                            if (primitiveHandlers.object) {
                                const out = await MiscUtil._getAsyncWalker_pApplyHandlers({
                                    opts,
                                    handlers: primitiveHandlers.object,
                                    obj,
                                    lastKey,
                                    stack
                                });
                                if (!opts.isNoModification)
                                    obj = out;
                            }
                            if (obj == null) {
                                if (!opts.isAllowDeleteObjects)
                                    throw new Error(`Object handler(s) returned null!`);
                            } else {
                                await pDoObjectRecurse();
                            }
                        }
                        if (primitiveHandlers.postObject)
                            await MiscUtil._getAsyncWalker_pRunHandlers({
                                handlers: primitiveHandlers.postObject,
                                obj,
                                lastKey,
                                stack
                            });
                        return obj;
                    }
                }
            default:
                throw new Error(`Unhandled type "${to}"`);
            }
        }
        ;

        return {
            pWalk: pFn
        };
    },

    async _getAsyncWalker_pApplyHandlers({opts, handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        await handlers.pSerialAwaitMap(async pH=>{
            const out = await pH(obj, lastKey, stack);
            if (!opts.isNoModification)
                obj = out;
        }
        );
        return obj;
    },

    async _getAsyncWalker_pRunHandlers({handlers, obj, lastKey, stack}) {
        handlers = handlers instanceof Array ? handlers : [handlers];
        await handlers.pSerialAwaitMap(pH=>pH(obj, lastKey, stack));
    },

    pDefer(fn) {
        return (async()=>fn())();
    },
};