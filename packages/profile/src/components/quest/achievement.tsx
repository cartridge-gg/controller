
import {
  TrackIcon,
  CalendarIcon,
  SparklesIcon,
  StateIconProps,
  Separator,
} from "@cartridge/ui-next";
import { useMemo } from "react";

export function Achievement({ Icon, title, description, percentage, earning, timestamp }: { Icon: React.ComponentType<StateIconProps>, title: string, description: string, percentage: number, earning: number, timestamp: number }) {
  return (
    <div className="flex items-center gap-x-px">
      <div className="grow flex items-center gap-2 bg-secondary p-2">
        <Icon className="text-primary" size="lg" variant="solid" />
        <div className="grow flex flex-col">
          <div className="flex justify-between items-center">
            <p className="text-xs text-secondary-foreground capitalize">{title}</p>
            <div className="flex gap-2">
              <Earning amount={earning} />
              <div className="flex py-1 opacity-30">
                <Separator className="grow bg-muted-foreground" orientation="vertical" />
              </div>
              <Timestamp timestamp={timestamp} />
            </div>
          </div>
          <p className="text-xs text-secondary-accent">{description.slice(0, 1).toUpperCase() + description.slice(1)}</p>
          <p className="text-[0.65rem] text-muted-foreground">{`${percentage}% of players earned`}</p>
        </div>
      </div>
      <Track pinned={false} />
    </div>
  )
}

function Earning({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <SparklesIcon size="xs" variant="line" />
      <p className="text-xs">{amount}</p>
    </div>
  )
}

function Timestamp({ timestamp }: { timestamp: number }) {
  const date = useMemo(() => {
    return new Date(timestamp * 1000).toLocaleDateString();
  }, [timestamp]);
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <CalendarIcon size="xs" variant="line" />
      <p className="text-xs">{date}</p>
    </div>
  )
}

function Track({ pinned }: { pinned: boolean }) {
  return (
    <div className="bg-secondary h-full p-2 flex items-center text-muted-foreground">
      <TrackIcon size="sm" variant={pinned ? "solid" : "line"} />
    </div>
  )
}