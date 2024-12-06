import React from "react";
import { CardIcon, CoinsIcon, ScrollIcon } from "@cartridge/ui-next";
import { ParsedSessionPolicies } from "hooks/session";
import { ContractCard } from "./ContractCard";
import { SignMessages } from "./SignMessages";

export function UnverifiedSessionSummary({
  policies,
}: {
  policies: ParsedSessionPolicies;
}) {
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(policies.contracts ?? {}).map(([address, contract]) => {
        if (!contract.meta) {
          return (
            <ContractCard
              key={address}
              address={address}
              title="Contract"
              methods={contract.methods}
              icon={
                <CardIcon>
                  <ScrollIcon variant="line" />
                </CardIcon>
              }
            />
          );
        }

        return (
          <ContractCard
            key={address}
            address={address}
            title={`spend ${contract.meta.name} token`}
            methods={contract.methods}
            icon={
              contract.meta.logoUrl ? (
                <CardIcon src={contract.meta.logoUrl} />
              ) : (
                <CardIcon>
                  <CoinsIcon variant="line" />
                </CardIcon>
              )
            }
          />
        );
      })}

      <SignMessages messages={policies.messages} />
    </div>
  );
}
