import { Container, PortalBanner, PortalFooter } from "components";
import { BigNumberish } from "starknet";
import { Policy } from "@cartridge/controller";
import { PlugNewDuoIcon } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { useController } from "hooks/controller";

export function Connect({
  chainId,
  policies,
  origin,
  onConnect,
  onCancel,
  onLogout,
}: {
  chainId: string;
  policies: Policy[];
  origin: string;
  onConnect: (policies: Policy[]) => void;
  onCancel: () => void;
  onLogout: () => void;
}) {
  const [controller] = useController();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [maxFees] = useState<BigNumberish>();
  return (
    <Container chainId={chainId} onLogout={onLogout}>
      <PortalBanner
        Icon={PlugNewDuoIcon}
        title="Create Session"
        description={`${origin} is requesting to connect to your Cartridge Controller`}
      />

      <PortalFooter origin={origin} policies={policies}>
        <>
          <Button
            colorScheme="colorful"
            isDisabled={isConnecting}
            isLoading={isConnecting}
            onClick={async () => {
              setIsConnecting(true);
              await controller
                .approve(origin, expiresAt, policies, maxFees)
                .then(() => {
                  onConnect(policies);
                })
                .catch(() => {
                  setIsConnecting(false);
                });
            }}
          >
            create
          </Button>

          <Button onClick={onCancel}>cancel</Button>
        </>
      </PortalFooter>
    </Container>
  );
}
