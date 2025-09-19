import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Header,
  Input,
  LayoutContent,
} from "@cartridge/ui";
import {
  AsYouType,
  CountryCode,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  ParseError,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import { useEffect, useState } from "react";

export const PhoneNumberInput = ({
  onSubmit,
  phoneNumber,
  setPhoneNumber,
}: {
  onSubmit: (phoneNumber: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
}) => {
  const [country, setCountry] = useState<CountryCode>("US");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const countries = getCountries().map((c: CountryCode) => {
    const callingCode = getCountryCallingCode(c);
    return {
      codeLabel: `+${callingCode}`,
      code: c,
      label: `${c} (+${callingCode})`,
    };
  });

  const getPlaceholder = (countryCode: CountryCode) => {
    const example = getExampleNumber(countryCode, examples);
    if (example) {
      return example.formatNational();
    }
    return "";
  };

  const validatePhoneNumber = (number: string, countryCode: CountryCode) => {
    if (!number) {
      setError(null);
      setIsValid(false);
      return;
    }

    try {
      const phoneNumber = parsePhoneNumberFromString(number, countryCode);

      if (!phoneNumber && number.length > 1) {
        setError("Invalid phone number format");
        setIsValid(false);
        return;
      }

      if (phoneNumber && phoneNumber?.country !== countryCode) {
        setError(
          `This number doesn't match the selected country (${countryCode})`,
        );
        setIsValid(false);
        return;
      }

      if (phoneNumber && !phoneNumber.isValid()) {
        const lengthValidation = validatePhoneNumberLength(
          phoneNumber.number,
          countryCode,
        );
        if (lengthValidation === "TOO_LONG") {
          setError("Phone number is too long");
          return;
        }
      }

      setError(null);
      setIsValid(true);
    } catch (e) {
      if (e instanceof ParseError) {
        switch ((e as ParseError).message) {
          case "TOO_SHORT":
            break;
          case "TOO_LONG":
            setError("Phone number is too long");
            break;
          case "INVALID_COUNTRY":
            setError("Invalid country code");
            break;
          default:
            setError("Invalid phone number");
        }
      } else {
        setError("Invalid phone number");
      }
      setIsValid(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (!/^[0-9+\-() ]*$/.test(input)) return;

    setPhoneNumber(input);
    validatePhoneNumber(input, country);
  };

  const formatPhoneNumber = (phoneNumber: string | undefined) => {
    if (!phoneNumber) return "";
    const formatter = new AsYouType(country);
    return formatter.input(phoneNumber);
  };

  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry);

    if (phoneNumber) {
      const parsed = parsePhoneNumberFromString(phoneNumber);

      if (parsed && parsed.country === newCountry) {
        setPhoneNumber(parsed.formatNational());
      } else if (parsed && parsed.country !== newCountry) {
        setPhoneNumber("");
        setError("Please enter a new number for the selected country");
      } else {
        const nationalParsed = parsePhoneNumberFromString(
          phoneNumber,
          newCountry,
        );
        if (nationalParsed && nationalParsed.isValid()) {
          setPhoneNumber(nationalParsed.formatNational());
        } else {
          setPhoneNumber("");
        }
      }
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      validatePhoneNumber(phoneNumber, country);
    }
  }, [country]);

  const handleSubmit = () => {
    const parsed = parsePhoneNumberFromString(phoneNumber, country);

    if (parsed && parsed.isValid()) {
      const e164Format = parsed.format("E.164");
      onSubmit(e164Format);
    } else {
      setError("Please enter a valid phone number");
    }
  };

  return (
    <>
      <LayoutContent className="flex flex-col gap-3 w-full h-fit">
        <div className="flex flex-col w-full h-fit gap-[1px] justify-start">
          <Header label="Country Code" />
          <DropdownMenu>
            <DropdownMenuTrigger className="w-fit font-normal" asChild>
              <Button variant="secondary">
                {
                  countries.find(
                    (c: { code: CountryCode }) => c.code === country,
                  )?.codeLabel
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="flex flex-col w-fit overflow-y-scroll max-h-[200px]"
              align="start"
            >
              {countries.map(
                (c: {
                  code: CountryCode;
                  codeLabel: string;
                  label: string;
                }) => (
                  <DropdownMenuItem
                    key={c.code}
                    onClick={() => handleCountryChange(c.code as CountryCode)}
                  >
                    {c.label}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col w-full h-fit gap-[1px]">
          <Header label="Phone Number" />
          <Input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={getPlaceholder(country)}
            className="w-full"
            value={formatPhoneNumber(phoneNumber)}
            error={error ? new Error(error) : undefined}
            onChange={handlePhoneChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) {
                handleSubmit();
              }
            }}
          />
        </div>
      </LayoutContent>
      <div className="flex flex-row items-center justify-center py-4 pr-4 pl-4">
        <div className="flex flex-row border-t border-t-spacer-100 w-full h-fit pt-4 justify-between gap-4">
          <Button variant="secondary" className="px-8">
            Cancel
          </Button>
          <Button
            className="px-6 w-full"
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
};
