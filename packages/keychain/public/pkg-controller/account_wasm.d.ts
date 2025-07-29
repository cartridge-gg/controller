/* tslint:disable */
/* eslint-disable */
export function signerToGuid(signer: Signer): JsFelt;
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
 */
export function computeAccountAddress(class_hash: JsFelt, owner: Owner, salt: JsFelt): JsFelt;
export function start(): void;
export function add(a: number, b: number): number;
export enum ErrorCode {
  StarknetFailedToReceiveTransaction = 1,
  StarknetContractNotFound = 20,
  StarknetBlockNotFound = 24,
  StarknetInvalidTransactionIndex = 27,
  StarknetClassHashNotFound = 28,
  StarknetTransactionHashNotFound = 29,
  StarknetPageSizeTooBig = 31,
  StarknetNoBlocks = 32,
  StarknetInvalidContinuationToken = 33,
  StarknetTooManyKeysInFilter = 34,
  StarknetContractError = 40,
  StarknetTransactionExecutionError = 41,
  StarknetClassAlreadyDeclared = 51,
  StarknetInvalidTransactionNonce = 52,
  StarknetInsufficientMaxFee = 53,
  StarknetInsufficientAccountBalance = 54,
  StarknetValidationFailure = 55,
  StarknetCompilationFailed = 56,
  StarknetContractClassSizeIsTooLarge = 57,
  StarknetNonAccount = 58,
  StarknetDuplicateTx = 59,
  StarknetCompiledClassHashMismatch = 60,
  StarknetUnsupportedTxVersion = 61,
  StarknetUnsupportedContractClassVersion = 62,
  StarknetUnexpectedError = 63,
  StarknetNoTraceAvailable = 10,
  SignError = 101,
  StorageError = 102,
  AccountFactoryError = 103,
  PaymasterExecutionTimeNotReached = 104,
  PaymasterExecutionTimePassed = 105,
  PaymasterInvalidCaller = 106,
  PaymasterRateLimitExceeded = 107,
  PaymasterNotSupported = 108,
  PaymasterHttp = 109,
  PaymasterExcecution = 110,
  PaymasterSerialization = 111,
  CartridgeControllerNotDeployed = 112,
  InsufficientBalance = 113,
  OriginError = 114,
  EncodingError = 115,
  SerdeWasmBindgenError = 116,
  CairoSerdeError = 117,
  CairoShortStringToFeltError = 118,
  DeviceCreateCredential = 119,
  DeviceGetAssertion = 120,
  DeviceBadAssertion = 121,
  DeviceChannel = 122,
  DeviceOrigin = 123,
  AccountSigning = 124,
  AccountProvider = 125,
  AccountClassHashCalculation = 126,
  AccountFeeOutOfRange = 128,
  ProviderRateLimited = 129,
  ProviderArrayLengthMismatch = 130,
  ProviderOther = 131,
  SessionAlreadyRegistered = 132,
  UrlParseError = 133,
  Base64DecodeError = 134,
  CoseError = 135,
  PolicyChainIdMismatch = 136,
  InvalidOwner = 137,
}
export interface JsCall {
    contractAddress: JsFelt;
    entrypoint: string;
    calldata: JsFelt[];
}

export type JsPriceUnit = "WEI" | "FRI";

export interface JsEstimateFeeDetails {
    nonce: JsFelt;
}

export interface JsFeeEstimate {
    l1_gas_consumed: number;
    l1_gas_price: number;
    l2_gas_consumed: number;
    l2_gas_price: number;
    l1_data_gas_consumed: number;
    l1_data_gas_price: number;
    overall_fee: number;
    unit: JsPriceUnit;
}

export interface Owner {
    signer?: Signer;
    account?: JsFelt;
}

export interface CallPolicy {
    target: JsFelt;
    method: JsFelt;
    authorized?: boolean;
}

export interface TypedDataPolicy {
    scope_hash: JsFelt;
    authorized?: boolean;
}

export type Policy = CallPolicy | TypedDataPolicy;

export type JsRegister = RegisterInput;

export type JsRegisterResponse = ResponseData;

export interface WebauthnSigner {
    rpId: string;
    credentialId: string;
    publicKey: string;
}

export interface StarknetSigner {
    privateKey: JsFelt;
}

export interface Eip191Signer {
    address: string;
}

export interface Signer {
    webauthns?: WebauthnSigner[];
    webauthn?: WebauthnSigner;
    starknet?: StarknetSigner;
    eip191?: Eip191Signer;
}

export type JsSignerInput = SignerInput;

export type JsFelt = Felt;

export type Felts = JsFelt[];

export type JsFeeSource = "PAYMASTER" | "CREDITS";

export type JsRevokableSession = RevokableSession;

export interface AuthorizedSession {
    session: Session;
    authorization: JsFelt[] | null;
    isRegistered: boolean;
    expiresAt: number;
    allowedPoliciesRoot: JsFelt;
    metadataHash: JsFelt;
    sessionKeyGuid: JsFelt;
    guardianKeyGuid: JsFelt;
}

export interface Session {
    policies: Policy[];
    expiresAt: number;
    metadataHash: JsFelt;
    sessionKeyGuid: JsFelt;
    guardianKeyGuid: JsFelt;
}

export interface Credentials {
    authorization: JsFelt[];
    privateKey: JsFelt;
}

export class CartridgeAccount {
  private constructor();
  free(): void;
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
   */
  static new(app_id: string, class_hash: JsFelt, rpc_url: string, chain_id: JsFelt, address: JsFelt, username: string, owner: Owner, cartridge_api_url: string): CartridgeAccountWithMeta;
  static fromStorage(app_id: string, cartridge_api_url: string): CartridgeAccountWithMeta | undefined;
  disconnect(): Promise<void>;
  registerSession(policies: Policy[], expires_at: bigint, public_key: JsFelt, max_fee?: JsFeeEstimate | null): Promise<any>;
  registerSessionCalldata(policies: Policy[], expires_at: bigint, public_key: JsFelt): Promise<any>;
  upgrade(new_class_hash: JsFelt): Promise<JsCall>;
  login(expires_at: bigint, is_controller_registered?: boolean | null, signers?: Signer | null): Promise<AuthorizedSession>;
  register(register: JsRegister): Promise<JsRegisterResponse>;
  createSession(policies: Policy[], expires_at: bigint): Promise<AuthorizedSession | undefined>;
  skipSession(policies: Policy[]): Promise<void>;
  addOwner(owner: Signer, signer_input: JsSignerInput): Promise<void>;
  estimateInvokeFee(calls: JsCall[]): Promise<JsFeeEstimate>;
  execute(calls: JsCall[], max_fee?: JsFeeEstimate | null, fee_source?: JsFeeSource | null): Promise<any>;
  executeFromOutsideV2(calls: JsCall[], fee_source?: JsFeeSource | null): Promise<any>;
  executeFromOutsideV3(calls: JsCall[], fee_source?: JsFeeSource | null): Promise<any>;
  isRegisteredSessionAuthorized(policies: Policy[], public_key?: JsFelt | null): Promise<AuthorizedSession | undefined>;
  hasRequestedSession(policies: Policy[]): Promise<boolean>;
  revokeSession(session: JsRevokableSession): Promise<void>;
  revokeSessions(sessions: JsRevokableSession[]): Promise<void>;
  signMessage(typed_data: string): Promise<Felts>;
  getNonce(): Promise<any>;
  deploySelf(max_fee?: JsFeeEstimate | null): Promise<any>;
  estimateDeployFee(): Promise<JsFeeEstimate>;
  delegateAccount(): Promise<JsFelt>;
  hasAuthorizedPoliciesForCalls(calls: JsCall[]): Promise<boolean>;
  hasAuthorizedPoliciesForMessage(typed_data: string): Promise<boolean>;
}
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
  private constructor();
  free(): void;
  appId(): string;
  username(): string;
  address(): string;
  classHash(): string;
  rpcUrl(): string;
  chainId(): string;
  ownerGuid(): JsFelt;
  owner(): Owner;
}
/**
 * A type used as the return type for constructing `CartridgeAccount` to provide an extra,
 * separately borrowable `meta` field for synchronously accessing fixed fields.
 *
 * This type exists instead of simply having `CartridgeAccount::new()` return a tuple as tuples
 * don't implement `IntoWasmAbi` which is needed for crossing JS-WASM boundary.
 */
export class CartridgeAccountWithMeta {
  private constructor();
  free(): void;
  meta(): CartridgeAccountMeta;
  intoAccount(): CartridgeAccount;
}
export class JsControllerError {
  private constructor();
  free(): void;
  code: ErrorCode;
  message: string;
  get data(): string | undefined;
  set data(value: string | null | undefined);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_cartridgeaccount_free: (a: number, b: number) => void;
  readonly cartridgeaccount_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => void;
  readonly cartridgeaccount_fromStorage: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly cartridgeaccount_disconnect: (a: number) => number;
  readonly cartridgeaccount_registerSession: (a: number, b: number, c: number, d: bigint, e: number, f: number) => number;
  readonly cartridgeaccount_registerSessionCalldata: (a: number, b: number, c: number, d: bigint, e: number) => number;
  readonly cartridgeaccount_upgrade: (a: number, b: number) => number;
  readonly cartridgeaccount_login: (a: number, b: bigint, c: number, d: number) => number;
  readonly cartridgeaccount_register: (a: number, b: number) => number;
  readonly cartridgeaccount_createSession: (a: number, b: number, c: number, d: bigint) => number;
  readonly cartridgeaccount_skipSession: (a: number, b: number, c: number) => number;
  readonly cartridgeaccount_addOwner: (a: number, b: number, c: number) => number;
  readonly cartridgeaccount_estimateInvokeFee: (a: number, b: number, c: number) => number;
  readonly cartridgeaccount_execute: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly cartridgeaccount_executeFromOutsideV2: (a: number, b: number, c: number, d: number) => number;
  readonly cartridgeaccount_executeFromOutsideV3: (a: number, b: number, c: number, d: number) => number;
  readonly cartridgeaccount_isRegisteredSessionAuthorized: (a: number, b: number, c: number, d: number) => number;
  readonly cartridgeaccount_hasRequestedSession: (a: number, b: number, c: number) => number;
  readonly cartridgeaccount_revokeSession: (a: number, b: number) => number;
  readonly cartridgeaccount_revokeSessions: (a: number, b: number, c: number) => number;
  readonly cartridgeaccount_signMessage: (a: number, b: number, c: number) => number;
  readonly cartridgeaccount_getNonce: (a: number) => number;
  readonly cartridgeaccount_deploySelf: (a: number, b: number) => number;
  readonly cartridgeaccount_estimateDeployFee: (a: number) => number;
  readonly cartridgeaccount_delegateAccount: (a: number) => number;
  readonly cartridgeaccount_hasAuthorizedPoliciesForCalls: (a: number, b: number, c: number) => number;
  readonly cartridgeaccount_hasAuthorizedPoliciesForMessage: (a: number, b: number, c: number) => number;
  readonly __wbg_cartridgeaccountmeta_free: (a: number, b: number) => void;
  readonly cartridgeaccountmeta_appId: (a: number, b: number) => void;
  readonly cartridgeaccountmeta_username: (a: number, b: number) => void;
  readonly cartridgeaccountmeta_address: (a: number, b: number) => void;
  readonly cartridgeaccountmeta_classHash: (a: number, b: number) => void;
  readonly cartridgeaccountmeta_rpcUrl: (a: number, b: number) => void;
  readonly cartridgeaccountmeta_chainId: (a: number, b: number) => void;
  readonly cartridgeaccountmeta_ownerGuid: (a: number) => number;
  readonly cartridgeaccountmeta_owner: (a: number) => number;
  readonly signerToGuid: (a: number) => number;
  readonly __wbg_cartridgeaccountwithmeta_free: (a: number, b: number) => void;
  readonly cartridgeaccountwithmeta_meta: (a: number) => number;
  readonly cartridgeaccountwithmeta_intoAccount: (a: number) => number;
  readonly computeAccountAddress: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_jscontrollererror_free: (a: number, b: number) => void;
  readonly __wbg_get_jscontrollererror_code: (a: number) => number;
  readonly __wbg_set_jscontrollererror_code: (a: number, b: number) => void;
  readonly __wbg_get_jscontrollererror_message: (a: number, b: number) => void;
  readonly __wbg_set_jscontrollererror_message: (a: number, b: number, c: number) => void;
  readonly __wbg_get_jscontrollererror_data: (a: number, b: number) => void;
  readonly __wbg_set_jscontrollererror_data: (a: number, b: number, c: number) => void;
  readonly start: () => void;
  readonly add: (a: number, b: number) => number;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: (a: number) => void;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_5: (a: number, b: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_7: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
