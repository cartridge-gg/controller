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
      goBack();
    }
  }, [onBack, canGoBack, goBack]);

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
