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
import { StarterItemData, StarterItemType } from "@/hooks/starterpack";

export function Success() {
  const { purchaseItems, claimItems, starterpackDetails } =
    usePurchaseContext();

  const items = useMemo<Array<StarterItemData>>(() => {
    if (
      starterpackDetails?.acquisitionType === StarterpackAcquisitionType.Claimed
    ) {
      return claimItems.map((item) => ({
        title: item.title,
        description: item.subtitle || "",
        price: item.value || 0,
        type: item.type as unknown as StarterItemType,
        image: item.icon?.toString() || "",
      }));
    }

    return purchaseItems.map((item) => ({
      title: item.title,
      description: item.subtitle || "",
      price: item.value || 0,
      type: item.type as unknown as StarterItemType,
      image: item.icon?.toString() || "",
    }));
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
  items: StarterItemData[];
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
