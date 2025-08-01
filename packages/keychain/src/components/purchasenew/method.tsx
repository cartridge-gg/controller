import { useNavigation, usePurchaseContext } from "@/context";
import {
  Button,
  CreditCardIcon,
  DepositIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PaymentCard,
  WalletIcon,
} from "@cartridge/ui";
import { useState } from "react";
import { ErrorAlert } from "../ErrorAlert";

export function PaymentMethod() {
  const { goBack, navigate } = useNavigation();
  const { onCreditCard, displayError } = usePurchaseContext();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <HeaderInner
        title="Choose Payment Method"
        icon={<DepositIcon variant="solid" size="lg" />}
      />
      <LayoutContent className={isLoading ? "pointer-events-none" : ""}>
        {/* <PaymentCard text="Controller" icon={<ControllerColorIcon />} /> */}
        <PaymentCard
          text="Credit Card"
          icon={<CreditCardIcon variant="solid" />}
          onClick={async () => {
            setIsLoading(true);
            await onCreditCard();
            navigate("/purchase/checkout/stripe");
          }}
        />
        <PaymentCard
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
        <Button
          variant="secondary"
          onClick={goBack}
          disabled={isLoading || !!displayError}
        >
          Back
        </Button>
      </LayoutFooter>
    </>
  );
}
