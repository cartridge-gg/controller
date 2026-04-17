import { Call } from "starknet";
import { Spinner, TokenCard, TokenSummary } from "@cartridge/controller-ui";
import { TokenSwap, TokenSwapData, useTokenSwapData } from "@/hooks/token";
import placeholder from "/placeholder.svg?url";
import { useSimulateBalanceChanges } from "./use-simulate";
import { SimulationBalance } from "./event-parser";
import { formatTokenValue, formatUsdValue } from "@/utils/format-value";

interface SimulationResultsProps {
  calls: Call[];
}

export function SimulationResults({ calls }: SimulationResultsProps) {
  const { simulationBalances, isSimulating, isSimulationError } =
    useSimulateBalanceChanges(calls, 10);

  const { tokenSwapData } = useTokenSwapData(
    simulationBalances.map<TokenSwap>((b) => ({
      address: b.contractAddress,
      tokenType: b.contractType,
      amount:
        b.balance < 0n
          ? -b.balance
          : b.balance > 0n
            ? b.balance
            : b.allowance > 0n
              ? b.allowance
              : b.approvedAll
                ? "ALL"
                : 0n,
    })),
  );

  const formatAmount = (token: TokenSwapData, result: SimulationBalance) => {
    const isApproved = result.allowance > 0n || result.approvedAll;
    return `${token.amount === "ALL" ? "ALL" : formatTokenValue(token.amount, 5, token.symbol)}${isApproved ? " (Approved)" : ""}`;
  };

  return (
    <TokenSummary
      title={
        isSimulating ? (
          <div className="flex items-center gap-1">
            <Spinner size="xs" /> Simulating transactions...
          </div>
        ) : isSimulationError ? (
          <span className="text-destructive">Simulation Error</span>
        ) : simulationBalances.length == 0 ? (
          "No standard token balance changes detected"
        ) : (
          "Simulation Results"
        )
      }
      className="flex-none"
    >
      {tokenSwapData.map((token, index) => (
        <TokenCard
          key={index}
          title={token.name}
          image={token.image || placeholder}
          roundedImage={token.rounded}
          amount={formatAmount(token, simulationBalances[index])}
          value={
            typeof token.value === "number"
              ? formatUsdValue(token.value)
              : undefined
          }
          clickable={false}
          increasing={simulationBalances[index].balance > 0n}
          decreasing={simulationBalances[index].balance <= 0n}
        />
      ))}
    </TokenSummary>
  );
}
