import { useMemo } from "react";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js/min";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/primitives/select";
import { cn } from "@/utils";

const DEFAULT_COUNTRY: CountryCode = "US";

const REGION_NAMES =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : undefined;

function countryDisplayName(code: CountryCode): string {
  return REGION_NAMES?.of(code) ?? code;
}

function dialFor(code: CountryCode): string {
  return `+${getCountryCallingCode(code)}`;
}

export interface PhoneCountryCodeSelectProps {
  /** ISO 3166-1 alpha-2 country code (e.g. "US", "GB"). */
  value: string;
  setValue: (code: string) => void;
  disabled?: boolean;
  className?: string;
  /** ISO country codes to filter the list. When undefined or empty, all
   * countries are listed. */
  allowedCountries?: string[];
  /** ISO 3166-1 alpha-2 country code to use as fallback when `value` does
   * not match a known country. Defaults to {@link DEFAULT_COUNTRY}. */
  userCountryCode?: string | null;
}

export function PhoneCountryCodeSelect({
  value,
  setValue,
  disabled,
  className,
  allowedCountries,
  userCountryCode,
}: PhoneCountryCodeSelectProps) {
  const options = useMemo(() => {
    const all = getCountries();
    const filtered = allowedCountries?.length
      ? all.filter((c) => allowedCountries.includes(c))
      : all;
    return filtered
      .map((c) => ({ code: c, name: countryDisplayName(c), dial: dialFor(c) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allowedCountries]);

  const selected = useMemo(
    () =>
      options.find((o) => o.code === value) ??
      options.find((o) => o.code === userCountryCode) ??
      options.find((o) => o.code === DEFAULT_COUNTRY) ??
      options[0],
    [options, value, userCountryCode],
  );

  if (options.length === 1) {
    return (
      <div
        className={cn(
          "flex h-10 w-fit items-center px-3 py-2 whitespace-nowrap select-none",
          "rounded-md bg-background-200 text-sm/[18px] text-foreground-100",
          className,
        )}
        aria-label="Country area code"
      >
        <span className="px-0.5">{selected?.dial ?? ""}</span>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={setValue} disabled={disabled}>
      <SelectTrigger
        className={cn(className, "w-[10ch]")}
        aria-label="Country area code"
        arrow
      >
        <span>{selected?.dial ?? ""}</span>
      </SelectTrigger>
      <SelectContent>
        {options.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="font-mono inline-block w-[6ch]">
              {country.dial}
            </span>
            <span>{country.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
