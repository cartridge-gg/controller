import { KEYCHAIN_URL } from "../constants";
import { Keychain, KeychainOptions } from "../types";
import { WalletBridge } from "../wallets/bridge";
import { IFrame, IFrameOptions } from "./base";

type KeychainIframeOptions = IFrameOptions<Keychain> & KeychainOptions;

export class KeychainIFrame extends IFrame<Keychain> {
  private walletBridge: WalletBridge;

  constructor({ url, policies, ...iframeOptions }: KeychainIframeOptions) {
    const _url = new URL(url ?? KEYCHAIN_URL);
    const walletBridge = new WalletBridge();

    if (policies) {
      _url.searchParams.set(
        "policies",
        encodeURIComponent(JSON.stringify(policies)),
      );
    }

    super({
      ...iframeOptions,
      id: "controller-keychain",
      url: _url,
      methods: walletBridge.getIFrameMethods(),
    });

    this.walletBridge = walletBridge;

    // Expose the wallet bridge instance globally for WASM interop
    if (typeof window !== "undefined") {
      (window as any).external_wallets = this.walletBridge;
    }
  }

  getWalletBridge(): WalletBridge {
    return this.walletBridge;
  }
}
