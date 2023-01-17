import { constants } from "starknet";

export const GATEWAY_MAINNET = process.env.NEXT_PUBLIC_GATEWAY_MAINNET;
export const GATEWAY_GOERLI = process.env.NEXT_PUBLIC_GATEWAY_GOERLI;
export const GATEWAY_GOERLI2 = process.env.NEXT_PUBLIC_GATEWAY_GOERLI2;

export const ETH_RPC_MAINNET = process.env.NEXT_PUBLIC_ETH_RPC_MAINNET;
export const ETH_RPC_GOERLI = process.env.NEXT_PUBLIC_ETH_RPC_GOERLI;

export const CONTRACT_ETH =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const CONTRACT_POINTS =
  "0x00c62540e9a10c47a4b7d8abaff468192c66f2d1e979f6bade6e44bf73995982";
export const CONTRACT_AVATAR =
  "0x002e02ab50ad223a4de99d7591cbbb565705893ad5b8522a9bde011d20e99926";

export const CONTRACT_CONTROLLER_CLASS =
  "0x077007d85dd2466b2b29e626bac27ee017d7586f62511f4585dd596f33337ccf";
export const CONTRACT_ARGENT_CLASS =
  "0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";
export const CONTRACT_ACHIEVEMENTS =
  "0x00f6883b55c1ed7814e5df15fa8fa4bdbad4d4778662a62413c1e58fce10f4f0";
export const CONTRACT_UPGRADE_IMPLEMENTATION =
  "0x07e28fb0161d10d1cf7fe1f13e7ca57bce062731a3bd04494dfd2d0412699727";

// L1 Contract
export const CONTRACT_NFF_BRIDGE = "0xbd701502203B21307BEa2d4078E69dd0c9C0703C";

export const NamedChainId = {
  [constants.StarknetChainId.MAINNET]: "SN_MAIN",
  [constants.StarknetChainId.TESTNET]: "SN_GOERLI",
  [constants.StarknetChainId.TESTNET2]: "SN_GOERLI2",
};
