import {
  addAddressPadding,
  Call,
  CallData,
  hash,
  typedData,
  TypedDataRevision,
} from "starknet";
import wasm from "@cartridge/account-wasm/controller";
import { Policies, SessionPolicies } from "@cartridge/presets";

// Whitelist of allowed property names to prevent prototype pollution
const ALLOWED_PROPERTIES = new Set([
  "contracts",
  "messages",
  "target",
  "method",
  "name",
  "description",
  "types",
  "domain",
  "primaryType",
]);

function validatePropertyName(prop: string): void {
  if (!ALLOWED_PROPERTIES.has(prop)) {
    throw new Error(`Invalid property name: ${prop}`);
  }
}

function safeObjectAccess<T>(obj: any, prop: string): T {
  validatePropertyName(prop);
  return obj[prop];
}

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
          if (safeObjectAccess<string>(p, "target")) {
            const target = safeObjectAccess<string>(p, "target");
            const entrypoint = safeObjectAccess<string>(p, "method");
            const contracts = safeObjectAccess<Record<string, any>>(
              prev,
              "contracts",
            );
            const item = {
              name: entrypoint,
              entrypoint: entrypoint,
              description: safeObjectAccess<string>(p, "description"),
            };

            if (target in contracts) {
              const methods = toArray(contracts[target].methods);
              contracts[target] = {
                methods: [...methods, item],
              };
            } else {
              contracts[target] = {
                methods: [item],
              };
            }
          } else {
            const messages = safeObjectAccess<any[]>(prev, "messages");
            messages.push(p);
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
      if (safeObjectAccess<string>(p, "target")) {
        return {
          target: safeObjectAccess<string>(p, "target"),
          method: safeObjectAccess<string>(p, "method"),
        };
      } else {
        const domainHash = typedData.getStructHash(
          safeObjectAccess<any>(p, "types"),
          "StarknetDomain",
          safeObjectAccess<any>(p, "domain"),
          TypedDataRevision.ACTIVE,
        );
        const typeHash = typedData.getTypeHash(
          safeObjectAccess<any>(p, "types"),
          safeObjectAccess<string>(p, "primaryType"),
          TypedDataRevision.ACTIVE,
        );

        return {
          scope_hash: hash.computePoseidonHash(domainHash, typeHash),
        };
      }
    });
  }

  return [
    ...Object.entries(
      safeObjectAccess<Record<string, any>>(policies, "contracts") ?? {},
    ).flatMap(([target, { methods }]) =>
      toArray(methods).map((m) => ({
        target,
        method: safeObjectAccess<string>(m, "name"),
      })),
    ),
    ...(safeObjectAccess<any[]>(policies, "messages") ?? []).map((p) => {
      const domainHash = typedData.getStructHash(
        safeObjectAccess<any>(p, "types"),
        "StarknetDomain",
        safeObjectAccess<any>(p, "domain"),
        TypedDataRevision.ACTIVE,
      );
      const typeHash = typedData.getTypeHash(
        safeObjectAccess<any>(p, "types"),
        safeObjectAccess<string>(p, "primaryType"),
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
