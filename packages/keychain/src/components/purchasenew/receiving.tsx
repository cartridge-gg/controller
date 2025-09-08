import {
  Card,
  CardHeader,
  CardListContent,
  CardTitle,
  Spinner,
} from "@cartridge/ui";
import { ReceivingProps } from "./types";
import { StarterItemType } from "@/hooks/starterpack";
import { StarterItem } from "./starterpack/starter-item";

export function Receiving({
  title,
  items,
  showTotal,
  isLoading,
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
          .filter((item) => item.type === StarterItemType.NFT)
          .map((item, index) => (
            <StarterItem
              key={index}
              {...item}
              containerClassName="pt-0"
              className="rounded-none"
            />
          ))}
        {items
          .filter((item) => item.type === StarterItemType.CREDIT)
          .map((item, index) => (
            <StarterItem key={index} {...item} />
          ))}
      </CardListContent>
    </Card>
  );
}
