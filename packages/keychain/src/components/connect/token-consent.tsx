import { cn } from "@cartridge/controller-ui";
import type { ParsedSessionPolicies } from "@/hooks/session";
import React, { HTMLAttributes, useMemo } from "react";

interface TokenConsentProps extends HTMLAttributes<HTMLDivElement> {
  policies: ParsedSessionPolicies;
}

export const TokenConsent = React.forwardRef<HTMLDivElement, TokenConsentProps>(
  ({ className, policies }, ref) => {
    const tokenSpending = useMemo(
      () =>
        Object.values(policies?.contracts ?? {}).some((contract) =>
          contract.methods.some((m) => m.entrypoint === "approve"),
        ),
      [policies?.contracts],
    );

    return (
      <div
        className={cn(
          "w-full flex px-3 py-2.5 items-start justify-between rounded border border-solid border-background-200 bg-background-125",
          className,
        )}
        ref={ref}
      >
        <p className="text-foreground-300 text-xs font-normal">
          You are granting your controller permission to{" "}
          {tokenSpending
            ? "spend the following tokens up to the specified amount. If your controller attempts to spend more than this during this session you will be notified."
            : "perform actions on your behalf."}
        </p>
      </div>
    );
  },
);

TokenConsent.displayName = "TokenConsent";
