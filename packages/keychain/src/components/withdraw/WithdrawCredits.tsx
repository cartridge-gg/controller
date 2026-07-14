import {
  useCoinflowIsMainnet,
  useCreateCoinflowKYC,
} from "@/hooks/payments/coinflow-withdraw";
import { useIdentityContext } from "@/components/identity/provider";
import { Verification } from "@/components/purchase/verification";
import { useWithdrawContext } from "./provider";
import { CoinflowKycDrawer } from "./CoinflowKycDrawer";
import { OverviewDrawer } from "./OverviewDrawer";

interface WithdrawCreditsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Orchestrator for the withdraw (off-ramp) flow. The overview drawer opens
 * first; WITHDRAW enters the derived flow: the email/phone/identity
 * verification gauntlet (one drawer at a time, same gauntlet as the
 * credit-card on-ramp), then the Coinflow KYC drawer, then amount selection
 * revealed in place on the overview drawer. Canceling any gate returns to the
 * overview; WITHDRAW resumes at the first incomplete gate — completed
 * verifications are never requested twice unless the identity provider or
 * Coinflow reports them invalidated. The bank-onboarding gate (plan step 5)
 * lands next; until then an approved user with no destination goes straight
 * to amount mode so the flow stays testable behind the flag.
 */
export function WithdrawCredits({ isOpen, onClose }: WithdrawCreditsProps) {
  const {
    step,
    status,
    statusLoading,
    statusError,
    beginWithdraw,
    returnToOverview,
    setCredits,
  } = useWithdrawContext();

  const { isCoinflowSandbox } = useCoinflowIsMainnet();
  const { userData } = useIdentityContext();

  const {
    createKYC,
    isLoading: isKycSubmitting,
    error: kycError,
  } = useCreateCoinflowKYC();

  // The Drawer dismiss path fires onClose when a drawer closes because the
  // step moved on (not just on user intent) — same as DepositCredits, every
  // drawer's onClose must be guarded on its own step or advancing the flow
  // tears it down.
  const isOverviewStep =
    step === "overview" || step === "amount" || step === "onboarding-bank";

  return (
    <>
      <OverviewDrawer
        isOpen={isOpen && isOverviewStep}
        onClose={() => {
          if (isOverviewStep) onClose();
        }}
        onWithdraw={beginWithdraw}
        minCredits={status?.minCredits}
        maxCredits={status?.maxCredits}
        withdrawableCredits={status?.withdrawableCredits}
        isLoading={statusLoading}
        error={statusError}
        sandbox={isCoinflowSandbox}
        amountMode={step === "amount" || step === "onboarding-bank"}
        onContinue={(credits) => {
          // Whole credits, ready for the quote/withdrawal inputs. Plan step 6
          // fetches the quote here and advances to confirm.
          setCredits(credits);
        }}
      />

      {/* Email → phone → identity gauntlet (headless — the drawers live in
          IdentityProvider), auto-advancing one at a time. On success the
          derived step moves on by itself, flipping method to null before the
          success handoff fires; onClose therefore only handles the cancel
          case, returning to the overview for a later resume. */}
      <Verification
        method={isOpen && step === "verification" ? "withdraw" : null}
        headless
        onSuccess={() => {}}
        onClose={() => {
          // Only a cancel can land here while the gate is active — on success
          // the derived step has already advanced. Guarding on the step also
          // ignores cancels from verifications other flows initiated.
          if (step === "verification") returnToOverview();
        }}
      />

      <CoinflowKycDrawer
        isOpen={isOpen && step === "onboarding-kyc"}
        onClose={() => {
          // Cancel back to the overview — but only on user intent; the same
          // dismiss fires when KYC approval advances the step past this drawer.
          if (step === "onboarding-kyc") returnToOverview();
        }}
        kycStatus={status?.kycStatus}
        verificationLink={status?.verificationLink}
        userData={userData}
        isSubmitting={isKycSubmitting}
        error={kycError}
        sandbox={isCoinflowSandbox}
        onSubmit={(address) => {
          // A result carrying verificationLink is a success ("complete hosted
          // verification"), not an error: the hook invalidates the status
          // query, whose refreshed kycStatus/verificationLink drive this
          // drawer's PENDING state. Rejections (e.g. FAILED_PRECONDITION "no
          // name/DOB") surface through the hook's error.
          createKYC(address).catch(() => {});
        }}
      />
    </>
  );
}
