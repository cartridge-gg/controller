import { Container, Footer } from "@/components/layout";
import { Button, SignOutIcon } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { ResponseCodes } from "@cartridge/controller";

export function Logout() {
  const { context, logout } = useConnection();
  return (
    <Container Icon={SignOutIcon} title="Log Out" description="Are you sure?">
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
