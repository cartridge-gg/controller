import { CopyIcon, EthereumIcon, StarknetIcon } from "@cartridge/ui";
import { HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { Container, Content, Banner } from "components/layout";
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
    <Container hideAccount>
      <Banner
        title="Insufficient Funds"
        description="You'll need more gas to complete this transaction. Send some ETH to your controller address."
      />

      <Content>
        <VStack w="full" align="flex-start" fontSize="14px">
          <Text color="darkGray.400" fontSize="11px">
            BALANCE
          </Text>
          <HStack
            h="40px"
            w="full"
            borderRadius="4px"
            overflow="hidden"
            spacing="3px"
          >
            <HStack bgColor="darkGray.900" boxSize="full" flex="2" px="10px">
              <EthereumIcon boxSize="24px" color="red.400" />{" "}
              <Text color="red.400">{balance}</Text>
            </HStack>
            <HStack
              bgColor="darkGray.900"
              boxSize="full"
              flex="1"
              justify="center"
            >
              <StarknetIcon boxSize="24px" /> <Text>Sepolia</Text>
            </HStack>
          </HStack>
        </VStack>

        <VStack w="full" align="flex-start" fontSize="14px">
          <Text color="darkGray.400" fontSize="11px">
            ADDRESS
          </Text>
          <HStack
            h="40px"
            w="full"
            borderRadius="4px"
            overflow="hidden"
            spacing="3px"
          >
            <HStack
              bgColor="darkGray.900"
              boxSize="full"
              flex="2"
              px="10px"
              cursor="pointer"
              _hover={{
                color: "darkGray.100",
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
              <Text color="darkGray.200" fontSize="12px">
                COPIED
              </Text>
            </HStack>
          )}
        </VStack>
      </Content>
    </Container>
  );
};
