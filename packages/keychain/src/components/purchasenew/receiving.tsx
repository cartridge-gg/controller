import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
  Spinner,
  Thumbnail,
} from "@cartridge/ui";
import { ReceivingProps } from "./types";
import { PurchaseItemType } from "@/context/purchase";

export function Receiving({ title, items, isLoading }: ReceivingProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="normal-case font-semibold text-xs">
          {title ?? "Balance"}
        </CardTitle>
        {isLoading && <Spinner size="sm" />}
      </CardHeader>

      <CardListContent>
        {items.map((item) => (
          <CardListItem
            key={item.title}
            className="flex flex-row items-center p-3"
          >
            <div className="flex flex-row items-center gap-3">
              <Thumbnail
                size="lg"
                icon={item.icon}
                variant="light"
                rounded={item.type === PurchaseItemType.CREDIT}
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-foreground-100 font-medium text-sm">
                  {item.type === PurchaseItemType.CREDIT
                    ? "Credits"
                    : item.title}
                </p>
                <p className="text-foreground-300 font-normal text-xs">
                  {item.type === PurchaseItemType.NFT
                    ? item.subtitle
                    : `${item.value?.toLocaleString()} Credits`}
                </p>
              </div>
            </div>
          </CardListItem>
        ))}
      </CardListContent>
    </Card>
  );
}
