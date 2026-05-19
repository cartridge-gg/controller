import { useMemo } from "react";
import {
  formatPhoneNumber,
  MobileIcon,
  SectionHeader,
  SettingsCard,
  UserIcon,
} from "@cartridge/controller-ui";
import { useAccountPrivateQuery } from "@/utils/api";

type VerifiedField = {
  label: string;
  verifiedAt: string;
};

export const UserDataSection = () => {
  const { data } = useAccountPrivateQuery();
  const userData = data?.accountPrivate;

  const verifiedIdentity = useMemo<VerifiedField | null>(() => {
    if (
      !userData?.firstName ||
      !userData?.lastName ||
      !userData?.dob ||
      !userData?.proveVerifiedAt
    ) {
      return null;
    }
    return {
      label: `${userData.firstName} ${userData.lastName}, ${formatAge(userData.dob)}`,
      verifiedAt: userData.proveVerifiedAt,
    };
  }, [
    userData?.firstName,
    userData?.lastName,
    userData?.dob,
    userData?.proveVerifiedAt,
  ]);

  const verifiedPhone = useMemo<VerifiedField | null>(() => {
    if (!userData?.phoneNumber || !userData?.phoneNumberVerifiedAt) {
      return null;
    }
    return {
      // label: `${userData.phoneNumber.slice(0, 3)}***${userData.phoneNumber.slice(-4)}`,
      label: formatPhoneNumber(userData.phoneNumber),
      verifiedAt: userData.phoneNumberVerifiedAt,
    };
  }, [userData?.phoneNumber, userData?.phoneNumberVerifiedAt]);

  return (
    <section className="space-y-4">
      <SectionHeader
        title="User Data"
        description="Used to verify your player identity for banking and compliance purposes. This information is stored securely and is never shared."
        showStatus={false}
      />
      <div className="space-y-3">
        {verifiedIdentity && (
          <SettingsCard
            icon={<UserIcon variant="solid" size="sm" />}
            label={verifiedIdentity.label}
            rightText={formatVerifiedAt(verifiedIdentity.verifiedAt)}
            // onDelete={async () => {}}
          />
        )}
        {verifiedPhone && (
          <SettingsCard
            icon={<MobileIcon variant="solid" size="sm" />}
            label={verifiedPhone.label}
            rightText={formatVerifiedAt(verifiedPhone.verifiedAt)}
            // onDelete={async () => {}}
          />
        )}
      </div>
    </section>
  );
};

function formatVerifiedAt(verifiedAt: string): string {
  const date = new Date(verifiedAt);
  if (Number.isNaN(date.getTime())) return "verified";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAge(dob: string): string {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  return `${years}y`;
}
