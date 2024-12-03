import { getChecksumAddress, Provider, TypedData } from "starknet";
import useSWR from "swr";
import { useEkuboMetadata } from "./balance";
import { ERC20Metadata } from "../erc20";
import { stringFromByteArray } from "../contract";

export type SessionSummary = {
  default: ContractPolicies;
  dojo: Record<string, ContractPolicy & { meta: { dojoName: string } }>;
  ERC20: Record<
    string,
    ContractPolicy & { meta?: Omit<ERC20Metadata, "instance"> }
  >;
  ERC721: ContractPolicies;
  messages: SignMessagePolicy[];
};

type ContractType = keyof SessionSummary;

export function useSessionSummary({
  policies,
  provider,
}: {
  policies: SessionPolicies;
  provider: Provider;
}) {
  const { data: ekuboMeta } = useEkuboMetadata();

  const summary = useSWR(ekuboMeta ? `tx-summary` : null, async () => {
    const res: SessionSummary = {
      default: {},
      dojo: {},
      ERC20: {},
      ERC721: {},
      messages: policies.messages ?? [],
    };

    const promises = Object.entries(policies.contracts ?? {}).map(
      async ([contractAddress, policies]) => {
        const contractType = await checkContractType(provider, contractAddress);
        switch (contractType) {
          case "ERC20":
            res.ERC20[contractAddress] = {
              methods: policies.methods,
              meta: ekuboMeta.find(
                (m) =>
                  getChecksumAddress(m.address) ===
                  getChecksumAddress(contractAddress),
              ),
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
                methods: policies.methods,
                meta: { dojoName: stringFromByteArray(dojoNameRes) },
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
  });

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

// Dup of @cartridge/controller/types
export type SessionPolicies = {
  /** The key must be the contract address */
  contracts?: ContractPolicies;
  messages?: SignMessagePolicy[];
};

export type ContractPolicies = Record<string, ContractPolicy>;

/** Contract level policy */
export type ContractPolicy = {
  /** It must contain one method */
  methods: Method | Method[];
  description?: string;
};

export type Method = {
  name: string;
  description?: string;
};

export type SignMessagePolicy = Omit<TypedData, "message">;
