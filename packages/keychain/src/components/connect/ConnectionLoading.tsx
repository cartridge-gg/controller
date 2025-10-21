import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
  Spinner,
} from "@cartridge/ui";
import { AuthOption } from "@cartridge/controller";
import { getAuthMethodDisplayName, getAuthMethodIcon } from "@/utils/auth";
import { Link } from "react-router-dom";
import { useMemo } from "react";

interface ConnectionLoadingProps {
  isNew?: boolean;
  authMethod?: AuthOption;
  fallbackUrl?: string;
}

export function ConnectionLoading({
  isNew,
  authMethod,
  fallbackUrl,
}: ConnectionLoadingProps) {
  const authDisplay = getAuthMethodDisplayName(authMethod);

  return (
    <LayoutContainer>
      <LayoutHeader
        title={`${isNew ? "Sign Up" : "Log In"} with ${authDisplay}`}
        icon={<Spinner />}
        hideUsername
        hideSettings
        onBack={() => {}}
      />
      <LayoutContent className="gap-4">
        <SignerPendingCard authMethod={authMethod} fallbackUrl={fallbackUrl} />
      </LayoutContent>
    </LayoutContainer>
  );
}

const SignerPendingCard = ({
  authMethod,
  fallbackUrl,
}: ConnectionLoadingProps) => {
  const authDisplay = getAuthMethodDisplayName(authMethod);
  const AuthIcon = getAuthMethodIcon(authMethod);

  const isWallet = useMemo(() => {
    return (
      authMethod === "metamask" ||
      authMethod === "argent" ||
      authMethod === "rabby" ||
      authMethod === "phantom" ||
      authMethod === "walletconnect"
    );
  }, [authMethod]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4 gap-4 rounded border border-background-200">
      <div className="flex items-center gap-2.5 p-2 rounded-full border border-background-200">
        {AuthIcon && <AuthIcon size="xl" />}
      </div>
      <div className="flex flex-col items-center gap-2 self-stretch">
        <p className="text-foreground-200 text-center text-sm font-medium">
          {`Connecting to ${authDisplay}...`}
        </p>
        {isWallet ? (
          <p className="text-foreground-400 text-center text-sm font-normal">
            Don’t see your wallet? check your other browser windows
          </p>
        ) : (
          <Link
            to={fallbackUrl ?? "#"}
            className="text-foreground-400 hover:text-foreground-300 text-center text-sm font-normal"
          >
            Continue in the other window
          </Link>
        )}
      </div>
    </div>
  );
};
