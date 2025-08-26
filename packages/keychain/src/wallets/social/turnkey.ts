import { Auth0Client, createAuth0Client } from "@auth0/auth0-spa-js";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
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
} from "./turnkey_utils";

export const Auth0SocialProviderName: Record<SocialProvider, string> = {
  discord: "discord",
  google: "google-oauth2",
};

export class TurnkeyWallet {
  readonly type: ExternalWalletType = "turnkey" as ExternalWalletType;
  readonly platform: ExternalPlatform = "ethereum";
  account: string | undefined = undefined;
  subOrganizationId: string | undefined = undefined;
  private auth0ClientPromise: Promise<Auth0Client> | undefined = undefined;
  private turnkeyIframePromise: Promise<TurnkeyIframeClient> | undefined =
    undefined;

  constructor(
    private username: string,
    private chainId: string,
    private socialProvider: SocialProvider | undefined,
  ) {
    this.auth0ClientPromise = createAuth0Client({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      cacheLocation: "localstorage",
      useCookiesForTransactions: true,
    });

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
      !!this.auth0ClientPromise
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

      const iframePublicKey = await this.pollIframePublicKey(10_000);
      const nonce = getNonce(iframePublicKey);

      const auth0Client = await this.getAuth0Client(10_000);
      const popup = await openPopup("");
      if (popup) {
        await auth0Client.loginWithPopup(
          {
            authorizationParams: {
              connection: Auth0SocialProviderName[this.socialProvider],
              redirect_uri: import.meta.env.VITE_ORIGIN,
              nonce,
              display: "touch",
              tknonce: nonce,
            },
          },
          { popup },
        );
        return await this.finishConnect({
          signupUsername: this.username,
          nonce,
          socialProvider: this.socialProvider,
        });
      } else {
        await auth0Client.loginWithRedirect({
          authorizationParams: {
            connection: Auth0SocialProviderName[this.socialProvider],
            redirect_uri: import.meta.env.VITE_ORIGIN,
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
    } catch (error) {
      console.error(`Error connecting to Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async handleRedirect(url: string): Promise<
    ExternalWalletResponse & {
      username?: string;
      isSignup?: boolean;
      socialProvider?: string;
    }
  > {
    const auth0Client = await this.getAuth0Client(10_000);
    const { appState } = await auth0Client.handleRedirectCallback(url);
    if (!appState || appState.error) {
      return { success: false, wallet: this.type, error: appState.error };
    }
    return {
      ...this.finishConnect({
        signupUsername: appState.signupUsername,
        nonce: appState.nonce,
        socialProvider: appState.socialProvider,
      }),
      username: appState.signupUsername,
      isSignup: appState.isSignup,
      socialProvider: appState.socialProvider,
      chainId: appState.chainId,
    };
  }

  async finishConnect({
    signupUsername,
    nonce,
    socialProvider,
  }: {
    signupUsername?: string;
    nonce: string;
    socialProvider: SocialProvider;
  }): Promise<ExternalWalletResponse> {
    const turnkeyIframeClient = await this.getTurnkeyIframeClient(10_000);
    const auth0Client = await this.getAuth0Client(10_000);

    const tokenClaims = await auth0Client.getIdTokenClaims();
    const oidcTokenString = await getAuth0OidcToken(tokenClaims, nonce);
    if (!oidcTokenString) {
      throw new Error("No oidcTokenString");
    }

    const subOrganizationId = signupUsername
      ? await getOrCreateTurnkeySuborg(
          oidcTokenString,
          signupUsername,
          socialProvider,
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

    const turnkeyAddress = signupUsername
      ? await getOrCreateWallet(
          subOrganizationId,
          signupUsername,
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
    if (!this.auth0ClientPromise) {
      throw new Error("Auth0 client not initialized");
    }
    return this.getPromiseResult(this.auth0ClientPromise, timeoutMs);
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

const openPopup = (url: string) => {
  const popup = window.open(
    url,
    "auth0:authorize:popup",
    `resizable,scrollbars=no,status=1`,
  );
  return popup;
};

const getNonce = (seed: string) => {
  return bytesToHex(sha256(seed));
};
