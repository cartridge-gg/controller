import { ResponseCodes, toArray } from "@cartridge/controller";
import { Content } from "@/components/layout";
import { TransactionDuoIcon } from "@cartridge/ui-next";
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
      Icon={TransactionDuoIcon}
      title="Review Transaction"
      description={origin}
      executionError={ctx.error}
      transactions={ctx.transactions}
      transactionsDetail={ctx.transactionsDetail}
      onSubmit={onSubmit}
    >
      <Content>
        <TransactionSummary calls={transactions} />
      </Content>
    </ExecutionContainer>
  );
}
