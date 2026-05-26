import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  EnvelopeIcon,
  Input,
  PinInput,
} from "@cartridge/controller-ui";
import { isValidEmailAddress } from "@/utils/input";
import { InvalidVerificationCodeError, VerifyErrorAlert } from "./error";

export interface EmailOtpState {
  email: string;
  otpId: string;
}

interface VerifyEmailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInitOtp: (email: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
  onSubmitCode: (otpCode: string) => Promise<void>;
  emailState: EmailOtpState | null;
}

const RESEND_WAIT_SECONDS = 30;

export function VerifyEmailDrawer({
  isOpen,
  onClose,
  onInitOtp,
  onResendOtp,
  onSubmitCode,
  emailState,
}: VerifyEmailDrawerProps) {
  const step = emailState?.otpId ? "otp" : "email";

  const [emailInput, setEmailInput] = useState(emailState?.email ?? "");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isFatalCodeError, setIsFatalCodeError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const emailStateRef = useRef(emailState);
  emailStateRef.current = emailState;

  const resetState = useCallback(() => {
    setEmailInput("");
    setOtpCode("");
    setError(undefined);
    setIsFatalCodeError(false);
    setIsPending(false);
    setOtpSentAt(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setEmailInput(emailStateRef.current?.email ?? "");
    } else {
      resetState();
    }
  }, [isOpen, resetState]);

  useEffect(() => {
    if (emailState?.otpId) {
      setOtpSentAt(Date.now());
    }
  }, [emailState?.otpId]);

  useEffect(() => {
    if (otpSentAt === null) {
      setSecondsRemaining(0);
      return;
    }
    const compute = () =>
      Math.max(
        0,
        RESEND_WAIT_SECONDS - Math.floor((Date.now() - otpSentAt) / 1000),
      );
    setSecondsRemaining(compute());
    const id = setInterval(() => {
      const remaining = compute();
      setSecondsRemaining(remaining);
      if (remaining === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [otpSentAt]);

  useEffect(() => {
    if (step === "email") {
      emailRef.current?.focus();
    } else {
      otpRef.current?.focus();
    }
  }, [step]);

  const isEmailInputValid = useMemo(
    () => isValidEmailAddress(emailInput),
    [emailInput],
  );

  const isOtpCodeValid = useMemo(() => otpCode.length == 6, [otpCode]);

  useEffect(() => {
    if (isEmailInputValid && isOtpCodeValid) {
      setError(undefined);
    }
  }, [isEmailInputValid, isOtpCodeValid, setError]);

  const handleSubmitEmail = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isEmailInputValid) {
        setError("Invalid email format");
        return;
      }
      setError(undefined);
      setIsPending(true);
      try {
        await onInitOtp(emailInput);
      } catch (err) {
        setError((err as Error).message ?? "Failed to send code");
      } finally {
        setIsPending(false);
      }
    },
    [emailInput, isEmailInputValid, onInitOtp],
  );

  const handleSubmitCode = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isOtpCodeValid) {
        setError("Invalid code");
        return;
      }
      setError(undefined);
      setIsPending(true);
      try {
        await onSubmitCode(otpCode);
      } catch (err) {
        setError((err as Error).message ?? "Failed to verify code");
        if (!(err instanceof InvalidVerificationCodeError)) {
          setIsFatalCodeError(true);
        }
      } finally {
        setIsPending(false);
      }
    },
    [otpCode, isOtpCodeValid, onSubmitCode],
  );

  const handleResend = useCallback(async () => {
    if (secondsRemaining > 0 || isPending || !emailState) return;
    setError(undefined);
    setIsPending(true);
    try {
      await onResendOtp();
    } catch (err) {
      console.error("onResendOtp Error:", err);
      setError((err as Error).message ?? "Failed to resend code");
    } finally {
      setIsPending(false);
    }
  }, [secondsRemaining, isPending, emailState, onResendOtp]);

  const handleClose = (event?: Event) => {
    if (!isOpen) return;
    event?.preventDefault();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent title="Email Verification" icon={<EnvelopeIcon />}>
        {step === "email" ? (
          <form onSubmit={handleSubmitEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label
                htmlFor="email-input"
                className="text-xs font-medium text-foreground-400"
              >
                Email
              </label>
              <Input
                ref={emailRef}
                id="email-input"
                type="email"
                autoComplete="email"
                name="email"
                placeholder="shinobi@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={isPending}
              />
            </div>

            {error && <VerifyErrorAlert error={error} />}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isPending || !isEmailInputValid}
                isLoading={isPending}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label
                htmlFor="email-otp"
                className="text-xs text-foreground-300"
              >
                Please check {emailState?.email} for a message from Cartridge
                and enter your code below.
              </label>
              <PinInput
                type="numeric"
                length={6}
                ref={otpRef}
                value={otpCode}
                onChange={setOtpCode}
                disabled={isPending || isFatalCodeError}
                variant={error ? "destructive" : "default"}
                className="py-4"
              />
              {otpSentAt !== null && (
                <p className="text-xs text-foreground-300">
                  Didn't get a message?{" "}
                  {secondsRemaining > 0 ? (
                    <>Resend in {secondsRemaining}...</>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isPending}
                      className="text-primary-100 hover:underline disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  )}
                </p>
              )}
            </div>

            {error && <VerifyErrorAlert error={error} />}

            <div className="flex gap-2">
              {isFatalCodeError ? (
                <Button
                  type="button"
                  onClick={() => onClose()}
                  className="flex-1"
                >
                  Close
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending || !isOtpCodeValid}
                  isLoading={isPending}
                  className="flex-1"
                >
                  Continue
                </Button>
              )}
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
