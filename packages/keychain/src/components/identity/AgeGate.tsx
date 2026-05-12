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
import { VerifyIdentityDrawer } from "./VerifyIdentityDrawer";

export function AgeGate() {
  const { theme } = useConnection();
  const handleCompletion = useRouteCompletion();
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  const gameName =
    theme.name && theme.name !== defaultTheme.name ? theme.name : "This game";

  const { requiresAgeVerification, minimumAge } = useRequireAgeVerification();

  const [verified, setVerified] = useState<boolean | undefined>(undefined);

  const passsed: boolean | undefined = useMemo(() => {
    if (requiresAgeVerification === false) {
      return true;
    }
    return verified;
  }, [requiresAgeVerification, verified]);

  return (
    <>
      <HeaderInner title="Age Restricted" icon={<WarningIcon size="lg" />} />
      <LayoutContent className="p-4 text-sm">
        {isVerifyOpen ? (
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
        {passsed === undefined ? (
          <>
            <Button
              className="w-full"
              onClick={() => setIsVerifyOpen(true)}
              disabled={isVerifyOpen}
            >
              Verify Identity
            </Button>

            <VerifyIdentityDrawer
              isOpen={isVerifyOpen}
              onClose={() => setIsVerifyOpen(false)}
              onVerified={setVerified}
            />
          </>
        ) : (
          <Button
            className="w-full"
            disabled={!passsed}
            onClick={handleCompletion}
          >
            Continue
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}
