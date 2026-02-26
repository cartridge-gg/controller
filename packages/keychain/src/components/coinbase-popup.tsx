import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SpinnerIcon, TimesIcon } from "@cartridge/ui";

/** Timeout for the payment (10 minutes) */
const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000;

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

const extractJsonStringField = (
  raw: string,
  fieldName: string,
): string | undefined => {
  const key = `"${fieldName}"`;
  const keyIndex = raw.indexOf(key);
  if (keyIndex === -1) return undefined;

  const colonIndex = raw.indexOf(":", keyIndex + key.length);
  if (colonIndex === -1) return undefined;

  let i = colonIndex + 1;
  while (i < raw.length && /\s/.test(raw[i])) i++;
  if (raw[i] !== '"') return undefined;

  i += 1; // skip opening quote
  let value = "";
  let escaped = false;

  while (i < raw.length) {
    const ch = raw[i];

    if (escaped) {
      switch (ch) {
        case "n":
          value += "\n";
          break;
        case "\\":
        case '"':
          value += ch;
          break;
        default:
          value += ch;
      }
      escaped = false;
      i += 1;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      i += 1;
      continue;
    }

    if (ch === '"') {
      return value;
    }

    value += ch;
    i += 1;
  }

  return undefined;
};

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
      // Last-resort fallback: extract eventName from raw string payloads
      // that are not valid JSON due to transport quirks.
      const rawString = String(data);
      const eventName = extractJsonStringField(rawString, "eventName");
      const errorCode = extractJsonStringField(rawString, "errorCode");
      const errorMessage = extractJsonStringField(rawString, "errorMessage");
      if (eventName) {

        return {
          eventName: eventName as CoinbaseEventName,
          data:
            errorCode || errorMessage
              ? {
                errorCode,
                errorMessage,
              }
              : undefined,
        };
      }
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

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      switch (data.eventName) {
        case "onramp_api.load_success":
          setIframeReady(true);
          break;

        case "onramp_api.load_error":
          setIframeReady(true); // hide spinner even on error
          setError(
            data.data?.errorMessage ||
            "Failed to load payment. Please close and try again.",
          );
          setFailed(true);
          break;

        case "onramp_api.commit_success":
          setCommitted(true);
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
          setFailed(true);
          break;

        case "onramp_api.cancel":
          setError("Payment was cancelled.");
          setCommitted(false);
          setFailed(true);
          break;

        case "onramp_api.polling_success":
          setCompleted(true);
          setTimeout(() => window.close(), 1500);
          break;

        case "onramp_api.polling_error":
          setError(
            data.data?.errorMessage ||
            "Transaction failed. Please close and try again.",
          );
          setFailed(true);
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
          className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium ${completed
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
          }}
        />
      </div>
    </div>
  );
}
