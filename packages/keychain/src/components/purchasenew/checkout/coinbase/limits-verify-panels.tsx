import { useMemo, useState } from "react";
import {
  Button,
  HeaderInner,
  Input,
  LayoutContent,
  LayoutFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SpinnerIcon,
  CoinbaseWalletColorIcon,
  CheckIcon,
  TimesIcon,
} from "@cartridge/ui";
import type { SubmitCoinbaseLimitsUpgradeInput } from "@/utils/api";
import { LIMIT_TYPE_WEEKLY_SPENDING } from "@/hooks/starterpack/coinbase";
import type { CoinbaseLimitsResult } from "@/hooks/starterpack";

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

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 121 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

function daysInMonth(year: string, month: string): number {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

function isValidCalendarDate(
  year: string,
  month: string,
  day: string,
): boolean {
  if (!year || !month || !day) return false;
  const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() === Number(year) &&
    parsed.getUTCMonth() + 1 === Number(month) &&
    parsed.getUTCDate() === Number(day)
  );
}

function DobSelectTrigger({ placeholder }: { placeholder: string }) {
  return (
    <SelectTrigger className="h-10 w-full justify-between">
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

export interface VerifyFormPanelProps {
  limits: CoinbaseLimitsResult;
  isResubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (input: SubmitCoinbaseLimitsUpgradeInput) => void;
  onBack: () => void;
}

export function VerifyFormPanel({
  limits,
  isResubmit,
  isSubmitting,
  onSubmit,
  onBack,
}: VerifyFormPanelProps) {
  const [ssn, setSsn] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");

  const weeklyUpgrade = useMemo(
    () =>
      limits.maxUpgrades?.find(
        (u) => u.limitType === LIMIT_TYPE_WEEKLY_SPENDING,
      )?.maxUpgrade,
    [limits.maxUpgrades],
  );

  const ssnValid = /^\d{4}$/.test(ssn);
  const dobValid = isValidCalendarDate(year, month, day);
  const canSubmit = ssnValid && dobValid && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      ssnLast4: ssn,
      dateOfBirth: { day, month, year },
    });
  };

  return (
    <>
      <HeaderInner
        title="Verify to continue"
        description="Raise your Coinbase limit"
        icon={<CoinbaseWalletColorIcon size="lg" />}
      />
      <LayoutContent className="p-4 flex flex-col gap-4">
        <div className="bg-[#181C19] border border-background-200 p-4 rounded-[4px] text-xs text-foreground-300">
          {isResubmit ? (
            <span className="text-destructive-100">
              We couldn&apos;t verify your details. Please double-check and try
              again.
            </span>
          ) : (
            <>
              Verify your identity to raise your weekly limit
              {weeklyUpgrade ? ` to $${weeklyUpgrade}` : ""} and unlock
              unlimited transactions. Takes about 2 minutes.
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="ssn-last4"
            className="text-xs text-foreground-300 font-medium"
          >
            Last 4 digits of SSN
          </label>
          <Input
            id="ssn-last4"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            placeholder="••••"
            maxLength={4}
            value={ssn}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "").slice(0, 4);
              setSsn(next);
            }}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-foreground-300 font-medium">
            Date of Birth
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Select value={month} onValueChange={setMonth}>
              <DobSelectTrigger placeholder="Month" />
              <SelectContent>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={day} onValueChange={setDay}>
              <DobSelectTrigger placeholder="Day" />
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
            <Select value={year} onValueChange={setYear}>
              <DobSelectTrigger placeholder="Year" />
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </LayoutContent>
      <LayoutFooter>
        <div className="flex gap-2 w-full">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onBack}
            disabled={isSubmitting}
          >
            BACK
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            SUBMIT
          </Button>
        </div>
      </LayoutFooter>
    </>
  );
}

export function VerifyPendingPanel() {
  return (
    <>
      <HeaderInner
        title="Verifying"
        description="Coinbase limits upgrade"
        icon={<CoinbaseWalletColorIcon size="lg" />}
      />
      <LayoutContent className="p-4 flex flex-col items-center justify-center gap-6 pb-24">
        <SpinnerIcon className="animate-spin" size="lg" />
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground-100">
            Verifying your details…
          </p>
          <p className="text-xs text-foreground-300 mt-1">
            This usually takes a few seconds.
          </p>
        </div>
      </LayoutContent>
    </>
  );
}

export interface VerifyTimeoutPanelProps {
  onClose: () => void;
}

export function VerifyTimeoutPanel({ onClose }: VerifyTimeoutPanelProps) {
  return (
    <>
      <HeaderInner
        title="Still processing"
        description="Coinbase limits upgrade"
        icon={<CoinbaseWalletColorIcon size="lg" />}
      />
      <LayoutContent className="p-4 flex flex-col items-center justify-center gap-6 pb-24 text-center">
        <SpinnerIcon className="animate-spin" size="lg" />
        <div>
          <p className="text-sm font-semibold text-foreground-100">
            Still processing
          </p>
          <p className="text-xs text-foreground-300 mt-1">
            Come back in a few minutes — we&apos;ll pick up where you left off.
          </p>
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button className="w-full" onClick={onClose}>
          CLOSE
        </Button>
      </LayoutFooter>
    </>
  );
}

export interface VerifyActivePanelProps {
  limits: CoinbaseLimitsResult;
  onContinue: () => void;
}

export function VerifyActivePanel({
  limits,
  onContinue,
}: VerifyActivePanelProps) {
  const weekly = limits.limits.find(
    (l) => l.limitType === LIMIT_TYPE_WEEKLY_SPENDING,
  );
  const weeklyLimit = weekly?.limit;

  return (
    <>
      <HeaderInner
        title="Limits updated"
        description="Coinbase limits upgrade"
        icon={<CoinbaseWalletColorIcon size="lg" />}
      />
      <LayoutContent className="p-4 flex flex-col items-center justify-center gap-6 pb-24 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckIcon size="lg" className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground-100">
            You&apos;re verified
          </p>
          <p className="text-xs text-foreground-300 mt-1">
            Your weekly limit is now ${weeklyLimit ?? "2,500"} with unlimited
            transactions.
          </p>
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button className="w-full" onClick={onContinue}>
          CONTINUE
        </Button>
      </LayoutFooter>
    </>
  );
}

export interface VerifyInactivePanelProps {
  onClose: () => void;
}

export function VerifyInactivePanel({ onClose }: VerifyInactivePanelProps) {
  return (
    <>
      <HeaderInner
        title="Not eligible"
        description="Coinbase limits upgrade"
        icon={<CoinbaseWalletColorIcon size="lg" />}
      />
      <LayoutContent className="p-4 flex flex-col items-center justify-center gap-6 pb-24 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <TimesIcon size="lg" className="text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground-100">
            Not eligible
          </p>
          <p className="text-xs text-foreground-300 mt-1">
            Your account isn&apos;t eligible for a limit increase at this time.
          </p>
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button className="w-full" onClick={onClose}>
          CLOSE
        </Button>
      </LayoutFooter>
    </>
  );
}
