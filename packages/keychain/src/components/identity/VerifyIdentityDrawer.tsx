import { useCallback, useMemo, useState } from "react";
import {
  Button,
  DateSelect,
  Drawer,
  DrawerContent,
  ErrorMessage,
  Input,
  PhoneNumberInput,
  UserIcon,
  isValidCalendarDate,
  type DateValue,
} from "@cartridge/controller-ui";
import { isValidPhoneNumber } from "@/utils/input";
import { useAccountVerifyMutation } from "@/utils/api";

interface VerifyIdentityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (result: boolean) => void;
}

export function VerifyIdentityDrawer({
  isOpen,
  onClose,
  onVerified,
}: VerifyIdentityDrawerProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState<DateValue>({ year: "", month: "", day: "" });
  const [phoneNumber, setPhoneNumber] = useState("");

  const dobValid = isValidCalendarDate(dob);
  const phoneValid = useMemo(
    () => isValidPhoneNumber(phoneNumber),
    [phoneNumber],
  );
  const canSubmit = !!firstName && !!lastName && dobValid && phoneValid;

  // mutation
  const {
    mutateAsync: verifyAsync,
    isLoading: isVerifyLoading,
    isError: isVerifyError,
    error: verifyError,
  } = useAccountVerifyMutation();
  const [error, setError] = useState<string>();

  const handleVerifyIdentity = useCallback(async () => {
    setError(undefined);
    const result = await verifyAsync({
      input: {
        firstName,
        lastName,
        dob: `${dob.year}-${("0" + dob.month).slice(-2)}-${("0" + dob.day).slice(-2)}`, // YYYY-MM-DD
        phoneNumber,
        // emailAddress, // not stored, do proper verification
        // sandbox: true, //returns true, but do not store
      },
    });
    if (!result.accountVerify) {
      console.error("Account verification failed");
      setError("Account verification failed");
      return;
    }
    onVerified(true);
    onClose();
  }, [verifyAsync, firstName, lastName, dob, phoneNumber, onVerified, onClose]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
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

        <div className="flex flex-col gap-2">
          <label
            htmlFor="verify-identity-phone"
            className="text-xs text-foreground-300 font-medium"
          >
            Phone Number
          </label>
          <PhoneNumberInput
            inputId="verify-identity-phone"
            value={phoneNumber}
            setValue={setPhoneNumber}
          />
          {(isVerifyError || error) && (
            <ErrorMessage label={(verifyError as string) || error} />
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleVerifyIdentity}
          disabled={!canSubmit}
          isLoading={isVerifyLoading}
        >
          Continue
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
