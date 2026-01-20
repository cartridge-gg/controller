import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  LayoutContent,
  Skeleton,
  Empty,
  TagIcon,
  Token,
  Thumbnail,
  ThumbnailCollectible,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  InfoIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import {
  addAddressPadding,
  AllowArray,
  cairo,
  Call,
  CallData,
  getChecksumAddress,
  FeeEstimate,
} from "starknet";
import { useConnection } from "@/hooks/connection";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToriiCollection, useToriiCollections } from "@/hooks/collection";
import { toast } from "sonner";
import { useTokens } from "@/hooks/token";
import { useNavigation } from "@/context/navigation";
import { useCollection } from "@/hooks/collection";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import {
  CLIENT_FEE_NUMERATOR,
  CLIENT_FEE_DENOMINATOR,
  CLIENT_FEE_RECEIVER,
} from "@/constants";
import {
  useMarketplaceCollectionOrders,
  useMarketplaceFees,
  useMarketplaceRoyaltyFee,
} from "@cartridge/arcade/marketplace/react";
import { StatusType } from "@cartridge/arcade";
import { ArcadeContext } from "@/context/arcade";

export function CollectiblePurchase() {
  const { address: contractAddress, tokenId } = useParams();
  const { project, controller } = useConnection();
  const { goBack } = useNavigation();
  const { tokens } = useTokens();
  const [royalties, setRoyalties] = useState<{ [orderId: number]: bigint }>({});
  const [amount, setAmount] = useState<number>(0);
  const arcadeContext = useContext(ArcadeContext);
  const provider = arcadeContext?.provider;

  const { data: marketplaceFeeConfig } = useMarketplaceFees();

  const [searchParams] = useSearchParams();

  const orderIds = useMemo(
    () => searchParams.get("orders")?.split(",").map(Number) || [],
    [searchParams],
  );
  const { data: allOrders } = useMarketplaceCollectionOrders(
    {
      collection: contractAddress || "",
      status: StatusType.Placed,
      tokenId,
      orderIds,
    },
    !!contractAddress,
  );

  const tokenOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter((order) => orderIds.includes(order.id));
  }, [allOrders, orderIds]);

  const tokenIds = useMemo(() => {
    return tokenOrders.map((order) =>
      addAddressPadding(order.tokenId.toString(16)),
    );
  }, [tokenOrders]);

  useCollection({
    contractAddress: contractAddress,
    tokenIds: tokenId ? [tokenId] : [],
  });

  const { collections, status: collectionStatus } = useToriiCollections();

  const collection = useMemo(() => {
    if (!project || !collections || !contractAddress) return;
    const projectCollections = collections[project];
    if (!projectCollections) return;
    return projectCollections[getChecksumAddress(contractAddress)];
  }, [collections, contractAddress, project]);

  const { tokens: assets, status: assetsStatus } = useToriiCollection({
    contractAddress: contractAddress || "",
    tokenIds: tokenIds,
  });

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

  const marketplaceFee = useMemo(() => {
    if (!marketplaceFeeConfig || !amount) return 0;
    return (
      (marketplaceFeeConfig.feeNum * amount) /
      marketplaceFeeConfig.feeDenominator
    );
  }, [marketplaceFeeConfig, amount]);

  const { total, fees } = useMemo(() => {
    const price = tokenOrders.reduce(
      (acc: number, order) => acc + Number(order?.price),
      0,
    );
    const royaltyFee = Object.values(royalties).reduce(
      (acc: bigint, royalty) => acc + royalty,
      BigInt(0),
    );
    const formattedMarketplaceFee =
      marketplaceFee / Math.pow(10, token?.metadata.decimals || 0);
    const formattedClientFee =
      (price * (CLIENT_FEE_NUMERATOR / CLIENT_FEE_DENOMINATOR)) /
      Math.pow(10, token?.metadata.decimals || 0);
    const formattedRoyaltyFee =
      Number(royaltyFee) / Math.pow(10, token?.metadata.decimals || 0);
    const total = formattedMarketplaceFee + formattedRoyaltyFee;
    const fees = [
      {
        label: "Marketplace Fee",
        amount: `${formattedMarketplaceFee.toFixed(2)} ${token?.metadata.symbol}`,
        percentage: `${(price ? (marketplaceFee / price) * 100 : 0).toFixed(2)}%`,
      },
      {
        label: "Client Fee",
        amount: `${formattedClientFee.toFixed(2)} ${token?.metadata.symbol}`,
        percentage: `${((CLIENT_FEE_NUMERATOR / CLIENT_FEE_DENOMINATOR) * 100).toFixed(2)}%`,
      },
      {
        label: "Creator Royalties",
        amount: `${formattedRoyaltyFee.toFixed(2)} ${token?.metadata.symbol}`,
        percentage: `${(price ? (Number(royaltyFee) / price) * 100 : 0).toFixed(2)}%`,
      },
    ];
    return { total, fees };
  }, [marketplaceFee, royalties, token, tokenOrders]);

  const props = useMemo(() => {
    if (!assets || !collection || !tokenOrders) return [];
    return tokenOrders
      .map((order) => {
        const asset = assets.find(
          (asset) => BigInt(asset.token_id ?? "0x0") === BigInt(order.tokenId),
        );
        if (!asset || !contractAddress) return;
        let tokenName = "";
        try {
          tokenName = JSON.parse(asset.metadata).name || asset.name;
        } catch {
          tokenName = asset.name;
        }
        const newImage = `https://api.cartridge.gg/x/${project}/torii/static/${addAddressPadding(contractAddress)}/${asset.token_id}/image`;
        const oldImage = `https://api.cartridge.gg/x/${project}/torii/static/0x${BigInt(contractAddress).toString(16)}/${asset.token_id}/image`;
        return {
          orderId: order.id,
          images: [newImage, oldImage],
          name: tokenName,
          collection: collection.name,
          collectionAddress: contractAddress,
          price: order.price,
          tokenId: asset.token_id,
        };
      })
      .filter((value) => value !== undefined);
  }, [assets, collection, tokenOrders, contractAddress, project]);

  const { totalPrice, floatPrice } = useMemo(() => {
    const total = tokenOrders.reduce(
      (acc, order) => acc + Number(order?.price),
      0,
    );
    const fees = Math.floor(
      total * (CLIENT_FEE_NUMERATOR / CLIENT_FEE_DENOMINATOR),
    );
    const formatted =
      (total + fees) / Math.pow(10, token?.metadata.decimals || 0);
    return { totalPrice: total + fees, floatPrice: formatted, fees };
  }, [tokenOrders, token?.metadata.decimals]);

  const addRoyalties = useCallback(
    (orderId: number, royaltyFee: bigint) => {
      setRoyalties((prev) => {
        const next: { [orderId: number]: bigint } = { ...prev };
        next[orderId] = royaltyFee;
        return next;
      });
    },
    [setRoyalties],
  );

  // Memoize marketplace address
  const marketplaceAddress = useMemo(() => {
    return provider?.manifest.contracts.find((c: { tag: string }) =>
      c.tag?.includes("Marketplace"),
    )?.address;
  }, [provider?.manifest.contracts]);

  // Build transactions
  const buildTransactions = useMemo(() => {
    if (
      !token ||
      !tokenOrders ||
      tokenOrders.length === 0 ||
      !marketplaceAddress
    ) {
      return undefined;
    }

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
          quantity: order.quantity,
          royalties: true,
          clientFee: CLIENT_FEE_NUMERATOR,
          clientFeeReceiver: CLIENT_FEE_RECEIVER,
        }),
      })),
    ];

    return calls;
  }, [token, tokenOrders, totalPrice, marketplaceAddress]);

  const onSubmitPurchase = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !buildTransactions || !controller) {
        return;
      }

      try {
        await controller.execute(buildTransactions, maxFee);

        toast.success("Purchase completed successfully!", {
          duration: 10000,
        });

        // Navigate back
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to purchase asset(s)");
        throw error;
      }
    },
    [buildTransactions, controller, goBack],
  );

  const status = useMemo(() => {
    if (collectionStatus === "error" || assetsStatus === "error")
      return "error";
    if (collectionStatus === "loading" || assetsStatus === "loading")
      return "loading";
    return "success";
  }, [collectionStatus, assetsStatus]);

  useEffect(() => {
    if (!tokenOrders || tokenOrders.length === 0) return;
    const amount = tokenOrders.reduce(
      (acc, order) => acc + Number(order?.price),
      0,
    );
    setAmount(amount);
  }, [tokenOrders, setAmount]);

  return (
    <>
      {status === "loading" || !collection ? (
        <LoadingState />
      ) : status === "error" || !token || tokenOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {buildTransactions ? (
            <ExecutionContainer
              title="Review Purchase"
              icon={
                <TagIcon
                  variant="solid"
                  size="lg"
                  className="h-[30px] w-[30px]"
                />
              }
              transactions={buildTransactions}
              onSubmit={onSubmitPurchase}
              buttonText="Confirm"
            >
              <div className="p-4 pb-0 flex flex-col gap-4 overflow-hidden h-full">
                <div
                  className="grow flex flex-col gap-px rounded overflow-y-scroll"
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
                      image={args.images[0]}
                      name={args.name}
                      collection={args.collection}
                      collectionAddress={args.collectionAddress ?? ""}
                      price={args.price}
                      token={token}
                      tokenId={args.tokenId ?? ""}
                      addRoyalties={addRoyalties}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3 pb-6">
                  <div className="w-full px-3 py-2.5 flex flex-col gap-1 bg-background-125 border border-background-200 rounded">
                    <div className="flex items-center justify-between text-xs text-foreground-400">
                      <p>Cost</p>
                      <p>{`${(floatPrice - total).toFixed(2)} ${token.metadata.symbol}`}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-foreground-400">
                      <div className="flex gap-2  text-xs font-medium">
                        Fees
                        <FeesTooltip
                          trigger={<InfoIcon size="xs" />}
                          fees={fees}
                        />
                      </div>
                      <p>{`${total.toFixed(2)} ${token.metadata.symbol}`}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full">
                    <div className="w-full px-3 py-2.5 h-10 flex items-center justify-between bg-background-125 border border-background-200 rounded">
                      <p className="text-sm font-medium text-foreground-400">
                        Total
                      </p>
                      <p className="text-sm font-medium text-foreground-100">{`${floatPrice} ${token.metadata.symbol}`}</p>
                    </div>
                    <Link
                      to="../.."
                      className="px-3 h-10 flex items-center justify-center bg-primary-100 hover:bg-primary-200 text-primary-foreground rounded"
                    >
                      Cancel
                    </Link>
                  </div>
                </div>
              </div>
            </ExecutionContainer>
          ) : null}
        </>
      )}
    </>
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
  tokenId: string;
  addRoyalties: (orderId: number, royaltyFee: bigint) => void;
}) => {
  const { data: royaltyInfo } = useMarketplaceRoyaltyFee(
    {
      collection: collectionAddress,
      tokenId: tokenId,
      amount: BigInt(price),
    },
    !!collectionAddress && !!tokenId && !!price,
  );

  const finalPrice = useMemo(() => {
    const formattedPrice = price / Math.pow(10, token.metadata.decimals);
    return {
      amount: formattedPrice.toFixed(2),
      token: token.metadata.symbol,
    };
  }, [price, token]);

  useEffect(() => {
    if (royaltyInfo?.amount) {
      addRoyalties(orderId, royaltyInfo.amount);
    }
  }, [royaltyInfo, orderId, addRoyalties]);

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
            <Thumbnail icon={token.metadata.image || ""} size="sm" />
            <p>{finalPrice.amount}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-between text-xs text-foreground-300">
          <p className="truncate">{collection}</p>
          <p></p>
        </div>
      </div>
    </div>
  );
};

const FeesTooltip = ({
  trigger,
  fees,
}: {
  trigger: React.ReactNode;
  fees: { label: string; amount: string; percentage: string }[];
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            {fees.map((fee) => (
              <div
                key={fee.label}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span className="text-foreground-400">{fee.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground-100">{fee.amount}</span>
                  <span className="text-foreground-400">
                    ({fee.percentage})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const LoadingState = () => {
  return (
    <LayoutContent className="gap-4 select-none h-full overflow-hidden">
      <Skeleton className="min-h-10 w-full rounded" />
      <div className="flex flex-col">
        <Skeleton className="min-h-4 my-3 w-8 rounded" />
        <Skeleton className="min-h-10 w-full rounded" />
      </div>
      <Skeleton className="min-h-[250px] w-full rounded" />
    </LayoutContent>
  );
};

const EmptyState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Empty
        title="No information found for this purchase."
        icon="inventory"
        className="h-full"
      />
    </LayoutContent>
  );
};
