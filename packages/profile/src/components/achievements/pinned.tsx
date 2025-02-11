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
    <Card className="shadow-none overflow-visible relative">
      {!empty && <Banner />}
      <CardHeader
        className={cn(
          "flex flex-col justify-between items-center h-36 py-6 overflow-hidden rounded",
          empty &&
            "bg-background-100 border border-dashed border-background-200",
        )}
      >
        <div className="flex justify-center items-center w-12 h-12">
          <div
            className={cn(
              "w-8 h-8",
              empty ? "text-background-500" : "text-primary",
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
        empty ? "text-background-500" : "text-foreground-100",
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

export function Banner() {
  return (
    <div className="absolute top-[-2px] right-2 h-7 w-6 rounded-t-sm rounded-b overflow-hidden flex flex-col">
      <div className="h-5 w-6 bg-background-500" />
      <div className="flex justify-between">
        <div className="h-0 w-0 border-t-[6px] border-t-background-500 border-r-[12px] border-r-transparent" />
        <div className="h-0 w-0 border-t-[6px] border-t-background-500 border-l-[12px] border-l-transparent" />
      </div>
    </div>
  );
}
