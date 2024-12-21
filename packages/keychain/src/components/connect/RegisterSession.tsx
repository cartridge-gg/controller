import { Content } from "@/components/layout";
import { useCallback, useState, useEffect } from "react";
import { useConnection } from "@/hooks/connection";
import { SessionConsent } from "@/components/connect";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import {
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { SESSION_EXPIRATION } from "@/const";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { ParsedSessionPolicies } from "@/hooks/session";

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
  const [transactions, setTransactions] = useState<
    | {
        contractAddress: string;
        entrypoint: string;
        calldata: string[];
      }[]
    | undefined
  >(undefined);

  useEffect(() => {
    if (!publicKey || !controller) {
      setTransactions(undefined);
    } else {
      controller
        .registerSessionCalldata(expiresAt, policies, publicKey)
        .then((calldata) => {
          setTransactions([
            {
              contractAddress: controller.address,
              entrypoint: "register_session",
              calldata,
            },
          ]);
        });
    }
  }, [controller, expiresAt, policies, publicKey]);

  const onRegisterSession = useCallback(
    async (maxFee?: bigint) => {
      if (maxFee == undefined || !publicKey || !controller) {
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
