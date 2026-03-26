import { KEYCHAIN_URL } from "./constants";
import type { Controller, ControllerOptions } from "./types";
import "./global.d.ts";

export interface InitOptions extends ControllerOptions {
  /** Override the SDK script URL (defaults to {keychainUrl}/sdk.js) */
  sdkUrl?: string;
  /** Timeout in ms for SDK load (default: 15000) */
  timeout?: number;
}

let sdkLoadPromise: Promise<void> | null = null;

export async function init(options: InitOptions = {}): Promise<Controller> {
  if (typeof window === "undefined") {
    throw new Error("init() can only be called in a browser environment");
  }

  // If sdk.js has already loaded, instantiate directly
  if (window.__cartridge_sdk_loaded && window.__cartridge_ControllerProvider) {
    const CtrlProvider = window.__cartridge_ControllerProvider;
    return new CtrlProvider(options);
  }

  const keychainUrl = options.url || KEYCHAIN_URL;
  const sdkUrl = options.sdkUrl || `${keychainUrl}/sdk.js`;
  const timeout = options.timeout ?? 15000;

  // Generate unique token for this init call
  const token = Math.random().toString(36).slice(2);

  return new Promise<Controller>((resolve, reject) => {
    const initKey = `__cartridge_init_${token}` as const;

    // Timeout handler
    const timer = setTimeout(() => {
      delete (window as any)[initKey];
      reject(
        new Error(
          `Cartridge SDK load timed out after ${timeout}ms. ` +
            `Check network connectivity and CSP settings ` +
            `(script-src must allow ${new URL(sdkUrl).origin}).`,
        ),
      );
    }, timeout);

    // Store options and callbacks on window for sdk.js to read
    (window as any)[initKey] = {
      options,
      resolve: (controller: Controller) => {
        clearTimeout(timer);
        delete (window as any)[initKey];
        resolve(controller);
      },
      reject: (error: Error) => {
        clearTimeout(timer);
        delete (window as any)[initKey];
        reject(error);
      },
    };

    // Register token so sdk.js knows which init calls to process
    window.__cartridge_pending_inits = window.__cartridge_pending_inits || [];
    window.__cartridge_pending_inits.push(token);

    // Load sdk.js once, reuse for subsequent init calls
    if (!sdkLoadPromise) {
      sdkLoadPromise = new Promise<void>((resolveLoad, rejectLoad) => {
        const script = document.createElement("script");
        script.src = sdkUrl;
        script.async = true;
        script.onerror = () => {
          sdkLoadPromise = null;
          const err = new Error(
            `Failed to load Cartridge SDK from ${sdkUrl}. ` +
              `Check network connectivity and CSP settings.`,
          );
          rejectLoad(err);
          // Also reject the pending init
          clearTimeout(timer);
          delete (window as any)[initKey];
          reject(err);
        };
        script.onload = () => resolveLoad();
        document.head.appendChild(script);
      });
    }
  });
}
