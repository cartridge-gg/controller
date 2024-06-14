import { StackProps, VStack } from "@chakra-ui/react";
import { useLayout } from "./Container";

export function Content({ children, ...stackProps }: StackProps) {
  const { footerHeight } = useLayout();

  return (
    <VStack w="full" px={4} pb={footerHeight} align="stretch" {...stackProps}>
      {children}
    </VStack>
  );
}
