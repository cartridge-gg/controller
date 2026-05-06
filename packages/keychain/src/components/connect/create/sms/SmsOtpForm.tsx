import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthOption } from "@cartridge/controller";
import {
  Button,
  Drawer,
  DrawerContent,
  Input,
  MobileIcon,
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
  smsState: { phoneNumber: string; otpId: string } | null;
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
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === "phone") {
      phoneRef.current?.focus();
    } else {
      otpRef.current?.focus();
    }
  }, [step]);

  // E.164 international phone number format
  const isPhoneInputValid = useMemo(
    () => !!phoneInput && /^\+[1-9]\d{6,14}$/.test(phoneInput),
    [phoneInput],
  );

  // Alphanumeric, 6 to 9 characters long
  const isOtpCodeValid = useMemo(
    () => !!otpCode && /^[a-zA-Z0-9]{6,9}$/.test(otpCode),
    [otpCode],
  );

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

  const handleClose = (event?: Event) => {
    if (!isOpen) return; // avoid closing if another drawer is opening
    event?.preventDefault();
    onClose();
  };

  const busy = sendingCode;

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent
        title={`${isLogin ? "Login" : "Sign Up"} with SMS`}
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
            <Input
              ref={phoneRef}
              id="sms-phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={
                step === "phone" ? phoneInput : (smsState?.phoneNumber ?? "")
              }
              onChange={(e) => setPhoneInput(e.target.value.trim())}
              disabled={busy || step === "otp"}
              autoComplete="tel"
            />
          </div>

          {phoneInputError && (
            <p className="text-sm text-destructive">{phoneInputError}</p>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="sms-otp"
              className="text-xs font-medium text-foreground-400"
            >
              Verification Code
            </label>
            <Input
              ref={otpRef}
              id="sms-otp"
              type="text"
              inputMode="numeric"
              placeholder="Enter code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.trim().toUpperCase())}
              disabled={busy || step === "phone"}
              autoComplete="one-time-code"
            />
          </div>

          {otpCodeError && (
            <p className="text-sm text-destructive">{otpCodeError}</p>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy || (step === "phone" ? !phoneInput : !otpCode)}
              isLoading={busy}
              className="flex-1"
            >
              {step === "phone" ? "Continue" : "Sign Up"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
