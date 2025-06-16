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
import { NotReadyToConnect } from "./errors";
import { KeychainIFrame, ProfileIFrame } from "./iframe";
import BaseProvider from "./provider";
import {
  Chain,
  ConnectError,
  ConnectReply,
  ControllerOptions,
  IFrames,
  Keychain,
  ProbeReply,
  Profile,
  ProfileContextTypeVariant,
  ResponseCodes,
} from "./types";
import { parseChainId } from "./utils";

export default class ControllerProvider extends BaseProvider {
  private keychain?: AsyncMethodReturns<Keychain>;
  private profile?: AsyncMethodReturns<Profile>;
  private options: ControllerOptions;
  private iframes: IFrames;
  private selectedChain: ChainId;
  private chains: Map<ChainId, Chain>;

  isReady(): boolean {
    return !!this.keychain;
  }

  constructor(options: ControllerOptions) {
    super();

    // Default Cartridge chains that are always available
    const cartridgeChains: Chain[] = [
      { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" },
      { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet" },
    ];

    // Merge user chains with default chains
    // User chains take precedence if they specify the same network
    const chains = [...(options.chains || []), ...cartridgeChains];
    const defaultChainId =
      options.defaultChainId || constants.StarknetChainId.SN_MAIN;

    this.selectedChain = defaultChainId;
    this.chains = new Map<ChainId, Chain>();

    this.iframes = {
      keychain: new KeychainIFrame({
        ...options,
        onClose: this.keychain?.reset,
        onConnect: (keychain) => {
          this.keychain = keychain;
        },
      }),
    };

    this.options = { ...options, chains, defaultChainId };

    this.initializeChains(chains);

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
          container.style.visibility = "hidden";
          container.style.opacity = "0";
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

    if (!this.iframes.profile) {
      const username = await this.keychain.username();

      this.iframes.profile = new ProfileIFrame({
        ...this.options,
        onConnect: (profile) => {
          this.profile = profile;
        },
        methods: {
          openSettings: () => this.openSettings.bind(this),
          openPurchaseCredits: () => this.openPurchaseCredits.bind(this),
          openExecute: () => this.openExecute.bind(this),
          logout: () => this.logout.bind(this),
        },
        rpcUrl: this.rpcUrl(),
        username,
        version: this.version,
      });
    }

    return this.account;
  }

  async connect(): Promise<WalletAccount | undefined> {
    if (this.account) {
      return this.account;
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
      let response = await this.keychain.connect(
        // Policy precedence logic:
        // 1. If shouldOverridePresetPolicies is true and policies are provided, use policies
        // 2. Otherwise, if preset is defined, use empty object (let preset take precedence)
        // 3. Otherwise, use provided policies or empty object
        this.options.shouldOverridePresetPolicies && this.options.policies
          ? this.options.policies
          : this.options.preset
            ? {}
            : this.options.policies || {},
        this.rpcUrl(),
        this.options.signupOptions,
        version,
      );
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

    try {
      this.selectedChain = chainId;
      const response = (await this.keychain.probe(this.rpcUrl())) as ProbeReply;

      if (response.rpcUrl === this.rpcUrl()) {
        return true;
      }

      await this.keychain.switchChain(this.rpcUrl());
      await this.profile?.switchChain(this.rpcUrl());
    } catch (e) {
      console.error(e);
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
    if (!this.profile || !this.iframes.profile?.url) {
      console.error("Profile is not ready");
      return;
    }
    if (!this.account) {
      console.error("Account is not ready");
      return;
    }

    this.profile.navigate(`${this.iframes.profile.url?.pathname}/${tab}`);
    this.iframes.profile.open();
  }

  async openProfileTo(to: string) {
    if (!this.profile || !this.iframes.profile?.url) {
      console.error("Profile is not ready");
      return;
    }
    if (!this.account) {
      console.error("Account is not ready");
      return;
    }

    this.profile.navigate(`${this.iframes.profile.url?.pathname}/${to}`);
    this.iframes.profile.open();
  }

  async openProfileAt(at: string) {
    if (!this.profile || !this.iframes.profile?.url) {
      console.error("Profile is not ready");
      return;
    }
    if (!this.account) {
      console.error("Account is not ready");
      return;
    }

    this.profile.navigate(at);
    this.iframes.profile.open();
  }

  async openSettings() {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }
    if (this.iframes.profile?.sendBackward) {
      this.iframes.profile?.sendBackward();
    } else {
      this.iframes.profile?.close();
    }
    this.iframes.keychain.open();
    const res = await this.keychain.openSettings();
    this.iframes.keychain.close();
    this.iframes.profile?.sendForward?.();
    if (res && (res as ConnectError).code === ResponseCodes.NOT_CONNECTED) {
      return false;
    }
    return true;
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
    if (!this.iframes.profile) {
      console.error("Profile is not ready");
      return;
    }
    this.iframes.profile.close();
    this.iframes.keychain.open();
    this.keychain.openPurchaseCredits();
  }

  openStarterPack(starterpackId: string) {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    if (!this.iframes.profile) {
      console.error("Profile is not ready");
      return;
    }
    this.iframes.profile.close();
    this.iframes.keychain.open();
    this.keychain.openStarterPack(starterpackId);
  }

  async openExecute(calls: any, chainId?: string) {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    if (!this.iframes.profile) {
      console.error("Profile is not ready");
      return;
    }
    // Switch to the chain if provided
    let currentChainId = this.selectedChain;
    if (chainId) {
      this.switchStarknetChain(chainId);
    }
    // Switch iframes
    this.iframes.profile?.sendBackward();
    this.iframes.keychain.open();
    this.iframes.profile?.close();
    // Invoke execute
    const res = await this.keychain.execute(calls, undefined, undefined, true);
    // Switch back iframes
    this.iframes.profile?.open();
    this.iframes.keychain.close();
    this.iframes.profile?.sendForward();
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

  private initializeChains(chains: Chain[]) {
    for (const chain of chains) {
      try {
        const url = new URL(chain.rpcUrl);
        const chainId = parseChainId(url);

        // Validate that mainnet and sepolia must use Cartridge RPC
        const isMainnet = chainId === constants.StarknetChainId.SN_MAIN;
        const isSepolia = chainId === constants.StarknetChainId.SN_SEPOLIA;
        const isCartridgeRpc = url.hostname === "api.cartridge.gg";

        if ((isMainnet || isSepolia) && !isCartridgeRpc) {
          throw new Error(
            `Only Cartridge RPC providers are allowed for ${isMainnet ? "mainnet" : "sepolia"}. ` +
              `Please use: https://api.cartridge.gg/x/starknet/${isMainnet ? "mainnet" : "sepolia"}`,
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
