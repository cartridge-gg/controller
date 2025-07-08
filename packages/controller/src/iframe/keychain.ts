import { KEYCHAIN_URL } from "../constants";
import { Keychain, KeychainOptions } from "../types";
import { WalletBridge } from "../wallets/bridge";
import { IFrame, IFrameOptions } from "./base";

type KeychainIframeOptions = IFrameOptions<Keychain> &
  KeychainOptions & {
    version?: string;
  };

export class KeychainIFrame extends IFrame<Keychain> {
  private walletBridge: WalletBridge;

  constructor({
    url,
    policies,
    version,
    slot,
    namespace,
    tokens,
    ...iframeOptions
  }: KeychainIframeOptions) {
    const _url = new URL(url ?? KEYCHAIN_URL);
    const walletBridge = new WalletBridge();

    if (policies) {
      _url.searchParams.set(
        "policies",
        encodeURIComponent(JSON.stringify(policies)),
      );
    }

    if (version) {
      _url.searchParams.set("v", encodeURIComponent(version));
    }

    if (slot) {
      _url.searchParams.set("ps", encodeURIComponent(slot));
    }

    if (namespace) {
      _url.searchParams.set("ns", encodeURIComponent(namespace));
    }

    if (tokens?.erc20) {
      _url.searchParams.set(
        "erc20",
        encodeURIComponent(tokens.erc20.toString()),
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
