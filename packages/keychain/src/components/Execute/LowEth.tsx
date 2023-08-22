import { Button, Circle, HStack, Spacer, Text, VStack } from "@chakra-ui/react";
import { AlertIcon } from "@cartridge/ui";

export interface LowEthInfo {
  label: string;
  balance: string;
  max: string;
  lowAmount: string;
  reject: () => void;
  onBridge: () => void;
}

export function LowEth({
  label,
  balance,
  max,
  lowAmount,
  reject,
  onBridge,
}: LowEthInfo) {
  return (
    <VStack
      w="full"
      spacing={4.5}
      pt={4.5}
      borderTop="1px solid"
      borderTopColor="solid.accent"
    >
      <HStack w="full" borderRadius="md" bg="solid.primary" px={3} py={4.5}>
        <HStack color="text.secondaryAccent" w="full">
          <Text
            color="text.secondaryAccent"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {label}
          </Text>
        </HStack>

        <Spacer />

        <VStack w="full" align="end">
          <Text color="text.error" fontSize="sm">{`~${lowAmount}`}</Text>
          <HStack color="text.secondary" fontSize="xs">
            <Text color="currentColor">{`Bal: ${balance}`}</Text>
            <Text color="currentColor">{`Max: ${max}`}</Text>
          </HStack>
        </VStack>
      </HStack>

      <VStack
        w="full"
        borderRadius="md"
        px={4}
        py={3}
        bg="yellow.200"
        align="start"
      >
        <HStack
          w="full"
          minH="42px"
          borderBottom="1px solid"
          borderBottomColor="solid.accent"
        >
          <Circle size={7} bg="yellow.300">
            <AlertIcon color="yellow.800" />
          </Circle>

          <Text
            fontSize="xs"
            fontWeight="bold"
            color="yellow.800"
            letterSpacing="0.05em"
            textTransform="uppercase"
          >
            Insufficient Funds
          </Text>
        </HStack>

        <Text fontSize="xs" color="yellow.800">
          You do not have enough ETH to complete the above transaction
        </Text>

        <HStack w="full">
          <Button
            colorScheme="translucent"
            color="black"
            flex={1}
            onClick={reject}
          >
            Reject
          </Button>

          <Button flex={1} onClick={onBridge}>
            Add Funds
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
}
