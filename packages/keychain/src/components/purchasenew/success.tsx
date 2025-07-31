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
import { PurchaseItem } from "@/context/purchase";

export function PurchaseSuccess() {
  const { purchaseItems } = usePurchaseContext();
  return <PurchaseSuccessInner items={purchaseItems} />;
}

export function PurchaseSuccessInner({ items }: { items: PurchaseItem[] }) {
  const { closeModal } = useConnection();
  return (
    <>
      <HeaderInner title="Purchase Complete" icon={<CheckIcon />} />
      <LayoutContent>
        <Receiving title="You Received" items={items} isLoading={false} />
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </LayoutFooter>
    </>
  );
}
