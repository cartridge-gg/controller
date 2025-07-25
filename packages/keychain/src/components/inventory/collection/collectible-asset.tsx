import {
  Link,
  Outlet,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutContent,
  Button,
  CollectiblePreview,
  Property,
  CollectibleProperties,
  CollectibleDetails,
  LayoutFooter,
  Skeleton,
  Empty,
  CollectibleTabs,
  TabsContent,
  PlusIcon,
  TraceabilityCollectibleCard,
  PaperPlaneIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { constants } from "starknet";
import { useConnection, useControllerTheme } from "@/hooks/connection";
import { useCallback, useMemo, useState } from "react";
import { useCollectible } from "@/hooks/collectible";
import { CollectionHeader } from "./header";
import placeholder from "/placeholder.svg?url";
import { VoyagerUrl } from "@cartridge/ui/utils";
import { CardProps, useTraceabilities } from "@/hooks/traceabilities";
import { useArcade } from "@/hooks/arcade";
import { EditionModel } from "@cartridge/arcade";
import { useOwnership } from "@/hooks/ownerships";
import { useUsername } from "@/hooks/username";

const OFFSET = 10;

export function CollectibleAsset() {
  const { chainId, namespace, project } = useConnection();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [cap, setCap] = useState(OFFSET);
  const theme = useControllerTheme();
  const { editions } = useArcade();

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) => edition.config.project === project,
    );
  }, [editions, project, namespace]);

  const { address: contractAddress, tokenId } = useParams();
  const {
    collectible,
    assets,
    status: collectibleStatus,
  } = useCollectible({
    contractAddress: contractAddress,
    tokenIds: tokenId ? [tokenId] : [],
  });

  const { ownership, status: ownershipStatus } = useOwnership({
    contractAddress: contractAddress ?? "",
    tokenId: tokenId ?? "",
  });

  const { traceabilities: data, status: traceabilitiesStatus } =
    useTraceabilities({
      contractAddress: contractAddress ?? "",
      tokenId: tokenId ?? "",
    });

  const { username } = useUsername({
    address: ownership?.accountAddress ?? "",
  });

  const asset = useMemo(() => {
    return assets?.[0];
  }, [assets]);

  const title = useMemo(() => {
    if (!asset) return "";
    return asset.name;
  }, [asset]);

  const properties: Property[] = useMemo(() => {
    if (!asset) return [];
    return asset.attributes
      .filter((a) => !!(a.trait_type || a.trait) && !!a.value)
      .map((attribute) => ({
        name: (attribute.trait_type ?? attribute.trait) as string,
        value: attribute.value as string | number | null | undefined,
      }));
  }, [asset]);

  const { events, dates } = useMemo(() => {
    const filteredData = data.slice(0, cap);
    return {
      events: filteredData,
      dates: [...new Set(filteredData.map((event) => event.timestamp))],
    };
  }, [data, cap]);

  const to = useCallback((transactionHash: string) => {
    return VoyagerUrl(constants.StarknetChainId.SN_MAIN).transaction(
      transactionHash,
    );
  }, []);

  const status = useMemo(() => {
    if (
      collectibleStatus === "error" ||
      traceabilitiesStatus === "error" ||
      ownershipStatus === "error"
    )
      return "error";
    if (
      collectibleStatus === "loading" ||
      traceabilitiesStatus === "loading" ||
      ownershipStatus === "loading"
    )
      return "loading";
    return "success";
  }, [collectibleStatus, traceabilitiesStatus, ownershipStatus]);

  if (location.pathname.includes("/send")) {
    return <Outlet />;
  }

  return (
    <>
      {status === "loading" || !collectible || !asset ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className="p-6 pb-0 flex flex-col gap-6 overflow-hidden">
            <CollectionHeader
              image={edition?.properties.icon || theme?.icon}
              title={title}
              subtitle={collectible.name}
              count={Number(asset.amount)}
            />
            <div
              className="flex flex-col gap-6 overflow-scroll relative"
              style={{ scrollbarWidth: "none" }}
            >
              <CollectiblePreview
                image={asset.imageUrl || placeholder}
                size="lg"
                className="w-full self-center"
              />
              <CollectibleTabs order={["details", "activity"]} className="pb-6">
                <TabsContent
                  className="m-0 p-0 flex flex-col gap-y-4"
                  value="details"
                >
                  {properties.length > 0 && (
                    <CollectibleProperties properties={properties} />
                  )}
                  <CollectibleDetails
                    chainId={chainId as constants.StarknetChainId}
                    address={collectible.address}
                    tokenId={asset.tokenId}
                    standard={collectible.type}
                    owner={username}
                  />
                </TabsContent>
                <TabsContent
                  className="m-0 p-0 flex flex-col gap-px"
                  value="activity"
                >
                  {events.map((props: CardProps, index: number) => (
                    <Link
                      key={`${index}-${props.key}`}
                      to={to(props.transactionHash)}
                      target="_blank"
                    >
                      <TraceabilityCollectibleCard
                        username={props.username}
                        timestamp={props.timestamp}
                        category={props.category}
                        collectibleImage={
                          asset.imageUrl || collectible.imageUrl || placeholder
                        }
                        collectibleName={title || collectible.name}
                        currencyImage={props.currencyImage}
                        quantity={props.amount}
                      />
                    </Link>
                  ))}
                  <Button
                    variant="secondary"
                    className={cn(
                      "text-foreground-300 hover:text-foreground-200 normal-case text-sm font-medium tracking-normal font-sans",
                      (cap >= data.length || dates.length === 0) && "hidden",
                    )}
                    onClick={() => setCap((prev) => prev + OFFSET)}
                  >
                    <PlusIcon variant="solid" size="xs" />
                    See More
                  </Button>
                </TabsContent>
              </CollectibleTabs>
            </div>
          </LayoutContent>

          <LayoutFooter
            className={cn(
              "relative flex flex-col items-center justify-center gap-y-4 bg-background pt-0",
            )}
          >
            <Link
              className="flex items-center justify-center gap-x-4 w-full"
              to={`send?${searchParams.toString()}`}
            >
              <Button className="h-10 w-full gap-2">
                <PaperPlaneIcon variant="solid" size="sm" />
                <span className="font-semibold text-base/5">Send</span>
              </Button>
            </Link>
          </LayoutFooter>
        </>
      )}
    </>
  );
}

const LoadingState = () => {
  return (
    <LayoutContent className="gap-6 select-none h-full overflow-hidden">
      <Skeleton className="min-h-10 w-full rounded" />
      <Skeleton className="min-h-[200px] w-full rounded" />
      <div className="flex flex-col gap-4 grow">
        <Skeleton className="min-h-10 w-full rounded" />
        <Skeleton className="grow w-full rounded" />
      </div>
    </LayoutContent>
  );
};

const EmptyState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Empty
        title="No information found for this asset."
        icon="inventory"
        className="h-full"
      />
    </LayoutContent>
  );
};
