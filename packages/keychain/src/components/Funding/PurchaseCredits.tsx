import { Container, Content, Footer } from "components/layout";
import { Button, Divider } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { CheckIcon, CreditsIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { CopyAddress } from "../CopyAddress";
import base64url from "base64url";
import AmountSelection, { DEFAULT_AMOUNT } from "./AmountSelection";
import { ErrorAlert } from "components/ErrorAlert";
import { useStripePaymentQuery } from "generated/graphql";
import { Balance } from "./Balance";

const MAX_RETRIES = 30;
const REFETCH_INTERVAL = 1000;

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
  PENDING,
  SUCCESS,
}

type PurchaseCreditsProps = {
  onBack: () => void;
};

export function PurchaseCredits({ onBack }: PurchaseCreditsProps) {
  const { controller, closeModal } = useConnection();

  const [state, setState] = useState<PurchaseState>(PurchaseState.PENDING);
  const [dollarAmount, setDollarAmount] = useState<number>(DEFAULT_AMOUNT);
  const [referenceId, setReferenceId] = useState<string>(null);
  const [error, setError] = useState<Error>();

  const onAmountChanged = useCallback(
    (amount: number) => setDollarAmount(amount),
    [setDollarAmount],
  );

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

  return (
    <Container
      title={
        "Purchase " + (state === PurchaseState.PENDING ? "Credits" : "Complete")
      }
      description={<CopyAddress address={controller.address} />}
      Icon={state === PurchaseState.PENDING ? CreditsIcon : CheckIcon}
      onBack={state === PurchaseState.PENDING && onBack}
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

        {state === PurchaseState.PENDING && (
          <>
            <AmountSelection
              amount={dollarAmount}
              onChange={onAmountChanged}
              lockSelection={!!referenceId && !error}
            />
            <Divider my="5px" borderColor="darkGray.900" />

            <Button
              w="full"
              gap="5px"
              colorScheme="colorful"
              isLoading={!!referenceId && !error}
              onClick={() => {
                const refId = crypto.randomUUID();
                const reference = {
                  username: controller.username,
                  uuid: refId,
                };
                setReferenceId(refId);
                setError(null);

                window.open(
                  STRIPE_PRODUCTS(dollarAmount) +
                    base64url(JSON.stringify(reference)),
                  "_blank",
                );
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
