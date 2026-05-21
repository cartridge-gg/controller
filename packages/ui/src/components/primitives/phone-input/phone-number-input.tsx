import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/primitives/input";
import { ErrorAlertIcon } from "@/components/icons/error-alert-icon";
import { PhoneCountryCodeSelect } from "./phone-country-code-select";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "./countries";

function countryOf(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

// Display-only mask. `setValue` always receives a plain "+digits" string.
function formatPhoneDigits(
  country: Country | undefined,
  digits: string,
): string {
  if (!country?.mask || !country.maxLength) return digits;

  const d = digits.slice(0, country.maxLength);
  if (!d) return "";

  let out = "";
  let di = 0;
  for (let i = 0; i < country.mask.length; i++) {
    if (di >= d.length) break;
    if (country.mask[i] === "X") out += d[di++];
    else out += country.mask[i];
  }
  return out;
}

// Find the country whose dial_code is the longest prefix of `value`.
// Multiple countries can share a dial_code (e.g. US/CA both "+1"); the
// caller's last explicit selection wins via internal state.
function detectCountry(value: string): string | null {
  if (!value.startsWith("+")) return null;
  let best: { dial_code: string; code: string } | null = null;
  for (const c of COUNTRIES) {
    if (
      value.startsWith(c.dial_code) &&
      (!best || c.dial_code.length > best.dial_code.length)
    ) {
      best = c;
    }
  }
  return best?.code ?? null;
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
  {
    value,
    setValue,
    error,
    disabled,
    allowedCountries,
    userCountryCode,
    inputId,
    placeholder = "(234)567-8900",
  },
  ref,
) {
  const lockedCountry =
    allowedCountries?.length === 1 ? allowedCountries[0] : undefined;
  const isAllowed = (code: string) =>
    !allowedCountries?.length || allowedCountries.includes(code);

  const [country, setCountry] = useState<string>(() => {
    if (lockedCountry) return lockedCountry;
    const detected = detectCountry(value);
    if (detected && isAllowed(detected)) return detected;
    if (allowedCountries?.length) return allowedCountries[0];
    if (
      userCountryCode &&
      countryOf(userCountryCode) &&
      isAllowed(userCountryCode)
    ) {
      return userCountryCode;
    }
    return DEFAULT_COUNTRY;
  });

  // `userCountryCode` may arrive after mount (async geolocation). Apply it
  // only while the user hasn't explicitly picked a country or typed digits.
  const hasUserInteractedRef = useRef(false);

  const effectiveCountry = lockedCountry ?? country;
  const countryData = countryOf(effectiveCountry);
  const dialCode = countryData?.dial_code ?? "";

  // Sync country if the value was set externally to a different dial code.
  useEffect(() => {
    if (lockedCountry) return;
    if (value && !value.startsWith(dialCode)) {
      const detected = detectCountry(value);
      if (detected && isAllowed(detected)) setCountry(detected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, dialCode, lockedCountry, allowedCountries]);

  // Adopt a late-arriving `userCountryCode` as the default selection.
  useEffect(() => {
    if (lockedCountry) return;
    if (hasUserInteractedRef.current) return;
    if (!userCountryCode || !countryOf(userCountryCode)) return;
    if (!isAllowed(userCountryCode)) return;
    const detected = detectCountry(value);
    if (detected && isAllowed(detected)) return;
    setCountry(userCountryCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCountryCode]);

  const digits = useMemo(() => {
    if (value.startsWith(dialCode)) {
      return value.slice(dialCode.length).replace(/\D/g, "");
    }
    return "";
  }, [value, dialCode]);

  const displayValue = useMemo(
    () => formatPhoneDigits(countryData, digits),
    [countryData, digits],
  );

  const handleCountryChange = (newCountry: string) => {
    hasUserInteractedRef.current = true;
    setCountry(newCountry);
    setValue(`${countryOf(newCountry)?.dial_code ?? ""}${digits}`);
  };

  const handleDigitsChange = (raw: string) => {
    hasUserInteractedRef.current = true;
    const sanitized = raw.replace(/\D/g, "");
    // Re-format to apply the format's digit cap, then strip back to digits.
    const capped = formatPhoneDigits(countryData, sanitized).replace(/\D/g, "");
    setValue(`${dialCode}${capped}`);
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
          placeholder={placeholder}
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

// exports

// only numbers, with dial code, +###########
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "";
  const code = detectCountry(phoneNumber);
  const country = code ? countryOf(code) : undefined;
  if (!country?.mask || !country.maxLength) return phoneNumber;
  if (phoneNumber.length !== country.dial_code.length + country.maxLength) {
    return phoneNumber;
  }
  return `${country.dial_code}${formatPhoneDigits(country, phoneNumber.slice(country.dial_code.length))}`;
}
