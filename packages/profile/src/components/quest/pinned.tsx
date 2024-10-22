import {
  cn,
  SpiderWebIcon,
  StateIconProps,
  TrophyIcon,
} from "@cartridge/ui-next";
import { Card, CardHeader, CardTitle } from "@cartridge/ui-next";
import { useMemo } from "react";

export function Pinned({
  Icon,
  title,
  empty,
}: {
  Icon: React.ComponentType<StateIconProps> | undefined;
  title: string;
  empty?: boolean;
}) {
  const AchievementIcon = useMemo(() => {
    if (!!Icon) return Icon;
    return TrophyIcon;
  }, [Icon]);

  return (
    <Card>
      <CardHeader
        className={cn(
          "flex flex-col justify-between items-center h-36 py-6",
          empty && "bg-background border border-dashed border-secondary",
        )}
      >
        <AchievementIcon
          className={cn(
            "min-w-12 min-h-12",
            empty ? "opacity-10" : "text-primary",
          )}
          variant="solid"
        />
        <CardTitle
          className={cn(
            "grow flex flex-col justify-center items-center capitalize font-normal text-xs",
            empty ? "opacity-50" : "text-secondary-foreground",
          )}
        >
          <p className="capitalize break-words text-center">{title}</p>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export function Empty() {
  return <Pinned Icon={SpiderWebIcon} title="Empty" empty={true} />;
}
