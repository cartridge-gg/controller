import { PlugActiveDuoIcon } from "@cartridge/ui/lib";
import { Button, Text } from "@chakra-ui/react";
import { Container, PortalBanner, PortalFooter } from "components";
import { useController } from "hooks/controller";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

const Consent: NextPage = () => {
  const router = useRouter();
  const [controller] = useController();

  const onSubmit = useCallback(async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/auth?client_id=cartridge&response_type=code&redirect_uri=${router.query.redirect_uri}`;

    window.location.href = url;
  }, [router.query.redirect_uri]);

  const onDeny = useCallback(async () => {
    // TODO: call deny request to the slot local server
    const url = `${router.query.redirect_url}/callback`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    console.log(res);
    // TODO: redirect to auth failure page
  }, [router.query.redirect_url]);

  useEffect(() => {
    if (!controller) {
      router.replace(`${process.env.NEXT_PUBLIC_ADMIN_URL}/auth`);
    }
  }, [controller, router]);

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

      <PortalFooter>
        <Button colorScheme="colorful" onClick={onSubmit}>
          approve
        </Button>

        <Button onClick={onDeny}>deny</Button>
      </PortalFooter>
    </Container>
  );
};

export default Consent;
