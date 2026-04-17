import { useState } from "react";
import {
  Button,
  CoinbaseWalletColorIcon,
  Sheet,
  SheetContent,
  SheetTitle,
  Thumbnail,
  TimesIcon,
} from "@cartridge/ui";
import { CoinbaseCheckout } from "./index";

interface CoinbaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when the Coinbase payment popup opens — the caller should close
   * the drawer and render <CoinbasePopupStatus /> as a takeover. */
  onPopupOpened: () => void;
}

export function CoinbaseDrawer({
  isOpen,
  onClose,
  onPopupOpened,
}: CoinbaseDrawerProps) {
  const [isCommitting, setIsCommitting] = useState(false);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isCommitting) onClose();
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
              icon={<CoinbaseWalletColorIcon />}
              size="lg"
              className="bg-background-100"
            />
            Apple Pay
          </SheetTitle>
          <Button
            variant="icon"
            size="icon"
            onClick={onClose}
            disabled={isCommitting}
            tabIndex={-1}
            className="rounded-full bg-background-100 hover:bg-background-200"
          >
            <TimesIcon size="sm" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <CoinbaseCheckout
            hideStatus
            onPopupOpened={onPopupOpened}
            onBack={onClose}
            onLoadingChange={setIsCommitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
