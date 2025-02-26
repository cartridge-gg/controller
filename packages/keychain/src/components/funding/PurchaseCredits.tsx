import { useCallback, useMemo, useState } from "react";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  CheckIcon,
  CoinsIcon,
  Button,
  CopyAddress,
  Separator,
  LayoutHeader,
} from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { AmountSelection } from "./AmountSelection";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { Balance, BalanceType } from "./Balance";
import CheckoutForm from "./StripeCheckout";
import { isIframe } from "@cartridge/utils";
import { DEFAULT_AMOUNT } from "./constants";

enum PurchaseState {
  SELECTION,
  STRIPE_CHECKOUT,
  SUCCESS,
}

type PurchaseCreditsProps = {
  isSlot?: boolean;
  onBack?: () => void;
};

export function PurchaseCredits({ isSlot, onBack }: PurchaseCreditsProps) {
  const { closeModal, controller } = useConnection();

  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [state, setState] = useState<PurchaseState>(PurchaseState.SELECTION);
  const [creditsAmount, setCreditsAmount] = useState<number>(DEFAULT_AMOUNT);
  const stripePromise = useMemo(
    () => loadStripe(import.meta.env.VITE_STRIPE_API_PUBKEY),
    [],
  );
  const [error, setError] = useState<Error>();

  const onAmountChanged = useCallback(
    (amount: number) => setCreditsAmount(amount),
    [setCreditsAmount],
  );

  const createPaymentIntent = useCallback(async () => {
    if (!controller) {
      return;
    }

    setisLoading(true);

    try {
      const res = await fetch(import.meta.env.VITE_STRIPE_PAYMENT!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: creditsAmount,
          username: controller.username(),
        }),
      });
      if (!res.ok) {
        setError(new Error("Payment intent endpoint failure"));
        return;
      }
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setState(PurchaseState.STRIPE_CHECKOUT);
    } catch (e) {
      setError(e as unknown as Error);
    } finally {
      setisLoading(false);
    }
  }, [controller, creditsAmount]);

  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#FBCB4A",
      colorBackground: "#161A17",
      focusBoxShadow: "none",
    },
  } as Appearance;

  if (state === PurchaseState.STRIPE_CHECKOUT) {
    return (
      <Elements
        options={{ clientSecret, appearance, loader: "auto" }}
        stripe={stripePromise}
      >
        <CheckoutForm
          onBack={() => setState(PurchaseState.SELECTION)}
          onComplete={() => setState(PurchaseState.SUCCESS)}
          creditsAmount={creditsAmount}
        />
      </Elements>
    );
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        title={
          "Purchase " +
          (state === PurchaseState.SELECTION ? "Credits" : "Complete")
        }
        description={
          controller && <CopyAddress address={controller.address()} />
        }
        icon={
          state === PurchaseState.SELECTION ? (
            <CoinsIcon variant="solid" size="lg" />
          ) : (
            <CheckIcon size="lg" />
          )
        }
        onBack={state === PurchaseState.SELECTION ? onBack : undefined}
      />
      <LayoutContent className="gap-6">
        <Balance types={[BalanceType.CREDITS]} />
        <ErrorAlert
          variant=""
          title="WHAT ARE CREDITS"
          description={
            "Credits can be used " +
            (isSlot ? "for slot deployments" : "to play games") +
            ". They are not tokens and cannot be transferred or refunded."
          }
          isExpanded
        />
      </LayoutContent>

      <LayoutFooter>
        {error && (
          <ErrorAlert
            variant="warning"
            title="Purchase Alert"
            description={error.message}
          />
        )}

        {state === PurchaseState.SUCCESS && isIframe() && (
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        )}

        {state === PurchaseState.SELECTION && (
          <>
            <AmountSelection
              amount={creditsAmount}
              onChange={onAmountChanged}
              lockSelection={isLoading}
            />
            <Separator className="bg-spacer m-1" />

            <Button isLoading={isLoading} onClick={createPaymentIntent}>
              Purchase
            </Button>
          </>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}
