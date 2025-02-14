import { ExecutionContainer } from "@/components/ExecutionContainer";
import { SessionConsent } from "@/components/connect";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { NOW } from "@/const";
import { useConnection } from "@/hooks/connection";
import { type ParsedSessionPolicies, useCreateSession } from "@/hooks/session";
import { LayoutContent } from "@cartridge/ui-next";
import { useCallback, useEffect, useState } from "react";
import {
  type Call,
  type EstimateFee,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";

export function RegisterSession({
  policies,
  onConnect,
  publicKey,
}: {
  policies: ParsedSessionPolicies;
  onConnect: (transaction_hash: string, expiresAt: bigint) => void;
  publicKey?: string;
}) {
  const { controller, theme } = useConnection();
  const { duration } = useCreateSession();
  const [transactions, setTransactions] = useState<Call[] | undefined>(
    undefined,
  );

  const expiresAt = duration + NOW;

  useEffect(() => {
    if (!publicKey || !controller) {
      setTransactions(undefined);
    } else {
      controller
        .registerSessionCalldata(expiresAt, policies, publicKey)
        .then((calldata) => {
          setTransactions([
            {
              contractAddress: controller.address(),
              entrypoint: "register_session",
              calldata,
            },
          ]);
        });
    }
  }, [controller, expiresAt, policies, publicKey]);

  const onRegisterSession = useCallback(
    async (maxFee?: EstimateFee) => {
      if (maxFee == undefined || !publicKey || !controller) {
        return;
      }

      // Set all contract policies to authorized
      if (policies.contracts) {
        Object.keys(policies.contracts).forEach((address) => {
          if (policies.contracts![address]) {
            policies.contracts![address].methods.forEach((method) => {
              method.authorized = true;
            });
          }
        });
      }

      // Set all message policies to authorized
      if (policies.messages) {
        policies.messages.forEach((message) => {
          message.authorized = true;
        });
      }

      const { transaction_hash } = await controller.registerSession(
        expiresAt,
        policies,
        publicKey,
        maxFee,
      );

      await controller.provider.waitForTransaction(transaction_hash, {
        retryInterval: 1000,
        successStates: [
          TransactionExecutionStatus.SUCCEEDED,
          TransactionFinalityStatus.ACCEPTED_ON_L2,
        ],
      });

      onConnect(transaction_hash, expiresAt);
    },
    [controller, expiresAt, policies, publicKey, onConnect],
  );

  if (!transactions) {
    return <div>Loading</div>;
  }

  return (
    <ExecutionContainer
      title="Register Session"
      transactions={transactions}
      onSubmit={onRegisterSession}
      buttonText="Register Session"
    >
      <LayoutContent>
        <SessionConsent isVerified={policies?.verified} />
        {policies?.verified ? (
          <VerifiedSessionSummary
            game={theme.name}
            contracts={policies.contracts}
            messages={policies.messages}
          />
        ) : (
          <UnverifiedSessionSummary
            contracts={policies.contracts}
            messages={policies.messages}
          />
        )}
      </LayoutContent>
    </ExecutionContainer>
  );
}
