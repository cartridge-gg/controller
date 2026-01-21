import { useState, useCallback } from "react";
import {
  CoinbaseOnrampTransactionsDocument,
  CoinbaseOnrampTransactionsQuery,
  CreateCoinbaseOnRampOrderDocument,
  CreateCoinbaseOnRampOrderMutation,
} from "@cartridge/ui/utils/api/cartridge";
import { request } from "@/utils/graphql";
import Controller from "@/utils/controller";

// Derive types from the actual GraphQL query/mutation results
export type CoinbaseOrderResult =
  CreateCoinbaseOnRampOrderMutation["createCoinbaseOnrampOrder"];
export type CoinbaseTransactionResult =
  CoinbaseOnrampTransactionsQuery["coinbaseOnrampTransactions"]["transactions"][number];

export interface CreateOrderInput {
  purchaseUSDCAmount: string;
}

export interface UseCoinbaseOptions {
  controller: Controller | undefined;
  onError?: (error: Error) => void;
}

export interface UseCoinbaseReturn {
  // State
  orderId: string | undefined;
  paymentLink: string | undefined;
  isCreatingOrder: boolean;
  orderError: Error | null;

  // Actions
  createOrder: (input: CreateOrderInput) => Promise<CoinbaseOrderResult>;
  getTransactions: (username: string) => Promise<CoinbaseTransactionResult[]>;
}

const createCoinbaseOrder = async (
  input: CreateOrderInput,
): Promise<CoinbaseOrderResult> => {
  const result = await request<CreateCoinbaseOnRampOrderMutation>(
    CreateCoinbaseOnRampOrderDocument,
    {
      input: {
        purchaseUSDCAmount: input.purchaseUSDCAmount,
        sandbox: true,
      },
    },
  );

  return result.createCoinbaseOnrampOrder;
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

/**
 * Hook for managing Coinbase onramp functionality
 */
export function useCoinbase({
  controller,
  onError,
}: UseCoinbaseOptions): UseCoinbaseReturn {
  const [orderId, setOrderId] = useState<string | undefined>();
  const [paymentLink, setPaymentLink] = useState<string | undefined>();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<Error | null>(null);

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsCreatingOrder(true);
        setOrderError(null);

        const order = await createCoinbaseOrder(input);

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
    [controller, onError],
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

  return {
    orderId,
    paymentLink,
    isCreatingOrder,
    orderError,
    createOrder,
    getTransactions,
  };
}
