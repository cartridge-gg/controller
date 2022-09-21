import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Spacer, Link, Flex, Button, Container } from "@chakra-ui/react";
import { Logo } from "@cartridge/ui/components/brand/Logo";

import Banner from "components/Banner";

const Welcome: NextPage = () => {
  const router = useRouter();
  return (
    <Flex
      h="full"
      w="full"
      position="fixed"
      direction="column"
      justify="center"
    >
      <Container
        h="full"
        w={["full", "400px"]}
        gap="50px"
        justifyContent={["space-between", "flex-start"]}
        centerContent
      >
        <Spacer maxH="88px" />
        <Flex direction="column" align="center">
          <Logo fill="brand" size="md" mb="40px" />
          <Banner title="WELCOME!">
            Welcome to the Cartridge controller! <br />
            Please login to get started.
          </Banner>
        </Flex>
        <Flex direction="column" gap="14px" w="full">
          <Link
            href={`https://cartridge.gg/login${router.query.redirect_uri
              ? `?redirect_uri=${encodeURIComponent(
                router.query.redirect_uri as string,
              )}`
              : ""
              }`}
          >
            <Button variant="primary" w="full">
              Login
            </Button>
          </Link>
          <Link href={"https://cartridge.gg/create"}>
            <Button variant="secondary800" w="full">
              Create Account
            </Button>
          </Link>
        </Flex>
      </Container>
    </Flex>
  );
};

export default Welcome;
