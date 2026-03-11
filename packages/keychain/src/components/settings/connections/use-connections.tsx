import { useQuery } from "react-query";
import { useConnection } from "@/hooks/connection";
import { useFetchData } from "@/utils/api/fetcher";
import {
  type OAuthConnection,
  type OAuthConnectionsData,
  GET_OAUTH_CONNECTIONS,
  OAuthProvider,
} from "@/utils/api/oauth-connections";
import { useMemo } from "react";

export const useOAuthConnections = () => {
  const { controller } = useConnection();
  const fetchConnections = useFetchData<
    OAuthConnectionsData,
    { username: string }
  >(GET_OAUTH_CONNECTIONS);

  const username = controller?.username();

  const {
    data: connections,
    isLoading,
    isError,
  } = useQuery<OAuthConnection[]>(
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

  return {
    connections,
    isLoading,
    isError,
  };
};

export const useOAuthConnection = (provider: OAuthProvider) => {
  const { connections, isLoading, isError } = useOAuthConnections();
  const connection = useMemo(
    () => connections?.find((c) => c.provider === provider),
    [connections],
  );
  return {
    connection,
    isLoading,
    isError,
  };
};
