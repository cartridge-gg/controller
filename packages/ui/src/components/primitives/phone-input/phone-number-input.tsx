import { forwardRef, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/primitives/input";
import { ErrorAlertIcon } from "@/components/icons/error-alert-icon";
import { PhoneCountryCodeSelect } from "./phone-country-code-select";
import { COUNTRIES } from "./countries";

const DEFAULT_COUNTRY = "US";

function dialCodeOf(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.dial_code ?? "";
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
    inputId,
    placeholder = "234 567 8900",
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
    return DEFAULT_COUNTRY;
  });

  const effectiveCountry = lockedCountry ?? country;
  const dialCode = dialCodeOf(effectiveCountry);

  // Sync country if the value was set externally to a different dial code.
  useEffect(() => {
    if (lockedCountry) return;
    if (value && !value.startsWith(dialCode)) {
      const detected = detectCountry(value);
      if (detected && isAllowed(detected)) setCountry(detected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, dialCode, lockedCountry, allowedCountries]);

  const digits = useMemo(() => {
    if (value.startsWith(dialCode)) {
      return value.slice(dialCode.length).replace(/\D/g, "");
    }
    return "";
  }, [value, dialCode]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setValue(`${dialCodeOf(newCountry)}${digits}`);
  };

  const handleDigitsChange = (raw: string) => {
    const sanitized = raw.replace(/\D/g, "");
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
          value={digits}
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

/** E.164 international phone number format. */
export function isValidPhoneNumber(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}
