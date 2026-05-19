import { Button, Card, TrashIcon, UnlinkIcon } from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import React, { useState } from "react";

export interface SessionCardProps {
  icon: React.ReactNode;
  name: string;
  rightText?: string;
  onDelete?: () => Promise<void>;
  onUnlink?: () => Promise<void>;
}

export const SessionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SessionCardProps
>(({ className, icon, name, rightText, onDelete, onUnlink, ...props }, ref) => {
  const [loading, setLoading] = useState(false);

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-3", className)}
      {...props}
    >
      <Card className="py-2.5 px-3 gap-1.5 flex flex-1 flex-row items-center bg-background-200">
        {icon}
        <h1 className="flex-1 text-sm font-normal">{name}</h1>
        {rightText && (
          <div className="flex flex-row items-center gap-1 text-foreground-300">
            <h1 className="text-xs font-normal">{rightText}</h1>
          </div>
        )}
      </Card>
      {(onDelete || onUnlink) && (
        <Button
          variant="icon"
          size="icon"
          type="button"
          isLoading={loading}
          onClick={async () => {
            try {
              setLoading(true);
              await (onDelete ?? onUnlink)?.();
            } finally {
              setLoading(false);
            }
          }}
        >
          {onUnlink && (
            <UnlinkIcon size="default" className="text-foreground-300" />
          )}
          {onDelete && (
            <TrashIcon size="default" className="text-foreground-300" />
          )}
        </Button>
      )}
    </div>
  );
});

SessionCard.displayName = "SessionCard";
