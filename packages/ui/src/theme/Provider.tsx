import React from "react";
import theme from ".";

import { ChakraProvider } from "@chakra-ui/react";
export { Card } from "../components/Card";
export { Loading } from "../components/Loading";

export * from "../components/icons/AnglesDown";
export * from "../components/icons/Discord";
export * from "../components/icons/Twitter";

export const CartridgeUIProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => <ChakraProvider theme={theme}>{children}</ChakraProvider>;
