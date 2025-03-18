import {
  WalletAdapter,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  ExternalPlatform,
} from "../types";

export class ArgentWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "argent";
  readonly platform: ExternalPlatform = "starknet";
  private account: any | undefined = undefined;

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.starknet_argentX;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available
        ? window.starknet_argentX?.version || "Unknown"
        : undefined,
      chainId: available ? window.starknet_argentX?.chainId : undefined,
      name: "Argent",
      platform: this.platform,
    };
  }

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Argent is not available");
      }

      await window.starknet_argentX.enable();
      const account = window.starknet_argentX.account;
      if (account) {
        this.account = account;
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to Argent:`, error);
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
        throw new Error("Argent is not connected");
      }

      const result = await window.starknet_argentX.account.execute(transaction);
      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with Argent:`, error);
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
        throw new Error("Argent is not connected");
      }

      const result = await window.starknet_argentX.account.signMessage(message);
      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with Argent:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async switchChain(_chainId: string): Promise<boolean> {
    console.warn(
      "Chain switching for Argent may require custom implementation",
    );
    return false;
  }

  async getBalance(
    _tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Argent is not connected");
      }

      // TODO: Implement balance fetching based on Argent's API
      return {
        success: true,
        wallet: this.type,
        result: "Implement based on Argent API",
      };
    } catch (error) {
      console.error(`Error getting balance from Argent:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
