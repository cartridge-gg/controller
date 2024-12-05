import {
  addAddressPadding,
  Call,
  CallData,
  hash,
  typedData,
  TypedDataRevision,
} from "starknet";
import { Policy } from "./types";
import wasm from "@cartridge/account-wasm/controller";

export function normalizeCalls(calls: Call | Call[]) {
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
    return {
      entrypoint: call.entrypoint,
      contractAddress: addAddressPadding(call.contractAddress),
      calldata: CallData.toHex(call.calldata),
    };
  });
}

export function toWasmPolicies(policies: Policy[]): wasm.Policy[] {
  return policies.map((richPolicy) => {
    if ("target" in richPolicy) {
      return {
        target: richPolicy.target,
        method: richPolicy.method,
      };
    } else {
      const domainHash = typedData.getStructHash(
        richPolicy.types,
        "StarknetDomain",
        richPolicy.domain,
        TypedDataRevision.ACTIVE,
      );
      const typeHash = typedData.getTypeHash(
        richPolicy.types,
        richPolicy.primaryType,
        TypedDataRevision.ACTIVE,
      );

      return {
        scope_hash: hash.computePoseidonHash(domainHash, typeHash),
      };
    }
  });
}
