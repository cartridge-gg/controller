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
  Button,
  CollectiblePreview,
  Property,
  CollectibleProperties,
  CollectibleDetails,
  LayoutFooter,
  cn,
  Skeleton,
  Empty,
  CollectibleTabs,
  TabsContent,
  PlusIcon,
  TraceabilityCollectibleCard,
} from "@cartridge/ui-next";
import { constants } from "starknet";
import { useConnection, useTheme } from "#hooks/context";
import { useCallback, useMemo, useState } from "react";
import { useCollection } from "#hooks/collection";
import { CollectionHeader } from "./header";
import placeholder from "/public/placeholder.svg";
import { formatName } from "../helper";
import { VoyagerUrl } from "@cartridge/utils";
import { CardProps, useTraceabilities } from "#hooks/traceabilities.js";
import { useArcade } from "#hooks/arcade.js";
import { EditionModel } from "@bal7hazar/arcade-sdk";
import { useOwnership } from "#hooks/ownerships.js";
import { useUsername } from "#hooks/username.js";

const OFFSET = 10;

export function CollectionAsset() {
  const { chainId, visitor, namespace, project } = useConnection();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [cap, setCap] = useState(OFFSET);
  const { theme } = useTheme();
  const { editions } = useArcade();

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) =>
        edition.namespace === namespace && edition.config.project === project,
    );
  }, [editions, project, namespace]);

  const { address: contractAddress, tokenId } = useParams();
  const {
    collection,
    assets,
    status: collectionStatus,
  } = useCollection({
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
    return formatName(asset.name, asset.tokenId);
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

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  const { events, dates } = useMemo(() => {
    const filteredData = data.slice(0, cap);
    return {
      events: filteredData,
      dates: [...new Set(filteredData.map((event) => event.date))],
    };
  }, [data, cap, contractAddress]);

  const to = useCallback((transactionHash: string) => {
    return VoyagerUrl(constants.StarknetChainId.SN_MAIN).transaction(
      transactionHash,
    );
  }, []);

  const status = useMemo(() => {
    if (
      collectionStatus === "error" ||
      traceabilitiesStatus === "error" ||
      ownershipStatus === "error"
    )
      return "error";
    if (
      collectionStatus === "loading" &&
      traceabilitiesStatus === "loading" &&
      ownershipStatus === "loading"
    )
      return "loading";
    return "success";
  }, [collectionStatus, traceabilitiesStatus, ownershipStatus]);

  if (location.pathname.includes("/send")) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      <LayoutHeader className="hidden" onBack={handleBack} />

      {status === "loading" || !collection || !asset ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className="p-6 pb-0 flex flex-col gap-6 overflow-hidden">
            <CollectionHeader
              image={edition?.properties.icon || theme?.icon}
              title={title}
              subtitle={collection.name}
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
                    address={collection.address}
                    tokenId={asset.tokenId}
                    standard={collection.type}
                    owner={username}
                  />
                </TabsContent>
                <TabsContent
                  className="m-0 p-0 flex flex-col gap-y-4"
                  value="activity"
                >
                  {dates.map((current) => {
                    return (
                      <div className="flex flex-col gap-2" key={current}>
                        <p className="py-3 text-xs font-semibold text-foreground-400 tracking-wider">
                          {current}
                        </p>
                        {events
                          .filter(({ date }) => date === current)
                          .map((props: CardProps, index: number) => (
                            <Link
                              key={`${index}-${props.key}`}
                              to={to(props.transactionHash)}
                              target="_blank"
                            >
                              <TraceabilityCollectibleCard
                                from={props.from}
                                to={props.to}
                                image={props.image}
                                action={props.action}
                              />
                            </Link>
                          ))}
                      </div>
                    );
                  })}
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
              visitor && "hidden",
            )}
          >
            <Link
              className="flex items-center justify-center gap-x-4 w-full"
              to={`send?${searchParams.toString()}`}
            >
              <Button className="h-10 w-full">Send</Button>
            </Link>
          </LayoutFooter>
        </>
      )}
    </LayoutContainer>
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
