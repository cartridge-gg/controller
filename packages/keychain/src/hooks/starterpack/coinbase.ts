import { useState, useCallback } from "react";
import {
  CoinbaseOnrampTransactionsDocument,
  CoinbaseOnrampTransactionsQuery,
  CreateCoinbaseLayerswapOrderDocument,
  CreateCoinbaseLayerswapOrderMutation,
  CoinbaseOnRampQuoteDocument,
  CoinbaseOnRampQuoteQuery,
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

export interface CreateOrderInput {
  purchaseUSDCAmount: string;
}

export interface CoinbaseQuoteInput {
  purchaseUSDCAmount: string;
  sandbox?: boolean;
}

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

  // Actions
  createOrder: (input: CreateOrderInput) => Promise<CoinbaseOrderResult>;
  getTransactions: (username: string) => Promise<CoinbaseTransactionResult[]>;
  getQuote: (input: CoinbaseQuoteInput) => Promise<CoinbaseQuoteResult>;
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

/**
 * Hook for managing Coinbase onramp functionality
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

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsCreatingOrder(true);
        setOrderError(null);

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
    createOrder,
    getTransactions,
    getQuote,
  };
}
