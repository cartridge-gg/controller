import { Flex, UseToastOptions } from "@chakra-ui/react";

export function Toaster({ title }: UseToastOptions) {
  return (
    <Flex bg="solid.primary" borderRadius="md" p={2} justifyContent="center">
      {title}
    </Flex>
  );
}
