import React from "react";
import theme from ".";

import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";

export function CartridgeUIProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { ToastContainer } = createStandaloneToast();

  return (
    <ChakraProvider theme={theme}>
      {children}
      <ToastContainer />
    </ChakraProvider>
  );
}
