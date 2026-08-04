import React from "react";
import {
  BankIcon,
  CreditCardIcon,
  Thumbnail,
  UsdColorIcon,
  VenmoColorIcon,
} from "@/index";
import { cn } from "@/utils";

/**
 * A payout destination *type* (not a specific linked account). The withdraw
 * method picker renders one card per allowed kind; the card advertises the
 * type's title, icon, fees, and default processing time so the user can weigh
 * cost and delivery speed before linking or selecting an account.
 */
export type WithdrawDestinationKind =
  | "bank-account"
  | "card"
  | "venmo"
  | "paypal";

/**
 * Title + default fees copy + default delivery estimate per kind. The icon is
 * rendered lazily in the component (not stored here) so it resolves after the
 * shared-icon barrel has finished initializing.
 */
const KIND_CONFIG: Record<
  WithdrawDestinationKind,
  { title: string; fees: string; processingTime: string }
> = {
  "bank-account": {
    title: "Bank Account",
    fees: "No fees",
    processingTime: "1-2 business days",
  },
  card: {
    title: "Debit Card",
    fees: "Variable fees",
    processingTime: "Same business day",
  },
  venmo: {
    title: "Venmo",
    fees: "Variable fees",
    processingTime: "Same business day",
  },
  paypal: {
    title: "PayPal",
    fees: "Variable fees",
    processingTime: "Same business day",
  },
};

function KindIcon({ kind }: { kind: WithdrawDestinationKind }) {
  switch (kind) {
    case "bank-account":
      return <BankIcon />;
    case "card":
      return <CreditCardIcon variant="solid" />;
    case "venmo":
      return <VenmoColorIcon />;
    case "paypal":
      return <UsdColorIcon />;
  }
}

export interface WithdrawDestinationCardProps {
  /** Which payout destination type this card represents. */
  kind: WithdrawDestinationKind;
  /** Highlights the card as the current selection. */
  selected?: boolean;
  /** Substitutes the kind's default fees copy (the subtitle). */
  fees?: string;
  /**
   * Substitutes the kind's default processing time (e.g. the live ETA from a
   * resolved quote).
   */
  processingTime?: string;
  onClick?: () => void;
}

/**
 * Selectable card for a withdrawal destination *type*. Displays the type's
 * icon, title, and processing time — never a specific account name.
 */
export const WithdrawDestinationCard = React.forwardRef<
  HTMLDivElement,
  WithdrawDestinationCardProps
>(({ kind, selected, fees, processingTime, onClick }, ref) => {
  const {
    title,
    fees: defaultFees,
    processingTime: defaultProcessingTime,
  } = KIND_CONFIG[kind];

  return (
    <div
      ref={ref}
      role="button"
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-3 p-3 rounded border bg-background-100 cursor-pointer transition-colors hover:bg-background-200",
        selected ? "border-primary-100" : "border-transparent",
      )}
      onClick={onClick}
    >
      <Thumbnail
        icon={<KindIcon kind={kind} />}
        size="md"
        className="bg-background-200"
      />
      <div className="flex flex-col gap-0.5 flex-1">
        <p className="text-sm font-medium text-foreground-100">{title}</p>
        <p className="text-xs text-foreground-300">{fees ?? defaultFees}</p>
      </div>
      <p className="text-xs text-foreground-300">
        {processingTime ?? defaultProcessingTime}
      </p>
    </div>
  );
});

WithdrawDestinationCard.displayName = "WithdrawDestinationCard";
