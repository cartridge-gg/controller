import {
  ActivityCard,
  Card,
  CardHeader,
  CardTitle,
  cn,
  Thumbnail,
} from "@cartridge/ui-next";
import { useMemo } from "react";

type TransactionDestinationProps = {
  address: string;
  imageURL?: string;
};

export function TransactionDestination({
  address,
  imageURL,
}: TransactionDestinationProps) {
  const Logo = useMemo(
    () => (
      <Thumbnail
        icon={
          imageURL
            ? "https://static.cartridge.gg/tokens/usdc.svg"
            : "https://static.cartridge.gg/presets/credit/icon.svg"
        }
        size="lg"
        rounded
      />
    ),
    [imageURL],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs">
          Destination
        </CardTitle>
      </CardHeader>
      <ActivityCard
        Logo={Logo}
        title={address}
        subTitle={address}
        topic={address}
        subTopic={""}
        variant={"default"}
        className={cn("rounded-none")}
      />
    </Card>
  );
}
