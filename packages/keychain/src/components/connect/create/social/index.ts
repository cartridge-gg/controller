import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { useConnection } from "@/hooks/connection";
import { useAuth0 } from "@auth0/auth0-react";
import { TurnkeyWallet } from "@cartridge/controller";
import {
  ControllerQuery,
  useRegisterMutation,
} from "@cartridge/utils/api/cartridge";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { useTurnkey } from "@turnkey/sdk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createController, SignupResponse } from "../useCreateController";
import {
  authenticateToTurnkey,
  getOrCreateTurnkeySuborg,
  SOCIAL_PROVIDER_NAME,
} from "./api";
import { getOidcToken } from "./auth0";
import { getOrCreateWallet } from "./turnkey";

// Define a type for the singular credential
interface Eip191Credential {
  __typename?: "Eip191Credential";
  ethAddress: string;
}

export const useSocialAuthentication = () => {
  const { authIframeClient } = useTurnkey();
  const { origin, chainId, rpcUrl, setController } = useConnection();
  const { loginWithPopup, getIdTokenClaims, isAuthenticated, user, error } =
    useAuth0();
  const { mutateAsync: register } = useRegisterMutation();

  const authIframeClientRef = useRef(authIframeClient);
  const [userName, setUserName] = useState("");
  const signaturePromiseRef = useRef<{
    resolve: (value: SignupResponse | PromiseLike<SignupResponse>) => void;
    reject: (reason?: Error) => void;
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
      signaturePromiseRef.current.reject(
        new Error("Could not sign in with social provider: " + error.message),
      );
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
        }

        if (signaturePromiseRef.current) {
          signaturePromiseRef.current.resolve({
            address,
            signer: {
              eip191: {
                address,
              },
            },
            type: "social",
          });
          signaturePromiseRef.current = null;
        }
      } catch (error) {
        console.error("Error continuing signup:", error);
      }
    })();
  }, [isAuthenticated, user, userName, getIdTokenClaims, register]);

  const signup = useCallback(
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
      return new Promise((resolve, reject) => {
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

  const login = useCallback(
    async (
      controller: ControllerQuery["controller"],
      // Use the defined Eip191Credential type
      credential: Eip191Credential | undefined, // Allow undefined for checks
    ) => {
      if (!origin || !chainId || !rpcUrl) throw new Error("No connection");
      if (!controller) throw new Error("No controller found");
      if (!credential) throw new Error("No EIP191 credential provided");

      // Extract the Ethereum address directly from the passed credential
      const address = credential?.ethAddress;

      if (!address) {
        throw new Error(
          "Could not extract ethAddress from provided EIP191 credential",
        );
      }

      // userName should be available from the outer scope (useState)
      const controllerObject = await createController(
        origin,
        chainId,
        rpcUrl,
        userName,
        controller.constructorCalldata[0], // Assuming constructorCalldata is always present and has at least one element
        controller.address,
        {
          signer: {
            eip191: {
              address,
            },
          },
        },
      );

      await controllerObject.login(now() + DEFAULT_SESSION_DURATION);

      window.controller = controllerObject;
      setController(controllerObject);
    },
    [chainId, rpcUrl, origin, setController],
  );

  return { signup, login };
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
