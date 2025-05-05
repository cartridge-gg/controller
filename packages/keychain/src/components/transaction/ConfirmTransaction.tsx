import { ResponseCodes, toArray } from "@cartridge/controller";
import { LayoutContent, Token, WalletType } from "@cartridge/ui-next";
import { useConnection } from "@/hooks/connection";
import { ExecuteCtx } from "@/utils/connection";
import { Call, EstimateFee, Uint256, uint256 } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useMemo } from "react";
import { TransactionDestination } from "./destination";
import { TransactionSending } from "./sending";
import { useToken } from "@/hooks/tokens";

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

  const call = useMemo(() => {
    const _call = transactions.find((tx) => tx.entrypoint === "transfer");

    if (_call) {
      const tokenAddress = _call.contractAddress;

      if (Array.isArray(_call.calldata)) {
        const destinationAddress = String(_call.calldata[0]);
        const _amount = _call.calldata[1] as Uint256;

        const amount = uint256.uint256ToBN(_amount);

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
        // Not sure how to convert
        value: Number(token.price?.amount) / Math.pow(10, token.decimals),
        change: token.decimals,
      },
    }),
    [token],
  );

  const amount = useMemo(() => {
    // convert "0x38d7ea4c68000" into number
    const result = Number(call?.amount) / Math.pow(10, token.decimals);
    return result;
  }, [call, token]);

  if (!call) {
    return undefined;
  }

  return (
    <ExecutionContainer
      title={`Review Transaction${transactions.length > 1 ? "s" : ""}`}
      executionError={ctx.error}
      transactions={transactions}
      feeEstimate={ctx.feeEstimate}
      onSubmit={onSubmit}
      buttonText="CONFIRM"
      className="select-none"
    >
      <LayoutContent className="gap-4 pt-1">
        <TransactionDestination
          address={call.destinationAddress}
          wallet={WalletType.Controller}
        />

        <TransactionSending token={_token} amount={amount} />
      </LayoutContent>
    </ExecutionContainer>
  );
}
