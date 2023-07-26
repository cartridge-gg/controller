import { Button, Flex, Spacer } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface FooterProps {
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
  children?: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  floatBottom?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const Footer = ({
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  showConfirm = true,
  isDisabled = false,
  isLoading = false,
  floatBottom = true,
  onConfirm,
  onCancel,
}: FooterProps) => (
  <>
    <Spacer minH="60px" />
    <Flex
      position={floatBottom ? "fixed" : "relative"}
      bottom="0"
      right="0"
      w="100%"
      p={floatBottom && "18px 36px 36px 36px"}
      bgColor="gray.800"
      justify="flex-end"
      flexDirection="column"
      gap="12px"
    >
      {children}
      <Flex gap="10px" justify="flex-end">
        {showCancel && (
          <Button
            variant="secondary600"
            size="md"
            w={floatBottom ? ["100%", "100%", "200px"] : "100%"}
            onClick={onCancel}
          >
            {cancelText}
          </Button>
        )}
        {showConfirm && (
          <Button
            size="md"
            disabled={isDisabled || isLoading}
            isLoading={isLoading}
            w={floatBottom ? ["100%", "100%", "200px"] : "100%"}
            type={onConfirm ? "button" : "submit"}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        )}
      </Flex>
    </Flex>
  </>
);

export default Footer;
