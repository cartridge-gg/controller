import { useInterval } from "usehooks-ts";
import { useMemo, useState } from "react";
import { Provider } from "starknet";
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
  contractAddress: string;
  provider?: Provider;
  interval?: number;
}) {
  const [meta, setMeta] = useState<ERC20Metadata>();

  const [value, setValue] = useState<bigint>(0n);
  const { isValidating, isLoading, error } = useSWR(
    `balance:${contractAddress}:${address}`,
    async () => {
      if (!provider) return;

      let m = meta;
      if (!m) {
        m = (
          await new ERC20({
            address,
            provider,
            // TODO logoUrl
          }).init()
        ).metadata();
        setMeta(m);
      }

      const balance = await m.instance.balanceOf(address);

      setValue(BigInt(balance));
    },
    { refreshInterval: interval },
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
