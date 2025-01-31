import { ArrowIcon, Button } from "@cartridge/ui";
import { isIframe } from "@cartridge/utils";

export function BackButton({ onClick }: { onClick?: () => void }) {
  if (!isIframe()) {
    return null;
  }

  return (
    <Button variant="icon" size="icon" onClick={onClick}>
      <ArrowIcon variant="left" />
    </Button>
  );
}
