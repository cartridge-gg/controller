import {
  type SessionContracts,
  type SessionMessages,
  type ParsedSessionPolicies,
} from "@/hooks/session";
import { toArray } from "@cartridge/controller";
import { useMemo } from "react";
import { AlertIcon } from "@cartridge/ui";
import { AggregateCard } from "./AggregateCard";
import { TokenConsent } from "../connect/token-consent";
import { SpendingLimitCard } from "../connect/SpendingLimitCard";

export function UnverifiedSessionSummary({
  game,
  contracts,
  messages,
}: {
  game?: string;
  contracts?: SessionContracts;
  messages?: SessionMessages;
}) {
  const { aggregate, approvePolicies } = useMemo(() => {
    // Separate contracts with approve methods from other contracts
    const approveContracts: SessionContracts = {};
    const otherContracts: SessionContracts = {};

    Object.entries(contracts ?? {}).forEach(([address, contract]) => {
      const methods = toArray(contract.methods);
      const hasApprove = methods.some(
        (method) => method.entrypoint === "approve",
      );

      if (hasApprove) {
        approveContracts[address] = contract;
      } else {
        otherContracts[address] = contract;
      }
    });

    // Create policies object for SpendingLimitCard
    const policies: ParsedSessionPolicies = {
      verified: false,
      contracts: approveContracts,
    };

    // Create aggregate for other contracts
    const aggregateContracts = Object.entries(otherContracts).map(
      ([address, contract]) => {
        const methods = toArray(contract.methods);
        return [
          address,
          {
            name: contract.meta?.name ?? "Contract",
            methods,
          },
        ] as const;
      },
    );

    return {
      aggregate: {
        contracts: Object.fromEntries(aggregateContracts),
        messages,
      },
      approvePolicies: policies,
    };
  }, [contracts, messages]);

  return (
    <div className="flex flex-col gap-4">
      <AggregateCard
        title={game || "Game"}
        icon={<AlertIcon className="text-destructive-100" />}
        contracts={aggregate.contracts}
        messages={messages}
        className="rounded"
      />
      <TokenConsent />
      <SpendingLimitCard policies={approvePolicies} />
    </div>
  );
}
