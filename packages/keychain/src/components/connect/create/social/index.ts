import { useAuth0 } from "@auth0/auth0-react";
import { TurnkeyWallet } from "@cartridge/controller";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { TurnkeyIframeClient } from "@turnkey/sdk-browser";
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

export const useSocialAuthentication = (
  setChangeWallet: (changeWallet: boolean) => void,
) => {
  const [signupOrLogin, setSignupOrLogin] = useState<
    { username: string } | { address: string } | undefined
  >(undefined);
  const { authIframeClient } = useTurnkey();
  const {
    loginWithPopup,
    getIdTokenClaims,
    isAuthenticated,
    user,
    error,
    logout,
    isLoading,
  } = useAuth0();

  const authIframeClientRef = useRef(authIframeClient);
  const signerPromiseRef = useRef<{
    resolve: (
      value:
        | SignupResponse
        | LoginResponse
        | undefined
        | PromiseLike<SignupResponse | LoginResponse | undefined>,
    ) => void;
    reject: (reason?: Error) => void;
  } | null>(null);

  const resetState = useCallback(async () => {
    setSignupOrLogin(undefined);
    signerPromiseRef.current = null;
  }, [setSignupOrLogin]);

  useEffect(() => {
    authIframeClientRef.current = authIframeClient;
  }, [authIframeClient]);

  useEffect(() => {
    if (
      error &&
      (error.message.includes("Popup closed") ||
        error.message.includes(
          "The resource owner or authorization server denied the request",
        ) ||
        error.message.includes("rate limited")) &&
      signerPromiseRef.current
    ) {
      signerPromiseRef.current.reject(
        new Error("Could not sign in with social provider: " + error.message),
      );
      console.log("setting signer promise to null2", error);
      signerPromiseRef.current = null;
    }
  }, [error]);

  const resolveForAccountChange = useCallback(() => {
    setChangeWallet(true);
    signerPromiseRef.current?.resolve(undefined);
    resetState();
  }, [setChangeWallet, resetState]);

  const internalSignup = useCallback(async () => {
    const username = (signupOrLogin as { username: string }).username;
    if (username.length === 0) {
      throw new Error("Username not found");
    }

    const iFramePublicKey = await getIframePublicKey(
      authIframeClientRef.current!,
    );

    const iFrameNonce = getNonce(iFramePublicKey);
    const oidcTokenString = await getOidcToken(getIdTokenClaims, iFrameNonce);
    if (!oidcTokenString) {
      return;
    }

    const subOrganizationId = await getOrCreateTurnkeySuborg(
      oidcTokenString,
      username,
    );

    await authenticateToTurnkey(
      subOrganizationId,
      oidcTokenString,
      authIframeClientRef.current!,
    );

    const address = await getOrCreateWallet(
      subOrganizationId,
      username,
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
    } else {
      throw new Error("No keychain_wallets found");
    }

    if (signerPromiseRef.current) {
      signerPromiseRef.current.resolve({
        address,
        signer: {
          eip191: {
            address,
          },
        },
        type: "discord",
      });
      resetState();
    } else {
      console.error("No signer promise found");
    }
  }, [signupOrLogin, getIdTokenClaims, resetState]);

  const internalLogin = useCallback(async () => {
    const signerAddress = (signupOrLogin as { address: string }).address;
    if (!signerAddress) {
      throw new Error("Signer address is required");
    }

    const iFramePublicKey =
      await authIframeClientRef.current!.getEmbeddedPublicKey();
    if (!iFramePublicKey) {
      await resetIframePublicKey(authIframeClientRef.current!);
      throw new Error("No iFrame public key, please try again");
    }

    const oidcTokenString = await getOidcToken(
      getIdTokenClaims,
      getNonce(iFramePublicKey),
    );

    if (!oidcTokenString) {
      return;
    }

    const subOrganizationId = await getTurnkeySuborg(oidcTokenString);
    if (!subOrganizationId) {
      resolveForAccountChange();
      return;
    }

    await authenticateToTurnkey(
      subOrganizationId,
      oidcTokenString,
      authIframeClientRef.current!,
    );

    const address = await getWallet(
      subOrganizationId,
      authIframeClientRef.current!,
    );
    if (BigInt(address) !== BigInt(signerAddress)) {
      resolveForAccountChange();
      return;
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
    } else {
      throw new Error("No keychain_wallets found");
    }

    if (signerPromiseRef.current) {
      signerPromiseRef.current.resolve({
        signer: {
          eip191: {
            address,
          },
        },
      });
      resetState();
    } else {
      console.error("No signer promise");
    }
  }, [resolveForAccountChange, signupOrLogin, getIdTokenClaims, resetState]);

  useEffect(() => {
    (async () => {
      if (
        !isAuthenticated ||
        !user ||
        !authIframeClientRef.current?.iframePublicKey ||
        error ||
        signupOrLogin === undefined ||
        isLoading
      ) {
        return;
      }

      try {
        if ((signupOrLogin as { username: string }).username) {
          await internalSignup();
        } else {
          await internalLogin();
        }
      } catch (error) {
        signerPromiseRef.current?.reject(error as Error);
        resetState();
      }
    })();
  }, [
    isAuthenticated,
    user,
    signupOrLogin,
    error,
    internalSignup,
    internalLogin,
    resetState,
  ]);

  const pollIframePublicKey = async (
    onSuccess: (key: string) => void,
    onFailure: (err: Error) => Promise<void>,
  ) => {
    const pollTimeMs = 10000;
    const intervalMs = 200;
    let elapsedTime = 0;

    const iFramePublicKey =
      await authIframeClientRef.current?.getEmbeddedPublicKey();
    if (iFramePublicKey) {
      onSuccess(iFramePublicKey);
      return;
    }

    const intervalId = setInterval(async () => {
      const iFramePublicKey =
        await authIframeClientRef.current?.getEmbeddedPublicKey();
      if (iFramePublicKey) {
        clearInterval(intervalId);
        onSuccess(iFramePublicKey);
      } else {
        console.debug("waiting for iframe public key");
        elapsedTime += intervalMs;
        if (elapsedTime >= pollTimeMs) {
          clearInterval(intervalId);
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
            signerPromiseRef.current = { resolve, reject };

            try {
              const nonce = getNonce(iframePublicKey);

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

              setSignupOrLogin(signupOrLogin);
            } catch (error) {
              reject(error);
              resetState();
            }
          },
          async (error) => {
            if (authIframeClientRef.current) {
              await resetIframePublicKey(authIframeClientRef.current);
            }
            reject(error);
            resetState();
          },
        );
      });
    },
    [loginWithPopup, setSignupOrLogin, resetState, logout, isAuthenticated],
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

const resetIframePublicKey = async (authIframeClient: TurnkeyIframeClient) => {
  await authIframeClient.clearEmbeddedKey();
  await authIframeClient.initEmbeddedKey();
};

export const getIframePublicKey = async (
  authIframeClient: TurnkeyIframeClient,
) => {
  const iframePublicKey = await authIframeClient.getEmbeddedPublicKey();
  if (!iframePublicKey) {
    await resetIframePublicKey(authIframeClient);
    throw new Error("No iframe public key, please try again");
  }
  return iframePublicKey;
};
