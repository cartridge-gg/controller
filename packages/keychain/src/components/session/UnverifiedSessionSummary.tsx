import { toArray } from "@cartridge/controller";
import { SessionContracts, SessionMessages } from "@/hooks/session";

import { MessageCard } from "./MessageCard";
import { ContractCard } from "./ContractCard";

export function UnverifiedSessionSummary({
  contracts,
  messages,
}: {
  contracts?: SessionContracts;
  messages?: SessionMessages;
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
          />
        );
      })}

      {messages && messages.length > 0 && (
        <MessageCard messages={messages} isExpanded />
      )}
    </div>
  );
}
