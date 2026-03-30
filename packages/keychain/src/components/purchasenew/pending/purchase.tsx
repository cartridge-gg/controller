import { Item } from "@/context";
import { TransactionPendingBase } from "./base";

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
  return (
    <TransactionPendingBase
      headerTitle={`Purchasing ${name}`}
      items={items}
      transactionHash={transactionHash}
      confirmingTitle="Confirming on Starknet"
      completedTitle="Confirmed on Starknet"
      buttonText="Play"
      onCompleted={onCompleted}
    />
  );
}
