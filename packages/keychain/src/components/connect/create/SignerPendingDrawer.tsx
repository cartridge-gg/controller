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

interface SignerPendingDrawerProps {
  isOpen: boolean;
  isLoading: boolean;
  error?: Error | undefined;
  authenticationMode: AuthOption | undefined;
  onClose: () => void;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function SignerPendingDrawer({
  isOpen = true,
  isLoading,
  error,
  authenticationMode,
  onClose,
  onRetry,
  children,
}: SignerPendingDrawerProps) {
  const authName = useMemo(
    () => (authenticationMode ? AUTH_METHODS_LABELS[authenticationMode] : "?"),
    [authenticationMode],
  );
  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <DrawerContent
        title={`Sign Up with ${authName}`}
        icon={isLoading ? <Spinner /> : error ? <WarningIcon /> : <CheckIcon />}
      >
        {authenticationMode && (
          <SignerPendingCard
            kind={authenticationMode}
            inProgress={isLoading}
            error={error ? error.message || "Unknown error" : undefined}
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
