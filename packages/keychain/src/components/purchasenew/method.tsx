import { useNavigation, usePurchaseContext } from "@/context";
import {
  CreditCardIcon,
  DepositIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PurchaseCard,
  WalletIcon,
} from "@cartridge/ui";
import { useState } from "react";
import { ErrorAlert } from "../ErrorAlert";

export function PaymentMethod() {
  const { navigate } = useNavigation();
  const { onCreditCard, displayError } = usePurchaseContext();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <HeaderInner
        title="Choose Payment Method"
        icon={<DepositIcon variant="solid" size="lg" />}
      />
      <LayoutContent className={isLoading ? "pointer-events-none" : ""}>
        {/* <PurchaseCard text="Controller" icon={<ControllerColorIcon />} /> */}
        <PurchaseCard
          text="Credit Card"
          icon={<CreditCardIcon variant="solid" />}
          onClick={async () => {
            setIsLoading(true);
            await onCreditCard();
            navigate("/purchase/checkout/stripe");
          }}
        />
        <PurchaseCard
          text="Wallet"
          icon={<WalletIcon variant="solid" />}
          onClick={() => {
            navigate("/purchase/network");
          }}
        />
      </LayoutContent>
      <LayoutFooter>
        {displayError && (
          <ErrorAlert
            variant="error"
            title="Purchase Error"
            description={displayError.message}
          />
        )}
      </LayoutFooter>
    </>
  );
}
