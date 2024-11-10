import { useMemo } from "react";
import { getChecksumAddress, Provider } from "starknet";
import useSWR from "swr";
import { ERC20, ERC20Metadata } from "../erc20";
import { formatBalance } from "../currency";
import { CreditQuery, useCreditQuery } from "../api/cartridge";
import { formatEther } from "viem";

export function useERC20Balance({
  address,
  contractAddress,
  provider,
  interval,
  fixed,
}: {
  address: string;
  contractAddress: string | string[];
  provider: Provider;
  interval: number | undefined;
  fixed?: number;
}) {
  const { data: chainId } = useSWR(provider ? "chainId" : null, () =>
    provider?.getChainId(),
  );
  const { data: ekuboMeta } = useSWR("ekuboMetadata", ERC20.fetchAllMetadata, {
    fallbackData: [],
  });
  const { data: meta } = useSWR(
    chainId && ekuboMeta.length
      ? `erc20:metadata:${chainId}:${address}:${contractAddress}`
      : null,
    async () => {
      const contractList = Array.isArray(contractAddress)
        ? contractAddress
        : [contractAddress];
      const erc20List = await Promise.allSettled(
        contractList.map((address) =>
          new ERC20({
            address,
            provider,
            logoUrl: ekuboMeta.find(
              (m) =>
                getChecksumAddress(m.address) === getChecksumAddress(address),
            )?.logoUrl,
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
    meta.length
      ? `erc20:balance:${chainId}:${address}:${contractAddress}`
      : null,
    async () => {
      const values = await Promise.allSettled(
        meta.map((m) => m.instance.balanceOf(address)),
      );

      return meta.reduce<{ balance: Balance; meta: ERC20Metadata }[]>(
        (prev, meta, i) => {
          const res = values[i];
          if (res.status === "rejected") return prev;

          return [
            ...prev,
            {
              balance: {
                value: res.value,
                formatted: formatBalance(
                  formatEther(res.value).toString(),
                  fixed,
                ),
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

export type Balance = {
  value: bigint;
  formatted: string;
};

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
  username: string;
  interval: number | undefined;
}): UseCreditBalanceReturn {
  const { data, isFetching, isLoading, error } = useCreditQuery<
    CreditQuery,
    Error
  >(
    { username },
    {
      refetchInterval: interval,
    },
  );
  const value = data?.account?.credits ?? 0n;
  const formatted = useMemo(
    () => formatBalance(formatEther(value).toString(), 2),
    [value],
  );
  return {
    balance: {
      value,
      formatted,
    },
    isFetching,
    isLoading,
    error,
  };
}
