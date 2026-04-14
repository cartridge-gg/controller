import { Card, CardHeader, CardTitle } from "@/index";
import { cn } from "@/utils";
import { useMemo } from "react";

interface AchievementFeaturedProps {
  icon?: string;
  title?: string;
}

export function AchievementFeatured({ icon, title }: AchievementFeaturedProps) {
  const empty = useMemo(() => !icon || !title, [icon, title]);

  return (
    <Card className="shadow-none overflow-visible relative h-[136px] w-[120px]">
      {!empty && <Banner />}
      <CardHeader
        className={cn(
          "flex flex-col justify-between items-center h-full p-2 pt-6 overflow-hidden rounded",
          empty &&
            "bg-background-100 border border-dashed border-background-200",
        )}
      >
        <div className="flex justify-center items-center w-12 h-12">
          <div
            className={cn(
              "w-9 h-9",
              empty ? "text-background-500" : "text-primary",
              !icon ? "fa-spider-web" : icon,
              empty ? "fa-thin" : "fa-solid",
            )}
          />
        </div>
        <Title title={title || "empty"} empty={empty} />
      </CardHeader>
    </Card>
  );
}

function Title({ title, empty }: { title: string; empty?: boolean }) {
  return (
    <CardTitle
      className={cn(
        "grow flex justify-center items-center",
        empty ? "text-background-500" : "text-foreground-100",
      )}
    >
      <p className="font-medium text-sm capitalize break-words text-center text-ellipsis line-clamp-2">
        {title}
      </p>
    </CardTitle>
  );
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

export default AchievementFeatured;
