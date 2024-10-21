import { useInterval } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { uint256 } from "starknet";
import { useConnection } from "hooks/connection";
import { ETH_CONTRACT_ADDRESS } from "utils/token";
import { AccountInfoQuery, useAccountInfoQuery } from "generated/graphql";
import { formatBalance } from "@cartridge/utils";

const REFRESH_INTERVAL = 3000;

export function useBalance() {
  const { controller } = useConnection();
  const [isFetching, setIsFetching] = useState(true);
  const [ethBalance, setEthBalance] = useState<bigint>(0n);
  const [creditsBalance, setCreditsBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const { refetch: refetchCredits } = useAccountInfoQuery(
    { address: controller.address },
    {
      enabled: false,
      onSuccess: async (data: AccountInfoQuery) => {
        try {
          setCreditsBalance(data.accounts?.edges?.[0]?.node?.credits ?? 0);
        } catch (e) {
          setError(e);
        }
      },
    },
  );

  const fetchBalances = useCallback(async () => {
    if (!controller) {
      return;
    }
    setIsFetching(true);

    try {
      const balance = await controller.callContract({
        contractAddress: ETH_CONTRACT_ADDRESS,
        entrypoint: "balanceOf",
        calldata: [controller.address],
      });

      setEthBalance(
        uint256.uint256ToBN({
          low: balance[0],
          high: balance[1],
        }),
      );

      await refetchCredits();
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [controller, refetchCredits]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  useInterval(fetchBalances, REFRESH_INTERVAL);

  const ethFormattedBalance = useMemo(
    () => formatBalance(ethBalance),
    [ethBalance],
  );

  const creditsFormattedBalance = useMemo(
    () => formatBalance(ethBalance),
    [ethBalance],
  );

  return {
    ethBalance: { value: ethBalance, formatted: ethFormattedBalance },
    creditsBalance: {
      value: creditsBalance,
      formatted: creditsFormattedBalance,
    },
    isFetching,
    isLoading,
    error,
  };
}
