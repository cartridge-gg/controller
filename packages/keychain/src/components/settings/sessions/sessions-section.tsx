import { useConnection } from "@/hooks/connection";
import { Skeleton } from "@cartridge/ui";
import { ControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { useMemo } from "react";
import { QueryObserverResult } from "react-query";
import { shortString } from "starknet";
import { SectionHeader } from "../section-header";
import { RevokeAllSessionsButton } from "./revoke-all-sessions";
import { SessionCard } from "./session-card";

export const SessionsSection = ({
  controllerQuery,
}: {
  controllerQuery: QueryObserverResult<ControllerQuery>;
}) => {
  const { controller } = useConnection();

  const activeSessions = useMemo(() => {
    return (
      controllerQuery.data?.controller?.sessions?.filter(
        (session) => !session.isRevoked,
      ) ?? []
    );
  }, [controllerQuery.data?.controller?.sessions]);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Session Keys"
        description="Session keys grant permission to your Controller to perform certain game actions on your behalf"
        showStatus={false}
        extraContent={
          activeSessions.length > 0 && (
            <RevokeAllSessionsButton
              onClick={async () => {
                await controller?.revokeSessions(
                  activeSessions.map((session) => ({
                    app_id: session.appID,
                    chain_id: shortString.encodeShortString(session.chainID),
                    session_hash: session.id,
                  })) ?? [],
                );
                await controllerQuery.refetch();
              }}
            />
          )
        }
      />
      <div className="space-y-3">
        {controllerQuery.isLoading ? (
          <LoadingState />
        ) : (
          activeSessions.map((session, index: number) => (
            <SessionCard
              sessionOs={session.metadata?.os ?? "Unknown"}
              key={index}
              sessionName={session.appID}
              expiresAt={BigInt(session.expiresAt)}
              onDelete={async () => {
                await controller?.revokeSession({
                  app_id: session.appID,
                  chain_id: shortString.encodeShortString(session.chainID),
                  session_hash: session.id,
                });
                await controllerQuery.refetch();
              }}
            />
          ))
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
