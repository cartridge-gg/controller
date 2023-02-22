import Info from "@cartridge/ui/components/icons/Info";
import { Button, Circle, HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import Warning from "./icons/Warning";

export interface LowEthInfo {
  label: string;
  balance: string;
  max: string;
  lowAmount: string;
  reject: () => void;
  onBridge: () => void;
}

const LowEth = ({
  label,
  balance,
  max,
  lowAmount,
  reject,
  onBridge,
}: LowEthInfo) => {
  return (
    <VStack
      w="full"
      gap="18px"
      pt="18px"
      borderTop="1px solid"
      borderTopColor="gray.700"
    >
      <HStack
        w="full"
        borderRadius="6px"
        bgColor="gray.700"
        p="12px 18px"
      >
        <HStack color="gray.200" w="full">
          <Text
            color="currentColor"
            fontSize="10px"
            fontWeight="700"
            letterSpacing="0.05em"
            textTransform="uppercase"
          >
            {label}
          </Text>
          <Info fontSize="12px" />
        </HStack>
        <Spacer />
        <VStack w="full" align="end">
          <Text color="red.400" fontSize="13px">{`~${lowAmount}`}</Text>
          <HStack color="gray.200" fontSize="11px">
            <Text color="currentColor">{`Bal: ${balance}`}</Text>
            <Text color="currentColor">{`Max: ${max}`}</Text>
          </HStack>
        </VStack>
      </HStack>
      <VStack
        w="full"
        borderRadius="6px"
        p="12px 18px"
        bgColor="yellow.200"
        align="start"
      >
        <HStack
          w="full"
          minH="42px"
          borderBottom="1px solid"
          borderBottomColor="blackAlpha.200"
        >
          <Circle size="30px" bgColor="yellow.300">
            <Warning width="13px" height="13px" color="yellow.800" />
          </Circle>
          <Text
            fontSize="11px"
            fontWeight="700"
            color="yellow.800"
            letterSpacing="0.05em"
            textTransform="uppercase"
          >
            Error Expected
          </Text>
        </HStack>
        <Text
          fontSize="13px"
          color="yellow.800"
        >
          You do not have enough ETH to complete the above transaction
        </Text>
        <HStack w="full">
          <Button
            variant="primaryDarken"
            colorScheme="blackAlpha"
            flexGrow="1"
            onClick={reject}
          >
            Reject
          </Button>
          <Button
            variant="primary400"
            colorScheme="yellow"
            flexGrow="1"
            onClick={onBridge}
          >
            Add Funds
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
}

export default LowEth;
