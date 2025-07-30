import { useNavigation, usePurchaseContext } from "@/context";
import {
  Button,
  ControllerColorIcon,
  CreditCardIcon,
  DepositIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PaymentCard,
  WalletIcon,
} from "@cartridge/ui";

export function PaymentMethod() {
  const { goBack } = useNavigation();
  const { onCreditCard } = usePurchaseContext();
  return (
    <>
      <HeaderInner
        title="Choose Payment Method"
        icon={<DepositIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        <PaymentCard text="Controller" icon={<ControllerColorIcon />} />
        <PaymentCard
          text="Credit Card"
          icon={<CreditCardIcon variant="solid" />}
          onClick={async () => {
            await onCreditCard();
          }}
        />
        <PaymentCard text="Wallet" icon={<WalletIcon variant="solid" />} />
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={goBack}>
          Back
        </Button>
      </LayoutFooter>
    </>
  );
}
