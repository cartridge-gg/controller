import {
  useCoinflowIsMainnet,
  useCreateCoinflowKYC,
} from "@/hooks/payments/coinflow-withdraw";
import { useIdentityContext } from "@/components/identity/provider";
import { Verification } from "@/components/purchase/verification";
import { useWithdrawContext } from "./provider";
import { BankAuthDrawer } from "./BankAuthDrawer";
import { CoinflowKycDrawer } from "./CoinflowKycDrawer";
import { OverviewDrawer } from "./OverviewDrawer";
import { WithdrawMethodDrawer } from "./WithdrawMethodDrawer";

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
 * Coinflow reports them invalidated. Continue on the amount step with no
 * confirmed transfer method opens the method picker (or the add-bank form
 * when nothing is linked); both land back on the amount step. Continue with a
 * method confirmed advances to the quote step (plan step 6).
 */
export function WithdrawCredits({ isOpen, onClose }: WithdrawCreditsProps) {
  const {
    step,
    status,
    statusLoading,
    statusError,
    beginWithdraw,
    returnToOverview,
    credits,
    setCredits,
    selectedDestination,
    openMethodSelection,
    closeMethodSelection,
    startLinkDestination,
    cancelLinkDestination,
    quote,
    submit,
    activeWithdrawal,
    activeWithdrawalLoading,
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
  const isOverviewStep = step === "overview" || step === "amount";

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
        amountMode={step === "amount"}
        // Restores the picked amount when the drawer re-opens after the
        // method sub-step (the drawer resets its input on close).
        defaultAmountValue={credits ? (credits / 100).toFixed(2) : undefined}
        activeWithdrawal={activeWithdrawal}
        historyLoading={activeWithdrawalLoading}
        onContinue={(credits) => {
          // Whole credits, ready for the quote/withdrawal inputs.
          setCredits(credits);
          if (!selectedDestination) {
            // No transfer method confirmed yet: pick among the linked
            // destinations, or link a bank account when none exist.
            openMethodSelection();
            return;
          }
          // Plan step 6 fetches the quote here and advances to confirm.
        }}
      />

      <WithdrawMethodDrawer
        isOpen={isOpen && step === "select-method"}
        onClose={() => {
          // Cancel back to the amount step — only on user intent; the same
          // dismiss fires when confirming a method advances the step.
          if (step === "select-method") closeMethodSelection();
        }}
        destinations={status?.destinations ?? []}
        credits={credits ?? 0}
        sandbox={isCoinflowSandbox}
        // The provider owns the quote; the drawer picks a destination *type*,
        // quotes its linked account, and renders the fee/net it prices.
        onSelectMethod={quote.select}
        onResetSelection={quote.reset}
        onLink={startLinkDestination}
        quote={quote.data}
        quoteLoading={quote.isLoading}
        quoteError={quote.error}
        onWithdraw={submit.submit}
        isSubmitting={submit.isLoading}
        submitError={submit.error}
      />

      {/* Hosted Bank Authentication UI (Coinflow's CoinflowWithdraw iframe) —
          the primary add-bank path. The provider owns the session + the
          onLinked handoff; on success it refetches the status and returns to
          the method picker with the new destination listed. The legacy raw
          CreateBankAccountDrawer form is intentionally no longer wired. */}
      <BankAuthDrawer
        isOpen={isOpen && step === "add-bank"}
        onClose={() => {
          // Cancel the link flow — back to the picker (withdraw intent) or
          // close (add-bank intent); only on user intent (see above).
          if (step === "add-bank") cancelLinkDestination();
        }}
        sandbox={isCoinflowSandbox}
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
