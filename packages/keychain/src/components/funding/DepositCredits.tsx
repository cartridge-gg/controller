import { useCallback, useEffect, useState } from "react";
import {
  WalletSelectionDrawer,
  type PaymentMethodSelection,
} from "../purchase/checkout/onchain/wallet-drawer";
import { AmountSelectionDrawer } from "./AmountSelectionDrawer";

interface DepositCreditsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositCredits({ isOpen, onClose }: DepositCreditsProps) {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodSelection | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // initialize on open and close
  useEffect(() => {
    setPaymentMethod(null);
    setIsPurchasing(false);
  }, [isOpen]);

  const handlePurchase = useCallback(
    async (amount: number) => {
      console.log(`>>> payment`, paymentMethod);
      console.log(`>>> amount`, amount, paymentMethod);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    [paymentMethod],
  );

  return (
    <>
      <WalletSelectionDrawer
        isOpen={isOpen && !paymentMethod}
        onClose={() => {
          if (!paymentMethod) {
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
        isOpen={isOpen && !!paymentMethod}
        onClose={() => {
          onClose();
        }}
        isLoading={isPurchasing}
        onContinue={async (amount: number) => {
          setIsPurchasing(true);
          await handlePurchase(amount);
          setIsPurchasing(false);
          onClose();
        }}
      />
    </>
  );
}
