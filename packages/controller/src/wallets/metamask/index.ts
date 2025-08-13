import { MetaMaskSDK } from "@metamask/sdk";
import { getAddress } from "ethers/address";
import { createStore } from "mipd";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "../types";
import { chainIdToPlatform } from "../platform";

export class MetaMaskWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "metamask";
  platform: ExternalPlatform | undefined;

  private MMSDK: MetaMaskSDK;
  private store = createStore();
  private account: string | undefined = undefined;
  private connectedAccounts: string[] = [];

  constructor() {
    this.MMSDK = new MetaMaskSDK({
      dappMetadata: {
        name: "Cartridge Controller",
        url: window.location.href,
      },
    });
    if (this.isAvailable()) {
      this.MMSDK.sdkInitPromise?.then(() => {
        this.MMSDK.getProvider()
          ?.request({
            method: "eth_accounts",
          })
          .then((accounts: any) => {
            if (accounts && accounts.length > 0) {
              this.account = getAddress(accounts[0]);
              this.connectedAccounts = accounts.map(getAddress);
            }
          });
        this.MMSDK.getProvider()?.on("accountsChanged", (accounts: any) => {
          if (Array.isArray(accounts)) {
            if (accounts.length > 0) {
              this.account = getAddress(accounts?.[0]);
              this.connectedAccounts = accounts.map(getAddress);
            }
          }
        });
        this.MMSDK.getProvider()?.on("chainChanged", (chainId: any) => {
          this.platform = chainId ? chainIdToPlatform(chainId) : undefined;
        });

        const chainId = this.MMSDK.getProvider()?.chainId;
        this.platform = chainId ? chainIdToPlatform(chainId) : undefined;
      });
    }
  }

  isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      this.store
        .getProviders()
        .some((provider) => provider.info.rdns === "io.metamask")
    );
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available ? window.ethereum?.version || "Unknown" : undefined,
      chainId: available ? window.ethereum?.chainId : undefined,
      name: "MetaMask",
      platform: this.platform,
      connectedAccounts: this.connectedAccounts,
    };
  }

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("MetaMask is not available");
      }

      const accounts = await this.MMSDK.connect();
      if (accounts && accounts.length > 0) {
        this.account = getAddress(accounts[0]);
        this.connectedAccounts = accounts.map((account: string) =>
          getAddress(account),
        );

        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to MetaMask:`, error);
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
        throw new Error("MetaMask is not connected");
      }

      const ethereum = this.MMSDK.getProvider();
      if (!ethereum) {
        throw new Error("MetaMask is not connected");
      }

      const result = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with MetaMask:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signMessage(
    message: string,
    address?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("MetaMask is not connected");
      }

      const result = await this.MMSDK.getProvider()?.request({
        method: "personal_sign",
        params: [address || this.account, message],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with MetaMask:`, error);
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
        throw new Error("MetaMask is not connected");
      }

      const ethereum = this.MMSDK.getProvider();
      if (!ethereum) {
        throw new Error("MetaMask is not connected");
      }

      const result = await ethereum.request({
        method: "eth_signTypedData_v4",
        params: [this.account, JSON.stringify(data)],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing typed data with MetaMask:`, error);
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
        throw new Error("MetaMask is not available");
      }

      const provider = this.MMSDK.getProvider();
      if (!provider) {
        throw new Error("MetaMask is not connected");
      }

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });

        this.platform = chainIdToPlatform(chainId);
        return true;
      } catch (error) {
        if ((error as any).code === 4902) {
          console.warn("Chain not added to MetaMask");
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error switching chain for MetaMask:`, error);
      return false;
    }
  }

  async getBalance(
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("MetaMask is not connected");
      }

      if (tokenAddress) {
        return {
          success: false,
          wallet: this.type,
          error: "Not implemented for ERC20",
        };
      } else {
        const ethereum = this.MMSDK.getProvider();
        if (!ethereum) {
          throw new Error("MetaMask is not connected");
        }

        const balance = await ethereum.request({
          method: "eth_getBalance",
          params: [this.account, "latest"],
        });
        return { success: true, wallet: this.type, result: balance };
      }
    } catch (error) {
      console.error(`Error getting balance from MetaMask:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
