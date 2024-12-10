import { useAccount } from "./account";
import { useConnection } from "./context";
import { constants, getChecksumAddress } from "starknet";
import { useErc20BalancesQuery } from "@cartridge/utils/api/cartridge";
import { useMemo } from "react";

export function useBalances(accountAddress?: string) {
  const { chainId, project, isVisible } = useConnection();
  const { address } = useAccount();

  const defaultProjects = useMemo(() => {
    switch (chainId) {
      case constants.StarknetChainId.SN_MAIN:
        return ["tokens-mainnet"];
      case constants.StarknetChainId.SN_SEPOLIA:
        return ["tokens-sepolia"];
      default:
        return [];
    }
  }, [chainId]);

  return useErc20BalancesQuery(
    {
      projects: [...defaultProjects, project!],
      accountAddress: accountAddress ?? address,
    },
    {
      enabled: !!project && !!isVisible,
      refetchInterval: isVisible ? 3000 : undefined,
    },
  );
}

export function useBalance({
  tokenAddress,
  accountAddress,
}: {
  accountAddress?: string;
  tokenAddress: string;
}) {
  const { data } = useBalances(accountAddress);
  return useMemo(
    () =>
      data?.balances.edges.find(
        ({ node }) =>
          getChecksumAddress(node.meta.contractAddress) ===
          getChecksumAddress(tokenAddress),
      )?.node,
    [data, tokenAddress],
  );
}
