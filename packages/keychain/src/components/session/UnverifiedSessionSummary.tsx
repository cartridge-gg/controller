import type { SessionContracts, SessionMessages } from "@/hooks/session";
import { toArray } from "@cartridge/controller";

import { ContractCard } from "./ContractCard";
import { ExpirationCard } from "./ExpirationCard";
import { MessageCard } from "./MessageCard";

export function UnverifiedSessionSummary({
  contracts,
  messages,
  duration,
  onDurationChange,
  onToggleMethod,
  onToggleMessage,
}: {
  contracts?: SessionContracts;
  messages?: SessionMessages;
  duration: bigint;
  onDurationChange: (duration: bigint) => void;
  onToggleMethod: (
    address: string,
    entrypoint: string,
    authorized: boolean,
  ) => void;
  onToggleMessage: (name: string, authorized: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(contracts ?? {}).map(([address, contract]) => {
        const methods = toArray(contract.methods);
        const title = !contract.meta?.name ? "Contract" : contract.meta.name;
        const icon = contract.meta?.icon;

        return (
          <ContractCard
            key={address}
            address={address}
            title={title}
            icon={icon}
            methods={methods}
            isExpanded
            onToggleMethod={onToggleMethod}
          />
        );
      })}

      {messages && messages.length > 0 && (
        <MessageCard
          messages={messages}
          isExpanded
          onToggleMessage={onToggleMessage}
        />
      )}

      <ExpirationCard duration={duration} onDurationChange={onDurationChange} />
    </div>
  );
}
