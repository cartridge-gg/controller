import { now } from "@/constants";
import { useConnection } from "@/hooks/connection";
import { Skeleton } from "@cartridge/ui";
import { useSessionsQuery } from "@cartridge/ui/utils/api/cartridge";
import { constants, shortString } from "starknet";
import { SectionHeader } from "../section-header";
import { RevokeAllSessionsButton } from "./revoke-all-sessions";
import { SessionCard } from "./session-card";

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
            const isExpired =
              !session?.expiresAt || BigInt(session.expiresAt) < now();
            if (isExpired) return;
            return (
              <SessionCard
                sessionOs={session?.metadata?.os ?? "Unknown"}
                key={index}
                sessionName={session?.appID ?? ""}
                expiresAt={BigInt(session?.expiresAt ?? 0)}
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
      {/* <Button
	type="button"
	variant="outline"
	className="py-2.5 px-3 text-foreground-300 gap-1"
  >
	<PlusIcon size="sm" variant="line" />
	<span className="normal-case font-normal font-sans text-sm">
	  Create Session
	</span>
  </Button> */}
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
