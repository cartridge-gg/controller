import { Link } from "react-router-dom";
import { useCollections } from "#hooks/collection";
import placeholder from "/public/placeholder.svg";
import { CollectibleAsset, Skeleton } from "@cartridge/ui";
import { useMemo } from "react";
import { useCollectibles } from "#hooks/collectible.js";

export function Collections() {
  const { collections, status: CollectionsStatus } = useCollections();
  const { collectibles, status: CollectiblesStatus } = useCollectibles();

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
      {collections.map((collection) => (
        <Link
          className="w-full group select-none"
          draggable={false}
          to={`./collection/${collection.address}`}
          key={collection.address}
        >
          <CollectibleAsset
            icon={null}
            title={collection.name}
            image={collection.imageUrl || placeholder}
            count={collection.totalCount}
          />
        </Link>
      ))}
      {collectibles.map((collectible) => (
        <Link
          className="w-full group select-none"
          draggable={false}
          to={`./collectible/${collectible.address}`}
          key={collectible.address}
        >
          <CollectibleAsset
            icon={null}
            title={collectible.name}
            image={collectible.imageUrl || placeholder}
            count={collectible.totalCount}
          />
        </Link>
      ))}
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
