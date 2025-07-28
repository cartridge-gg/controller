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
  CollectibleItems,
  CollectibleItem,
  TagIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import {
  AllowArray,
  cairo,
  Call,
  CallData,
  constants,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
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
import { useMarketplace } from "@/hooks/marketplace";
import { OrderModel } from "@cartridge/marketplace";
import { useExecute } from "@/hooks/execute";
import { toast } from "sonner";
import { useAccount, useUsername } from "@/hooks/account";
import { erc20Metadata } from "@cartridge/presets";

const OFFSET = 10;

export function CollectibleAsset() {
  const account = useAccount();
  const address = account?.address || "";
  const { chainId, namespace, project, controller } = useConnection();
  const [searchParams] = useSearchParams();
  const [cap, setCap] = useState(OFFSET);
  const theme = useControllerTheme();
  const { editions } = useArcade();
  const { selfOrders, tokenOrders, provider, removeOrder } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const { execute } = useExecute();

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

  const isOwner = useMemo(() => {
    if (!address || !ownership?.accountAddress) return false;
    return BigInt(ownership.accountAddress) === BigInt(address);
  }, [ownership, address]);

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

  const handleUnlist = useCallback(async () => {
    if (!contractAddress || !asset || !selfOrders) return;
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

      const res = await execute(calls);
      if (res?.transaction_hash) {
        await controller?.provider?.waitForTransaction(res.transaction_hash, {
          retryInterval: 100,
          successStates: [
            TransactionExecutionStatus.SUCCEEDED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        });

        toast.success(`Asset unlisted successfully`);
      }

      // Removing the order optimistically
      selfOrders.forEach((order) => {
        removeOrder(order);
      });
    } catch (error) {
      console.error(error);
      toast.error(`Failed to unlist asset(s)`);
    } finally {
      setLoading(false);
    }
  }, [
    contractAddress,
    asset,
    chainId,
    provider,
    controller,
    removeOrder,
    selfOrders,
    execute,
  ]);

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
                    {selfOrders.map((order) => (
                      <Item key={order.id} order={order} self={address} />
                    ))}
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
            <div className="flex gap-3 w-full">
              <Button
                variant="secondary"
                isLoading={loading}
                onClick={handleUnlist}
                className={cn(
                  "w-full gap-2 text-destructive-100",
                  (selfOrders.length === 0 || !isOwner) && "hidden",
                )}
              >
                <TagIcon variant="solid" size="sm" />
                Unlist
              </Button>
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  (selfOrders.length > 0 || !isOwner) && "hidden",
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
                  (tokenOrders.length === selfOrders.length || isOwner) &&
                    "hidden",
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

const Item = ({ order, self }: { order: OrderModel; self: string }) => {
  const { username } = useUsername({ address: order.owner });

  const isOwner = useMemo(() => {
    if (!self || !order.owner) return false;
    return BigInt(order.owner) === BigInt(self);
  }, [self, order]);

  const token = useMemo(
    () =>
      erc20Metadata.find(
        (token) => BigInt(token.l2_token_address) === BigInt(order.currency),
      ),
    [order.currency],
  );
  const price = useMemo(() => {
    if (!token) return "0";
    return Math.floor(Number(order.price) / 10 ** token.decimals);
  }, [order.price, token]);
  const expiration = useMemo(() => {
    const date = new Date(Number(order.expiration) * 1000);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}d`;
  }, [order.expiration]);

  return (
    <CollectibleItem
      owner={username}
      quantity={order.quantity}
      price={price.toString()}
      expiration={expiration}
      action={isOwner ? "unlist" : "purchase"}
      onActionClick={() => {}}
    />
  );
};

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
