import { Prefund } from "@cartridge/controller";
import { EthereumIcon } from "@cartridge/ui";
import { formatAddress } from "@cartridge/utils";
import { Image } from "@chakra-ui/react";
import { formatEther } from "viem";
import { uint256 } from "starknet";
import Controller from "./controller";

export const ETH_CONTRACT_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export const ETH_MIN_PREFUND = "100000000000000";

export function isEther(t: TokenInfo | Prefund) {
  return (
    formatAddress(t.address, { padding: true }) ===
    formatAddress(ETH_CONTRACT_ADDRESS, { padding: true })
  );
}

export function isFunded(t: TokenInfo) {
  return t.min <= (t.balance ?? 0n);
}

export function getBalanceStr(t: TokenInfo) {
  if (typeof t.balance === "undefined") return "...";
  return isEther(t) ? formatEther(t.balance) : t.balance.toString();
}

export function getMinStr(t: TokenInfo) {
  return isEther(t) ? formatEther(t.min) : t.min.toString();
}

export function mergeDefaultETHPrefund(prefunds: Prefund[]) {
  return prefunds.find(isEther)
    ? prefunds
    : [{ address: ETH_CONTRACT_ADDRESS, min: ETH_MIN_PREFUND }, ...prefunds];
}

export async function fetchTokenInfo(prefunds: Prefund[]) {
  const res = await fetch("https://mainnet-api.ekubo.org/tokens");
  const data: TokenInfoRaw[] = await res.json();
  const tokens = prefunds.map((t) => {
    if (isEther(t)) {
      return {
        address: ETH_CONTRACT_ADDRESS,
        min: BigInt(t.min),
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        logo: <EthereumIcon fontSize={20} color="currentColor" />,
      };
    }

    const info = data.find(
      ({ l2_token_address }) =>
        formatAddress(l2_token_address, { padding: true }) ===
        formatAddress(t.address, { padding: true }),
    );

    if (!info) {
      throw new Error(`Cannot find token info for: ${t.address}`);
    }

    return {
      address: t.address,
      min: BigInt(t.min),
      name: info.name,
      symbol: info.symbol,
      decimals: info.decimals,
      logo: (
        <Image
          src={info.logo_url}
          alt={`${info.name} ERC-20 Token Logo`}
          h={5}
        />
      ),
    };
  });
  return tokens;
}

export async function updateBalance(
  tokens: TokenInfo[],
  controller: Controller,
) {
  const res = await Promise.allSettled(
    tokens.map(async (t) => {
      try {
        const balance = await controller.callContract({
          contractAddress: t.address,
          entrypoint: "balanceOf",
          calldata: [controller.address],
        });

        return {
          ...t,
          balance: uint256.uint256ToBN({
            low: balance[0],
            high: balance[1],
          }),
          error: undefined,
        };
      } catch {
        return {
          ...t,
          error: new Error("Failed to update balance"),
        };
      }
    }),
  );

  return res
    .filter((res) => res.status === "fulfilled")
    .map((res) => (res as PromiseFulfilledResult<TokenInfo>).value);
}

export type TokenInfoRaw = {
  name: string;
  symbol: string;
  decimals: number;
  l2_token_address: string;
  sort_order: string;
  total_supply: number;
  logo_url: string;
};

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logo: React.ReactNode;
  min: bigint;
  balance?: bigint;
  error?: Error;
};
