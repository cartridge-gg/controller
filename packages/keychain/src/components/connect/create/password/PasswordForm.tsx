import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  Input,
  KeyIcon,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { AuthOption } from "@cartridge/controller";

export interface PasswordFormDrawerProps {
  isOpen: boolean;
  isLoading: boolean;
  isLogin: boolean;
  onClose: () => void;
  onSubmit: (authenticationMode?: AuthOption, password?: string) => void;
}

export function PasswordFormDrawer({
  isOpen = true,
  isLoading,
  isLogin,
  onClose,
  onSubmit,
}: PasswordFormDrawerProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
      setPasswordError(null);
    }
  }, [isOpen]);

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

  const handleClose = (event?: Event) => {
    if (!isOpen) return; // avoid closing if another drawer is opening
    event?.preventDefault();
    onClose?.();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent
        title={`${isLogin ? "Log In" : "Sign Up"} with Password`}
        icon={<KeyIcon variant="solid" />}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs font-medium text-foreground-400"
            >
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
              <label
                htmlFor="confirmPassword"
                className="text-xs font-medium text-foreground-400"
              >
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
                placeholder="Confirm password"
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
              description="Passwords cannot be recovered if lost. We recommend using a different authentication method."
              variant="warning"
              className="mt-2"
              isExpanded
            />
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              id="primary-button"
              isLoading={isLoading}
            >
              {isLogin ? "Log In" : "Sign Up"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
