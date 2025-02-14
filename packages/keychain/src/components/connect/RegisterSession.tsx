import { ExecutionContainer } from "@/components/ExecutionContainer";
import { SessionConsent } from "@/components/connect";
import { isPolicyRequired } from "@/components/connect/create/utils";
import { UnverifiedSessionSummary } from "@/components/session/UnverifiedSessionSummary";
import { VerifiedSessionSummary } from "@/components/session/VerifiedSessionSummary";
import { DEFAULT_SESSION_DURATION, NOW } from "@/const";
import { useConnection } from "@/hooks/connection";
import {
  type ContractType,
  CreateSessionProvider,
  type ParsedSessionPolicies,
} from "@/hooks/session";
import { Button, LayoutContent, SliderIcon } from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Call,
  type EstimateFee,
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
  const { controller, theme } = useConnection();
  const [duration, setDuration] = useState<bigint>(DEFAULT_SESSION_DURATION);
  const [transactions, setTransactions] = useState<Call[] | undefined>(
    undefined,
  );
  const [isEditable, setIsEditable] = useState(false);
  const [policyState, setPolicyState] = useState<ParsedSessionPolicies>(() => {
    // Set all contract policyState to authorized
    if (policies.contracts) {
      Object.keys(policies.contracts).forEach((address) => {
        if (policies.contracts![address]) {
          policies.contracts![address].methods.forEach((method, i) => {
            method.id = `${i}-${address}-${method.name}`;
            method.authorized = true;

            // If policy type is required, set the method as required(always true)
            if (
              isPolicyRequired({
                requiredPolicyTypes: requiredPolicies,
                policyType: policies.contracts![address].meta?.type,
              })
            ) {
              method.isRequired = true;
            }
          });
        }
      });
    }

    // Set all message policyState to authorized
    if (policies.messages) {
      policies.messages.forEach((message, i) => {
        message.id = `${i}-${message.domain.name}-${message.name}`;
        message.authorized = true;
      });
    }

    return policies;
  });

  const expiresAt = useMemo(() => {
    return duration + NOW;
  }, [duration]);

  const handleToggleMethod = useCallback(
    (address: string, id: string, authorized: boolean) => {
      if (!policyState.contracts) return;
      const contract = policyState.contracts[address];
      if (!contract) return;
      const method = contract.methods.find((method) => method.id === id);
      if (!method) return;
      method.authorized = authorized;
      setPolicyState({ ...policyState });
    },
    [policyState],
  );

  const handleToggleMessage = useCallback(
    (id: string, authorized: boolean) => {
      if (!policyState.messages) return;
      const message = policyState.messages.find((message) => message.id === id);
      if (!message) return;
      message.authorized = authorized;
      setPolicyState({ ...policyState });
    },
    [policyState],
  );

  const handleToggleEditable = useCallback(() => {
    setIsEditable(!isEditable);
  }, [isEditable]);

  useEffect(() => {
    if (!publicKey || !controller) {
      setTransactions(undefined);
    } else {
      controller
        .registerSessionCalldata(expiresAt, policyState, publicKey)
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
  }, [controller, expiresAt, policyState, publicKey]);

  const onRegisterSession = useCallback(
    async (maxFee?: EstimateFee) => {
      if (maxFee == undefined || !publicKey || !controller) {
        return;
      }

      const { transaction_hash } = await controller.registerSession(
        expiresAt,
        policyState,
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
    [controller, expiresAt, policyState, publicKey, onConnect],
  );

  if (!transactions) {
    return <div>Loading</div>;
  }

  return (
    <CreateSessionProvider
      value={{
        policies: policyState,
        onToggleMethod: handleToggleMethod,
        onToggleMessage: handleToggleMessage,
        isEditable,
      }}
    >
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
              onClick={handleToggleEditable}
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
          <SessionConsent isVerified={policyState?.verified} />
          {policyState?.verified ? (
            <VerifiedSessionSummary
              game={theme.name}
              contracts={policyState.contracts}
              messages={policyState.messages}
              duration={duration}
              onDurationChange={setDuration}
            />
          ) : (
            <UnverifiedSessionSummary
              contracts={policyState.contracts}
              messages={policyState.messages}
              duration={duration}
              onDurationChange={setDuration}
            />
          )}
        </LayoutContent>
      </ExecutionContainer>
    </CreateSessionProvider>
  );
}
