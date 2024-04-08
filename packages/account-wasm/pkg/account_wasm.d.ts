/* tslint:disable */
/* eslint-disable */
/**
*/
export class WebauthnAccount {
  free(): void;
/**
* Creates a new `WebauthnAccount` instance.
*
* # Parameters
* - `rpc_url`: The URL of the JSON-RPC endpoint.
* - `chain_id`: Identifier of the blockchain network to interact with.
* - `address`: The blockchain address associated with the account.
* - `rp_id`: Relying Party Identifier, a string that uniquely identifies the WebAuthn relying party.
* - `credential_id`: Base64 encoded bytes of the raw credential ID generated during the WebAuthn registration process.
* @param {string} rpc_url
* @param {string} chain_id
* @param {string} address
* @param {string} rp_id
* @param {string} credential_id
* @returns {WebauthnAccount}
*/
  static new(rpc_url: string, chain_id: string, address: string, rp_id: string, credential_id: string): WebauthnAccount;
/**
* Registers a new keypair on device signer and creates a new `WebauthnAccount` instance.
*
* # Parameters
* - `rpc_url`: The URL of the JSON-RPC endpoint.
* - `chain_id`: Identifier of the blockchain network to interact with.
* - `address`: The blockchain address associated with the account.
* - `rp_id`: Relying Party Identifier, a string that uniquely identifies the WebAuthn relying party.
* - `user_name`: The user name associated with the account.
* @param {string} rpc_url
* @param {string} chain_id
* @param {string} address
* @param {string} rp_id
* @param {string} user_name
* @returns {Promise<WebauthnAccount>}
*/
  static register(rpc_url: string, chain_id: string, address: string, rp_id: string, user_name: string): Promise<WebauthnAccount>;
/**
* @returns {string}
*/
  getCredentialId(): string;
/**
* @returns {string}
*/
  getRpId(): string;
/**
* @param {Uint8Array} challenge
* @returns {Promise<any>}
*/
  sign(challenge: Uint8Array): Promise<any>;
/**
* @param {any[]} transactions
* @param {any} transaction_details
* @returns {Promise<any>}
*/
  signTransaction(transactions: any[], transaction_details: any): Promise<any>;
/**
* @returns {any[]}
*/
  signMessage(): any[];
/**
* @returns {any[]}
*/
  signDeployAccountTransaction(): any[];
/**
* @returns {any[]}
*/
  signDeclareTransaction(): any[];
}
