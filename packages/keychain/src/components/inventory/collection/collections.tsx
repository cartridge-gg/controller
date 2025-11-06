import { Link, useSearchParams } from "react-router-dom";
import { ERC1155, useCollections } from "@/hooks/collection";
import placeholder from "/placeholder.svg?url";
import { CollectibleCard, Skeleton } from "@cartridge/ui";
import { useMemo } from "react";
import { useControllerTheme } from "@/hooks/connection";

import { getChecksumAddress } from "starknet";
import { useMarketplace } from "@/hooks/marketplace";

export function Collections() {
  const { collections, status: CollectionsStatus } = useCollections();
  const { getCollectionOrders } = useMarketplace();
  const theme = useControllerTheme();
  const [searchParams] = useSearchParams();

  const status = useMemo(() => {
    if (CollectionsStatus === "loading") {
      return "loading";
    }
    if (CollectionsStatus === "error") {
      return "error";
    }
    return "success";
  }, [CollectionsStatus]);

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" || !collections.length ? (
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
            to={`./${collection.type === ERC1155 ? "collectible" : "collection"}/${collection.address}?${searchParams.toString()}`}
            key={collection.address}
          >
            <CollectibleCard
              icon={theme?.icon || undefined}
              title={collection.name}
              images={[...collection.imageUrls, placeholder]}
              totalCount={collection.totalCount}
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
