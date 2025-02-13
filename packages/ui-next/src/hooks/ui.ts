import { UIContext } from "@/context";
import { useCallback, useContext, useState } from "react";

export function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(true);
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
