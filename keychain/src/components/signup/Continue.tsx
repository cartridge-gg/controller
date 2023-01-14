import { useState } from "react";
import { Text, Container } from "@chakra-ui/react";
import Footer from "components/Footer";
import Controller from "utils/controller";

const Continue = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <Container
      w={["full", "400px"]}
      h="calc(100vh - 74px)"
      pt="100px"
      centerContent
    >
      <Text>Please continue with signup in the new window.</Text>
      <Footer showConfirm={false} cancelText="Close" onCancel={onCancel} />
    </Container>
  );
};

export default Continue;
