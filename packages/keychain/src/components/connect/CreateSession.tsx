import { Container, Content, Footer } from "components/layout";
import { BigNumberish } from "starknet";
import { Policy } from "@cartridge/controller";
import { Button, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useConnection } from "hooks/connection";
import { LockIcon } from "@cartridge/ui";
import { Policies } from "Policies";

export function CreateSession({
  onConnect,
}: {
  onConnect: (policies: Policy[]) => void;
}) {
  const { controller, policies, origin } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [maxFees] = useState<BigNumberish>();
  return (
    <Container
      variant="createSession"
      title="Create Session"
      description={
        <Text fontSize="sm" color="text.secondary">
          Pre-approve{" "}
          <LockIcon fontSize="md" color="text.secondaryAccent" mr={0.5} />
          <Text as="span" color="text.secondaryAccent" fontWeight="bold">
            {origin}
          </Text>{" "}
          to perform the following actions on your behalf
        </Text>
      }
    >
      <Content>
        <Policies policies={policies} />
      </Content>

      <Footer hideTxSummary>
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
          create session
        </Button>
      </Footer>
    </Container>
  );
}
