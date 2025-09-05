import { PurchaseType } from "@cartridge/ui/utils/api/cartridge";
import { AmountSelection } from "../funding/AmountSelection";
import { Balance, BalanceType } from "./Balance";
import { PurchaseState } from "./types";

export type PurchaseContentProps = {
  state: PurchaseState;
  type: PurchaseType;
  isStripeLoading: boolean;
  isLoadingWallets: boolean;
  onAmountChanged: (amount: number) => void;
};

export function PurchaseContent({
  state,
  type,
  isStripeLoading,
  isLoadingWallets,
  onAmountChanged,
}: PurchaseContentProps) {
  if (state === PurchaseState.SELECTION) {
    if (type === PurchaseType.Credits) {
      return (
        <AmountSelection
          onChange={onAmountChanged}
          lockSelection={isStripeLoading || isLoadingWallets}
          enableCustom
        />
      );
    }
  }

  if (state === PurchaseState.SUCCESS) {
    return <Balance types={[BalanceType.CREDITS]} />;
  }

  return null;
}
