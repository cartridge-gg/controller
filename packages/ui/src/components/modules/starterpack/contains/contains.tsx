import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
} from "@/index";

interface ReceivingProps {
  title?: string;
  items: StarterItemData[];
}

export interface StarterItemData {
  title: string;
  description: string;
  image: string;
}

export function StarterpackContains({ title, items }: ReceivingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case font-semibold text-xs w-full flex items-center justify-between">
          <span>{title ?? "Contains"}</span>
          <div className="bg-background-300 py-0.5 px-1.5 rounded-full">
            <span className="text-foreground-300">{items.length} total</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardListContent>
        {items.map((item) => (
          <CardListItem className="flex flex-row items-center p-3">
            <div className="flex flex-row items-center gap-3">
              <img src={item.image} className="size-8" />
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
