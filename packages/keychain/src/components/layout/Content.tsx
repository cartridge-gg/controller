import { StackProps, VStack } from "@chakra-ui/react";
import { useLayout } from "./container";

export function Content({ children, ...stackProps }: StackProps) {
  const { footer } = useLayout();

  return (
    <VStack w="full" px={4} pb={footer.height} align="stretch" {...stackProps}>
      {children}
    </VStack>
  );
}
