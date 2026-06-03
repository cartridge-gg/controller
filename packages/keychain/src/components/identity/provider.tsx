import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useMeQuery,
  useSendEmailVerificationMutation,
  useSendPhoneVerificationMutation,
  useVerifyEmailMutation,
  useVerifyPhoneMutation,
} from "@cartridge/controller-ui/utils/api/cartridge";
import { useAccountPrivateQuery } from "@/utils/api";
import { VerifyIdentityDrawer } from "./VerifyIdentityDrawer";
import {
  VerifyPhoneNumberDrawer,
  SmsOtpState,
} from "./VerifyPhoneNumberDrawer";
import { InvalidVerificationCodeError } from "./error";
import { VerifyEmailDrawer, EmailOtpState } from "./VerifyEmailDrawer";
import { useConnection } from "@/hooks/connection";
import { useRequireAgeVerification } from "@/utils/age-gate";
import { humanizeString } from "@cartridge/controller";

export type VerificationStepName = "identity" | "phoneNumber" | "email";

export type IdentityContextValue = {
  userData: {
    firstName?: string | null;
    lastName?: string | null;
    dob?: string | null;
    age?: number | null;
    verificationStatus?: string | null;
    proveVerifiedAt?: string | null;
    phoneNumber?: string | null;
    phoneNumberVerifiedAt?: string | null;
    email?: string | null;
  };
  isLoadingUserData: boolean;
  isVerifying: boolean;
  currentVerificationStep: VerificationStepName | null;
  refetchUserData: () => Promise<void>;
  initiateIdentityVerification: (cb?: () => Promise<void>) => void;
  initiatePhoneNumberVerification: (cb?: () => Promise<void>) => void;
  initiateEmailVerification: (cb?: () => Promise<void>) => void;
  isIdentityVerified: boolean;
  isPhoneNumberVerified: boolean;
  isEmailVerified: boolean;
  isCanceled: boolean;
  // Status of the active age gate. if no gate, isAllowed is true
  ageGateStatus: {
    isPending: boolean;
    isBlocked: boolean;
    isAllowed: boolean;
  };
};

export const IdentityContext = createContext<IdentityContextValue>({
  userData: {},
  isLoadingUserData: false,
  isVerifying: false,
  currentVerificationStep: null,
  refetchUserData: async () => {},
  initiateIdentityVerification: () => {},
  initiatePhoneNumberVerification: () => {},
  initiateEmailVerification: () => {},
  isIdentityVerified: false,
  isPhoneNumberVerified: false,
  isEmailVerified: false,
  isCanceled: false,
  ageGateStatus: { isPending: false, isBlocked: false, isAllowed: true },
});

const usePhoneNumberVerification = () => {
  const sendPhoneMutation = useSendPhoneVerificationMutation();
  const verifyPhoneMutation = useVerifyPhoneMutation();
  const [smsState, setSmsState] = useState<SmsOtpState | null>(null);

  const handleInitOtp = useCallback(
    async (phoneNumber: string) => {
      setSmsState({ phoneNumber, otpId: "", otpEncryptionTargetBundle: "" });
      const res = await sendPhoneMutation.mutateAsync({
        input: { phoneNumber },
      });
      if (!res.sendPhoneVerification.success) {
        throw new Error(res.sendPhoneVerification.message);
      }
      setSmsState({
        phoneNumber,
        otpId: "sent",
        otpEncryptionTargetBundle: "",
      });
    },
    [sendPhoneMutation],
  );

  const handleResendOtp = useCallback(async () => {
    if (smsState?.phoneNumber) {
      await handleInitOtp(smsState.phoneNumber);
    }
  }, [handleInitOtp, smsState?.phoneNumber]);

  const handleSubmitCode = useCallback(
    async (code: string) => {
      if (!code || !smsState || !smsState.phoneNumber || !smsState.otpId)
        return undefined;
      const res = await verifyPhoneMutation.mutateAsync({
        input: { phoneNumber: smsState.phoneNumber, code },
      });
      if (!res.verifyPhone.success) {
        const msg = res.verifyPhone.message;
        if (msg === "Invalid or expired verification code") {
          throw new InvalidVerificationCodeError(msg);
        }
        throw new Error(msg);
      }
    },
    [smsState, verifyPhoneMutation],
  );

  return {
    smsState,
    setSmsState,
    handleInitOtp,
    handleResendOtp,
    handleSubmitCode,
  };
};

const useEmailVerification = () => {
  const sendEmailMutation = useSendEmailVerificationMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const [emailState, setEmailState] = useState<EmailOtpState | null>(null);

  const handleInitOtp = useCallback(
    async (email: string) => {
      setEmailState({ email, otpId: "" });
      const res = await sendEmailMutation.mutateAsync({
        input: { email },
      });
      if (!res.sendEmailVerification.success) {
        throw new Error(res.sendEmailVerification.message);
      }
      setEmailState({ email, otpId: "sent" });
    },
    [sendEmailMutation],
  );

  const handleResendOtp = useCallback(async () => {
    if (emailState?.email) {
      await handleInitOtp(emailState.email);
    }
  }, [handleInitOtp, emailState?.email]);

  const handleSubmitCode = useCallback(
    async (code: string) => {
      if (!code || !emailState || !emailState.email || !emailState.otpId)
        return undefined;
      const res = await verifyEmailMutation.mutateAsync({
        input: { email: emailState.email, code },
      });
      if (!res.verifyEmail.success) {
        const msg = res.verifyEmail.message;
        if (msg === "Invalid or expired verification code") {
          throw new InvalidVerificationCodeError(msg);
        }
        throw new Error(msg);
      }
    },
    [emailState, verifyEmailMutation],
  );

  return {
    emailState,
    setEmailState,
    handleInitOtp,
    handleResendOtp,
    handleSubmitCode,
  };
};

export function IdentityProvider({ children }: PropsWithChildren) {
  const { controller } = useConnection();
  const {
    data: meData,
    isLoading: isMeLoading,
    refetch: refetchMe,
  } = useMeQuery();
  const {
    data: privateData,
    isLoading: isPrivateLoading,
    refetch: refetchPrivate,
  } = useAccountPrivateQuery();

  const refetchUserData = useCallback(async (): Promise<void> => {
    await Promise.all([refetchMe(), refetchPrivate()]);
  }, [refetchMe, refetchPrivate]);

  useEffect(() => {
    if (controller?.username()) refetchUserData();
  }, [controller, refetchUserData]);

  const userData = useMemo(
    () =>
      !controller
        ? {}
        : {
            firstName: privateData?.accountPrivate?.firstName,
            lastName: privateData?.accountPrivate?.lastName,
            dob: privateData?.accountPrivate?.dob,
            age: getAgeFromDOB(privateData?.accountPrivate?.dob),
            verificationStatus: privateData?.accountPrivate?.verificationStatus
              ? humanizeString(privateData.accountPrivate.verificationStatus)
              : undefined,
            proveVerifiedAt: privateData?.accountPrivate?.proveVerifiedAt,
            phoneNumber: privateData?.accountPrivate?.phoneNumber,
            phoneNumberVerifiedAt:
              privateData?.accountPrivate?.phoneNumberVerifiedAt,
            email: meData?.me?.email,
          },
    [privateData, meData, controller],
  );

  const isIdentityVerified = useMemo(
    () => !!userData.proveVerifiedAt,
    [userData.proveVerifiedAt],
  );
  const isPhoneNumberVerified = useMemo(
    () => !!userData.proveVerifiedAt || !!userData.phoneNumberVerifiedAt,
    [userData.proveVerifiedAt, userData.phoneNumberVerifiedAt],
  );
  const isEmailVerified = useMemo(() => !!userData.email, [userData.email]);

  const { requiresAgeVerification, minimumAge } = useRequireAgeVerification();
  const ageGateStatus = useMemo(() => {
    let passed: boolean | undefined;
    if (requiresAgeVerification === false) {
      // No age gate configured.
      passed = true;
    } else if (!isIdentityVerified) {
      // Age gate applies but the user has not verified yet.
      passed = undefined;
    } else {
      // Identity is verified: compare the user's actual age (derived from their
      // verified date of birth) against the preset's minimum age requirement.
      passed = (userData.age ?? 0) >= minimumAge;
    }
    return {
      isPending: passed === undefined,
      isBlocked: passed === false,
      isAllowed: passed === true,
    };
  }, [requiresAgeVerification, minimumAge, isIdentityVerified, userData.age]);

  const [currentVerificationStep, setCurrentVerificationStep] =
    useState<VerificationStepName | null>(null);

  // handle user canceling
  const [isCanceled, setIsCanceled] = useState(false);
  const closeCurrentDrawer = useCallback(() => {
    setCurrentVerificationStep(null);
    setIsCanceled(true);
  }, []);
  useEffect(() => {
    if (isCanceled) {
      setIsCanceled(false);
    }
  }, [isCanceled, setIsCanceled]);

  // identity/age verification (prove.com)
  const [identityVerifiedCallback, setIdentityVerifiedCallback] = useState<
    (() => Promise<void>) | undefined
  >(undefined);
  const initiateIdentityVerification = useCallback(
    (cb?: () => Promise<void>) => {
      setIdentityVerifiedCallback(() => cb);
      setCurrentVerificationStep("identity");
    },
    [],
  );

  // phone number verifiction (Twilio)
  const {
    smsState,
    setSmsState,
    handleInitOtp,
    handleResendOtp,
    handleSubmitCode,
  } = usePhoneNumberVerification();

  const [phoneVerifiedCallback, setPhoneVerifiedCallback] = useState<
    (() => Promise<void>) | undefined
  >(undefined);

  const initiatePhoneNumberVerification = useCallback(
    (cb?: () => Promise<void>) => {
      setPhoneVerifiedCallback(() => cb);
      setCurrentVerificationStep("phoneNumber");
      setSmsState(null);
    },
    [setSmsState],
  );

  // email verification (Twilio)
  const {
    emailState,
    setEmailState,
    handleInitOtp: handleInitEmailOtp,
    handleResendOtp: handleResendEmailOtp,
    handleSubmitCode: handleSubmitEmailCode,
  } = useEmailVerification();

  const [emailVerifiedCallback, setEmailVerifiedCallback] = useState<
    (() => Promise<void>) | undefined
  >(undefined);

  const initiateEmailVerification = useCallback(
    (cb?: () => Promise<void>) => {
      setEmailVerifiedCallback(() => cb);
      setCurrentVerificationStep("email");
      setEmailState(null);
    },
    [setEmailState],
  );

  return (
    <IdentityContext.Provider
      value={{
        userData,
        isLoadingUserData: isMeLoading || isPrivateLoading,
        isVerifying: !!currentVerificationStep,
        isCanceled,
        currentVerificationStep,
        refetchUserData,
        initiateIdentityVerification,
        initiatePhoneNumberVerification,
        initiateEmailVerification,
        isIdentityVerified,
        isPhoneNumberVerified,
        isEmailVerified,
        ageGateStatus,
      }}
    >
      {children}

      <VerifyIdentityDrawer
        isOpen={currentVerificationStep === "identity"}
        onClose={closeCurrentDrawer}
        onVerified={async () => {
          await refetchUserData();
          await identityVerifiedCallback?.();
          setCurrentVerificationStep(null);
        }}
      />

      <VerifyEmailDrawer
        isOpen={currentVerificationStep === "email"}
        onClose={closeCurrentDrawer}
        onInitOtp={handleInitEmailOtp}
        onResendOtp={handleResendEmailOtp}
        onSubmitCode={async (otpCode) => {
          await handleSubmitEmailCode(otpCode);
          await refetchUserData();
          await emailVerifiedCallback?.();
          setCurrentVerificationStep(null);
        }}
        emailState={emailState}
      />

      <VerifyPhoneNumberDrawer
        isOpen={currentVerificationStep === "phoneNumber"}
        purpose="identity"
        allowedCountries={["US"]}
        onClose={closeCurrentDrawer}
        onInitOtp={handleInitOtp}
        onResendOtp={handleResendOtp}
        onSubmitCode={async (otpCode) => {
          await handleSubmitCode(otpCode);
          await refetchUserData();
          await phoneVerifiedCallback?.();
          setCurrentVerificationStep(null);
        }}
        smsState={smsState}
      />
    </IdentityContext.Provider>
  );
}

export const useIdentityContext = () => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error(
      "useIdentityContext must be used within an IdentityProvider",
    );
  }
  return context;
};

function getAgeFromDOB(dob: string | null | undefined): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  return years;
}
