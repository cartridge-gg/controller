import {
  addAddressPadding,
  Call,
  CallData,
  getChecksumAddress,
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
            const target = getChecksumAddress(
              safeObjectAccess<string>(p, "target"),
            );
            const entrypoint = safeObjectAccess<string>(p, "method");
            const contracts = safeObjectAccess<Record<string, any>>(
              prev,
              "contracts",
            );
            const item = {
              name: humanizeString(entrypoint),
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

export function toWasmPolicies(policies: SessionPolicies): wasm.Policy[] {
  return [
    ...Object.entries(policies.contracts ?? {}).flatMap(
      ([target, { methods }]) =>
        toArray(methods).map((m) => ({
          target,
          method: m.entrypoint,
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

export function humanizeString(str: string): string {
  return (
    str
      // Convert from camelCase or snake_case
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to spaces
      .replace(/_/g, " ") // snake_case to spaces
      .toLowerCase()
      // Capitalize first letter
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}
