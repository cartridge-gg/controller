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

export interface SmsOtpDrawerProps {
  isOpen: boolean;
  isLogin: boolean;
  allowSwitchPhoneNumber?: boolean;
  onClose: () => void;
  // Sends the SMS. On success the hook sets smsState
  onInitOtp: (phoneNumber: string) => Promise<void>;
  onResendOtp: () => void;
  // Called to complete authentication.
  onSubmitCode: (otpCode: string) => void;
  // null = phone step; non-null = otp step (phone number confirmed).
  smsState: SmsOtpState | null;
  // When provided and isLogin, renders a "Use a different phone" link in the OTP step
  onResetOtp?: () => void;
}

const RESEND_WAIT_SECONDS = 30;

export function SmsOtpDrawer({
  isOpen,
  isLogin,
  allowSwitchPhoneNumber = true,
  onClose,
  onInitOtp,
  onResendOtp,
  onResetOtp,
  onSubmitCode,
  smsState,
}: SmsOtpDrawerProps) {
  const step = smsState?.otpId ? "otp" : "phone";
  const isResolvingPhoneNumber = !!smsState?.phoneNumber.endsWith("*");

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

  const resetState = useCallback(() => {
    setPhoneInput("");
    setOtpCode("");
    setOtpCodeError(undefined);
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
        onSubmitCode(otpCode);
      }
    },
    [
      step,
      phoneInput,
      isPhoneInputValid,
      otpCode,
      isOtpCodeValid,
      onInitOtp,
      onSubmitCode,
    ],
  );

  const handleUseDifferentPhone = useCallback(() => {
    resetState();
    onResetOtp?.();
  }, [onResetOtp, resetState]);

  const handleResend = useCallback(async () => {
    if (secondsRemaining > 0 || sendingCode || !smsState) return;
    setOtpCodeError(undefined);
    setSendingCode(true);
    try {
      await onResendOtp();
    } catch (err) {
      setOtpCodeError((err as Error).message ?? "Failed to resend code");
    } finally {
      setSendingCode(false);
    }
  }, [secondsRemaining, sendingCode, smsState, onResendOtp]);

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
          {step === "phone" ? (
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
                disabled={sendingCode || isResolvingPhoneNumber}
                error={phoneInputError}
                placeholder={
                  isResolvingPhoneNumber ? smsState?.phoneNumber : undefined
                }
                userCountryCode={geoLocation?.countryCode}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label htmlFor="sms-otp" className="text-xs text-foreground-300">
                Please check {formatPhoneNumber(smsState?.phoneNumber ?? "")}{" "}
                for a message from Cartridge and enter your code below.{" "}
                {isLogin && allowSwitchPhoneNumber && onResetOtp && (
                  <button
                    type="button"
                    onClick={handleUseDifferentPhone}
                    disabled={sendingCode}
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
                disabled={sendingCode}
                variant={otpCodeError ? "destructive" : "default"}
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
                      disabled={sendingCode}
                      className="text-primary-100 hover:underline disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  )}
                </p>
              )}
              {otpCodeError && (
                <p className="text-sm text-destructive">{otpCodeError}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={
                sendingCode ||
                (step === "phone" ? !isPhoneInputValid : !isOtpCodeValid)
              }
              isLoading={sendingCode || isResolvingPhoneNumber}
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
