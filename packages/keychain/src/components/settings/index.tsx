import { useNavigation } from "@/context/navigation";
import { useConnection } from "@/hooks/connection";
import { useFeatures } from "@/hooks/features";
import { processControllerQuery } from "@/utils/signers";
import {
  Button,
  ControllerIcon,
  CopyAddress,
  GearIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PlusIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
  SignOutIcon,
} from "@cartridge/ui";
import { useControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { useCallback, useMemo } from "react";
import { constants } from "starknet";
import CurrencySelect from "./currency-select";
import {
  RegisteredAccount,
  RegisteredAccountCard,
} from "./registered-account-card";
import { SectionHeader } from "./section-header";
import { SessionsSection } from "./sessions/sessions-section";
import { SignersSection } from "./signers/signers-section";
import { ConnectionsSection } from "./connections/connections-section";

// Feature flag configuration
interface FeatureFlags {
  signers: boolean;
  connections: boolean;
  registeredAccounts: boolean;
  currency: boolean;
  recovery: boolean;
  delegate: boolean;
}

const registeredAccounts: RegisteredAccount[] = [
  {
    accountName: "clicksave.stark",
    accountAddress: "0x04183183013819381932139812918",
  },
];

export function Settings() {
  const { logout, controller, chainId } = useConnection();
  const { navigate } = useNavigation();
  const { isFeatureEnabled } = useFeatures();

  // Feature flags - connections can be toggled via /feature/connections/enable or /feature/connections/disable
  const featureFlags = useMemo<FeatureFlags>(
    () => ({
      signers: true,
      connections: isFeatureEnabled("connections"),
      registeredAccounts: false,
      currency: false,
      recovery: false,
      delegate: true,
    }),
    [isFeatureEnabled],
  );

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

  const handleLogout = useCallback(() => {
    try {
      logout();
    } catch (error) {
      console.error("Error sending reload message:", error);
    }
  }, [logout]);

  return (
    <Sheet>
      <HeaderInner variant="compressed" title="Settings" Icon={GearIcon} />
      <LayoutContent>
        {featureFlags.signers && (
          <SignersSection controllerQuery={controllerQuery} />
        )}

        {featureFlags.connections && <ConnectionsSection />}

        {featureFlags.recovery && (
          <section className="space-y-4">
            <SectionHeader
              title="Recovery Accounts"
              description="Recovery accounts are Starknet wallets that can be used to recover your Controller if you lose access to your signers."
            />
            <Button
              type="button"
              variant="outline"
              className="py-2.5 px-3 text-foreground-300 gap-1"
              onClick={() => navigate("/settings/recovery")}
            >
              <PlusIcon size="sm" variant="line" />
              <span className="normal-case font-normal font-sans text-sm">
                Add Recovery Account
              </span>
            </Button>
          </section>
        )}

        {/* {featureFlags.delegate && (
          <section className="space-y-4">
            <SectionHeader
              title="Delegate"
              description="Set up delegate account for your controller"
            />
            <Button
              type="button"
              variant="outline"
              className="py-2.5 px-3 text-foreground-300 gap-1"
              onClick={() => navigate("/settings/delegate")}
            >
              <PlusIcon size="sm" variant="line" />
              <span className="normal-case font-normal font-sans text-sm">
                Set Delegate Account
              </span>
            </Button>
          </section>
        )} */}

        {featureFlags.registeredAccounts && (
          <section className="space-y-4">
            <SectionHeader
              title="Registered Account"
              description="Information associated with registered accounts can be made available to games and applications."
            />
            <div className="space-y-3">
              {registeredAccounts.map((i, index) => (
                <RegisteredAccountCard
                  key={index}
                  accountName={i.accountName}
                  accountAddress={i.accountAddress}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="py-2.5 px-3 text-foreground-300 gap-1"
            >
              <PlusIcon size="sm" variant="line" />
              <span className="normal-case font-normal font-sans text-sm">
                Add Account
              </span>
            </Button>
          </section>
        )}

        {featureFlags.currency && (
          <section className="space-y-4">
            <SectionHeader
              title="Currency"
              description="Set your default currency for denomination"
            />
            <CurrencySelect />
          </section>
        )}

        <SessionsSection />
      </LayoutContent>

      <LayoutFooter>
        <SheetTrigger asChild>
          <Button type="button" variant="secondary" className="gap-2">
            <SignOutIcon />
            <span>Log out</span>
          </Button>
        </SheetTrigger>
      </LayoutFooter>

      {/* LOGOUT SHEET CONTENTS */}
      <SheetContent
        side="bottom"
        className="border-background-100 p-6 gap-6 rounded-t-xl"
        showClose={false}
      >
        <div className="flex flex-row items-center gap-3 mb-6">
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="flex items-center justify-center pointer-events-none"
          >
            <ControllerIcon size="lg" />
          </Button>
          {controller && (
            <div className="flex flex-col items-start gap-0.5">
              <h3 className="text-lg font-semibold text-foreground-100">
                {controller.username()}
              </h3>
              <div className="flex items-center text-xs font-normal text-foreground-300 gap-1">
                <CopyAddress
                  size="xs"
                  className="text-sm"
                  address={controller.address()}
                />
              </div>
            </div>
          )}
        </div>
        <SheetFooter className="flex flex-row items-center gap-4">
          <SheetClose asChild className="flex-1">
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button variant="secondary" onClick={handleLogout} className="flex-1">
            <span className="text-destructive-100">Log out</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
