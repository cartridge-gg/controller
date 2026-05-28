import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/primitives/select";
import { COUNTRIES, DEFAULT_COUNTRY } from "./countries";
import { cn } from "@/utils";

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
  const selected = useMemo(
    () =>
      COUNTRIES.find((c) => c.code === value) ??
      (userCountryCode
        ? COUNTRIES.find((c) => c.code === userCountryCode)
        : undefined) ??
      COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY),
    [value, userCountryCode],
  );
  const visibleCountries = useMemo(
    () =>
      allowedCountries?.length
        ? COUNTRIES.filter((c) => allowedCountries.includes(c.code))
        : COUNTRIES,
    [allowedCountries],
  );

  return (
    <Select
      variant="input"
      value={value}
      onValueChange={setValue}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(className, "w-[11ch]")}
        aria-label="Country area code"
        arrow
      >
        <span>{selected?.dial_code ?? ""}</span>
      </SelectTrigger>
      <SelectContent>
        {visibleCountries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="font-mono inline-block w-[6ch]">
              {country.dial_code}
            </span>
            <span>{country.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
