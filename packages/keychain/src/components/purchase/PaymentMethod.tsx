import { StarterpackDetails } from "@/context";
import { ExternalWallet } from "@cartridge/controller";
import { Button, CreditCardIcon } from "@cartridge/ui";

export type PaymentMethodProps = {
  starterpackDetails?: StarterpackDetails;
  isStripeLoading: boolean;
  selectedWallet?: ExternalWallet;
  wallets?: ExternalWallet[];
  onCreditCard: () => void;
  onExternalConnect: (wallet: ExternalWallet) => void;
};

export function PaymentMethod({
  isStripeLoading,
  onCreditCard,
}: PaymentMethodProps) {
  return (
    <>
      <Button
        className="flex-1"
        isLoading={isStripeLoading}
        onClick={onCreditCard}
      >
        <CreditCardIcon
          size="sm"
          variant="solid"
          className="text-background-100 flex-shrink-0"
        />
        <span>Credit Card</span>
      </Button>
    </>
  );
}
