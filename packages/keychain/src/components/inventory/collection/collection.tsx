import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutContent,
  LayoutFooter,
  Button,
  CheckboxIcon,
  CollectibleCard,
  Skeleton,
  Empty,
  PaperPlaneIcon,
  TagIcon,
} from "@cartridge/ui";

import { cn } from "@cartridge/ui/utils";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useCollection, Asset } from "@/hooks/collection";
import placeholder from "/placeholder.svg?url";
import { CollectionHeader } from "./header";
import { useControllerTheme } from "@/hooks/connection";
import { useMarketplace } from "@/hooks/marketplace";
import { useIntersectionObserver } from "@/hooks/intersection";

export function Collection() {
  const { address: contractAddress } = useParams();
  const { collectionOrders: orders } = useMarketplace();
  const theme = useControllerTheme();

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { collection, assets, status } = useCollection({ contractAddress });

  // Use local state for selection instead of URL parameters
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);

  // Initialize selection from URL parameters if present (for deep linking)
  useEffect(() => {
    const urlTokenIds = searchParams.getAll("tokenIds");
    if (urlTokenIds.length > 0) {
      setSelectedTokenIds(urlTokenIds);
    }
  }, [searchParams]);

  const selection = useMemo(() => {
    return selectedTokenIds.length > 0;
  }, [selectedTokenIds]);

  const allUnlisted = useMemo(() => {
    if (selectedTokenIds.length === 0) return false;
    return selectedTokenIds.every(
      (tokenId) =>
        !orders[BigInt(tokenId).toString()] ||
        !orders[BigInt(tokenId).toString()].length,
    );
  }, [orders, selectedTokenIds]);

  const handleSelectAll = useCallback(() => {
    if (!assets) return;
    setSelectedTokenIds(
      selectedTokenIds.length ? [] : assets.map((asset) => asset.tokenId),
    );
  }, [assets, selectedTokenIds]);

  const handleSelect = useCallback(
    (tokenId: string) => {
      const isSelected = selectedTokenIds.includes(tokenId);
      setSelectedTokenIds(
        isSelected
          ? selectedTokenIds.filter((id) => id !== tokenId)
          : [...selectedTokenIds, tokenId],
      );
    },
    [selectedTokenIds],
  );

  // Create search params with selected tokens for navigation
  const createNavigationParams = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    // Clear existing tokenIds
    params.delete("tokenIds");
    // Add selected tokenIds
    selectedTokenIds.forEach((tokenId) => {
      params.append("tokenIds", tokenId);
    });
    return params.toString();
  }, [searchParams, selectedTokenIds]);

  return (
    <>
      {status === "loading" || !collection || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className={cn("")}>
            <CollectionHeader
              image={theme?.icon}
              title={collection.name}
              subtitle={theme?.name || "---"}
              certified
            />

            <div
              className={cn(
                "flex items-center gap-x-1.5 text-xs cursor-pointer self-start text-foreground-300",
              )}
              onClick={handleSelectAll}
            >
              <CheckboxIcon
                className={cn(selection && "text-foreground-100")}
                variant={selection ? "minus-line" : "unchecked-line"}
                size="sm"
              />
              <div>
                {selection
                  ? `${selectedTokenIds.length} Selected`
                  : "Select all"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 place-items-center">
              {assets.map((asset) => (
                <LazyAsset
                  key={asset.tokenId}
                  asset={asset}
                  isSelected={selectedTokenIds.includes(asset.tokenId)}
                  orders={orders}
                  searchParams={searchParams}
                  location={location}
                  selection={selection}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </LayoutContent>

          <LayoutFooter
            className={cn(
              "relative flex flex-col items-center justify-center gap-y-4 bg-background",
              !selection && "hidden",
            )}
          >
            <div className="flex gap-3 w-full">
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  !allUnlisted && "pointer-events-none",
                )}
                to={allUnlisted ? `list?${createNavigationParams()}` : ""}
              >
                <Button
                  variant="secondary"
                  className={cn("w-full gap-2")}
                  disabled={!allUnlisted}
                >
                  <TagIcon variant="solid" size="sm" />
                  List
                </Button>
              </Link>
              <Link
                className="flex items-center justify-center gap-x-4 w-full"
                to={`send?${createNavigationParams()}`}
              >
                <Button variant="secondary" className="w-full gap-2">
                  <PaperPlaneIcon variant="solid" size="sm" />
                  Send
                </Button>
              </Link>
            </div>
          </LayoutFooter>
        </>
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

type LazyAssetProps = {
  asset: Asset;
  isSelected: boolean;
  orders: Record<string, unknown[]>;
  searchParams: URLSearchParams;
  location: ReturnType<typeof useLocation>;
  selection: boolean;
  onSelect: (tokenId: string) => void;
};

function LazyAsset({
  asset,
  isSelected,
  orders,
  searchParams,
  location,
  selection,
  onSelect,
}: LazyAssetProps) {
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0,
    rootMargin: "200px", // Start loading 200px before the element is visible
    enabled: true,
  });

  const tokenId = BigInt(asset.tokenId).toString();
  const listingCount = orders[tokenId]?.length || undefined;

  return (
    <div ref={elementRef} className="w-full">
      {hasIntersected ? (
        <Link
          className="w-full select-none"
          draggable={false}
          to={`token/${asset.tokenId}?${searchParams.toString()}`}
          state={location.state}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (selection) {
              e.preventDefault();
              onSelect(asset.tokenId);
            }
          }}
        >
          <CollectibleCard
            title={
              asset.name.includes(
                `${parseInt(BigInt(asset.tokenId).toString())}`,
              )
                ? asset.name
                : `${asset.name} #${parseInt(BigInt(asset.tokenId).toString())}`
            }
            images={[...asset.imageUrls, placeholder]}
            selectable
            selected={isSelected}
            listingCount={listingCount}
            onSelect={() => onSelect(asset.tokenId)}
            className="rounded overflow-hidden"
          />
        </Link>
      ) : (
        <Skeleton className="min-h-[168px] w-full rounded border-2 border-transparent" />
      )}
    </div>
  );
}
