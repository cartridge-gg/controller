import { HeaderInner, LayoutContent, Spinner } from "@cartridge/ui";
import { Receiving } from "./receiving";
import { PurchaseItem, usePurchaseContext } from "@/context/purchase";

export function PurchasePending() {
  const { purchaseItems } = usePurchaseContext();
  return <PurchasePendingInner items={purchaseItems} />;
}

export function PurchasePendingInner({ items }: { items: PurchaseItem[] }) {
  return (
    <>
      <HeaderInner title="Pending Confirmation" icon={<Spinner />} />
      <LayoutContent>
        <Receiving title="Receiving" items={items} isLoading={true} />
      </LayoutContent>
    </>
  );
}
