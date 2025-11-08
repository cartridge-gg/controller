import { ExternalWallet } from "@cartridge/controller";
import { Button, CreditCardIcon, SparklesIcon } from "@cartridge/ui";
import { useMemo } from "react";
import { MintAllowance } from "@cartridge/ui/utils/api/cartridge";

// Legacy type - these old purchase components are deprecated
type StarterPackDetails = { id?: string };

export type PaymentMethodProps = {
  starterpackDetails?: StarterPackDetails;
  isStripeLoading: boolean;
  isStarterpackLoading: boolean;
  isClaiming: boolean;
  selectedWallet?: ExternalWallet;
  mintAllowance?: MintAllowance;
  wallets?: ExternalWallet[];
  onClaim: () => void;
  onCreditCard: () => void;
  onExternalConnect: (wallet: ExternalWallet) => void;
};

export function PaymentMethod({
  starterpackDetails,
  isStripeLoading,
  isStarterpackLoading,
  isClaiming,
  mintAllowance,
  onClaim,
  onCreditCard,
}: PaymentMethodProps) {
  const isOutOfStock = useMemo(() => {
    return (
      starterpackDetails?.supply !== undefined && starterpackDetails.supply <= 0
    );
  }, [starterpackDetails?.supply]);

  const isLimitReached = useMemo(() => {
    return mintAllowance && mintAllowance.count >= mintAllowance.limit;
  }, [mintAllowance]);

  const isFree = useMemo(() => {
    return starterpackDetails?.priceUsd === 0;
  }, [starterpackDetails?.priceUsd]);

  if (isStarterpackLoading) {
    return null;
  }

  if (isLimitReached) {
    return (
      <Button className="flex-1" disabled>
        Limit Reached
      </Button>
    );
  }

  if (isFree) {
    return (
      <Button className="flex-1" isLoading={isClaiming} onClick={onClaim}>
        <SparklesIcon size="sm" variant="solid" />
        Claim
      </Button>
    );
  }

  if (isOutOfStock) {
    return (
      <Button className="flex-1" disabled>
        Check again soon
      </Button>
    );
  }

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
