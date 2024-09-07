/* tslint:disable */
/* eslint-disable */
/**
*/
export enum ErrorType {
  SignError = 0,
  StorageError = 1,
  AccountFactoryError = 2,
  PaymasterExecutionTimeNotReached = 3,
  PaymasterExecutionTimePassed = 4,
  PaymasterInvalidCaller = 5,
  PaymasterRateLimitExceeded = 6,
  PaymasterNotSupported = 7,
  PaymasterHttp = 8,
  PaymasterExcecution = 9,
  PaymasterSerialization = 10,
  CartridgeControllerNotDeployed = 11,
  InsufficientBalance = 12,
  OriginError = 13,
  EncodingError = 14,
  SerdeWasmBindgenError = 15,
  CairoSerdeError = 16,
  CairoShortStringToFeltError = 17,
  DeviceCreateCredential = 18,
  DeviceGetAssertion = 19,
  DeviceBadAssertion = 20,
  DeviceChannel = 21,
  DeviceOrigin = 22,
  AccountSigning = 23,
  AccountProvider = 24,
  AccountClassHashCalculation = 25,
  AccountClassCompression = 26,
  AccountFeeOutOfRange = 27,
  ProviderRateLimited = 28,
  ProviderArrayLengthMismatch = 29,
  ProviderOther = 30,
  StarknetFailedToReceiveTransaction = 31,
  StarknetContractNotFound = 32,
  StarknetBlockNotFound = 33,
  StarknetInvalidTransactionIndex = 34,
  StarknetClassHashNotFound = 35,
  StarknetTransactionHashNotFound = 36,
  StarknetPageSizeTooBig = 37,
  StarknetNoBlocks = 38,
  StarknetInvalidContinuationToken = 39,
  StarknetTooManyKeysInFilter = 40,
  StarknetContractError = 41,
  StarknetTransactionExecutionError = 42,
  StarknetClassAlreadyDeclared = 43,
  StarknetInvalidTransactionNonce = 44,
  StarknetInsufficientMaxFee = 45,
  StarknetInsufficientAccountBalance = 46,
  StarknetValidationFailure = 47,
  StarknetCompilationFailed = 48,
  StarknetContractClassSizeIsTooLarge = 49,
  StarknetNonAccount = 50,
  StarknetDuplicateTx = 51,
  StarknetCompiledClassHashMismatch = 52,
  StarknetUnsupportedTxVersion = 53,
  StarknetUnsupportedContractClassVersion = 54,
  StarknetUnexpectedError = 55,
  StarknetNoTraceAvailable = 56,
}
export interface JsEstimateFeeDetails {
    nonce: Felt;
}

export interface JsPolicy {
    target: string;
    method: string;
}

export interface JsInvocationsDetails {
    nonce: Felt;
    maxFee: Felt;
}

export interface JsSession {
    policies: JsPolicy[];
    expiresAt: number;
}

export interface JsCredentials {
    authorization: Felt[];
    privateKey: Felt;
}

export interface JsCall {
    contractAddress: Felt;
    entrypoint: string;
    calldata: Felt[];
}

export interface JsOutsideExecution {
    caller: Felt;
    executeBefore: number;
    executeAfter: number;
    calls: JsCall[];
    nonce: Felt;
}

export type Felts = JsFelt[];

export type JsFelt = Felt;

/**
*/
export class CartridgeAccount {
  free(): void;
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
  static new(app_id: string, rpc_url: string, chain_id: JsFelt, address: JsFelt, rp_id: string, username: string, credential_id: string, public_key: string): CartridgeAccount;
/**
* @returns {JsFelt}
*/
  ownerGuid(): JsFelt;
/**
* @param {(JsPolicy)[]} policies
* @param {bigint} expires_at
* @param {JsFelt} public_key
* @returns {Promise<JsFelt>}
*/
  registerSession(policies: (JsPolicy)[], expires_at: bigint, public_key: JsFelt): Promise<JsFelt>;
/**
* @param {(JsPolicy)[]} policies
* @param {bigint} expires_at
* @returns {Promise<any>}
*/
  createSession(policies: (JsPolicy)[], expires_at: bigint): Promise<any>;
/**
* @param {(JsCall)[]} calls
* @param {number | undefined} [fee_multiplier]
* @returns {Promise<any>}
*/
  estimateInvokeFee(calls: (JsCall)[], fee_multiplier?: number): Promise<any>;
/**
* @param {(JsCall)[]} calls
* @param {JsInvocationsDetails} details
* @returns {Promise<any>}
*/
  execute(calls: (JsCall)[], details: JsInvocationsDetails): Promise<any>;
/**
* @param {(JsCall)[]} calls
* @param {any} caller
* @returns {Promise<any>}
*/
  executeFromOutside(calls: (JsCall)[], caller: any): Promise<any>;
/**
* @param {(JsCall)[]} calls
* @returns {boolean}
*/
  hasSession(calls: (JsCall)[]): boolean;
/**
* @returns {any}
*/
  sessionJson(): any;
/**
*/
  revokeSession(): void;
/**
* @param {string} typed_data
* @returns {Promise<Felts>}
*/
  signMessage(typed_data: string): Promise<Felts>;
/**
* @param {JsFelt} max_fee
* @returns {Promise<any>}
*/
  deploySelf(max_fee: JsFelt): Promise<any>;
/**
* @returns {Promise<JsFelt>}
*/
  delegateAccount(): Promise<JsFelt>;
}
/**
*/
export class CartridgeSessionAccount {
  free(): void;
/**
* @param {string} rpc_url
* @param {JsFelt} signer
* @param {JsFelt} address
* @param {JsFelt} chain_id
* @param {(JsFelt)[]} session_authorization
* @param {JsSession} session
* @returns {CartridgeSessionAccount}
*/
  static new(rpc_url: string, signer: JsFelt, address: JsFelt, chain_id: JsFelt, session_authorization: (JsFelt)[], session: JsSession): CartridgeSessionAccount;
/**
* @param {string} rpc_url
* @param {JsFelt} signer
* @param {JsFelt} address
* @param {JsFelt} owner_guid
* @param {JsFelt} chain_id
* @param {JsSession} session
* @returns {CartridgeSessionAccount}
*/
  static new_as_registered(rpc_url: string, signer: JsFelt, address: JsFelt, owner_guid: JsFelt, chain_id: JsFelt, session: JsSession): CartridgeSessionAccount;
/**
* @param {JsFelt} hash
* @param {(JsCall)[]} calls
* @returns {Promise<Felts>}
*/
  sign(hash: JsFelt, calls: (JsCall)[]): Promise<Felts>;
/**
* @param {(JsCall)[]} calls
* @returns {Promise<any>}
*/
  execute(calls: (JsCall)[]): Promise<any>;
/**
* @param {(JsCall)[]} calls
* @returns {Promise<any>}
*/
  execute_from_outside(calls: (JsCall)[]): Promise<any>;
}
/**
*/
export class JsControllerError {
  free(): void;
/**
*/
  details?: string;
/**
*/
  error_type: ErrorType;
/**
*/
  message: string;
}
