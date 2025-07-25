import { DepositIcon, HeaderInner } from "@cartridge/ui";

export function PurchaseMethod() {
  return (
    <>
      <HeaderInner
        title="Choose Payment Method"
        icon={<DepositIcon variant="solid" />}
      />
    </>
  );
}
