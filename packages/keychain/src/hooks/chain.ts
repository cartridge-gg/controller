import { useMemo } from "react";
import { constants } from "starknet";

export function useChainName(chainId: constants.StarknetChainId) {
  return useMemo(() => {
    switch (chainId) {
      case constants.StarknetChainId.SN_MAIN:
        return "Mainnet";
      case constants.StarknetChainId.SN_SEPOLIA:
        return "Testnet";
    }
  }, [chainId]);
}
