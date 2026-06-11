import { useEffect, useMemo, useState } from "react";
import {
  WalletSelectionDrawer,
  type PaymentMethodSelection,
} from "../purchase/checkout/onchain/wallet-drawer";
import { AmountSelectionDrawer } from "./AmountSelectionDrawer";
import { CheckoutDrawer } from "./CheckoutDrawer";

interface DepositCreditsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositCredits({ isOpen, onClose }: DepositCreditsProps) {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodSelection | null>(null);
  const [amount, setAmount] = useState(0);

  // initialize on open and close
  useEffect(() => {
    setPaymentMethod(null);
    setAmount(0);
  }, [isOpen]);

  const step = useMemo(() => {
    if (!paymentMethod) return "method";
    if (!amount) return "amount";
    return "checkout";
  }, [paymentMethod, amount]);

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
        paymentMethod={paymentMethod}
        amount={amount}
        onChangeMethod={() => setPaymentMethod(null)}
        onChangeAmount={() => setAmount(0)}
      />
    </>
  );
}
