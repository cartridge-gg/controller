import {
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { CostDetails, Network } from "../types";
import { CostBreakdown } from "./cost";
import { Receiving } from "../receiving";
import { PurchaseItem } from "@/context/purchase";

type ReviewPurchaseProps = {
  items: PurchaseItem[];
  costDetails: CostDetails;
  network?: Network;
  isLoading?: boolean;
  onConfirm?: () => void;
};

export function ReviewPurchase({
  items,
  costDetails,
  network,
  isLoading,
  onConfirm,
}: ReviewPurchaseProps) {
  return (
    <>
      <HeaderInner
        title="Review Purchase"
        icon={<GiftIcon variant="solid" />}
      />
      <LayoutContent>
        <Receiving title="Receiving" items={items} isLoading={isLoading} />
      </LayoutContent>
      <LayoutFooter>
        <CostBreakdown
          rails="stripe"
          network={network}
          costDetails={costDetails}
        />
        <Button onClick={onConfirm} isLoading={isLoading}>
          Confirm
        </Button>
      </LayoutFooter>
    </>
  );
}
