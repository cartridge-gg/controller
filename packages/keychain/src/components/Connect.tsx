import { Container, PortalBanner, PortalFooter } from "components";
import { constants } from "starknet";
import { Policy } from "@cartridge/controller";
import { PlugNewDuoIcon } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";

export function Connect({
  chainId,
  policies,
  origin,
  onConnect,
  onCancel,
  onLogout,
}: {
  chainId: constants.StarknetChainId;
  policies: Policy[];
  origin: string;
  onConnect: (policies: Policy[]) => void;
  onCancel: () => void;
  onLogout: () => void;
}) {
  return (
    <Container chainId={chainId} onLogout={onLogout}>
      <PortalBanner
        Icon={PlugNewDuoIcon}
        title="Create Session"
        description={`${origin} is requesting to connect to your Cartridge Controller`}
      />

      <PortalFooter origin={origin} policies={policies}>
        <>
          <Button colorScheme="colorful" onClick={() => onConnect(policies)}>
            create
          </Button>

          <Button onClick={onCancel}>cancel</Button>
        </>
      </PortalFooter>
    </Container>
  );
}
