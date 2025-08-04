import { useAccount, useAccountProfile } from "@/hooks/account";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCollectionQuery,
  useCollectionsQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { Collections, Marketplace } from "@cartridge/marketplace";
import { Pagination, Token, ToriiClient } from "@dojoengine/torii-wasm";
import { useMarketplace } from "@/hooks/marketplace";
import { useConnection } from "@/hooks/connection";
import { addAddressPadding } from "starknet";

const TYPE = "ERC-721";
const LIMIT = 5000;
const DEFAULT_PAGINATION: Pagination = {
  limit: LIMIT,
  cursor: undefined,
  order_by: [],
  direction: "Forward",
};

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

export function useCollection({
  contractAddress,
  tokenIds = [],
}: {
  contractAddress?: string;
  tokenIds?: string[];
}): UseCollectionResponse {
  const { address } = useAccountProfile({ overridable: true });
  const { project } = useConnection();

  const { data, status, refetch } = useCollectionQuery(
    {
      projects: [project ?? ""],
      accountAddress: address,
      contractAddress: contractAddress ?? "",
    },
    {
      queryKey: ["collection", contractAddress, address, project],
      enabled: !!project && !!address && !!contractAddress,
      staleTime: 60,
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );

  // Process the collection data (from cache or fresh query)
  const { collection, assets } = useMemo(() => {
    if (!data?.collection) {
      return { collection: undefined, assets: {} };
    }

    const name = data.collection.meta.name;
    const newCollection: Collection = {
      address: data.collection.meta.contractAddress,
      name: name ? name : "---",
      type: TYPE,
      imageUrl: data.collection.meta.imagePath,
      totalCount: data.collection.meta.assetCount,
    };

    const newAssets: { [key: string]: Asset } = {};

    data.collection.assets.forEach((a) => {
      let imageUrl = a.imageUrl;
      if (!imageUrl.includes("://")) {
        imageUrl = newCollection.imageUrl.replace(
          /0x[a-fA-F0-9]+(?=\/image$)/,
          a.tokenId,
        );
      }
      let attributes = [];
      try {
        attributes = JSON.parse(!a.attributes ? "[]" : a.attributes);
      } catch (error) {
        console.warn(error, { data: attributes });
      }
      let metadata: { image?: string } = {};
      try {
        metadata = JSON.parse(!a.metadata ? "{}" : a.metadata);
      } catch (error) {
        console.warn(error, { data: a.metadata });
      }
      const asset: Asset = {
        tokenId: a.tokenId,
        name: a.name,
        description: a.description ?? "",
        imageUrl: imageUrl || metadata?.image || "",
        attributes: attributes,
      };
      newAssets[`${newCollection.address}-${a.tokenId}`] = asset;
    });

    return { collection: newCollection, assets: newAssets };
  }, [data, status]);

  const filteredAssets = useMemo(() => {
    if (!tokenIds.length) return Object.values(assets);
    const filtered = Object.values(assets).filter((a) =>
      tokenIds.includes(a.tokenId),
    );

    return filtered;
  }, [assets, tokenIds, contractAddress, data, status]);

  return {
    collection,
    assets: filteredAssets,
    status,
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
  const [offset, setOffset] = useState(0);
  const [collections, setCollections] = useState<{ [key: string]: Collection }>(
    {},
  );

  const { data, status, refetch } = useCollectionsQuery(
    {
      accountAddress: address || "",
      projects: [project ?? ""],
      limit: LIMIT,
      offset: offset,
    },
    {
      queryKey: ["collections", project, address, offset],
      enabled: !!project && !!address,
    },
  );

  const processedCollections = useMemo(() => {
    if (!data?.collections) return {};

    const newCollections: { [key: string]: Collection } = {};
    data.collections.edges.forEach((e) => {
      const contractAddress = e.node.meta.contractAddress;
      const imagePath = e.node.meta.imagePath;
      const name = e.node.meta.name;
      const count = e.node.meta.assetCount;
      newCollections[`${contractAddress}`] = {
        address: contractAddress,
        imageUrl: imagePath,
        name: name ? name : "---",
        totalCount: count,
        type: TYPE,
      };
    });
    return newCollections;
  }, [data]);

  useEffect(() => {
    if (data?.collections) {
      if (data.collections.edges.length === LIMIT) {
        setOffset(offset + LIMIT);
      }

      setCollections((prev) => ({ ...prev, ...processedCollections }));
    }
  }, [data, offset, processedCollections]);

  return {
    collections: Object.values(collections).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    status,
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
        pagination: DEFAULT_PAGINATION,
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
  }, [client]);

  return {
    tokens: tokens,
    status,
    refetch,
  };
}
