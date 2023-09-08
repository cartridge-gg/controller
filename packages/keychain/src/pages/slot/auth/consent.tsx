import Controller from "utils/controller";
import { PlugActiveDuoIcon } from "@cartridge/ui/lib";
import { Button, Text } from "@chakra-ui/react";
import { Container, PortalBanner, PortalFooter } from "components";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

const Consent: NextPage = () => {
  const router = useRouter();

  const onSubmit = useCallback(async () => {
    const redirect_uri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_SITE_URL}/slot/auth/callback`,
    );
    // Include the callback uri of local server as `state` query param
    const state = encodeURIComponent(router.query.callback_uri as string);
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/auth?client_id=cartridge&redirect_uri=${redirect_uri}&state=${state}`;

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
    <Container>
      <PortalBanner
        Icon={PlugActiveDuoIcon}
        title="Requesting Permission"
        description={
          <>
            <Text as="span" fontWeight="bold" color="inherit">
              Slot
            </Text>{" "}
            is requesting permission to manage your Cartridge Infrastructure
          </>
        }
      />

      <PortalFooter showTerm={false}>
        <Button colorScheme="colorful" onClick={onSubmit}>
          approve
        </Button>

        <Button onClick={onDeny}>deny</Button>
      </PortalFooter>
    </Container>
  );
};

export default Consent;
