/* tslint:disable */
/* eslint-disable */
/**
*/
export class CartridgeAccount {
  free(): void;
/**
* Creates a new `CartridgeAccount` instance.
*
* # Parameters
* - `rpc_url`: The URL of the JSON-RPC endpoint.
* - `chain_id`: Identifier of the blockchain network to interact with.
* - `address`: The blockchain address associated with the account.
* - `rp_id`: Relying Party Identifier, a string that uniquely identifies the WebAuthn relying party.
* - `origin`: The origin of the WebAuthn request. Example https://cartridge.gg
* - `username`: Username associated with the account.
* - `credential_id`: Base64 encoded bytes of the raw credential ID generated during the WebAuthn registration process.
* - `public_key`: Base64 encoded bytes of the public key generated during the WebAuthn registration process (COSE format).
* @param {string} rpc_url
* @param {string} chain_id
* @param {string} address
* @param {string} rp_id
* @param {string} origin
* @param {string} username
* @param {string} credential_id
* @param {string} public_key
* @returns {CartridgeAccount}
*/
  static new(rpc_url: string, chain_id: string, address: string, rp_id: string, origin: string, username: string, credential_id: string, public_key: string): CartridgeAccount;
/**
* @param {any[]} policies
* @param {bigint} expires_at
* @returns {Promise<any>}
*/
  createSession(policies: any[], expires_at: bigint): Promise<any>;
/**
* @param {any[]} calls
* @param {any} session_details
* @param {number | undefined} [fee_multiplier]
* @returns {Promise<any>}
*/
  estimateInvokeFee(calls: any[], session_details: any, fee_multiplier?: number): Promise<any>;
/**
* @param {any[]} calls
* @param {any} transaction_details
* @param {any} session_details
* @returns {Promise<any>}
*/
  execute(calls: any[], transaction_details: any, session_details: any): Promise<any>;
/**
* @param {any[]} calls
* @param {any} caller
* @param {any} session_details
* @returns {Promise<any>}
*/
  executeFromOutside(calls: any[], caller: any, session_details: any): Promise<any>;
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
