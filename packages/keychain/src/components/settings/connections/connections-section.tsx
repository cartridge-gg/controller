import { Button, PlusIcon, Skeleton } from "@cartridge/ui";
import { useQueryClient, useMutation } from "react-query";
import { SectionHeader } from "../section-header";
import { ConnectionCard } from "./connection-card";
import { useNavigation } from "@/context/navigation";
import { useFetchData } from "@/utils/api/fetcher";
import {
  type DisconnectOAuthData,
  type OAuthProvider,
  DISCONNECT_OAUTH,
} from "@/utils/api/oauth-connections";
import { useOAuthConnections } from "./use-connections";

export const ConnectionsSection = () => {
  const { navigate } = useNavigation();
  const queryClient = useQueryClient();
  const fetchDisconnect = useFetchData<
    DisconnectOAuthData,
    { provider: string }
  >(DISCONNECT_OAUTH);

  const { connections, isLoading, isError } = useOAuthConnections();

  const disconnectMutation = useMutation<boolean, Error, string>(
    async (provider: string) => {
      const result = await fetchDisconnect({ provider });
      return result.disconnectOAuth;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("oauthConnections");
      },
    },
  );

  const ALL_PROVIDERS: OAuthProvider[] = ["TIKTOK", "INSTAGRAM", "TWITTER"];
  const connectedProviders = connections?.map((c) => c.provider) ?? [];
  const hasAllConnections = ALL_PROVIDERS.every((p) =>
    connectedProviders.includes(p),
  );

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Connected Accounts"
        description="Connect your social accounts to enable content publishing features."
      />
      <div className="space-y-3">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <div className="text-destructive-100 text-sm">
            Failed to load connections
          </div>
        ) : (
          <>
            {connections?.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onDisconnect={async () => {
                  await disconnectMutation.mutateAsync(connection.provider);
                }}
              />
            ))}
          </>
        )}
      </div>
      {!hasAllConnections && (
        <Button
          type="button"
          variant="outline"
          className="bg-background-100 text-foreground-300 gap-1 w-fit px-3 hover:bg-background-200 hover:text-foreground-100 border border-background-200 hover:border-background-200"
          onClick={() => navigate("/settings/add-connection")}
        >
          <PlusIcon size="sm" variant="line" />
          <span className="normal-case font-normal font-sans text-sm">
            Connect Socials
          </span>
        </Button>
      )}
    </section>
  );
};

const LoadingState = () => (
  <div className="space-y-3">
    <Skeleton className="h-14 w-full rounded" />
  </div>
);
