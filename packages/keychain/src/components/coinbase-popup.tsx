import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SpinnerIcon, TimesIcon } from "@cartridge/ui";

/** Timeout for the payment (10 minutes) */
const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000;
/** Time to wait after iframe loads for a Coinbase event before assuming an error (15s) */
const LOAD_EVENT_TIMEOUT_MS = 15_000;

/** Coinbase postMessage event names */
type CoinbaseEventName =
  | "onramp_api.load_pending"
  | "onramp_api.load_success"
  | "onramp_api.load_error"
  | "onramp_api.pending_payment_auth"
  | "onramp_api.payment_authorized"
  | "onramp_api.apple_pay_button_pressed"
  | "onramp_api.commit_success"
  | "onramp_api.commit_error"
  | "onramp_api.cancel"
  | "onramp_api.polling_start"
  | "onramp_api.polling_success"
  | "onramp_api.polling_error";

interface CoinbasePostMessage {
  eventName: CoinbaseEventName;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

const parseCoinbaseMessage = (rawData: unknown): CoinbasePostMessage | null => {
  if (!rawData) return null;

  // Some environments send Coinbase payloads as nested JSON strings.
  // Parse up to a bounded depth to avoid infinite loops on malformed input.
  let data: unknown = rawData;
  for (let i = 0; i < 5; i++) {
    if (typeof data !== "string") break;
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }

  if (typeof data === "object" && data !== null) {
    // Some message bridges wrap payloads under a `data` key.
    const wrappedData = (data as { data?: unknown }).data;
    if (wrappedData) {
      const nested = parseCoinbaseMessage(wrappedData);
      if (nested?.eventName?.startsWith("onramp_api.")) return nested;
    }

    return data as CoinbasePostMessage;
  }

  return null;
};

/**
 * Standalone page rendered at /coinbase in the keychain app.
 * Opened as a popup from the CoinbaseCheckout component.
 *
 * - Embeds the Coinbase payment link in an iframe (works because
 *   the top-level domain is x.cartridge.gg)
 * - Listens for Coinbase postMessage events for real-time feedback
 * - Closes the popup automatically on success
 * - Shows failure/error messages from Coinbase events
 */
export function CoinbasePopup() {
  const [searchParams] = useSearchParams();
  const paymentLink = searchParams.get("paymentLink");
  const orderId = searchParams.get("orderId");

  const [iframeReady, setIframeReady] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [committed, setCommitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  /** Tracks whether we've received any Coinbase postMessage event */
  const coinbaseEventReceived = useRef(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Open BroadcastChannel scoped to this orderId
  useEffect(() => {
    if (!orderId) return;
    const channel = new BroadcastChannel(`coinbase-payment-${orderId}`);
    channelRef.current = channel;
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [orderId]);

  // Listen for Coinbase postMessage events from the iframe
  useEffect(() => {
    // Derive the allowed origin from the payment link URL
    const allowedOrigin = paymentLink ? new URL(paymentLink).origin : null;
    console.log(
      "[coinbase-popup] Listening for postMessages, allowedOrigin:",
      allowedOrigin,
    );
    console.log("[coinbase-popup] paymentLink:", paymentLink);
    console.log(
      "[coinbase-popup] sandbox attrs: allow-scripts allow-same-origin",
    );

    const handleMessage = (event: MessageEvent) => {
      // Log ALL incoming messages for debugging
      console.log("[coinbase-popup] Raw postMessage received:", {
        origin: event.origin,
        data: event.data,
        type: typeof event.data,
        source: event.source ? "has source" : "no source",
      });

      // Verify the message origin matches the Coinbase payment link domain
      if (allowedOrigin && event.origin !== allowedOrigin) {
        console.warn(
          `[coinbase-popup] Origin mismatch: got "${event.origin}", expected "${allowedOrigin}"`,
        );
        return;
      }

      // Coinbase may send object payloads or JSON-encoded strings.
      const data = parseCoinbaseMessage(event.data);
      if (!data?.eventName?.startsWith("onramp_api.")) {
        console.log(
          "[coinbase-popup] Ignoring non-Coinbase message:",
          event.data,
        );
        return;
      }

      console.log(
        "[coinbase-popup] ✅ Coinbase event:",
        data.eventName,
        data.data,
      );
      coinbaseEventReceived.current = true;

      // Clear the load timeout since we got a valid Coinbase event
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      // Relay every Coinbase event to the keychain via BroadcastChannel
      channelRef.current?.postMessage({
        type: data.eventName,
        data: data.data,
      });

      switch (data.eventName) {
        case "onramp_api.load_pending":
          setIframeReady(false);
          setError(undefined);
          setCommitted(false);
          setFailed(false);
          setCompleted(false);
          break;

        case "onramp_api.load_success":
          setIframeReady(true);
          break;

        case "onramp_api.load_error":
          setIframeReady(true); // hide spinner even on error
          setError(
            data.data?.errorMessage ||
              "Failed to load payment. Please close and try again.",
          );
          setCommitted(false);
          setFailed(true);
          setCompleted(false);
          break;

        case "onramp_api.commit_success":
          setCommitted(true);
          setError(undefined);
          setFailed(false);
          break;

        case "onramp_api.pending_payment_auth":
          setCommitted(true);
          break;

        case "onramp_api.payment_authorized":
          setCommitted(true);
          break;

        case "onramp_api.apple_pay_button_pressed":
          setCommitted(true);
          break;

        case "onramp_api.commit_error":
          setError(
            data.data?.errorMessage ||
              "Payment could not be processed. Please try again.",
          );
          setCommitted(false);
          setFailed(true);
          setCompleted(false);
          break;

        case "onramp_api.cancel":
          setError("Payment was cancelled.");
          setCommitted(false);
          setFailed(true);
          setCompleted(false);
          break;

        case "onramp_api.polling_start":
          setCommitted(true);
          setError(undefined);
          setFailed(false);
          setCompleted(false);
          break;

        case "onramp_api.polling_success":
          setCompleted(true);
          setCommitted(false);
          setFailed(false);
          setTimeout(() => window.close(), 1500);
          break;

        case "onramp_api.polling_error":
          setError(
            data.data?.errorMessage ||
              "Transaction failed. Please close and try again.",
          );
          setCommitted(false);
          setFailed(true);
          setCompleted(false);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [paymentLink]);

  // Timeout safety net
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setError("Payment timed out. Please close this window and try again.");
      setFailed(true);
    }, PAYMENT_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  if (!paymentLink || !orderId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F1410] text-foreground-300">
        <p>Missing payment information.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0F1410]">
      {/* Status bar */}
      {(completed || failed) && (
        <div
          className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium ${
            completed
              ? "bg-[#1a2e1a] text-[#4ade80]"
              : "bg-[#2e1a1a] text-[#f87171]"
          }`}
        >
          {completed ? (
            <>
              <span>✓</span>
              <span>Payment successful! This window will close shortly.</span>
            </>
          ) : (
            <>
              <TimesIcon size="sm" />
              <span>{error}</span>
            </>
          )}
        </div>
      )}

      {/* Committed indicator (payment in progress) */}
      {committed && !completed && !failed && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-[#1a2a2e] text-[#60a5fa]">
          <SpinnerIcon className="animate-spin" size="sm" />
          <span>Payment processing...</span>
        </div>
      )}

      {/* Iframe */}
      <div className="flex-1 relative">
        {!iframeReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0F1410] z-10">
            <SpinnerIcon className="animate-spin" size="lg" />
          </div>
        )}
        <iframe
          src={paymentLink}
          className="h-full w-full border-none"
          allow="payment"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          title="Coinbase Onramp"
          onLoad={() => {
            console.log("[coinbase-popup] iframe onLoad fired");
            setIframeReady(true);

            // If no Coinbase postMessage event arrives within the timeout,
            // the payment link likely returned an error (e.g. 500).
            loadTimeoutRef.current = setTimeout(() => {
              if (!coinbaseEventReceived.current) {
                const errorMessage =
                  "Coinbase is having issues right now. Please close this window and try again later.";
                console.error(
                  "[coinbase-popup] No Coinbase events received after iframe load — assuming server error",
                );
                setError(errorMessage);
                setFailed(true);

                // Alert the keychain so it can display an appropriate message
                channelRef.current?.postMessage({
                  type: "onramp_api.load_error",
                  data: { errorMessage },
                });
              }
            }, LOAD_EVENT_TIMEOUT_MS);
          }}
        />
      </div>
    </div>
  );
}
