import { LayoutContainer, LayoutHeader, AlertIcon } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";

export function Unsupported({ message }: { message: string }) {
  const { closeModal, chainId } = useConnection();

  return (
    <LayoutContainer>
      <LayoutHeader
        Icon={AlertIcon}
        title="Device is not supported"
        description={message}
        onClose={closeModal}
        chainId={chainId}
      />
    </LayoutContainer>
  );
}
