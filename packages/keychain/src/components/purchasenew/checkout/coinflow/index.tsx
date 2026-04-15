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
  Skeleton,
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
  const [country, setCountry] = useState("US");
  const [zip, setZip] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);
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
          country,
          zip,
          address1,
          city,
          state,
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
    country,
    zip,
    address1,
    city,
    state,
    navigate,
  ]);

  if (!coinflowIntent) {
    return null;
  }

  const isFormValid =
    isFormReady &&
    email &&
    firstName &&
    lastName &&
    expMonth &&
    expYear &&
    address1 &&
    city &&
    country &&
    !isSubmitting;

  return (
    <>
      <HeaderInner
        title="Enter Payment Details"
        icon={<CreditCardIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        {/* Keep skeletons in the tree while Coinflow's iframe boots so the
            layout is stable and the user has immediate feedback. The
            CoinflowCardForm is always mounted (just visually hidden) so its
            onLoad can fire. */}
        {!isFormReady && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1 rounded" />
              <Skeleton className="h-10 flex-1 rounded" />
            </div>
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1 rounded" />
              <Skeleton className="h-10 flex-1 rounded" />
            </div>
            <Skeleton className="h-10 w-full rounded" />
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1 rounded" />
              <Skeleton className="h-10 flex-1 rounded" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1 rounded" />
              <Skeleton className="h-10 flex-1 rounded" />
            </div>
          </div>
        )}

        <div
          className={`flex flex-col gap-3 ${isFormReady ? "" : "hidden"}`}
          aria-hidden={!isFormReady}
        >
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
            onLoad={() => setIsFormReady(true)}
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

          <Input
            placeholder="Address"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
          />
          <div className="flex gap-3">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
            <Input
              placeholder="Country (ISO 3166-1 alpha-2, e.g. US)"
              value={country}
              onChange={(e) =>
                setCountry(e.target.value.toUpperCase().slice(0, 2))
              }
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
