import { useMemo, useState } from "react";
import {
  Button,
  DateSelect,
  HeaderInner,
  Input,
  LayoutContent,
  LayoutFooter,
  SpinnerIcon,
  CoinbaseWalletColorIcon,
  CheckIcon,
  TimesIcon,
  isValidCalendarDate,
  type DateValue,
} from "@cartridge/controller-ui";
import type { SubmitCoinbaseLimitsUpgradeInput } from "@/utils/api";
import {
  LIMIT_TYPE_LIFETIME_TRANSACTIONS,
  LIMIT_TYPE_WEEKLY_SPENDING,
  UNLIMITED_SENTINEL,
} from "@/hooks/starterpack/coinbase";
import type { CoinbaseLimitsResult } from "@/hooks/starterpack";

export interface VerifyFormPanelProps {
  limits: CoinbaseLimitsResult;
  isResubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (input: SubmitCoinbaseLimitsUpgradeInput) => void;
  hideHeader?: boolean;
}

export function VerifyFormPanel({
  limits,
  isResubmit,
  isSubmitting,
  onSubmit,
  hideHeader,
}: VerifyFormPanelProps) {
  const [ssn, setSsn] = useState("");
  const [dob, setDob] = useState<DateValue>({ year: "", month: "", day: "" });

  const weeklyUpgrade = useMemo(
    () =>
      limits.maxUpgrades?.find(
        (u) => u.limitType === LIMIT_TYPE_WEEKLY_SPENDING,
      )?.maxUpgrade,
    [limits.maxUpgrades],
  );

  /** Human-readable reason the user landed on this form. */
  const reason = useMemo(() => {
    const weekly = limits.limits.find(
      (l) => l.limitType === LIMIT_TYPE_WEEKLY_SPENDING,
    );
    const lifetime = limits.limits.find(
      (l) => l.limitType === LIMIT_TYPE_LIFETIME_TRANSACTIONS,
    );
    const lifetimeDepleted =
      lifetime &&
      lifetime.remaining !== UNLIMITED_SENTINEL &&
      Number(lifetime.remaining) <= 0;
    if (lifetimeDepleted) {
      const cap = lifetime?.limit ?? "15";
      return `You've reached Coinbase's ${cap}-transaction lifetime cap.`;
    }
    const weeklyCap = weekly?.limit;
    return weeklyCap
      ? `This purchase exceeds your $${weeklyCap} weekly Coinbase limit.`
      : "You've reached your Coinbase purchase limit.";
  }, [limits.limits]);

  const ssnValid = /^\d{4}$/.test(ssn);
  const dobValid = isValidCalendarDate(dob);
  const canSubmit = ssnValid && dobValid && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      ssnLast4: ssn,
      dateOfBirth: { day: dob.day, month: dob.month, year: dob.year },
    });
  };

  return (
    <>
      {!hideHeader && (
        <HeaderInner
          title="Verify to continue"
          description="Raise your Coinbase limit"
          icon={<CoinbaseWalletColorIcon size="lg" />}
        />
      )}
      <LayoutContent className="p-4 flex flex-col gap-4">
        <div className="bg-[#181C19] border border-background-200 p-4 rounded-[4px] text-xs text-foreground-300 flex flex-col gap-2">
          {isResubmit ? (
            <p className="text-destructive-100">
              We couldn&apos;t verify your details. Please double-check and try
              again.
            </p>
          ) : (
            <>
              <p>{reason}</p>
              <p>
                Verify your identity to raise your weekly limit
                {weeklyUpgrade ? ` to $${weeklyUpgrade}` : ""} and unlock
                unlimited transactions.
              </p>
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
          <DateSelect value={dob} setValue={setDob} disabled={isSubmitting} />
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit}
          isLoading={isSubmitting}
        >
          SUBMIT
        </Button>
      </LayoutFooter>
    </>
  );
}

export interface VerifyPendingPanelProps {
  hideHeader?: boolean;
}

export function VerifyPendingPanel({
  hideHeader,
}: VerifyPendingPanelProps = {}) {
  return (
    <>
      {!hideHeader && (
        <HeaderInner
          title="Verifying"
          description="Coinbase limits upgrade"
          icon={<CoinbaseWalletColorIcon size="lg" />}
        />
      )}
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
  hideHeader?: boolean;
}

export function VerifyTimeoutPanel({
  onClose,
  hideHeader,
}: VerifyTimeoutPanelProps) {
  return (
    <>
      {!hideHeader && (
        <HeaderInner
          title="Still processing"
          description="Coinbase limits upgrade"
          icon={<CoinbaseWalletColorIcon size="lg" />}
        />
      )}
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
  hideHeader?: boolean;
}

export function VerifyActivePanel({
  limits,
  onContinue,
  hideHeader,
}: VerifyActivePanelProps) {
  const weekly = limits.limits.find(
    (l) => l.limitType === LIMIT_TYPE_WEEKLY_SPENDING,
  );
  const weeklyLimit = weekly?.limit;

  return (
    <>
      {!hideHeader && (
        <HeaderInner
          title="Limits updated"
          description="Coinbase limits upgrade"
          icon={<CoinbaseWalletColorIcon size="lg" />}
        />
      )}
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
  hideHeader?: boolean;
}

export function VerifyInactivePanel({
  onClose,
  hideHeader,
}: VerifyInactivePanelProps) {
  return (
    <>
      {!hideHeader && (
        <HeaderInner
          title="Not eligible"
          description="Coinbase limits upgrade"
          icon={<CoinbaseWalletColorIcon size="lg" />}
        />
      )}
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
