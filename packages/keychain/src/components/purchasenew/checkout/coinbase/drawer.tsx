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
import { CoinbaseCheckout, type PanelMode } from "./index";

interface CoinbaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerHeader {
  title: string;
  description?: string;
}

const HEADER_BY_MODE: Record<PanelMode, DrawerHeader> = {
  policies: { title: "Coinbase Policies" },
  status: { title: "Coinbase Policies" },
  "verify-form": {
    title: "Verify to Continue",
    description: "Raise your Coinbase limit",
  },
  "verify-pending": {
    title: "Verifying",
    description: "Coinbase limits upgrade",
  },
  "verify-timeout": {
    title: "Still Processing",
    description: "Coinbase limits upgrade",
  },
  "verify-active": {
    title: "Limits Updated",
    description: "Coinbase limits upgrade",
  },
  "verify-inactive": {
    title: "Not Eligible",
    description: "Coinbase limits upgrade",
  },
};

export function CoinbaseDrawer({ isOpen, onClose }: CoinbaseDrawerProps) {
  const [isCommitting, setIsCommitting] = useState(false);
  const [mode, setMode] = useState<PanelMode>("policies");
  const { closePaymentPopup } = useOnchainPurchaseContext();

  const handleClose = useCallback(() => {
    // Kill any in-flight payment popup so dismissing the drawer also dismisses
    // the Coinbase window. No-op if the popup isn't open.
    closePaymentPopup();
    onClose();
  }, [closePaymentPopup, onClose]);

  const header = HEADER_BY_MODE[mode];

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
          <SheetTitle asChild>
            <div className="flex items-center gap-3 text-start">
              <Thumbnail
                icon={<CoinbaseWalletColorIcon />}
                size="lg"
                className="bg-background-100"
              />
              <div className="flex flex-col">
                <span className="text-lg font-semibold">{header.title}</span>
                {header.description && (
                  <span className="text-xs text-foreground-300">
                    {header.description}
                  </span>
                )}
              </div>
            </div>
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
            onModeChange={setMode}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
