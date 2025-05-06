import { useAuth0 } from "@auth0/auth0-react";
import { TurnkeyWallet } from "@cartridge/controller";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { useTurnkey } from "@turnkey/sdk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoginResponse, SignupResponse } from "../useCreateController";
import {
  authenticateToTurnkey,
  getOrCreateTurnkeySuborg,
  getTurnkeySuborg,
  SOCIAL_PROVIDER_NAME,
} from "./api";
import { getOidcToken } from "./auth0";
import { getOrCreateWallet, getWallet } from "./turnkey";

export const useSocialAuthentication = () => {
  const [signupOrLogin, setSignupOrLogin] = useState<
    { username: string } | { address: string } | undefined
  >(undefined);
  const { authIframeClient } = useTurnkey();
  const { loginWithPopup, getIdTokenClaims, isAuthenticated, user, error } =
    useAuth0();

  const authIframeClientRef = useRef(authIframeClient);
  const signaturePromiseRef = useRef<{
    resolve: (
      value:
        | SignupResponse
        | LoginResponse
        | PromiseLike<SignupResponse | LoginResponse>,
    ) => void;
    reject: (reason?: Error) => void;
  } | null>(null);

  useEffect(() => {
    authIframeClientRef.current = authIframeClient;
  }, [authIframeClient]);

  useEffect(() => {
    if (
      error &&
      (error.message.includes("Popup closed") ||
        error.message.includes(
          "The resource owner or authorization server denied the request",
        )) &&
      signaturePromiseRef.current
    ) {
      signaturePromiseRef.current.reject(
        new Error("Could not sign in with social provider: " + error.message),
      );
      signaturePromiseRef.current = null;
    }
  }, [error]);

  // TODO(tedison) put this in a useCallback
  const internalSignup = async () => {
    console.log("internalSignup", signupOrLogin);
    if (!(signupOrLogin as { username: string }).username) {
      throw new Error("Unreachable");
    }

    const oidcTokenString = await getOidcToken(
      getIdTokenClaims,
      getNonce(authIframeClientRef.current!.iframePublicKey!),
    );

    if (!oidcTokenString) {
      return;
    }

    const subOrganizationId = await getOrCreateTurnkeySuborg(
      oidcTokenString,
      (signupOrLogin as { username: string }).username,
    );

    await authenticateToTurnkey(
      subOrganizationId,
      oidcTokenString,
      authIframeClientRef.current!,
    );

    const address = await getOrCreateWallet(
      subOrganizationId,
      (signupOrLogin as { username: string }).username,
      authIframeClientRef.current!,
    );

    if (window.keychain_wallets) {
      window.keychain_wallets.addEmbeddedWallet(
        address.toLowerCase(),
        new TurnkeyWallet(
          authIframeClientRef.current!,
          address,
          subOrganizationId,
        ),
      );
    }

    if (signaturePromiseRef.current) {
      signaturePromiseRef.current.resolve({
        address,
        signer: {
          eip191: {
            address,
          },
        },
        type: "discord",
      });
      signaturePromiseRef.current = null;
    }
  };

  // TODO(tedison) put this in a useCallback
  const internalLogin = async () => {
    console.log("internalLogin", signupOrLogin);
    if (!(signupOrLogin as { address: string }).address) {
      throw new Error("Unreachable");
    }

    const oidcTokenString = await getOidcToken(
      getIdTokenClaims,
      getNonce(authIframeClientRef.current!.iframePublicKey!),
    );

    if (!oidcTokenString) {
      return;
    }

    const subOrganizationId = await getTurnkeySuborg(oidcTokenString);

    await authenticateToTurnkey(
      subOrganizationId,
      oidcTokenString,
      authIframeClientRef.current!,
    );

    const address = await getWallet(
      subOrganizationId,
      authIframeClientRef.current!,
    );

    if (
      BigInt(address) !== BigInt((signupOrLogin as { address: string }).address)
    ) {
      throw new Error(
        "Please connect with the same account you used to sign up",
      );
    }

    if (window.keychain_wallets) {
      window.keychain_wallets.addEmbeddedWallet(
        address.toLowerCase(),
        new TurnkeyWallet(
          authIframeClientRef.current!,
          address,
          subOrganizationId,
        ),
      );
    }

    if (signaturePromiseRef.current) {
      signaturePromiseRef.current.resolve({
        signer: {
          eip191: {
            address,
          },
        },
      });
      signaturePromiseRef.current = null;
    }
  };

  useEffect(() => {
    (async () => {
      if (
        // Sanity check: the username has already been validated at the previous step
        !isAuthenticated ||
        !user ||
        !authIframeClientRef.current?.iframePublicKey ||
        error ||
        signupOrLogin === undefined
      ) {
        return;
      }

      try {
        if ((signupOrLogin as { username: string }).username) {
          if ((signupOrLogin as { username: string }).username.length === 0) {
            throw new Error("Username is required");
          }
          await internalSignup();
        } else {
          await internalLogin();
        }
      } catch (error) {
        console.error("Error continuing signup:", error);
      }
    })();
  }, [isAuthenticated, user, signupOrLogin, error]);

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

  const signup = useCallback(
    async (signupOrLogin: { username: string } | { address: string }) => {
      return new Promise((resolve, reject) => {
        pollIframePublicKey(
          async (iframePublicKey) => {
            signaturePromiseRef.current = { resolve, reject };

            try {
              const nonce = getNonce(iframePublicKey);
              setSignupOrLogin(signupOrLogin);

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
    [loginWithPopup, setSignupOrLogin],
  );

  return { signup, login: signup };
};

const getNonce = (seed: string) => {
  return bytesToHex(sha256(seed));
};

const openPopup = (url: string) => {
  return window.open(
    url,
    "auth0:authorize:popup",
    `resizable,scrollbars=no,status=1`,
  );
};
