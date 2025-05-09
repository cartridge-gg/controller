import { getChecksumAddress, Provider } from "starknet";
import useSWR from "swr";
import { ERC20, ERC20Metadata } from "../erc20";
import { CreditQuery, useCreditQuery } from "../api/cartridge";
import { erc20Metadata } from "@cartridge/presets";

export type Balance = {
  value: bigint;
  formatted: string;
};

export type ERC20Balance = {
  balance: Balance;
  meta: ERC20Metadata;
};

export type UseERC20BalanceResponse = {
  data: ERC20Balance[];
  isFetching: boolean;
  isLoading: boolean;
};

export function useERC20Balance({
  address,
  contractAddress,
  provider,
  interval,
  decimals = 5,
}: {
  address?: string;
  contractAddress: string | string[];
  provider?: Provider;
  interval: number | undefined;
  decimals?: number;
}) {
  const { data: chainId } = useSWR(address && provider ? "chainId" : null, () =>
    provider?.getChainId(),
  );
  const { data: meta } = useSWR(
    chainId && erc20Metadata.length
      ? `erc20:metadata:${chainId}:${address}:${contractAddress}`
      : null,
    async () => {
      if (!provider || !address) return [];
      const contractList = Array.isArray(contractAddress)
        ? contractAddress
        : [contractAddress];
      const erc20List = await Promise.allSettled(
        contractList.map((address) =>
          new ERC20({
            address,
            provider,
            logoUrl: erc20Metadata.find(
              (m) =>
                getChecksumAddress(m.l2_token_address) ===
                getChecksumAddress(address),
            )?.logo_url,
          }).init(),
        ),
      );

      return erc20List
        .filter((res) => res.status === "fulfilled")
        .map((erc20) => erc20.value.metadata());
    },
    { fallbackData: [] },
  );

  const { data, isValidating, isLoading, error } = useSWR(
    meta.length && address
      ? `erc20:balance:${chainId}:${address}:${contractAddress}`
      : null,
    async () => {
      if (!address) return [];
      const values = await Promise.allSettled(
        meta.map((m) => m.instance.balanceOf(address)),
      );

      return meta.reduce<{ balance: Balance; meta: ERC20Metadata }[]>(
        (prev, meta, i) => {
          const res = values[i];
          if (res.status === "rejected") return prev;

          const value = res.value;
          const factor = 10 ** meta.decimals;
          const adjusted = parseFloat(value.toString()) / factor;
          // Round and remove insignificant trailing zeros
          const rounded = parseFloat(adjusted.toFixed(decimals));
          const formatted =
            adjusted === rounded ? adjusted.toString() : `~${rounded}`;

          return [
            ...prev,
            {
              balance: {
                value,
                formatted,
              },
              meta,
            },
          ];
        },
        [],
      );
    },
    { refreshInterval: interval, fallbackData: [] },
  );

  return {
    data,
    isFetching: isValidating,
    isLoading,
    error,
  };
}

export type FetchState = {
  isFetching: boolean;
  isLoading: boolean;
  error: Error | null;
};

export type UseCreditBalanceReturn = {
  balance: Balance;
} & FetchState;

export function useCreditBalance({
  username,
  interval,
}: {
  username?: string;
  interval: number | undefined;
}): UseCreditBalanceReturn {
  const { data, isFetching, isLoading, error } = useCreditQuery<
    CreditQuery,
    Error
  >(
    { username: username! },
    {
      refetchInterval: interval,
      enabled: !!username,
    },
  );

  let balance: Balance = {
    value: 0n,
    formatted: "0",
  };

  if (data?.account?.credits) {
    const value = BigInt(data?.account?.credits?.amount!);
    const factor = 10 ** data?.account?.credits?.decimals!;
    const adjusted = parseFloat(value.toString()) / factor;
    // Round and remove insignificant trailing zeros
    const rounded = parseFloat(adjusted.toFixed(2));
    const formatted =
      adjusted === rounded ? adjusted.toString() : `~${rounded}`;
    balance = {
      value,
      formatted,
    };
  }

  return {
    balance,
    isFetching,
    isLoading,
    error,
  };
}
