import { AlertIcon } from "@cartridge/ui";
import { VStack, Text, Spacer } from "@chakra-ui/react";

const Unsupported = ({ message }: { message: string }) => (
  <VStack h="130px" bgColor="gray.700" borderRadius="8px" p="24px">
    <AlertIcon />
    <Spacer />
    <Text align="center" fontSize="12px" fontWeight="400">
      {message}
    </Text>
  </VStack>
);

export default Unsupported;
