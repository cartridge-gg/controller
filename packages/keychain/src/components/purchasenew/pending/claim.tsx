import { Item } from "@/context";
import { TransactionPendingBase } from "./base";

export interface ClaimPendingProps {
  name: string;
  items: Item[];
  transactionHash: string;
  quantity: number;
}

/**
 * Pending state for claiming a starterpack (merkle drop).
 */
export function ClaimPending({
  name,
  items,
  transactionHash,
  quantity,
}: ClaimPendingProps) {
  const quantityText = quantity > 1 ? `(${quantity})` : "";

  return (
    <TransactionPendingBase
      headerTitle={`Purchasing ${name}`}
      items={items}
      transactionHash={transactionHash}
      confirmingTitle="Claiming"
      completedTitle="Claimed"
      buttonText="Claiming"
      quantityText={quantityText}
    />
  );
}
