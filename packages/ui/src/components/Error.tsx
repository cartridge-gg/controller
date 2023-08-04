import React from "react";
import { VStack } from "@chakra-ui/react";
import { AlertIcon } from "./icons";

const Error = (props: { message: React.ReactNode }) => {
  return (
    <VStack>
      <AlertIcon width="120px" height="140px" />
      {props.message}
    </VStack>
  );
};

export default Error;
