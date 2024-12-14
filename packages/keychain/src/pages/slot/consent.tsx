import Controller from "@/utils/controller";
import { Button, Text } from "@chakra-ui/react";
import { Container, Footer } from "@/components/layout";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

export function Consent() {
  const router = useRouter();

  const onSubmit = useCallback(async () => {
    const redirect_uri = encodeURIComponent(
      router.query.callback_uri as string,
    );
    const url = `${
      import.meta.env.VITE_CARTRIDGE_API_URL
    }/oauth2/auth?client_id=cartridge&redirect_uri=${redirect_uri}`;

    window.location.href = url;
  }, [router.query.callback_uri]);

  const onDeny = useCallback(async () => {
    const url = decodeURIComponent(router.query.callback_uri as string);
    window.location.href = url;
  }, [router.query.callback_uri]);

  useEffect(() => {
    if (!Controller.fromStore(import.meta.env.VITE_ORIGIN!)) {
      router.replace("/slot/auth");
    }
  }, [router]);

  return (
    <Container
      variant="expanded"
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
      <Footer>
        <Button colorScheme="colorful" onClick={onSubmit}>
          approve
        </Button>

        <Button onClick={onDeny}>deny</Button>
      </Footer>
    </Container>
  );
}
