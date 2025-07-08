import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutContainer,
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
import { NavigationHeader } from "@/components";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useMemo } from "react";
import { useCollection } from "#profile/hooks/collection";
import placeholder from "/public/placeholder.svg";
import { CollectionHeader } from "./header";
import { useConnection } from "@/hooks/connection";
import { useControllerTheme } from "@/hooks/connection";
import { useArcade } from "#profile/hooks/arcade.js";
import { EditionModel, GameModel } from "@cartridge/arcade";

export function Collection() {
  const { games, editions } = useArcade();
  const { address: contractAddress, tokenId } = useParams();
  const { closeModal } = useConnection();
  const { project, namespace } = useConnection();
  const theme = useControllerTheme();
  const orders: { [key: string]: any[] } = {}; // TODO: Get collection orders from marketplace

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) => edition.config.project === project,
    );
  }, [editions, project, namespace]);

  const game: GameModel | undefined = useMemo(() => {
    return Object.values(games).find((game) => game.id === edition?.gameId);
  }, [games, edition]);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenIds = searchParams.getAll("tokenIds");
  const { collection, assets, status } = useCollection({ contractAddress });

  const selection = useMemo(() => {
    return tokenIds.length > 0;
  }, [tokenIds]);

  const allUnlisted = useMemo(() => {
    if (tokenIds.length === 0) return false;
    return tokenIds.every(
      (tokenId) =>
        !orders[BigInt(tokenId).toString()] ||
        !orders[BigInt(tokenId).toString()].length,
    );
  }, [orders, tokenIds]);

  const handleSelectAll = useCallback(() => {
    if (!assets) return;
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...params,
      tokenIds: tokenIds.length ? [] : assets.map((asset) => asset.tokenId),
    });
  }, [assets, tokenIds, searchParams, setSearchParams]);

  const handleSelect = useCallback(
    (tokenId: string) => {
      const isSelected = tokenIds.includes(tokenId);
      const params = Object.fromEntries(searchParams.entries());
      setSearchParams({
        ...params,
        tokenIds: isSelected
          ? tokenIds.filter((id) => id !== tokenId)
          : [...tokenIds, tokenId],
      });
    },
    [tokenIds, searchParams, setSearchParams],
  );

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  if (
    tokenId ||
    location.pathname.includes("/send") ||
    location.pathname.includes("/list") ||
    location.pathname.includes("/purchase")
  ) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      <NavigationHeader
        className="hidden"
        // onClose={closable ? closeModal : undefined}
        // onBack={closable ? undefined : handleBack}
      />
      {status === "loading" || !collection || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className={cn("p-6 flex flex-col gap-y-4")}>
            <CollectionHeader
              image={edition?.properties.icon || theme?.icon}
              title={collection.name}
              subtitle={game?.name || theme?.name || "---"}
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
                {selection ? `${tokenIds.length} Selected` : "Select all"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 place-items-center">
              {assets.map((asset) => {
                const isSelected = tokenIds.includes(asset.tokenId);
                const tokenId = BigInt(asset.tokenId).toString();
                const listingCount = orders[tokenId]?.length || undefined;
                return (
                  <Link
                    className="w-full select-none"
                    draggable={false}
                    to={`token/${asset.tokenId}?${searchParams.toString()}`}
                    state={location.state}
                    key={asset.tokenId}
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      if (selection) {
                        e.preventDefault();
                        handleSelect(asset.tokenId);
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
                      image={asset.imageUrl || placeholder}
                      selectable
                      selected={isSelected}
                      listingCount={listingCount}
                      onSelect={() => handleSelect(asset.tokenId)}
                      className="rounded overflow-hidden"
                    />
                  </Link>
                );
              })}
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
                className="flex items-center justify-center gap-x-4 w-full"
                to={allUnlisted ? `list?${searchParams.toString()}` : ""}
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
                to={`send?${searchParams.toString()}`}
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
    </LayoutContainer>
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
