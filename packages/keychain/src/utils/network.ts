import { constants } from "starknet";
import { Hex, hexToString } from "viem";

export function getChainName(chainId: string) {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "Mainnet";
    case constants.StarknetChainId.SN_SEPOLIA:
      return "Sepolia";
    default:
      return hexToString(chainId as Hex).replace("SN_", "") || "Slot";
  }
}
