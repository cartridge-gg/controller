import { Link } from "react-router-dom";
import { useCollections } from "#hooks/collection";
import placeholder from "/public/placeholder.svg";
import { CollectibleCard, Skeleton } from "@cartridge/ui";
import { useMemo } from "react";
import { useCollectibles } from "#hooks/collectible.js";
import { useArcade } from "#hooks/arcade.js";
import { useConnection, useTheme } from "#hooks/context.js";
import { EditionModel } from "@cartridge/arcade";

export function Collections() {
  const { collections, status: CollectionsStatus } = useCollections();
  const { collectibles, status: CollectiblesStatus } = useCollectibles();
  const { editions } = useArcade();
  const { project, namespace } = useConnection();
  const { theme } = useTheme();

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) =>
        edition.namespace === namespace && edition.config.project === project,
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
      {collections.map((collection) => (
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
            selectable={false}
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
          <CollectibleCard
            title={collectible.name}
            image={collectible.imageUrl || placeholder}
            totalCount={collectible.totalCount}
            selectable={false}
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
