import { Link } from "react-router-dom";
import { useCollections } from "@/hooks/collection";
import placeholder from "/placeholder.svg?url";
import { CollectibleCard, Skeleton } from "@cartridge/ui";
import { useMemo } from "react";
import { useCollectibles } from "@/hooks/collectible";
import { useArcade } from "@/hooks/arcade";
import { useConnection, useControllerTheme } from "@/hooks/connection";
import { EditionModel } from "@cartridge/arcade";

import { getChecksumAddress } from "starknet";
import { useMarketplace } from "@/hooks/marketplace";

export function Collections() {
  const { collections, status: CollectionsStatus } = useCollections();
  const { collectibles, status: CollectiblesStatus } = useCollectibles();
  const { editions } = useArcade();
  const { getCollectionOrders } = useMarketplace();
  const { project, namespace } = useConnection();
  const theme = useControllerTheme();

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) => edition.config.project === project,
    );
  }, [editions, project, namespace]);

  const status = useMemo(() => {
    if (CollectionsStatus === "loading" && CollectiblesStatus === "loading") {
      return "loading";
    }
    if (CollectionsStatus === "error" || CollectiblesStatus === "error") {
      return "error";
    }
    return "success";
  }, [CollectionsStatus, CollectiblesStatus]);

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || (!collections.length && !collectibles.length) ? (
    <EmptyState />
  ) : (
    <div className="grid grid-cols-2 gap-4 place-items-center select-none">
      {collections.map((collection) => {
        const collectionAddress = getChecksumAddress(
          collection.address || "0x0",
        );
        const collectionOrders = getCollectionOrders(collectionAddress);
        const listingCount =
          Object.entries(collectionOrders).length || undefined;
        return (
          <Link
            className="w-full group select-none"
            draggable={false}
            to={`./collection/${collection.address}`}
            key={collection.address}
          >
            <CollectibleCard
              icon={edition?.properties.icon || theme?.icon || undefined}
              title={collection.name}
              image={collection.imageUrl || placeholder}
              totalCount={collection.totalCount}
              listingCount={listingCount}
              selectable={false}
            />
          </Link>
        );
      })}
      {collectibles.map((collectible) => {
        const collectionAddress = getChecksumAddress(
          collectible.address || "0x0",
        );
        const collectionOrders = getCollectionOrders(collectionAddress);
        const listingCount =
          Object.entries(collectionOrders).length || undefined;
        return (
          <Link
            className="w-full group select-none"
            draggable={false}
            to={`./collectible/${collectible.address}`}
            key={collectible.address}
          >
            <CollectibleCard
              title={collectible.name}
              image={collectible.imageUrl || placeholder}
              totalCount={collectible.totalCount}
              listingCount={listingCount}
              selectable={false}
            />
          </Link>
        );
      })}
    </div>
  );
}

const LoadingState = () => {
  return (
    <div className="flex gap-4">
      <Skeleton className="w-1/2 h-[184px] rounded" />
      <Skeleton className="w-1/2 h-[184px] rounded" />
    </div>
  );
};

const EmptyState = () => {
  return null;
};
