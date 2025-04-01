import { TokenCard } from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import { Token, useTokens } from "#hooks/token";
import placeholder from "/public/placeholder.svg";

export function Tokens() {
  const { tokens } = useTokens();

  return (
    <div
      className="rounded overflow-clip w-full flex flex-col gap-y-px"
      style={{ scrollbarWidth: "none" }}
    >
      {tokens
        .filter((token) => token.balance.amount !== 0)
        .map((token) => (
          <TokenCardContent key={token.metadata.address} token={token} />
        ))}
    </div>
  );
}

function TokenCardContent({ token }: { token: Token }) {
  return (
    <Link to={`token/${token.metadata.address}`}>
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
