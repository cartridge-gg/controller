import {
  Button,
  CheckIcon,
  Sheet,
  SheetContent,
  SheetTitle,
  Thumbnail,
  TimesIcon,
} from "@cartridge/ui";
import { Verification } from "./index";

interface VerificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which downstream checkout is being gated by verification. Controls
   * whether email-only or email+phone is required. */
  method: "coinflow" | "apple-pay" | null;
  /** Called when verification completes. The host should close this drawer
   * and open the matching payment drawer next. */
  onSuccess: () => void;
}

export function VerificationDrawer({
  isOpen,
  onClose,
  method,
  onSuccess,
}: VerificationDrawerProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="flex flex-col bg-[#0F1410] w-full h-[85vh] justify-start p-0 gap-0 border-t-0 rounded-tl-[16px] rounded-tr-[16px] overflow-hidden"
        showClose={false}
      >
        <div className="flex items-center justify-between p-4">
          <SheetTitle className="flex items-center gap-3 text-lg text-start font-semibold">
            <Thumbnail
              icon={<CheckIcon />}
              size="lg"
              className="bg-background-100"
            />
            Verify
          </SheetTitle>
          <Button
            variant="icon"
            size="icon"
            onClick={onClose}
            tabIndex={-1}
            className="rounded-full bg-background-100 hover:bg-background-200"
          >
            <TimesIcon size="sm" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <Verification method={method} onSuccess={onSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
