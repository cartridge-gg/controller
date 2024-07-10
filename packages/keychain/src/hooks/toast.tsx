import { DEFAULT_TOAST_OPTIONS } from "@cartridge/ui";
import { useToast as useChakraToast } from "@chakra-ui/react";
import { Toaster } from "../components/Toaster";

export function useToast() {
  const chakraToast = useChakraToast();

  const toast = (message: string) => {
    chakraToast.closeAll();
    chakraToast({
      ...DEFAULT_TOAST_OPTIONS,
      render: () => <Toaster message={message} />,
    });
  };

  return {
    toast,
  };
}
