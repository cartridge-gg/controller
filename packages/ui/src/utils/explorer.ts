import { constants } from "starknet";

const STARKSCAN_URL = {
  [constants.StarknetChainId.SN_MAIN]: "https://voyager.online",
  [constants.StarknetChainId.SN_SEPOLIA]: "https://sepolia.voyager.online",
};

const VOYAGER_URL = {
  [constants.StarknetChainId.SN_MAIN]: "https://voyager.online",
  [constants.StarknetChainId.SN_SEPOLIA]: "https://sepolia.voyager.online",
};

export const StarkscanUrl = (chainId: constants.StarknetChainId) => ({
  transaction: (hash: string, fragment?: string) =>
    `${STARKSCAN_URL[chainId]}/tx/${hash}${fragment ? `#${fragment}` : ""}`,
  contract: (address: string, fragment?: string) =>
    `${STARKSCAN_URL[chainId]}/contract/${address}${fragment ? `#${fragment}` : ""}`,
  message: (address: string, fragment?: string) =>
    `${STARKSCAN_URL[chainId]}/message/${address}${fragment ? `#${fragment}` : ""}`,
  block: (id: string, fragment?: string) =>
    `${STARKSCAN_URL[chainId]}/block/${id}${fragment ? `#${fragment}` : ""}`,
  event: (address: string, fragment?: string) =>
    `${STARKSCAN_URL[chainId]}/event/${address}${fragment ? `#${fragment}` : ""}`,
  class: (address: string, fragment?: string) =>
    `${STARKSCAN_URL[chainId]}/class/${address}${fragment ? `#${fragment}` : ""}`,
});

export const VoyagerUrl = (chainId: constants.StarknetChainId) => ({
  transaction: (hash: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/tx/${hash}${fragment ? `#${fragment}` : ""}`,
  contract: (address: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/contract/${address}${fragment ? `#${fragment}` : ""}`,
  message: (address: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/message/${address}${fragment ? `#${fragment}` : ""}`,
  block: (id: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/block/${id}${fragment ? `#${fragment}` : ""}`,
  event: (address: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/event/${address}${fragment ? `#${fragment}` : ""}`,
  class: (address: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/class/${address}${fragment ? `#${fragment}` : ""}`,
});
