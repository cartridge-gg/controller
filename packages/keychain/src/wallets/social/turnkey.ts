import { Auth0Client, createAuth0Client } from "@auth0/auth0-spa-js";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import { isIframe } from "@cartridge/ui/utils";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import { Turnkey, TurnkeyIframeClient } from "@turnkey/sdk-browser";
import { ethers, getAddress, getBytes, Signature } from "ethers";
import {
  authenticateToTurnkey,
  getAuth0OidcToken,
  getOrCreateTurnkeySuborg,
  getOrCreateWallet,
  getTurnkeySuborg,
  getWallet,
  SocialProvider,
  OIDC_INVALID_TOKEN_ERROR,
} from "./turnkey_utils";

export const Auth0SocialProviderName: Record<SocialProvider, string> = {
  discord: "discord",
  google: "google-oauth2",
};

let AUTH0_CLIENT_PROMISE: Promise<Auth0Client> | null = null;

const URL_PARAMS_KEY = "auth0-url-params";
const RPC_URL_KEY = "rpc-url-tk-storage";

export class TurnkeyWallet {
  readonly type: ExternalWalletType = "turnkey" as ExternalWalletType;
  readonly platform: ExternalPlatform = "ethereum";
  account: string | undefined = undefined;
  subOrganizationId: string | undefined = undefined;
  private turnkeyIframePromise: Promise<TurnkeyIframeClient> | undefined =
    undefined;

  constructor(
    private username: string,
    private chainId: string,
    private rpcUrl: string,
    private socialProvider: SocialProvider | undefined,
  ) {
    if (!AUTH0_CLIENT_PROMISE) {
      AUTH0_CLIENT_PROMISE = createAuth0Client({
        domain: import.meta.env.VITE_AUTH0_DOMAIN,
        clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        cacheLocation: "localstorage",
        useCookiesForTransactions: true,
        useRefreshTokens: true,
      });
    }

    const randomId = Math.random().toString(36).substring(2, 15);
    const turnkeyIframe = document.getElementById(
      `turnkey-iframe-container-${randomId}`,
    );
    if (turnkeyIframe) {
      document.body.removeChild(turnkeyIframe);
    }
    const turnkeySdk = new Turnkey({
      apiBaseUrl: import.meta.env.VITE_TURNKEY_BASE_URL,
      defaultOrganizationId: import.meta.env.VITE_TURNKEY_ORGANIZATION_ID,
    });
    const iframeContainer = document.createElement("div");
    iframeContainer.style.display = "none";
    iframeContainer.id = "turnkey-iframe-container";
    document.body.appendChild(iframeContainer);

    this.turnkeyIframePromise = turnkeySdk
      .iframeClient({
        iframeContainer: iframeContainer,
        iframeUrl: import.meta.env.VITE_TURNKEY_IFRAME_URL,
      })
      .then(async (turnkeyIframeClient: TurnkeyIframeClient) => {
        await turnkeyIframeClient.initEmbeddedKey();
        return turnkeyIframeClient;
      });
  }

  isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      !!this.turnkeyIframePromise &&
      !!AUTH0_CLIENT_PROMISE
    );
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      name: "Turnkey",
      platform: this.platform,
    };
  }

  async connect(isSignup: boolean): Promise<ExternalWalletResponse> {
    try {
      if (!this.socialProvider) {
        throw new Error("Social provider not set");
      }

      console.log("[Turnkey] Starting connect flow:", {
        isSignup,
        socialProvider: this.socialProvider,
        isIframe: isIframe(),
        userAgent: navigator.userAgent,
      });

      const iframePublicKey = await this.pollIframePublicKey(10_000);
      const nonce = getNonce(iframePublicKey);

      const auth0Client = await this.getAuth0Client(10_000);

      // For login flows, try to use cached Auth0 session if available
      if (!isSignup && (await auth0Client.isAuthenticated())) {
        const tokenClaims = await auth0Client.getIdTokenClaims();
        const cachedNonce = tokenClaims?.tknonce as string | undefined;

        if (cachedNonce !== nonce) {
          // Cached token has stale nonce from old iframe key, clear it
          console.info(
            "[Turnkey] Cached token nonce doesn't match iframe, clearing session",
          );
          await auth0Client.logout({ openUrl: false });
        } else {
          // Token nonce matches, try the fast path
          try {
            const connectResult = await this.finishConnect({ nonce });
            // If account matches expectation, return early without OAuth redirect
            if (this.account && this.account === connectResult.account) {
              return connectResult;
            }
          } catch (error) {
            // If token validation fails for other reasons, clear and continue
            if ((error as Error).message?.includes(OIDC_INVALID_TOKEN_ERROR)) {
              console.info(
                "[Turnkey] Cached Auth0 session invalid, forcing logout",
              );
              await auth0Client.logout({ openUrl: false });
            } else {
              throw error;
            }
          }
        }
      }

      const windowUri = new URL(window.location.toString());

      const urlParams = Object.fromEntries(windowUri.searchParams.entries());
      windowUri.search = "";

      const urlParamsString = JSON.stringify(urlParams);

      localStorage.setItem(URL_PARAMS_KEY, urlParamsString);
      localStorage.setItem(RPC_URL_KEY, this.rpcUrl);

      const redirectUri =
        windowUri.pathname === "/session"
          ? windowUri.origin + windowUri.pathname
          : windowUri.origin;

      console.log("[Turnkey] Auth config:", {
        redirectUri,
        connection: Auth0SocialProviderName[this.socialProvider],
      });

      // cases:
      // we are not in an iFrame -> use redirect flow
      // we are in an iFrame and have access to window.open -> normal case, use popup
      // we are in an iFrame but don't have access to window.open -> we are very likely in a native app, developers should use SessionConnector with a native browser instead
      if (!isIframe()) {
        console.log("[Turnkey] Using redirect flow");
        await auth0Client.loginWithRedirect({
          authorizationParams: {
            connection: Auth0SocialProviderName[this.socialProvider],
            redirect_uri: redirectUri,
            nonce,
            tknonce: nonce,
          },
          appState: {
            nonce,
            username: this.username,
            socialProvider: this.socialProvider,
            isSignup,
            chainId: this.chainId,
          },
        });
        return { success: false, wallet: this.type };
      }

      console.log("[Turnkey] Using popup flow - opening popup");
      // Use a known blank page as the initial popup URL instead of empty string
      // This prevents iOS from navigating to about:blank
      const popupUrl = isIOS() ? "https://x.cartridge.gg" : "";
      console.log("[Turnkey] Opening popup with URL:", popupUrl);
      const popup = openPopup(popupUrl);

      if (!popup) {
        console.error("[Turnkey] Failed to open popup");
        throw new Error("Should be able to open a popup in an iFrame");
      }

      console.log(
        "[Turnkey] Popup opened successfully, location:",
        popup.location?.href || "unknown",
      );
      console.log(
        "[Turnkey] Calling loginWithPopup with redirectUri:",
        redirectUri,
      );

      await auth0Client.loginWithPopup(
        {
          authorizationParams: {
            connection: Auth0SocialProviderName[this.socialProvider],
            redirect_uri: redirectUri,
            nonce,
            display: "touch",
            tknonce: nonce,
          },
        },
        { popup },
      );

      console.log("[Turnkey] loginWithPopup completed successfully");
      return await this.finishConnect({
        nonce,
      });
    } catch (error) {
      localStorage.removeItem(URL_PARAMS_KEY);
      localStorage.removeItem(RPC_URL_KEY);
      console.error("[Turnkey] Error in connect flow:", {
        message: (error as Error).message,
        name: (error as Error).name,
        stack: (error as Error).stack,
        isIframe: isIframe(),
      });
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async handleRedirect(
    url: string,
    setError: (error: Error) => void,
  ): Promise<ExternalWalletResponse & RedirectResponse> {
    try {
      const auth0Client = await this.getAuth0Client(10_000);

      const result = await auth0Client.handleRedirectCallback(url);
      if (!result) {
        throw new Error("Failed to handle redirect");
      }

      if (!result.appState || result.appState.error) {
        throw new Error(result.appState.error || "Empty state");
      }

      this.username = result.appState.username;
      this.socialProvider = result.appState.socialProvider;
      this.chainId = result.appState.chainId;

      const urlParamsString = localStorage.getItem(URL_PARAMS_KEY);
      const searchParams = urlParamsString
        ? new URLSearchParams(JSON.parse(urlParamsString))
        : undefined;

      const rpcUrl = localStorage.getItem(RPC_URL_KEY);
      return {
        ...(await this.finishConnect({
          nonce: result.appState.nonce,
        })),
        ...result.appState,
        rpcUrl,
        searchParams,
      };
    } catch (error) {
      setError(new Error(`Final error: ${(error as Error).message}`));
      throw error;
    }
  }

  async finishConnect({
    nonce,
  }: {
    nonce: string;
  }): Promise<ExternalWalletResponse> {
    if (!this.socialProvider) {
      throw new Error("Social Provider should be defined");
    }
    const turnkeyIframeClient = await this.getTurnkeyIframeClient(10_000);
    const auth0Client = await this.getAuth0Client(10_000);

    const tokenClaims = await auth0Client.getIdTokenClaims();
    const oidcTokenString = await getAuth0OidcToken(tokenClaims, nonce);

    const subOrganizationId = this.username
      ? await getOrCreateTurnkeySuborg(
          oidcTokenString,
          this.username,
          this.socialProvider,
        )
      : await getTurnkeySuborg(oidcTokenString);

    if (!subOrganizationId) {
      throw new Error("No subOrganizationId");
    }
    await authenticateToTurnkey(
      subOrganizationId,
      oidcTokenString,
      turnkeyIframeClient!,
    );

    const turnkeyAddress = this.username
      ? await getOrCreateWallet(
          subOrganizationId,
          this.username,
          turnkeyIframeClient!,
        )
      : await getWallet(subOrganizationId, turnkeyIframeClient!);

    const checksummedAddress = getAddress(turnkeyAddress);

    this.account = checksummedAddress;
    this.subOrganizationId = subOrganizationId;

    return {
      success: true,
      wallet: this.type,
      account: checksummedAddress,
    };
  }

  getConnectedAccounts(): string[] {
    return this.account ? [this.account] : [];
  }

  async signTransaction(
    transaction: string,
  ): Promise<ExternalWalletResponse<string>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Turnkey is not connected");
      }

      const turnkeyIframeClient = await this.getTurnkeyIframeClient(10_000);

      const result = (
        await turnkeyIframeClient.signTransaction({
          organizationId: this.subOrganizationId,
          signWith: this.account,
          unsignedTransaction: transaction,
          type: "TRANSACTION_TYPE_ETHEREUM",
        })
      ).signedTransaction;

      return {
        success: true,
        wallet: this.type,
        result: result,
      };
    } catch (error) {
      console.error(`Error signing transaction with Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signMessage(message: string): Promise<ExternalWalletResponse<string>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Turnkey is not connected");
      }

      if (!this.subOrganizationId) {
        const { success, error, account } = await this.connect(false);
        if (!success) {
          throw new Error(error);
        }
        if (account !== this.account) {
          throw new Error("Account mismatch");
        }
      }

      const paddedMessage = `0x${message.replace("0x", "").padStart(64, "0")}`;
      const messageBytes = getBytes(paddedMessage);
      const messageHash = ethers.hashMessage(messageBytes);

      const turnkeyIframeClient = await this.getTurnkeyIframeClient(10_000);

      const { r, s, v } = await turnkeyIframeClient.signRawPayload({
        organizationId: this.subOrganizationId,
        signWith: this.account,
        payload: messageHash,
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP",
      });

      const rHex = r.startsWith("0x") ? r : "0x" + r;
      const sHex = s.startsWith("0x") ? s : "0x" + s;

      const vNumber = parseInt(v, 16);

      if (isNaN(vNumber)) {
        console.error(`Invalid recovery ID (v) received from Turnkey: ${v}`);
        throw new Error(`Invalid recovery ID (v) received: ${v}`);
      }

      const signature = Signature.from({
        r: rHex,
        s: sHex,
        v: vNumber,
      });

      return {
        success: true,
        wallet: this.type,
        result: signature.serialized,
        account: this.account,
      };
    } catch (error) {
      console.error(`Error signing message with Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signTypedData(data: string): Promise<ExternalWalletResponse<string>> {
    return this.signMessage(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendTransaction(_txn: string): Promise<ExternalWalletResponse> {
    return {
      success: false,
      wallet: this.type,
      error: "Not implemented",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async switchChain(_chainId: string): Promise<boolean> {
    return false;
  }

  async getBalance(
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse<string>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Turnkey is not connected");
      }

      if (tokenAddress) {
        return {
          success: false,
          wallet: this.type,
          error: "Not implemented for ERC20",
        };
      } else {
        return { success: true, wallet: this.type, result: "0" };
      }
    } catch (error) {
      console.error(`Error getting balance from Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  private pollIframePublicKey = async (pollTimeMs: number): Promise<string> => {
    const intervalMs = 200;
    let elapsedTime = 0;

    const turnkeyIframeClient = await this.getTurnkeyIframeClient(10_000);
    const iFramePublicKey = await turnkeyIframeClient.getEmbeddedPublicKey();
    if (iFramePublicKey) {
      return iFramePublicKey;
    }

    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        const iFramePublicKey =
          await turnkeyIframeClient.getEmbeddedPublicKey();
        if (iFramePublicKey) {
          clearInterval(intervalId);
          resolve(iFramePublicKey);
        } else {
          elapsedTime += intervalMs;
          if (elapsedTime >= pollTimeMs) {
            clearInterval(intervalId);
            reject(new Error("Timeout waiting for Turnkey iframe public key."));
          }
        }
      }, intervalMs);
    });
  };

  private async getTurnkeyIframeClient(
    timeoutMs: number,
  ): Promise<TurnkeyIframeClient> {
    if (!this.turnkeyIframePromise) {
      throw new Error("Turnkey iframe client not initialized");
    }
    return this.getPromiseResult(this.turnkeyIframePromise, timeoutMs);
  }

  private async getAuth0Client(timeoutMs: number): Promise<Auth0Client> {
    if (!AUTH0_CLIENT_PROMISE) {
      throw new Error("Auth0 client not initialized");
    }
    return this.getPromiseResult(AUTH0_CLIENT_PROMISE, timeoutMs);
  }

  private async getPromiseResult<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    const timeoutId = setTimeout(() => {
      throw new Error("Timeout waiting for promise");
    }, timeoutMs);

    const result = await promise;
    clearTimeout(timeoutId);

    return result;
  }
}

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

const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ); // iPad on iOS 13+
};

const openPopup = (url: string) => {
  console.log("[Turnkey] openPopup called with url:", url || "(empty string)");
  const popup = window.open(
    url,
    "auth0:authorize:popup",
    `resizable,scrollbars=no,status=1`,
  );
  console.log(
    "[Turnkey] window.open result:",
    popup ? "popup object returned" : "null/undefined",
  );
  return popup;
};

const getNonce = (seed: string) => {
  return bytesToHex(sha256(seed));
};

type RedirectResponse = {
  username: string;
  isSignup: boolean;
  socialProvider: SocialProvider;
  searchParams: URLSearchParams | undefined;
  chainId: string;
  rpcUrl: string;
};
