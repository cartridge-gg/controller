import { LayoutContent } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { ControllerError } from "@/utils/connection";
import { Call, FeeEstimate } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { CreateSession } from "../connect";
import { executeCore } from "@/utils/connection/execute";
import { useEffect, useState } from "react";
import { PageLoading } from "../Loading";
import { ErrorCode } from "@cartridge/controller-wasm";
import { useToast } from "@/context/toast";
import { humanizeString } from "@cartridge/controller";

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
  const { toast } = useToast();

  const [hasSession, setHasSession] = useState(false);
  const [skipSession, setSkipSession] = useState(false);
  const [error, setError] = useState<ControllerError | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [needsSessionRefresh, setNeedsSessionRefresh] = useState(false);

  useEffect(() => {
    if (controller && policies) {
      controller
        .isRequestedSession(origin, policies)
        .then(setHasSession)
        .finally(() => setLoading(false));
      return;
    }
    if (controller && !policies) {
      setHasSession(true);
    }
    setLoading(false);
  }, [controller, policies, origin]);

  // Check if we have a SessionRefreshRequired error
  useEffect(() => {
    const currentError = error || executionError;
    if (currentError?.code === ErrorCode.SessionRefreshRequired) {
      setNeedsSessionRefresh(true);
      setSkipSession(false); // Reset skip session when refresh is needed
    }
  }, [error, executionError]);

  const onSubmit = async (maxFee?: FeeEstimate) => {
    if (maxFee === undefined || !account) {
      return;
    }

    const toastId = JSON.stringify(transactions);
    toast.transaction("", {
      status: "confirming",
      label: `${humanizeString(transactions[0].entrypoint)}${transactions.length > 1 ? ` +${transactions.length - 1}` : ""}`,
      toastId,
    });

    try {
      const { transaction_hash } = await account.execute(transactions, maxFee);
      onComplete(transaction_hash);
      toast.transaction("", {
        status: "confirmed",
        toastId,
      });
    } catch (e) {
      const submitError = e as ControllerError;
      console.error("Transaction execution failed:", submitError);
      setError(submitError);
      toast.error("", {
        message: "Transaction execution failed",
        toastId,
      });
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  // Show session refresh UI if SessionRefreshRequired error occurred
  if (needsSessionRefresh && policies && !skipSession) {
    return (
      <CreateSession
        isUpdate
        policies={policies}
        onConnect={async () => {
          try {
            // Clear the error state
            setError(undefined);
            setNeedsSessionRefresh(false);

            // Retry the execution after session refresh
            const res = await executeCore(origin, transactions);
            onComplete(res.transaction_hash);
          } catch (e) {
            const retryError = e as ControllerError;
            console.error(
              "Transaction execution failed after session refresh:",
              retryError,
            );

            setError(retryError);
            onError?.(retryError);
          }
        }}
        onSkip={() => {
          setSkipSession(true);
          setNeedsSessionRefresh(false);
        }}
      />
    );
  }

  // Show session creation for initial session setup
  if (policies && !hasSession && !skipSession && !needsSessionRefresh) {
    return (
      <CreateSession
        isUpdate
        policies={policies}
        onConnect={() => {
          // Just mark that we've created a session, don't execute the transaction
          // The transaction will be executed when user clicks Submit on ExecutionContainer
          setSkipSession(true); // Move past the session creation screen
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
