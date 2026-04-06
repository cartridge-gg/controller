/**
 * Pure TypeScript equivalents of the WASM session types.
 * Structurally identical to @cartridge/controller-wasm session_wasm.d.ts.
 */

export type JsFelt = string;

export interface CallPolicy {
  target: JsFelt;
  method: JsFelt;
  authorized?: boolean;
}

export interface TypedDataPolicy {
  scope_hash: JsFelt;
  authorized?: boolean;
}

export interface ApprovalPolicy {
  target: JsFelt;
  spender: JsFelt;
  amount: JsFelt;
}

export type Policy = CallPolicy | TypedDataPolicy | ApprovalPolicy;

export interface Session {
  policies: Policy[];
  expiresAt: number;
  metadataHash: JsFelt;
  sessionKeyGuid: JsFelt;
  guardianKeyGuid: JsFelt;
}

export interface JsCall {
  contractAddress: JsFelt;
  entrypoint: string;
  calldata: JsFelt[];
}

export interface Signer {
  starknet?: StarknetSigner;
}

export interface StarknetSigner {
  privateKey: JsFelt;
}

export interface JsOutsideExecutionV3 {
  caller: JsFelt;
  execute_after: string;
  execute_before: string;
  calls: { to: JsFelt; selector: JsFelt; calldata: JsFelt[] }[];
  nonce: [JsFelt, JsFelt];
}

export interface JsSignedOutsideExecution {
  outside_execution: JsOutsideExecutionV3;
  signature: JsFelt[];
}
