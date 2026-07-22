import { useEffect, useState } from "react";
import {
  ArrowFromLineIcon,
  Button,
  Drawer,
  DrawerContent,
  InfoIcon,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";
import { formatUsdValue } from "@/utils/format-value";
import type {
  CoinflowDestination,
  CoinflowWithdrawal,
} from "@/hooks/payments/coinflow-withdraw";
import { AmountSelection } from "./AmountSelection";
import { SelectedWithdrawMethod } from "./SelectedWithdrawMethod";
import { WithdrawHistory } from "./WithdrawHistory";

/**
 * Same warning as the deposit flow (CoinflowCreditsCheckout) — shown on every
 * withdraw drawer whenever Coinflow runs in sandbox.
 */
export function SandboxWarning() {
  return (
    <ErrorCard
      variant="warning"
      title="Coinflow Sandbox Environment"
      message="No real payout will be made."
    />
  );
}

interface OverviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Advances into the withdraw flow (verification/KYC gates run next). */
  onWithdraw: () => void;
  /**
   * Fixed policy bounds + withdrawable balance from coinflowWithdrawStatus,
   * in whole credits (1 credit = $0.01). `maxCredits` is NOT balance-clamped;
   * the effective max is `min(maxCredits, withdrawableCredits)`.
   */
  minCredits?: number;
  maxCredits?: number;
  withdrawableCredits?: number;
  /**
   * Daily withdrawal limit, when known. The backend does not expose this on
   * coinflowWithdrawStatus yet (only the quote's remainingLimitCents, which
   * needs an amount) — the row renders only once a source exists.
   */
  dailyLimit?: { remainingCents: number; limitCents?: number };
  isLoading?: boolean;
  /** Status-query failure — renders an error alert instead of the flow. */
  error?: Error | null;
  /** Coinflow sandbox is active — renders the standing sandbox warning. */
  sandbox?: boolean;
  /** True past the WITHDRAW click — shows the amount selection + Continue. */
  amountMode?: boolean;
  /** Seeds the amount input (dollars string) — also used to restore the
   * picked amount when the drawer re-opens after the method sub-step. */
  defaultAmountValue?: string;
  /** The confirmed transfer method, once one is selected/linked — rendered as
   * the slim SelectedWithdrawMethod row on the amount step. */
  selectedDestination?: CoinflowDestination;
  /** Re-opens the transfer-method drawer to change the selection. */
  onChangeMethod?: () => void;
  /** Continue with the picked amount (whole credits); opens the method
   * sub-step when no method is confirmed yet, the quote step otherwise. */
  onContinue: (credits: number) => void;
  /** The active (in-flight) withdrawal for the History section, resolved from
   * `activeWithdrawalId`; undefined renders the empty state. Shown only on the
   * base overview (not the amount step). */
  activeWithdrawal?: CoinflowWithdrawal;
  /** The active-withdrawal lookup is in flight. */
  historyLoading?: boolean;
}

/**
 * The withdraw drawer: shows what's withdrawable, and once the user clicks
 * WITHDRAW (after the verification/KYC gates run, plan steps 4–5) reveals the
 * amount selection in place — no separate amount drawer.
 */
export function OverviewDrawer({
  isOpen,
  onClose,
  onWithdraw,
  minCredits,
  maxCredits,
  withdrawableCredits,
  dailyLimit,
  isLoading,
  error,
  sandbox,
  amountMode = false,
  defaultAmountValue,
  selectedDestination,
  onChangeMethod,
  onContinue,
  activeWithdrawal,
  historyLoading,
}: OverviewDrawerProps) {
  const [credits, setCredits] = useState(0);

  // Reset the picked amount when the drawer closes (the keyed selection
  // below remounts with a cleared input on the next open).
  useEffect(() => {
    if (!isOpen) setCredits(0);
  }, [isOpen]);

  const loading = !error && (isLoading || minCredits === undefined);
  // withdrawableCredits < minCredits is the "nothing withdrawable" signal
  // (below-min balance — the fixed bounds no longer encode the balance);
  // keep the drawer visible but the button disabled.
  const belowMin =
    minCredits !== undefined &&
    withdrawableCredits !== undefined &&
    withdrawableCredits < minCredits;
  // The backend no longer clamps maxCredits by balance — the client does.
  const effectiveMaxCredits = Math.min(
    maxCredits ?? 0,
    withdrawableCredits ?? 0,
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent
        title="Withdraw Funds"
        icon={<ArrowFromLineIcon variant="up" />}
      >
        {/* Always visible while sandbox is active, whatever the drawer state. */}
        {sandbox && <SandboxWarning />}

        <div className="p-3 text-xs border border-background-200 rounded text-foreground-300">
          <p>Cash must be played through once to be withdrawn</p>
          {minCredits && (
            <>
              <p>{`${formatUsdValue(minCredits! / 100)} minimum withdrawal`}</p>
              {belowMin && (
                <p className="mt-1 text-destructive-100">
                  You need at least {formatUsdValue(minCredits! / 100)} in
                  withdrawable cash to withdraw.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 p-3 bg-background-100 rounded">
          <OverviewRow
            label="Withdrawable Cash"
            value={formatUsdValue((withdrawableCredits ?? 0) / 100)}
            tooltip="You can cash this out, taking into account fees and withdrawal limits."
            isLoading={loading}
          />
          {dailyLimit && (
            <OverviewRow
              label="Daily Limit Remaining"
              value={formatUsdValue(dailyLimit.remainingCents / 100)}
              tooltip={
                dailyLimit.limitCents !== undefined
                  ? `The amount you can still withdraw today. ${formatUsdValue(
                      (dailyLimit.limitCents - dailyLimit.remainingCents) / 100,
                    )}/${formatUsdValue(dailyLimit.limitCents / 100)} withdrawn`
                  : "The amount you can still withdraw today."
              }
            />
          )}
        </div>

        {error ? (
          <>
            <ErrorAlert
              title="Unable to load withdrawal status"
              description={error.message}
            />
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </>
        ) : (
          <>
            {/* History lives on the base overview only — the amount step
                replaces it with the amount selection. */}
            {!amountMode && !loading && (
              <WithdrawHistory
                withdrawal={activeWithdrawal}
                isLoading={historyLoading}
              />
            )}

            {amountMode && !loading && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-foreground-400">
                  Withdraw Amount
                </p>
                <AmountSelection
                  key={isOpen ? "open" : "closed"}
                  minCredits={minCredits!}
                  maxCredits={effectiveMaxCredits}
                  defaultValue={defaultAmountValue}
                  onChange={setCredits}
                />
                {selectedDestination && onChangeMethod && (
                  <SelectedWithdrawMethod
                    destination={selectedDestination}
                    onClick={onChangeMethod}
                  />
                )}
              </div>
            )}

            {amountMode ? (
              <Button disabled={!credits} onClick={() => onContinue(credits)}>
                Continue
              </Button>
            ) : (
              <Button
                disabled={loading || belowMin}
                onClick={onWithdraw}
                isLoading={loading}
              >
                Withdraw
              </Button>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export function OverviewRow({
  label,
  value,
  tooltip,
  isLoading = false,
}: {
  label: string;
  /**
   * The right-aligned value. A string renders with the standard value styling;
   * a node renders as-is, so callers can supply their own state (e.g. an
   * inline "Calculating…" spinner or an error message).
   */
  value: React.ReactNode;
  tooltip: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex gap-1 w-full h-4 items-center justify-between cursor-default select-none">
      <p className="text-xs text-foreground-300">{label}</p>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="flex items-center">
              <InfoIcon size="xs" className="text-foreground-300" />
            </span>
          </TooltipTrigger>
          <TooltipContent
            className="px-3 py-2 bg-spacer-100 border border-background-150 rounded select-none max-w-[260px]"
            style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
            side="top"
            align="start"
          >
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-foreground-100">{label}</p>
              <p className="text-xs text-foreground-300">{tooltip}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex-1" />
      {isLoading ? (
        <Spinner />
      ) : typeof value === "string" ? (
        <p className="text-xs font-medium text-foreground-100">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}
