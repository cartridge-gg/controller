import { useConnection } from "@/hooks/connection";
import { LayoutContainer, CheckIcon, LayoutHeader } from "@cartridge/ui-next";

export function Success() {
  const { chainId, closeModal } = useConnection();
  return (
    <LayoutContainer>
      <LayoutHeader
        variant="expanded"
        Icon={CheckIcon}
        title="Success!"
        description=""
        chainId={chainId}
        onClose={closeModal}
      />
    </LayoutContainer>
  );
}
