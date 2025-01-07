import { SessionPolicies } from "@cartridge/presets";
import { ContractCard } from "./session/ContractCard";
import { useConnection } from "@/hooks/connection";
import { MessageCard } from "./session/MessageCard";

export function Policies({
  policies,
}: {
  title?: string;
  policies: SessionPolicies;
}) {
  const connection = useConnection();
  const parsedContracts = connection.policies?.contracts ?? {};

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(policies.contracts ?? {}).map(([address, p]) => {
        const c = parsedContracts[address];
        return (
          <ContractCard
            key={address}
            address={address}
            title={c?.meta?.name || "Contract"}
            icon={c?.meta?.icon}
            methods={p.methods}
          />
        );
      })}

      {policies.messages && policies.messages.length > 0 && (
        <MessageCard messages={policies.messages} />
      )}
    </div>
  );
}
