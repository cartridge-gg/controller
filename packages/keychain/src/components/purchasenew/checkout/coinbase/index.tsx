import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
  Button,
  CoinbaseWalletColorIcon,
  ExternalIcon,
  cn,
} from "@cartridge/ui";
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

type PanelMode =
  | "policies"
  | "status"
  | "verify-form"
  | "verify-pending"
  | "verify-timeout"
  | "verify-active"
  | "verify-inactive";

interface CoinbaseCheckoutProps {
  /** Fires when the flow transitions to the popup-tracking state. Drawer hosts
   * use this to dismiss the drawer so the takeover status view can render. */
  onPopupOpened?: () => void;
  /** Overrides the default navigation back to /purchase/checkout/method. */
  onBack?: () => void;
  /** When true, suppresses the internal "status" panel — the host is
   * responsible for rendering popup status via <CoinbasePopupStatus />. */
  hideStatus?: boolean;
  /** Streams the combined "committing payment" signal (creating order or
   * opening popup) so drawer hosts can block dismissal mid-flight. */
  onLoadingChange?: (loading: boolean) => void;
}

export function CoinbaseCheckout({
  onPopupOpened,
  onBack,
  hideStatus,
  onLoadingChange,
}: CoinbaseCheckoutProps = {}) {
  const {
    paymentLink,
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

    setMode("status");
    setIsOpeningPopup(true);
    try {
      const order = await onCreateCoinbaseOrder({ force: true });
      const nextPaymentLink = order?.coinbaseOrder.paymentLink ?? paymentLink;
      const nextOrderId = order?.coinbaseOrder.orderId;

      if (nextPaymentLink && nextOrderId) {
        openPaymentPopup({
          paymentLink: nextPaymentLink,
          orderId: nextOrderId,
        });
        onPopupOpened?.();
      }
    } catch (err) {
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
    openPaymentPopup,
    fetchCoinbaseLimits,
    onPopupOpened,
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
        <HeaderInner
          title="Coinbase"
          description="Policies"
          icon={<CoinbaseWalletColorIcon size="lg" />}
        />
        <LayoutContent className="p-4 flex flex-col gap-4">
          <div className="bg-[#181C19] border border-background-200 p-4 rounded-[4px] text-xs text-foreground-300">
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
              ? "CHECKING LIMITS…"
              : isCreatingOrder || isOpeningPopup
                ? "LOADING..."
                : "CONTINUE"}
          </Button>
        </LayoutFooter>
      </div>

      {/* Payment Status Screen. Hidden when hosted in a drawer — the drawer
          closes on popup open and the parent renders <CoinbasePopupStatus />
          as a takeover. */}
      {!hideStatus && (
        <div
          className={cn(
            "flex flex-col h-full",
            mode !== "status" && "invisible absolute inset-0 -z-10",
          )}
        >
          <CoinbasePopupStatus />
        </div>
      )}

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
          />
        </div>
      )}

      {/* Verify Pending */}
      {mode === "verify-pending" && (
        <div className="flex flex-col h-full">
          <VerifyPendingPanel />
        </div>
      )}

      {/* Verify Timeout */}
      {mode === "verify-timeout" && (
        <div className="flex flex-col h-full">
          <VerifyTimeoutPanel onClose={handleBackToMethod} />
        </div>
      )}

      {/* Verify Active */}
      {mode === "verify-active" && coinbaseLimits && (
        <div className="flex flex-col h-full">
          <VerifyActivePanel
            limits={coinbaseLimits}
            onContinue={handleContinueAfterActive}
          />
        </div>
      )}

      {/* Verify Inactive */}
      {mode === "verify-inactive" && (
        <div className="flex flex-col h-full">
          <VerifyInactivePanel onClose={handleBackToMethod} />
        </div>
      )}
    </>
  );
}

function PolicyLink({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center w-full justify-between p-3 border border-background-200 rounded-[4px] text-sm text-foreground-100">
        <span className="text-[#DEB06B]">{label}</span>
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
