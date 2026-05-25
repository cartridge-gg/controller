import { useCallback, useMemo } from "react";
import {
  Button,
  EnvelopeIcon,
  formatPhoneNumber,
  MobileIcon,
  PlusIcon,
  SectionHeader,
  SettingsCard,
  UserIcon,
} from "@cartridge/controller-ui";
import {
  useDeleteEmailAddressMutation,
  useDeletePhoneNumberMutation,
  useDeleteProveIdentityMutation,
} from "@/utils/api";
import { useIdentityContext } from "@/components/identity/provider";

type VerifiedData = {
  label: string;
  verifiedAt: string;
  canDelete: boolean;
};

export const UserDataSection = () => {
  const {
    userData,
    isLoadingUserData,
    isVerifying,
    refetchUserData,
    initiateIdentityVerification,
    initiatePhoneNumberVerification,
  } = useIdentityContext();

  const verifiedIdentity = useMemo<VerifiedData | null>(() => {
    if (
      userData.firstName &&
      userData.lastName &&
      userData.dob &&
      userData.proveVerifiedAt
    ) {
      return {
        label: `${userData.firstName} ${userData.lastName}, ${userData.age}yo`,
        verifiedAt: userData.proveVerifiedAt,
        canDelete: true,
      };
    }
    return null;
  }, [userData]);

  const verifiedPhoneNumber = useMemo<VerifiedData | null>(() => {
    if (
      userData.phoneNumber &&
      (userData.phoneNumberVerifiedAt || userData.proveVerifiedAt)
    ) {
      return {
        label: formatPhoneNumber(userData.phoneNumber),
        verifiedAt:
          userData.phoneNumberVerifiedAt || userData.proveVerifiedAt || "",
        canDelete: !!userData.phoneNumberVerifiedAt,
      };
    }
    return null;
  }, [userData]);

  const verifiedEmail = useMemo<VerifiedData | null>(() => {
    if (userData.email) {
      return {
        label: userData.email,
        verifiedAt: "",
        canDelete: true,
      };
    }
    return null;
  }, [userData]);

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

  const isLoading = isLoadingUserData || isVerifying;

  return (
    <section className="space-y-4">
      <SectionHeader
        kind="user-data"
        showStatus={false}
        isLoading={isLoading}
      />
      <div className="space-y-3">
        {verifiedIdentity && (
          <SettingsCard
            icon={<UserIcon variant="solid" size="sm" />}
            label={verifiedIdentity.label}
            rightText={formatVerifiedAt(verifiedIdentity.verifiedAt)}
            isLoading={isLoading}
            onDelete={
              verifiedIdentity.canDelete
                ? async () => {
                    await handleDeleteProveIdentity();
                    await refetchUserData();
                  }
                : undefined
            }
            confirm="delete"
            confirmLabel="Identity Proof"
          />
        )}
        {verifiedPhoneNumber && (
          <SettingsCard
            icon={<MobileIcon variant="solid" size="sm" />}
            label={verifiedPhoneNumber.label}
            rightText={formatVerifiedAt(verifiedPhoneNumber.verifiedAt)}
            isLoading={isLoading}
            onDelete={
              verifiedPhoneNumber.canDelete
                ? async () => {
                    await handleDeletePhoneNumber();
                    await refetchUserData();
                  }
                : undefined
            }
            confirm="delete"
            confirmLabel="Phone Number"
            confirmSubTitle={verifiedPhoneNumber.label}
          />
        )}
        {verifiedEmail && (
          <SettingsCard
            icon={<EnvelopeIcon size="sm" />}
            label={verifiedEmail.label}
            isLoading={isLoading}
            onDelete={
              verifiedEmail.canDelete
                ? async () => {
                    await handleDeleteEmailAddress();
                    await refetchUserData();
                  }
                : undefined
            }
            confirm="delete"
            confirmLabel="Email Address"
            confirmSubTitle={verifiedEmail.label}
          />
        )}
        {!verifiedIdentity && (
          <Button
            variant="sans"
            className="px-3"
            onClick={() => initiateIdentityVerification()}
            disabled={!!verifiedIdentity}
          >
            <PlusIcon size="sm" variant="line" />
            Verify Identity
          </Button>
        )}
        {!verifiedPhoneNumber && (
          <Button
            variant="sans"
            className="px-3"
            onClick={() => initiatePhoneNumberVerification()}
            disabled={!!verifiedPhoneNumber}
          >
            <PlusIcon size="sm" variant="line" />
            Verify Phone Number
          </Button>
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
