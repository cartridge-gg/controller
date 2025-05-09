import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useUsername } from "@/hooks/account";
import { useToken } from "@/hooks/tokens";
import { normalizeAddress } from "@/utils/address";
import { LayoutContent, Skeleton, WalletType } from "@cartridge/ui";
import { useMemo } from "react";
import { Call, EstimateFee, uint256, Uint256 } from "starknet";
import { TransactionDestination } from "../destination";
import { TransactionSending } from "../sending";
import { TransactionSummary } from "../TransactionSummary";
import { ExecuteCtx } from "@/utils/connection";
import { useConnection } from "@/hooks/connection";

export const ERC20ConfirmTransaction = ({
  transactions,
  onSubmit,
}: {
  transactions: Call[];
  onSubmit: (maxFee?: EstimateFee) => Promise<void>;
}) => {
  const { context } = useConnection();
  const ctx = context as ExecuteCtx;

  const tokenData = useMemo(() => {
    const _call = transactions.find((tx) => tx.entrypoint === "transfer");

    if (_call) {
      const tokenAddress = _call.contractAddress;

      // calldata: [to, formattedAmount]
      if (Array.isArray(_call.calldata)) {
        const destinationAddress = normalizeAddress(String(_call.calldata[0]));

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
  const { token, isLoading } = useToken(tokenData?.tokenAddress as string);

  const { username: destinationUsername } = useUsername(
    tokenData?.destinationAddress || "",
  );

  const amount = useMemo(() => {
    if (!isLoading && tokenData?.amount && token?.decimals) {
      const result = Number(tokenData.amount) / Math.pow(10, token.decimals);
      return result;
    }
  }, [tokenData, token, isLoading]);

  if (!tokenData) {
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
          name={destinationUsername}
          address={tokenData.destinationAddress}
          wallet={WalletType.Controller}
        />
        {isLoading ? (
          <Skeleton className="w-full h-[384px]" />
        ) : token && amount ? (
          <TransactionSending token={token} amount={amount} />
        ) : (
          <TransactionSummary calls={transactions} />
        )}
      </LayoutContent>
    </ExecutionContainer>
  );
};
