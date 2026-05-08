import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/primitives/select";
import { COUNTRIES } from "./countries";

export interface PhoneCountryCodeSelectProps {
  /** ISO 3166-1 alpha-2 country code (e.g. "US", "GB"). */
  value: string;
  setValue: (code: string) => void;
  disabled?: boolean;
  className?: string;
  /** ISO country codes to filter the list. When undefined or empty, all
   * countries are listed. */
  allowedCountries?: string[];
}

export function PhoneCountryCodeSelect({
  value,
  setValue,
  disabled,
  className,
  allowedCountries,
}: PhoneCountryCodeSelectProps) {
  const selected = COUNTRIES.find((c) => c.code === value);
  const visibleCountries = allowedCountries?.length
    ? COUNTRIES.filter((c) => allowedCountries.includes(c.code))
    : COUNTRIES;

  return (
    <Select
      variant="input"
      value={value}
      onValueChange={setValue}
      disabled={disabled}
    >
      <SelectTrigger className={className} aria-label="Country area code" arrow>
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
