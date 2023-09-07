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
    // Include the address of local server as `state` query param
    const state = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/success?redirect_uri=${router.query.redirect_uri}`,
    );
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/auth?client_id=cartridge&response_type=code&state=${state}`;

    window.location.href = url;
  }, [router.query.redirect_uri]);

  const onDeny = useCallback(async () => {
    const url = `${router.query.redirect_url}/callback`;
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      });

      router.replace("/auth/failure");
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  useEffect(() => {
    if (!Controller.fromStore()) {
      router.replace("/auth");
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
