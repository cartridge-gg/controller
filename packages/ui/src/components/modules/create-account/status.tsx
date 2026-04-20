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
  className?: string;
}

export function Status({
  username,
  validation,
  error,
  className,
}: StatusProps) {
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
      <Block className={className} error={!!isError}>
        {message}
      </Block>

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
        "flex justify-between items-center text-xs px-3 py-2 w-full box-border min-w-0",
        error
          ? "bg-destructive-100 text-destructive-foreground"
          : "bg-background-300 text-primary-100",
        className,
      )}
    >
      <span className="break-words min-w-0 flex-1">{children}</span>
    </div>
  );
}

function HelpBlock() {
  return (
    <Block error>
      <div className="flex items-center justify-between w-full gap-2">
        <span className="min-w-0 flex-shrink">Having trouble signing up?</span>
        <a
          href="https://docs.cartridge.gg/controller/passkey-support"
          target="_blank"
          className="flex items-center gap-1 hover:underline flex-shrink-0"
        >
          <span>Controller Docs</span>
          <ExternalIcon size="xs" />
        </a>
      </div>
    </Block>
  );
}
