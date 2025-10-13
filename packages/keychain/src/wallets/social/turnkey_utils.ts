import { IdToken } from "@auth0/auth0-react";
import { AuthOption } from "@cartridge/controller";
import { fetchApiCreator } from "@cartridge/ui/utils";
import { TurnkeyIframeClient } from "@turnkey/sdk-browser";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { getIframePublicKey } from "./turnkey";

export const OIDC_INVALID_TOKEN_ERROR = "Invalid OIDC token";

export const getWallet = async (
  subOrgId: string,
  authIframeClient: TurnkeyIframeClient,
) => {
  const wallets = await authIframeClient.getWallets({
    organizationId: subOrgId,
  });
  if (wallets.wallets.length > 1) {
    throw new Error(
      "Multiple wallets found" + JSON.stringify(wallets, null, 2),
    );
  }
  if (wallets.wallets.length === 0) {
    throw new Error("No wallets found");
  }

  const wallet = await authIframeClient.getWalletAccount({
    organizationId: subOrgId,
    walletId: wallets.wallets[0].walletId,
  });

  return refineNonNull(wallet.account.address);
};

export const getOrCreateWallet = async (
  subOrgId: string,
  userName: string,
  authIframeClient: TurnkeyIframeClient,
): Promise<string> => {
  const wallets = await authIframeClient.getWallets({
    organizationId: subOrgId,
  });
  if (wallets.wallets.length > 1 && !import.meta.env.DEV) {
    throw new Error(
      "Multiple wallets found" + JSON.stringify(wallets, null, 2),
    );
  }

  if (wallets.wallets.length === 1) {
    const wallet = await authIframeClient.getWalletAccount({
      organizationId: subOrgId,
      walletId: wallets.wallets[0].walletId,
    });
    return refineNonNull(wallet.account.address);
  }

  const createWalletResponse = await authIframeClient.createWallet({
    organizationId: subOrgId,
    walletName: userName,
    accounts: [WALLET_CONFIG],
  });

  const address = refineNonNull(createWalletResponse.addresses[0]);
  return address;
};

function refineNonNull<T>(
  input: T | null | undefined,
  errorMessage?: string,
): T {
  if (input == null) {
    throw new Error(errorMessage ?? `Unexpected ${JSON.stringify(input)}`);
  }

  return input;
}

const WALLET_CONFIG = {
  curve: "CURVE_SECP256K1" as const,
  pathFormat: "PATH_FORMAT_BIP32" as const,
  path: "m/44'/60'/0'/0/0" as const,
  addressFormat: "ADDRESS_FORMAT_ETHEREUM" as const,
};

/**
 * Returns the OIDC token string extracted from the Auth0 claims.
 *
 * @throws {Error} If the OIDC token cannot be extracted from the claims.
 */
export const getAuth0OidcToken = async (
  tokenClaims: IdToken | undefined,
  expectedNonce: string,
): Promise<string> => {
  if (!tokenClaims) {
    throw new Error("Not authenticated with Auth0 yet");
  }

  const oidcTokenString = tokenClaims.__raw;
  if (!oidcTokenString) {
    throw new Error("Raw ID token string (__raw) not found in claims");
  }

  const decodedToken = jwtDecode<DecodedIdToken>(oidcTokenString);
  if (!decodedToken.tknonce) {
    console.error(
      "[Auth0] Token missing tknonce parameter. Token may be from cached session.",
      {
        hasNonce: !!decodedToken.nonce,
        tokenIssued: decodedToken.iat,
      },
    );

    throw new Error(OIDC_INVALID_TOKEN_ERROR);
  }

  if (decodedToken.tknonce !== expectedNonce) {
    throw new Error(
      `Nonce mismatch: expected ${expectedNonce}, got ${decodedToken.tknonce}`,
    );
  }

  return oidcTokenString;
};

interface DecodedIdToken extends JwtPayload {
  nonce?: string;
  tknonce?: string;
}

export type SocialProvider = Extract<AuthOption, "discord" | "google">;

export const fetchApi = fetchApiCreator(
  `${import.meta.env.VITE_CARTRIDGE_API_URL}/oauth2`,
  {
    credentials: "same-origin",
  },
);

export const getTurnkeySuborg = async (
  oidcToken: string,
): Promise<string | undefined> => {
  const getSuborgsResponse = await fetchApi<GetSuborgsResponse>("suborgs", {
    filterType: "OIDC_TOKEN",
    filterValue: oidcToken,
  });
  if (!getSuborgsResponse) {
    throw new Error("No suborgs response found");
  }

  if (getSuborgsResponse.organizationIds.length > 1) {
    throw new Error("Multiple suborgs found");
  }

  return getSuborgsResponse.organizationIds[0];
};

export const getOrCreateTurnkeySuborg = async (
  oidcToken: string,
  username: string,
  socialProvider: SocialProvider,
) => {
  const getSuborgsResponse = await fetchApi<GetSuborgsResponse>("suborgs", {
    filterType: "OIDC_TOKEN",
    filterValue: oidcToken,
  });
  if (!getSuborgsResponse) {
    throw new Error("No suborgs response found");
  }

  let targetSubOrgId: string;
  if (getSuborgsResponse.organizationIds.length === 0) {
    const createSuborgResponse = await fetchApi<CreateSuborgResponse>(
      "create-suborg",
      {
        rootUserUsername: username,
        oauthProviders: [{ providerName: socialProvider, oidcToken }],
      },
    );
    targetSubOrgId = createSuborgResponse.subOrganizationId;
  } else if (getSuborgsResponse.organizationIds.length === 1) {
    targetSubOrgId = getSuborgsResponse.organizationIds[0];
  } else {
    if (import.meta.env.DEV) {
      targetSubOrgId = getSuborgsResponse.organizationIds[0];
    } else {
      // We don't want to handle multiple suborgs per user at the moment
      throw new Error("Multiple suborgs found for user");
    }
  }

  return targetSubOrgId;
};

export const authenticateToTurnkey = async (
  subOrgId: string,
  oidcToken: string,
  authIframeClient: TurnkeyIframeClient,
) => {
  const iframePublicKey = await getIframePublicKey(authIframeClient);

  const authResponse = await fetchApi<AuthResponse>(
    `auth`,
    {
      suborgID: subOrgId,
      targetPublicKey: iframePublicKey,
      oidcToken,
      invalidateExisting: true,
    },
    {
      client_id: "turnkey",
    },
  );

  const injectResponse = await authIframeClient.injectCredentialBundle(
    authResponse.credentialBundle,
  );
  if (!injectResponse) {
    throw new Error("Failed to inject credentials into Turnkey");
  }
};

export type GetSuborgsResponse = {
  organizationIds: string[];
};

type CreateSuborgResponse = {
  subOrganizationId: string;
};

type AuthResponse = {
  credentialBundle: string;
};
