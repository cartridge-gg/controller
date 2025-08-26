import { LayoutContent } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { ControllerError } from "@/utils/connection";
import { Call, EstimateFee } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { CreateSession } from "../connect";
import { executeCore } from "@/utils/connection/execute";
import { useEffect, useState } from "react";

interface ConfirmTransactionProps {
  onComplete: (transaction_hash: string) => void;
  onError?: (error: ControllerError) => void;
  transactions: Call[];
  executionError?: ControllerError;
}

export function ConfirmTransaction({
  onComplete,
  onError,
  transactions,
  executionError,
}: ConfirmTransactionProps) {
  const { controller, origin, policies } = useConnection();
  const account = controller;

  const [hasSession, setHasSession] = useState(false);
  const [skipSession, setSkipSession] = useState(false);
  const [error, setError] = useState<ControllerError | undefined>(undefined);

  useEffect(() => {
    if (controller && policies) {
      controller.isRequestedSession(policies).then(setHasSession);
    } else if (controller && !policies) {
      setHasSession(true);
    }
  }, [controller, policies]);

  const onSubmit = async (maxFee?: EstimateFee) => {
    if (maxFee === undefined || !account) {
      return;
    }

    try {
      const { transaction_hash } = await account.execute(transactions, maxFee);
      onComplete(transaction_hash);
    } catch (e) {
      console.error(e);
      setError(e as ControllerError);
    }
  };

  if (policies && !hasSession && !skipSession) {
    return (
      <CreateSession
        isUpdate
        policies={policies!}
        onConnect={async () => {
          try {
            const res = await executeCore(transactions);
            onComplete(res.transaction_hash);
          } catch (e) {
            console.error(
              "Transaction execution failed after session update:",
              e,
            );
            onError?.(e as ControllerError);
          }
        }}
        onSkip={() => setSkipSession(true)}
      />
    );
  }

  return (
    <ExecutionContainer
      title={`Review Transaction${transactions.length > 1 ? "s" : ""}`}
      description={origin}
      executionError={error || executionError}
      transactions={transactions}
      onSubmit={onSubmit}
      onError={onError}
    >
      <LayoutContent>
        <TransactionSummary calls={transactions} />
      </LayoutContent>
    </ExecutionContainer>
  );
}
