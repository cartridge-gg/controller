import { useEffect, useState } from "react";
import { Button, DollarIcon, Input, Error } from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import { formatUsdValue } from "@/utils/format-value";

export const WITHDRAW_PERCENT_PRESETS = [25, 50, 75, 100];

type AmountSelectionProps = {
  /** Minimum withdrawal from coinflowWithdrawStatus, in whole credits. */
  minCredits: number;
  /**
   * Preset base + upper bound, in whole credits: the effective max
   * `min(maxCredits, withdrawableCredits)` — the backend no longer clamps
   * `maxCredits` by balance, so the caller computes it.
   */
  maxCredits: number;
  lockSelection?: boolean;
  /** Seeds the input (dollars string, e.g. "6.13") — stories/tests only. */
  defaultValue?: string;
  /** Emits the picked amount in whole credits; 0 while empty or invalid. */
  onChange: (credits: number) => void;
};

/**
 * Dollar input + 25/50/75/100% preset chips for the withdraw amount (plan §4).
 * The dollar input converts to whole credits (1 credit = $0.01, so
 * `dollars × 100`). Percentages are of the effective max — fees come out of
 * the requested amount, so "100%" requests the effective max and the confirm
 * step shows the smaller net.
 */
export function AmountSelection({
  minCredits,
  maxCredits,
  lockSelection = false,
  defaultValue,
  onChange,
}: AmountSelectionProps) {
  // The input owns a string so partial entries ("6.", "0.0") survive typing.
  const [value, setValue] = useState<string>(defaultValue ?? "");
  const [selectedPercent, setSelectedPercent] = useState<number | undefined>();

  const parsed = value ? Math.round(Number.parseFloat(value) * 100) : undefined;
  const error =
    parsed === undefined || Number.isNaN(parsed)
      ? null
      : parsed < minCredits
        ? `${formatUsdValue(minCredits / 100)} minimum withdrawal`
        : parsed > maxCredits
          ? `${formatUsdValue(maxCredits / 100)} maximum withdrawal`
          : null;

  const credits =
    parsed !== undefined && !Number.isNaN(parsed) && !error ? parsed : 0;

  useEffect(() => {
    onChange(credits);
  }, [onChange, credits]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input
          className="pl-8 flex-1"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={value}
          disabled={lockSelection}
          onChange={(e) => {
            setValue(e.target.value);
            setSelectedPercent(undefined);
          }}
          onClear={() => {
            setValue("");
            setSelectedPercent(undefined);
          }}
        />
        <DollarIcon size="xs" className="absolute top-3 left-3" />
      </div>

      <div className="flex gap-2 text-sm">
        {WITHDRAW_PERCENT_PRESETS.map((percent) => (
          <Button
            key={percent}
            variant="secondary"
            className={cn(
              "font-sans font-medium normal-case tracking-normal h-8 px-3 py-1.5 text-xs",
              percent === selectedPercent
                ? "bg-background-300 text-foreground-100 hover:bg-background-400 hover:text-foreground-100"
                : "bg-background-100 text-foreground-300 hover:bg-background-300 hover:text-foreground-100",
            )}
            disabled={lockSelection || maxCredits < minCredits}
            onClick={() => {
              const presetCredits = Math.floor((maxCredits * percent) / 100);
              setValue((presetCredits / 100).toFixed(2));
              setSelectedPercent(percent);
            }}
          >
            {percent}%
          </Button>
        ))}
      </div>

      {error && <Error label={error} />}
    </div>
  );
}
