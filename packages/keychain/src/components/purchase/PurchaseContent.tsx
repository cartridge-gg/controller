import { AmountSelection } from "../funding/AmountSelection";
import { StarterPackContent } from "../starterpack";
import { Balance, BalanceType } from "./Balance";
import { Receiving } from "../starterpack/receiving";
import { PurchaseType } from "@/hooks/payments/crypto";
import { StarterPackDetails } from "@/hooks/starterpack";
import { PurchaseState } from "./types";

export type PurchaseContentProps = {
  state: PurchaseState;
  type: PurchaseType;
  starterpackDetails?: StarterPackDetails;
  isStripeLoading: boolean;
  isLoadingWallets: boolean;
  onAmountChanged: (amount: number) => void;
};

export function PurchaseContent({
  state,
  type,
  starterpackDetails,
  isStripeLoading,
  isLoadingWallets,
  onAmountChanged,
}: PurchaseContentProps) {
  if (state === PurchaseState.SELECTION) {
    if (type === PurchaseType.CREDITS) {
      return (
        <AmountSelection
          onChange={onAmountChanged}
          lockSelection={isStripeLoading || isLoadingWallets}
          enableCustom
        />
      );
    }

    if (type === PurchaseType.STARTERPACK) {
      return (
        <StarterPackContent
          mintAllowance={starterpackDetails?.mintAllowance}
          starterpackItems={starterpackDetails?.starterPackItems}
        />
      );
    }
  }

  if (state === PurchaseState.SUCCESS) {
    if (starterpackDetails) {
      return (
        <Receiving
          title="Received"
          items={starterpackDetails.starterPackItems}
        />
      );
    }
    return <Balance types={[BalanceType.CREDITS]} />;
  }

  return null;
}
