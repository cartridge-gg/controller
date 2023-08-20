import { Text, VStack, Link, StyleProps } from "@chakra-ui/react";
import { Header } from "components/Header";
import Container from "components/legacy/Container";
import { SparklesDuoIcon } from "@cartridge/ui";

const Continue = ({ ...rest }: StyleProps) => {
  return (
    <Container {...rest}>
      <Header muted />
      <VStack boxSize="full" pt="120px" color="gray.200" spacing="36px">
        <SparklesDuoIcon />
        <VStack spacing="18px">
          <Text fontSize="17px" fontWeight="bold" color="inherit">
            Continue Signup...
          </Text>
          <Text fontSize="12px" color="inherit">
            Please continue with signup in the new window
          </Text>
        </VStack>
      </VStack>
    </Container>
  );
};

export default Continue;
