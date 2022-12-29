import { Container, Text, Flex, Button, VStack } from "@chakra-ui/react";
import { Header } from "components/Header";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// Safari Storage Access API requirement
// https://webkit.org/blog/11545/updates-to-the-storage-access-api/
const Bounce: NextPage = () => {
  const router = useRouter();
  const { redirect_uri } = router.query as { redirect_uri: string };
  return (
    <>
      <Header />
      <Container centerContent>
        <VStack spacing="20px" mt="20px">
          <Text align="center">
            Welcome to Cartridge! <br />
            Click continue to go back and create your account.
          </Text>
          <Button
            onClick={() => {
              // drop a cookie to enable storage access
              document.cookie = "bounced=true; path=/;";

              router.replace(redirect_uri);
            }}
          >
            Continue
          </Button>
        </VStack>
      </Container>
    </>
  );
};

export default dynamic(() => Promise.resolve(Bounce), { ssr: false });
