import { useInterval } from "usehooks-ts";
import { useMemo, useState } from "react";
import { getChecksumAddress, Provider } from "starknet";
import useSWR from "swr";
import { ERC20, ERC20Metadata } from "../erc20";
import { formatBalance } from "../currency";
import { AccountInfoQuery, useAccountInfoQuery } from "../api/cartridge";

export function useERC20Balance({
  address,
  contractAddress,
  provider,
  interval,
}: {
  address: string;
  contractAddress: string | string[];
  provider: Provider;
  interval: number | undefined;
}) {
  const { data: chainId } = useSWR(provider ? "chainId" : null, () =>
    provider?.getChainId(),
  );
  const { data: ekuboMeta } = useSWR("ekuboMetadata", ERC20.fetchAllMetadata, {
    fallbackData: [],
  });
  const { data: meta } = useSWR(
    chainId && provider
      ? `erc20:metadata:${chainId}:${address}:${contractAddress}`
      : null,
    async () => {
      if (!provider || !ekuboMeta.length) return [];

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
    chainId && meta.length
      ? `erc20:balance:${chainId}:${address}:${contractAddress}`
      : null,
    async () => {
      if (!meta.length) return [];

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
                formatted: formatBalance(res.value),
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
  address,
  interval,
}: {
  address: string;
  interval: number | null;
}): UseCreditBalanceReturn {
  const [value, setValue] = useState<bigint>(0n);

  const { refetch, isFetching, isLoading, error } = useAccountInfoQuery<
    AccountInfoQuery,
    Error
  >(
    { address },
    {
      enabled: false,
      onSuccess: async (data: AccountInfoQuery) => {
        setValue(data.accounts?.edges?.[0]?.node?.credits ?? 0);
      },
    },
  );

  const formatted = useMemo(() => formatBalance(value), [value]);

  useInterval(refetch, interval);

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
