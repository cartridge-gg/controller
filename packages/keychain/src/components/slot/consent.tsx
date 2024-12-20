import Controller from "@/utils/controller";
import { Button, Text } from "@chakra-ui/react";
import { Container, Footer } from "@/components/layout";
import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function Consent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callback_uri = searchParams.get("callback_uri")!;

  const onSubmit = useCallback(async () => {
    const redirect_uri = encodeURIComponent(callback_uri);
    const url = `${
      import.meta.env.VITE_CARTRIDGE_API_URL
    }/oauth2/auth?client_id=cartridge&redirect_uri=${redirect_uri}`;

    window.location.href = url;
  }, [callback_uri]);

  const onDeny = useCallback(async () => {
    const url = decodeURIComponent(callback_uri);
    window.location.href = url;
  }, [callback_uri]);

  useEffect(() => {
    if (!Controller.fromStore(import.meta.env.VITE_ORIGIN!)) {
      navigate("/slot/auth", { replace: true });
    }
  }, [navigate]);

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
