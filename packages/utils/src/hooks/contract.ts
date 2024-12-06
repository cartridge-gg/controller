import { getChecksumAddress, Provider } from "starknet";
import useSWR from "swr";
import { useEkuboMetadata } from "./balance";
import { ERC20Metadata } from "../erc20";
import { stringFromByteArray } from "../contract";
import {
  ContractPolicies,
  ContractPolicy,
  SessionPolicies,
  SignMessagePolicy,
} from "@cartridge/presets";

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

type ContractType = keyof SessionSummary;

export function useSessionSummary({
  policies,
  provider,
}: {
  policies: SessionPolicies;
  provider?: Provider;
}) {
  const ekuboMeta = useEkuboMetadata();

  const res: SessionSummary = {
    default: {},
    dojo: {},
    ERC20: {},
    ERC721: {},
    messages: policies.messages,
  };
  const summary = useSWR(
    ekuboMeta && provider ? `tx-summary` : null,
    async () => {
      if (!provider) return res;

      const promises = Object.entries(policies.contracts ?? []).map(
        async ([contractAddress, policies]) => {
          const contractType = await checkContractType(
            provider,
            contractAddress,
          );
          switch (contractType) {
            case "ERC20":
              const meta = ekuboMeta.find(
                (m) =>
                  getChecksumAddress(m.l2_token_address) ===
                  getChecksumAddress(contractAddress),
              );

              res.ERC20[contractAddress] = {
                meta: meta && {
                  address: contractAddress,
                  name: meta.name,
                  symbol: meta.symbol,
                  decimals: meta.decimals,
                },
                ...policies,
              };
              return;
            case "ERC721":
              res.ERC721[contractAddress] = policies;
              return;
            case "default":
            default: {
              try {
                const dojoNameRes = await provider.callContract({
                  contractAddress,
                  entrypoint: "dojo_name",
                });

                res.dojo[contractAddress] = {
                  meta: { dojoName: stringFromByteArray(dojoNameRes) },
                  ...policies,
                };
              } catch {
                res.default[contractAddress] = policies;
              }
              return;
            }
          }
        },
      );
      await Promise.all(promises);

      return res;
    },
    {
      fallbackData: res,
    },
  );

  return summary;
}

// TODO: What the id?
const IERC20_ID = "";
const IERC721_ID =
  "0x33eb2f84c309543403fd69f0d0f363781ef06ef6faeb0131ff16ea3175bd943";

async function checkContractType(
  provider: Provider,
  contractAddress: string,
): Promise<ContractType> {
  try {
    // SNIP-5: check with via `support_interface` method
    const [erc20Res] = await provider.callContract({
      contractAddress,
      entrypoint: "supports_interface",
      calldata: [IERC20_ID], // ERC20 interface ID
    });
    if (!!erc20Res) {
      return "ERC20";
    }

    const [erc721Res] = await provider.callContract({
      contractAddress,
      entrypoint: "supports_interface",
      calldata: [IERC721_ID], // ERC721 interface ID
    });
    if (!!erc721Res) {
      return "ERC721";
    }

    return "default";
  } catch {
    try {
      await provider.callContract({
        contractAddress,
        entrypoint: "balanceOf",
        calldata: ["0x0"], // ERC721 interface ID
      });

      try {
        await provider.callContract({
          contractAddress,
          entrypoint: "decimals",
        });

        return "ERC20";
      } catch {
        await provider.callContract({
          contractAddress,
          entrypoint: "tokenId",
          calldata: ["0x0"],
        });

        return "ERC721";
      }
    } catch {
      return "default";
    }
  }
}
