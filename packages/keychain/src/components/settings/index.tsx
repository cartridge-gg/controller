import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Button,
  GearIcon,
  SignOutIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
  PlusIcon,
  ClockIcon,
  ShapesIcon,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useState } from "react";
import { Recovery } from "./Recovery";
import { Delegate } from "./Delegate";
import { useConnection } from "@/hooks/connection";
import { Session, SessionCard } from "./session-card";
import { Signer, SignerCard } from "./signer-card";
import {
  RegisteredAccount,
  RegisteredAccountCard,
} from "./registered-account-card";
import { SectionHeader } from "./section-header";
import CurrencySelect from "./currency-select";
import { useSignerQuery } from "@cartridge/utils/api/cartridge";
import { useController } from "@/hooks/controller";

enum State {
  SETTINGS,
  RECOVERY,
  DELEGATE,
}

// MOCK DATA
const signers: Signer[] = [
  {
    deviceType: "mobile",
    deviceName: "Device 1",
  },
  {
    deviceType: "laptop",
    deviceName: "Device 2",
  },
];
const sessions: Session[] = [
  {
    sessionName: "Session 1",
    expiresAt: BigInt(14400), // 4 hours in seconds
  },
  {
    sessionName: "Session 2",
    expiresAt: BigInt(7200), // 2 hours in seconds
  },
];
const registeredAccounts: RegisteredAccount[] = [
  {
    accountName: "clicksave.stark",
    accountAddress: "0x04183183013819381932139812918",
  },
];

export function Settings() {
  const { logout, closeModal } = useConnection();
  const { controller } = useController();
  const [state, setState] = useState<State>(State.SETTINGS);
  const data = useSignerQuery({
    username: controller?.username() as string,
  });

  useEffect(() => {
    console.log("controller username: ", controller?.username());
    console.log("signer data: ", data);
  }, [controller, data]);

  const handleLogout = useCallback(() => {
    logout();
    closeModal();
  }, [logout, closeModal]);

  if (state === State.RECOVERY) {
    return <Recovery onBack={() => setState(State.SETTINGS)} />;
  }

  if (state === State.DELEGATE) {
    return <Delegate onBack={() => setState(State.SETTINGS)} />;
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

        {/* Hide the settings screen until API integration is done */}
        {process.env.NODE_ENV === "development" && (
          <LayoutContent className="gap-6">
            {/* SESSION */}
            <section className="space-y-4">
              <SectionHeader
                title="Session Key(s)"
                description="Sessions grant permission to your Controller to perform certain game actions on your behalf"
                showStatus={true}
              />
              <div className="space-y-3">
                {sessions.map((i) => (
                  <SessionCard
                    sessionName={i.sessionName}
                    expiresAt={i.expiresAt}
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
                  Create Session
                </span>
              </Button>
            </section>

            {/* SIGNER */}
            <section className="space-y-4">
              <SectionHeader
                title="Signer(s)"
                description="Information associated with registered accounts can be made available to games and applications."
              />
              <div className="space-y-3">
                {signers.map((i) => (
                  <SignerCard
                    deviceName={i.deviceName}
                    deviceType={i.deviceType}
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
                  Add Signer
                </span>
              </Button>
            </section>

            {/* REGISTERED ACCOUNT */}
            <section className="space-y-4">
              <SectionHeader
                title="Registered Account"
                description="Information associated with registered accounts can be made available to games and applications."
              />
              <div className="space-y-3">
                {registeredAccounts.map((i) => (
                  <RegisteredAccountCard
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

            {/* CURRENCY */}
            <section className="space-y-4">
              <SectionHeader
                title="Currency"
                description="Set your default currency for denomination"
              />
              <CurrencySelect />
            </section>
          </LayoutContent>
        )}

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
            <ShapesIcon variant="solid" size="lg" />
          </Button>
          <div className="flex flex-col items-start gap-0.5">
            <h3 className="text-lg font-semibold text-foreground-100">
              Log Out
            </h3>
            <div className="flex items-center text-xs font-normal text-foreground-300 gap-1">
              <ClockIcon variant="line" size="xs" />
              <span>Expires in 4h</span>
            </div>
          </div>
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
