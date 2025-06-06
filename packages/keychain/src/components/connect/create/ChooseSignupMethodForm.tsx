import { AuthOption } from "@cartridge/controller";
import { SheetContent, SheetTitle } from "@cartridge/ui";
import { useEffect, useState } from "react";
import { SignupButton } from "../buttons/signup-button";

interface ChooseSignupMethodProps {
  isLoading: boolean;
  onSubmit: (authenticationMode?: AuthOption) => void;
  signupOptions: AuthOption[];
}

export function ChooseSignupMethodForm({
  isLoading,
  onSubmit,
  signupOptions,
}: ChooseSignupMethodProps) {
  const [selectedAuth, setSelectedAuth] = useState<AuthOption | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!isLoading) {
      setSelectedAuth(undefined);
    }
  }, [isLoading]);

  const handleInteractOutside = (
    event: CustomEvent<{ originalEvent: Event }>,
  ) => {
    const overlayElement = document.getElementById("wallet-connect-overlay");
    if (overlayElement && overlayElement.contains(event.target as Node)) {
      event.preventDefault();
    }
  };

  const handleSelectedOption = (
    e:
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLButtonElement>,
    option: AuthOption,
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
      onInteractOutside={handleInteractOutside}
    >
      <SheetTitle className="hidden"></SheetTitle>
      {signupOptions.includes("webauthn") && (
        <div className="border-b border-background-125 pb-4">
          <SignupButton
            authMethod="webauthn"
            className="justify-center"
            onClick={(e) => handleSelectedOption(e, "webauthn")}
            onKeyDown={(e) => handleSelectedOption(e, "webauthn")}
            disabled={isLoading && selectedAuth !== "webauthn"}
            isLoading={isLoading && selectedAuth === "webauthn"}
          />
        </div>
      )}
      <div className="flex flex-col gap-3">
        {signupOptions
          .filter((option) => option !== "webauthn")
          .map((option) => (
            <SignupButton
              authMethod={option}
              key={option}
              className="justify-start"
              onKeyDown={(e) => handleSelectedOption(e, option)}
              onClick={(e) => handleSelectedOption(e, option)}
              disabled={isLoading && selectedAuth !== option}
              isLoading={isLoading && selectedAuth === option}
            />
          ))}
      </div>
    </SheetContent>
  );
}
