import { Link, useParams, useSearchParams } from "react-router-dom";
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
  TagIcon,
  Token,
  Spinner,
  Thumbnail,
} from "@cartridge/ui";

import { cn } from "@cartridge/ui/utils";
import { AllowArray, cairo, Call, CallData, constants } from "starknet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCollection } from "@/hooks/collection";
import { CollectionHeader } from "./header";
import placeholder from "/placeholder.svg?url";
import { useExplorer } from "@starknet-react/core";
import { CardProps, useTraceabilities } from "@/hooks/traceabilities";
import { useUsername } from "@/hooks/username";
import { useMarketplace } from "@/hooks/marketplace";
import { useToast } from "@/context/toast";
import { useTokens } from "@/hooks/token";
import { useAccount } from "@/hooks/account";
import { useConnection, useControllerTheme } from "@/hooks/connection";
import { useNavigation } from "@/context/navigation";
import { createExecuteUrl } from "@/utils/connection/execute";

const OFFSET = 10;

export function CollectionAsset() {
  const { chainId } = useConnection();
  const account = useAccount();
  const explorer = useExplorer();
  const address = account?.address || "";
  const [searchParams, setSearchParams] = useSearchParams();
  const { navigate } = useNavigation();
  const [cap, setCap] = useState(OFFSET);
  const theme = useControllerTheme();
  const { tokens } = useTokens();
  const { provider, selfOrders, order, setAmount } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { address: contractAddress, tokenId } = useParams();
  const {
    collection,
    assets,
    status: collectionStatus,
  } = useCollection({
    contractAddress: contractAddress,
    tokenIds: tokenId ? [tokenId] : [],
  });

  const { traceabilities: data, status: traceabilitiesStatus } =
    useTraceabilities({
      contractAddress: contractAddress ?? "",
      tokenId: tokenId ?? "",
    });

  const isListed = useMemo(() => {
    if (!order) return false;
    return BigInt(order.tokenId) === BigInt(tokenId ?? "");
  }, [order, tokenId]);

  const asset = useMemo(() => {
    return assets?.[0];
  }, [assets]);

  const { username } = useUsername({
    address: asset?.owner ?? "",
  });

  const isOwner = useMemo(() => {
    if (!address || !asset?.owner) return false;
    return BigInt(asset.owner) === BigInt(address);
  }, [asset, address]);

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

  const token: Token | undefined = useMemo(() => {
    if (!order) return;
    return tokens.find(
      (token) => BigInt(token.metadata.address) === BigInt(order.currency),
    );
  }, [tokens, order]);

  const amount = useMemo(() => {
    if (!order) return 0;
    return Number(order?.price) / Math.pow(10, token?.metadata.decimals || 0);
  }, [order, token]);

  const handleUnlist = useCallback(async () => {
    if (!contractAddress || !asset || !isListed || !order || !isOwner) return;
    setLoading(true);
    try {
      const marketplaceAddress: string = provider.manifest.contracts.find(
        (c: { tag: string }) => c.tag?.includes("Marketplace"),
      )?.address;
      const orderIds = selfOrders.map((order) => order.id);
      const calls: AllowArray<Call> = [
        ...orderIds.map((orderId) => ({
          contractAddress: marketplaceAddress,
          entrypoint: "cancel",
          calldata: CallData.compile({
            orderId: orderId,
            collection: contractAddress,
            tokenId: cairo.uint256(asset.tokenId),
          }),
        })),
      ];

      // Create execute URL with returnTo parameter pointing back to inventory
      const executeUrl = createExecuteUrl(calls);

      // Navigate to execute screen with returnTo parameter to come back to inventory
      const currentPath = window.location.pathname + window.location.search;
      const executeUrlWithReturn = `${executeUrl}&returnTo=${encodeURIComponent(currentPath)}`;
      navigate(executeUrlWithReturn);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to unlist asset(s)`);
    } finally {
      setLoading(false);
    }
  }, [
    contractAddress,
    asset,
    isListed,
    provider,
    order,
    isOwner,
    navigate,
    selfOrders,
    toast,
  ]);

  const events = useMemo(() => {
    return data.slice(0, cap);
  }, [data, cap]);

  const to = useCallback(
    (transactionHash: string) => {
      return explorer.transaction(transactionHash);
    },
    [explorer],
  );

  const status = useMemo(() => {
    if (collectionStatus === "error" || traceabilitiesStatus === "error")
      return "error";
    if (collectionStatus === "loading" && traceabilitiesStatus === "loading")
      return "loading";
    return "success";
  }, [collectionStatus, traceabilitiesStatus]);

  useEffect(() => {
    if (!order) return;
    setAmount(Number(order.price));
    const params = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...params,
      orders: order.id.toString(),
    });
  }, [order, searchParams, setAmount, setSearchParams]);

  return (
    <>
      {status === "loading" || !collection || !asset ? (
        <LoadingState />
      ) : status === "error" || (isListed && !token) ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent
            className={cn("overflow-hidden", (isListed || isOwner) && "pb-0")}
          >
            <CollectionHeader
              image={theme?.icon}
              title={title}
              subtitle={collection.name}
              expiration={
                isListed && selfOrders.length > 0
                  ? selfOrders[0].expiration
                  : undefined
              }
              listingCount={isListed && isOwner ? selfOrders.length : undefined}
            />
            <div
              className="flex flex-col gap-6 overflow-scroll relative"
              style={{ scrollbarWidth: "none" }}
            >
              <CollectiblePreview
                images={[
                  ...asset.imageUrls,
                  ...collection.imageUrls,
                  placeholder,
                ]}
                size="lg"
                className="w-full self-center mt-0.5"
              />
              {!!order && (
                <div className="absolute top-[-2px] right-2">
                  <Price amount={amount} image={token?.metadata.image} />
                </div>
              )}
              <CollectibleTabs
                order={["details", "activity"]}
                className={cn("pb-0", isListed || (isOwner && "pb-6"))}
              >
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
                    owner={
                      username ||
                      asset.owner.slice(0, 6) + "..." + asset.owner.slice(-4)
                    }
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
                        username={props.username || ""}
                        timestamp={props.timestamp}
                        category={props.category}
                        amount={props.amount}
                        collectibleImage={
                          asset.imageUrls[0] ||
                          collection.imageUrls[0] ||
                          placeholder
                        }
                        collectibleName={title || collection.name}
                        currencyImage={props.currencyImage}
                      />
                    </Link>
                  ))}
                  <Button
                    variant="secondary"
                    className={cn(
                      "text-foreground-300 hover:text-foreground-200 normal-case text-sm font-medium tracking-normal font-sans",
                      cap >= data.length && "hidden",
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
              "relative flex flex-col items-center justify-center gap-y-4 bg-background-100 pt-4 select-none",
              !isListed && !isOwner && "hidden",
            )}
          >
            <div className="flex gap-3 w-full">
              <Button
                variant="secondary"
                isLoading={loading}
                onClick={handleUnlist}
                className={cn(
                  "w-full gap-2 text-destructive-100",
                  (!isListed || !isOwner) && "hidden",
                )}
              >
                <TagIcon variant="solid" size="sm" />
                Unlist
              </Button>
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  (isListed || !isOwner) && "hidden",
                )}
                to={`list?${searchParams.toString()}`}
              >
                <Button variant="secondary" className={cn("w-full gap-2")}>
                  <TagIcon variant="solid" size="sm" />
                  List
                </Button>
              </Link>
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  (!isListed || isOwner) && "hidden",
                )}
                to={`purchase?${searchParams.toString()}`}
              >
                <Button
                  isLoading={loading}
                  variant="primary"
                  className="w-full gap-2"
                >
                  Purchase
                </Button>
              </Link>
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  !isOwner && "hidden",
                )}
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
    </>
  );
}

const Price = ({ amount, image }: { amount?: number; image?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef, amount, image]);

  return (
    <div
      ref={containerRef}
      className="relative w-fit rounded overflow-hidden flex flex-col select-none"
    >
      <div className="px-2.5 pt-[5px] pb-[3px] w-full bg-primary-100 flex items-center justify-center">
        {amount === undefined ? (
          <Spinner size="sm" />
        ) : (
          <div className="flex gap-1 items-center">
            <Thumbnail
              icon={image}
              rounded
              size="xs"
              className="bg-translucent-dark-100"
            />
            <p className="text-sm font-medium text-spacer-100">{`${amount.toLocaleString()}`}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between w-full">
        <div
          className="h-0 w-0 border-t-[8px] border-t-primary-100 border-r-transparent"
          style={{ borderRightWidth: `${width / 2}px` }}
        />
        <div
          className="h-0 w-0 border-t-[8px] border-t-primary-100 border-l-transparent"
          style={{ borderLeftWidth: `${width / 2}px` }}
        />
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <LayoutContent className="select-none h-full overflow-hidden">
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
