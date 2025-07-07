import { Amount } from "@cartridge/ui";
import { useCallback } from "react";

export function SendAmount({
  amount,
  balance,
  submitted,
  setAmount,
  setError,
}: {
  amount: number | undefined;
  balance: number;
  submitted: boolean;
  setAmount: (amount: number | undefined) => void;
  setError: (error: Error | undefined) => void;
}) {
  const handleMax = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.preventDefault();
      setAmount(balance);
    },
    [setAmount, balance],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAmount(value === "" ? undefined : Number(value));
    },
    [setAmount],
  );

  const handlePlus = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.preventDefault();
      setAmount((amount || 0) + 1);
    },
    [amount, setAmount],
  );

  const handleMinus = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.preventDefault();
      if (!amount || amount <= 1) return;
      setAmount(amount - 1);
    },
    [amount, setAmount],
  );

  return (
    <Amount
      amount={amount}
      submitted={submitted}
      conversion={""}
      balance={balance}
      symbol={""}
      decimals={0}
      setError={setError}
      onChange={handleChange}
      onMax={handleMax}
      title="Quantity"
      label="Own"
      min={1}
      max={balance}
      onPlus={handlePlus}
      onMinus={handleMinus}
    />
  );
}
