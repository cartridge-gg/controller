import { Token } from "@/hooks/token";
import { formatUsdValue } from "@/utils/format-value";
import { Amount } from "@cartridge/controller-ui";
import { useCallback, useMemo } from "react";

export function SendAmount({
  token,
  amount,
  submitted,
  setAmount,
  setAmountInput,
  setError,
}: {
  token: Token;
  amount: number | undefined;
  submitted: boolean;
  setAmount: (amount: number | undefined) => void;
  setAmountInput: (amount: string | undefined) => void;
  setError: (error: Error | undefined) => void;
}) {
  const conversion = useMemo(() => {
    if (!token || !token.balance.value || !amount) return undefined;
    const value = token.balance.value;
    const max = token.balance.amount;
    const total = (value * amount) / max;
    return formatUsdValue(total);
  }, [token, amount]);

  const handleMax = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.preventDefault();
      if (!token) return;
      const max = token.balance.amount.toString();
      setAmount(parseFloat(max));
      setAmountInput(max);
    },
    [token, setAmount, setAmountInput],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAmount(value === "" ? undefined : Number(value));
      setAmountInput(value === "" ? undefined : value);
    },
    [setAmount, setAmountInput],
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
