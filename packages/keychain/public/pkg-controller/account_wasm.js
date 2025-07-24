import { Mutex } from './snippets/account-wasm-35da9c7350cbc3ae/src/wasm-mutex.js';

let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

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

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_2(addHeapObject(e));
    }
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

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

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_4.get(state.dtor)(state.a, state.b)
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
                wasm.__wbindgen_export_4.get(state.dtor)(a, state.b);
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
    if (builtInMatches && builtInMatches.length > 1) {
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

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
 * @param {Signer} signer
 * @returns {JsFelt}
 */
export function signerToGuid(signer) {
    const ret = wasm.signerToGuid(addHeapObject(signer));
    return takeObject(ret);
}

/**
 * Computes the Starknet contract address for a controller account without needing a full instance.
 *
 * # Arguments
 *
 * * `class_hash` - The class hash of the account contract (JsFelt).
 * * `owner` - The owner configuration for the account.
 * * `salt` - The salt used for address calculation (JsFelt).
 *
 * # Returns
 *
 * The computed Starknet contract address as a `JsFelt`.
 * @param {JsFelt} class_hash
 * @param {Owner} owner
 * @param {JsFelt} salt
 * @returns {JsFelt}
 */
export function computeAccountAddress(class_hash, owner, salt) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.computeAccountAddress(retptr, addHeapObject(class_hash), addHeapObject(owner), addHeapObject(salt));
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

export function start() {
    wasm.start();
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) {
    const ret = wasm.add(a, b);
    return ret >>> 0;
}

function __wbg_adapter_46(arg0, arg1) {
    wasm.__wbindgen_export_5(arg0, arg1);
}

function __wbg_adapter_49(arg0, arg1, arg2) {
    wasm.__wbindgen_export_6(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_274(arg0, arg1, arg2, arg3) {
    wasm.__wbindgen_export_7(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
 * @enum {1 | 20 | 24 | 27 | 28 | 29 | 31 | 32 | 33 | 34 | 40 | 41 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 10 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137}
 */
export const ErrorCode = Object.freeze({
    StarknetFailedToReceiveTransaction: 1, "1": "StarknetFailedToReceiveTransaction",
    StarknetContractNotFound: 20, "20": "StarknetContractNotFound",
    StarknetBlockNotFound: 24, "24": "StarknetBlockNotFound",
    StarknetInvalidTransactionIndex: 27, "27": "StarknetInvalidTransactionIndex",
    StarknetClassHashNotFound: 28, "28": "StarknetClassHashNotFound",
    StarknetTransactionHashNotFound: 29, "29": "StarknetTransactionHashNotFound",
    StarknetPageSizeTooBig: 31, "31": "StarknetPageSizeTooBig",
    StarknetNoBlocks: 32, "32": "StarknetNoBlocks",
    StarknetInvalidContinuationToken: 33, "33": "StarknetInvalidContinuationToken",
    StarknetTooManyKeysInFilter: 34, "34": "StarknetTooManyKeysInFilter",
    StarknetContractError: 40, "40": "StarknetContractError",
    StarknetTransactionExecutionError: 41, "41": "StarknetTransactionExecutionError",
    StarknetClassAlreadyDeclared: 51, "51": "StarknetClassAlreadyDeclared",
    StarknetInvalidTransactionNonce: 52, "52": "StarknetInvalidTransactionNonce",
    StarknetInsufficientMaxFee: 53, "53": "StarknetInsufficientMaxFee",
    StarknetInsufficientAccountBalance: 54, "54": "StarknetInsufficientAccountBalance",
    StarknetValidationFailure: 55, "55": "StarknetValidationFailure",
    StarknetCompilationFailed: 56, "56": "StarknetCompilationFailed",
    StarknetContractClassSizeIsTooLarge: 57, "57": "StarknetContractClassSizeIsTooLarge",
    StarknetNonAccount: 58, "58": "StarknetNonAccount",
    StarknetDuplicateTx: 59, "59": "StarknetDuplicateTx",
    StarknetCompiledClassHashMismatch: 60, "60": "StarknetCompiledClassHashMismatch",
    StarknetUnsupportedTxVersion: 61, "61": "StarknetUnsupportedTxVersion",
    StarknetUnsupportedContractClassVersion: 62, "62": "StarknetUnsupportedContractClassVersion",
    StarknetUnexpectedError: 63, "63": "StarknetUnexpectedError",
    StarknetNoTraceAvailable: 10, "10": "StarknetNoTraceAvailable",
    SignError: 101, "101": "SignError",
    StorageError: 102, "102": "StorageError",
    AccountFactoryError: 103, "103": "AccountFactoryError",
    PaymasterExecutionTimeNotReached: 104, "104": "PaymasterExecutionTimeNotReached",
    PaymasterExecutionTimePassed: 105, "105": "PaymasterExecutionTimePassed",
    PaymasterInvalidCaller: 106, "106": "PaymasterInvalidCaller",
    PaymasterRateLimitExceeded: 107, "107": "PaymasterRateLimitExceeded",
    PaymasterNotSupported: 108, "108": "PaymasterNotSupported",
    PaymasterHttp: 109, "109": "PaymasterHttp",
    PaymasterExcecution: 110, "110": "PaymasterExcecution",
    PaymasterSerialization: 111, "111": "PaymasterSerialization",
    CartridgeControllerNotDeployed: 112, "112": "CartridgeControllerNotDeployed",
    InsufficientBalance: 113, "113": "InsufficientBalance",
    OriginError: 114, "114": "OriginError",
    EncodingError: 115, "115": "EncodingError",
    SerdeWasmBindgenError: 116, "116": "SerdeWasmBindgenError",
    CairoSerdeError: 117, "117": "CairoSerdeError",
    CairoShortStringToFeltError: 118, "118": "CairoShortStringToFeltError",
    DeviceCreateCredential: 119, "119": "DeviceCreateCredential",
    DeviceGetAssertion: 120, "120": "DeviceGetAssertion",
    DeviceBadAssertion: 121, "121": "DeviceBadAssertion",
    DeviceChannel: 122, "122": "DeviceChannel",
    DeviceOrigin: 123, "123": "DeviceOrigin",
    AccountSigning: 124, "124": "AccountSigning",
    AccountProvider: 125, "125": "AccountProvider",
    AccountClassHashCalculation: 126, "126": "AccountClassHashCalculation",
    AccountFeeOutOfRange: 128, "128": "AccountFeeOutOfRange",
    ProviderRateLimited: 129, "129": "ProviderRateLimited",
    ProviderArrayLengthMismatch: 130, "130": "ProviderArrayLengthMismatch",
    ProviderOther: 131, "131": "ProviderOther",
    SessionAlreadyRegistered: 132, "132": "SessionAlreadyRegistered",
    UrlParseError: 133, "133": "UrlParseError",
    Base64DecodeError: 134, "134": "Base64DecodeError",
    CoseError: 135, "135": "CoseError",
    PolicyChainIdMismatch: 136, "136": "PolicyChainIdMismatch",
    InvalidOwner: 137, "137": "InvalidOwner",
});

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const CartridgeAccountFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cartridgeaccount_free(ptr >>> 0, 1));

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
     * - `username`: Username associated with the account.
     * - `owner`: A Owner struct containing the owner signer and associated data.
     * @param {string} app_id
     * @param {JsFelt} class_hash
     * @param {string} rpc_url
     * @param {JsFelt} chain_id
     * @param {JsFelt} address
     * @param {string} username
     * @param {Owner} owner
     * @param {string} cartridge_api_url
     * @returns {CartridgeAccountWithMeta}
     */
    static new(app_id, class_hash, rpc_url, chain_id, address, username, owner, cartridge_api_url) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(app_id, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(rpc_url, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(username, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passStringToWasm0(cartridge_api_url, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len3 = WASM_VECTOR_LEN;
            wasm.cartridgeaccount_new(retptr, ptr0, len0, addHeapObject(class_hash), ptr1, len1, addHeapObject(chain_id), addHeapObject(address), ptr2, len2, addHeapObject(owner), ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return CartridgeAccountWithMeta.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string} app_id
     * @param {string} cartridge_api_url
     * @returns {CartridgeAccountWithMeta | undefined}
     */
    static fromStorage(app_id, cartridge_api_url) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(app_id, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(cartridge_api_url, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len1 = WASM_VECTOR_LEN;
            wasm.cartridgeaccount_fromStorage(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return r0 === 0 ? undefined : CartridgeAccountWithMeta.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Promise<void>}
     */
    disconnect() {
        const ret = wasm.cartridgeaccount_disconnect(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {Policy[]} policies
     * @param {bigint} expires_at
     * @param {JsFelt} public_key
     * @param {JsFeeEstimate | null} [max_fee]
     * @returns {Promise<any>}
     */
    registerSession(policies, expires_at, public_key, max_fee) {
        const ptr0 = passArrayJsValueToWasm0(policies, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_registerSession(this.__wbg_ptr, ptr0, len0, expires_at, addHeapObject(public_key), isLikeNone(max_fee) ? 0 : addHeapObject(max_fee));
        return takeObject(ret);
    }
    /**
     * @param {Policy[]} policies
     * @param {bigint} expires_at
     * @param {JsFelt} public_key
     * @returns {Promise<any>}
     */
    registerSessionCalldata(policies, expires_at, public_key) {
        const ptr0 = passArrayJsValueToWasm0(policies, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_registerSessionCalldata(this.__wbg_ptr, ptr0, len0, expires_at, addHeapObject(public_key));
        return takeObject(ret);
    }
    /**
     * @param {JsFelt} new_class_hash
     * @returns {Promise<JsCall>}
     */
    upgrade(new_class_hash) {
        const ret = wasm.cartridgeaccount_upgrade(this.__wbg_ptr, addHeapObject(new_class_hash));
        return takeObject(ret);
    }
    /**
     * @param {bigint} expires_at
     * @param {boolean | null} [is_controller_registered]
     * @param {Signer | null} [signers]
     * @returns {Promise<AuthorizedSession>}
     */
    login(expires_at, is_controller_registered, signers) {
        const ret = wasm.cartridgeaccount_login(this.__wbg_ptr, expires_at, isLikeNone(is_controller_registered) ? 0xFFFFFF : is_controller_registered ? 1 : 0, isLikeNone(signers) ? 0 : addHeapObject(signers));
        return takeObject(ret);
    }
    /**
     * @param {JsRegister} register
     * @returns {Promise<JsRegisterResponse>}
     */
    register(register) {
        const ret = wasm.cartridgeaccount_register(this.__wbg_ptr, addHeapObject(register));
        return takeObject(ret);
    }
    /**
     * @param {Policy[]} policies
     * @param {bigint} expires_at
     * @returns {Promise<AuthorizedSession | undefined>}
     */
    createSession(policies, expires_at) {
        const ptr0 = passArrayJsValueToWasm0(policies, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_createSession(this.__wbg_ptr, ptr0, len0, expires_at);
        return takeObject(ret);
    }
    /**
     * @param {Policy[]} policies
     * @returns {Promise<void>}
     */
    skipSession(policies) {
        const ptr0 = passArrayJsValueToWasm0(policies, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_skipSession(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
     * @param {Signer} owner
     * @param {JsSignerInput} signer_input
     * @returns {Promise<void>}
     */
    addOwner(owner, signer_input) {
        const ret = wasm.cartridgeaccount_addOwner(this.__wbg_ptr, addHeapObject(owner), addHeapObject(signer_input));
        return takeObject(ret);
    }
    /**
     * @param {JsCall[]} calls
     * @returns {Promise<JsFeeEstimate>}
     */
    estimateInvokeFee(calls) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_estimateInvokeFee(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
     * @param {JsCall[]} calls
     * @param {JsFeeEstimate | null} [max_fee]
     * @param {JsFeeSource | null} [fee_source]
     * @returns {Promise<any>}
     */
    execute(calls, max_fee, fee_source) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_execute(this.__wbg_ptr, ptr0, len0, isLikeNone(max_fee) ? 0 : addHeapObject(max_fee), isLikeNone(fee_source) ? 0 : addHeapObject(fee_source));
        return takeObject(ret);
    }
    /**
     * @param {JsCall[]} calls
     * @param {JsFeeSource | null} [fee_source]
     * @returns {Promise<any>}
     */
    executeFromOutsideV2(calls, fee_source) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_executeFromOutsideV2(this.__wbg_ptr, ptr0, len0, isLikeNone(fee_source) ? 0 : addHeapObject(fee_source));
        return takeObject(ret);
    }
    /**
     * @param {JsCall[]} calls
     * @param {JsFeeSource | null} [fee_source]
     * @returns {Promise<any>}
     */
    executeFromOutsideV3(calls, fee_source) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_executeFromOutsideV3(this.__wbg_ptr, ptr0, len0, isLikeNone(fee_source) ? 0 : addHeapObject(fee_source));
        return takeObject(ret);
    }
    /**
     * @param {Policy[]} policies
     * @param {JsFelt | null} [public_key]
     * @returns {Promise<AuthorizedSession | undefined>}
     */
    isRegisteredSessionAuthorized(policies, public_key) {
        const ptr0 = passArrayJsValueToWasm0(policies, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_isRegisteredSessionAuthorized(this.__wbg_ptr, ptr0, len0, isLikeNone(public_key) ? 0 : addHeapObject(public_key));
        return takeObject(ret);
    }
    /**
     * @param {Policy[]} policies
     * @returns {Promise<boolean>}
     */
    hasRequestedSession(policies) {
        const ptr0 = passArrayJsValueToWasm0(policies, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_hasRequestedSession(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
     * @param {JsRevokableSession} session
     * @returns {Promise<void>}
     */
    revokeSession(session) {
        const ret = wasm.cartridgeaccount_revokeSession(this.__wbg_ptr, addHeapObject(session));
        return takeObject(ret);
    }
    /**
     * @param {JsRevokableSession[]} sessions
     * @returns {Promise<void>}
     */
    revokeSessions(sessions) {
        const ptr0 = passArrayJsValueToWasm0(sessions, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_revokeSessions(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
     * @param {string} typed_data
     * @returns {Promise<Felts>}
     */
    signMessage(typed_data) {
        const ptr0 = passStringToWasm0(typed_data, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
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
     * @param {JsFeeEstimate | null} [max_fee]
     * @returns {Promise<any>}
     */
    deploySelf(max_fee) {
        const ret = wasm.cartridgeaccount_deploySelf(this.__wbg_ptr, isLikeNone(max_fee) ? 0 : addHeapObject(max_fee));
        return takeObject(ret);
    }
    /**
     * @returns {Promise<JsFeeEstimate>}
     */
    estimateDeployFee() {
        const ret = wasm.cartridgeaccount_estimateDeployFee(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {Promise<JsFelt>}
     */
    delegateAccount() {
        const ret = wasm.cartridgeaccount_delegateAccount(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @param {JsCall[]} calls
     * @returns {Promise<boolean>}
     */
    hasAuthorizedPoliciesForCalls(calls) {
        const ptr0 = passArrayJsValueToWasm0(calls, wasm.__wbindgen_export_0);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_hasAuthorizedPoliciesForCalls(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
     * @param {string} typed_data
     * @returns {Promise<boolean>}
     */
    hasAuthorizedPoliciesForMessage(typed_data) {
        const ptr0 = passStringToWasm0(typed_data, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.cartridgeaccount_hasAuthorizedPoliciesForMessage(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
}

const CartridgeAccountMetaFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cartridgeaccountmeta_free(ptr >>> 0, 1));
/**
 * A type for accessing fixed attributes of `CartridgeAccount`.
 *
 * This type exists as concurrent mutable and immutable calls to `CartridgeAccount` are guarded
 * with `WasmMutex`, which only operates under an `async` context. If these getters were directly
 * implemented under `CartridgeAccount`:
 *
 * - calls to them would unnecessarily have to be `async` as well;
 * - there would be excessive locking.
 *
 * This type is supposed to only ever be borrowed immutably. So no concurrent access control would
 * be needed.
 */
export class CartridgeAccountMeta {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CartridgeAccountMeta.prototype);
        obj.__wbg_ptr = ptr;
        CartridgeAccountMetaFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CartridgeAccountMetaFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cartridgeaccountmeta_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    appId() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cartridgeaccountmeta_appId(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    username() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cartridgeaccountmeta_username(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    address() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cartridgeaccountmeta_address(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    classHash() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cartridgeaccountmeta_classHash(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    rpcUrl() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cartridgeaccountmeta_rpcUrl(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    chainId() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cartridgeaccountmeta_chainId(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {JsFelt}
     */
    ownerGuid() {
        const ret = wasm.cartridgeaccountmeta_ownerGuid(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * @returns {Owner}
     */
    owner() {
        const ret = wasm.cartridgeaccountmeta_owner(this.__wbg_ptr);
        return takeObject(ret);
    }
}

const CartridgeAccountWithMetaFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cartridgeaccountwithmeta_free(ptr >>> 0, 1));
/**
 * A type used as the return type for constructing `CartridgeAccount` to provide an extra,
 * separately borrowable `meta` field for synchronously accessing fixed fields.
 *
 * This type exists instead of simply having `CartridgeAccount::new()` return a tuple as tuples
 * don't implement `IntoWasmAbi` which is needed for crossing JS-WASM boundary.
 */
export class CartridgeAccountWithMeta {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CartridgeAccountWithMeta.prototype);
        obj.__wbg_ptr = ptr;
        CartridgeAccountWithMetaFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CartridgeAccountWithMetaFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cartridgeaccountwithmeta_free(ptr, 0);
    }
    /**
     * @returns {CartridgeAccountMeta}
     */
    meta() {
        const ret = wasm.cartridgeaccountwithmeta_meta(this.__wbg_ptr);
        return CartridgeAccountMeta.__wrap(ret);
    }
    /**
     * @returns {CartridgeAccount}
     */
    intoAccount() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.cartridgeaccountwithmeta_intoAccount(ptr);
        return CartridgeAccount.__wrap(ret);
    }
}

const JsControllerErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jscontrollererror_free(ptr >>> 0, 1));

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
            wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set message(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
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
                wasm.__wbindgen_export_3(r0, r1 * 1, 1);
            }
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {string | null} [arg0]
     */
    set data(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_jscontrollererror_data(this.__wbg_ptr, ptr0, len0);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_abort_410ec47a64ac6117 = function(arg0, arg1) {
        getObject(arg0).abort(getObject(arg1));
    };
    imports.wbg.__wbg_abort_775ef1d17fc65868 = function(arg0) {
        getObject(arg0).abort();
    };
    imports.wbg.__wbg_appendChild_8204974b7328bf98 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_append_8c7dd8d641a5f01b = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_arrayBuffer_d1b44c4390db422f = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_body_942ea927546a04ba = function(arg0) {
        const ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_7cccdd69e0791ae2 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_clearTimeout_0b53d391c1b94dda = function(arg0) {
        const ret = clearTimeout(takeObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_clear_dbb26f24a86a04a0 = function() { return handleError(function (arg0) {
        getObject(arg0).clear();
    }, arguments) };
    imports.wbg.__wbg_createElement_8c9931a732ee2fea = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_create_1e1fa47bcba4f67f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).create(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_credentials_f1256c3bb1216690 = function(arg0) {
        const ret = getObject(arg0).credentials;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_document_d249400bd7bd996d = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_done_769e5ede4b31c67b = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_error_524f506f44df1645 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_fetch_11bff8299d0ecd2b = function(arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_509096533071c657 = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_f1856afdb49415d1 = function(arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getClientExtensionResults_f486a52e95c84a1a = function(arg0) {
        const ret = getObject(arg0).getClientExtensionResults();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getItem_17f98dee3b43fa7e = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_getTime_46267b1c24877e30 = function(arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_get_67b2ba62fc30de12 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_d5bb96e3856d8afd = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).get(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getwithrefkey_1dc361bd10053bfe = function(arg0, arg1) {
        const ret = getObject(arg0)[getObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_has_a5ea9117f258a0ec = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_headers_9cb51cfd2ac780a4 = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_e14585432e3737fc = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Object_7f2dcef8f78644a4 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Object;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Response_f2cc20d9f7dfd644 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_17156bcf118086a9 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Window_def73ea0955fc569 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_WorkerGlobalScope_dbdbdea7e3b56493 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WorkerGlobalScope;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_iterator_9a24c88df860dc65 = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_jscontrollererror_new = function(arg0) {
        const ret = JsControllerError.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_a446193dc22c12f8 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_localStorage_1406c99c39728187 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).localStorage;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_location_350d99456c2f3693 = function(arg0) {
        const ret = getObject(arg0).location;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_log_c222819a41e063d3 = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_navigator_1577371c070c8947 = function(arg0) {
        const ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new0_f788a2397c7ca929 = function() {
        const ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_018dcc2d6c8c2f6a = function() { return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_23a2665fac83c611 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_274(a, state0.b, arg0, arg1);
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
    imports.wbg.__wbg_new_2658d63118834d8e = function() {
        const ret = new Mutex();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_405e22f390576ce2 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_5e0be73521bc8c17 = function() {
        const ret = new Map();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_e25e5aab09ff45db = function() { return handleError(function () {
        const ret = new AbortController();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newnoargs_105ed471475aaf50 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_a381634e90c276d4 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithstrandinit_06c535e0a867c635 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_next_25feadfc0913fea9 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_6574e1a8a62d1055 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_807e54c39636c349 = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_obtain_a9626b3b96e6dc2c = function(arg0) {
        const ret = getObject(arg0).obtain();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_origin_7c5d649acdace3ea = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).origin;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_737cfc8c1432c2c6 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_97d92b4fcc8a61c5 = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_queueMicrotask_d3219def82552485 = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_removeItem_9d2669ee3bba6f7d = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).removeItem(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_resolve_4851785c9c5f573d = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setItem_212ecc915942ab0a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setItem(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setTimeout_73ce8df12de4f2f2 = function(arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_b4ee584b3f982e97 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_f2fe5af8e3debeb3 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_37837023f3d740e8 = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_set_3fda3bac07393de4 = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_set_8fc6bf8a5b1071d1 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_bb8cecf6a62b9f46 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setbody_5923b78a95eedf29 = function(arg0, arg1) {
        getObject(arg0).body = getObject(arg1);
    };
    imports.wbg.__wbg_setcredentials_c3a22f1cd105a2c6 = function(arg0, arg1) {
        getObject(arg0).credentials = __wbindgen_enum_RequestCredentials[arg1];
    };
    imports.wbg.__wbg_setheaders_834c0bdb6a8949ad = function(arg0, arg1) {
        getObject(arg0).headers = getObject(arg1);
    };
    imports.wbg.__wbg_setinnerHTML_31bde41f835786f7 = function(arg0, arg1, arg2) {
        getObject(arg0).innerHTML = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_setmethod_3c5280fe5d890842 = function(arg0, arg1, arg2) {
        getObject(arg0).method = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_setmode_5dc300b865044b65 = function(arg0, arg1) {
        getObject(arg0).mode = __wbindgen_enum_RequestMode[arg1];
    };
    imports.wbg.__wbg_setsignal_75b21ef3a81de905 = function(arg0, arg1) {
        getObject(arg0).signal = getObject(arg1);
    };
    imports.wbg.__wbg_signMessage_c732ea9d998cac79 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        let deferred0_0;
        let deferred0_1;
        let deferred1_0;
        let deferred1_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            deferred1_0 = arg2;
            deferred1_1 = arg3;
            const ret = window.keychain_wallets.signMessage(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
            return addHeapObject(ret);
        } finally {
            wasm.__wbindgen_export_3(deferred0_0, deferred0_1, 1);
            wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
        }
    }, arguments) };
    imports.wbg.__wbg_signal_aaf9ad74119f20a4 = function(arg0) {
        const ret = getObject(arg0).signal;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_status_f6360336ca686bf0 = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_stringify_f7ed6987935b4a24 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_subarray_aa9065fa9dc5df96 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_text_7805bea50de2af49 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).text();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_then_44b73946d2fb3e7d = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_48b406749878a531 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_url_ae10c34ca209681d = function(arg0, arg1) {
        const ret = getObject(arg1).url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_value_cd1ffa7b1ab794f1 = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper5656 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 662, __wbg_adapter_46);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper5801 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 695, __wbg_adapter_49);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = getObject(arg0) in getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_json_parse = function(arg0, arg1) {
        const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_json_serialize = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = JSON.stringify(obj === undefined ? null : obj);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('account_wasm_bg.wasm', window.location.href);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
