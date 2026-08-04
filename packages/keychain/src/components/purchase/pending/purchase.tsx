import { Item } from "@/context";
import { TransactionPendingBase } from "./base";
import { useAdvancedView } from "@/hooks/features";

export interface PurchasePendingProps {
  name: string;
  items: Item[];
  transactionHash: string;
  onCompleted?: () => void;
}

/**
 * Pending state for onchain purchase on Starknet.
 */
export function PurchasePending({
  name,
  items,
  transactionHash,
  onCompleted,
}: PurchasePendingProps) {
  const advancedView = useAdvancedView();

  return (
    <TransactionPendingBase
      headerTitle={`Purchasing ${name}`}
      items={items}
      transactionHash={transactionHash}
      confirmingTitle={
        advancedView ? "Confirming on Starknet" : "Confirming purchase"
      }
      completedTitle={
        advancedView ? "Confirmed on Starknet" : "Purchase complete"
      }
      buttonText="Play"
      onCompleted={onCompleted}
      analyticsMethod="onchain"
    />
  );
}
