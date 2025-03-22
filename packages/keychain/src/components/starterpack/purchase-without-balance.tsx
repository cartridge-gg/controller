import {
  Button,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Spinner,
} from "@cartridge/ui-next";
import { LayoutContainer } from "@cartridge/ui-next";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";
import StripeCheckout from "../funding/StripeCheckout";
import { DEFAULT_AMOUNT } from "../funding/constants";
import { PurchaseWithBalance } from "./purchase-with-balance";
import { useQuery } from "react-query";
import { useConnection } from "@/hooks/connection";
import { ErrorAlert } from "../ErrorAlert";
import { StarterPack } from ".";

const enum PurchaseState {
  REVIEW = 0,
  STRIPE_CHECKOUT = 1,
  SUCCESS = 2,
  BACK = 3,
}

export const PurchaseWithoutBalance = () => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>(
    PurchaseState.REVIEW,
  );
  const [error, setError] = useState<Error>();

  const { controller } = useConnection();

  const stripePromise = useMemo(
    () => loadStripe(import.meta.env.VITE_STRIPE_API_PUBKEY),
    [],
  );

  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#FBCB4A",
      colorBackground: "#161A17",
      focusBoxShadow: "none",
    },
  } as Appearance;

  useQuery({
    queryKey: ["payment"],
    queryFn: async () => {
      const res = await fetch(import.meta.env.VITE_STRIPE_PAYMENT!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: DEFAULT_AMOUNT,
          username: controller?.username(),
        }),
      });
      if (!res.ok) {
        setError(new Error("Payment intent endpoint failure"));
        return;
      }
      const data = await res.json();

      return data;
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setPurchaseState(PurchaseState.STRIPE_CHECKOUT);
      setIsLoading(false);
    },
    onError: (e) => {
      console.error("Payment intent creation failed: ", e);
      setError(e as unknown as Error);
    },
  });

  if (purchaseState === PurchaseState.SUCCESS) {
    return <PurchaseWithBalance />;
  }

  if (purchaseState === PurchaseState.BACK) {
    return <StarterPack />;
  }

  if (purchaseState === PurchaseState.STRIPE_CHECKOUT) {
    return (
      <Elements
        options={{ clientSecret, appearance, loader: "auto" }}
        stripe={stripePromise}
      >
        <StripeCheckout
          onBack={() => setPurchaseState(PurchaseState.BACK)}
          onComplete={() => setPurchaseState(PurchaseState.SUCCESS)}
          creditsAmount={DEFAULT_AMOUNT}
        />
      </Elements>
    );
  }

  return (
    <LayoutContainer>
      <LayoutHeader title="Get Starter Pack" />
      <LayoutContent className="w-full flex items-center justify-center">
        <div className="m-1 mx-6">
          {isLoading && <Spinner />}
          {error && (
            <ErrorAlert
              variant="warning"
              title="Purchase Alert"
              description={error.message}
            />
          )}
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button className="w-full">
          <span>Purchase</span>
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
};
