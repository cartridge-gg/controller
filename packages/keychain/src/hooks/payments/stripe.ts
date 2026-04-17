import { useCallback, useMemo, useState } from "react";
import { useConnection } from "../connection";
import { constants } from "starknet";
import { loadStripe } from "@stripe/stripe-js";
import { client } from "@/utils/graphql";
import {
  CreateStripePaymentIntentDocument,
  CreateStripePaymentIntentMutation,
} from "@/utils/api";

const useStripePayment = ({ isSlot }: { isSlot?: boolean }) => {
  const { controller } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isLiveMode = useMemo(() => {
    if (isSlot) {
      return true;
    }

    return controller?.chainId() === constants.StarknetChainId.SN_MAIN;
  }, [controller, isSlot]);

  const stripePromise = useMemo(
    () =>
      loadStripe(
        isLiveMode
          ? import.meta.env.VITE_STRIPE_API_PUBKEY_LIVE_MODE
          : import.meta.env.VITE_STRIPE_API_PUBKEY_TEST_MODE,
      ),
    [isLiveMode],
  );

  const createPaymentIntent = useCallback(
    async (wholeCredits: number, teamId?: string, _starterpackId?: string) => {
      void _starterpackId;

      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await client.request<CreateStripePaymentIntentMutation>(
          CreateStripePaymentIntentDocument,
          {
            input: {
              credits: {
                amount: wholeCredits,
                decimals: 0,
              },
              teamId,
              isMainnet: isLiveMode,
            },
          },
        );

        return result.createStripePaymentIntent;
      } catch (e) {
        setError(e as Error);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [controller, isLiveMode],
  );

  return {
    isLoading,
    error,
    stripePromise,
    createPaymentIntent,
  };
};

export default useStripePayment;
