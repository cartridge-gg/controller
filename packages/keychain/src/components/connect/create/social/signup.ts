import { useAuth0 } from "@auth0/auth0-react";
import { TurnkeyWallet } from "@cartridge/controller";
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
  const authIframeClientRef = useRef(authIframeClient);

  const { loginWithPopup, getIdTokenClaims, isAuthenticated, user, error } =
    useAuth0();
  const { mutateAsync: register } = useRegisterMutation();
  const [userName, setUserName] = useState("");
  const signaturePromiseRef = useRef<{
    resolve: (value: SignupResponse | PromiseLike<SignupResponse>) => void;
    reject: (reason?: any) => void;
  } | null>(null);

  useEffect(() => {
    authIframeClientRef.current = authIframeClient;
  }, [authIframeClient]);

  useEffect(() => {
    if (
      error &&
      error.message.includes("Popup closed") &&
      signaturePromiseRef.current
    ) {
      signaturePromiseRef.current.reject(error);
      signaturePromiseRef.current = null;
    }
  }, [error]);

  useEffect(() => {
    (async () => {
      if (
        // Sanity check: the userName has already been validated at the previous step
        userName.length === 0 ||
        !isAuthenticated ||
        !user ||
        !authIframeClientRef.current?.iframePublicKey ||
        error
      ) {
        return;
      }

      try {
        const oidcTokenString = await getOidcToken(
          getIdTokenClaims,
          getNonce(authIframeClientRef.current.iframePublicKey!),
        );

        if (!oidcTokenString) {
          return;
        }

        const subOrganizationId = await getOrCreateTurnkeySuborg(
          oidcTokenString,
          userName,
        );

        await authenticateToTurnkey(
          subOrganizationId,
          oidcTokenString,
          authIframeClientRef.current,
        );

        const address = await getOrCreateWallet(
          subOrganizationId,
          userName,
          authIframeClientRef.current,
        );

        if (window.keychain_wallets) {
          window.keychain_wallets.addEmbeddedWallet(
            address.toLowerCase(),
            new TurnkeyWallet(
              authIframeClientRef.current,
              address,
              subOrganizationId,
            ),
          );
          console.log(`Embedded wallet ${address} added to keychain_wallets`);
        }

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
        console.error("Error continuing signup:", error);
      }
    })();
  }, [isAuthenticated, user, userName, getIdTokenClaims, register]);

  const signupWithSocial = useCallback(
    async (username: string): Promise<SignupResponse> => {
      const pollIframePublicKey = (
        onSuccess: (key: string) => void,
        onFailure: (err: Error) => void,
      ) => {
        const pollTimeMs = 10000;
        const intervalMs = 200;
        let elapsedTime = 0;

        if (authIframeClientRef.current?.iframePublicKey) {
          onSuccess(authIframeClientRef.current.iframePublicKey);
          return;
        }

        const intervalId = setInterval(() => {
          if (authIframeClientRef.current?.iframePublicKey) {
            clearInterval(intervalId);
            onSuccess(authIframeClientRef.current.iframePublicKey);
          } else {
            console.log("waiting for the iframe's public key");
            elapsedTime += intervalMs;
            if (elapsedTime >= pollTimeMs) {
              clearInterval(intervalId);
              console.error("Timeout waiting for Turnkey iframe public key.");
              onFailure(
                new Error("Timeout waiting for Turnkey iframe public key."),
              );
            }
          }
        }, intervalMs);
      };
      return new Promise(async (resolve, reject) => {
        pollIframePublicKey(
          async (iframePublicKey) => {
            signaturePromiseRef.current = { resolve, reject };

            try {
              const nonce = getNonce(iframePublicKey);
              setUserName(username);

              const popup = openPopup("");
              await loginWithPopup(
                {
                  authorizationParams: {
                    connection: SOCIAL_PROVIDER_NAME,
                    redirect_uri: import.meta.env.VITE_ORIGIN,
                    nonce,
                    display: "touch",
                    tknonce: nonce,
                  },
                },
                { popup },
              );
            } catch (error) {
              reject(error);
              signaturePromiseRef.current = null;
            }
          },
          (error) => {
            reject(error);
            signaturePromiseRef.current = null;
          },
        );
      });
    },
    [setUserName, loginWithPopup],
  );

  return { signupWithSocial };
};

const getNonce = (seed: string) => {
  return bytesToHex(sha256(seed));
};

const openPopup = (url: string) => {
  const width = 400;
  const height = 600;
  const left = window.screenX + (window.innerWidth - width) / 2;
  const top = window.screenY + (window.innerHeight - height) / 2;

  return window.open(
    url,
    "auth0:authorize:popup",
    `left=${left},top=${top},resizable,scrollbars=no,status=1`,
  );
};
