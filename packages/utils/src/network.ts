import { constants } from "starknet";
import { hexToString, Hex } from "viem";

export function getChainName(chainId: string) {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "Mainnet";
    case constants.StarknetChainId.SN_SEPOLIA:
      return "Sepolia";
    default:
      return isSlotChain(chainId) ? "Slot" : "Unknown";
  }
}

export function isSlotChain(chainId: string) {
  return hexToString(chainId as Hex).startsWith("WP_");
}
