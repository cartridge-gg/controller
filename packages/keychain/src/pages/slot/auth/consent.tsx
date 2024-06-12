import Controller from "utils/controller";
import { Button, Text } from "@chakra-ui/react";
import { Container, Footer } from "components/layout";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

export default function Consent() {
  const router = useRouter();

  const onSubmit = useCallback(async () => {
    const redirect_uri = encodeURIComponent(
      router.query.callback_uri as string,
    );
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/auth?client_id=cartridge&redirect_uri=${redirect_uri}`;

    window.location.href = url;
  }, [router.query.callback_uri]);

  const onDeny = useCallback(async () => {
    const url = decodeURIComponent(router.query.callback_uri as string);
    window.location.href = url;
  }, [router.query.callback_uri]);

  useEffect(() => {
    if (!Controller.fromStore()) {
      router.replace("/slot/auth");
    }
  }, [router]);

  return (
    <Container
      variant="connect"
      hideAccount
      title="Requesting Permission"
      description={
        <>
          <Text as="span" fontWeight="bold" color="inherit">
            Slot
          </Text>{" "}
          is requesting permission to manage your Cartridge Infrastructure
        </>
      }
    >
      <Footer showLogo>
        <Button colorScheme="colorful" onClick={onSubmit}>
          approve
        </Button>

        <Button onClick={onDeny}>deny</Button>
      </Footer>
    </Container>
  );
};
