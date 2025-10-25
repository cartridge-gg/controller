import {
  useCreateSession,
  type SessionContracts,
  type SessionMessages,
} from "@/hooks/session";
import { toArray } from "@cartridge/controller";

import { ContractCard } from "./ContractCard";
import { MessageCard } from "./MessageCard";
import { useMemo } from "react";
import { cn } from "@cartridge/ui";

export function UnverifiedSessionSummary({
  contracts,
  messages,
}: {
  contracts?: SessionContracts;
  messages?: SessionMessages;
}) {
  const { isEditable } = useCreateSession();
  const { otherContracts } = useMemo(() => {
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

    // Separate token contracts (with approve method) from other contracts
    const tokenContracts = formattedContracts.filter((contract) =>
      contract.methods.some((method) => method.entrypoint === "approve"),
    );

    const otherContracts = formattedContracts.filter(
      (contract) =>
        !contract.methods.some((method) => method.entrypoint === "approve"),
    );

    return { tokenContracts, otherContracts };
  }, [contracts]);

  return (
    <div className="flex flex-col gap-4">
      {/* Render other contracts first */}
      <div className="space-y-px">
        {otherContracts.map((e) => (
          <ContractCard
            key={e.address}
            address={e.address}
            title={e.title}
            icon={e.icon}
            methods={e.methods}
            isExpanded={isEditable}
            className={cn(
              "rounded-none first:rounded-t",
              messages && messages.length > 0 && "last:rounded-b-none",
            )}
          />
        ))}
        {messages && messages.length > 0 && (
          <MessageCard
            className={cn(otherContracts && "rounded-t-none")}
            messages={messages}
          />
        )}
      </div>
    </div>
  );
}
