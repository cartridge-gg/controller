import {
  Button,
  Card,
  CardContent,
  GiftIcon,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Spinner,
  useUI,
} from "@cartridge/ui-next";
import { LayoutContainer } from "@cartridge/ui-next";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import StripeCheckout from "../funding/purchase/StripeCheckout";
import { useQuery } from "react-query";
import { useConnection } from "@/hooks/connection";
import { ErrorAlert } from "../ErrorAlert";
import { StarterPack } from ".";
import { useStarterPack } from "@/hooks/starterpack";
import { Receiving } from "./receiving";

const enum PurchaseState {
  REVIEW = 0,
  STRIPE_CHECKOUT = 1,
  PENDING = 2,
  SUCCESS = 3,
  BACK = 4,
}

export const PurchaseWithoutBalance = () => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>(
    PurchaseState.REVIEW,
  );
  const [error, setError] = useState<Error>();
  const { closeModal } = useUI();

  const { controller } = useConnection();
  const { price, starterPackItems } = useStarterPack();

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
          credits: price,
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

  // Simulate a purchase
  useEffect(() => {
    if (purchaseState === PurchaseState.PENDING) {
      const timer = setTimeout(() => {
        setPurchaseState(PurchaseState.SUCCESS);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [purchaseState]);

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
          onComplete={() => setPurchaseState(PurchaseState.PENDING)}
          creditsAmount={price}
        />
      </Elements>
    );
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        icon={
          purchaseState === PurchaseState.PENDING ? (
            <Spinner />
          ) : purchaseState === PurchaseState.REVIEW ? (
            <GiftIcon variant="solid" />
          ) : undefined
        }
        title="Purchase Starter Pack"
      />
      <LayoutContent>
        <div className="w-full flex items-center justify-center">
          {isLoading ? (
            <Spinner />
          ) : error ? (
            <ErrorAlert
              variant="warning"
              title="Purchase Alert"
              description={error.message}
            />
          ) : null}
        </div>

        {purchaseState === PurchaseState.PENDING ? (
          <h1 className="text-xs font-semibold text-foreground-400 pb-4">
            Your starter pack is on the way!
          </h1>
        ) : (
          purchaseState === PurchaseState.SUCCESS && (
            <h1 className="text-xs font-semibold text-foreground-400 pb-4">
              Purchase complete
            </h1>
          )
        )}

        {/* Display Receiving component for both PENDING and SUCCESS states */}
        {(purchaseState === PurchaseState.PENDING ||
          purchaseState === PurchaseState.SUCCESS) && (
          <Receiving title="Receiving" items={starterPackItems} />
        )}
      </LayoutContent>
      <LayoutFooter>
        {purchaseState === PurchaseState.PENDING ? (
          <Card>
            <CardContent className="flex items-center justify-center w-full text-sm bg-background-100 border border-background-200 p-2.5 text-foreground-400">
              <Spinner className="mr-2" />
              <span>Confirming on starknet</span>
            </CardContent>
          </Card>
        ) : purchaseState === PurchaseState.SUCCESS ? (
          <Button
            variant="secondary"
            type="button"
            className="w-full"
            onClick={closeModal}
          >
            <span>Close</span>
          </Button>
        ) : (
          <Button type="button" className="w-full" onClick={() => {}}>
            <span>Purchase</span>
          </Button>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
};
