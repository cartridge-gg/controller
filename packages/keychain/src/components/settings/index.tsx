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
} from "@cartridge/ui-next";
import { useCallback, useState } from "react";
import { Recovery } from "./Recovery";
import { Delegate } from "./Delegate";
import { Status } from "./status";
import { useConnection } from "@/hooks/connection";
import { SessionCard } from "./session-card";
import { SignerCard } from "./signer-card";

enum State {
  SETTINGS,
  RECOVERY,
  DELEGATE,
}

export function Settings() {
  const { logout, closeModal } = useConnection();
  const [state, setState] = useState<State>(State.SETTINGS);

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
          title="Controller Settings"
          Icon={GearIcon}
          hideSettings
        />
        {process.env.NODE_ENV === "development" && (
          <LayoutContent className="gap-6">
            {/* SESSION */}
            <section className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-row items-center justify-between">
                  <h1 className="text-foreground-200 text-sm font-medium">
                    Session Key(s)
                  </h1>
                  <Status isActive={false} />
                </div>
                <p className="text-foreground-300 text-sm font-normal">
                  Sessions grant permission to your Controller to perform
                  certain game actions on your behalf
                </p>
              </div>

              <div className="space-y-3">
                {Array.from([1, 2]).map((i) => (
                  <SessionCard sessionName={`Session ${i}`} />
                ))}
              </div>
              <Button
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
              <div className="space-y-2">
                <h1 className="text-foreground-200 text-sm font-medium">
                  Signer(s)
                </h1>
                <p className="text-foreground-300 text-sm font-normal">
                  Information associated with registered accounts can be made
                  available to games and applications.
                </p>
              </div>

              <div className="space-y-3">
                {Array.from([1, 2]).map((i) => (
                  <SignerCard
                    deviceName={`Device ${i}`}
                    deviceType={i % 2 === 0 ? "laptop" : "mobile"}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                className="py-2.5 px-3 text-foreground-300 gap-1"
              >
                <PlusIcon size="sm" variant="line" />
                <span className="normal-case font-normal font-sans text-sm">
                  Add Signer
                </span>
              </Button>
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

        <SheetContent
          side="bottom"
          className="border-background-100 p-6 gap-6 rounded-t-xl"
          showClose={false}
        >
          <div className="flex flex-row items-center gap-3 mb-6">
            <Button
              variant="icon"
              size="icon"
              className="flex items-center justify-center"
            >
              <SignOutIcon size="lg" />
            </Button>
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold text-foreground-100">
                Log Out
              </h3>
              <p className="text-xs font-normal text-foreground-300">
                Are you sure?
              </p>
            </div>
          </div>
          <SheetFooter className="flex flex-row items-center gap-4">
            <SheetClose asChild className="flex-1">
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="flex-1"
            >
              <span className="text-destructive-100">Log out</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </LayoutContainer>
    </Sheet>
  );
}
