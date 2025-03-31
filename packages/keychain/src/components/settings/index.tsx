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
  Skeleton,
} from "@cartridge/ui-next";
import { useCallback, useState, useMemo } from "react";
import { Recovery } from "./Recovery";
import { Delegate } from "./Delegate";
import { useConnection } from "@/hooks/connection";
import { SessionCard } from "./session-card";
import { SignerCard } from "./signer-card";
import {
  RegisteredAccount,
  RegisteredAccountCard,
} from "./registered-account-card";
import { SectionHeader } from "./section-header";
import CurrencySelect from "./currency-select";
import { useSignerQuery } from "@cartridge/utils/api/cartridge";
import { useSessionQuery } from "@cartridge/utils/api/cartridge";

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
const registeredAccounts: RegisteredAccount[] = [
  {
    accountName: "clicksave.stark",
    accountAddress: "0x04183183013819381932139812918",
  },
];

export function Settings() {
  const { logout, closeModal, controller } = useConnection();
  const [state, setState] = useState<State>(State.SETTINGS);

  const controllerUsername = controller?.username() as string;

  // Feature flags - can be moved to environment variables or API config later
  const featureFlags = useMemo<FeatureFlags>(
    () => ({
      sessions: true,
      signers: true,
      registeredAccounts: false,
      currency: false,
    }),
    [],
  );
  const signerQuery = useSignerQuery(
    {
      username: controllerUsername,
    },
    {
      enabled: featureFlags.signers,
    },
  );

  const sessionQuery = useSessionQuery(
    {
      username: controllerUsername,
    },
    {
      enabled: featureFlags.sessions,
      onSuccess: (data) => {
        console.log("sessions from graphql: ", data);
      },
    },
  );

  const handleLogout = useCallback(() => {
    logout(controllerUsername);
    closeModal();
  }, [logout, closeModal, controllerUsername]);

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
                {sessionQuery.isLoading ? (
                  <Skeleton className="w-full h-10 bg-background-200" />
                ) : sessionQuery.isError ? (
                  <div>Error</div>
                ) : sessionQuery.isSuccess && sessionQuery.data ? (
                  sessionQuery.data?.account?.activities?.edges?.map(
                    (i, index) => {
                      return (
                        <SessionCard
                          key={index}
                          sessionName={i?.node?.session?.appID || "Unknown"}
                          expiresAt={BigInt(i?.node?.session?.expiresAt || 0)}
                        />
                      );
                    },
                  )
                ) : (
                  <div>No data</div>
                )}
              </div>
              {/* disabled until add session functionality is implemented */}
              {/* <Button */}
              {/*   type="button" */}
              {/*   variant="outline" */}
              {/*   className="py-2.5 px-3 text-foreground-300 gap-1" */}
              {/* > */}
              {/*   <PlusIcon size="sm" variant="line" /> */}
              {/*   <span className="normal-case font-normal font-sans text-sm"> */}
              {/*     Create Session */}
              {/*   </span> */}
              {/* </Button> */}
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
                {signerQuery.isLoading ? (
                  <Skeleton className="w-full h-10 bg-background-200" />
                ) : signerQuery.isError ? (
                  <div>Error</div>
                ) : signerQuery.isSuccess && signerQuery.data ? (
                  signerQuery.data?.account?.controllers.edges?.map(
                    (i, edgeIndex) =>
                      i?.node?.signers?.map((j, signerIndex) => {
                        return (
                          <SignerCard
                            key={`${edgeIndex}-${signerIndex}`}
                            signerType={j.type}
                          />
                        );
                      }),
                  )
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
