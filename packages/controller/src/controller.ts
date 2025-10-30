import { AsyncMethodReturns } from "@cartridge/penpal";

import { Policy } from "@cartridge/presets";
import {
  AddInvokeTransactionResult,
  AddStarknetChainParameters,
  ChainId,
} from "@starknet-io/types-js";
import { constants, shortString, WalletAccount } from "starknet";
import { version } from "../package.json";
import ControllerAccount from "./account";
import { KEYCHAIN_URL } from "./constants";
import { NotReadyToConnect } from "./errors";
import { KeychainIFrame } from "./iframe";
import BaseProvider from "./provider";
import {
  Chain,
  ConnectError,
  ConnectReply,
  ControllerOptions,
  IFrames,
  Keychain,
  ProbeReply,
  ProfileContextTypeVariant,
  ResponseCodes,
  OpenOptions,
} from "./types";
import { validateRedirectUrl } from "./url-validator";
import { parseChainId } from "./utils";

export default class ControllerProvider extends BaseProvider {
  private keychain?: AsyncMethodReturns<Keychain>;
  private options: ControllerOptions;
  private iframes: IFrames;
  private selectedChain: ChainId;
  private chains: Map<ChainId, Chain>;

  isReady(): boolean {
    return !!this.keychain;
  }

  constructor(options: ControllerOptions = {}) {
    super();

    // Default Cartridge chains that are always available
    const cartridgeChains: Chain[] = [
      { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9" },
      { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
    ];

    // Merge user chains with default chains
    // User chains take precedence if they specify the same network
    const chains = [...cartridgeChains, ...(options.chains || [])];
    const defaultChainId =
      options.defaultChainId || constants.StarknetChainId.SN_MAIN;

    this.selectedChain = defaultChainId;
    this.chains = new Map<ChainId, Chain>();
    this.options = { ...options, chains, defaultChainId };

    this.initializeChains(chains);

    this.iframes = {
      keychain: options.lazyload ? undefined : this.createKeychainIframe(),
    };

    if (typeof window !== "undefined") {
      (window as any).starknet_controller = this;
    }
  }

  async logout() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    try {
      // Disconnect the controller/keychain first
      await this.disconnect();

      // Close all controller iframes
      const iframes = document.querySelectorAll('iframe[id^="controller-"]');
      iframes.forEach((iframe) => {
        const container = iframe.parentElement;
        if (container) {
          // Start fade-out transition
          container.style.opacity = "0";
          // Set display: none after transition completes
          setTimeout(() => {
            container.style.display = "none";
          }, 200);
        }
      });

      // Reset body overflow
      if (document.body) {
        document.body.style.overflow = "auto";
      }

      // Reload the page to complete logout
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
      throw err;
    }
  }

  async probe(): Promise<WalletAccount | undefined> {
    try {
      // Ensure iframe is created if using lazy loading
      if (!this.iframes.keychain) {
        this.iframes.keychain = this.createKeychainIframe();
      }

      await this.waitForKeychain();

      if (!this.keychain) {
        console.error(new NotReadyToConnect().message);
        return;
      }

      const response = (await this.keychain.probe(this.rpcUrl())) as ProbeReply;

      // For backwards compat with controller <=0.6.0
      let rpcUrl = response?.rpcUrl || this.rpcUrl();
      this.account = new ControllerAccount(
        this,
        rpcUrl,
        response.address,
        this.keychain,
        this.options,
        this.iframes.keychain,
      );
    } catch (e) {
      console.error(e);
      return;
    }

    return this.account;
  }

  async connect(): Promise<WalletAccount | undefined> {
    if (this.account) {
      return this.account;
    }

    // Ensure iframe is created if using lazy loading
    if (!this.iframes.keychain) {
      this.iframes.keychain = this.createKeychainIframe();
      // Wait for the keychain to be ready
      await this.waitForKeychain();
    }

    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    if (typeof document !== "undefined" && !!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    this.iframes.keychain.open();

    try {
      let response = await this.keychain.connect(this.options.signupOptions);
      if (response.code !== ResponseCodes.SUCCESS) {
        throw new Error(response.message);
      }

      response = response as ConnectReply;
      this.account = new ControllerAccount(
        this,
        this.rpcUrl(),
        response.address,
        this.keychain,
        this.options,
        this.iframes.keychain,
      );

      return this.account;
    } catch (e) {
      console.log(e);
    } finally {
      this.iframes.keychain.close();
    }
  }

  async switchStarknetChain(chainId: string): Promise<boolean> {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return false;
    }

    const currentChain = this.selectedChain;

    try {
      this.selectedChain = chainId;
      await this.keychain.switchChain(this.rpcUrl());
    } catch (e) {
      console.error(e);
      this.selectedChain = currentChain;
      return false;
    }

    this.emitNetworkChanged(chainId);
    return true;
  }

  addStarknetChain(_chain: AddStarknetChainParameters): Promise<boolean> {
    return Promise.resolve(true);
  }

  async disconnect() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    if (typeof document !== "undefined" && !!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    this.account = undefined;
    return this.keychain.disconnect();
  }

  async openProfile(tab: ProfileContextTypeVariant = "inventory") {
    // Profile functionality is now integrated into keychain
    // Navigate keychain iframe to profile page
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    if (!this.account) {
      console.error("Account is not ready");
      return;
    }
    const username = await this.keychain.username();

    // Navigate first, then open to avoid flash
    const options = [];
    if (this.options.slot) {
      options.push(`ps=${this.options.slot}`);
    }
    await this.keychain.navigate(
      `/account/${username}/${tab}?${options.join("&")}`,
    );
    this.iframes.keychain.open();
  }

  async openProfileTo(to: string) {
    // Profile functionality is now integrated into keychain
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    if (!this.account) {
      console.error("Account is not ready");
      return;
    }

    const username = await this.keychain.username();
    const options = [];
    if (this.options.slot) {
      options.push(`ps=${this.options.slot}`);
    }
    await this.keychain.navigate(
      `/account/${username}/${to}?${options.join("&")}`,
    );
    this.iframes.keychain.open();
  }

  async openProfileAt(at: string) {
    // Profile functionality is now integrated into keychain
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    if (!this.account) {
      console.error("Account is not ready");
      return;
    }

    await this.keychain.navigate(at);
    this.iframes.keychain.open();
  }

  openSettings() {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    this.iframes.keychain.open();
    this.keychain.openSettings();
  }

  revoke(origin: string, _policy: Policy[]) {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    return this.keychain.revoke(origin);
  }

  rpcUrl(): string {
    const chain = this.chains.get(this.selectedChain);
    if (!chain) {
      const availableChains = Array.from(this.chains.keys()).map((chain) =>
        shortString.decodeShortString(chain),
      );
      throw new Error(
        `Chain not found: ${shortString.decodeShortString(this.selectedChain)}. Available chains: ${availableChains.join(", ")}`,
      );
    }
    return chain.rpcUrl;
  }

  username() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    return this.keychain.username();
  }

  openPurchaseCredits() {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    this.keychain.navigate("/purchase/credits").then(() => {
      this.iframes.keychain?.open();
    });
  }

  async openStarterPack(starterpackId: string | number): Promise<void> {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    await this.keychain.openStarterPack(starterpackId);
    this.iframes.keychain?.open();
  }

  async openExecute(calls: any, chainId?: string) {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    // Switch to the chain if provided
    let currentChainId = this.selectedChain;
    if (chainId) {
      this.switchStarknetChain(chainId);
    }
    // Open keychain
    this.iframes.keychain.open();
    // Invoke execute
    const res = await this.keychain.execute(calls, undefined, undefined, true);
    // Close keychain
    this.iframes.keychain.close();
    // Switch back to the original chain
    if (chainId) {
      this.switchStarknetChain(currentChainId);
    }
    const status = !(
      res &&
      ((res as ConnectError).code === ResponseCodes.NOT_CONNECTED ||
        (res as ConnectError).code === ResponseCodes.CANCELED)
    );
    return {
      status,
      transactionHash: (res as AddInvokeTransactionResult)?.transaction_hash,
    };
  }

  async delegateAccount() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    return await this.keychain.delegateAccount();
  }

  /**
   * Opens the keychain in standalone mode (first-party context) for authentication.
   * This establishes first-party storage, enabling seamless iframe access across all games.
   * @param options - Configuration for redirect after authentication
   */
  open(options: OpenOptions = {}) {
    if (typeof window === "undefined") {
      console.error("open can only be called in browser context");
      return;
    }

    const keychainUrl = new URL(this.options.url || KEYCHAIN_URL);

    // Add redirect target (defaults to current page)
    const redirectUrl = options.redirectUrl || window.location.href;

    // Validate redirect URL to prevent XSS and open redirect attacks
    const validation = validateRedirectUrl(redirectUrl);
    if (!validation.isValid) {
      console.error(
        `Invalid redirect URL: ${validation.error}`,
        `URL: ${redirectUrl}`,
      );
      return;
    }

    keychainUrl.searchParams.set("redirect_url", redirectUrl);

    // Add controller configuration parameters
    if (this.options.slot) {
      keychainUrl.searchParams.set("ps", this.options.slot);
    }

    if (this.options.namespace) {
      keychainUrl.searchParams.set("ns", this.options.namespace);
    }

    if (this.options.tokens?.erc20) {
      keychainUrl.searchParams.set(
        "erc20",
        this.options.tokens.erc20.toString(),
      );
    }

    if (this.rpcUrl()) {
      keychainUrl.searchParams.set("rpc_url", this.rpcUrl());
    }

    // Navigate to standalone keychain
    window.location.href = keychainUrl.toString();
  }

  /**
   * Checks if the keychain iframe has first-party storage access.
   * Returns true if the user has previously authenticated via standalone mode.
   * @returns Promise<boolean> indicating if storage access is available
   */
  async hasFirstPartyAccess(): Promise<boolean> {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return false;
    }

    try {
      // Ask the keychain iframe if it has storage access
      const hasAccess = await this.keychain.hasStorageAccess();
      return hasAccess;
    } catch (error) {
      console.error("Error checking storage access:", error);
      return false;
    }
  }

  private initializeChains(chains: Chain[]) {
    for (const chain of chains) {
      try {
        const url = new URL(chain.rpcUrl);
        const chainId = parseChainId(url);

        // Validate that mainnet and sepolia must use Cartridge RPC
        const isMainnet = chainId === constants.StarknetChainId.SN_MAIN;
        const isSepolia = chainId === constants.StarknetChainId.SN_SEPOLIA;
        const isCartridgeRpc = url.hostname === "api.cartridge.gg";
        const isLocalhost =
          url.hostname === "localhost" || url.hostname === "127.0.0.1";

        if ((isMainnet || isSepolia) && !(isCartridgeRpc || isLocalhost)) {
          throw new Error(
            `Only Cartridge RPC providers are allowed for ${isMainnet ? "mainnet" : "sepolia"}. ` +
              `Please use: https://api.cartridge.gg/x/starknet/${isMainnet ? "mainnet" : "sepolia"}/rpc/v0_9`,
          );
        }

        this.chains.set(chainId, chain);
      } catch (error) {
        console.error(`Failed to parse chainId for ${chain.rpcUrl}:`, error);
        throw error; // Re-throw to ensure invalid chains fail fast
      }
    }

    if (!this.chains.has(this.selectedChain)) {
      console.warn(
        `Selected chain ${this.selectedChain} not found in configured chains. ` +
          `Available chains: ${Array.from(this.chains.keys()).join(", ")}`,
      );
    }
  }

  private createKeychainIframe(): KeychainIFrame {
    return new KeychainIFrame({
      ...this.options,
      rpcUrl: this.rpcUrl(),
      onClose: this.keychain?.reset,
      onConnect: (keychain) => {
        this.keychain = keychain;
      },
      version: version,
    });
  }

  private waitForKeychain({
    timeout = 50000,
    interval = 100,
  }:
    | {
        timeout?: number;
        interval?: number;
      }
    | undefined = {}) {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const id = setInterval(() => {
        if (Date.now() - startTime > timeout) {
          clearInterval(id);
          reject(new Error("Timeout waiting for keychain"));
          return;
        }

        if (!this.keychain) return;

        clearInterval(id);
        resolve();
      }, interval);
    });
  }
}
