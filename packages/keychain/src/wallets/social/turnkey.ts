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
import { getAddress } from "ethers";
import { TurnkeyWallet } from ".";
import {
  authenticateToTurnkey,
  getAuth0OidcToken,
  getOrCreateTurnkeySuborg,
  getOrCreateWallet,
  getTurnkeySuborg,
  getWallet,
  SocialProvider,
} from "./turnkey_utils";

export const Auth0SocialProviderName: Record<
  SocialProvider,
  string | undefined
> = {
  discord: "discord",
  google: "google-oauth2",
  sms: undefined,
};

let AUTH0_CLIENT_PROMISE: Promise<Auth0Client> | null = null;

const URL_PARAMS_KEY = "auth0-url-params";
const RPC_URL_KEY = "rpc-url-tk-storage";

export class OAuthWallet extends TurnkeyWallet {
  readonly type: ExternalWalletType = "turnkey" as ExternalWalletType;
  readonly platform: ExternalPlatform = "ethereum";

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
    super();
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

      const iframePublicKey = await this.pollIframePublicKey(10_000);
      const nonce = getNonce(iframePublicKey);

      const auth0Client = await this.getAuth0Client(10_000);

      // In the case of a signup, we definitely want to user to choose an account on its social provider
      // If it's a login, it means we are already authed via the cookies
      if (!isSignup && (await auth0Client.isAuthenticated())) {
        // Skip the authentication to the social provider and get directly the turnkey accounts
        const connectResult = await this.finishConnect({
          nonce,
        });
        // If no account is specified this is a typical login flow, continue with the redirect
        // If an account is specified and we're connected to the right account, return now
        // otherwise continue the flow
        if (this.account && this.account === connectResult.account) {
          return connectResult;
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

      // cases:
      // we are not in an iFrame -> use redirect flow
      // we are in an iFrame and have access to window.open -> normal case, use popup
      // we are in an iFrame but don't have access to window.open -> we are very likely in a native app, developers should use SessionConnector with a native browser instead
      if (!isIframe()) {
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

      const popup = await openPopup("");
      if (!popup)
        throw new Error("Should be able to open a popup in an iFrame");
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
      return await this.finishConnect({
        nonce,
      });
    } catch (error) {
      localStorage.removeItem(URL_PARAMS_KEY);
      localStorage.removeItem(RPC_URL_KEY);
      console.error(`Error connecting to Turnkey:`, error);
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
    if (!oidcTokenString) {
      throw new Error("No oidcTokenString");
    }

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

  private async getAuth0Client(timeoutMs: number): Promise<Auth0Client> {
    if (!AUTH0_CLIENT_PROMISE) {
      throw new Error("Auth0 client not initialized");
    }
    return this.getPromiseResult(AUTH0_CLIENT_PROMISE, timeoutMs);
  }
}

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

type RedirectResponse = {
  username: string;
  isSignup: boolean;
  socialProvider: SocialProvider;
  searchParams: URLSearchParams | undefined;
  chainId: string;
  rpcUrl: string;
};
