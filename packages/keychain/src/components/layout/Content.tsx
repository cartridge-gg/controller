import { StackProps, VStack } from "@chakra-ui/react";

export function Content({ children, ...stackProps }: StackProps) {
  return (
    <VStack
      w="full"
      px={4}
      align="stretch"
      {...stackProps}>{children}</VStack>
  );
}
