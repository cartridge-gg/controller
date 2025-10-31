import { useConnection } from "@/hooks/connection";
import { safeRedirect } from "@/utils/url-validator";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { useCallback, useState } from "react";

export function StandaloneConnect({
  redirectUrl,
  isVerified,
}: {
  redirectUrl: string;
  isVerified: boolean;
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { controller, theme } = useConnection();

  const handleConnect = useCallback(() => {
    if (!controller || !redirectUrl) {
      return;
    }

    setIsConnecting(true);
    // Safely redirect to the specified URL
    safeRedirect(redirectUrl);
  }, [controller, redirectUrl]);

  if (!controller) {
    return null;
  }

  return (
    <>
      <HeaderInner
        className="pb-0"
        title={`Connect to ${theme.name || "Application"}`}
        description="You're already authenticated. Click connect to continue."
      />
      <LayoutContent className="pb-0 flex flex-col gap-4">
        <div className="flex flex-col gap-2 p-4 bg-background-100 rounded-md">
          <div className="text-sm font-medium">Connected Account</div>
          <div className="text-xs text-muted-foreground">
            {controller.username()}
          </div>
        </div>
        {!isVerified && (
          <div className="text-xs text-destructive-100 p-3 bg-background-100 rounded-md border border-destructive-100">
            ⚠️ This application is not verified. Make sure you trust the site
            before connecting.
          </div>
        )}
      </LayoutContent>
      <LayoutFooter>
        <Button
          className="w-full"
          disabled={isConnecting}
          isLoading={isConnecting}
          onClick={handleConnect}
        >
          Connect
        </Button>
      </LayoutFooter>
    </>
  );
}
