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
    preset,
    shouldOverridePresetPolicies,
    rpcUrl,
    ...iframeOptions
  }: KeychainIframeOptions) {
    const _url = new URL(url ?? KEYCHAIN_URL);
    const walletBridge = new WalletBridge();

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

    if (rpcUrl) {
      _url.searchParams.set("rpc_url", encodeURIComponent(rpcUrl));
    }

    // Policy precedence logic:
    // 1. If shouldOverridePresetPolicies is true and policies are provided, use policies
    // 2. Otherwise, if preset is defined, use empty object (let preset take precedence)
    // 3. Otherwise, use provided policies or empty object
    if ((!preset || shouldOverridePresetPolicies) && policies) {
      _url.searchParams.set(
        "policies",
        encodeURIComponent(JSON.stringify(policies)),
      );
    } else if (preset) {
      _url.searchParams.set("preset", preset);
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
