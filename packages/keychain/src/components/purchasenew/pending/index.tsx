import { useStarterpackContext, useOnchainPurchaseContext } from "@/context";
import { ClaimPending } from "./claim";
import { PurchasePending } from "./purchase";
import { BridgePending } from "./bridge";

// Re-export components for external use
export { ClaimPending } from "./claim";
export type { ClaimPendingProps } from "./claim";
export { PurchasePending } from "./purchase";
export type { PurchasePendingProps } from "./purchase";
export { BridgePending } from "./bridge";
export type { BridgePendingProps } from "./bridge";
export { ConfirmingTransaction } from "./confirming-transaction";
export { TransactionPendingBase } from "./base";
export type { TransactionPendingBaseProps } from "./base";

/**
 * Main router component for pending states.
 * Routes to the appropriate pending component based on starterpack type and bridge state.
 */
export function Pending() {
  const { starterpackDetails, transactionHash, claimItems } =
    useStarterpackContext();
  const { purchaseItems, explorer, selectedWallet, swapId, quantity } =
    useOnchainPurchaseContext();

  // Claim flow (merkle drop)
  if (starterpackDetails?.type === "claimed") {
    return (
      <ClaimPending
        name={starterpackDetails?.name || "Items"}
        items={claimItems}
        quantity={quantity}
        transactionHash={transactionHash!}
      />
    );
  }

  // Bridge flow - detected by presence of swapId
  if (swapId) {
    return (
      <BridgePending
        name={starterpackDetails?.name || "Items"}
        items={purchaseItems}
        swapId={swapId}
        transactionHash={transactionHash}
        paymentMethod="crypto"
        explorer={explorer}
        wallet={selectedWallet}
      />
    );
  }

  // Onchain purchase flow (default)
  return (
    <PurchasePending
      name={starterpackDetails?.name || "Items"}
      items={purchaseItems}
      transactionHash={transactionHash!}
    />
  );
}
