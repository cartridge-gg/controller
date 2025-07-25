import { toArray } from "@cartridge/controller";
import { LayoutContent } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { ExecuteCtx } from "@/utils/connection";
import { EstimateFee } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { CreateSession } from "../connect";
import { executeCore } from "@/utils/connection/execute";
import { useEffect, useState } from "react";

export function ConfirmTransaction({
  onComplete,
}: {
  onComplete: (transaction_hash: string) => void;
}) {
  const { controller, context, origin, policies } = useConnection();
  const ctx = context as ExecuteCtx;
  const account = controller;
  const transactions = toArray(ctx.transactions);
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
          const transaction_hash = await executeCore(ctx.transactions);
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
      executionError={ctx.error}
      transactions={transactions}
      feeEstimate={ctx.feeEstimate}
      onSubmit={onSubmit}
    >
      <LayoutContent>
        <TransactionSummary calls={transactions} />
      </LayoutContent>
    </ExecutionContainer>
  );
}
