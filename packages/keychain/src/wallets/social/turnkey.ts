import { Auth0Client, createAuth0Client } from "@auth0/auth0-spa-js";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
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

export class OAuthWallet extends TurnkeyWallet {
  readonly platform: ExternalPlatform = "ethereum";
  private auth0ClientPromise: Promise<Auth0Client> | undefined = undefined;

  constructor(private socialProvider: SocialProvider) {
    super();

    this.type = socialProvider as ExternalWalletType;

    this.auth0ClientPromise = createAuth0Client({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
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

  async connect(signupUsername?: string): Promise<ExternalWalletResponse> {
    try {
      const turnkeyIframeClient = await this.getTurnkeyIframeClient(10_000);

      const iframePublicKey = await this.pollIframePublicKey(10_000);

      const nonce = getNonce(iframePublicKey);

      const auth0Client = await this.getAuth0Client(10_000);
      const popup = await openPopup("");
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

      const iFramePublicKey = await this.getIframePublicKey();

      const iFrameNonce = getNonce(iFramePublicKey);
      const tokenClaims = await auth0Client.getIdTokenClaims();
      const oidcTokenString = await getAuth0OidcToken(tokenClaims, iFrameNonce);
      if (!oidcTokenString) {
        throw new Error("No oidcTokenString");
      }

      const subOrganizationId = signupUsername
        ? await getOrCreateTurnkeySuborg(
            oidcTokenString,
            signupUsername,
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
    } catch (error) {
      console.error(`Error connecting to Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async getAuth0Client(timeoutMs: number): Promise<Auth0Client> {
    if (!this.auth0ClientPromise) {
      throw new Error("Auth0 client not initialized");
    }
    return super.getPromiseResult(this.auth0ClientPromise, timeoutMs);
  }
}

const openPopup = (url: string) => {
  const popup = window.open(
    url,
    "auth0:authorize:popup",
    `resizable,scrollbars=no,status=1`,
  );
  if (!popup || popup.closed) {
    throw new Error("Failed to open authentication popup - may be blocked");
  }
  return popup;
};

const getNonce = (seed: string) => {
  return bytesToHex(sha256(seed));
};
