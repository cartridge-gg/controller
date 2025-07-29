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
  onClose?: () => void;
  transactions: Call[];
  executionError?: ControllerError;
}

export function ConfirmTransaction({
  onComplete,
  onError,
  onClose,
  transactions,
  executionError,
}: ConfirmTransactionProps) {
  const { controller, origin, policies } = useConnection();
  const account = controller;

  const [hasSession, setHasSession] = useState(false);
  const [skipSession, setSkipSession] = useState(false);

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

    const { transaction_hash } = await account.execute(transactions, maxFee);
    onComplete(transaction_hash);
  };

  if (policies && !hasSession && !skipSession) {
    return (
      <CreateSession
        isUpdate
        policies={policies!}
        onConnect={async () => {
          const transaction_hash = await executeCore(transactions);
          onComplete(transaction_hash);
        }}
        onSkip={() => setSkipSession(true)}
      />
    );
  }

  return (
    <ExecutionContainer
      title={`Review Transaction${transactions.length > 1 ? "s" : ""}`}
      description={origin}
      executionError={executionError}
      transactions={transactions}
      onSubmit={onSubmit}
      onError={onError}
      onClose={onClose}
    >
      <LayoutContent>
        <TransactionSummary calls={transactions} />
      </LayoutContent>
    </ExecutionContainer>
  );
}
