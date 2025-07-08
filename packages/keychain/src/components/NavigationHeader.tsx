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
  hasBottomNav?: boolean; // If true, always shows close and doesn't add to nav stack
} & HeaderProps;

export function NavigationHeader({
  onClose,
  onBack,
  stackThreshold = 1,
  forceShowBack = false,
  forceShowClose = false,
  stackKey = "default",
  hasBottomNav = false,
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
      // Don't add to stack if hasBottomNav is true
      disabled: hasBottomNav,
    });

  // When hasBottomNav is true, always show close
  const shouldShowBack = hasBottomNav
    ? false
    : forceShowBack || (canNavigateBack && stackDepth > stackThreshold);
  const shouldShowClose = hasBottomNav
    ? true
    : forceShowClose || !shouldShowBack;

  // Handle back navigation
  const handleBack = onBack || (shouldShowBack ? goBack : undefined);

  // Handle close navigation - use the enhanced handleClose that resets stack
  const handleCloseAction =
    onClose || (shouldShowClose ? handleClose : undefined);

  return (
    <LayoutHeader {...props} onBack={handleBack} onClose={handleCloseAction} />
  );
}

export default NavigationHeader;
