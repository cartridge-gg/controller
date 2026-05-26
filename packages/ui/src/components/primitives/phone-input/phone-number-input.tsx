import { forwardRef, useEffect, useMemo, useState } from "react";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js/min";
import examples from "libphonenumber-js/examples.mobile.json";
import { Input } from "@/components/primitives/input";
import { ErrorAlertIcon } from "@/components/icons/error-alert-icon";
import { PhoneCountryCodeSelect } from "./phone-country-code-select";

const DEFAULT_COUNTRY: CountryCode = "US";
const MAX_NATIONAL_DIGITS = 15;

const SUPPORTED_COUNTRIES = new Set<string>(getCountries());

function isCountryCode(code: string | undefined): code is CountryCode {
  return !!code && SUPPORTED_COUNTRIES.has(code);
}

function dialPrefix(country: CountryCode): string {
  return `+${getCountryCallingCode(country)}`;
}

function detectCountry(value: string): CountryCode | undefined {
  if (!value) return undefined;
  const ayt = new AsYouType();
  ayt.input(value);
  return ayt.getCountry();
}

function nationalDigitsOf(value: string, country: CountryCode): string {
  const prefix = dialPrefix(country);
  const after = value.startsWith(prefix) ? value.slice(prefix.length) : "";
  return after.replace(/\D/g, "").slice(0, MAX_NATIONAL_DIGITS);
}

function formatNationalDigits(country: CountryCode, digits: string): string {
  if (!digits) return "";
  return new AsYouType(country).input(digits);
}

function examplePlaceholder(country: CountryCode): string {
  return getExampleNumber(country, examples)?.formatNational() ?? "";
}

export interface PhoneNumberInputProps {
  /** Full E.164 phone number (e.g. "+12345678900"). */
  value: string;
  setValue: (value: string) => void;
  /** External error message (e.g. API failure). */
  error?: string;
  disabled?: boolean;
  /** ISO country codes (e.g. ["US", "CA"]) to restrict selection. When
   * undefined or empty, all countries are listed. When a single code is
   * passed, it is pre-selected and the select is disabled. */
  allowedCountries?: string[];
  /** ISO 3166-1 alpha-2 country code used as the initial selection when no
   * country can be detected from `value` and no `allowedCountries` apply.
   * Falls back to {@link DEFAULT_COUNTRY} when undefined. */
  userCountryCode?: string | null;
  inputId?: string;
  placeholder?: string;
}

export const PhoneNumberInput = forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(function PhoneNumberInput(
  { value, setValue, error, disabled, allowedCountries, inputId, placeholder },
  ref,
) {
  const lockedCountry =
    allowedCountries?.length === 1 && isCountryCode(allowedCountries[0])
      ? (allowedCountries[0] as CountryCode)
      : undefined;
  const isAllowed = (code: CountryCode) =>
    !allowedCountries?.length || allowedCountries.includes(code);

  const [country, setCountry] = useState<CountryCode>(() => {
    if (lockedCountry) return lockedCountry;
    const detected = detectCountry(value);
    if (detected && isAllowed(detected)) return detected;
    const fallback = allowedCountries?.find(isCountryCode);
    return fallback ?? DEFAULT_COUNTRY;
  });

  // `userCountryCode` may arrive after mount (async geolocation). Apply it
  // only while the user hasn't explicitly picked a country or typed digits.
  const hasUserInteractedRef = useRef(false);

  const effectiveCountry = lockedCountry ?? country;
  const dialCode = dialPrefix(effectiveCountry);

  // Sync country if `value` was set externally to a different dial code.
  useEffect(() => {
    if (lockedCountry) return;
    if (value && !value.startsWith(dialCode)) {
      const detected = detectCountry(value);
      if (detected && isAllowed(detected)) setCountry(detected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, dialCode, lockedCountry, allowedCountries]);

  const digits = useMemo(
    () => nationalDigitsOf(value, effectiveCountry),
    [value, effectiveCountry],
  );

  const displayValue = useMemo(
    () => formatNationalDigits(effectiveCountry, digits),
    [effectiveCountry, digits],
  );

  const effectivePlaceholder = useMemo(
    () => placeholder ?? examplePlaceholder(effectiveCountry),
    [placeholder, effectiveCountry],
  );

  const handleCountryChange = (next: string) => {
    if (!isCountryCode(next)) return;
    setCountry(next);
    setValue(`${dialPrefix(next)}${digits}`);
  };

  const handleDigitsChange = (raw: string) => {
    let sanitized = raw.replace(/\D/g, "").slice(0, MAX_NATIONAL_DIGITS);
    // If the user deleted a formatting character (e.g. ')' in "(123)"),
    // the digit count is unchanged but `raw` is shorter than what we last
    // rendered. Treat that as a request to remove the preceding digit so
    // the deletion isn't masked by re-formatting.
    if (
      sanitized.length === digits.length &&
      raw.length < displayValue.length
    ) {
      sanitized = sanitized.slice(0, -1);
    }
    // Cap to the selected country's max national length. Trims overflow
    // from a paste; blocks the keystroke once the country max is reached.
    while (
      sanitized.length > 0 &&
      validatePhoneNumberLength(`${dialCode}${sanitized}`, effectiveCountry) ===
        "TOO_LONG"
    ) {
      sanitized = sanitized.slice(0, -1);
    }
    setValue(`${dialCode}${sanitized}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full gap-2">
        <PhoneCountryCodeSelect
          value={effectiveCountry}
          setValue={handleCountryChange}
          disabled={disabled || !!lockedCountry}
          allowedCountries={allowedCountries}
          userCountryCode={userCountryCode}
          className="w-20 shrink-0"
        />
        <Input
          ref={ref}
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={effectivePlaceholder}
          containerClassName="min-w-0 flex-1"
          value={displayValue}
          onChange={(e) => handleDigitsChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <ErrorAlertIcon variant="error" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

// Display-format a stored E.164 phone number (e.g. "+1 234 567 8900").
// Falls back to the raw input if parsing fails.
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "";
  const parsed = parsePhoneNumberFromString(phoneNumber);
  return parsed?.formatInternational() ?? phoneNumber;
}
