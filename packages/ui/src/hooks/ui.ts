import { UIContext } from "@/context";
import { useCallback, useContext, useState } from "react";

export type Disclosure = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
};

export function useDisclosure(defaultOpen: boolean = false): Disclosure {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onToggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
}

export function useUI() {
  return useContext(UIContext);
}
