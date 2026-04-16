import {
  ActivityCard,
  Card,
  CardHeader,
  CardListContent,
  CardTitle,
  cn,
  Spinner,
  Thumbnail,
} from "@cartridge/controller-ui";
import { ReceivingProps } from "./types";
import { ItemType } from "@/context";
import { formatUsdValue } from "@/utils/format-value";

export function Receiving({
  title,
  items,
  showTotal,
  isLoading,
  showPrice = true,
  isFree,
  description,
}: ReceivingProps) {
  const rounded = items.length === 1;
  return (
    <Card>
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between h-10",
          "bg-transparent px-0",
        )}
      >
        <CardTitle className="normal-case font-normal text-xs">
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
                topic={
                  showPrice && item.value
                    ? formatUsdValue(item.value)
                    : undefined
                }
                variant="default"
                className={cn(
                  "pointer-events-none",
                  rounded ? "rounded-lg" : "rounded-none",
                )}
                badge={isFree === true ? "FREE" : undefined}
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
                topic={
                  showPrice && item.value
                    ? formatUsdValue(item.value)
                    : undefined
                }
                variant="default"
                className={cn(
                  "pointer-events-none",
                  rounded ? "rounded-lg" : "rounded-none",
                )}
                badge={isFree === true ? "FREE" : undefined}
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
                className={cn(
                  "pointer-events-none",
                  rounded ? "rounded-lg" : "rounded-none",
                )}
                badge={isFree === true ? "FREE" : undefined}
              />
            );
          })}
        {description && (
          <div className="text-xs text-foreground-300 font-normal h-9 w-full border border-background-200 rounded-sm mt-4 p-2.5">
            {description}
          </div>
        )}
      </CardListContent>
    </Card>
  );
}
