import { LayoutHeader, HeaderProps } from "@cartridge/ui";
import { useConnection } from "@/hooks/connection";
import { useNavigationStack } from "@/hooks/useNavigationStack";

export type NavigationHeaderProps = {
  // Navigation props
  onClose?: () => void;
  onBack?: () => void;

  // Auto-navigation options
  enableAutoNavigation?: boolean; // Enable automatic back/close based on stack depth
  stackThreshold?: number; // Stack depth threshold to show back vs close (default: 1)

  // Manual overrides
  forceShowBack?: boolean;
  forceShowClose?: boolean;

  // Navigation stack options
  stackKey?: string; // Key for navigation stack (default: "default")
} & HeaderProps;

export function NavigationHeader({
  onClose,
  onBack,
  stackThreshold = 1,
  forceShowBack = false,
  forceShowClose = false,
  stackKey = "default",
  ...props
}: NavigationHeaderProps) {
  const { closeModal } = useConnection();
  const { goBack, canNavigateBack, stackDepth, handleClose } =
    useNavigationStack({
      stackKey,
      onClose: () => {
        if (onClose) onClose();
        if (closeModal) closeModal();
      },
    });

  // Determine which button to show based on navigation state
  const shouldShowBack =
    forceShowBack || (canNavigateBack && stackDepth > stackThreshold);
  const shouldShowClose = forceShowClose || !shouldShowBack;

  // Handle back navigation
  const handleBack = shouldShowClose
    ? undefined
    : onBack || (shouldShowBack ? goBack : undefined);

  // Handle close navigation - use the enhanced handleClose that resets stack
  const handleCloseAction =
    onClose || (shouldShowClose ? handleClose : undefined);

  return (
    <LayoutHeader {...props} onBack={handleBack} onClose={handleCloseAction} />
  );
}

export default NavigationHeader;
