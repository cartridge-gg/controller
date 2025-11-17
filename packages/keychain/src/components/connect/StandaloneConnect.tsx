import { useConnection } from "@/hooks/connection";
import { requestStorageAccess } from "@/utils/connection/storage-access";
import { safeRedirect } from "@/utils/url-validator";
import { restoreLocalStorageFromFragment } from "@/utils/storageSnapshot";
import {
  AlertIcon,
  Button,
  HeaderInner,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Standalone connect component for verified presets with no custom policies.
 * Used in standalone auth flow to request storage access and redirect back to the application.
 */
export function StandaloneConnect({ username }: { username?: string }) {
  const [searchParams] = useSearchParams();
  const { verified, theme, parent } = useConnection();

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get("redirect_url");

  const handleConnect = useCallback(async () => {
    if (!redirectUrl) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log(
        "[Standalone Flow] StandaloneConnect: Requesting storage access",
      );

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
        "[Standalone Flow] StandaloneConnect: Storage access granted, restoring localStorage and redirecting",
      );

      // Restore localStorage from encrypted blob in URL fragment
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const encryptedBlob = hashParams.get("kc");

      if (encryptedBlob) {
        await restoreLocalStorageFromFragment(encryptedBlob, {
          clearAfterRestore: true,
        });
      } else {
        console.warn(
          "[Standalone Flow] No encrypted blob found in URL fragment",
        );
      }

      // Notify parent controller that storage access was granted
      if (
        parent &&
        "onSessionCreated" in parent &&
        typeof parent.onSessionCreated === "function"
      ) {
        try {
          await parent.onSessionCreated();
        } catch (err) {
          console.error(
            "[Standalone Flow] StandaloneConnect: Error notifying parent:",
            err,
          );
        }
      }

      // Redirect to application
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

  if (!redirectUrl) {
    return null;
  }

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
        {!verified && (
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
