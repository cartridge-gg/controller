import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  MobileIcon,
  PhoneNumberInput,
  PinInput,
  formatPhoneNumber,
} from "@cartridge/controller-ui";
import { isValidPhoneNumber } from "@/utils/input";
import { getIpLocation } from "@/utils";
import { IpLocation } from "@/utils/ip";

export interface SmsOtpState {
  username?: string;
  phoneNumber: string;
  otpId: string;
  otpEncryptionTargetBundle: string;
}

export type VerificationPurpose = "signup" | "login" | "identity";

// Thrown when the backend rejects an OTP code as invalid or expired. The
// drawer treats this as recoverable (let the user re-enter the code); any
// other error is treated as fatal and replaces the submit button with Close.
export class InvalidVerificationCodeError extends Error {
  constructor(message = "Invalid or expired verification code") {
    super(message);
    this.name = "InvalidVerificationCodeError";
  }
}

interface VerifyPhoneNumberDrawerProps {
  isOpen: boolean;
  purpose: VerificationPurpose;
  allowSwitchPhoneNumber?: boolean;
  onClose: () => void;
  // Sends the SMS. On success the hook sets smsState
  onInitOtp: (phoneNumber: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
  // Called to complete authentication.
  onSubmitCode: (otpCode: string) => Promise<void>;
  // null = phone step; non-null = otp step (phone number confirmed).
  smsState: SmsOtpState | null;
  // When provided and isLogin, renders a "Use a different phone" link in the OTP step
  onResetOtp?: () => void;
}

const RESEND_WAIT_SECONDS = 30;

export function VerifyPhoneNumberDrawer({
  isOpen,
  purpose,
  allowSwitchPhoneNumber = true,
  onClose,
  onInitOtp,
  onResendOtp,
  onResetOtp,
  onSubmitCode,
  smsState,
}: VerifyPhoneNumberDrawerProps) {
  const step = smsState?.otpId ? "otp" : "phone";
  const isResolvingPhoneNumber = !!smsState?.phoneNumber.endsWith("*");

  // Local input for typing the phone number before it's confirmed by the hook.
  // Re-synced from the confirmed phone number each time the drawer opens.
  const [phoneInput, setPhoneInput] = useState(smsState?.phoneNumber ?? "");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isFatalCodeError, setIsFatalCodeError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const smsStateRef = useRef(smsState);
  smsStateRef.current = smsState;

  const resetState = useCallback(() => {
    setPhoneInput("");
    setOtpCode("");
    setError(undefined);
    setIsFatalCodeError(false);
    setIsPending(false);
    setOtpSentAt(null);
  }, []);

  const [geoLocation, setGeoLocation] = useState<IpLocation | null>(null);
  useEffect(() => {
    if (!isOpen || geoLocation) return;
    let mounted = true;
    (async () => {
      try {
        const geo = await getIpLocation();
        if (mounted) {
          setGeoLocation(geo);
        }
      } catch (err) {
        console.error("getIpLocation failed:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isOpen, geoLocation]);

  useEffect(() => {
    if (isOpen) {
      setPhoneInput(smsStateRef.current?.phoneNumber ?? "");
    } else {
      resetState();
    }
  }, [isOpen, resetState]);

  useEffect(() => {
    if (smsState?.otpId) {
      // start resend timeout
      setOtpSentAt(Date.now());
    }
  }, [smsState?.otpId]);

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
    if (step === "phone") {
      phoneRef.current?.focus();
    } else {
      otpRef.current?.focus();
    }
  }, [step]);

  const isPhoneInputValid = useMemo(
    () => isValidPhoneNumber(phoneInput),
    [phoneInput],
  );

  const isOtpCodeValid = useMemo(() => otpCode.length == 6, [otpCode]);

  useEffect(() => {
    if (isPhoneInputValid && isOtpCodeValid) {
      setError(undefined);
    }
  }, [isPhoneInputValid, isOtpCodeValid, setError]);

  const handleSubmitPhone = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isPhoneInputValid) {
        setError("Invalid phone format");
        return;
      }
      setError(undefined);
      setIsPending(true);
      try {
        await onInitOtp(phoneInput);
      } catch (err) {
        console.error("onInitOtp error:", err);
        setError((err as Error).message ?? "Failed to send code");
      } finally {
        setIsPending(false);
      }
    },
    [phoneInput, isPhoneInputValid, onInitOtp],
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
        console.error("onSubmitCode Error:", err);
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

  const handleUseDifferentPhone = useCallback(() => {
    resetState();
    onResetOtp?.();
  }, [onResetOtp, resetState]);

  const handleResend = useCallback(async () => {
    if (secondsRemaining > 0 || isPending || !smsState) return;
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
  }, [secondsRemaining, isPending, smsState, onResendOtp]);

  const handleClose = (event?: Event) => {
    if (!isOpen) return; // avoid closing if another drawer is opening
    event?.preventDefault();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent
        title={
          purpose === "signup"
            ? "Sign Up with SMS"
            : purpose === "login"
              ? "Log In with SMS"
              : "Phone Verification"
        }
        icon={<MobileIcon variant="solid" />}
      >
        {step === "phone" ? (
          <form onSubmit={handleSubmitPhone} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label
                htmlFor="sms-phone"
                className="text-xs font-medium text-foreground-400"
              >
                Phone
              </label>
              <PhoneNumberInput
                ref={phoneRef}
                inputId="sms-phone"
                value={phoneInput}
                setValue={setPhoneInput}
                disabled={isPending || isResolvingPhoneNumber}
                error={error}
                placeholder={
                  isResolvingPhoneNumber ? smsState?.phoneNumber : undefined
                }
                userCountryCode={geoLocation?.countryCode}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isPending || !isPhoneInputValid}
                isLoading={isPending || isResolvingPhoneNumber}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label htmlFor="sms-otp" className="text-xs text-foreground-300">
                Please check {formatPhoneNumber(smsState?.phoneNumber ?? "")}{" "}
                for a message from Cartridge and enter your code below.{" "}
                {purpose === "login" &&
                  allowSwitchPhoneNumber &&
                  onResetOtp && (
                    <button
                      type="button"
                      onClick={handleUseDifferentPhone}
                      disabled={isPending}
                      className="text-primary-100 hover:underline disabled:opacity-50"
                    >
                      Use a different phone
                    </button>
                  )}
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

            {error && <p className="text-sm text-destructive">{error}</p>}

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
                  isLoading={isPending || isResolvingPhoneNumber}
                  className="flex-1"
                >
                  {purpose === "signup" ? "Sign Up" : "Continue"}
                </Button>
              )}
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
