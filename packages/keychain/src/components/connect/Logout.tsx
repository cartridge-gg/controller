import { Button } from "@chakra-ui/react";
import { Container, Footer } from "components/layout";
import { LogoutDuoIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { ResponseCodes } from "@cartridge/controller";

export function Logout() {
  const { context, logout } = useConnection();
  return (
    <Container Icon={LogoutDuoIcon} title="Log Out" description="Are you sure?">
      <Footer>
        <Button colorScheme="colorful" onClick={logout}>
          Log Out
        </Button>
        <Button
          onClick={() => {
            context.resolve({
              code: ResponseCodes.CANCELED,
              message: "User cancelled logout",
            });
          }}
        >
          Cancel
        </Button>
      </Footer>
    </Container>
  );
}
