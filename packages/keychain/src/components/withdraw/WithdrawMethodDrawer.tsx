import {
  ArrowFromLineIcon,
  BankIcon,
  Button,
  CreditCardIcon,
  Drawer,
  DrawerContent,
  Spinner,
  Thumbnail,
} from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import { formatUsdValue } from "@/utils/format-value";
import {
  CoinflowDestinationType,
  CoinflowPayoutSpeed,
  type CoinflowDestination,
  type CoinflowWithdrawQuote,
} from "@/hooks/payments/coinflow-withdraw";
import type { WithdrawQuoteSelection } from "./useWithdrawQuote";
import { OverviewRow, SandboxWarning } from "./OverviewDrawer";

/**
 * Icon + label for a destination. Fee and ETA are no longer static copy — the
 * fee comes from the live quote and the processing time from the chosen speed
 * (see `getSpeedDisplay`). Only bank destinations can be linked in-app today;
 * the other types render if Coinflow returns them.
 */
export function getDestinationDisplay(destination: CoinflowDestination): {
  icon: React.ReactElement;
  title: string;
} {
  switch (destination.type) {
    case CoinflowDestinationType.Card:
      return {
        icon: <CreditCardIcon variant="solid" />,
        title: destination.display,
      };
    case CoinflowDestinationType.Bank:
      return {
        icon: <BankIcon />,
        title: destination.display,
      };
    default:
      return {
        icon: <BankIcon />,
        title: destination.display,
      };
  }
}

/**
 * Human-readable label + processing time per delivery speed. A destination
 * exposes one card per `supportedSpeeds` entry, and the card renders the
 * processing time so the user can weigh speed against the quoted fee.
 * https://docs.coinflow.cash/guides/payouts/beyond-payouts/understanding-payout-speeds
 * https://docs.coinflow.cash/guides/payouts/payout-methods/supported-payout-methods/overview#implementation
 */
export function getSpeedDisplay(speed: CoinflowPayoutSpeed): {
  label: string;
  processingTime: string;
} {
  switch (speed) {
    case CoinflowPayoutSpeed.Asap:
      return { label: "RTP", processingTime: "Within minutes" };
    case CoinflowPayoutSpeed.SameDay:
      return { label: "Same Day ACH", processingTime: "Same business day" };
    case CoinflowPayoutSpeed.Wire:
      return { label: "Wire Transfer", processingTime: "1-2 business days" };
    case CoinflowPayoutSpeed.Standard:
    default:
      return { label: "Standard ACH", processingTime: "2-3 business days" };
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
  /** Coinflow sandbox is active — renders the standing sandbox warning. */
  sandbox?: boolean;
  /** The picked (destination, speed) card; drives the quote and the highlight. */
  selection?: WithdrawQuoteSelection;
  /** Picks a card — the provider quotes that destination + speed. */
  onSelectMethod: (selection: WithdrawQuoteSelection) => void;
  /** The priced quote for `selection`; undefined until it resolves. */
  quote?: CoinflowWithdrawQuote;
  /** A quote request is in flight for the current selection. */
  quoteLoading?: boolean;
  /** The quote request failed (e.g. temporarily unavailable). */
  quoteError?: Error | null;
}

/**
 * The "Choose Transfer Method" drawer: lists one card per (destination, speed)
 * pair. Picking a card quotes that destination + speed on the backend; the
 * quoted fee lands on the card and the "Processing Fee" row, and the WITHDRAW
 * button shows the net amount the user receives (gross − fee) and stays
 * disabled until a quote resolves. The button carries no action yet — this
 * step only implements and validates the quote.
 */
export function WithdrawMethodDrawer({
  isOpen,
  onClose,
  destinations,
  credits,
  sandbox,
  selection,
  onSelectMethod,
  quote,
  quoteLoading,
  quoteError,
}: WithdrawMethodDrawerProps) {
  const selectedDestination = destinations.find(
    (d) => d.token === selection?.token,
  );
  // Net = what actually reaches the bank. Only trustworthy once a quote for the
  // current selection resolves; until then the (disabled) button shows gross.
  const netCents = quote?.netCents ?? credits;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent
        title="Choose Transfer Method"
        icon={<ArrowFromLineIcon variant="up" />}
      >
        {/* Always visible while sandbox is active, whatever the drawer state. */}
        {sandbox && <SandboxWarning />}

        <div className="flex flex-col gap-2 p-3 bg-background-100 rounded">
          <OverviewRow
            label="Withdrawal Amount"
            value={formatUsdValue(credits / 100)}
            tooltip="The amount that will be withdrawn from your account."
          />
          <div className="h-px bg-background-200" />
          <OverviewRow
            label="Processing Fee"
            // The quote's fee/loading/error all surface here (not on the cards):
            // a spinner while it prices, an error fallback, else the fee amount.
            value={
              selection && quoteLoading ? (
                <span className="flex items-center gap-1 text-xs font-medium text-foreground-300">
                  <Spinner size="sm" /> Calculating fee…
                </span>
              ) : selection && quoteError ? (
                <span className="text-xs font-medium text-destructive-100">
                  Unable to calculate fee
                </span>
              ) : (
                formatUsdValue((quote?.feeCents ?? 0) / 100)
              )
            }
            tooltip="The fee depends on the transfer method and comes out of the withdrawal amount."
          />
        </div>

        <div className="flex flex-col gap-3">
          {destinations.flatMap((destination) =>
            destination.supportedSpeeds.map((speed) => {
              const isSelected =
                selection?.token === destination.token &&
                selection?.speed === speed;
              return (
                <DestinationCard
                  key={`${destination.token}:${speed}`}
                  destination={destination}
                  speed={speed}
                  selected={isSelected}
                  onClick={() =>
                    onSelectMethod({ token: destination.token, speed })
                  }
                />
              );
            }),
          )}
        </div>

        {selectedDestination && selection && (
          <div className="flex items-center justify-between text-xs text-foreground-300">
            <p>Transfer to:</p>
            <div className="flex items-center gap-1.5 text-foreground-100">
              <Thumbnail
                icon={getDestinationDisplay(selectedDestination).icon}
                size="xs"
                className="bg-background-200"
              />
              <p className="font-medium">
                {getDestinationDisplay(selectedDestination).title} ·{" "}
                {getSpeedDisplay(selection.speed).label}
              </p>
            </div>
          </div>
        )}

        {/* Enabled only once a quote resolves for the current selection; no
            action wired yet — the withdrawal lands on a later step. */}
        <Button disabled={!quote || !!quoteLoading}>
          Withdraw {formatUsdValue(netCents / 100)}
        </Button>
      </DrawerContent>
    </Drawer>
  );
}

function DestinationCard({
  destination,
  speed,
  selected,
  onClick,
}: {
  destination: CoinflowDestination;
  speed: CoinflowPayoutSpeed;
  selected: boolean;
  onClick: () => void;
}) {
  const { icon, title } = getDestinationDisplay(destination);
  const { label, processingTime } = getSpeedDisplay(speed);

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
        <p className="text-xs text-foreground-300">{label}</p>
      </div>
      <p className="text-xs text-foreground-300">{processingTime}</p>
    </div>
  );
}
