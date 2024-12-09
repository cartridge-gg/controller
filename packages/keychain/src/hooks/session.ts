import { getChecksumAddress } from "starknet";
import {
  ContractPolicy,
  erc20Metadata,
  SessionPolicies,
} from "@cartridge/presets";
import { CoinsIcon, CartridgeIcon } from "@cartridge/ui-next";
import React from "react";

export type ContractType = "ERC20" | "ERC721" | "VRF";

export type ERC20Metadata = {
  name: string;
  logoUrl?: string;
  symbol: string;
  decimals: number;
};

export type ParsedSessionPolicies = Omit<SessionPolicies, "contracts"> & {
  verified: boolean;
  contracts?: Record<
    string,
    ContractPolicy & {
      meta?: Partial<ERC20Metadata> & {
        type: ContractType;
        icon?: React.ReactNode | string;
      };
    }
  >;
};

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
