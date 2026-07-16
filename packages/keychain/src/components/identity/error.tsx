import { useMemo } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useAdvancedView } from "@/hooks/features";

// Thrown when the backend rejects an OTP code as invalid or expired. The
// drawer treats this as recoverable (let the user re-enter the code); any
// other error is treated as fatal and replaces the submit button with Close.
export class InvalidVerificationCodeError extends Error {
  constructor(message = "Invalid or expired verification code") {
    super(message);
    this.name = "InvalidVerificationCodeError";
  }
}

export const VerifyErrorAlert = ({ error }: { error: string }) => {
  const advancedView = useAdvancedView();
  const { title, description } = useMemo(() => {
    if (advancedView) {
      return {
        title: error.split("desc = ").at(-1) as string,
        description: error.includes("desc = ") ? error : undefined,
      };
    }

    if (error.toLowerCase().includes("invalid or expired verification")) {
      return { title: "Invalid or expired verification code" };
    }
    if (error.startsWith("Identity verification service")) {
      return {
        title: "Verification service unavailable",
        description: error,
      };
    }
    if (error.startsWith("We couldn't verify these details")) {
      return {
        title: "Details could not be verified",
        description: error,
      };
    }
    return {
      title: "Verification failed",
      description: "Please try again.",
    };
  }, [advancedView, error]);
  return <ErrorAlert title={title} description={description} />;
};
