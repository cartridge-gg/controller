import { useAccount, useConnect } from "@starknet-start/react";
import { useEffect, useRef } from "react";

const STORAGE_KEY = "example.last-connected-wallet";

/**
 * `StarknetConfig` accepts an `autoConnect` prop, but @starknet-start/react
 * 1.0.8 never reads it, so reconnecting on reload is up to the app. This hook
 * fills the gap:
 *
 * - remembers the connector that is currently connected
 * - reconnects to it once on load
 * - forgets it on disconnect, so a disconnected user stays disconnected
 *
 * Connectors are matched by `name` (the same identity the rest of this example
 * uses, e.g. `"Controller"` / `"Controller Session"`).
 */
export function useAutoConnect({ enabled = true }: { enabled?: boolean } = {}) {
  const { connect, connectors } = useConnect();
  const { status, connector } = useAccount();

  // Guards a single reconnect attempt per page load.
  const attempted = useRef(false);
  // Only clear the stored connector when we leave a connection we had, not on
  // the initial "disconnected" render that happens before autoconnect runs.
  const wasConnected = useRef(false);

  useEffect(() => {
    if (status === "connected") {
      wasConnected.current = true;
      if (connector) {
        window.localStorage.setItem(STORAGE_KEY, connector.name);
      }
      return;
    }

    if (wasConnected.current) {
      wasConnected.current = false;
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [status, connector]);

  useEffect(() => {
    if (!enabled || attempted.current || status !== "disconnected") {
      return;
    }

    const name = window.localStorage.getItem(STORAGE_KEY);
    if (!name) {
      return;
    }

    // Wallets register themselves asynchronously; if ours isn't in the list
    // yet, bail out and let the next render (triggered by registration) retry.
    const target = connectors.find((c) => c.name === name);
    if (!target) {
      return;
    }

    attempted.current = true;
    connect({ connector: target });
  }, [enabled, status, connectors, connect]);
}

/** Drop-in component for mounting `useAutoConnect` inside `StarknetConfig`. */
export function AutoConnect({ enabled }: { enabled?: boolean }) {
  useAutoConnect({ enabled });
  return null;
}
