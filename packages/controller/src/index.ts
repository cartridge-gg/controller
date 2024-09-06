export * from "./errors";
export * from "./types";
export { defaultPresets } from "./presets";
export * from "./verified";

import { AccountInterface, addAddressPadding } from "starknet";
import { AsyncMethodReturns, connectToChild } from "@cartridge/penpal";

import DeviceAccount from "./device";
import {
  Keychain,
  Policy,
  ResponseCodes,
  ConnectReply,
  ProbeReply,
  ControllerOptions,
  ControllerThemePresets,
  ColorMode,
  PaymasterOptions,
  // Prefund,
  ConnectError,
  Profile,
  IFrames,
} from "./types";
import { createModal } from "./modal";
import { defaultPresets } from "./presets";
import { NotReadyToConnect, ProfileNotReady } from "./errors";
import { KEYCHAIN_URL, PROFILE_URL, RPC_SEPOLIA } from "./constants";

class Controller {
  private policies: Policy[];
  private paymaster?: PaymasterOptions;
  public keychain?: AsyncMethodReturns<Keychain>;
  public profile?: AsyncMethodReturns<Profile>;
  private iframes: IFrames;
  public rpc: URL;
  public account?: AccountInterface;

  constructor({
    policies,
    url,
    profileUrl,
    rpc,
    paymaster,
    theme,
    config,
    colorMode,
  }: ControllerOptions = {}) {
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
    this.iframes = {
      keychain: {
        url: new URL(url || KEYCHAIN_URL),
      },
      profile: {
        url: new URL(profileUrl || PROFILE_URL),
      },
    };

    this.setTheme(theme, config?.presets);
    if (colorMode) {
      this.setColorMode(colorMode);
    }
    if (paymaster) {
      this.setPaymaster(paymaster);
    }
    if (policies) {
      this.setPolicies(policies);
    }

    this.initIFrames();
  }

  private initIFrames() {
    if (typeof document === "undefined") {
      return this.iframes;
    }

    this.iframes.keychain.modal = createModal({
      id: "controller-keychain",
      src: this.iframes.keychain.url.toString(),
      onClose: () => this.keychain?.reset(),
    });
    this.iframes.profile.modal = createModal({
      id: "controller-profile",
      src: this.iframes.profile.url.toString(),
    });

    const appendModal = () => {
      Object.values(this.iframes).map((iframe) => {
        document.body.appendChild(iframe.modal!.element);
      });
    };

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      appendModal();
    } else {
      document.addEventListener("DOMContentLoaded", appendModal);
    }

    this.iframes.keychain.connection = connectToChild<Keychain>({
      iframe: this.iframes.keychain.modal?.element
        .children[0] as HTMLIFrameElement,
      methods: { close: () => this.iframes.keychain.modal?.close() },
    });

    this.iframes.profile.connection = connectToChild<Profile>({
      iframe: this.iframes.profile.modal?.element
        .children[0] as HTMLIFrameElement,
      methods: { close: () => this.iframes.profile.modal?.close() },
    });

    Promise.all([
      this.iframes.keychain.connection.promise,
      this.iframes.profile.connection.promise,
    ]).then(([keychain, profile]) => {
      this.keychain = keychain;
      this.profile = profile;
      return this.probe();
    });
  }

  async openMenu() {
    if (!this.keychain || !this.iframes.keychain.modal) {
      console.error(new NotReadyToConnect().message);
      return null;
    }
    this.iframes.keychain.modal.open();
    const res = await this.keychain.openMenu();
    this.iframes.keychain.modal.close();
    if (res && (res as ConnectError).code === ResponseCodes.NOT_CONNECTED) {
      return false;
    }
    return true;
  }

  private setTheme(
    id: string = "cartridge",
    presets: ControllerThemePresets = defaultPresets,
  ) {
    const theme = presets[id] ?? defaultPresets.cartridge;
    this.iframes.keychain.url.searchParams.set(
      "theme",
      encodeURIComponent(JSON.stringify(theme)),
    );
  }

  private setColorMode(colorMode: ColorMode) {
    this.iframes.keychain.url.searchParams.set("colorMode", colorMode);
  }

  private setPaymaster(paymaster: PaymasterOptions) {
    this.iframes.keychain.url.searchParams.set(
      "paymaster",
      encodeURIComponent(JSON.stringify(paymaster)),
    );
  }

  private setPolicies(policies: Policy[]) {
    this.url.searchParams.set(
      "policies",
      encodeURIComponent(JSON.stringify(policies)),
    );
  }

  ready() {
    return (
      Promise.all([
        this.iframes.keychain.connection?.promise,
        this.iframes.profile.connection?.promise,
      ])
        // .then(() => this.probe())
        .then((a) => {
          console.log("!!!!!!!!!!!!!", a);
          return this.probe();
        })
        .then(
          (res) => !!res,
          () => false,
        ) ?? Promise.resolve(false)
    );
  }

  async probe() {
    if (
      !this.keychain ||
      !this.iframes.keychain.modal ||
      !this.iframes.profile ||
      !this.iframes.profile.modal
    ) {
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
        this.iframes.keychain.modal,
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

    if (!this.keychain || !this.iframes.keychain.modal) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    this.iframes.keychain.modal.open();

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
        this.iframes.keychain.modal,
        this.paymaster,
      ) as AccountInterface;

      return this.account;
    } catch (e) {
      console.log(e);
    } finally {
      this.iframes.keychain.modal.close();
    }
  }

  openProfile() {
    if (!this.profile || !this.iframes.profile.modal) {
      console.error(new ProfileNotReady().message);
      return;
    }

    this.iframes.profile.modal.open();
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

export default Controller;
