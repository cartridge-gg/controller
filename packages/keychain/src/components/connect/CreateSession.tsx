import { Container, Content, Footer } from "components/layout";
import { BigNumberish } from "starknet";
import { ControllerError } from "utils/connection";
import { Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useConnection } from "hooks/connection";
import { Policies } from "components/Policies";
import { ControllerErrorAlert } from "components/ErrorAlert";
import { SessionConsent } from "components/connect";
import { SESSION_EXPIRATION } from "const";
import { Upgrade } from "./Upgrade";

export function CreateSession({
  onConnect,
  isUpdate,
}: {
  onConnect: (transaction_hash?: string) => void;
  isUpdate?: boolean;
}) {
  const { controller, policies, upgrade } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(SESSION_EXPIRATION);
  const [maxFee] = useState<BigNumberish>();
  const [error, setError] = useState<ControllerError>();

  const onCreateSession = useCallback(async () => {
    try {
      setError(undefined);
      setIsConnecting(true);
      await controller.createSession(expiresAt, policies, maxFee);
      onConnect();
    } catch (e) {
      setError(e);
      setIsConnecting(false);
    }
  }, [controller, expiresAt, policies, maxFee, onConnect]);

  if (!upgrade.isSynced) {
    return <></>;
  }

  if (upgrade.available) {
    return <Upgrade />;
  }

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

      <Footer>
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
