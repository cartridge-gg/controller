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
  contractAddress: string;
  provider?: Provider;
  interval?: number;
}) {
  const { data: chainId } = useSWR(provider ? "chainId" : null, () =>
    provider?.getChainId(),
  );
  const { data: meta } = useSWR(provider ? "chainId" : null, async () => {
    if (!provider) return;
    const erc20 = await new ERC20({
      address: contractAddress,
      provider,
      // TODO logoUrl
    }).init();
    return erc20.metadata();
  });

  const {
    data: value,
    isValidating,
    isLoading,
    error,
  } = useSWR(
    chainId && meta ? `${chainId}:${contractAddress}:${address}` : null,
    () => (meta ? meta.instance.balanceOf(address) : 0n),
    { refreshInterval: interval, fallbackData: 0n },
  );

  const formatted = useMemo(() => formatBalance(value), [value]);

  return {
    balance: { value, formatted },
    meta,
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
