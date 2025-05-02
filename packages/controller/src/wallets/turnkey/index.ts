import { TurnkeyIframeClient } from "@turnkey/sdk-browser";
import { ethers, getBytes, Signature } from "ethers";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "../types";

export class TurnkeyWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "turnkey" as ExternalWalletType;
  readonly platform: ExternalPlatform = "ethereum";
  private account: string | undefined = undefined;
  private organizationId: string | undefined = undefined;

  constructor(
    private turnkeyIframeClient: TurnkeyIframeClient,
    address?: string,
    organizationId?: string,
  ) {
    this.account = address;
    this.organizationId = organizationId;
  }

  isAvailable(): boolean {
    return typeof window !== "undefined";
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

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Turnkey is not available");
      }

      const accounts = await this.turnkeyIframeClient.getWallets();
      if (accounts && accounts.wallets.length > 0) {
        const walletAccount = await this.turnkeyIframeClient.getWalletAccount({
          walletId: accounts.wallets[0].walletId,
        });
        this.account = walletAccount.account.address;
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signTransaction(
    transaction: any,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Turnkey is not connected");
      }

      const result = (
        await this.turnkeyIframeClient.signTransaction({
          organizationId: this.organizationId,
          signWith: this.account,
          unsignedTransaction: transaction,
          type: "TRANSACTION_TYPE_ETHEREUM",
        })
      ).signedTransaction;

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signMessage(message: string): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Turnkey is not connected");
      }

      const paddedMessage = `0x${message.replace("0x", "").padStart(64, "0")}`;
      const messageBytes = getBytes(paddedMessage);
      const messageHash = ethers.hashMessage(messageBytes);

      const { r, s, v } = await this.turnkeyIframeClient.signRawPayload({
        organizationId: this.organizationId,
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

  async signTypedData(data: any): Promise<ExternalWalletResponse<any>> {
    return this.signMessage(data);
  }

  async sendTransaction(_txn: any): Promise<ExternalWalletResponse<any>> {
    return {
      success: false,
      wallet: this.type,
      error: "Not implemented",
    };
  }

  async switchChain(_chainId: string): Promise<boolean> {
    return false;
  }

  async getBalance(
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
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
}
