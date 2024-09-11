import { Container, Content, Footer } from "components/layout";
import {
  BigNumberish,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { Policy } from "@cartridge/controller";
import { ControllerError } from "utils/connection";
import { Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useConnection } from "hooks/connection";
import { Policies } from "Policies";
import { ControllerErrorAlert } from "components/ErrorAlert";
import { SessionConsent } from "components/connect";

export function RegisterSession({
  onConnect,
  publicKey,
}: {
  onConnect: (policies: Policy[], transaction_hash?: string) => void;
  publicKey?: string;
}) {
  const { controller, policies } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [maxFee] = useState<BigNumberish>();
  const [error, setError] = useState<ControllerError>();

  const onRegisterSession = useCallback(async () => {
    try {
      setError(undefined);
      setIsConnecting(true);
      const hash = await controller.registerSession(
        expiresAt,
        policies,
        publicKey,
        maxFee,
      );

      await controller.account.waitForTransaction(hash, {
        retryInterval: 1000,
        successStates: [
          TransactionExecutionStatus.SUCCEEDED,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      });
      onConnect(policies, hash);
      await controller.createSession(expiresAt, policies, maxFee);
      onConnect(policies);
    } catch (e) {
      setError(e);
      setIsConnecting(false);
    }
  }, [controller, expiresAt, policies, maxFee, publicKey, onConnect]);

  return (
    <Container title="Register Session">
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
          onClick={() => onRegisterSession()}
        >
          Register Session
        </Button>
      </Footer>
    </Container>
  );
}
