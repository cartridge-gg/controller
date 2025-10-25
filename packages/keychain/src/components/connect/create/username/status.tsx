import { ExternalIcon, cn } from "@cartridge/ui";
import { HTMLAttributes, useMemo } from "react";

export type ValidationState = {
  status: "idle" | "validating" | "valid" | "invalid";
  error?: Error;
  exists?: boolean;
};

interface StatusProps {
  username: string;
  validation: ValidationState;
  error?: Error;
  containerClassName?: HTMLAttributes<HTMLDivElement>["className"];
  className?: HTMLAttributes<HTMLDivElement>["className"];
}

export function Status({
  username,
  validation,
  error,
  containerClassName,
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
    <div
      className={cn(
        "flex flex-col bg-translucent-dark-100 gap-y-px",
        containerClassName,
      )}
    >
      <Block className={className} error={!!isError} validation={validation}>
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
  validation,
}: {
  children: React.ReactNode;
  error?: boolean;
  className?: string;
  validation?: ValidationState;
}) {
  return (
    <div
      className={cn(
        "flex justify-between items-center text-xs px-3 py-2 w-full box-border min-w-0",
        error
          ? "bg-destructive-100 text-destructive-foreground"
          : validation?.status === "valid"
            ? "bg-background-150 text-primary-100"
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
