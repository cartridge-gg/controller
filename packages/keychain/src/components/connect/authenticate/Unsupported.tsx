import { AlertIcon, HeaderInner } from "@cartridge/ui";

export function Unsupported({ message }: { message: string }) {
  return (
    <HeaderInner
      Icon={AlertIcon}
      title="Device is not supported"
      description={message}
      hideIcon
    />
  );
}
