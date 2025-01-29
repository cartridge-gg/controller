import { AsyncMethodReturns } from "@cartridge/penpal";

import ControllerAccount from "./account";
import { KeychainIFrame, ProfileIFrame } from "./iframe";
import { NotReadyToConnect } from "./errors";
import {
  Keychain,
  ResponseCodes,
  ConnectReply,
  ProbeReply,
  ControllerOptions,
  ConnectError,
  Profile,
  IFrames,
  ProfileContextTypeVariant,
  Chain,
} from "./types";
import BaseProvider from "./provider";
import { WalletAccount } from "starknet";
import { Policy } from "@cartridge/presets";
import { AddStarknetChainParameters, ChainId } from "@starknet-io/types-js";
import { parseChainId } from "./utils";

export default class ControllerProvider extends BaseProvider {
  private keychain?: AsyncMethodReturns<Keychain>;
  private profile?: AsyncMethodReturns<Profile>;
  private options: ControllerOptions;
  private iframes: IFrames;
  private selectedChain: ChainId;
  private chains: Map<ChainId, Chain>;

  constructor(options: ControllerOptions) {
    super();

    const chains = new Map<ChainId, Chain>();

    for (const chain of options.chains) {
      const url = new URL(chain.rpcUrl);
      const chainId = parseChainId(url);
      chains.set(chainId, chain);
    }

    if (
      options.policies?.messages?.length &&
      options.policies.messages.length !== chains.size
    ) {
      console.warn(
        "Each message policy is associated with a specific chain. " +
          "The number of message policies does not match the number of chains specified - " +
          "session message signing may not work on some chains.",
      );
    }

    this.chains = chains;
    this.selectedChain = options.defaultChainId;

    if (!this.chains.has(this.selectedChain)) {
      throw new Error(
        `Chain ${this.selectedChain} not found in configured chains`,
      );
    }

    this.iframes = {
      keychain: new KeychainIFrame({
        ...options,
        onClose: this.keychain?.reset,
        onConnect: (keychain) => {
          this.keychain = keychain;
        },
      }),
    };

    this.options = options;

    if (typeof window !== "undefined") {
      (window as any).starknet_controller = this;
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

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    this.iframes.keychain.open();

    try {
      let response = await this.keychain.connect(
        this.options.policies || {},
        this.rpcUrl(),
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

    if (!!document.hasStorageAccess) {
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
    return this.chains.get(this.selectedChain)!.rpcUrl;
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
    return !(
      res &&
      ((res as ConnectError).code === ResponseCodes.NOT_CONNECTED ||
        (res as ConnectError).code === ResponseCodes.CANCELED)
    );
  }

  async delegateAccount() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    return await this.keychain.delegateAccount();
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
