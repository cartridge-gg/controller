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
import { SignupMode } from "../types";

interface ChooseSignupMethodProps {
  usernameField: {
    value: string;
    error?: Error;
  };
  isSlot?: boolean;
  isLoading: boolean;
  error?: Error;
  handleSignup: (username: string, signupMethod: SignupMode) => void;
  setSelectSignupMethod: (value: boolean) => void;
}

export function ChooseSignupMethod({
  usernameField,
  isLoading,
  isSlot,
  handleSignup,
  setSelectSignupMethod,
}: ChooseSignupMethodProps) {
  const wallets = [
    {
      handler: new MetaMaskWallet(),
      icon: <MetaMaskColorIcon />,
      signupMode: SignupMode.MetaMask,
    },
    {
      handler: new PhantomWallet(),
      icon: <PhantomColorIcon />,
      signupMode: SignupMode.Phantom,
    },
    {
      handler: new ArgentWallet(),
      icon: <ArgentColorIcon />,
      signupMode: SignupMode.Argent,
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
        onBack={() => setSelectSignupMethod(false)}
      />
      <LayoutContent className="gap-3 justify-end">
        {wallets.map(
          (wallet) =>
            wallet.handler.isAvailable() && (
              <OptionButton
                key={wallet.handler.type}
                icon={wallet.icon}
                variant="secondary"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  handleSignup(usernameField.value, wallet.signupMode);
                }}
                type="submit"
                isLoading={isLoading}
                data-testid="submit-button"
              />
            ),
        )}
        <OptionButton
          icon={<DiscordIcon />}
          variant="secondary"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            handleSignup(usernameField.value, SignupMode.Social);
          }}
          type="submit"
          isLoading={isLoading}
          data-testid="submit-button"
        />
        <OptionButton
          icon={<PasskeyIcon />}
          variant="primary"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            handleSignup(usernameField.value, SignupMode.Webauthn);
          }}
          type="submit"
          isLoading={isLoading}
          data-testid="submit-button"
        />
      </LayoutContent>
    </>
  );
}
