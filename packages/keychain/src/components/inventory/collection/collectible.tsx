import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { LayoutContent, CollectibleCard, Skeleton, Empty } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useMemo } from "react";
import placeholder from "/placeholder.svg?url";
import { CollectionHeader } from "./header";
import { useControllerTheme } from "@/hooks/connection";
import { useMarketplace } from "@/hooks/marketplace";
import { useCollection } from "@/hooks/collection";

export function Collectible() {
  const { address } = useParams<{ address: string }>();
  const theme = useControllerTheme();
  const { getCollectionOrders } = useMarketplace();

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    collection: collectible,
    assets,
    status,
  } = useCollection({
    contractAddress: address,
  });

  const orders = useMemo(() => {
    return getCollectionOrders(address || "");
  }, [address, getCollectionOrders]);

  return (
    <>
      {status === "loading" || !collectible || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <LayoutContent className={cn("")}>
          <CollectionHeader
            image={theme?.icon}
            title={collectible.name}
            subtitle={theme?.name || "---"}
            certified
          />

          <div className="grid grid-cols-2 gap-4 place-items-center">
            {assets.map((asset) => {
              return (
                <Link
                  className="w-full select-none"
                  draggable={false}
                  to={`token/${asset.tokenId}?${searchParams.toString()}`}
                  state={location.state}
                  key={asset.tokenId}
                >
                  <CollectibleCard
                    title={
                      asset.name.includes(
                        `${parseInt(BigInt(asset.tokenId).toString())}`,
                      )
                        ? asset.name
                        : `${asset.name} #${parseInt(BigInt(asset.tokenId).toString())}`
                    }
                    selectable={false}
                    images={[...asset.imageUrls, placeholder]}
                    totalCount={asset.amount}
                    listingCount={
                      orders[parseInt(BigInt(asset.tokenId).toString())]
                        ?.length || 0
                    }
                    className="rounded overflow-hidden"
                  />
                </Link>
              );
            })}
          </div>
        </LayoutContent>
      )}
    </>
  );
}

const LoadingState = () => {
  return (
    <LayoutContent className="gap-y-[52px] select-none h-full overflow-hidden">
      <Skeleton className="min-h-10 w-full rounded" />
      <div className="grid grid-cols-2 gap-4 place-items-center">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton
            key={index}
            className="min-h-[168px] w-full rounded border-2 border-transparent"
          />
        ))}
      </div>
      <Skeleton className="min-h-10 w-full rounded" />
    </LayoutContent>
  );
};

const EmptyState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Empty
        title="No assets owned for this collection."
        icon="inventory"
        className="h-full"
      />
    </LayoutContent>
  );
};
