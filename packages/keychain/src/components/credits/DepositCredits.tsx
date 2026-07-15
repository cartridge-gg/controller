import { useEffect, useMemo, useState } from "react";
import { useGeoLocation } from "@/hooks/geo";
import {
  WalletSelectionDrawer,
  type PaymentMethodSelection,
} from "@/components/purchase/checkout/onchain/wallet-drawer";
import { AmountSelectionDrawer } from "./AmountSelectionDrawer";
import { Checkout } from "./Checkout";
import { useCreditsContext } from "./provider";
import { useConnection } from "@/hooks/connection";
import {
  MIN_CREDITS_PURCHASE_USD,
  MAX_CREDITS_PURCHASE_USD,
} from "@/utils/credits";

interface DepositCreditsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositCredits({ isOpen, onClose }: DepositCreditsProps) {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodSelection | null>(null);
  const [amount, setAmount] = useState(0);
  const { depositInProgress, depositRequest } = useCreditsContext();
  const { defaultPaymentMethod } = useConnection();

  const { isUS, countryCodeLoaded } = useGeoLocation();
  const configuredCard = defaultPaymentMethod === "credit-card";

  const isController = paymentMethod?.type == "controller";

  // initialize on open and close
  useEffect(() => {
    if (!isOpen) {
      setPaymentMethod(null);
      setAmount(0);
      return;
    }
    const preferred = depositRequest?.preferredMethod;
    setPaymentMethod(
      preferred?.type === "coinflow" && (!countryCodeLoaded || !isUS)
        ? null
        : (preferred ?? null),
    );
    setAmount(0);
  }, [isOpen, depositRequest, countryCodeLoaded, isUS]);

  const step = useMemo(() => {
    if (depositInProgress) return "checkout";
    if (!paymentMethod) return "method";
    if (!amount) return "amount";
    return "checkout";
  }, [paymentMethod, amount, depositInProgress]);

  return (
    <>
      <WalletSelectionDrawer
        isOpen={isOpen && step == "method"}
        onClose={() => {
          if (step == "method") {
            onClose();
          }
        }}
        setSelected={(selection: PaymentMethodSelection) => {
          setPaymentMethod(selection);
        }}
        showFiatOptions={isUS && configuredCard}
        enableCoinflow={configuredCard}
        showController={true}
        showCrypto={false}
      />

      <AmountSelectionDrawer
        isOpen={isOpen && step == "amount"}
        minAmount={
          depositRequest?.minimumAmount ??
          (isController ? 1 : MIN_CREDITS_PURCHASE_USD)
        }
        maxAmount={MAX_CREDITS_PURCHASE_USD}
        onClose={() => {
          if (step == "amount") {
            onClose();
          }
        }}
        onContinue={async (amount: number) => {
          setAmount(amount);
        }}
      />

      <Checkout
        isOpen={isOpen && step == "checkout"}
        onClose={() => {
          if (step == "checkout") {
            onClose();
          }
        }}
        paymentMethod={paymentMethod}
        amount={amount}
        onChangeMethod={() => setPaymentMethod(null)}
        onChangeAmount={() => setAmount(0)}
      />
    </>
  );
}
