import { Container, Content, Footer } from "components/layout";
import { BigNumberish } from "starknet";
import { Policy } from "@cartridge/controller";
import { ControllerError } from "utils/connection";
import { Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useConnection } from "hooks/connection";
import { Policies } from "components/Policies";
import { ControllerErrorAlert } from "components/ErrorAlert";
import { SessionConsent } from "components/connect";

export function CreateSession({
  onConnect,
  isUpdate,
}: {
  onConnect: (policies: Policy[], transaction_hash?: string) => void;
  isUpdate?: boolean;
}) {
  const { controller, policies } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
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
    <Container
      title={!isUpdate ? "Create Session" : "Update Session"}
      description={
        isUpdate && "The policies were updated, please update existing session"
      }
    >
      <Content>
        <SessionConsent />
        <Policies policies={policies} />
      </Content>

      <Footer hideTxSummary>
        {error && <ControllerErrorAlert error={error} />}
        <Button
          colorScheme="colorful"
          isDisabled={isConnecting}
          isLoading={isConnecting}
          onClick={() => onCreateSession()}
        >
          {isUpdate ? "update" : "create"} session
        </Button>
      </Footer>
    </Container>
  );
}
