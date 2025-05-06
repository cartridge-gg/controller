import { StarterItemData, StarterItemType } from "@/hooks/starterpack";
import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
  Spinner,
  Thumbnail,
} from "@cartridge/ui-next";

type ReceivingProps = {
  title?: string;
  items: StarterItemData[];
  isLoading?: boolean;
};

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
          <CardListItem className="flex flex-row items-center p-3">
            <div className="flex flex-row items-center gap-3">
              <Thumbnail
                size="lg"
                icon={item.image}
                variant="light"
                rounded={item.type === StarterItemType.CREDIT}
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-foreground-100 font-medium text-sm">
                  {item.type === StarterItemType.CREDIT
                    ? "Credits"
                    : item.title}
                </p>
                <p className="text-foreground-300 font-normal text-xs">
                  {item.type === StarterItemType.NFT
                    ? item.collectionName || item.description
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
