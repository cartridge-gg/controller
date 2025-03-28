import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
  Thumbnail,
} from "@cartridge/ui-next";
import { StarterItemData, StarterItemType } from "../../context/starterpack";

type ReceivingProps = {
  title?: string;
  items: StarterItemData[];
};

export function Receiving({ title, items }: ReceivingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs">
          {title ?? "Balance"}
        </CardTitle>
      </CardHeader>

      <CardListContent>
        {items.map((item) => (
          <CardListItem className="flex flex-row items-center p-3">
            <div className="flex flex-row items-center gap-3">
              {/* <img src={item.image} className="size-8" /> */}
              <Thumbnail
                rounded={item.type === StarterItemType.CREDIT}
                icon={item.image}
                size="lg"
                className="aspect-square"
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-foreground-100 font-medium text-sm">
                  {item.title}
                </p>
                <p className="text-foreground-300 font-normal text-xs">
                  {item.description}
                </p>
              </div>
            </div>
          </CardListItem>
        ))}
      </CardListContent>
    </Card>
  );
}
