import { getChecksumAddress } from "starknet";
import {
  ContractPolicy,
  erc20Metadata,
  SessionPolicies,
} from "@cartridge/presets";

export type ERC20Metadata = {
  name: string;
  logoUrl?: string;
  symbol: string;
  decimals: number;
};

export type ParsedSessionPolicies = SessionPolicies & {
  verified: boolean;
  contracts?: Record<
    string,
    ContractPolicy & {
      meta?: ERC20Metadata;
    }
  >;
};

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

  Object.entries(policies.contracts ?? []).forEach(([address]) => {
    const meta = erc20Metadata.find(
      (m) =>
        getChecksumAddress(m.l2_token_address) === getChecksumAddress(address),
    );

    if (meta) {
      summary.contracts![address].meta = {
        name: meta.name,
        symbol: meta.symbol,
        decimals: meta.decimals,
        logoUrl: meta.logo_url,
      };
    }
  });

  return summary;
}
