import { constants } from "starknet";

export function getChainName(chainId: string) {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "Mainnet";
    case constants.StarknetChainId.SN_SEPOLIA:
      return "Sepolia";
    default:
      return "Slot";
  }
}
