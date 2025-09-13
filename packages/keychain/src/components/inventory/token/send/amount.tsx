import { Token } from "@/hooks/token";
import { Amount } from "@cartridge/ui";
import { useCallback, useMemo } from "react";

export function SendAmount({
  token,
  amount,
  submitted,
  setAmount,
  setError,
}: {
  token: Token;
  amount: number | undefined;
  submitted: boolean;
  setAmount: (amount: number | undefined) => void;
  setError: (error: Error | undefined) => void;
}) {
  const conversion = useMemo(() => {
    if (!token || !token.balance.value || !amount) return undefined;
    const value = token.balance.value;
    const max = token.balance.amount;
    const total = (value * amount) / max;
    return `$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [token, amount]);

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
      conversion={conversion}
      balance={parseFloat(token.balance.amount.toString())}
      symbol={token.metadata.symbol}
      decimals={token.metadata.decimals ?? 18}
      setError={setError}
      onChange={handleChange}
      onMax={handleMax}
    />
  );
}
