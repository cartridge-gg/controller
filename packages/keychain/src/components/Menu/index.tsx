import { Button, VStack, Text, HStack, Spacer } from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { CopyIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useState } from "react";

export const shortAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(
    address.length - 4,
    address.length,
  )}`;
};

export const mediumAddress = (address: string) => {
  return `${address.slice(0, 20)}...${address.slice(
    address.length - 20,
    address.length,
  )}`;
};

export function Menu({ onLogout }: { onLogout: () => void }) {
  const { controller } = useConnection();
  const [isCopying, setIsCopying] = useState(false);

  const onCopy = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(controller.address);
    setTimeout(() => {
      setIsCopying(false);
    }, 1_000);
  };

  return (
    <Container
      variant="menu"
      showSettings={true}
      title={controller.username}
      description={
        <VStack
          cursor="pointer"
          _hover={{
            color: "color.primary",
          }}
          onClick={onCopy}
          alignItems="flex-start"
        >
          {!isCopying ? (
            <HStack>
              <Text>{shortAddress(controller.address)}</Text>
              <Spacer />
              <CopyIcon color="currentColor" />
            </HStack>
          ) : (
            <Text color="text.secondary">Copied to clipboard!</Text>
          )}
        </VStack>
      }
    >
      <Content h="350px"></Content>
      <Footer>
        <Button w="full" onClick={onLogout}>
          Log out
        </Button>
      </Footer>
    </Container>
  );
}
