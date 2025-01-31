import { SessionContracts, SessionMessages } from "@/hooks/session";
import { AggregateCard } from "./AggregateCard";
import { CodeIcon } from "@cartridge/ui";
import { ContractCard } from "./ContractCard";
import { ExpirationCard } from "./ExpirationCard";

export function VerifiedSessionSummary({
  game,
  contracts,
  messages,
  duration,
  onDurationChange,
}: {
  game: string;
  contracts?: SessionContracts;
  messages?: SessionMessages;
  duration: bigint;
  onDurationChange: (duration: bigint) => void;
}) {
  // Extract token and VRF contracts
  const individual = Object.entries(contracts ?? {}).filter(([, contract]) => {
    return contract.meta?.type === "ERC20" || contract.meta?.type === "VRF";
  });

  // Create new policies object without token/VRF contracts
  const aggregate = {
    contracts: Object.fromEntries(
      Object.entries(contracts ?? {}).filter(([, contract]) => {
        return contract.meta?.type !== "ERC20" && contract.meta?.type !== "VRF";
      }),
    ),
    messages,
  };

  return (
    <div className="flex flex-col gap-4">
      <AggregateCard
        title={`PLAY ${game}`}
        icon={<CodeIcon variant="solid" />}
        contracts={aggregate.contracts}
        messages={messages}
      />

      {individual.map(([address, contract]) => (
        <ContractCard
          key={address}
          address={address}
          title={contract.meta?.name || "Contract"}
          icon={contract.meta?.icon}
          methods={contract.methods}
        />
      ))}

      <ExpirationCard duration={duration} onDurationChange={onDurationChange} />
    </div>
  );
}
