import type { SessionContracts, SessionMessages } from "@/hooks/session";
import { toArray } from "@cartridge/controller";

import { ContractCard } from "./ContractCard";
import { MessageCard } from "./MessageCard";
import { useMemo } from "react";

export function UnverifiedSessionSummary({
  contracts,
  messages,
}: {
  contracts?: SessionContracts;
  messages?: SessionMessages;
}) {
  const entries = useMemo(() => {
    const formattedContracts = Object.entries(contracts ?? {}).map(
      ([address, contract]) => {
        const methods = toArray(contract.methods);
        const title = !contract.meta?.name ? "Contract" : contract.meta.name;
        const icon = contract.meta?.icon;

        return {
          address,
          title,
          icon,
          methods,
        };
      },
    );

    return formattedContracts;
  }, [contracts]);
  return (
    <div className="flex flex-col gap-4">
      {entries.map((e) => (
        <ContractCard
          key={e.address}
          address={e.address}
          title={e.title}
          icon={e.icon}
          methods={e.methods}
          isExpanded
        />
      ))}

      {messages && messages.length > 0 && (
        <MessageCard messages={messages} isExpanded />
      )}
    </div>
  );
}
