import { useState, useEffect } from "react";
import {
  Button,
  Input,
  CheckIcon,
  Thumbnail,
  CreditCardIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Card,
  CardContent,
  UserIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cartridge/ui";
import { useNavigation } from "@/context";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useAccountVerifyMutation, useAccountPrivateQuery } from "@/utils/api";
import { useConnection } from "@/hooks/connection";

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

const COUNTRY_CODE = "+1";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 121 }, (_, index) =>
  String(CURRENT_YEAR - index),
);

const getDaysInMonth = (year: string, month: string) => {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
};

const formatDob = (year: string, month: string, day: string) => {
  if (!year || !month || !day) return null;

  const dob = `${year}-${month}-${day}`;
  const parsedDob = new Date(`${dob}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDob.getTime()) ||
    parsedDob.getUTCFullYear() !== Number(year) ||
    parsedDob.getUTCMonth() + 1 !== Number(month) ||
    parsedDob.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return dob;
};

function DobSelectTrigger({
  placeholder,
  className = "w-full",
}: {
  placeholder: string;
  className?: string;
}) {
  return (
    <SelectTrigger className={`h-10 justify-between ${className}`}>
      <SelectValue placeholder={placeholder} />
      <svg
        aria-hidden="true"
        viewBox="0 0 10 6"
        className="h-1.5 w-2.5 shrink-0 text-foreground-300"
        fill="none"
      >
        <path
          d="M1 1L5 5L9 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SelectTrigger>
  );
}

export function StripeVerification() {
  const { navigate } = useNavigation();
  const { isMainnet } = useConnection();
  const accountVerifyMutation = useAccountVerifyMutation();
  const { refetch: refetchAccountPrivate } = useAccountPrivateQuery(undefined, {
    enabled: false,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const daysInSelectedMonth = getDaysInMonth(dobYear, dobMonth);

  useEffect(() => {
    if (dobDay && Number(dobDay) > daysInSelectedMonth) {
      setDobDay("");
    }
  }, [dobDay, daysInSelectedMonth]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/purchase/checkout/stripe");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async () => {
    setError(null);

    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }
    const dob = formatDob(dobYear, dobMonth, dobDay);
    if (!dob) {
      setError("Please enter a valid date of birth.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    let formattedPhone = "";

    if (cleanPhone.length === 10) {
      formattedPhone = `${COUNTRY_CODE}${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("1")) {
      formattedPhone = `+${cleanPhone}`;
    } else {
      setError("Please enter a valid 10-digit US or Canadian phone number.");
      return;
    }

    try {
      const res = await accountVerifyMutation.mutateAsync({
        input: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dob,
          phoneNumber: formattedPhone,
          sandbox: !isMainnet,
        },
      });

      if (res.accountVerify) {
        await refetchAccountPrivate();
        setIsSuccess(true);
      } else {
        setError("Verification failed.");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    }
  };

  if (isSuccess) {
    return (
      <>
        <HeaderInner
          title="Verified!"
          icon={<CheckIcon />}
          variant="compressed"
        />
        <LayoutContent className="p-4 flex flex-col items-center justify-center">
          <Card className="w-full max-w-sm bg-background-200 border-background-300">
            <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
              <Thumbnail
                icon={<UserIcon variant="solid" />}
                size="lg"
                className="bg-background-300"
                rounded
              />
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Verified!</h2>
                <p className="text-sm text-foreground-300">
                  Continuing to payment...
                </p>
              </div>
            </CardContent>
          </Card>
        </LayoutContent>
        <LayoutFooter />
      </>
    );
  }

  return (
    <>
      <HeaderInner
        title="Identity Verification"
        icon={<CreditCardIcon variant="solid" />}
        variant="compressed"
      />
      <LayoutContent className="p-4 gap-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              First Name
            </label>
            <Input
              name="firstName"
              autoComplete="given-name"
              placeholder="First name"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFirstName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" &&
                firstName &&
                lastName &&
                phone &&
                handleSubmit()
              }
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Last Name
            </label>
            <Input
              name="lastName"
              autoComplete="family-name"
              placeholder="Last name"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setLastName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" &&
                firstName &&
                lastName &&
                phone &&
                handleSubmit()
              }
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Phone Number
            </label>
            <div className="flex w-full gap-2">
              <Select value={COUNTRY_CODE} disabled>
                <DobSelectTrigger
                  placeholder={COUNTRY_CODE}
                  className="w-16 shrink-0"
                />
                <SelectContent>
                  <SelectItem value={COUNTRY_CODE}>{COUNTRY_CODE}</SelectItem>
                </SelectContent>
              </Select>
              <div className="min-w-0 flex-1">
                <Input
                  className="w-full"
                  name="phone"
                  autoComplete="tel-national"
                  placeholder="111-222-3333"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPhone(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    e.key === "Enter" &&
                    firstName &&
                    lastName &&
                    phone &&
                    handleSubmit()
                  }
                  type="tel"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={dobMonth}
                onValueChange={(value) => {
                  setDobMonth(value);
                  setError(null);
                }}
              >
                <DobSelectTrigger placeholder="Month" />
                <SelectContent>
                  {MONTH_OPTIONS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={dobDay}
                onValueChange={(value) => {
                  setDobDay(value);
                  setError(null);
                }}
              >
                <DobSelectTrigger placeholder="Day" />
                <SelectContent>
                  {Array.from({ length: daysInSelectedMonth }, (_, index) => {
                    const value = String(index + 1).padStart(2, "0");
                    return (
                      <SelectItem key={value} value={value}>
                        {index + 1}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Select
                value={dobYear}
                onValueChange={(value) => {
                  setDobYear(value);
                  setError(null);
                }}
              >
                <DobSelectTrigger placeholder="Year" />
                <SelectContent>
                  {YEAR_OPTIONS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert title="Error" description={error} isExpanded={true} />
        )}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          isLoading={accountVerifyMutation.isLoading}
          disabled={
            !firstName ||
            !lastName ||
            !phone ||
            !dobMonth ||
            !dobDay ||
            !dobYear
          }
        >
          CONTINUE
        </Button>
      </LayoutFooter>
    </>
  );
}
