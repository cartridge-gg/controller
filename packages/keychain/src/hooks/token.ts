import { useInterval } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { uint256 } from "starknet";
import { useConnection } from "hooks/connection";
import { ETH_CONTRACT_ADDRESS } from "utils/token";
import { AccountInfoQuery, useAccountInfoQuery } from "generated/graphql";

const REFRESH_INTERVAL = 3000;

export function useBalance() {
  const { controller } = useConnection();
  const [isFetching, setIsFetching] = useState(true);
  const [ethBalance, setEthBalance] = useState<bigint>(0n);
  const [creditsBalance, setCreditsBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const { refetch: refetchCredits } = useAccountInfoQuery(
    { address: controller.address },
    {
      enabled: false,
      onSuccess: async (data: AccountInfoQuery) => {
        try {
          const credits = data.accounts?.edges?.[0]?.node?.credits;
          setCreditsBalance(credits ?? 0);
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
      const balance = await controller.account.callContract({
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
  }, [controller]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  useInterval(fetchBalances, REFRESH_INTERVAL);
  return { ethBalance, creditsBalance, isFetching, isLoading, error };
}
