import { Button } from "@chakra-ui/react";
import { Container } from "./Container";
import { PortalBanner } from "./PortalBanner";
import { LogoutDuoIcon } from "@cartridge/ui";
import { PortalFooter } from "./PortalFooter";

export function Logout({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Container>
      <PortalBanner
        Icon={LogoutDuoIcon}
        title="Log Out"
        description="Are you sure?"
      />

      <PortalFooter>
        <Button colorScheme="colorful" onClick={onConfirm}>
          Log Out
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </PortalFooter>
    </Container>
  );
}
