import { Button, Flex, Spacer } from "@chakra-ui/react";
import { ReactNode } from "react";

const Footer = ({
  action,
  children,
  isDisabled = false,
  isLoading = false,
  onSubmit,
  onCancel,
}: {
  action: string;
  children?: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
}) => (
  <Flex
    position="fixed"
    bottom="0"
    right="0"
    w="100%"
    p="16px"
    bgColor="gray.900"
    justify="flex-end"
    flexDirection="column"
    gap="12px"
  >
    <Spacer borderBottom="1px solid" borderColor="gray.700" />
    {children}
    <Flex gap="10px" justify="flex-end">
      {onCancel && (
        <Button
          variant="secondary600"
          size="lg"
          w={["100%", "100%", "200px"]}
          onClick={onCancel}
        >
          CANCEL
        </Button>
      )}
      <Button
        size="lg"
        disabled={isDisabled}
        isLoading={isLoading}
        w={["100%", "100%", "200px"]}
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit}
      >
        {action}
      </Button>
    </Flex>
  </Flex>
);

export default Footer;
