import { useCallback } from "react";
import { Drawer, DrawerContent, DepositIcon } from "@cartridge/controller-ui";
import { useTokens } from "@/hooks/token";
import type { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
// import { useIdentityContext } from "@/components/identity/provider";
import { ControllerRailProvider } from "@/components/purchase/checkout/rails";
import { ControllerCheckout } from "@/components/purchase/checkout/controller";
import { VerificationDrawer } from "@/components/purchase/verification/drawer";
import { useCreditsContext } from "./provider";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethodSelection | null;
  amount: number;
  onChangeMethod: () => void;
  onChangeAmount: () => void;
}

/** Container for the checkout step: supplies the neutral rail contexts and
 * mounts the matching self-contained rail checkout. Each rail
 * (controller / Coinflow / Apple Pay) owns its own status + review UI; the host
 * just supplies the amount and the completion seam. */
export function Checkout({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  onChangeMethod,
  onChangeAmount,
}: CheckoutProps) {
  const { credits } = useTokens();
  const { onDepositFinished } = useCreditsContext();
  // const { isEmailVerified, isPhoneNumberVerified } = useIdentityContext();

  const isController = paymentMethod?.type === "controller";

  // Verification is required by the fiat rails, not the controller (USDC
  // deposit) rail. Leave the method undefined for controller so the drawer
  // stays inert; the fiat rails set it in Phase 2c.
  const verificationMethod: "coinflow" | "apple-pay" | undefined =
    paymentMethod?.type === "apple-pay"
      ? "apple-pay"
      : paymentMethod?.type === "coinflow"
        ? "coinflow"
        : undefined;
  const needsVerification = false;

  const onComplete = useCallback(async () => {
    await credits.refetch?.();
    // Fires the success callback registered by initiateCreditsDeposit (e.g. the
    // bundle-with-credits flow resumes by refetching its balance), then closes.
    await onDepositFinished();
    onClose();
  }, [credits, onDepositFinished, onClose]);

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
        <DrawerContent
          title="Deposit USD"
          icon={<DepositIcon variant="solid" />}
        >
          {isController && (
            <ControllerRailProvider amount={amount} onComplete={onComplete}>
              <ControllerCheckout
                paymentMethod={paymentMethod}
                onChangeMethod={onChangeMethod}
                onChangeAmount={onChangeAmount}
              />
            </ControllerRailProvider>
          )}
          {/* Coinflow (card) + Coinbase (Apple Pay) rails wired in Phase 2c. */}
        </DrawerContent>
      </Drawer>

      <VerificationDrawer
        isOpen={isOpen && needsVerification && verificationMethod !== undefined}
        method={verificationMethod}
        onClose={() => {
          // Canceled verification — back to the payment method picker.
          onChangeMethod();
          onChangeAmount();
        }}
        onSuccess={() => {
          // Verified — refetchUserData (run by the identity drawers) flips
          // needsVerification false and the Coinbase drawer opens.
        }}
      />
    </>
  );
}
