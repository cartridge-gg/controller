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
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";
import { Item } from "@/context/purchase";
import { ConfirmingTransaction } from "./pending";
import { getExplorer } from "@/hooks/payments/crypto";

export function Success() {
  const { purchaseItems, claimItems, starterpackDetails, transactionHash } =
    usePurchaseContext();

  const items = useMemo(() => {
    if (
      starterpackDetails?.acquisitionType === StarterpackAcquisitionType.Claimed
    ) {
      return claimItems;
    }

    return purchaseItems;
  }, [starterpackDetails, claimItems, purchaseItems]);

  return (
    <PurchaseSuccessInner
      items={items}
      acquisitionType={starterpackDetails!.acquisitionType}
      transactionHash={transactionHash}
    />
  );
}

export function PurchaseSuccessInner({
  items,
  acquisitionType,
  transactionHash,
}: {
  items: Item[];
  acquisitionType: StarterpackAcquisitionType;
  transactionHash?: string;
}) {
  const { closeModal, isMainnet } = useConnection();
  return (
    <>
      <HeaderInner
        title={`${acquisitionType === StarterpackAcquisitionType.Claimed ? "Claim" : "Purchase"} Complete`}
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
            title={`${acquisitionType === StarterpackAcquisitionType.Claimed ? "Claimed" : "Confirmed"} on Starknet`}
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
