import { useCallback, useEffect, useMemo } from "react";
import {
  Button,
  EnvelopeIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  MobileIcon,
  SocialCard,
  UserIcon,
} from "@cartridge/controller-ui";
import { useNavigation } from "@/context";
import { useLocation } from "react-router-dom";
import { useIdentityContext } from "@/components/identity/provider";

type VerificationMethod = "coinflow" | "apple-pay" | "identity";

interface VerificationProps {
  /** Overrides the `method` URL search param. Host this in a drawer by
   * passing the method directly instead of relying on navigation. */
  method?: VerificationMethod | null;
  /** Called when verification completes. When provided, suppresses the
   * default navigation to /purchase/checkout/{method}. */
  onSuccess?: () => void;
  // headless mode do not display as a page, only trigger drawers
  // call onClose when done
  headless?: boolean;
  onClose?: () => void;
}

export function Verification({
  method: methodProp,
  onSuccess,
  headless,
  onClose,
}: VerificationProps = {}) {
  const { navigate } = useNavigation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const method =
    methodProp ?? (searchParams.get("method") as VerificationMethod);

  const {
    isLoadingUserData,
    isVerifying,
    isEmailVerified,
    isPhoneNumberVerified,
    isIdentityVerified,
    initiateEmailVerification,
    initiatePhoneNumberVerification,
    initiateIdentityVerification,
    isCanceled,
  } = useIdentityContext();

  const steps = useMemo(
    () => [
      {
        key: "email" as const,
        text: "Email Address",
        icon: <EnvelopeIcon />,
        onClick: initiateEmailVerification,
        required: !method || method === "apple-pay" || method === "coinflow",
        completed: isEmailVerified,
      },
      {
        key: "phone" as const,
        text: "Phone Number",
        icon: <MobileIcon variant="solid" />,
        onClick: initiatePhoneNumberVerification,
        required: !method || method === "apple-pay" || method === "identity",
        completed: isPhoneNumberVerified,
      },
      {
        key: "identity" as const,
        text: "Identity",
        icon: <UserIcon variant="solid" />,
        onClick: initiateIdentityVerification,
        required: !method || method === "apple-pay" || method === "identity",
        completed: isIdentityVerified,
      },
    ],
    [
      method,
      isEmailVerified,
      isPhoneNumberVerified,
      isIdentityVerified,
      initiateEmailVerification,
      initiatePhoneNumberVerification,
      initiateIdentityVerification,
    ],
  );

  // set current verification step
  const { currentStep, allVerified } = useMemo(() => {
    const index = steps.findIndex((s) => s.required && !s.completed);
    const stepIndex = index === -1 ? steps.length : index;
    return {
      currentStep: steps[stepIndex],
      allVerified: !!method && stepIndex >= steps.length,
    };
  }, [steps, method]);

  const startCurrentStep = useCallback(() => {
    currentStep?.onClick();
  }, [currentStep]);

  // auto open steps
  const autoOpen = !!method && headless !== false;
  useEffect(() => {
    if (!isLoadingUserData && currentStep?.key && autoOpen) {
      startCurrentStep();
    }
  }, [isLoadingUserData, currentStep?.key, startCurrentStep, autoOpen]);

  // close headless on cancel
  useEffect(() => {
    if (headless && isCanceled) {
      onClose?.();
    }
  }, [headless, isCanceled, onClose]);

  // Hand off to the caller once every required step is complete.
  useEffect(() => {
    if (isLoadingUserData || !allVerified) return;
    if (onSuccess) {
      onSuccess();
      onClose?.();
      return;
    }
    if (method) {
      if (method === "apple-pay") {
        navigate("/purchase/checkout/coinbase", { replace: true });
      } else if (method === "coinflow") {
        navigate("/purchase/checkout/coinflow", { replace: true });
      } else {
        navigate(`/purchase/checkout/onchain?method=${method}`, {
          replace: true,
        });
      }
    }
  }, [isLoadingUserData, allVerified, method, onSuccess, onClose, navigate]);

  if (headless !== undefined) {
    return <></>;
  }

  return (
    <>
      <HeaderInner
        title="User Verification"
        icon={<UserIcon variant="solid" />}
        variant="compressed"
      />
      <LayoutContent className="p-4 gap-4">
        <p className="text-sm text-foreground-300">
          Complete these steps to verify your identity.
        </p>
        <div className="flex flex-col gap-[1px]">
          {steps
            .sort((a, b) => (a.completed ? -1 : b.completed ? 1 : 0))
            .map((step) => (
              <SocialCard
                key={step.key}
                text={step.text}
                icon={step.icon}
                isCompleted={step.completed}
                onClick={step.completed ? undefined : step.onClick}
              />
            ))}
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button
          variant="primary"
          className="w-full"
          onClick={startCurrentStep}
          isLoading={isLoadingUserData || isVerifying}
        >
          START VERIFICATION
        </Button>
      </LayoutFooter>
    </>
  );
}
