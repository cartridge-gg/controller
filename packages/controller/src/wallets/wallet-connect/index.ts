import Provider from "@walletconnect/ethereum-provider";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "../types";

export class WalletConnectWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "walletconnect" as ExternalWalletType;
  readonly platform: ExternalPlatform = "ethereum";
  private account: string | undefined = undefined;

  constructor(
    private provider: Provider,
    account?: string,
  ) {
    this.account = account;
  }

  isAvailable(): boolean {
    return !!this.provider;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available ? window.ethereum?.version || "Unknown" : undefined,
      chainId: available ? window.ethereum?.chainId : undefined,
      name: "WalletConnect",
      platform: this.platform,
    };
  }

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("WalletConnect is not available");
      }

      const accounts = await this.provider.request<string[]>({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to WalletConnect:`, error);
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
        throw new Error("WalletConnect is not connected");
      }

      const result = await this.provider.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with WalletConnect:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signMessage(
    message: `0x${string}`,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("WalletConnect is not connected");
      }

      const result = await this.provider.request({
        method: "personal_sign",
        params: [this.account!, message] as any,
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with WalletConnect:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signTypedData(data: any): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("WalletConnect is not connected");
      }

      const result = await this.provider.request({
        method: "eth_signTypedData_v4",
        params: [this.account, JSON.stringify(data)] as any,
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing typed data with WalletConnect:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async sendTransaction(_txn: any): Promise<ExternalWalletResponse<any>> {
    return {
      success: false,
      wallet: this.type,
      error: "Not implemented",
    };
  }

  async switchChain(chainId: string): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        throw new Error("WalletConnect is not available");
      }

      try {
        await this.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        return true;
      } catch (error) {
        if ((error as any).code === 4902) {
          console.warn("Chain not added to WalletConnect");
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error switching chain for WalletConnect:`, error);
      return false;
    }
  }

  async getBalance(
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("WalletConnect is not connected");
      }

      if (tokenAddress) {
        return {
          success: false,
          wallet: this.type,
          error: "Not implemented for ERC20",
        };
      } else {
        const balance = await this.provider.request({
          method: "eth_getBalance",
          params: [this.account, "latest"] as any,
        });
        return { success: true, wallet: this.type, result: balance };
      }
    } catch (error) {
      console.error(`Error getting balance from WalletConnect:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
