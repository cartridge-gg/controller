import { useCallback, useState } from "react";
import { useConnection } from "../connection";
import {
  CoinflowStarterpackIntent,
  CoinflowStarterpackQuote,
  CreateCoinflowStarterpackIntentInput,
  useCoinflowStarterpackQuoteQuery,
  useCreateCoinflowStarterpackIntentMutation,
} from "@/utils/api";

// Re-export generated enums/types for convenience so callers can import
// from one place instead of digging through the generated module.
export {
  CoinflowPaymentStatus,
  PurchaseFulfillmentStatus as CoinflowFulfillmentStatus,
  useCoinflowPaymentQuery,
} from "@/utils/api";
export type {
  CoinflowStarterpackIntent,
  CoinflowStarterpackQuote,
} from "@/utils/api";

const useCoinflowPayment = () => {
  const { controller } = useConnection();
  const [error, setError] = useState<Error | null>(null);

  const isMainnet = controller?.chainId() === "0x534e5f4d41494e"; // SN_MAIN

  const { mutateAsync, isLoading } =
    useCreateCoinflowStarterpackIntentMutation();

  const createIntent = useCallback(
    async (
      input: Omit<CreateCoinflowStarterpackIntentInput, "isMainnet">,
    ): Promise<CoinflowStarterpackIntent> => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setError(null);

        const result = await mutateAsync({
          input: {
            ...input,
            isMainnet,
          },
        });

        return result.createCoinflowStarterpackIntent;
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [controller, isMainnet, mutateAsync],
  );

  return {
    isLoading,
    error,
    createIntent,
    env: isMainnet ? ("prod" as const) : ("sandbox" as const),
  };
};

export default useCoinflowPayment;

// ---------------------------------------------------------------------------
// Quote query
// ---------------------------------------------------------------------------

export interface UseCoinflowStarterpackQuoteParams {
  starterpackId: string | undefined;
  quantity: number;
  registryAddress: string | undefined;
  referral?: string;
  referralGroup?: string;
  clientPercentage?: number;
  enabled?: boolean;
}

/**
 * Polls the backend for the latest Coinflow pricing for a starterpack purchase.
 * Re-fetches automatically when any of the inputs change. The query is disabled
 * unless `enabled` is true and required inputs are present.
 */
export const useCoinflowStarterpackQuote = ({
  starterpackId,
  quantity,
  registryAddress,
  referral,
  referralGroup,
  clientPercentage,
  enabled = true,
}: UseCoinflowStarterpackQuoteParams) => {
  const { controller } = useConnection();
  const isMainnet = controller?.chainId() === "0x534e5f4d41494e"; // SN_MAIN

  const isReady =
    enabled &&
    !!controller &&
    !!starterpackId &&
    !!registryAddress &&
    quantity > 0;

  const result = useCoinflowStarterpackQuoteQuery(
    {
      input: {
        starterpackId: starterpackId ?? "",
        quantity,
        registryAddress: registryAddress ?? "",
        referral,
        referralGroup,
        clientPercentage,
        isMainnet,
      },
    },
    {
      enabled: isReady,
      retry: false,
    },
  );

  return {
    ...result,
    data: result.data?.coinflowStarterpackQuote as
      | CoinflowStarterpackQuote
      | undefined,
  };
};
