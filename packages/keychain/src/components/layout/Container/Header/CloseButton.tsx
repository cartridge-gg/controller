import { TimesIcon } from "@cartridge/ui";
import { isIframe } from "@cartridge/utils";
import { IconButton } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";

export function CloseButton() {
  const { closeModal } = useConnection();

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
      onClick={closeModal}
    />
  );
}
