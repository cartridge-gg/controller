import { Input } from "@/index";
import { ValidationState } from "./status";

interface FieldProps {
  value: string;
  validation: ValidationState;
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onUsernameFocus: () => void;
  onUsernameClear: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function Field({
  value,
  validation,
  isLoading,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onKeyDown,
}: FieldProps) {
  return (
    <Input
      value={value}
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
  );
}
