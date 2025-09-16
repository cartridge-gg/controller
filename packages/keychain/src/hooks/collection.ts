import { useAccount, useAccountProfile } from "@/hooks/account";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Collections, Marketplace } from "@cartridge/marketplace";
import { Token, ToriiClient } from "@dojoengine/torii-wasm";
import { useMarketplace } from "@/hooks/marketplace";
import { useConnection } from "@/hooks/connection";
import { addAddressPadding } from "starknet";
import * as torii from "@dojoengine/torii-wasm";

const TYPE = "ERC-721";
const LIMIT = 1000;

export type Collection = {
  address: string;
  name: string;
  type: string;
  imageUrl: string;
  totalCount: number;
};

export type Asset = {
  tokenId: string;
  name: string;
  description?: string;
  imageUrl: string;
  attributes: Record<string, unknown>[];
};

export type UseCollectionResponse = {
  collection?: Collection;
  assets?: Asset[];
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

async function getToriiClient(project: string): Promise<torii.ToriiClient> {
  const url = `https://api.cartridge.gg/x/${project}/torii`;
  const client = await new torii.ToriiClient({
    toriiUrl: url,
    worldAddress: "0x0",
  });
  return client;
}

async function fetchCollections(
  client: torii.ToriiClient,
  contractAddresses: string[],
  tokenIds: string[],
  count: number,
  cursor: string | undefined,
): Promise<{
  items: Token[];
  cursor: string | undefined;
}> {
  try {
    const tokens = await client.getTokens({
      contract_addresses: contractAddresses,
      token_ids: tokenIds,
      pagination: {
        cursor: cursor,
        limit: count,
        order_by: [],
        direction: "Forward",
      },
    });
    if (tokens.items.length !== 0) {
      return {
        items: tokens.items,
        cursor: tokens.next_cursor,
      };
    }
    return { items: [], cursor: undefined };
  } catch (err) {
    console.error(err);
    return { items: [], cursor: undefined };
  }
}

async function fetchBalances(
  client: torii.ToriiClient,
  contractAddresses: string[],
  accountAddress: string,
  count: number,
  cursor: string | undefined,
): Promise<{
  items: torii.TokenBalance[];
  cursor: string | undefined;
}> {
  try {
    const balances = await client.getTokenBalances({
      contract_addresses: contractAddresses,
      account_addresses: [accountAddress],
      token_ids: [],
      pagination: {
        cursor: cursor,
        limit: count,
        order_by: [],
        direction: "Forward",
      },
    });
    if (balances.items.length !== 0) {
      return {
        items: balances.items,
        cursor: balances.next_cursor,
      };
    }
    return { items: [], cursor: undefined };
  } catch (err) {
    console.error(err);
    return { items: [], cursor: undefined };
  }
}

export function useCollection({
  contractAddress,
  tokenIds = [],
}: {
  contractAddress?: string;
  tokenIds?: string[];
}): UseCollectionResponse {
  const { address } = useAccountProfile({ overridable: true });
  const { project } = useConnection();

  const [assets, setAssets] = useState<{ [key: string]: Asset }>({});
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined,
  );
  const [trigger, setTrigger] = useState(true);
  const [client, setClient] = useState<torii.ToriiClient | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!project) return;
    getToriiClient(project).then((client) => setClient(client));
  }, [project]);

  useEffect(() => {
    if (!client || !address || !trigger || !contractAddress) return;
    setTrigger(false);
    const getCollections = async () => {
      const rawBalances = await fetchBalances(
        client,
        [contractAddress],
        address,
        LIMIT,
        undefined,
      );
      const balances = rawBalances.items.filter(
        (b) => BigInt(b.balance) !== 0n && BigInt(b.token_id || "0") !== 0n,
      );
      if (balances.length === 0) return;
      const tokenIds = balances
        .filter((b) => b.contract_address === contractAddress)
        .map((b) => b.token_id?.replace("0x", ""))
        .filter((b) => b !== undefined);
      if (tokenIds.length === 0) return;
      const collection = await fetchCollections(
        client,
        [contractAddress],
        tokenIds,
        LIMIT,
        undefined,
      );
      if (collection.items.length === 0) return;
      const asset = collection.items[0];
      let metadata: { name?: string; image?: string } = {};
      try {
        metadata = JSON.parse(!asset.metadata ? "{}" : asset.metadata);
      } catch (error) {
        console.error(error);
      }
      if (!metadata.name || !metadata.image) return;
      const newCollection: Collection = {
        address: contractAddress,
        name: asset.name || metadata.name,
        type: TYPE,
        imageUrl: metadata.image,
        totalCount: tokenIds.length,
      };
      setCollection(newCollection);
      const newAssets: { [key: string]: Asset } = {};
      collection.items
        .filter((asset) => asset.token_id)
        .forEach((asset) => {
          let metadata: {
            name?: string;
            image?: string;
            description?: string;
            attributes?: string;
          } = {};
          try {
            metadata = JSON.parse(!asset.metadata ? "{}" : asset.metadata);
          } catch (error) {
            console.error(error);
          }
          if (!metadata.name || !metadata.image) return;
          const image = `https://api.cartridge.gg/x/${project}/torii/static/${contractAddress}/${asset.token_id}/image`;
          newAssets[`${contractAddress}-${asset.token_id || ""}`] = {
            tokenId: asset.token_id || "",
            name: metadata.name || asset.name,
            description: metadata.description,
            imageUrl: image || metadata?.image || "",
            attributes: Array.isArray(metadata.attributes)
              ? metadata.attributes
              : [],
          };
        });
      setAssets(newAssets);
    };
    getCollections();
  }, [client, address, trigger, project, contractAddress]);

  const refetch = useCallback(() => {
    setTrigger(true);
  }, [setTrigger]);

  const filteredAssets = useMemo(() => {
    if (!tokenIds.length) return Object.values(assets);
    const filtered = Object.values(assets).filter((a) =>
      tokenIds.includes(a.tokenId),
    );

    return filtered;
  }, [assets, tokenIds]);

  return {
    collection,
    assets: filteredAssets,
    status: "success",
    refetch,
  };
}

export type UseCollectionsResponse = {
  collections: Collection[];
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export type CollectionType = {
  contractAddress: string;
  imagePath: string;
  metadataAttributes: string;
  metadataDescription: string;
  metadataName: string;
  name: string;
  tokenId: string;
  count: number;
};

export function useCollections(): UseCollectionsResponse {
  const account = useAccount();
  const address = account?.address;
  const { project } = useConnection();
  const [collections, setCollections] = useState<{ [key: string]: Collection }>(
    {},
  );
  const [client, setClient] = useState<torii.ToriiClient | undefined>(
    undefined,
  );
  const [trigger, setTrigger] = useState(true);

  useEffect(() => {
    if (!project) return;
    getToriiClient(project).then((client) => setClient(client));
  }, [project]);

  useEffect(() => {
    if (!client || !address || !trigger) return;
    setTrigger(false);
    const getCollections = async () => {
      const rawBalances = await fetchBalances(
        client,
        [],
        address,
        LIMIT,
        undefined,
      );
      const balances = rawBalances.items.filter(
        (b) => BigInt(b.balance) !== 0n && BigInt(b.token_id || "0") !== 0n,
      );
      const contractAddresses = Array.from(
        new Set(balances.map((b) => b.contract_address)),
      );
      const collections: { [key: string]: Collection } = {};
      await Promise.all(
        contractAddresses.map(async (contractAddress) => {
          const tokenIds = balances
            .filter((b) => b.contract_address === contractAddress)
            .map((b) => b.token_id?.replace("0x", ""))
            .filter((b) => b !== undefined);
          if (tokenIds.length === 0) return;
          const collection = await fetchCollections(
            client,
            [contractAddress],
            tokenIds,
            LIMIT,
            undefined,
          );
          if (collection.items.length === 0) return;
          const asset = collection.items[0];
          let metadata: { name?: string; image?: string } = {};
          try {
            metadata = JSON.parse(collection.items[0].metadata);
          } catch (error) {
            console.error(error);
          }
          if (!metadata.name || !metadata.image) return;
          const image = `https://api.cartridge.gg/x/${project}/torii/static/${contractAddress}/${asset.token_id}/image`;
          collections[contractAddress] = {
            address: contractAddress,
            name: asset.name || metadata.name,
            type: TYPE,
            imageUrl: image || metadata?.image || "",
            totalCount: tokenIds.length,
          };
        }),
      );
      setCollections(collections);
    };
    getCollections();
  }, [client, address, project, trigger]);

  const refetch = useCallback(() => {
    setTrigger(true);
  }, [setTrigger]);

  return {
    collections: Object.values(collections).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    status: "success",
    refetch,
  };
}

export type UseToriiCollectionsResponse = {
  collections: Collections;
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export function useToriiCollections(): UseToriiCollectionsResponse {
  const { provider } = useMarketplace();
  const { project } = useConnection();
  const [client, setClient] = useState<ToriiClient | undefined>(undefined);
  const [status, setStatus] = useState<
    "success" | "error" | "idle" | "loading"
  >("idle");
  const [collections, setCollections] = useState<Collections>({});

  const refetch = useCallback(() => {
    if (!client || !project) return;
    setStatus("loading");
    Marketplace.fetchCollections({ [project]: client })
      .then((collections) => {
        setCollections(collections);
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        console.error(error);
      });
  }, [project, client, setStatus, setCollections]);

  useEffect(() => {
    if (!project) return;
    const getClients = async () => {
      const url = `https://api.cartridge.gg/x/${project}/torii`;
      const client = await provider.getToriiClient(url);
      setClient(client);
    };
    getClients();
  }, [provider, project]);

  useEffect(() => {
    refetch();
  }, [client, refetch]);

  return {
    collections: collections,
    status,
    refetch,
  };
}

export type UseToriiCollectionResponse = {
  tokens: Token[];
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export function useToriiCollection({
  contractAddress,
  tokenIds,
}: {
  contractAddress: string;
  tokenIds: string[];
}): UseToriiCollectionResponse {
  const { provider } = useMarketplace();
  const { project } = useConnection();
  const [client, setClient] = useState<ToriiClient | undefined>(undefined);
  const [status, setStatus] = useState<
    "success" | "error" | "idle" | "loading"
  >("idle");
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (!project) return;
    const getClient = async () => {
      const url = `https://api.cartridge.gg/x/${project}/torii`;
      const client = await provider.getToriiClient(url);
      setClient(client);
    };
    getClient();
  }, [provider, project]);

  const refetch = useCallback(() => {
    if (!client || !contractAddress || !tokenIds.length) return;
    setStatus("loading");
    client
      .getTokens({
        contract_addresses: [contractAddress],
        token_ids: tokenIds.map((id) =>
          addAddressPadding(id).replace("0x", ""),
        ),
        pagination: {
          limit: LIMIT,
          cursor: undefined,
          direction: "Forward",
          order_by: [],
        },
      })
      .then((tokens) => {
        setTokens(tokens.items || []);
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        console.error(error);
      });
  }, [client, setStatus, setTokens, contractAddress, tokenIds]);

  useEffect(() => {
    refetch();
  }, [client, refetch]);

  return {
    tokens: tokens,
    status,
    refetch,
  };
}
