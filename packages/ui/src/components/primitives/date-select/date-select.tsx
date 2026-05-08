import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import { cn } from "@/utils";

const MONTH_OPTIONS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const DEFAULT_YEAR_SPAN = 121;

export interface DateValue {
  year: string;
  month: string;
  day: string;
}

export interface DateSelectProps {
  value: DateValue;
  setValue: (value: DateValue) => void;
  disabled?: boolean;
  /** Inclusive year range. Defaults to the last 121 years up to today. */
  yearRange?: { from: number; to: number };
  className?: string;
}

function daysInMonth(year: string, month: string): number {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

export function DateSelect({
  value,
  setValue,
  disabled,
  yearRange,
  className,
}: DateSelectProps) {
  const { year, month, day } = value;

  const currentYear = new Date().getFullYear();
  const fromYear = yearRange?.from ?? currentYear - (DEFAULT_YEAR_SPAN - 1);
  const toYear = yearRange?.to ?? currentYear;
  const yearOptions = Array.from({ length: toYear - fromYear + 1 }, (_, i) =>
    String(toYear - i),
  );

  const handleMonthChange = (next: string) => {
    const maxDay = daysInMonth(year, next);
    const clampedDay = day && Number(day) > maxDay ? "" : day;
    setValue({ year, month: next, day: clampedDay });
  };

  const handleDayChange = (next: string) => {
    setValue({ year, month, day: next });
  };

  const handleYearChange = (next: string) => {
    const maxDay = daysInMonth(next, month);
    const clampedDay = day && Number(day) > maxDay ? "" : day;
    setValue({ year: next, month, day: clampedDay });
  };

  return (
    <div className={cn("flex w-full gap-2", className)}>
      <Select
        variant="input"
        value={month}
        onValueChange={handleMonthChange}
        disabled={disabled}
      >
        <SelectTrigger arrow>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTH_OPTIONS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        variant="input"
        value={day}
        onValueChange={handleDayChange}
        disabled={disabled}
      >
        <SelectTrigger arrow>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: daysInMonth(year, month) }, (_, i) =>
            String(i + 1).padStart(2, "0"),
          ).map((d) => (
            <SelectItem key={d} value={d}>
              {Number(d)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        variant="input"
        value={year}
        onValueChange={handleYearChange}
        disabled={disabled}
      >
        <SelectTrigger arrow>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** True when year/month/day form a real calendar date. */
export function isValidCalendarDate(value: DateValue): boolean {
  const { year, month, day } = value;
  if (!year || !month || !day) return false;
  const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() === Number(year) &&
    parsed.getUTCMonth() + 1 === Number(month) &&
    parsed.getUTCDate() === Number(day)
  );
}
