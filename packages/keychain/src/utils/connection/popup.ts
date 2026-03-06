import type { ImportedControllerState } from "@/utils/controller";

const POPUP_WIDTH = 432;
const POPUP_HEIGHT = 700;
const POPUP_POLL_INTERVAL_MS = 500;

export type PopupAuthAction = "signup" | "login";

type PopupMessage =
  | {
      type: "auth-complete";
      channelId: string;
      state: ImportedControllerState;
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

export type PopupAuthResult = ImportedControllerState;

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
        resolve(data.state);
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
