import { useCallback, useMemo } from "react";
import {
  EnvelopeIcon,
  formatPhoneNumber,
  MobileIcon,
  SectionHeader,
  SettingsCard,
  UserIcon,
} from "@cartridge/controller-ui";
import {
  useAccountPrivateQuery,
  useDeleteEmailAddressMutation,
  useDeletePhoneNumberMutation,
  useDeleteProveIdentityMutation,
} from "@/utils/api";
import { useMeQuery } from "@cartridge/controller-ui/utils/api/cartridge";

type VerifiedData = {
  label: string;
  verifiedAt: string;
  isLoading: boolean;
  canDelete: boolean;
};

export const UserDataSection = () => {
  const {
    data: meData,
    isLoading: isMeLoading,
    refetch: refetchMe,
  } = useMeQuery();
  const {
    data: privateData,
    isLoading: isPrivateLoading,
    refetch: refetchPrivate,
  } = useAccountPrivateQuery();

  const userData = useMemo(
    () => ({
      firstName: privateData?.accountPrivate?.firstName,
      lastName: privateData?.accountPrivate?.lastName,
      dob: privateData?.accountPrivate?.dob,
      proveVerifiedAt: privateData?.accountPrivate?.proveVerifiedAt,
      phoneNumber: privateData?.accountPrivate?.phoneNumber,
      phoneNumberVerifiedAt: privateData?.accountPrivate?.phoneNumberVerifiedAt,
      email: meData?.me?.email,
    }),
    [privateData, meData],
  );

  const verifiedIdentity = useMemo<VerifiedData | null>(() => {
    if (
      userData.firstName &&
      userData.lastName &&
      userData.dob &&
      userData.proveVerifiedAt
    ) {
      return {
        label: `${userData.firstName} ${userData.lastName}, ${formatAge(userData.dob)}`,
        verifiedAt: userData.proveVerifiedAt,
        isLoading: isPrivateLoading,
        canDelete: true,
      };
    }
    return null;
  }, [userData, isPrivateLoading]);

  const verifiedPhone = useMemo<VerifiedData | null>(() => {
    if (
      userData.phoneNumber &&
      (userData.phoneNumberVerifiedAt || userData.proveVerifiedAt)
    ) {
      return {
        label: formatPhoneNumber(userData.phoneNumber),
        verifiedAt:
          userData.phoneNumberVerifiedAt || userData.proveVerifiedAt || "",
        isLoading: isPrivateLoading,
        canDelete: !!userData.phoneNumberVerifiedAt,
      };
    }
    return null;
  }, [userData, isPrivateLoading]);

  const verifiedEmail = useMemo<VerifiedData | null>(() => {
    if (userData.email) {
      return {
        label: userData.email,
        verifiedAt: "",
        isLoading: isMeLoading,
        canDelete: true,
      };
    }
    return null;
  }, [userData, isMeLoading]);

  // mutation
  const deletePhoneNumberMutation = useDeletePhoneNumberMutation();
  const deleteEmailAddressMutation = useDeleteEmailAddressMutation();
  const deleteProveIdentityMutation = useDeleteProveIdentityMutation();

  const handleDeletePhoneNumber = useCallback(async () => {
    const result = await deletePhoneNumberMutation.mutateAsync({});
    if (!result.deletePhoneNumber) {
      throw new Error("Phone number deletion failed");
    }
  }, [deletePhoneNumberMutation]);

  const handleDeleteEmailAddress = useCallback(async () => {
    const result = await deleteEmailAddressMutation.mutateAsync({});
    if (!result.deleteEmailAddress) {
      throw new Error("Email address deletion failed");
    }
  }, [deleteEmailAddressMutation]);

  const handleDeleteProveIdentity = useCallback(async () => {
    const result = await deleteProveIdentityMutation.mutateAsync({});
    if (!result.deleteProveIdentity) {
      throw new Error("Prove identity deletion failed");
    }
  }, [deleteProveIdentityMutation]);

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
            label="Identity Proof"
            rightText={formatVerifiedAt(verifiedIdentity.verifiedAt)}
            isLoading={verifiedIdentity.isLoading}
            onDelete={async () => {
              await handleDeleteProveIdentity();
              await refetchPrivate();
            }}
            confirmDelete
            deleteLabel="Identity Proof"
          />
        )}
        {verifiedPhone && (
          <SettingsCard
            icon={<MobileIcon variant="solid" size="sm" />}
            label={verifiedPhone.label}
            rightText={formatVerifiedAt(verifiedPhone.verifiedAt)}
            isLoading={verifiedPhone.isLoading}
            onDelete={async () => {
              await handleDeletePhoneNumber();
              await refetchPrivate();
            }}
            confirmDelete
            deleteLabel="Phone Number"
            deleteSubTitle={verifiedPhone.label}
          />
        )}
        {verifiedEmail && (
          <SettingsCard
            icon={<EnvelopeIcon size="sm" />}
            label={verifiedEmail.label}
            isLoading={verifiedEmail.isLoading}
            onDelete={async () => {
              await handleDeleteEmailAddress();
              await refetchMe();
            }}
            confirmDelete
            deleteLabel="Email Address"
            deleteSubTitle={verifiedEmail.label}
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
