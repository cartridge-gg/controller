import { useWallets } from "@/hooks/wallets";
import { OptionButton, SheetContent, SheetTitle } from "@cartridge/ui-next";
import { useEffect, useMemo, useState } from "react";
import { AuthenticationMethod } from "../types";
import { AuthFactory } from "./auth-option-factory";

interface ChooseSignupMethodProps {
  isSlot?: boolean;
  isLoading: boolean;
  onSubmit: (authenticationMode?: AuthenticationMethod) => void;
}

export function ChooseSignupMethodForm({
  isLoading,
  onSubmit,
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

  const passkeyOption = AuthFactory.create("webauthn");

  const authOptions = useMemo(() => {
    return [
      ...wallets
        .filter(
          (wallet) => wallet.type !== "argent" && wallet.type !== "phantom",
        )
        .map((wallet) => AuthFactory.create(wallet.type)),
      AuthFactory.create("social"),
    ];
  }, [wallets]);

  const handleSelectedOption = (
    e:
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLButtonElement>,
    option: AuthenticationMethod,
  ) => {
    if (
      e.type === "keydown" &&
      (e as React.KeyboardEvent<HTMLButtonElement>).key !== "Enter"
    ) {
      return;
    }
    e.preventDefault();
    setSelectedAuth(option);
    onSubmit(option);
  };

  return (
    <SheetContent
      side="bottom"
      className="flex flex-col bg-spacer-100 w-fill h-fit justify-end p-6 gap-4 border-t-0 rounded-tl-[16px] rounded-tr-[16px]"
      showClose={false}
    >
      <SheetTitle className="hidden"></SheetTitle>
      <div className="border-b border-background-125 pb-4">
        <OptionButton
          {...passkeyOption}
          className="justify-center"
          onClick={(e) => handleSelectedOption(e, passkeyOption.mode)}
          onKeyDown={(e) => handleSelectedOption(e, passkeyOption.mode)}
        />
      </div>
      <div className="flex flex-col gap-3">
        {authOptions.map((option) => (
          <OptionButton
            key={option.mode}
            {...option}
            className="justify-start"
            onKeyDown={(e) => handleSelectedOption(e, option.mode)}
            onClick={(e) => handleSelectedOption(e, option.mode)}
            disabled={isLoading && selectedAuth !== option.mode}
            isLoading={isLoading && selectedAuth === option.mode}
          />
        ))}
      </div>
    </SheetContent>
  );
}
