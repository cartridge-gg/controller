import { useCallback, useMemo, useState } from "react";
import { useConnection } from "../connection";
import { constants } from "starknet";
import { loadStripe } from "@stripe/stripe-js";
import { client } from "@/utils/graphql";
import {
  CreateStripePaymentIntentDocument,
  CreateStripePaymentIntentMutation,
  CreateStripeStarterpackIntentDocument,
  CreateStripeStarterpackIntentInput,
  CreateStripeStarterpackIntentMutation,
  StripePaymentDocument,
  StripePaymentQuery,
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

  const createStarterpackPaymentIntent = useCallback(
    async (input: CreateStripeStarterpackIntentInput) => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsLoading(true);
        setError(null);
        const result =
          await client.request<CreateStripeStarterpackIntentMutation>(
            CreateStripeStarterpackIntentDocument,
            {
              input: {
                ...input,
                isMainnet: isLiveMode,
              },
            },
          );

        return result.createStripeStarterpackIntent;
      } catch (e) {
        setError(e as Error);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [controller, isLiveMode],
  );

  const waitForPayment = useCallback(async (paymentIntentId: string) => {
    const MAX_WAIT_TIME = 60 * 1000; // 1 minute
    const POLL_INTERVAL = 3000; // 3 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_WAIT_TIME) {
      const result = await client.request<StripePaymentQuery>(
        StripePaymentDocument,
        { id: paymentIntentId },
      );

      const payment = result.stripePayment;
      if (!payment) {
        throw new Error("Payment not found");
      }

      switch (payment.paymentStatus) {
        case "SUCCEEDED":
          return payment;
        case "FAILED":
          throw new Error(`Payment failed, ref id: ${paymentIntentId}`);
        case "PENDING":
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          break;
      }
    }

    throw new Error(
      `Payment confirmation timed out after 1 minute, ref id: ${paymentIntentId}`,
    );
  }, []);

  return {
    isLoading,
    error,
    stripePromise,
    createPaymentIntent,
    createStarterpackPaymentIntent,
    waitForPayment,
  };
};

export default useStripePayment;
