import { Flex } from "@chakra-ui/react";

export function Toaster({ message }: { message: string }) {
  return (
    <Flex
      bg="solid.primary"
      borderRadius="base"
      p={2}
      justifyContent="center"
      opacity={0.8}
    >
      {message}
    </Flex>
  );
}
