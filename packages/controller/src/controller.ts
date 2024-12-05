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
} from "./types";
import BaseProvider from "./provider";
import { WalletAccount } from "starknet";
import { Policy } from "@cartridge/presets";

export default class ControllerProvider extends BaseProvider {
  private keychain?: AsyncMethodReturns<Keychain>;
  private profile?: AsyncMethodReturns<Profile>;
  private options: ControllerOptions;
  private iframes: IFrames;

  constructor(options: ControllerOptions) {
    const { rpc } = options;
    super({ rpc });

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

      const response = (await this.keychain.probe(
        this.rpc.toString(),
      )) as ProbeReply;

      this.account = new ControllerAccount(
        this,
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
          openSettings: this.openSettings.bind(this),
          openPurchaseCredits: this.openPurchaseCredits.bind(this),
          openExecute: this.openExecute.bind(this),
        },
        rpcUrl: this.rpc.toString(),
        username,
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
        this.rpc.toString(),
      );
      if (response.code !== ResponseCodes.SUCCESS) {
        throw new Error(response.message);
      }

      response = response as ConnectReply;
      this.account = new ControllerAccount(
        this,
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
    this.iframes.profile?.close();
    this.iframes.keychain.open();
    const res = await this.keychain.openSettings();
    this.iframes.keychain.close();
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

  private openExecute(calls: any) {
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
    this.keychain.execute(calls);
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
