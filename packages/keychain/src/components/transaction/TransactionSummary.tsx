import { Call } from "starknet";
import { CallCard } from "./CallCard";

export function TransactionSummary({ calls }: { calls: Call[] }) {
  return (
    <div className="flex flex-col gap-4">
      {calls.map((c, i) => {
        return (
          <CallCard
            key={i}
            title="Contract"
            // title={c?.meta?.name || "Contract"}
            // icon={c?.meta?.icon}
            call={c}
          />
        );
      })}
    </div>
  );
}
