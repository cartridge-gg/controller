import { Container, Footer } from "@/components/layout";
import { LogoutDuoIcon, Button } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { ResponseCodes } from "@cartridge/controller";

export function Logout() {
  const { context, logout } = useConnection();
  return (
    <Container Icon={LogoutDuoIcon} title="Log Out" description="Are you sure?">
      <Footer>
        <Button onClick={logout}>Log Out</Button>
        <Button
          variant="secondary"
          onClick={() => {
            context?.resolve?.({
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
