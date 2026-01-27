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
  hasApprovalPolicies,
} from "@/hooks/session";
import { Button, LayoutContent, SliderIcon } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Call,
  type FeeEstimate,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
} from "starknet";
import { SpendingLimitPage } from "./SpendingLimitPage";

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const { duration, isEditable, onToggleEditable } = useCreateSession();

  const hasTokenApprovals = useMemo(
    () => hasApprovalPolicies(policies),
    [policies],
  );

  const defaultStep = useMemo<"summary" | "spending-limit">(() => {
    return policies?.verified && hasTokenApprovals
      ? "spending-limit"
      : "summary";
  }, [policies?.verified, hasTokenApprovals]);

  const [step, setStep] = useState<"summary" | "spending-limit">(defaultStep);

  useEffect(() => {
    setStep(defaultStep);
  }, [defaultStep]);

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

      try {
        setError(undefined);
        setIsConnecting(true);

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
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsConnecting(false);
      }
    },
    [controller, expiresAt, policies, publicKey, onConnect, origin],
  );

  // Handler for the spending limit page to proceed to registration
  const handleSpendingLimitConfirm = useCallback(() => {
    if (hasTokenApprovals && step === "spending-limit") {
      setStep("summary");
    }
  }, [hasTokenApprovals, step]);

  if (!transactions) {
    return <div>Loading</div>;
  }

  // Show spending limit page for verified sessions with token approvals
  if (hasTokenApprovals && step === "spending-limit") {
    return (
      <SpendingLimitPage
        policies={policies}
        isConnecting={isConnecting}
        error={error}
        onBack={() => setStep("summary")}
        onConnect={handleSpendingLimitConfirm}
      />
    );
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
            contracts={policies.contracts}
            messages={policies.messages}
          />
        )}
      </LayoutContent>
    </ExecutionContainer>
  );
};
