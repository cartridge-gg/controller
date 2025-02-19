import { CreditQuery, useCreditQuery } from "../api/cartridge";

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

  const credits = data?.account?.credits;
  const value = credits ? BigInt(credits) : 0n;

  // Do division in bigint space
  const decimals = 18n;
  const divisor = 10n ** decimals;
  const wholePart = value / divisor;
  const fractionalPart = ((value * 100n) / divisor) % 100n;

  // Only convert to string at the very end for display
  const formatted = `$${wholePart}.${fractionalPart.toString().padStart(2, "0")}`;

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
