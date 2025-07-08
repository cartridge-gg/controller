import { LayoutContainer, AlertIcon } from "@cartridge/ui";
import { NavigationHeader } from "@/components";

export function Unsupported({ message }: { message: string }) {
  return (
    <LayoutContainer>
      <NavigationHeader
        Icon={AlertIcon}
        title="Device is not supported"
        description={message}
      />
    </LayoutContainer>
  );
}
