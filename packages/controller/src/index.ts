export * from "./types";
export { defaultPresets } from "./presets";

import {
  AccountInterface,
  addAddressPadding,
  constants,
} from "starknet";
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
} from "./types";
import { createModal } from "./modal";
import { defaultPresets } from "./presets";
import { NotReadyToConnect } from "./errors";

class Controller {
  private url = new URL("https://x.cartridge.gg");
  private policies: Policy[] = [];
  private connection?: Connection<Keychain>;
  private modal?: Modal;
  public keychain?: AsyncMethodReturns<Keychain>;
  public rpc = new URL("https://api.cartridge.gg/x/starknet/sepolia");
  public chainId: string = constants.StarknetChainId.SN_SEPOLIA;
  public account?: AccountInterface;
  // private starterPackId?: string;

  constructor(policies?: Policy[], options?: ControllerOptions) {
    if (policies) {
      this.policies = policies.map((policy) => {
        return {
          ...policy,
          target: addAddressPadding(policy.target),
        };
      });
    }

    if (options?.url) {
      this.url = new URL(options.url);
    }

    if (options?.rpc) {
      this.rpc = new URL(options.rpc);
    }

    this.setTheme(options?.theme, options?.config?.presets);
    if (options?.colorMode) {
      this.setColorMode(options.colorMode);
    }

    if (typeof document === "undefined") {
      return;
    }

    this.modal = createModal(this.url.toString(), () => {
      this.keychain?.reset();
    });

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      document.body.appendChild(this.modal.element);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(this.modal!.element);
      });
    }
    
    this.connection = connectToChild<Keychain>({
      iframe: this.modal.element.children[0] as HTMLIFrameElement,
      methods: {
        close: () => {
          this.modal?.close();
        },
      },
      debug: true
    });

    this.connection.promise
      .then((keychain) => (this.keychain = keychain))
      .then(() => this.probe());
  }

  private setTheme(
    id: string = "cartridge",
    presets: ControllerThemePresets = defaultPresets,
  ) {
    const theme = presets[id] ?? defaultPresets.cartridge;
    this.url.searchParams.set("theme", encodeURIComponent(JSON.stringify(theme)));
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
      let response = await this.keychain.connect(this.policies, this.rpc.toString());
      if (response.code !== ResponseCodes.SUCCESS) {
        throw new Error(response.message);
      }
      
      response = response as ConnectReply;
      this.account = new DeviceAccount(
        this.rpc.toString(),
        response.address,
        this.keychain,
        this.modal,
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
export { computeAddress, split, verifyMessageHash } from "./utils";
export default Controller;
