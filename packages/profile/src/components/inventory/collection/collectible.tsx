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
  LayoutHeader,
  CollectibleCard,
  Skeleton,
  Empty,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useMemo } from "react";
import placeholder from "/public/placeholder.svg";
import { CollectionHeader } from "./header";
import { useConnection, useTheme } from "#hooks/context.js";
import { useCollectible } from "#hooks/collectible.js";
import { useArcade } from "#hooks/arcade.js";
import { EditionModel, GameModel } from "@cartridge/arcade";

export function Collectible() {
  const { games, editions } = useArcade();
  const { address: contractAddress, tokenId } = useParams();
  const { closable, visitor, project, namespace } = useConnection();
  const { theme } = useTheme();

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
  const [searchParams] = useSearchParams();
  const { collectible, assets, status } = useCollectible({ contractAddress });

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  if (tokenId || location.pathname.includes("/send")) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        className="hidden"
        onBack={closable || visitor ? undefined : handleBack}
      />
      {status === "loading" || !collectible || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className={cn("p-6 flex flex-col gap-y-4")}>
            <CollectionHeader
              image={edition?.properties.icon || theme?.icon}
              title={collectible.name}
              subtitle={game?.name || theme?.name || "---"}
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
                      image={asset.imageUrl || placeholder}
                      totalCount={asset.amount}
                      className="rounded overflow-hidden"
                    />
                  </Link>
                );
              })}
            </div>
          </LayoutContent>
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
