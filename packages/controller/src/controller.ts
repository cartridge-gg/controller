import { AsyncMethodReturns } from "@cartridge/penpal";

import ControllerAccount from "./account";
import { KeychainIFrame, ProfileIFrame } from "./iframe";
import { NotReadyToConnect } from "./errors";
import {
  Keychain,
  Policy,
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

  async probe() {
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

    if (
      this.options.profileUrl &&
      this.options.indexerUrl &&
      !this.iframes.profile
    ) {
      const username = await this.keychain.username();
      this.iframes.profile = new ProfileIFrame({
        profileUrl: this.options.profileUrl,
        indexerUrl: this.options.indexerUrl,
        address: this.account?.address,
        username,
        rpcUrl: this.rpc.toString(),
        tokens: this.options.tokens,
        onConnect: (profile) => {
          this.profile = profile;
        },
      });
    }

    return this.account;
  }

  async connect() {
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

  openProfile(tab: ProfileContextTypeVariant = "inventory") {
    if (!this.options.indexerUrl) {
      console.error("`indexerUrl` option is required to open profile");
      return;
    }
    if (!this.profile || !this.iframes.profile) {
      console.error("Profile is not ready");
      return;
    }

    this.profile.navigate(tab);
    this.iframes.profile.open();
  }

  async openSettings() {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }
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
