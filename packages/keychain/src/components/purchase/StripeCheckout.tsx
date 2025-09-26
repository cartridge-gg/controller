import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Stripe,
  StripeElements,
  StripePaymentElementOptions,
} from "@stripe/stripe-js";
import { LayoutContent, LayoutFooter, Button } from "@cartridge/ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { PricingDetails } from ".";
import { CostBreakdown } from "./CostBreakdown";

type StripeCheckoutProps = {
  price: PricingDetails;
  onComplete: () => void;
};

export default function StripeCheckout({
  price,
  onComplete,
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    try {
      // On puchase, some forms of payment like banks requires redirection, then on success stripe
      // will use return_url. However, we should NEVER redirect as we're in an iframe and UX would be
      // terrible. So we have turned off all forms of payment that requires redirection allowing us to
      // handle on success/complete synchronously.
      const res = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "http://cartridge.gg",
        },
        redirect: "if_required",
      });

      if (res.error) {
        if (res.error.type === "validation_error") {
          return;
        }

        setError(new Error(res.error.message));
        return;
      }

      onComplete();
    } catch (e) {
      // Catch redirects, 'allow-top-navigation' is not set on our iframe
      if ((e as Error).message.includes("Failed to set the 'href' property")) {
        setError(new Error("Payment unsupported"));
        return;
      }

      setError(e as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
  };

  return (
    <StripeCheckoutContainer
      price={price}
      stripe={stripe}
      elements={elements}
      error={error}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
    >
      <form id="payment-form">
        <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
          onReady={() => setIsLoading(false)}
          onChange={() => setError(undefined)}
        />
      </form>
    </StripeCheckoutContainer>
  );
}

export const StripeCheckoutContainer = ({
  price,
  stripe,
  elements,
  error,
  isLoading,
  isSubmitting,
  children,
  handleSubmit,
}: {
  price: PricingDetails;
  stripe: Stripe | null;
  elements: StripeElements | null;
  error: Error | undefined;
  isLoading: boolean;
  isSubmitting: boolean;
  children: React.ReactNode;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}) => {
  return (
    <>
      <LayoutContent>{children}</LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert
            variant="error"
            title="Stripe Checkout Error"
            description={error.message}
          />
        )}
        {!error && <CostBreakdown rails="stripe" price={price} />}
        <Button
          isLoading={isLoading}
          disabled={isSubmitting || !stripe || !elements || isLoading}
          onClick={handleSubmit}
        >
          Purchase
        </Button>
      </LayoutFooter>
    </>
  );
};
