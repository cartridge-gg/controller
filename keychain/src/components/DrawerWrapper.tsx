import { ReactNode } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  UseDisclosureProps,
} from "@chakra-ui/react";

export const DrawerWrapper = ({
  isWrapped = true,
  isOpen,
  onClose,
  children,
}: { isWrapped?: boolean; children: ReactNode } & UseDisclosureProps) => {
  if (!isWrapped) {
    return <>{children}</>;
  }

  return (
    <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerBody p="36px">{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
