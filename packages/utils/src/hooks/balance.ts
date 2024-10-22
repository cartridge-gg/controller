import { useInterval } from "usehooks-ts";
import { useMemo, useState } from "react";
import { Provider, uint256 } from "starknet";
import useSWR from "swr";
import { formatBalance } from "@cartridge/utils";
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
  const [value, setValue] = useState<bigint>(0n);
  const { isValidating, isLoading, error } = useSWR(
    `balance:${contractAddress}:${address}`,
    async () => {
      if (!provider) return;

      const balance = await provider.callContract({
        contractAddress,
        entrypoint: "balanceOf",
        calldata: [address],
      });

      setValue(
        uint256.uint256ToBN({
          low: balance[0],
          high: balance[1],
        }),
      );
    },
    { refreshInterval: interval },
  );

  const formatted = useMemo(() => formatBalance(value), [value]);

  return {
    balance: { value, formatted },
    isFetching: isValidating,
    isLoading,
    error,
  };
}

export function useCreditBalance({
  address,
  interval,
}: {
  address: string;
  interval: number | null;
}) {
  const [value, setValue] = useState<bigint>(0n);

  const { refetch, isFetching, isLoading, error } = useAccountInfoQuery(
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
