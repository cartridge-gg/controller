import { useState } from "react";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  WarningIcon,
} from "@cartridge/controller-ui";
import { defaultTheme } from "@cartridge/presets";
import { useConnection } from "@/hooks/connection";
import { useRouteCompletion } from "@/hooks/route";
import { useRequireAgeVerification } from "@/utils/age-gate";
import { useIdentityContext } from "@/components/identity/provider";
import { Verification } from "@/components/purchase/verification";

export function AgeGate() {
  const { theme } = useConnection();
  const [isVerifying, setIsVerifying] = useState(false);
  const handleCompletion = useRouteCompletion();

  const gameName =
    theme.name && theme.name !== defaultTheme.name ? theme.name : "This game";

  const { minimumAge } = useRequireAgeVerification();
  const {
    ageGateStatus: { isAllowed, isBlocked, isPending },
  } = useIdentityContext();

  return (
    <>
      <HeaderInner title="Age Restricted" icon={<WarningIcon size="lg" />} />
      <LayoutContent className="p-4 text-sm">
        {isAllowed ? (
          <p className="text-foreground-300">You can play {gameName}.</p>
        ) : isBlocked ? (
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
        {isPending ? (
          <Button
            className="w-full"
            isLoading={isVerifying}
            onClick={() => setIsVerifying(true)}
          >
            Verify Identity
          </Button>
        ) : isAllowed ? (
          <Button className="w-full" onClick={handleCompletion}>
            Continue
          </Button>
        ) : null}
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
