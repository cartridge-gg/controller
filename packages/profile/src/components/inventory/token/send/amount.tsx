import { useToken } from "#hooks/token";
import { Amount } from "@cartridge/ui-next";
import { useCountervalue } from "@cartridge/utils";
import { useCallback, useMemo } from "react";
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
  const token = useToken({ tokenAddress: tokenAddress! });

  const handleMax = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
      e.preventDefault();
      if (!token) return;
      setAmount(parseFloat(token.balance.formatted.replace("~", "")));
    },
    [token, setAmount],
  );

  const { countervalues } = useCountervalue(
    {
      tokens: [
        {
          balance: amount?.toString() ?? "0",
          address: token?.meta.address || "0x0",
        },
      ],
    },
    {
      enabled: !!token && !!amount,
    },
  );
  const countervalue = useMemo(
    () => countervalues.find((v) => v?.address === token?.meta.address),
    [countervalues, token?.meta.address],
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
      conversion={countervalue?.current.formatted}
      balance={parseFloat(token.balance.formatted.replace("~", ""))}
      symbol={token.meta.symbol}
      decimals={token.meta.decimals ?? 18}
      setError={setError}
      onChange={handleChange}
      onMax={handleMax}
    />
  );
}
