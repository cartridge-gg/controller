import { type SessionContracts, type SessionMessages } from "@/hooks/session";
import { toArray } from "@cartridge/controller";
import { useMemo } from "react";
import { CodeIcon } from "@cartridge/ui";
import { AggregateCard } from "./AggregateCard";

export function UnverifiedSessionSummary({
  game,
  contracts,
  messages,
}: {
  game: string;
  contracts?: SessionContracts;
  messages?: SessionMessages;
}) {
  const aggregate = useMemo(() => {
    const allContracts = Object.entries(contracts ?? {})
      // Filter out contracts that have approve methods since they're shown on spending limit page
      .filter(([, contract]) => {
        const methods = toArray(contract.methods);
        return !methods.some((method) => method.entrypoint === "approve");
      })
      .map(([address, contract]) => {
        const methods = toArray(contract.methods);
        return [
          address,
          {
            name: contract.meta?.name ?? "Contract",
            methods,
          },
        ] as const;
      });

    return {
      contracts: Object.fromEntries(allContracts),
      messages,
    };
  }, [contracts, messages]);

  return (
    <div className="flex flex-col gap-4">
      {/* Render other contracts first */}
      <div className="space-y-px">
        <AggregateCard
          title={game}
          icon={<CodeIcon variant="solid" />}
          contracts={aggregate.contracts}
          messages={messages}
          className="rounded"
        />
      </div>
    </div>
  );
}
