import { PlugActiveDuoIcon } from "@cartridge/ui/lib";
import { Button, Text } from "@chakra-ui/react";
import { Container, PortalBanner } from "components";
import { useController } from "hooks/controller";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

const Consent: NextPage = () => {
  const router = useRouter();
  const [controller] = useController();

  const onSubmit = useCallback(async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/auth?client_id=cartridge`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      // body: ``,
    });

    console.log(res);
  }, []);

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
          <Text>
            <Text>Slot</Text> is requesting permission to manage your Cartridge
            Infrastructure
          </Text>
        }
      />
      <Text>CONTENT</Text>
      <Button onClick={onSubmit}>Authorise</Button>
    </Container>
  );
};

export default Consent;
