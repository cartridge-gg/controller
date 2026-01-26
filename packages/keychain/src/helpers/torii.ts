import * as torii from "@dojoengine/torii-wasm";
import { Token } from "@dojoengine/torii-wasm";
import { addAddressPadding } from "starknet";

const BATCH_SIZE = 1000;

/**
 * Torii module - Helper functions for interacting with the Torii API
 */
export default {
  /**
   * Get a ToriiClient instance for a given project
   * @param project - The project name
   * @returns A ToriiClient instance
   */
  async getClient(project: string): Promise<torii.ToriiClient> {
    const url = `https://api.cartridge.gg/x/${project}/torii`;
    const client = new torii.ToriiClient({
      toriiUrl: url,
      worldAddress: "0x0",
    });
    return client;
  },

  /**
   * Fetch contracts by type
   * @param client - The ToriiClient instance
   * @param contractTypes - Array of contract types to filter by
   * @returns Array of contracts
   */
  async fetchContracts(
    client: torii.ToriiClient,
    contractTypes: torii.ContractType[],
  ): Promise<torii.Contract[]> {
    return client.getContracts({
      contract_addresses: [],
      contract_types: contractTypes,
    });
  },

  /**
   * Fetch a single contract by address
   * @param client - The ToriiClient instance
   * @param contractAddress - The contract address
   * @returns The contract
   */
  async fetchContract(
    client: torii.ToriiClient,
    contractAddress: string,
  ): Promise<torii.Contract> {
    return client
      .getContracts({
        contract_addresses: [contractAddress],
        contract_types: [],
      })
      .then((contracts) => contracts[0]);
  },

  /**
   * Fetch a single contract by address
   * @param client - The ToriiClient instance
   * @param contractAddress - The contract address
   * @returns The contract
   */
  async fetchTokenContract(
    client: torii.ToriiClient,
    contractAddress: string,
  ): Promise<torii.TokenContract> {
    return client
      .getTokenContracts({
        contract_addresses: [contractAddress],
        contract_types: [],
        pagination: {
          cursor: undefined,
          limit: 1,
          order_by: [],
          direction: "Forward",
        },
      })
      .then((contracts) => contracts.items[0]);
  },

  /**
   * Fetch collections (tokens) for given contracts and token IDs
   * @param client - The ToriiClient instance
   * @param contractAddresses - Array of contract addresses
   * @param tokenIds - Array of token IDs
   * @param count - Maximum number of items to fetch
   * @returns Object containing items and next cursor
   */
  async fetchCollections(
    client: torii.ToriiClient,
    contractAddresses: string[],
    tokenIds: string[],
    count: number,
  ): Promise<{
    items: Token[];
  }> {
    try {
      let tokens = await client.getTokens({
        contract_addresses: contractAddresses,
        token_ids: tokenIds,
        pagination: {
          cursor: undefined,
          limit: BATCH_SIZE,
          order_by: [],
          direction: "Forward",
        },
        attribute_filters: [],
      });
      const allTokens = [...tokens.items];
      while (tokens.next_cursor && allTokens.length < count) {
        tokens = await client.getTokens({
          contract_addresses: [],
          token_ids: [],
          pagination: {
            limit: BATCH_SIZE,
            cursor: tokens.next_cursor,
            order_by: [],
            direction: "Forward",
          },
          attribute_filters: [],
        });
        allTokens.push(...tokens.items);
      }

      if (allTokens.length !== 0) {
        return {
          items: allTokens.filter((token) => !!token.token_id),
        };
      }
      return { items: [] };
    } catch (err) {
      console.error(err);
      return { items: [] };
    }
  },

  /**
   * Fetch token balances for given contracts, accounts, and token IDs
   * @param client - The ToriiClient instance
   * @param contractAddresses - Array of contract addresses
   * @param accountAddresses - Array of account addresses
   * @param tokenIds - Array of token IDs
   * @param count - Maximum number of items to fetch
   * @returns Object containing balance items and next cursor
   */
  async fetchBalances(
    client: torii.ToriiClient,
    contractAddresses: string[],
    accountAddresses: string[],
    tokenIds: string[],
    count: number,
  ): Promise<{
    items: torii.TokenBalance[];
  }> {
    try {
      let balances = await client.getTokenBalances({
        contract_addresses: contractAddresses.map((addresss) =>
          addAddressPadding(addresss).toLowerCase(),
        ),
        account_addresses: accountAddresses.map((address) =>
          addAddressPadding(address).toLowerCase(),
        ),
        token_ids: tokenIds.map((id) =>
          addAddressPadding(id).replace("0x", "").toLowerCase(),
        ),
        pagination: {
          cursor: undefined,
          limit: BATCH_SIZE,
          order_by: [],
          direction: "Forward",
        },
      });
      const allBalances = [...balances.items];
      while (balances.next_cursor && allBalances.length < count) {
        balances = await client.getTokenBalances({
          contract_addresses: contractAddresses.map((addresss) =>
            addAddressPadding(addresss).toLowerCase(),
          ),
          account_addresses: accountAddresses.map((address) =>
            addAddressPadding(address).toLowerCase(),
          ),
          token_ids: tokenIds.map((id) =>
            addAddressPadding(id).replace("0x", "").toLowerCase(),
          ),
          pagination: {
            limit: BATCH_SIZE,
            cursor: balances.next_cursor,
            order_by: [],
            direction: "Forward",
          },
        });
        allBalances.push(...balances.items);
      }
      if (allBalances.length !== 0) {
        return { items: allBalances };
      }
      return { items: [] };
    } catch (err) {
      console.error(err);
      return { items: [] };
    }
  },

  /**
   * Fetch token balances for given contracts, accounts, and token IDs
   * @param client - The ToriiClient instance
   * @param contractAddresses - Array of contract addresses
   * @param accountAddresses - Array of account addresses
   * @param tokenIds - Array of token IDs
   * @param count - Maximum number of items to fetch
   * @returns Object containing balance items and next cursor
   */
  async fetchTransfers(
    client: torii.ToriiClient,
    contractAddresses: string[],
    accountAddresses: string[],
    tokenIds: string[],
    count: number,
  ): Promise<{
    items: torii.TokenTransfer[];
  }> {
    try {
      let transfers = await client.getTokenTransfers({
        contract_addresses: contractAddresses,
        account_addresses: accountAddresses,
        token_ids: tokenIds.map((id) =>
          addAddressPadding(id).replace("0x", ""),
        ),
        pagination: {
          cursor: undefined,
          limit: BATCH_SIZE,
          order_by: [],
          direction: "Forward",
        },
      });
      const allTransfers = [...transfers.items];
      while (transfers.next_cursor && allTransfers.length < count) {
        transfers = await client.getTokenTransfers({
          contract_addresses: [],
          account_addresses: [],
          token_ids: [],
          pagination: {
            limit: BATCH_SIZE,
            cursor: transfers.next_cursor,
            order_by: [],
            direction: "Forward",
          },
        });
        allTransfers.push(...transfers.items);
      }
      if (allTransfers.length !== 0) {
        return { items: allTransfers };
      }
      return { items: [] };
    } catch (err) {
      console.error(err);
      return { items: [] };
    }
  },
};
