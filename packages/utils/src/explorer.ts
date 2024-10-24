import { constants } from "starknet";

const BASE_URL = {
  [constants.StarknetChainId.SN_MAIN]: "https://starkscan.co",
  [constants.StarknetChainId.SN_SEPOLIA]: "https://sepolia.starkscan.co",
};

export const StarkscanUrl = (chainId: constants.StarknetChainId) => ({
  transaction: (hash: string, fragment?: string) =>
    `${BASE_URL[chainId]}/tx/${hash}${fragment ? `#${fragment}` : ""}`,
  contract: (address: string, fragment?: string) =>
    `${BASE_URL[chainId]}/contract/${address}${fragment ? `#${fragment}` : ""}`,
  message: (address: string, fragment?: string) =>
    `${BASE_URL[chainId]}/message/${address}${fragment ? `#${fragment}` : ""}`,
  block: (id: string, fragment?: string) =>
    `${BASE_URL[chainId]}/block/${id}${fragment ? `#${fragment}` : ""}`,
  event: (address: string, fragment?: string) =>
    `${BASE_URL[chainId]}/event/${address}${fragment ? `#${fragment}` : ""}`,
  class: (address: string, fragment?: string) =>
    `${BASE_URL[chainId]}/class/${address}${fragment ? `#${fragment}` : ""}`,
});
