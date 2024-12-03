import {
  addAddressPadding,
  Call,
  CallData,
  hash,
  typedData,
  TypedDataRevision,
} from "starknet";
import { SessionPolicies } from "./types";
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

export function toWasmPolicies(policies: SessionPolicies): wasm.Policy[] {
  return [
    ...Object.entries(policies.contracts ?? {}).flatMap(
      ([target, { methods }]) =>
        (Array.isArray(methods) ? methods : [methods]).map((m) => ({
          target,
          method: m.name,
        })),
    ),
    ...(policies.messages ?? []).map((p) => {
      const domainHash = typedData.getStructHash(
        p.types,
        "StarknetDomain",
        p.domain,
        TypedDataRevision.ACTIVE,
      );
      const typeHash = typedData.getTypeHash(
        p.types,
        p.primaryType,
        TypedDataRevision.ACTIVE,
      );

      return {
        scope_hash: hash.computePoseidonHash(domainHash, typeHash),
      };
    }),
  ];
}
