import { CoinflowCardForm } from "@coinflowlabs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useNavigation,
  useStarterpackContext,
  useCreditPurchaseContext,
} from "@/context";
import {
  Button,
  HeaderInner,
  CreditCardIcon,
  Input,
  LayoutContent,
  LayoutFooter,
  Spinner,
} from "@cartridge/ui";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { useCoinflowCardCheckoutMutation } from "@/utils/api";

export function CoinflowCheckout() {
  const { clearError } = useStarterpackContext();
  const { coinflowIntent, coinflowEnv } = useCreditPurchaseContext();
  const { navigate } = useNavigation();

  const cardFormRef = useRef<{ tokenize: () => Promise<{ token: string }> }>(
    null,
  );
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync: cardCheckout } = useCoinflowCardCheckoutMutation();

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const handleSubmit = useCallback(async () => {
    if (!coinflowIntent || !cardFormRef.current) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const { token } = await cardFormRef.current.tokenize();

      await cardCheckout({
        input: {
          coinflowPaymentId: coinflowIntent.id,
          cardToken: token,
          expMonth,
          expYear,
          email,
          firstName,
          lastName,
        },
      });

      navigate("/purchase/success", { reset: true });
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Payment failed"));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    coinflowIntent,
    cardCheckout,
    expMonth,
    expYear,
    email,
    firstName,
    lastName,
    navigate,
  ]);

  if (!coinflowIntent) {
    return null;
  }

  const isFormValid =
    email && firstName && lastName && expMonth && expYear && !isSubmitting;

  return (
    <>
      <HeaderInner
        title="Enter Payment Details"
        icon={<CreditCardIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Input
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <CoinflowCardForm
            ref={cardFormRef}
            merchantId={coinflowIntent.merchantId}
            env={coinflowEnv}
          />

          <div className="flex gap-3">
            <Input
              placeholder="MM"
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value.slice(0, 2))}
              maxLength={2}
            />
            <Input
              placeholder="YY"
              value={expYear}
              onChange={(e) => setExpYear(e.target.value.slice(0, 2))}
              maxLength={2}
            />
          </div>
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error && <ControllerErrorAlert error={error} />}
        <Button onClick={handleSubmit} disabled={!isFormValid}>
          {isSubmitting ? <Spinner /> : "Pay"}
        </Button>
      </LayoutFooter>
    </>
  );
}
