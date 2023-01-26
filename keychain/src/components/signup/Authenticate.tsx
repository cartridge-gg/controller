import { useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Circle,
  Container,
  VStack,
  Text,
  Link,
  useDisclosure,
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
import { Startup } from "components/signup";
import { SimpleModal } from "@cartridge/ui/src/components/modals/SimpleModal";
import KeyNewIcon from "@cartridge/ui/src/components/icons/KeyNew";

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
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [AuthImage, setAuthImage] = useState<ReactNode>(AuthFingerprintImage);
  const [unsupportedMessage, setUnsupportedMessage] = useState<string>();

  const onAuth = useCallback(async () => {
    // https://webkit.org/blog/11545/updates-to-the-storage-access-api/
    document.cookie = "visited=true; path=/;";

    setIsLoading(true);
    try {
      const credentials: Credentials = await onCreateBegin(
        decodeURIComponent(name),
      );
      await onCreateFinalize(pubkey, credentials);

      setIsAuthorized(true);
    } catch (e) {
      console.error(e);
      setError(e);
      setIsLoading(false);
    }
  }, [name, pubkey]);

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

  if (!name || !pubkey) {
    return <></>;
  }

  if (isAuthorized) {
    return <Startup onComplete={onComplete} />;
  }

  if (isModal) {
    return (
      <SimpleModal
        icon={<KeyNewIcon boxSize="40px" />}
        onClose={onClose}
        onConfirm={onAuth}
        confirmText="Continue"
        isOpen={isOpen}
        showCloseButton={false}
        isLoading={isLoading}
      >
        <VStack spacing="20px" py="10px">
          <Text fontSize="17px" fontWeight="bold">
            Authenticate Yourself
          </Text>
          <Text fontSize="14px" color="whiteAlpha.600" align="center">
            You will now be asked to authenticate yourself.
            <br />
            Note: this experience varies from browser to browser.
          </Text>
          {AuthImage}
          <Link
            isExternal
            href="https://www.yubico.com/authentication-standards/webauthn"
            fontSize="12px"
            variant="traditional"
          >
            Read about WebAuthn
          </Link>
        </VStack>
      </SimpleModal>
    );
  }

  return (
    <Container>
      <Header />
      <VStack spacing="20px" py="10px">
        <Circle size="48px" bgColor="gray.700">
          <FingerprintIcon boxSize="30px" />
        </Circle>
        <Text fontSize="17px" fontWeight="bold">
          Authenticate Yourself
        </Text>
        <Text fontSize="12px" color="whiteAlpha.600" align="center">
          You will now be asked to authenticate yourself.
          <br />
          Note: this experience varies from browser to browser.
        </Text>
        {AuthImage}
        <Link
          isExternal
          href="https://www.yubico.com/authentication-standards/webauthn"
          fontSize="12px"
          variant="outline"
        >
          Read about WebAuthn
        </Link>
      </VStack>
      <Footer
        confirmText="Continue"
        showCancel={false}
        onConfirm={onAuth}
        isLoading={isLoading}
      />
    </Container>
  );
};
