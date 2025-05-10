import React from "react";
import {
  Button,
  Card,
  CardContent,
  ShapesIcon,
  TrashIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
  ClockIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";

export interface Session {
  sessionName: string;
  expiresAt: bigint;
}

export interface SessionCardProps extends Session {
  onDelete?: () => void;
}

export const SessionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SessionCardProps
>(({ className, sessionName, expiresAt, onDelete, ...props }, ref) => {
  return (
    <Sheet>
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="flex flex-1 flex-row items-center bg-background-100 border border-background-200">
          <CardContent className="relative bg-background-200 size-10 flex items-center justify-center">
            <ShapesIcon variant="solid" size="default" className="absolute" />
          </CardContent>
          <CardContent className="text-foreground-300 bg-background-100 py-2.5 px-3 flex flex-row items-center justify-between w-full">
            <h1 className="flex-1 text-sm font-normal">{sessionName}</h1>
            <div className="flex flex-row items-center gap-1">
              <ClockIcon variant="line" size="xs" />
              <h1 className="text-xs font-normal">
                {formatDuration(expiresAt)}
              </h1>
            </div>
          </CardContent>
        </Card>
        <SheetTrigger asChild>
          <Button variant="icon" size="icon" type="button">
            <TrashIcon size="default" className="text-foreground-300" />
          </Button>
        </SheetTrigger>
      </div>

      {/* DELETE SESSION SHEET CONTENTS */}
      <SheetContent
        side="bottom"
        className="border-background-100 p-6 gap-6 rounded-t-xl"
        showClose={false}
      >
        <div className="flex flex-row items-center gap-3 mb-6">
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="flex items-center justify-center"
          >
            <ShapesIcon variant="solid" size="default" className="absolute" />
          </Button>
          <div className="flex flex-col items-start gap-1">
            <div className="flex flex-col items-start gap-0.5">
              <h3 className="text-lg font-semibold text-foreground-100">
                {sessionName}
              </h3>
              <div className="flex items-center text-xs font-normal text-foreground-300 gap-1">
                <ClockIcon variant="line" size="xs" />
                <span>Expires in {formatDuration(expiresAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="flex flex-row items-center gap-4">
          <SheetClose asChild className="flex-1">
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button
            variant="secondary"
            onClick={onDelete}
            className="flex-1 text-destructive-100"
          >
            <TrashIcon size="default" />
            <span>DELETE</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});

SessionCard.displayName = "SessionCard";

function formatDuration(duration: bigint): string {
  const hours = Number(duration) / (60 * 60);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
  if (hours >= 1) {
    return `${Math.floor(hours)}h`;
  }
  const minutes = Number(duration) / 60;
  if (minutes >= 1) {
    return `${Math.floor(minutes)}m`;
  }
  return `${Number(duration)}s`;
}
