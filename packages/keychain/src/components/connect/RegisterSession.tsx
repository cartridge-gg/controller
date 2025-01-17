import { LayoutContent } from "@cartridge/ui";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useConnection } from "@/hooks/connection";
import { SessionConsent } from "@/components/connect";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import {
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { DEFAULT_SESSION_DURATION, NOW } from "@/const";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { ParsedSessionPolicies } from "@/hooks/session";

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
  const [duration, setDuration] = useState<bigint>(DEFAULT_SESSION_DURATION);
  const [transactions, setTransactions] = useState<
    | {
        contractAddress: string;
        entrypoint: string;
        calldata: string[];
      }[]
    | undefined
  >(undefined);

  const expiresAt = useMemo(() => {
    return duration + NOW;
  }, [duration]);

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

      await controller.waitForTransaction(transaction_hash, {
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
            duration={duration}
            onDurationChange={setDuration}
          />
        ) : (
          <UnverifiedSessionSummary
            contracts={policies.contracts}
            messages={policies.messages}
            duration={duration}
            onDurationChange={setDuration}
          />
        )}
      </LayoutContent>
    </ExecutionContainer>
  );
}
