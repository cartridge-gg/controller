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

export function Success() {
  const { purchaseItems, claimItems, starterpackDetails } =
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
    />
  );
}

export function PurchaseSuccessInner({
  items,
  acquisitionType,
}: {
  items: Item[];
  acquisitionType: StarterpackAcquisitionType;
}) {
  const { closeModal } = useConnection();
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
          showPrice={false}
        />
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </LayoutFooter>
    </>
  );
}
