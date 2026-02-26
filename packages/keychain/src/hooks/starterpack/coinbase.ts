import { useState, useCallback, useRef, useEffect } from "react";
import {
  CoinbaseOnrampTransactionsDocument,
  CoinbaseOnrampTransactionsQuery,
  CreateCoinbaseLayerswapOrderDocument,
  CreateCoinbaseLayerswapOrderMutation,
  CoinbaseOnRampQuoteDocument,
  CoinbaseOnRampQuoteQuery,
  CoinbaseOnRampOrderDocument,
  CoinbaseOnRampOrderQuery,
  CoinbaseOnrampStatus,
} from "@cartridge/ui/utils/api/cartridge";
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

export interface CreateOrderInput {
  purchaseUSDCAmount: string;
}

export interface CoinbaseQuoteInput {
  purchaseUSDCAmount: string;
  sandbox?: boolean;
}

/** Tight polling interval after popup reports success (1 second) */
const CONFIRMATION_POLL_INTERVAL_MS = 1_000;
/** Timeout for the confirmation poll after popup reports success (15 seconds) */
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

  // Actions
  createOrder: (input: CreateOrderInput) => Promise<CoinbaseOrderResult>;
  getTransactions: (username: string) => Promise<CoinbaseTransactionResult[]>;
  getQuote: (input: CoinbaseQuoteInput) => Promise<CoinbaseQuoteResult>;
  openPaymentPopup: (opts?: { paymentLink?: string; orderId?: string }) => void;
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

/**
 * Hook for managing Coinbase onramp functionality.
 *
 * After creating an order, call `openPaymentPopup()` to open the Coinbase
 * payment link in a new browser popup. The popup relays Coinbase postMessage
 * events back to the keychain via BroadcastChannel. When the popup reports
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

  // Refs for managing the popup and channel lifecycle
  const popupRef = useRef<Window | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const popupCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Whether a terminal status has been reached (prevents popup-closed from overriding) */
  const terminalReachedRef = useRef(false);

  /** Clean up BroadcastChannel, popup watcher, and confirmation poll */
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.close();
      channelRef.current = null;
    }
    if (popupCheckRef.current) {
      clearInterval(popupCheckRef.current);
      popupCheckRef.current = null;
    }
    if (confirmPollRef.current) {
      clearInterval(confirmPollRef.current);
      confirmPollRef.current = null;
    }
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => cleanup, [cleanup]);

  /**
   * After the popup reports polling_success, poll the backend every 1s
   * until status === Completed (to get the txHash). Times out after 15s.
   */
  const startConfirmationPoll = useCallback(
    (targetOrderId: string) => {
      // Avoid duplicate polls
      if (confirmPollRef.current) return;

      const poll = async () => {
        try {
          const result = await getCoinbaseOrderStatus(targetOrderId);

          if (result.txHash) {
            setOrderTxHash(result.txHash);
          }

          if (result.status === CoinbaseOnrampStatus.Completed) {
            setOrderStatus(CoinbaseOnrampStatus.Completed);
            terminalReachedRef.current = true;
            if (confirmPollRef.current) {
              clearInterval(confirmPollRef.current);
              confirmPollRef.current = null;
            }
            if (confirmTimeoutRef.current) {
              clearTimeout(confirmTimeoutRef.current);
              confirmTimeoutRef.current = null;
            }
          } else if (result.status === CoinbaseOnrampStatus.Failed) {
            setOrderStatus(CoinbaseOnrampStatus.Failed);
            terminalReachedRef.current = true;
            if (confirmPollRef.current) {
              clearInterval(confirmPollRef.current);
              confirmPollRef.current = null;
            }
            if (confirmTimeoutRef.current) {
              clearTimeout(confirmTimeoutRef.current);
              confirmTimeoutRef.current = null;
            }
            onError?.(new Error("Coinbase order failed."));
          }
        } catch (err) {
          console.error(
            "Failed to poll Coinbase order status for confirmation:",
            err,
          );
          // Don't stop on transient errors
        }
      };

      // Immediate first poll
      poll();

      // Subsequent polls
      confirmPollRef.current = setInterval(poll, CONFIRMATION_POLL_INTERVAL_MS);

      // Timeout: if status never reaches Completed, treat as fatal
      confirmTimeoutRef.current = setTimeout(() => {
        if (confirmPollRef.current) {
          clearInterval(confirmPollRef.current);
          confirmPollRef.current = null;
        }
        if (!terminalReachedRef.current) {
          setOrderStatus(CoinbaseOnrampStatus.Failed);
          terminalReachedRef.current = true;
          onError?.(
            new Error(
              "Payment confirmation timed out. Your card may have been charged — please contact support.",
            ),
          );
        }
      }, CONFIRMATION_TIMEOUT_MS);
    },
    [onError],
  );

  /** Open the payment link in a popup and listen via BroadcastChannel */
  const openPaymentPopup = useCallback(
    (opts?: { paymentLink?: string; orderId?: string }) => {
      const targetPaymentLink = opts?.paymentLink ?? paymentLink;
      const targetOrderId = opts?.orderId ?? orderId;
      if (!targetPaymentLink || !targetOrderId) return;

      // Reset state for a new popup session
      setPopupClosed(false);
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

      // Listen for events from the popup via BroadcastChannel
      const channel = new BroadcastChannel(`coinbase-payment-${targetOrderId}`);
      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent) => {
        const { type, data } = event.data as {
          type: string;
          data?: { errorCode?: string; errorMessage?: string };
        };

        console.log("[coinbase-hook] BroadcastChannel event:", type, data);

        switch (type) {
          case "onramp_api.polling_success":
            // Popup reports success — start tight backend poll for txHash
            startConfirmationPoll(targetOrderId);
            break;

          case "onramp_api.polling_error":
          case "onramp_api.commit_error":
          case "onramp_api.load_error":
            setOrderStatus(CoinbaseOnrampStatus.Failed);
            terminalReachedRef.current = true;
            onError?.(
              new Error(data?.errorMessage || "Coinbase payment failed."),
            );
            break;

          case "onramp_api.cancel":
            setOrderStatus(CoinbaseOnrampStatus.Failed);
            terminalReachedRef.current = true;
            onError?.(new Error("Payment was cancelled."));
            break;
        }
      };

      // Watch for the popup being closed by the user
      popupCheckRef.current = setInterval(() => {
        if (popup && popup.closed) {
          if (popupCheckRef.current) {
            clearInterval(popupCheckRef.current);
            popupCheckRef.current = null;
          }
          // Only flag as closed if no terminal status has been reached
          if (!terminalReachedRef.current) {
            setPopupClosed(true);
          }
        }
      }, 1000);
    },
    [paymentLink, orderId, cleanup, startConfirmationPoll, onError],
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
    createOrder,
    getTransactions,
    getQuote,
    openPaymentPopup,
  };
}
