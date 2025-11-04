import {
  useCreateSession,
  type SessionContracts,
  type SessionMessages,
} from "@/hooks/session";
import { cn, CodeIcon } from "@cartridge/ui";
import { useMemo } from "react";
import { AggregateCard } from "./AggregateCard";
import { ContractCard } from "./ContractCard";
import { toArray } from "@cartridge/controller";

export function VerifiedSessionSummary({
  game,
  contracts,
  messages,
}: {
  game: string;
  contracts?: SessionContracts;
  messages?: SessionMessages;
  hideSpendingLimit?: boolean;
}) {
  const { isEditable } = useCreateSession();
  // Separate contracts based on methods and type
  const { otherContracts, vrfContracts } = useMemo(() => {
    const allContracts = Object.entries(contracts ?? {})
      .map(([address, contract]) => {
        // Filter out approve methods since they're shown on spending limit page
        const methods = toArray(contract.methods).filter(
          (method) => method.entrypoint !== "approve",
        );
        return [
          address,
          {
            ...contract,
            methods,
          },
        ] as const;
      })
      // Filter out contracts that only had approve methods
      .filter(([, contract]) => contract.methods.length > 0);

    const vrfContracts = allContracts.filter(([, contract]) => {
      return contract.meta?.type === "VRF";
    });

    const otherContracts = allContracts.filter(([, contract]) => {
      const isVRF = contract.meta?.type === "VRF";
      return !isVRF;
    });

    return { otherContracts, vrfContracts };
  }, [contracts]);

  // Create aggregate contracts object for non-token, non-VRF contracts
  const aggregate = useMemo(() => {
    return {
      contracts: Object.fromEntries(otherContracts),
      messages,
    };
  }, [otherContracts, messages]);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-px">
        <AggregateCard
          title={game}
          icon={<CodeIcon variant="solid" />}
          contracts={aggregate.contracts}
          messages={messages}
          className={cn(vrfContracts.length > 0 && "rounded-b-none")}
        />

        {/* Render VRF contracts first */}
        {vrfContracts.map(([address, contract]) => (
          <ContractCard
            key={address}
            address={address}
            title={contract.name || contract.meta?.name || "Contract"}
            icon={contract.meta?.icon}
            methods={contract.methods}
            isExpanded={isEditable}
            className="rounded-none last:rounded-b"
          />
        ))}
      </div>
    </div>
  );
}
