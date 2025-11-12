import { useConnection } from "@/hooks/connection";
import { requestStorageAccessFactory } from "@/utils/connection/storage-access";
import { safeRedirect } from "@/utils/url-validator";
import {
  AlertIcon,
  Button,
  HeaderInner,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { useCallback, useState } from "react";

export function StandaloneConnect({
  redirectUrl,
  isVerified,
  username,
}: {
  redirectUrl: string;
  isVerified: boolean;
  username?: string;
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, parent } = useConnection();

  const handleConnect = useCallback(async () => {
    if (!redirectUrl) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log(
        "[Standalone Flow] StandaloneConnect: User clicked Connect button (USER GESTURE CAPTURED)",
      );

      // STEP 1: Request storage access (user gesture!)
      console.log(
        "[Standalone Flow] StandaloneConnect: Requesting storage access",
      );
      const requestStorageAccess = requestStorageAccessFactory();
      const granted = await requestStorageAccess();

      if (!granted) {
        const errorMsg = "Storage access was not granted";
        console.error(
          "[Standalone Flow] StandaloneConnect: Storage access denied",
        );
        setError(errorMsg);
        setIsConnecting(false);
        return;
      }

      console.log(
        "[Standalone Flow] StandaloneConnect: Storage access granted successfully",
      );

      // STEP 2: Notify parent controller that storage access was granted
      if (
        parent &&
        "onSessionCreated" in parent &&
        typeof parent.onSessionCreated === "function"
      ) {
        console.log(
          "[Standalone Flow] StandaloneConnect: Calling parent.onSessionCreated()",
        );
        try {
          await parent.onSessionCreated();
          console.log(
            "[Standalone Flow] StandaloneConnect: Parent notified successfully",
          );
        } catch (err) {
          console.error(
            "[Standalone Flow] StandaloneConnect: Error notifying parent:",
            err,
          );
        }
      } else {
        console.warn(
          "[Standalone Flow] StandaloneConnect: Parent onSessionCreated method not available",
        );
      }

      // STEP 3: Redirect to application
      console.log(
        "[Standalone Flow] StandaloneConnect: Redirecting to:",
        redirectUrl,
      );
      safeRedirect(redirectUrl, true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect";
      console.error(
        "[Standalone Flow] StandaloneConnect: Error during connect:",
        err,
      );
      setError(errorMsg);
      setIsConnecting(false);
    }
  }, [redirectUrl, parent]);

  return (
    <LayoutContainer>
      <HeaderInner
        className="pb-10"
        title={`Connect to ${theme.name || "Application"}`}
        description={
          username
            ? `Continue as ${username}`
            : `${theme.name} is requesting access to your Controller`
        }
      />
      <LayoutContent className="pb-0 flex flex-col gap-4">
        {!isVerified && (
          <div className="text-xs text-destructive-100 p-3 bg-background-100 rounded-md border border-destructive-100">
            ⚠️ This application is not verified. Make sure you trust the site
            before connecting.
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-destructive-100 p-3 bg-background-100 rounded-md border border-destructive-100">
            <AlertIcon className="flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <div>{error}</div>
              <button
                onClick={handleConnect}
                className="text-left underline hover:no-underline"
              >
                Try again
              </button>
            </div>
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
    </LayoutContainer>
  );
}
