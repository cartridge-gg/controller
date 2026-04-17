import { useState } from "react";
import {
  Button,
  CreditCardIcon,
  Sheet,
  SheetContent,
  SheetTitle,
  Spinner,
  Thumbnail,
  TimesIcon,
} from "@cartridge/ui";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { CoinflowForm, type CoinflowFormHandle } from "./form";

interface CoinflowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoinflowDrawer({ isOpen, onClose }: CoinflowDrawerProps) {
  const [handle, setHandle] = useState<CoinflowFormHandle | null>(null);
  const isSubmitting = handle?.isSubmitting ?? false;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="flex flex-col bg-[#0F1410] w-full h-fit max-h-[85vh] justify-end p-4 gap-4 border-t-0 rounded-tl-[16px] rounded-tr-[16px]"
        showClose={false}
      >
        <div className="flex items-center justify-between">
          <SheetTitle className="flex items-center gap-3 text-lg text-start font-semibold">
            <Thumbnail
              icon={<CreditCardIcon variant="solid" />}
              size="lg"
              className="bg-background-100"
            />
            Credit Card
          </SheetTitle>
          <Button
            variant="icon"
            size="icon"
            onClick={onClose}
            disabled={isSubmitting}
            tabIndex={-1}
            className="rounded-full bg-background-100 hover:bg-background-200"
          >
            <TimesIcon size="sm" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto">
          <CoinflowForm onStateChange={setHandle} />
        </div>

        <div className="flex flex-col gap-3">
          {handle?.error && <ControllerErrorAlert error={handle.error} />}
          <Button
            className="w-full"
            onClick={() => handle?.submit()}
            disabled={!handle?.isFormValid}
          >
            {handle?.isSubmitting ? <Spinner /> : "Pay"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
