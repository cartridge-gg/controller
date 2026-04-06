/**
 * Pure TypeScript equivalents of the WASM session types.
 */

export interface CallPolicy {
  target: string;
  method: string;
  authorized?: boolean;
}

export interface TypedDataPolicy {
  scope_hash: string;
  authorized?: boolean;
}

export interface ApprovalPolicy {
  target: string;
  spender: string;
  amount: string;
}

export type Policy = CallPolicy | TypedDataPolicy | ApprovalPolicy;

export interface Session {
  policies: Policy[];
  expiresAt: number;
  metadataHash: string;
  sessionKeyGuid: string;
  guardianKeyGuid: string;
}

export interface SessionCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

export interface Signer {
  starknet?: StarknetSigner;
}

export interface StarknetSigner {
  privateKey: string;
}
