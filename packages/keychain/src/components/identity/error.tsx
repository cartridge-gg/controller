import { useMemo } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";

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
  const { title, description } = useMemo(
    () => ({
      title: error.split("desc = ").at(-1) as string,
      description: error.includes("desc = ") ? error : undefined,
    }),
    [error],
  );
  return <ErrorAlert title={title} description={description} />;
};
