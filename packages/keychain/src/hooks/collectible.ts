import { useAccount } from "./account";
import { useMemo, useState } from "react";
import {
  useCollectibleQuery,
  useCollectiblesQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useConnection } from "@/hooks/connection";

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
  const account = useAccount();
  const address = account?.address || "";
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
        const imageUrl = collectible.meta.imagePath;
        const name = collectible.meta.name;
        const newCollectible: Collectible = {
          address: collectible.meta.contractAddress,
          name: name ? name : "---",
          type: TYPE,
          imageUrl: imageUrl,
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
          let attributes: Record<string, unknown>[] = [];
          try {
            attributes = JSON.parse(!a.attributes ? "[]" : a.attributes);
          } catch (error) {
            console.error(error);
          }
          const name = a.name;
          const asset: Asset = {
            tokenId: a.tokenId,
            name: name ? name : "---",
            description: a.description ?? "",
            imageUrl: imageUrl,
            attributes: attributes,
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
  const account = useAccount();
  const address = account?.address || "";
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
          const first = e.node.assets.length > 0 ? e.node.assets[0] : undefined;
          let metadata: { image?: string } = {};
          try {
            metadata = JSON.parse(!first?.metadata ? "{}" : first.metadata);
          } catch (error) {
            console.warn(error);
          }
          newCollectibles[`${contractAddress}`] = {
            address: contractAddress,
            imageUrl: metadata?.image ?? imagePath,
            name: name ? name : "---",
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
