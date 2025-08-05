import {
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { CostDetails } from "../types";
import { CostBreakdown } from "./cost";
import { Receiving } from "../receiving";
import { PurchaseItem } from "@/context/purchase";
import { ExternalPlatform } from "@cartridge/controller";

type ReviewPurchaseProps = {
  items: PurchaseItem[];
  costDetails: CostDetails;
  platform?: ExternalPlatform;
  isLoading?: boolean;
  onConfirm?: () => void;
};

export function ReviewPurchase({
  items,
  costDetails,
  platform,
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
          rails={platform ? "crypto" : "stripe"}
          platform={platform}
          costDetails={costDetails}
        />
        <Button onClick={onConfirm} isLoading={isLoading}>
          Confirm
        </Button>
      </LayoutFooter>
    </>
  );
}
