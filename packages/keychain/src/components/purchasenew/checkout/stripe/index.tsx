import { Elements } from "@stripe/react-stripe-js";
import { type Appearance } from "@stripe/stripe-js";
import CheckoutForm from "./form";
import { useNavigation, usePurchaseContext } from "@/context";
import { useEffect } from "react";

export function StripeCheckout() {
  const { stripePromise, clientSecret, costDetails, clearError } =
    usePurchaseContext();
  const { navigate } = useNavigation();

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const appearance = {
    theme: "flat",
    variables: {
      colorBackground: "#1E221F",
      colorText: "#505050",
      colorTextPlaceholder: "#505050",
      borderRadius: "4px",
      focusBoxShadow: "none",
    },
    rules: {
      ".Input": {
        border: "1px solid #242824",
        color: "#FFFFFF",
        padding: "14px",
      },
    },
  } as Appearance;

  return (
    <Elements
      options={{ clientSecret, appearance, loader: "auto" }}
      stripe={stripePromise}
    >
      <CheckoutForm
        cost={costDetails!}
        onComplete={() => navigate("/purchase/success", { reset: true })}
      />
    </Elements>
  );
}
