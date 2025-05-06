import { constants } from "starknet";
import { hexToString, Hex } from "viem";

export function getChainName(chainId: string) {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "Starknet";
    case constants.StarknetChainId.SN_SEPOLIA:
      return "Sepolia";
    default:
      try {
        return isSlotChain(chainId) ? "Slot" : hexToString(chainId as Hex);
      } catch (error) {
        return "Unknown";
      }
  }
}

export function isPublicChain(chainId: string) {
  return (
    [
      constants.StarknetChainId.SN_MAIN,
      constants.StarknetChainId.SN_SEPOLIA,
    ] as string[]
  ).includes(chainId);
}

export function isSlotChain(chainId: string) {
  return hexToString(chainId as Hex).startsWith("WP_");
}
