import { ExecutionContainer } from "@/components/ExecutionContainer";
import { SessionConsent } from "@/components/connect";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { now } from "@/constants";
import { CreateSessionProvider } from "@/context/session";
import { useConnection } from "@/hooks/connection";
import {
  type ContractType,
  type ParsedSessionPolicies,
  useCreateSession,
} from "@/hooks/session";
import { Button, LayoutContent, SliderIcon } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Call,
  type FeeEstimate,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";

const requiredPolicies: Array<ContractType> = ["VRF"];

export function RegisterSession({
  policies,
  onConnect,
  publicKey,
}: {
  policies: ParsedSessionPolicies;
  onConnect: (transaction_hash: string, expiresAt: bigint) => void;
  publicKey?: string;
}) {
  return (
    <CreateSessionProvider
      initialPolicies={policies}
      requiredPolicies={requiredPolicies}
    >
      <RegisterSessionLayout onConnect={onConnect} publicKey={publicKey} />
    </CreateSessionProvider>
  );
}

const RegisterSessionLayout = ({
  onConnect,
  publicKey,
}: {
  onConnect: (transaction_hash: string, expiresAt: bigint) => void;
  publicKey?: string;
}) => {
  const { policies } = useCreateSession();
  const { controller, theme, origin } = useConnection();
  const [transactions, setTransactions] = useState<Call[] | undefined>(
    undefined,
  );

  const { duration, isEditable, onToggleEditable } = useCreateSession();

  const expiresAt = useMemo(() => {
    return duration + now();
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
              contractAddress: controller.address(),
              entrypoint: "register_session",
              calldata,
            },
          ]);
        });
    }
  }, [controller, expiresAt, policies, publicKey]);

  const onRegisterSession = useCallback(
    async (maxFee?: FeeEstimate) => {
      if (maxFee == undefined || !publicKey || !controller) {
        return;
      }

      const { transaction_hash } = await controller.registerSession(
        origin,
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
    [controller, expiresAt, policies, publicKey, onConnect, origin],
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
      right={
        !isEditable ? (
          <Button
            variant="icon"
            className="size-10 relative bg-background-200"
            onClick={onToggleEditable}
          >
            <SliderIcon
              color="white"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </Button>
        ) : undefined
      }
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
            game={theme?.name}
            contracts={policies.contracts}
            messages={policies.messages}
          />
        )}
      </LayoutContent>
    </ExecutionContainer>
  );
};
