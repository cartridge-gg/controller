import { Amount } from "@cartridge/ui-next";
import {
  convertTokenAmountToUSD,
  formatBalance,
  useToken,
} from "@cartridge/utils";
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
      setAmount(parseFloat(formatBalance(token.balance ?? 0n)));
    },
    [token, setAmount],
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
      conversion={
        token.balance !== undefined && token.price !== undefined
          ? convertTokenAmountToUSD(token.balance, token.decimals, token.price)
          : undefined
      }
      balance={parseFloat(formatBalance(token.balance ?? 0n))}
      symbol={token.symbol}
      decimals={token.decimals ?? 18}
      setError={setError}
      onChange={handleChange}
      onMax={handleMax}
    />
  );
}
