import { useParams, useSearchParams } from "react-router-dom";
import {
  LayoutContent,
  Skeleton,
  Empty,
  TagIcon,
  Token,
  Thumbnail,
  ThumbnailCollectible,
} from "@cartridge/ui";
import { cn, useCountervalue } from "@cartridge/ui/utils";
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
import { useToriiCollection } from "@/hooks/collection";
import { useToast } from "@/context/toast";
import { useTokens } from "@/hooks/token";
import { useTokenContract } from "@/hooks/contracts";
import { useNavigation } from "@/context/navigation";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import {
  CLIENT_FEE_DENOMINATOR,
  CLIENT_FEE_NUMERATOR,
  CLIENT_FEE_RECEIVER,
} from "@/constants";
import {
  useMarketplaceCollectionOrders,
  useMarketplaceFees,
  useMarketplaceRoyaltyFee,
} from "@cartridge/arcade/marketplace/react";
import { StatusType } from "@cartridge/arcade";
import { ArcadeContext } from "@/context/arcade";
import { CollectionFooter } from "./footer";

export function CollectionPurchase() {
  const { address: contractAddress, tokenId } = useParams();
  const { project, controller, closeModal } = useConnection();
  const { goBack, canGoBack } = useNavigation();
  const { tokens } = useTokens();
  const [royalties, setRoyalties] = useState<{ [orderId: number]: bigint }>({});
  const [amount, setAmount] = useState<number>(0);
  const arcadeContext = useContext(ArcadeContext);
  const provider = arcadeContext?.provider;
  const { toast } = useToast();

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

  const { data: marketplaceFeeConfig } = useMarketplaceFees();

  const tokenOrders = useMemo(() => {
    if (!allOrders) return [];
    return allOrders.filter((order) => orderIds.includes(order.id));
  }, [allOrders, orderIds]);

  const tokenIds = useMemo(() => {
    return tokenOrders.map((order) =>
      addAddressPadding(order.tokenId.toString(16)),
    );
  }, [tokenOrders]);

  const { tokenContract, status: tokenContractStatus } = useTokenContract({
    contractAddress,
  });

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

  const tokenData = useMemo(
    () => ({
      tokens: !token
        ? []
        : tokenOrders.map((order) => ({
            balance: (
              Number(order.price) / Math.pow(10, token.metadata.decimals)
            ).toString(),
            address: token.metadata.address,
          })),
    }),
    [tokenOrders, token],
  );

  const { countervalues } = useCountervalue(tokenData);

  const props = useMemo(() => {
    if (!assets || !tokenContract || !tokenOrders) return [];
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
          collection: tokenContract.name,
          collectionAddress: contractAddress,
          price: order.price,
          tokenId: asset.token_id ?? "",
          finalPrice: order.price / Math.pow(10, token?.metadata.decimals || 0),
        };
      })
      .filter((value) => value !== undefined);
  }, [
    assets,
    tokenContract,
    tokenOrders,
    contractAddress,
    project,
    token?.metadata.decimals,
  ]);

  const { totalPrice, floatPrice, fixedValue } = useMemo(() => {
    const total = tokenOrders.reduce(
      (acc, order) => acc + Number(order?.price),
      0,
    );
    const fees = Math.floor(
      total * (CLIENT_FEE_NUMERATOR / CLIENT_FEE_DENOMINATOR),
    );
    const formatted =
      (total + fees) / Math.pow(10, token?.metadata.decimals || 0);
    // Figure out the index of the highest digit from the price, e.g 1.00 is 0, 0.01 is 2, 0.1 is 1, etc.
    const dotPosition = formatted
      .toString()
      .split("")
      .findIndex((char) => char === ".");
    const digitPosition = formatted
      .toString()
      .split("")
      .findIndex((char) => char !== "0" && char !== ".");
    return {
      totalPrice: total + fees,
      floatPrice: formatted,
      fees,
      fixedValue: Math.max(0, digitPosition - dotPosition),
    };
  }, [tokenOrders, token?.metadata.decimals]);

  const marketplaceFee = useMemo(() => {
    if (!marketplaceFeeConfig || !amount) return 0;
    return (
      (marketplaceFeeConfig.feeNum * amount) /
      marketplaceFeeConfig.feeDenominator
    );
  }, [marketplaceFeeConfig, amount]);

  const { fees, fixedFeeValue } = useMemo(() => {
    const price = tokenOrders.reduce(
      (acc: number, order) => acc + Number(order?.price),
      0,
    );
    const royaltyFee = Object.values(royalties).reduce(
      (acc: bigint, royalty) => acc + royalty,
      0n,
    );
    const fixedFeeValue = fixedValue + 3;
    const fees = [
      {
        label: "Marketplace Fee",
        amount: marketplaceFee / Math.pow(10, token?.metadata.decimals || 0),
        percentage: price ? (marketplaceFee / price) * 100 : 0,
      },
      {
        label: "Creator Royalties",
        amount:
          Number(royaltyFee) / Math.pow(10, token?.metadata.decimals || 0),
        percentage: price ? (Number(royaltyFee) / price) * 100 : 0,
      },
      {
        label: "Client Fee",
        amount:
          (price * (CLIENT_FEE_NUMERATOR / CLIENT_FEE_DENOMINATOR)) /
          Math.pow(10, token?.metadata.decimals || 0),
        percentage: (CLIENT_FEE_NUMERATOR / CLIENT_FEE_DENOMINATOR) * 100,
      },
    ];
    const totalFees = fees.reduce((acc, fee) => acc + fee.amount, 0);
    return { fees, totalFees, fixedFeeValue };
  }, [marketplaceFee, royalties, token, tokenOrders, fixedValue]);

  const addRoyalties = useCallback(
    (orderId: number, royaltyFee: bigint) => {
      setRoyalties((prev) => ({ ...prev, [orderId]: royaltyFee }));
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
          quantity: 0, // 0 for ERC721
          royalties: true,
          clientFee: CLIENT_FEE_NUMERATOR,
          clientFeeReceiver: CLIENT_FEE_RECEIVER,
        }),
      })),
    ];

    return calls;
  }, [token, tokenOrders, totalPrice, marketplaceAddress]);

  const submitToast = useCallback(() => {
    toast.marketplace("Purchase completed successfully!", {
      action: "purchased",
      itemNames: props.map((prop) => prop.name),
      itemImages: props.map((prop) => prop.images[0]),
      collectionName: tokenContract?.name ?? "",
    });
  }, [toast, props, tokenContract?.name]);

  const onSubmitPurchase = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !buildTransactions || !controller) {
        return;
      }

      try {
        await controller.execute(buildTransactions, maxFee);
        submitToast();
        // Navigate back
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to purchase asset(s)");
        throw error;
      }
    },
    [buildTransactions, controller, goBack, toast, submitToast],
  );

  const status = useMemo(() => {
    if (tokenContractStatus === "error" || assetsStatus === "error")
      return "error";
    if (tokenContractStatus === "loading" || assetsStatus === "loading")
      return "loading";
    return "success";
  }, [tokenContractStatus, assetsStatus]);

  useEffect(() => {
    if (!tokenOrders || tokenOrders.length === 0) return;
    const newAmount = tokenOrders.reduce(
      (acc: number, order) => acc + Number(order?.price),
      0,
    );
    setAmount(newAmount);
  }, [tokenOrders]);

  return (
    <>
      {status === "loading" || !tokenContract ? (
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
              onCancel={canGoBack ? goBack : closeModal}
              buttonText="Confirm"
            >
              <div className="p-4 pb-0 flex flex-col gap-4 overflow-hidden h-full select-none">
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
                  {props.map((args, i) => (
                    <Order
                      key={args.orderId}
                      orderId={args.orderId}
                      image={args.images[0]}
                      name={args.name}
                      collection={args.collection}
                      collectionAddress={args.collectionAddress}
                      price={args.price}
                      token={token}
                      tokenId={args.tokenId}
                      addRoyalties={addRoyalties}
                      finalPrice={args.finalPrice.toFixed(fixedValue)}
                      counterValue={countervalues[i]?.current?.value}
                    />
                  ))}
                </div>

                <div className="flex-1" />

                <CollectionFooter
                  token={token}
                  fees={fees}
                  totalPrice={floatPrice}
                  feeDecimals={fixedFeeValue}
                  orders={props.map((args) => ({
                    name: args.name,
                    amount: args.finalPrice.toFixed(fixedValue),
                  }))}
                />
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
  finalPrice,
  counterValue,
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
  finalPrice: string;
  counterValue: number | undefined;
}) => {
  const { data: royaltyInfo } = useMarketplaceRoyaltyFee(
    {
      collection: collectionAddress,
      tokenId: tokenId,
      amount: BigInt(price),
    },
    !!collectionAddress && !!tokenId && !!price,
  );

  useEffect(() => {
    if (royaltyInfo?.amount) {
      addRoyalties(orderId, royaltyInfo.amount);
    }
  }, [royaltyInfo, orderId, addRoyalties]);

  const usdPrice = useMemo(
    () =>
      `$${counterValue?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "?"}`,
    [counterValue],
  );

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
            <p>{finalPrice}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-between text-xs text-foreground-300">
          <p className="truncate">{collection}</p>
          <p>{usdPrice}</p>
        </div>
      </div>
    </div>
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
