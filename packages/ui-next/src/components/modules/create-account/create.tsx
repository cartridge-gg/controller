import { cn } from "@/utils";
import { Field } from "./field";
import { Status, ValidationState } from "./status";

type CreateAccountProps = {
  usernameField: {
    value: string;
    error?: Error;
  };
  validation: ValidationState;
  error?: Error;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onUsernameFocus: () => void;
  onUsernameClear: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export function CreateAccount({
  usernameField,
  validation,
  error,
  isLoading,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onKeyDown,
}: CreateAccountProps) {
  return (
    <div
      className={cn(
        "flex flex-col border rounded-md border-background-300 bg-background-300",
        (validation.status === "invalid" || error) &&
          "bg-destructive-100 border-destructive-100",
      )}
    >
      <Field
        value={usernameField.value}
        validation={validation}
        isLoading={isLoading}
        onUsernameChange={onUsernameChange}
        onUsernameFocus={onUsernameFocus}
        onUsernameClear={onUsernameClear}
        onKeyDown={onKeyDown}
      />
      <Status
        username={usernameField.value}
        validation={validation}
        error={error}
      />
    </div>
  );
}

export default CreateAccount;
