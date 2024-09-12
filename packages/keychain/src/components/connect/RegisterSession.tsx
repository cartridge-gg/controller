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
import { Policies } from "components/Policies";
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
  const [maxFee] = useState<BigNumberish>(0);
  const [error, setError] = useState<ControllerError>();

  const onRegisterSession = useCallback(async () => {
    try {
      setError(undefined);
      setIsConnecting(true);
      const { transaction_hash } = await controller.registerSession(
        expiresAt,
        policies,
        publicKey,
        maxFee,
      );

      await controller.account.waitForTransaction(transaction_hash, {
        retryInterval: 1000,
        successStates: [
          TransactionExecutionStatus.SUCCEEDED,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      });
      onConnect(policies, transaction_hash);
    } catch (e) {
      if (
        e.data &&
        typeof e.data === "string" &&
        e.data.includes("session/already-registered")
      ) {
        onConnect(policies);
        return;
      }

      setError({
        code: e.code,
        message: e.message,
        data: e.data ? JSON.parse(e.data) : undefined,
      });
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
