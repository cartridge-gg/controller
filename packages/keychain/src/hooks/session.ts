import {
  type ContractPolicy,
  type Method,
  type SessionPolicies,
  type SignMessagePolicy,
  type TypedDataPolicy,
  erc20Metadata,
} from "@cartridge/presets";
import { CartridgeIcon, CoinsIcon } from "@cartridge/ui";
import React, { createContext, useContext } from "react";
import {
  TypedDataRevision,
  getChecksumAddress,
  hash,
  typedData,
} from "starknet";

import { DEFAULT_SESSION_DURATION } from "@/constants";
import type { Policy, ApprovalPolicy } from "@cartridge/controller-wasm";

// Extended method type to support approve-specific fields
type ExtendedMethod = Method & {
  spender?: string;
  amount?: string;
};

// Maximum u256 value for approve amount (2^256 - 1)
// We use the low limb of max u128 as a reasonable max for token amounts
const MAX_APPROVE_AMOUNT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

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

export type SessionContracts = Record<
  string,
  Omit<ContractPolicy, "methods"> & {
    meta?: Partial<ERC20Metadata> & {
      type: ContractType;
      icon?: React.ReactNode | string;
    };
    methods: (ExtendedMethod & { authorized?: boolean; id?: string })[];
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
        icon:
          meta.logo_url || React.createElement(CoinsIcon, { variant: "line" }),
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

export function toWasmPolicies(policies: ParsedSessionPolicies): Policy[] {
  return [
    ...Object.entries(policies.contracts ?? {}).flatMap(
      ([target, { methods }]) => {
        const methodsArr = Array.isArray(methods) ? methods : [methods];
        return methodsArr.map((m): Policy => {
          // Check if this is an approve entrypoint
          if (m.entrypoint === "approve") {
            // Create an ApprovalPolicy for approve calls
            // Spender defaults to the target contract if not specified
            // Amount defaults to MAX_APPROVE_AMOUNT if not specified
            const approvalPolicy: ApprovalPolicy = {
              target,
              spender: m.spender || target,
              amount: m.amount || MAX_APPROVE_AMOUNT,
            };
            return approvalPolicy;
          }

          // For non-approve methods, create a regular CallPolicy
          return {
            target,
            method: hash.getSelectorFromName(m.entrypoint),
            authorized: !!m.authorized,
          };
        });
      },
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
        authorized: !!p.authorized,
      };
    }),
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
