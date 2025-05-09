import { ResponseCodes, toArray } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { ExecuteCtx } from "@/utils/connection";
import { Call, EstimateFee } from "starknet";
import { useMemo } from "react";
import { ERC20ConfirmTransaction } from "./confirm-transaction/erc20";
import { DefaultConfirmTransaction } from "./confirm-transaction/default";

export function ConfirmTransaction() {
  const { controller, context, setContext } = useConnection();
  const ctx = context as ExecuteCtx;
  const account = controller;
  const transactions = toArray(ctx.transactions) as Call[];

  const onSubmit = async (maxFee?: EstimateFee) => {
    if (maxFee === undefined || !account) {
      return;
    }

    const { transaction_hash } = await account.execute(transactions, maxFee);
    ctx.resolve?.({
      code: ResponseCodes.SUCCESS,
      transaction_hash,
    });
    // resets execute ui
    setContext(undefined);
  };

  const isERC20 = useMemo(() => {
    return transactions.find((tx) => tx.entrypoint === "transfer");
  }, [transactions]);

  if (isERC20) {
    return (
      <ERC20ConfirmTransaction
        transactions={transactions}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <DefaultConfirmTransaction
      transactions={transactions}
      onSubmit={onSubmit}
    />
  );
}
