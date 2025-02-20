import { ErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import {
  AppleIcon,
  Button,
  Card,
  CardDescription,
  CheckIcon,
  CreditCardIcon,
  DepositIcon,
  InfoIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Separator,
} from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";
import { Elements } from "@stripe/react-stripe-js";
import { type Appearance, loadStripe } from "@stripe/stripe-js";
import { useCallback, useMemo, useState } from "react";
import { AmountSelection } from "./AmountSelection";
import { Balance, BalanceType } from "./Balance";
import CheckoutForm from "./StripeCheckout";
import { DEFAULT_AMOUNT } from "./constants";

const STRIPE_API_PUBKEY =
  "pk_test_51Kr6IXIS6lliDpf33KnwWDtIjRPWt3eAI9CuSLR6Vvc3GxHEwmSU0iszYbUlgUadSRluGKAFphe3JzltyjPAKiBK00al4RAFQu";

enum PurchaseState {
  SELECTION = 0,
  STRIPE_CHECKOUT = 1,
  SUCCESS = 2,
}

type PurchaseCreditsProps = {
  isSlot?: boolean;
  onBack?: () => void;
};

export function PurchaseCredits({ onBack }: PurchaseCreditsProps) {
  const { closeModal, controller } = useConnection();

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
    <LayoutContainer>
      <LayoutHeader
        title={
          "Purchase " +
          (state === PurchaseState.SELECTION ? "Credits" : "Complete")
        }
        icon={
          state === PurchaseState.SELECTION ? (
            <DepositIcon variant="solid" size="lg" />
          ) : (
            <CheckIcon size="lg" />
          )
        }
        onBack={state === PurchaseState.SELECTION ? onBack : undefined}
      />
      <LayoutContent className="gap-6">
        <Balance types={[BalanceType.CREDITS]} />
        {state === PurchaseState.SELECTION && (
          <AmountSelection
            amount={creditsAmount}
            onChange={onAmountChanged}
            lockSelection={isLoading}
            enableCustom
          />
        )}
      </LayoutContent>

      <Separator className="bg-spacer m-1 mx-4" />

      <LayoutFooter className="gap-3">
        {error && (
          <ErrorAlert
            variant="warning"
            title="Purchase Alert"
            description={error.message}
          />
        )}

        <Card className="bg-background-100 border border-background-200 p-3">
          <CardDescription className="flex flex-row items-start justify-center gap-3">
            <InfoIcon size="sm" className="text-foreground-200 flex-shrink-0" />
            <p className="text-foreground-200 font-normal text-xs">
              Credits are used to pay for network activity. They are not tokens
              and cannot be transferred or refunded.
            </p>
          </CardDescription>
        </Card>

        {state === PurchaseState.SUCCESS && isIframe() && (
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        )}
        {state === PurchaseState.SELECTION && (
          <div className="flex flex-row gap-3">
            <Button
              className="flex-1"
              isLoading={isLoading}
              onClick={createPaymentIntent}
            >
              <CreditCardIcon
                size="sm"
                variant="solid"
                className="text-background-100 flex-shrink-0"
              />
              <span>Stripe</span>
            </Button>
            <Button
              className="bg-foreground-100 flex-1"
              isLoading={isLoading}
              onClick={createPaymentIntent}
            >
              <AppleIcon
                size="sm"
                className="text-background-100 flex-shrink-0"
              />
              <span>Apple Pay</span>
            </Button>
          </div>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}
