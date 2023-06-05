import React from "react";
import { VStack } from "@chakra-ui/react";

import ErrorIcon from "./icons/Error";

const Error = (props: { message: React.ReactNode }) => {
  return (
    <VStack>
      <ErrorIcon width="120px" height="140px" />
      {props.message}
    </VStack>
  );
};

export default Error;
