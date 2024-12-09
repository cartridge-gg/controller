import React from "react";
import { ParsedSessionPolicies } from "hooks/session";
import { AggregateCard } from "./AggregateCard";
import { CodeIcon } from "@cartridge/ui-next";

export function VerifiedSessionSummary({
  game,
  policies,
}: {
  game: String;
  policies: ParsedSessionPolicies;
}) {
  return (
    <AggregateCard
      title={`PLAY ${game}`}
      icon={<CodeIcon variant="solid" />}
      policies={policies}
    />
  );
}
