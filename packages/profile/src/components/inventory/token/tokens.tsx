import { TokenCard } from "@cartridge/ui-next";
import { Link } from "react-router-dom";
import { Balance, ERC20Metadata, useCountervalue } from "@cartridge/utils";
import { formatEther } from "viem";
import { useTokens } from "#hooks/token";
import { formatBalance } from "./helper";
import { useMemo } from "react";
import placeholder from "/public/placeholder.svg";

export function Tokens() {
  const erc20 = useTokens();

  const tokens = useMemo(
    () =>
      erc20.data.map((t) => ({
        balance: t.balance,
        meta: t.meta,
      })),
    [erc20.data],
  );

  const tokenData = useMemo(
    () =>
      tokens.map((token) => ({
        balance: formatEther(token.balance.value || 0n),
        address: token.meta.address,
      })),
    [tokens],
  );

  const { countervalues } = useCountervalue({
    tokens: tokenData,
  });

  return (
    <div
      className="rounded overflow-clip w-full flex flex-col gap-y-px"
      style={{ scrollbarWidth: "none" }}
    >
      {tokens.map((token) => (
        <TokenCardContent
          key={token.meta.address}
          token={token}
          values={countervalues}
        />
      ))}
    </div>
  );
}

function TokenCardContent({
  token,
  values,
}: {
  token: { balance: Balance; meta: ERC20Metadata };
  values: ReturnType<typeof useCountervalue>["countervalues"];
}) {
  const value = useMemo(
    () => values.find((v) => v?.address === token.meta.address),
    [values, token.meta.address],
  );
  const change = useMemo(() => {
    if (!value) {
      return 0;
    }
    return value.current.value - value.period.value;
  }, [value]);

  return (
    <Link to={`token/${token.meta.address}`}>
      <TokenCard
        image={token.meta.logoUrl || placeholder}
        title={token.meta.name}
        amount={`${formatBalance(token.balance.formatted, ["~"])} ${token.meta.symbol}`}
        value={value ? formatBalance(value.current.formatted, ["~"]) : ""}
        change={
          !change
            ? undefined
            : change > 0
              ? `+$${change.toFixed(2)}`
              : `-$${(-change).toFixed(2)}`
        }
      />
    </Link>
  );
}
