import { useMemo, useState } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  Input,
  UserIcon,
} from "@cartridge/controller-ui";
import { ErrorAlert } from "@/components/ErrorAlert";
import { CoinflowKycStatus } from "@/hooks/payments/coinflow-withdraw";
import { SandboxWarning } from "./OverviewDrawer";

/** Payload for createCoinflowKYC — name/DOB/email are attached server-side
 * from the verified identity. Coinflow's US KYC schema requires the home
 * address plus the last 4 digits of the SSN; both are collected here and
 * passed straight through to Coinflow (the SSN is never persisted our side). */
export interface CoinflowKycAddress {
  address1: string;
  city: string;
  state: string;
  zip: string;
  ssnLast4: string;
}

interface CoinflowKycDrawerProps {
  isOpen: boolean;
  /** Cancels back to the overview drawer; WITHDRAW resumes here. */
  onClose: () => void;
  /** Live Coinflow KYC status from coinflowWithdrawStatus. APPROVED never
   * renders here (the derived step has already advanced past this drawer). */
  kycStatus?: CoinflowKycStatus;
  /** Hosted verification link, when Coinflow requires it (PENDING). Opening
   * it round-trips out of the app; the status refetches on window focus. */
  verificationLink?: string | null;
  /** Verified identity summary — prefilled read-only; editing means going
   * back through identity verification, not typing here. */
  userData: {
    firstName?: string | null;
    lastName?: string | null;
    dob?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  };
  isSubmitting?: boolean;
  /** createCoinflowKYC failure (e.g. FAILED_PRECONDITION "no name/DOB"). */
  error?: Error | null;
  /** Coinflow sandbox is active — renders the standing sandbox warning. */
  sandbox?: boolean;
  /** Submits the collected address to createCoinflowKYC. */
  onSubmit: (address: CoinflowKycAddress) => void;
}

/**
 * The Coinflow payout-KYC drawer — one drawer for every non-approved state:
 * NONE shows the address form; REJECTED/EXPIRED show the form with contextual
 * copy (resubmitting refreshes the KYC and returns a new hosted link when
 * needed); PENDING shows the waiting state with a button to Coinflow's hosted
 * verification link. The identity summary is always read-only — it comes from
 * the already-verified identity, never re-entered.
 */
export function CoinflowKycDrawer({
  isOpen,
  onClose,
  kycStatus,
  verificationLink,
  userData,
  isSubmitting,
  error,
  sandbox,
  onSubmit,
}: CoinflowKycDrawerProps) {
  // Address survives a cancel (back to overview) so resuming the flow keeps
  // what was typed; a successful submit lands on PENDING, which hides the form.
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [ssnLast4, setSsnLast4] = useState("");

  const ssnValid = /^\d{4}$/.test(ssnLast4);
  const canSubmit =
    !!address1.trim() &&
    !!city.trim() &&
    !!state.trim() &&
    !!zip.trim() &&
    ssnValid;

  const pending = kycStatus === CoinflowKycStatus.Pending;

  // Contextual banner for the retry states; NONE (first pass) needs none.
  const banner = useMemo(() => {
    switch (kycStatus) {
      case CoinflowKycStatus.Rejected:
        return "Your identity verification was unsuccessful. Review your details and try again.";
      case CoinflowKycStatus.Expired:
        return "Your identity verification has expired. Confirm your details to renew it.";
      default:
        return null;
    }
  }, [kycStatus]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent
        title="Confirm Identity"
        icon={<UserIcon variant="solid" size="lg" />}
      >
        {/* Always visible while sandbox is active, whatever the drawer state. */}
        {sandbox && <SandboxWarning />}

        {pending ? (
          <>
            <div className="p-3 text-xs border border-background-200 rounded text-foreground-300">
              <p>
                {verificationLink
                  ? "One more step: complete your verification with our payment partner. This screen updates automatically once you're done."
                  : "Your identity verification is in progress. This screen updates automatically once it completes."}
              </p>
            </div>
            {verificationLink ? (
              <Button
                onClick={() =>
                  window.open(verificationLink, "_blank", "noopener")
                }
              >
                Complete Verification
              </Button>
            ) : (
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            )}
          </>
        ) : (
          <>
            {banner && (
              <div className="p-3 text-xs border border-background-200 rounded text-destructive-100">
                <p>{banner}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-foreground-300 font-medium">
                  Your verified identity
                </label>
                <p className="text-xs text-foreground-400">
                  These details come from your verified identity and can't be
                  edited here.
                </p>
              </div>
              <div className="flex gap-3">
                <Input
                  aria-label="First name"
                  value={userData.firstName ?? ""}
                  disabled
                />
                <Input
                  aria-label="Last name"
                  value={userData.lastName ?? ""}
                  disabled
                />
              </div>
              <Input
                aria-label="Date of birth"
                value={userData.dob ?? ""}
                disabled
              />
              <Input aria-label="Email" value={userData.email ?? ""} disabled />
              <Input
                aria-label="Phone number"
                value={userData.phoneNumber ?? ""}
                disabled
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs text-foreground-300 font-medium">
                Home address
              </label>
              <Input
                placeholder="Address"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
              <div className="flex gap-3">
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <Input
                placeholder="Zip code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="ssn-last4"
                className="text-xs text-foreground-300 font-medium"
              >
                Last 4 digits of SSN
              </label>
              <Input
                id="ssn-last4"
                inputMode="numeric"
                autoComplete="off"
                placeholder="••••"
                maxLength={4}
                value={ssnLast4}
                onChange={(e) =>
                  setSsnLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
              />
            </div>

            {error && (
              <ErrorAlert
                title="Unable to verify your identity"
                description={error.message}
              />
            )}

            <Button
              disabled={!canSubmit}
              isLoading={isSubmitting}
              onClick={() =>
                onSubmit({
                  address1: address1.trim(),
                  city: city.trim(),
                  state: state.trim(),
                  zip: zip.trim(),
                  ssnLast4,
                })
              }
            >
              Continue
            </Button>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
