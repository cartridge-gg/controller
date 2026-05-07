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

interface SignerPendingDrawerProps {
  isOpen: boolean;
  isLoading: boolean;
  error?: Error | undefined;
  authenticationMode: AuthOption | undefined;
  onClose: () => void;
  onRetry?: () => void;
}

export function SignerPendingDrawer({
  isOpen = true,
  isLoading,
  error,
  authenticationMode,
  onClose,
  onRetry,
}: SignerPendingDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <DrawerContent
        title={`Signup with ${authenticationMode}`}
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
        {onRetry && !isLoading && error && (
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
        )}
      </DrawerContent>
    </Drawer>
  );
}
