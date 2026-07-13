import { useEffect, useState } from "react";
import {
  ArrowFromLineIcon,
  Button,
  Drawer,
  DrawerContent,
  InfoIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";
import { formatUsdValue } from "@/utils/format-value";
import { AmountSelection } from "./AmountSelection";

/**
 * Same warning as the deposit flow (CoinflowCreditsCheckout) — shown on every
 * withdraw drawer whenever Coinflow runs in sandbox.
 */
export function SandboxWarning() {
  return (
    <ErrorCard
      variant="warning"
      title="Coinflow Sandbox Enabled"
      message="Withdrawal will run in Coinflow's sandbox environment. No real payout will be made."
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
  /** Seeds the amount input (dollars string) — stories/tests only. */
  defaultAmountValue?: string;
  /** Continue with the picked amount (whole credits); the quote step consumes it. */
  onContinue: (credits: number) => void;
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
  onContinue,
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
            {!loading && (
              <>
                <div className="p-3 text-xs border border-background-200 rounded text-foreground-300">
                  <p>Cash must be played through once to be withdrawn</p>
                  <p>{`${formatUsdValue(minCredits! / 100)} minimum withdrawal`}</p>
                  {belowMin && (
                    <p className="mt-1 text-destructive-100">
                      You need at least {formatUsdValue(minCredits! / 100)} in
                      withdrawable cash to withdraw.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 p-3 bg-background-100 rounded">
                  <OverviewRow
                    label="Withdrawable Cash"
                    value={formatUsdValue((withdrawableCredits ?? 0) / 100)}
                    tooltip="You can cash this out, taking into account fees and withdrawal limits."
                  />
                  {dailyLimit && (
                    <OverviewRow
                      label="Daily Limit Remaining"
                      value={formatUsdValue(dailyLimit.remainingCents / 100)}
                      tooltip={
                        dailyLimit.limitCents !== undefined
                          ? `The amount you can still withdraw today. ${formatUsdValue(
                              (dailyLimit.limitCents -
                                dailyLimit.remainingCents) /
                                100,
                            )}/${formatUsdValue(dailyLimit.limitCents / 100)} withdrawn`
                          : "The amount you can still withdraw today."
                      }
                    />
                  )}
                </div>
              </>
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

function OverviewRow({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip: string;
}) {
  return (
    <div className="flex gap-1 w-full items-center justify-between cursor-default select-none">
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
      <p className="text-xs font-medium text-foreground-100">{value}</p>
    </div>
  );
}
