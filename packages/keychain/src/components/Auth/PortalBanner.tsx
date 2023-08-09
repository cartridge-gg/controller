import { PlugNewDuoIcon } from "@cartridge/ui";
import { VStack, Circle, Text } from "@chakra-ui/react";

export function PortalBanner({ type }: { type: "signup" | "login" }) {
  return (
    <VStack w="full" marginBottom={4} p={3}>
      <VStack paddingTop={6} paddingX={8}>
        <Circle size={12} marginBottom={4} bg="solid.primary">
          <PlugNewDuoIcon boxSize={8} />
        </Circle>

        <Text fontSize="lg" fontWeight="semibold">
          Sign Up
        </Text>
        <Text fontSize="sm" color="text.secondary">
          Select a username
        </Text>
      </VStack>
    </VStack>
  );
}
