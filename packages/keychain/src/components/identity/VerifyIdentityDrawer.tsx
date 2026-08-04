import { useCallback, useEffect, useState } from "react";
import {
  Button,
  DateSelect,
  Drawer,
  DrawerContent,
  Input,
  UserIcon,
  isValidCalendarDate,
  type DateValue,
} from "@cartridge/controller-ui";
import { AccountVerifyReasonCode, useAccountVerifyMutation } from "@/utils/api";
import { VerifyErrorAlert } from "./error";

interface VerifyIdentityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (result: boolean) => void | Promise<void>;
}

export function VerifyIdentityDrawer({
  isOpen,
  onClose,
  onVerified,
}: VerifyIdentityDrawerProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState<DateValue>({ year: "", month: "", day: "" });
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      setFirstName("");
      setLastName("");
      setDob({ year: "", month: "", day: "" });
      setError(undefined);
    }
  }, [isOpen]);

  const dobValid = isValidCalendarDate(dob);
  const canSubmit = !!firstName && !!lastName && dobValid;

  // mutation
  const {
    mutateAsync: verifyAsync,
    isLoading: isVerifyLoading,
    isError: isVerifyError,
    error: verifyError,
  } = useAccountVerifyMutation();

  useEffect(() => {
    if (isVerifyError && verifyError) {
      setError(verifyError.toString());
    }
  }, [isVerifyError, verifyError]);

  const [isCompleting, setIsCompleting] = useState(false);

  const handleVerifyIdentity = useCallback(async () => {
    try {
      setError(undefined);
      const result = await verifyAsync({
        input: {
          firstName,
          lastName,
          dob: `${dob.year}-${("0" + dob.month).slice(-2)}-${("0" + dob.day).slice(-2)}`, // YYYY-MM-DD
          // sandbox: true, //returns true, but do not store
        },
      });
      if (!result.accountVerify.verified) {
        const reference = result.accountVerify.correlationId
          ? ` Reference: ${result.accountVerify.correlationId}`
          : "";
        if (
          result.accountVerify.reasonCode ===
            AccountVerifyReasonCode.ProviderUnavailable ||
          result.accountVerify.retryable
        ) {
          setError(
            `Identity verification service is temporarily unavailable. Please try again.${reference}`,
          );
        } else {
          setError(
            `We couldn't verify these details. Check that your legal name and date of birth match the identity associated with your verified phone number.${reference}`,
          );
        }
        return;
      }
      // The provider's onVerified refetches the user data and closes this
      // drawer once the verified flags are live. Do NOT call onClose() here —
      // that's the cancel path (it flags isCanceled), and firing it before
      // the refetch lands makes a success look like a cancel to gauntlet
      // hosts like the withdraw flow.
      setIsCompleting(true);
      await onVerified(true);
    } catch (err) {
      console.error("verifyAsync error:", (err as Error).message);
    } finally {
      setIsCompleting(false);
    }
  }, [verifyAsync, firstName, lastName, dob, onVerified]);

  // Ignore dismiss events once the drawer is already closed (mirrors the
  // email/phone drawers) so a programmatic close never re-fires the cancel.
  const handleClose = useCallback(
    (event?: Event) => {
      if (!isOpen) return;
      event?.preventDefault();
      onClose();
    },
    [isOpen, onClose],
  );

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent
        title="Confirm Identity"
        icon={<UserIcon variant="solid" size="lg" />}
      >
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="verify-identity-first-name"
              className="text-xs text-foreground-300 font-medium"
            >
              First Name
            </label>
            <Input
              id="verify-identity-first-name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <label
              htmlFor="verify-identity-last-name"
              className="text-xs text-foreground-300 font-medium"
            >
              Last Name
            </label>
            <Input
              id="verify-identity-last-name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-foreground-300 font-medium">
            Date of Birth
          </label>
          <DateSelect value={dob} setValue={setDob} />
        </div>

        {error && <VerifyErrorAlert error={error} />}

        <Button
          className="w-full"
          onClick={handleVerifyIdentity}
          disabled={!canSubmit}
          isLoading={isVerifyLoading || isCompleting}
        >
          Continue
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
