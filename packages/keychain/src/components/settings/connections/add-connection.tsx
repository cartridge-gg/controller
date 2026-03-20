import { useNavigation } from "@/context/navigation";
import { useFeatures } from "@/hooks/features";
import {
  getInstagramAuthUrl,
  getTikTokAuthUrl,
  getTwitterAuthUrl,
  type OAuthProvider,
} from "@/utils/api/oauth-connections";
import {
  AddUserIcon,
  AlertIcon,
  Button,
  CheckIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
} from "@cartridge/ui";
import { SiInstagram, SiTiktok, SiX } from "@icons-pack/react-simple-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import { useSearchParams } from "react-router-dom";

type ConnectionPending = {
  provider: OAuthProvider;
  inProgress: boolean;
  error?: string;
};

export function AddConnection({ username }: { username?: string }) {
  const { navigate } = useNavigation();

  const queryClient = useQueryClient();
  const [connectionPending, setConnectionPending] =
    useState<ConnectionPending | null>(null);
  const [headerIcon, setHeaderIcon] = useState<React.ReactElement>(
    <AddUserIcon size="lg" />,
  );

  // if provider param is provider, skip selection
  const [searchParams] = useSearchParams();
  const defaultProvider = searchParams.get("provider") as
    | OAuthProvider
    | undefined;

  // Feature flags - connections can be toggled via /feature/connections/enable or /feature/connections/disable
  const { isFeatureEnabled } = useFeatures();
  const featureFlags = useMemo(
    () => ({
      twitter: true,
      tiktok: isFeatureEnabled("connection-tiktok"),
      instagram: isFeatureEnabled("connection-instagram"),
    }),
    [isFeatureEnabled],
  );

  const handleTikTokConnect = useCallback(() => {
    if (!username) {
      setConnectionPending({
        provider: "TIKTOK",
        inProgress: false,
        error: "No username available",
      });
      return;
    }

    try {
      setConnectionPending({
        provider: "TIKTOK",
        inProgress: true,
      });

      setHeaderIcon(<SpinnerIcon className="animate-spin" size="lg" />);

      // Get the auth URL for TikTok OAuth
      const authUrl = getTikTokAuthUrl(username);

      // Open TikTok OAuth in a popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        authUrl,
        "tiktok-oauth",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Listen for OAuth completion message from popup
      const handleMessage = (event: MessageEvent) => {
        // Verify origin for security - must be cartridge.gg or a subdomain
        try {
          const hostname = new URL(event.origin).hostname;
          const isValidOrigin =
            hostname === "cartridge.gg" || hostname.endsWith(".cartridge.gg");
          if (!isValidOrigin) return;
        } catch {
          return; // Invalid origin URL
        }
        if (event.data?.type !== "tiktok-oauth") return;

        window.removeEventListener("message", handleMessage);

        if (event.data.status === "connected") {
          setHeaderIcon(<CheckIcon size="lg" />);
          setConnectionPending({
            provider: "TIKTOK",
            inProgress: false,
          });
          // Invalidate the connections query so settings page shows updated data
          queryClient.invalidateQueries("oauthConnections");
        } else {
          setHeaderIcon(<AlertIcon size="lg" />);
          setConnectionPending({
            provider: "TIKTOK",
            inProgress: false,
            error: event.data.error || "Connection failed",
          });
        }
      };

      window.addEventListener("message", handleMessage);

      // Also poll for popup closure as fallback (e.g., user closes popup manually)
      const pollTimer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", handleMessage);
          // Only update if still in progress (message handler didn't fire)
          setConnectionPending((current) => {
            if (current?.inProgress) {
              setHeaderIcon(<AlertIcon size="lg" />);
              return {
                provider: "TIKTOK",
                inProgress: false,
                error: "Popup closed before completing authorization",
              };
            }
            return current;
          });
        }
      }, 500);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setHeaderIcon(<AlertIcon size="lg" />);
      setConnectionPending({
        provider: "TIKTOK",
        inProgress: false,
        error: errorMessage,
      });
    }
  }, [username, queryClient]);

  const handleInstagramConnect = useCallback(() => {
    if (!username) {
      setConnectionPending({
        provider: "INSTAGRAM",
        inProgress: false,
        error: "No username available",
      });
      return;
    }

    try {
      setConnectionPending({
        provider: "INSTAGRAM",
        inProgress: true,
      });

      setHeaderIcon(<SpinnerIcon className="animate-spin" size="lg" />);

      // Get the auth URL for Instagram OAuth
      const authUrl = getInstagramAuthUrl(username);

      // Open Instagram OAuth in a popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        authUrl,
        "instagram-oauth",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Listen for OAuth completion message from popup
      const handleMessage = (event: MessageEvent) => {
        // Verify origin for security - must be cartridge.gg or a subdomain
        try {
          const hostname = new URL(event.origin).hostname;
          const isValidOrigin =
            hostname === "cartridge.gg" || hostname.endsWith(".cartridge.gg");
          if (!isValidOrigin) return;
        } catch {
          return; // Invalid origin URL
        }
        if (event.data?.type !== "instagram-oauth") return;

        window.removeEventListener("message", handleMessage);

        if (event.data.status === "connected") {
          setHeaderIcon(<CheckIcon size="lg" />);
          setConnectionPending({
            provider: "INSTAGRAM",
            inProgress: false,
          });
          // Invalidate the connections query so settings page shows updated data
          queryClient.invalidateQueries("oauthConnections");
        } else {
          setHeaderIcon(<AlertIcon size="lg" />);
          setConnectionPending({
            provider: "INSTAGRAM",
            inProgress: false,
            error: event.data.error || "Connection failed",
          });
        }
      };

      window.addEventListener("message", handleMessage);

      // Also poll for popup closure as fallback (e.g., user closes popup manually)
      const pollTimer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", handleMessage);
          // Only update if still in progress (message handler didn't fire)
          setConnectionPending((current) => {
            if (current?.inProgress) {
              setHeaderIcon(<AlertIcon size="lg" />);
              return {
                provider: "INSTAGRAM",
                inProgress: false,
                error: "Popup closed before completing authorization",
              };
            }
            return current;
          });
        }
      }, 500);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setHeaderIcon(<AlertIcon size="lg" />);
      setConnectionPending({
        provider: "INSTAGRAM",
        inProgress: false,
        error: errorMessage,
      });
    }
  }, [username, queryClient]);

  const handleTwitterConnect = useCallback(() => {
    if (!username) {
      setConnectionPending({
        provider: "TWITTER",
        inProgress: false,
        error: "No username available",
      });
      return;
    }

    try {
      setConnectionPending({
        provider: "TWITTER",
        inProgress: true,
      });

      setHeaderIcon(<SpinnerIcon className="animate-spin" size="lg" />);

      // Get the auth URL for Twitter OAuth
      const authUrl = getTwitterAuthUrl(username);

      // Open Twitter OAuth in a popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        authUrl,
        "twitter-oauth",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Listen for OAuth completion message from popup
      const handleMessage = (event: MessageEvent) => {
        // Verify origin for security - must be cartridge.gg or a subdomain
        try {
          const hostname = new URL(event.origin).hostname;
          const isValidOrigin =
            hostname === "cartridge.gg" || hostname.endsWith(".cartridge.gg");
          if (!isValidOrigin) return;
        } catch {
          return; // Invalid origin URL
        }
        if (event.data?.type !== "twitter-oauth") return;

        window.removeEventListener("message", handleMessage);

        if (event.data.status === "connected") {
          setHeaderIcon(<CheckIcon size="lg" />);
          setConnectionPending({
            provider: "TWITTER",
            inProgress: false,
          });
          // Invalidate the connections query so settings page shows updated data
          queryClient.invalidateQueries("oauthConnections");
        } else {
          setHeaderIcon(<AlertIcon size="lg" />);
          setConnectionPending({
            provider: "TWITTER",
            inProgress: false,
            error: event.data.error || "Connection failed",
          });
        }
      };

      window.addEventListener("message", handleMessage);

      // Also poll for popup closure as fallback (e.g., user closes popup manually)
      const pollTimer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", handleMessage);
          // Only update if still in progress (message handler didn't fire)
          setConnectionPending((current) => {
            if (current?.inProgress) {
              setHeaderIcon(<AlertIcon size="lg" />);
              return {
                provider: "TWITTER",
                inProgress: false,
                error: "Popup closed before completing authorization",
              };
            }
            return current;
          });
        }
      }, 500);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setHeaderIcon(<AlertIcon size="lg" />);
      setConnectionPending({
        provider: "TWITTER",
        inProgress: false,
        error: errorMessage,
      });
    }
  }, [username, queryClient]);

  useEffect(() => {
    if (username && !connectionPending) {
      if (defaultProvider === "TIKTOK") {
        handleTikTokConnect();
      } else if (defaultProvider === "INSTAGRAM") {
        handleInstagramConnect();
      } else if (defaultProvider === "TWITTER") {
        handleTwitterConnect();
      }
    }
  }, [
    defaultProvider,
    username,
    handleTikTokConnect,
    handleInstagramConnect,
    handleTwitterConnect,
    connectionPending,
  ]);

  // Navigate back to settings after successful connection
  useEffect(() => {
    if (
      connectionPending &&
      connectionPending.inProgress === false &&
      !connectionPending.error
    ) {
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  }, [connectionPending, navigate]);

  return (
    <>
      <HeaderInner
        icon={headerIcon}
        variant="compressed"
        title={`Connect${connectionPending?.provider ? ` ${connectionPending.provider.charAt(0) + connectionPending.provider.slice(1).toLowerCase()}` : " Social"}`}
      />
      <LayoutContent className="flex flex-col gap-3 w-full h-fit">
        {!connectionPending && (
          <p className="text-foreground-400 text-sm">
            Connect your social accounts to enable content publishing features.
          </p>
        )}
        {connectionPending ? (
          <ConnectionPendingCard
            provider={connectionPending.provider}
            inProgress={connectionPending.inProgress}
            error={connectionPending.error}
          />
        ) : (
          <>
            {featureFlags.tiktok && (
              <ConnectionMethod
                provider="TIKTOK"
                onClick={handleTikTokConnect}
              />
            )}
            {featureFlags.instagram && (
              <ConnectionMethod
                provider="INSTAGRAM"
                onClick={handleInstagramConnect}
              />
            )}
            {featureFlags.twitter && (
              <ConnectionMethod
                provider="TWITTER"
                onClick={handleTwitterConnect}
              />
            )}
          </>
        )}
      </LayoutContent>

      <LayoutFooter>
        {connectionPending?.error && (
          <Button
            variant="secondary"
            onClick={() => {
              setHeaderIcon(<AddUserIcon size="lg" />);
              setConnectionPending(null);
            }}
          >
            Try Again
          </Button>
        )}
        {!connectionPending && (
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}

function ConnectionMethod({
  provider,
  onClick,
}: {
  provider: OAuthProvider;
  onClick: () => void;
}) {
  const icons: Record<OAuthProvider, React.ReactNode> = {
    TIKTOK: <SiTiktok size={20} />,
    INSTAGRAM: <SiInstagram size={20} />,
    TWITTER: <SiX size={20} />,
  };

  const labels: Record<OAuthProvider, string> = {
    TIKTOK: "TikTok",
    INSTAGRAM: "Instagram",
    TWITTER: "X",
  };

  const descriptions: Record<OAuthProvider, string> = {
    TIKTOK: "Connect to enable video publishing",
    INSTAGRAM: "Connect to enable content publishing",
    TWITTER: "Connect to enable tweet publishing",
  };

  return (
    <button
      type="button"
      className="flex items-center gap-3 p-3 rounded-lg bg-background-100 hover:bg-background-200 border border-background-200 transition-colors w-full text-left"
      onClick={onClick}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background-200">
        {icons[provider]}
      </div>
      <div className="flex flex-col">
        <span className="text-foreground-100 font-medium">
          {labels[provider]}
        </span>
        <span className="text-foreground-400 text-sm">
          {descriptions[provider]}
        </span>
      </div>
    </button>
  );
}

function ConnectionPendingCard({
  provider,
  inProgress,
  error,
}: {
  provider: OAuthProvider;
  inProgress: boolean;
  error?: string;
}) {
  const icons: Record<OAuthProvider, React.ReactNode> = {
    TIKTOK: <SiTiktok size={20} />,
    INSTAGRAM: <SiInstagram size={20} />,
    TWITTER: <SiX size={20} />,
  };

  const labels: Record<OAuthProvider, string> = {
    TIKTOK: "TikTok",
    INSTAGRAM: "Instagram",
    TWITTER: "X",
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-background-100 border border-background-200">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background-200">
        {icons[provider]}
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-foreground-100 font-medium text-lg">
          {inProgress
            ? `Connecting ${labels[provider]}...`
            : error
              ? "Connection Failed"
              : `${labels[provider]} Connected`}
        </span>
        {inProgress && (
          <span className="text-foreground-400 text-sm">
            Complete authorization in the popup window
          </span>
        )}
        {error && <span className="text-destructive-100 text-sm">{error}</span>}
        {!inProgress && !error && (
          <span className="text-foreground-400 text-sm">Redirecting...</span>
        )}
      </div>
      {inProgress && (
        <SpinnerIcon className="animate-spin text-foreground-300" size="lg" />
      )}
    </div>
  );
}
