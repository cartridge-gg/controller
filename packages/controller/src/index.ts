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
  Prefund,
  ConnectError,
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

  constructor({
    policies,
    url,
    rpc,
    paymaster,
    theme,
    config,
    colorMode,
    prefunds,
  }: ControllerOptions = {}) {
    this.url = new URL(url || KEYCHAIN_URL);
    this.rpc = new URL(rpc || RPC_SEPOLIA);
    this.paymaster = paymaster;
    this.policies =
      policies?.map((policy) => ({
        ...policy,
        target: addAddressPadding(policy.target),
      })) || [];

    this.setTheme(theme, config?.presets);
    if (colorMode) {
      this.setColorMode(colorMode);
    }
    if (prefunds?.length) {
      this.setPrefunds(prefunds);
    }

    this.initModal();
  }

  async openMenu() {
    if (!this.keychain || !this.modal) {
      console.error(new NotReadyToConnect().message);
      return null;
    }
    this.modal.open();
    const res = await this.keychain.openMenu();
    this.modal.close();
    if (res && (res as ConnectError).code === ResponseCodes.NOT_CONNECTED) {
      return false;
    }
    return true;
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

  private setPrefunds(prefunds: Prefund[]) {
    this.url.searchParams.set(
      "prefunds",
      encodeURIComponent(JSON.stringify(prefunds)),
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
      const response = (await this.keychain.probe(
        this.rpc.toString(),
      )) as ProbeReply;

      this.account = new DeviceAccount(
        this.rpc.toString(),
        response.address,
        this.keychain,
        this.modal,
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

  async delegateAccount() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    return await this.keychain.delegateAccount();
  }
}

export * from "./types";
export * from "./errors";
export default Controller;
