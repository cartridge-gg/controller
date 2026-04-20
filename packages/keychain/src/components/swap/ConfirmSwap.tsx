import {
  LayoutContent,
  TokenCard,
  TokenSummary,
  TransferIcon,
} from "@cartridge/controller-ui";
import { TransactionSummary } from "@/components/transaction/TransactionSummary";
import { ControllerError } from "@/utils/connection";
import { Call, FeeEstimate } from "starknet";
import { ExecutionContainer } from "@/components/ExecutionContainer";
import { useSwapTransactions } from "@/components/swap/swap";
import { TokenSwapData, useTokenSwapData } from "@/hooks/token";
import placeholder from "/placeholder.svg?url";
import { formatTokenValue, formatUsdValue } from "@/utils/format-value";

interface ConfirmSwapProps {
  onSubmit: (maxFee?: FeeEstimate) => Promise<void>;
  onError?: (error: ControllerError) => void;
  transactions: Call[];
  executionError?: ControllerError;
  origin: string;
}

export function ConfirmSwap({
  onSubmit,
  onError,
  transactions,
  executionError,
  origin,
}: ConfirmSwapProps) {
  const { isSwap, swapTransfers } = useSwapTransactions(transactions);
  const { tokenSwapData: sellingSwapData } = useTokenSwapData(
    swapTransfers.selling,
  );
  const { tokenSwapData: buyingSwapData } = useTokenSwapData(
    swapTransfers.buying,
  );

  const formatAmount = (token: TokenSwapData) => {
    return `${token.amount === "ALL" ? "ALL" : formatTokenValue(token.amount, 5, token.symbol)} ${token.symbol}`;
  };

  return (
    <ExecutionContainer
      icon={<TransferIcon />}
      title={"Review Swap"}
      description={origin}
      transactions={transactions}
      executionError={executionError}
      onSubmit={onSubmit}
      onError={onError}
      buttonText="Swap"
      additionalFees={sellingSwapData.map((token) => ({
        label: "Cost",
        contractAddress: token.address,
        amount: typeof token?.amount === "number" ? token.amount : 0,
        usdValue: formatUsdValue(token.value),
        decimals: 2,
      }))}
    >
      <LayoutContent>
        {!isSwap ? (
          <TransactionSummary calls={transactions} isExpanded />
        ) : (
          <>
            <TokenSummary title="Simulation Results" className="flex-none">
              {sellingSwapData.map((token) => (
                <TokenCard
                  key={token.address}
                  title={token.name}
                  image={token.image || placeholder}
                  roundedImage={token.rounded}
                  amount={formatAmount(token)}
                  value={
                    typeof token.value === "number"
                      ? formatUsdValue(token.value)
                      : undefined
                  }
                  clickable={false}
                  decreasing
                />
              ))}
              {buyingSwapData.map((token) => (
                <TokenCard
                  key={token.address}
                  title={token.name}
                  image={token.image || placeholder}
                  roundedImage={token.rounded}
                  amount={formatAmount(token)}
                  value={
                    typeof token.value === "number"
                      ? formatUsdValue(token.value)
                      : undefined
                  }
                  clickable={false}
                  increasing
                />
              ))}
            </TokenSummary>
            <TransactionSummary calls={transactions} />
          </>
        )}
      </LayoutContent>
    </ExecutionContainer>
  );
}
