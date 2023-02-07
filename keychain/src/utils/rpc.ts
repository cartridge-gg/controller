import { constants } from "starknet";

const GOERLI_ENDPOINT = "https://alpha4.starknet.io/feeder_gateway";
const MAINNET_ENDPOINT = "https://alpha-mainnet.starknet.io/feeder_gateway";

// TODO: this should probably be supported by starknetjs
export const getClassByHash = async (
  chainId: constants.StarknetChainId,
  hash: string,
): Promise<any> => {
  const raw = await get(chainId, "get_class_by_hash", `classHash=${hash}`);
  return await raw.json();
};

// Cartridge RPC is not returning receipt of rejected txns
export const getTransactionReceipt = async (
  chainId: constants.StarknetChainId,
  hash: string,
): Promise<any> => {
  const raw = await get(
    chainId,
    "get_transaction_receipt",
    `transactionHash=${hash}`,
  );
  return await raw.json();
};

function get(
  chainId: constants.StarknetChainId,
  method: any,
  params: any,
): Promise<any> {
  switch (chainId) {
    case constants.StarknetChainId.MAINNET:
      return fetch(`${MAINNET_ENDPOINT}/${method}?${params}`, {
        method: "GET",
      });
    case constants.StarknetChainId.TESTNET:
      return fetch(`${GOERLI_ENDPOINT}/${method}?${params}`, {
        method: "GET",
      });
    default:
      throw Error("chain not supported");
  }
}
