import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { StripePaymentElementOptions } from "@stripe/stripe-js";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  CoinsIcon,
  CopyAddress,
  Button,
  LayoutHeader,
} from "@cartridge/ui-next";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";

type StripeCheckoutProps = {
  creditsAmount: number;
  onBack: () => void;
  onComplete: () => void;
};

export default function StripeCheckout({
  creditsAmount,
  onBack,
  onComplete,
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { controller } = useConnection();

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
    layout: "accordion",
  };

  return (
    <LayoutContainer>
      <LayoutHeader
        title={"Purchase $" + creditsAmount}
        description={
          controller && <CopyAddress address={controller.address()} />
        }
        icon={<CoinsIcon variant="solid" size="lg" />}
        onBack={onBack}
      />
      <LayoutContent className="gap-6">
        <form id="payment-form">
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
            onReady={() => setIsLoading(false)}
            onChange={() => setError(undefined)}
          />
        </form>
      </LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert
            variant="expanded"
            title="Stripe Checkout Error"
            description={error.message}
          />
        )}

        <Button
          isLoading={isLoading}
          disabled={isSubmitting || !stripe || !elements || isLoading}
          onClick={handleSubmit}
        >
          Purchase
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
