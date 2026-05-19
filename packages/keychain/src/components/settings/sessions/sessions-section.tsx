import { now } from "@/constants";
import { useConnection } from "@/hooks/connection";
import {
  SectionHeader,
  SettingsCard,
  DesktopIcon,
  MobileIcon,
  ShapesIcon,
  Skeleton,
  ClockIcon,
  TimesIcon,
} from "@cartridge/controller-ui";
import { useSessionsQuery } from "@cartridge/controller-ui/utils/api/cartridge";
import { constants, shortString } from "starknet";
import { RevokeAllSessionsButton } from "./revoke-all-sessions";

export const SessionsSection = () => {
  const { controller } = useConnection();

  const sessionsQuery = useSessionsQuery(
    {
      where: {
        isRevoked: false,
        hasControllerWith: [
          {
            accountID: controller?.username(),
            networkContains: constants.NetworkName.SN_MAIN,
          },
        ],
      },
    },
    {
      select: (data) => data.sessions?.edges?.map((session) => session?.node),
      enabled: !!controller?.username(),
    },
  );

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Session Keys"
        description="Session keys grant permission to your Controller to perform certain game actions on your behalf"
        showStatus={false}
        extraContent={
          sessionsQuery.data &&
          sessionsQuery.data.length > 0 && (
            <RevokeAllSessionsButton
              onClick={async () => {
                await controller?.revokeSessions(
                  sessionsQuery.data?.map((session) => ({
                    app_id: session?.appID,
                    chain_id: shortString.encodeShortString(
                      session?.chainID ?? "",
                    ),
                    session_hash: session?.id ?? "",
                  })) ?? [],
                );
                await sessionsQuery.refetch();
              }}
            />
          )
        }
      />
      <div className="space-y-3">
        {sessionsQuery.isLoading ? (
          <LoadingState />
        ) : (
          sessionsQuery.data?.map((session, index: number) => {
            const expiresAt = BigInt(session?.expiresAt ?? 0);
            const isExpired = !session?.expiresAt || expiresAt < now();
            if (isExpired) return;
            const label = truncateSessionName(session?.appID ?? "");
            return (
              <SettingsCard
                key={index}
                icon={<DeviceIcon os={session?.metadata?.os ?? "Unknown"} />}
                label={label}
                rightText={
                <div className="flex gap-1">
                  <ClockIcon size="xs" variant="line" />
                  <span>{formatDuration(expiresAt)}</span>
                </div>
              }
                confirmDelete
                deleteLabel={`${label} Session`}
                onDelete={async () => {
                  await controller?.revokeSession({
                    app_id: session?.appID,
                    chain_id: shortString.encodeShortString(
                      session?.chainID ?? "",
                    ),
                    session_hash: session?.id ?? "",
                  });
                  await sessionsQuery.refetch();
                }}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

const LoadingState = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
    </div>
  );
};

function truncateSessionName(sessionName: string): string {
  const hostname = new URL(sessionName).hostname;
  if (hostname.length <= 26) return hostname;
  return hostname.slice(0, 13) + "..." + hostname.slice(-13);
}

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

const DeviceIcon = ({ os }: { os: string }) => {
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
};
