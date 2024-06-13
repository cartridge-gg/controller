import { StackProps, VStack } from "@chakra-ui/react";
import { FOOTER_HEIGHT, useLayoutVariant } from "./Container";

export function Content({ children, ...stackProps }: StackProps) {
  const variant = useLayoutVariant();
  return (
    <VStack w="full" px={4} align="stretch" pb={FOOTER_HEIGHT} {...stackProps}>
      {children}
    </VStack>
  );
}
