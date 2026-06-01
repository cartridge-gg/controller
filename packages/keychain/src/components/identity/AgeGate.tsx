import { useMemo, useState } from "react";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  WarningIcon,
} from "@cartridge/controller-ui";
import { defaultTheme } from "@cartridge/presets";
import { useConnection } from "@/hooks/connection";
import { useRequireAgeVerification } from "@/utils/age-gate";
import { useRouteCompletion } from "@/hooks/route";
import { useIdentityContext } from "./provider";
import { Verification } from "../purchase/verification";

export function AgeGate() {
  const { theme } = useConnection();
  const handleCompletion = useRouteCompletion();
  const { isIdentityVerified } = useIdentityContext();
  const [isVerifying, setIsVerifying] = useState(false);

  const gameName =
    theme.name && theme.name !== defaultTheme.name ? theme.name : "This game";

  const { requiresAgeVerification, minimumAge } = useRequireAgeVerification();

  const passsed = useMemo<boolean | undefined>(() => {
    if (requiresAgeVerification === false) {
      return true;
    }
    return isIdentityVerified;
  }, [requiresAgeVerification, isIdentityVerified]);

  return (
    <>
      <HeaderInner title="Age Restricted" icon={<WarningIcon size="lg" />} />
      <LayoutContent className="p-4 text-sm">
        {isVerifying ? (
          <p className="text-foreground-300">Verifying your identity...</p>
        ) : passsed === true ? (
          <p className="text-foreground-300">You can play {gameName}.</p>
        ) : passsed === false ? (
          <p className="text-foreground-300">
            {gameName} requires you to be at least {minimumAge} years old to
            play.
          </p>
        ) : (
          <>
            <p className="text-foreground-300">
              {gameName} requires you to be at least {minimumAge} years old to
              play.
            </p>
            <p className="text-foreground-300">
              Please verify your identity to continue....
            </p>
          </>
        )}
      </LayoutContent>
      <LayoutFooter>
        {passsed !== true ? (
          <Button
            className="w-full"
            isLoading={isVerifying}
            onClick={() => setIsVerifying(true)}
          >
            Verify Identity
          </Button>
        ) : (
          <Button className="w-full" onClick={handleCompletion}>
            Continue
          </Button>
        )}
      </LayoutFooter>

      <Verification
        method={isVerifying ? "identity" : null}
        onSuccess={() => {}}
        headless
        onClose={() => setIsVerifying(false)}
      />
    </>
  );
}
