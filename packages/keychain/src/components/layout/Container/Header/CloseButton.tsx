import { TimesIcon, Button } from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";
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
    <Button variant="icon" size="icon" onClick={handleClose}>
      <TimesIcon />
    </Button>
  );
}
