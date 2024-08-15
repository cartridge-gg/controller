import { ArrowLeftIcon } from "@cartridge/ui";
import { IconButton } from "@chakra-ui/react";
import { isIframe } from "components/connect/utils";

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
      icon={<ArrowLeftIcon fontSize={24} />}
      onClick={onClick}
    />
  );
}
