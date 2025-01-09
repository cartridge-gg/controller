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
import { constants, WalletAccount } from "starknet";
import { Policy } from "@cartridge/presets";
import { AddStarknetChainParameters, ChainId } from "@starknet-io/types-js";

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
      let chainId: ChainId | undefined;
      const url = new URL(chain.rpcUrl);
      const parts = url.pathname.split("/");

      if (parts.includes("starknet")) {
        if (parts.includes("mainnet")) {
          chainId = constants.StarknetChainId.SN_MAIN;
        } else if (parts.includes("sepolia")) {
          chainId = constants.StarknetChainId.SN_SEPOLIA;
        }
      } else if (parts.length >= 3) {
        const projectName = parts[2];
        if (parts.includes("katana")) {
          chainId = `WP_${projectName.toUpperCase()}` as ChainId;
        } else if (parts.includes("mainnet")) {
          chainId = `GG_${projectName.toUpperCase()}` as ChainId;
        }
      }

      if (!chainId) {
        throw new Error(`Chain ${chain.rpcUrl} not supported`);
      }

      chains.set(chainId, chain);
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

      this.account = new ControllerAccount(
        this,
        this.rpcUrl(),
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
        this.options.policies || [],
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
    try {
      this.selectedChain = chainId;
      this.account = await this.probe();
      if (!this.account) {
        this.account = await this.connect();
      }
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

  fetchControllers(
    contractAddresses: string[],
  ): Promise<Record<string, string>> {
    if (!this.keychain) {
      throw new NotReadyToConnect().message;
    }

    return this.keychain.fetchControllers(contractAddresses);
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

  async openExecute(calls: any) {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }
    if (!this.iframes.profile) {
      console.error("Profile is not ready");
      return;
    }
    if (this.iframes.profile?.sendBackward) {
      this.iframes.profile?.sendBackward();
    } else {
      this.iframes.profile?.close();
    }
    this.iframes.keychain.open();
    const res = await this.keychain.execute(calls, undefined, undefined, true);
    this.iframes.keychain.close();
    this.iframes.profile?.sendForward?.();
    return !(res && (res as ConnectError).code === ResponseCodes.NOT_CONNECTED);
  }

  async delegateAccount() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    return await this.keychain.delegateAccount();
  }

  private waitForKeychain({
    timeout = 5000,
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
