import { VStack, Text, Spacer } from "@chakra-ui/react";
import Warning from "@cartridge/ui/src/components/icons/Warning";

const Unsupported = ({ message }: { message: string }) => (
  <VStack h="130px" bgColor="legacy.gray.700" borderRadius="8px" p="24px">
    <Warning />
    <Spacer />
    <Text align="center" fontSize="12px" fontWeight="400">
      {message}
    </Text>
  </VStack>
);

export default Unsupported;
