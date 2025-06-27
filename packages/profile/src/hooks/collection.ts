import { useAccount } from "./account";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCollectionQuery,
  useCollectionsQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useConnection } from "./context";
import { Collections, Marketplace } from "@cartridge/marketplace";
import { Token, ToriiClient } from "@dojoengine/torii-wasm";
import { useMarketplace } from "./marketplace";

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

export function useCollection({
  contractAddress,
  tokenIds = [],
}: {
  contractAddress?: string;
  tokenIds?: string[];
}): UseCollectionResponse {
  const { address } = useAccount({ overridable: true });
  const { project } = useConnection();
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined,
  );
  const [assets, setAssets] = useState<{ [key: string]: Asset }>({});

  const { status, refetch } = useCollectionQuery(
    {
      projects: [project ?? ""],
      accountAddress: address,
      contractAddress: contractAddress ?? "",
    },
    {
      queryKey: ["collection"],
      enabled: !!project && !!address,
      onSuccess: ({ collection }) => {
        const name = collection.meta.name;
        const newCollection: Collection = {
          address: collection.meta.contractAddress,
          name: name ? name : "---",
          type: TYPE,
          imageUrl: collection.meta.imagePath,
          totalCount: collection.meta.assetCount,
        };

        const newAssets: { [key: string]: Asset } = {};

        collection.assets.forEach((a) => {
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

        setCollection(newCollection);
        setAssets(newAssets);
      },
    },
  );

  const filteredAssets = useMemo(() => {
    if (!tokenIds.length) return Object.values(assets);
    return Object.values(assets).filter((a) => tokenIds.includes(a.tokenId));
  }, [assets, tokenIds]);

  return { collection, assets: filteredAssets, status, refetch };
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
  const { address } = useAccount();
  const { project } = useConnection();
  const [offset, setOffset] = useState(0);
  const [collections, setCollections] = useState<{ [key: string]: Collection }>(
    {},
  );
  
  const { status, refetch } = useCollectionsQuery(
    {
      accountAddress: address,
      projects: [project ?? ""],
      limit: LIMIT,
      offset: offset,
    },
    {
      queryKey: ["collections", offset],
      enabled: !!project && !!address,
      onSuccess: ({ collections }) => {
        const newCollections: { [key: string]: Collection } = {};
        collections?.edges.forEach((e) => {
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
        if (collections?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setCollections((prev) => ({ ...prev, ...newCollections }));
      },
    },
  );

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
  }, [client]);

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
    const getClients = async () => {
      const url = `https://api.cartridge.gg/x/${project}/torii`;
      const client = await provider.getToriiClient(url);
      setClient(client);
    };
    getClients();
  }, [provider, project]);

  const refetch = useCallback(() => {
    if (!client) return;
    setStatus("loading");
    client
      .getTokens([contractAddress], tokenIds)
      .then((tokens) => {
        setTokens(tokens.items || []);
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        console.error(error);
      });
  }, [client, setStatus, setTokens]);

  useEffect(() => {
    refetch();
  }, [client]);

  return {
    tokens: tokens,
    status,
    refetch,
  };
}
