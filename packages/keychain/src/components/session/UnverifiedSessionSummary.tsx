import React from "react";
import { CardIcon, CoinsIcon, ScrollIcon } from "@cartridge/ui-next";
import { toArray } from "@cartridge/controller";
import { ParsedSessionPolicies } from "hooks/session";

import { MessageCard } from "./MessageCard";
import { ContractCard } from "./ContractCard";

export function UnverifiedSessionSummary({
  policies,
}: {
  policies: ParsedSessionPolicies;
}) {
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(policies.contracts ?? {}).map(([address, contract]) => {
        const methods = toArray(contract.methods);
        const title = !contract.meta
          ? "Contract"
          : `${contract.meta.name} token`;
        const icon = !contract.meta ? (
          <CardIcon>
            <ScrollIcon variant="line" />
          </CardIcon>
        ) : contract.meta.logoUrl ? (
          <CardIcon src={contract.meta.logoUrl} />
        ) : (
          <CardIcon>
            <CoinsIcon variant="line" />
          </CardIcon>
        );

        return (
          <ContractCard
            key={address}
            address={address}
            title={title}
            icon={icon}
            methods={methods}
          />
        );
      })}

      {policies.messages?.map((message, index) => (
        <MessageCard key={index} message={message} />
      ))}
    </div>
  );
}
