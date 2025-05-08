import { ExternalIcon } from "@/index";
import { cn } from "@/utils";
import { useMemo } from "react";

export type ValidationState = {
  status: "idle" | "validating" | "valid" | "invalid";
  error?: Error;
  exists?: boolean;
};

interface StatusProps {
  username: string;
  validation: ValidationState;
  error?: Error;
}

export function Status({ username, validation, error }: StatusProps) {
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

  const message = useMemo(() => {
    return isError
      ? errorMessage
      : !username
        ? "Enter a Username"
        : validation.status === "validating"
          ? "Checking username..."
          : validation.status === "valid"
            ? validation.exists
              ? "Welcome! Select Log In to play"
              : "Welcome! Let's create a new Controller"
            : validation.error?.message || "Enter a Username";
  }, [validation, errorMessage, username, isError]);

  return (
    <div className="flex flex-col bg-translucent-dark-100 gap-y-px">
      <Block error={!!isError}>{message}</Block>

      {isTimeoutError && <HelpBlock />}
    </div>
  );
}

function Block({
  children,
  error,
  className,
}: {
  children: React.ReactNode;
  error?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-between items-center text-xs px-3 py-2",
        error
          ? "bg-destructive-100 text-destructive-foreground"
          : "bg-background-300 text-foreground-300",
        className,
      )}
    >
      {children}
    </div>
  );
}

function HelpBlock() {
  return (
    <Block error>
      <div>Having trouble signing up?</div>
      <a
        href="https://docs.cartridge.gg/controller/passkey-support"
        target="_blank"
        className="flex items-center gap-1 hover:underline"
      >
        <div>Controller Docs</div>
        <ExternalIcon size="xs" />
      </a>
    </Block>
  );
}
