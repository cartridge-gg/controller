import { useCallback } from "react";
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

export const UserDataSection = () => {
  const {
    userData,
    isLoadingUserData,
    isVerifying,
    refetchUserData,
    initiateIdentityVerification,
    initiatePhoneNumberVerification,
    initiateEmailVerification,
  } = useIdentityContext();

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
      <div className="space-y-3 flex flex-col">
        {userData.firstName && (
          <SettingsCard
            icon={<UserIcon variant="solid" size="sm" />}
            label={
              <div className="flex flex-col gap-1">
                <span>{`${userData.firstName} ${userData.lastName}`}</span>
                <span>{formatVerifiedAt(userData.dob!, false)}</span>
                {userData.phoneNumber && (
                  <span>{formatPhoneNumber(userData.phoneNumber!)}</span>
                )}
              </div>
            }
            rightText={
              userData.proveVerifiedAt ? (
                formatVerifiedAt(userData.proveVerifiedAt)
              ) : (
                <span className="text-destructive-100">
                  {userData.verificationStatus}
                </span>
              )
            }
            isLoading={isLoading}
            onDelete={async () => {
              await handleDeleteProveIdentity();
              await refetchUserData();
            }}
            confirm="delete"
            confirmLabel="Identity Proof"
          />
        )}
        {userData.phoneNumber && (
          <SettingsCard
            icon={<MobileIcon variant="solid" size="sm" />}
            label={<>{formatPhoneNumber(userData.phoneNumber)}</>}
            rightText={formatVerifiedAt(userData.phoneNumberVerifiedAt!)}
            isLoading={isLoading}
            onDelete={async () => {
              await handleDeletePhoneNumber();
              await refetchUserData();
            }}
            confirm="delete"
            confirmLabel="Phone Number"
            confirmSubTitle={formatPhoneNumber(userData.phoneNumber)}
          />
        )}
        {userData.email && (
          <SettingsCard
            icon={<EnvelopeIcon size="sm" />}
            label={userData.email}
            isLoading={isLoading}
            onDelete={async () => {
              await handleDeleteEmailAddress();
              await refetchUserData();
            }}
            confirm="delete"
            confirmLabel="Email Address"
            confirmSubTitle={userData.email}
          />
        )}
        {!userData.proveVerifiedAt && (
          <Button
            variant="sans"
            onClick={() => initiateIdentityVerification()}
            disabled={!userData.phoneNumberVerifiedAt}
          >
            <PlusIcon size="sm" variant="line" />
            Verify Identity
          </Button>
        )}
        {!userData.phoneNumberVerifiedAt && (
          <Button
            variant="sans"
            onClick={() => initiatePhoneNumberVerification()}
            // disabled={!!userData.phoneNumberVerifiedAt}
          >
            <PlusIcon size="sm" variant="line" />
            Verify Phone Number
          </Button>
        )}
        {!userData.email && (
          <Button variant="sans" onClick={() => initiateEmailVerification()}>
            <PlusIcon size="sm" variant="line" />
            Verify Email
          </Button>
        )}
      </div>
    </section>
  );
};

function formatVerifiedAt(verifiedAt: string, short = true): string {
  const date = new Date(verifiedAt);
  if (Number.isNaN(date.getTime())) return "verified";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: short ? "short" : "long",
    day: "numeric",
  });
}
