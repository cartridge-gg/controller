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
  Checkbox,
  PlusIcon,
  MinusIcon,
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
import placeholder from "/placeholder.svg?url";
import { ListHeader } from "./send/header";
import { useTokens } from "@/hooks/token";
import { useConnection } from "@/hooks/connection";
import { AllowArray, cairo, Call, CallData, FeeEstimate } from "starknet";
import { useToast } from "@/context/toast";
import { ArcadeContext } from "@/context/arcade";
import { useEntrypoints } from "@/hooks/entrypoints";
import { useNavigation } from "@/context/navigation";
import { useCollection } from "@/hooks/collection";
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

export function CollectibleListing() {
  const arcadeContext = useContext(ArcadeContext);
  const provider = arcadeContext?.provider;
  const { controller } = useConnection();
  const { goBack } = useNavigation();
  const { address: contractAddress, tokenId } = useParams();
  const { tokens: allTokens } = useTokens();
  const [selected, setSelected] = useState<Token | undefined>();
  const [duration, setDuration] = useState<number>(MONTH);
  const [price, setPrice] = useState<number | undefined>();
  const [priceError, setPriceError] = useState<Error | undefined>();
  const [userSelected, setUserSelected] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [split, setSplit] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const { toast } = useToast();

  const { navigate } = useNavigation();

  const tokens = useMemo(() => {
    const whitelisted = ALLOWED_TOKENS.map((address) => BigInt(address));
    return allTokens.filter((token) =>
      whitelisted.includes(BigInt(token.metadata.address)),
    );
  }, [allTokens]);

  const [searchParams] = useSearchParams();
  const paramsTokenIds = useMemo(() => {
    return searchParams.getAll("tokenIds");
  }, [searchParams]);

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const {
    collection: collectible,
    assets,
    status,
  } = useCollection({
    contractAddress: contractAddress,
    tokenIds,
  });

  const asset = useMemo(() => {
    if (!collectible || !assets || assets.length === 0) return undefined;
    return assets[0];
  }, [collectible, assets]);

  const { entrypoints } = useEntrypoints({
    address: contractAddress || "0x0",
  });

  const disabled = useMemo(() => {
    return !!priceError || !price || price === 0;
  }, [priceError, price]);

  const balance = useMemo(() => {
    if (!asset) return 0;
    return asset.amount || 0;
  }, [asset]);

  const title = useMemo(() => {
    if (!collectible || !asset) return "";
    return asset.name;
  }, [collectible, asset]);

  const image = useMemo(() => {
    if (!collectible || !asset) return placeholder;
    return asset.imageUrls[0] || placeholder;
  }, [collectible, asset]);

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
    const total = (value * (split ? quantity * price : price)) / max;
    return `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [selected, price, split, quantity]);

  const listingData = useMemo(() => {
    if (!asset || !collectible || !selected || !price)
      return {
        assets: [],
        currency: { name: "", image: "", price: 0, value: "" },
      };

    const tokens = Array.from({ length: split ? quantity : 1 }, () => ({
      name:
        !split && quantity > 1 ? `${quantity} ${asset.name}(ડ)` : asset.name,
      image: asset.imageUrls[0] || collectible.imageUrls[0] || placeholder,
      collection: collectible.name,
    }));
    const currency = {
      name: selected.metadata.symbol,
      image: selected.metadata.image || "",
      price: split ? price : quantity * price,
      value: conversion || "",
    };
    return { assets: tokens, currency };
  }, [asset, collectible, selected, price, conversion, quantity, split]);

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

  // Memoize marketplace address
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
    const amount = BigInt(
      (split ? 1 : quantity) * price * 10 ** selected.metadata.decimals,
    );

    const calls: AllowArray<Call> = [
      {
        contractAddress: contractAddress,
        entrypoint: entrypoint,
        calldata: CallData.compile({
          operator: marketplaceAddress,
          approved: true,
        }),
      },
      ...tokenIds.flatMap((tokenId) => {
        return Array.from({ length: split ? quantity : 1 }, () => ({
          contractAddress: marketplaceAddress,
          entrypoint: "list",
          calldata: CallData.compile({
            collection: contractAddress,
            tokenId: cairo.uint256(tokenId),
            quantity: split ? 1 : quantity,
            price: amount.toString(),
            currency: selected.metadata.address,
            expiration: expiration,
            royalties: true,
          }),
        }));
      }),
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
    quantity,
    split,
  ]);

  const submitToast = useCallback(() => {
    toast.marketplace("Listing transaction submitted successfully!", {
      action: "listed",
      itemNames: listingData.assets.map((asset) => asset.name),
      itemImages: listingData.assets.map((asset) => asset.image),
      collectionName: listingData.assets[0].collection,
    });
  }, [toast, listingData]);

  const onSubmitListing = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (!maxFee || !buildTransactions || !controller) {
        return;
      }

      try {
        await controller.execute(buildTransactions, maxFee);
        submitToast();
        // Navigate back to the parent page
        goBack();
      } catch (error) {
        console.error(error);
        toast.error("Failed to list asset(s)");
        throw error;
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
      {status === "loading" || !collectible || !assets ? (
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
                <Quantity
                  quantity={quantity}
                  setQuantity={setQuantity}
                  maximum={balance}
                />
                <Price
                  multiple={quantity > 1 && split}
                  price={price}
                  conversion={conversion}
                  setPrice={setPrice}
                  tokens={tokens}
                  selected={selected}
                  setSelected={handleSelection}
                  error={priceError}
                  setError={setPriceError}
                />
                <SplitListing
                  disabled={quantity <= 1}
                  checked={split}
                  onClick={() => setSplit(!split)}
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
                      variant="secondary"
                      type="button"
                      className="w-1/3"
                      onClick={() =>
                        navigate(`../..?${searchParams.toString()}`)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={disabled}
                      type="submit"
                      className="w-2/3"
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

const Quantity = ({
  maximum,
  quantity,
  setQuantity,
}: {
  maximum: number;
  quantity: number;
  setQuantity: (quantity: number) => void;
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuantity(
        value === "" ? 0 : Number(value) > maximum ? maximum : Number(value),
      );
    },
    [setQuantity, maximum],
  );

  const handlePlus = useCallback(() => {
    setQuantity(quantity + 1);
  }, [setQuantity, quantity]);

  const handleMinus = useCallback(() => {
    setQuantity(quantity - 1);
  }, [setQuantity, quantity]);

  const handleMax = useCallback(() => {
    setQuantity(maximum);
  }, [setQuantity, maximum]);

  return (
    <div className="flex flex-col gap-px select-none">
      <div className="flex items-center justify-between font-semibold text-xs tracking-wider text-foreground-400">
        <p className="py-3">Quantity</p>
        <p
          className="py-3 flex items-center gap-2 cursor-pointer"
          onClick={handleMax}
        >
          Own:
          <span className="font-medium text-foreground-100">{maximum}</span>
        </p>
      </div>
      <div className="flex justify-between items-start gap-3">
        <Input
          size="lg"
          type="number"
          className="grow h-10 pr-20"
          placeholder={(0).toLocaleString()}
          value={quantity.toLocaleString()}
          onChange={handleChange}
        />
        <Button
          variant="secondary"
          size="icon"
          onClick={handleMinus}
          disabled={quantity < 1}
        >
          <MinusIcon size="xs" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handlePlus}
          disabled={quantity >= maximum}
        >
          <PlusIcon size="xs" variant="solid" />
        </Button>
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

const SplitListing = ({
  disabled,
  checked,
  onClick,
}: {
  disabled: boolean;
  checked: boolean;
  onClick: () => void;
}) => {
  const enabled = useMemo(() => {
    return checked && !disabled;
  }, [checked, disabled]);

  return (
    <div
      className="h-8 w-fit flex gap-1 items-center cursor-pointer select-none"
      onClick={onClick}
    >
      <div className="flex items-center justify-center h-full aspect-square">
        <Checkbox
          checked={enabled}
          disabled={disabled}
          size="sm"
          variant="line"
          className={cn("text-foreground-300", enabled && "text-primary-100")}
        />
      </div>
      <p
        data-disabled={disabled}
        className="data-[disabled=true]:text-foreground-400 text-sm text-foreground-100"
      >
        Split into individual listings
      </p>
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
