import { useState } from "react";
import {
  Button,
  GearIcon,
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
import { TokenSwapData, useTokenSwapData } from "@/hooks/token";
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
  const [advancedVisible, setAdvancedVisible] = useState(false);

  const { isSwap, swapTransactions, additionalMethodCount } =
    useSwapTransactions(transactions);
  const { tokenSwapData: sellingSwapData } = useTokenSwapData(
    swapTransactions.selling,
  );
  const { tokenSwapData: buyingSwapData } = useTokenSwapData(
    swapTransactions.buying,
  );

  const formatAmount = (token: TokenSwapData) => {
    return `${token.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${token.symbol}`;
  };

  const formatValue = (token: TokenSwapData) => {
    return !token.value
      ? "$0.00"
      : token.value < 0.01
        ? "<$0.01"
        : `~$${token.value.toFixed(2)}`;
  };

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
      right={
        !advancedVisible ? (
          <Button
            onClick={() => setAdvancedVisible(true)}
            size="thumbnail"
            variant="icon"
            className="rounded-full text-foreground-300"
          >
            <GearIcon />
          </Button>
        ) : undefined
      }
      additionalFees={sellingSwapData.map((token) => ({
        label: "Total",
        contractAddress: token.address,
        amount: token?.amount ?? 0,
        usdValue: formatValue(token),
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
                  image={token.image || placeholder}
                  title={token.name}
                  amount={formatAmount(token)}
                  value={formatValue(token)}
                  clickable={false}
                  decreasing
                />
              ))}
              {buyingSwapData.map((token) => (
                <TokenCard
                  key={token.address}
                  image={token.image || placeholder}
                  title={token.name}
                  amount={formatAmount(token)}
                  value={formatValue(token)}
                  clickable={false}
                  increasing
                />
              ))}
            </TokenSummary>
            {advancedVisible && <TransactionSummary calls={transactions} />}
          </>
        )}
      </LayoutContent>
    </ExecutionContainer>
  );
}
