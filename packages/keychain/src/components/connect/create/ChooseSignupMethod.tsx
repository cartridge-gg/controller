import {
  ArgentWallet,
  MetaMaskWallet,
  PhantomWallet,
} from "@cartridge/controller";
import {
  ArgentColorIcon,
  DiscordIcon,
  LayoutContent,
  LayoutHeader,
  MetaMaskColorIcon,
  OptionButton,
  PasskeyIcon,
  PhantomColorIcon,
} from "@cartridge/ui-next";
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
  setAuthenticationMode,
  onSubmit,
}: ChooseSignupMethodProps) {
  const authOptions = [
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
      icon: <DiscordIcon />,
      signupMode: AuthenticationMode.Social,
    },
    {
      handler: new AlwaysAvailableAuth("webauthn"),
      variant: "primary" as const,
      icon: <PasskeyIcon />,
      signupMode: AuthenticationMode.Webauthn,
    },
  ];

  return (
    <>
      <LayoutHeader
        variant="expanded"
        title={"Create account"}
        hideUsername
        hideNetwork={isSlot}
        hideSettings
        description={"Choose a sign in method"}
        onBack={() => setAuthenticationMode(undefined)}
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
                  onSubmit(option.signupMode);
                }}
                type="submit"
                isLoading={isLoading}
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
