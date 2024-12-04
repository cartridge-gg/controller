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
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
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
              const _methods = prev.contracts![p.target].methods;
              const methods = Array.isArray(_methods) ? _methods : [_methods];
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
