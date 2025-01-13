import { cn } from "@cartridge/ui-next";
import { Card, CardHeader, CardTitle } from "@cartridge/ui-next";

export function Pinned({
  icon,
  title,
  empty,
}: {
  icon: string;
  title: string;
  empty?: boolean;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader
        className={cn(
          "flex flex-col justify-between items-center h-36 py-6",
          empty && "bg-background border border-dashed border-background-100",
        )}
      >
        <div className="flex justify-center items-center w-12 h-12">
          <div
            className={cn(
              "w-8 h-8",
              empty ? "opacity-10" : "text-primary",
              !icon ? "fa-trophy" : icon,
              empty ? "fa-thin" : "fa-solid",
            )}
          />
        </div>
        <Title title={title} empty={empty} />
      </CardHeader>
    </Card>
  );
}

function Title({ title, empty }: { title: string; empty?: boolean }) {
  return (
    <CardTitle
      className={cn(
        "grow flex flex-col justify-center items-center capitalize font-normal text-sm",
        empty ? "opacity-50" : "text-foreground",
      )}
    >
      <p className="capitalize break-words text-center text-ellipsis line-clamp-2">
        {title}
      </p>
    </CardTitle>
  );
}

export function Empty() {
  return <Pinned icon={"fa-spider-web"} title="Empty" empty={true} />;
}
