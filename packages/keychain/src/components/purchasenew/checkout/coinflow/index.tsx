import {
  CoinflowCardForm,
  MerchantStyle,
  type CardFormRef,
  type MerchantTheme,
} from "@coinflowlabs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useControllerTheme } from "@/hooks/connection";
import { useCoinflowCardCheckoutMutation } from "@/utils/api";

const COINFLOW_PRIMARY_FALLBACK = "#fbcb4a";

// Match Coinflow's iframe to the keychain Input component so the card
// fields read as a single form with the surrounding inputs. Pulled from
// @cartridge/ui's default theme + primitives/input.js variants.
const COINFLOW_THEME_BASE = {
  background: "#1e221f",
  backgroundAccent: "#242824",
  backgroundAccent2: "#242824",
  textColor: "#ffffff",
  textColorAccent: "#505050",
  textColorAction: "#ffffff",
  style: MerchantStyle.Sharp,
  fontSize: "12px",
  cardNumberPlaceholder: "Card number",
  expirationPlaceholder: "MM / YY",
  cvvPlaceholder: "CVV",
  showCardIcon: true,
} as const;

export function CoinflowCheckout() {
  const { clearError } = useStarterpackContext();
  const { coinflowIntent, coinflowEnv } = useCreditPurchaseContext();
  const { navigate } = useNavigation();
  const controllerTheme = useControllerTheme();
  const coinflowTheme = useMemo<MerchantTheme>(() => {
    const primary = controllerTheme?.colors?.primary;
    return {
      ...COINFLOW_THEME_BASE,
      primary:
        typeof primary === "string" ? primary : COINFLOW_PRIMARY_FALLBACK,
    };
  }, [controllerTheme]);

  const cardFormRef = useRef<CardFormRef>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("US");
  const [zip, setZip] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isFormReady, setIsFormReady] = useState(false);
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
      const { token, expMonth, expYear } = await cardFormRef.current.tokenize();

      if (!expMonth || !expYear) {
        throw new Error("Card expiration is required");
      }

      await cardCheckout({
        input: {
          coinflowPaymentId: coinflowIntent.id,
          cardToken: token,
          expMonth,
          expYear,
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
    firstName,
    lastName,
    country,
    zip,
    address1,
    city,
    state,
    navigate,
  ]);

  const onCardFormLoad = useCallback(() => setIsFormReady(true), []);

  const isFormValid = useMemo(
    () =>
      isFormReady &&
      !!firstName &&
      !!lastName &&
      !!address1 &&
      !!city &&
      !!country &&
      !isSubmitting,
    [isFormReady, firstName, lastName, address1, city, country, isSubmitting],
  );

  if (!coinflowIntent) {
    return null;
  }

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
          className={`flex flex-col gap-5 ${isFormReady ? "" : "hidden"}`}
          aria-hidden={!isFormReady}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Name on card
            </label>
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
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Card information
            </label>
            <CoinflowCardForm
              ref={cardFormRef}
              merchantId={coinflowIntent.merchantId}
              env={coinflowEnv}
              theme={coinflowTheme}
              onLoad={onCardFormLoad}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs text-foreground-300 font-medium">
              Billing address
            </label>
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
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Country or region
            </label>
            <div className="flex gap-3">
              <Input
                placeholder="Country (ISO 3166-1 alpha-2, e.g. US)"
                value={country}
                onChange={(e) =>
                  setCountry(e.target.value.toUpperCase().slice(0, 2))
                }
                maxLength={2}
              />
              <Input
                placeholder="Postal code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div>
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
