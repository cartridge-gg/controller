import { Link } from "react-router-dom";
import { useCollections } from "#hooks/collection";
import placeholder from "/public/placeholder.svg";
import { CollectibleAsset, Skeleton } from "@cartridge/ui-next";

export function Collections() {
  const { collections, status } = useCollections();

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || !collections.length ? (
    <EmptyState />
  ) : (
    <div className="grid grid-cols-2 gap-4 place-items-center select-none">
      {collections.map((collection) => (
        <Link
          className="w-full aspect-square group select-none"
          draggable={false}
          to={`./collection/${collection.address}`}
          key={collection.address}
        >
          <CollectibleAsset
            title={collection.name}
            image={collection.imageUrl || placeholder}
            count={collection.totalCount}
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
