import { Container, Banner, Footer } from "components/layout";
import { BigNumberish } from "starknet";
import { Policy } from "@cartridge/controller";
import { PlugNewDuoIcon } from "@cartridge/ui";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { useController } from "hooks/controller";

export function CreateSession({
  policies,
  origin,
  onConnect,
  onCancel,
  onLogout,
}: {
  policies: Policy[];
  origin: string;
  onConnect: (policies: Policy[]) => void;
  onCancel: () => void;
  onLogout: () => void;
}) {
  const { controller } = useController();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [maxFees] = useState<BigNumberish>();
  return (
    <Container onLogout={onLogout}>
      <Banner
        Icon={PlugNewDuoIcon}
        title="Create Session"
        description={`${origin} is requesting to connect to your Cartridge Controller`}
      />

      <Footer origin={origin} policies={policies}>
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
      </Footer>
    </Container>
  );
}
