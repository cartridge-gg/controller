import {
  Button,
  CheckIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { Receiving } from "./receiving";
import { useConnection } from "@/hooks/connection";
import { usePurchaseContext } from "@/context";
import { useMemo } from "react";
import { Item } from "@/context/purchase";
import { ConfirmingTransaction } from "./pending";
import { getExplorer } from "@/hooks/payments/crypto";
import { StarterpackType } from "@/types/starterpack-types";

export function Success() {
  const { purchaseItems, claimItems, starterpackDetails, transactionHash } =
    usePurchaseContext();

  const items = useMemo(() => {
    if (starterpackDetails?.type === "claimed") {
      return claimItems;
    }

    return purchaseItems;
  }, [starterpackDetails, claimItems, purchaseItems]);

  return (
    <PurchaseSuccessInner
      items={items}
      type={starterpackDetails!.type}
      transactionHash={transactionHash}
    />
  );
}

export function PurchaseSuccessInner({
  items,
  type,
  transactionHash,
}: {
  items: Item[];
  type: StarterpackType;
  transactionHash?: string;
}) {
  const { closeModal, isMainnet } = useConnection();
  return (
    <>
      <HeaderInner
        title={`${type === "claimed" ? "Claim" : "Purchase"} Complete`}
        icon={<CheckIcon />}
      />
      <LayoutContent>
        <Receiving
          title="You Received"
          items={items}
          isLoading={false}
          showPrice={true}
        />
      </LayoutContent>
      <LayoutFooter>
        {transactionHash && (
          <ConfirmingTransaction
            title={`${type === "claimed" ? "Claimed" : "Confirmed"} on Starknet`}
            externalLink={
              getExplorer("starknet", transactionHash, isMainnet).url
            }
            isLoading={false}
          />
        )}
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </LayoutFooter>
    </>
  );
}
