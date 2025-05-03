import { ResponseCodes, toArray } from "@cartridge/controller";
import { LayoutContent, Token, WalletType } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { ExecuteCtx } from "@/utils/connection";
import { Call, EstimateFee } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useEffect, useMemo } from "react";
import { TransactionDestination } from "./destination";
import { TransactionSending } from "./sending";
import { useToken } from "@/hooks/tokens";

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

  const call = useMemo(() => {
    const _call = transactions.find((tx) => tx.entrypoint === "transfer");

    if (_call) {
      const tokenAddress = _call.contractAddress;

      if (Array.isArray(_call.calldata)) {
        const destinationAddress = String(_call.calldata[0]);
        const amount = String(_call.calldata[1]);

        return {
          tokenAddress,
          destinationAddress,
          amount,
        };
      }
    }

    return undefined;
  }, [transactions]);

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const { token } = useToken(call?.tokenAddress!);

  const _token: Token = useMemo(
    () => ({
      metadata: { ...token, image: token.icon },
      balance: {
        // Convert bigint into number
        amount: Number(token.balance) / Math.pow(10, token.decimals),
        value: token.decimals,
        change: token.decimals,
      },
    }),
    [token],
  );

  useEffect(() => {
    console.log("token: ", _token);
  }, [_token]);

  if (!call) {
    return undefined;
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
        <TransactionDestination
          address={call.destinationAddress}
          wallet={WalletType.Controller}
        />

        <TransactionSending token={_token} />
      </LayoutContent>
    </ExecutionContainer>
  );
}
