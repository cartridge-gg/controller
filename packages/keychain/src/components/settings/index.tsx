import { useConnection } from "@/hooks/connection";
import {
  Button,
  ControllerIcon,
  CopyAddress,
  GearIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  PlusIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
  SignOutIcon,
} from "@cartridge/ui";
import {
  ControllerQuery,
  useControllerQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback, useMemo, useState } from "react";
import { QueryObserverResult } from "react-query";
import { constants } from "starknet";
import CurrencySelect from "./currency-select";
import { Delegate } from "./Delegate";
import { Recovery } from "./Recovery";
import {
  RegisteredAccount,
  RegisteredAccountCard,
} from "./registered-account-card";
import { SectionHeader } from "./section-header";
import { SessionsSection } from "./sessions/sessions-section";
import { AddSigner } from "./signers/add-signer/add-signer";
import { SignersSection } from "./signers/signers-section";

export enum State {
  SETTINGS,
  RECOVERY,
  DELEGATE,
  ADD_SIGNER,
}

// Feature flag configuration
interface FeatureFlags {
  signers: boolean;
  registeredAccounts: boolean;
  currency: boolean;
}

const registeredAccounts: RegisteredAccount[] = [
  {
    accountName: "clicksave.stark",
    accountAddress: "0x04183183013819381932139812918",
  },
];

export function Settings() {
  const { logout, controller, chainId } = useConnection();
  const [state, setState] = useState<State>(State.SETTINGS);

  // Feature flags - can be moved to environment variables or API config later
  const featureFlags = useMemo<FeatureFlags>(
    () => ({
      signers: true,
      registeredAccounts: false,
      currency: false,
    }),
    [],
  );

  const controllerQueryRaw = useControllerQuery(
    {
      username: controller?.username() ?? "",
      chainId: constants.NetworkName.SN_MAIN,
    },
    {
      refetchOnMount: "always",
    },
  );

  const controllerQuery = useMemo(() => {
    if (chainId === constants.StarknetChainId.SN_MAIN) {
      return controllerQueryRaw;
    }
    return {
      ...controllerQueryRaw,
      data: {
        controller: {
          ...controllerQueryRaw.data?.controller,
          signers: controllerQueryRaw.data?.controller?.signers
            ? [controllerQueryRaw.data?.controller?.signers[0]]
            : undefined,
        },
        ...controllerQueryRaw.data,
      },
    } as QueryObserverResult<ControllerQuery>;
  }, [chainId, controllerQueryRaw.data]);

  const handleLogout = useCallback(() => {
    try {
      logout();
    } catch (error) {
      console.error("Error sending reload message:", error);
    }
  }, [logout]);

  if (state === State.RECOVERY) {
    return <Recovery onBack={() => setState(State.SETTINGS)} />;
  }

  if (state === State.DELEGATE) {
    return <Delegate onBack={() => setState(State.SETTINGS)} />;
  }

  if (state === State.ADD_SIGNER) {
    return (
      <AddSigner
        onBack={() => setState(State.SETTINGS)}
        controllerQuery={controllerQuery}
      />
    );
  }

  return (
    <Sheet>
      <LayoutContainer>
        <LayoutHeader
          variant="compressed"
          title="Settings"
          Icon={GearIcon}
          hideSettings
        />

        <LayoutContent className="gap-6">
          {featureFlags.signers && (
            <SignersSection
              setState={setState}
              controllerQuery={controllerQuery}
            />
          )}

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

          <SessionsSection controllerQuery={controllerQuery} />
        </LayoutContent>

        <LayoutFooter>
          <SheetTrigger asChild>
            <Button type="button" variant="secondary" className="gap-2">
              <SignOutIcon />
              <span>Log out</span>
            </Button>
          </SheetTrigger>
        </LayoutFooter>
      </LayoutContainer>

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
