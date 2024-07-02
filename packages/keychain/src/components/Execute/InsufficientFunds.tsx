import { CopyIcon, EthereumIcon, StarknetIcon } from "@cartridge/ui";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { Container, Content } from "components/layout";
import { useState } from "react";
import { BigNumberish } from "starknet";
import { formatAddress } from "utils/contracts";

export function InsufficientFunds({
  address,
  balance,
}: {
  address: BigNumberish;
  balance: BigNumberish;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Container
      hideAccount
      title="Insufficient Funds"
      description="You'll need more gas to complete this transaction. Send some ETH to your controller address."
    >
      <Content>
        <VStack w="full" align="flex-start" fontSize="sm" borderRadius="sm" spacing="1px">
          <Text color="text.secondary" fontSize="11px" w="full" bg="solid.primary" as="b" p={3}>
            BALANCE
          </Text>

          <HStack
            h="40px"
            w="full"
            borderRadius="4px"
            overflow="hidden"
            spacing="1px"
          >
            <HStack boxSize="full" flex="2" px="10px" bg="solid.primary" color="text.error">
              <EthereumIcon boxSize="24px" color="inherit" />{" "}
              <Text color="inherit">{balance}</Text>
            </HStack>

            <HStack
              bg="solid.primary"
              boxSize="full"
              flex="1"
              justify="center"
            >
              <StarknetIcon boxSize="24px" /> <Text>Sepolia</Text>
            </HStack>
          </HStack>
        </VStack>

        <VStack w="full" align="flex-start" fontSize="sm" borderRadius="sm" spacing="1px">
          <Text color="text.secondary" fontSize="11px" w="full" bg="solid.primary" as="b" p={3}>
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
                opacity: 0.8
              }}
              onClick={() => {
                navigator.clipboard.writeText(address.toString());
                setCopied(true);
              }}
            >
              <Text color="inherit">{formatAddress(address)}</Text>
              <Spacer />
              <CopyIcon boxSize="24px" />
            </HStack>
          </HStack>
          {copied && (
            <HStack w="full" justify="center">
              <Text color="text.secondary" fontSize="12px">
                COPIED
              </Text>
            </HStack>
          )}
        </VStack>
      </Content>
    </Container>
  );
}
