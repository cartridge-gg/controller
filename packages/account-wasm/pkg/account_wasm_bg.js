let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_42(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8842d5b7e89cfff4(arg0, arg1, addHeapObject(arg2));
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_192(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h06f5a6b5a9886359(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export const ErrorCode = Object.freeze({ StarknetFailedToReceiveTransaction:1,"1":"StarknetFailedToReceiveTransaction",StarknetContractNotFound:20,"20":"StarknetContractNotFound",StarknetBlockNotFound:24,"24":"StarknetBlockNotFound",StarknetInvalidTransactionIndex:27,"27":"StarknetInvalidTransactionIndex",StarknetClassHashNotFound:28,"28":"StarknetClassHashNotFound",StarknetTransactionHashNotFound:29,"29":"StarknetTransactionHashNotFound",StarknetPageSizeTooBig:31,"31":"StarknetPageSizeTooBig",StarknetNoBlocks:32,"32":"StarknetNoBlocks",StarknetInvalidContinuationToken:33,"33":"StarknetInvalidContinuationToken",StarknetTooManyKeysInFilter:34,"34":"StarknetTooManyKeysInFilter",StarknetContractError:40,"40":"StarknetContractError",StarknetTransactionExecutionError:41,"41":"StarknetTransactionExecutionError",StarknetClassAlreadyDeclared:51,"51":"StarknetClassAlreadyDeclared",StarknetInvalidTransactionNonce:52,"52":"StarknetInvalidTransactionNonce",StarknetInsufficientMaxFee:53,"53":"StarknetInsufficientMaxFee",StarknetInsufficientAccountBalance:54,"54":"StarknetInsufficientAccountBalance",StarknetValidationFailure:55,"55":"StarknetValidationFailure",StarknetCompilationFailed:56,"56":"StarknetCompilationFailed",StarknetContractClassSizeIsTooLarge:57,"57":"StarknetContractClassSizeIsTooLarge",StarknetNonAccount:58,"58":"StarknetNonAccount",StarknetDuplicateTx:59,"59":"StarknetDuplicateTx",StarknetCompiledClassHashMismatch:60,"60":"StarknetCompiledClassHashMismatch",StarknetUnsupportedTxVersion:61,"61":"StarknetUnsupportedTxVersion",StarknetUnsupportedContractClassVersion:62,"62":"StarknetUnsupportedContractClassVersion",StarknetUnexpectedError:63,"63":"StarknetUnexpectedError",StarknetNoTraceAvailable:10,"10":"StarknetNoTraceAvailable",SignError:101,"101":"SignError",StorageError:102,"102":"StorageError",AccountFactoryError:103,"103":"AccountFactoryError",PaymasterExecutionTimeNotReached:104,"104":"PaymasterExecutionTimeNotReached",PaymasterExecutionTimePassed:105,"105":"PaymasterExecutionTimePassed",PaymasterInvalidCaller:106,"106":"PaymasterInvalidCaller",PaymasterRateLimitExceeded:107,"107":"PaymasterRateLimitExceeded",PaymasterNotSupported:108,"108":"PaymasterNotSupported",PaymasterHttp:109,"109":"PaymasterHttp",PaymasterExcecution:110,"110":"PaymasterExcecution",PaymasterSerialization:111,"111":"PaymasterSerialization",CartridgeControllerNotDeployed:112,"112":"CartridgeControllerNotDeployed",InsufficientBalance:113,"113":"InsufficientBalance",OriginError:114,"114":"OriginError",EncodingError:115,"115":"EncodingError",SerdeWasmBindgenError:116,"116":"SerdeWasmBindgenError",CairoSerdeError:117,"117":"CairoSerdeError",CairoShortStringToFeltError:118,"118":"CairoShortStringToFeltError",DeviceCreateCredential:119,"119":"DeviceCreateCredential",DeviceGetAssertion:120,"120":"DeviceGetAssertion",DeviceBadAssertion:121,"121":"DeviceBadAssertion",DeviceChannel:122,"122":"DeviceChannel",DeviceOrigin:123,"123":"DeviceOrigin",AccountSigning:124,"124":"AccountSigning",AccountProvider:125,"125":"AccountProvider",AccountClassHashCalculation:126,"126":"AccountClassHashCalculation",AccountClassCompression:127,"127":"AccountClassCompression",AccountFeeOutOfRange:128,"128":"AccountFeeOutOfRange",ProviderRateLimited:129,"129":"ProviderRateLimited",ProviderArrayLengthMismatch:130,"130":"ProviderArrayLengthMismatch",ProviderOther:131,"131":"ProviderOther", });

const CartridgeAccountFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cartridgeaccount_free(ptr >>> 0, 1));
/**
*/
export class CartridgeAccount {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CartridgeAccount.prototype);
        obj.__wbg_ptr = ptr;
        CartridgeAccountFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CartridgeAccountFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cartridgeaccount_free(ptr, 0);
    }
    /**
    * Creates a new `CartridgeAccount` instance.
    *
    * # Parameters
    * - `app_id`: Application identifier.
    * - `rpc_url`: The URL of the JSON-RPC endpoint.
    * - `chain_id`: Identifier of the blockchain network to interact with.
    * - `address`: The blockchain address associated with the account.
    * - `rp_id`: Relying Party Identifier, a string that uniquely identifies the WebAuthn relying party.
    * - `origin`: The origin of the WebAuthn request. Example https://cartridge.gg
    * - `username`: Username associated with the account.
    * - `credential_id`: Base64 encoded bytes of the raw credential ID generated during the WebAuthn registration process.
    * - `public_key`: Base64 encoded bytes of the public key generated during the WebAuthn registration process (COSE format).
    * @param {string} app_id
    * @param {string} rpc_url
    * @param {JsFelt} chain_id
    * @param {JsFelt} address
    * @param {string} rp_id
    * @param {string} username
    * @param {string} credential_id
    * @param {string} public_key
    * @returns {CartridgeAccount}
    */
    static new(app_id, rpc_url, chain_id, address, rp_id, username, credential_id, public_key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(app_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(rpc_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(rp_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(username, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passStringToWasm0(credential_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len4 = WASM_VECTOR_LEN;
            const ptr5 = passStringToWasm0(public_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len5 = WASM_VECTOR_LEN;
            wasm.cartridgeaccount_new(retptr, ptr0, len0, ptr1, len1, addHeapObject(chain_id), addHeapObject(address), ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return CartridgeAccount.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {JsFelt}
    */
    ownerGuid() {
        const ret = wasm.cartridgeaccount_ownerGuid(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {(JsPolicy)[]} policies
    * @param {bigint} expires_at
    * @param {JsFelt} public_key
    * @param {JsFelt} max_fee
    * @returns {Promise<any>}
    */
    registerSession(policies, expires_at, public_key, max_fee) {
        const ptr0 = passArrayJsValueToWasm0(policies, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_registerSession(this.__wbg_ptr, ptr0, len0, expires_at, addHeapObject(public_key), addHeapObject(max_fee));
        return takeObject(ret);
    }
    /**
    * @param {(JsPolicy)[]} policies
    * @param {bigint} expires_at
    * @returns {Promise<any>}
    */
    createSession(policies, expires_at) {
        const ptr0 = passArrayJsValueToWasm0(policies, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_createSession(this.__wbg_ptr, ptr0, len0, expires_at);
        return takeObject(ret);
    }
    /**
    * @param {(JsCall)[]} calls
    * @param {number | undefined} [fee_multiplier]
    * @returns {Promise<any>}
    */
    estimateInvokeFee(calls, fee_multiplier) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_estimateInvokeFee(this.__wbg_ptr, ptr0, len0, !isLikeNone(fee_multiplier), isLikeNone(fee_multiplier) ? 0 : fee_multiplier);
        return takeObject(ret);
    }
    /**
    * @param {(JsCall)[]} calls
    * @param {JsInvocationsDetails} details
    * @returns {Promise<any>}
    */
    execute(calls, details) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_execute(this.__wbg_ptr, ptr0, len0, addHeapObject(details));
        return takeObject(ret);
    }
    /**
    * @param {(JsCall)[]} calls
    * @returns {Promise<any>}
    */
    executeFromOutside(calls) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_executeFromOutside(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {(JsCall)[]} calls
    * @returns {boolean}
    */
    hasSession(calls) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.cartridgeaccount_hasSession(retptr, this.__wbg_ptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {any}
    */
    sessionJson() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cartridgeaccount_sessionJson(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    revokeSession() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cartridgeaccount_revokeSession(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} typed_data
    * @returns {Promise<Felts>}
    */
    signMessage(typed_data) {
        const ptr0 = passStringToWasm0(typed_data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_signMessage(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<any>}
    */
    getNonce() {
        const ret = wasm.cartridgeaccount_getNonce(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {JsFelt} max_fee
    * @returns {Promise<any>}
    */
    deploySelf(max_fee) {
        const ret = wasm.cartridgeaccount_deploySelf(this.__wbg_ptr, addHeapObject(max_fee));
        return takeObject(ret);
    }
    /**
    * @returns {Promise<JsFelt>}
    */
    delegateAccount() {
        const ret = wasm.cartridgeaccount_delegateAccount(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const CartridgeSessionAccountFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cartridgesessionaccount_free(ptr >>> 0, 1));
/**
*/
export class CartridgeSessionAccount {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CartridgeSessionAccount.prototype);
        obj.__wbg_ptr = ptr;
        CartridgeSessionAccountFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CartridgeSessionAccountFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cartridgesessionaccount_free(ptr, 0);
    }
    /**
    * @param {string} rpc_url
    * @param {JsFelt} signer
    * @param {JsFelt} address
    * @param {JsFelt} chain_id
    * @param {(JsFelt)[]} session_authorization
    * @param {JsSession} session
    * @returns {CartridgeSessionAccount}
    */
    static new(rpc_url, signer, address, chain_id, session_authorization, session) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(rpc_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArrayJsValueToWasm0(session_authorization, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.cartridgesessionaccount_new(retptr, ptr0, len0, addHeapObject(signer), addHeapObject(address), addHeapObject(chain_id), ptr1, len1, addHeapObject(session));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return CartridgeSessionAccount.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} rpc_url
    * @param {JsFelt} signer
    * @param {JsFelt} address
    * @param {JsFelt} owner_guid
    * @param {JsFelt} chain_id
    * @param {JsSession} session
    * @returns {CartridgeSessionAccount}
    */
    static new_as_registered(rpc_url, signer, address, owner_guid, chain_id, session) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(rpc_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.cartridgesessionaccount_new_as_registered(retptr, ptr0, len0, addHeapObject(signer), addHeapObject(address), addHeapObject(owner_guid), addHeapObject(chain_id), addHeapObject(session));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return CartridgeSessionAccount.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {JsFelt} hash
    * @param {(JsCall)[]} calls
    * @returns {Promise<Felts>}
    */
    sign(hash, calls) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgesessionaccount_sign(this.__wbg_ptr, addHeapObject(hash), ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {(JsCall)[]} calls
    * @returns {Promise<any>}
    */
    execute(calls) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgesessionaccount_execute(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * @param {(JsCall)[]} calls
    * @returns {Promise<any>}
    */
    execute_from_outside(calls) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgesessionaccount_execute_from_outside(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
}

const JsControllerErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jscontrollererror_free(ptr >>> 0, 1));
/**
*/
export class JsControllerError {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsControllerError.prototype);
        obj.__wbg_ptr = ptr;
        JsControllerErrorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsControllerErrorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jscontrollererror_free(ptr, 0);
    }
    /**
    * @returns {ErrorCode}
    */
    get code() {
        const ret = wasm.__wbg_get_jscontrollererror_code(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {ErrorCode} arg0
    */
    set code(arg0) {
        wasm.__wbg_set_jscontrollererror_code(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {string}
    */
    get message() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_jscontrollererror_message(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set message(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jscontrollererror_message(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {string | undefined}
    */
    get data() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_jscontrollererror_data(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            let v1;
            if (r0 !== 0) {
                v1 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string | undefined} [arg0]
    */
    set data(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jscontrollererror_data(this.__wbg_ptr, ptr0, len0);
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_jscontrollererror_new(arg0) {
    const ret = JsControllerError.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_json_parse(arg0, arg1) {
    const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_json_serialize(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = JSON.stringify(obj === undefined ? null : obj);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbindgen_boolean_get(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

export function __wbindgen_bigint_from_i64(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbindgen_bigint_from_u64(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbg_String_b9412f8799faab3e(arg0, arg1) {
    const ret = String(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_set_f975102236d3c502(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};

export function __wbg_set_20cbc34131e76824(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};

export function __wbg_fetch_bc7c8e27076a5c84(arg0) {
    const ret = fetch(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_queueMicrotask_12a30234db4045d3(arg0) {
    queueMicrotask(getObject(arg0));
};

export function __wbg_queueMicrotask_48421b3cc9052b68(arg0) {
    const ret = getObject(arg0).queueMicrotask;
    return addHeapObject(ret);
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbg_instanceof_Window_5012736c80a01584(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_location_af118da6c50d4c3f(arg0) {
    const ret = getObject(arg0).location;
    return addHeapObject(ret);
};

export function __wbg_navigator_6210380287bf8581(arg0) {
    const ret = getObject(arg0).navigator;
    return addHeapObject(ret);
};

export function __wbg_localStorage_90db5cb66e840248() { return handleError(function (arg0) {
    const ret = getObject(arg0).localStorage;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_debug_5a33c41aeac15ee6(arg0) {
    console.debug(getObject(arg0));
};

export function __wbg_log_b103404cc5920657(arg0) {
    console.log(getObject(arg0));
};

export function __wbg_fetch_ba7fe179e527d942(arg0, arg1) {
    const ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_create_98c8d4ceb117be17() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).create(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_get_a641ab434d58b2eb() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).get(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getClientExtensionResults_b2b730757f0acc3b(arg0) {
    const ret = getObject(arg0).getClientExtensionResults();
    return addHeapObject(ret);
};

export function __wbg_instanceof_Response_e91b7eb7c611a9ae(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Response;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_url_1bf85c8abeb8c92d(arg0, arg1) {
    const ret = getObject(arg1).url;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbg_status_ae8de515694c5c7c(arg0) {
    const ret = getObject(arg0).status;
    return ret;
};

export function __wbg_headers_5e283e8345689121(arg0) {
    const ret = getObject(arg0).headers;
    return addHeapObject(ret);
};

export function __wbg_arrayBuffer_a5fbad63cc7e663b() { return handleError(function (arg0) {
    const ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_text_a94b91ea8700357a() { return handleError(function (arg0) {
    const ret = getObject(arg0).text();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_signal_41e46ccad44bb5e2(arg0) {
    const ret = getObject(arg0).signal;
    return addHeapObject(ret);
};

export function __wbg_new_ebf2727385ee825c() { return handleError(function () {
    const ret = new AbortController();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_abort_8659d889a7877ae3(arg0) {
    getObject(arg0).abort();
};

export function __wbg_origin_648082c4831a5be8() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg1).origin;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}, arguments) };

export function __wbg_getItem_cab39762abab3e70() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}, arguments) };

export function __wbg_setItem_9482185c870abba6() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_new_e27c93803e1acc42() { return handleError(function () {
    const ret = new Headers();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_append_f3a4426bb50622c5() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

export function __wbg_newwithstrandinit_a31c69e4cc337183() { return handleError(function (arg0, arg1, arg2) {
    const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_setbody_734cb3d7ee8e6e96(arg0, arg1) {
    getObject(arg0).body = getObject(arg1);
};

export function __wbg_setcredentials_2b67800db3f7b621(arg0, arg1) {
    getObject(arg0).credentials = ["omit","same-origin","include",][arg1];
};

export function __wbg_setheaders_be10a5ab566fd06f(arg0, arg1) {
    getObject(arg0).headers = getObject(arg1);
};

export function __wbg_setmethod_dc68a742c2db5c6a(arg0, arg1, arg2) {
    getObject(arg0).method = getStringFromWasm0(arg1, arg2);
};

export function __wbg_setmode_a781aae2bd3df202(arg0, arg1) {
    getObject(arg0).mode = ["same-origin","no-cors","cors","navigate",][arg1];
};

export function __wbg_setsignal_91c4e8ebd04eb935(arg0, arg1) {
    getObject(arg0).signal = getObject(arg1);
};

export function __wbg_credentials_fb876d53c9170fe4(arg0) {
    const ret = getObject(arg0).credentials;
    return addHeapObject(ret);
};

export function __wbg_crypto_1d1f22824a6a080c(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_process_4a72847cc503995b(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbg_versions_f686565e586dd935(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_104a2ff8d6ea03a2(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_require_cca90b1a94a0255b() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_msCrypto_eb05e62b530a1508(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_randomFillSync_5c9c955aa56b6049() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

export function __wbg_getRandomValues_3aa56aa6edec874c() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_new_a220cf903aa02ca2() {
    const ret = new Array();
    return addHeapObject(ret);
};

export function __wbg_newnoargs_76313bd6ff35d0f2(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_new_8608a2b51a5f6737() {
    const ret = new Map();
    return addHeapObject(ret);
};

export function __wbg_next_de3e9db4440638b2(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

export function __wbg_next_f9cb570345655b9a() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_done_bfda7aa8f252b39f(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

export function __wbg_value_6d39332ab4788d86(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

export function __wbg_iterator_888179a48810a9fe() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

export function __wbg_get_224d16597dbbfd96() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_call_1084a111329e68ce() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_525245e2b9901204() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbg_self_3093d5d1f7bcb682() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_3bcfc4d31bc012f8() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_86b222e13bdf32ed() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_e5a3fe56f8be9485() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_set_673dda6c73d19609(arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
};

export function __wbg_push_37c89022f34c01ca(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export function __wbg_call_89af060b4e1523f2() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_set_49185437f0ab06f8(arg0, arg1, arg2) {
    const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_now_b7a162010a9e75b4() {
    const ret = Date.now();
    return ret;
};

export function __wbg_new_b85e72ed1bfd57f9(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_192(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_resolve_570458cb99d56a43(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_then_95e6edc0f89b73b1(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_then_876bb3c633745cc6(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_buffer_b7b08af79b0b0974(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_ea1883e1e5e86686(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_d1e79e2388520f18(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_8339fcf5d8ecd12e(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_newwithlength_ec548f448387c968(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_7c2e3576afe181d1(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_has_4bfbc01db38743f7() { return handleError(function (arg0, arg1) {
    const ret = Reflect.has(getObject(arg0), getObject(arg1));
    return ret;
}, arguments) };

export function __wbg_set_eacc7d73fefaafdf() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

export function __wbg_stringify_bbf45426c92a6bf5() { return handleError(function (arg0) {
    const ret = JSON.stringify(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2506(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 474, __wbg_adapter_42);
    return addHeapObject(ret);
};

