import { useAccount, useAccountProfile } from "./account";
import { useEffect, useMemo, useState } from "react";
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
  refetch: () => void;
};

export function useCollectible({
  contractAddress,
  tokenIds = [],
}: {
  contractAddress?: string;
  tokenIds?: string[];
}): UseCollectibleResponse {
  const { address } = useAccountProfile({ overridable: true });
  const { project } = useConnection();

  const { data, status, refetch } = useCollectibleQuery(
    {
      projects: [project ?? ""],
      accountAddress: address,
      contractAddress: contractAddress ?? "",
    },
    {
      queryKey: ["collectible", contractAddress, address, project],
      enabled: !!project && !!address && !!contractAddress,
      staleTime: 60,
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );

  // Process the collection data (from cache or fresh query)
  const { collectible, assets } = useMemo(() => {
    if (!data?.collectible) {
      return { collection: undefined, assets: {} };
    }

    const name = data.collectible.meta.name;
    const newCollectible: Collectible = {
      address: data.collectible.meta.contractAddress,
      name: name ? name : "---",
      type: TYPE,
      imageUrl: data.collectible.meta.imagePath,
      totalCount: data.collectible.meta.assetCount,
    };

    const newAssets: { [key: string]: Asset } = {};

    data.collectible.assets.forEach((a) => {
      let imageUrl = a.imageUrl;
      if (!imageUrl.includes("://")) {
        imageUrl = newCollectible.imageUrl.replace(
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
        amount: a.amount,
      };
      newAssets[`${newCollectible.address}-${a.tokenId}`] = asset;
    });

    return { collectible: newCollectible, assets: newAssets };
  }, [data]);

  const filteredAssets = useMemo(() => {
    if (!tokenIds.length) return Object.values(assets);
    const filtered = Object.values(assets).filter((a) =>
      tokenIds.map((t) => BigInt(t)).includes(BigInt(a.tokenId)),
    );

    return filtered;
  }, [assets, tokenIds]);

  return {
    collectible,
    assets: filteredAssets,
    status,
    refetch,
  };
}

export type UseCollectiblesResponse = {
  collectibles: Collectible[];
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
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

export function useCollectibles(
  accountAddress?: string,
): UseCollectiblesResponse {
  const account = useAccount();
  const connectedAddress = account?.address;
  const { address: profileAddress } = useAccountProfile({ overridable: true });
  const address = useMemo(
    () => accountAddress ?? profileAddress ?? connectedAddress,
    [accountAddress, profileAddress, connectedAddress],
  );
  const { project } = useConnection();
  const [offset, setOffset] = useState(0);
  const [collectibles, setCollectibles] = useState<{
    [key: string]: Collectible;
  }>({});

  const { data, status, refetch } = useCollectiblesQuery(
    {
      accountAddress: address || "",
      projects: [project ?? ""],
      limit: LIMIT,
      offset: offset,
    },
    {
      queryKey: ["collectibles", project, address, offset],
      enabled: !!project && !!address,
    },
  );

  const processedCollectibles = useMemo(() => {
    if (!data?.collectibles) return {};

    const newCollectibles: { [key: string]: Collectible } = {};
    data.collectibles.edges.forEach((e) => {
      const contractAddress = e.node.meta.contractAddress;
      const imagePath = e.node.meta.imagePath;
      const name = e.node.meta.name;
      const count = e.node.meta.assetCount;
      newCollectibles[`${contractAddress}`] = {
        address: contractAddress,
        imageUrl: imagePath,
        name: name ? name : "---",
        totalCount: count,
        type: TYPE,
      };
    });
    return newCollectibles;
  }, [data]);

  useEffect(() => {
    if (data?.collectibles) {
      if (data.collectibles.edges.length === LIMIT) {
        setOffset(offset + LIMIT);
      }

      setCollectibles((prev) => ({ ...prev, ...processedCollectibles }));
    }
  }, [data, offset, processedCollectibles]);

  return {
    collectibles: Object.values(collectibles).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    status,
    refetch,
  };
}
