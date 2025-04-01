import { useToken } from "#hooks/token";
import { Amount } from "@cartridge/ui-next";
import { useCallback } from "react";
import { useParams } from "react-router-dom";

export function SendAmount({
  amount,
  submitted,
  setAmount,
  setError,
}: {
  amount: number | undefined;
  submitted: boolean;
  setAmount: (amount: number | undefined) => void;
  setError: (error: Error | undefined) => void;
}) {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const { token } = useToken({ tokenAddress: tokenAddress! });

  const handleMax = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.preventDefault();
      if (!token) return;
      setAmount(parseFloat(token.balance.amount.toString()));
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
      submitted={submitted}
      conversion={
        !!token.balance.value
          ? `~$${token.balance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : undefined
      }
      balance={parseFloat(token.balance.amount.toString())}
      symbol={token.metadata.symbol}
      decimals={token.metadata.decimals ?? 18}
      setError={setError}
      onChange={handleChange}
      onMax={handleMax}
    />
  );
}
