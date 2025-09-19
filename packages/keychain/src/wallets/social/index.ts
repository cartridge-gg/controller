import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "@cartridge/controller";
import { Turnkey, TurnkeyIframeClient } from "@turnkey/sdk-browser";
import { ethers, getBytes, Signature } from "ethers";
import { publicKeyFromIframe } from "./turnkey_utils";

export abstract class TurnkeyWallet implements WalletAdapter {
  type: ExternalWalletType = "turnkey" as ExternalWalletType;
  readonly platform: ExternalPlatform = "ethereum";

  account: string | undefined = undefined;
  subOrganizationId: string | undefined = undefined;
  turnkeyIframePromise: Promise<TurnkeyIframeClient> | undefined = undefined;

  constructor() {
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

  abstract isAvailable(): boolean;

  abstract getInfo(): ExternalWallet;

  abstract connect(isSignup?: boolean): Promise<ExternalWalletResponse>;

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

  async waitForTransaction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _txHash: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _timeoutMs?: number,
  ): Promise<ExternalWalletResponse<unknown>> {
    return {
      success: false,
      wallet: this.type,
      error: "waitForTransaction not supported for Argent wallet",
    };
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

  pollIframePublicKey = async (pollTimeMs: number): Promise<string> => {
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

  async getTurnkeyIframeClient(
    timeoutMs: number,
  ): Promise<TurnkeyIframeClient> {
    if (!this.turnkeyIframePromise) {
      throw new Error("Turnkey iframe client not initialized");
    }
    return this.getPromiseResult(this.turnkeyIframePromise, timeoutMs);
  }

  async getPromiseResult<T>(
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

  getIframePublicKey = async (): Promise<string> => {
    return publicKeyFromIframe(await this.getTurnkeyIframeClient(10_000));
  };
}
