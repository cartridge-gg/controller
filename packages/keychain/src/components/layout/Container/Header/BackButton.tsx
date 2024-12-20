import { ArrowIcon } from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";
import { IconButton } from "@chakra-ui/react";

export function BackButton({ onClick }: { onClick?: () => void }) {
  if (!isIframe()) {
    return null;
  }

  return (
    <IconButton
      aria-label="Go Back"
      bg="solid.bg"
      _hover={{
        bg: "solid.bg",
        opacity: 0.75,
      }}
      icon={<ArrowIcon variant="left" />}
      onClick={onClick}
    />
  );
}
