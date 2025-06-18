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
  ThumbnailCollectible,
  Select,
  TokenSelectHeader,
  SelectContent,
  SelectItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  InfoIcon,
} from "@cartridge/ui";

import { cn, useCountervalue } from "@cartridge/ui/utils";
import {
  AllowArray,
  cairo,
  Call,
  CallData,
  constants,
  getChecksumAddress,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { useConnection, useTheme } from "#hooks/context";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCollection } from "#hooks/collection";
import { CollectionHeader } from "./header";
import placeholder from "/public/placeholder.svg";
import { VoyagerUrl } from "@cartridge/ui/utils";
import { CardProps, useTraceabilities } from "#hooks/traceabilities.js";
import { useArcade } from "#hooks/arcade.js";
import { EditionModel } from "@cartridge/arcade";
import { useOwnership } from "#hooks/ownerships.js";
import { useUsername } from "#hooks/username.js";
import { useMarketplace } from "#hooks/marketplace.js";
import { toast } from "sonner";
import { useTokens } from "#hooks/token";
import { useAccount } from "#hooks/account";

const OFFSET = 10;

export function CollectionAsset() {
  const {
    chainId,
    namespace,
    project,
    parent,
    provider: mainProvider,
  } = useConnection();
  const { address } = useAccount();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [cap, setCap] = useState(OFFSET);
  const { theme } = useTheme();
  const { editions } = useArcade();
  const { tokens } = useTokens();
  const {
    isListed,
    provider,
    selfOrders,
    order,
    removeOrder,
    marketplaceFee,
    royaltyFee,
    setAmount,
  } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const edition: EditionModel | undefined = useMemo(() => {
    return Object.values(editions).find(
      (edition) => edition.config.project === project,
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

  const isOwner = useMemo(() => {
    return BigInt(ownership?.accountAddress || "0x0") === BigInt(address);
  }, [ownership, address]);

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

  const { total, fees } = useMemo(() => {
    const price = Number(order?.price);
    const formattedMarketplaceFee =
      marketplaceFee / Math.pow(10, token?.metadata.decimals || 0);
    const formattedRoyaltyFee =
      Number(royaltyFee) / Math.pow(10, token?.metadata.decimals || 0);
    const total = formattedMarketplaceFee + formattedRoyaltyFee;
    const fees = [
      {
        label: "Marketplace Fee",
        amount: `${formattedMarketplaceFee} ${token?.metadata.symbol}`,
        percentage: `${(price ? (marketplaceFee / price) * 100 : 0).toFixed(2)}%`,
      },
      {
        label: "Creator Royalties",
        amount: `${formattedRoyaltyFee} ${token?.metadata.symbol}`,
        percentage: `${(price ? (Number(royaltyFee) / price) * 100 : 0).toFixed(2)}%`,
      },
    ];
    return { total, fees };
  }, [marketplaceFee, royaltyFee, token]);

  const { countervalues } = useCountervalue(
    {
      tokens: [
        {
          balance: `${amount}`,
          address: token?.metadata.address || "",
        },
      ],
    },
    { enabled: !!amount && !!token },
  );

  const price: number = useMemo(() => {
    if (!countervalues) return 0;
    return countervalues[0]?.current.value || 0;
  }, [countervalues]);

  const purchaseData = useMemo(() => {
    if (!assets || !collection || !price || !token || !order || !amount)
      return {
        assets: [],
        currency: { name: "", image: "", price: 0, value: "" },
      };
    const tokens = assets.map((asset) => ({
      name: asset.name,
      image: asset.imageUrl || collection.imageUrl || placeholder,
      collection: collection.name,
    }));
    const currency = {
      name: token.metadata.symbol,
      image: token.metadata.image || "",
      price: amount,
      value: price ? `~$${price.toFixed(2)}` : "",
    };
    return { assets: tokens, currency };
  }, [assets, collection, price, token, order, amount, placeholder]);

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  const handlePurchase = useCallback(async () => {
    if (!contractAddress || !asset || !isListed || !order || isOwner) return;
    setLoading(true);
    try {
      const marketplaceAddress: string = provider.manifest.contracts.find(
        (c: { tag: string }) => c.tag?.includes("Marketplace"),
      )?.address;
      const calls: AllowArray<Call> = [
        {
          contractAddress: getChecksumAddress(order.currency),
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: marketplaceAddress,
            amount: cairo.uint256(order.price),
          }),
        },
        {
          contractAddress: marketplaceAddress,
          entrypoint: "execute",
          calldata: CallData.compile({
            orderId: order.id,
            collection: contractAddress,
            tokenId: cairo.uint256(asset.tokenId),
            assetId: cairo.uint256(asset.tokenId),
            quantity: 0, // 0 for ERC721
            royalties: true,
          }),
        },
      ];
      const res = await parent.openExecute(
        Array.isArray(calls) ? calls : [calls],
        chainId,
      );
      if (res?.transactionHash) {
        await mainProvider.waitForTransaction(res.transactionHash, {
          retryInterval: 1000,
          successStates: [
            TransactionExecutionStatus.SUCCEEDED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        });
      }
      if (res) {
        toast.success(`Asset purchased successfully`);
      }
      setValidated(false);
      // Removing the order optimistically
      removeOrder(order);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to purchase asset(s)`);
    } finally {
      setLoading(false);
    }
  }, [
    contractAddress,
    asset,
    isListed,
    chainId,
    parent,
    provider,
    mainProvider,
    order,
    isOwner,
    removeOrder,
    navigate,
    setValidated,
    searchParams,
  ]);

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
      const res = await parent.openExecute(
        Array.isArray(calls) ? calls : [calls],
        chainId,
      );
      if (res?.transactionHash) {
        await mainProvider.waitForTransaction(res.transactionHash, {
          retryInterval: 1000,
          successStates: [
            TransactionExecutionStatus.SUCCEEDED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        });
      }
      if (res) {
        toast.success(`Asset unlisted successfully`);
      }
      // Removing the order optimistically
      removeOrder(order);
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
    chainId,
    parent,
    provider,
    mainProvider,
    order,
    isOwner,
    removeOrder,
    navigate,
    searchParams,
  ]);

  const events = useMemo(() => {
    return data.slice(0, cap);
  }, [data, cap]);

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

  useEffect(() => {
    if (!order) return;
    setAmount(Number(order.price));
  }, [order, setAmount]);

  if (
    location.pathname.includes("/send") ||
    location.pathname.includes("/list")
  ) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        className="hidden"
        onBack={validated ? () => setValidated(false) : handleBack}
      />

      {status === "loading" || !collection || !asset ? (
        <LoadingState />
      ) : status === "error" || (isListed && !token) ? (
        <EmptyState />
      ) : (
        <>
          {validated ? (
            <PurchaseConfirmation {...purchaseData} />
          ) : (
            <LayoutContent className="p-6 pb-0 flex flex-col gap-6 overflow-hidden">
              <CollectionHeader
                image={edition?.properties.icon || theme?.icon}
                title={title}
                subtitle={collection.name}
                expiration={
                  isListed && selfOrders.length > 0
                    ? selfOrders[0].expiration
                    : undefined
                }
                listingCount={isListed ? selfOrders.length : undefined}
              />
              <div
                className="flex flex-col gap-6 overflow-scroll relative"
                style={{ scrollbarWidth: "none" }}
              >
                <CollectiblePreview
                  image={asset.imageUrl || collection.imageUrl || placeholder}
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
                      address={collection.address}
                      tokenId={asset.tokenId}
                      standard={collection.type}
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
                          amount={props.amount}
                          collectibleImage={
                            asset.imageUrl || collection.imageUrl || placeholder
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
          )}

          <LayoutFooter
            className={cn(
              "relative flex flex-col items-center justify-center gap-y-4 bg-background-100 pt-0 select-none",
              !isListed && !isOwner && "hidden",
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-3 w-full",
                !validated && "hidden",
              )}
            >
              <div className="w-full px-3 py-2.5 flex flex-col gap-1 bg-background-125 border border-background-200 rounded">
                <div className="flex items-center justify-between text-xs text-foreground-400">
                  <p>Cost</p>
                  <p>{`${amount - total} ${purchaseData.currency.name}`}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground-400">
                  <div className="flex gap-2  text-xs font-medium">
                    Fees
                    <FeesTooltip trigger={<InfoIcon size="xs" />} fees={fees} />
                  </div>
                  <p>{`${total} ${purchaseData.currency.name}`}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full">
                <div className="w-full px-3 py-2.5 flex items-center justify-between bg-background-125 border border-background-200 rounded">
                  <p className="text-sm font-medium text-foreground-400">
                    Total
                  </p>
                  <p className="text-sm font-medium text-foreground-100">{`${purchaseData.currency.price * purchaseData.assets.length}`}</p>
                </div>
                <TokenSelect
                  tokens={tokens}
                  selected={token || tokens[0]}
                  setSelected={() => {}}
                />
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="secondary"
                isLoading={loading}
                onClick={handleUnlist}
                className={cn(
                  "w-full gap-2 text-destructive-100",
                  (validated || !isListed || !isOwner) && "hidden",
                )}
              >
                <TagIcon variant="solid" size="sm" />
                Unlist
              </Button>
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  (validated || isListed || !isOwner) && "hidden",
                )}
                to={`list?${searchParams.toString()}`}
              >
                <Button variant="secondary" className={cn("w-full gap-2")}>
                  <TagIcon variant="solid" size="sm" />
                  List
                </Button>
              </Link>
              <Button
                isLoading={loading}
                variant="primary"
                className={cn(
                  "w-full gap-2",
                  (validated || !isListed || isOwner) && "hidden",
                )}
                onClick={() => setValidated(true)}
              >
                Purchase
              </Button>
              <Link
                className={cn(
                  "flex items-center justify-center gap-x-4 w-full",
                  (validated || !isOwner) && "hidden",
                )}
                to={`send?${searchParams.toString()}`}
              >
                <Button variant="secondary" className="w-full gap-2">
                  <PaperPlaneIcon variant="solid" size="sm" />
                  Send
                </Button>
              </Link>
              <div
                className={cn(
                  "w-full flex items-center gap-3",
                  !validated && "hidden",
                )}
              >
                <Button
                  variant="secondary"
                  type="button"
                  className="w-1/3"
                  onClick={() => navigate(`../..?${searchParams.toString()}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-2/3"
                  isLoading={loading}
                  onClick={
                    validated ? handlePurchase : () => setValidated(true)
                  }
                >
                  {validated ? "Confirm" : "Review"}
                </Button>
              </div>
            </div>
          </LayoutFooter>
        </>
      )}
    </LayoutContainer>
  );
}

const PurchaseConfirmation = ({
  assets,
  currency,
}: {
  assets: {
    name: string;
    image: string;
    collection: string;
  }[];
  currency: {
    name: string;
    image: string;
    price: number;
    value: string;
  };
}) => {
  return (
    <>
      <LayoutContent className="p-6 pb-0 flex flex-col gap-4 overflow-hidden select-none">
        <div className="h-10 flex items-center justify-start gap-3 select-none">
          <Thumbnail
            icon={
              <TagIcon
                variant="solid"
                size="lg"
                className="h-[30px] w-[30px]"
              />
            }
            size="lg"
          />
          <p className="text-lg/[24px] font-semibold">Review Purchase</p>
        </div>
        <div
          className="grow flex flex-col gap-px rounded overflow-y-scroll pb-6"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="h-10 flex items-center justify-between bg-background-200 px-3 py-2.5">
            <p className="text-xs tracking-wider text-foreground-400 font-semibold">
              Purchasing
            </p>
            <p
              className={cn(
                "px-1.5 py-0.5 text-xs bg-background-300 rounded-full font-medium text-foreground-300",
                assets.length <= 1 && "hidden",
              )}
            >{`${assets.length} total`}</p>
          </div>
          {assets.map((asset, index) => (
            <div
              key={`${asset.name}-${index}`}
              className="h-16 flex items-center justify-between bg-background-200 px-4 py-3 gap-3"
            >
              <ThumbnailCollectible
                image={asset.image}
                size="lg"
                variant="light"
                className="p-0"
              />
              <div className="flex flex-col gap-0.5 items-stretch grow overflow-hidden">
                <div className="flex items-center gap-6 justify-between text-sm font-medium capitalize">
                  <p>{asset.name}</p>
                  <div className="flex items-center gap-1">
                    <Thumbnail icon={currency.image} size="sm" />
                    <p>{currency.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 justify-between text-xs text-foreground-300">
                  <p className="truncate">{asset.collection}</p>
                  <p>{currency.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </LayoutContent>
    </>
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

const TokenSelect = ({
  tokens,
  selected,
  setSelected,
}: {
  tokens: Token[];
  selected: Token;
  setSelected: (token: Token) => void;
}) => {
  const onChangeToken = useCallback(
    (address: string) => {
      const token = tokens.find((token) => token.metadata.address === address);
      if (token) {
        setSelected(token);
      }
    },
    [setSelected, tokens],
  );

  if (tokens.length === 0) return null;

  return (
    <Select
      value={selected?.metadata.address}
      onValueChange={onChangeToken}
      defaultValue={selected?.metadata.address}
      disabled // TODO: enable when swap is implemented
    >
      <TokenSelectHeader className="h-10 w-fit rounded flex gap-2 items-center p-2 bg-background-200 hover:bg-background-200 disabled:opacity-100" />
      <SelectContent viewPortClassName="gap-0 bg-background-100 flex flex-col gap-px">
        {tokens.map((token) => (
          <SelectItem
            key={token.metadata.address}
            simplified
            value={token.metadata.address}
            data-active={token.metadata.address === selected?.metadata.address}
            className="h-10 group bg-background-200 hover:bg-background-300 text-foreground-300 hover:text-foreground-100 cursor-pointer data-[active=true]:bg-background-200 data-[active=true]:hover:bg-background-300 data-[active=true]:text-foreground-100 rounded-none"
          >
            <div className="flex items-center gap-2">
              {token.metadata.image ? (
                <Thumbnail
                  icon={token.metadata.image}
                  rounded
                  size="sm"
                  variant="light"
                  className="group-hover:bg-background-400"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />
              )}
              <span className="font-medium text-sm">
                {token.metadata.symbol}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const FeesTooltip = ({
  trigger,
  fees,
}: {
  trigger: React.ReactNode;
  fees: {
    label: string;
    amount: string;
    percentage: string;
  }[];
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="px-3 py-2 flex flex-col gap-2 bg-spacer-100 border border-background-150 text-foreground-400 min-w-[240px] select-none"
        >
          {fees.map((fee) => (
            <div
              key={fee.label}
              className="flex flex-row justify-between text-foreground-300"
            >
              {fee.label}:{" "}
              <div>
                <span className="text-foreground-400 text-xs">
                  ({fee.percentage})
                </span>{" "}
                {fee.amount}
              </div>
            </div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
