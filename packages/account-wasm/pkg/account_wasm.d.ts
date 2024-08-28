/* tslint:disable */
/* eslint-disable */
export interface JsCall {
    contract_address: Felt;
    entrypoint: string;
    calldata: Felt[];
}

export interface JsEstimateFeeDetails {
    nonce: Felt;
}

export interface JsOutsideExecution {
    caller: Felt;
    execute_before: number;
    execute_after: number;
    calls: JsCall[];
    nonce: Felt;
}

export interface JsPolicy {
    target: string;
    method: string;
}

export interface JsSession {
    policies: JsPolicy[];
    expires_at: number;
    credentials: JsCredentials;
}

export interface JsCredentials {
    authorization: Felt[];
    private_key: Felt;
}

export interface JsInvocationsDetails {
    nonce: Felt;
    max_fee: Felt;
}

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
* @param {(JsPolicy)[]} policies
* @param {bigint} expires_at
* @param {string} public_key
* @returns {Promise<string>}
*/
  registerSession(policies: (JsPolicy)[], expires_at: bigint, public_key: string): Promise<string>;
/**
* @param {(JsPolicy)[]} policies
* @param {bigint} expires_at
* @returns {Promise<any>}
*/
  createSession(policies: (JsPolicy)[], expires_at: bigint): Promise<any>;
/**
* @param {any[]} calls
* @param {number | undefined} [fee_multiplier]
* @returns {Promise<any>}
*/
  estimateInvokeFee(calls: any[], fee_multiplier?: number): Promise<any>;
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
* @param {any[]} calls
* @returns {boolean}
*/
  hasSession(calls: any[]): boolean;
/**
* @returns {any}
*/
  sessionJson(): any;
/**
*/
  revokeSession(): void;
/**
* @param {string} typed_data
* @returns {Promise<any>}
*/
  signMessage(typed_data: string): Promise<any>;
/**
* @param {any} max_fee
* @returns {Promise<any>}
*/
  deploySelf(max_fee: any): Promise<any>;
/**
* @returns {Promise<any>}
*/
  delegateAccount(): Promise<any>;
}
/**
*/
export class CartridgeSessionAccount {
  free(): void;
/**
* @param {string} rpc_url
* @param {string} signer
* @param {string} guardian
* @param {string} address
* @param {string} chain_id
* @param {(string)[]} session_authorization
* @param {JsSession} session
* @returns {CartridgeSessionAccount}
*/
  static new(rpc_url: string, signer: string, guardian: string, address: string, chain_id: string, session_authorization: (string)[], session: JsSession): CartridgeSessionAccount;
/**
* @param {string} rpc_url
* @param {string} signer
* @param {string} guardian
* @param {string} address
* @param {string} chain_id
* @param {string} owner_guid
* @param {JsSession} session
* @returns {CartridgeSessionAccount}
*/
  static new_as_registered(rpc_url: string, signer: string, guardian: string, address: string, chain_id: string, owner_guid: string, session: JsSession): CartridgeSessionAccount;
/**
* @param {(JsCall)[]} calls
* @returns {Promise<string>}
*/
  execute(calls: (JsCall)[]): Promise<string>;
}
