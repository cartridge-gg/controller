import React from "react";
import {
  CardIcon,
  CoinsIcon,
  SpaceInvaderIcon,
  ScrollIcon,
} from "@cartridge/ui-next";
import { SessionPolicies } from "@cartridge/presets";
import { useSessionSummary } from "hooks/session";
import { ContractCard } from "./ContractCard";
import { SignMessages } from "./SignMessages";

export function UntrustedSessionSummary({
  policies,
}: {
  policies: SessionPolicies;
}) {
  const summary = useSessionSummary({
    policies,
  });

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(summary.ERC20).map(([address, { methods, meta }]) => (
        <ContractCard
          key={address}
          address={address}
          title={`spend ${meta?.name ?? ""} token`}
          methods={methods}
          icon={
            meta?.logoUrl ? (
              <CardIcon src={meta.logoUrl} />
            ) : (
              <CardIcon>
                <CoinsIcon variant="line" />
              </CardIcon>
            )
          }
        />
      ))}

      {Object.entries(summary.ERC721).map(([address, { methods }]) => (
        <ContractCard
          key={address}
          address={address}
          title="NFT"
          methods={methods}
          icon={
            <CardIcon>
              <SpaceInvaderIcon variant="line" />
            </CardIcon>
          }
        />
      ))}

      {Object.entries(summary.default).map(([address, { methods }], i) => (
        <ContractCard
          key={address}
          address={address}
          title={`Contract ${i + 1}`}
          methods={methods}
          icon={
            <CardIcon>
              <ScrollIcon variant="line" />
            </CardIcon>
          }
        />
      ))}

      {Object.entries(summary.dojo).map(([address, { methods, meta }]) => (
        <ContractCard
          key={address}
          address={address}
          title={meta.dojoName}
          methods={methods}
        />
      ))}

      <SignMessages messages={summary.messages} />
    </div>
  );
}
