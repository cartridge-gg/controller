import {
  LayoutContent,
  TokenCard,
  TokenSummary,
  TransferIcon,
} from "@cartridge/ui";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { ControllerError } from "@/utils/connection";
import { Call, FeeEstimate } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useSwapTransactions } from "@/components/swap/swap";
import { useTokenSwapData } from "@/hooks/token";
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
  const { isSwap, swapTransactions, additionalMethodCount } =
    useSwapTransactions(transactions);
  const { tokenSwapData } = useTokenSwapData([
    ...swapTransactions.selling,
    ...swapTransactions.buying,
  ]);
  // console.log("swapTransaction:", swapTransaction);

  console.log(`SWAPS:`, swapTransactions, tokenSwapData);

  return (
    <ExecutionContainer
      icon={<TransferIcon />}
      title={"Review Swap"}
      description={origin}
      executionError={error}
      transactions={transactions}
      onSubmit={onSubmit}
      onError={onError}
      buttonText={`Swap ${additionalMethodCount > 0 ? `+ ${additionalMethodCount}` : ""}`}
    >
      <LayoutContent>
        {!isSwap ? (
          <TransactionSummary calls={transactions} />
        ) : (
          <>
            <TokenSummary title="Simulation Results">
              {tokenSwapData.map((token) => (
                <TokenCard
                  key={token.address}
                  image={token.image || placeholder}
                  title={token.name}
                  amount={`${token.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${token.symbol}`}
                  value={
                    !token.value
                      ? "$0.00"
                      : token.value < 0.01
                        ? "<$0.01"
                        : `~$${token.value.toFixed(2)}`
                  }
                  increasing={swapTransactions.buying.some(
                    (t) => t.address === token.address,
                  )}
                  decreasing={swapTransactions.selling.some(
                    (t) => t.address === token.address,
                  )}
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
