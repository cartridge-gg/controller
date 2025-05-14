import { useAccount } from "./account";
import { useMemo, useState } from "react";
import {
  useCollectionQuery,
  useCollectionsQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useConnection } from "./context";

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
};

export function useCollection({
  contractAddress,
  tokenIds = [],
}: {
  contractAddress?: string;
  tokenIds?: string[];
}): UseCollectionResponse {
  const { address } = useAccount();
  const { project } = useConnection();
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined,
  );
  const [assets, setAssets] = useState<{ [key: string]: Asset }>({});

  const { status } = useCollectionQuery(
    {
      projects: [project ?? ""],
      accountAddress: address,
      contractAddress: contractAddress ?? "",
    },
    {
      queryKey: ["collection"],
      enabled: !!project && !!address,
      onSuccess: ({ collection }) => {
        const assets = collection.assets;
        const first = assets.length > 0 ? assets[0] : undefined;
        let metadata: { image?: string } = {};
        try {
          metadata = JSON.parse(!first?.metadata ? "{}" : first.metadata);
        } catch (error) {
          console.warn(error, { data: first?.metadata });
        }
        const name = collection.meta.name;
        const newCollection: Collection = {
          address: collection.meta.contractAddress,
          name: name ? name : "---",
          type: TYPE,
          imageUrl: metadata?.image ?? collection.meta.imagePath,
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
            imageUrl: metadata?.image ?? imageUrl,
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

  return { collection, assets: filteredAssets, status };
}

export type UseCollectionsResponse = {
  collections: Collection[];
  status: "success" | "error" | "idle" | "loading";
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

  const { status } = useCollectionsQuery(
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
          const first = e.node.assets.length > 0 ? e.node.assets[0] : undefined;
          let metadata: { image?: string } = {};
          try {
            metadata = JSON.parse(!first?.metadata ? "{}" : first?.metadata);
          } catch (error) {
            console.warn(error, { data: first?.metadata });
          }
          newCollections[`${contractAddress}`] = {
            address: contractAddress,
            imageUrl: metadata?.image ?? imagePath,
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

  return { collections: Object.values(collections), status };
}
