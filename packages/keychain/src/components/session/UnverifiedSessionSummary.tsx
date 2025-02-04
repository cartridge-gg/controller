import type { SessionContracts, SessionMessages } from "@/hooks/session";
import { toArray } from "@cartridge/controller";

import { isPolicyRequired } from "@/components/connect/create/utils";
import { ContractCard } from "./ContractCard";
import { ExpirationCard } from "./ExpirationCard";
import { MessageCard } from "./MessageCard";

const requiredPolicyTypes = ["VRF"];

export function UnverifiedSessionSummary({
  contracts,
  messages,
  duration,
  onDurationChange,
}: {
  contracts?: SessionContracts;
  messages?: SessionMessages;
  duration: bigint;
  onDurationChange: (duration: bigint) => void;
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
            isDisabled={isPolicyRequired({
              requiredPolicyTypes,
              type: contract.meta?.type,
            })}
          />
        );
      })}

      {messages && messages.length > 0 && (
        <MessageCard messages={messages} isExpanded />
      )}

      <ExpirationCard duration={duration} onDurationChange={onDurationChange} />
    </div>
  );
}
