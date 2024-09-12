import { useInterval } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { uint256 } from "starknet";
import { useConnection } from "hooks/connection";
import { ETH_CONTRACT_ADDRESS } from "utils/token";

export function useBalance({ address }: { address: string }) {
  const { controller } = useConnection();
  const [isFetching, setIsFetching] = useState(true);
  const [balance, setBalance] = useState(0n);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    setIsFetching(true);

    const balance = await controller.account.callContract({
      contractAddress: ETH_CONTRACT_ADDRESS,
      entrypoint: "balanceOf",
      calldata: [address],
    });

    setBalance(
      uint256.uint256ToBN({
        low: balance[0],
        high: balance[1],
      }),
    );
    setIsLoading(false);
    setIsFetching(false);
  }, [controller, address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useInterval(fetchBalance, 3000);
  return { balance, isFetching, isLoading };
}
