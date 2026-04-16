import { useState, useCallback, useRef, useEffect } from "react";
import {
  CoinbaseOnrampLimitsDocument,
  CoinbaseOnrampLimitsQuery,
  CoinbaseOnrampTransactionsDocument,
  CoinbaseOnrampTransactionsQuery,
  CreateCoinbaseLayerswapOrderDocument,
  CreateCoinbaseLayerswapOrderMutation,
  CoinbaseOnRampQuoteDocument,
  CoinbaseOnRampQuoteQuery,
  CoinbaseOnRampOrderDocument,
  CoinbaseOnRampOrderQuery,
  CoinbaseOnrampStatus,
  SubmitCoinbaseLimitsUpgradeDocument,
  SubmitCoinbaseLimitsUpgradeInput,
  SubmitCoinbaseLimitsUpgradeMutation,
} from "@/utils/api";
import { request } from "@/utils/graphql";
import { useConnection } from "../connection";

// Derive types from the actual GraphQL query/mutation results
export type CoinbaseOrderResult =
  CreateCoinbaseLayerswapOrderMutation["createCoinbaseLayerswapOrder"];
export type CoinbaseTransactionResult =
  CoinbaseOnrampTransactionsQuery["coinbaseOnrampTransactions"]["transactions"][number];
export type CoinbaseQuoteResult =
  CoinbaseOnRampQuoteQuery["coinbaseOnrampQuote"];
export type CoinbaseOrderStatusResult =
  CoinbaseOnRampOrderQuery["coinbaseOnrampOrder"];
export type CoinbaseLimitsResult =
  CoinbaseOnrampLimitsQuery["coinbaseOnrampLimits"];

/** Known limit types returned by Coinbase. */
export const LIMIT_TYPE_WEEKLY_SPENDING = "weekly_spending";
export const LIMIT_TYPE_LIFETIME_TRANSACTIONS = "lifetime_transactions";

/** Sentinel for unlimited limit / remaining values. */
export const UNLIMITED_SENTINEL = "-1";

export interface CreateOrderInput {
  purchaseUSDCAmount: string;
}

export interface CoinbaseQuoteInput {
  purchaseUSDCAmount: string;
  sandbox?: boolean;
}

/** Slow fallback poll interval while popup is open (15 seconds) */
const FALLBACK_POLL_INTERVAL_MS = 15_000;
/** Fast poll interval after popup signals success (1 second) */
const CONFIRMATION_POLL_INTERVAL_MS = 1_000;
/** Timeout for the fast confirmation poll after popup reports success (15 seconds) */
const CONFIRMATION_TIMEOUT_MS = 15_000;

export interface UseCoinbaseOptions {
  onError?: (error: Error) => void;
}

export interface UseCoinbaseReturn {
  // State
  orderId: string | undefined;
  paymentLink: string | undefined;
  isCreatingOrder: boolean;
  orderError: Error | null;
  coinbaseQuote: CoinbaseQuoteResult | undefined;
  isFetchingQuote: boolean;
  orderStatus: CoinbaseOnrampStatus | undefined;
  orderTxHash: string | undefined;
  popupClosed: boolean;
  paymentSuccess: boolean;

  // Limits-upgrade state
  limits: CoinbaseLimitsResult | undefined;
  isFetchingLimits: boolean;
  limitsError: Error | null;
  isSubmittingLimitsUpgrade: boolean;

  // Actions
  createOrder: (input: CreateOrderInput) => Promise<CoinbaseOrderResult>;
  getTransactions: (username: string) => Promise<CoinbaseTransactionResult[]>;
  getQuote: (input: CoinbaseQuoteInput) => Promise<CoinbaseQuoteResult>;
  openPaymentPopup: (opts?: { paymentLink?: string; orderId?: string }) => void;
  fetchLimits: () => Promise<CoinbaseLimitsResult | undefined>;
  submitLimitsUpgrade: (
    input: SubmitCoinbaseLimitsUpgradeInput,
  ) => Promise<CoinbaseLimitsResult | undefined>;
}

const createCoinbaseOrder = async (
  input: CreateOrderInput,
  sandbox: boolean = true,
): Promise<CoinbaseOrderResult> => {
  const result = await request<CreateCoinbaseLayerswapOrderMutation>(
    CreateCoinbaseLayerswapOrderDocument,
    {
      input: {
        purchaseUSDCAmount: input.purchaseUSDCAmount,
        sandbox,
      },
    },
  );

  return result.createCoinbaseLayerswapOrder;
};

const getCoinbaseTransactions = async (
  username: string,
): Promise<CoinbaseTransactionResult[]> => {
  const result = await request<CoinbaseOnrampTransactionsQuery>(
    CoinbaseOnrampTransactionsDocument,
    { input: { username, sandbox: true } },
  );

  return result.coinbaseOnrampTransactions.transactions;
};

const getCoinbaseQuote = async (
  input: CoinbaseQuoteInput,
): Promise<CoinbaseQuoteResult> => {
  const result = await request<CoinbaseOnRampQuoteQuery>(
    CoinbaseOnRampQuoteDocument,
    {
      input: {
        purchaseUSDCAmount: input.purchaseUSDCAmount,
        sandbox: input.sandbox,
      },
    },
  );

  return result.coinbaseOnrampQuote;
};

const getCoinbaseOrderStatus = async (
  orderId: string,
): Promise<CoinbaseOrderStatusResult> => {
  const result = await request<CoinbaseOnRampOrderQuery>(
    CoinbaseOnRampOrderDocument,
    { orderId },
  );

  return result.coinbaseOnrampOrder;
};

const getCoinbaseLimits = async (): Promise<CoinbaseLimitsResult> => {
  const result = await request<CoinbaseOnrampLimitsQuery>(
    CoinbaseOnrampLimitsDocument,
    {},
  );
  return result.coinbaseOnrampLimits;
};

const submitCoinbaseLimitsUpgradeRequest = async (
  input: SubmitCoinbaseLimitsUpgradeInput,
): Promise<CoinbaseLimitsResult> => {
  const result = await request<SubmitCoinbaseLimitsUpgradeMutation>(
    SubmitCoinbaseLimitsUpgradeDocument,
    { input },
  );
  return result.submitCoinbaseLimitsUpgrade;
};

/**
 * Pure helper: does the requested Coinbase payment total (USD) exceed the
 * user's weekly or lifetime remaining? Undefined limits are treated as
 * non-exceeding — callers should gate on `limits !== undefined` before relying
 * on a `false` result.
 */
export function exceedsLimit(
  paymentTotalUsd: number,
  limits: CoinbaseLimitsResult | undefined,
): boolean {
  if (!limits) return false;
  const weekly = limits.limits.find(
    (l) => l.limitType === LIMIT_TYPE_WEEKLY_SPENDING,
  );
  const lifetime = limits.limits.find(
    (l) => l.limitType === LIMIT_TYPE_LIFETIME_TRANSACTIONS,
  );

  if (weekly && weekly.remaining !== UNLIMITED_SENTINEL) {
    const remaining = Number(weekly.remaining);
    if (Number.isFinite(remaining) && paymentTotalUsd > remaining) {
      return true;
    }
  }
  if (lifetime && lifetime.remaining !== UNLIMITED_SENTINEL) {
    const remaining = Number(lifetime.remaining);
    if (Number.isFinite(remaining) && remaining <= 0) {
      return true;
    }
  }
  return false;
}

/**
 * Hook for managing Coinbase onramp functionality.
 *
 * After creating an order, call `openPaymentPopup()` to open the Coinbase
 * payment link in a new browser popup. The popup relays Coinbase postMessage
 * events back to the keychain via postMessage. When the popup reports
 * success, the hook polls the backend for a confirmed status and txHash.
 */
export function useCoinbase({
  onError,
}: UseCoinbaseOptions): UseCoinbaseReturn {
  const { controller, isMainnet } = useConnection();
  const [orderId, setOrderId] = useState<string | undefined>();
  const [paymentLink, setPaymentLink] = useState<string | undefined>();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<Error | null>(null);
  const [coinbaseQuote, setCoinbaseQuote] = useState<
    CoinbaseQuoteResult | undefined
  >();
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [orderStatus, setOrderStatus] = useState<
    CoinbaseOnrampStatus | undefined
  >();
  const [orderTxHash, setOrderTxHash] = useState<string | undefined>();
  const [popupClosed, setPopupClosed] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [limits, setLimits] = useState<CoinbaseLimitsResult | undefined>();
  const [isFetchingLimits, setIsFetchingLimits] = useState(false);
  const [limitsError, setLimitsError] = useState<Error | null>(null);
  const [isSubmittingLimitsUpgrade, setIsSubmittingLimitsUpgrade] =
    useState(false);

  // Refs for managing the popup and message lifecycle
  const popupRef = useRef<Window | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null,
  );
  const popupCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Whether a terminal status has been reached (prevents popup-closed from overriding) */
  const terminalReachedRef = useRef(false);

  /** Clean up message listener, popup watcher, and poll */
  const cleanup = useCallback(() => {
    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
    if (popupCheckRef.current) {
      clearInterval(popupCheckRef.current);
      popupCheckRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => cleanup, [cleanup]);

  /** Stop polling and clear timeout */
  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }
  }, []);

  /** Poll backend once — handles terminal statuses */
  const pollOnce = useCallback(
    async (targetOrderId: string) => {
      try {
        const result = await getCoinbaseOrderStatus(targetOrderId);
        console.log(
          "[coinbase-hook] pollOnce result:",
          result.status,
          "txHash:",
          result.txHash,
        );

        if (result.txHash) {
          setOrderTxHash(result.txHash);
        }

        if (result.status === CoinbaseOnrampStatus.Completed) {
          setOrderStatus(CoinbaseOnrampStatus.Completed);
          terminalReachedRef.current = true;
          stopPoll();
          // Close the popup directly via window reference
          console.log(
            "[coinbase-hook] Poll detected completed — closing popup directly",
          );
          popupRef.current?.close();
        } else if (result.status === CoinbaseOnrampStatus.Failed) {
          setOrderStatus(CoinbaseOnrampStatus.Failed);
          terminalReachedRef.current = true;
          stopPoll();
          onError?.(new Error("Coinbase order failed."));
        }
      } catch (err) {
        console.error("Failed to poll Coinbase order status:", err);
        // Don't stop on transient errors
      }
    },
    [onError, stopPoll],
  );

  /** Start slow 15s fallback poll (catches completions if postMessage signal is lost) */
  const startFallbackPoll = useCallback(
    (targetOrderId: string) => {
      if (pollRef.current) return;

      pollRef.current = setInterval(
        () => pollOnce(targetOrderId),
        FALLBACK_POLL_INTERVAL_MS,
      );
    },
    [pollOnce],
  );

  /**
   * Switch to fast 1s poll after popup signals success.
   * Also starts a 15s timeout — if the backend doesn't confirm
   * Completed within this window, treat it as fatal.
   */
  const startConfirmationPoll = useCallback(
    (targetOrderId: string) => {
      // Stop the slow fallback poll
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }

      // Start fast 1s poll
      pollRef.current = setInterval(
        () => pollOnce(targetOrderId),
        CONFIRMATION_POLL_INTERVAL_MS,
      );

      // Start timeout
      if (!confirmTimeoutRef.current) {
        confirmTimeoutRef.current = setTimeout(() => {
          if (!terminalReachedRef.current) {
            stopPoll();
            setOrderStatus(CoinbaseOnrampStatus.Failed);
            terminalReachedRef.current = true;
            onError?.(
              new Error(
                "Payment confirmation timed out. Your card may have been charged — please contact support.",
              ),
            );
          }
        }, CONFIRMATION_TIMEOUT_MS);
      }
    },
    [pollOnce, onError, stopPoll],
  );

  /** Open the payment link in a popup and listen via postMessage */
  const openPaymentPopup = useCallback(
    (opts?: { paymentLink?: string; orderId?: string }) => {
      const targetPaymentLink = opts?.paymentLink ?? paymentLink;
      const targetOrderId = opts?.orderId ?? orderId;
      if (!targetPaymentLink || !targetOrderId) return;

      // Reset state for a new popup session
      setPopupClosed(false);
      setPaymentSuccess(false);
      setOrderStatus(undefined);
      setOrderTxHash(undefined);
      terminalReachedRef.current = false;

      // Clean up any previous session
      cleanup();

      // Build the keychain-hosted coinbase page URL
      const keychainOrigin = window.location.origin;
      const popupUrl = new URL("/coinbase", keychainOrigin);
      popupUrl.searchParams.set("paymentLink", targetPaymentLink);
      popupUrl.searchParams.set("orderId", targetOrderId);

      // Open a centered popup
      const width = 500;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const popup = window.open(
        popupUrl.toString(),
        "coinbase-payment",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
      );
      popupRef.current = popup;

      // Start slow 15s fallback poll (catches completions even if postMessage signal is lost)
      startFallbackPoll(targetOrderId);

      // Listen for events from the popup via postMessage
      const handlePopupMessage = (event: MessageEvent) => {
        // Only handle messages from our origin with the relay flag
        if (event.origin !== keychainOrigin) return;
        if (!event.data?.__coinbase_relay) return;

        const { type, data } = event.data as {
          __coinbase_relay: boolean;
          type: string;
          data?: { errorCode?: string; errorMessage?: string };
        };

        console.log("[coinbase-hook] postMessage event:", type, data);

        switch (type) {
          case "onramp_api.polling_success":
            // Mark terminal immediately so popup-close watcher doesn't interfere
            terminalReachedRef.current = true;
            // Signal success so UI can navigate to bridge screen immediately
            setPaymentSuccess(true);
            // Close the popup directly via window reference
            console.log("[coinbase-hook] Closing popup directly");
            popupRef.current?.close();
            // Switch from 15s fallback to fast 1s poll + 15s timeout
            startConfirmationPoll(targetOrderId);
            break;

          case "onramp_api.polling_error":
          case "onramp_api.load_error":
            // Ignore "not supported" errors — Coinbase falls back to QR code
            // when Apple Pay is unavailable (e.g. Chrome on non-Safari browsers).
            if (data?.errorMessage?.toLowerCase().includes("not supported")) {
              console.warn(
                "[coinbase-hook] Ignoring 'not supported' error (non-terminal):",
                data?.errorMessage,
              );
              break;
            }
            setOrderStatus(CoinbaseOnrampStatus.Failed);
            terminalReachedRef.current = true;
            stopPoll();
            onError?.(
              new Error(data?.errorMessage || "Coinbase payment failed."),
            );
            break;

          case "onramp_api.commit_error":
            // Don't treat as terminal — Coinbase falls back to QR code
            // when Apple Pay is unsupported or fails.
            console.warn(
              "[coinbase-hook] commit_error (non-terminal):",
              data?.errorMessage,
            );
            break;

          case "onramp_api.cancel":
            setOrderStatus(CoinbaseOnrampStatus.Failed);
            terminalReachedRef.current = true;
            stopPoll();
            onError?.(new Error("Payment was cancelled."));
            break;
        }
      };

      window.addEventListener("message", handlePopupMessage);
      messageHandlerRef.current = handlePopupMessage;

      // Watch for the popup being closed by the user
      popupCheckRef.current = setInterval(() => {
        if (popup && popup.closed) {
          console.log(
            "[coinbase-hook] Popup closed detected. terminalReachedRef:",
            terminalReachedRef.current,
          );
          if (popupCheckRef.current) {
            clearInterval(popupCheckRef.current);
            popupCheckRef.current = null;
          }
          if (!terminalReachedRef.current) {
            console.log(
              "[coinbase-hook] No terminal status — stopping poll and setting popupClosed",
            );
            stopPoll();
            setPopupClosed(true);
          } else {
            console.log(
              "[coinbase-hook] Terminal already reached — ignoring popup close",
            );
          }
        }
      }, 1000);
    },
    [
      paymentLink,
      orderId,
      cleanup,
      startFallbackPoll,
      startConfirmationPoll,
      stopPoll,
      onError,
    ],
  );

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsCreatingOrder(true);
        setOrderError(null);
        setOrderStatus(undefined);
        setOrderTxHash(undefined);
        setPopupClosed(false);
        setPaymentSuccess(false);
        terminalReachedRef.current = false;

        // Clean up any previous session
        cleanup();

        const order = await createCoinbaseOrder(input, !isMainnet);

        setOrderId(order.coinbaseOrder.orderId);
        setPaymentLink(order.coinbaseOrder.paymentLink);

        return order;
      } catch (err) {
        const error = err as Error;
        setOrderError(error);
        onError?.(error);
        throw err;
      } finally {
        setIsCreatingOrder(false);
      }
    },
    [controller, isMainnet, onError, cleanup],
  );

  const getTransactions = useCallback(
    async (username: string) => {
      try {
        return await getCoinbaseTransactions(username);
      } catch (err) {
        onError?.(err as Error);
        throw err;
      }
    },
    [onError],
  );

  const getQuote = useCallback(
    async (input: CoinbaseQuoteInput) => {
      try {
        setIsFetchingQuote(true);
        const quote = await getCoinbaseQuote(input);
        setCoinbaseQuote(quote);
        return quote;
      } catch (err) {
        onError?.(err as Error);
        throw err;
      } finally {
        setIsFetchingQuote(false);
      }
    },
    [onError],
  );

  const fetchLimits = useCallback(async () => {
    try {
      setIsFetchingLimits(true);
      setLimitsError(null);
      const next = await getCoinbaseLimits();
      setLimits(next);
      return next;
    } catch (err) {
      const error = err as Error;
      setLimitsError(error);
      onError?.(error);
      return undefined;
    } finally {
      setIsFetchingLimits(false);
    }
  }, [onError]);

  const submitLimitsUpgrade = useCallback(
    async (input: SubmitCoinbaseLimitsUpgradeInput) => {
      try {
        setIsSubmittingLimitsUpgrade(true);
        setLimitsError(null);
        const next = await submitCoinbaseLimitsUpgradeRequest(input);
        setLimits(next);
        return next;
      } catch (err) {
        const error = err as Error;
        setLimitsError(error);
        onError?.(error);
        return undefined;
      } finally {
        setIsSubmittingLimitsUpgrade(false);
      }
    },
    [onError],
  );

  return {
    orderId,
    paymentLink,
    isCreatingOrder,
    orderError,
    coinbaseQuote,
    isFetchingQuote,
    orderStatus,
    orderTxHash,
    popupClosed,
    paymentSuccess,
    limits,
    isFetchingLimits,
    limitsError,
    isSubmittingLimitsUpgrade,
    createOrder,
    getTransactions,
    getQuote,
    openPaymentPopup,
    fetchLimits,
    submitLimitsUpgrade,
  };
}
