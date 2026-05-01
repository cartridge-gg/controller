import { useCallback, useState } from "react";
import {
  Button,
  CoinbaseWalletColorIcon,
  Sheet,
  SheetContent,
  SheetTitle,
  Thumbnail,
  TimesIcon,
} from "@cartridge/controller-ui";
import { useOnchainPurchaseContext } from "@/context";
import { CoinbaseCheckout } from "./index";

interface CoinbaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoinbaseDrawer({ isOpen, onClose }: CoinbaseDrawerProps) {
  const [isCommitting, setIsCommitting] = useState(false);
  const { closePaymentPopup } = useOnchainPurchaseContext();

  const handleClose = useCallback(() => {
    // Kill any in-flight payment popup so dismissing the drawer also dismisses
    // the Coinbase window. No-op if the popup isn't open.
    closePaymentPopup();
    onClose();
  }, [closePaymentPopup, onClose]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isCommitting) handleClose();
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
            Coinbase Policies
          </SheetTitle>
          <Button
            variant="icon"
            size="icon"
            onClick={handleClose}
            disabled={isCommitting}
            tabIndex={-1}
            className="rounded-full bg-background-100 hover:bg-background-200"
          >
            <TimesIcon size="sm" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <CoinbaseCheckout
            hideHeader
            onBack={handleClose}
            onLoadingChange={setIsCommitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
