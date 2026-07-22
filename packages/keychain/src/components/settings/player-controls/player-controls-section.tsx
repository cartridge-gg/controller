import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useConnection } from "@/hooks/connection";
import {
  usePlayerControlsQuery,
  useUpdatePlayerControlsMutation,
  PlayerControlsPeriod,
  type PlayerControlsFieldsFragment,
  type UpdatePlayerControlsInput,
} from "@/utils/api";
import { invalidatePlayerControlsCache } from "@/utils/connection/spend-enforcement";
import {
  Button,
  CalendarIcon,
  CircleCheckIcon,
  ClockIcon,
  CoinsIcon,
  ErrorMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@cartridge/controller-ui";
import { useQueryClient } from "react-query";
import {
  formatCents,
  formatDurationSeconds,
  mapPlayerControlsError,
  PERIOD_LABELS,
  PLAYER_CONTROLS_PERIODS,
} from "@/utils/player-controls";

type Limit = PlayerControlsFieldsFragment["creditsPurchase"];

export const PlayerControlsSection = () => {
  const { controller } = useConnection();
  const queryClient = useQueryClient();

  const query = usePlayerControlsQuery(undefined, {
    enabled: !!controller,
    select: (data) => data.playerControls,
  });
  const pc = query.data;

  const [error, setError] = useState<string | undefined>();

  const mutation = useUpdatePlayerControlsMutation({
    onSuccess: () => {
      setError(undefined);
      // A period change may be held pending (window-shortening cooling-off),
      // in which case `pc.period` from the refetch below stays at the old
      // value. Drop the local selection so the selector snaps back to the
      // still-effective period instead of showing the requested-but-not-yet-
      // effective one.
      setPeriod(undefined);
      queryClient.invalidateQueries(["PlayerControls"]);
      if (controller) {
        invalidatePlayerControlsCache(controller.address());
      }
    },
    onError: (err) => setError(mapPlayerControlsError(err)),
  });

  // Period drives which window the credits-purchase / entry-and-purchase limits
  // apply to. Defaults to the backend's current *effective* value — never the
  // pending one — so a queued (cooling-off) period change never appears to
  // have applied immediately.
  const [period, setPeriod] = useState<PlayerControlsPeriod | undefined>();
  const effectivePeriod = period ?? pc?.period ?? PLAYER_CONTROLS_PERIODS[0];

  const submit = useCallback(
    (input: Omit<UpdatePlayerControlsInput, "period">) => {
      setError(undefined);
      mutation.mutate({ input: { period: effectivePeriod, ...input } });
    },
    [effectivePeriod, mutation],
  );

  if (!controller) return null;

  return (
    <section className="space-y-4">
      <h1 className="flex gap-2 items-center text-foreground-200 text-sm font-medium">
        Player Controls
      </h1>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorMessage label={mapPlayerControlsError(query.error)} />
      ) : pc ? (
        <div className="space-y-4">
          <PeriodSelect
            value={effectivePeriod}
            onChange={setPeriod}
            disabled={mutation.isLoading}
          />
          {pc.pendingPeriod && (
            <PendingLine
              pendingAmount={
                PERIOD_LABELS[pc.pendingPeriod] ?? pc.pendingPeriod
              }
              pendingRemoval={false}
            />
          )}

          <MoneyLimitRow
            icon={<CoinsIcon variant="solid" size="sm" />}
            label="Credits purchase limit"
            limit={pc.creditsPurchase}
            disabled={mutation.isLoading}
            onSave={(cents) => submit({ creditsPurchaseLimitCents: cents })}
            onRemove={() => submit({ removeCreditsPurchaseLimit: true })}
          />

          <MoneyLimitRow
            icon={<CoinsIcon variant="solid" size="sm" />}
            label="Entry and purchase limit"
            limit={pc.entryPurchase}
            disabled={mutation.isLoading}
            onSave={(cents) => submit({ entryPurchaseLimitCents: cents })}
            onRemove={() => submit({ removeEntryPurchaseLimit: true })}
          />

          <PlayTimeLimitRow
            currentSeconds={pc.playTimeMaxDurationSeconds}
            pendingSeconds={pc.pendingPlayTimeMaxDurationSeconds}
            pendingRemoval={pc.pendingPlayTimeRemoval}
            disabled={mutation.isLoading}
            onSave={(seconds) =>
              submit({ playTimeMaxDurationSeconds: seconds })
            }
            onRemove={() => submit({ removePlayTimeMaxDuration: true })}
          />

          {pc.pendingEffectiveAt && (
            <PendingBanner effectiveAt={pc.pendingEffectiveAt} />
          )}

          {error && <ErrorMessage label={error} />}
        </div>
      ) : null}
    </section>
  );
};

const PeriodSelect = ({
  value,
  onChange,
  disabled,
}: {
  value: PlayerControlsPeriod;
  onChange: (value: PlayerControlsPeriod) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-foreground-300 text-xs">Limit period</span>
    <Select
      value={value}
      onValueChange={(v) => onChange(v as PlayerControlsPeriod)}
      disabled={disabled}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PLAYER_CONTROLS_PERIODS.map((p) => (
          <SelectItem key={p} value={p}>
            {PERIOD_LABELS[p] ?? p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const MoneyLimitRow = ({
  icon,
  label,
  limit,
  disabled,
  onSave,
  onRemove,
}: {
  icon: ReactNode;
  label: string;
  limit: Limit;
  disabled?: boolean;
  onSave: (cents: number) => void;
  onRemove: () => void;
}) => {
  const [value, setValue] = useState("");
  const [inputError, setInputError] = useState<Error | undefined>();
  const hasLimit =
    limit.amountCents !== null && limit.amountCents !== undefined;

  const handleSave = () => {
    const dollars = Number.parseFloat(value);
    if (!Number.isFinite(dollars) || dollars < 0) {
      setInputError(new Error("Enter a non-negative amount"));
      return;
    }
    setInputError(undefined);
    onSave(Math.round(dollars * 100));
    setValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-foreground-100">
          {icon}
          {label}
        </span>
        <span className="text-xs text-foreground-300">
          {hasLimit
            ? `${formatCents(limit.usedCents)} / ${formatCents(limit.amountCents)}`
            : "No limit set"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder="Amount (USD)"
          value={value}
          error={inputError}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          containerClassName="flex-1"
        />
        <Button
          variant="secondary"
          disabled={disabled || value.length === 0}
          onClick={handleSave}
        >
          Save
        </Button>
        {hasLimit && (
          <Button variant="secondary" disabled={disabled} onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
      <PendingLine
        pendingAmount={
          limit.pendingAmountCents !== null &&
          limit.pendingAmountCents !== undefined
            ? formatCents(limit.pendingAmountCents)
            : undefined
        }
        pendingRemoval={limit.pendingRemoval}
      />
    </div>
  );
};

const PlayTimeLimitRow = ({
  currentSeconds,
  pendingSeconds,
  pendingRemoval,
  disabled,
  onSave,
  onRemove,
}: {
  currentSeconds?: number | null;
  pendingSeconds?: number | null;
  pendingRemoval: boolean;
  disabled?: boolean;
  onSave: (seconds: number) => void;
  onRemove: () => void;
}) => {
  const [hours, setHours] = useState("");
  const [inputError, setInputError] = useState<Error | undefined>();
  const hasLimit = currentSeconds !== null && currentSeconds !== undefined;

  const handleSave = () => {
    const h = Number.parseFloat(hours);
    if (!Number.isFinite(h) || h <= 0) {
      setInputError(new Error("Enter a positive number of hours"));
      return;
    }
    setInputError(undefined);
    onSave(Math.round(h * 3600));
    setHours("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-foreground-100">
          <ClockIcon variant="solid" size="sm" />
          Play-time limit
        </span>
        <span className="text-xs text-foreground-300">
          {hasLimit ? formatDurationSeconds(currentSeconds) : "No limit set"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.5"
          placeholder="Hours"
          value={hours}
          error={inputError}
          disabled={disabled}
          onChange={(e) => setHours(e.target.value)}
          containerClassName="flex-1"
        />
        <Button
          variant="secondary"
          disabled={disabled || hours.length === 0}
          onClick={handleSave}
        >
          Save
        </Button>
        {hasLimit && (
          <Button variant="secondary" disabled={disabled} onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
      <PendingLine
        pendingAmount={
          pendingSeconds !== null && pendingSeconds !== undefined
            ? formatDurationSeconds(pendingSeconds)
            : undefined
        }
        pendingRemoval={pendingRemoval}
      />
    </div>
  );
};

const PendingLine = ({
  pendingAmount,
  pendingRemoval,
}: {
  pendingAmount?: string;
  pendingRemoval: boolean;
}) => {
  if (!pendingAmount && !pendingRemoval) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-foreground-300">
      <CircleCheckIcon size="xs" />
      {pendingRemoval
        ? "Removal pending"
        : `Pending change to ${pendingAmount}`}
    </p>
  );
};

const PendingBanner = ({ effectiveAt }: { effectiveAt: string }) => {
  const label = useMemo(() => formatEffectiveDate(effectiveAt), [effectiveAt]);
  return (
    <div className="flex items-center gap-2 rounded bg-background-200 px-3 py-2 text-xs text-foreground-300">
      <CalendarIcon size="xs" variant="line" />
      <span>Pending changes take effect {label}.</span>
    </div>
  );
};

const LoadingState = () => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full rounded" />
    <Skeleton className="h-10 w-full rounded" />
    <Skeleton className="h-10 w-full rounded" />
  </div>
);

function formatEffectiveDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "later";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
