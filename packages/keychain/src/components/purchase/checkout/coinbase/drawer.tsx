import { useCallback, useState } from "react";
import { CoinbaseIcon, Drawer, DrawerContent } from "@cartridge/controller-ui";
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
    <Drawer
      isOpen={isOpen}
      onClose={(open) => {
        if (!open && !isCommitting) handleClose();
      }}
    >
      <DrawerContent
        title={header.title}
        subTitle={header.description}
        icon={<CoinbaseIcon />}
      >
        <CoinbaseCheckout
          hideHeader
          onBack={handleClose}
          onLoadingChange={setIsCommitting}
          onModeChange={setMode}
        />
      </DrawerContent>
    </Drawer>
  );
}
