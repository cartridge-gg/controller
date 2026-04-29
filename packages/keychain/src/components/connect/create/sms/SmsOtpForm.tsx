import { AuthOption } from "@cartridge/controller";
import {
  Button,
  Drawer,
  DrawerContent,
  Input,
  MobileIcon,
} from "@cartridge/controller-ui";
import { useCallback, useEffect, useRef, useState } from "react";

interface SmsOtpFormProps {
  phoneNumber: string;
  onSubmitPhone: (phoneNumber: string) => Promise<void>;
  onSubmitOtp: (otpCode: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
}

export function SmsOtpForm({
  phoneNumber: initialPhoneNumber,
  onSubmitPhone,
  onSubmitOtp,
  onBack,
  isLoading,
  error,
}: SmsOtpFormProps) {
  const [step, setStep] = useState<"phone" | "otp">(
    initialPhoneNumber ? "otp" : "phone",
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [otpCode, setOtpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const handlePhoneSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!phoneNumber.trim()) return;
      setSubmitting(true);
      try {
        await onSubmitPhone(phoneNumber.trim());
        setStep("otp");
      } finally {
        setSubmitting(false);
      }
    },
    [phoneNumber, onSubmitPhone],
  );

  const handleOtpSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!otpCode.trim()) return;
      setSubmitting(true);
      try {
        await onSubmitOtp(otpCode.trim());
      } finally {
        setSubmitting(false);
      }
    },
    [otpCode, onSubmitOtp],
  );

  const busy = isLoading || submitting;

  return (
    <div className="w-full h-full fixed top-0 left-0 flex flex-col items-center justify-center bg-translucent-dark-200 backdrop-blur-sm z-[10001] pointer-events-auto">
      <div className="w-[320px] rounded-[16px] p-6 bg-background-100 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex flex-col gap-4">
        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <MobileIcon variant="solid" size="sm" />
              <span className="text-sm font-medium text-foreground-200">
                Enter your phone number
              </span>
            </div>
            <Input
              ref={inputRef}
              type="tel"
              placeholder="+1 234 567 8900"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={busy}
            />
            {error && (
              <span className="text-xs text-destructive-100">{error}</span>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={busy}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={busy || !phoneNumber.trim()}
                isLoading={busy}
                className="flex-1"
              >
                Send code
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <MobileIcon variant="solid" size="sm" />
              <span className="text-sm font-medium text-foreground-200">
                Enter the code sent to {phoneNumber}
              </span>
            </div>
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              placeholder="Enter code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={busy}
              autoComplete="one-time-code"
            />
            {error && (
              <span className="text-xs text-destructive-100">{error}</span>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStep("phone");
                  setOtpCode("");
                }}
                disabled={busy}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={busy || !otpCode.trim()}
                isLoading={busy}
                className="flex-1"
              >
                Verify
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export interface SmsOtpDrawerProps {
  isOpen: boolean;
  isLoading: boolean;
  isLogin: boolean;
  onClose: () => void;
  onSubmit: (authenticationMode?: AuthOption, phoneNumber?: string) => void;
  onSubmitCode: (otpCode: string) => Promise<void>;
}

export function SmsOtpDrawer({
  isOpen,
  isLoading,
  isLogin,
  onClose,
  onSubmit,
  onSubmitCode,
}: SmsOtpDrawerProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("phone");
      setPhoneNumber("");
      setOtpCode("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "phone") {
      phoneRef.current?.focus();
    } else {
      otpRef.current?.focus();
    }
  }, [step]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (step === "phone") {
        if (!phoneNumber) return;
        onSubmit("sms", phoneNumber);
        setStep("otp");
      } else {
        if (!otpCode) return;
        await onSubmitCode(otpCode);
      }
    },
    [step, phoneNumber, otpCode, onSubmit, onSubmitCode],
  );

  const handleClose = () => {
    if (!isOpen) return;
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent
        title={`${isLogin ? "Login" : "Sign Up"} with SMS`}
        icon={<MobileIcon variant="solid" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="phoneNumber"
              className="text-xs font-medium text-foreground-400"
            >
              Phone Number
            </label>
            <Input
              ref={phoneRef}
              id="phoneNumber"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.trim())}
              disabled={isLoading || step === "otp"}
              autoComplete="tel"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="otpCode"
              className="text-xs font-medium text-foreground-400"
            >
              Verification Code
            </label>
            <Input
              ref={otpRef}
              id="otpCode"
              type="text"
              inputMode="numeric"
              placeholder="Enter code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.trim())}
              disabled={isLoading || step === "phone"}
              autoComplete="one-time-code"
            />
          </div>

          <div className="flex gap-2">
            {step === "phone" && (
              <Button
                type="submit"
                disabled={isLoading || !phoneNumber}
                isLoading={isLoading}
                className="flex-1"
              >
                {isLogin ? "Login" : "Sign Up"}
              </Button>
            )}
            {step === "otp" && (
              <Button
                type="submit"
                disabled={isLoading || !otpCode}
                isLoading={isLoading}
                className="flex-1"
              >
                Continue
              </Button>
            )}
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
