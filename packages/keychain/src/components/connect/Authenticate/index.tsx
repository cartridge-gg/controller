import React, { useState, useCallback } from "react";
import { Button } from "@chakra-ui/react";
import { Unsupported, useIsSupported } from "./Unsupported";
import { doSignup } from "hooks/account";
import { Container, Footer } from "components/layout";

export type AuthAction = "signup" | "login";

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
  const { isSupported, message } = useIsSupported();

  const onAuth = useCallback(async () => {
    setIsLoading(true);

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
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, action, name]);

  if (!isSupported) {
    return <Unsupported message={message} />;
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
    <Container
      variant="connect"
      hideAccount
      title={title}
      description={description}
    >
      <Footer showLogo>
        <Button colorScheme="colorful" onClick={onAuth} isLoading={isLoading}>
          continue
        </Button>
      </Footer>
    </Container>
  );
}
