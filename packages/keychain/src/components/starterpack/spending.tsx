import {
  ActivityCard,
  Card,
  CardHeader,
  CardTitle,
  cn,
  Thumbnail,
} from "@cartridge/ui-next";
import { useMemo } from "react";

type BalanceProps = {
  title?: string;
  price: number;
};

export function Spending({ title, price }: BalanceProps) {
  const Logo = useMemo(
    () => (
      <Thumbnail
        icon={"https://static.cartridge.gg/presets/credit/icon.svg"}
        size="lg"
        rounded
      />
    ),
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs">
          {title ?? "Spending"}
        </CardTitle>
      </CardHeader>
      <ActivityCard
        Logo={Logo}
        title="Credits"
        subTitle={`${(price * 10).toString()} Credits`}
        topic={`$${price.toFixed(2).toString()}`}
        subTopic={""}
        variant={"default"}
        className={cn("rounded-none")}
      />
    </Card>
  );
}
