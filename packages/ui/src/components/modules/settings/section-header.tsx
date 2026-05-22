import React from "react";
import { cn } from "@cartridge/controller-ui/utils";
import { Status } from "./status";
import { Spinner } from "@/index";

export type SectionHeaderKind =
  | "sessions"
  | "signers"
  | "connections"
  | "recovery"
  | "delegate"
  | "registered-account"
  | "bank-account"
  | "user-data"
  | "currency"
  | "delete-account";

const variants: Record<
  SectionHeaderKind,
  { title: string; description: string | React.ReactNode }
> = {
  sessions: {
    title: "Session Key(s)",
    description:
      "Sessions grant your Controller permission to perform certain game actions on your behalf.",
  },
  signers: {
    title: "Signer(s)",
    description:
      "Add authorized signers to your Controller. Each signer provides a secure alternative authentication method.",
  },
  connections: {
    title: "Connected Accounts",
    description:
      "Connect your social accounts to enable content publishing features.",
  },
  recovery: {
    title: "Recovery Accounts",
    description:
      "Recovery accounts are Starknet wallets that can be used to recover your Controller if you lose access to your signers.",
  },
  delegate: {
    title: "Delegate",
    description: "Set up delegate account for your controller",
  },
  "registered-account": {
    title: "Registered Account",
    description:
      "Information associated with a registered account can be made available to games and applications.",
  },
  "bank-account": {
    title: "Bank Account",
    description: "Bank accounts available for withdrawals and payments.",
  },
  "user-data": {
    title: "User Data",
    description: (
      <>
        {
          "Used to verify your player identity for banking and compliance purposes. "
        }
        <strong className="text-foreground-200">
          {"This information is stored securely and is never shared."}
        </strong>
      </>
    ),
  },
  currency: {
    title: "Currency",
    description: "Set your default currency for denomination",
  },
  "delete-account": {
    title: "Delete Account",
    description:
      "Permanently delete your account and all associated data. This action cannot be undone.",
  },
};

export interface SectionHeaderProps {
  kind: SectionHeaderKind;
  showStatus?: boolean;
  isActive?: boolean;
  extraContent?: React.ReactNode;
  isLoading?: boolean;
}

export const SectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SectionHeaderProps
>(
  (
    {
      className,
      kind,
      showStatus = false,
      isActive = false,
      extraContent,
      isLoading = false,
      ...props
    },
    ref,
  ) => {
    const { title, description } = variants[kind];
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex flex-row items-center justify-between">
          <h1 className="flex gap-2 text-foreground-200 text-sm font-medium">
            {title}
            {isLoading && <Spinner />}
          </h1>
          {showStatus && <Status isActive={isActive} />}
          {extraContent}
        </div>
        <p className="text-foreground-300 text-xs font-normal">{description}</p>
      </div>
    );
  },
);

SectionHeader.displayName = "SectionHeader";
