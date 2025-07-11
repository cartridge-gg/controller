import { LayoutHeader, HeaderProps } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { useNavigation } from "@/context/navigation";
import { useCallback } from "react";

export type NavigationHeaderProps = {
  // Navigation props
  onClose?: () => void;
  onBack?: () => void;

  // Manual overrides
  forceShowBack?: boolean;
  forceShowClose?: boolean;
} & HeaderProps;

export function NavigationHeader({
  onClose,
  onBack,
  forceShowBack = false,
  forceShowClose = false,
  ...props
}: NavigationHeaderProps) {
  const { closeModal } = useConnection();
  const { canGoBack, goBack, navigateToRoot } = useNavigation();

  // Determine which button to show based on navigation state
  const shouldShowBack = forceShowBack || (canGoBack && !forceShowClose);
  const shouldShowClose = forceShowClose || !shouldShowBack;

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (canGoBack) {
      if (import.meta.env.DEV) {
        console.log("[NavigationHeader] Going back");
      }

      goBack();
    }
  }, [onBack, canGoBack, goBack]);

  // Handle close navigation
  const handleCloseAction = useCallback(() => {
    if (onClose) {
      onClose();
    } else if (closeModal) {
      // Reset to root when closing to clear navigation state
      navigateToRoot();

      if (import.meta.env.DEV) {
        console.log("[NavigationHeader] Closing and resetting navigation");
      }

      closeModal();
    }
  }, [onClose, closeModal, navigateToRoot]);

  return (
    <LayoutHeader
      {...props}
      onBack={shouldShowBack ? handleBack : undefined}
      onClose={shouldShowClose ? handleCloseAction : undefined}
    />
  );
}

export default NavigationHeader;
