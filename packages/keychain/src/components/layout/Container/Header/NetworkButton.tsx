import { Circle, HStack, Text } from "@chakra-ui/react";
import { useConnection } from "hooks/connection";

export function NetworkButton() {
  const { controller, chainName } = useConnection();

  return (
    <HStack bg="translucent.md" borderRadius="md" px={3} py={2}>
      <Circle bg={controller ? "text.success" : "text.error"} size={2} />
      <Text
        fontFamily="Inter"
        fontSize="xs"
        textTransform={chainName.startsWith("0x") ? "initial" : "uppercase"}
      >
        {chainName}
      </Text>
    </HStack>
  );
}
