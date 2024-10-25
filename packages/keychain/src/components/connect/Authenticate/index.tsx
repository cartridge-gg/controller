import React, { useState, useCallback } from "react";
import { Button } from "@chakra-ui/react";
import { Unsupported, useIsSupported } from "./Unsupported";
import { doSignup } from "hooks/account";
import { Container, Content, Footer } from "components/layout";
import { FaceIDDuoImage } from "./FaceID";

export type AuthAction = "signup" | "login";

export function Authenticate({
  name,
  network,
  action,
  onSuccess,
}: {
  name: string;
  network: string;
  action: AuthAction;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSupported, message } = useIsSupported();

  const onAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      switch (action) {
        case "signup":
          await doSignup(decodeURIComponent(name), network);
          break;
        case "login":
          break;
        default:
          throw new Error(`Unsupported action ${action}`);
      }

      onSuccess();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, action, name, network]);

  if (!isSupported) {
    return <Unsupported message={message} />;
  }

  const title =
    action === "signup" ? "Create Passkey" : "Hello from Cartridge!";
  const description =
    action === "signup" ? (
      <>
        Your controller keys will be saved in
        <br /> your device&apos;s password manager
      </>
    ) : (
      <>Please click continue.</>
    );
  const cta = "signup" ? "Create Passkey" : "continue";

  return (
    <Container
      variant="expanded"
      hideAccount
      title={title}
      description={description}
    >
      <Content>
        <FaceIDDuoImage />
      </Content>

      <Footer>
        <Button colorScheme="colorful" onClick={onAuth} isLoading={isLoading}>
          {cta}
        </Button>
      </Footer>
    </Container>
  );
}
