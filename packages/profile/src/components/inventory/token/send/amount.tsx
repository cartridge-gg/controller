import { Amount } from "@cartridge/ui-next";
import { formatBalance, useCountervalue, useToken } from "@cartridge/utils";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

export function SendAmount({
  amount,
  setAmount,
  setError,
}: {
  amount: number | undefined;
  setAmount: (amount: number | undefined) => void;
  setError: (error: Error | undefined) => void;
}) {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { token } = useToken(tokenAddress!);

  const handleMax = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.preventDefault();
      if (!token) return;
      setAmount(
        parseFloat(formatBalance(token.balance ?? 0n).replace("~", "")),
      );
    },
    [token, setAmount],
  );

  const { countervalue } = useCountervalue(
    {
      balance: amount?.toString() ?? "0",
      pair: `${token.symbol}_USDC` as TokenPair,
    },
    {
      enabled: token && ["ETH", "STRK"].includes(token.symbol) && !!amount,
    },
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAmount(value === "" ? undefined : Number(value));
    },
    [setAmount],
  );

  if (!token) {
    return null;
  }

  return (
    <Amount
      amount={amount}
      conversion={countervalue?.formatted}
      balance={parseFloat(formatBalance(token.balance ?? 0n).replace("~", ""))}
      symbol={token.symbol}
      decimals={token.decimals ?? 18}
      setError={setError}
      onChange={handleChange}
      onMax={handleMax}
    />
  );
}
