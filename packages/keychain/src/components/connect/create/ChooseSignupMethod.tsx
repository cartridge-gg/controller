import {
  ArgentWallet,
  MetaMaskWallet,
  PhantomWallet,
} from "@cartridge/controller";
import {
  ArgentColorIcon,
  DiscordColorIcon,
  LayoutContent,
  LayoutHeader,
  MetaMaskColorIcon,
  OptionButton,
  PasskeyIcon,
  PhantomColorIcon,
} from "@cartridge/ui-next";
import { useEffect, useState } from "react";
import { AuthenticationMode } from "../types";

interface ChooseSignupMethodProps {
  isSlot?: boolean;
  isLoading: boolean;
  onSubmit: (authenticationMode?: AuthenticationMode) => void;
  setAuthenticationMode: (value: AuthenticationMode | undefined) => void;
}

export function ChooseSignupMethod({
  isLoading,
  isSlot,
  onSubmit,
  setAuthenticationMode,
}: ChooseSignupMethodProps) {
  const [selectedAuth, setSelectedAuth] = useState<
    AuthenticationMode | undefined
  >(undefined);

  useEffect(() => {
    if (!isLoading) {
      setSelectedAuth(undefined);
    }
  }, [isLoading]);

  const authOptions = [
    {
      handler: new AlwaysAvailableAuth("webauthn"),
      variant: "primary" as const,
      icon: <PasskeyIcon />,
      signupMode: AuthenticationMode.Webauthn,
    },
    {
      handler: new MetaMaskWallet(),
      variant: "secondary" as const,
      icon: <MetaMaskColorIcon />,
      signupMode: AuthenticationMode.MetaMask,
    },
    {
      handler: new PhantomWallet(),
      variant: "secondary" as const,
      icon: <PhantomColorIcon />,
      signupMode: AuthenticationMode.Phantom,
    },
    {
      handler: new ArgentWallet(),
      variant: "secondary" as const,
      icon: <ArgentColorIcon />,
      signupMode: AuthenticationMode.Argent,
    },
    {
      handler: new AlwaysAvailableAuth("social"),
      variant: "secondary" as const,
      icon: <DiscordColorIcon />,
      signupMode: AuthenticationMode.Social,
    },
  ];

  return (
    <>
      <LayoutHeader
        variant="compressed"
        title={"Create account"}
        hideUsername
        hideNetwork={isSlot}
        hideSettings
        description={"Choose a sign in method"}
        onBack={() => !isLoading && setAuthenticationMode(undefined)}
      />
      <LayoutContent className="gap-3 justify-end">
        {authOptions.map(
          (option) =>
            option.handler.isAvailable() && (
              <OptionButton
                key={option.handler.type}
                icon={option.icon}
                variant={option.variant}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  setSelectedAuth(option.signupMode);
                  onSubmit(option.signupMode);
                }}
                disabled={isLoading && selectedAuth !== option.signupMode}
                type="submit"
                isLoading={isLoading && selectedAuth === option.signupMode}
                data-testid="submit-button"
              />
            ),
        )}
      </LayoutContent>
    </>
  );
}

class AlwaysAvailableAuth {
  constructor(public type: string) {}
  isAvailable() {
    return true;
  }
}
