import {
  ActivityCard,
  Card,
  CardHeader,
  CardTitle,
  cn,
  Thumbnail,
  Token,
} from "@cartridge/ui-next";

interface Props {
  token: Token;
  amount: number;
}

export function TransactionSending({ token, amount }: Props) {
  // Format the price above to USD using the locale, style, and currency.
  const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs">
          Destination
        </CardTitle>
      </CardHeader>
      <ActivityCard
        Logo={
          <Thumbnail
            icon={token.metadata.image}
            size="lg"
            variant="light"
            rounded
          />
        }
        title={token.metadata.symbol}
        subTitle={`${amount} ${token.metadata.symbol}`}
        topic={USDollar.format(token.balance.value)}
        variant={"default"}
        className={cn(
          "rounded-none gap-3 hover:bg-background-200 hover:cursor-default",
        )}
      />
    </Card>
  );
}
