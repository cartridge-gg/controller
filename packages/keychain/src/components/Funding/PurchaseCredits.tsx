import { Container, Content, Footer } from "components/layout";
import { Button, Divider } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { CheckIcon, CreditsIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { CopyAddress } from "../CopyAddress";
import AmountSelection, { DEFAULT_AMOUNT } from "./AmountSelection";
import { ErrorAlert } from "components/ErrorAlert";
import { useStripePaymentQuery } from "generated/graphql";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, loadStripe } from "@stripe/stripe-js";
import { Balance } from "./Balance";
import CheckoutForm from "./StripeCheckout";

const MAX_RETRIES = 30;
const REFETCH_INTERVAL = 1000;

const stripePromise = loadStripe(
  "pk_test_51Q5aDGGaDnhmCxdPYc5EHKMDInl3Q3dyv5VfSQmXLuaryOszjILKQqx9vGpXj5ypS2mzFcau66907dbaUq7ccSor00QbDDdJyK",
);

const STRIPE_PRODUCTS = (dollarAmount: number) => {
  switch (dollarAmount) {
    case 1:
      return "https://buy.stripe.com/test_8wMg1XgEj5wi3XacMN?client_reference_id="; // $1 Dollar item
    case 5:
      return "https://buy.stripe.com/test_00g3fb73J9My79m288?client_reference_id="; // $5 Dollar item
    case 10:
      return "https://buy.stripe.com/test_28o02Z3Rx8IuctGeUW?client_reference_id="; // $10 Dollar item
    default:
      return "https://buy.stripe.com/test_8wMg1XgEj5wi3XacMN?client_reference_id=";
  }
};

enum PurchaseState {
  SELECTION,
  STRIPE_CHECKOUT,
  SUCCESS,
}

type PurchaseCreditsProps = {
  onBack: () => void;
};

export function PurchaseCredits({ onBack }: PurchaseCreditsProps) {
  const { controller, closeModal } = useConnection();

  const [clientSecret, setClientSecret] = useState("");
  const [state, setState] = useState<PurchaseState>(PurchaseState.SELECTION);
  const [creditsAmount, setCreditsAmount] = useState<number>(DEFAULT_AMOUNT);
  const [referenceId, setReferenceId] = useState<string>(null);
  const [error, setError] = useState<Error>();

  const onAmountChanged = useCallback(
    (amount: number) => setCreditsAmount(amount),
    [setCreditsAmount],
  );

  const createPaymentIntent = useCallback(async () => {
    if (!controller) {
      return;
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_STRIPE_PAYMENT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: creditsAmount,
          username: controller.username,
        }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (e) {
      setError(e);
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

  useStripePaymentQuery(
    { referenceId },
    {
      enabled: !!referenceId && !error,
      refetchInterval: REFETCH_INTERVAL,
      retry: MAX_RETRIES,
      onSuccess: () => setState(PurchaseState.SUCCESS),
      onError: () => {
        setError(
          new Error(
            `Payment not received. Please try again. Reference ID: ${referenceId}`,
          ),
        );
      },
    },
  );

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
      description={<CopyAddress address={controller.address} />}
      Icon={state === PurchaseState.SELECTION ? CreditsIcon : CheckIcon}
      onBack={state === PurchaseState.SELECTION && onBack}
    >
      <Content gap={6}>
        <Balance showBalances={["credits"]} />
        <ErrorAlert
          variant="info"
          title="WHAT ARE CREDITS"
          description="Credits can be debited from your account and used to pay for network activity. They are not tokens and cannot be transferred or refunded."
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

        {state === PurchaseState.SUCCESS && (
          <Button w="full" onClick={closeModal}>
            Close
          </Button>
        )}

        {state === PurchaseState.SELECTION && (
          <>
            <AmountSelection
              amount={creditsAmount}
              onChange={onAmountChanged}
              lockSelection={!!referenceId && !error}
            />
            <Divider my="5px" borderColor="darkGray.900" />

            <Button
              w="full"
              gap="5px"
              colorScheme="colorful"
              onClick={async () => {
                await createPaymentIntent();
                setState(PurchaseState.STRIPE_CHECKOUT);
              }}
            >
              <CreditsIcon fontSize={20} />
              Stripe
            </Button>
          </>
        )}
      </Footer>
    </Container>
  );
}
