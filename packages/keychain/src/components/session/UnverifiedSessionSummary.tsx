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
  const formattedContracts = useMemo(() => {
    const formattedContracts = Object.entries(contracts ?? {})
      .map(([address, contract]) => {
        // Filter out approve methods since they're shown on spending limit page
        const methods = toArray(contract.methods).filter(
          (method) => method.entrypoint !== "approve",
        );
        const title = !contract.meta?.name ? "Contract" : contract.meta.name;
        const icon = contract.meta?.icon;

        return {
          address,
          title,
          icon,
          methods,
        };
      })
      // Filter out contracts that only had approve methods
      .filter((contract) => contract.methods.length > 0);

    return formattedContracts;
  }, [contracts]);

  return (
    <div className="flex flex-col gap-4">
      {/* Render other contracts first */}
      <div className="space-y-px">
        {formattedContracts.map((e) => (
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
            className={cn(formattedContracts && "rounded-t-none")}
            messages={messages}
          />
        )}
      </div>
    </div>
  );
}
