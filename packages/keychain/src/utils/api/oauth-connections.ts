import { gql } from "graphql-request";

// Local types until backend is deployed and codegen updated
// These match the backend schema definitions
export type OAuthProvider = "TIKTOK" | "INSTAGRAM" | "TWITTER";

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

/**
 * Get the URL to initiate Instagram OAuth flow.
 * This opens a direct URL to the API which generates the encrypted state
 * and redirects to Instagram for authorization.
 */
export function getInstagramAuthUrl(username: string): string {
  const baseUrl =
    import.meta.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";
  return `${baseUrl}/instagram/init?username=${encodeURIComponent(username)}`;
}

/**
 * Get the URL to initiate Twitter OAuth flow.
 * This opens a direct URL to the API which generates the encrypted state
 * and redirects to Twitter for authorization.
 */
export function getTwitterAuthUrl(username: string): string {
  const baseUrl =
    import.meta.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";
  return `${baseUrl}/twitter/init?username=${encodeURIComponent(username)}`;
}
