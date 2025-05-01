import { useAccount } from "./account";
import { useMemo, useState } from "react";
import {
  useCollectibleQuery,
  useCollectiblesQuery,
} from "@cartridge/utils/api/cartridge";
import { useConnection } from "./context";

const TYPE = "ERC-1155";
const LIMIT = 1000;

export type Collectible = {
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
  amount: number;
};

export type UseCollectibleResponse = {
  collectible?: Collectible;
  assets?: Asset[];
  status: "success" | "error" | "idle" | "loading";
};

export function useCollectible({
  contractAddress,
  tokenIds = [],
}: {
  contractAddress?: string;
  tokenIds?: string[];
}): UseCollectibleResponse {
  const { address } = useAccount();
  const { project } = useConnection();
  const [collectible, setCollectible] = useState<Collectible | undefined>(
    undefined,
  );
  const [assets, setAssets] = useState<{ [key: string]: Asset }>({});

  const { status } = useCollectibleQuery(
    {
      projects: [project ?? ""],
      accountAddress: address,
      contractAddress: contractAddress ?? "",
    },
    {
      queryKey: ["collectible"],
      enabled: !!project && !!address,
      onSuccess: ({ collectible }) => {
        const newCollectible: Collectible = {
          address: collectible.meta.contractAddress,
          name: collectible.meta.name,
          type: TYPE,
          imageUrl: collectible.meta.imagePath,
          totalCount: collectible.meta.assetCount,
        };

        const newAssets: { [key: string]: Asset } = {};
        collectible.assets.forEach((a) => {
          let imageUrl = a.imageUrl;
          if (!imageUrl.includes("://")) {
            imageUrl = newCollectible.imageUrl.replace(
              /0x[a-fA-F0-9]+(?=\/image$)/,
              a.tokenId,
            );
          }
          const asset: Asset = {
            tokenId: a.tokenId,
            name: a.name,
            description: a.description ?? "",
            imageUrl: imageUrl,
            attributes: JSON.parse(a.attributes ?? "{}"),
            amount: a.amount,
          };
          newAssets[`${newCollectible.address}-${a.tokenId}`] = asset;
        });

        setCollectible(newCollectible);
        setAssets(newAssets);
      },
    },
  );

  const filteredAssets = useMemo(() => {
    if (!tokenIds.length) return Object.values(assets);
    return Object.values(assets).filter((a) => tokenIds.includes(a.tokenId));
  }, [assets, tokenIds]);

  return { collectible, assets: filteredAssets, status };
}

export type UseCollectiblesResponse = {
  collectibles: Collectible[];
  status: "success" | "error" | "idle" | "loading";
};

export type CollectibleType = {
  contractAddress: string;
  imagePath: string;
  metadataAttributes: string;
  metadataDescription: string;
  metadataName: string;
  name: string;
  tokenId: string;
  count: number;
};

export function useCollectibles(): UseCollectiblesResponse {
  const { address } = useAccount();
  const { project } = useConnection();
  const [offset, setOffset] = useState(0);
  const [collectibles, setCollectibles] = useState<{
    [key: string]: Collectible;
  }>({});

  const { status } = useCollectiblesQuery(
    {
      accountAddress: address,
      projects: [project ?? ""],
      limit: LIMIT,
      offset: offset,
    },
    {
      queryKey: ["collectibles", offset],
      enabled: !!project && !!address,
      onSuccess: ({ collectibles }) => {
        const newCollectibles: { [key: string]: Collectible } = {};
        collectibles?.edges.forEach((e) => {
          const contractAddress = e.node.meta.contractAddress;
          const imagePath = e.node.meta.imagePath;
          const name = e.node.meta.name;
          const count = e.node.meta.assetCount;
          newCollectibles[`${contractAddress}`] = {
            address: contractAddress,
            imageUrl: imagePath,
            name,
            totalCount: count,
            type: TYPE,
          };
        });
        if (collectibles?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setCollectibles((prev) => ({ ...prev, ...newCollectibles }));
      },
    },
  );

  return { collectibles: Object.values(collectibles), status };
}
