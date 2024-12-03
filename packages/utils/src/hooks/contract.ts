import { useMemo } from "react";
import {
  getChecksumAddress,
  Provider,
  StarknetDomain,
  StarknetType,
} from "starknet";
import useSWR from "swr";
import { useEkuboMetadata } from "./balance";
import { ERC20Metadata } from "../erc20";
import { stringFromByteArray } from "../contract";

type PreSessionSummary = Pick<SessionSummary, "default" | "messages">;

export type SessionSummary = {
  default: Record<string, CallPolicy[]>;
  dojo: Record<string, { policies: CallPolicy[]; meta: { dojoName: string } }>;
  ERC20: Record<
    string,
    { policies: CallPolicy[]; meta?: Omit<ERC20Metadata, "instance"> }
  >;
  ERC721: Record<string, CallPolicy[]>;
  messages: TypedDataPolicy[];
};

type ContractType = keyof SessionSummary;

export function useSessionSummary({
  policies,
  provider,
}: {
  policies: Policy[];
  provider: Provider;
}) {
  const preSummary = useMemo(
    () =>
      policies.reduce<PreSessionSummary>(
        (prev, p) =>
          isCallPolicy(p)
            ? {
                ...prev,
                default: {
                  ...prev.default,
                  [p.target]: prev.default[p.target]
                    ? [...prev.default[p.target], p]
                    : [p],
                },
              }
            : { ...prev, messages: [...prev.messages, p] },
        { default: {}, messages: [] },
      ),
    [policies],
  );

  const { data: ekuboMeta } = useEkuboMetadata();

  const summary = useSWR(ekuboMeta ? `tx-summary` : null, async () => {
    const res: SessionSummary = {
      default: {},
      dojo: {},
      ERC20: {},
      ERC721: {},
      messages: preSummary.messages,
    };

    const promises = Object.entries(preSummary.default).map(
      async ([contractAddress, policies]) => {
        const contractType = await checkContractType(provider, contractAddress);
        switch (contractType) {
          case "ERC20":
            res.ERC20[contractAddress] = {
              meta: ekuboMeta.find(
                (m) =>
                  getChecksumAddress(m.address) ===
                  getChecksumAddress(contractAddress),
              ),
              policies,
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
                policies,
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

function isCallPolicy(policy: Policy): policy is CallPolicy {
  return !!(policy as CallPolicy).target;
}

// Dup of @cartridge/controller/types
type Policy = CallPolicy | TypedDataPolicy;

type CallPolicy = {
  target: string;
  method: string;
  description?: string;
};

type TypedDataPolicy = {
  types: Record<string, StarknetType[]>;
  primaryType: string;
  domain: StarknetDomain;
};
