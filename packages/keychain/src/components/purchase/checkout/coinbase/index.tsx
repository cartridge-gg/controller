import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
  Button,
  CoinbaseIcon,
  ExternalIcon,
  cn,
} from "@cartridge/controller-ui";
import { useOnchainPurchaseContext } from "@/context";
import { useNavigation } from "@/context";
import {
  CoinbaseLimitUpgradeStatus,
  type SubmitCoinbaseLimitsUpgradeInput,
} from "@/utils/api";
import { exceedsLimit } from "@/hooks/starterpack/coinbase";
import {
  VerifyActivePanel,
  VerifyFormPanel,
  VerifyInactivePanel,
  VerifyPendingPanel,
  VerifyTimeoutPanel,
} from "./limits-verify-panels";
import { CoinbasePopupStatus } from "./popup-status";

/** How often to refresh limits while waiting for a terminal status. */
const VERIFY_POLL_INTERVAL_MS = 5_000;
/** Max time to sit in the pending state before falling back to a timeout message. */
const VERIFY_TIMEOUT_MS = 3 * 60 * 1_000;

export type PanelMode =
  | "policies"
  | "status"
  | "verify-form"
  | "verify-pending"
  | "verify-timeout"
  | "verify-active"
  | "verify-inactive";

interface CoinbaseCheckoutProps {
  /** Overrides the default navigation back to /purchase/checkout/method. */
  onBack?: () => void;
  /** When true, suppresses internal panel headers — the host (e.g. the
   * drawer) renders its own header chrome. */
  hideHeader?: boolean;
  /** Streams the combined "committing payment" signal (creating order or
   * opening popup) so drawer hosts can block dismissal mid-flight. */
  onLoadingChange?: (loading: boolean) => void;
  /** Streams the active panel mode so drawer hosts can update their header
   * chrome to match the current screen. */
  onModeChange?: (mode: PanelMode) => void;
}

export function CoinbaseCheckout({
  onBack,
  hideHeader,
  onLoadingChange,
  onModeChange,
}: CoinbaseCheckoutProps = {}) {
  const {
    paymentLink,
    orderId,
    isCreatingOrder,
    onCreateCoinbaseOrder,
    openPaymentPopup,
    coinbaseQuote,
    coinbaseLimits,
    isFetchingCoinbaseLimits,
    isSubmittingLimitsUpgrade,
    fetchCoinbaseLimits,
    submitCoinbaseLimitsUpgrade,
  } = useOnchainPurchaseContext();
  const { navigate } = useNavigation();

  const [mode, setMode] = useState<PanelMode>("policies");
  const [isOpeningPopup, setIsOpeningPopup] = useState(false);
  /** True once the user has explicitly submitted the verify form in this
   * session. Kept separate from server `upgradeStatus === PENDING` so that we
   * only surface the timeout copy after the user actually did something. */
  const [submittedThisSession, setSubmittedThisSession] = useState(false);

  // Fetch limits once on mount.
  useEffect(() => {
    fetchCoinbaseLimits();
  }, [fetchCoinbaseLimits]);

  useEffect(() => {
    onLoadingChange?.(isCreatingOrder || isOpeningPopup);
  }, [isCreatingOrder, isOpeningPopup, onLoadingChange]);

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const paymentTotalUsd = useMemo(() => {
    const raw = coinbaseQuote?.paymentTotal?.amount;
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [coinbaseQuote]);

  const limitExceeded = useMemo(
    () => exceedsLimit(paymentTotalUsd, coinbaseLimits),
    [paymentTotalUsd, coinbaseLimits],
  );

  const upgradeStatus = coinbaseLimits?.upgradeStatus;
  const hasLimitsLoaded = coinbaseLimits !== undefined;

  // Decide which panel to show based on server-provided status. Local user
  // actions (submit, close, continue) may override this via setMode below.
  useEffect(() => {
    if (!hasLimitsLoaded) return;

    // If the user doesn't exceed the limit, stay on the purchase flow.
    if (!limitExceeded) {
      setMode((prev) =>
        prev === "policies" || prev === "status" ? prev : "policies",
      );
      return;
    }

    switch (upgradeStatus) {
      case CoinbaseLimitUpgradeStatus.Unrequested:
      case CoinbaseLimitUpgradeStatus.Resubmit:
        setMode((prev) =>
          prev === "verify-pending" || prev === "verify-timeout"
            ? prev
            : "verify-form",
        );
        break;
      case CoinbaseLimitUpgradeStatus.Pending:
        setMode((prev) =>
          prev === "verify-timeout" ? prev : "verify-pending",
        );
        break;
      case CoinbaseLimitUpgradeStatus.Active:
        setMode("verify-active");
        break;
      case CoinbaseLimitUpgradeStatus.Inactive:
      case CoinbaseLimitUpgradeStatus.Ineligible:
        setMode("verify-inactive");
        break;
    }
  }, [hasLimitsLoaded, limitExceeded, upgradeStatus]);

  // Eagerly create an order once we know the user isn't blocked by limits.
  useEffect(() => {
    if (!paymentLink && hasLimitsLoaded && !limitExceeded) {
      onCreateCoinbaseOrder();
    }
  }, [paymentLink, hasLimitsLoaded, limitExceeded, onCreateCoinbaseOrder]);

  // Poll limits while waiting for a terminal verify status.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (mode !== "verify-pending") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const interval = setInterval(() => {
      fetchCoinbaseLimits();
    }, VERIFY_POLL_INTERVAL_MS);

    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setMode("verify-timeout");
      }, VERIFY_TIMEOUT_MS);
    }

    return () => {
      clearInterval(interval);
    };
  }, [mode, fetchCoinbaseLimits]);

  // Reset the per-session "submitted" flag once we've fully resolved.
  useEffect(() => {
    if (mode === "policies" || mode === "status") {
      setSubmittedThisSession(false);
    }
  }, [mode]);

  const handleContinue = useCallback(async () => {
    if (isOpeningPopup) return;
    // Refuse to submit until we've resolved limits — the mode-setting effect
    // will flip us into verify-* if the user is actually blocked.
    if (!hasLimitsLoaded || limitExceeded) return;

    // iOS Safari requires window.open() to fire synchronously from the user
    // gesture. onCreateCoinbaseOrder is async and would consume the gesture
    // before we get a payment link, so pre-open at about:blank now and
    // navigate the same window after the order resolves.
    const width = 500;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const preOpenedPopup = window.open(
      "about:blank",
      "coinbase-payment",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    );

    setMode("status");
    setIsOpeningPopup(true);
    try {
      // Don't pass `force` — if `handlePurchase` already pre-created an order
      // and its paymentLink is still fresh, the guard inside
      // `onCreateCoinbaseOrder` short-circuits and we reuse it. The
      // `hasStaleCoinbaseOrder` branch of that guard still creates a new order
      // when the previous one is in a terminal state (popupClosed,
      // paymentSuccess, Completed, Failed).
      const order = await onCreateCoinbaseOrder();
      const nextPaymentLink = order?.coinbaseOrder.paymentLink ?? paymentLink;
      const nextOrderId = order?.coinbaseOrder.orderId ?? orderId;

      if (nextPaymentLink && nextOrderId) {
        openPaymentPopup({
          paymentLink: nextPaymentLink,
          orderId: nextOrderId,
          preOpenedPopup,
        });
      } else if (preOpenedPopup && !preOpenedPopup.closed) {
        preOpenedPopup.close();
      }
    } catch (err) {
      if (preOpenedPopup && !preOpenedPopup.closed) {
        preOpenedPopup.close();
      }
      // Coinbase can still reject after we pass our local check — for example,
      // if /limits came back stale. Re-fetch limits so the mode-setting effect
      // can transition to the verify flow on the next render.
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.includes("guest_transaction_count") ||
        message.includes("guest_transaction_limit")
      ) {
        await fetchCoinbaseLimits();
      }
      setMode("policies");
    } finally {
      setIsOpeningPopup(false);
    }
  }, [
    isOpeningPopup,
    hasLimitsLoaded,
    limitExceeded,
    onCreateCoinbaseOrder,
    paymentLink,
    orderId,
    openPaymentPopup,
    fetchCoinbaseLimits,
  ]);

  const handleVerifySubmit = useCallback(
    async (input: SubmitCoinbaseLimitsUpgradeInput) => {
      const next = await submitCoinbaseLimitsUpgrade(input);
      if (!next) return;
      setSubmittedThisSession(true);
      // Don't rely solely on the next server status — if Coinbase returns
      // pending/unrequested/resubmit, flip to the waiting panel so the poller
      // takes over. ACTIVE/INACTIVE are handled by the status-driven effect.
      setMode("verify-pending");
    },
    [submitCoinbaseLimitsUpgrade],
  );

  const handleBackToMethod = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    navigate("/purchase/checkout/method");
  }, [navigate, onBack]);

  const handleContinueAfterActive = useCallback(() => {
    // Refresh limits so exceedsLimit recomputes with upgraded remaining, then
    // the mode effect will flip us back to policies.
    fetchCoinbaseLimits();
    setMode("policies");
  }, [fetchCoinbaseLimits]);

  const waitingForLimits = !hasLimitsLoaded && isFetchingCoinbaseLimits;

  return (
    <>
      {/* Limits check in flight: brief spinner before we know what to show. */}
      <div
        className={cn(
          "flex flex-col h-full items-center justify-center gap-4",
          !waitingForLimits && "hidden",
        )}
      >
        <SpinnerIcon className="animate-spin" size="lg" />
      </div>

      {/* Policies Screen */}
      <div
        className={cn(
          "flex flex-col h-full",
          (mode !== "policies" || waitingForLimits) && "hidden",
        )}
      >
        {!hideHeader && (
          <HeaderInner
            title="Coinbase Policies"
            icon={<CoinbaseIcon size="lg" />}
          />
        )}
        <LayoutContent className="p-3 flex flex-col gap-4">
          <div className="bg-[#181C19] border border-background-200 p-3 rounded-[4px] text-xs text-foreground-300">
            By clicking 'Continue' you are agreeing to the following Coinbase
            policies.
          </div>

          <div className="flex flex-col gap-3">
            <PolicyLink
              label="Guest Checkout Terms of Service"
              href="https://www.coinbase.com/legal/guest-checkout/us"
            />
            <PolicyLink
              label="User Agreement"
              href="https://www.coinbase.com/legal/user_agreement"
            />
            <PolicyLink
              label="Privacy Policy"
              href="https://www.coinbase.com/legal/privacy"
            />
          </div>
        </LayoutContent>
        <LayoutFooter>
          <Button
            className="w-full"
            onClick={handleContinue}
            disabled={
              !hasLimitsLoaded ||
              isFetchingCoinbaseLimits ||
              isCreatingOrder ||
              isOpeningPopup
            }
          >
            {!hasLimitsLoaded || isFetchingCoinbaseLimits
              ? "CHECKING LIMITS"
              : isCreatingOrder || isOpeningPopup
                ? "LOADING..."
                : "CONTINUE"}
          </Button>
        </LayoutFooter>
      </div>

      {/* Payment Status Screen — rendered as another internal panel so the
          host (e.g. the Coinbase drawer) keeps the same chrome across the
          policies → popup-status transition. */}
      <div
        className={cn(
          "flex flex-col h-full",
          mode !== "status" && "invisible absolute inset-0 -z-10",
        )}
      >
        <CoinbasePopupStatus
          hideHeader={hideHeader}
          onBack={() => setMode("policies")}
        />
      </div>

      {/* Verify Form */}
      {mode === "verify-form" && coinbaseLimits && (
        <div className="flex flex-col h-full">
          <VerifyFormPanel
            limits={coinbaseLimits}
            isResubmit={
              upgradeStatus === CoinbaseLimitUpgradeStatus.Resubmit ||
              submittedThisSession
            }
            isSubmitting={isSubmittingLimitsUpgrade}
            onSubmit={handleVerifySubmit}
            hideHeader={hideHeader}
          />
        </div>
      )}

      {/* Verify Pending */}
      {mode === "verify-pending" && (
        <div className="flex flex-col h-full">
          <VerifyPendingPanel hideHeader={hideHeader} />
        </div>
      )}

      {/* Verify Timeout */}
      {mode === "verify-timeout" && (
        <div className="flex flex-col h-full">
          <VerifyTimeoutPanel
            onClose={handleBackToMethod}
            hideHeader={hideHeader}
          />
        </div>
      )}

      {/* Verify Active */}
      {mode === "verify-active" && coinbaseLimits && (
        <div className="flex flex-col h-full">
          <VerifyActivePanel
            limits={coinbaseLimits}
            onContinue={handleContinueAfterActive}
            hideHeader={hideHeader}
          />
        </div>
      )}

      {/* Verify Inactive */}
      {mode === "verify-inactive" && (
        <div className="flex flex-col h-full">
          <VerifyInactivePanel
            onClose={handleBackToMethod}
            hideHeader={hideHeader}
          />
        </div>
      )}
    </>
  );
}

function PolicyLink({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center w-full justify-between p-3 border border-background-200 rounded-[4px] text-sm text-foreground-100">
        {label}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-[4px] border border-background-200 hover:bg-background-200 transition-colors"
      >
        <ExternalIcon size="sm" className="text-foreground-300" />
      </a>
    </div>
  );
}
