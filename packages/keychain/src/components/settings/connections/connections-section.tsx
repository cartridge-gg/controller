import { Button, PlusIcon, Skeleton } from "@cartridge/ui";
import { useQuery, useQueryClient, useMutation } from "react-query";
import { SectionHeader } from "../section-header";
import { ConnectionCard } from "./connection-card";
import { useConnection } from "@/hooks/connection";
import { useNavigation } from "@/context/navigation";
import { useFetchData } from "@/utils/api/fetcher";
import {
  type OAuthConnection,
  type OAuthConnectionsData,
  type DisconnectOAuthData,
  type OAuthProvider,
  GET_OAUTH_CONNECTIONS,
  DISCONNECT_OAUTH,
} from "@/utils/api/oauth-connections";

export const ConnectionsSection = () => {
  const { controller } = useConnection();
  const { navigate } = useNavigation();
  const queryClient = useQueryClient();
  const fetchConnections = useFetchData<
    OAuthConnectionsData,
    { username: string }
  >(GET_OAUTH_CONNECTIONS);
  const fetchDisconnect = useFetchData<
    DisconnectOAuthData,
    { provider: string }
  >(DISCONNECT_OAUTH);

  const username = controller?.username();

  const { data, isLoading, isError } = useQuery<OAuthConnection[]>(
    ["oauthConnections", username],
    async () => {
      if (!username) return [];
      const result = await fetchConnections({ username });
      return result.account?.oauthConnections ?? [];
    },
    {
      enabled: !!username,
    },
  );

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
  const connectedProviders = data?.map((c) => c.provider) ?? [];
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
            {data?.map((connection) => (
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
