import { TimesIcon, Button } from "@cartridge/ui-next";

export function CloseButton({ onClose }: { onClose?: () => void }) {
  return (
    <Button variant="icon" size="icon" onClick={onClose}>
      <TimesIcon />
    </Button>
  );
}
