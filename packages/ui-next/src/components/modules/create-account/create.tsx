import { cn } from "@/utils";
import { Status, ValidationState } from "./status";
import { Input } from "@/index";

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
      <Input
        variant="username"
        size="lg"
        value={usernameField.value}
        autoFocus
        spellCheck={false}
        placeholder="Username"
        className="relative z-1"
        onFocus={onUsernameFocus}
        onChange={(e) => {
          onUsernameChange(e.target.value.toLowerCase());
        }}
        onKeyDown={onKeyDown}
        isLoading={validation.status === "validating"}
        disabled={isLoading}
        onClear={onUsernameClear}
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
