import {
  Button,
  Drawer,
  DrawerContent,
  Input,
  KeyIcon,
} from "@cartridge/controller-ui";
import { useState } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { AuthOption } from "@cartridge/controller";

export interface PasswordFormProps {
  isOpen: boolean;
  isLoading: boolean;
  isLogin: boolean;
  onClose: () => void;
  onSubmit: (authenticationMode?: AuthOption, password?: string) => void;
  onPasswordSwitch: (enablePasswordInput: boolean) => void;
}

export function PasswordForm({
  isOpen = true,
  isLoading,
  isLogin,
  onClose,
  onSubmit,
  onPasswordSwitch,
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

    onSubmit("password", password);
  };

  const handleClose = () => {
    if (!isOpen) return; // avoid closing if another drawer is opening
    onClose?.();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent
        title={`${isLogin ? "Login" : "Create Account"} with Password`}
        icon={<KeyIcon variant="solid" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            {!isLogin && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onPasswordSwitch(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
            )}
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
      </DrawerContent>
    </Drawer>
  );
}
