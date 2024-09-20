export * from "./errors";
export * from "./types";
export { defaultPresets } from "./presets";
export * from "./verified";

import { AccountInterface, addAddressPadding } from "starknet";
import { AsyncMethodReturns } from "@cartridge/penpal";

import DeviceAccount from "./device";
import {
  Keychain,
  Policy,
  ResponseCodes,
  ConnectReply,
  ProbeReply,
  ControllerOptions,
  PaymasterOptions,
  ConnectError,
  Profile,
  IFrames,
} from "./types";
import { KeychainIFrame, ProfileIFrame } from "./iframe";
import { NotReadyToConnect, ProfileNotReady } from "./errors";
import { RPC_SEPOLIA } from "./constants";

export default class Controller {
  private policies: Policy[];
  private paymaster?: PaymasterOptions;
  private keychain?: AsyncMethodReturns<Keychain>;
  private profile?: AsyncMethodReturns<Profile>;
  private iframes: IFrames;
  public rpc: URL;
  public account?: AccountInterface;

  constructor({
    policies,
    url,
    profileUrl,
    rpc,
    paymaster,
    ...options
  }: ControllerOptions = {}) {
    this.iframes = {
      keychain: new KeychainIFrame({
        ...options,
        url,
        paymaster,
        onClose: this.keychain?.reset,
        onConnect: (keychain) => {
          this.keychain = keychain;
        },
      }),
      profile: new ProfileIFrame({
        ...options,
        url: profileUrl,
        onConnect: (profile) => {
          this.profile = profile;
        },
      }),
    };

    this.rpc = new URL(rpc || RPC_SEPOLIA);
    this.paymaster = paymaster;
    if (this.paymaster) {
      this.rpc.searchParams.append("paymaster", "true");
    }

    // TODO: remove this on the next major breaking change. pass everthing by url
    this.policies =
      policies?.map((policy) => ({
        ...policy,
        target: addAddressPadding(policy.target),
      })) || [];
  }

  async openMenu() {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }
    this.iframes.keychain.open();
    const res = await this.keychain.openMenu();
    this.iframes.keychain.close();
    if (res && (res as ConnectError).code === ResponseCodes.NOT_CONNECTED) {
      return false;
    }
    return true;
  }

  ready() {
    return this.probe().then(
      (res) => !!res,
      () => false,
    );
  }

  async probe() {
    try {
      await this.waitForKeychain();

      if (!this.keychain) {
        console.error(new NotReadyToConnect().message);
        return null;
      }

      const response = (await this.keychain.probe(
        this.rpc.toString(),
      )) as ProbeReply;

      this.account = new DeviceAccount(
        this.rpc.toString(),
        response.address,
        this.keychain,
        this.iframes.keychain,
        this.paymaster,
      ) as AccountInterface;
    } catch (e) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    return !!this.account;
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
        this.policies,
        this.rpc.toString(),
      );
      if (response.code !== ResponseCodes.SUCCESS) {
        throw new Error(response.message);
      }

      response = response as ConnectReply;
      this.account = new DeviceAccount(
        this.rpc.toString(),
        response.address,
        this.keychain,
        this.iframes.keychain,
        this.paymaster,
      ) as AccountInterface;

      return this.account;
    } catch (e) {
      console.log(e);
    } finally {
      this.iframes.keychain.close();
    }
  }

  openProfile() {
    if (!this.profile || !this.iframes.profile) {
      console.error(new ProfileNotReady().message);
      return;
    }

    this.iframes.profile.open();
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

  async delegateAccount() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    return await this.keychain.delegateAccount();
  }

  private waitForKeychain({
    timeout = 3000,
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
