import { Button, VStack, Text, HStack, Spacer } from "@chakra-ui/react";
import { Container, Content, Footer } from "components/layout";
import { CopyIcon } from "@cartridge/ui";
import { useConnection } from "hooks/connection";
import { useEffect, useState } from "react";

const shortAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(
    address.length - 4,
    address.length,
  )}`;
};

export function Menu({
  onLogout,
  onSetDelegate,
}: {
  onLogout: () => void;
  onSetDelegate: () => void;
}) {
  const { controller } = useConnection();
  const [isCopying, setIsCopying] = useState(false);
  const [isCopyingDelegate, setIsCopyingDelegate] = useState(false);
  const [delegateAccount, setDelegateAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      const delegate = await controller.delegateAccount();
      setDelegateAccount(delegate);
    };
    init();
  }, [controller]);

  const onCopy = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(controller.address);
    setTimeout(() => {
      setIsCopying(false);
    }, 1_000);
  };

  const onCopyDelegate = () => {
    setIsCopyingDelegate(true);
    navigator.clipboard.writeText(delegateAccount);
    setTimeout(() => {
      setIsCopyingDelegate(false);
    }, 1_000);
  };

  return (
    <Container variant="menu" title={controller.username}>
      <Content h="350px">
        <VStack w="full" h="full" justifyContent="space-between">
          <VStack w="full" gap={3}>
            <VStack
              gap={0}
              cursor="pointer"
              _hover={{
                color: "color.primary",
              }}
              onClick={onCopy}
            >
              <Text
                color="text.secondaryAccent"
                fontSize="xs"
                fontWeight="bold"
                casing="uppercase"
              >
                Controller
              </Text>

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

            {delegateAccount && BigInt(delegateAccount) !== 0n && (
              <VStack
                gap={0}
                cursor="pointer"
                _hover={{
                  color: "color.primary",
                }}
                onClick={onCopyDelegate}
              >
                <Text
                  color="text.secondaryAccent"
                  fontSize="xs"
                  fontWeight="bold"
                  casing="uppercase"
                >
                  Delegate
                </Text>

                {!isCopyingDelegate ? (
                  <HStack>
                    <Text>{shortAddress(delegateAccount)}</Text>
                    <Spacer />
                    <CopyIcon color="currentColor" />
                  </HStack>
                ) : (
                  <Text color="text.secondary">Copied to clipboard!</Text>
                )}
              </VStack>
            )}
          </VStack>

          <VStack w="full">
            <Button colorScheme="colorful" w="full" onClick={onSetDelegate}>
              Set delegate account
            </Button>
          </VStack>
        </VStack>
      </Content>
      <Footer>
        <Button w="full" onClick={onLogout}>
          Log out
        </Button>
      </Footer>
    </Container>
  );
}
