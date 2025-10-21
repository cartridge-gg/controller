import {
  CheckIcon,
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@cartridge/ui";
import { AuthOption } from "@cartridge/controller";
import { getAuthMethodDisplayName, getAuthMethodIcon } from "@/utils/auth";

interface ConnectionSuccessProps {
  isNew?: boolean;
  authMethod?: AuthOption;
}

export function ConnectionSuccess({
  isNew,
  authMethod,
}: ConnectionSuccessProps) {
  const authDisplay = getAuthMethodDisplayName(authMethod);

  return (
    <LayoutContainer>
      <LayoutHeader
        title={`${isNew ? "Sign Up" : "Log In"} with ${authDisplay}`}
        icon={<CheckIcon />}
        hideUsername
        hideSettings
        onBack={() => {}}
      />
      <LayoutContent className="gap-4">
        <SignerPendingCard authMethod={authMethod} />
      </LayoutContent>
    </LayoutContainer>
  );
}

const SignerPendingCard = ({ authMethod }: ConnectionSuccessProps) => {
  const authDisplay = getAuthMethodDisplayName(authMethod);
  const AuthIcon = getAuthMethodIcon(authMethod);

  return (
    <div className="w-full flex flex-col items-center justify-center p-10 gap-4 rounded border border-background-200">
      <div className="flex items-center gap-2.5 p-2 rounded-full border border-background-200">
        {AuthIcon && <AuthIcon size="xl" />}
      </div>
      <div className="flex flex-col items-center gap-2 self-stretch">
        <p className="text-foreground-200 text-center text-sm font-medium">
          Success!
        </p>
        <p className="text-foreground-400 text-center text-sm font-normal">
          {authDisplay.toLowerCase() === "passkey"
            ? "Authentication Complete"
            : `${authDisplay} Connected`}
        </p>
      </div>
    </div>
  );
};
