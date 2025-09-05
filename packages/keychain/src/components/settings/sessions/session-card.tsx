import { now } from "@/constants";
import {
  Button,
  Card,
  DesktopIcon,
  MobileIcon,
  ShapesIcon,
  TrashIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import React, { useState } from "react";

export interface Session {
  sessionName: string;
  expiresAt: bigint;
  sessionOs: string;
}

export interface SessionCardProps extends Session {
  onDelete: () => Promise<void>;
}

export const SessionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SessionCardProps
>(
  (
    { className, sessionName, expiresAt, sessionOs, onDelete, ...props },
    ref,
  ) => {
    const [loading, setLoading] = useState(false);

    const urlWithoutProtocol = new URL(sessionName).hostname;
    const truncatedSessionName =
      urlWithoutProtocol.length > 26
        ? urlWithoutProtocol.slice(0, 13) +
          "..." +
          urlWithoutProtocol.slice(-13)
        : urlWithoutProtocol;

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="py-2.5 px-3 gap-1.5 flex flex-1 flex-row items-center bg-background-200">
          <DeviceIcon os={sessionOs} />
          <h1 className="flex-1 text-sm font-normal">{truncatedSessionName}</h1>
          <div className="flex flex-row items-center gap-1 text-foreground-300">
            <h1 className="text-xs font-normal">{formatDuration(expiresAt)}</h1>
          </div>
        </Card>
        <Button
          variant="icon"
          size="icon"
          type="button"
          isLoading={loading}
          onClick={async () => {
            try {
              setLoading(true);
              await onDelete();
            } finally {
              setLoading(false);
            }
          }}
        >
          <TrashIcon size="default" className="text-foreground-300" />
        </Button>
      </div>
    );
  },
);

SessionCard.displayName = "SessionCard";

function formatDuration(expiresAt: bigint): string {
  const duration = Number(expiresAt - now());
  const hours = duration / (60 * 60);
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

const DeviceIcon = React.memo(({ os }: { os: string }) => {
  switch (os.toLowerCase()) {
    case "windows":
    case "windows nt":
    case "macos":
    case "linux":
    case "freebsd":
    case "chromeos":
    case "cros":
      return <DesktopIcon variant="solid" size="sm" />;
    case "ios":
    case "android":
    case "windows phone":
    case "windows phone os":
    case "blackberry":
      return <MobileIcon variant="solid" size="sm" />;
    default:
      return <ShapesIcon variant="solid" size="sm" />;
  }
});
