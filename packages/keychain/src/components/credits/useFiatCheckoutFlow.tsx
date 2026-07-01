import { useCallback, useEffect, useState } from "react";
import { useIdentityContext } from "@/components/identity/provider";

/**
 * Drives the fiat (Apple Pay / card) credits checkout: review → [continue]
 * verify-if-needed → pay. Verification is required by the rail, not the product
 * — Coinflow needs a verified email; Apple Pay additionally needs a verified
 * phone — and happens *after* the checkout-details review, gated by continue.
 *
 * Rather than the shared Verification component (which, for "apple-pay", also
 * forces identity and fires a single combined onSuccess), we orchestrate the
 * required steps explicitly against the identity context: open email, then (for
 * Apple Pay) phone, then advance. The identity drawers themselves are rendered
 * by IdentityProvider; we just sequence which one opens.
 */
export function useFiatCheckoutFlow({
  method,
}: {
  method: "coinflow" | "apple-pay";
}) {
  const {
    isEmailVerified,
    isPhoneNumberVerified,
    initiateEmailVerification,
    initiatePhoneNumberVerification,
    isVerifying,
    isCanceled,
  } = useIdentityContext();

  const needsEmail = !isEmailVerified;
  const needsPhone = method === "apple-pay" && !isPhoneNumberVerified;
  const needsVerification = needsEmail || needsPhone;

  const [phase, setPhase] = useState<"review" | "pay">("review");
  const [verifying, setVerifying] = useState(false);

  // While the user is verifying and no step drawer is currently open, open the
  // next missing step or — once all required steps are done — advance to pay.
  useEffect(() => {
    if (!verifying) return;
    if (isCanceled) {
      // User dismissed a step drawer — return to the review.
      setVerifying(false);
      return;
    }
    if (isVerifying) return; // a step drawer is open; wait for it to resolve
    if (needsEmail) {
      initiateEmailVerification();
      return;
    }
    if (needsPhone) {
      initiatePhoneNumberVerification();
      return;
    }
    // All required verifications complete — go to the payment drawer.
    setVerifying(false);
    setPhase("pay");
  }, [
    verifying,
    isCanceled,
    isVerifying,
    needsEmail,
    needsPhone,
    initiateEmailVerification,
    initiatePhoneNumberVerification,
  ]);

  const handleContinue = useCallback(() => {
    if (!needsVerification) {
      setPhase("pay");
      return;
    }
    setVerifying(true);
  }, [needsVerification]);

  const backToReview = useCallback(() => setPhase("review"), []);

  return { phase, verifying, handleContinue, backToReview };
}
