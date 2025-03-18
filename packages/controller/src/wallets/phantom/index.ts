import {
  WalletAdapter,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  ExternalPlatform,
} from "../types";

export class PhantomWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "phantom";
  readonly platform: ExternalPlatform = "solana";
  private account: string | undefined = undefined;

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.solana?.isPhantom;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: "Unknown",
      name: "Phantom",
      platform: this.platform,
    };
  }

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Phantom is not available");
      }

      const response = await window.solana.connect();
      if (response.publicKey) {
        this.account = response.publicKey.toString();
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to Phantom:`, error);
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
        throw new Error("Phantom is not connected");
      }

      const result = await window.solana.signTransaction(transaction);
      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with Phantom:`, error);
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
        throw new Error("Phantom is not connected");
      }

      const encodedMessage = new TextEncoder().encode(message);
      const result = await window.solana.signMessage(encodedMessage, "utf8");
      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with Phantom:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async switchChain(_chainId: string): Promise<boolean> {
    console.warn("Chain switching not supported for Phantom");
    return false;
  }

  async getBalance(
    _tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Phantom is not connected");
      }

      // TODO: Implement balance fetching based on Phantom's API
      return {
        success: true,
        wallet: this.type,
        result: "Implement based on Phantom API",
      };
    } catch (error) {
      console.error(`Error getting balance from Phantom:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
