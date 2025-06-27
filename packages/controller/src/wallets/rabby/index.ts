import { getAddress } from "ethers/address";
import { createStore, EIP6963ProviderDetail } from "mipd";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "../types";

const RABBY_RDNS = "io.rabby";

export class RabbyWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "rabby";
  readonly platform: ExternalPlatform = "ethereum";
  private account: string | undefined = undefined;
  private store = createStore();
  private provider: EIP6963ProviderDetail | undefined;
  private connectedAccounts: string[] = [];

  constructor() {
    this.provider = this.store
      .getProviders()
      .find((provider) => provider.info.rdns === RABBY_RDNS);
    this.provider?.provider
      .request({
        method: "eth_accounts",
      })
      .then((accounts) => {
        this.connectedAccounts = accounts;
      });
    this.provider?.provider?.on("accountsChanged", (accounts: string[]) => {
      if (accounts) {
        // rabby doesn't allow multiple accounts to be connected at the same time
        this.connectedAccounts = accounts.map((account) => getAddress(account));
        this.account = getAddress(accounts?.[0]);
      }
    });
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!this.provider;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available ? window.ethereum?.version || "Unknown" : undefined,
      chainId: available ? window.ethereum?.chainId : undefined,
      name: "Rabby",
      platform: this.platform,
      connectedAccounts: this.connectedAccounts,
    };
  }

  async connect(address?: string): Promise<ExternalWalletResponse<any>> {
    if (address && this.connectedAccounts.includes(getAddress(address))) {
      this.account = getAddress(address);
    }

    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Rabby is not available");
      }

      const accounts = await this.provider?.provider.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        this.connectedAccounts = accounts;
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to Rabby:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  getConnectedAccounts(): string[] {
    return this.connectedAccounts;
  }

  async signTransaction(
    transaction: any,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Rabby is not connected");
      }

      const ethereum = this.provider?.provider;
      if (!ethereum) {
        throw new Error("Rabby is not connected");
      }

      const result = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with Rabby:`, error);
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
        throw new Error("Rabby is not connected");
      }
      const result = await this.provider?.provider.request({
        method: "personal_sign",
        params: [this.account!, message] as any,
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with Rabby:`, error);
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
        throw new Error("Rabby is not connected");
      }

      const provider = this.provider?.provider;
      if (!provider) {
        throw new Error("Rabby is not connected");
      }

      const result = await provider.request({
        method: "eth_signTypedData_v4",
        params: [this.account, JSON.stringify(data)] as any,
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing typed data with Rabby:`, error);
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
        throw new Error("Rabby is not available");
      }

      const provider = this.provider?.provider;
      if (!provider) {
        throw new Error("Rabby is not connected");
      }

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        return true;
      } catch (error) {
        if ((error as any).code === 4902) {
          console.warn("Chain not added to Rabby");
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error switching chain for Rabby:`, error);
      return false;
    }
  }

  async disconnect(): Promise<ExternalWalletResponse<void>> {
    await this.provider?.provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    await this.provider?.provider.request({
      method: "eth_requestAccounts",
    });
    this.account = undefined;
    this.connectedAccounts = [];
    return { success: true, wallet: this.type };
  }

  async getBalance(
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Rabby is not connected");
      }

      if (tokenAddress) {
        return {
          success: false,
          wallet: this.type,
          error: "Not implemented for ERC20",
        };
      } else {
        const provider = this.provider?.provider;
        if (!provider) {
          throw new Error("Rabby is not connected");
        }

        const balance = await provider.request({
          method: "eth_getBalance",
          params: [this.account, "latest"] as any,
        });
        return { success: true, wallet: this.type, result: balance };
      }
    } catch (error) {
      console.error(`Error getting balance from Rabby:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
