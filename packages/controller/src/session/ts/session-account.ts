import type { InvokeFunctionResponse } from "starknet";
import type { JsCall, Session } from "./types";
import { computePolicyMerkle, computePolicyMerkleProofs } from "./merkle";
import {
  buildSignedOutsideExecutionV3,
  createPolicyProofIndex,
  type SessionRegistration,
} from "./outside-execution";
import { signerToGuid } from "./guid";

/**
 * Pure TypeScript replacement for the WASM CartridgeSessionAccount class.
 * Provides the same `newAsRegistered`, `executeFromOutside`, and `execute` interface.
 */
export class TsSessionAccount {
  private _rpcUrl: string;
  private _privateKey: string;
  private _address: string;
  private _ownerGuid: string;
  private _chainId: string;
  private _session: Session;
  private _sessionKeyGuid: string;
  private _policyRoot: string;
  private _policyProofIndex: Map<string, string[]>;

  private constructor(
    rpcUrl: string,
    privateKey: string,
    address: string,
    ownerGuid: string,
    chainId: string,
    session: Session,
  ) {
    this._rpcUrl = rpcUrl;
    this._privateKey = privateKey;
    this._address = address;
    this._ownerGuid = ownerGuid;
    this._chainId = chainId;
    this._session = session;

    this._sessionKeyGuid = signerToGuid({
      starknet: { privateKey },
    });

    const { root } = computePolicyMerkle(session.policies);
    this._policyRoot = root;

    const proofs = computePolicyMerkleProofs(session.policies);
    this._policyProofIndex = createPolicyProofIndex(proofs);
  }

  static newAsRegistered(
    rpcUrl: string,
    signer: string,
    address: string,
    ownerGuid: string,
    chainId: string,
    session: Session,
  ): TsSessionAccount {
    return new TsSessionAccount(
      rpcUrl,
      signer,
      address,
      ownerGuid,
      chainId,
      session,
    );
  }

  async executeFromOutside(calls: JsCall[]): Promise<InvokeFunctionResponse> {
    const sessionRegistration: SessionRegistration = {
      username: "",
      address: this._address,
      ownerGuid: this._ownerGuid,
      expiresAt: String(this._session.expiresAt),
      guardianKeyGuid: this._session.guardianKeyGuid ?? "0x0",
      metadataHash: this._session.metadataHash ?? "0x0",
      sessionKeyGuid: this._session.sessionKeyGuid,
    };

    const starknetCalls = calls.map((c) => ({
      contractAddress: c.contractAddress,
      entrypoint: c.entrypoint,
      calldata: c.calldata,
    }));

    const { outsideExecution, signature } = buildSignedOutsideExecutionV3({
      calls: starknetCalls,
      chainId: this._chainId,
      session: sessionRegistration,
      sessionPrivateKey: this._privateKey,
      policyRoot: this._policyRoot,
      sessionKeyGuid: this._sessionKeyGuid,
      policyProofIndex: this._policyProofIndex,
    });

    // Submit via Cartridge's custom RPC method
    const response = await fetch(this._rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "cartridge_addExecuteOutsideTransaction",
        params: {
          address: this._address,
          outside_execution: outsideExecution,
          signature,
        },
      }),
    });

    const result = (await response.json()) as any;
    if (result.error) {
      throw new Error(result.error.message || JSON.stringify(result.error));
    }

    return extractTransactionHash(result.result);
  }

  async execute(calls: JsCall[]): Promise<InvokeFunctionResponse> {
    const sessionRegistration: SessionRegistration = {
      username: "",
      address: this._address,
      ownerGuid: this._ownerGuid,
      expiresAt: String(this._session.expiresAt),
      guardianKeyGuid: this._session.guardianKeyGuid ?? "0x0",
      metadataHash: this._session.metadataHash ?? "0x0",
      sessionKeyGuid: this._session.sessionKeyGuid,
    };

    const starknetCalls = calls.map((c) => ({
      contractAddress: c.contractAddress,
      entrypoint: c.entrypoint,
      calldata: c.calldata,
    }));

    // For direct execution, build the same session token signature
    // but submit as a regular invoke through the RPC
    const { signature } = buildSignedOutsideExecutionV3({
      calls: starknetCalls,
      chainId: this._chainId,
      session: sessionRegistration,
      sessionPrivateKey: this._privateKey,
      policyRoot: this._policyRoot,
      sessionKeyGuid: this._sessionKeyGuid,
      policyProofIndex: this._policyProofIndex,
    });

    // Use Cartridge's addInvokeTransaction with session token
    const response = await fetch(this._rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "starknet_addInvokeTransaction",
        params: {
          invoke_transaction: {
            type: "INVOKE",
            sender_address: this._address,
            calldata: calls.flatMap((c) => [
              c.contractAddress,
              c.entrypoint,
              String(c.calldata.length),
              ...c.calldata,
            ]),
            version: "0x3",
            signature,
            nonce: "0x0",
            resource_bounds: {
              l1_gas: { max_amount: "0x0", max_price_per_unit: "0x0" },
              l2_gas: { max_amount: "0x0", max_price_per_unit: "0x0" },
            },
          },
        },
      }),
    });

    const result = (await response.json()) as any;
    if (result.error) {
      throw new Error(result.error.message || JSON.stringify(result.error));
    }

    return extractTransactionHash(result.result);
  }
}

function extractTransactionHash(result: unknown): InvokeFunctionResponse {
  if (typeof result === "string") {
    return { transaction_hash: result };
  }
  if (result && typeof result === "object") {
    const r = result as Record<string, unknown>;
    const txHash =
      r.transaction_hash ?? r.transactionHash ?? r.hash ?? r.tx_hash;
    if (typeof txHash === "string") {
      return { transaction_hash: txHash };
    }
  }
  throw new Error("Could not extract transaction hash from response");
}
