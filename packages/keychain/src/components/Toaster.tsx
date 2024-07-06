import { Flex, UseToastOptions, useToast } from "@chakra-ui/react";
import { DEFAULT_TOAST_OPTIONS } from "@cartridge/ui";
import { useCallback } from "react";

export function Toaster({ title }: UseToastOptions) {
  return (
    <Flex
      bg="solid.primary"
      borderRadius="md"
      p={2}
      justifyContent="center"
      opacity={0.8}
    >
      {title}
    </Flex>
  );
}

export function useCopyAndToast(): (text: string) => void {
  const toast = useToast({
    ...DEFAULT_TOAST_OPTIONS,
    render: Toaster,
  });

  return useCallback(
    (text) => {
      navigator.clipboard.writeText(text);
      toast();
    },
    [toast],
  );
}
