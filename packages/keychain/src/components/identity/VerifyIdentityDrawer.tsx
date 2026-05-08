import { useMemo, useState } from "react";
import {
  Button,
  DateSelect,
  Drawer,
  DrawerContent,
  Input,
  PhoneNumberInput,
  UserIcon,
  isValidCalendarDate,
  isValidPhoneNumber,
  type DateValue,
} from "@cartridge/controller-ui";

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
  const [phone, setPhone] = useState("");

  const dobValid = isValidCalendarDate(dob);
  const phoneValid = useMemo(() => isValidPhoneNumber(phone), [phone]);
  const canSubmit = !!firstName && !!lastName && dobValid && phoneValid;

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
            value={phone}
            setValue={setPhone}
          />
        </div>

        <Button
          className="w-full"
          onClick={() => {
            onVerified(true);
            onClose();
          }}
          disabled={!canSubmit}
        >
          Continue
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
