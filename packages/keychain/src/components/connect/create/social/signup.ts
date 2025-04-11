import { useAuth0 } from "@auth0/auth0-react";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { useTurnkey } from "@turnkey/sdk-react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";

export const useSignupWithSocial = () => {
  const { authIframeClient } = useTurnkey();
  const { loginWithPopup, logout, getIdTokenClaims, isAuthenticated, user } =
    useAuth0();

  const [userName, setUserName] = useState("");

  useEffect(() => {
    (async () => {
      if (
        // // sanity check as the userName has already been validated at the previous step
        // userName.length === 0 ||
        !isAuthenticated ||
        !user ||
        !authIframeClient?.iframePublicKey
      ) {
        console.log("User is not authenticated:", user);
        return;
      }

      try {
        const tokenClaims = await getIdTokenClaims();
        if (!tokenClaims) {
          console.error("User has not authenticated himself with Auth0 yet");
          return;
        }

        const oidcTokenString = tokenClaims.__raw;
        if (!oidcTokenString) {
          console.error("Raw ID token string (__raw) not found in claims");
          return;
        }

        const decodedToken = jwtDecode<DecodedIdToken>(oidcTokenString);
        const expectedNonce = getNonce(authIframeClient!.iframePublicKey!);

        if (decodedToken.tknonce !== expectedNonce) {
          throw new Error(
            `Nonce mismatch: expected ${expectedNonce}, got ${decodedToken.tknonce}`,
          );
        }

        const getSuborgsResponse = await doFetch("suborgs", {
          filterType: "OIDC_TOKEN",
          filterValue: oidcTokenString,
        });

        if (!getSuborgsResponse) {
          console.error("No suborgs response found");
          return;
        }

        let targetSubOrgId: string;
        if (getSuborgsResponse.organizationIds.length > 1) {
          throw new Error("Multiple suborgs found for user");
        } else if (getSuborgsResponse.organizationIds.length === 0) {
          const createSuborgResponse = await doFetch("create-suborg", {
            rootUserUsername: userName,
            oauthProviders: [
              { providerName: "Discord-Test", oidcToken: oidcTokenString },
            ],
          });
          targetSubOrgId = createSuborgResponse.subOrganizationId;
        } else {
          targetSubOrgId = getSuborgsResponse.organizationIds[0];
        }

        console.log(`Using sub-org with ID: ${targetSubOrgId}`);

        const authResponse = await doFetch("auth", {
          suborgID: targetSubOrgId,
          targetPublicKey: authIframeClient.iframePublicKey,
          oidcToken: oidcTokenString,
          invalidateExisting: true,
        });

        const injectResponse = await authIframeClient!.injectCredentialBundle(
          authResponse.credentialBundle,
        );
        if (!injectResponse) {
          throw new Error("Failed to inject credentials into Turnkey");
        }

        const wallets = await authIframeClient!.getWallets({
          organizationId: targetSubOrgId,
        });

        if (wallets.wallets.length > 0) {
          throw new Error("Wallet already exists" + wallets.wallets);
        }

        const createWalletResponse = await authIframeClient!.createWallet({
          organizationId: targetSubOrgId,
          walletName: userName,
          accounts: [walletConfig],
        });

        const address = refineNonNull(createWalletResponse.addresses[0]);

        alert(`SUCCESS! Wallet and new address created: ${address} `);
      } catch (error) {
        await logout({
          logoutParams: { returnTo: import.meta.env.VITE_ORIGIN },
          clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        });
        console.error("Error continuing signup:", error);
      }
    })();
  }, [isAuthenticated, user, userName, authIframeClient, logout]);

  const signupWithSocial = useCallback(
    async (username: string) => {
      if (!authIframeClient?.iframePublicKey) {
        console.error("Turnkey iframe client or public key not available.");
        return;
      }

      try {
        const nonce = getNonce(authIframeClient.iframePublicKey!);

        setUserName(username);

        loginWithPopup({
          authorizationParams: {
            connection: "discord",
            redirect_uri: import.meta.env.VITE_ORIGIN,
            nonce,
            tknonce: nonce,
          },
        });
      } catch (error) {
        console.error("Error logging in:", error);
        alert("Login failed. See console for details.");
      }
    },
    [authIframeClient, setUserName, loginWithPopup],
  );

  return { signupWithSocial };
};
const getNonce = (seed: string) => {
  return bytesToHex(sha256(seed));
};

const doFetch = async (endpoint: string, body: any) => {
  const response = await fetch(
    `${import.meta.env.VITE_CARTRIDGE_API_URL}/oauth2/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorBody}`,
    );
  }
  return await response.json();
};

interface DecodedIdToken extends JwtPayload {
  nonce?: string;
  tknonce?: string;
}

function refineNonNull<T>(
  input: T | null | undefined,
  errorMessage?: string,
): T {
  if (input == null) {
    throw new Error(errorMessage ?? `Unexpected ${JSON.stringify(input)}`);
  }

  return input;
}

const walletConfig = {
  curve: "CURVE_SECP256K1" as const,
  pathFormat: "PATH_FORMAT_BIP32" as const,
  path: "m/44'/60'/0'/0/0" as const,
  addressFormat: "ADDRESS_FORMAT_ETHEREUM" as const,
};
