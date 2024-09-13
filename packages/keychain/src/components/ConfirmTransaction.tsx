import { useMemo } from "react";
import { Policy, ResponseCodes } from "@cartridge/controller";
import { Content, FOOTER_MIN_HEIGHT } from "components/layout";
import { TransactionDuoIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { Policies } from "components/Policies";
import { ExecuteCtx } from "utils/connection";
import { num } from "starknet";
import { ExecutionContainer } from "components/ExecutionContainer";

export function ConfirmTransaction() {
  const { controller, context, origin } = useConnection();
  const ctx = context as ExecuteCtx;
  const account = controller.account;

  const onSubmit = async (maxFee: bigint) => {
    let { transaction_hash } = await account.execute(ctx.transactions, {
      maxFee: num.toHex(maxFee),
    });
    ctx.resolve({
      code: ResponseCodes.SUCCESS,
      transaction_hash,
    });
  };

  const policies = useMemo<Policy[]>(
    () =>
      (Array.isArray(ctx.transactions)
        ? ctx.transactions
        : [ctx.transactions]
      ).map((c) => ({ target: c.contractAddress, method: c.entrypoint })),
    [ctx.transactions],
  );

  return (
    <ExecutionContainer
      Icon={TransactionDuoIcon}
      title="Confirm Transaction"
      description={origin}
      executionError={ctx.error}
      transactions={ctx.transactions}
      transactionsDetail={ctx.transactionsDetail}
      onSubmit={onSubmit}
    >
      <Content pb={FOOTER_MIN_HEIGHT}>
        <Policies title="Transaction Details" policies={policies} />
      </Content>
    </ExecutionContainer>
  );
}
