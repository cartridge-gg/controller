import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { AuthOption } from "@cartridge/controller";
import {
  Button,
  Drawer,
  DrawerContent,
  SignerPendingCard,
  Spinner,
  WarningIcon,
  CheckIcon,
} from "@cartridge/controller-ui";
import { useMemo } from "react";
import { useAdvancedView } from "@/hooks/features";

interface SignerPendingDrawerProps {
  isOpen: boolean;
  isLogin: boolean;
  isLoading: boolean;
  error?: Error | undefined;
  authenticationMode: AuthOption | undefined;
  onClose: () => void;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function SignerPendingDrawer({
  isOpen = true,
  isLogin = false,
  isLoading = false,
  error,
  authenticationMode,
  onClose,
  onRetry,
  children,
}: SignerPendingDrawerProps) {
  const advancedView = useAdvancedView();
  const authName = useMemo(
    () => (authenticationMode ? AUTH_METHODS_LABELS[authenticationMode] : "?"),
    [authenticationMode],
  );
  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <DrawerContent
        title={`${isLogin ? "Log In" : "Sign Up"} with ${authName}`}
        icon={isLoading ? <Spinner /> : error ? <WarningIcon /> : <CheckIcon />}
      >
        {authenticationMode && (
          <SignerPendingCard
            kind={authenticationMode}
            inProgress={isLoading}
            error={
              error
                ? advancedView
                  ? error.message || "Unknown error"
                  : "Authentication failed. Please try again."
                : undefined
            }
            // authedAddress={signerPending.authedAddress}
          />
        )}
        {children}
        {onRetry && !isLoading && error && (
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
        )}
      </DrawerContent>
    </Drawer>
  );
}
