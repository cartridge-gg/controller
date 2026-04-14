import { DepositIcon, HeaderInner } from "@cartridge/controller-ui";

export function PurchaseCredits() {
  return (
    <>
      <HeaderInner
        title="Fund Controller"
        icon={<DepositIcon variant="solid" />}
      />
    </>
  );
}
