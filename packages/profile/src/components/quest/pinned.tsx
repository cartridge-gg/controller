
import {
  cn,
  SpiderWebIcon,
  StateIconProps,
} from "@cartridge/ui-next";
import { 
  Card,
  CardHeader,
  CardTitle,
 } from "@cartridge/ui-next";

export function Pinned({ Icon, title, empty }: { Icon: React.ComponentType<StateIconProps>, title: string, empty?: boolean }) {
  return (
    <Card>
      <CardHeader className={cn(
        "flex flex-col justify-between items-center h-full pt-6",
        empty && "bg-background border border-dashed border-secondary"
      )}>
        <Icon className={cn("min-w-12 min-h-12", empty ? "opacity-10" : "text-primary")} variant="solid" />
        <CardTitle className={cn(
          "grow flex flex-col justify-center items-center capitalize font-normal text-xs",
          empty ? "opacity-50" : "text-secondary-foreground"
        )}>
          <p className="capitalize break-words text-center">{title}</p>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export function Empty() {
  return <Pinned Icon={SpiderWebIcon} title="Empty" empty={true} />;
}
