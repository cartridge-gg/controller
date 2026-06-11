import { useEffect, useMemo, useState } from "react";
import {
  WalletSelectionDrawer,
  type PaymentMethodSelection,
} from "../purchase/checkout/onchain/wallet-drawer";
import { AmountSelectionDrawer } from "./AmountSelectionDrawer";
import { CheckoutDrawer } from "./CheckoutDrawer";
import { useCreditsContext } from "./provider";

interface DepositCreditsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositCredits({ isOpen, onClose }: DepositCreditsProps) {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodSelection | null>(null);
  const [amount, setAmount] = useState(0);
  const { depositInProgress } = useCreditsContext();

  const isController = paymentMethod?.type == "controller";

  // initialize on open and close
  useEffect(() => {
    setPaymentMethod(null);
    setAmount(0);
  }, [isOpen]);

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
        // showFiatOptions={countryCode === "US"}
        showFiatOptions={false}
        showController={true}
        showCrypto={false}
      />

      <AmountSelectionDrawer
        isOpen={isOpen && step == "amount"}
        minAmount={isController ? 1 : undefined}
        onClose={() => {
          if (step == "amount") {
            onClose();
          }
        }}
        onContinue={async (amount: number) => {
          setAmount(amount);
        }}
      />

      <CheckoutDrawer
        isOpen={isOpen && step == "checkout"}
        onClose={() => {
          if (step == "checkout") {
            onClose();
          }
        }}
        paymentMethod={depositInProgress?.paymentMethod || paymentMethod}
        amount={depositInProgress?.amount || amount}
        onChangeMethod={() => setPaymentMethod(null)}
        onChangeAmount={() => setAmount(0)}
      />
    </>
  );
}
