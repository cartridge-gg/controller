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
    onStarterpackPlay?: () => void;
    encryptedBlob?: string;
  };

const STARTERPACK_PLAY_CALLBACK_DELAY_MS = 200;

export class KeychainIFrame extends IFrame<Keychain> {
  private walletBridge: WalletBridge;
  private onStarterpackPlay?: () => void;

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
    onStarterpackPlay,
    encryptedBlob,
    propagateSessionErrors,
    errorDisplayMode,
    ...iframeOptions
  }: KeychainIframeOptions) {
    let onStarterpackPlayHandler: (() => Promise<void>) | undefined;
    const _url = new URL(url ?? KEYCHAIN_URL);
    const walletBridge = new WalletBridge();

    if (propagateSessionErrors) {
      _url.searchParams.set("propagate_error", "true");
    }

    if (errorDisplayMode) {
      _url.searchParams.set("error_display_mode", errorDisplayMode);
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
      _url.searchParams.set("needs_session_creation", "true");
    }

    if (username) {
      _url.searchParams.set("username", encodeURIComponent(username));
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

    // Add encrypted blob to URL fragment (hash) if present
    // This contains the encrypted localStorage snapshot from keychain redirect
    if (encryptedBlob) {
      _url.hash = `kc=${encodeURIComponent(encryptedBlob)}`;
    }

    super({
      ...iframeOptions,
      id: "controller-keychain",
      url: _url,
      methods: {
        ...walletBridge.getIFrameMethods(),
        // Expose callback for keychain to notify parent that session was created and storage access granted
        onSessionCreated: (_origin: string) => () => {
          if (onSessionCreated) {
            onSessionCreated();
          }
        },
        onStarterpackPlay: (_origin: string) => async () => {
          if (onStarterpackPlayHandler) {
            await onStarterpackPlayHandler();
          }
        },
      },
    });

    this.walletBridge = walletBridge;
    this.onStarterpackPlay = onStarterpackPlay;
    onStarterpackPlayHandler = async () => {
      this.close();
      const callback = this.onStarterpackPlay;
      this.onStarterpackPlay = undefined;
      if (!callback) {
        return;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, STARTERPACK_PLAY_CALLBACK_DELAY_MS),
      );
      try {
        callback();
      } catch (error) {
        console.error("Failed to run starterpack play callback:", error);
      }
    };

    // Expose the wallet bridge instance globally for WASM interop
    if (typeof window !== "undefined") {
      (window as any).external_wallets = this.walletBridge;
    }
  }

  getWalletBridge(): WalletBridge {
    return this.walletBridge;
  }

  setOnStarterpackPlay(callback?: () => void) {
    this.onStarterpackPlay = callback;
  }
}
