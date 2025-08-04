import { LayoutContainer, LayoutHeader, MobileIcon } from "@cartridge/ui";
import { useCallback, useState } from "react";
import { OtpCodeInput } from "./otp-code-input";
import { PhoneNumberInput } from "./phone-number-input";

export type DisplayType = "signup" | "login" | "add-signer";

export const SmsAuthentication = ({
  displayType,
  setOtpDisplayType,
}: {
  displayType: DisplayType;
  setOtpDisplayType: (otpDisplayType: DisplayType | null) => void;
}) => {
  const [step, setStep] = useState<"phone-number" | "otp-code">("phone-number");
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);

  const onPhoneNumberSubmit = useCallback((phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
    setStep("otp-code");
    window.dispatchEvent(
      new CustomEvent("sms-signer-phone-number", {
        detail: {
          phoneNumber: phoneNumber,
        },
      }),
    );
  }, []);

  const onFinalize = useCallback((otpCode: string) => {
    window.dispatchEvent(
      new CustomEvent("sms-signer-otp-code", {
        detail: {
          otpCode: otpCode,
        },
      }),
    );
  }, []);

  return (
    <LayoutContainer>
      <LayoutHeader
        icon={<MobileIcon variant="solid" size="lg" />}
        variant="compressed"
        title={
          displayType === "signup"
            ? "Signup with SMS"
            : displayType === "login"
              ? "Login with SMS"
              : "Add SMS Signer"
        }
        onBack={() => {
          setOtpDisplayType(null);
        }}
        hideSettings
      />
      {step === "phone-number" && (
        <PhoneNumberInput
          onSubmit={onPhoneNumberSubmit}
          onCancel={() => {
            setOtpDisplayType(null);
          }}
          phoneNumber={phoneNumber!}
          setPhoneNumber={setPhoneNumber}
        />
      )}
      {step === "otp-code" && (
        <OtpCodeInput
          phoneNumber={phoneNumber!}
          onBack={() => setStep("phone-number")}
          onFinalize={onFinalize}
        />
      )}
    </LayoutContainer>
  );
};
