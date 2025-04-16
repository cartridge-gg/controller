import { useAuth0 } from "@auth0/auth0-react";
import { useRegisterMutation } from "@cartridge/utils/api/cartridge";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { useTurnkey } from "@turnkey/sdk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SignupResponse } from "../useCreateController";
import {
  authenticateToTurnkey,
  getOrCreateTurnkeySuborg,
  SOCIAL_PROVIDER_NAME,
} from "./api";
import { getOidcToken } from "./auth0";
import { getOrCreateWallet } from "./turnkey";

export const useSignupWithSocial = () => {
  const { authIframeClient } = useTurnkey();
  const { loginWithPopup, logout, getIdTokenClaims, isAuthenticated, user } =
    useAuth0();
  const { mutateAsync: register } = useRegisterMutation();
  const [userName, setUserName] = useState("");
  const signaturePromiseRef = useRef<{
    resolve: (value: SignupResponse | PromiseLike<SignupResponse>) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (
        // Sanity check: the userName has already been validated at the previous step
        userName.length === 0 ||
        !isAuthenticated ||
        !user ||
        !authIframeClient?.iframePublicKey
      ) {
        throw new Error("User is not authenticated");
      }

      try {
        const oidcTokenString = await getOidcToken(
          getIdTokenClaims,
          getNonce(authIframeClient.iframePublicKey!),
        );

        const subOrganizationId = await getOrCreateTurnkeySuborg(
          oidcTokenString,
          userName,
        );

        await authenticateToTurnkey(
          subOrganizationId,
          oidcTokenString,
          authIframeClient,
        );

        const address = await getOrCreateWallet(
          subOrganizationId,
          userName,
          authIframeClient,
        );

        if (signaturePromiseRef.current) {
          signaturePromiseRef.current.resolve({
            address,
            signer: {
              eip191: {
                address,
              },
            },
          });
          signaturePromiseRef.current = null;
        }
      } catch (error) {
        await logout({
          logoutParams: { returnTo: import.meta.env.VITE_ORIGIN },
          clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        });
        console.error("Error continuing signup:", error);
        if (signaturePromiseRef.current) {
          signaturePromiseRef.current.reject(error);
          signaturePromiseRef.current = null;
        }
      }
    })();
  }, [
    isAuthenticated,
    user,
    userName,
    authIframeClient,
    logout,
    getIdTokenClaims,
    register,
  ]);

  const signupWithSocial = useCallback(
    async (username: string): Promise<SignupResponse> => {
      return new Promise(async (resolve, reject) => {
        if (!authIframeClient?.iframePublicKey) {
          console.error("Turnkey iframe client or public key not available.");
          reject(
            new Error("Turnkey iframe client or public key not available."),
          );
          return;
        }

        signaturePromiseRef.current = { resolve, reject };

        try {
          const nonce = getNonce(authIframeClient.iframePublicKey!);

          setUserName(username);

          await loginWithPopup({
            authorizationParams: {
              connection: SOCIAL_PROVIDER_NAME,
              redirect_uri: import.meta.env.VITE_ORIGIN,
              nonce,
              tknonce: nonce,
            },
          });
        } catch (error) {
          reject(error);
          signaturePromiseRef.current = null;
        }
      });
    },
    [
      authIframeClient,
      setUserName,
      loginWithPopup,
      authIframeClient?.iframePublicKey,
    ],
  );

  return { signupWithSocial };
};

const getNonce = (seed: string) => {
  return bytesToHex(sha256(seed));
};
