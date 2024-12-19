import { useToken } from "@/hooks/token";
import { AlertIcon, Button, cn, Input, Label } from "@cartridge/ui-next";
import { useCountervalue } from "@cartridge/utils";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { formatBalance } from "../helper";

export function Amount({
  amount,
  setAmount,
}: {
  amount: number | undefined;
  setAmount: (amount: number | undefined) => void;
}) {
  const { address: tokenAddress } = useParams<{ address: string }>();
  const token = useToken({ tokenAddress: tokenAddress! });

  const handleMax = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>,
    ) => {
      e.preventDefault();
      if (!token) return;
      setAmount(parseFloat(token.balance.formatted));
    },
    [token, setAmount],
  );

  const { countervalue } = useCountervalue(
    {
      balance: amount?.toString() ?? "0",
      pair: `${token?.meta.symbol}_USDC` as TokenPair,
    },
    {
      enabled: token && ["ETH", "STRK"].includes(token.meta.symbol) && !!amount,
    },
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAmount(value === "" ? undefined : Number(value));
    },
    [setAmount],
  );

  const error = useMemo(() => {
    if (!token) return "";
    if (amount && amount > parseFloat(token.balance.formatted))
      return "Amount cannot exceed balance";
    const decimals = token.meta.decimals ?? 18;
    const minAmountStr = `0.${"0".repeat(decimals - 1)}1`;
    if (amount && amount < parseFloat(minAmountStr))
      return `Amount must be at least ${minAmountStr} ${token.meta.symbol}`;
    return "";
  }, [token, amount]);

  if (!token) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-px">
      <div className="flex items-center justify-between">
        <Label className="py-3 text-[11px]/3 uppercase font-bold">Amount</Label>
        <div className="flex items-center gap-2">
          <p className="text-[11px]/3 uppercase font-bold text-quaternary-foreground">
            Balance:
          </p>
          <div
            className="text-[11px]/3 uppercase font-bold cursor-pointer hover:opacity-90"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => handleMax(e)}
          >
            {`${formatBalance(token.balance.formatted, ["~"])} ${
              token.meta.symbol
            }`}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <div className="relative">
          <Input
            type="number"
            className="bg-quaternary pr-12 border border-quaternary focus-visible:border-muted focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none"
            placeholder={(0.01).toLocaleString()}
            value={amount}
            onChange={handleChange}
          />
          {countervalue && (
            <span className="absolute right-14 top-3.5 text-sm text-muted-foreground">
              {formatBalance(countervalue.formatted)}
            </span>
          )}
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs/3 font-bold uppercase px-2 py-1.5 h-7 bg-muted text-secondary-foreground hover:opacity-70"
            variant="ghost"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMax(e)}
          >
            Max
          </Button>
        </div>
        <div
          className={cn(
            "flex items-center gap-x-1 text-destructive-foreground",
            !error && "hidden",
          )}
        >
          <AlertIcon className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    </div>
  );
}
