import { useCallback, useState } from "react";
import { useConnection } from "@/hooks/connection";
import { processControllerQuery } from "@/utils/signers";
import {
  Button,
  DeleteConfirmation,
  GearIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  SignOutIcon,
} from "@cartridge/controller-ui";
import { useControllerQuery } from "@cartridge/controller-ui/utils/api/cartridge";
import { constants } from "starknet";
import { SessionsSection } from "./sessions/sessions-section";
import { SignersSection } from "./signers/signers-section";
import { ConnectionsSection } from "./connections/connections-section";
import { RecoveryAccountSection } from "./recovery/recovery-section";
// import { DelegateAccountSection } from "./delegate-account-section";
import { RegisteredAccountSection } from "./registered-account-section";
import { CurrencySection } from "./currency-section";
import { UserDataSection } from "./user-data-section";
import { DeleteAccountSection } from "./delete-account-section";
import { useFeature } from "@/hooks/features";

export function Settings() {
  const { logout, controller, chainId } = useConnection();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const isRegisteredAccountsEnabled = useFeature("registered-accounts");
  const isRecoveryAccountsEnabled = useFeature("recovery-accounts");

  const controllerQuery = useControllerQuery(
    {
      username: controller?.username() ?? "",
      chainId: constants.NetworkName.SN_MAIN,
    },
    {
      refetchOnMount: "always",
      select: (data) => processControllerQuery(data, chainId ?? ""),
      enabled: !!chainId,
      queryKey: ["controller", controller?.username(), chainId],
    },
  );

  const handleLogout = useCallback(async () => {
    logout();
  }, [logout]);

  return (
    <>
      <HeaderInner
        className="pb-2"
        variant="compressed"
        title="Settings"
        Icon={GearIcon}
      />
      <LayoutContent>
        <SessionsSection />

        <SignersSection controllerQuery={controllerQuery} />

        <ConnectionsSection />

        {isRecoveryAccountsEnabled && <RecoveryAccountSection />}

        {/* {featureFlags.delegate && <DelegateAccountSection />} */}

        {isRegisteredAccountsEnabled && <RegisteredAccountSection />}

        <UserDataSection />

        <CurrencySection />

        <DeleteAccountSection />
      </LayoutContent>

      <LayoutFooter className="pt-2">
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={() => setIsLogoutOpen(true)}
        >
          <SignOutIcon />
          <span>Log out</span>
        </Button>
      </LayoutFooter>

      <DeleteConfirmation
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        label={controller?.username() ?? ""}
        kind="logout"
      />
    </>
  );
}
