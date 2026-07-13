import { useCoinflowIsMainnet } from "@/hooks/payments/coinflow-withdraw";
import { useWithdrawContext } from "./provider";
import { OverviewDrawer } from "./OverviewDrawer";

interface WithdrawCreditsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Orchestrator for the withdraw (off-ramp) flow. One drawer: the overview,
 * which reveals the amount selection in place once the user clicks WITHDRAW.
 * The verification/KYC and bank-onboarding gates (plan steps 4–5) run between
 * the WITHDRAW click and amount mode; until they land, WITHDRAW goes straight
 * to the amount selection so the flow is testable behind the flag.
 */
export function WithdrawCredits({ isOpen, onClose }: WithdrawCreditsProps) {
  const {
    step,
    status,
    statusLoading,
    statusError,
    beginWithdraw,
    setCredits,
  } = useWithdrawContext();

  const { isCoinflowSandbox } = useCoinflowIsMainnet();

  return (
    <OverviewDrawer
      isOpen={isOpen}
      onClose={onClose}
      onWithdraw={beginWithdraw}
      minCredits={status?.minCredits}
      maxCredits={status?.maxCredits}
      withdrawableCredits={status?.withdrawableCredits}
      isLoading={statusLoading}
      error={statusError}
      sandbox={isCoinflowSandbox}
      amountMode={step !== "overview"}
      onContinue={(credits) => {
        // Whole credits, ready for the quote/withdrawal inputs. Plan step 6
        // fetches the quote here and advances to confirm.
        setCredits(credits);
      }}
    />
  );
}
