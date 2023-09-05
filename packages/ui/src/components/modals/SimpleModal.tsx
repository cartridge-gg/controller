import {
  Flex,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useBreakpointValue,
  ModalProps,
  ModalContentProps,
} from "@chakra-ui/react";
import { Headstone, HeadStoneProps } from "./Headstone";

interface SimpleModalProps {
  isOpen: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  confirmText?: string;
  showCloseButton?: boolean;
  isLoading?: boolean;
  dismissable?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

export function SimpleModal({
  icon,
  color,
  bgColor,
  isOpen,
  children,
  confirmText = "Confirm",
  showCloseButton = true,
  isLoading = false,
  dismissable = true,
  onConfirm,
  onClose,
  contentStyles,
}: SimpleModalProps &
  HeadStoneProps &
  ModalProps & { contentStyles?: ModalContentProps }) {
  const isMobile = useBreakpointValue([true, true, false]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={["full", "full", "lg"]}
      isCentered
      closeOnOverlayClick={dismissable}
    >
      <ModalOverlay />

      <ModalContent {...contentStyles}>
        {showCloseButton && <ModalCloseButton />}

        <ModalBody>
          <Flex direction="column">
            {isMobile ? (
              <Flex justify="center">{icon}</Flex>
            ) : (
              <Headstone icon={icon} color={color} bgColor={bgColor} />
            )}
            {children}
          </Flex>
        </ModalBody>

        <ModalFooter gap={4}>
          {dismissable && (
            <Button flex="1" onClick={onClose}>
              {onConfirm ? "Cancel" : "Close"}
            </Button>
          )}

          {onConfirm && (
            <Button
              flex="1"
              onClick={onConfirm}
              isLoading={isLoading}
              colorScheme="colorful"
            >
              {confirmText}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
