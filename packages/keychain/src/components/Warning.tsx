import { AlertIcon } from "@cartridge/ui";
import { HStack, Text, VStack } from "@chakra-ui/react";
import { ReactElement } from "react";

export function Warning({
  title,
  description,
}: {
  title: string;
  description?: string | ReactElement;
}) {
  return (
    <VStack
      w="full"
      borderRadius="md"
      px={5}
      py={3}
      bg="solid.secondary"
      alignItems="flex-start"
      gap={1}
    >
      <HStack>
        <AlertIcon />
        <Text casing="uppercase" fontSize="11px" as="b">
          {title}
        </Text>
      </HStack>

      <Text fontSize="xs" color="text.secondaryAccent">
        {description}
      </Text>
    </VStack>
  );
}

export function AlphaWarning() {
  return (
    <Warning
      title="Controller is in Alpha"
      description="Exercise caution when depositing funds"
    />
  );
}
