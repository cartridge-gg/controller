export * from "./types";
export { defaultPresets } from "./presets";

import { AccountInterface, addAddressPadding } from "starknet";
import {
  AsyncMethodReturns,
  Connection,
  connectToChild,
} from "@cartridge/penpal";

import DeviceAccount from "./device";
import {
  Keychain,
  Policy,
  ResponseCodes,
  ConnectReply,
  ProbeReply,
  Modal,
  ControllerOptions,
  ControllerThemePresets,
  ColorMode,
  PaymasterOptions,
} from "./types";
import { createModal } from "./modal";
import { defaultPresets } from "./presets";
import { NotReadyToConnect } from "./errors";
import { KEYCHAIN_URL, RPC_SEPOLIA } from "./constants";

class Controller {
  private url: URL;
  private policies: Policy[];
  private paymaster?: PaymasterOptions;
  private connection?: Connection<Keychain>;
  private modal?: Modal;
  public keychain?: AsyncMethodReturns<Keychain>;
  public rpc: URL;
  public account?: AccountInterface;

  constructor(policies: Policy[] = [], options: ControllerOptions = {}) {
    this.url = new URL(options?.url || KEYCHAIN_URL);
    this.rpc = new URL(options?.rpc || RPC_SEPOLIA);
    this.paymaster = options.paymaster;
    this.policies = policies.map((policy) => ({
      ...policy,
      target: addAddressPadding(policy.target),
    }));

    this.setTheme(options?.theme, options?.config?.presets);
    if (options?.colorMode) {
      this.setColorMode(options.colorMode);
    }

    this.initModal();
  }

  private initModal() {
    if (typeof document === "undefined") return;

    this.modal = createModal(this.url.toString(), () => this.keychain?.reset());
    const appendModal = () => document.body.appendChild(this.modal!.element);

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      appendModal();
    } else {
      document.addEventListener("DOMContentLoaded", appendModal);
    }

    this.connection = connectToChild<Keychain>({
      iframe: this.modal.element.children[0] as HTMLIFrameElement,
      methods: { close: () => this.modal?.close() },
    });

    this.connection.promise.then((keychain) => {
      this.keychain = keychain;
      return this.probe();
    });
  }

  private setTheme(
    id: string = "cartridge",
    presets: ControllerThemePresets = defaultPresets,
  ) {
    const theme = presets[id] ?? defaultPresets.cartridge;
    this.url.searchParams.set(
      "theme",
      encodeURIComponent(JSON.stringify(theme)),
    );
  }

  private setColorMode(colorMode: ColorMode) {
    this.url.searchParams.set("colorMode", colorMode);
  }

  ready() {
    return (
      this.connection?.promise
        .then(() => this.probe())
        .then(
          (res) => !!res,
          () => false,
        ) ?? Promise.resolve(false)
    );
  }

  async probe() {
    if (!this.keychain || !this.modal) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    try {
      const res = await this.keychain.probe();
      if (res.code !== ResponseCodes.SUCCESS) {
        return;
      }

      const { address } = res as ProbeReply;
      this.account = new DeviceAccount(
        this.rpc.toString(),
        address,
        this.keychain,
        this.modal,
        this.paymaster,
      ) as AccountInterface;
    } catch (e) {
      console.error(e);
      return;
    }

    return !!this.account;
  }

  async connect() {
    if (this.account) {
      return this.account;
    }

    if (!this.keychain || !this.modal) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    this.modal.open();

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
        this.modal,
        this.paymaster,
      ) as AccountInterface;

      return this.account;
    } catch (e) {
      console.log(e);
    } finally {
      this.modal.close();
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
}

export * from "./types";
export * from "./errors";
export default Controller;
