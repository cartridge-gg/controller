import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
  Button,
  LayoutFooter,
  Skeleton,
  Empty,
  TagIcon,
  Token,
  Thumbnail,
  ThumbnailCollectible,
  Select,
  SelectContent,
  SelectItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  InfoIcon,
  useUI,
  SelectValue,
  CaratIcon,
  SelectTrigger,
} from "@cartridge/ui";
import { cn, useCountervalue } from "@cartridge/ui/utils";
import {
  AllowArray,
  cairo,
  Call,
  CallData,
  getChecksumAddress,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { useConnection } from "#hooks/context";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCollection } from "#hooks/collection";
import placeholder from "/public/placeholder.svg";
import { useMarketplace } from "#hooks/marketplace.js";
import { toast } from "sonner";
import { useTokens } from "#hooks/token";
import { useQuery } from "react-query";
import { useEntrypoints } from "#hooks/entrypoints.js";

const FEE_ENTRYPOINT = "royalty_info";

export function CollectionPurchase() {
  const { closeModal } = useUI();
  const { address: contractAddress, tokenId } = useParams();
  const { chainId, parent, provider: starknet, closable } = useConnection();
  const { tokens } = useTokens();
  const [loading, setLoading] = useState(false);
  const [royalties, setRoyalties] = useState<{ [orderId: number]: number }>({});
  const { entrypoints } = useEntrypoints({ address: contractAddress || "" });
  const { provider, orders, marketplaceFee, removeOrder, setAmount } =
    useMarketplace();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const paramsOrders = searchParams.get("orders")?.split(",").map(Number) || [];
  const tokenOrders = useMemo(() => {
    const allOrders = Object.values(orders).flatMap((orders) =>
      Object.values(orders).flatMap((orders) => Object.values(orders)),
    );
    return allOrders.filter((order) => paramsOrders.includes(order.id));
  }, [orders, paramsOrders]);

  const {
    collection,
    assets,
    status: collectionStatus,
  } = useCollection({
    contractAddress: contractAddress,
    tokenIds: tokenId ? [tokenId] : [],
  });

  const asset = useMemo(() => {
    return assets?.[0];
  }, [assets]);

  const token: Token | undefined = useMemo(() => {
    if (!tokenOrders || tokenOrders.length === 0) return;
    // [Check] if all currencies are the same
    const allCurrencies = tokenOrders.map((order) => order.currency);
    const unicity = new Set(allCurrencies).size === 1;
    if (!unicity) return;
    return tokens.find(
      (token) =>
        BigInt(token.metadata.address) === BigInt(tokenOrders[0].currency),
    );
  }, [tokens, tokenOrders]);

  const { total, fees } = useMemo(() => {
    const price = tokenOrders.reduce(
      (acc, order) => acc + Number(order?.price),
      0,
    );
    const royaltyFee = Object.values(royalties).reduce(
      (acc, royalty) => acc + royalty,
      0,
    );
    const formattedMarketplaceFee =
      marketplaceFee / Math.pow(10, token?.metadata.decimals || 0);
    const formattedRoyaltyFee =
      royaltyFee / Math.pow(10, token?.metadata.decimals || 0);
    const total = formattedMarketplaceFee + formattedRoyaltyFee;
    const fees = [
      {
        label: "Marketplace Fee",
        amount: `${formattedMarketplaceFee.toFixed(2)} ${token?.metadata.symbol}`,
        percentage: `${(price ? (marketplaceFee / price) * 100 : 0).toFixed(2)}%`,
      },
      {
        label: "Creator Royalties",
        amount: `${formattedRoyaltyFee.toFixed(2)} ${token?.metadata.symbol}`,
        percentage: `${(price ? (Number(royaltyFee) / price) * 100 : 0).toFixed(2)}%`,
      },
    ];
    return { total, fees };
  }, [marketplaceFee, royalties, token]);

  const props = useMemo(() => {
    if (!assets || !collection || !tokenOrders) return [];
    return tokenOrders
      .map((order) => {
        const asset = assets.find(
          (asset) => BigInt(asset.tokenId) === BigInt(order.tokenId),
        );
        if (!asset) return;
        return {
          orderId: order.id,
          image: asset.imageUrl || collection.imageUrl || placeholder,
          name: asset.name,
          collection: collection.name,
          collectionAddress: collection.address,
          price: order.price,
          tokenId: asset.tokenId,
        };
      })
      .filter((value) => value !== undefined);
  }, [assets, collection, tokenOrders, placeholder]);

  const { totalPrice, floatPrice } = useMemo(() => {
    const total = tokenOrders.reduce(
      (acc, order) => acc + Number(order?.price),
      0,
    );
    const formatted = total / Math.pow(10, token?.metadata.decimals || 0);
    return { totalPrice: total, floatPrice: formatted };
  }, [tokenOrders]);

  const addRoyalties = useCallback(
    (orderId: number, royaltyFee: number) => {
      setRoyalties((prev) => ({ ...prev, [orderId]: royaltyFee }));
    },
    [setRoyalties],
  );

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  const handlePurchase = useCallback(async () => {
    if (!token || !tokenOrders || tokenOrders.length === 0) return;
    setLoading(true);
    try {
      const marketplaceAddress: string = provider.manifest.contracts.find(
        (c: { tag: string }) => c.tag?.includes("Marketplace"),
      )?.address;
      const calls: AllowArray<Call> = [
        {
          contractAddress: getChecksumAddress(token?.metadata.address || ""),
          entrypoint: "approve",
          calldata: CallData.compile({
            spender: marketplaceAddress,
            amount: cairo.uint256(totalPrice),
          }),
        },
        ...tokenOrders.map((order) => ({
          contractAddress: marketplaceAddress,
          entrypoint: "execute",
          calldata: CallData.compile({
            orderId: order.id,
            collection: order.collection,
            tokenId: cairo.uint256(order.tokenId),
            assetId: cairo.uint256(order.tokenId),
            quantity: 0, // 0 for ERC721
            royalties: true,
          }),
        })),
      ];
      const res = await parent.openExecute(
        Array.isArray(calls) ? calls : [calls],
        chainId,
      );
      if (res?.transactionHash) {
        await starknet.waitForTransaction(res.transactionHash, {
          retryInterval: 100,
          successStates: [
            TransactionExecutionStatus.SUCCEEDED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        });
      }
      if (res) {
        toast.success(`Asset purchased successfully`);
      }
      // Removing the order optimistically
      tokenOrders.forEach((order) => {
        removeOrder(order);
      });
      closeModal?.();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to purchase asset(s)`);
    } finally {
      setLoading(false);
    }
  }, [
    closable,
    closeModal,
    token,
    tokenOrders,
    chainId,
    totalPrice,
    parent,
    provider,
    starknet,
    removeOrder,
    navigate,
    searchParams,
  ]);

  const status = useMemo(() => {
    if (collectionStatus === "error") return "error";
    if (collectionStatus === "loading") return "loading";
    return "success";
  }, [collectionStatus]);

  useEffect(() => {
    if (!tokenOrders || tokenOrders.length === 0) return;
    const amount = tokenOrders.reduce(
      (acc, order) => acc + Number(order?.price),
      0,
    );
    setAmount(amount);
  }, [tokenOrders, setAmount]);

  return (
    <LayoutContainer>
      <LayoutHeader
        className="hidden"
        onBack={closable ? undefined : handleBack}
      />

      {status === "loading" ||
      !collection ||
      !asset ||
      tokenOrders.length === 0 ? (
        <LoadingState />
      ) : status === "error" || !token ? (
        <EmptyState />
      ) : (
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
                    props.length <= 1 && "hidden",
                  )}
                >{`${props.length} total`}</p>
              </div>
              {props.map((args) => (
                <Order
                  key={args.orderId}
                  orderId={args.orderId}
                  image={args.image}
                  name={args.name}
                  collection={args.collection}
                  collectionAddress={args.collectionAddress}
                  price={args.price}
                  token={token}
                  entrypoints={entrypoints}
                  tokenId={args.tokenId}
                  addRoyalties={addRoyalties}
                />
              ))}
            </div>
          </LayoutContent>

          <LayoutFooter className="relative flex flex-col items-center justify-center gap-y-4 bg-background-100 pt-0 select-none">
            <div className="flex flex-col gap-3 w-full">
              <div className="w-full px-3 py-2.5 flex flex-col gap-1 bg-background-125 border border-background-200 rounded">
                <div className="flex items-center justify-between text-xs text-foreground-400">
                  <p>Cost</p>
                  <p>{`${(floatPrice - total).toFixed(2)} ${token.metadata.symbol}`}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground-400">
                  <div className="flex gap-2  text-xs font-medium">
                    Fees
                    <FeesTooltip trigger={<InfoIcon size="xs" />} fees={fees} />
                  </div>
                  <p>{`${total.toFixed(2)} ${token.metadata.symbol}`}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full">
                <div className="w-full px-3 py-2.5 h-10 flex items-center justify-between bg-background-125 border border-background-200 rounded">
                  <p className="text-sm font-medium text-foreground-400">
                    Total
                  </p>
                  <p className="text-sm font-medium text-foreground-100">{`${floatPrice}`}</p>
                </div>
                <TokenSelect
                  tokens={tokens}
                  selected={token || tokens[0]}
                  setSelected={() => {}}
                />
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <div className="w-full flex items-center gap-3">
                <Link
                  className="w-1/3"
                  to={`../../..?${searchParams.toString()}`}
                  onClick={closable ? closeModal : undefined}
                >
                  <Button variant="secondary" type="button" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="w-2/3"
                  isLoading={loading}
                  onClick={handlePurchase}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </LayoutFooter>
        </>
      )}
    </LayoutContainer>
  );
}

const Order = ({
  orderId,
  image,
  name,
  collection,
  collectionAddress,
  price,
  token,
  entrypoints,
  tokenId,
  addRoyalties,
}: {
  orderId: number;
  image: string;
  name: string;
  collection: string;
  collectionAddress: string;
  price: number;
  token: Token;
  entrypoints: string[];
  tokenId: string;
  addRoyalties: (orderId: number, royaltyFee: number) => void;
}) => {
  const { provider: starknet } = useConnection();
  const { data: royalties } = useQuery({
    enabled: !!collectionAddress && !!tokenId && !!price,
    queryKey: ["fee", collectionAddress, tokenId, price],
    queryFn: async () => {
      if (!entrypoints || !entrypoints.includes(FEE_ENTRYPOINT)) return;
      try {
        return await starknet.callContract({
          contractAddress: collectionAddress,
          entrypoint: FEE_ENTRYPOINT,
          calldata: [
            cairo.uint256(tokenId ?? "0x0"),
            cairo.uint256(price || 0),
          ],
        });
      } catch (error: unknown) {
        console.log(error);
      }
    },
  });

  const floatPrice = useMemo(() => {
    if (!token) return 0;
    return Number(price) / Math.pow(10, token.metadata.decimals);
  }, [price, token]);

  const royaltyFee = useMemo(() => {
    if (!royalties) return 0;
    return Number(royalties[1]);
  }, [royalties]);

  useEffect(() => {
    if (!royalties) return;
    addRoyalties(orderId, royaltyFee);
  }, [addRoyalties, orderId, royaltyFee]);

  const { countervalues } = useCountervalue(
    {
      tokens: [
        {
          balance: `${floatPrice}`,
          address: token?.metadata.address || "",
        },
      ],
    },
    { enabled: !!floatPrice && !!token },
  );

  const value = useMemo(() => {
    if (!countervalues) return 0;
    return countervalues[0]?.current.value || 0;
  }, [countervalues]);

  return (
    <div className="h-16 flex items-center justify-between bg-background-200 px-4 py-3 gap-3">
      <ThumbnailCollectible
        image={image}
        size="lg"
        variant="light"
        className="p-0"
      />
      <div className="flex flex-col gap-0.5 items-stretch grow overflow-hidden">
        <div className="flex items-center gap-6 justify-between text-sm font-medium capitalize">
          <p>{name}</p>
          <div className="flex items-center gap-1">
            <Thumbnail icon={token.metadata.image} size="sm" />
            <p>{floatPrice}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-between text-xs text-foreground-300">
          <p className="truncate">{collection}</p>
          <p>{`$${value.toFixed(2)}`}</p>
        </div>
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

  const disabled = useMemo(() => {
    return true;
  }, []);

  if (tokens.length === 0) return null;

  return (
    <Select
      value={selected?.metadata.address}
      onValueChange={onChangeToken}
      defaultValue={selected?.metadata.address}
      disabled={disabled} // TODO: enable when swap is implemented
    >
      <SelectTrigger className="h-10 w-fit rounded flex gap-2 items-center p-2 bg-background-200 hover:bg-background-200 disabled:opacity-100 disabled:cursor-default">
        <SelectValue placeholder="Select Token" />
        <CaratIcon
          variant="down"
          size="sm"
          className={cn(
            "text-foreground-300",
            disabled && "text-foreground-400",
          )}
        />
      </SelectTrigger>
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
              className="flex flex-row gap-2 justify-between text-foreground-300"
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
