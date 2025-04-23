import { useWallets } from "@/hooks/wallets";
import { LayoutContent, LayoutHeader, OptionButton } from "@cartridge/ui-next";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { AuthenticationMethod } from "../types";
import { AuthFactory } from "./auth-option-factory";
import { AuthenticationStep } from "./useCreateController";

interface ChooseSignupMethodProps {
  isSlot?: boolean;
  isLoading: boolean;
  onSubmit: (authenticationMode?: AuthenticationMethod) => void;
  setAuthenticationStep: (value: AuthenticationStep | undefined) => void;
}

interface AuthOption {
  icon: ReactElement;
  variant: "primary" | "secondary";
  mode: AuthenticationMethod;
}

export function ChooseSignupMethodForm({
  isLoading,
  isSlot,
  onSubmit,
  setAuthenticationStep,
}: ChooseSignupMethodProps) {
  const [selectedAuth, setSelectedAuth] = useState<
    AuthenticationMethod | undefined
  >(undefined);
  const { wallets } = useWallets();

  useEffect(() => {
    if (!isLoading) {
      setSelectedAuth(undefined);
    }
  }, [isLoading]);

  const authOptions = useMemo(() => {
    return [
      AuthFactory.create("webauthn"),
      AuthFactory.create("social"),
      ...wallets.map((wallet) => {
        return AuthFactory.create(wallet.type);
      }),
    ];
  }, [wallets]);

  const handleSelectedOption = (
    e:
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLButtonElement>,
    option: AuthenticationMethod,
  ) => {
    e.preventDefault();
    setSelectedAuth(option);
    onSubmit(option);
  };

  return (
    <>
      <LayoutHeader
        variant="compressed"
        title={"Create account"}
        hideUsername
        hideNetwork={isSlot}
        hideSettings
        description={"Choose a sign in method"}
        onBack={() =>
          !isLoading && setAuthenticationStep(AuthenticationStep.FillForm)
        }
      />
      <LayoutContent className="gap-3 justify-end">
        {authOptions.map((option) => {
          const typedOption = option as AuthOption;
          return (
            <OptionButton
              key={typedOption.mode}
              icon={typedOption.icon}
              variant={typedOption.variant}
              onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                if (e.key !== "Enter") {
                  return;
                }
                handleSelectedOption(e, typedOption.mode);
              }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                handleSelectedOption(e, typedOption.mode);
              }}
              disabled={isLoading && selectedAuth !== typedOption.mode}
              type="submit"
              isLoading={isLoading && selectedAuth === typedOption.mode}
              data-testid="submit-button"
            />
          );
        })}
      </LayoutContent>
    </>
  );
}
