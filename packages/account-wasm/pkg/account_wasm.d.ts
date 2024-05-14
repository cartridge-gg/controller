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
* - `credential_id`: Base64 encoded bytes of the raw credential ID generated during the WebAuthn registration process.
* - `public_key`: Base64 encoded bytes of the public key generated during the WebAuthn registration process (COSE format).
* @param {string} rpc_url
* @param {string} chain_id
* @param {string} address
* @param {string} rp_id
* @param {string} origin
* @param {string} credential_id
* @param {string} public_key
* @param {any} session_details
* @returns {CartridgeAccount}
*/
  static new(rpc_url: string, chain_id: string, address: string, rp_id: string, origin: string, credential_id: string, public_key: string, session_details: any): CartridgeAccount;
/**
* @param {any[]} policies
* @param {bigint} expires_at
* @returns {Promise<any>}
*/
  createSession(policies: any[], expires_at: bigint): Promise<any>;
/**
* @param {any[]} calls
* @param {any} transaction_details
* @returns {Promise<any>}
*/
  execute(calls: any[], transaction_details: any): Promise<any>;
/**
* @returns {any[]}
*/
  signMessage(): any[];
}
