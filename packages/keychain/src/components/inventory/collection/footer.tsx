import { Token, Separator } from "@cartridge/ui";
import { Total } from "@/components/Total";
import { ERC20 } from "@/components/provider/tokens";
import { useMemo } from "react";
import { useCountervalue } from "@cartridge/ui/utils";

export function CollectionFooter({
  token,
  orders,
  fees,
  totalPrice,
  feeDecimals,
}: {
  token: Token;
  orders: { name: string; amount: string }[];
  fees: { label: string; amount: number; percentage: number }[];
  totalPrice: number;
  feeDecimals?: number;
}) {
  const erc20 = {
    address: token.metadata.address,
    symbol: token.metadata.symbol,
    icon: token.metadata.image,
  } as ERC20;

  const tokenData = useMemo(
    () => ({
      tokens: [
        {
          balance: totalPrice.toString(),
          address: token.metadata.address,
        },
      ],
    }),
    [totalPrice, token],
  );
  const { countervalues } = useCountervalue(tokenData);
  const usdValue = useMemo(
    () => countervalues?.[0]?.current?.value ?? 0,
    [countervalues],
  );

  return (
    <Total
      label="Total"
      token={erc20}
      totalValue={totalPrice}
      decimals={feeDecimals}
      usdValue={usdValue}
      tooltipContents={
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 text-foreground-300">
            {orders.map((order, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span>{order.name}</span>
                <span>
                  {order.amount} {token.metadata.symbol}
                </span>
              </div>
            ))}
          </div>
          <Separator className="bg-background-100" />
          <div className="flex flex-col gap-1 text-foreground-300">
            {fees
              .filter((fee) => fee.amount > 0)
              .map((fee) => (
                <div
                  key={fee.label}
                  className="flex items-center justify-between gap-4 text-xs"
                >
                  {fee.label}
                  <div className="flex items-center gap-1">
                    <span>
                      {fee.amount.toLocaleString(undefined, {
                        maximumFractionDigits: feeDecimals,
                      })}
                    </span>
                    <span>{token.metadata.symbol}</span>
                    <span>({fee.percentage.toFixed(2)}%)</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      }
    />
  );
}
