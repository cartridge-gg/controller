import {
  addAddressPadding,
  Call,
  CallData,
  constants,
  getChecksumAddress,
  hash,
  shortString,
  typedData,
  TypedDataRevision,
} from "starknet";
import { Policy } from "@cartridge/controller-wasm/controller";
import { Policies, SessionPolicies } from "@cartridge/presets";
import { ChainId } from "@starknet-io/types-js";
import { ParsedSessionPolicies } from "./policies";

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

function safeObjectAccess<T>(obj: unknown, prop: string): T {
  validatePropertyName(prop);
  return (obj as Record<string, T>)[prop];
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
            const contracts = safeObjectAccess<
              Record<string, { methods: unknown[] }>
            >(prev, "contracts");
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
            const messages = safeObjectAccess<unknown[]>(prev, "messages");
            messages.push(p);
          }

          return prev;
        },
        { contracts: {}, messages: [] },
      )
    : policies;
}

export function toWasmPolicies(policies: ParsedSessionPolicies): Policy[] {
  return [
    ...Object.entries(policies.contracts ?? {}).flatMap(
      ([target, { methods }]) =>
        toArray(methods).map((m) => ({
          target,
          method: m.entrypoint,
          authorized: m.authorized,
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
        authorized: p.authorized,
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

export function parseChainId(url: URL): ChainId {
  const parts = url.pathname.split("/");

  // Handle localhost URLs by making a synchronous call to getChainId
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "0.0.0.0"
  ) {
    // Check if we're in a browser environment
    if (typeof XMLHttpRequest === "undefined") {
      // In Node.js environment (like tests), we can't make synchronous HTTP calls
      // For now, we'll use a placeholder chainId for localhost in tests
      console.warn(
        `Cannot make synchronous HTTP call in Node.js environment for ${url.toString()}`,
      );
      return shortString.encodeShortString("LOCALHOST") as ChainId;
    }

    // Use a synchronous XMLHttpRequest to get the chain ID
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url.toString(), false); // false makes it synchronous
    xhr.setRequestHeader("Content-Type", "application/json");

    const requestBody = JSON.stringify({
      jsonrpc: "2.0",
      method: "starknet_chainId",
      params: [],
      id: 1,
    });

    try {
      xhr.send(requestBody);

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.result) {
          return response.result as ChainId;
        }
      }

      throw new Error(
        `Failed to get chain ID from ${url.toString()}: ${xhr.status} ${xhr.statusText}`,
      );
    } catch (error) {
      throw new Error(`Failed to connect to ${url.toString()}: ${error}`);
    }
  }

  if (parts.includes("starknet")) {
    if (parts.includes("mainnet")) {
      return constants.StarknetChainId.SN_MAIN;
    } else if (parts.includes("sepolia")) {
      return constants.StarknetChainId.SN_SEPOLIA;
    }
  } else if (parts.length >= 3) {
    const projectName = parts[2];
    if (parts.includes("katana")) {
      return shortString.encodeShortString(
        `WP_${projectName.toUpperCase().replace(/-/g, "_")}`,
      ) as ChainId;
    } else if (parts.includes("mainnet")) {
      return shortString.encodeShortString(
        `GG_${projectName.toUpperCase().replace(/-/g, "_")}`,
      ) as ChainId;
    }
  }

  throw new Error(`Chain ${url.toString()} not supported`);
}
