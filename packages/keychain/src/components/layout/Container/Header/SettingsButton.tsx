import { DotsIcon } from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";
import { IconButton } from "@chakra-ui/react";

export function SettingsButton({ onClick }: { onClick?: () => void }) {
  if (!isIframe()) {
    return null;
  }

  return (
    <IconButton
      aria-label="Open Settings"
      bg="solid.bg"
      _hover={{
        bg: "solid.bg",
        opacity: 0.75,
      }}
      icon={<DotsIcon />}
      onClick={onClick}
    />
  );
}
