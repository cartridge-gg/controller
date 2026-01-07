import { Button, Skeleton, SpinnerIcon } from "@cartridge/ui";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { SiTiktok } from "@icons-pack/react-simple-icons";
import { SectionHeader } from "../section-header";
import { ConnectionCard } from "./connection-card";
import { useConnection } from "@/hooks/connection";
import { useFetchData } from "@/utils/api/fetcher";
import {
  type OAuthConnection,
  type OAuthConnectionsData,
  type InitiateTikTokOAuthData,
  type DisconnectOAuthData,
  GET_OAUTH_CONNECTIONS,
  INITIATE_TIKTOK_OAUTH,
  DISCONNECT_OAUTH,
} from "@/utils/api/oauth-connections";

export const ConnectionsSection = () => {
  const { controller } = useConnection();
  const queryClient = useQueryClient();
  const fetchConnections = useFetchData<
    OAuthConnectionsData,
    { username: string }
  >(GET_OAUTH_CONNECTIONS);
  const fetchInitiateTikTok = useFetchData<InitiateTikTokOAuthData, undefined>(
    INITIATE_TIKTOK_OAUTH,
  );
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

  const connectTikTok = useMutation<string, Error>(
    async () => {
      const result = await fetchInitiateTikTok();
      return result.initiateTikTokOAuth;
    },
    {
      onSuccess: (authUrl) => {
        // Open TikTok OAuth in a popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(
          authUrl,
          "tiktok-oauth",
          `width=${width},height=${height},left=${left},top=${top}`,
        );
      },
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

  const tiktokConnection = data?.find((c) => c.provider === "TIKTOK");

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
            {tiktokConnection ? (
              <ConnectionCard
                connection={tiktokConnection}
                onDisconnect={async () => {
                  await disconnectMutation.mutateAsync("TIKTOK");
                }}
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                className="bg-background-100 text-foreground-300 gap-2 w-full px-3 hover:bg-background-200 hover:text-foreground-100 border border-background-200"
                onClick={() => connectTikTok.mutate()}
                disabled={connectTikTok.isLoading}
              >
                {connectTikTok.isLoading ? (
                  <SpinnerIcon className="animate-spin" size="sm" />
                ) : (
                  <SiTiktok size={16} />
                )}
                <span className="normal-case font-normal font-sans text-sm">
                  Connect TikTok
                </span>
              </Button>
            )}
          </>
        )}
      </div>
    </section>
  );
};

const LoadingState = () => (
  <div className="space-y-3">
    <Skeleton className="h-14 w-full rounded" />
  </div>
);
