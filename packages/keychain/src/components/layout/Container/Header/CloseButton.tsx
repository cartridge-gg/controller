import { TimesIcon } from "@cartridge/ui";
import { isIframe } from "@cartridge/utils";
import { IconButton } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";
import { useCallback } from "react";

export function CloseButton() {
  const { upgrade, logout, closeModal } = useConnection();

  const onClose = useCallback(() => {
    if (upgrade.available) {
      logout();
    }
    closeModal();
  }, [upgrade.available, logout, closeModal]);

  if (!isIframe()) {
    return null;
  }

  return (
    <IconButton
      aria-label="Close Controller"
      bg="solid.bg"
      _hover={{
        bg: "solid.bg",
        opacity: 0.75,
      }}
      icon={<TimesIcon fontSize={24} />}
      onClick={onClose}
    />
  );
}
