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
import { useSwapTransaction } from "@/components/swap/swap";
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
  const { isSwap, swapTransaction } = useSwapTransaction(transactions);
  const { tokenSwapData } = useTokenSwapData([
    {
      address: swapTransaction.sellAddress,
      amount: swapTransaction.sellAmount,
    },
    {
      address: swapTransaction.buyAddress,
      amount: swapTransaction.buyAmount,
    },
  ]);
  // console.log("swapTransaction:", swapTransaction);

  console.log(
    swapTransaction.sellAddress,
    swapTransaction.buyAddress,
    tokenSwapData,
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
              {tokenSwapData.map((token) => (
                <TokenCard
                  key={token.address}
                  image={token.image || placeholder}
                  title={token.name}
                  amount={`${token.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${token.symbol}`}
                  value={token.value ? `$${token.value.toFixed(2)}` : ""}
                  increasing={token.address === swapTransaction.buyAddress}
                  decreasing={token.address === swapTransaction.sellAddress}
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
