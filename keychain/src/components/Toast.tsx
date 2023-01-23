import { Box, Flex, VStack, CloseButton, Text } from "@chakra-ui/react";

export interface ToastProps {
  id: Number;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClose: Function;
  onOpen?: Function;
}

const Toast = (props: ToastProps) => {
  return (
    <Box
      position="relative"
      top="64px"
      w="360px"
      h="80px"
      bg="gray.700"
      p="16px 24px 16px 24px"
      borderRadius="8px"
    >
      <Flex
        w="100%"
        align="center"
        cursor="pointer"
        onClick={() => {
          props.onOpen && props.onOpen();
          props.onClose();
        }}
      >
        {props.icon}
        <VStack align="start" ml="18px" lineHeight="16px" flexGrow="1">
          <Text as="strong">{props.title}</Text>
          <Text fontSize="12px" color="gray.300">
            {props.description}
          </Text>
        </VStack>
      </Flex>
      <CloseButton
        position="absolute"
        top="12px"
        right="12px"
        color="gray.400"
        onClick={(evt) => {
          props.onClose();
          // Stop from triggering the whole Toast's `onClick`
          evt.stopPropagation();
        }}
      />
    </Box>
  );
};

export default Toast;
