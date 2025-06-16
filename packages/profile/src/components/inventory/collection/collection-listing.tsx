import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
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
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCollection } from "#hooks/collection";
import placeholder from "/public/placeholder.svg";
import { ListHeader } from "./send/header";
import { useTokens } from "#hooks/token";
import { useConnection } from "#hooks/context.js";
import {
  AllowArray,
  cairo,
  Call,
  CallData,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { useMarketplace } from "#hooks/marketplace.js";
import { toast } from "sonner";
import { useEntrypoints } from "#hooks/entrypoints.js";

const SET_APPROVAL_FOR_ALL_CAMEL_CASE = "setApprovalForAll";
const SET_APPROVAL_FOR_ALL_SNAKE_CASE = "set_approval_for_all";

const WEEK = 60 * 60 * 24 * 7;
const MONTH = 60 * 60 * 24 * 30;
const THREE_MONTHS = 60 * 60 * 24 * 90;
const NEVER = 0;
const EXPIRATIONS = [
  { duration: WEEK, label: "1w" },
  { duration: MONTH, label: "1mo" },
  { duration: THREE_MONTHS, label: "3mo" },
  { duration: NEVER, label: "Never" },
];

export function CollectionListing() {
  const { chainId, provider } = useMarketplace();
  const { parent, closable, provider: mainProvider } = useConnection();
  const { address: contractAddress, tokenId } = useParams();
  const [searchParams] = useSearchParams();
  const paramsTokenIds = searchParams.getAll("tokenIds");
  const { tokens } = useTokens();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Token | undefined>();
  const [duration, setDuration] = useState<number>(MONTH);
  const [price, setPrice] = useState<number | undefined>();
  const [priceError, setPriceError] = useState<Error | undefined>();
  const [userSelected, setUserSelected] = useState<boolean>(false);

  const navigate = useNavigate();

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
    if (assets.length > 1) return collection.imageUrl || placeholder;
    return assets[0].imageUrl || placeholder;
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

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  const handleSelection = useCallback(
    (token: Token) => {
      setSelected(token);
      setUserSelected(true);
    },
    [setSelected],
  );

  const handleList = useCallback(async () => {
    setSubmitted(true);
    if (
      !contractAddress ||
      !tokenIds ||
      !tokenIds.length ||
      !selected ||
      !price ||
      price === 0 ||
      !entrypoint
    )
      return;
    setLoading(true);
    try {
      const expiration = Math.floor(
        new Date(Date.now() + duration * 1000).getTime() / 1000,
      );
      const marketplaceAddress: string = provider.manifest.contracts.find(
        (c: { tag: string }) => c.tag?.includes("Marketplace"),
      )?.address;
      const amount =
        BigInt(price) * BigInt(10n ** BigInt(selected.metadata.decimals));

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
        toast.success(`Asset(s) listed successfully`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to list asset(s)`);
    } finally {
      setLoading(false);
    }
    if (closable) {
      navigate(`../..?${searchParams.toString()}`);
    } else {
      navigate(`..?${searchParams.toString()}`);
    }
  }, [
    tokenIds,
    contractAddress,
    price,
    selected,
    duration,
    closable,
    navigate,
    searchParams,
    chainId,
    parent,
    entrypoint,
  ]);

  useEffect(() => {
    if (userSelected || tokens.length === 0) return;
    setSelected(tokens[0]);
  }, [tokens, userSelected]);

  if (!selected || tokens.length === 0) return null;

  return (
    <LayoutContainer>
      <LayoutHeader className="hidden" onBack={handleBack} />
      {status === "loading" || !collection || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className="p-6 flex flex-col gap-4">
            <ListHeader image={image} title={title} />
            <Price
              multiple={assets.length > 1}
              submitted={submitted}
              price={price}
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
              "relative flex flex-col items-center justify-center gap-y-4 bg-background",
            )}
          >
            <div className="w-full flex items-center gap-3">
              <Button
                variant="secondary"
                type="button"
                className="w-1/3"
                onClick={() => navigate(`../../..?${searchParams.toString()}`)}
              >
                Cancel
              </Button>
              <Button
                disabled={disabled}
                type="submit"
                className="w-2/3"
                isLoading={loading}
                onClick={handleList}
              >
                Review
              </Button>
            </div>
          </LayoutFooter>
        </>
      )}
    </LayoutContainer>
  );
}

const Price = ({
  multiple,
  submitted,
  price,
  setPrice,
  tokens,
  selected,
  setSelected,
  error,
  setError,
}: {
  multiple: boolean;
  submitted: boolean;
  price: number | undefined;
  setPrice: (price: number | undefined) => void;
  tokens: Token[];
  selected: Token;
  setSelected: (token: Token) => void;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
}) => {
  const conversion = useMemo(() => {
    if (!selected || !selected.balance.value || !price) return undefined;
    const value = selected.balance.value;
    const max = selected.balance.amount;
    const total = (value * price) / max;
    return `~$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [selected, price]);

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
    if (submitted && !price) {
      const message = "Price cannot be null";
      setError(new Error(message));
      return;
    }
    setError(undefined);
  }, [price, submitted, setError]);

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
