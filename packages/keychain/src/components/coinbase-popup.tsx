import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SpinnerIcon, TimesIcon } from "@cartridge/ui";
import {
  CoinbaseOnRampOrderDocument,
  CoinbaseOnRampOrderQuery,
  CoinbaseOnrampStatus,
} from "@cartridge/ui/utils/api/cartridge";
import { request } from "@/utils/graphql";

/** Polling interval for checking order status (1 second for responsive UX) */
const POLL_INTERVAL_MS = 1_000;
/** Timeout for the payment (10 minutes) */
const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Standalone page rendered at /coinbase in the keychain app.
 * Opened as a popup from the CoinbaseCheckout component.
 *
 * - Embeds the Coinbase payment link in an iframe (works because
 *   the top-level domain is x.cartridge.gg)
 * - Polls the order status via GraphQL
 * - Closes the popup automatically on success
 * - Shows failure message if payment fails or times out
 */
export function CoinbasePopup() {
  const [searchParams] = useSearchParams();
  const paymentLink = searchParams.get("paymentLink");
  const orderId = searchParams.get("orderId");

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [status, setStatus] = useState<CoinbaseOnrampStatus | undefined>();
  const [error, setError] = useState<string | undefined>();

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  // Start polling when we have an orderId
  useEffect(() => {
    if (!orderId) return;

    const poll = async () => {
      try {
        const result = await request<CoinbaseOnRampOrderQuery>(
          CoinbaseOnRampOrderDocument,
          { orderId },
        );
        const orderStatus = result.coinbaseOnrampOrder.status;
        setStatus(orderStatus);

        if (orderStatus === CoinbaseOnrampStatus.Completed) {
          stopPolling();
          // Brief delay so the user sees the success state before auto-close
          setTimeout(() => window.close(), 1500);
        } else if (orderStatus === CoinbaseOnrampStatus.Failed) {
          stopPolling();
          setError("Payment failed. You can close this window and try again.");
        }
      } catch (err) {
        console.error("Failed to poll order status:", err);
        // Don't stop polling on transient errors
      }
    };

    // Immediate first poll
    poll();

    // Subsequent polls
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    // Timeout
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setError("Payment timed out. Please close this window and try again.");
      setStatus(CoinbaseOnrampStatus.Failed);
    }, PAYMENT_TIMEOUT_MS);

    return () => stopPolling();
  }, [orderId, stopPolling]);

  if (!paymentLink || !orderId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F1410] text-foreground-300">
        <p>Missing payment information.</p>
      </div>
    );
  }

  const isCompleted = status === CoinbaseOnrampStatus.Completed;
  const isFailed = status === CoinbaseOnrampStatus.Failed;

  return (
    <div className="flex flex-col h-screen bg-[#0F1410]">
      {/* Status bar */}
      {(isCompleted || isFailed) && (
        <div
          className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium ${
            isCompleted
              ? "bg-[#1a2e1a] text-[#4ade80]"
              : "bg-[#2e1a1a] text-[#f87171]"
          }`}
        >
          {isCompleted ? (
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

      {/* Iframe */}
      <div className="flex-1 relative">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0F1410] z-10">
            <SpinnerIcon className="animate-spin" size="lg" />
          </div>
        )}
        <iframe
          src={paymentLink}
          className="h-full w-full border-none"
          allow="payment"
          title="Coinbase Onramp"
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
    </div>
  );
}
