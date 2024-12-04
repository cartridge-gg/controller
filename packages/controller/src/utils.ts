import {
  addAddressPadding,
  Call,
  CallData,
  hash,
  typedData,
  TypedDataRevision,
} from "starknet";
import { Policies, SessionPolicies } from "./types";
import wasm from "@cartridge/account-wasm/controller";

export function normalizeCalls(calls: Call | Call[]) {
  return toArray(calls).map((call) => {
    return {
      entrypoint: call.entrypoint,
      contractAddress: addAddressPadding(call.contractAddress),
      calldata: CallData.toHex(call.calldata),
    };
  });
}

export function toSessionPolicies(policies: Policies): SessionPolicies {
  return Array.isArray(policies)
    ? policies.reduce<SessionPolicies>(
        (prev, p) => {
          if ("target" in p) {
            if (p.target in prev.contracts!) {
              const methods = toArray(prev.contracts![p.target].methods);
              prev.contracts![p.target] = {
                methods: [
                  ...methods,
                  { name: p.target, description: p.description },
                ],
              };
            } else {
              prev.contracts![p.target] = {
                methods: [{ name: p.target, description: p.description }],
              };
            }
          } else {
            prev.messages!.push(p);
          }

          return prev;
        },
        { contracts: {}, messages: [] },
      )
    : policies;
}

export function toWasmPolicies(policies: Policies): wasm.Policy[] {
  if (Array.isArray(policies)) {
    return policies.map((p) => {
      if ("target" in p) {
        return {
          target: p.target,
          method: p.method,
        };
      } else {
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
      }
    });
  }

  return [
    ...Object.entries(policies.contracts ?? {}).flatMap(
      ([target, { methods }]) =>
        toArray(methods).map((m) => ({
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

export function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}
