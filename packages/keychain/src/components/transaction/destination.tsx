import {
  ActivityCard,
  Card,
  CardHeader,
  CardTitle,
  cn,
  OlmechIcon,
  Thumbnail,
  WalletType,
} from "@cartridge/ui-next";
import { formatAddress } from "@cartridge/utils";

interface Props {
  wallet: WalletType;
  address: string;
  name?: string;
}

export function TransactionDestination({ address, name }: Props) {
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
            icon={<OlmechIcon variant="six" size="lg" />}
            size="lg"
            variant="light"
            rounded
          />
        }
        title={name || formatAddress(address, { first: 4, last: 4 })}
        subTitle={name ? formatAddress(address, { first: 4, last: 4 }) : ""}
        variant={"default"}
        titleClassName="normal-case"
        className={cn(
          "rounded-none gap-3 hover:bg-background-200 hover:cursor-default",
        )}
      />
    </Card>
  );
}
