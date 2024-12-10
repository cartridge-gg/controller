import { Amount } from "@cartridge/ui-next";
import { useCountervalue } from "@cartridge/utils";
import { Erc20BalancesQuery, TokenPair } from "@cartridge/utils/api/cartridge";
import { useCallback } from "react";

export function SendAmount({
  balance,
  setAmount,
  setError,
}: {
  balance: Erc20BalancesQuery["balances"]["edges"][0]["node"];
  setAmount: (amount: number | undefined) => void;
  setError: (error: Error | undefined) => void;
}) {
  const handleMax = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.preventDefault();
      setAmount(balance.amount);
    },
    [balance, setAmount],
  );

  const { countervalue } = useCountervalue(
    {
      balance: balance.amount.toString() ?? "0",
      pair: `${balance.meta.symbol}_USDC` as TokenPair,
    },
    {
      enabled:
        ["ETH", "STRK"].includes(balance.meta.symbol) && !!balance.amount,
    },
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAmount(value === "" ? undefined : Number(value));
    },
    [setAmount],
  );

  return (
    <Amount
      amount={balance.amount}
      conversion={countervalue?.formatted}
      balance={balance.amount}
      symbol={balance.meta.symbol}
      decimals={balance.meta.decimals ?? 18}
      setError={setError}
      onChange={handleChange}
      onMax={handleMax}
    />
  );
}
