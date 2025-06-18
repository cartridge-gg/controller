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
  LayoutFooter,
  Skeleton,
  Empty,
  TagIcon,
  Token,
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

export function CollectionPurchase() {
  const { chainId, parent, provider: mainProvider } = useConnection();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { tokens } = useTokens();
  const {
    isListed,
    provider,
    order,
    removeOrder,
    marketplaceFee,
    royaltyFee,
    setAmount,
  } = useMarketplace();
  const [loading, setLoading] = useState(false);

  const { address: contractAddress, tokenId } = useParams();
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

  const props = useMemo(() => {
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
    if (!contractAddress || !asset || !isListed || !order) return;
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
      // Removing the order optimistically
      removeOrder(order);
      navigate(`..?${searchParams.toString()}`);
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
      <LayoutHeader className="hidden" onBack={handleBack} />

      {status === "loading" || !collection || !asset ? (
        <LoadingState />
      ) : status === "error" || (isListed && !token) ? (
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
                    props.assets.length <= 1 && "hidden",
                  )}
                >{`${props.assets.length} total`}</p>
              </div>
              {props.assets.map((asset, index) => (
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
                        <Thumbnail icon={props.currency.image} size="sm" />
                        <p>{props.currency.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 justify-between text-xs text-foreground-300">
                      <p className="truncate">{asset.collection}</p>
                      <p>{props.currency.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </LayoutContent>

          <LayoutFooter className="relative flex flex-col items-center justify-center gap-y-4 bg-background-100 pt-0 select-none">
            <div className="flex flex-col gap-3 w-full">
              <div className="w-full px-3 py-2.5 flex flex-col gap-1 bg-background-125 border border-background-200 rounded">
                <div className="flex items-center justify-between text-xs text-foreground-400">
                  <p>Cost</p>
                  <p>{`${amount - total} ${props.currency.name}`}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground-400">
                  <div className="flex gap-2  text-xs font-medium">
                    Fees
                    <FeesTooltip trigger={<InfoIcon size="xs" />} fees={fees} />
                  </div>
                  <p>{`${total} ${props.currency.name}`}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full">
                <div className="w-full px-3 py-2.5 flex items-center justify-between bg-background-125 border border-background-200 rounded">
                  <p className="text-sm font-medium text-foreground-400">
                    Total
                  </p>
                  <p className="text-sm font-medium text-foreground-100">{`${props.currency.price * props.assets.length}`}</p>
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
