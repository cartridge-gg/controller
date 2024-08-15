import { DotsIcon } from "@cartridge/ui";
import { IconButton } from "@chakra-ui/react";
import { isIframe } from "components/connect/utils";

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
      icon={<DotsIcon fontSize={24} />}
      onClick={onClick}
    />
  );
}
