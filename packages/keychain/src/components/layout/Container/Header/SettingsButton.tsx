import { Button, DotsIcon } from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";

export function SettingsButton({ onClick }: { onClick?: () => void }) {
  if (!isIframe()) {
    return null;
  }

  return (
    <Button variant="icon" size="icon" onClick={onClick}>
      <DotsIcon />
    </Button>
  );
}
