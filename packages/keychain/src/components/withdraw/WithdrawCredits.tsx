import {
  ArrowFromLineIcon,
  Drawer,
  DrawerContent,
  SpinnerIcon,
} from "@cartridge/controller-ui";
import { useWithdrawContext } from "./provider";

interface WithdrawCreditsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Step orchestrator for the withdraw (off-ramp) flow — mirror of
 * DepositCredits. Each step drawer will render with
 * `isOpen={isOpen && step === "..."}` so transitions are pure state changes.
 * The per-step drawers (ConfirmIdentity, WithdrawTo/AddBank, Amount, Confirm,
 * status) land in later steps of the plan; this shell renders a single empty
 * drawer while the flow is being built out.
 */
export function WithdrawCredits({ isOpen, onClose }: WithdrawCreditsProps) {
  const { statusLoading } = useWithdrawContext();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Withdraw" icon={<ArrowFromLineIcon variant="up" />}>
        {statusLoading && (
          <div className="flex items-center justify-center py-8">
            <SpinnerIcon className="animate-spin text-foreground-300" />
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
