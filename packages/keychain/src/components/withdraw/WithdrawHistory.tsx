import { BankIcon, Spinner, Thumbnail } from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import { formatUsdValue } from "@/utils/format-value";
import {
  CoinflowWithdrawalStatus,
  type CoinflowWithdrawal,
} from "@/hooks/payments/coinflow-withdraw";

/**
 * User-facing label + accent per withdrawal status. PENDING and PROCESSING both
 * read as "Processing" (accepted; ACH settles over days) in amber; COMPLETED and
 * FAILED get the constructive / destructive accents.
 */
const STATUS_DISPLAY: Record<
  CoinflowWithdrawalStatus,
  { label: string; className: string }
> = {
  [CoinflowWithdrawalStatus.Pending]: {
    label: "Processing",
    className: "text-[#EDA83A]",
  },
  [CoinflowWithdrawalStatus.Processing]: {
    label: "Processing",
    className: "text-[#EDA83A]",
  },
  [CoinflowWithdrawalStatus.Completed]: {
    label: "Completed",
    className: "text-constructive-100",
  },
  [CoinflowWithdrawalStatus.Failed]: {
    label: "Failed",
    className: "text-destructive-100",
  },
};

interface WithdrawHistoryProps {
  /**
   * The active (in-flight) withdrawal, resolved from `activeWithdrawalId`.
   * Undefined renders the empty state — the backend exposes one active
   * withdrawal per user, so History lists at most this row today.
   */
  withdrawal?: CoinflowWithdrawal;
  /** The active-withdrawal lookup is in flight. */
  isLoading?: boolean;
}

/**
 * The overview drawer's History section: the empty placeholder until a
 * withdrawal exists, then the active withdrawal as a single card (bank + amount
 * + status). "View All" and older rows land with the full history-list query
 * (not exposed by the backend yet), so the header carries no link today.
 */
export function WithdrawHistory({
  withdrawal,
  isLoading,
}: WithdrawHistoryProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-foreground-400">History</p>

      {isLoading ? (
        <div className="flex items-center justify-center p-6 border border-background-200 rounded">
          <Spinner />
        </div>
      ) : withdrawal ? (
        <WithdrawHistoryCard withdrawal={withdrawal} />
      ) : (
        <div className="flex items-center justify-center p-6 border border-background-200 rounded text-xs text-foreground-300">
          You have not made any withdrawals
        </div>
      )}
    </div>
  );
}

function WithdrawHistoryCard({
  withdrawal,
}: {
  withdrawal: CoinflowWithdrawal;
}) {
  const status = STATUS_DISPLAY[withdrawal.status];

  return (
    <div className="flex items-center gap-3 p-3 border border-background-200 rounded bg-background-100">
      {/* Only banks can be linked in-app today; the icon is generic since the
          withdrawal carries only the display label, not the destination type. */}
      <Thumbnail icon={<BankIcon />} size="md" className="bg-background-200" />
      <p className="flex-1 text-sm font-medium text-foreground-100">
        {withdrawal.destinationDisplay}
      </p>
      <div className="flex flex-col items-end gap-0.5">
        <p className="text-sm font-medium text-foreground-100">
          {formatUsdValue(withdrawal.amountCents / 100)}
        </p>
        <p className={cn("text-xs font-medium", status.className)}>
          {status.label}
        </p>
      </div>
    </div>
  );
}
