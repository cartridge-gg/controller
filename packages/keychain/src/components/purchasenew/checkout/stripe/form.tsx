import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { CostDetails } from "../../types";
import {
  Stripe,
  StripeElements,
  StripePaymentElementOptions,
} from "@stripe/stripe-js";
import {
  Button,
  CreditCardIcon,
  HeaderInner,
  Input,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { CostBreakdown } from "../../review/cost";
import { useAccountPrivateQuery } from "@/utils/api";

type CheckoutFormProps = {
  cost: CostDetails;
  lineItemLabel?: string;
  onComplete: () => void;
};

export default function CheckoutForm({
  cost,
  lineItemLabel,
  onComplete,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: accountPrivate } = useAccountPrivateQuery();

  const verifiedFirstName = accountPrivate?.accountPrivate?.firstName ?? "";
  const verifiedLastName = accountPrivate?.accountPrivate?.lastName ?? "";
  const verifiedName =
    verifiedFirstName && verifiedLastName
      ? `${verifiedFirstName} ${verifiedLastName}`
      : "";

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const billingName = verifiedName || name.trim();
    if (!billingName) {
      setError(new Error("Please enter your name."));
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
          payment_method_data: {
            billing_details: {
              name: billingName,
            },
          },
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
      cost={cost}
      lineItemLabel={lineItemLabel}
      stripe={stripe}
      elements={elements}
      error={error}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
    >
      <form id="payment-form" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label style={{ color: "#505050", fontSize: "13px" }}>Name</label>
          <Input
            name="name"
            autoComplete="name"
            placeholder="Full name"
            value={verifiedName || name}
            readOnly={!!verifiedName}
            onChange={
              verifiedName
                ? undefined
                : (e: React.ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                    setError(undefined);
                  }
            }
            type="text"
            className={`focus-visible:border-background-300 focus-visible:bg-background-200 ${verifiedName ? "opacity-70" : ""}`}
          />
        </div>
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
  cost,
  lineItemLabel,
  stripe,
  elements,
  error,
  isLoading,
  isSubmitting,
  children,
  handleSubmit,
}: {
  cost: CostDetails;
  lineItemLabel?: string;
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
      <HeaderInner
        title="Enter Payment Details"
        icon={<CreditCardIcon variant="solid" size="lg" />}
      />
      <LayoutContent>{children}</LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert
            variant="error"
            title="Stripe Checkout Error"
            description={error.message}
          />
        )}
        {!error && (
          <CostBreakdown
            rails="stripe"
            costDetails={cost}
            lineItemLabel={lineItemLabel}
            hideCartridgeFee={true}
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
    </>
  );
};
