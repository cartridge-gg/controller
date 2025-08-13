import { constants, num } from "starknet";
import { ExternalPlatform } from "./types";

export * from "./argent";
export * from "./bridge";
export * from "./metamask";
export * from "./phantom";
export * from "./rabby";
export * from "./types";

export const chainIdToPlatform = (
  chainId: string,
): ExternalPlatform | undefined => {
  switch (num.toHex(chainId)) {
    case "0x1": // ethereum mainnet
    case "0xaa36a7": // ethereum sepolia
      return "ethereum";
    case "0x14a34": // base mainnet
    case "0x2105": // base sepolia
      return "base";
    case "0x66eee": // arbitrum mainnet
    case "0xa4b1": // arbitrum sepolia
      return "arbitrum";
    case "0xa": // op mainnet
    case "0xaa37dc": // op sepolia
      return "optimism";
    case constants.StarknetChainId.SN_MAIN:
    case constants.StarknetChainId.SN_SEPOLIA:
      return "starknet";
  }
};
