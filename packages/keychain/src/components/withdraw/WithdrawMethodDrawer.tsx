import { useEffect, useState } from "react";
import {
  ArrowFromLineIcon,
  Button,
  Drawer,
  DrawerContent,
  Spinner,
  Thumbnail,
  WithdrawDestinationCard,
  type WithdrawDestinationKind,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { formatUsdValue } from "@/utils/format-value";
import {
  type CoinflowDestination,
  type CoinflowWithdrawQuote,
} from "@/hooks/payments/coinflow-withdraw";
import type { WithdrawQuoteSelection } from "./useWithdrawQuote";
import { OverviewRow, SandboxWarning } from "./OverviewDrawer";
import {
  ALLOWED_DESTINATION_KINDS,
  getDestinationIcon,
  WITHDRAW_DESTINATIONS,
} from "./constants";

/**
 * Finds the linked account of a given kind among the live destinations. Returns
 * the first match — multi-account-per-kind selection is not built yet.
 */
export function findLinkedAccount(
  destinations: CoinflowDestination[],
  kind: WithdrawDestinationKind,
): CoinflowDestination | undefined {
  return destinations.find(
    (d) => d.type === WITHDRAW_DESTINATIONS[kind].coinflowDestinationType,
  );
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
  /** Quotes the linked account of the selected kind (destination + speed). */
  onSelectMethod: (selection: WithdrawQuoteSelection) => void;
  /** Clears the quote — called when the selected kind has no linked account. */
  onResetSelection?: () => void;
  /** Launches the link flow for a kind with no linked account (bank auth UI). */
  onLink?: (kind: WithdrawDestinationKind) => void;
  /** The priced quote for `selection`; undefined until it resolves. */
  quote?: CoinflowWithdrawQuote;
  /** A quote request is in flight for the current selection. */
  quoteLoading?: boolean;
  /** The quote request failed (e.g. temporarily unavailable). */
  quoteError?: Error | null;
  /** Initiates the withdrawal for the current (amount, destination, speed). */
  onWithdraw?: () => void;
  /** A withdrawal request is in flight — drives the button's loading state. */
  isSubmitting?: boolean;
  /** The withdrawal initiation failed — rendered as an error above the button. */
  submitError?: Error | null;
}

/**
 * The "Choose Transfer Method" drawer: lists one card per allowed destination
 * *type* (bank account, card, …) — not per linked account. Picking a type with
 * a linked account quotes it (fee on the "Processing Fee" row) and turns the
 * button into WITHDRAW (net amount); picking a type with nothing linked turns
 * the button into "Link Account"/"Link Card", which launches the hosted link
 * flow. The button initiates the withdrawal once a quote resolves.
 */
export function WithdrawMethodDrawer({
  isOpen,
  onClose,
  destinations,
  credits,
  sandbox,
  onSelectMethod,
  onResetSelection,
  onLink,
  quote,
  quoteLoading,
  quoteError,
  onWithdraw,
  isSubmitting,
  submitError,
}: WithdrawMethodDrawerProps) {
  const kinds = ALLOWED_DESTINATION_KINDS;

  // The picked destination *type*. With a single allowed kind there's nothing
  // to choose, so it auto-selects below. Local to the drawer — the provider
  // only tracks the quoted (token, speed).
  const soleKind = kinds.length === 1 ? kinds[0] : undefined;
  const [selectedKind, setSelectedKind] = useState<
    WithdrawDestinationKind | undefined
  >(soleKind);

  useEffect(() => {
    if (!selectedKind && soleKind) setSelectedKind(soleKind);
  }, [selectedKind, soleKind]);

  // The linked account (if any) backing the selected kind — drives the button
  // (Link vs Withdraw) and the "Transfer to:" row.
  const selectedAccount = selectedKind
    ? findLinkedAccount(destinations, selectedKind)
    : undefined;

  // Quote the linked account of the selected kind; clear the quote when the
  // selected kind has nothing linked (so a stale quote never gates WITHDRAW).
  // Gated on `isOpen`, and re-runs on every open: the provider clears its quote
  // selection when this sub-step opens (openMethodSelection), and this drawer
  // stays mounted across the flow — so selectedKind/destinations alone don't
  // change on re-open. Without re-asserting on `isOpen`, the quote would never
  // be requested and WITHDRAW would stay disabled.
  useEffect(() => {
    if (!isOpen || !selectedKind) return;
    const account = findLinkedAccount(destinations, selectedKind);
    if (account) {
      onSelectMethod({
        token: account.token,
        speed: WITHDRAW_DESTINATIONS[selectedKind].coinflowPayoutSpeed,
      });
    } else {
      onResetSelection?.();
    }
  }, [isOpen, selectedKind, destinations, onSelectMethod, onResetSelection]);

  // Net = what actually reaches the destination. Only trustworthy once a quote
  // for the current selection resolves; until then the button shows gross.
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
            // The quote's fee/loading/error all surface here (not on the
            // cards): a spinner while it prices, an error fallback, else the
            // fee amount.
            value={
              quoteLoading ? (
                <span className="flex items-center gap-1 text-xs font-medium text-foreground-300">
                  <Spinner size="sm" /> Calculating fee…
                </span>
              ) : quoteError ? (
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
          {kinds.map((kind) => {
            const isSelected = selectedKind === kind;
            return (
              <WithdrawDestinationCard
                key={kind}
                kind={kind}
                selected={isSelected}
                // The quote returns a more precise ETA than the static per-kind
                // copy; once it resolves for the selected linked account, it
                // lands on this card.
                processingTime={
                  isSelected && selectedAccount
                    ? (quote?.eta ?? undefined)
                    : undefined
                }
                onClick={() => setSelectedKind(kind)}
              />
            );
          })}
        </div>

        {/* Always reserve the row's height (the xs thumbnail is 20px tall) so
            the layout doesn't shift when a selection resolves to a linked
            account. */}
        {selectedAccount ? (
          <TransferToRow account={selectedAccount} />
        ) : (
          <div aria-hidden className="h-5" />
        )}

        {/* The initiation failed (e.g. balance/limit re-validation) — the fee
            row already covers quote-time errors, so this is submit-only. */}
        {submitError && (
          <ErrorAlert
            title="Withdrawal failed"
            description={submitError.message}
            isExpanded
          />
        )}

        {selectedAccount ? (
          // Enabled only once a quote resolves for the current selection;
          // initiates the withdrawal and holds in its loading state until the
          // flow returns to the overview.
          <Button
            disabled={!quote || !!quoteLoading || isSubmitting}
            isLoading={isSubmitting || !!quoteLoading}
            onClick={onWithdraw}
          >
            Withdraw {formatUsdValue(netCents / 100)}
          </Button>
        ) : (
          // No account of the selected kind is linked — launch the hosted link
          // flow instead of withdrawing.
          <Button
            onClick={() => selectedKind && onLink?.(selectedKind)}
            disabled={!selectedKind}
          >
            {selectedKind === "card" ? "Link Card" : "Link Account"}
          </Button>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/**
 * The "Transfer to:" row — shows the icon + masked display of the linked
 * account backing the current selection (e.g. "Bank ****0283").
 */
function TransferToRow({ account }: { account: CoinflowDestination }) {
  return (
    <div className="flex items-center justify-between text-xs text-foreground-300">
      <p>Transfer to:</p>
      <div className="flex items-center gap-1.5 text-foreground-100">
        <Thumbnail
          icon={getDestinationIcon(account)}
          size="xs"
          className="bg-background-200"
        />
        <p className="font-medium">{account.display}</p>
      </div>
    </div>
  );
}
