import type { ImportedControllerState } from "@/utils/controller";

const POPUP_WIDTH = 432;
const POPUP_HEIGHT = 700;
const POPUP_POLL_INTERVAL_MS = 500;
const POPUP_HANDSHAKE_RETRY_MS = 150;
const POPUP_HANDSHAKE_TIMEOUT_MS = 5000;

export type PopupAuthAction = "signup" | "login";

type PopupMessage =
  | {
      type: "auth-ready";
      channelId: string;
    }
  | {
      type: "auth-complete";
      channelId: string;
      state: ImportedControllerState;
      sessionToken: string | null;
    }
  | {
      type: "auth-error";
      channelId: string;
      error?: string;
    };

export interface PopupAuthOptions {
  action: PopupAuthAction;
  policies?: string;
  preset?: string;
  rpcUrl?: string;
  origin?: string;
  username?: string;
}

export type PopupAuthResult = {
  state: ImportedControllerState;
  sessionToken: string | null;
};

let activePopup: Window | null = null;

export function openPopupAuth(
  options: PopupAuthOptions,
): Promise<PopupAuthResult> {
  // Prevent multiple concurrent popups
  if (activePopup && !activePopup.closed) {
    activePopup.focus();
    return Promise.reject(new Error("A popup auth window is already open"));
  }

  const channelId = crypto.randomUUID();

  const url = new URL(`${window.location.origin}/auth`);
  url.searchParams.set("channel_id", channelId);
  url.searchParams.set("action", options.action);

  if (options.policies) {
    url.searchParams.set("policies", options.policies);
  }
  if (options.preset) {
    url.searchParams.set("preset", options.preset);
  }
  if (options.rpcUrl) {
    url.searchParams.set("rpc_url", options.rpcUrl);
  }
  if (options.origin) {
    url.searchParams.set("origin", options.origin);
  }
  if (options.username) {
    url.searchParams.set("username", options.username);
  }

  // Center the popup on screen
  const left = Math.round(
    (window.screen.width - POPUP_WIDTH) / 2 + (window.screenX || 0),
  );
  const top = Math.round(
    (window.screen.height - POPUP_HEIGHT) / 2 + (window.screenY || 0),
  );

  const popup = window.open(
    url.toString(),
    "cartridge-popup-auth",
    `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes,resizable=yes`,
  );

  if (!popup) {
    return Promise.reject(
      new Error(
        "Popup blocked. Please allow popups for this site and try again.",
      ),
    );
  }

  activePopup = popup;

  return new Promise<PopupAuthResult>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      settled = true;
      activePopup = null;
      clearInterval(pollInterval);
      window.removeEventListener("message", handleWindowMessage);
    };

    const handleAuthMessage = (data?: PopupMessage) => {
      if (settled) return;

      if (!data) {
        return;
      }

      if (data.type === "auth-complete") {
        popup.postMessage(
          { type: "auth-ack", channelId },
          window.location.origin,
        );
        cleanup();
        resolve({ state: data.state, sessionToken: data.sessionToken });
      } else if (data.type === "auth-error") {
        cleanup();
        reject(new Error(data.error ?? "Popup authentication failed"));
      }
    };

    const handleWindowMessage = (event: MessageEvent) => {
      if (
        settled ||
        event.origin !== window.location.origin ||
        event.source !== popup
      ) {
        return;
      }

      const data = event.data as PopupMessage | undefined;
      if (!data || data.channelId !== channelId) {
        return;
      }

      // The popup asks the opener for the verified app origin. We answer with the
      // penpal-enforced origin the opener holds (never a value the popup itself
      // could derive from its URL), over this same-origin-validated channel.
      if (data.type === "auth-ready") {
        if (options.origin) {
          popup.postMessage(
            { type: "auth-context", channelId, origin: options.origin },
            window.location.origin,
          );
        }
        return;
      }

      handleAuthMessage(data);
    };

    window.addEventListener("message", handleWindowMessage);

    // Poll for popup closed (user manually closed the window)
    const pollInterval = setInterval(() => {
      if (popup.closed && !settled) {
        cleanup();
        reject(new Error("Popup was closed"));
      }
    }, POPUP_POLL_INTERVAL_MS);
  });
}

/**
 * Validate an `auth-context` message received by the popup and extract the app
 * origin it carries.
 *
 * This is the trust boundary for popup-auth origin verification: the message is
 * accepted ONLY if it comes from the opener (the keychain iframe) and is
 * same-origin with the keychain. A page that opens `/auth` directly has a
 * cross-origin opener, so its messages are rejected here and it can never supply
 * a trusted origin. Returns the origin string, or null if the message is not a
 * trusted `auth-context`.
 */
export function parseTrustedAuthContext(
  event: MessageEvent,
  opts: { channelId: string; expectedOrigin: string; opener: Window | null },
): string | null {
  if (event.origin !== opts.expectedOrigin) {
    return null;
  }
  if (!opts.opener || event.source !== opts.opener) {
    return null;
  }

  const data = event.data as
    | { type?: string; channelId?: string; origin?: unknown }
    | undefined;
  if (
    !data ||
    data.type !== "auth-context" ||
    data.channelId !== opts.channelId
  ) {
    return null;
  }
  if (typeof data.origin !== "string" || data.origin.length === 0) {
    return null;
  }

  return data.origin;
}

/**
 * Called from the popup (`/auth`). Asks the opener for the verified app origin
 * over a same-origin postMessage handshake and invokes `onOrigin` once a trusted
 * `auth-context` arrives. The app origin is intentionally taken from this
 * handshake rather than the URL `origin` param, which is caller-supplied and
 * spoofable. Returns a cleanup function.
 */
export function requestPopupAuthOrigin(
  channelId: string,
  onOrigin: (origin: string) => void,
): () => void {
  if (typeof window === "undefined" || !window.opener) {
    return () => {};
  }

  const expectedOrigin = window.location.origin;
  const opener = window.opener as Window;
  let done = false;

  const cleanup = () => {
    if (done) return;
    done = true;
    clearInterval(retry);
    clearTimeout(timeout);
    window.removeEventListener("message", handler);
  };

  const handler = (event: MessageEvent) => {
    if (done) return;
    const origin = parseTrustedAuthContext(event, {
      channelId,
      expectedOrigin,
      opener,
    });
    if (!origin) return;
    cleanup();
    onOrigin(origin);
  };

  const post = () => {
    try {
      opener.postMessage({ type: "auth-ready", channelId }, expectedOrigin);
    } catch {
      // Opener may be cross-origin or gone; the timeout will clean up.
    }
  };

  window.addEventListener("message", handler);
  // Retry until the opener answers: its message listener may register slightly
  // after the popup mounts.
  const retry = setInterval(post, POPUP_HANDSHAKE_RETRY_MS);
  const timeout = setTimeout(cleanup, POPUP_HANDSHAKE_TIMEOUT_MS);
  post();

  return cleanup;
}
