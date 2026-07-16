import { useCallback, useState } from "react";
import { useConnection } from "../connection";
import { useFeature } from "../features";
import { useGeoLocation } from "../geo";
import { request } from "@/utils/graphql";
import {
  CoinflowPaymentDocument,
  CoinflowPaymentQuery,
  CoinflowPaymentStatus,
  CoinflowStarterpackIntent,
  CoinflowStarterpackQuote,
  CreateCoinflowStarterpackIntentInput,
  CreditsInput,
  useCoinflowStarterpackQuoteQuery,
  useCreateCoinflowStarterpackIntentMutation,
  useCreateCoinflowCreditsIntentMutation,
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

// Neutral type for the Coinflow intent shape. Every Coinflow intent (bundle,
// credits, future assets) returns the same `{ id, sessionKey, jwtToken,
// merchantId, pricing }` shape and is completed by the same coinflowCardCheckout
// mutation, so rail-level code should depend on this product-agnostic type. The
// `__typename` is dropped so both the starterpack and credits intents are
// assignable to it.
export type CoinflowIntent = Omit<CoinflowStarterpackIntent, "__typename">;

const COINFLOW_US_ONLY_ERROR =
  "Credit card checkout is only available in the United States.";

/**
 * Effective network for everything Coinflow. Coinflow runs in its sandbox
 * (UAT) environment whenever this is false: on non-mainnet chains, or on any
 * chain when the "coinflow-sandbox" feature flag is enabled. The backend
 * derives sandbox from `!isMainnet`, so this one value drives every Coinflow
 * route input, the card form's `env`, and the checkout sandbox warnings.
 */
export const useCoinflowIsMainnet = () => {
  const { isMainnet } = useConnection();
  const sandboxEnabled = useFeature("coinflow-sandbox");
  const isCoinflowMainnet = isMainnet && !sandboxEnabled;
  return {
    isCoinflowMainnet,
    isCoinflowSandbox: !isCoinflowMainnet,
  };
};

const useCoinflowPayment = () => {
  const { controller } = useConnection();
  const { isUS, countryCodeLoaded } = useGeoLocation();
  const [error, setError] = useState<Error | null>(null);

  const { isCoinflowMainnet } = useCoinflowIsMainnet();

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
        if (!countryCodeLoaded || !isUS) {
          throw new Error(COINFLOW_US_ONLY_ERROR);
        }

        const result = await mutateAsync({
          input: {
            ...input,
            isMainnet: isCoinflowMainnet,
          },
        });

        return result.createCoinflowStarterpackIntent;
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [controller, countryCodeLoaded, isUS, isCoinflowMainnet, mutateAsync],
  );

  return {
    isLoading,
    error,
    createIntent,
    env: isCoinflowMainnet ? ("prod" as const) : ("sandbox" as const),
  };
};

export default useCoinflowPayment;

// ---------------------------------------------------------------------------
// Credits top-up intent
// ---------------------------------------------------------------------------

/**
 * Creates a Coinflow intent that funds account credits (rather than a bundle).
 * Returns the same neutral `CoinflowIntent`, completed by the same
 * `coinflowCardCheckout` mutation — only the creating mutation differs. The
 * caller supplies the credit amount as a `CreditsInput` (e.g. `{ amount: usd *
 * 100, decimals: 0 }`); `isMainnet` is derived from the connected controller.
 */
export const useCoinflowCreditsPayment = () => {
  const { controller } = useConnection();
  const { isUS, countryCodeLoaded } = useGeoLocation();
  const [error, setError] = useState<Error | null>(null);

  const { isCoinflowMainnet } = useCoinflowIsMainnet();

  const { mutateAsync, isLoading } = useCreateCoinflowCreditsIntentMutation();

  const createIntent = useCallback(
    async (credits: CreditsInput): Promise<CoinflowIntent> => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setError(null);
        if (!countryCodeLoaded || !isUS) {
          throw new Error(COINFLOW_US_ONLY_ERROR);
        }

        const result = await mutateAsync({
          input: {
            credits,
            isMainnet: isCoinflowMainnet,
          },
        });

        return result.createCoinflowCreditsIntent;
      } catch (e) {
        setError(e as Error);
        throw e;
      }
    },
    [controller, countryCodeLoaded, isUS, isCoinflowMainnet, mutateAsync],
  );

  return {
    isLoading,
    error,
    createIntent,
    env: isCoinflowMainnet ? ("prod" as const) : ("sandbox" as const),
  };
};

// ---------------------------------------------------------------------------
// Settlement polling
// ---------------------------------------------------------------------------

const SETTLEMENT_POLL_INTERVAL_MS = 2_000;

/**
 * Wait for a Coinflow payment to settle. `coinflowCardCheckout` resolves when
 * the card is charged, but credits are only granted by the settlement webhook
 * (credits-unification Phase 3), so a credits top-up must poll
 * `coinflowPayment.paymentStatus` past the checkout step before treating the
 * deposit as landed. Settlement is normally seconds; the timeout error is a
 * soft "still settling" (the charge already succeeded), not a failure.
 */
export async function waitForCoinflowSettlement(
  paymentId: string,
  timeoutMs = 180_000,
): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await request<CoinflowPaymentQuery>(
      CoinflowPaymentDocument,
      { id: paymentId },
    );

    switch (result.coinflowPayment?.paymentStatus) {
      case CoinflowPaymentStatus.Succeeded:
        return;
      case CoinflowPaymentStatus.Failed:
        throw new Error(
          "The card payment failed to settle, so no credits were added. If you were charged, contact support.",
        );
      default:
        await new Promise((resolve) =>
          setTimeout(resolve, SETTLEMENT_POLL_INTERVAL_MS),
        );
    }
  }

  throw new Error(
    "Your payment was accepted but is still settling. Your balance will update automatically once it completes.",
  );
}

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
  const { isUS, countryCodeLoaded } = useGeoLocation();
  const { isCoinflowMainnet } = useCoinflowIsMainnet();

  const isReady =
    enabled &&
    countryCodeLoaded &&
    isUS &&
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
        isMainnet: isCoinflowMainnet,
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
