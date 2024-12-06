import { getChecksumAddress, Provider } from "starknet";
import {
  ContractPolicies,
  ContractPolicy,
  erc20Metadata,
  SessionPolicies,
  SignMessagePolicy,
} from "@cartridge/presets";
import { ERC20Metadata } from "@cartridge/utils";

export type SessionSummary = {
  default: ContractPolicies;
  dojo: Record<string, ContractPolicy & { meta: { dojoName: string } }>;
  ERC20: Record<
    string,
    ContractPolicy & { meta?: Omit<ERC20Metadata, "instance"> }
  >;
  ERC721: ContractPolicies;
  messages: SignMessagePolicy[] | undefined;
};

export function useSessionSummary({
  policies,
}: {
  policies: SessionPolicies;
  provider?: Provider;
}): SessionSummary {
  const summary: SessionSummary = {
    default: {},
    dojo: {},
    ERC20: {},
    ERC721: {},
    messages: policies.messages,
  };

  Object.entries(policies.contracts ?? []).forEach(
    ([contractAddress, policies]) => {
      const meta = erc20Metadata.find(
        (m) =>
          getChecksumAddress(m.l2_token_address) ===
          getChecksumAddress(contractAddress),
      );

      if (meta) {
        summary.ERC20[contractAddress] = {
          meta: {
            address: contractAddress,
            name: meta.name,
            symbol: meta.symbol,
            decimals: meta.decimals,
          },
          ...policies,
        };
      } else {
        summary.default[contractAddress] = policies;
      }
    },
  );

  return summary;
}
