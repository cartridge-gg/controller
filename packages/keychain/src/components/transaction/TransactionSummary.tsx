import { Call } from "starknet";
import { CallCard } from "./CallCard";

interface TransactionSummaryProps {
  calls: Call[];
  defaultExpanded?: boolean;
}

export function TransactionSummary({
  calls,
  defaultExpanded,
}: TransactionSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      {calls.map((c, i) => {
        return (
          <CallCard
            key={i}
            address={c.contractAddress}
            title="Contract"
            // title={c?.meta?.name || "Contract"}
            // icon={c?.meta?.icon}
            call={c}
            defaultExpanded={defaultExpanded}
          />
        );
      })}
    </div>
  );
}
