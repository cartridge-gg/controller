import { CONTROLLER_TOAST_MESSAGE_TYPE, ToastOptions } from "../types";

// The keychain iframe posts toasts cross-origin (e.g. from x.cartridge.gg
// into a third-party app), so same-origin checks alone would reject the
// real integration flow. Accepted senders: localhost on any port (local dev
// runs keychain and app on different ports) or cartridge.gg and its
// subdomains over https. Deliberately NOT a registrable-domain heuristic,
// which would trust sibling tenants on shared hosts (*.vercel.app,
// *.github.io, *.co.uk).
export function isTrustedOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }
    return (
      protocol === "https:" &&
      (hostname === "cartridge.gg" || hostname.endsWith(".cartridge.gg"))
    );
  } catch {
    return false;
  }
}

// Validate the wire shape before dispatching on it; a malformed message
// (e.g. `options: null`) must be ignored, not throw inside the listener.
export function parseToastEvent(data: unknown): ToastOptions | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const message = data as { type?: unknown; options?: unknown };
  if (message.type !== CONTROLLER_TOAST_MESSAGE_TYPE) {
    return null;
  }
  const options = message.options as ToastOptions | null | undefined;
  if (
    typeof options !== "object" ||
    options === null ||
    typeof options.variant !== "string"
  ) {
    return null;
  }
  return options;
}
