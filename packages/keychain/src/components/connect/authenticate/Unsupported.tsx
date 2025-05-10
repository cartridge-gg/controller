import { LayoutContainer, LayoutHeader, AlertIcon } from "@cartridge/ui";

export function Unsupported({ message }: { message: string }) {
  return (
    <LayoutContainer>
      <LayoutHeader
        Icon={AlertIcon}
        title="Device is not supported"
        description={message}
      />
    </LayoutContainer>
  );
}
