import { useAccount } from "./account";
import { useState } from "react";
import { useCollectionsQuery } from "@cartridge/ui/utils/api/cartridge";
import { useProfileContext } from "./profile";

const TYPE = "ERC-721";
const LIMIT = 1000;

interface Collection {
  name: string;
  address: string;
  imageUrl?: string;
  type: string;
  totalCount?: number;
}

export interface Asset {
  name: string;
  tokenId: string;
  imageUrl?: string;
  amount: number;
  attributes: Array<{
    trait_type?: string;
    trait?: string;
    value: string | number;
  }>;
}

export type UseCollectionResponse = {
  collection: Collection;
  assets: Asset[];
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export function useCollection({
  contractAddress: _,
  tokenIds: __,
}: {
  contractAddress?: string;
  tokenIds?: string[];
}) {
  // TODO: Implement collection fetching
  const collection: Collection = {
    name: "Collection",
    address: "0x0",
    imageUrl: "",
    type: "ERC-721",
  };
  const assets: Asset[] = [];
  const status = "success";

  const refetch = () => {
    // TODO: Implement refetch
  };

  return {
    collection,
    assets,
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
  const { address } = useAccount();
  const { project } = useProfileContext();
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

export function useToriiCollections() {
  // TODO: Implement torii collections fetching
  const collections = {};
  const status = "success";

  return {
    collections,
    status,
  };
}

export function useToriiCollection({
  contractAddress: _,
  tokenIds: __,
}: {
  contractAddress: string;
  tokenIds: string[];
}) {
  // TODO: Implement torii collection fetching
  const tokens: any[] = [];
  const status = "success";

  return {
    tokens,
    status,
  };
}
