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
  Skeleton,
} from "@cartridge/ui";
import {
  CredentialMetadata,
  useControllerQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback, useMemo, useState } from "react";
import { constants } from "starknet";
import CurrencySelect from "./currency-select";
import { Delegate } from "./Delegate";
import { Recovery } from "./Recovery";
import {
  RegisteredAccount,
  RegisteredAccountCard,
} from "./registered-account-card";
import { SectionHeader } from "./section-header";
import { Session, SessionCard } from "./session-card";
import { SignerCard } from "./signer-card";

enum State {
  SETTINGS,
  RECOVERY,
  DELEGATE,
}

// Feature flag configuration
interface FeatureFlags {
  sessions: boolean;
  signers: boolean;
  registeredAccounts: boolean;
  currency: boolean;
}

// MOCK DATA
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

// TODO(tedison): Add signer address
export function Settings() {
  const { logout, controller } = useConnection();
  const [state, setState] = useState<State>(State.SETTINGS);

  // Feature flags - can be moved to environment variables or API config later
  const featureFlags = useMemo<FeatureFlags>(
    () => ({
      sessions: false,
      signers: true,
      registeredAccounts: false,
      currency: false,
    }),
    [],
  );

  const data = useControllerQuery({
    username: controller?.username() ?? "",
    chainId: constants.NetworkName.SN_MAIN,
  });

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
          {/* SESSION */}
          {featureFlags.sessions && (
            <section className="space-y-4">
              <SectionHeader
                title="Session Key(s)"
                description="Sessions grant permission to your Controller to perform certain game actions on your behalf"
                showStatus={true}
              />
              <div className="space-y-3">
                {sessions.map((i, index) => (
                  <SessionCard
                    key={index}
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
          )}

          {/* SIGNER */}
          {featureFlags.signers && (
            <section className="space-y-4">
              <SectionHeader
                title="Signer(s)"
                description="Information associated with registered accounts can be made available to games and applications."
              />
              <div className="space-y-3">
                {data.isLoading ? (
                  <Skeleton className="w-full h-10 bg-background-200" />
                ) : data.isError ? (
                  <div>Error</div>
                ) : data.isSuccess && data.data ? (
                  data.data?.controller?.signers?.map((i, signerIndex) => {
                    return (
                      <SignerCard
                        key={`${signerIndex}`}
                        signer={i.metadata as CredentialMetadata}
                      />
                    );
                  })
                ) : (
                  <div>No data</div>
                )}
              </div>
              {/* disabled until add signer functionality is implemented */}
              {/* <Button */}
              {/*   type="button" */}
              {/*   variant="outline" */}
              {/*   className="py-2.5 px-3 text-foreground-300 gap-1" */}
              {/* > */}
              {/*   <PlusIcon size="sm" variant="line" /> */}
              {/*   <span className="normal-case font-normal font-sans text-sm"> */}
              {/*     Add Signer */}
              {/*   </span> */}
              {/* </Button> */}
            </section>
          )}

          {/* REGISTERED ACCOUNT */}
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

          {/* CURRENCY */}
          {featureFlags.currency && (
            <section className="space-y-4">
              <SectionHeader
                title="Currency"
                description="Set your default currency for denomination"
              />
              <CurrencySelect />
            </section>
          )}
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
