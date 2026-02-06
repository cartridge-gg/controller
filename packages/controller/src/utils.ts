import { Policy, ApprovalPolicy } from "@cartridge/controller-wasm/controller";
import { Policies, SessionPolicies } from "@cartridge/presets";
import { ChainId } from "@starknet-io/types-js";
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

/**
 * Converts parsed session policies to WASM-compatible Policy objects.
 *
 * IMPORTANT: Policies are sorted canonically before hashing. Without this,
 * Object.keys/entries reordering can cause identical policies to produce
 * different merkle roots, leading to "session/not-registered" errors.
 * See: https://github.com/cartridge-gg/controller/issues/2357
 */
export function toWasmPolicies(policies: ParsedSessionPolicies): Policy[] {
  return [
    ...Object.entries(policies.contracts ?? {})
      .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .flatMap(([target, { methods }]) =>
        toArray(methods)
          .slice()
          .sort((a, b) => a.entrypoint.localeCompare(b.entrypoint))
          .map((m): Policy => {
            // Check if this is an approve entrypoint with spender and amount
            if (m.entrypoint === "approve") {
              if ("spender" in m && "amount" in m && m.spender && m.amount) {
                const approvalPolicy: ApprovalPolicy = {
                  target,
                  spender: m.spender,
                  amount: String(m.amount),
                };
                return approvalPolicy;
              }

              // Fall back to CallPolicy with deprecation warning
              console.warn(
                `[DEPRECATED] Approve method without spender and amount fields will be rejected in future versions. ` +
                  `Please update your preset or policies to include both 'spender' and 'amount' fields for approve calls on contract ${target}. ` +
                  `Example: { entrypoint: "approve", spender: "0x...", amount: "0x..." }`,
              );
            }

            // For non-approve methods and legacy approve, create a regular CallPolicy
            return {
              target,
              method: hash.getSelectorFromName(m.entrypoint),
              authorized: m.authorized,
            };
          }),
      ),
    ...(policies.messages ?? [])
      .map((p) => {
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
      })
      .sort((a, b) =>
        a.scope_hash.toString().localeCompare(b.scope_hash.toString()),
      ),
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
  const isCartridgeHost = url.hostname === "api.cartridge.gg";

  // Handle non-Cartridge hosts by making a synchronous call to getChainId
  if (!isCartridgeHost) {
    // Check if we're in a browser environment
    if (typeof XMLHttpRequest === "undefined") {
      // In Node.js environment (like tests), we can't make synchronous HTTP calls
      // For now, we'll use a placeholder chainId for non-Cartridge hosts in tests
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

export function isMobile() {
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

// Sanitize image src to prevent XSS
export function sanitizeImageSrc(src: string): string {
  // Allow only http/https URLs (absolute)
  try {
    const url = new URL(src, window.location.origin);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch (_) {
    // If invalid, fall through to fallback src below
  }
  // Fallback image (transparent pixel or default)
  return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
}
