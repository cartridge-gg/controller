import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthOption } from "@cartridge/controller";
import {
  Button,
  Drawer,
  DrawerContent,
  MobileIcon,
  PhoneNumberInput,
  PinInput,
  isValidPhoneNumber,
} from "@cartridge/controller-ui";

export interface SmsOtpDrawerProps {
  isOpen: boolean;
  isLogin: boolean;
  onClose: () => void;
  /** Sends the SMS. On success the hook sets smsState (null → otp step). */
  onInitOtp: (phoneNumber: string) => Promise<void>;
  /** Called with ("sms", otpCode) to complete authentication. */
  onSubmit: (authenticationMode?: AuthOption, otpCode?: string) => void;
  /** null = phone step; non-null = otp step (phone number confirmed). */
  smsState: {
    phoneNumber: string;
    otpId: string;
    otpEncryptionTargetBundle: string;
  } | null;
}

export function SmsOtpDrawer({
  isOpen,
  isLogin,
  onClose,
  onInitOtp,
  onSubmit,
  smsState,
}: SmsOtpDrawerProps) {
  const step = smsState?.otpId ? "otp" : "phone";

  // Local input for typing the phone number before it's confirmed by the hook.
  // Re-synced from the confirmed phone number each time the drawer opens.
  const [phoneInput, setPhoneInput] = useState(smsState?.phoneNumber ?? "");
  const [otpCode, setOtpCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [phoneInputError, setPhoneInputError] = useState<string | undefined>();
  const [otpCodeError, setOtpCodeError] = useState<string | undefined>();
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const smsStateRef = useRef(smsState);
  smsStateRef.current = smsState;

  useEffect(() => {
    if (isOpen) {
      setPhoneInput(smsStateRef.current?.phoneNumber ?? "");
    } else {
      setOtpCode("");
      setSendingCode(false);
      setPhoneInputError(undefined);
      setOtpCodeError(undefined);
      setOtpSentAt(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (smsState?.otpId) {
      setOtpSentAt(Date.now());
    }
  }, [smsState?.otpId]);

  useEffect(() => {
    if (otpSentAt === null) {
      setSecondsRemaining(0);
      return;
    }
    const compute = () =>
      Math.max(0, 60 - Math.floor((Date.now() - otpSentAt) / 1000));
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

  // Alphanumeric, 6 to 9 characters long
  const isOtpCodeValid = useMemo(() => otpCode.length == 6, [otpCode]);

  useEffect(() => {
    if (phoneInputError && isPhoneInputValid) {
      setPhoneInputError(undefined);
    }
  }, [phoneInputError, isPhoneInputValid, setPhoneInputError]);

  useEffect(() => {
    if (otpCodeError && isOtpCodeValid) {
      setOtpCodeError(undefined);
    }
  }, [otpCodeError, isOtpCodeValid, setOtpCodeError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (step === "phone") {
        if (!isPhoneInputValid) {
          setPhoneInputError("Invalid phone format");
          return;
        }
        setPhoneInputError(undefined);
        setSendingCode(true);
        try {
          await onInitOtp(phoneInput);
        } catch (err) {
          setPhoneInputError((err as Error).message ?? "Failed to send code");
        } finally {
          setSendingCode(false);
        }
      } else {
        if (!isOtpCodeValid) {
          setOtpCodeError("Invalid code");
          return;
        }
        onSubmit("sms", otpCode);
      }
    },
    [
      step,
      phoneInput,
      isPhoneInputValid,
      otpCode,
      isOtpCodeValid,
      onInitOtp,
      onSubmit,
    ],
  );

  const handleResend = useCallback(async () => {
    if (secondsRemaining > 0 || sendingCode || !smsState?.phoneNumber) return;
    setOtpCodeError(undefined);
    setSendingCode(true);
    try {
      await onInitOtp(smsState.phoneNumber);
    } catch (err) {
      setOtpCodeError((err as Error).message ?? "Failed to resend code");
    } finally {
      setSendingCode(false);
    }
  }, [secondsRemaining, sendingCode, smsState?.phoneNumber, onInitOtp]);

  const handleClose = (event?: Event) => {
    if (!isOpen) return; // avoid closing if another drawer is opening
    event?.preventDefault();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent
        title={`${isLogin ? "Log In" : "Sign Up"} with SMS`}
        icon={<MobileIcon variant="solid" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="sms-phone"
              className="text-xs font-medium text-foreground-400"
            >
              Phone Number
            </label>
            <PhoneNumberInput
              ref={phoneRef}
              inputId="sms-phone"
              value={
                step === "phone" ? phoneInput : (smsState?.phoneNumber ?? "")
              }
              setValue={setPhoneInput}
              disabled={sendingCode || step === "otp"}
              error={phoneInputError}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="sms-otp"
              className="text-xs font-medium text-foreground-400"
            >
              Verification Code
            </label>
            <PinInput
              type="numeric"
              length={6}
              ref={otpRef}
              value={otpCode}
              onChange={setOtpCode}
              disabled={sendingCode || step === "phone"}
              variant={otpCodeError ? "destructive" : "default"}
              className="py-6"
            />
            {step === "otp" && otpSentAt !== null && (
              <p className="text-xs text-foreground-300">
                Didn't get a message?{" "}
                {secondsRemaining > 0 ? (
                  <>Resend in {secondsRemaining}...</>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={sendingCode}
                    className="text-primary-100 hover:underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </p>
            )}
          </div>

          {otpCodeError && (
            <p className="text-sm text-destructive">{otpCodeError}</p>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={
                sendingCode ||
                (step === "phone" ? !isPhoneInputValid : !isOtpCodeValid)
              }
              isLoading={sendingCode}
              className="flex-1"
            >
              {step === "phone" ? "Send Code" : "Sign Up"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
