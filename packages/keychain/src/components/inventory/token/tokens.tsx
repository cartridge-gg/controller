import { Empty, MinusIcon, PlusIcon, Skeleton, TokenCard } from "@cartridge/ui";
import { Link, useSearchParams } from "react-router-dom";
import { Token, useTokens } from "@/hooks/token";
import placeholder from "/placeholder.svg?url";
import { useMemo, useState } from "react";

import { cn } from "@cartridge/ui/utils";
import { getChecksumAddress } from "starknet";

const DEFAULT_TOKENS_COUNT = 2;

export function Tokens() {
  const { tokens, contracts: toriiContracts, credits, status } = useTokens();
  const [unfolded, setUnfolded] = useState(false);

  const filteredTokens = useMemo(() => {
    return tokens
      .filter(
        (token) =>
          token.balance.amount > 0 ||
          toriiContracts.includes(getChecksumAddress(token.metadata.address)),
      )
      .sort((a, b) => b.balance.amount - a.balance.amount)
      .sort((a, b) => b.balance.value - a.balance.value)
      .sort((a, b) => {
        const aIn = toriiContracts.includes(
          getChecksumAddress(a.metadata.address),
        );
        const bIn = toriiContracts.includes(
          getChecksumAddress(b.metadata.address),
        );
        return !aIn && bIn ? 1 : aIn && !bIn ? -1 : 0;
      });
  }, [tokens, toriiContracts]);

  return status === "loading" ? (
    <LoadingState />
  ) : status === "error" ? (
    <EmptyState />
  ) : (
    <div
      className="rounded overflow-clip w-full flex flex-col gap-y-px"
      style={{ scrollbarWidth: "none" }}
    >
      <TokenCardContent token={credits} />
      {filteredTokens
        .slice(0, unfolded ? tokens.length : DEFAULT_TOKENS_COUNT)
        .map((token) => (
          <TokenCardContent key={token.metadata.address} token={token} />
        ))}
      <div
        className={cn(
          "flex justify-center items-center gap-1 p-2 rounded-b cursor-pointer",
          "bg-background-200 hover:bg-background-300 text-foreground-300 hover:text-foreground-200",
          tokens.length <= DEFAULT_TOKENS_COUNT && "hidden",
        )}
        onClick={() => setUnfolded(!unfolded)}
      >
        {unfolded ? (
          <MinusIcon size="xs" />
        ) : (
          <PlusIcon variant="solid" size="xs" />
        )}
        <p className="text-sm font-medium">
          {unfolded ? "Show Less" : "View All"}
        </p>
      </div>
    </div>
  );
}

function TokenCardContent({ token }: { token: Token }) {
  const [searchParams] = useSearchParams();
  return (
    <Link to={`./token/${token.metadata.address}?${searchParams.toString()}`}>
      <TokenCard
        image={token.metadata.image || placeholder}
        title={token.metadata.name}
        amount={`${token.balance.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${token.metadata.symbol}`}
        value={
          token.balance.value
            ? `$${token.balance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : ""
        }
        change={
          token.balance.change === 0
            ? undefined
            : token.balance.change > 0
              ? `+$${token.balance.change.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : `-$${(-token.balance.change).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
        }
      />
    </Link>
  );
}

const LoadingState = () => {
  return <Skeleton className="w-full h-[259px] rounded" />;
};

const EmptyState = () => {
  return (
    <Empty
      title="No asset has been found in your inventory."
      icon="inventory"
      className="h-full"
    />
  );
};
