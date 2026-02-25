import { useState, useCallback, useRef } from "react";
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

/** Default timeout for the payment popup (10 minutes) */
const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000;
/** Polling interval for checking order status (5 seconds) */
const POLL_INTERVAL_MS = 5_000;

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
  isPollingOrder: boolean;
  orderStatus: CoinbaseOnrampStatus | undefined;

  // Actions
  createOrder: (input: CreateOrderInput) => Promise<CoinbaseOrderResult>;
  getTransactions: (username: string) => Promise<CoinbaseTransactionResult[]>;
  getQuote: (input: CoinbaseQuoteInput) => Promise<CoinbaseQuoteResult>;
  openPaymentPopup: () => void;
  stopPolling: () => void;
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
 * payment link in a new browser tab/popup. The hook will automatically poll
 * the order status via GraphQL and update `orderStatus`. Polling stops when
 * the order reaches a terminal state (COMPLETED / FAILED) or the timeout
 * elapses.
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
  const [isPollingOrder, setIsPollingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState<
    CoinbaseOnrampStatus | undefined
  >();

  // Refs for managing the polling lifecycle
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupRef = useRef<Window | null>(null);

  /** Clean up polling timers and popup reference */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setIsPollingOrder(false);
  }, []);

  /** Start polling the order status for the current orderId */
  const startPolling = useCallback(
    (targetOrderId: string) => {
      // Avoid duplicate polling
      if (pollIntervalRef.current) return;

      setIsPollingOrder(true);
      setOrderStatus(undefined);

      const poll = async () => {
        try {
          const result = await getCoinbaseOrderStatus(targetOrderId);
          setOrderStatus(result.status);

          // Terminal states – stop polling
          if (
            result.status === CoinbaseOnrampStatus.Completed ||
            result.status === CoinbaseOnrampStatus.Failed
          ) {
            stopPolling();
          }
        } catch (err) {
          console.error("Failed to poll Coinbase order status:", err);
          // Don't stop polling on transient errors
        }
      };

      // Immediate first poll
      poll();

      // Subsequent polls on interval
      pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

      // Timeout – stop polling and close popup after limit
      pollTimeoutRef.current = setTimeout(() => {
        stopPolling();
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }
        setOrderStatus(CoinbaseOnrampStatus.Failed);
        onError?.(new Error("Payment timed out. Please try again."));
      }, PAYMENT_TIMEOUT_MS);
    },
    [stopPolling, onError],
  );

  /** Open the payment link in a popup and begin polling */
  const openPaymentPopup = useCallback(() => {
    if (!paymentLink || !orderId) return;

    // Build the keychain-hosted coinbase page URL
    // The popup runs at the keychain origin (x.cartridge.gg) so the
    // Coinbase iframe inside it will work correctly.
    const keychainOrigin = window.location.origin;
    const popupUrl = new URL("/coinbase", keychainOrigin);
    popupUrl.searchParams.set("paymentLink", paymentLink);
    popupUrl.searchParams.set("orderId", orderId);

    // Open a centered popup (use screen dimensions since we may be in an iframe)
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

    // Start polling for order status in the keychain as well
    startPolling(orderId);

    // Watch for the popup being closed by the user
    const checkClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkClosed);
        // Keep polling briefly to catch last-second completions
      }
    }, 1000);
  }, [paymentLink, orderId, startPolling]);

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsCreatingOrder(true);
        setOrderError(null);
        setOrderStatus(undefined);

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
    [controller, isMainnet, onError],
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
    isPollingOrder,
    orderStatus,
    createOrder,
    getTransactions,
    getQuote,
    openPaymentPopup,
    stopPolling,
  };
}
