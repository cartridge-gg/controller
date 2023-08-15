import { AlertIcon } from "@cartridge/ui";
import { VStack, Text, Spacer } from "@chakra-ui/react";

export function Unsupported({ message }: { message: string }) {
  return (
    <VStack h="130px" bg="solid.primary" borderRadius={2} p={6}>
      <AlertIcon />
      <Spacer />
      <Text align="center" fontSize="xs">
        {message}
      </Text>
    </VStack>
  );
}
