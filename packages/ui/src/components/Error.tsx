import React from "react";
import { AlertIcon, VStack } from "@chakra-ui/react";

const Error = (props: { message: React.ReactNode }) => {
  return (
    <VStack>
      <AlertIcon width="120px" height="140px" />
      {props.message}
    </VStack>
  );
};

export default Error;
