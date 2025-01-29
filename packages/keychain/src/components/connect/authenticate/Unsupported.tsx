import { AlertIcon } from "@cartridge/ui-next";
import { Container } from "@/components/layout";

export function Unsupported({ message }: { message: string }) {
  return (
    <Container
      hideAccount
      Icon={AlertIcon}
      title="Device is not supported"
      description={message}
    ></Container>
  );
}
