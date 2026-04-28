import { AuthOption } from "@cartridge/controller";
import {
  Drawer,
  DrawerContent,
  SignerPendingCard,
  Spinner,
  WarningIcon,
  CheckIcon,
} from "@cartridge/controller-ui";

interface SignupPendingDrawerProps {
  isOpen: boolean;
  isLoading: boolean;
  error?: Error | undefined;
  authenticationMode: AuthOption | undefined;
  onClose: () => void;
}

export function SignupPendingDrawer({
  isOpen = true,
  isLoading,
  error,
  authenticationMode,
  onClose,
}: SignupPendingDrawerProps) {
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
      </DrawerContent>
    </Drawer>
  );
}
