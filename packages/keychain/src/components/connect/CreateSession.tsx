import { Container, Content, Footer } from "components/layout";
import {
  BigNumberish,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { Policy } from "@cartridge/controller";
import { Button, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useConnection } from "hooks/connection";
import { LockIcon } from "@cartridge/ui";
import { Policies } from "Policies";
import { ErrorAlert } from "components/ErrorAlert";

export function CreateSession({
  onConnect,
  publicKey,
}: {
  onConnect: (policies: Policy[], transaction_hash?: string) => void;
  publicKey?: string;
}) {
  const { controller, policies, origin } = useConnection();
  const [isConnecting, setIsConnecting] = useState(false);
  const [expiresAt] = useState<bigint>(3000000000n);
  const [maxFee] = useState<BigNumberish>();
  const [error, setError] = useState<Error>();

  const onCreateSession = useCallback(async () => {
    try {
      setError(undefined);
      setIsConnecting(true);
      if (publicKey) {
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
        return;
      }

      await controller.createSession(expiresAt, policies, maxFee);
      onConnect(policies);
    } catch (e) {
      setError(e);
      setIsConnecting(false);
    }
  }, [controller, expiresAt, policies, maxFee, publicKey, onConnect]);

  return (
    <Container
      variant="connect"
      title="Create Session"
      description={
        <>
          Pre-approve{" "}
          <LockIcon fontSize="md" color="text.secondaryAccent" mr={0.5} />
          <Text as="span" color="text.secondaryAccent" fontWeight="bold">
            {origin}
          </Text>{" "}
          to perform the following actions on your behalf
        </>
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
