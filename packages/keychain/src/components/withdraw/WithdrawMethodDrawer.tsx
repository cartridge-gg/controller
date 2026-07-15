import { useEffect, useState } from "react";
import {
  ArrowFromLineIcon,
  BankIcon,
  Button,
  CreditCardIcon,
  Drawer,
  DrawerContent,
  Thumbnail,
} from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import { formatUsdValue } from "@/utils/format-value";
import {
  CoinflowDestinationType,
  type CoinflowDestination,
} from "@/hooks/payments/coinflow-withdraw";
import { OverviewRow, SandboxWarning } from "./OverviewDrawer";

/**
 * Display metadata per destination type. Fee/ETA are static design copy —
 * before an amount+method+destination exists there is no quote to price
 * against (the authoritative fee lands on the confirm step); only bank
 * destinations can be linked in-app today, the other types render if Coinflow
 * returns them.
 */
export function getDestinationDisplay(destination: CoinflowDestination): {
  icon: React.ReactElement;
  title: string;
  fee?: string;
  eta?: string;
} {
  switch (destination.type) {
    case CoinflowDestinationType.Card:
      return {
        icon: <CreditCardIcon variant="solid" />,
        title: destination.display,
        fee: "3% or $1 processing fee",
        eta: "1 Day",
      };
    case CoinflowDestinationType.Bank:
      return {
        icon: <BankIcon />,
        title: destination.display,
        fee: "No Fee",
        eta: "3-5 business days",
      };
    default:
      return {
        icon: <BankIcon />,
        title: destination.display,
      };
  }
}

interface WithdrawMethodDrawerProps {
  isOpen: boolean;
  /** Cancels back to the amount step without changing the selection. */
  onClose: () => void;
  /** Linked payout destinations from coinflowWithdrawStatus. */
  destinations: CoinflowDestination[];
  /** Gross amount picked on the amount step, in whole credits. */
  credits: number;
  /**
   * Processing fee in USD cents when one is known. No quote exists before a
   * method is confirmed, so this renders $0.00 until the quote step supplies
   * it.
   */
  feeCents?: number;
  /** Token of the currently selected destination (re-opening to change it). */
  selectedToken?: string;
  /** Coinflow sandbox is active — renders the standing sandbox warning. */
  sandbox?: boolean;
  /** Confirms the highlighted destination and returns to the amount step. */
  onSelect: (destination: CoinflowDestination) => void;
}

/**
 * The "Choose Transfer Method" drawer: lists the user's linked payout
 * destinations; the WITHDRAW button stays disabled until one is highlighted
 * and confirms it back to the overview drawer (the actual withdrawal happens
 * on the confirm step, plan step 6+).
 */
export function WithdrawMethodDrawer({
  isOpen,
  onClose,
  destinations,
  credits,
  feeCents,
  selectedToken,
  sandbox,
  onSelect,
}: WithdrawMethodDrawerProps) {
  const [token, setToken] = useState<string | undefined>(selectedToken);

  // Re-seed the highlight from the confirmed selection on every open, so a
  // canceled change doesn't leave a half-picked highlight behind.
  useEffect(() => {
    if (isOpen) setToken(selectedToken);
  }, [isOpen, selectedToken]);

  const selected = destinations.find((d) => d.token === token);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent
        title="Choose Transfer Method"
        icon={<ArrowFromLineIcon variant="up" />}
      >
        {/* Always visible while sandbox is active, whatever the drawer state. */}
        {sandbox && <SandboxWarning />}

        <div className="flex flex-col gap-3 p-3 bg-background-100 rounded">
          <OverviewRow
            label="Withdrawal Amount"
            value={formatUsdValue(credits / 100)}
            tooltip="The amount that will be withdrawn from your account."
          />
          <OverviewRow
            label="Processing Fee"
            value={formatUsdValue((feeCents ?? 0) / 100)}
            tooltip="The fee depends on the transfer method and comes out of the withdrawal amount."
          />
        </div>

        <div className="flex flex-col gap-3">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.token}
              destination={destination}
              selected={destination.token === token}
              onClick={() => setToken(destination.token)}
            />
          ))}
        </div>

        {selected && (
          <div className="flex items-center justify-between text-xs text-foreground-300">
            <p>Transfer to:</p>
            <div className="flex items-center gap-1.5 text-foreground-100">
              <Thumbnail
                icon={getDestinationDisplay(selected).icon}
                size="xs"
                className="bg-background-200"
              />
              <p className="font-medium">
                {getDestinationDisplay(selected).title}
              </p>
            </div>
          </div>
        )}

        <Button disabled={!selected} onClick={() => onSelect(selected!)}>
          Withdraw {formatUsdValue(credits / 100)}
        </Button>
      </DrawerContent>
    </Drawer>
  );
}

function DestinationCard({
  destination,
  selected,
  onClick,
}: {
  destination: CoinflowDestination;
  selected: boolean;
  onClick: () => void;
}) {
  const { icon, title, fee, eta } = getDestinationDisplay(destination);

  return (
    <div
      role="button"
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-3 p-3 rounded border bg-background-100 cursor-pointer transition-colors hover:bg-background-200",
        selected ? "border-primary-100" : "border-transparent",
      )}
      onClick={onClick}
    >
      <Thumbnail icon={icon} size="md" className="bg-background-200" />
      <div className="flex flex-col gap-0.5 flex-1">
        <p className="text-sm font-medium text-foreground-100">{title}</p>
        {fee && <p className="text-xs text-foreground-300">{fee}</p>}
      </div>
      {eta && <p className="text-xs text-foreground-300">{eta}</p>}
    </div>
  );
}
