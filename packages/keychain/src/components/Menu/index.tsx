import { Button, VStack, Text, HStack, Spacer } from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { CopyIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useState } from "react";

export function Menu({ onLogout }: { onLogout: () => void }) {
  const { controller } = useConnection();
  const [isCopying, setIsCopying] = useState(false);

  const address = controller.address;

  const onCopy = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(address);
    setTimeout(() => {
      setIsCopying(false);
    }, 1_000);
  };
  return (
    <Container variant="menu" title={controller.username}>
      <Content h="300px">
        <VStack w="full" h="full" justifyContent="space-between">
          <HStack
            cursor="pointer"
            _hover={{
              color: "color.primary",
            }}
            onClick={onCopy}
          >
            {!isCopying ? (
              <>
                <Text>
                  {`${address.slice(0, 6)}...${address.slice(
                    address.length - 4,
                    address.length,
                  )}`}
                </Text>
                <Spacer />
                <CopyIcon color="currentColor" />
              </>
            ) : (
              <Text color="text.secondary">Copied to clipboard!</Text>
            )}
          </HStack>
          <VStack w="full">
            <Button colorScheme="colorful" w="full">
              Set delegate account
            </Button>
            <Button w="full" disabled={true} opacity={0.25}>
              Coming soon...
            </Button>
            <Button w="full" disabled={true} opacity={0.25}>
              Coming soon...
            </Button>
          </VStack>
        </VStack>
      </Content>
      <Footer>
        <Button
          w="full"
          onClick={() => {
            onLogout();
          }}
        >
          Log out
        </Button>
      </Footer>
    </Container>
  );
}
