import { JsControllerError } from "@cartridge/account-wasm";
import { CopyIcon, EthereumIcon, StarknetIcon } from "@cartridge/ui";
import { Button, HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { AlphaWarning } from "components/Warning";
import { Container, Content, Footer } from "components/layout";
import { useConnection } from "hooks/connection";
import { useToast } from "hooks/toast";
import { useCallback } from "react";
import { formatAddress } from "utils/contracts";

export function InsufficientFunds({ error }: { error: JsControllerError }) {
  const { controller, chainName } = useConnection();
  const { toast } = useToast();
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(
      formatAddress(controller.address, { fullLength: true }),
    );
    toast("Copied!");
  }, [controller.address, toast]);

  const details = error.details ? JSON.parse(error.details) : null;
  const feeEstimate = details?.fee_estimate;
  const balance = details?.balance;

  if (!feeEstimate || balance === undefined) {
    console.error("Failed to parse error details", error);
    return null;
  }

  return (
    <Container
      hideAccount
      title="Insufficient Funds"
      description="You'll need more gas to complete this transaction. Send some ETH to your controller address."
    >
      <Content>
        <VStack
          w="full"
          align="flex-start"
          fontSize="sm"
          borderRadius="sm"
          spacing="1px"
        >
          <Text
            color="text.secondary"
            fontSize="11px"
            w="full"
            bg="solid.primary"
            as="b"
            p={3}
            textTransform="uppercase"
          >
            BALANCE
          </Text>

          <HStack
            h="40px"
            w="full"
            borderRadius="4px"
            overflow="hidden"
            spacing="1px"
          >
            <HStack
              boxSize="full"
              flex="2"
              px="10px"
              bg="solid.primary"
              color="alert.foreground"
            >
              <EthereumIcon boxSize="24px" color="inherit" />{" "}
              <Text color="inherit">{balance.toString()}</Text>
            </HStack>

            <HStack bg="solid.primary" boxSize="full" flex="1" justify="center">
              <StarknetIcon boxSize="24px" /> <Text>{chainName}</Text>
            </HStack>
          </HStack>
        </VStack>

        <VStack
          w="full"
          align="flex-start"
          fontSize="sm"
          borderRadius="sm"
          spacing="1px"
        >
          <Text
            color="text.secondary"
            fontSize="11px"
            w="full"
            bg="solid.primary"
            as="b"
            p={3}
            textTransform="uppercase"
          >
            username
          </Text>

          <HStack
            h="40px"
            w="full"
            borderRadius="4px"
            overflow="hidden"
            spacing="1px"
          >
            <HStack
              bg="solid.primary"
              boxSize="full"
              flex="2"
              px="10px"
              cursor="pointer"
            >
              <Text color="inherit">{controller.account.username}</Text>
            </HStack>
          </HStack>
        </VStack>

        <VStack
          w="full"
          align="flex-start"
          fontSize="sm"
          borderRadius="sm"
          spacing="1px"
        >
          <Text
            color="text.secondary"
            fontSize="11px"
            w="full"
            bg="solid.primary"
            as="b"
            p={3}
            textTransform="uppercase"
          >
            ADDRESS
          </Text>

          <HStack
            h="40px"
            w="full"
            borderRadius="4px"
            overflow="hidden"
            spacing="1px"
          >
            <HStack
              bg="solid.primary"
              boxSize="full"
              flex="2"
              px="10px"
              cursor="pointer"
              _hover={{
                opacity: 0.8,
              }}
              onClick={onCopy}
            >
              <Text color="inherit">
                {formatAddress(controller.address, { first: 20, last: 10 })}
              </Text>
              <Spacer />
              <CopyIcon boxSize={6} />
            </HStack>
          </HStack>
        </VStack>
      </Content>

      <Footer>
        <AlphaWarning />
        <Button colorScheme="colorful" onClick={onCopy}>
          copy address
        </Button>
      </Footer>
    </Container>
  );
}
