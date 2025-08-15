import { Button, Input } from "@cartridge/ui";
import { useState } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";

export interface PasswordFormProps {
  isLogin: boolean;
  isLoading: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export function PasswordForm({
  isLogin,
  isLoading,
  onSubmit,
  onCancel,
}: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">
          {isLogin ? "Login" : "Create Account"} with Password
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
            setPasswordError(null);
          }}
          placeholder="Enter password (min. 8 characters)"
          autoComplete={isLogin ? "current-password" : "new-password"}
          disabled={isLoading}
        />
      </div>

      {!isLogin && (
        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value);
              setPasswordError(null);
            }}
            placeholder="Confirm your password"
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>
      )}

      {passwordError && (
        <p className="text-sm text-destructive">{passwordError}</p>
      )}

      {!isLogin && (
        <ErrorAlert
          title="Password accounts are not recoverable"
          description="Password cannot be recovered if you forget your password. We recommend using a different authentication method."
          variant="warning"
          isExpanded
        />
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
          id="primary-button"
          isLoading={isLoading}
        >
          {isLogin ? "Login" : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
