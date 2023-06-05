import { useEffect, useState, ReactNode, useCallback } from "react";
import {
  Circle,
  Container,
  VStack,
  Text,
  Link,
  UseDisclosureProps,
} from "@chakra-ui/react";
import { Header } from "components/Header";
import {
  AuthFingerprintImage,
  AuthFaceIdImage,
  AuthQrCodeImage,
} from "@cartridge/ui/src/components/icons/auth";
import FingerprintIcon from "@cartridge/ui/components/icons/auth/Fingerprint";
import Footer from "components/Footer";
import Unsupported from "components/signup/Unsupported";
import { Credentials, onCreateBegin, onCreateFinalize } from "hooks/account";
import { SimpleModal } from "@cartridge/ui/src/components/modals/SimpleModal";
import KeyNewIcon from "@cartridge/ui/src/components/icons/KeyNew";
import { useStartup } from "hooks/startup";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authImage, setAuthImage] = useState<ReactNode>(AuthFingerprintImage);
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
      setAuthImage(AuthFaceIdImage);
    } else if (/android/i.test(userAgent)) {
      setAuthImage(AuthQrCodeImage);
    } else {
      setAuthImage(AuthFingerprintImage);
    }
  }, []);

  if (unsupportedMessage) {
    return <Unsupported message={unsupportedMessage} />;
  }

  return (
    <>
      {isModal ? (
        <SimpleModal
          icon={<KeyNewIcon boxSize="40px" />}
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
          <Content authImage={authImage} />
        </SimpleModal>
      ) : (
        <Container>
          <Header />
          <Content
            icon={
              <Circle size="48px" bgColor="legacy.gray.700">
                <FingerprintIcon boxSize="30px" />
              </Circle>
            }
            authImage={authImage}
          />
          <Footer
            confirmText="Continue"
            showCancel={false}
            onConfirm={onAuth}
            isLoading={isLoading}
          />
        </Container>
      )}

      {StartupAnimation}
    </>
  );
};

const Content = ({
  icon,
  authImage,
}: {
  icon?: ReactNode;
  authImage: ReactNode;
}) => {
  return (
    <>
      <VStack spacing="20px" py="10px">
        {icon}
        <Text fontSize="17px" fontWeight="bold">
          Authenticate Yourself
        </Text>
        <Text fontSize="12px" color="legacy.whiteAlpha.600" align="center">
          You will now be asked to authenticate yourself.
          <br />
          Note: this experience varies from browser to browser.
        </Text>
        {authImage}
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
