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
        />
        <PaymentCard text="Wallet" icon={<WalletIcon variant="solid" />} />
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary">Back</Button>
      </LayoutFooter>
    </>
  );
}
