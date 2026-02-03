import {
  LayoutContent,
  LayoutFooter,
  Button,
  Skeleton,
  Empty,
  Input,
  Token,
  Select,
  TokenSelectHeader,
  SelectContent,
  Thumbnail,
  SelectItem,
  ToggleGroup,
  ToggleGroupItem,
  TagIcon,
  ThumbnailCollectible,
} from "@cartridge/ui";
import {
  cn,
  ETH_CONTRACT_ADDRESS,
  LORDS_CONTRACT_ADDRESS,
  STRK_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
} from "@cartridge/ui/utils";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useCollection } from "@/hooks/collection";
import placeholder from "/placeholder.svg?url";
import { ListHeader } from "./send/header";
import { useTokens } from "@/hooks/token";
import { AllowArray, cairo, Call, CallData, FeeEstimate } from "starknet";
import { useToast } from "@/context/toast";
import { ArcadeContext } from "@/context/arcade";
import { useEntrypoints } from "@/hooks/entrypoints";
import { useConnection } from "@/hooks/connection";
import { useNavigation } from "@/context/navigation";
import { ExecutionContainer } from "@/components/ExecutionContainer";

const SET_APPROVAL_FOR_ALL_CAMEL_CASE = "setApprovalForAll";
const SET_APPROVAL_FOR_ALL_SNAKE_CASE = "set_approval_for_all";
const ALLOWED_TOKENS = [
  ETH_CONTRACT_ADDRESS,
  STRK_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  LORDS_CONTRACT_ADDRESS,
];

const WEEK = 60 * 60 * 24 * 7;
const MONTH = 60 * 60 * 24 * 30;
const THREE_MONTHS = 60 * 60 * 24 * 90;
const YEAR = 60 * 60 * 24 * 365;
const NEVER = 60 * 60 * 24 * 365 * 1000;
const EXPIRATIONS = [
  { duration: WEEK, label: "1w" },
  { duration: MONTH, label: "1mo" },
  { duration: THREE_MONTHS, label: "3mo" },
  { duration: YEAR, label: "1y" },
  { duration: NEVER, label: "Never" },
];

export function CollectionListing() {
  const arcadeContext = useContext(ArcadeContext);
  const provider = arcadeContext?.provider;
  const { controller } = useConnection();
  const { goBack } = useNavigation();
  const { address: contractAddress, tokenId } = useParams();
  const { tokens: allTokens } = useTokens();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<Token | undefined>();
  const [duration, setDuration] = useState<number>(MONTH);
  const [price, setPrice] = useState<number | undefined>();
  const [priceError, setPriceError] = useState<Error | undefined>();
  const [userSelected, setUserSelected] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const { toast } = useToast();

  const tokens = useMemo(() => {
    const whitelisted = ALLOWED_TOKENS.map((address) => BigInt(address));
    return allTokens.filter((token) =>
      whitelisted.includes(BigInt(token.metadata.address)),
    );
  }, [allTokens]);

  const paramsTokenIds = useMemo(() => {
    return searchParams.getAll("tokenIds");
  }, [searchParams]);

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const { collection, assets, status } = useCollection({
    contractAddress: contractAddress,
    tokenIds,
  });

  const { entrypoints } = useEntrypoints({
    address: contractAddress || "0x0",
  });

  const disabled = useMemo(() => {
    return !!priceError;
  }, [priceError]);

  const title = useMemo(() => {
    if (!collection || !assets || assets.length === 0) return "";
    if (assets.length > 1) return `${assets.length} ${collection.name}(s)`;
    return assets[0].name;
  }, [collection, assets]);

  const image = useMemo(() => {
    if (!collection || !assets) return placeholder;
    if (assets.length > 1) return collection.imageUrls[0] || placeholder;
    return assets[0].imageUrls[0] || placeholder;
  }, [collection, assets]);

  const entrypoint: string | null = useMemo(() => {
    if (entrypoints.includes(SET_APPROVAL_FOR_ALL_SNAKE_CASE)) {
      return SET_APPROVAL_FOR_ALL_SNAKE_CASE;
    }
    if (entrypoints.includes(SET_APPROVAL_FOR_ALL_CAMEL_CASE)) {
      return SET_APPROVAL_FOR_ALL_CAMEL_CASE;
    }
    return null;
  }, [entrypoints]);

  const conversion = useMemo(() => {
    if (!selected?.balance?.value || !selected?.balance?.amount || !price)
      return undefined;
    const value = selected.balance.value;
    const max = selected.balance.amount;
    const total = (value * price) / max;
    return `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [selected, price]);

  const listingData = useMemo(() => {
    if (!assets || !collection || !selected || !price)
      return {
        assets: [],
        currency: { name: "", image: "", price: 0, value: "" },
      };
    const tokens = assets.map((asset) => ({
      name: asset.name,
      image: asset.imageUrls[0] || collection.imageUrls[0] || placeholder,
      collection: collection.name,
    }));
    const currency = {
      name: selected.metadata.symbol,
      image: selected.metadata.image || "",
      price: price,
      value: conversion || "",
    };
    return { assets: tokens, currency };
  }, [assets, collection, selected, price, conversion]);

  const totalEarnings = useMemo(() => {
    if (!selected || !selected.balance.value || !price) return undefined;
    const value = selected.balance.value;
    const max = selected.balance.amount;
    const total = (listingData.assets.length * (value * price)) / max;
    return `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [selected, price, listingData]);

  const handleSelection = useCallback(
    (token: Token) => {
      setSelected(token);
      setUserSelected(true);
    },
    [setSelected],
  );

  // Memoize marketplace address to prevent infinite useEffect loop
  const marketplaceAddress = useMemo(() => {
    return provider?.manifest.contracts.find((c: { tag: string }) =>
      c.tag?.includes("Marketplace"),
    )?.address;
  }, [provider?.manifest.contracts]);

  // Build transactions when validation is complete
  const buildTransactions = useMemo(() => {
    if (
      !validated ||
      !contractAddress ||
      !tokenIds ||
      !tokenIds.length ||
      !selected ||
      !price ||
      price === 0 ||
      !entrypoint ||
      !marketplaceAddress
    ) {
      return undefined;
    }

    const expiration = Math.floor(
      new Date(Date.now() + duration * 1000).getTime() / 1000,
    );
    const amount = BigInt(price * 10 ** selected.metadata.decimals);

    const calls: AllowArray<Call> = [
      {
        contractAddress: contractAddress,
        entrypoint: entrypoint,
        calldata: CallData.compile({
          operator: marketplaceAddress,
          approved: true,
        }),
      },
      ...tokenIds.map((tokenId) => ({
        contractAddress: marketplaceAddress,
        entrypoint: "list",
        calldata: CallData.compile({
          collection: contractAddress,
          tokenId: cairo.uint256(tokenId),
          quantity: 0, // 0 for ERC721
          price: amount.toString(),
          currency: selected.metadata.address,
          expiration: expiration,
          royalties: true,
        }),
      })),
    ];

    return calls;
  }, [
    validated,
    contractAddress,
    tokenIds,
    selected,
    price,
    entrypoint,
    duration,
    marketplaceAddress,
  ]);

  const submitToast = useCallback(() => {
    toast.marketplace("Listing transaction submitted successfully!", {
      action: "listed",
      itemNames: listingData.assets.map((asset) => asset.name),
      itemImages: listingData.assets.map((asset) => asset.image),
      collectionName: collection?.name ?? "",
    });
  }, [toast, listingData, collection?.name]);

  const onSubmitListing = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !buildTransactions || !controller) {
        return;
      }

      try {
        await controller.execute(buildTransactions, maxFee);
        submitToast();
        // Navigate back to the parent collection page with proper account path
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to list asset(s)");
        throw error; // Re-throw to let ExecutionContainer handle the error display
      }
    },
    [buildTransactions, controller, goBack, toast, submitToast],
  );

  useEffect(() => {
    if (userSelected || tokens.length === 0) return;
    setSelected(tokens[0]);
  }, [tokens, userSelected]);

  if (!selected || tokens.length === 0) return null;

  return (
    <>
      {status === "loading" || !collection || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          {validated && buildTransactions ? (
            <ExecutionContainer
              title="Review Listings"
              icon={
                <TagIcon
                  variant="solid"
                  size="lg"
                  className="h-[30px] w-[30px]"
                />
              }
              transactions={buildTransactions}
              onSubmit={onSubmitListing}
              buttonText="Confirm"
            >
              <ListingConfirmation
                {...listingData}
                totalEarnings={totalEarnings}
                totalPriceDisplay={`${listingData.currency.price * listingData.assets.length} ${listingData.currency.name}`}
              />
            </ExecutionContainer>
          ) : (
            <>
              <LayoutContent>
                <ListHeader image={image} title={title} />
                <Price
                  multiple={assets.length > 1}
                  price={price}
                  conversion={conversion}
                  setPrice={setPrice}
                  tokens={tokens}
                  selected={selected}
                  setSelected={handleSelection}
                  error={priceError}
                  setError={setPriceError}
                />
                <Expiration duration={duration} setDuration={setDuration} />
              </LayoutContent>

              <LayoutFooter
                className={cn(
                  "relative flex flex-col items-center justify-center gap-y-4 bg-background-100",
                )}
              >
                <div className="flex flex-col gap-3 w-full">
                  <div className="w-full flex items-center gap-3">
                    <Button
                      disabled={disabled}
                      type="submit"
                      className="w-full"
                      onClick={() => setValidated(true)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </LayoutFooter>
            </>
          )}
        </>
      )}
    </>
  );
}

const ListingConfirmation = ({
  assets,
  currency,
  totalEarnings,
  totalPriceDisplay,
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
  totalEarnings?: string;
  totalPriceDisplay: string;
}) => {
  return (
    <div className="p-4 pb-0 flex flex-col gap-4 overflow-hidden h-full">
      <div
        className="grow flex flex-col gap-px rounded overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="h-10 flex items-center justify-between bg-background-200 px-3 py-2.5">
          <p className="text-xs tracking-wider text-foreground-400 font-semibold">
            Listing
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

      {/* Total Earnings Display */}
      <div className="h-10 w-full px-3 py-2.5 flex items-center justify-between bg-background-125 border border-background-200 rounded">
        <p className="text-sm font-medium text-foreground-400">
          Total potential earnings
        </p>
        <div className="flex gap-1.5">
          {totalEarnings && (
            <p className="text-sm text-foreground-400">{`(${totalEarnings})`}</p>
          )}
          <p className="text-sm font-medium text-foreground-100">
            {totalPriceDisplay}
          </p>
        </div>
      </div>
    </div>
  );
};

const Price = ({
  multiple,
  price,
  conversion,
  setPrice,
  tokens,
  selected,
  setSelected,
  error,
  setError,
}: {
  multiple: boolean;
  price: number | undefined;
  conversion: string | undefined;
  setPrice: (price: number | undefined) => void;
  tokens: Token[];
  selected: Token;
  setSelected: (token: Token) => void;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPrice(value === "" ? undefined : Number(value));
    },
    [setPrice],
  );

  const onChangeToken = useCallback(
    (address: string) => {
      const token = tokens.find((token) => token.metadata.address === address);
      if (token) {
        setSelected(token);
        setPrice(undefined);
      }
    },
    [setPrice, setSelected, tokens],
  );

  useEffect(() => {
    if (!price) {
      const message = "Price cannot be null";
      setError(new Error(message));
      return;
    }
    setError(undefined);
  }, [price, setError]);

  if (tokens.length === 0) return null;

  return (
    <div className="flex flex-col gap-px">
      <p className="py-3 font-semibold text-xs tracking-wider text-foreground-400">
        {multiple ? "Price per item" : "Price"}
      </p>
      <div className="flex justify-between items-start gap-3">
        <div className="relative grow">
          <Input
            size="lg"
            type="number"
            className="h-10 pr-20"
            placeholder={(0).toLocaleString()}
            value={price ?? ""}
            error={error}
            onChange={handleChange}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-x-3 justify-end">
            <span className="text-sm text-foreground-300">{conversion}</span>
          </div>
        </div>
        <Select
          value={selected?.metadata.address}
          onValueChange={onChangeToken}
          defaultValue={selected?.metadata.address}
          disabled={tokens.length <= 1}
        >
          <TokenSelectHeader className="h-10 w-fit rounded flex gap-2 items-center p-2" />
          <SelectContent viewPortClassName="gap-0 bg-background-100 flex flex-col gap-px">
            {tokens.map((token) => (
              <SelectItem
                key={token.metadata.address}
                simplified
                value={token.metadata.address}
                data-active={
                  token.metadata.address === selected?.metadata.address
                }
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
      </div>
    </div>
  );
};

const Expiration = ({
  duration,
  setDuration,
}: {
  duration: number;
  setDuration: (duration: number) => void;
}) => {
  return (
    <div className="flex flex-col gap-px">
      <p className="py-3 font-semibold text-xs tracking-wider text-foreground-400">
        Expires
      </p>
      <ToggleGroup
        value={`${duration}`}
        onValueChange={(value) => setDuration(Number(value))}
        type="single"
        className="h-10 w-fit border border-background-200 flex bg-background-200 gap-px text-sm font-medium text-foreground-400 rounded overflow-hidden "
      >
        {EXPIRATIONS.map(({ duration, label }) => (
          <ToggleGroupItem
            key={duration}
            value={duration.toString()}
            aria-label={label}
            className="rounded-none h-full bg-background-100 hover:bg-background-100 p-4 hover:text-foreground-200 data-[state=on]:bg-background-200 data-[state=on]:text-foreground-100"
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
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
      <div className="flex flex-col">
        <Skeleton className="min-h-4 my-3 w-8 rounded" />
        <Skeleton className="min-h-10 w-full rounded" />
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
