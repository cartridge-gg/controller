import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/context/toast";
import {
  useMeQuery,
  useSendEmailVerificationMutation,
  useVerifyEmailMutation,
  useSendPhoneVerificationMutation,
  useVerifyPhoneMutation,
} from "@cartridge/controller-ui/utils/api/cartridge";
import { useAccountPrivateQuery } from "@/utils/api";
import {
  Button,
  Input,
  CheckIcon,
  Thumbnail,
  SpinnerIcon,
  EnvelopeIcon,
  MobileIcon,
  LayoutContent,
  LayoutFooter,
  Card,
  CardContent,
  HeaderInner,
  PhoneNumberInput,
  isValidPhoneNumber,
} from "@cartridge/controller-ui";
import { useNavigation } from "@/context";
import { useLocation } from "react-router-dom";
import { ErrorAlert } from "@/components/ErrorAlert";

type Step =
  | "EMAIL_INPUT"
  | "EMAIL_CODE"
  | "PHONE_INPUT"
  | "PHONE_CODE"
  | "SUCCESS";

interface VerificationStepViewProps {
  title: string;
  icon: React.ReactElement;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onContinue: () => void;
  isLoading: boolean;
  type: string;
  error: string | null;
  autoComplete?: string;
  name?: string;
  /** ISO country codes (e.g. ["US"]). When set, renders PhoneNumberInput
   * restricted to these countries instead of a plain Input. */
  allowedCountries?: string[];
}

const VerificationStepView = ({
  title,
  icon,
  label,
  value,
  placeholder,
  onChange,
  onContinue,
  isLoading,
  type,
  error,
  autoComplete,
  name,
  allowedCountries,
}: VerificationStepViewProps) => (
  <>
    <HeaderInner title={title} icon={icon} variant="compressed" />
    <LayoutContent className="p-4 gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-foreground-300 font-medium">
          {label}
        </label>
        {allowedCountries ? (
          <PhoneNumberInput
            value={value}
            setValue={onChange}
            allowedCountries={allowedCountries}
            disabled={isLoading}
          />
        ) : (
          <Input
            name={name}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && value && onContinue()
            }
            type={type}
          />
        )}
      </div>
    </LayoutContent>
    <LayoutFooter>
      {error && (
        <ErrorAlert title="Error" description={error} isExpanded={true} />
      )}
      <Button
        variant="primary"
        className="w-full"
        onClick={onContinue}
        isLoading={isLoading}
        disabled={allowedCountries ? !isValidPhoneNumber(value) : !value}
      >
        CONTINUE
      </Button>
    </LayoutFooter>
  </>
);

interface CodeStepViewProps {
  title: string;
  icon: React.ReactElement;
  target: string;
  onVerify: () => void;
  onResend: (type: "email" | "phone") => void;
  isLoading: boolean;
  resendType: "email" | "phone";
  code: string;
  setCode: (val: string) => void;
  error: string | null;
}

const CodeStepView = ({
  title,
  icon,
  target,
  onVerify,
  onResend,
  isLoading,
  resendType,
  code,
  setCode,
  error,
}: CodeStepViewProps) => (
  <>
    <HeaderInner title={title} icon={icon} variant="compressed" />
    <LayoutContent className="p-4 gap-12">
      <p className="text-xs text-foreground-300">
        Please check {target} for a message and enter your code below.
      </p>
      <PinInput
        value={code}
        onChange={setCode}
        onEnter={onVerify}
        disabled={isLoading}
      />
      <p className="text-xs text-foreground-300">
        Didn't get a message?{" "}
        <button
          className="text-primary-100 hover:underline"
          onClick={() => onResend(resendType)}
          disabled={isLoading}
        >
          Resend Code
        </button>
      </p>
    </LayoutContent>
    <LayoutFooter>
      {error && (
        <ErrorAlert title="Error" description={error} isExpanded={true} />
      )}
      <Button
        variant="primary"
        className="w-full"
        onClick={onVerify}
        isLoading={isLoading}
        disabled={code.length < 6}
      >
        CONTINUE
      </Button>
    </LayoutFooter>
  </>
);

interface VerificationProps {
  /** Overrides the `method` URL search param. Host this in a drawer by
   * passing the method directly instead of relying on navigation. */
  method?: string | null;
  /** Called when verification completes. When provided, suppresses the
   * default navigation to /purchase/checkout/{method}. */
  onSuccess?: () => void;
}

export function Verification({
  method: methodProp,
  onSuccess,
}: VerificationProps = {}) {
  const { navigate } = useNavigation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const method = methodProp ?? searchParams.get("method");
  const { toast } = useToast();

  const {
    data: meData,
    isLoading: isMeLoading,
    refetch: refetchMe,
  } = useMeQuery();
  const {
    data: accountPrivateData,
    isLoading: isAccountPrivateLoading,
    refetch: refetchAccountPrivate,
  } = useAccountPrivateQuery();

  const [step, setStep] = useState<Step | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isTransientSuccess, setIsTransientSuccess] = useState(false);

  const sendEmailMutation = useSendEmailVerificationMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const sendPhoneMutation = useSendPhoneVerificationMutation();
  const verifyPhoneMutation = useVerifyPhoneMutation();

  const emailOnly = method === "coinflow";

  useEffect(() => {
    if (meData?.me && accountPrivateData && step === null) {
      const accountPrivate = accountPrivateData.accountPrivate;

      if (!meData.me.email) {
        setStep("EMAIL_INPUT");
      } else if (
        !emailOnly &&
        (!accountPrivate?.phoneNumber || !accountPrivate?.phoneNumberVerifiedAt)
      ) {
        setStep("PHONE_INPUT");
        setPhone(accountPrivate?.phoneNumber || "");
      } else {
        setStep("SUCCESS");
      }
    }
  }, [meData, accountPrivateData, step, emailOnly]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    const hasEmail = !!meData?.me?.email;
    const hasVerifiedPhone =
      !!accountPrivateData?.accountPrivate?.phoneNumber &&
      !!accountPrivateData?.accountPrivate?.phoneNumberVerifiedAt;
    const isVerified = emailOnly ? hasEmail : hasEmail && hasVerifiedPhone;

    if (step === "SUCCESS" && method && isVerified && !isTransientSuccess) {
      const timer = setTimeout(() => {
        if (onSuccess) {
          onSuccess();
          return;
        }
        if (method === "apple-pay") {
          navigate("/purchase/checkout/coinbase");
        } else if (method === "coinflow") {
          navigate("/purchase/checkout/coinflow");
        } else {
          navigate(
            `/purchase/checkout/onchain${method ? `?method=${method}` : ""}`,
          );
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    step,
    method,
    navigate,
    meData,
    accountPrivateData,
    isTransientSuccess,
    emailOnly,
    onSuccess,
  ]);

  const handleSendEmail = async () => {
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await sendEmailMutation.mutateAsync({ input: { email } });
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

  const handleVerifyEmail = async () => {
    if (code.length < 6) return;
    setError(null);
    try {
      const res = await verifyEmailMutation.mutateAsync({
        input: { email, code },
      });
      if (res.verifyEmail.success) {
        setIsTransientSuccess(true);
        setStep("SUCCESS");
        setTimeout(async () => {
          const [, { data: updatedAccountPrivate }] = await Promise.all([
            refetchMe(),
            refetchAccountPrivate(),
          ]);

          if (
            !emailOnly &&
            (!updatedAccountPrivate?.accountPrivate?.phoneNumber ||
              !updatedAccountPrivate?.accountPrivate?.phoneNumberVerifiedAt)
          ) {
            setStep("PHONE_INPUT");
            setPhone(updatedAccountPrivate?.accountPrivate?.phoneNumber || "");
          }

          setIsTransientSuccess(false);
        }, 1500);
      } else {
        setError(res.verifyEmail.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid code");
    }
  };

  const handleSendPhone = async () => {
    setError(null);
    if (!isValidPhoneNumber(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!phone.startsWith("+1")) {
      toast.error("Only US phone numbers are supported.");
      return;
    }

    try {
      const res = await sendPhoneMutation.mutateAsync({
        input: { phoneNumber: phone },
      });
      if (res.sendPhoneVerification.success) {
        setStep("PHONE_CODE");
        setCode("");
        setResendCooldown(30);
      } else {
        setError(res.sendPhoneVerification.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send SMS");
    }
  };

  const handleVerifyPhone = async () => {
    if (code.length < 6) return;
    setError(null);
    try {
      const res = await verifyPhoneMutation.mutateAsync({
        input: { phoneNumber: phone, code },
      });
      if (res.verifyPhone.success) {
        await Promise.all([refetchMe(), refetchAccountPrivate()]);
        setStep("SUCCESS");
      } else {
        setError(res.verifyPhone.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid code");
    }
  };

  const handleResend = async (type: "email" | "phone") => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending.`);
      return;
    }
    if (type === "email") {
      await handleSendEmail();
    } else {
      await handleSendPhone();
    }
  };

  if ((isMeLoading || isAccountPrivateLoading) && step === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <SpinnerIcon className="animate-spin" />
      </div>
    );
  }

  switch (step) {
    case "EMAIL_INPUT":
      return (
        <VerificationStepView
          title="Email Verification"
          icon={<EnvelopeIcon />}
          label="Email"
          value={email}
          placeholder="shinobi@email.com"
          onChange={(val) => {
            setEmail(val);
            setError(null);
          }}
          onContinue={handleSendEmail}
          isLoading={sendEmailMutation.isLoading}
          type="email"
          autoComplete="email"
          name="email"
          error={error}
        />
      );
    case "EMAIL_CODE":
      return (
        <CodeStepView
          title="Enter Confirmation Code"
          icon={<EnvelopeIcon />}
          target={email}
          onVerify={handleVerifyEmail}
          onResend={handleResend}
          isLoading={verifyEmailMutation.isLoading}
          resendType="email"
          code={code}
          setCode={setCode}
          error={error}
        />
      );
    case "PHONE_INPUT":
      return (
        <VerificationStepView
          title="Phone Verification"
          icon={<MobileIcon variant="solid" />}
          label="Phone Number"
          value={phone}
          onChange={(val) => {
            setPhone(val);
            setError(null);
          }}
          onContinue={handleSendPhone}
          isLoading={sendPhoneMutation.isLoading}
          type="tel"
          autoComplete="tel-national"
          name="phone"
          error={error}
          allowedCountries={["US"]}
        />
      );
    case "PHONE_CODE":
      return (
        <CodeStepView
          title="Enter Confirmation Code"
          icon={<MobileIcon variant="solid" />}
          target={phone}
          onVerify={handleVerifyPhone}
          onResend={handleResend}
          isLoading={verifyPhoneMutation.isLoading}
          resendType="phone"
          code={code}
          setCode={setCode}
          error={error}
        />
      );
    case "SUCCESS":
      return (
        <>
          <HeaderInner
            title="Success!"
            icon={<CheckIcon />}
            variant="compressed"
          />
          <LayoutContent className="p-4 flex flex-col items-center justify-center">
            <Card className="w-full max-w-sm bg-background-200 border-background-300">
              <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
                <Thumbnail
                  icon={
                    email && (step === "SUCCESS" || isTransientSuccess) ? (
                      <EnvelopeIcon />
                    ) : (
                      <MobileIcon variant="solid" />
                    )
                  }
                  size="lg"
                  className="bg-background-300"
                  rounded
                />
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">Success!</h2>
                  <p className="text-sm text-foreground-300">
                    {email || accountPrivateData?.accountPrivate?.phoneNumber}{" "}
                    Connected
                  </p>
                </div>
              </CardContent>
            </Card>
          </LayoutContent>
          <LayoutFooter />
        </>
      );
    default:
      return null;
  }
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
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, length);
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
