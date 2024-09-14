import { Container, Content, Footer } from "components/layout";
import { BigNumberish } from "starknet";
import { Policy } from "@cartridge/controller";
import { ControllerError } from "utils/connection";
import { Box, Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useConnection } from "hooks/connection";
import { Policies } from "components/Policies";
import { ControllerErrorAlert } from "components/ErrorAlert";
import { SessionConsent } from "components/connect";
import { SESSION_EXPIRATION } from "const";

export function CreateSession({
  onConnect,
}: {
  onConnect: (policies: Policy[], transaction_hash?: string) => void;
}) {
  const { controller, policies } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(SESSION_EXPIRATION);
  const [maxFee] = useState<BigNumberish>();
  const [error, setError] = useState<ControllerError>();

  const onCreateSession = useCallback(async () => {
    try {
      setError(undefined);
      setIsConnecting(true);
      await controller.createSession(expiresAt, policies, maxFee);
      onConnect(policies);
    } catch (e) {
      setError(e);
      setIsConnecting(false);
    }
  }, [controller, expiresAt, policies, maxFee, onConnect]);

  return (
    <Container title="Create Session">
      <Content>
        <SessionConsent />
        <Box maxH={340} overflowY="auto">
          <Policies policies={policies} />
        </Box>
      </Content>

      <Footer hideTxSummary>
        {error && <ControllerErrorAlert error={error} />}
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
