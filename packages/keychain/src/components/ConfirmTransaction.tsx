import { useMemo, useState } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { Content, FOOTER_MIN_HEIGHT } from "components/layout";
import { TransactionDuoIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { Policies } from "components/Policies";
import { ExecuteCtx } from "utils/connection";
import { addAddressPadding, num } from "starknet";
import { ExecutionContainer } from "components/ExecutionContainer";
import { CreateSession } from "./connect";
import { CallPolicy } from "@cartridge/account-wasm";

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

  const callPolicies = useMemo<CallPolicy[]>(
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

    const txnsApproved = callPolicies.every((call) =>
      policies.some(
        (policy) =>
          "target" in policy &&
          "method" in policy &&
          addAddressPadding(policy.target) === addAddressPadding(call.target) &&
          policy.method === call.method,
      ),
    );

    // If calls are approved by dapp specified policies but not stored session
    // then prompt user to update session. This also accounts for expired sessions.
    return txnsApproved && !account.session(callPolicies);
  }, [callPolicies, policiesUpdated, policies, account]);

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
        <Policies title="Transaction Details" policies={callPolicies} />
      </Content>
    </ExecutionContainer>
  );
}
