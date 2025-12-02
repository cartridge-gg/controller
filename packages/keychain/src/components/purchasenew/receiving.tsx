import {
  ActivityCard,
  Card,
  CardHeader,
  CardListContent,
  CardTitle,
  Spinner,
  Thumbnail,
} from "@cartridge/ui";
import { ReceivingProps } from "./types";
import { ItemType } from "@/context";

// Helper function to format price display
const formatPrice = (value: number | undefined, showPrice: boolean): string => {
  if (!showPrice || !value) return "";
  return `$${value.toFixed(2)}`;
};

export function Receiving({
  title,
  items,
  showTotal,
  isLoading,
  showPrice = true,
}: ReceivingProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between h-10">
        <CardTitle className="normal-case font-semibold text-xs">
          {title ?? "Balance"}
        </CardTitle>
        {isLoading && <Spinner size="sm" />}
        {showTotal && !isLoading && (
          <div className="bg-background-300 text-foreground-300 rounded-full px-2 py-0.5 text-xs">
            {items.length} total
          </div>
        )}
      </CardHeader>

      <CardListContent>
        {items
          .filter((item) => item.type === ItemType.CREDIT)
          .map((item, index) => {
            const Logo = (
              <Thumbnail
                icon="https://static.cartridge.gg/presets/credit/icon.svg"
                size="lg"
                rounded
              />
            );
            return (
              <ActivityCard
                key={index}
                Logo={Logo}
                title="Credits"
                subTitle={item.value ? `${item.value} CREDITS` : "CREDITS"}
                topic={formatPrice(item.value, showPrice)}
                variant="default"
                className="rounded-none"
              />
            );
          })}
        {items
          .filter((item) => item.type === ItemType.ERC20)
          .map((item, index) => {
            const Logo = <Thumbnail icon={item.icon} size="lg" rounded />;

            return (
              <ActivityCard
                key={index}
                Logo={Logo}
                title={item.title}
                subTitle={
                  item.value ? `${item.value} ${item.title}` : item.title
                }
                topic={formatPrice(item.value, showPrice)}
                variant="default"
                className="rounded-none"
              />
            );
          })}
        {items
          .filter((item) => item.type === ItemType.NFT)
          .map((item, index) => {
            const Logo = (
              <Thumbnail icon={item.icon} size="lg" rounded={false} />
            );

            return (
              <ActivityCard
                key={index}
                Logo={Logo}
                title={item.title}
                subTitle={item.subtitle || "NFT"}
                topic=""
                variant="default"
                className="rounded-none"
              />
            );
          })}
      </CardListContent>
    </Card>
  );
}
