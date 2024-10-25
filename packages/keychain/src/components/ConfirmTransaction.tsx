import { useMemo, useState } from "react";
import { Policy, ResponseCodes } from "@cartridge/controller";
import { Content, FOOTER_MIN_HEIGHT } from "components/layout";
import { TransactionDuoIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { Policies } from "components/Policies";
import { ExecuteCtx } from "utils/connection";
import { addAddressPadding, num } from "starknet";
import { ExecutionContainer } from "components/ExecutionContainer";
import { CreateSession } from "./connect";

export function ConfirmTransaction() {
  const { controller, context, origin, policies, setContext } = useConnection();
  const [policiesUpdated, setIsPoliciesUpdated] = useState<boolean>(false);
  const ctx = context as ExecuteCtx;
  const account = controller;

  const onSubmit = async (maxFee: bigint) => {
    let { transaction_hash } = await account.execute(
      Array.isArray(ctx.transactions) ? ctx.transactions : [ctx.transactions],
      {
        maxFee: num.toHex(maxFee),
      },
    );
    ctx.resolve({
      code: ResponseCodes.SUCCESS,
      transaction_hash,
    });
    // resets execute ui
    setContext(undefined);
  };

  const calls = useMemo<Policy[]>(
    () =>
      (Array.isArray(ctx.transactions)
        ? ctx.transactions
        : [ctx.transactions]
      ).map((c) => ({
        target: c.contractAddress,
        method: c.entrypoint,
      })),
    [ctx.transactions],
  );

  const updateSession = useMemo(() => {
    if (policiesUpdated) return false;

    const txnsApproved = calls.every((transaction) =>
      policies.some(
        (policy) =>
          addAddressPadding(policy.target) ===
            addAddressPadding(transaction.target) &&
          policy.method === transaction.method,
      ),
    );

    // If calls are approved by dapp specified policies but not stored session
    // then prompt user to update session. This also accounts for expired sessions.
    return (
      txnsApproved &&
      !account.session(
        calls.map((t) => {
          return {
            target: t.target,
            method: t.method,
          } as Policy;
        }),
      )
    );
  }, [calls, policiesUpdated, policies, account]);

  if (updateSession) {
    return (
      <CreateSession isUpdate onConnect={() => setIsPoliciesUpdated(true)} />
    );
  }

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
        <Policies title="Transaction Details" policies={calls} />
      </Content>
    </ExecutionContainer>
  );
}
