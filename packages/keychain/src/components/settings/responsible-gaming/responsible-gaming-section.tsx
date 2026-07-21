import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useConnection } from "@/hooks/connection";
import {
  useResponsibleGamingQuery,
  useUpdateResponsibleGamingLimitsMutation,
  type ResponsibleGamingFieldsFragment,
  type UpdateResponsibleGamingLimitsInput,
} from "@/utils/api";
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
  mapResponsibleGamingError,
  PERIOD_LABELS,
  RESPONSIBLE_GAMING_PERIODS,
} from "@/utils/responsible-gaming";

type Limit = ResponsibleGamingFieldsFragment["deposit"];

export const ResponsibleGamingSection = () => {
  const { controller } = useConnection();
  const queryClient = useQueryClient();

  const query = useResponsibleGamingQuery(undefined, {
    enabled: !!controller,
    select: (data) => data.responsibleGaming,
  });
  const rg = query.data;

  const [error, setError] = useState<string | undefined>();

  const mutation = useUpdateResponsibleGamingLimitsMutation({
    onSuccess: () => {
      setError(undefined);
      queryClient.invalidateQueries(["ResponsibleGaming"]);
    },
    onError: (err) => setError(mapResponsibleGamingError(err)),
  });

  // Period drives which window deposit/spending limits apply to. Defaults to
  // the backend's current value.
  const [period, setPeriod] = useState<string | undefined>();
  const effectivePeriod = period ?? rg?.period ?? RESPONSIBLE_GAMING_PERIODS[0];

  const submit = useCallback(
    (input: Omit<UpdateResponsibleGamingLimitsInput, "period">) => {
      setError(undefined);
      mutation.mutate({ input: { period: effectivePeriod, ...input } });
    },
    [effectivePeriod, mutation],
  );

  if (!controller) return null;

  return (
    <section className="space-y-4">
      <h1 className="flex gap-2 items-center text-foreground-200 text-sm font-medium">
        Responsible Gaming
      </h1>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorMessage label={mapResponsibleGamingError(query.error)} />
      ) : rg ? (
        <div className="space-y-4">
          <PeriodSelect
            value={effectivePeriod}
            onChange={setPeriod}
            disabled={mutation.isLoading}
          />

          <MoneyLimitRow
            icon={<CoinsIcon variant="solid" size="sm" />}
            label="Deposit limit"
            limit={rg.deposit}
            disabled={mutation.isLoading}
            onSave={(cents) => submit({ depositLimitCents: cents })}
            onRemove={() => submit({ removeDepositLimit: true })}
          />

          <MoneyLimitRow
            icon={<CoinsIcon variant="solid" size="sm" />}
            label="Spending limit"
            limit={rg.spending}
            disabled={mutation.isLoading}
            onSave={(cents) => submit({ spendingLimitCents: cents })}
            onRemove={() => submit({ removeSpendingLimit: true })}
          />

          <SessionLimitRow
            currentSeconds={rg.sessionMaxDurationSeconds}
            pendingSeconds={rg.pendingSessionMaxDurationSeconds}
            pendingRemoval={rg.pendingSessionRemoval}
            disabled={mutation.isLoading}
            onSave={(seconds) => submit({ sessionMaxDurationSeconds: seconds })}
            onRemove={() => submit({ removeSessionMaxDuration: true })}
          />

          {rg.pendingEffectiveAt && (
            <PendingBanner effectiveAt={rg.pendingEffectiveAt} />
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
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-foreground-300 text-xs">Limit period</span>
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RESPONSIBLE_GAMING_PERIODS.map((p) => (
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

const SessionLimitRow = ({
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
          Max session length
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
