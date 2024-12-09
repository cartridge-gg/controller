import React from "react";
import { ParsedSessionPolicies } from "hooks/session";
import { CodeIcon } from "@cartridge/ui";
import { AggregateCard } from "./AggregateCard";

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
      icon={<CodeIcon boxSize="24px" m={2} />}
      policies={policies}
    />
  );
}
