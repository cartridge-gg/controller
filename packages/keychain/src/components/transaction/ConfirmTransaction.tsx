import { ResponseCodes, toArray } from "@cartridge/controller";
import { LayoutContent } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { ExecuteCtx } from "@/utils/connection";
import { num } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";

export function ConfirmTransaction() {
  const { controller, context, origin, setContext } = useConnection();
  const ctx = context as ExecuteCtx;
  const account = controller;
  const transactions = toArray(ctx.transactions);

  const onSubmit = async (maxFee?: bigint) => {
    if (maxFee === undefined || !account) {
      return;
    }

    const { transaction_hash } = await account.execute(transactions, {
      maxFee: num.toHex(maxFee),
    });
    ctx.resolve?.({
      code: ResponseCodes.SUCCESS,
      transaction_hash,
    });
    // resets execute ui
    setContext(undefined);
  };

  return (
    <ExecutionContainer
      title={`Review Transaction${transactions.length > 1 ? "s" : ""}`}
      description={origin}
      executionError={ctx.error}
      transactions={ctx.transactions}
      transactionsDetail={ctx.transactionsDetail}
      onSubmit={onSubmit}
    >
      <LayoutContent>
        <TransactionSummary calls={transactions} />
      </LayoutContent>
    </ExecutionContainer>
  );
}
