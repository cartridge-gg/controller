import {
  Link,
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
  CollectibleItems,
  CollectibleItem,
  TagIcon,
  Spinner,
  Thumbnail,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import {
  AllowArray,
  cairo,
  Call,
  CallData,
  constants,
  getChecksumAddress,
} from "starknet";
import { useConnection, useControllerTheme } from "@/hooks/connection";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CollectionHeader } from "./header";
import placeholder from "/placeholder.svg?url";
import { useExplorer } from "@starknet-react/core";
import { CardProps, useTraceabilities } from "@/hooks/traceabilities";
import { OrderModel } from "@cartridge/arcade";
import { useMarketplace } from "@/hooks/marketplace";
import { createExecuteUrl } from "@/utils/connection/execute";
import { useToast } from "@/context/toast";
import { useAccount, useUsername } from "@/hooks/account";
import { erc20Metadata } from "@cartridge/presets";
import { useNavigation } from "@/context";
import makeBlockie from "ethereum-blockies-base64";
import { useCollection } from "@/hooks/collection";

const OFFSET = 10;

export function CollectibleAsset() {
  const account = useAccount();
  const address = account?.address || "";
  const { chainId } = useConnection();
  const explorer = useExplorer();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [cap, setCap] = useState(OFFSET);
  const theme = useControllerTheme();
  const { selfOrders, tokenOrders, provider } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const { navigate } = useNavigation();
  const { toast } = useToast();

  const purchaseView = useMemo(
    () => searchParams.get("purchaseView") === "true",
    [searchParams],
  );

  const orders = useMemo(() => {
    if (!purchaseView) return selfOrders;
    return tokenOrders.filter(
      (order) => BigInt(order.owner) !== BigInt(address),
    );
  }, [purchaseView, selfOrders, tokenOrders, address]);

  const mainOrder = useMemo(() => {
    if (!orders.length) return undefined;
    const main = orders.find((order) => order.quantity === 1);
    if (!main) return undefined;
    return main;
  }, [orders]);

  const { address: contractAddress, tokenId } = useParams();
  const {
    collection: collectible,
    assets,
    status: collectibleStatus,
  } = useCollection({
    contractAddress: contractAddress,
    tokenIds: tokenId ? [tokenId] : [],
  });

  const { traceabilities: data, status: traceabilitiesStatus } =
    useTraceabilities({
      contractAddress: contractAddress ?? "",
      tokenId: tokenId ?? "",
    });

  const asset = useMemo(() => {
    return assets?.[0];
  }, [assets]);

  const title = useMemo(() => {
    if (!asset) return "";
    return asset.name;
  }, [asset]);

  const remaining = useMemo(() => {
    if (!asset) return 0;
    return (
      (asset.amount || 0) -
      selfOrders.reduce((acc, order) => acc + order.quantity, 0)
    );
  }, [asset, selfOrders]);

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

  const { orderAmount, orderImage } = useMemo(() => {
    if (!mainOrder) return { orderAmount: undefined, orderImage: undefined };
    const token = erc20Metadata.find(
      (token) =>
        BigInt(token.l2_token_address) === BigInt(mainOrder.currency as string),
    );
    if (!token) return { orderAmount: undefined, orderImage: undefined };
    const amount = Math.floor(Number(mainOrder.price) / 10 ** token.decimals);
    return { orderAmount: amount, orderImage: token.logo_url };
  }, [mainOrder]);

  const to = useCallback(
    (transactionHash: string) => {
      return explorer.transaction(transactionHash);
    },
    [explorer],
  );

  const handleUnlist = useCallback(
    async (orderId?: number) => {
      if (!contractAddress || !asset || !selfOrders) return;
      setLoading(true);
      try {
        const marketplaceAddress: string = provider.manifest.contracts.find(
          (c: { tag: string }) => c.tag?.includes("Marketplace"),
        )?.address;
        const orderIds =
          orderId === undefined
            ? selfOrders.map((order) => order.id)
            : [orderId];
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
        // Create execute URL with returnTo parameter pointing back to current page
        const executeUrl = createExecuteUrl(calls);

        // Navigate to execute screen with returnTo parameter to come back to current page
        const currentPath = `${location.pathname}${location.search}`;
        const executeUrlWithReturn = `${executeUrl}&returnTo=${encodeURIComponent(currentPath)}`;
        navigate(executeUrlWithReturn);
      } catch (error) {
        console.error(error);
        toast.error(`Failed to unlist asset(s)`);
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, asset, provider, selfOrders, navigate, location, toast],
  );

  const status = useMemo(() => {
    if (collectibleStatus === "error" || traceabilitiesStatus === "error")
      return "error";
    if (collectibleStatus === "loading" || traceabilitiesStatus === "loading")
      return "loading";
    return "success";
  }, [collectibleStatus, traceabilitiesStatus]);

  return (
    <>
      {status === "loading" || !collectible || !asset ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className="pb-0 overflow-hidden">
            <CollectionHeader
              image={theme?.icon}
              title={title}
              subtitle={collectible.name}
              count={Number(asset.amount)}
              listingCount={
                Number(asset.amount) - remaining > 0
                  ? Number(asset.amount) - remaining
                  : undefined
              }
            />
            <div
              className="flex flex-col gap-6 overflow-scroll relative"
              style={{ scrollbarWidth: "none" }}
            >
              <CollectiblePreview
                images={[...asset.imageUrls, placeholder]}
                size="lg"
                className="w-full self-center"
              />
              {!!orderAmount && (
                <div className="absolute top-[-2px] right-2">
                  <Price amount={orderAmount} image={orderImage} />
                </div>
              )}
              <CollectibleTabs
                order={["details", "items", "activity"]}
                className="pb-6"
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
                    address={collectible.address}
                    tokenId={asset.tokenId}
                    standard={collectible.type}
                    // owner={username}  // Owner hidden for 1155 since there are several
                  />
                </TabsContent>
                <TabsContent
                  className="m-0 p-0 flex flex-col gap-y-4"
                  value="items"
                >
                  {properties.length > 0 && (
                    <CollectibleProperties properties={properties} />
                  )}
                  <CollectibleItems>
                    {orders.map((order) => (
                      <Item
                        key={order.id}
                        order={order}
                        self={address}
                        handleUnlist={handleUnlist}
                        purchaseView={!!purchaseView}
                      />
                    ))}
                    {remaining > 0 && !purchaseView && (
                      <Item
                        order={{
                          owner: address,
                          quantity: remaining,
                        }}
                        self={address}
                      />
                    )}
                  </CollectibleItems>
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
                        collectibleImage={
                          asset.imageUrls[0] ||
                          collectible.imageUrls[0] ||
                          placeholder
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
              "relative flex flex-col items-center justify-center gap-y-4 bg-background pt-4",
            )}
          >
            <div className="flex gap-3 w-full">
              <Button
                variant="secondary"
                isLoading={loading}
                onClick={() => handleUnlist()}
                className={cn(
                  "w-full gap-2 text-destructive-100",
                  (selfOrders.length === 0 || purchaseView) && "hidden",
                )}
              >
                <TagIcon variant="solid" size="sm" />
                Unlist
              </Button>
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  (selfOrders.length > 0 || purchaseView) && "hidden",
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
                  (orders.length === 0 || !purchaseView) && "hidden",
                  !mainOrder && "opacity-50 cursor-default pointer-events-none",
                )}
                to={`purchase?${searchParams.toString()}&orders=${mainOrder?.id}`}
              >
                <Button
                  isLoading={loading}
                  variant="primary"
                  className="w-full gap-2"
                  disabled={!mainOrder}
                >
                  Purchase
                </Button>
              </Link>
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  purchaseView && "hidden",
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

const Item = ({
  order,
  self,
  handleUnlist,
  purchaseView,
}: {
  order:
    | OrderModel
    | {
        owner: string;
        quantity: number;
        id?: number;
        price?: string;
        currency?: string;
        expiration?: string;
      };
  self: string;
  handleUnlist?: (orderId?: number) => void;
  purchaseView?: boolean;
}) => {
  const { username } = useUsername({
    address: `0x${BigInt(order.owner).toString(16)}`,
  });

  const isOwner = useMemo(() => {
    if (!self || !order.owner) return false;
    return BigInt(order.owner) === BigInt(self);
  }, [self, order]);

  const token = useMemo(() => {
    if (!order.currency) return undefined;
    return erc20Metadata.find(
      (token) =>
        BigInt(token.l2_token_address) === BigInt(order.currency as string),
    );
  }, [order.currency]);

  const price = useMemo(() => {
    if (!token) return undefined;
    return Math.floor(Number(order.price) / 10 ** token.decimals).toString();
  }, [order.price, token]);

  const expiration = useMemo(() => {
    if (!order.expiration) return undefined;
    const date = new Date(Number(order.expiration) * 1000);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}d`;
  }, [order.expiration]);

  const [searchParams] = useSearchParams();

  if (purchaseView) {
    const params = new URLSearchParams(searchParams);
    params.set("orders", order.id?.toString() ?? "");
    return (
      <Link to={`purchase?${params.toString()}`}>
        <CollectibleItem
          owner={username}
          quantity={order.quantity}
          price={price}
          logo={
            token?.logo_url ||
            makeBlockie(getChecksumAddress(order.currency || ""))
          }
          expiration={expiration}
          action="purchase"
          onActionClick={() => {}}
        />
      </Link>
    );
  }

  if (!handleUnlist) {
    return (
      <Link to={`list?${searchParams.toString()}`}>
        <CollectibleItem
          owner={username}
          quantity={order.quantity}
          price={price}
          logo={token?.logo_url || ""}
          expiration={expiration}
          action="list"
          onActionClick={() => {}}
        />
      </Link>
    );
  }

  if (isOwner) {
    return (
      <CollectibleItem
        owner={username}
        quantity={order.quantity}
        price={price}
        logo={token?.logo_url || ""}
        expiration={expiration}
        action="unlist"
        onActionClick={() => handleUnlist(order.id)}
      />
    );
  }

  return (
    <Link to={`purchase?${searchParams.toString()}`}>
      <CollectibleItem
        owner={username}
        quantity={order.quantity}
        price={price}
        logo={token?.logo_url || ""}
        expiration={expiration}
        action="purchase"
        onActionClick={() => {}}
      />
    </Link>
  );
};

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
