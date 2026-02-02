import {
  type Approval,
  type ContractPolicy,
  type Method,
  type SessionPolicies,
  type SignMessagePolicy,
  type TypedDataPolicy,
  erc20Metadata,
} from "@cartridge/presets";
import { CartridgeIcon } from "@cartridge/ui";
import React, { createContext, useContext } from "react";
import {
  TypedDataRevision,
  getChecksumAddress,
  hash,
  typedData,
} from "starknet";

import { DEFAULT_SESSION_DURATION } from "@/constants";
import type { Policy, ApprovalPolicy } from "@cartridge/controller-wasm";
import makeBlockie from "ethereum-blockies-base64";

// Extended method type to support both Method and Approval from presets
type ExtendedMethod = Method | Approval;

export type ContractType = "ERC20" | "ERC721" | "VRF";

export type ERC20Metadata = {
  name: string;
  logoUrl?: string;
  symbol: string;
  decimals: number;
};

export type ParsedSessionPolicies = {
  verified: boolean;
  contracts?: SessionContracts;
  messages?: SessionMessages;
};

export function hasApprovalPolicies(
  policies?: ParsedSessionPolicies | null,
): boolean {
  if (!policies?.contracts) {
    return false;
  }

  return Object.values(policies.contracts).some(({ methods }) =>
    methods.some((method) => {
      const entry =
        ("entrypoint" in method && method.entrypoint) ||
        // Support legacy tests/data that may only set name
        ("name" in method ? method.name : undefined);
      return typeof entry === "string" && entry.toLowerCase() === "approve";
    }),
  );
}

export type SessionContracts = Record<
  string,
  Omit<ContractPolicy, "methods"> & {
    meta?: Partial<ERC20Metadata> & {
      type: ContractType;
      icon?: React.ReactNode | string;
    };
    methods: (ExtendedMethod & {
      authorized?: boolean;
      id?: string;
      amount?: string | number;
    })[];
  }
>;

export type SessionMessages = (SignMessagePolicy & {
  authorized?: boolean;
  id?: string;
})[];

const VRF_ADDRESS = getChecksumAddress(
  "0x051Fea4450Da9D6aeE758BDEbA88B2f665bCbf549D2C61421AA724E9AC0Ced8F",
);

export function parseSessionPolicies({
  policies,
  verified = false,
}: {
  policies: SessionPolicies;
  verified: boolean;
}): ParsedSessionPolicies {
  const summary: ParsedSessionPolicies = {
    verified,
    ...policies,
  };

  // First populate the Map with metadata
  Object.entries(policies.contracts ?? []).forEach(([address]) => {
    if (getChecksumAddress(address) === VRF_ADDRESS) {
      const vrf = summary.contracts![address];
      summary.contracts![address] = {
        meta: {
          type: "VRF",
          name: "Cartridge VRF",
          icon: React.createElement(CartridgeIcon, {
            color: "#FBCB4A",
            size: "sm",
          }),
        },
        methods: vrf.methods.map((method) => {
          if (method.entrypoint === "request_random") {
            return {
              ...method,
              name: "Request Random",
              description: "Request a verifiable random number from Cartridge",
            };
          }
          return method;
        }),
      };
      return;
    }

    const meta = erc20Metadata.find(
      (m) =>
        getChecksumAddress(m.l2_token_address) === getChecksumAddress(address),
    );

    if (meta) {
      summary.contracts![address].meta = {
        name: meta.name,
        symbol: meta.symbol,
        decimals: meta.decimals,
        type: "ERC20",
        icon: meta.logo_url || makeBlockie(getChecksumAddress(address)),
      };
    }
  });

  // Then sort entries with tokens first
  const sortedEntries = Object.entries(summary.contracts ?? {}).sort(
    ([addr1], [addr2]) => {
      const isToken1 = summary.contracts?.[addr1]?.meta?.type == "ERC20";
      const isToken2 = summary.contracts?.[addr2]?.meta?.type == "ERC20";

      if (isToken1 && !isToken2) return -1;
      if (!isToken1 && isToken2) return 1;
      return 0;
    },
  );

  // Recreate contracts object with sorted entries
  summary.contracts = Object.fromEntries(sortedEntries);

  return summary;
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
      .flatMap(([target, { methods }]) => {
        const methodsArr = Array.isArray(methods) ? methods : [methods];
        return methodsArr
          .slice()
          .sort((a, b) => a.entrypoint.localeCompare(b.entrypoint))
          .map((m): Policy => {
            // Check if this is an approve entrypoint
            if (m.entrypoint === "approve") {
              // Only create ApprovalPolicy if both spender and amount are defined
              if ("spender" in m && "amount" in m && m.spender && m.amount) {
                const approvalPolicy: ApprovalPolicy = {
                  target,
                  spender: m.spender,
                  amount: String(m.amount), // Convert to string as ApprovalPolicy expects string
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
              authorized: !!m.authorized,
            };
          });
      }),
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
          authorized: !!p.authorized,
        };
      })
      .sort((a, b) =>
        a.scope_hash.toString().localeCompare(b.scope_hash.toString()),
      ),
  ];
}

interface ICreateSessionContext {
  policies: ParsedSessionPolicies;
  duration: bigint;
  isEditable: boolean;
  requiredPolicies: Array<ContractType>;
  chainSpecificMessages:
    | true
    | (TypedDataPolicy & {
        name?: string;
        description?: string;
      } & {
        authorized?: boolean;
        id?: string;
      })[];
  onToggleMethod: (address: string, id: string, authorized: boolean) => void;
  onToggleMessage: (id: string, authorized: boolean) => void;
  onDurationChange: (duration: bigint) => void;
  onToggleEditable: () => void;
}

export const CreateSessionContext = createContext<ICreateSessionContext>({
  policies: {} as ParsedSessionPolicies,
  duration: DEFAULT_SESSION_DURATION,
  isEditable: false,
  requiredPolicies: [],
  chainSpecificMessages: [],
  onToggleMethod: () => {},
  onToggleMessage: () => {},
  onDurationChange: () => {},
  onToggleEditable: () => {},
});

export const useCreateSession = () => useContext(CreateSessionContext);
