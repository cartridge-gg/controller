import { Container, Content, Footer } from "@/components/layout";
import { useCallback, useMemo, useState } from "react";
import {
  CheckIcon,
  CoinsIcon,
  Button,
  CopyAddress,
  Separator,
} from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { AmountSelection, DEFAULT_AMOUNT } from "./AmountSelection";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { Balance } from "./Balance";
import CheckoutForm from "./StripeCheckout";
import { isIframe } from "@cartridge/utils";

const STRIPE_API_PUBKEY =
  "pk_test_51Kr6IXIS6lliDpf33KnwWDtIjRPWt3eAI9CuSLR6Vvc3GxHEwmSU0iszYbUlgUadSRluGKAFphe3JzltyjPAKiBK00al4RAFQu";

enum PurchaseState {
  SELECTION,
  STRIPE_CHECKOUT,
  SUCCESS,
}

type PurchaseCreditsProps = {
  onBack?: () => void;
};

export function PurchaseCredits({ onBack }: PurchaseCreditsProps) {
  const { controller, closeModal } = useConnection();

  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [state, setState] = useState<PurchaseState>(PurchaseState.SELECTION);
  const [creditsAmount, setCreditsAmount] = useState<number>(DEFAULT_AMOUNT);
  const stripePromise = useMemo(() => loadStripe(STRIPE_API_PUBKEY), []);
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
    <Container
      title={
        "Purchase " +
        (state === PurchaseState.SELECTION ? "Credits" : "Complete")
      }
      description={controller && <CopyAddress address={controller.address} />}
      icon={
        state === PurchaseState.SELECTION ? (
          <CoinsIcon variant="solid" />
        ) : (
          <CheckIcon />
        )
      }
      onBack={state === PurchaseState.SELECTION ? onBack : undefined}
      hideNetwork
    >
      <Content className="gap-6">
        <Balance showBalances={["credits"]} />
        <ErrorAlert
          variant=""
          title="WHAT ARE CREDITS"
          description="Credits can be used to play games or pay for slot deployments. They are not tokens and cannot be transferred or refunded."
          isExpanded
        />
      </Content>

      <Footer>
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
      </Footer>
    </Container>
  );
}
