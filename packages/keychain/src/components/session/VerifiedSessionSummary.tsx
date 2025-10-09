import type { SessionContracts, SessionMessages } from "@/hooks/session";
import { CodeIcon } from "@cartridge/ui";
import { useMemo } from "react";
import { AggregateCard } from "./AggregateCard";
import { ContractCard } from "./ContractCard";
import { TokenConsent } from "../connect/token-consent";
import { toArray } from "@cartridge/controller";

export function VerifiedSessionSummary({
  game,
  contracts,
  messages,
}: {
  game: string;
  contracts?: SessionContracts;
  messages?: SessionMessages;
}) {
  // Separate contracts based on methods and type
  const { tokenContracts, otherContracts, vrfContracts } = useMemo(() => {
    const allContracts = Object.entries(contracts ?? {});

    const tokenContracts = allContracts.filter(([, contract]) => {
      const methods = toArray(contract.methods);
      return methods.some((method) => method.name === "approve");
    });

    const vrfContracts = allContracts.filter(([, contract]) => {
      return contract.meta?.type === "VRF";
    });

    const otherContracts = allContracts.filter(([, contract]) => {
      const methods = toArray(contract.methods);
      const hasApprove = methods.some((method) => method.name === "approve");
      const isVRF = contract.meta?.type === "VRF";
      return !hasApprove && !isVRF;
    });

    return { tokenContracts, otherContracts, vrfContracts };
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
      <AggregateCard
        title={game}
        icon={<CodeIcon variant="solid" />}
        contracts={aggregate.contracts}
        messages={messages}
      />

      {/* Render VRF contracts first */}
      {vrfContracts.map(([address, contract]) => (
        <ContractCard
          key={address}
          address={address}
          title={contract.name || contract.meta?.name || "Contract"}
          icon={contract.meta?.icon}
          methods={contract.methods}
        />
      ))}

      <TokenConsent />
      {/* Render token contracts after */}
      {tokenContracts.map(([address, contract]) => (
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
