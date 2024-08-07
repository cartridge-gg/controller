import { Container, Content, Footer } from "components/layout";
import { BigNumberish } from "starknet";
import { Policy } from "@cartridge/controller";
import { Button, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useConnection } from "hooks/connection";
import { LockIcon } from "@cartridge/ui";
import { Policies } from "Policies";
import { ErrorAlert } from "components/ErrorAlert";

export function CreateSession({
  onConnect,
}: {
  onConnect: (policies: Policy[]) => void;
}) {
  const { controller, policies, origin } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [maxFees] = useState<BigNumberish>();
  const [error, setError] = useState<Error>();

  const onCreateSession = useCallback(async () => {
    try {
      setError(undefined);
      setIsConnecting(true);
      await controller.approve(origin, expiresAt, policies, maxFees);
      onConnect(policies);
    } catch (e) {
      setError(e);
      setIsConnecting(false);
    }
  }, [controller, origin, expiresAt, policies, maxFees, onConnect]);

  return (
    <Container
      variant="connect"
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
        {error && (
          <ErrorAlert
            title="Create session failed"
            description={error.message}
          />
        )}
        <Button
          colorScheme="colorful"
          isDisabled={isConnecting}
          isLoading={isConnecting}
          onClick={() => onCreateSession()}
        >
          create session
        </Button>
      </Footer>
    </Container>
  );
}
