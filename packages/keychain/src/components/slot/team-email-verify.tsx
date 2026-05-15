import React, { useEffect, useRef, useState } from "react";
import {
  useSendEmailVerificationMutation,
  useVerifyTeamEmailMutation,
} from "@cartridge/controller-ui/utils/api/cartridge";
import {
  Button,
  EnvelopeIcon,
  HeaderInner,
  Input,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Team } from "./teams";

type Step = "EMAIL_INPUT" | "EMAIL_CODE";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface TeamEmailVerifyProps {
  team: Team;
  onVerified: (email: string) => void;
  onBack: () => void;
}

export function TeamEmailVerify({
  team,
  onVerified,
  onBack,
}: TeamEmailVerifyProps) {
  const [step, setStep] = useState<Step>("EMAIL_INPUT");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const sendEmail = useSendEmailVerificationMutation();
  const verifyTeamEmail = useVerifyTeamEmailMutation();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendEmail = async () => {
    setError(null);
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      const res = await sendEmail.mutateAsync({ input: { email } });
      if (res.sendEmailVerification.success) {
        setStep("EMAIL_CODE");
        setCode("");
        setResendCooldown(30);
      } else {
        setError(res.sendEmailVerification.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send email");
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) return;
    setError(null);
    try {
      const res = await verifyTeamEmail.mutateAsync({
        input: { teamName: team.name, email, code },
      });
      if (res.verifyTeamEmail.success) {
        onVerified(email);
      } else {
        setError(res.verifyTeamEmail.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid code");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await handleSendEmail();
  };

  if (step === "EMAIL_INPUT") {
    return (
      <>
        <HeaderInner
          title="Add Team Email"
          icon={<EnvelopeIcon />}
          variant="compressed"
        />
        <LayoutContent className="p-4 gap-4">
          <p className="text-xs text-foreground-300">
            {`Add a contact email for ${team.name} to receive payment receipts.`}
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-foreground-300 font-medium">
              Email
            </label>
            <Input
              name="email"
              autoComplete="email"
              type="email"
              placeholder="team@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setError(null);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && email && handleSendEmail()
              }
            />
          </div>
        </LayoutContent>
        <LayoutFooter>
          {error && (
            <ErrorAlert title="Error" description={error} isExpanded={true} />
          )}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onBack}>
              Back
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSendEmail}
              isLoading={sendEmail.isLoading}
              disabled={!email}
            >
              Continue
            </Button>
          </div>
        </LayoutFooter>
      </>
    );
  }

  return (
    <>
      <HeaderInner
        title="Enter Confirmation Code"
        icon={<EnvelopeIcon />}
        variant="compressed"
      />
      <LayoutContent className="p-4 gap-12">
        <p className="text-xs text-foreground-300">
          Please check {email} for a message and enter your code below.
        </p>
        <PinInput
          value={code}
          onChange={setCode}
          onEnter={handleVerify}
          disabled={verifyTeamEmail.isLoading}
        />
        <p className="text-xs text-foreground-300">
          Didn't get a message?{" "}
          <button
            className="text-primary-100 hover:underline disabled:opacity-50 disabled:no-underline"
            onClick={handleResend}
            disabled={
              verifyTeamEmail.isLoading ||
              sendEmail.isLoading ||
              resendCooldown > 0
            }
          >
            {resendCooldown > 0
              ? `Resend Code (${resendCooldown}s)`
              : "Resend Code"}
          </button>
        </p>
      </LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert title="Error" description={error} isExpanded={true} />
        )}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setStep("EMAIL_INPUT");
              setError(null);
            }}
          >
            Back
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleVerify}
            isLoading={verifyTeamEmail.isLoading}
            disabled={code.length < 6}
          >
            Continue
          </Button>
        </div>
      </LayoutFooter>
    </>
  );
}

function PinInput({
  length = 6,
  value,
  onChange,
  onEnter,
  disabled,
}: {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    const newVal = value.split("");
    newVal[index] = val.slice(-1);
    onChange(newVal.join(""));
    if (val && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "Enter" && value.length === length && onEnter) onEnter();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (digits) {
      onChange(digits);
      inputRefs.current[Math.min(digits.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={(el: HTMLInputElement | null) => (inputRefs.current[i] = el)}
          className="w-11 h-14 text-center text-md bg-background-100 border-background-200 focus:border-primary-100"
          value={value[i] || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(e, i)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(e, i)
          }
          onPaste={handlePaste}
          disabled={disabled}
          maxLength={1}
          inputMode="numeric"
        />
      ))}
    </div>
  );
}
