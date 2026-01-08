import { gql } from "graphql-request";

export type OAuthProvider = "TIKTOK";

export interface OAuthConnectionProfile {
  providerUserId: string;
  username?: string | null;
  avatarUrl?: string | null;
}

export interface OAuthConnection {
  id: string;
  provider: OAuthProvider;
  profile: OAuthConnectionProfile;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OAuthConnectionsData {
  account: {
    oauthConnections: OAuthConnection[];
  } | null;
}

export interface OAuthConnectionData {
  oauthConnection: OAuthConnection | null;
}

export interface DisconnectOAuthData {
  disconnectOAuth: boolean;
}

export const GET_OAUTH_CONNECTIONS = gql`
  query GetOAuthConnections($username: String!) {
    account(username: $username) {
      oauthConnections {
        id
        provider
        profile {
          providerUserId
          username
          avatarUrl
        }
        isExpired
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_OAUTH_CONNECTION = gql`
  query GetOAuthConnection($provider: OAuthProvider!) {
    oauthConnection(provider: $provider) {
      id
      provider
      profile {
        providerUserId
        username
        avatarUrl
      }
      isExpired
      createdAt
      updatedAt
    }
  }
`;

// Note: OAuth initiation is done via direct URL, not GraphQL
// See getTikTokAuthUrl() below

export const DISCONNECT_OAUTH = gql`
  mutation DisconnectOAuth($provider: OAuthProvider!) {
    disconnectOAuth(provider: $provider)
  }
`;

/**
 * Get the URL to initiate TikTok OAuth flow.
 * This opens a direct URL to the API which generates the encrypted state
 * and redirects to TikTok for authorization.
 */
export function getTikTokAuthUrl(username: string): string {
  const baseUrl =
    import.meta.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";
  return `${baseUrl}/tiktok/init?username=${encodeURIComponent(username)}`;
}
