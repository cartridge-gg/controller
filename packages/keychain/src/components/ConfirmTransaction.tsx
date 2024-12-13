import { useEffect, useMemo, useState } from "react";
import { ResponseCodes, SessionPolicies, toArray } from "@cartridge/controller";
import { Content, FOOTER_MIN_HEIGHT } from "@/components/layout";
import { TransactionDuoIcon } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { Policies } from "@/components/Policies";
import { ExecuteCtx } from "@/utils/connection";
import { getChecksumAddress, num } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { CreateSession } from "./connect";

export function ConfirmTransaction() {
  const { controller, context, origin, policies, setContext } = useConnection();
  const [policiesUpdated, setIsPoliciesUpdated] = useState<boolean>(false);
  const [updateSession, setUpdateSession] = useState<boolean>(false);
  const ctx = context as ExecuteCtx;
  const account = controller;

  const onSubmit = async (maxFee?: bigint) => {
    if (maxFee === undefined || !account) {
      return;
    }

    let { transaction_hash } = await account.execute(
      toArray(ctx.transactions),
      {
        maxFee: num.toHex(maxFee),
      },
    );
    ctx.resolve?.({
      code: ResponseCodes.SUCCESS,
      transaction_hash,
    });
    // resets execute ui
    setContext(undefined);
  };

  const callPolicies = useMemo<SessionPolicies>(
    () => ({
      contracts: Object.fromEntries(
        toArray(ctx.transactions).map((c) => [
          getChecksumAddress(c.contractAddress),
          { methods: [{ entrypoint: c.entrypoint }] },
        ]),
      ),
    }),
    [ctx.transactions],
  );

  useEffect(() => {
    if (policiesUpdated) {
      setUpdateSession(false);
      return;
    }

    const entries = Object.entries(callPolicies.contracts || {});
    const txnsApproved = entries.every(([target, policy]) => {
      const contract = policies?.contracts?.[target];
      if (!contract) return false;
      return policy.methods.every((method) =>
        contract.methods.some((m) => m.entrypoint === method.entrypoint),
      );
    });

    // If calls are approved by dapp specified policies but not stored session
    // then prompt user to update session. This also accounts for expired sessions.
    if (txnsApproved && account) {
      account.session(callPolicies).then((hasSession) => {
        setUpdateSession(!hasSession);
      });
    } else {
      setUpdateSession(false);
    }
  }, [callPolicies, policiesUpdated, policies, account]);

  if (updateSession && policies) {
    return (
      <CreateSession
        policies={policies}
        isUpdate
        onConnect={() => setIsPoliciesUpdated(true)}
      />
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
