import {
  ActivityCard,
  Card,
  CardHeader,
  CardTitle,
  cn,
  Thumbnail,
  Token,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";

interface Props {
  token: Token;
}

export function TransactionSending({ token }: Props) {
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
        subTitle={formatAddress(token.metadata.address, { first: 4, last: 4 })}
        variant={"default"}
        className={cn(
          "rounded-none gap-3 hover:bg-background-200 hover:cursor-default",
        )}
      />
    </Card>
  );
}
