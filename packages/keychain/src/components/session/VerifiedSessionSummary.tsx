import React from "react";
import { ParsedSessionPolicies } from "hooks/session";
import { AggregateCard } from "./AggregateCard";
import { CodeIcon } from "@cartridge/ui-next";
import { ContractCard } from "./ContractCard";

export function VerifiedSessionSummary({
  game,
  policies,
}: {
  game: String;
  policies: ParsedSessionPolicies;
}) {
  // Extract token and VRF contracts
  const individual = Object.entries(policies.contracts ?? {}).filter(
    ([_, contract]) => {
      return contract.meta?.type === "ERC20" || contract.meta?.type === "VRF";
    },
  );

  // Create new policies object without token/VRF contracts
  const aggregate = {
    ...policies,
    contracts: Object.fromEntries(
      Object.entries(policies.contracts ?? {}).filter(([_, contract]) => {
        return contract.meta?.type !== "ERC20" && contract.meta?.type !== "VRF";
      }),
    ),
  };

  return (
    <div className="flex flex-col gap-4">
      <AggregateCard
        title={`PLAY ${game}`}
        icon={<CodeIcon variant="solid" />}
        policies={aggregate}
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
    </div>
  );
}
