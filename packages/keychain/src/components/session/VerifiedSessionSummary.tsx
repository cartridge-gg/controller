import type { SessionContracts, SessionMessages } from "@/hooks/session";
import { CodeIcon } from "@cartridge/ui";
import { useMemo } from "react";
import { AggregateCard } from "./AggregateCard";
import { ContractCard } from "./ContractCard";

export function VerifiedSessionSummary({
  game,
  contracts,
  messages,
}: {
  game: string;
  contracts?: SessionContracts;
  messages?: SessionMessages;
}) {
  // Extract token and VRF contracts
  const individual = useMemo(
    () =>
      Object.entries(contracts ?? {}).filter(([, contract]) => {
        return contract.meta?.type === "ERC20" || contract.meta?.type === "VRF";
      }),
    [contracts],
  );

  // Create new policies object without token/VRF contracts
  const aggregate = useMemo(() => {
    return {
      contracts: Object.fromEntries(
        Object.entries(contracts ?? {}).filter(([, contract]) => {
          return (
            contract.meta?.type !== "ERC20" && contract.meta?.type !== "VRF"
          );
        }),
      ),
      messages,
    };
  }, [contracts, messages]);

  return (
    <div className="flex flex-col gap-4">
      <AggregateCard
        title={game}
        icon={<CodeIcon variant="solid" />}
        contracts={aggregate.contracts}
        messages={messages}
      />

      {individual.map(([address, contract]) => (
        <ContractCard
          key={address}
          address={address}
          title={contract.name || contract.meta?.name || "Contract"}
          icon={contract.meta?.icon}
          methods={contract.methods}
        />
      ))}
    </div>
  );
}
