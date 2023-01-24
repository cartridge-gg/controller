import { Button, Flex, Spacer } from "@chakra-ui/react";
import { ReactNode } from "react";

const Footer = ({
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  showConfirm = true,
  isDisabled = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: {
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  showConfirm?: boolean;
  children?: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}) => (
  <Flex
    position="fixed"
    bottom="0"
    right="0"
    w="100%"
    p="18px 36px 36px 36px"
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
          w={["100%", "100%", "200px"]}
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
          w={["100%", "100%", "200px"]}
          type={onConfirm ? "button" : "submit"}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      )}
    </Flex>
  </Flex>
);

export default Footer;
