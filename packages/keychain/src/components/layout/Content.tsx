import { StackProps, VStack } from "@chakra-ui/react";
import { FOOTER_HEIGHT } from "./Container";

export function Content({ children, ...stackProps }: StackProps) {
  return (
    <VStack
      w="full"
      px={4}
      align="stretch"
      overflowY="hidden"
      pb={FOOTER_HEIGHT}
      {...stackProps}
    >
      {children}
    </VStack>
  );
}
