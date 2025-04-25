import { useWallets } from "@/hooks/wallets";
import { LayoutContent, LayoutHeader, OptionButton } from "@cartridge/ui-next";
import { useEffect, useMemo, useState } from "react";
import { AuthenticationMethod } from "../types";
import { AuthFactory } from "./auth-option-factory";
import { AuthenticationStep } from "./utils";

interface ChooseSignupMethodProps {
  isSlot?: boolean;
  isLoading: boolean;
  onSubmit: (authenticationMode?: AuthenticationMethod) => void;
  setAuthenticationStep: (value: AuthenticationStep | undefined) => void;
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
      ...wallets.map((wallet) => {
        return AuthFactory.create(wallet.type);
      }),
      AuthFactory.create("social"),
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
          return (
            <OptionButton
              key={option.mode}
              icon={option.icon}
              variant={option.variant}
              onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                if (e.key !== "Enter") {
                  return;
                }
                handleSelectedOption(e, option.mode);
              }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                handleSelectedOption(e, option.mode);
              }}
              disabled={isLoading && selectedAuth !== option.mode}
              type="submit"
              isLoading={isLoading && selectedAuth === option.mode}
              data-testid="submit-button"
            />
          );
        })}
      </LayoutContent>
    </>
  );
}
