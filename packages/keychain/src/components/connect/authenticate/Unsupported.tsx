import { LayoutContainer, LayoutHeader, AlertIcon } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";

export function Unsupported({ message }: { message: string }) {
  const { closeModal, controller } = useConnection();

  return (
    <LayoutContainer>
      <LayoutHeader
        Icon={AlertIcon}
        title="Device is not supported"
        description={message}
        onClose={closeModal}
        chainId={controller?.chainId()}
      />
    </LayoutContainer>
  );
}
