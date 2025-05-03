import { ResponseCodes, toArray } from "@cartridge/controller";
import { LayoutContent, WalletType } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { ExecuteCtx } from "@/utils/connection";
import { Call, EstimateFee } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useEffect, useMemo } from "react";
import { TransactionDestination } from "./destination";

export function ConfirmTransaction() {
  const { controller, context, origin, setContext } = useConnection();
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

  useEffect(() => {
    console.log("transaction: ", transactions);
  }, [transactions]);

  const destinationAddress = useMemo(() => {
    const cd = transactions.find(
      (tx) => tx.entrypoint === "transfer",
    )?.calldata;

    if (Array.isArray(cd)) {
      return String(cd[0]);
    }

    return "";
  }, [transactions]);

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
        <TransactionDestination
          address={destinationAddress}
          wallet={WalletType.Controller}
        />
      </LayoutContent>
    </ExecutionContainer>
  );
}
