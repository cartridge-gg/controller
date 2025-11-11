import { KEYCHAIN_URL } from "../constants";
import { Keychain, KeychainOptions } from "../types";
import { WalletBridge } from "../wallets/bridge";
import { IFrame, IFrameOptions } from "./base";

type KeychainIframeOptions = IFrameOptions<Keychain> &
  KeychainOptions & {
    version?: string;
    ref?: string;
    refGroup?: string;
    needsSessionCreation?: boolean;
    username?: string;
    onSessionCreated?: () => void;
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
    ref,
    refGroup,
    needsSessionCreation,
    username,
    onSessionCreated,
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

    if (ref) {
      _url.searchParams.set("ref", encodeURIComponent(ref));
    }

    if (refGroup) {
      _url.searchParams.set("ref_group", encodeURIComponent(refGroup));
    }

    if (needsSessionCreation) {
      console.log(
        "[Standalone Flow] KeychainIFrame: needsSessionCreation parameter received =",
        needsSessionCreation,
      );
      _url.searchParams.set("needs_session_creation", "true");
      console.log(
        "[Standalone Flow] KeychainIFrame: Added needs_session_creation=true to URL",
      );
    } else {
      console.log(
        "[Standalone Flow] KeychainIFrame: needsSessionCreation NOT set, normal iframe load",
      );
    }

    if (username) {
      console.log(
        "[Standalone Flow] KeychainIFrame: Adding username parameter =",
        username,
      );
      _url.searchParams.set("username", encodeURIComponent(username));
    }

    console.log(
      "[Standalone Flow] KeychainIFrame: Final iframe URL =",
      _url.toString(),
    );

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
      methods: {
        ...walletBridge.getIFrameMethods(),
        // Expose callback for keychain to notify parent that session was created and storage access granted
        onSessionCreated: (_origin: string) => () => {
          console.log(
            "[Standalone Flow] KeychainIFrame: onSessionCreated method called from keychain",
          );
          if (onSessionCreated) {
            onSessionCreated();
          }
        },
      },
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
