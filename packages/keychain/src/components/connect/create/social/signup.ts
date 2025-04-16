import { useAuth0 } from "@auth0/auth0-react";
import { useRegisterMutation } from "@cartridge/utils/api/cartridge";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { useTurnkey } from "@turnkey/sdk-react";
import { useCallback, useEffect, useState } from "react";
import {
  authenticateToTurnkey,
  getTurnkeySuborg,
  registerController,
} from "./api";
import { getOidcToken } from "./auth0";
import { getOrCreateWallet, signCreateControllerMessage } from "./turnkey";

export const useSignupWithSocial = () => {
  const { authIframeClient } = useTurnkey();
  const { loginWithPopup, logout, getIdTokenClaims, isAuthenticated, user } =
    useAuth0();
  const { mutateAsync: register } = useRegisterMutation();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    (async () => {
      if (
        // Sanity check: the userName has already been validated at the previous step
        userName.length === 0 ||
        !isAuthenticated ||
        !user ||
        !authIframeClient?.iframePublicKey
      ) {
        console.log("User is not authenticated:", user);
        return;
      }

      try {
        const oidcTokenString = await getOidcToken(
          getIdTokenClaims,
          getNonce(authIframeClient.iframePublicKey!),
        );

        const targetSubOrgId = await getTurnkeySuborg(
          oidcTokenString,
          userName,
        );

        await authenticateToTurnkey(
          targetSubOrgId,
          oidcTokenString,
          authIframeClient,
        );

        const address = await getOrCreateWallet(
          targetSubOrgId,
          userName,
          authIframeClient,
        );

        const signature = await signCreateControllerMessage(
          address,
          authIframeClient,
        );

        const res = await registerController(
          register,
          address,
          signature,
          userName,
        );
        console.log("Register response:", res);
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
