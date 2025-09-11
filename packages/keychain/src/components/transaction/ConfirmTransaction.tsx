import { LayoutContent } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { ControllerError } from "@/utils/connection";
import { Call, FeeEstimate, getChecksumAddress } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { CreateSession } from "../connect";
import { executeCore } from "@/utils/connection/execute";
import { useEffect, useState } from "react";
import { PageLoading } from "../Loading";

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
  const {
    controller,
    origin,
    policies,
    isSessionActive,
    refreshSessionStatus,
  } = useConnection();
  const account = controller;

  const [skipSession, setSkipSession] = useState(false);
  const [error, setError] = useState<ControllerError | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [canSessionCoverCalls, setCanSessionCoverCalls] =
    useState<boolean>(false);

  // Normalize addresses using starknet's getChecksumAddress and converting to lowercase
  const normalizeAddress = (address: string): string => {
    return getChecksumAddress(address).toLowerCase();
  };

  // Check if the new session policies would cover the transaction calls
  useEffect(() => {
    if (controller && policies && transactions.length > 0) {
      // Check if a session with the new policies would cover these calls
      // We'll simulate this by checking if the policies include the contracts/methods being called
      const checkCoverage = () => {
        if (!policies.contracts) {
          return false;
        }

        return transactions.every((call) => {
          const normalizedCallAddress = normalizeAddress(call.contractAddress);

          // Check if any contract in policies matches this address
          const contract = Object.entries(policies.contracts!).find(
            ([address]) => normalizeAddress(address) === normalizedCallAddress,
          )?.[1];

          if (!contract) {
            return false;
          }

          // Check if the specific method is covered
          const methodName = call.entrypoint;
          const methodCovered = contract.methods.some(
            (method) => method.entrypoint === methodName,
          );

          return methodCovered;
        });
      };

      setCanSessionCoverCalls(checkCoverage());
      setLoading(false);
    } else {
      setCanSessionCoverCalls(false);
      setLoading(false);
    }
  }, [controller, policies, transactions]);

  const onSubmit = async (maxFee?: FeeEstimate) => {
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

  if (loading) {
    return <PageLoading />;
  }

  // Only show session update if:
  // 1. Policies exist
  // 2. Current session doesn't cover the policies (isSessionActive is false)
  // 3. The new session would actually cover the transaction calls
  // 4. User hasn't skipped the session update
  if (policies && !isSessionActive && canSessionCoverCalls && !skipSession) {
    return (
      <CreateSession
        isUpdate
        policies={policies!}
        onConnect={async () => {
          try {
            // Refresh session status after session update
            refreshSessionStatus();
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
