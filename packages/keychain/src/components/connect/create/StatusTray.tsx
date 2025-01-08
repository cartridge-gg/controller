import { ValidationState } from "./useUsernameValidation";
import { cn, ExternalIcon } from "@cartridge/ui-next";
import { useMemo } from "react";
import { Link } from "react-router-dom";

interface StatusTrayProps {
  username: string;
  validation: ValidationState;
  error?: Error;
}

export function StatusTray({ username, validation, error }: StatusTrayProps) {
  const isError = validation.status === "invalid" || error;
  const isTimeoutError = error?.message?.includes(
    "The operation either timed out or was not allowed",
  );
  const errorMessage = useMemo(() => {
    if (validation.error) {
      return validation.error.message;
    }

    if (isTimeoutError) {
      return "Passkey signing timed out or was canceled. Please try again.";
    }

    return error?.message;
  }, [validation, error, isTimeoutError]);

  return (
    <div
      className={cn(
        "flex flex-col top-[-2px] rounded-b relative z-0 gap-px  overflow-hidden",
        isError ? "bg-[#E46958]" : "bg-quaternary",
      )}
    >
      <div
        className={cn(
          "text-xs px-4 py-2",
          isError
            ? "text-[#2A2F2A]  border-b border-[#161A17] border-opacity-10"
            : "text-quaternary-foreground",
        )}
      >
        {isError
          ? errorMessage
          : !username
          ? "Enter a username"
          : validation.status === "validating"
          ? "Checking username..."
          : validation.status === "valid"
          ? validation.exists
            ? "Welcome back! Select Login to play"
            : "Welcome! Let's create a new controller!"
          : validation.error?.message || "Enter a username"}
      </div>
      {isTimeoutError && (
        <div className="w-full flex items-center justify-between text-xs font-semibold px-4 py-2 text-secondary">
          <div>Having trouble signing up?</div>
          <Link
            className="flex items-center gap-1.5 hover:underline"
            to="https://docs.cartridge.gg/controller/passkey-support"
            target="_blank"
          >
            <div>Controller Docs</div>
            <ExternalIcon size="sm" />
          </Link>
        </div>
      )}
    </div>
  );
}
