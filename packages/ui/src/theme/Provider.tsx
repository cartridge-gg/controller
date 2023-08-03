import React from "react";
import theme from ".";

import { ChakraProvider } from "@chakra-ui/react";

export const CartridgeUIProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => <ChakraProvider theme={theme}>{children}</ChakraProvider>;
