import { useCallback, useState } from "react";
import { useConnection } from "../connection";
import {
  PurchaseBundleWithCreditsInput,
  useBundleCreditsQuoteQuery,
  usePurchaseBundleWithCreditsMutation,
} from "@/utils/api";
import type { PurchaseBundleWithCreditsMutation } from "@/utils/api";

// Re-export generated types/hooks for convenience so callers can import
// from one place instead of digging through the generated module.
export {
  PurchaseFulfillmentStatus,
  usePurchaseFulfillmentQuery,
} from "@/utils/api";
export type { BundleCreditsQuote, PurchaseFulfillment } from "@/utils/api";

export type CreditsBundleFulfillment =
  PurchaseBundleWithCreditsMutation["purchaseBundleWithCredits"];

/**
 * Spend the account's credit balance to purchase a starterpack bundle. The
 * backend debits the credits synchronously and returns a PurchaseFulfillment
 * (QUEUED) to poll via usePurchaseFulfillmentQuery; credits are refunded
 * automatically if fulfillment terminally fails.
 */
const useCreditsPayment = () => {
  const { controller, isMainnet } = useConnection();
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync, isLoading } = usePurchaseBundleWithCreditsMutation();

  const purchaseBundle = useCallback(
    async (
      input: Omit<PurchaseBundleWithCreditsInput, "isMainnet">,
    ): Promise<CreditsBundleFulfillment> => {
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

        return result.purchaseBundleWithCredits;
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
    purchaseBundle,
  };
};

export default useCreditsPayment;

// ---------------------------------------------------------------------------
// Quote query
// ---------------------------------------------------------------------------

export interface UseBundleCreditsQuoteParams {
  starterpackId: string | undefined;
  quantity: number;
  registryAddress: string | undefined;
  referral?: string;
  referralGroup?: string;
  clientPercentage?: number;
  enabled?: boolean;
}

/**
 * Quotes a bundle purchase paid from the account's credit balance. Uses the
 * exact same backend pricing path as the purchase mutation, so the displayed
 * credit cost always matches what gets debited. The backend also gates which
 * registries/bundles may be bought with credits: unapproved ones reject with
 * PermissionDenied, surfaced here via `error` — display its message and treat
 * credits as unavailable for the bundle.
 */
export const useBundleCreditsQuote = ({
  starterpackId,
  quantity,
  registryAddress,
  referral,
  referralGroup,
  clientPercentage,
  enabled = true,
}: UseBundleCreditsQuoteParams) => {
  const { controller, isMainnet } = useConnection();

  const isReady =
    enabled &&
    !!controller &&
    !!starterpackId &&
    !!registryAddress &&
    quantity > 0;

  const result = useBundleCreditsQuoteQuery(
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
    data: result.data?.bundleCreditsQuote,
  };
};
