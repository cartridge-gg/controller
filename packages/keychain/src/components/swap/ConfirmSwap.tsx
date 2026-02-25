import { useMemo } from "react";
import {
  LayoutContent,
  TokenCard,
  TokenSummary,
  TransferIcon,
} from "@cartridge/ui";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { ControllerError } from "@/utils/connection";
import { Call, FeeEstimate, getChecksumAddress } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useSwapTransaction } from "@/components/swap/swap";
import { useTokens } from "@/hooks/token";
import placeholder from "/placeholder.svg?url";

interface ConfirmSwapProps {
  onSubmit: (maxFee?: FeeEstimate) => Promise<void>;
  onError?: (error: ControllerError) => void;
  transactions: Call[];
  error?: ControllerError;
  origin: string;
}

export function ConfirmSwap({
  onSubmit,
  onError,
  transactions,
  error,
  origin,
}: ConfirmSwapProps) {
  const { tokens } = useTokens();
  const { isSwap, swapTransaction } = useSwapTransaction(transactions);
  // console.log("swapTransaction:", swapTransaction);

  const sellTokens = useMemo(
    () =>
      tokens
        .filter(
          (token) =>
            swapTransaction.sellAddress ==
            getChecksumAddress(token.metadata.address),
        )
        .map((token) => ({ ...token, decreasing: true, increasing: false })),
    [tokens, swapTransaction],
  );

  const buyTokens = useMemo(
    () =>
      tokens
        .filter(
          (token) =>
            swapTransaction.buyAddress ==
            getChecksumAddress(token.metadata.address),
        )
        .map((token) => ({ ...token, increasing: true, decreasing: false })),
    [tokens, swapTransaction],
  );

  console.log(
    swapTransaction.sellAddress,
    swapTransaction.buyAddress,
    tokens,
    sellTokens,
    buyTokens,
  );

  return (
    <ExecutionContainer
      icon={<TransferIcon />}
      title={"Review Swap"}
      description={origin}
      executionError={error}
      transactions={transactions}
      onSubmit={onSubmit}
      onError={onError}
    >
      <LayoutContent>
        {!isSwap ? (
          <TransactionSummary calls={transactions} />
        ) : (
          <>
            <TokenSummary title="Simulation Results">
              {[...sellTokens, ...buyTokens].map((token) => (
                <TokenCard
                  image={token.metadata.image || placeholder}
                  title={token.metadata.name}
                  amount={`${token.balance.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${token.metadata.symbol}`}
                  value={
                    token.balance.value
                      ? `$${token.balance.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      : ""
                  }
                  increasing={token.increasing}
                  decreasing={token.decreasing}
                  approximately
                  clickable={false}
                />
              ))}
            </TokenSummary>
          </>
        )}
      </LayoutContent>
    </ExecutionContainer>
  );
}
