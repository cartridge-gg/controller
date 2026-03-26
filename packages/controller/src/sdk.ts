/**
 * Remote SDK entry point.
 *
 * This file is built as a standalone IIFE bundle (sdk.js) and served from
 * the same origin as the keychain (e.g. x.cartridge.gg/sdk.js).
 *
 * It is NOT imported by the NPM package — it is loaded at runtime by the
 * `init()` loader function in loader.ts.
 */
import ControllerProvider from "./controller";
import "./global.d.ts";

(function () {
  const pendingInits = window.__cartridge_pending_inits || [];

  for (const token of pendingInits) {
    const initKey = `__cartridge_init_${token}` as const;
    const pending = (window as any)[initKey];
    if (!pending) continue;

    try {
      const controller = new ControllerProvider(pending.options);
      pending.resolve(controller);
    } catch (e) {
      pending.reject(e instanceof Error ? e : new Error(String(e)));
    }
  }

  // Clear the pending list
  window.__cartridge_pending_inits = [];

  // Mark SDK as loaded so future init() calls can instantiate directly
  window.__cartridge_sdk_loaded = true;
  window.__cartridge_ControllerProvider = ControllerProvider;
})();
