import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@chakra-ui/react";
import { Unsupported } from "./Unsupported";
import { doSignup } from "hooks/account";
import {
  FaceIDDuoIcon,
  FingerprintDuoIcon,
  QRCodeDuoIcon,
} from "@cartridge/ui";
import { Container } from "../Container";
import { PortalBanner } from "components/PortalBanner";
import { PortalFooter } from "components/PortalFooter";
import { requestStorageDropCookie } from "./utils";

type UserAgent = "ios" | "android" | "other";
type AuthAction = "signup" | "login";
``;
export function Authenticate({
  name,
  action,
  onSuccess,
}: {
  name: string;
  action: AuthAction;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [userAgent, setUserAgent] = useState<UserAgent>("other");
  const [unsupportedMessage, setUnsupportedMessage] = useState<string>();

  const onAuth = useCallback(async () => {
    setIsLoading(true);

    await requestStorageDropCookie();

    try {
      switch (action) {
        case "signup":
          await doSignup(decodeURIComponent(name));
          break;
        case "login":
          break;
        default:
          throw new Error(`Unsupported action ${action}`);
      }

      onSuccess();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      throw e;
    }
  }, [onSuccess, action, name]);

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

  const title =
    action === "signup" ? "Authenticate Yourself" : "Hello from Cartridge!";
  const description =
    action === "signup" ? (
      <>
        You will now be asked to authenticate yourself.
        <br />
        Note: this experience varies from browser to browser.
      </>
    ) : (
      <>Please click continue.</>
    );
  return (
    <>
      <Container hideAccount>
        <PortalBanner
          Icon={action === "signup" && Icon}
          title={title}
          description={description}
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
