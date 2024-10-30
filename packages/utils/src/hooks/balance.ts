import { useInterval } from "usehooks-ts";
import { useMemo, useState } from "react";
import { Provider } from "starknet";
import useSWR from "swr";
import { ERC20 } from "../erc20";
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
  provider?: Provider;
  interval: number | undefined;
}) {
  const { data: chainId } = useSWR(provider ? "chainId" : null, () =>
    provider?.getChainId(),
  );
  const { data: meta } = useSWR(
    provider ? `erc20:metadata:${chainId}:${address}:${contractAddress}` : null,
    async () => {
      if (!provider) return [];

      const contractList = Array.isArray(contractAddress)
        ? contractAddress
        : [contractAddress];
      const erc20List = contractList.map(
        (address) =>
          new ERC20({
            address,
            provider,
            // TODO logoUrl
          }),
      );
      await Promise.all(erc20List.map((erc20) => erc20.init()));

      return erc20List.map((erc20) => erc20.metadata());
    },
    { fallbackData: [] },
  );

  const { data, isValidating, isLoading, error } = useSWR(
    chainId && meta.length
      ? `erc20:balance:${chainId}:${address}:${contractAddress}`
      : null,
    async () => {
      if (!meta.length) return [];

      const values = await Promise.all(
        meta.map((m) => m.instance.balanceOf(address)),
      );

      return values.map((value, i) => ({
        balance: {
          value,
          formatted: formatBalance(value),
        },
        meta: meta[i],
      }));
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
