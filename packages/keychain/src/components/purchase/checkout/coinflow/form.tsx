import {
  CoinflowCardForm,
  MerchantStyle,
  type CardFormRef,
  type MerchantTheme,
} from "@coinflowlabs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCoinflowRail } from "../rails";
import { Input, Skeleton } from "@cartridge/controller-ui";
import { useControllerTheme } from "@/hooks/connection";
import { useCoinflowCardCheckoutMutation } from "@/utils/api";
import { useIdentityContext } from "@/components/identity/provider";

const COINFLOW_PRIMARY_FALLBACK = "#fbcb4a";
const COINFLOW_COUNTRY = "US";

// Match Coinflow's iframe to the keychain Input component so the card
// fields read as a single form with the surrounding inputs. Pulled from
// @cartridge/controller-ui's default theme + primitives/input.js variants.
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

export interface CoinflowFormHandle {
  submit: () => Promise<void>;
  isSubmitting: boolean;
  isFormValid: boolean;
  error: Error | null;
}

export interface CoinflowFormProps {
  /** Forwards state up to the enclosing shell so it can drive the Pay button. */
  onStateChange?: (state: CoinflowFormHandle) => void;
}

export function CoinflowForm({ onStateChange }: CoinflowFormProps) {
  const {
    intent: coinflowIntent,
    env: coinflowEnv,
    onComplete,
  } = useCoinflowRail();
  const { userData, isIdentityVerified } = useIdentityContext();
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
  const verifiedFirstName = isIdentityVerified
    ? (userData.firstName?.trim() ?? "")
    : "";
  const verifiedLastName = isIdentityVerified
    ? (userData.lastName?.trim() ?? "")
    : "";
  const [firstName, setFirstName] = useState(verifiedFirstName);
  const [lastName, setLastName] = useState(verifiedLastName);
  const [zip, setZip] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isFormReady, setIsFormReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync: cardCheckout } = useCoinflowCardCheckoutMutation();

  // Prove data can arrive after the payment form mounts. Fill blank fields
  // once it is verified, but never overwrite a name the user already edited.
  useEffect(() => {
    if (verifiedFirstName) {
      setFirstName((current) => current || verifiedFirstName);
    }
    if (verifiedLastName) {
      setLastName((current) => current || verifiedLastName);
    }
  }, [verifiedFirstName, verifiedLastName]);

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
          country: COINFLOW_COUNTRY,
          zip,
          address1,
          city,
          state,
        },
      });

      onComplete();
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
    zip,
    address1,
    city,
    state,
    onComplete,
  ]);

  const onCardFormLoad = useCallback(() => setIsFormReady(true), []);

  const isFormValid = useMemo(
    () =>
      isFormReady &&
      !!firstName &&
      !!lastName &&
      !!address1 &&
      !!city &&
      !isSubmitting,
    [isFormReady, firstName, lastName, address1, city, isSubmitting],
  );

  useEffect(() => {
    onStateChange?.({
      submit: handleSubmit,
      isSubmitting,
      isFormValid,
      error,
    });
  }, [onStateChange, handleSubmit, isSubmitting, isFormValid, error]);

  if (!coinflowIntent) {
    return null;
  }

  return (
    <>
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
          <Skeleton className="h-10 w-full rounded" />
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
              name="billing-first-name"
              autoComplete="billing cc-given-name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              name="billing-last-name"
              autoComplete="billing cc-family-name"
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
            name="billing-address-line1"
            autoComplete="billing address-line1"
            placeholder="Address"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
          />
          <div className="flex gap-3">
            <Input
              name="billing-city"
              autoComplete="billing address-level2"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              name="billing-state"
              autoComplete="billing address-level1"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>

        <Input
          name="billing-postal-code"
          autoComplete="billing postal-code"
          placeholder="Postal code"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
      </div>
    </>
  );
}
