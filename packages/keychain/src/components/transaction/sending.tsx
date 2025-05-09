import {
  ActivityCard,
  Card,
  CardHeader,
  CardTitle,
  Thumbnail,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { ERC20 } from "../provider/tokens";
import { useMemo } from "react";

interface Props {
  token: ERC20;
  amount: number;
}

/**
 * @param token - Token to be sent
 * @param amount - Amount of token to be sent
 * @returns
 */
export function TransactionSending({ token, amount }: Props) {
  // Format the price above to USD using the locale, style, and currency.
  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const price = useMemo(
    () =>
      (Number(token.price?.amount) / Math.pow(10, token.price?.decimals || 0)) *
      amount,
    [token.price, amount],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs">
          Destination
        </CardTitle>
      </CardHeader>
      <ActivityCard
        Logo={<Thumbnail icon={token.icon} size="lg" variant="light" rounded />}
        title={token.symbol}
        subTitle={`${amount} ${token.symbol}`}
        topic={USDollar.format(price)}
        variant={"default"}
        className={cn(
          "rounded-none gap-3 hover:bg-background-200 hover:cursor-default",
        )}
      />
    </Card>
  );
}
