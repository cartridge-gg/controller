/**
 * Pure TypeScript equivalents of the WASM session types.
 */

export type Felt252 = string;

export interface CallPolicy {
  target: Felt252;
  method: Felt252;
  authorized?: boolean;
}

export interface TypedDataPolicy {
  scope_hash: Felt252;
  authorized?: boolean;
}

export interface ApprovalPolicy {
  target: Felt252;
  spender: Felt252;
  amount: Felt252;
}

export type Policy = CallPolicy | TypedDataPolicy | ApprovalPolicy;

export interface Session {
  policies: Policy[];
  expiresAt: number;
  metadataHash: Felt252;
  sessionKeyGuid: Felt252;
  guardianKeyGuid: Felt252;
}

export interface SessionCall {
  contractAddress: Felt252;
  entrypoint: string;
  calldata: Felt252[];
}

export interface Signer {
  starknet?: StarknetSigner;
}

export interface StarknetSigner {
  privateKey: Felt252;
}
