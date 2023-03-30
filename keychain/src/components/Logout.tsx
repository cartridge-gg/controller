import { Button, Circle, Divider, Spacer, Text, VStack } from "@chakra-ui/react";
import Container from "./Container";
import { Header } from "./Header";
import LogoutLarge from "./icons/LogoutLarge";

const Logout = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <Container>
      <Header />
      <VStack pt="24px" w="full" h="full">
        <Circle size="54px" bgColor="gray.700">
          <LogoutLarge boxSize="36px" color="green.400" />
        </Circle>
        <Text pt="12px" fontSize="17px" fontWeight="bold">
          Log Out
        </Text>
        <Text fontSize="13px" color="whiteAlpha.600">
          Are you sure?
        </Text>
        <Spacer />
        <VStack w="full" spacing="18px">
          <Divider />
          <Button w="full" onClick={onConfirm}>
            Log Out
          </Button>
          <Button
            variant="dark"
            w="full"
            bgColor="gray.700"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};

export default Logout;
