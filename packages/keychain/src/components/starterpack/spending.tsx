import {
  ActivityCard,
  Card,
  CardHeader,
  CardTitle,
  Thumbnail,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useMemo } from "react";

type BalanceProps = {
  title?: string;
  price: number;
  unit: "USDC" | "CREDITS";
};

export function Spending({ title, price, unit }: BalanceProps) {
  const Logo = useMemo(
    () => (
      <Thumbnail
        icon={
          unit === "USDC"
            ? "https://static.cartridge.gg/tokens/usdc.svg"
            : "https://static.cartridge.gg/presets/credit/icon.svg"
        }
        size="lg"
        rounded
      />
    ),
    [unit],
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
        title={unit}
        subTitle={`${price.toString()} ${unit}`}
        topic={`$${price.toFixed(2).toString()}`}
        subTopic={""}
        variant={"default"}
        className={cn("rounded-none")}
      />
    </Card>
  );
}
