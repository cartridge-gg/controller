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

export interface InitiateTikTokOAuthData {
  initiateTikTokOAuth: string;
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

export const INITIATE_TIKTOK_OAUTH = gql`
  mutation InitiateTikTokOAuth {
    initiateTikTokOAuth
  }
`;

export const DISCONNECT_OAUTH = gql`
  mutation DisconnectOAuth($provider: OAuthProvider!) {
    disconnectOAuth(provider: $provider)
  }
`;
