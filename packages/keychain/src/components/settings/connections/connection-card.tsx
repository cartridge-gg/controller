import {
  Button,
  Card,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SpinnerIcon,
  TrashIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import React, { useState } from "react";
import { SiInstagram, SiTiktok, SiX } from "@icons-pack/react-simple-icons";
import type {
  OAuthConnection,
  OAuthProvider,
} from "@/utils/api/oauth-connections";

export interface ConnectionCardProps {
  connection: OAuthConnection;
  onDisconnect?: () => Promise<void>;
}

export const ConnectionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ConnectionCardProps
>(({ className, connection, onDisconnect, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const providerName = getProviderDisplayName(connection.provider);
  const displayName =
    connection.profile.username || connection.profile.providerUserId;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="py-2.5 px-3 flex flex-1 flex-row justify-between items-center bg-background-200">
          <div className="flex flex-row items-center gap-1.5">
            <ConnectionIcon provider={connection.provider} />
            <div className="flex flex-col">
              <p className="text-sm font-normal">{providerName}</p>
              {displayName && (
                <p className="text-xs text-foreground-300">{displayName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connection.isExpired && (
              <span className="text-xs text-destructive-100">Expired</span>
            )}
          </div>
        </Card>
        {onDisconnect && (
          <Button
            variant="icon"
            size="icon"
            type="button"
            onClick={() => setIsOpen(true)}
          >
            <TrashIcon size="default" className="text-foreground-300" />
          </Button>
        )}
      </div>

      {/* DISCONNECT SHEET */}
      <SheetContent
        side="bottom"
        className="border-background-100 p-6 gap-6 rounded-t-xl"
        showClose={false}
      >
        <SheetTitle className="hidden"></SheetTitle>
        <div className="flex flex-row items-center gap-3 mb-6">
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="flex items-center justify-center text-foreground-100"
          >
            {isLoading ? (
              <SpinnerIcon className="animate-spin" size="lg" />
            ) : (
              <ConnectionIcon provider={connection.provider} size="lg" />
            )}
          </Button>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-foreground-100">
              Disconnect {providerName}?
            </h3>
            <p className="text-sm text-foreground-300">
              This will remove access to your {providerName} account.
            </p>
          </div>
        </div>
        <SheetFooter className="flex flex-row items-center gap-4">
          <SheetClose asChild className="flex-1">
            <Button variant="secondary" disabled={isLoading}>
              Cancel
            </Button>
          </SheetClose>
          <Button
            variant="secondary"
            onClick={async () => {
              setIsLoading(true);
              try {
                await onDisconnect?.();
                setIsOpen(false);
              } catch (error) {
                console.error(error);
              } finally {
                setIsLoading(false);
              }
            }}
            className="flex-1 text-destructive-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <SpinnerIcon className="animate-spin" />
            ) : (
              <TrashIcon size="default" />
            )}
            <span>DISCONNECT</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});

ConnectionCard.displayName = "ConnectionCard";

const ConnectionIcon = ({
  provider,
  size = "default",
}: {
  provider: OAuthProvider;
  size?: "default" | "lg";
}) => {
  const iconSize = size === "lg" ? 24 : 16;

  switch (provider) {
    case "TIKTOK":
      return <SiTiktok size={iconSize} />;
    case "INSTAGRAM":
      return <SiInstagram size={iconSize} />;
    case "TWITTER":
      return <SiX size={iconSize} />;
    default:
      return null;
  }
};

const getProviderDisplayName = (provider: OAuthProvider): string => {
  switch (provider) {
    case "TIKTOK":
      return "TikTok";
    case "INSTAGRAM":
      return "Instagram";
    case "TWITTER":
      return "X";
    default:
      return provider;
  }
};
