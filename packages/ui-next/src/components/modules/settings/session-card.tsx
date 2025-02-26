import React from "react";
import { cn } from "@/utils";
import { Button, Card, CardContent } from "@/index";
import { TrashIcon } from "@/index";

interface SignerCardProps {
  className?: string;
  sessionName: string;
  onDelete?: () => void;
}

export const SessionCard = React.forwardRef<HTMLDivElement, SignerCardProps>(
  ({ className, sessionName, onDelete }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between gap-3", className)}
      >
        <Card className="flex flex-row items-center bg-background-100 border border-background-200">
          <CardContent className="relative bg-background-200 size-10 flex items-center justify-center">
            {/* <DeviceIcon deviceType={deviceType} /> */}
          </CardContent>
          <CardContent className="bg-background-100 py-2.5 px-3">
            <h1 className="flex-1 text-sm font-normal">{sessionName}</h1>
          </CardContent>
        </Card>
        <Button variant="icon" size="icon" type="button" onClick={onDelete}>
          <TrashIcon size="default" className="text-foreground-300" />
        </Button>
      </div>
    );
  },
);

SessionCard.displayName = "SessionCard";
