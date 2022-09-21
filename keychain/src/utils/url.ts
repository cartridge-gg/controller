import { defaultProvider } from "starknet";
import { StarknetChainId } from "starknet/dist/constants";

const testnet =
  defaultProvider.chainId === StarknetChainId.TESTNET ? "goerli." : "";
const baseUrl = `https://${testnet}voyager.online`;

export const VoyagerUrl = {
  transaction: (address: string) => `${baseUrl}/tx/${address}`,
  contract: (address: string, page: string = "transactions") =>
    `${baseUrl}/contract/${address}#${page}`,
  message: (address: string) => `${baseUrl}/message/${address}`,
  block: (address: string) => `${baseUrl}/block/${address}`,
  event: (address: string) => `${baseUrl}/event/${address}`,
  class: (address: string) => `${baseUrl}/class/${address}`,
};
