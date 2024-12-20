import { TimesIcon } from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";
import { IconButton } from "@chakra-ui/react";
import { useConnection } from "@/hooks/connection";
import { useCallback } from "react";

export function CloseButton({ onClose }: { onClose?: () => void }) {
  const { upgrade, logout, closeModal } = useConnection();

  const handleClose = useCallback(() => {
    if (upgrade.available) {
      logout();
    }

    if (onClose) {
      onClose();
    }

    closeModal();
  }, [upgrade.available, logout, closeModal, onClose]);

  if (!isIframe()) {
    return null;
  }

  return (
    <IconButton
      aria-label="Close Controller"
      bg="solid.bg"
      _hover={{
        bg: "hsl(var(solid.primary)/0.75)",
      }}
      icon={<TimesIcon />}
      onClick={handleClose}
    />
  );
}
