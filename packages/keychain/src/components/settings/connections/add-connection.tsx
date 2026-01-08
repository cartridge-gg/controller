import { useNavigation } from "@/context/navigation";
import { getTikTokAuthUrl } from "@/utils/api/oauth-connections";
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
import { SiTiktok } from "@icons-pack/react-simple-icons";
import { useCallback, useEffect, useState } from "react";

type ConnectionPending = {
  provider: "TIKTOK";
  inProgress: boolean;
  error?: string;
};

export function AddConnection({ username }: { username?: string }) {
  const { navigate } = useNavigation();
  const [connectionPending, setConnectionPending] =
    useState<ConnectionPending | null>(null);
  const [headerIcon, setHeaderIcon] = useState<React.ReactElement>(
    <AddUserIcon size="lg" />,
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
        // Verify origin for security
        if (!event.origin.includes("cartridge.gg")) return;
        if (event.data?.type !== "tiktok-oauth") return;

        window.removeEventListener("message", handleMessage);

        if (event.data.status === "connected") {
          setHeaderIcon(<CheckIcon size="lg" />);
          setConnectionPending({
            provider: "TIKTOK",
            inProgress: false,
          });
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
  }, [username]);

  // Navigate back to settings after successful connection
  useEffect(() => {
    if (
      connectionPending &&
      connectionPending.inProgress === false &&
      !connectionPending.error
    ) {
      setTimeout(() => {
        navigate("/settings");
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
          <ConnectionMethod provider="TIKTOK" onClick={handleTikTokConnect} />
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
          <Button variant="secondary" onClick={() => navigate("/settings")}>
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
  provider: "TIKTOK";
  onClick: () => void;
}) {
  const icons = {
    TIKTOK: <SiTiktok size={20} />,
  };

  const labels = {
    TIKTOK: "TikTok",
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
          Connect to enable video publishing
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
  provider: "TIKTOK";
  inProgress: boolean;
  error?: string;
}) {
  const icons = {
    TIKTOK: <SiTiktok size={20} />,
  };

  const labels = {
    TIKTOK: "TikTok",
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
          <span className="text-foreground-400 text-sm">
            Redirecting to settings...
          </span>
        )}
      </div>
      {inProgress && (
        <SpinnerIcon className="animate-spin text-foreground-300" size="lg" />
      )}
    </div>
  );
}
