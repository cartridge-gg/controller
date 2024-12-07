import { Content } from "components/layout";
import { useCallback, useMemo, useState } from "react";
import { useConnection } from "hooks/connection";
import { SessionConsent } from "components/connect";
import { ExecutionContainer } from "components/ExecutionContainer";
import {
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { SESSION_EXPIRATION } from "const";
import { UnverifiedSessionSummary } from "components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "components/session/VerifiedSessionSummary";
import { ParsedSessionPolicies } from "hooks/session";

export function RegisterSession({
  policies,
  onConnect,
  publicKey,
}: {
  policies: ParsedSessionPolicies;
  onConnect: (transaction_hash?: string) => void;
  publicKey?: string;
}) {
  const { controller, theme } = useConnection();
  const [expiresAt] = useState<bigint>(SESSION_EXPIRATION);

  const transactions = useMemo(() => {
    if (!publicKey || !controller) return;

    const calldata = controller.registerSessionCalldata(
      expiresAt,
      policies,
      publicKey,
    );

    return [
      {
        contractAddress: controller.address,
        entrypoint: "register_session",
        calldata,
      },
    ];
  }, [controller, expiresAt, policies, publicKey]);

  const onRegisterSession = useCallback(
    async (maxFee?: bigint) => {
      if (!maxFee || !publicKey || !controller) {
        return;
      }

      const { transaction_hash } = await controller.registerSession(
        expiresAt,
        policies,
        publicKey,
        maxFee,
      );

      await controller.waitForTransaction(transaction_hash, {
        retryInterval: 1000,
        successStates: [
          TransactionExecutionStatus.SUCCEEDED,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      });

      onConnect(transaction_hash);
    },
    [controller, expiresAt, policies, publicKey, onConnect],
  );

  return (
    <ExecutionContainer
      title="Register Session"
      transactions={transactions}
      onSubmit={onRegisterSession}
      buttonText="Register Session"
    >
      <Content>
        <SessionConsent isVerified={policies?.verified} />
        {policies?.verified ? (
          <VerifiedSessionSummary game={theme.name} policies={policies} />
        ) : (
          <UnverifiedSessionSummary policies={policies} />
        )}
      </Content>
    </ExecutionContainer>
  );
}
