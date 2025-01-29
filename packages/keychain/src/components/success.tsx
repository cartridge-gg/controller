import { Container } from "@/components/layout";
import { CheckIcon } from "@cartridge/ui-next";

export function Success() {
  return (
    <Container
      variant="expanded"
      hideAccount
      Icon={CheckIcon}
      title="Success!"
      description=""
    />
  );
}
