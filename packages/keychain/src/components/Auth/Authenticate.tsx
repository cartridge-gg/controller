import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@chakra-ui/react";
import { Unsupported } from "./Unsupported";
import { Credentials, onCreateBegin, onCreateFinalize } from "hooks/account";
import {
  FaceIDDuoIcon,
  FingerprintDuoIcon,
  QRCodeDuoIcon,
} from "@cartridge/ui";
import { Container } from "../Container";
import { PortalBanner } from "components/PortalBanner";
import { PortalFooter } from "components/PortalFooter";
import { dropCookie } from "./utils";

export function Authenticate({
  name,
  onComplete,
}: {
  name: string;
  onComplete: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [userAgent, setUserAgent] = useState<UserAgent>("other");
  const [unsupportedMessage, setUnsupportedMessage] = useState<string>();

  const onAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      await dropCookie();

      const credentials: Credentials = await onCreateBegin(
        decodeURIComponent(name),
      );
      await onCreateFinalize(credentials);

      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      throw e;
    }
  }, [onComplete, name]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      const iosVersion = /OS (\d+)_?(?:\d+_?){0,2}\s/.exec(userAgent);
      if (iosVersion && Number(iosVersion[1]) < 16) {
        setUnsupportedMessage(
          `iOS ${iosVersion[1]} does not support passkeys. Upgrade to iOS 16 to continue`,
        );
      }
      setUserAgent("ios");
    } else if (/android/i.test(userAgent)) {
      setUserAgent("android");
    }
  }, []);

  const Icon = useMemo(() => {
    switch (userAgent) {
      case "ios":
        return FaceIDDuoIcon;
      case "android":
        return QRCodeDuoIcon;
      case "other":
        return FingerprintDuoIcon;
    }
  }, [userAgent]);

  if (unsupportedMessage) {
    return <Unsupported message={unsupportedMessage} />;
  }

  return (
    <>
      <Container hideAccount>
        <PortalBanner
          Icon={Icon}
          title={isLoading ? "Creating Your Account" : "Authenticate Yourself"}
          description={
            isLoading ? (
              <>This window will close automatically</>
            ) : (
              <>
                You will now be asked to authenticate yourself.
                <br />
                Note: this experience varies from browser to browser.
              </>
            )
          }
        />

        <PortalFooter>
          <Button colorScheme="colorful" onClick={onAuth} isLoading={isLoading}>
            continue
          </Button>
        </PortalFooter>
      </Container>
    </>
  );
}

type UserAgent = "ios" | "android" | "other";
