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
    className: "text-[#fac400]",
  },
  [CoinflowWithdrawalStatus.Processing]: {
    label: "Processing",
    className: "text-[#fac400]",
  },
  [CoinflowWithdrawalStatus.Completed]: {
    label: "Completed",
    className: "text-foreground-100",
  },
  [CoinflowWithdrawalStatus.Failed]: {
    label: "Failed",
    className: "text-destructive-100",
  },
};

// The History section lists at most this many rows — the two most recent
// withdrawals (the full list lands with a dedicated "View All" screen later).
const MAX_HISTORY_ROWS = 2;

interface WithdrawHistoryProps {
  /**
   * The caller's withdrawals, newest-first. Only the two most recent render
   * here; an empty/undefined list shows the empty placeholder.
   */
  withdrawals?: CoinflowWithdrawal[];
  /** The withdrawal-history lookup is in flight. */
  isLoading?: boolean;
}

/**
 * The overview drawer's History section: the empty placeholder until a
 * withdrawal exists, then the two most recent withdrawals as cards (bank +
 * amount + status). "View All" and older rows land with a dedicated
 * history screen later, so the header carries no link today.
 */
export function WithdrawHistory({
  withdrawals,
  isLoading,
}: WithdrawHistoryProps) {
  const recent = withdrawals?.slice(0, MAX_HISTORY_ROWS) ?? [];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-foreground-400">History</p>

      {isLoading ? (
        <div className="flex items-center justify-center p-6 border border-background-200 rounded">
          <Spinner />
        </div>
      ) : recent.length > 0 ? (
        recent.map((withdrawal) => (
          <WithdrawHistoryCard key={withdrawal.id} withdrawal={withdrawal} />
        ))
      ) : (
        <div className="flex items-center justify-center p-6 border border-background-200 rounded text-xs text-foreground-300">
          You have not made any withdrawals
        </div>
      )}
    </div>
  );
}

// The withdrawal's initiation date (createdAt), e.g. "Jul 24, 2026". Empty on
// an unparseable value rather than rendering "Invalid Date".
function formatWithdrawalDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground-100">
          {withdrawal.destinationDisplay}
        </p>
        <p className="text-xs font-medium text-foreground-300">
          {formatWithdrawalDate(withdrawal.createdAt)}
        </p>
      </div>
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
