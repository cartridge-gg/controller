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

  // Check if we're in an iframe
  const isInIframe = window.self !== window.top;

  // Determine which button to show based on navigation state
  const shouldShowBack = forceShowBack || (canGoBack && !forceShowClose);
  const shouldShowClose = isInIframe && (forceShowClose || !shouldShowBack);

  // Handle back navigation
  const handleBack = useCallback(() => {
    // If a custom onBack handler is provided, use it
    if (onBack) {
      onBack();
      return;
    }

    if (canGoBack) {
      goBack();
    }
  }, [canGoBack, goBack, onBack]);

  // Handle close navigation
  const handleCloseAction = useCallback(() => {
    if (onClose) {
      onClose();
    } else if (closeModal) {
      closeModal();
    }

    navigateToRoot();
  }, [onClose, closeModal, navigateToRoot]);

  return (
    <LayoutHeader
      {...props}
      onBack={shouldShowBack ? handleBack : undefined}
      onClose={shouldShowClose ? handleCloseAction : undefined}
      hideSettings
    />
  );
}

export default NavigationHeader;
