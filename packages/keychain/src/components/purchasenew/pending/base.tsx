import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { Receiving } from "../receiving";
import { ConfirmingTransaction } from "./confirming-transaction";
import { Item } from "@/context";
import { useConnection } from "@/hooks/connection";
import { useEffect, useState } from "react";
import { TransactionFinalityStatus } from "starknet";
import { retryWithBackoff } from "@/utils/retry";
import { getExplorer } from "@/hooks/starterpack/layerswap";
import { useStarterpackPlayHandler } from "@/hooks/starterpack";

export interface TransactionPendingBaseProps {
  /** Header title (e.g., "Purchasing Village Kit") */
  headerTitle: string;
  /** Items being received */
  items: Item[];
  /** Transaction hash to wait for */
  transactionHash: string;
  /** Title for the confirming card (e.g., "Claiming", "Confirming on Starknet") */
  confirmingTitle: string;
  /** Title for the confirming card when completed (e.g. "Claimed", "Confirmed on Starknet") */
  completedTitle?: string;
  /** Button text while pending */
  buttonText: string;
  /** Optional quantity text to show in Receiving component */
  quantityText?: string;
}

/**
 * Shared base component for transaction pending states.
 * Used by both Claim and Purchase pending flows.
 */
export function TransactionPendingBase({
  headerTitle,
  items,
  transactionHash,
  confirmingTitle,
  completedTitle,
  buttonText,
  quantityText,
}: TransactionPendingBaseProps) {
  const { isMainnet, controller } = useConnection();
  const handlePlay = useStarterpackPlayHandler();
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    if (controller) {
      retryWithBackoff(() =>
        controller.provider.waitForTransaction(transactionHash, {
          retryInterval: 1000,
          successStates: [
            TransactionFinalityStatus.PRE_CONFIRMED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        }),
      )
        .then(() => {
          setIsPending(false);
        })
        .catch((error) => {
          console.error("Failed to wait for transaction after retries:", error);
          // Could set an error state here if needed
        });
    }
  }, [controller, transactionHash]);

  const receivingTitle = quantityText
    ? `Receiving ${quantityText}`
    : "Receiving";

  return (
    <>
      <HeaderInner title={headerTitle} />
      <LayoutContent>
        <Receiving title={receivingTitle} items={items} isLoading={false} />
      </LayoutContent>
      <LayoutFooter>
        <ConfirmingTransaction
          title={
            !isPending && completedTitle ? completedTitle : confirmingTitle
          }
          externalLink={
            getExplorer("starknet", transactionHash, isMainnet)?.url
          }
          isLoading={isPending}
        />
        <Button
          className="w-full"
          variant="primary"
          disabled={isPending}
          onClick={handlePlay}
        >
          {buttonText}
        </Button>
      </LayoutFooter>
    </>
  );
}
