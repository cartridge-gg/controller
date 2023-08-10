import {
  useEffect,
  useState,
  ReactNode,
  useCallback,
  ReactElement,
} from "react";
import {
  Box,
  Flex,
  Circle,
  Container,
  VStack,
  Text,
  Link,
  UseDisclosureProps,
} from "@chakra-ui/react";
import { Header } from "components/Header";
import Footer from "components/Footer";
import Unsupported from "components/signup/Unsupported";
import { Credentials, onCreateBegin, onCreateFinalize } from "hooks/account";
import { SimpleModal } from "@cartridge/ui/src/components/modals/SimpleModal";
import { useStartup } from "hooks/startup";
import {
  FaceIDDuoIcon,
  FingerprintDuoIcon,
  FingerprintIcon,
  NewControllerDuoIcon,
  QRCodeDuoIcon,
} from "@cartridge/ui";
import { ContainerV2 } from "components/Container";

export const Authenticate = ({
  name,
  pubkey,
  isModal = false,
  isOpen,
  onComplete,
  onClose,
}: {
  name: string;
  pubkey: string;
  isModal?: boolean;
  onComplete: () => void;
} & UseDisclosureProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userAgent, setUserAgent] = useState<UserAgent>("other");
  const [unsupportedMessage, setUnsupportedMessage] = useState<string>();

  const { play, StartupAnimation } = useStartup({ onComplete });

  const onAuth = useCallback(async () => {
    // https://webkit.org/blog/11545/updates-to-the-storage-access-api/
    document.cookie = "visited=true; path=/;";

    setIsLoading(true);
    try {
      const credentials: Credentials = await onCreateBegin(
        decodeURIComponent(name),
      );
      await onCreateFinalize(pubkey, credentials);

      play();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      throw e;
    }
  }, [play, name, pubkey]);

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

  if (unsupportedMessage) {
    return <Unsupported message={unsupportedMessage} />;
  }

  return (
    <>
      {isModal ? (
        <SimpleModal
          icon={<NewControllerDuoIcon boxSize="40px" />}
          onClose={onClose}
          onConfirm={() => {
            onAuth().then(() => onClose());
          }}
          confirmText="Continue"
          isOpen={isOpen}
          showCloseButton={false}
          isLoading={isLoading}
          dismissable={false}
        >
          <Content userAgent={userAgent} />
        </SimpleModal>
      ) : (
        <ContainerV2 fullPage={true}>
          <Header />
          <Content
            icon={
              <Circle size={12} bgColor="">
                <FingerprintDuoIcon boxSize={8} />
              </Circle>
            }
            userAgent={userAgent}
          />
          <Footer
            confirmText="Continue"
            showCancel={false}
            onConfirm={onAuth}
            isLoading={isLoading}
          />
        </ContainerV2>
      )}

      {StartupAnimation}
    </>
  );
};

type UserAgent = "ios" | "android" | "other";

const Content = ({ icon, userAgent }: { icon?: any; userAgent: any }) => {
  const renderIcon = useCallback(() => {
    switch (userAgent) {
      case "ios":
        return <FaceIDDuoIcon />;
      case "android":
        return <QRCodeDuoIcon />;
      case "other":
        return <FingerprintDuoIcon />;
    }
  }, [userAgent]);

  return (
    <>
      <VStack spacing="20px" py="10px">
        {icon}
        <Text fontSize="17px" fontWeight="bold">
          Authenticate Yourself
        </Text>
        <Text fontSize="12px" color="whiteAlpha.600" align="center">
          You will now be asked to authenticate yourself.
          <br />
          Note: this experience varies from browser to browser.
        </Text>
        {renderIcon}
        <Link
          isExternal
          href="https://www.yubico.com/authentication-standards/webauthn"
          fontSize="12px"
          variant="outline"
        >
          Read about WebAuthn
        </Link>
      </VStack>
    </>
  );
};
