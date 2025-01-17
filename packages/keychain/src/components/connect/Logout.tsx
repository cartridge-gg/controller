import {
  LayoutContainer,
  LayoutFooter,
  Button,
  SignOutIcon,
  LayoutHeader,
} from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { ResponseCodes } from "@cartridge/controller";

export function Logout() {
  const { closeModal, chainId, openSettings, context, logout } =
    useConnection();
  return (
    <LayoutContainer>
      <LayoutHeader
        Icon={SignOutIcon}
        title="Log Out"
        description="Are you sure?"
        onClose={closeModal}
        chainId={chainId}
        openSettings={openSettings}
      />
      <LayoutFooter>
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
      </LayoutFooter>
    </LayoutContainer>
  );
}
